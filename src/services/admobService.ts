import { Capacitor } from '@capacitor/core';
import { 
  AdMob, 
  BannerAdPosition, 
  BannerAdSize, 
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  type AdMobRewardItem
} from '@capacitor-community/admob';
import { isAndroidApp } from '../utils/platform';

// ============================================================================
// 🎯 ADMOB CONFIGURATION (G-koo Official Real Production IDs)
// ============================================================================
export const ADMOB_CONFIG = {
  // G-koo Production App ID (Also in AndroidManifest.xml)
  appId: 'ca-app-pub-9499419846905359~5077517450',

  // Gkoo Banner ID
  bannerId: 'ca-app-pub-9499419846905359/2164860765',

  // Gkoo Interstitial (Big Full-Screen Ad - 8 Min Cooldown) ID
  interstitialId: 'ca-app-pub-9499419846905359/5554983425',

  // Gkoo Rewarded Video ID (5 Hearts Refill)
  rewardedId: 'ca-app-pub-9499419846905359/2821008871',

  // Real production ads active
  isTesting: false,
};

// ============================================================================
// 🛡️ USER-FRIENDLY AD POLICY (विज्ञापन नियंत्रण नियम)
// ============================================================================
// उपयोगकर्ता के निर्देश:
// 1. होम (Home) पर एक भी विज्ञापन नहीं होना चाहिए।
// 2. बिग ऐड्स (Big Interstitial Ads) कम से कम 8 मिनट के अंतर पर ही आने चाहिए।
// 3. AdMob ऐड्स और कंटेनर केवल APK में ही होने चाहिए, Web पर कभी नहीं।
export const BIG_AD_COOLDOWN_MS = 8 * 60 * 1000; // 8 Minutes (480,000 ms)

let isInitialized = false;
let isBannerVisible = false;
let isInterstitialLoaded = false;
let isRewardedLoaded = false;

/**
 * Initializes AdMob SDK on Android APK only (Never on Web)
 */
export async function initializeAdMob(): Promise<void> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) {
    return;
  }

  if (isInitialized) return;

  try {
    await AdMob.initialize({
      initializeForTesting: ADMOB_CONFIG.isTesting,
    });
    isInitialized = true;
    console.log('[AdMob] Initialized successfully on Android APK');

    // Register listeners for Interstitial (Big Ad)
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
      isInterstitialLoaded = true;
      console.log('[AdMob] Big Interstitial Ad prepared & ready');
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      isInterstitialLoaded = false;
      prepareNextInterstitial();
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (err) => {
      isInterstitialLoaded = false;
      console.warn('[AdMob] Big Ad failed to load:', err);
    });

    // Register listeners for Rewarded Video Ad
    AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
      isRewardedLoaded = true;
      console.log('[AdMob] Rewarded Video Ad prepared & ready');
    });

    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
      isRewardedLoaded = false;
      prepareNextRewarded();
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
      isRewardedLoaded = false;
      console.warn('[AdMob] Rewarded ad failed to load:', err);
    });

    // Pre-cache ads in background so they display instantly when needed
    prepareNextInterstitial();
    prepareNextRewarded();
  } catch (error) {
    console.warn('[AdMob] Initialization failed:', error);
  }
}

/**
 * Prepares the next big interstitial ad silently in the background
 */
async function prepareNextInterstitial(): Promise<void> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) return;
  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_CONFIG.interstitialId,
      isTesting: ADMOB_CONFIG.isTesting,
    });
  } catch {
    isInterstitialLoaded = false;
  }
}

/**
 * Prepares the next rewarded video ad silently in the background
 */
async function prepareNextRewarded(): Promise<void> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) return;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: ADMOB_CONFIG.rewardedId,
      isTesting: ADMOB_CONFIG.isTesting,
    });
  } catch {
    isRewardedLoaded = false;
  }
}

/**
 * Shows Banner Ad above the bottom navigation bar (ONLY on secondary tabs, NEVER on Home)
 */
