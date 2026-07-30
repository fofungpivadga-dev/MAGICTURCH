import { createContext, useContext, useEffect, useState, type ReactNode, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import type { AppUser, Coupon } from '../types';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<AppUser>;
  signInWithEmail: (email: string, password: string) => Promise<AppUser>;
  registerWithEmailPassword: (email: string, password: string, displayName: string) => Promise<AppUser>;
  registerWithCoupon: (couponCode: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isPainter: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingFbUser = useRef<User | null>(null);
  const pendingDisplayName = useRef<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as AppUser);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<AppUser> => {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userDocRef);
    const now = Date.now();

    if (fbUser.email === import.meta.env.VITE_ADMIN_EMAIL) {
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, photoURL: fbUser.photoURL,
          role: 'admin' as const, accountStatus: 'active' as const, createdAt: now,
          profile: {
            name: fbUser.displayName || '', businessName: '', bio: '', yearsOfExperience: 0,
            photoUrl: fbUser.photoURL || '', coverImageUrl: '', whatsappNumber: '', phoneNumber: '',
            email: fbUser.email || '', serviceAreas: [], regions: [], cities: [], specialties: [],
            availability: true, workingHours: '',
          },
        });
      }
      const adminUser = (await getDoc(userDocRef)).data() as AppUser;
      setUser(adminUser);
      return adminUser;
    }

    if (userDoc.exists()) {
      const userData = userDoc.data() as AppUser;
      setUser(userData);
      return userData;
    }

    pendingFbUser.current = fbUser;
    throw new Error('COUPON_REQUIRED');
  };

  const signInWithEmail = async (email: string, password: string): Promise<AppUser> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;
    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    if (!userDoc.exists()) {
      throw new Error('No account found with this email. Please sign up first.');
    }
    const userData = userDoc.data() as AppUser;
    setUser(userData);
    return userData;
  };

  const registerWithEmailPassword = async (email: string, password: string, displayName: string): Promise<AppUser> => {
    let fbUser: User;
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      fbUser = result.user;
      await updateProfile(fbUser, { displayName });
    } catch (createErr: any) {
      if (createErr.code === 'auth/email-already-in-use') {
        let signInResult;
        try {
          signInResult = await signInWithEmailAndPassword(auth, email, password);
        } catch {
          throw new Error('This email already has an account. Try signing in instead.');
        }
        fbUser = signInResult.user;

        const existingDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (existingDoc.exists()) {
          setUser(existingDoc.data() as AppUser);
          throw new Error('ALREADY_REGISTERED');
        }

        // Incomplete registration — resume at coupon step
        pendingFbUser.current = fbUser;
        pendingDisplayName.current = displayName;
        throw new Error('COUPON_REQUIRED');
      }
      throw createErr;
    }

    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
    const now = Date.now();

    if (fbUser.email === import.meta.env.VITE_ADMIN_EMAIL) {
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid, email: fbUser.email, displayName, photoURL: '',
          role: 'admin' as const, accountStatus: 'active' as const, createdAt: now,
          profile: {
            name: displayName, businessName: '', bio: '', yearsOfExperience: 0,
            photoUrl: '', coverImageUrl: '', whatsappNumber: '', phoneNumber: '',
            email: fbUser.email || '', serviceAreas: [], regions: [], cities: [], specialties: [],
            availability: true, workingHours: '',
          },
        });
      }
      const adminUser = (await getDoc(doc(db, 'users', fbUser.uid))).data() as AppUser;
      setUser(adminUser);
      return adminUser;
    }

    if (userDoc.exists()) {
      const userData = userDoc.data() as AppUser;
      setUser(userData);
      return userData;
    }

    // Go straight to coupon step — no email verification
    pendingFbUser.current = fbUser;
    pendingDisplayName.current = displayName;
    throw new Error('COUPON_REQUIRED');
  };

  const registerWithCoupon = async (couponCode: string): Promise<AppUser> => {
    const fbUser = pendingFbUser.current;
    if (!fbUser) throw new Error('No pending registration. Sign in first.');

    const now = Date.now();
    const userDocRef = doc(db, 'users', fbUser.uid);

    const couponSnapshot = await getDoc(doc(db, 'coupons', couponCode));
    if (!couponSnapshot.exists()) throw new Error('Invalid coupon code');
    const couponData = couponSnapshot.data() as Coupon;
    if (couponData.status !== 'unredeemed') throw new Error('Coupon already used');

    const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

    await setDoc(userDocRef, {
      uid: fbUser.uid, email: fbUser.email,
      displayName: fbUser.displayName || pendingDisplayName.current,
      photoURL: fbUser.photoURL,
      role: 'painter' as const, accountStatus: 'active' as const,
      couponId: couponCode, expiresAt, createdAt: now,
      profile: {
        name: fbUser.displayName || pendingDisplayName.current,
        businessName: '', bio: '', yearsOfExperience: 0,
        photoUrl: fbUser.photoURL || '', coverImageUrl: '',
        whatsappNumber: '', phoneNumber: '', email: fbUser.email || '',
        serviceAreas: [], regions: [], cities: [], specialties: [],
        availability: true, workingHours: '',
      },
    });

    await setDoc(doc(db, 'coupons', couponCode), {
      ...couponData, status: 'redeemed', redeemedAt: now, redeemedBy: fbUser.uid, expiresAt,
    }, { merge: true });

    const newUser = {
      uid: fbUser.uid, email: fbUser.email,
      displayName: fbUser.displayName || pendingDisplayName.current,
      photoURL: fbUser.photoURL,
      role: 'painter' as const, accountStatus: 'active' as const,
      couponId: couponCode, expiresAt, createdAt: now,
    } as AppUser;

    setUser(newUser);
    pendingFbUser.current = null;
    pendingDisplayName.current = '';
    return newUser;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    pendingFbUser.current = null;
    pendingDisplayName.current = '';
  };

  return (
    <AuthContext.Provider
      value={{
        user, firebaseUser, loading,
        signInWithGoogle, signInWithEmail,
        registerWithEmailPassword, registerWithCoupon,
        logout,
        isAdmin: user?.role === 'admin',
        isPainter: user?.role === 'painter',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
