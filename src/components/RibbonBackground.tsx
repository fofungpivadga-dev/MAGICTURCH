import { memo } from 'react';

interface Ribbon {
  depth: 'front' | 'back';
  top: string;
  left: string;
  width: string;
  height: string;
  rotate: number;
  opacity: number;
  duration: number;
  delay: number;
  background: string;
}

const RIBBONS: Ribbon[] = [
  { depth: 'front', top: '-15%', left: '-20%', width: '65vmax', height: '40vmax', rotate: -28, opacity: 0.5, duration: 24, delay: 0, background: 'linear-gradient(130deg, #1E3AFA 0%, #2563EB 55%, #7C3AED 100%)' },
  { depth: 'front', top: '40%', left: '55%', width: '55vmax', height: '38vmax', rotate: 22, opacity: 0.45, duration: 30, delay: -6, background: 'linear-gradient(140deg, #FB7185 0%, #F97316 50%, #FBBF24 100%)' },
  { depth: 'front', top: '60%', left: '-25%', width: '60vmax', height: '42vmax', rotate: 18, opacity: 0.4, duration: 27, delay: -12, background: 'linear-gradient(120deg, #FBBF24 0%, #FB7185 60%, #EC4899 100%)' },
  { depth: 'back', top: '-25%', left: '30%', width: '75vmax', height: '50vmax', rotate: -15, opacity: 0.4, duration: 36, delay: -4, background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 60%, #EC4899 100%)' },
  { depth: 'back', top: '55%', left: '10%', width: '80vmax', height: '45vmax', rotate: 8, opacity: 0.35, duration: 42, delay: -10, background: 'linear-gradient(125deg, #EC4899 0%, #FB7185 50%, #F97316 100%)' },
  { depth: 'back', top: '5%', left: '-40%', width: '70vmax', height: '48vmax', rotate: -32, opacity: 0.35, duration: 38, delay: -18, background: 'linear-gradient(140deg, #1E3AFA 0%, #7C3AED 70%, #FB7185 100%)' },
  { depth: 'back', top: '75%', left: '35%', width: '65vmax', height: '40vmax', rotate: -10, opacity: 0.35, duration: 34, delay: -22, background: 'linear-gradient(110deg, #2563EB 0%, #EC4899 55%, #FBBF24 100%)' },
];

const GLOWS = [
  { top: '10%', left: '20%', width: '45vmin', height: '45vmin', color: 'rgba(37, 99, 235, 0.5)', duration: 9, delay: 0 },
  { top: '55%', left: '65%', width: '50vmin', height: '50vmin', color: 'rgba(236, 72, 153, 0.4)', duration: 11, delay: -3 },
  { top: '70%', left: '5%', width: '40vmin', height: '40vmin', color: 'rgba(251, 191, 36, 0.3)', duration: 10, delay: -6 },
];

const PARTICLES = [
  { top: '18%', left: '12%', size: 6, duration: 16, delay: 0 },
  { top: '30%', left: '78%', size: 4, duration: 20, delay: -4 },
  { top: '48%', left: '25%', size: 5, duration: 18, delay: -8 },
  { top: '65%', left: '85%', size: 7, duration: 22, delay: -2 },
  { top: '78%', left: '40%', size: 4, duration: 15, delay: -10 },
  { top: '12%', left: '55%', size: 5, duration: 19, delay: -14 },
  { top: '85%', left: '70%', size: 6, duration: 17, delay: -6 },
  { top: '40%', left: '92%', size: 4, duration: 21, delay: -12 },
  { top: '8%', left: '85%', size: 4, duration: 18, delay: -16 },
  { top: '58%', left: '8%', size: 5, duration: 16, delay: -20 },
];

function RibbonBackground() {
  return (
    <div className="ribbon-bg" aria-hidden="true">
      <div className="ribbon-backdrop" />
      {RIBBONS.map((r, i) => (
        <div
          key={i}
          className={`ribbon-wrap ${r.depth}`}
          style={{ top: r.top, left: r.left, width: r.width, height: r.height }}
        >
          <div
            className="ribbon-shape"
            style={{
              background: r.background,
              rotate: `${r.rotate}deg`,
              opacity: r.opacity,
              animation: `ribbonDrift ${r.duration}s ease-in-out ${r.delay}s infinite`,
            }}
          />
        </div>
      ))}
      {GLOWS.map((g, i) => (
        <div
          key={`g${i}`}
          className="glow-spot"
          style={{
            top: g.top,
            left: g.left,
            width: g.width,
            height: g.height,
            background: `radial-gradient(circle, ${g.color} 0%, transparent 70%)`,
            animation: `glowPulse ${g.duration}s ease-in-out ${g.delay}s infinite`,
          }}
        />
      ))}
      {PARTICLES.map((p, i) => (
        <div
          key={`p${i}`}
          className="particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `particleFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="ribbon-glass" />
    </div>
  );
}

export default memo(RibbonBackground);
