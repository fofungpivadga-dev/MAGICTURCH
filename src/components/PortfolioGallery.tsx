import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PortfolioItem } from '../types';
import { useTranslation } from '../lib/translations';
import ImageLightbox from './ImageLightbox';

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  albums?: Record<string, string>;
}

export default function PortfolioGallery({ items, albums }: PortfolioGalleryProps) {
  const { t } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted">
        <p>{t('portfolio.empty')}</p>
      </div>
    );
  }

  const lightboxImages = items.map(item => ({ imageUrl: item.imageUrl, title: item.title || item.caption }));

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group relative rounded-xl overflow-hidden bg-surface-light aspect-square cursor-pointer"
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={item.imageUrl}
              alt={item.title || item.caption}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
            {item.albumId && albums?.[item.albumId] && (
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium backdrop-blur-sm">
                {albums[item.albumId]}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div>
                {item.title && (
                  <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                )}
                {item.caption && (
                  <p className="text-white/80 text-xs mt-1">{item.caption}</p>
                )}
              </div>
            </div>
            {item.isBeforeAfter && (
              <span className="absolute top-2 left-2 px-2 py-1 rounded bg-accent/90 text-xs font-semibold text-dark">
                {t('project.beforeAfter')}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i === 0 ? lightboxImages.length - 1 : i! - 1))}
          onNext={() => setLightboxIndex(i => (i === lightboxImages.length - 1 ? 0 : i! + 1))}
        />
      )}
    </>
  );
}
