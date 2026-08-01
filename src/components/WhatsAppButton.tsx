import { motion } from 'framer-motion';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';

interface WhatsAppButtonProps {
  number: string;
  painterName: string;
  type: 'chat' | 'call';
  painterId?: string;
}

export default function WhatsAppButton({ number, painterName, type, painterId }: WhatsAppButtonProps) {
  const { t } = useTranslation();

  const isCall = type === 'call';
  const href = isCall
    ? `tel:${number.replace(/[^\d+]/g, '')}`
    : `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${painterName}, I found you on Magic Touch Painting Services and I have a question about your work.`)}`;

  const trackClick = () => {
    if (!painterId) return;
    const key = `wa_clicks_${painterId}`;
    const current = parseInt(sessionStorage.getItem(key) || '0');
    sessionStorage.setItem(key, String(current + 1));
  };

  return (
    <motion.a
      href={href}
      target={isCall ? undefined : '_blank'}
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={trackClick}
      className={isCall ? 'btn-outline' : 'btn-whatsapp'}
    >
      {isCall ? <FaPhone className="text-lg" /> : <FaWhatsapp className="text-lg" />}
      {isCall ? t('call.now') : t('chat.whatsapp')}
    </motion.a>
  );
}
