import type { QuizQuestion } from '../lib/gemini';

/**
 * ==============================================================================
 * NOTE: Hardcoded questions in code have been commented out / cleared as requested.
 * All questions are now dynamically loaded exclusively from official Google Sheets!
 * Refer to Google Sheets tabs (1 to 26) or public/data/*1500*.csv files.
 * ==============================================================================
 */

// CURATED MASTER QUESTION REPOSITORY - PURE HINDI (हिंदी)
export const CURATED_BANK_HI: Record<string, QuizQuestion[]> = {};

// CURATED MASTER QUESTION REPOSITORY - ENGLISH
export const CURATED_BANK_EN: Record<string, QuizQuestion[]> = {};
