import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser, FaTachometerAlt, FaGlobe, FaBars, FaTimes, FaHeadset, FaPaintRoller } from 'react-icons/fa';
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

  const linkClass = 'text-white/80 hover:text-white transition-colors text-sm focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#FDFAD0]';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F4D3B]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="Magic Touch" className="h-9 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/painters" className={linkClass}>
            {t('nav.painters')}
          </Link>
          <a href="/#try-paint" className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#FDFAD0]">
            <FaPaintRoller /> {t('nav.tryPaint')}
          </a>
          <a href="https://wa.me/237691316704?text=Hi%2C%20I%20need%20help%20with%20Magic%20Touch%20Painting%20Services." target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-white/80 hover:text-[#25D366] transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#FDFAD0]">
            <FaHeadset /> {t('nav.contact')}
          </a>

          {/* Language Toggle */}
          <div className="relative" ref={langRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#FDFAD0]"
            >
              <FaGlobe /> {lang.toUpperCase()}
            </motion.button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-[#1F4D3B] border border-white/15 p-1 rounded-xl min-w-[80px] shadow-xl">
                <button
                  onClick={() => switchLang('en')}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-lg focus-ring ${lang === 'en' ? 'text-[#FDFAD0] bg-white/10' : 'text-white/80 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLang('fr')}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-lg focus-ring ${lang === 'fr' ? 'text-[#FDFAD0] bg-white/10' : 'text-white/80 hover:text-white'}`}
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
                  className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#FDFAD0]"
              >
                <FaUser /> {t('nav.dashboard')}
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                className="flex items-center gap-1 text-sm text-white/80 hover:text-white transition-colors focus-ring hover:underline underline-offset-4 decoration-2 decoration-[#FDFAD0]"
                >
                  <FaTachometerAlt /> {t('nav.admin')}
                </Link>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm text-white/80 hover:text-[#FDFAD0] transition-colors focus-ring"
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white hover:text-[#FDFAD0] transition-colors p-2 focus-ring"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-[#1F4D3B]/95 border-t border-white/10"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link to="/painters" className={linkClass} onClick={() => setMobileOpen(false)}>
                {t('nav.painters')}
              </Link>
              <a href="/#try-paint" className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors focus-ring" onClick={() => setMobileOpen(false)}>
                <FaPaintRoller /> {t('nav.tryPaint')}
              </a>
              <a href="https://wa.me/237691316704?text=Hi%2C%20I%20need%20help%20with%20Magic%20Touch%20Painting%20Services." target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/80 hover:text-[#25D366] transition-colors focus-ring" onClick={() => setMobileOpen(false)}>
                <FaHeadset /> {t('nav.contact')}
              </a>
              <div className="flex items-center gap-2">
                <FaGlobe className="text-white/60" size={14} />
                <button
                  onClick={() => switchLang('en')}
                  className={`text-sm focus-ring px-2 py-1 rounded ${lang === 'en' ? 'text-[#FDFAD0] bg-white/10' : 'text-white/80 hover:text-white'}`}
                >
                  EN
                </button>
                <button
                  onClick={() => switchLang('fr')}
                  className={`text-sm focus-ring px-2 py-1 rounded ${lang === 'fr' ? 'text-[#FDFAD0] bg-white/10' : 'text-white/80 hover:text-white'}`}
                >
                  FR
                </button>
              </div>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors focus-ring"
                    onClick={() => setMobileOpen(false)}
                  >
                    <FaUser /> {t('nav.dashboard')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors focus-ring"
                      onClick={() => setMobileOpen(false)}
                    >
                      <FaTachometerAlt /> {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-[#FDFAD0] transition-colors text-left focus-ring"
                  >
                    <FaSignOutAlt /> {t('nav.logout')}
                  </button>
                </>
              ) : (
                <Link to="/join?mode=signin" onClick={() => setMobileOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-sm w-full focus-ring"
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
