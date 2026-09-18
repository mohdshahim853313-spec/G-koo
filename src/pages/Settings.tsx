import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Globe, Sun, Moon, Monitor, Key, Smartphone, AlertTriangle, Check, Vibrate, LogIn, Bell, BellRing, Music, Play, Upload, Sparkles, Timer, ShieldCheck, FileText, Info, Mail, ChevronRight } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic, previewCustomSound, type SuccessSoundPreset, type ErrorSoundPreset } from '../lib/audio';
import { GkooCompanionCard } from '../components/GkooCompanionCard';
import { getGeminiKeyPoolInfo } from '../lib/gemini';
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
    geminiApiKey,
    setGeminiApiKey,
    resetAllProgress,
    isGuest,
    currentUser,
    setIsAuthModalOpen,
    signOut,
    examTimerEnabled,
    setExamTimerEnabled,
    examTimerSeconds,
    setExamTimerSeconds,
  } = useAppContext();

  // Custom Sound Effects State (Default: Gentle Harp for correct, Gentle Chime Down for error)
  const [successPreset, setSuccessPreset] = useState<SuccessSoundPreset>(() => {
    return (localStorage.getItem('gkoo_sound_success_preset') as SuccessSoundPreset) || 'harp';
  });
  const [errorPreset, setErrorPreset] = useState<ErrorSoundPreset>(() => {
    return (localStorage.getItem('gkoo_sound_error_preset') as ErrorSoundPreset) || 'chime_down';
  });
  const [hasCustomSuccess, setHasCustomSuccess] = useState<boolean>(() => {
    return !!localStorage.getItem('gkoo_sound_success_custom');
  });
  const [hasCustomError, setHasCustomError] = useState<boolean>(() => {
    return !!localStorage.getItem('gkoo_sound_error_custom');
  });

  const successFileRef = useRef<HTMLInputElement>(null);
  const errorFileRef = useRef<HTMLInputElement>(null);

  const handleSelectSuccessPreset = (preset: SuccessSoundPreset) => {
    triggerHaptic('click');
    setSuccessPreset(preset);
    localStorage.setItem('gkoo_sound_success_preset', preset);
    const customData = localStorage.getItem('gkoo_sound_success_custom') || undefined;
    previewCustomSound('success', preset, customData);
  };

  const handleSelectErrorPreset = (preset: ErrorSoundPreset) => {
    triggerHaptic('click');
    setErrorPreset(preset);
    localStorage.setItem('gkoo_sound_error_preset', preset);
    const customData = localStorage.getItem('gkoo_sound_error_custom') || undefined;
    previewCustomSound('error', preset, customData);
  };

  const handleSuccessUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem('gkoo_sound_success_custom', dataUrl);
        localStorage.setItem('gkoo_sound_success_preset', 'custom');
        setHasCustomSuccess(true);
        setSuccessPreset('custom');
        previewCustomSound('success', 'custom', dataUrl);
      } catch (err) {
        alert("Audio file too large. Please select a shorter sound clip.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleErrorUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem('gkoo_sound_error_custom', dataUrl);
        localStorage.setItem('gkoo_sound_error_preset', 'custom');
        setHasCustomError(true);
        setErrorPreset('custom');
        previewCustomSound('error', 'custom', dataUrl);
      } catch (err) {
        alert("Audio file too large. Please select a shorter sound clip.");
      }
    };
    reader.readAsDataURL(file);
  };

  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [showKeySuccess, setShowKeySuccess] = useState(false);

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput.trim());
    setShowKeySuccess(true);
    setTimeout(() => setShowKeySuccess(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm(t('resetConfirm'))) {
      resetAllProgress();
      alert("Progress reset successfully!");
    }
  };

  const handleInstallApp = () => {
    alert(
      "To install G-koo as an App:\n\n• On Chrome/Android: Tap browser menu (⋮) -> 'Install App'\n• On Safari/iOS: Tap the Share button (⎋) -> 'Add to Home Screen'\n• On PC/Mac: Click the Install icon in the Chrome address bar"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] px-4 pt-[max(env(safe-area-inset-top,0px),30px)] md:pt-8 text-gray-900 dark:text-white pb-28 font-sans transition-colors duration-300 select-none">
      <div className="max-w-md md:max-w-4xl mx-auto">
        <h1 className="text-2xl font-black mb-4 mt-1">{t('settings')}</h1>

        {/* G-koo Audio Lab Companion Card */}
        <GkooCompanionCard panel="settings" defaultMood="dance" className="mb-4" />

      {/* Account Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">
          {t('profile')} & Sync
        </h2>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-xl border border-rose-100 dark:border-rose-900 shrink-0">
              {currentUser?.avatar || '🦜'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                {currentUser?.name || t('guestAccount')}
              </p>
              <p className="text-[10px] text-gray-400 line-clamp-2 leading-tight">
                {isGuest ? t('guestNote') : currentUser?.email}
              </p>
            </div>
          </div>
          {isGuest ? (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                triggerHaptic('click');
                setIsAuthModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FF5F6D] text-white font-black text-xs shadow-md flex items-center space-x-1.5 shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{t('signIn')}</span>
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                triggerHaptic('click');
                signOut();
              }}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-500 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 whitespace-nowrap"
            >
              <span className="whitespace-nowrap">{t('signOut')}</span>
            </motion.button>
          )}
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
              ? 'सही और गलत उत्तर के लिए पसंदीदा ध्वनि चुनें या अपने डिवाइस से कोई भी ऑडियो फाइल अपलोड करें।'
              : 'Choose presets or upload audio files from your device for correct and wrong answers.'}
          </p>

          {/* Correct Answer Sound Section */}
          <div className="mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '🟢 सही उत्तर की ध्वनि (Correct)' : '🟢 Correct Answer Sound'}</span>
              </span>
              <button
                onClick={() => {
                  triggerHaptic('click');
                  const customData = localStorage.getItem('gkoo_sound_success_custom') || undefined;
                  previewCustomSound('success', successPreset, customData);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1 active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{lang === 'hi' ? 'सुनें (Play)' : 'Preview'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {[
                { id: 'harp', label: lang === 'hi' ? '🪕 सौम्य वीणा (Default)' : '🪕 Gentle Harp (Default)' },
                { id: 'ding', label: lang === 'hi' ? '🎵 ब्राइट डिंग' : '🎵 Bright Ding' },
                { id: 'bell', label: lang === 'hi' ? '💎 क्रिस्टल बेल' : '💎 Crystal Bell' },
                { id: 'arcade', label: lang === 'hi' ? '👾 आर्केड 8-बिट' : '👾 8-Bit Arcade' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSuccessPreset(item.id as SuccessSoundPreset)}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all border ${
                    successPreset === item.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom Success File Input */}
            <input
              type="file"
              ref={successFileRef}
              accept="audio/*"
              className="hidden"
              onChange={handleSuccessUpload}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  triggerHaptic('click');
                  successFileRef.current?.click();
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
                  successPreset === 'custom'
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-400'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {hasCustomSuccess
                    ? (lang === 'hi' ? '📁 कस्टम ध्वनि बदलें (Device Audio)' : '📁 Replace Custom Sound')
                    : (lang === 'hi' ? '📁 डिवाइस से ध्वनि अपलोड करें' : '📁 Upload Sound from Device')}
                </span>
              </button>
              {hasCustomSuccess && (
                <button
                  onClick={() => handleSelectSuccessPreset('custom')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                    successPreset === 'custom'
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {lang === 'hi' ? 'चुना गया' : 'Active'}
                </button>
              )}
            </div>
          </div>

          {/* Wrong Answer Sound Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '🔴 गलत उत्तर की ध्वनि (Wrong)' : '🔴 Wrong Answer Sound'}</span>
              </span>
              <button
                onClick={() => {
                  triggerHaptic('click');
                  const customData = localStorage.getItem('gkoo_sound_error_custom') || undefined;
                  previewCustomSound('error', errorPreset, customData);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-black border border-rose-200 dark:border-rose-800 flex items-center space-x-1 active:scale-95"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{lang === 'hi' ? 'सुनें (Play)' : 'Preview'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {[
                { id: 'chime_down', label: lang === 'hi' ? '🎼 चाइम डाउन (Default)' : '🎼 Gentle Chime Down (Default)' },
                { id: 'thump', label: lang === 'hi' ? '🥁 मधुर थंप' : '🥁 Warm Thump' },
                { id: 'wood', label: lang === 'hi' ? '🪵 वुड ब्लॉक नॉक' : '🪵 Wood Block Knock' },
                { id: 'buzzer', label: lang === 'hi' ? '📢 धीमा बज़र' : '📢 Soft Buzzer' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectErrorPreset(item.id as ErrorSoundPreset)}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all border ${
                    errorPreset === item.id
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Custom Error File Input */}
            <input
              type="file"
              ref={errorFileRef}
              accept="audio/*"
              className="hidden"
              onChange={handleErrorUpload}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  triggerHaptic('click');
                  errorFileRef.current?.click();
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
                  errorPreset === 'custom'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-rose-400'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {hasCustomError
                    ? (lang === 'hi' ? '📁 कस्टम ध्वनि बदलें (Device Audio)' : '📁 Replace Custom Sound')
                    : (lang === 'hi' ? '📁 डिवाइस से ध्वनि अपलोड करें' : '📁 Upload Sound from Device')}
                </span>
              </button>
              {hasCustomError && (
                <button
                  onClick={() => handleSelectErrorPreset('custom')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                    errorPreset === 'custom'
                      ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                  }`}
                >
                  {lang === 'hi' ? 'चुना गया' : 'Active'}
                </button>
              )}
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


      {/* Gemini AI API Key Manager (Multi-Key Pool & Load Balancing) */}
      {(() => {
        const poolInfo = getGeminiKeyPoolInfo(geminiApiKey);
        const inputPoolInfo = getGeminiKeyPoolInfo(apiKeyInput);
        const isMultiKeyInput = inputPoolInfo.count > 1;

        return (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <Key className="w-4 h-4" />
                <h2 className="text-xs font-black uppercase tracking-wider">{t('geminiKeyTitle')}</h2>
              </div>
              {poolInfo.source === 'custom' ? (
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
                  <span>🟢</span>
                  <span>{poolInfo.count > 1 ? `${poolInfo.count} Keys Pool Active` : 'Custom Key Active'}</span>
                </span>
              ) : poolInfo.source === 'env' ? (
                <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800 flex items-center space-x-1">
                  <span>⚡</span>
                  <span>{poolInfo.count > 1 ? `${poolInfo.count} System (.env) Keys Active` : 'System Key (.env) Active'}</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                  Offline Fallback Ready
                </span>
              )}
            </div>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-2.5 leading-relaxed">
              एक या एक से अधिक API Keys कॉमा <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">(,)</span> लगाकर जोड़ें (10+ Keys समर्थित)। अगर एक Key की लिमिट खत्म होगी, तो G-koo अपने-आप अगली Key पर स्विच हो जाएगा:
            </p>

            <div className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSyKey1..., AIzaSyKey2..., AIzaSyKey3... (कॉमा लगाकर 10+ Keys डालें)"
                  className="w-full p-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-mono text-gray-800 dark:text-white focus:outline-none focus:border-purple-500 resize-none transition-colors"
                />
                {apiKeyInput.trim().length > 0 && (
                  <div className="absolute right-2.5 bottom-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isMultiKeyInput 
                        ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {inputPoolInfo.count} {inputPoolInfo.count === 1 ? 'Key' : 'Keys detected'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-2.5 rounded-xl text-xs shadow-sm active:scale-98 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('saveKey')} {inputPoolInfo.count > 1 ? `(${inputPoolInfo.count} Keys Pool)` : ''}</span>
                </button>
                {geminiApiKey && (
                  <button
                    onClick={() => {
                      setApiKeyInput('');
                      setGeminiApiKey('');
                    }}
                    className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              {showKeySuccess && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold text-center mt-1 animate-pulse">
                  ✅ {t('apiKeySaved')} ({poolInfo.count} Keys Pool Ready with Auto-Rotation & Failover)
                </p>
              )}

              {poolInfo.count > 1 && (
                <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/50 rounded-xl p-2 text-[10px] text-purple-700 dark:text-purple-300 font-medium flex items-center justify-between">
                  <span>🔄 <strong>Round-Robin & Auto-Failover:</strong> Requests evenly balanced across {poolInfo.count} keys</span>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* PWA App Install Action */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-[#FF5F6D]">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-gray-800 dark:text-gray-100">Progressive Web App (PWA)</p>
            <p className="text-[10px] text-gray-400">Install to your phone home screen</p>
          </div>
        </div>
        <button
          onClick={handleInstallApp}
          className="bg-rose-50 dark:bg-rose-950/50 text-[#FF5F6D] border border-[#FF5F6D] font-black text-xs px-3 py-1.5 rounded-xl hover:bg-rose-100"
        >
          {t('installNow')}
        </button>
      </div>

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
                {lang === 'hi' ? 'G-koo के बारे में (About Us)' : 'About G-koo'}
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
