import { Capacitor } from '@capacitor/core';

/**
 * Returns true only when running inside the native Android Capacitor shell
 * (i.e. Google Play Store app build).
 * Returns false on Vercel web, PWA on desktop, Microsoft Store, etc.
 */
export const isAndroidApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  } catch {
    return false;
  }
};

/**
 * Returns true if running in a standard web browser, desktop, or Microsoft Store wrapper.
 */
export const isWebOrDesktop = (): boolean => {
  return !isAndroidApp();
};

export const PLAY_STORE_APP_URL = 'https://play.google.com/store/apps/details?id=com.gkoo.app';
export const PLAY_STORE_MARKET_URI = 'market://details?id=com.gkoo.app';
