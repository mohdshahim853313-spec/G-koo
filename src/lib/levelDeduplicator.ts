import type { QuizQuestion } from './gemini';
import { normalizeQuestionKey } from './questionTracker';

const LEVEL_ASSIGNMENTS_PREFIX = 'gkoo_level_assigned_keys_';

/**
 * Loads the map of assigned question keys per level for a specific category.
 * Return format: Record<string, string[]> where key is levelNumber and value is array of normalized question keys.
 */
export function getCategoryAssignedQuestions(category: string): Record<number, string[]> {
  try {
    const raw = localStorage.getItem(`${LEVEL_ASSIGNMENTS_PREFIX}${category}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[LevelDeduplicator] Failed to load assigned questions:', e);
  }
  return {};
}

/**
 * Saves assigned question keys for a specific level in a category.
 */
export function saveCategoryAssignedQuestions(category: string, levelNumber: number, questions: QuizQuestion[]) {
  try {
    const existing = getCategoryAssignedQuestions(category);
    const keys = questions.map(q => normalizeQuestionKey(q.text)).filter(Boolean);
    existing[levelNumber] = keys;
    localStorage.setItem(`${LEVEL_ASSIGNMENTS_PREFIX}${category}`, JSON.stringify(existing));
  } catch (e) {
    console.warn('[LevelDeduplicator] Failed to save assigned questions:', e);
  }
}

/**
 * Gets all question keys that have been assigned to ANY other level in this category (excluding the current level).
 */
export function getOtherLevelsUsedKeys(category: string, currentLevel: number): Set<string> {
  const map = getCategoryAssignedQuestions(category);
  const used = new Set<string>();

  for (const [lvlStr, keys] of Object.entries(map)) {
    const lvl = parseInt(lvlStr, 10);
    if (lvl !== currentLevel && Array.isArray(keys)) {
      keys.forEach(k => used.add(k));
    }
  }

  return used;
}

/**
 * Filters a pool of candidate questions for a given level, ensuring no overlap with questions
 * already assigned to other levels in this category.
 */
export function deduplicateForLevel(
  pool: QuizQuestion[],
  category: string,
  levelNumber: number,
  targetCount: number
): QuizQuestion[] {
  const otherLevelsKeys = getOtherLevelsUsedKeys(category, levelNumber);
  const seenInThisSelection = new Set<string>();
  const freshList: QuizQuestion[] = [];
  const reusedList: QuizQuestion[] = [];

  for (const q of pool) {
    const key = normalizeQuestionKey(q.text);
    if (!key || seenInThisSelection.has(key)) continue;
    seenInThisSelection.add(key);

    if (!otherLevelsKeys.has(key)) {
      freshList.push(q);
    } else {
      reusedList.push(q);
    }
  }

  // If fresh questions are enough, use them
  if (freshList.length >= targetCount) {
    return freshList.slice(0, targetCount);
  }

  // If pool has fewer unique items than targetCount, backfill gracefully so quiz never breaks
  return [...freshList, ...reusedList].slice(0, targetCount);
}

/**
 * Checks if a cached level questions array is corrupted with old duplicate questions
 * from level 1 or previous levels (from prior bug).
 */
export function isLevelCacheCorruptedWithDuplicates(
  category: string,
  levelNumber: number,
  cachedQuestions: QuizQuestion[]
): boolean {
  if (levelNumber <= 1 || !Array.isArray(cachedQuestions) || cachedQuestions.length === 0) {
    return false;
  }

  const otherLevelsKeys = getOtherLevelsUsedKeys(category, levelNumber);
  if (otherLevelsKeys.size === 0) return false;

  let duplicateCount = 0;
  for (const q of cachedQuestions) {
    const key = normalizeQuestionKey(q.text);
    if (otherLevelsKeys.has(key)) {
      duplicateCount++;
    }
  }

  // If more than 50% of the questions in this level are exact duplicates of prior levels,
  // the cache is stale and should be regenerated with fresh unique questions.
  return duplicateCount >= Math.ceil(cachedQuestions.length * 0.5);
}
