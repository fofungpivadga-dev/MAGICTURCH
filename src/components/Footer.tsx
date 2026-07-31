import { Link } from 'react-router-dom';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface mt-20 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="mb-4">
            <img src="/logo.png" alt="Magic Touch" className="h-14 w-auto" />
          </div>
          <p className="text-text-muted text-sm">
            {t('footer.tagline')}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'Playfair Display' }}>{t('footer.quickLinks')}</h4>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/" className="text-text-muted hover:text-text transition-colors">{t('footer.home')}</Link>
            <Link to="/painters" className="text-text-muted hover:text-text transition-colors">{t('footer.findPainter')}</Link>
            <Link to="/join" className="text-text-muted hover:text-text transition-colors">{t('footer.joinPainter')}</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4" style={{ fontFamily: 'Playfair Display' }}>{t('footer.contact')}</h4>
          <div className="flex flex-col gap-2 text-sm">
            <a href="https://wa.me/237691316704?text=Hi%2C%20I'd%20like%20to%20get%20in%20touch%20with%20Magic%20Touch%20Painting%20Services." target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-whatsapp transition-colors flex items-center gap-2">
              <FaWhatsapp /> {t('footer.whatsapp')}
            </a>
            <a href="mailto:jussybig@gmail.com" className="text-text-muted hover:text-text transition-colors flex items-center gap-2">
              <FaEnvelope /> {t('footer.email')}
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-[#E9E0CC] text-center text-text-muted text-xs">
        &copy; {new Date().getFullYear()} Magic Touch Painting Services. {t('footer.copyright')}
      </div>
    </footer>
  );
}
