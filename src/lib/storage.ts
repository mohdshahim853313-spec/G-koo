/**
 * Safe LocalStorage Utility for G-koo.
 * Prevents QuotaExceededError crashes by catching storage errors and
 * automatically purging non-critical question caches if quota is exceeded.
 */

// Keys that are critical and should NEVER be purged
const PROTECTED_KEYS = new Set([
  'xp',
  'gems',
  'streak',
  'hearts',
  'userStats',
  'userQuests',
  'userProfile',
  'gkoo_level_progress',
  'gkoo_cat_level_progress',
  'gkoo_category_stats',
  'gkoo_bookmarks',
  'gkoo_streak_freezes',
  'gkoo_claimed_chests',
  'lang',
  'theme',
  'soundEnabled',
  'hapticsEnabled',
  'notificationsEnabled',
  'geminiApiKey',
]);

/**
 * Free up localStorage space by removing temporary question caches.
 */
export function pruneStorageCaches() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || PROTECTED_KEYS.has(key)) continue;

      // Identify temporary/heavy question caches to purge first
      if (
        key.startsWith('gkoo_cat_') ||
        key.startsWith('gkoo_level_q_') ||
        key.startsWith('gkoo_level_assigned_') ||
        key === 'gkoo_synced_sheet_questions' ||
        key === 'gkoo_sheet_questions_backup'
      ) {
        keysToRemove.push(key);
      }
    }

    // Remove identified temporary caches
    keysToRemove.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    console.info(`[Storage] Pruned ${keysToRemove.length} temporary question caches from localStorage.`);
  } catch (e) {
    console.warn('[Storage] Cache pruning error:', e);
  }
}

/**
 * Safely set an item in localStorage.
 * If quota is exceeded, purges non-critical caches and retries.
 * Never throws an uncaught error.
 */
export function safeStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      (err?.message && err.message.toLowerCase().includes('quota'));

    if (isQuotaError) {
      console.warn(`[Storage] Quota exceeded while saving "${key}". Purging temporary caches...`);
      pruneStorageCaches();

      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[Storage] Failed to save "${key}" even after cache prune:`, retryErr);
        return false;
      }
    }

    console.warn(`[Storage] Failed to save "${key}":`, err);
    return false;
  }
}

/**
 * Safely get an item from localStorage.
 */
export function safeStorageGet(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely remove an item from localStorage.
 */
export function safeStorageRemove(key: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}
