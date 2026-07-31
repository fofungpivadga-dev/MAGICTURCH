import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';

export default function FAQ() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(0);

  const items = [1, 2, 3, 4, 5].map(i => ({
    q: t(`faq.${i}.q`),
    a: t(`faq.${i}.a`),
  }));

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t('faq.title')}
          </h2>
          <p className="text-text-muted">
            {t('faq.subtitle')}
          </p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left focus-ring"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-sm md:text-base">{item.q}</span>
                <FaChevronDown
                  className={`text-accent flex-shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                  size={14}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <p className="px-6 pb-5 text-sm text-text-muted leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
