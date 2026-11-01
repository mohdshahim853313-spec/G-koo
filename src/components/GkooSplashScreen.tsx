import React, { useEffect, useState } from 'react';
import { SplashScreen } from '@capacitor/splash-screen';
import { Capacitor } from '@capacitor/core';

interface GkooSplashScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

export const GkooSplashScreen: React.FC<GkooSplashScreenProps> = ({
  onFinish,
  minDuration = 2400,
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
    // Hide native splash screen with smooth fade
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

    // Start graceful fade-out before completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(minDuration - 400, 1000));

    // Fully unmount after fade completes
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
        transition: 'opacity 400ms cubic-bezier(0.25, 1, 0.5, 1), transform 400ms cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      <style>{`
        /* Soft, organic entrance with gentle elasticity - absolutely ZERO abrupt jerk */
        @keyframes gkooBirdEntrance {
          0% {
            opacity: 0;
            transform: translate3d(0, 14px, 0) scale3d(0.72, 0.72, 1);
          }
          32% {
            opacity: 1;
            transform: translate3d(0, -10px, 0) scale3d(1.05, 1.05, 1);
          }
          52% {
            opacity: 1;
            transform: translate3d(0, 3px, 0) scale3d(0.97, 0.97, 1);
          }
          70% {
            opacity: 1;
            transform: translate3d(0, -2px, 0) scale3d(1.015, 1.015, 1);
          }
          85% {
            opacity: 1;
            transform: translate3d(0, 1px, 0) scale3d(0.995, 0.995, 1);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
        }

        /* Gentle fade-in and slide-up for text */
        @keyframes gkooTextEntrance {
          0%, 25% {
            opacity: 0;
            transform: translate3d(0, 8px, 0) scale3d(0.94, 0.94, 1);
          }
          65% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
        }

        /* Smooth loading bar with gentle ease */
        @keyframes gkooBarEntrance {
          0%, 20% {
            opacity: 0;
            transform: scaleX(0);
          }
          35% {
            opacity: 1;
            transform: scaleX(0.15);
          }
          65% {
            opacity: 1;
            transform: scaleX(0.78);
          }
          88%, 100% {
            opacity: 1;
            transform: scaleX(1);
          }
        }

        /* Soft ambient background glow expansion */
        @keyframes gkooGlowEntrance {
          0% {
            opacity: 0;
            transform: scale3d(0.65, 0.65, 1);
          }
          50% {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
          100% {
            opacity: 0.85;
            transform: scale3d(1, 1, 1);
          }
        }

        .gkoo-splash-glow {
          animation: gkooGlowEntrance 1.8s cubic-bezier(0.25, 1, 0.5, 1) both;
          will-change: transform, opacity;
        }

        .gkoo-splash-bird {
          animation: gkooBirdEntrance 2.0s cubic-bezier(0.25, 1, 0.4, 1) both;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .gkoo-splash-text {
          animation: gkooTextEntrance 1.8s cubic-bezier(0.25, 1, 0.4, 1) both;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .gkoo-splash-bar {
          animation: gkooBarEntrance 2.0s cubic-bezier(0.25, 1, 0.4, 1) both;
          transform-origin: left center;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }
      `}</style>

      {/* Lightweight GPU radial ambient glow */}
      <div
        className="gkoo-splash-glow absolute w-[380px] h-[380px] pointer-events-none rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Mascot Bird */}
        <div className="gkoo-splash-bird relative w-[180px] h-[175px] sm:w-[220px] sm:h-[214px] mb-3 flex items-center justify-center">
          <img
            src="/splash_mascot.png"
            alt="G-koo Mascot"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Brand Name "G-koo" */}
        <div className="gkoo-splash-text h-[42px] sm:h-[48px] mb-6 flex items-center justify-center">
          <img
            src="/splash_text.png"
            alt="G-koo"
            className="h-full w-auto object-contain"
          />
        </div>

        {/* Sleek rounded loading progress bar */}
        <div className="w-36 sm:w-44 h-1.5 bg-black/15 rounded-full overflow-hidden p-[1px] shadow-inner">
          <div className="gkoo-splash-bar h-full w-full bg-white rounded-full shadow-sm" />
        </div>
      </div>
    </div>
  );
};
