import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { PainterListing, PortfolioItem, Review, PortfolioAlbum } from '../types';
import WhatsAppButton from '../components/WhatsAppButton';
import PortfolioGallery from '../components/PortfolioGallery';
import ImageLightbox from '../components/ImageLightbox';
import BackButton from '../components/BackButton';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaStar, FaPaintRoller, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useTranslation } from '../lib/translations';
import { ProfileSkeleton } from '../components/Skeleton';

export default function PainterProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [painter, setPainter] = useState<PainterListing | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [albums, setAlbums] = useState<PortfolioAlbum[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ reviewerName: '', rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photoLightboxOpen, setPhotoLightboxOpen] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.reviewerName.trim() || !reviewForm.text.trim()) {
      toast.error(t('review.fillFields'));
      return;
    }
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        painterId: id,
        reviewerName: reviewForm.reviewerName,
        rating: reviewForm.rating,
        text: reviewForm.text,
        createdAt: Date.now(),
      });
      toast.success(t('review.submitted'));
      setReviewForm({ reviewerName: '', rating: 5, text: '' });
      let reviewSnap;
      try {
        const reviewQuery = query(collection(db, 'reviews'), where('painterId', '==', id), orderBy('createdAt', 'desc'));
        reviewSnap = await getDocs(reviewQuery);
      } catch {
        const reviewQuery = query(collection(db, 'reviews'), where('painterId', '==', id));
        reviewSnap = await getDocs(reviewQuery);
      }
      setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    } catch {
      toast.error(t('review.error'));
    }
    setSubmittingReview(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const listingDoc = await getDoc(doc(db, 'listings', id));
        if (listingDoc.exists()) {
          setPainter({ id: listingDoc.id, ...listingDoc.data() } as PainterListing);
        }

        const portfolioQuery = query(
          collection(db, 'portfolios', id, 'items'),
          orderBy('order', 'asc')
        );
        const portfolioSnap = await getDocs(portfolioQuery);
        if (!portfolioSnap.empty) {
          setPortfolio(portfolioSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem)));
        }

        const albumQuery = query(
          collection(db, 'portfolios', id, 'albums'),
          orderBy('order', 'asc')
        );
        const albumSnap = await getDocs(albumQuery);
        if (!albumSnap.empty) {
          setAlbums(albumSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioAlbum)));
        }

        let reviewSnap;
        try {
          const reviewQuery = query(
            collection(db, 'reviews'),
            where('painterId', '==', id),
            orderBy('createdAt', 'desc')
          );
          reviewSnap = await getDocs(reviewQuery);
        } catch {
          const reviewQuery = query(
            collection(db, 'reviews'),
            where('painterId', '==', id)
          );
          reviewSnap = await getDocs(reviewQuery);
        }
        if (!reviewSnap.empty) {
          setReviews(reviewSnap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
        }
      } catch (err) {
        console.error('Firebase error', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!painter) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-text-muted">Painter not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BackButton to="/painters" label={t('backToPainters')} className="mb-6" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-5 text-center">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-surface-light mb-4 cursor-pointer" onClick={() => painter.profileImageUrl && setPhotoLightboxOpen(true)}>
              {painter.profileImageUrl ? (
                <img src={painter.profileImageUrl} alt={painter.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <FaPaintRoller size={32} />
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Inter' }}>{painter.businessName || painter.name}</h1>
            {painter.yearsOfExperience && (
              <p className="text-text-muted text-sm mt-1">{painter.yearsOfExperience} years of experience</p>
            )}
            <div className="flex gap-2 mt-4">
              <WhatsAppButton number={painter.whatsappNumber} painterName={painter.name} type="chat" painterId={id} />
              <WhatsAppButton number={painter.whatsappNumber} painterName={painter.name} type="book" painterId={id} />
            </div>
          </div>

          {painter.email || painter.phoneNumber ? (
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('contact.info')}</h3>
              <div className="space-y-2 text-sm">
                {painter.phoneNumber && (
                  <p className="flex items-center gap-2 text-text-muted">
                    <FaPhone className="text-primary" /> {painter.phoneNumber}
                  </p>
                )}
                {painter.email && (
                  <p className="flex items-center gap-2 text-text-muted">
                    <FaEnvelope className="text-primary" /> {painter.email}
                  </p>
                )}
                {painter.workingHours && (
                  <p className="flex items-center gap-2 text-text-muted">
                    <FaClock className="text-primary" /> {painter.workingHours}
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {painter.regions && painter.regions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5"
            >
              <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('serviceAreas')}</h3>
              <div className="flex flex-wrap gap-2">
                {painter.cities?.map((city, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-text-muted flex items-center gap-1">
                    <FaMapMarkerAlt /> {city}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {painter.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-5"
            >
              <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('about')}</h3>
              <p className="text-text-muted leading-relaxed">{painter.bio}</p>
            </motion.div>
          )}

          {painter.specialties && painter.specialties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-5"
            >
              <h3 className="font-semibold mb-3" style={{ fontFamily: 'Inter' }}>{t('specialties')}</h3>
              <div className="flex flex-wrap gap-2">
                {painter.specialties.map((s, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            id="portfolio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Inter' }}>{t('portfolio.title')}</h3>
            <PortfolioGallery items={portfolio} albums={Object.fromEntries(albums.map(a => [a.id, a.name]))} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <h3 className="font-semibold mb-4" style={{ fontFamily: 'Inter' }}>{t('review.title')}</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3 mb-6">
              <input
                type="text"
                placeholder={t('review.name')}
                value={reviewForm.reviewerName}
                onChange={e => setReviewForm(f => ({ ...f, reviewerName: e.target.value }))}
                className="input-field"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">{t('review.rating')}:</span>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                      className="transition-transform hover:scale-110 active:scale-95 focus-ring"
                    >
                      <FaStar size={20} className={`transition-colors ${n <= reviewForm.rating ? 'text-accent drop-shadow-[0_0_6px_rgba(217,164,65,0.6)]' : 'text-text-muted hover:text-accent/60'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder={t('review.text')}
                value={reviewForm.text}
                onChange={e => setReviewForm(f => ({ ...f, text: e.target.value }))}
                className="input-field min-h-[80px]"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submittingReview}
                className="btn-primary flex items-center gap-2"
              >
                {submittingReview ? <><span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" /> {t('review.submitting')}</> : <><FaPaperPlane size={14} /> {t('review.submit')}</>}
              </motion.button>
            </form>

            {reviews.length > 0 && (
              <>
                <h4 className="font-semibold mb-3 text-text-muted" style={{ fontFamily: 'Inter' }}>{t('review.count')} ({reviews.length})</h4>
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r.id} className="border-b border-white/10 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{r.reviewerName}</span>
                        <div className="flex items-center gap-1 text-accent">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <FaStar key={i} size={12} />
                          ))}
                        </div>
                      </div>
                      <p className="text-text-muted text-sm">{r.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {reviews.length === 0 && (
              <div className="text-center py-8 border-t border-white/10 pt-6">
                <FaStar className="text-3xl mx-auto mb-2 text-text-muted/30" />
                <p className="text-text-muted text-sm">{t('review.empty')}</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {photoLightboxOpen && painter && (
        <ImageLightbox
          images={[{ imageUrl: painter.profileImageUrl, title: painter.businessName || painter.name }]}
          currentIndex={0}
          onClose={() => setPhotoLightboxOpen(false)}
          onPrev={() => {}}
          onNext={() => {}}
        />
      )}
    </div>
  );
}
