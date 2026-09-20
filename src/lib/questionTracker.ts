import type { QuizQuestion } from './gemini';

const MASTERED_STORAGE_KEY = 'gkoo_mastered_questions';
const INCORRECT_STORAGE_KEY = 'gkoo_incorrect_questions';

export interface IncorrectQuestionEntry {
  key: string;
  question: QuizQuestion;
  missedCount: number;
  lastMissedAt: number;
  category?: string;
}

export interface MasteredQuestionEntry {
  key: string;
  text: string;
  category?: string;
  masteredAt: number;
}

/**
 * Normalizes question text to create a robust unique key across punctuation, casing, and whitespace.
 * Works seamlessly with Hindi (Devanagari) and English text.
 */
export function normalizeQuestionKey(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0900-\u097F]/g, '') // Keep alphanumeric and Hindi Devanagari Unicode range
    .replace(/\s+/g, ' ');
}

// In-memory caches for fast lookup
let masteredCache: Map<string, MasteredQuestionEntry> | null = null;
let incorrectCache: Map<string, IncorrectQuestionEntry> | null = null;

function loadMastered(): Map<string, MasteredQuestionEntry> {
  if (masteredCache) return masteredCache;
  masteredCache = new Map();
  try {
    const raw = localStorage.getItem(MASTERED_STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, MasteredQuestionEntry> = JSON.parse(raw);
      Object.entries(parsed).forEach(([k, v]) => masteredCache!.set(k, v));
    }
  } catch (e) {
    console.warn('[QuestionTracker] Failed to load mastered questions:', e);
  }
  return masteredCache;
}

function saveMastered() {
  if (!masteredCache) return;
  try {
    const obj: Record<string, MasteredQuestionEntry> = {};
    masteredCache.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('[QuestionTracker] Failed to save mastered questions:', e);
  }
}

function loadIncorrect(): Map<string, IncorrectQuestionEntry> {
  if (incorrectCache) return incorrectCache;
  incorrectCache = new Map();
  try {
    const raw = localStorage.getItem(INCORRECT_STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, IncorrectQuestionEntry> = JSON.parse(raw);
      Object.entries(parsed).forEach(([k, v]) => incorrectCache!.set(k, v));
    }
  } catch (e) {
    console.warn('[QuestionTracker] Failed to load incorrect questions:', e);
  }
  return incorrectCache;
}

function saveIncorrect() {
  if (!incorrectCache) return;
  try {
    const obj: Record<string, IncorrectQuestionEntry> = {};
    incorrectCache.forEach((v, k) => {
      obj[k] = v;
    });
    localStorage.setItem(INCORRECT_STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('[QuestionTracker] Failed to save incorrect questions:', e);
  }
}

/**
 * Check if a question text has already been mastered by the user in any previous level.
 */
export function isQuestionMastered(text: string): boolean {
  const key = normalizeQuestionKey(text);
  if (!key) return false;
  const map = loadMastered();
  return map.has(key);
}

/**
 * Record user's answer outcome for a question:
 * - If CORRECT: Mark as Mastered (never repeat in future levels) and REMOVE from incorrect list.
 * - If INCORRECT: Save to incorrect list for spaced-repetition re-testing in upcoming levels.
 */
export function recordQuestionAnswer(question: QuizQuestion, isCorrect: boolean, category?: string) {
  if (!question || !question.text) return;
  const key = normalizeQuestionKey(question.text);
  if (!key) return;

  const mastered = loadMastered();
  const incorrect = loadIncorrect();

  if (isCorrect) {
    // 1. Mark as mastered
    mastered.set(key, {
      key,
      text: question.text,
      category: category || question.category,
      masteredAt: Date.now()
    });
    saveMastered();

    // 2. Remove from incorrect list if it was previously answered wrong
    if (incorrect.has(key)) {
      incorrect.delete(key);
      saveIncorrect();
    }
  } else {
    // If not already mastered, add or increment in incorrect list
    if (!mastered.has(key)) {
      const existing = incorrect.get(key);
      const missedCount = existing ? existing.missedCount + 1 : 1;
      incorrect.set(key, {
        key,
        question: {
          ...question,
          category: category || question.category
        },
        missedCount,
        lastMissedAt: Date.now(),
        category: category || question.category
      });
      saveIncorrect();
    }
  }
}

/**
 * Get previously incorrect questions that need spaced repetition/practice for a category.
 */
export function getRetryQuestions(category?: string, maxCount: number = 3): QuizQuestion[] {
  const incorrect = loadIncorrect();
  const mastered = loadMastered();
  const results: QuizQuestion[] = [];

  const cleanCat = (category || '').toLowerCase();

  const entries = Array.from(incorrect.values());
  // Sort entries: questions missed more times or missed recently first
  entries.sort((a, b) => b.missedCount - a.missedCount || b.lastMissedAt - a.lastMissedAt);

  for (const entry of entries) {
    // If somehow mastered in the meantime, clean it up
    if (mastered.has(entry.key)) {
      incorrect.delete(entry.key);
      continue;
    }

    if (cleanCat && entry.category) {
      const entryCat = entry.category.toLowerCase();
      if (entryCat.includes(cleanCat) || cleanCat.includes(entryCat)) {
        results.push(entry.question);
      }
    } else {
      results.push(entry.question);
    }

    if (results.length >= maxCount) break;
  }

  saveIncorrect();
  return results;
}

/**
 * Filter out already mastered questions from a candidate question list.
 */
export function filterUnmasteredQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const mastered = loadMastered();
  return questions.filter(q => {
    const key = normalizeQuestionKey(q.text);
    return !mastered.has(key);
  });
}

/**
 * Reset all tracked question history (used during full progress reset).
 */
export function clearQuestionHistory() {
  masteredCache = new Map();
  incorrectCache = new Map();
  try {
    localStorage.removeItem(MASTERED_STORAGE_KEY);
    localStorage.removeItem(INCORRECT_STORAGE_KEY);
  } catch (e) {
    console.warn('[QuestionTracker] Failed to clear question history:', e);
  }
}

/**
 * Get stats about mastered and weak questions.
 */
export function getQuestionTrackerStats(): { masteredCount: number; incorrectCount: number } {
  const mastered = loadMastered();
  const incorrect = loadIncorrect();
  return {
    masteredCount: mastered.size,
    incorrectCount: incorrect.size
  };
}

/**
 * Get all currently recorded incorrect questions for focused practice.
 */
export function getAllIncorrectQuestions(): QuizQuestion[] {
  const incorrect = loadIncorrect();
  const mastered = loadMastered();
  const results: QuizQuestion[] = [];
  const entries = Array.from(incorrect.values());
  
  // Sort entries: most missed or most recently missed first
  entries.sort((a, b) => b.missedCount - a.missedCount || b.lastMissedAt - a.lastMissedAt);
  
  for (const entry of entries) {
    if (!mastered.has(entry.key) && entry.question) {
      results.push(entry.question);
    }
  }
  return results;
}

