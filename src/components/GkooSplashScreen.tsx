import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';
import { isAndroidApp } from '../utils/platform';

interface GkooSplashScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const GkooSplashScreen: React.FC<GkooSplashScreenProps> = ({
  onFinish,
  minDuration = isAndroidApp() ? 200 : 150,
}) => {
  // Prevent splash screen from flashing repeatedly across route changes or re-renders
  const [isVisible, setIsVisible] = useState(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('gkoo_splash_shown')) {
        return false;
      }
    } catch {
      // ignore
    }
    return true;
  });

  useEffect(() => {
    // Hide native Android splash smoothly
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(() => {});
    }

    if (!isVisible) {
      if (onFinish) onFinish();
      return;
    }

    try {
      sessionStorage.setItem('gkoo_splash_shown', 'true');
    } catch {}

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        onFinish();
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F121E] select-none overflow-hidden"
        >
          {/* Dead-Center Mascot & Brand (Matches native Android splash centering exactly) */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 mb-4">
              <img
                src="/gkoo-logo.svg"
                alt="Gkoo Mascot"
                className="w-full h-full object-contain drop-shadow-[0_12px_28px_rgba(255,95,109,0.35)]"
              />
            </div>

            {/* App Brand Name */}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#FF5F6D] drop-shadow-sm">
              Gkoo
            </h1>

            {/* Tagline / Subtitle */}
            <p className="mt-2 text-sm sm:text-base font-bold text-gray-400 tracking-wide">
              Gamified Learning <span className="text-[#FF5F6D] mx-1">•</span> Exam Prep
            </p>
          </div>

          {/* Absolute Bottom Indicator - Positioned absolutely so it NEVER pushes or shakes the mascot */}
          <div 
            className="absolute left-0 right-0 flex justify-center pointer-events-none"
            style={{
              bottom: 'max(env(safe-area-inset-bottom, 0px), 36px)',
            }}
          >
            <div className="w-28 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: Math.max(0.1, (minDuration - 40) / 1000),
                  ease: 'easeInOut',
                }}
                className="h-full bg-gradient-to-r from-[#FF5F6D] to-[#FF7B7B] rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
