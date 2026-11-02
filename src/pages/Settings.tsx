import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Globe, Sun, Moon, Monitor, AlertTriangle, Vibrate, Bell, BellRing, Music, Play, Sparkles, Timer, ShieldCheck, FileText, Info, Mail, ChevronRight, ChevronLeft, Check, Edit2, RefreshCw } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic, previewCustomSound, type SuccessSoundPreset, type ErrorSoundPreset } from '../lib/audio';
import { GkooCompanionCard } from '../components/GkooCompanionCard';
import { triggerSmartAutoSync } from '../lib/sheetSync';
import { motion } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const {
    lang,
    setLang,
    theme,
    setTheme,
    t,
    soundEnabled,
    setSoundEnabled,
    hapticsEnabled,
    setHapticsEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    triggerTestNotification,
    resetAllProgress,
    currentUser,
    profile,
    examTimerEnabled,
    setExamTimerEnabled,
    examTimerSeconds,
    setExamTimerSeconds,
  } = useAppContext();

  // Sound Effects State (Default: Gentle Harp for correct, Gentle Chime for error)
  const [successPreset, setSuccessPreset] = useState<SuccessSoundPreset>(() => {
    const saved = localStorage.getItem('gkoo_sound_success_preset');
    return (saved && saved !== 'custom' ? saved : 'harp') as SuccessSoundPreset;
  });
  const [errorPreset, setErrorPreset] = useState<ErrorSoundPreset>(() => {
    const saved = localStorage.getItem('gkoo_sound_error_preset');
    return (saved && saved !== 'custom' ? saved : 'chime_down') as ErrorSoundPreset;
  });

  const handleSelectSuccessPreset = (preset: SuccessSoundPreset) => {
    triggerHaptic('click');
    setSuccessPreset(preset);
    localStorage.setItem('gkoo_sound_success_preset', preset);
    previewCustomSound('success', preset);
  };

  const handleSelectErrorPreset = (preset: ErrorSoundPreset) => {
    triggerHaptic('click');
    setErrorPreset(preset);
    localStorage.setItem('gkoo_sound_error_preset', preset);
    previewCustomSound('error', preset);
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefreshGkoo = async () => {
    if (isRefreshing) return;
    triggerHaptic('click');
    setIsRefreshing(true);
    try {
      await triggerSmartAutoSync(true);
      setRefreshSuccess(true);
      triggerHaptic('success');
      setTimeout(() => setRefreshSuccess(false), 2500);
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm(t('resetConfirm'))) {
      resetAllProgress();
      alert("Progress reset successfully!");
    }
  };



  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-[#0F121E] px-4 pt-[calc(max(env(safe-area-inset-top,0px),28px)+24px)] md:pt-10 text-gray-900 dark:text-white pb-28 font-sans transition-colors duration-300 select-none">
      <div className="max-w-md md:max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-4 mt-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              triggerHaptic('click');
              navigate(-1);
            }}
            className="p-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
          <h1 className="text-2xl font-black">{t('settings')}</h1>
        </div>

        {/* G-koo Audio Lab Companion Card */}
        <GkooCompanionCard panel="settings" defaultMood="dance" className="mb-4" />

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">
          {lang === 'hi' ? 'छात्र प्रोफ़ाइल (Student Profile)' : 'Student Profile'}
        </h2>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-xl border border-rose-100 dark:border-rose-900 shrink-0">
              {profile?.avatar || currentUser?.avatar || '🦉'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                {profile?.name || currentUser?.name || 'G-koo Learner'}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold leading-tight flex items-center space-x-1">
                <Check className="w-3 h-3 inline text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                <span>{lang === 'hi' ? 'सारा स्कोर व प्रोग्रेस सुरक्षित है' : 'All progress saved locally'}</span>
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('click');
              navigate('/profile');
            }}
            className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-black text-xs shrink-0 whitespace-nowrap transition-colors flex items-center space-x-1.5"
          >
            <span>{lang === 'hi' ? 'बदलें' : 'Edit'}</span>
            <Edit2 className="w-3 h-3 inline" />
          </motion.button>
        </div>
      </div>


      {/* Language */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">{t('language')}</h2>
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('click');
              setLang('en');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              lang === 'en'
                ? 'bg-white dark:bg-gray-800 text-[#FF5F6D] shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>English</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('click');
              setLang('hi');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-black transition-all ${
              lang === 'hi'
                ? 'bg-white dark:bg-gray-800 text-[#FF5F6D] shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>हिंदी (Hindi)</span>
          </motion.button>
        </div>
      </div>

      {/* Appearance / Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">{t('appearance')}</h2>
        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('click');
              setTheme('light');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              theme === 'light'
                ? 'bg-white dark:bg-gray-800 text-blue-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>{t('light')}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('click');
              setTheme('dark');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              theme === 'dark'
                ? 'bg-white dark:bg-gray-800 text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>{t('dark')}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('click');
              setTheme('system');
            }}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-xl text-xs font-black transition-all ${
              theme === 'system'
                ? 'bg-white dark:bg-gray-800 text-amber-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>{t('system')}</span>
          </motion.button>
        </div>
      </div>

      {/* Preferences (Sound & Haptics) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">{t('preferences')}</h2>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800 dark:text-gray-100">{t('soundFx')}</p>
              <p className="text-[10px] text-gray-400">{t('soundFxDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${
              soundEnabled ? 'bg-[#FF5F6D]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800 dark:text-gray-100">{t('haptics')}</p>
              <p className="text-[10px] text-gray-400">{t('hapticsDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
            className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${
              hapticsEnabled ? 'bg-[#FF5F6D]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                hapticsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Exam Timer Mode Settings Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800 dark:text-gray-100">{t('examTimer')}</p>
              <p className="text-[10px] text-gray-400">{t('examTimerDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('click');
              setExamTimerEnabled(!examTimerEnabled);
            }}
            className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 ${
              examTimerEnabled ? 'bg-[#FF5F6D]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                examTimerEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {examTimerEnabled && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
              {lang === 'hi' ? 'प्रति प्रश्न समय (सेकंड)' : 'Time Per Question (Seconds)'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([15, 20, 30, 45] as const).map((secs) => (
                <button
                  key={secs}
                  onClick={() => {
                    triggerHaptic('click');
                    setExamTimerSeconds(secs);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all ${
                    examTimerSeconds === secs
                      ? 'bg-[#FF5F6D] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-800'
                  }`}
                >
                  {secs}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sound Effects Customizer (Presets & Device Uploads) */}
      {soundEnabled && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Music className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-wider">
              {lang === 'hi' ? 'ध्वनि प्रभाव कस्टमाइज़ करें' : 'Custom Sound Effects'}
            </h2>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mb-4">
            {lang === 'hi'
              ? 'सही और गलत उत्तर के लिए अपनी पसंदीदा ध्वनि चुनें।'
              : 'Choose your preferred sound effects for correct and wrong answers.'}
          </p>

          {/* Correct Answer Sound Section */}
          <div className="mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'सही उत्तर की ध्वनि (Correct)' : 'Correct Answer Sound'}</span>
              </span>
              <button
                onClick={() => {
                  triggerHaptic('click');
                  previewCustomSound('success', successPreset);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{lang === 'hi' ? 'सुनें (Play)' : 'Preview'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'harp', label: lang === 'hi' ? 'सौम्य वीणा' : 'Gentle Harp' },
                { id: 'ding', label: lang === 'hi' ? 'ब्राइट डिंग' : 'Bright Ding' },
                { id: 'bell', label: lang === 'hi' ? 'क्रिस्टल बेल' : 'Crystal Bell' },
                { id: 'arcade', label: lang === 'hi' ? 'आर्केड 8-बिट' : '8-Bit Arcade' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSuccessPreset(item.id as SuccessSoundPreset)}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    successPreset === item.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wrong Answer Sound Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'गलत उत्तर की ध्वनि (Wrong)' : 'Wrong Answer Sound'}</span>
              </span>
              <button
                onClick={() => {
                  triggerHaptic('click');
                  previewCustomSound('error', errorPreset);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-black border border-rose-200 dark:border-rose-800 flex items-center space-x-1 active:scale-95 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{lang === 'hi' ? 'सुनें (Play)' : 'Preview'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'chime_down', label: lang === 'hi' ? 'चाइम डाउन' : 'Gentle Chime' },
                { id: 'thump', label: lang === 'hi' ? 'मधुर थंप' : 'Warm Thump' },
                { id: 'wood', label: lang === 'hi' ? 'वुड ब्लॉक' : 'Wood Block Knock' },
                { id: 'buzzer', label: lang === 'hi' ? 'धीमा बज़र' : 'Soft Buzzer' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectErrorPreset(item.id as ErrorSoundPreset)}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    errorPreset === item.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications & Daily Reminders Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-gray-800 dark:text-gray-100">{t('notificationsTitle')}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{t('notificationsDesc')}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('click');
              setNotificationsEnabled(!notificationsEnabled);
            }}
            className={`w-12 h-6 rounded-full p-1 flex items-center transition-colors duration-300 shrink-0 ${
              notificationsEnabled ? 'bg-[#FF5F6D]' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {notificationsEnabled && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={async () => {
                triggerHaptic('click');
                const sent = await triggerTestNotification();
                if (sent) {
                  alert(t('testNotificationSuccess'));
                } else {
                  alert(t('testNotificationDenied'));
                }
              }}
              className="w-full py-2 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{t('testNotification')}</span>
            </motion.button>
          </div>
        )}
      </div>


      {/* Single Clean "Refresh G-koo" Button */}
      <div className="mb-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleRefreshGkoo}
          disabled={isRefreshing}
          className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            refreshSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>
            {refreshSuccess
              ? (lang === 'hi' ? 'G-koo रिफ्रेश हो गया! ⚡' : 'G-koo Refreshed! ⚡')
              : isRefreshing
              ? (lang === 'hi' ? 'रिफ्रेश हो रहा है...' : 'Refreshing G-koo...')
              : (lang === 'hi' ? 'रिफ्रेश G-koo' : 'Refresh G-koo')}
          </span>
        </motion.button>
      </div>


      {/* PWA App Install Action */}
      

      {/* Legal & About Us Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">
          {lang === 'hi' ? 'कानूनी जानकारी एवं सहायता (Legal & Info)' : 'Legal & Information'}
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
          <button
            onClick={() => {
              triggerHaptic('click');
              navigate('/privacy');
            }}
            className="w-full py-2.5 flex items-center justify-between text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('click');
              navigate('/terms');
            }}
            className="w-full py-2.5 flex items-center justify-between text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {lang === 'hi' ? 'सेवा की शर्तें (Terms of Service)' : 'Terms of Service'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('click');
              navigate('/about');
            }}
            className="w-full py-2.5 flex items-center justify-between text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Info className="w-4 h-4 text-[#FF5F6D]" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {lang === 'hi' ? 'Gkoo के बारे में (About Us)' : 'About Gkoo'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('click');
              navigate('/contact');
            }}
            className="w-full py-2.5 flex items-center justify-between text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {lang === 'hi' ? 'संपर्क एवं सहायता (Contact & Support)' : 'Contact & Support'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 mb-1">
          <AlertTriangle className="w-4 h-4" />
          <h2 className="text-xs font-black uppercase tracking-wider">{t('dangerZone')}</h2>
        </div>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-3">
          Reset all locally saved XP, streaks, and quiz metrics.
        </p>
        <button
          onClick={handleReset}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-2.5 rounded-xl text-xs shadow-sm active:scale-98 transition-all"
        >
          {t('resetProgress')}
        </button>
      </div>
      </div>
    </div>
  );
}
