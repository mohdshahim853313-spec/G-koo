import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SplashScreen } from '@capacitor/splash-screen';
import { isAndroidApp } from '../utils/platform';

interface GkooSplashScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const GkooSplashScreen: React.FC<GkooSplashScreenProps> = ({
  onFinish,
  minDuration = isAndroidApp() ? 250 : 150,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide native Android splash immediately once React mounts to prevent double overlays
    SplashScreen.hide().catch(() => {
      // Ignored if running on web
    });

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        onFinish();
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-between py-12 px-6 bg-[#0B0E17] select-none overflow-hidden"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 36px)',
          }}
        >
          {/* Top spacer */}
          <div className="w-full" />

          {/* Center Mascot & Brand Section (Exact same square logo as initial splash) */}
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6">
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

          {/* Bottom Loading Indicator */}
          <div className="flex flex-col items-center space-y-3 z-10 w-full max-w-xs">
            <div className="w-32 h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: Math.max(0.1, (minDuration - 50) / 1000),
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
