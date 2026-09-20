import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { playSound, triggerHaptic } from '../lib/audio';

export function StreakFreezeModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { streak, streakFreezes, buyStreakFreeze, gems, lang } = useAppContext();
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBuy = () => {
    setErrorMsg(null);
    if (gems < 30) {
      triggerHaptic('error');
      setErrorMsg(
        lang === 'hi'
          ? 'पर्याप्त जेम्स (💎) नहीं हैं! कम से कम 30 💎 चाहिए।'
          : 'Not enough Gems! You need at least 30 💎.'
      );
      return;
    }

    const success = buyStreakFreeze();
    if (success) {
      triggerHaptic('success');
      playSound('success');
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
      }, 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-[#1A2234] rounded-3xl border-2 border-sky-400 dark:border-sky-600 shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="text-center mb-5">
              <div className="inline-flex p-3.5 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 rounded-3xl shadow-lg text-4xl mb-2 text-white border-2 border-white dark:border-gray-800">
                ❄️
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {lang === 'hi' ? 'स्ट्रीक शील्ड (Streak Freeze)' : 'Streak Freeze Shield'}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {lang === 'hi'
                  ? 'यदि किसी दिन आप क्विज न खेल पाएं, तो यह शील्ड आपकी स्ट्रीक को टूटने से बचा लेगी!'
                  : 'Protects your streak from resetting to 0 if you miss practicing for a day!'}
              </p>
            </div>

            {/* Current Status Box */}
            <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  ❄️
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">
                    {lang === 'hi' ? 'उपलब्ध शील्ड' : 'Active Shields'}
                  </div>
                  <div className="text-lg font-black text-sky-950 dark:text-sky-200">
                    {streakFreezes} {lang === 'hi' ? 'शील्ड सुरक्षित' : 'Freeze Equipped'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 bg-amber-500/15 dark:bg-amber-400/20 px-3 py-1.5 rounded-xl border border-amber-400/30 text-amber-600 dark:text-amber-400 font-black text-sm">
                <Flame className="w-4 h-4 fill-amber-500" />
                <span>{streak} {lang === 'hi' ? 'दिन' : 'Days'}</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-3 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl text-center border border-rose-200 dark:border-rose-900">
                {errorMsg}
              </div>
            )}

            {/* Success Banner */}
            {purchaseSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-3 text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 p-2.5 rounded-xl text-center border border-emerald-300 dark:border-emerald-800"
              >
                ✓ {lang === 'hi' ? 'स्ट्रीक शील्ड जुड़ गई! (+1 ❄️)' : 'Streak Freeze added! (+1 ❄️)'}
              </motion.div>
            )}

            {/* Buy Action Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBuy}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-base rounded-2xl shadow-[0_4px_0_0_#1E40AF] border-b-2 border-blue-900 flex items-center justify-center space-x-2 mb-2"
            >
              <span>{lang === 'hi' ? 'शील्ड खरीदें (30 💎)' : 'Equip Streak Freeze (30 💎)'}</span>
            </motion.button>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {lang === 'hi' ? 'वापस जाएं' : 'Back'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
