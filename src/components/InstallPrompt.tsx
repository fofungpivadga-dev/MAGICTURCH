import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaShareAlt, FaMobileAlt, FaPlus } from 'react-icons/fa';

const STORAGE_KEY = 'mtps_install_dismissed';

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<void>; userChoice: Promise<unknown> } | null>(null);

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const onShow = () => {
      if (isStandalone) return;
      setShow(true);
    };
    window.addEventListener('mtps:show-install', onShow);
    return () => window.removeEventListener('mtps:show-install', onShow);
  }, [isStandalone]);

  useEffect(() => {
    if (isStandalone) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let timer: number | undefined;

    const showAfter = (ms: number) => {
      timer = window.setTimeout(() => setShow(true), ms);
    };

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as typeof deferredPrompt);
      showAfter(3000);
    };

    if (isIOS) {
      showAfter(6000);
    } else {
      window.addEventListener('beforeinstallprompt', onBeforeInstall);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      if (timer) clearTimeout(timer);
    };
  }, [isIOS, isStandalone]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setShow(false);
      localStorage.setItem(STORAGE_KEY, '1');
    } else if (isIOS) {
      setShow(false);
      localStorage.setItem(STORAGE_KEY, '1');
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleDismiss} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="relative z-10 w-full max-w-sm glass-card p-6 rounded-2xl"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-text-muted hover:text-text transition-colors focus-ring rounded-lg p-1.5"
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E4572E] to-[#D9A441] flex items-center justify-center mb-4">
              <FaMobileAlt className="text-dark text-2xl" />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ fontFamily: 'Inter' }}>
              Install Magic Touch
            </h2>
            <p className="text-sm text-text-muted mb-4">
              {deferredPrompt
                ? 'Install the app on your phone to open it anytime without a browser.'
                : 'Install the app on your phone to open it anytime without a browser.'}
            </p>
            {!deferredPrompt && isIOS ? (
              <div className="space-y-2 mb-4 text-sm">
                <p className="text-text-muted">On your iPhone:</p>
                <p className="flex items-center gap-2 text-text">
                  <FaShareAlt className="text-accent" /> Tap the Share button in Safari
                </p>
                <p className="flex items-center gap-2 text-text">
                  <FaPlus className="text-accent" /> Tap "Add to Home Screen"
                </p>
                <p className="flex items-center gap-2 text-text">
                  <FaMobileAlt className="text-accent" /> Open Magic Touch from your Home Screen
                </p>
              </div>
            ) : null}
            <div className="flex gap-3">
              {deferredPrompt && (
                <button onClick={handleInstall} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <FaDownload /> Install App
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`${deferredPrompt ? 'btn-outline flex-1' : 'btn-primary flex-1 flex items-center justify-center gap-2'}`}
              >
                {deferredPrompt ? 'Not now' : 'OK, got it'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
