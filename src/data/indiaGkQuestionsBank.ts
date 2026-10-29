import type { QuizQuestion } from '../lib/gemini';

export interface IndiaGkQuestionItem {
  id: string;
  level: number;
  sector: number;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  textEn: string;
  optionsEn: string[];
  answerEn: string;
  explanationEn: string;
  examTag: string;
}

/**
 * ==============================================================================
 * NOTE: Hardcoded questions in code have been commented out / cleared as requested.
 * All questions are now dynamically loaded exclusively from official Google Sheets!
 * Refer to Google Sheets tab '1_SSC_CGL' or 'public/data/SSC_CGL_1500_PYQ_Questions.csv'.
 * ==============================================================================
 */
export const INDIA_GK_1500_QUESTIONS: IndiaGkQuestionItem[] = [];

/**
 * Returns questions for a specific level (10 questions per level).
 * Kept for signature compatibility - questions now load directly from Google Sheets.
 */
export function getIndiaGkLevelQuestions(_levelNumber: number, _lang: 'hi' | 'en' = 'hi'): QuizQuestion[] {
  return [];
}

/**
 * Returns all questions for a specific sector (500 questions per sector).
 * Kept for signature compatibility - questions now load directly from Google Sheets.
 */
export function getIndiaGkSectorQuestions(_sectorId: number, _lang: 'hi' | 'en' = 'hi'): QuizQuestion[] {
  return [];
}

/**
 * Returns all questions for general pool or practice.
 * Kept for signature compatibility - questions now load directly from Google Sheets.
 */
export function getAllIndiaGkQuestions(_lang: 'hi' | 'en' = 'hi'): QuizQuestion[] {
  return [];
}
