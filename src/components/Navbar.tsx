import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser, FaTachometerAlt, FaGlobe, FaBars, FaTimes, FaHeadset, FaPaintRoller, FaDownload } from 'react-icons/fa';
import { useTranslation, type Lang } from '../lib/translations';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const switchLang = (l: Lang) => {
    setLang(l);
    setLangOpen(false);
    window.location.reload();
  };

  const linkClass = 'text-white/80 hover:text-white transition-colors text-sm focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#D4AF37]';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0D]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="Magic Touch" className="h-9 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/painters" className={linkClass}>
            {t('nav.painters')}
          </Link>
          <a href="/#try-paint" className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#D4AF37]">
            <FaPaintRoller /> {t('nav.tryPaint')}
          </a>
          <a href="https://wa.me/237691316704?text=Hi%2C%20I%20need%20help%20with%20Magic%20Touch%20Painting%20Services." target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-white/80 hover:text-[#25D366] transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#D4AF37]">
            <FaHeadset /> {t('nav.contact')}
          </a>

          {/* Language Toggle */}
          <div className="relative" ref={langRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#D4AF37]"
            >
              <FaGlobe /> {lang.toUpperCase()}
            </motion.button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#0B0B0D] border border-white/15 p-1 rounded-xl min-w-[80px] shadow-xl">
                <button
                  onClick={() => switchLang('en')}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-lg focus-ring ${lang === 'en' ? 'text-accent bg-white/10' : 'text-white/80 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLang('fr')}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-lg focus-ring ${lang === 'fr' ? 'text-accent bg-white/10' : 'text-white/80 hover:text-white'}`}
                >
                  FR
                </button>
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link
                to="/dashboard"
                  className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#D4AF37]"
              >
                <FaUser /> {t('nav.dashboard')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#D4AF37]"
                >
                  <FaTachometerAlt /> {t('nav.admin')}
                </Link>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-white/80 hover:text-accent transition-colors focus-ring"
              >
                <FaSignOutAlt />
                {t('nav.logout')}
              </motion.button>
            </>
          ) : (
            <Link to="/join?mode=signin">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary text-sm focus-ring"
              >
                {t('nav.signin')}
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger + Language */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => switchLang(lang === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-white/80 hover:text-accent transition-colors focus-ring rounded-lg"
            aria-label="Switch language"
          >
            <FaGlobe /> {lang === 'en' ? 'FR' : 'EN'}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white hover:text-accent transition-colors p-2 focus-ring"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#0B0B0D]/95 border-t border-white/10"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  window.dispatchEvent(new Event('mtps:show-install'));
                  setMobileOpen(false);
                }}
                className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base font-semibold text-accent bg-accent/15 hover:bg-accent/25 transition-colors focus-ring"
              >
                <FaDownload size={18} /> {t('nav.install')}
              </button>
              <Link
                to="/painters"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-ring"
              >
                {t('nav.painters')}
              </Link>
              <a href="/#try-paint" className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-ring" onClick={() => setMobileOpen(false)}>
                <FaPaintRoller size={18} /> {t('nav.tryPaint')}
              </a>
              <a href="https://wa.me/237691316704?text=Hi%2C%20I%20need%20help%20with%20Magic%20Touch%20Painting%20Services." target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base text-white/80 hover:text-[#25D366] hover:bg-white/10 transition-colors focus-ring" onClick={() => setMobileOpen(false)}>
                <FaHeadset size={18} /> {t('nav.contact')}
              </a>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-ring"
                    onClick={() => setMobileOpen(false)}
                  >
                    <FaUser size={18} /> {t('nav.dashboard')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-ring"
                      onClick={() => setMobileOpen(false)}
                    >
                      <FaTachometerAlt size={18} /> {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 w-full py-3 px-3 rounded-xl text-base text-white/80 hover:text-accent hover:bg-white/10 transition-colors text-left focus-ring"
                  >
                    <FaSignOutAlt size={18} /> {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link to="/join?mode=signin" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-base w-full py-3 focus-ring"
                  >
                    {t('nav.signin')}
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
