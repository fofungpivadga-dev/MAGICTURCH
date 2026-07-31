import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';

const AVATAR_COLORS = [
  'bg-[#1C1917]',
  'bg-[#6F4A00]',
  'bg-[#6B6256]',
];

export default function Testimonials() {
  const { t } = useTranslation();

  const items = [1, 2, 3].map(i => ({
    name: t(`testimonials.${i}.name`),
    city: t(`testimonials.${i}.city`),
    quote: t(`testimonials.${i}.quote`),
  }));

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-white">
            {t('testimonials.title')}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card p-6 flex flex-col"
            >
              <div className="flex gap-1 text-accent mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <FaStar key={s} size={14} />
                ))}
              </div>
              <p className="text-text-muted text-sm leading-relaxed flex-1">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className={`w-10 h-10 rounded-full ${AVATAR_COLORS[i]} flex items-center justify-center text-white font-semibold text-sm`}>
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-text">{item.name}</p>
                  <p className="text-xs text-text-muted">{item.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
