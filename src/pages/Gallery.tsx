import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { HomepageGalleryItem } from '../types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaThumbtack } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';
import ImageLightbox from '../components/ImageLightbox';

export default function Gallery() {
  const { t } = useTranslation();
  const [items, setItems] = useState<HomepageGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const q = query(collection(db, 'homepageGallery'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageGalleryItem));
        const priority = all.filter(i => i.priority > 0).sort((a, b) => a.priority - b.priority);
        const rest = all.filter(i => !i.priority).sort((a, b) => b.createdAt - a.createdAt);
        setItems([...priority, ...rest]);
      } catch {
        setItems([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = items.filter(item => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.painterName?.toLowerCase().includes(q) ||
      item.painterBusinessName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass text-text-muted hover:text-text hover:bg-accent/10 transition-all focus-ring"
        >
          <FaArrowLeft size={14} /> {t('gallery.back')}
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Playfair Display' }}>
          {t('gallery.title')}
        </h1>
      </motion.div>

      <div className="glass p-4 mb-8">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t('gallery.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field has-icon"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-square rounded-xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <FaSearch className="text-4xl mx-auto mb-4 text-text-muted/30" />
          <p className="text-lg font-semibold mb-2 text-text" style={{ fontFamily: 'Playfair Display' }}>
            {search ? t('gallery.noResults') : t('gallery.empty')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item, index) => (
            <motion.div
              key={`${item.painterId}-${item.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 12) * 0.05 }}
              className="group relative rounded-xl overflow-hidden bg-surface-light aspect-square"
            >
              <button
                onClick={() => setLightboxIndex(index)}
                className="w-full h-full focus-ring"
              >
                <img
                  src={item.imageUrl}
                  alt={item.painterBusinessName || item.painterName}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </button>
              <Link
                to={`/painters/${item.painterId}`}
                state={{ scrollTo: 'portfolio' }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
              >
                <div className="flex items-center gap-3">
                  {item.painterPhotoUrl && (
                    <img
                      src={item.painterPhotoUrl}
                      alt={item.painterName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-white/30 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'Playfair Display' }}>
                      {item.painterBusinessName || item.painterName}
                    </p>
                    <p className="text-white/60 text-xs flex items-center gap-1">
                      <FaThumbtack size={10} /> {t('featured.viewWork')}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={filtered.map(i => ({ imageUrl: i.imageUrl, title: i.painterBusinessName || i.painterName }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i === 0 ? filtered.length - 1 : i! - 1))}
          onNext={() => setLightboxIndex(i => (i === filtered.length - 1 ? 0 : i! + 1))}
        />
      )}
    </div>
  );
}
