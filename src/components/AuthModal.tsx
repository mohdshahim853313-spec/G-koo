import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../useAppContext';
import { GkooBirdAvatar } from './Mascot';
import { playSound, triggerHaptic } from '../lib/audio';
import { triggerGoogleSignIn, initGoogleInAppAuth, renderGoogleButton, type GoogleUserProfile } from '../lib/googleAuth';
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

const AVATAR_OPTIONS = ['🦉', '🦁', '🦊', '🐼', '🐯', '🦄', '🚀', '👑'];

export const AuthModal = () => {
  const {
    t,
    lang,
    isAuthModalOpen,
    setIsAuthModalOpen,
    signIn,
    signUp,
    signInWithGoogle,
  } = useAppContext();

  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦉');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = (googleUser: GoogleUserProfile) => {
    const result = signInWithGoogle({
      id: googleUser.sub,
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.picture || '🦁',
    });

    if (result.success) {
      playSound('complete');
      triggerHaptic('success');
      setSuccessMessage(result.message || (lang === 'hi' ? 'Google से लॉगिन सफल!' : 'Signed in with Google!'));
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setIsGoogleLoading(false);
        setSuccessMessage('');
      }, 1200);
    } else {
      playSound('error');
      triggerHaptic('error');
      setErrorMessage(result.message || 'Google sign-in failed');
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      initGoogleInAppAuth(
        (user) => handleGoogleSuccess(user),
        (err) => console.debug('Google In-App Prompt notice:', err)
      );

      if (googleBtnContainerRef.current) {
        renderGoogleButton(
          googleBtnContainerRef.current,
          (user) => handleGoogleSuccess(user),
          (err) => console.debug('Google Button render error:', err)
        );
      }
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      setIsGoogleLoading(true);
      triggerHaptic('click');

      const googleUser = await triggerGoogleSignIn();
      handleGoogleSuccess(googleUser);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setIsGoogleLoading(false);
      setErrorMessage(err?.message || (lang === 'hi' ? 'Google साइन-इन रद्द किया गया' : 'Google sign-in was canceled'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'signup') {
      const result = signUp(name, email, password, selectedAvatar);
      if (result.success) {
        playSound('success');
        triggerHaptic('success');
        setSuccessMessage(result.message || 'Account created!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMessage('');
          setName('');
          setEmail('');
          setPassword('');
        }, 1200);
      } else {
        playSound('error');
        triggerHaptic('error');
        setErrorMessage(result.message || 'Failed to sign up');
      }
    } else {
      const result = signIn(email, password);
      if (result.success) {
        playSound('success');
        triggerHaptic('success');
        setSuccessMessage(result.message || 'Welcome back!');
        setTimeout(() => {
          setIsAuthModalOpen(false);
          setSuccessMessage('');
          setEmail('');
          setPassword('');
        }, 1200);
      } else {
        playSound('error');
        triggerHaptic('error');
        setErrorMessage(result.message || 'Failed to sign in');
      }
    }
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white dark:bg-[#151B28] rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border-2 border-gray-100 dark:border-gray-800 text-left relative overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-none"
        >
          {/* Close button */}
          <button
            onClick={() => {
              triggerHaptic('click');
              setIsAuthModalOpen(false);
            }}
            className="absolute top-4 right-4 p-2 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Mascot Branding */}
          <div className="text-center pt-1 mb-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] p-1.5 shadow-lg border-b-[5px] border-[#D93848] flex items-center justify-center mb-2">
              {selectedAvatar === '🦉' ? (
                <GkooBirdAvatar size="md" mood={successMessage ? 'celebrate' : errorMessage ? 'sad' : mode === 'signup' ? 'excited' : 'happy'} />
              ) : (
                <span className="text-4xl">{selectedAvatar}</span>
              )}
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {mode === 'signup' ? t('welcomeNewUser') : t('welcomeBack')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 leading-snug">
              {mode === 'signup' ? t('authSubtitleSignup') : t('authSubtitleLogin')}
            </p>
          </div>

          {/* Real Google 1-Tap Sign-In Button */}
          <div className="mb-3.5 flex flex-col items-center w-full">
            <div ref={googleBtnContainerRef} className="w-full flex justify-center mb-1 empty:hidden" />

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 font-black text-xs flex items-center justify-center space-x-2.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? (lang === 'hi' ? 'Google से कनेक्ट हो रहा है...' : 'Connecting to Google...') : (lang === 'hi' ? 'Google के साथ 1-Tap साइन इन' : '1-Tap Google Sign In')}</span>
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3 w-full">
              <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
              <span className="bg-white dark:bg-[#151B28] px-2.5 text-[10px] font-black uppercase text-gray-400">
                {lang === 'hi' ? 'या ईमेल से' : 'OR WITH EMAIL'}
              </span>
              <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl mb-3 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1 ${
                mode === 'signup'
                  ? 'bg-[#FF5F6D] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('signUp')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                setMode('signin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1 ${
                mode === 'signin'
                  ? 'bg-[#FF5F6D] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <span>{t('signIn')}</span>
            </button>
          </div>

          {/* Error & Success Feedback Alerts */}
          {errorMessage && (
            <div className="mb-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800 flex items-center space-x-2 text-rose-600 dark:text-rose-300 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-emerald-600 dark:text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1">
                    {t('fullName')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('namePlaceholder')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5F6D] transition-colors"
                    />
                  </div>
                </div>

                {/* Avatar Picker for Sign Up */}
                <div>
                  <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1">
                    {t('chooseAvatar')}
                  </label>
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => {
                          triggerHaptic('click');
                          setSelectedAvatar(avatar);
                        }}
                        className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-lg border-2 transition-transform active:scale-90 ${
                          selectedAvatar === avatar
                            ? 'border-[#FF5F6D] bg-rose-50 dark:bg-rose-950/40 shadow-sm scale-105'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        {avatar === '🦉' ? '🦜' : avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5F6D] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black uppercase text-gray-500 dark:text-gray-400 mb-1 ml-1">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-[#FF5F6D] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.95, y: 2 }}
              type="submit"
              className="w-full mt-2 bg-[#FF5F6D] hover:bg-[#E64553] text-white font-black py-3 rounded-2xl shadow-[0_4px_0_0_#D93848] active:shadow-none transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
            >
              <span>{mode === 'signup' ? t('signUp') : t('signIn')}</span>
            </motion.button>
          </form>

          {/* Continue as Guest option */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click');
                setIsAuthModalOpen(false);
              }}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white font-bold"
            >
              {t('continueAsGuest')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
