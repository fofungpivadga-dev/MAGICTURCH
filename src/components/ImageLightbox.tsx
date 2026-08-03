import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface ImageLightboxProps {
  images: { imageUrl: string; title?: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ImageLightbox({ images, currentIndex, onClose, onPrev, onNext }: ImageLightboxProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  useEffect(() => {
    window.history.pushState({ mtModal: true }, '');
    const onPop = () => onClose();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (window.history.state?.mtModal) window.history.back();
    };
  }, [onClose]);

  if (!images.length) return null;

  const current = images[currentIndex];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0B0D]/95"
      >
        {/* Top bar with close button and counter */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[#0B0B0D]/60 to-transparent h-20 pointer-events-none">
          <div className="flex items-center justify-between px-4 pt-4 pointer-events-auto">
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white text-dark hover:bg-gray-200 transition-colors shadow-lg focus-ring"
              aria-label="Close"
            >
              <FaTimes size={18} />
            </button>
            {images.length > 1 && (
              <span className="px-3 py-1.5 rounded-full bg-[#0B0B0D]/50 text-white text-sm font-medium backdrop-blur-sm">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
        </div>

        {/* Previous button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all hover:scale-110 backdrop-blur-sm focus-ring"
            aria-label="Previous"
          >
            <FaChevronLeft size={22} />
          </button>
        )}

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition-all hover:scale-110 backdrop-blur-sm focus-ring"
            aria-label="Next"
          >
            <FaChevronRight size={22} />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={currentIndex}
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-screen h-screen p-16"
        >
          <img
            src={current.imageUrl}
            alt={current.title || ''}
            className="max-w-full max-h-full object-contain"
          />
        </motion.div>

        {/* Bottom caption */}
        {current.title && (
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#0B0B0D]/60 to-transparent h-20 pointer-events-none">
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full bg-[#0B0B0D]/40 backdrop-blur-sm pointer-events-auto">
              {current.title}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
