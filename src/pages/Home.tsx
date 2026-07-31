import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { HomepageGalleryItem, HomepageContent } from '../types';
import { FaArrowRight, FaCheckCircle, FaPaintRoller, FaUserFriends, FaShieldAlt, FaWhatsapp, FaSearch, FaThumbtack } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import ImageLightbox from '../components/ImageLightbox';
import PromoPopup from '../components/PromoPopup';
import ColorVisualizer from '../components/ColorVisualizer';

export default function Home() {
  const { t } = useTranslation();
  const [pinnedItems, setPinnedItems] = useState<HomepageGalleryItem[]>([]);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contentDoc = await getDoc(doc(db, 'content', 'homepage'));
        if (contentDoc.exists()) {
          setContent(contentDoc.data() as HomepageContent);
        }

        const q = query(
          collection(db, 'homepageGallery'),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageGalleryItem));
        const priority = all.filter(i => i.priority > 0).sort((a, b) => a.priority - b.priority);
        const rest = all.filter(i => !i.priority);
        const shuffled = rest.sort(() => Math.random() - 0.5);
        const selected = [...priority, ...shuffled].slice(0, 12);
        setPinnedItems(selected);
      } catch (err) {
        console.log('Firebase error', err);
      }
    };
    fetchData();
  }, []);

  const heroContent = content?.hero || {
    headline: t('hero.headline'),
    subtitle: t('hero.subtitle'),
    description: t('hero.desc'),
    videos: [],
  };

  const staticVideoUrls = ['/video/hero1.mp4', '/video/hero2.mp4'];
  const heroLinks = heroContent.videos?.length
    ? heroContent.videos
    : [{ linkUrl: '', linkLabel: '' }, { linkUrl: '', linkLabel: '' }];

  return (
    <div>
      <PromoPopup />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FDFAF3] via-[#F6EFE1] to-accent/30" />
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C9A24B" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full mb-8 max-w-[120px]"
              />
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-6xl font-extrabold mb-6"
                style={{ fontFamily: 'Playfair Display' }}
              >
                {heroContent.headline}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg md:text-xl text-accent font-semibold mb-4"
                style={{ fontFamily: 'Playfair Display' }}
              >
                {heroContent.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-text-muted text-base max-w-xl mb-8"
              >
                {heroContent.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/painters">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-base flex items-center gap-2"
                  >
                    {t('hero.cta.find')} <FaArrowRight />
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex items-center justify-center"
            >
              <div className="grid grid-cols-2 gap-4 max-w-[420px] w-full">
                {staticVideoUrls.map((src, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full">
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full aspect-[3/4] object-cover rounded-2xl shadow-2xl border border-[#E9E0CC]"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                          const placeholder = (e.target as HTMLElement).nextElementSibling;
                          if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                        }}
                      >
                        <source src={src} />
                      </video>
                      <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-[#E3D9C2] items-center justify-center bg-surface-light/60 hidden">
                        <p className="text-text-muted text-xs">Ad Space</p>
                      </div>
                      {heroLinks[i]?.linkUrl && (
                        <a
                          href={heroLinks[i].linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center text-accent hover:text-primary text-xs underline mt-2 transition-colors"
                        >
                          {heroLinks[i].linkLabel || 'Learn More'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-text-muted rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-accent rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: 'Playfair Display' }}
          >
            {t('how.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <FaSearch className="text-2xl" />, title: t('how.step1.title'), desc: t('how.step1.desc') },
              { icon: <FaUserFriends className="text-2xl" />, title: t('how.step2.title'), desc: t('how.step2.desc') },
              { icon: <FaPaintRoller className="text-2xl" />, title: t('how.step3.title'), desc: t('how.step3.desc') },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-accent">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Playfair Display' }}>{step.title}</h3>
                <p className="text-text-muted text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Craft — Pinned Portfolio Images */}
      {pinnedItems.length > 0 && (
        <section className="py-16 px-4 bg-surface/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Playfair Display' }}>
                  {t('featured.title')}
                </h2>
                <p className="text-text-muted text-sm mt-2">{t('featured.subtitle')}</p>
              </motion.div>
              <Link to="/gallery" className="text-accent hover:text-primary transition-colors text-sm flex items-center gap-1 whitespace-nowrap">
                {t('featured.viewAll')} <FaArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedItems.map((item, index) => (
                <div key={`${item.painterId}-${item.id}`} className="group relative rounded-xl overflow-hidden bg-surface-light aspect-square">
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
                </div>
              ))}
            </div>

            {lightboxIndex !== null && (
              <ImageLightbox
                images={pinnedItems.map(i => ({ imageUrl: i.imageUrl, title: i.painterBusinessName || i.painterName }))}
                currentIndex={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onPrev={() => setLightboxIndex(i => (i === 0 ? pinnedItems.length - 1 : i! - 1))}
                onNext={() => setLightboxIndex(i => (i === pinnedItems.length - 1 ? 0 : i! + 1))}
              />
            )}
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ fontFamily: 'Playfair Display' }}
          >
            {t('why.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <FaShieldAlt />, title: t('why.vetted'), desc: t('why.vetted.desc') },
              { icon: <FaWhatsapp />, title: t('why.whatsapp'), desc: t('why.whatsapp.desc') },
              { icon: <FaCheckCircle />, title: t('why.nationwide'), desc: t('why.nationwide.desc') },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-xl">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Playfair Display' }}>{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ColorVisualizer />

      {/* CTA */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display' }}>
            {t('cta.title')}
          </h2>
          <p className="text-text-muted text-base mb-8">
            {t('cta.desc')}
          </p>
          <Link to="/painters">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-base"
            >
              {t('cta.button')}
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
