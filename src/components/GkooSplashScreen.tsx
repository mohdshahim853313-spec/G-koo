import React, { useEffect, useState } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

interface GkooSplashScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const GkooSplashScreen: React.FC<GkooSplashScreenProps> = ({
  onFinish,
  minDuration = 1800,
}) => {
  const [shouldRender, setShouldRender] = useState(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem('gkoo_splash_shown')) {
        return false;
      }
    } catch {
      // ignore
    }
    return true;
  });

  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Hide native 1st splash screen seamlessly once webview is ready
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide({ fadeOutDuration: 150 }).catch(() => {});
    }

    if (!shouldRender) {
      if (onFinish) onFinish();
      return;
    }

    try {
      sessionStorage.setItem('gkoo_splash_shown', 'true');
    } catch {}

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(minDuration - 350, 1200));

    const finishTimer = setTimeout(() => {
      setShouldRender(false);
      if (onFinish) onFinish();
    }, minDuration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [minDuration, onFinish, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#FF5F6D',
        willChange: 'opacity, transform',
        transform: isFadingOut ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 350ms cubic-bezier(0.25, 1, 0.5, 1), transform 350ms cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <style>{`
        /* Mascot playful hop - starts at 1:1 position to match 1st native splash perfectly without jumping */
        @keyframes gkooBirdHop {
          0% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
          18% {
            transform: translate3d(0, 3px, 0) scale3d(1.05, 0.95, 1);
          }
          42% {
            transform: translate3d(0, -14px, 0) scale3d(0.96, 1.06, 1);
          }
          62% {
            transform: translate3d(0, 2px, 0) scale3d(1.03, 0.97, 1);
          }
          78% {
            transform: translate3d(0, -2px, 0) scale3d(0.99, 1.01, 1);
          }
          90%, 100% {
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
        }

        /* Subtle smooth text reveal/breathing */
        @keyframes gkooTextPulse {
          0% {
            opacity: 0.95;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
          50% {
            opacity: 1;
            transform: translate3d(0, -1px, 0) scale3d(1.02, 1.02, 1);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
        }

        /* Smooth loading progress bar */
        @keyframes gkooProgressFill {
          0% {
            transform: scaleX(0.04);
            opacity: 0.7;
          }
          30% {
            transform: scaleX(0.35);
            opacity: 1;
          }
          70% {
            transform: scaleX(0.82);
            opacity: 1;
          }
          95%, 100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        .gkoo-bird-animated {
          animation: gkooBirdHop 1.5s cubic-bezier(0.25, 1, 0.4, 1) 120ms both;
          will-change: transform;
          backface-visibility: hidden;
        }

        .gkoo-text-animated {
          animation: gkooTextPulse 1.4s ease-out 100ms both;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .gkoo-progress-animated {
          animation: gkooProgressFill 1.5s cubic-bezier(0.22, 1, 0.36, 1) 150ms both;
          transform-origin: left center;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>

      {/* Subtle radial ambient glow for depth */}
      <div
        className="absolute w-[360px] h-[360px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Mascot Bird with playful animated hop */}
        <div className="gkoo-bird-animated relative w-[180px] h-[175px] sm:w-[210px] sm:h-[204px] mb-2 flex items-center justify-center">
          <img
            src="/splash_mascot.png"
            alt="G-koo Mascot"
            className="w-full h-full object-contain select-none pointer-events-none"
          />
        </div>

        {/* Brand Name "G-koo" */}
        <div className="gkoo-text-animated h-[42px] sm:h-[46px] mb-6 flex items-center justify-center">
          <img
            src="/splash_text.png"
            alt="G-koo"
            className="h-full w-auto object-contain select-none pointer-events-none"
          />
        </div>

        {/* Sleek rounded loading progress bar */}
        <div className="w-36 sm:w-44 h-1.5 bg-black/15 rounded-full overflow-hidden p-[1px] shadow-inner">
          <div className="gkoo-progress-animated h-full w-full bg-white rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
};
