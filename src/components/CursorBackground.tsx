import { useEffect, useRef } from 'react';

const AMPLITUDE = 30;
const AUTO_SPEED = 0.015;

export default function CursorBackground() {
  const elRef = useRef<HTMLElement | null>(null);
  const autoRef = useRef<number>(0);
  const timeRef = useRef(0);
  const userInteracted = useRef(false);

  useEffect(() => {
    elRef.current = document.querySelector('body');
    const el = elRef.current;
    if (!el) return;

    userInteracted.current = false;

    const handleMove = (cx: number, cy: number) => {
      if (!el) return;
      userInteracted.current = true;
      const x = (cx / window.innerWidth - 0.5) * AMPLITUDE;
      const y = (cy / window.innerHeight - 0.5) * AMPLITUDE;
      el.style.setProperty('--bg-offset-x', `${x}%`);
      el.style.setProperty('--bg-offset-y', `${y}%`);
    };

    const onMouse = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const autoAnimate = () => {
      if (!userInteracted.current) {
        timeRef.current += AUTO_SPEED;
        const cx = window.innerWidth / 2 + Math.sin(timeRef.current) * window.innerWidth * 0.3;
        const cy = window.innerHeight / 2 + Math.cos(timeRef.current * 0.7) * window.innerHeight * 0.3;
        const x = (cx / window.innerWidth - 0.5) * AMPLITUDE;
        const y = (cy / window.innerHeight - 0.5) * AMPLITUDE;
        el?.style.setProperty('--bg-offset-x', `${x}%`);
        el?.style.setProperty('--bg-offset-y', `${y}%`);
      }
      autoRef.current = requestAnimationFrame(autoAnimate);
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchstart', () => { userInteracted.current = true; }, { passive: true });
    autoRef.current = requestAnimationFrame(autoAnimate);

    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      cancelAnimationFrame(autoRef.current);
    };
  }, []);

  return null;
}
