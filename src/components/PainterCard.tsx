import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPaintRoller } from 'react-icons/fa';
import type { PainterListing } from '../types';
import { useTranslation } from '../lib/translations';

interface PainterCardProps {
  painter: PainterListing;
  index?: number;
}

export default function PainterCard({ painter, index = 0 }: PainterCardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/painters/${painter.painterId}`} className="block">
        <div className="glass-card p-5 h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-surface-light flex-shrink-0">
              {painter.profileImageUrl ? (
                <img src={painter.profileImageUrl} alt={painter.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <FaPaintRoller size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate" style={{ fontFamily: 'Inter' }}>
                {painter.businessName || painter.name}
              </h3>
              <p className="text-text-muted text-sm truncate">{painter.name}</p>
            </div>
          </div>

          <p className="text-text-muted text-sm line-clamp-2 mb-4">
            {painter.bio || t('painter.noBio')}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {painter.specialties?.slice(0, 3).map((s, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                {s}
              </span>
            ))}
          </div>

          {painter.cities && painter.cities.length > 0 && (
            <div className="flex items-center gap-1 text-text-muted text-xs">
              <FaMapMarkerAlt className="text-accent" />
              <span>{painter.cities.join(', ')}</span>
            </div>
          )}

          {painter.availability !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${painter.availability ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-text-muted">
                {painter.availability ? t('painter.accepting') : t('painter.notAvailable')}
              </span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
