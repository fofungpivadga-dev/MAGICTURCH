import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaGoogle, FaPaintRoller, FaLock, FaEnvelope, FaUser, FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from '../lib/translations';
import BackButton from '../components/BackButton';

export default function Join() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'signup' | 'signin'>(searchParams.get('mode') === 'signin' ? 'signin' : 'signup');
  const [couponCode, setCouponCode] = useState('');
  const [step, setStep] = useState<'choose' | 'coupon' | 'processing'>(
    searchParams.get('coupon_required') === 'true' ? 'coupon' : 'choose'
  );

  const [emailForm, setEmailForm] = useState({ displayName: '', email: '', password: '' });

  useEffect(() => {
    if (searchParams.get('coupon_required') === 'true') {
      const name = localStorage.getItem('pendingCouponName');
      if (name) {
        setEmailForm(f => ({ ...f, displayName: name }));
      }
    }
  }, []);
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [validating, setValidating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const { signInWithGoogle, signInWithEmail, registerWithEmailPassword, registerWithCoupon, user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleGoogleSignUp = async () => {
    setStep('processing');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message === 'COUPON_REQUIRED') {
        setStep('coupon');
        toast.success(t('google.signedIn'));
      } else {
        toast.error(err.message || t('google.failed'));
        setStep('choose');
      }
    }
  };

  const handleEmailSignUp = async () => {
    if (!emailForm.displayName.trim() || !emailForm.email.trim() || !emailForm.password.trim()) {
      toast.error(t('email.fillAll'));
      return;
    }
    if (emailForm.password.length < 6) {
      toast.error(t('email.passwordShort'));
      return;
    }
    setCreating(true);
    try {
      await registerWithEmailPassword(emailForm.email, emailForm.password, emailForm.displayName);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message === 'COUPON_REQUIRED') {
        setStep('coupon');
      } else if (err.message === 'ALREADY_REGISTERED') {
        toast.success(t('signin.alreadyRegistered'));
        navigate('/dashboard');
      } else {
        toast.error(err.message || t('email.failed'));
      }
    }
    setCreating(false);
  };

  const handleEmailSignIn = async () => {
    if (!signInForm.email.trim() || !signInForm.password.trim()) {
      toast.error(t('signin.fillAll'));
      return;
    }
    setSigningIn(true);
    try {
      await signInWithEmail(signInForm.email, signInForm.password);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || t('signin.failed'));
    }
    setSigningIn(false);
  };

  const handleCouponSubmit = async () => {
    if (!couponCode.trim()) {
      toast.error(t('coupon.enterCode'));
      return;
    }
    setValidating(true);
    try {
      await registerWithCoupon(couponCode.trim().toUpperCase());
      toast.success(t('join.welcome'));
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || t('coupon.invalid'));
    }
    setValidating(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <BackButton to="/" label={t('backToHome')} className="mb-4" />
        <div className="glass-card p-6">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <FaPaintRoller className="text-primary text-xl" />
            </div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'Playfair Display' }}>
              {mode === 'signup' ? t('join.title') : t('signin.title')}
            </h1>
            <p className="text-text-muted text-sm mt-2">
              {mode === 'signup' ? t('join.subtitle') : t('signin.subtitle')}
            </p>
          </div>

          <div className="flex rounded-xl bg-[#F1EAD9] p-1 mb-6">
            <button
              onClick={() => { setMode('signup'); setStep('choose'); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors focus-ring ${mode === 'signup' ? 'bg-accent text-dark' : 'text-text-muted hover:text-text'}`}
            >
              {t('join.tab')}
            </button>
            <button
              onClick={() => { setMode('signin'); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors focus-ring ${mode === 'signin' ? 'bg-accent text-dark' : 'text-text-muted hover:text-text'}`}
            >
              {t('signin.tab')}
            </button>
          </div>

          {/* ──────── SIGN UP MODE ──────── */}
          {mode === 'signup' && (
            <>
              {step === 'choose' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleSignUp}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white text-dark font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <FaGoogle className="text-lg" /> {t('join.google')}
                  </motion.button>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#E3D9C2]" />
                    <span className="text-text-muted text-xs">{t('join.or')}</span>
                    <div className="flex-1 h-px bg-[#E3D9C2]" />
                  </div>

                  <div className="space-y-3">
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                      <input type="text" placeholder={t('email.username')}
                        value={emailForm.displayName}
                        onChange={e => setEmailForm(f => ({ ...f, displayName: e.target.value }))}
                        className="input-field has-icon" />
                    </div>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                      <input type="email" placeholder={t('email.email')}
                        value={emailForm.email}
                        onChange={e => setEmailForm(f => ({ ...f, email: e.target.value }))}
                        className="input-field has-icon" />
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                      <input type="password" placeholder={t('email.password')}
                        value={emailForm.password}
                        onChange={e => setEmailForm(f => ({ ...f, password: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleEmailSignUp()}
                        className="input-field has-icon" />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleEmailSignUp} disabled={creating}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><FaEnvelope /> {t('email.create')}</>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {step === 'coupon' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
                    <p className="text-sm text-accent font-medium">{t('coupon.required')}</p>
                    <p className="text-xs text-text-muted mt-1">{t('coupon.required.desc')}</p>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" placeholder={t('join.placeholder')}
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleCouponSubmit()}
                      className="input-field has-icon text-center tracking-widest uppercase" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleCouponSubmit} disabled={validating}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {validating ? (
                      <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      t('coupon.validate')
                    )}
                  </motion.button>
                  <button onClick={() => setStep('choose')}
                    className="w-full flex items-center justify-center gap-1 text-xs text-text-muted hover:text-text transition-colors"
                  >
                    {t('coupon.back')}
                  </button>
                </motion.div>
              )}

              {step === 'processing' && (
                <div className="text-center py-8">
                  <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-text-muted text-sm">{t('join.processing')}</p>
                </div>
              )}
            </>
          )}

          {/* ──────── SIGN IN MODE ──────── */}
          {mode === 'signin' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setStep('processing');
                  try {
                    await signInWithGoogle();
                    navigate('/dashboard');
                  } catch (err: any) {
                    toast.error(err.message || t('google.failed'));
                    setStep('choose');
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white text-dark font-semibold hover:bg-gray-100 transition-colors"
              >
                <FaGoogle className="text-lg" /> {t('signin.google')}
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E3D9C2]" />
                <span className="text-text-muted text-xs">{t('join.or')}</span>
                <div className="flex-1 h-px bg-[#E3D9C2]" />
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input type="email" placeholder={t('signin.email')}
                    value={signInForm.email}
                    onChange={e => setSignInForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field has-icon" />
                </div>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                  <input type="password" placeholder={t('signin.password')}
                    value={signInForm.password}
                    onChange={e => setSignInForm(f => ({ ...f, password: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleEmailSignIn()}
                    className="input-field has-icon" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleEmailSignIn} disabled={signingIn}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {signingIn ? (
                    <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FaEnvelope /> {t('signin.button')}</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {mode === 'signup' && step === 'choose' && (
          <div className="mt-6 p-4 rounded-xl bg-surface-light border border-[#E9E0CC] text-center">
            <p className="text-text-muted text-sm font-medium mb-1">{t('join.noCouponDesc')}</p>
            <p className="text-text-muted text-xs mb-3">{t('join.noCoupon')}</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="https://wa.me/237691316704?text=Hi%2C%20I'd%20like%20to%20get%20a%20coupon%20code%20to%20join%20Magic%20Touch%20Painting%20Services%20as%20a%20painter."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-xs px-4 py-2 inline-flex items-center gap-2"
              >
                <FaWhatsapp /> {t('join.contactWhatsapp')}
              </a>
              <a
                href="mailto:jussybig@gmail.com"
                className="btn-outline text-xs px-4 py-2 inline-flex items-center gap-2"
              >
                <FaEnvelope /> {t('join.contactEmail')}
              </a>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
