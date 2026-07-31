import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { HomepageGalleryItem, HomepageContent } from '../types';
import { FaArrowRight, FaCheckCircle, FaPaintRoller, FaUserFriends, FaShieldAlt, FaWhatsapp, FaSearch, FaThumbtack, FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from '../lib/translations';
import ImageLightbox from '../components/ImageLightbox';
import PromoPopup from '../components/PromoPopup';
import ColorVisualizer from '../components/ColorVisualizer';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';

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

  const avatarItems = pinnedItems.slice(0, 4).map(i => ({
    photo: i.painterPhotoUrl || '',
    initial: (i.painterName || 'M').trim().charAt(0).toUpperCase(),
  }));
  const avatarColors = ['bg-[#D9A441]', 'bg-[#0F6B5C]', 'bg-[#E4572E]', 'bg-[#7858A8]'];

  return (
    <div>
      <PromoPopup />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#070709] to-[#E4572E]/15" />
        <div className="absolute inset-0 opacity-[0.14]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="heroGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D9A441" strokeWidth="0.7" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#heroGrid)" />
            <g stroke="#D9A441" strokeWidth="1.2" fill="none">
              <circle cx="85%" cy="22%" r="160" />
              <circle cx="85%" cy="22%" r="90" strokeDasharray="4 8" />
              <line x1="70%" y1="0" x2="70%" y2="100%" />
              <path d="M0 18% H40%" />
              <path d="M60% 100% L80% 66% H100%" />
              <path d="M0 82% H24%" />
              <polygon points="6%,38% 16%,24% 26%,38% 16%,52%" />
            </g>
          </svg>
        </div>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-[#D9A441]/20 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-[#E4572E]/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D9A441]/50 to-transparent" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-dark text-xs font-semibold mb-6"
              >
                <FaPaintRoller size={12} /> {t('hero.badge')}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5"
              >
                {heroContent.headline}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-lg md:text-xl font-medium text-white/80 mb-3"
              >
                {heroContent.subtitle}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="text-sm md:text-base text-white/70 max-w-xl mb-8"
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
                <a
                  href="https://wa.me/237691316704?text=Hi%2C%20I%20need%20help%20with%20Magic%20Touch%20Painting%20Services."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-outline text-base flex items-center gap-2"
                  >
                    <FaWhatsapp /> {t('hero.cta.contact')}
                  </motion.button>
                </a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="flex items-center gap-4 mt-8"
              >
                <div className="flex -space-x-2.5">
                  {(avatarItems.length > 0 ? avatarItems : avatarColors.map(() => ({ photo: '', initial: 'M' }))).map((a, i) =>
                    a.photo ? (
                      <img
                        key={i}
                        src={a.photo}
                        alt=""
                        className="w-9 h-9 rounded-full border-2 border-white object-cover"
                      />
                    ) : (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-full border-2 border-white ${avatarColors[i % 4]} flex items-center justify-center text-white text-xs font-semibold`}
                      >
                        {a.initial}
                      </div>
                    )
                  )}
                </div>
                <div>
                  <div className="flex gap-0.5 text-accent">
                    {[1, 2, 3, 4, 5].map(s => (
                      <FaStar key={s} size={12} />
                    ))}
                  </div>
                  <p className="text-xs text-white/70 mt-1">{t('hero.rating')}</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute w-[540px] h-[540px] -z-0 pointer-events-none">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#D9A441,#E4572E,#7858A8,#0F6B5C,#D9A441)] blur-[70px] opacity-60 animate-[spin_18s_linear_infinite]" />
                <div className="absolute inset-8 rounded-full bg-[conic-gradient(from_180deg,#D9A441,#E4572E,#7858A8,#0F6B5C,#D9A441)] blur-[40px] opacity-40 animate-[spin_28s_linear_infinite_reverse]" />
              </div>
              <div className="relative grid grid-cols-2 gap-6 max-w-[420px] w-full">
                {staticVideoUrls.map((src, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-full rounded-3xl p-2.5 bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.55)] hover:border-accent/50 hover:shadow-[0_24px_70px_rgba(217,164,65,0.15)] transition-all duration-300">
                      <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full aspect-[3/4] object-cover rounded-2xl"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                          const placeholder = (e.target as HTMLElement).nextElementSibling;
                          if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                        }}
                      >
                        <source src={src} />
                      </video>
                      <div className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-white/15 items-center justify-center bg-white/5 hidden">
                        <p className="text-text-muted text-xs">Ad Space</p>
                      </div>
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
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
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
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-white"
            style={{ fontFamily: 'Inter' }}
          >
            {t('how.title')}
          </motion.h2>          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{step.title}</h3>
                <p className="text-text-muted text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Craft — Pinned Portfolio Images */}
      {pinnedItems.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'Inter' }}>
                  {t('featured.title')}
                </h2>
                <p className="text-white/70 text-sm mt-2">{t('featured.subtitle')}</p>
              </motion.div>
              <Link to="/gallery" className="text-accent hover:text-white transition-colors text-sm flex items-center gap-1 whitespace-nowrap">
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
                        <p className="text-white font-semibold text-sm truncate" style={{ fontFamily: 'Inter' }}>
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
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-white"
            style={{ fontFamily: 'Inter' }}
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
                <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <FAQ />

      <ColorVisualizer />

      {/* CTA */}
      <section className="py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'Inter' }}>
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
