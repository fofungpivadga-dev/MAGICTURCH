import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';

interface WhatsAppButtonProps {
  number: string;
  painterName: string;
  type: 'chat' | 'book';
  painterId?: string;
}

export default function WhatsAppButton({ number, painterName, type, painterId }: WhatsAppButtonProps) {
  const { t } = useTranslation();

  const messages = {
    chat: `Hi ${painterName}, I found you on Magic Touch Painting Services and I have a question about your work.`,
    book: `Hi ${painterName}, I'd like to book you for a painting job via Magic Touch Painting Services.`,
  };

  const href = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(messages[type])}`;

  const trackClick = () => {
    if (!painterId) return;
    const key = `wa_clicks_${painterId}`;
    const current = parseInt(sessionStorage.getItem(key) || '0');
    sessionStorage.setItem(key, String(current + 1));
  };

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={trackClick}
      className="btn-whatsapp"
    >
      <FaWhatsapp className="text-lg" />
      {type === 'chat' ? t('chat.whatsapp') : t('book.whatsapp')}
    </motion.a>
  );
}
