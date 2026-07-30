import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, state } = useLocation();
  const navigationType = useNavigationType();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      sessionStorage.setItem(`scroll_${prevPath.current}`, String(window.scrollY));
      prevPath.current = pathname;
    }
  });

  useEffect(() => {
    if (state && (state as any).scrollTo) {
      const el = document.getElementById((state as any).scrollTo);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
        return;
      }
    }

    if (navigationType === 'POP') {
      const saved = sessionStorage.getItem(`scroll_${pathname}`);
      if (saved) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(saved));
        });
        sessionStorage.removeItem(`scroll_${pathname}`);
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
