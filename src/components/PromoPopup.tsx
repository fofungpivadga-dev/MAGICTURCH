import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { PromoAd } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBullhorn } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function PromoPopup() {
  const [ads, setAds] = useState<PromoAd[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const fetchAds = async () => {
      const now = Date.now();
      const q = query(
        collection(db, 'promoAds'),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const active = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as PromoAd))
        .filter(ad => ad.activeUntil && ad.activeUntil > now)
        .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0));
      setAds(active);
    };
    fetchAds();
  }, [dismissed]);

  useEffect(() => {
    if (ads.length < 2) return;
    const interval = setInterval(() => {
      setAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0 || dismissed) return null;

  const ad = ads[adIndex % ads.length];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-6 right-6 z-40 max-w-sm w-full"
      >
        <Link
          to={`/painters/${ad.painterId}`}
          className="block glass-card overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="relative">
            {ad.imageUrl && (
              <img src={ad.imageUrl} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-accent/90 text-white text-[10px] font-semibold flex items-center gap-1">
              <FaBullhorn size={10} /> Promo
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed(true); }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold truncate" style={{ fontFamily: 'Poppins' }}>
              {ad.painterName}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Sponsored promotion — click to view their work
            </p>
          </div>
        </Link>
        {ads.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-2">
            {ads.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={() => setAdIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === adIndex % ads.length ? 'bg-accent' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