export async function showBannerAd(): Promise<void> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) return;

  // STRICT RULE: Home screen ('/') must NEVER show banner ad
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    return;
  }

  try {
    if (!isInitialized) {
      await initializeAdMob();
    }

    if (isBannerVisible) return;

    await AdMob.showBanner({
      adId: ADMOB_CONFIG.bannerId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 64, // Leaves comfortable room for the bottom navigation bar
      isTesting: ADMOB_CONFIG.isTesting,
    });
    isBannerVisible = true;
  } catch (err) {
    console.warn('[AdMob] Show banner failed:', err);
  }
}

/**
 * Hides Banner Ad (e.g., on Home and in active Quiz)
 */
export async function hideBannerAd(): Promise<void> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform() || !isBannerVisible) return;

  try {
    await AdMob.hideBanner();
    isBannerVisible = false;
  } catch {
    // Ignore error if banner was already hidden
  }
}

/**
 * Resumes Banner Ad when returning to secondary tabs
 */
export async function resumeBannerAd(): Promise<void> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) return;

  // STRICT RULE: Home screen must NEVER show banner ad
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    hideBannerAd();
    return;
  }

  try {
    if (!isBannerVisible) {
      await showBannerAd();
    } else {
      await AdMob.resumeBanner();
    }
  } catch {
    showBannerAd();
  }
}

/**
 * Triggers a Big (Interstitial) Ad with a STRICT 8-MINUTE COOLDOWN:
 * - Only after finishing a level/quiz
 * - Only in APK (never on Web)
 * - Minimum 8 minutes (480,000 ms) gap between big ads
 * Returns true if an ad was actually shown.
 */
export async function triggerQuizCompletionInterstitial(): Promise<boolean> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) return false;

  const now = Date.now();
  let lastShown = 0;
  try {
    const saved = localStorage.getItem('gkoo_last_interstitial_time');
    if (saved) lastShown = parseInt(saved, 10) || 0;
  } catch {
    lastShown = 0;
  }

  const timeSinceLastAd = now - lastShown;

  // Strict 8-minute cooldown
  if (timeSinceLastAd < BIG_AD_COOLDOWN_MS) {
    const remainingSecs = Math.round((BIG_AD_COOLDOWN_MS - timeSinceLastAd) / 1000);
    const remainingMins = Math.ceil(remainingSecs / 60);
    console.log(`[AdMob] Skipping big ad: 8-minute cooldown active (${remainingMins}m / ${remainingSecs}s remaining)`);
    return false;
  }

  try {
    if (isInterstitialLoaded) {
      await AdMob.showInterstitial();
      try {
        localStorage.setItem('gkoo_last_interstitial_time', String(Date.now()));
      } catch {}
      isInterstitialLoaded = false;
      prepareNextInterstitial();
      return true;
    } else {
      prepareNextInterstitial();
      return false;
    }
  } catch (err) {
    console.warn('[AdMob] Failed to show big ad:', err);
    prepareNextInterstitial();
    return false;
  }
}

/**
 * Shows a Rewarded Video Ad (User watches voluntarily to get 5 refilled hearts).
 * Returns true if the user completed watching the ad and earned the reward!
 */
export async function showRewardedVideoAd(): Promise<{ success: boolean; reward?: AdMobRewardItem }> {
  if (!isAndroidApp() || !Capacitor.isNativePlatform()) {
    // In web preview mode, simulate granting reward for testing
    return { success: true, reward: { type: 'heart', amount: 5 } };
  }

  try {
    if (!isRewardedLoaded) {
      await prepareNextRewarded();
    }

    const rewardItem = await AdMob.showRewardVideoAd();
    isRewardedLoaded = false;
    prepareNextRewarded(); // Pre-cache next one

    return { success: true, reward: rewardItem };
  } catch (err) {
    console.warn('[AdMob] Rewarded video dismissed or failed:', err);
    prepareNextRewarded();
    return { success: false };
  }
}
