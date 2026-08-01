import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import type { PortfolioItem, PromoAd, SiteConfig, PortfolioAlbum } from '../types';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaUser, FaImages, FaBullhorn, FaClock, FaSave, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaExternalLinkAlt, FaExclamationTriangle, FaTachometerAlt, FaThumbtack, FaCheckSquare, FaSquare, FaTimes } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';
import BackButton from '../components/BackButton';
import HeroBackdrop from '../components/HeroBackdrop';

type Tab = 'profile' | 'portfolio' | 'listings' | 'promo' | 'status';

export default function Dashboard() {
  const { user, isAdmin, reactivateAccount, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState(user?.profile || {
    name: '', businessName: '', bio: '', yearsOfExperience: 0,
    photoUrl: '', coverImageUrl: '', whatsappNumber: '', phoneNumber: '',
    email: user?.email || '', serviceAreas: [], regions: [], cities: [],
    specialties: [], availability: true, workingHours: '',
  });
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [promoAds, setPromoAds] = useState<PromoAd[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reactivationCode, setReactivationCode] = useState('');
  const [reactivating, setReactivating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [albums, setAlbums] = useState<PortfolioAlbum[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [showNewAlbumInput, setShowNewAlbumInput] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [renamingAlbumId, setRenamingAlbumId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDelete, setConfirmDelete] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const tabs = [
    { id: 'profile' as Tab, label: t('profile.title'), icon: <FaUser /> },
    { id: 'portfolio' as Tab, label: t('portfolio.title'), icon: <FaImages /> },
    { id: 'listings' as Tab, label: t('listings.title'), icon: <FaBullhorn /> },
    { id: 'promo' as Tab, label: t('promo.title'), icon: <FaBullhorn /> },
    { id: 'status' as Tab, label: t('status.title'), icon: <FaClock /> },
  ];

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().profile) {
          setProfile(userDoc.data().profile);
        }

        const portfolioQuery = query(
          collection(db, 'portfolios', user.uid, 'items'),
          orderBy('order', 'asc')
        );
        const portfolioSnap = await getDocs(portfolioQuery);
        setPortfolio(portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem)));

        const albumQuery = query(
          collection(db, 'portfolios', user.uid, 'albums'),
          orderBy('order', 'asc')
        );
        const albumSnap = await getDocs(albumQuery);
        setAlbums(albumSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioAlbum)));

        const promoQuery = query(
          collection(db, 'promoAds'),
          where('painterId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const promoSnap = await getDocs(promoQuery);
        setPromoAds(promoSnap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));

        const configDoc = await getDoc(doc(db, 'config', 'regions-specialties'));
        if (configDoc.exists()) {
          const data = configDoc.data() as SiteConfig;
          setAvailableRegions(data.regions || []);
          setAvailableSpecialties(data.specialties || []);
        }
      } catch (err) {
        console.log('Using demo data');
        setAvailableRegions(['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North West', 'South', 'South West', 'West']);
        setAvailableSpecialties(['Interior', 'Exterior', 'Decorative', 'Commercial', 'Residential', 'Industrial']);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return null;

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), { profile }, { merge: true });

      const listingRef = doc(db, 'listings', user.uid);
      await setDoc(listingRef, {
        painterId: user.uid,
        name: profile.name || user.displayName,
        businessName: profile.businessName,
        profileImageUrl: profile.photoUrl,
        coverImageUrl: profile.coverImageUrl,
        bio: profile.bio,
        yearsOfExperience: profile.yearsOfExperience,
        whatsappNumber: profile.whatsappNumber,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        serviceAreas: profile.serviceAreas,
        regions: profile.regions,
        cities: profile.cities,
        specialties: profile.specialties,
        availability: profile.availability,
        workingHours: profile.workingHours,
        visible: user.accountStatus === 'active',
        featured: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }, { merge: true });

      toast.success(t('profile.saved'));
    } catch {
      sessionStorage.setItem('demo_profile', JSON.stringify(profile));
      const listing = {
        painterId: user.uid,
        name: profile.name || user.displayName,
        businessName: profile.businessName,
        profileImageUrl: profile.photoUrl,
        coverImageUrl: profile.coverImageUrl,
        bio: profile.bio,
        yearsOfExperience: profile.yearsOfExperience,
        whatsappNumber: profile.whatsappNumber,
        phoneNumber: profile.phoneNumber,
        email: profile.email,
        serviceAreas: profile.serviceAreas,
        regions: profile.regions,
        cities: profile.cities,
        specialties: profile.specialties,
        availability: profile.availability,
        workingHours: profile.workingHours,
        visible: user.accountStatus === 'active',
        featured: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      sessionStorage.setItem('demo_listing', JSON.stringify(listing));
      toast.success(t('profile.savedDemo'));
    }
    setSaving(false);
  };

  const handleImageUpload = async (file: File, type: 'photoUrl' | 'coverImageUrl') => {
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setProfile(prev => ({ ...prev, [type]: base64 }));
      toast.success(t('image.uploaded'));
    } catch {
      toast.error('Failed to read image');
    }
    setUploading(false);
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > 20) {
      toast.error('Maximum 20 images at once');
      return;
    }
    setUploading(true);
    setUploadProgress(t('uploading'));
    try {
      const uploads = Array.from(files).map((file, i) =>
        fileToBase64(file).then(imageUrl =>
          addDoc(collection(db, 'portfolios', user.uid, 'items'), {
            imageUrl, painterId: user.uid, title: '', description: '', caption: '',
            isBeforeAfter: false, isCover: portfolio.length === 0 && i === 0,
            visible: true, showOnHomepage: false, createdAt: Date.now(), order: portfolio.length + i,
            albumId: selectedAlbumId,
          })
        )
      );
      await Promise.all(uploads);
      toast.success(`${files.length} ${t('portfolio.uploaded')}`);
      const portfolioQuery = query(collection(db, 'portfolios', user.uid, 'items'), orderBy('order', 'asc'));
      const portfolioSnap = await getDocs(portfolioQuery);
      setPortfolio(portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem)));
    } catch {
      toast.error('Failed to upload portfolio images');
    }
    setUploading(false);
    setUploadProgress('');
  };

  const createAlbum = async () => {
    const name = newAlbumName.trim();
    if (!name) return;
    try {
      await addDoc(collection(db, 'portfolios', user.uid, 'albums'), {
        painterId: user.uid, name, createdAt: Date.now(), order: albums.length,
      });
      toast.success(t('portfolio.albumCreated'));
      const albumSnap = await getDocs(query(collection(db, 'portfolios', user.uid, 'albums'), orderBy('order', 'asc')));
      setAlbums(albumSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioAlbum)));
    } catch {
      toast.error('Failed to create album');
    }
    setNewAlbumName('');
    setShowNewAlbumInput(false);
  };

  const renameAlbum = async (albumId: string) => {
    const name = renameValue.trim();
    if (!name) return;
    try {
      await updateDoc(doc(db, 'portfolios', user.uid, 'albums', albumId), { name });
      toast.success(t('portfolio.albumRenamed'));
      setAlbums(prev => prev.map(a => a.id === albumId ? { ...a, name } : a));
    } catch {
      toast.error('Failed to rename album');
    }
    setRenamingAlbumId(null);
    setRenameValue('');
  };

  const deleteAlbum = async (albumId: string) => {
    const itemsToDelete = portfolio.filter(p => p.albumId === albumId);
    if (!window.confirm(t('portfolio.confirmDeleteAlbum').replace('{count}', String(itemsToDelete.length)))) return;
    setAlbums(prev => prev.filter(a => a.id !== albumId));
    setPortfolio(prev => prev.filter(p => p.albumId !== albumId));
    if (selectedAlbumId === albumId) setSelectedAlbumId(null);
    try {
      await deleteDoc(doc(db, 'portfolios', user.uid, 'albums', albumId));
      for (const item of itemsToDelete) {
        await deleteDoc(doc(db, 'portfolios', user.uid, 'items', item.id));
        await deleteDoc(doc(db, 'homepageGallery', `${user.uid}_${item.id}`));
      }
      toast.success(t('portfolio.albumDeleted'));
    } catch { /* demo mode OK */ }
  };

  const deletePortfolioItem = async (itemId: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== itemId));
    try {
      await deleteDoc(doc(db, 'portfolios', user.uid, 'items', itemId));
      await deleteDoc(doc(db, 'homepageGallery', `${user.uid}_${itemId}`));
    } catch { /* demo mode OK */ }
    toast.success(t('portfolio.deleted'));
  };

  const reorderPortfolio = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...portfolio];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    setPortfolio(newItems);
    try {
      for (let i = 0; i < newItems.length; i++) {
        await updateDoc(doc(db, 'portfolios', user.uid, 'items', newItems[i].id), { order: i });
      }
    } catch { /* demo mode OK */ }
  };

  const toggleHomepagePin = async (itemId: string, currentValue: boolean) => {
    const newValue = !currentValue;
    if (newValue && !isAdmin) {
      const pinSnap = await getDocs(query(collection(db, 'homepageGallery'), where('painterId', '==', user.uid)));
      if (pinSnap.size >= 3) {
        toast.error('Maximum 3 pins reached. Contact admin for more.');
        return;
      }
    }
    setPortfolio(prev => prev.map(p => p.id === itemId ? { ...p, showOnHomepage: newValue } : p));
    try {
      await updateDoc(doc(db, 'portfolios', user.uid, 'items', itemId), { showOnHomepage: newValue });
      const galleryDocId = `${user.uid}_${itemId}`;
      if (newValue) {
        const item = portfolio.find(p => p.id === itemId);
        if (item) {
          await setDoc(doc(db, 'homepageGallery', galleryDocId), {
            painterId: user.uid,
            portfolioItemId: itemId,
            imageUrl: item.imageUrl,
            painterName: profile.name || user.displayName,
            painterBusinessName: profile.businessName,
            painterPhotoUrl: profile.photoUrl,
            createdAt: Date.now(),
            priority: 0,
          });
        }
      } else {
        await deleteDoc(doc(db, 'homepageGallery', galleryDocId));
      }
      toast.success(newValue ? t('portfolio.pinned') : t('portfolio.unpinned'));
    } catch {
      setPortfolio(prev => prev.map(p => p.id === itemId ? { ...p, showOnHomepage: currentValue } : p));
    }
  };

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById('promo-image') as HTMLInputElement;
    if (!fileInput?.files?.[0]) {
      toast.error('Please select an image');
      return;
    }
    setUploading(true);
    try {
      const imageUrl = await fileToBase64(fileInput.files[0]);
      await addDoc(collection(db, 'promoAds'), {
        painterId: user.uid, painterName: profile.businessName || profile.name,
        imageUrl, status: 'pending', priceCharged: 0,
        createdAt: Date.now(), approvedAt: null, activeUntil: null,
        clickThroughPainterId: user.uid,
      });
      toast.success(t('promo.submitted'));
      fileInput.value = '';
      const promoQuery = query(collection(db, 'promoAds'), where('painterId', '==', user.uid), orderBy('createdAt', 'desc'));
      const promoSnap = await getDocs(promoQuery);
      setPromoAds(promoSnap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
    } catch {
      toast.error('Failed to upload promo image');
    }
    setUploading(false);
  };

  const remainingDays = user.expiresAt
    ? Math.max(0, Math.floor((user.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleReactivation = async () => {
    if (!reactivationCode.trim()) {
      toast.error(t('dashboard.expired.enterCode'));
      return;
    }
    setReactivating(true);
    try {
      await reactivateAccount(reactivationCode.trim());
      toast.success(t('dashboard.expired.reactivated'));
      setReactivationCode('');
    } catch (err: any) {
      toast.error(err.message || t('dashboard.expired.invalid'));
    }
    setReactivating(false);
  };

  const handleDeleteAccount = async () => {
    if (confirmDelete !== 'DELETE') return;
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success(t('account.delete.deleted'));
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || t('account.delete.error'));
    }
    setDeleting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <HeroBackdrop linesOpacity={30} showColorCells={false} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <BackButton to="/" label={t('backToHome')} className="mb-4" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter' }}>{t('dashboard.title')}</h1>
        <div className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-3">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <FaUser size={14} className="text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-text text-xs">{profile.name || user.displayName || 'Painter'}</p>
            <p className="text-text-muted text-[10px]">{t('common.uid')}: {user.uid.slice(0, 12)}...</p>
          </div>
        </div>
      </motion.div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <FaTachometerAlt className="text-accent text-lg" />
            <p className="text-sm text-accent">You have admin privileges</p>
          </div>
          <Link
            to="/admin"
            className="text-xs px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors font-medium"
          >
            Go to Admin Panel
          </Link>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 focus-ring ${
              activeTab === tab.id
                ? 'bg-primary text-dark'
                : 'glass text-text-muted hover:text-text'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {(user.accountStatus === 'expired' || remainingDays <= 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">{t('dashboard.expired.title')}</p>
              <p className="text-text-muted text-xs">{t('dashboard.expired.desc')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('dashboard.expired.code')}
              value={reactivationCode}
              onChange={e => setReactivationCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleReactivation()}
              className="input-field flex-1 text-center tracking-widest uppercase"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReactivation}
              disabled={reactivating}
              className="btn-primary whitespace-nowrap"
            >
              {reactivating ? (
                <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
              ) : (
                t('dashboard.expired.reactivate')
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
      {user.accountStatus === 'active' && remainingDays > 0 && remainingDays <= 7 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3"
        >
          <FaExclamationTriangle className="text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">{t('dashboard.expiring.title')}</p>
            <p className="text-text-muted text-xs">{t('dashboard.expiring.desc').replace('{days}', String(remainingDays))}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('profile.title')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.name')}</label>
                  <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.businessName')}</label>
                  <input type="text" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-text-muted mb-1">{t('profile.bio')}</label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} className="input-field min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.yearsExp')}</label>
                  <input type="number" value={profile.yearsOfExperience} onChange={e => setProfile(p => ({ ...p, yearsOfExperience: parseInt(e.target.value) || 0 }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.whatsapp')}</label>
                  <input type="text" value={profile.whatsappNumber} onChange={e => setProfile(p => ({ ...p, whatsappNumber: e.target.value }))} className="input-field" placeholder="237691316704" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.phone')}</label>
                  <input type="text" value={profile.phoneNumber} onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.email')}</label>
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.regions')}</label>
                  {availableRegions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-surface-light/70 border border-white/10">
                      {availableRegions.map(r => {
                        const selected = profile.regions.includes(r);
                        return (
                          <button
                            key={r}
                            onClick={() => setProfile(p => ({
                              ...p,
                              regions: selected
                                ? p.regions.filter(x => x !== r)
                                : [...p.regions, r]
                            }))}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                              selected
                                ? 'bg-accent text-dark font-medium'
                                : 'bg-accent/10 text-text-muted hover:bg-accent/20'
                            }`}
                          >
                            {selected ? <FaCheckSquare size={12} /> : <FaSquare size={12} />}
                            {r}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input type="text" value={profile.regions.join(', ')} onChange={e => setProfile(p => ({ ...p, regions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="input-field" placeholder="e.g. Centre, Littoral" />
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.cities')}</label>
                  <input type="text" value={profile.cities.join(', ')} onChange={e => setProfile(p => ({ ...p, cities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="input-field" placeholder="e.g. Yaounde, Douala" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.specialtiesSelect')}</label>
                  {availableSpecialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-surface-light/70 border border-white/10">
                      {availableSpecialties.map(s => {
                        const selected = profile.specialties.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => setProfile(p => ({
                              ...p,
                              specialties: selected
                                ? p.specialties.filter(x => x !== s)
                                : [...p.specialties, s]
                            }))}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
                              selected
                                ? 'bg-primary text-dark font-medium'
                                : 'bg-accent/10 text-text-muted hover:bg-accent/20'
                            }`}
                          >
                            {selected ? <FaCheckSquare size={12} /> : <FaSquare size={12} />}
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input type="text" value={profile.specialties.join(', ')} onChange={e => setProfile(p => ({ ...p, specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} className="input-field" placeholder="e.g. Interior, Exterior" />
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">{t('profile.hours')}</label>
                  <input type="text" value={profile.workingHours} onChange={e => setProfile(p => ({ ...p, workingHours: e.target.value }))} className="input-field" placeholder={t('profile.hoursPlaceholder')} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-text-muted">{t('profile.accepting')}</label>
                  <button
                    onClick={() => setProfile(p => ({ ...p, availability: !p.availability }))}
                    className={`w-12 h-6 rounded-full transition-colors ${profile.availability ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${profile.availability ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-text-muted mb-2">{t('profile.photo')}</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[#D9A441]/40 cursor-pointer hover:border-accent transition-colors bg-surface-light/50">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-text-muted">
                        <FaUser size={24} />
                        <span className="text-xs">{t('profile.clickUpload')}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'photoUrl')} className="hidden" />
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">{t('profile.cover')}</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[#D9A441]/40 cursor-pointer hover:border-accent transition-colors bg-surface-light/50">
                    {profile.coverImageUrl ? (
                      <img src={profile.coverImageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-text-muted">
                        <FaImages size={24} />
                        <span className="text-xs">{t('profile.clickUpload')}</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'coverImageUrl')} className="hidden" />
                  </label>
                </div>
              </div>

              {uploading && <p className="text-sm text-accent mt-2">{t('uploading')}</p>}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProfileSave}
                disabled={saving}
                className="btn-primary mt-6 flex items-center gap-2"
              >
                {saving ? <><span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" /> {t('saving')}</> : <><FaSave /> {t('profile.save')}</>}
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'portfolio' && (
          <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Inter' }}>{t('portfolio.title')}</h2>
                <div className="flex items-center gap-2">
                  <label className="btn-outline inline-flex items-center gap-2 cursor-pointer text-sm">
                    {uploading ? <><span className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" /> {uploadProgress}</> : <><FaPlus /> {t('portfolio.add')}</>}
                    <input type="file" multiple accept="image/*" onChange={handlePortfolioUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Album filter bar */}
              <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <button
                  onClick={() => setSelectedAlbumId(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAlbumId === null
                      ? 'bg-accent text-dark'
                      : 'bg-accent/10 text-text-muted hover:bg-accent/20'
                  }`}
                >
                  {t('portfolio.allAlbums')}
                </button>
                {albums.map(album => (
                  <div key={album.id} className="relative">
                    {renamingAlbumId === album.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') renameAlbum(album.id); if (e.key === 'Escape') setRenamingAlbumId(null); }}
                          className="w-28 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs text-text outline-none"
                          autoFocus
                          onBlur={() => { if (renameValue.trim()) renameAlbum(album.id); else setRenamingAlbumId(null); }}
                        />
                        <button onClick={() => setRenamingAlbumId(null)} className="p-1 text-text-muted hover:text-text">
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedAlbumId(album.id)}
                          onDoubleClick={() => { setRenamingAlbumId(album.id); setRenameValue(album.name); }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            selectedAlbumId === album.id
                              ? 'bg-accent text-dark'
                              : 'bg-accent/10 text-text-muted hover:bg-accent/20'
                          }`}
                        >
                          {album.name}
                        </button>
                        <button
                          onClick={() => deleteAlbum(album.id)}
                          className="p-1 text-text-muted hover:text-red-400 transition-colors"
                          title="Delete album"
                        >
                          <FaTimes size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {showNewAlbumInput ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={e => setNewAlbumName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') createAlbum(); if (e.key === 'Escape') { setShowNewAlbumInput(false); setNewAlbumName(''); } }}
                      className="w-28 px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-text outline-none"
                      placeholder={t('portfolio.albumName') || 'Album name'}
                      autoFocus
                      onBlur={() => { if (newAlbumName.trim()) createAlbum(); else { setShowNewAlbumInput(false); setNewAlbumName(''); } }}
                    />
                    <button onClick={() => { setShowNewAlbumInput(false); setNewAlbumName(''); }} className="p-1 text-text-muted hover:text-text">
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewAlbumInput(true)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-all flex items-center gap-1"
                  >
                    <FaPlus size={10} /> {t('portfolio.createAlbum')}
                  </button>
                )}
              </div>

              {portfolio.filter(item => selectedAlbumId === null || item.albumId === selectedAlbumId).length === 0 ? (
                <div className="text-center py-12">
                  <FaImages className="text-4xl mx-auto mb-3 text-text-muted/30" />
                  <p className="text-text-muted">{t('portfolio.empty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {portfolio
                    .filter(item => selectedAlbumId === null || item.albumId === selectedAlbumId)
                    .map(item => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden bg-surface-light aspect-square">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      {item.albumId && (() => {
                        const album = albums.find(a => a.id === item.albumId);
                        return album ? (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
                            {album.name}
                          </span>
                        ) : null;
                      })()}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {portfolio.filter(i => selectedAlbumId === null || i.albumId === selectedAlbumId).findIndex(i => i.id === item.id) > 0 && (
                          <button onClick={() => reorderPortfolio(portfolio.findIndex(i => i.id === item.id), 'up')} className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
                            <FaArrowUp size={14} />
                          </button>
                        )}
                        {portfolio.filter(i => selectedAlbumId === null || i.albumId === selectedAlbumId).findIndex(i => i.id === item.id) < portfolio.filter(i => selectedAlbumId === null || i.albumId === selectedAlbumId).length - 1 && (
                          <button onClick={() => reorderPortfolio(portfolio.findIndex(i => i.id === item.id), 'down')} className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors">
                            <FaArrowDown size={14} />
                          </button>
                        )}
                        <button onClick={() => toggleHomepagePin(item.id, item.showOnHomepage)} className={`p-2 rounded-full transition-colors ${item.showOnHomepage ? 'bg-accent text-dark' : 'bg-white/20 hover:bg-white/40'}`} title={item.showOnHomepage ? 'Remove from homepage' : 'Show on homepage'}>
                          <FaThumbtack size={14} />
                        </button>
                        <button onClick={() => deletePortfolioItem(item.id)} className="p-2 rounded-full bg-red-500/60 hover:bg-red-500 transition-colors">
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'promo' && (
          <motion.div key="promo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('promo.title')}</h2>

              <form onSubmit={handlePromoSubmit} className="mb-8">
                <label className="block text-sm text-text-muted mb-2">{t('promo.uploadLabel')}</label>
                <label className="file-upload-zone block mb-4">
                  <FaBullhorn className="text-2xl mx-auto mb-2 text-text-muted/50" />
                  <span className="text-sm text-text-muted">Click to select promo image</span>
                  <input id="promo-image" type="file" accept="image/*" className="hidden" />
                </label>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={uploading} className="btn-primary flex items-center gap-2">
                  {uploading ? <><span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" /> {t('uploading')}</> : t('promo.submit')}
                </motion.button>
              </form>

              <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('promo.yourAds')}</h3>
              {promoAds.length === 0 ? (
                <div className="text-center py-8">
                  <FaBullhorn className="text-4xl mx-auto mb-3 text-text-muted/30" />
                  <p className="text-text-muted text-sm">{t('promo.empty')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {promoAds.map(ad => (
                    <div key={ad.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-light">
                      <img src={ad.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ad.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          ad.status === 'pending' ? 'bg-accent/20 text-accent' :
                          ad.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'status' && (
          <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('status.title')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm mb-1">{t('status.label')}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${user.accountStatus === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-semibold capitalize">{user.accountStatus === 'active' ? t('status.active') : t('status.expired')}</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm mb-1">{t('status.daysRemaining')}</p>
                  <p className="font-semibold text-2xl" style={{ fontFamily: 'Inter' }}>{remainingDays} <span className="text-sm text-text-muted">{t('status.days')}</span></p>
                </div>
              </div>

              {user.accountStatus === 'expired' && (
                <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-accent text-sm">
                    {t('status.expiredMsg')}
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <h3 className="text-red-400 font-semibold mb-1" style={{ fontFamily: 'Inter' }}>
                  {t('account.delete.title')}
                </h3>
                <p className="text-text-muted text-sm mb-4">{t('account.delete.desc')}</p>
                {deleting ? (
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                    {t('account.delete.deleting')}
                  </div>
                ) : confirmDelete === 'DELETE' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm font-medium hover:bg-red-500"
                    >
                      {t('account.delete.confirmBtn')}
                    </motion.button>
                    <button
                      onClick={() => setConfirmDelete('')}
                      className="px-4 py-2 rounded-lg glass text-sm text-text-muted hover:text-text"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={confirmDelete}
                      onChange={e => setConfirmDelete(e.target.value.toUpperCase())}
                      placeholder={t('account.delete.confirmPlaceholder')}
                      className="input-field w-48 text-center tracking-widest uppercase"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmDelete !== 'DELETE'}
                      onClick={() => setConfirmDelete('DELETE')}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('account.delete.action')}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'listings' && (
          <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('listings.title')}</h2>
              <p className="text-text-muted text-sm">
                {t('listings.desc')}
              </p>
              <div className="mt-4 p-4 rounded-xl bg-surface-light flex items-center justify-between">
                <p className="text-sm text-text-muted">
                  {t('listings.visibility')}: <span className={user.accountStatus === 'active' ? 'text-green-400' : 'text-red-400'}>{user.accountStatus === 'active' ? t('listings.active') : t('listings.hidden')}</span>
                </p>
                <a
                  href={`/painters/${user.uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-xs flex items-center gap-2 py-2 px-4"
                >
                  <FaExternalLinkAlt /> {t('listings.preview')}
                </a>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
      </div>
    </div>
  );
}
