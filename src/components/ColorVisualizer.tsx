import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PALETTES } from '../data/palettes';
import { useTranslation } from '../lib/translations';

export default function ColorVisualizer() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (hoveredIndex === null) return;
    const interval = setInterval(() => {
      setHoveredIndex(prev => (prev !== null ? (prev + 1) % PALETTES.length : null));
    }, 1500);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const displayIndex = hoveredIndex !== null ? hoveredIndex % PALETTES.length : selected;

  return (
    <section id="try-paint" className="max-w-7xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Playfair Display' }}>
          {t('visualizer.title')}
        </h2>
        <p className="text-text-muted max-w-xl mx-auto text-sm">
          {t('visualizer.desc')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3">
          <div className="glass p-2 rounded-xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={displayIndex}
                src={PALETTES[displayIndex].imageUrl}
                alt={PALETTES[displayIndex].name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-auto max-h-[500px] object-contain rounded-lg"
              />
            </AnimatePresence>
          </div>
        </div>

        <div
          className="lg:col-span-2 space-y-2.5"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {PALETTES.map((p, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setSelected(i); setHoveredIndex(null); }}
              onMouseEnter={() => setHoveredIndex(i)}
              className={`w-full text-left p-3 rounded-xl transition-all ${
                selected === i
                  ? 'bg-accent/20 border-2 border-accent/60 shadow-lg shadow-accent/10'
                  : 'bg-surface-light border border-[#E3D9C2] hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-1 flex-shrink-0">
                  {[p.wall, p.roof, p.trim, p.door, p.accent].map((color, ci) => (
                    <div
                      key={ci}
                      className="w-5 h-5 rounded border border-[#D8CBB0]"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                </div>
                {selected === i && (
                  <div className="flex-shrink-0 bg-accent/20 text-accent text-[10px] font-semibold px-2 py-0.5 rounded">
                    Active
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
