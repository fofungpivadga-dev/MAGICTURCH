import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, updateDoc, doc, query, orderBy, where, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { Coupon, AppUser, PromoAd, PainterListing, SiteConfig, HomepageGalleryItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaTicketAlt, FaUsers, FaBullhorn, FaHome, FaChartBar, FaPlus, FaCopy, FaCheck, FaTimes, FaArrowLeft, FaGlobe, FaSave } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';

type Tab = 'coupons' | 'painters' | 'promo-queue' | 'homepage' | 'analytics' | 'regions';

const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'MTPS-';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export default function Admin() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('coupons');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [painters, setPainters] = useState<AppUser[]>([]);
  const [listings, setListings] = useState<PainterListing[]>([]);
  const [promoAds, setPromoAds] = useState<PromoAd[]>([]);
  const [batchCount, setBatchCount] = useState(5);
  const [batchPrice, setBatchPrice] = useState(0);
  const [regions, setRegions] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newRegion, setNewRegion] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [heroLinks, setHeroLinks] = useState<{ linkUrl: string; linkLabel: string }[]>([
    { linkUrl: '', linkLabel: '' },
    { linkUrl: '', linkLabel: '' },
  ]);
  const [adminPins, setAdminPins] = useState<HomepageGalleryItem[]>([]);
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');

  const tabs = [
    { id: 'coupons' as Tab, label: t('admin.coupons'), icon: <FaTicketAlt /> },
    { id: 'painters' as Tab, label: t('admin.paintersTab'), icon: <FaUsers /> },
    { id: 'promo-queue' as Tab, label: t('admin.promoQueue'), icon: <FaBullhorn /> },
    { id: 'homepage' as Tab, label: t('admin.homepageTab'), icon: <FaHome /> },
    { id: 'analytics' as Tab, label: t('admin.analyticsTab'), icon: <FaChartBar /> },
    { id: 'regions' as Tab, label: t('admin.regionsTab'), icon: <FaGlobe /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const couponSnap = await getDocs(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')));
        setCoupons(couponSnap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));

        const userSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'painter')));
        setPainters(userSnap.docs.map(d => d.data() as AppUser));

        const listingSnap = await getDocs(collection(db, 'listings'));
        setListings(listingSnap.docs.map(d => ({ id: d.id, ...d.data() } as PainterListing)));

        const promoSnap = await getDocs(query(collection(db, 'promoAds'), orderBy('createdAt', 'desc')));
        setPromoAds(promoSnap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
        const heroDoc = await getDoc(doc(db, 'content', 'homepage'));
        if (heroDoc.exists()) {
          const h = heroDoc.data() as any;
          if (h.hero) {
            setHeroHeadline(h.hero.headline || '');
            setHeroSubtitle(h.hero.subtitle || '');
            setHeroDescription(h.hero.description || '');
            if (h.hero.videos?.length) {
              setHeroLinks(h.hero.videos.map((v: any) => ({ linkUrl: v.linkUrl || '', linkLabel: v.linkLabel || '' })));
            }
          }
        }

        if (user) {
          const pinSnap = await getDocs(query(collection(db, 'homepageGallery'), where('painterId', '==', user.uid)));
          setAdminPins(pinSnap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageGalleryItem)));
        }
      } catch (err) {
        console.log('Firebase not configured yet');
      }
    };
    fetchData();
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configDoc = await getDoc(doc(db, 'config', 'regions-specialties'));
      if (configDoc.exists()) {
        const data = configDoc.data() as SiteConfig;
        setRegions(data.regions || []);
        setSpecialties(data.specialties || []);
      } else {
        setRegions(['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North West', 'South', 'South West', 'West']);
        setSpecialties(['Interior', 'Exterior', 'Decorative', 'Commercial', 'Residential', 'Industrial']);
      }
    } catch {
      setRegions(['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North West', 'South', 'South West', 'West']);
      setSpecialties(['Interior', 'Exterior', 'Decorative', 'Commercial', 'Residential', 'Industrial']);
    }
  };

  const saveConfig = async () => {
    try {
      await setDoc(doc(db, 'config', 'regions-specialties'), { regions, specialties });
      toast.success(t('admin.configSaved'));
    } catch {
      toast.success(t('admin.configSavedDemo'));
    }
  };

  const addRegion = () => {
    const name = newRegion.trim();
    if (!name) return;
    if (regions.includes(name)) return;
    setRegions(prev => [...prev, name]);
    setNewRegion('');
  };

  const addSpecialty = () => {
    const name = newSpecialty.trim();
    if (!name) return;
    if (specialties.includes(name)) return;
    setSpecialties(prev => [...prev, name]);
    setNewSpecialty('');
  };

  const removeRegion = (name: string) => {
    setRegions(prev => prev.filter(r => r !== name));
  };

  const removeSpecialty = (name: string) => {
    setSpecialties(prev => prev.filter(s => s !== name));
  };

  const generateSingleCoupon = async () => {
    try {
      const code = generateCode();
      await setDoc(doc(db, 'coupons', code), {
        code, status: 'unredeemed', createdAt: Date.now(),
        redeemedAt: null, redeemedBy: null, expiresAt: null,
        priceCharged: 0, soldOfflineVia: null,
      });
      toast.success(t('coupon.created').replace('{code}', code));
      const snap = await getDocs(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')));
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
    } catch {
      const code = generateCode();
      const newCoupon: Coupon = {
        id: code, code, status: 'unredeemed', createdAt: Date.now(),
        redeemedAt: null, redeemedBy: null, expiresAt: null,
        priceCharged: 0, soldOfflineVia: null,
      };
      setCoupons(prev => [newCoupon, ...prev]);
      toast.success(t('coupon.createdDemo').replace('{code}', code));
    }
  };

  const generateBatchCoupons = async () => {
    try {
      for (let i = 0; i < batchCount; i++) {
        const code = generateCode();
        await setDoc(doc(db, 'coupons', code), {
          code, status: 'unredeemed', createdAt: Date.now(),
          redeemedAt: null, redeemedBy: null, expiresAt: null,
          priceCharged: batchPrice, soldOfflineVia: null,
        });
      }
      toast.success(t('coupon.batchCreated').replace('{count}', String(batchCount)));
      const snap = await getDocs(query(collection(db, 'coupons'), orderBy('createdAt', 'desc')));
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon)));
    } catch {
      const newCoupons: Coupon[] = [];
      for (let i = 0; i < batchCount; i++) {
        const code = generateCode();
        newCoupons.push({
          id: code, code, status: 'unredeemed', createdAt: Date.now(),
          redeemedAt: null, redeemedBy: null, expiresAt: null,
          priceCharged: batchPrice, soldOfflineVia: null,
        });
      }
      setCoupons(prev => [...newCoupons, ...prev]);
      toast.success(t('coupon.batchCreatedDemo').replace('{count}', String(batchCount)));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t('coupon.copied'));
  };

  const handlePromoAction = async (adId: string, status: 'approved' | 'rejected' | 'expired', priceCharged?: number, durationDays?: number) => {
    try {
      const update: any = { status };
      if (status === 'approved') {
        update.approvedAt = Date.now();
        update.activeUntil = Date.now() + (durationDays || 2) * 24 * 60 * 60 * 1000;
        if (priceCharged) update.priceCharged = priceCharged;
      }
      await updateDoc(doc(db, 'promoAds', adId), update);
      toast.success(t('admin.promoApproved').replace('{status}', status));
      const snap = await getDocs(query(collection(db, 'promoAds'), orderBy('createdAt', 'desc')));
      setPromoAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
    } catch {
      setPromoAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status, approvedAt: status === 'approved' ? Date.now() : ad.approvedAt, activeUntil: status === 'approved' ? Date.now() + 2 * 86400000 : ad.activeUntil } as PromoAd : ad));
      toast.success(t('admin.promoApproved').replace('{status}', status));
    }
  };

  const deactivateAllPromos = async () => {
    try {
      const approved = promoAds.filter(a => a.status === 'approved');
      if (approved.length === 0) {
        toast.error(t('admin.noActivePromos'));
        return;
      }
      await Promise.all(
        approved.map(ad => updateDoc(doc(db, 'promoAds', ad.id), { status: 'expired' }))
      );
      toast.success(t('admin.deactivatedAll'));
      const snap = await getDocs(query(collection(db, 'promoAds'), orderBy('createdAt', 'desc')));
      setPromoAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
    } catch {
      setPromoAds(prev => prev.map(ad => ad.status === 'approved' ? { ...ad, status: 'expired' as const } : ad));
      toast.success(t('admin.deactivatedAll'));
    }
  };

  const togglePainterStatus = async (painterUid: string, newStatus: 'active' | 'expired') => {
    try {
      await updateDoc(doc(db, 'users', painterUid), { accountStatus: newStatus });
      await updateDoc(doc(db, 'listings', painterUid), { visible: newStatus === 'active', updatedAt: Date.now() });
      toast.success(t('painter.statusUpdated').replace('{status}', newStatus));
      const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'painter')));
      setPainters(snap.docs.map(d => d.data() as AppUser));
    } catch {
      setPainters(prev => prev.map(p => p.uid === painterUid ? { ...p, accountStatus: newStatus } as AppUser : p));
      setListings(prev => prev.map(l => l.painterId === painterUid ? { ...l, visible: newStatus === 'active' } as PainterListing : l));
      toast.success(t('painter.statusUpdatedDemo').replace('{status}', newStatus));
    }
  };

  const toggleFeatured = async (painterId: string, featured: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', painterId), { featured, updatedAt: Date.now() });
      toast.success(featured ? t('painter.featured') : t('painter.unfeatured'));
      const snap = await getDocs(collection(db, 'listings'));
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as PainterListing)));
    } catch {
      setListings(prev => prev.map(l => l.painterId === painterId ? { ...l, featured } as PainterListing : l));
      toast.success(featured ? t('painter.featuredDemo') : t('painter.unfeaturedDemo'));
    }
  };

  const deactivatePromo = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'promoAds', adId), { status: 'expired' });
      toast.success(t('admin.promoDeactivated'));
    } catch {
      setPromoAds(prev => prev.map(ad => ad.id === adId ? { ...ad, status: 'expired' as const } : ad));
      toast.success(t('admin.promoDeactivatedDemo'));
    }
    const snap = await getDocs(query(collection(db, 'promoAds'), orderBy('createdAt', 'desc')));
    setPromoAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
  };

  const deletePromo = async (adId: string) => {
    try {
      await deleteDoc(doc(db, 'promoAds', adId));
      toast.success(t('admin.promoDeleted'));
    } catch {
      setPromoAds(prev => prev.filter(ad => ad.id !== adId));
      toast.success(t('admin.promoDeletedDemo'));
    }
    const snap = await getDocs(query(collection(db, 'promoAds'), orderBy('createdAt', 'desc')));
    setPromoAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
  };

  const renewPromo = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'promoAds', adId), {
        status: 'approved',
        approvedAt: Date.now(),
        activeUntil: Date.now() + 2 * 24 * 60 * 60 * 1000,
      });
      toast.success(t('admin.promoRenewed'));
    } catch {
      setPromoAds(prev => prev.map(ad => ad.id === adId ? {
        ...ad,
        status: 'approved' as const,
        approvedAt: Date.now(),
        activeUntil: Date.now() + 2 * 86400000,
      } : ad));
      toast.success(t('admin.promoRenewedDemo'));
    }
    const snap = await getDocs(query(collection(db, 'promoAds'), orderBy('createdAt', 'desc')));
    setPromoAds(snap.docs.map(d => ({ id: d.id, ...d.data() } as PromoAd)));
  };

  const setPinPriority = async (itemId: string, priority: number) => {
    setAdminPins(prev => prev.map(p => p.id === itemId ? { ...p, priority } : p));
    try {
      await updateDoc(doc(db, 'homepageGallery', itemId), { priority });
      toast.success('Priority updated');
    } catch {
      toast.success('Priority updated (demo mode)');
    }
  };

  const saveHeroContent = async () => {
    try {
      const docRef = doc(db, 'content', 'homepage');
      const existing = await getDoc(docRef);
      const data = existing.exists() ? existing.data() : {};
      await setDoc(docRef, {
        ...data,
        hero: {
          ...(data as any).hero,
          headline: heroHeadline,
          subtitle: heroSubtitle,
          description: heroDescription,
          videos: heroLinks,
        },
      });
      toast.success(t('admin.homepage.videoSaved'));
    } catch (err) {
      console.error('Save hero content error:', err);
      toast.success('Hero content saved (demo mode)!');
    }
  };

  const totalRevenue = coupons
    .filter(c => c.status === 'redeemed')
    .reduce((sum, c) => sum + (c.priceCharged || 0), 0);

  const promoRevenue = promoAds
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + (a.priceCharged || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass text-text-muted hover:text-text hover:bg-accent/10 transition-all focus-ring"
          >
            <FaArrowLeft size={14} /> {t('admin.backToDashboard')}
          </Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter' }}>{t('admin.title')}</h1>
        </div>
        <div className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <FaUser size={14} className="text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium text-text text-xs">{user?.displayName || 'Admin'}</p>
            <p className="text-text-muted text-[10px]">{t('admin.role')}</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 focus-ring ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'glass text-text-muted hover:text-text'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'coupons' && (
          <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('coupon.generate')}</h2>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <button onClick={generateSingleCoupon} className="btn-primary flex items-center gap-2">
                    <FaPlus /> {t('coupon.single')}
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">{t('coupon.count')}</label>
                  <input type="number" value={batchCount} onChange={e => setBatchCount(parseInt(e.target.value) || 1)} min={1} max={100} className="input-field w-20" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">{t('coupon.price')}</label>
                  <input type="number" value={batchPrice} onChange={e => setBatchPrice(parseInt(e.target.value) || 0)} className="input-field w-28" />
                </div>
                <div>
                  <button onClick={generateBatchCoupons} className="btn-outline flex items-center gap-2">
                    <FaPlus /> {t('coupon.batch')}
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('admin.allCoupons')}</h2>
              {coupons.length === 0 ? (
                <p className="text-text-muted">{t('coupon.none')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#EDE3C8]">
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.code')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.status')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.price')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.soldVia')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.created')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(c => (
                        <tr key={c.id} className="border-b border-[#F1EAD9] table-row-alt">
                          <td className="py-3 px-2 font-mono text-xs">{c.code}</td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'unredeemed' ? 'bg-green-500/20 text-green-400' :
                              c.status === 'redeemed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>{c.status}</span>
                          </td>
                          <td className="py-3 px-2">{c.priceCharged ? `${c.priceCharged.toLocaleString()} XAF` : '-'}</td>
                          <td className="py-3 px-2 text-text-muted">{c.soldOfflineVia || '-'}</td>
                          <td className="py-3 px-2 text-text-muted text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-2">
                            <button onClick={() => copyCode(c.code)} className="text-accent hover:text-primary transition-colors" title="Copy code">
                              <FaCopy size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'painters' && (
          <motion.div key="painters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('admin.allPainters')}</h2>
              {painters.length === 0 ? (
                <p className="text-text-muted">{t('painter.none')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#EDE3C8]">
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.name')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.status')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.expires')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.featured')}</th>
                        <th className="text-left py-3 px-2 text-text-muted">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {painters.map(p => {
                        const listing = listings.find(l => l.painterId === p.uid);
                        const daysLeft = p.expiresAt ? Math.max(0, Math.floor((p.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
                        return (
                          <tr key={p.uid} className="border-b border-[#F1EAD9] table-row-alt">
                            <td className="py-3 px-2">{p.displayName || p.profile?.name || t('painter.unknown')}</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                p.accountStatus === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>{p.accountStatus}</span>
                            </td>
                            <td className="py-3 px-2 text-text-muted text-xs">{daysLeft}d</td>
                            <td className="py-3 px-2">
                              {listing && (
                                <button
                                  onClick={() => toggleFeatured(p.uid, !listing.featured)}
                                  className={`text-xs px-2 py-1 rounded ${listing.featured ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-text-muted'}`}
                                >
                                  {listing.featured ? t('admin.featured') : t('admin.pin')}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <button
                                onClick={() => togglePainterStatus(p.uid, p.accountStatus === 'active' ? 'expired' : 'active')}
                                className={`text-xs px-3 py-1 rounded ${
                                  p.accountStatus === 'active'
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                }`}
                              >
                                {p.accountStatus === 'active' ? t('admin.suspend') : t('admin.activate')}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'promo-queue' && (
          <motion.div key="promo-queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('promo.title')}</h2>

              <h3 className="font-medium mb-3 text-accent" style={{ fontFamily: 'Inter' }}>{t('admin.pending')}</h3>
              {promoAds.filter(a => a.status === 'pending').length === 0 ? (
                <p className="text-text-muted text-sm mb-6">{t('admin.noPending')}</p>
              ) : (
                <div className="grid gap-4 mb-8">
                  {promoAds.filter(a => a.status === 'pending').map(ad => (
                    <div key={ad.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-light">
                      <img src={ad.imageUrl} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{ad.painterName || t('painter.unknown')}</p>
                        <p className="text-xs text-text-muted">{t('admin.submitted')} {new Date(ad.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handlePromoAction(ad.id, 'approved', 5000, 2)} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm flex items-center gap-1">
                          <FaCheck size={12} /> {t('admin.approve')}
                        </button>
                        <button onClick={() => handlePromoAction(ad.id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm flex items-center gap-1">
                          <FaTimes size={12} /> {t('admin.reject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="font-medium mb-3" style={{ fontFamily: 'Inter' }}>{t('admin.allPromos')}</h3>
              <div className="flex items-center gap-3 mb-4">
                <button onClick={deactivateAllPromos} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm flex items-center gap-1 transition-colors">
                  <FaTimes size={12} /> {t('admin.deactivateAll')}
                </button>
                <span className="text-xs text-text-muted">{t('admin.activePromoCount').replace('{count}', String(promoAds.filter(a => a.status === 'approved').length))}</span>
              </div>
              {promoAds.length === 0 ? (
                <p className="text-text-muted text-sm">{t('promo.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {promoAds.map(ad => (
                    <div key={ad.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-light">
                      <img src={ad.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{ad.painterName || t('painter.unknown')}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ad.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          ad.status === 'pending' ? 'bg-accent/20 text-accent' :
                          ad.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>{ad.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {ad.status === 'approved' && (
                          <button onClick={() => deactivatePromo(ad.id)} className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 text-xs transition-colors">
                            {t('admin.deactivate')}
                          </button>
                        )}
                        {ad.status === 'expired' && (
                          <button onClick={() => renewPromo(ad.id)} className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs transition-colors">
                            {t('admin.renew')}
                          </button>
                        )}
                        <button onClick={() => deletePromo(ad.id)} className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs transition-colors">
                          <FaTimes size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'homepage' && (
          <motion.div key="homepage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Inter' }}>{t('admin.homepage.title')}</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveHeroContent}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <FaSave /> {t('profile.save')}
                </motion.button>
              </div>
              <p className="text-text-muted text-sm mb-6">{t('admin.homepage.desc')}</p>
              <div className="mb-8 space-y-4">
                <h3 className="font-semibold text-sm text-accent" style={{ fontFamily: 'Inter' }}>{t('admin.homepage.heroText')}</h3>
                <div>
                  <label className="block text-xs text-text-muted mb-1">{t('admin.homepage.headline')}</label>
                  <input
                    type="text"
                    value={heroHeadline}
                    onChange={e => setHeroHeadline(e.target.value)}
                    placeholder={t('hero.headline')}
                    className="input-field w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">{t('admin.homepage.subtitle')}</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={e => setHeroSubtitle(e.target.value)}
                    placeholder={t('hero.subtitle')}
                    className="input-field w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">{t('admin.homepage.description')}</label>
                  <textarea
                    value={heroDescription}
                    onChange={e => setHeroDescription(e.target.value)}
                    placeholder={t('hero.desc')}
                    className="input-field w-full text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
              {adminPins.length > 0 && (
                <div className="mb-8 space-y-4">
                  <h3 className="font-semibold text-sm text-accent" style={{ fontFamily: 'Inter' }}>{t('admin.homepage.priorityPins')}</h3>
                  <p className="text-text-muted text-xs">{t('admin.homepage.priorityDesc')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {adminPins.map(pin => (
                      <div key={pin.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-light">
                        <img src={pin.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{pin.painterBusinessName || pin.painterName}</p>
                          <p className="text-xs text-text-muted">{t('admin.homepage.priority')}:</p>
                        </div>
                        <select
                          value={pin.priority || 0}
                          onChange={e => setPinPriority(pin.id, parseInt(e.target.value))}
                          className="input-field w-20 text-sm"
                        >
                          <option value={0}>0</option>
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {heroLinks.map((link, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface-light space-y-3">
                    <h3 className="font-semibold text-sm" style={{ fontFamily: 'Inter' }}>{i === 0 ? t('admin.homepage.video1') : t('admin.homepage.video2')}</h3>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">{t('admin.homepage.videoLinkUrl')}</label>
                      <input
                        type="url"
                        value={link.linkUrl}
                        onChange={e => setHeroLinks(prev => prev.map((v, idx) => idx === i ? { ...v, linkUrl: e.target.value } : v))}
                        placeholder="https://wa.me/..."
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">{t('admin.homepage.videoLinkLabel')}</label>
                      <input
                        type="text"
                        value={link.linkLabel}
                        onChange={e => setHeroLinks(prev => prev.map((v, idx) => idx === i ? { ...v, linkLabel: e.target.value } : v))}
                        placeholder="Book Now"
                        className="input-field w-full text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('analytics.title')}</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm">{t('analytics.totalPainters')}</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'Inter' }}>{painters.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm">{t('analytics.activePainters')}</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'Inter' }}>{painters.filter(p => p.accountStatus === 'active').length}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm">{t('analytics.redeemed')}</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'Inter' }}>{coupons.filter(c => c.status === 'redeemed').length}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm">{t('analytics.couponRevenue')}</p>
                  <p className="text-3xl font-bold text-accent" style={{ fontFamily: 'Inter' }}>{totalRevenue.toLocaleString()} XAF</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm">{t('analytics.promoRevenue')}</p>
                  <p className="text-3xl font-bold text-accent" style={{ fontFamily: 'Inter' }}>{promoRevenue.toLocaleString()} XAF</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-light">
                  <p className="text-text-muted text-sm">{t('analytics.activePromos')}</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'Inter' }}>{promoAds.filter(a => a.status === 'approved').length}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'regions' && (
          <motion.div key="regions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ fontFamily: 'Inter' }}>{t('admin.regionsTab')}</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={saveConfig}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <FaSave /> {t('profile.save')}
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('admin.regions')}</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newRegion}
                      onChange={e => setNewRegion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addRegion()}
                      placeholder={t('admin.regionName')}
                      className="input-field flex-1"
                    />
                    <button onClick={addRegion} className="btn-primary text-sm px-3 flex items-center gap-1">
                      <FaPlus /> {t('admin.addRegion')}
                    </button>
                  </div>
                  {regions.length === 0 ? (
                    <p className="text-text-muted text-sm">{t('admin.noRegions')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {regions.map(r => (
                        <span key={r} className="px-3 py-1.5 rounded-full bg-accent/10 text-sm flex items-center gap-2">
                          {r}
                          <button onClick={() => removeRegion(r)} className="text-red-400 hover:text-red-300 transition-colors">
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('admin.specialties')}</h3>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={e => setNewSpecialty(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addSpecialty()}
                      placeholder={t('admin.specialtyName')}
                      className="input-field flex-1"
                    />
                    <button onClick={addSpecialty} className="btn-primary text-sm px-3 flex items-center gap-1">
                      <FaPlus /> {t('admin.addSpecialty')}
                    </button>
                  </div>
                  {specialties.length === 0 ? (
                    <p className="text-text-muted text-sm">{t('admin.noSpecialties')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {specialties.map(s => (
                        <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-2">
                          {s}
                          <button onClick={() => removeSpecialty(s)} className="text-red-400 hover:text-red-300 transition-colors">
                            <FaTimes size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
