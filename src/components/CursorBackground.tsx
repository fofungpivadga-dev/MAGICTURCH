import { useEffect, useRef } from 'react';

export default function CursorBackground() {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    elRef.current = document.querySelector('body');

    const handleMove = (e: MouseEvent) => {
      if (!elRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      elRef.current.style.setProperty('--bg-offset-x', `${x}%`);
      elRef.current.style.setProperty('--bg-offset-y', `${y}%`);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return null;
}
