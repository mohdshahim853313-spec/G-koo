import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Heart, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../useAppContext';
import { Mascot } from './Mascot';
import { triggerHaptic, playSound } from '../lib/audio';
import { isAndroidApp } from '../utils/platform';

interface AdMobRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export const AdMobRewardModal: React.FC<AdMobRewardModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
}) => {
  const { lang, hapticsEnabled, soundEnabled } = useAppContext();
  const [adState, setAdState] = useState<'prompt' | 'watching' | 'rewarded'>('prompt');
  const [secondsRemaining, setSecondsRemaining] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setAdState('prompt');
      setSecondsRemaining(10);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (adState === 'watching') {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            setAdState('rewarded');
            triggerHaptic('success', hapticsEnabled);
            playSound('success', soundEnabled);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [adState, hapticsEnabled, soundEnabled]);

  if (!isOpen || !isAndroidApp()) return null;

  const handleStartWatchAd = () => {
    triggerHaptic('click', hapticsEnabled);
    setAdState('watching');
    setSecondsRemaining(10);
  };

  const handleClaimReward = () => {
    triggerHaptic('success', hapticsEnabled);
    onRewardGranted();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="bg-white dark:bg-[#1A1A24] border-2 border-emerald-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Close button (Only in prompt or rewarded state) */}
          {adState !== 'watching' && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* STATE 1: PROMPT TO WATCH */}
          {adState === 'prompt' && (
            <div>
              <div className="flex flex-col items-center mb-3">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700/60 flex items-center justify-center text-rose-500 shadow-inner mb-2">
                  <Heart className="w-8 h-8 fill-rose-500 animate-pulse" />
                </div>
                <Mascot size="sm" mood="sad" />
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                {lang === 'hi' ? 'हार्ट्स खत्म हो गए? ❤️' : 'Out of Hearts? ❤️'}
              </h3>

              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-6 leading-relaxed">
                {lang === 'hi'
                  ? 'एक छोटा सा 10 सेकंड का वीडियो देखें और तुरंत 5 पूरे हार्ट्स (जिंदगियां) मुफ्त में पाएँ!'
                  : 'Watch a short 10-second video sponsor ad and immediately refill all 5 Hearts for free!'}
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={handleStartWatchAd}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-[0_4px_0_0_#065F46] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {lang === 'hi' ? '🎬 वीडियो देखें (5 हार्ट्स रिफिल)' : '🎬 Watch Video (Refill 5 Hearts)'}
                  </span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-2xl text-gray-500 dark:text-gray-400 font-bold text-xs"
                >
                  {lang === 'hi' ? 'रद्द करें (Cancel)' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: WATCHING VIDEO AD */}
          {adState === 'watching' && (
            <div className="py-4">
              <div className="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                {/* Countdown ring */}
                <div className="w-20 h-20 rounded-full border-4 border-emerald-200 dark:border-emerald-950 border-t-emerald-500 animate-spin absolute" />
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {secondsRemaining}s
                </span>
              </div>

              <Mascot size="sm" mood="happy" />

              <h4 className="text-base font-black text-gray-900 dark:text-white mt-3 mb-1">
                {lang === 'hi' ? 'वीडियो प्रायोजक चल रहा है...' : 'Reward Video Playing...'}
              </h4>

              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {lang === 'hi'
                  ? 'कृपया पूरा वीडियो देखें ताकि आपके हार्ट्स रिफिल हो सकें।'
                  : 'Please wait until the timer finishes to claim your 5 hearts.'}
              </p>
            </div>
          )}

          {/* STATE 3: REWARD GRANTED */}
          {adState === 'rewarded' && (
            <div>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="flex justify-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((h) => (
                  <Heart key={h} className="w-6 h-6 fill-rose-500 text-rose-500 animate-bounce" />
                ))}
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                {lang === 'hi' ? '5 हार्ट्स मिल गए! 🎉' : '5 Hearts Refilled! 🎉'}
              </h3>

              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-6">
                {lang === 'hi'
                  ? 'बधाई हो! आपके सभी 5 हार्ट्स रिफिल हो चुके हैं। खेलना जारी रखें!'
                  : 'Congratulations! All 5 hearts are refilled. You can continue playing!'}
              </p>

              <button
                onClick={handleClaimReward}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-[0_4px_0_0_#991B1B] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'hi' ? 'खेल जारी रखें (Continue)' : 'Continue Quiz'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
