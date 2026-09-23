import React from 'react';
import { Star, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../useAppContext';
import { Mascot } from './Mascot';
import { triggerHaptic } from '../lib/audio';
import { isAndroidApp, PLAY_STORE_APP_URL, PLAY_STORE_MARKET_URI } from '../utils/platform';

interface RateAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RateAppModal: React.FC<RateAppModalProps> = ({ isOpen, onClose }) => {
  const { lang, hapticsEnabled } = useAppContext();

  // If not running inside the native Android App, never show this modal!
  if (!isOpen || !isAndroidApp()) return null;

  const handleRateNow = () => {
    triggerHaptic('success', hapticsEnabled);
    try {
      localStorage.setItem('gkoo_has_rated_app', 'true');
    } catch {
      // ignore
    }

    // Try to open Play Store market app URL first, fallback to browser URL
    try {
      window.location.href = PLAY_STORE_MARKET_URI;
    } catch {
      window.open(PLAY_STORE_APP_URL, '_blank');
    }

    onClose();
  };

  const handleMaybeLater = () => {
    triggerHaptic('click', hapticsEnabled);
    try {
      // Prompt again after 7 days
      localStorage.setItem('gkoo_last_rate_prompt', Date.now().toString());
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 15 }}
          className="bg-white dark:bg-[#1A1A24] border-2 border-amber-400/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleMaybeLater}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Mascot Header */}
          <div className="flex flex-col items-center mb-2">
            <div className="my-1">
              <Mascot size="md" mood="happy" />
            </div>

            {/* 5 Big Gold Stars */}
            <div className="flex space-x-1.5 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <motion.div
                  key={s}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ delay: s * 0.1, duration: 0.4 }}
                >
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-md" />
                </motion.div>
              ))}
            </div>
          </div>

          <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
            {lang === 'hi' ? 'क्या आपको Gkoo पसंद आया? 💖' : 'Enjoying Gkoo? 💖'}
          </h3>

          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-6 leading-relaxed px-2">
            {lang === 'hi'
              ? 'कृपया गूगल प्ले स्टोर पर हमें 5 स्टार रेटिंग दें! आपका एक छोटा सा रिव्यू हमें और भी शानदार क्विज़ बनाने में मदद करेगा।'
              : 'Please give us a 5-star review on Google Play Store! Your support helps us create more awesome quizzes.'}
          </p>

          <div className="space-y-2.5">
            {/* Rate on Play Store Button */}
            <button
              onClick={handleRateNow}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-[0_4px_0_0_#C2410C] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {lang === 'hi' ? '⭐ 5 स्टार रेटिंग दें (Play Store)' : '⭐ Rate 5 Stars on Play Store'}
              </span>
            </button>

            {/* Maybe Later Button */}
            <button
              onClick={handleMaybeLater}
              className="w-full py-2.5 px-4 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-xs transition-colors"
            >
              {lang === 'hi' ? 'बाद में (Maybe Later)' : 'Maybe Later'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
