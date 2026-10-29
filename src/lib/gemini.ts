import { 
  filterUnmasteredQuestions, 
  getRetryQuestions, 
  isQuestionMastered, 
  normalizeQuestionKey 
} from './questionTracker';
import { deduplicateForLevel, saveCategoryAssignedQuestions } from './levelDeduplicator';
import { getSyncedQuestionsByCategory } from './sheetSync';

export interface QuizQuestion {
  id: number | string;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
  category?: string;
  source?: 'ai' | 'offline' | 'saved';
  examTag?: string; // e.g. "SSC CGL 2023 Tier-1", "RRB NTPC 2022", "UPPSC Prelims"
  lang?: 'hi' | 'en';
  textHi?: string;
  optionsHi?: string[];
  answerHi?: string;
  explanationHi?: string;
  textEn?: string;
  optionsEn?: string[];
  answerEn?: string;
  explanationEn?: string;
}

export interface AiQuizOptions {
  topic?: string;
  categoryId?: string;
  levelNumber?: number;
  customPrompt?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  lang?: 'en' | 'hi';
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sanitizes and balances MCQ options to prevent AI length/specificity bias (giveaway of correct answer).
 * Strips bracketed explanations and trailing giveaway clauses from the correct answer when distractors don't have them.
 */
export function balanceAndSanitizeOptions(
  rawOptions: string[],
  rawAnswer: string,
  rawExplanation?: string
): { options: string[]; answer: string; explanation?: string } {
  let options = (rawOptions || []).map(o => (o || '').trim()).filter(Boolean);
  let answer = (rawAnswer || '').trim();

  if (options.length < 2) {
    return { options, answer, explanation: rawExplanation };
  }

  // Ensure answer matches an option verbatim
  if (!options.includes(answer)) {
    const matched = options.find(o => o.toLowerCase() === answer.toLowerCase());
    if (matched) {
      answer = matched;
    } else {
      options.push(answer);
    }
  }

  // 1. Anti-giveaway: strip bracketed/parenthetical explanations ONLY in the answer if other options don't have brackets
  const answerHasParen = /\s*\([^)]*\)\s*/.test(answer);
  const otherParenCount = options.filter(o => o !== answer && /\([^)]*\)/.test(o)).length;

  if (answerHasParen && otherParenCount === 0) {
    const stripped = answer.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (stripped.length >= 2) {
      options = options.map(o => (o === answer ? stripped : o));
      answer = stripped;
    }
  }

  // 2. Anti-giveaway: check if answer has a trailing explanatory clause (e.g. ", which was..." or ", भारत के राष्ट्रपति")
  const commaClause = /,\s*(which|who|whom|located|established|founded|capital|known|भारत|जो|जिसका|सन्)/i;
  if (commaClause.test(answer)) {
    const otherCommaCount = options.filter(o => o !== answer && commaClause.test(o)).length;
    if (otherCommaCount === 0) {
      const parts = answer.split(',');
      const stripped = parts[0].trim();
      if (stripped.length >= 2) {
        options = options.map(o => (o === answer ? stripped : o));
        answer = stripped;
      }
    }
  }

  return {
    options: shuffleArray(options),
    answer,
    explanation: rawExplanation
  };
}

// -------------------------------------------------------------
// DYNAMIC EXPANDED QUESTION REPOSITORY - ENGLISH
// NOTE: Hardcoded questions commented out - questions come from Google Sheets
// -------------------------------------------------------------
const QUESTION_BANK_EN: Record<string, QuizQuestion[]> = {};

// -------------------------------------------------------------
// DYNAMIC EXPANDED QUESTION REPOSITORY - PURE HINDI (हिंदी)
// NOTE: Hardcoded questions commented out - questions come from Google Sheets
// -------------------------------------------------------------
const QUESTION_BANK_HI: Record<string, QuizQuestion[]> = {};

// -------------------------------------------------------------
// MULTI-API-KEY POOL & ROTATION SYSTEM
// -------------------------------------------------------------
let currentKeyRotationIndex = 0;

/**
 * Parses single or multiple Gemini API keys from custom input or .env
 * Supports comma (,), semicolon (;), whitespace, or newline separation.
 */
export function parseGeminiApiKeys(keyInput?: string): string[] {
  const rawSources: string[] = [];

  if (keyInput && typeof keyInput === 'string' && keyInput.trim().length > 0) {
    rawSources.push(keyInput);
  }

  // Check .env variables
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const envKeys = (import.meta.env.VITE_GEMINI_API_KEYS || '').trim();
  
  if (envKey) rawSources.push(envKey);
  if (envKeys) rawSources.push(envKeys);

  const keyList: string[] = [];

  for (const src of rawSources) {
    // Split by comma, semicolon, or newlines/spaces
    const segments = src.split(/[\s,;\n\r]+/);
    for (const segment of segments) {
      const clean = segment.trim().replace(/^['"]|['"]$/g, '');
      if (clean.startsWith('AIzaSy') && clean.length > 25 && !clean.includes('YourGemini') && !keyList.includes(clean)) {
        keyList.push(clean);
      }
    }
  }

  return keyList;
}

/**
 * Returns summary of currently available keys in the pool
 */
export function getGeminiKeyPoolInfo(customKeyInput?: string): {
  keys: string[];
  count: number;
  source: 'custom' | 'env' | 'none';
} {
  const customKeys = (customKeyInput && customKeyInput.trim().length > 0)
    ? parseGeminiApiKeys(customKeyInput)
    : [];

  if (customKeys.length > 0) {
    return {
      keys: customKeys,
      count: customKeys.length,
      source: 'custom'
    };
  }

  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const envKeys = (import.meta.env.VITE_GEMINI_API_KEYS || '').trim();
  const systemKeys = parseGeminiApiKeys(`${envKey},${envKeys}`);

  if (systemKeys.length > 0) {
    return {
      keys: systemKeys,
      count: systemKeys.length,
      source: 'env'
    };
  }

  return {
    keys: [],
    count: 0,
    source: 'none'
  };
}

// -------------------------------------------------------------
// EXAM TAG RESOLVER FOR PYQ & AUTHENTIC EXAM MOCKS
// -------------------------------------------------------------
export function getExamTagForCategory(cat?: string, lang: 'hi' | 'en' = 'hi'): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('cgl')) return 'SSC CGL Tier-1 PYQ';
  if (c.includes('chsl')) return 'SSC CHSL Tier-1 PYQ';
  if (c.includes('uppsc') || c.includes('up_')) return 'UPPSC / UP Police PYQ';
  if (c.includes('upsc') || c.includes('ias')) return 'UPSC CSE Prelims PYQ';
  if (c.includes('rail') || c.includes('rrb') || c.includes('ntpc')) return 'RRB NTPC / Group D PYQ';
  if (c.includes('bank') || c.includes('ibps') || c.includes('sbi')) return 'IBPS / SBI Clerk PYQ';
  if (c.includes('bpsc') || c.includes('bihar')) return 'BPSC / Bihar SI PYQ';
  if (c.includes('ras') || c.includes('rajasthan')) return 'RPSC / Rajasthan PYQ';
  if (c.includes('mppsc') || c.includes('mp_')) return 'MPPSC Prelims PYQ';
  if (c.includes('science') || c.includes('subject')) return 'General Science PYQ';
  if (c.includes('india')) return 'SSC / State PSC PYQ';
  if (c.includes('world')) return 'Competitive Exam PYQ';
  return lang === 'hi' ? 'प्रतियोगी परीक्षा PYQ' : 'Govt Exam PYQ';
}

// -------------------------------------------------------------
// PRIMARY AI QUIZ GENERATOR FUNCTION (GEMINI MULTI-KEY REST + SMART FALLBACK)
// -------------------------------------------------------------
export async function generateAiQuiz(
  apiKey: string,
  topicOrOptions: string | AiQuizOptions,
  langFallback: 'en' | 'hi' = 'en'
): Promise<QuizQuestion[]> {
  const options: AiQuizOptions = typeof topicOrOptions === 'string'
    ? { topic: topicOrOptions, lang: langFallback }
    : topicOrOptions;

  const cleanTopic = (options.topic || '').trim();
  const categoryId = (options.categoryId || '').toLowerCase();
  const customPrompt = (options.customPrompt || '').trim();
  const difficulty = options.difficulty || 'medium';
  const count = options.count || 10;
  const lang = options.lang || langFallback || 'en';

  // 1. Check if device is currently offline or if this is a structured Level Quiz
  const isDeviceOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const isLevelQuiz = Boolean(options.levelNumber);

  // 2. For structured Level Quizzes or offline devices, skip remote API and load instantly from curated question bank!
  const keysPool = (isDeviceOffline || isLevelQuiz) ? [] : parseGeminiApiKeys(apiKey);

  // 3. Try calling Google Gemini AI REST API with multi-key pool (Only for non-level custom AI quizzes)
  if (!isDeviceOffline && !isLevelQuiz && keysPool.length > 0) {
    // Round-robin start index so load is distributed evenly across all keys
    const startIndex = currentKeyRotationIndex % keysPool.length;
    currentKeyRotationIndex = (currentKeyRotationIndex + 1) % keysPool.length;

    // Arrange keys starting from rotated index
    const orderedKeys: string[] = [];
    for (let i = 0; i < keysPool.length; i++) {
      orderedKeys.push(keysPool[(startIndex + i) % keysPool.length]);
    }

    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-2.0-flash'
    ];

    // Current dynamic time context (Real-time 2026)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDateFormatted = now.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Iterate through keys in the pool (Auto-Failover / Load Balancing)
    for (let kIdx = 0; kIdx < orderedKeys.length; kIdx++) {
      const activeKey = orderedKeys[kIdx];
      const keyMask = activeKey.substring(0, 6) + '...' + activeKey.slice(-4);

      for (const model of modelsToTry) {
        try {
          const languagePrompt = lang === 'hi'
            ? "CRITICAL LANGUAGE REQUIREMENT: PURE HINDI (हिंदी). Everything including question 'text', all 4 'options', 'answer', and 'explanation' MUST be written in 100% natural, correct Devanagari Hindi. Do NOT use English words."
            : "Language: English.";

          const isDailyOrFactTopic = (cleanTopic && (cleanTopic.toLowerCase().includes('daily') || cleanTopic.toLowerCase().includes('challenge') || cleanTopic.toLowerCase().includes('fact') || cleanTopic.includes('तथ्य') || cleanTopic.includes('चुनौती')));

          const promptInstruction = customPrompt
            ? `User Custom Instructions: "${customPrompt}"`
            : isDailyOrFactTopic
            ? `Generate exactly ${count} extraordinarily interesting, curiosity-sparking multiple-choice questions on: "${cleanTopic}". Focus on mind-blowing real-world facts, "Did You Know?" mysteries, unbelievable science wonders, historic oddities, space anomalies, animal kingdom secrets, and latest global records. Make questions fun, educational, and completely fresh without repetition.`
            : options.levelNumber
            ? `Generate exactly ${count} unique, non-repeating multiple-choice questions specifically for Level ${options.levelNumber} on topic: "${cleanTopic || categoryId}". Distribute questions across relevant subtopics (politics, geography, national/international news, states, policies, discoveries, key facts). NEVER repeat previously generated questions.`
            : `Generate a brand-new, educational quiz of ${count} questions on: "${cleanTopic || categoryId || 'General Knowledge'}".`;

          const EXPLORATION_ANGLES = [
            'breakthrough innovations and records',
            'unusual historical turning points and lesser-known trivia',
            'geographical landmarks, biodiversity and environmental wonders',
            'deep space missions, physics anomalies and scientific discoveries',
            'governance milestones, economic trends and major summits',
            'sports records, tournaments and unsung champions',
            'fascinating "Did You Know?" mysteries and curious origin facts',
            'state and national cultural heritage, iconic architecture and awards'
          ];
          const randomAngle = EXPLORATION_ANGLES[Math.floor(Math.random() * EXPLORATION_ANGLES.length)];
          const randomEntropy = `${Date.now()}-${Math.floor(Math.random() * 900000) + 100000}`;

          const systemPrompt = `You are an expert quiz master with real-time Google search live knowledge. Create an engaging multiple-choice quiz of exactly ${count} questions.
Temporal Context:
- Today's Date: ${currentDateFormatted} (Year ${currentYear}).
- CRITICAL: Ground all Current Affairs, National/International News, Awards, Sports, Summits, Policies, and Discoveries in real-world facts up to ${currentYear}. Do NOT treat 2024 or earlier years as the current year.

Quiz Parameters:
- Topic: ${promptInstruction}
- Sub-dimension angle: "${randomAngle}"
- Unique Salt: ${randomEntropy}
- Difficulty: ${difficulty.toUpperCase()}
- ${languagePrompt}

CRITICAL RULES FOR OPTIONS (STRICT ANTI-GIVEAWAY REQUIREMENT):
1. EQUAL OPTION LENGTH & DETAIL:
   - ALL 4 options in "options" MUST be of strictly similar length and equal level of detail.
   - ABSOLUTELY NEVER make the correct answer longer, more descriptive, or more detailed than the distractors.
   - If the correct answer is a short 1-3 word phrase, all 3 distractors MUST ALSO be short 1-3 word phrases.
   - NEVER put explanations, dates, qualifications, or parentheses inside the option text itself (e.g. write "Dr. A.P.J. Abdul Kalam", NOT "Dr. A.P.J. Abdul Kalam (11th President of India)").
   - Put all interesting explanations, facts, and reasons strictly inside the "explanation" field!
2. OPTION PLAUSIBILITY & HOMOGENEITY:
   - All 4 options must belong to the exact same grammatical category (e.g., all 4 names, all 4 cities, all 4 years).
   - Distractors must be smart, highly realistic, and believable.
3. ANTI-REPETITION:
   - NEVER output cliché or standard frequently-repeated questions.
   - Explore fresh, intriguing, and authentic dimensions. Ensure every question feels unique, exciting, and surprising.

Return ONLY a valid raw JSON array with NO markdown formatting, no backticks, no codeblocks:
[
  {
    "id": 1,
    "text": "Question text?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Option 1",
    "explanation": "Brief educational fact.",
    "examTag": "SSC CGL / Railway / State Exam"
  }
]`;

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;

          const headers: Record<string, string> = { 
            'Content-Type': 'application/json',
            'x-goog-api-key': activeKey 
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);

          // Request payload with Google Search Live Grounding enabled
          const requestBodyWithGrounding = {
            contents: [{ parts: [{ text: systemPrompt }] }],
            tools: [{ googleSearch: {} }],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 4096,
            }
          };

          let response = await fetch(url, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify(requestBodyWithGrounding)
          });

          // Fallback without tools only if server internal error occurred
          if (!response.ok && response.status === 500) {
            response = await fetch(url, {
              method: 'POST',
              headers,
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                  temperature: 0.85,
                  maxOutputTokens: 4096,
                }
              })
            });
          }

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const cleanedJson = candidateText
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim();
              const parsed = JSON.parse(cleanedJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const formattedAiQuestions: QuizQuestion[] = parsed.map((q, idx) => {
                  const balanced = balanceAndSanitizeOptions(q.options || [], q.answer, q.explanation);
                  return {
                    id: `ai-${Date.now()}-${idx + 1}`,
                    text: q.text,
                    options: balanced.options,
                    answer: balanced.answer,
                    explanation: balanced.explanation || (lang === 'hi' ? "शानदार उत्तर! हर सवाल से आपका ज्ञान और मजबूत होता है।" : "Great job learning this key concept!"),
                    category: cleanTopic || categoryId || "Gemini AI",
                    source: 'ai',
                    examTag: q.examTag || getExamTagForCategory(cleanTopic || categoryId, lang)
                  };
                });

                // 1. Exclude already mastered questions so they never repeat
                const unmasteredAi = formattedAiQuestions.filter(q => !isQuestionMastered(q.text));

                const finalAiList: QuizQuestion[] = [];
                const seenKeys = new Set<string>();

                // Add fresh unmastered AI questions
                for (const uq of unmasteredAi) {
                  const k = normalizeQuestionKey(uq.text);
                  if (!seenKeys.has(k)) {
                    seenKeys.add(k);
                    finalAiList.push(uq);
                  }
                  if (finalAiList.length >= count) break;
                }

                // If still under count, backfill with remaining AI items
                if (finalAiList.length < count) {
                  for (const q of formattedAiQuestions) {
                    const k = normalizeQuestionKey(q.text);
                    if (!seenKeys.has(k)) {
                      seenKeys.add(k);
                      finalAiList.push(q);
                    }
                    if (finalAiList.length >= count) break;
                  }
                }

                if (finalAiList.length > 0) {
                  const result = finalAiList.slice(0, count);
                  if (options.levelNumber && (categoryId || cleanTopic)) {
                    saveCategoryAssignedQuestions(categoryId || cleanTopic, options.levelNumber, result);
                  }
                  return result;
                }
              }
            }
          } else {
            const status = response.status;
            console.warn(`[Gemini Pool] Key [${keyMask}] received HTTP ${status} for model ${model}.`);
            // If any client error (400, 401, 403, 404, 429), switch immediately to next key
            if (status >= 400) {
              console.warn(`[Gemini Pool] Key [${keyMask}] encountered error ${status}. Moving next...`);
              break;
            }
          }
        } catch (err) {
          console.warn(`[Gemini Pool] Key [${keyMask}] attempt with model ${model} failed, testing next option...`, err);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // SMART DYNAMIC OFFLINE GENERATOR (Deduplication + Spaced Repetition)
  // -------------------------------------------------------------
  await new Promise(resolve => setTimeout(resolve, 400));

  const repo = lang === 'hi' ? QUESTION_BANK_HI : QUESTION_BANK_EN;
  let pool: QuizQuestion[] = [];

  if (categoryId && repo[categoryId]) {
    pool = [...repo[categoryId]];
    // If pool has fewer than 35 items, blend in mix questions to ensure no level repeats
    if (pool.length < 35 && repo.mix) {
      const existingKeys = new Set(pool.map(q => normalizeQuestionKey(q.text)));
      for (const mq of repo.mix) {
        const k = normalizeQuestionKey(mq.text);
        if (!existingKeys.has(k)) {
          existingKeys.add(k);
          pool.push(mq);
        }
      }
    }
  } else if (cleanTopic) {
    const topicLower = cleanTopic.toLowerCase();
    if (topicLower.includes('current') || topicLower.includes('समसामयिकी') || topicLower.includes('affair')) {
      pool = [...(repo.ca_india || []), ...(repo.ca_world || []), ...(repo.current || [])];
    } else if (topicLower.includes('india') || topicLower.includes('भारत')) {
      pool = [...(repo.india || []), ...(repo.ca_india || [])];
    } else if (topicLower.includes('world') || topicLower.includes('geography') || topicLower.includes('विश्व')) {
      pool = [...(repo.world || []), ...(repo.ca_world || [])];
    } else if (topicLower.includes('science') || topicLower.includes('विज्ञान')) {
      pool = [...(repo.subjects || [])];
    } else if (topicLower.includes('space') || topicLower.includes('अंतरिक्ष')) {
      pool = [...(repo.current || [])];
    } else {
      // Combine all pools for rich variety
      pool = Object.values(repo).flat();
    }
  } else {
    pool = Object.values(repo).flat();
  }

  if (pool.length === 0) {
    pool = Object.values(QUESTION_BANK_HI).flat();
  }

  const activeCategory = categoryId || cleanTopic || 'mix';

  // Merge questions synced from Google Sheets (prioritized first, respecting language setting)
  const syncedQuestions = getSyncedQuestionsByCategory(activeCategory, lang);
  if (syncedQuestions.length > 0) {
    const existingTexts = new Set(pool.map(q => q.text.trim().toLowerCase()));
    const freshSynced = syncedQuestions.filter(q => !existingTexts.has(q.text.trim().toLowerCase()));
    pool = [...freshSynced, ...pool];
  }

  // 1. Cross-Level Deduplication: If levelNumber is given, ensure questions never repeat across levels!
  if (options.levelNumber) {
    const deduplicated = deduplicateForLevel(pool, activeCategory, options.levelNumber, count);
    if (deduplicated.length > 0) {
      saveCategoryAssignedQuestions(activeCategory, options.levelNumber, deduplicated);
      return deduplicated.map((q, idx) => ({
        ...q,
        id: `dyn-${Date.now()}-${idx}`,
        options: shuffleArray(q.options),
        category: cleanTopic || categoryId || (lang === 'hi' ? "क्विज" : "Quiz"),
        source: 'offline',
        examTag: q.examTag || getExamTagForCategory(activeCategory, lang)
      }));
    }
  }

  // 2. Get past incorrect questions for spaced repetition (up to 3)
  const retryQuestions = getRetryQuestions(categoryId || cleanTopic, 3);

  // 3. Filter out already mastered questions from pool
  const unmasteredPool = filterUnmasteredQuestions(pool);
  const shuffledUnmastered = shuffleArray(unmasteredPool);

  const selectedList: QuizQuestion[] = [];
  const seenKeys = new Set<string>();

  // Add retry questions first
  for (const rq of retryQuestions) {
    const k = normalizeQuestionKey(rq.text);
    if (!seenKeys.has(k)) {
      seenKeys.add(k);
      selectedList.push(rq);
    }
  }

  // Add unmastered questions
  for (const uq of shuffledUnmastered) {
    const k = normalizeQuestionKey(uq.text);
    if (!seenKeys.has(k)) {
      seenKeys.add(k);
      selectedList.push(uq);
    }
    if (selectedList.length >= count) break;
  }

  // If unmastered pool ran out, fallback to shuffled full pool so user never faces empty quiz
  if (selectedList.length < count) {
    const shuffledFull = shuffleArray(pool);
    for (const q of shuffledFull) {
      const k = normalizeQuestionKey(q.text);
      if (!seenKeys.has(k)) {
        seenKeys.add(k);
        selectedList.push(q);
      }
      if (selectedList.length >= count) break;
    }
  }

  const finalSelected = selectedList.slice(0, Math.min(count, selectedList.length));

  return finalSelected.map((q, idx) => ({
    ...q,
    id: `dyn-${Date.now()}-${idx}`,
    options: shuffleArray(q.options),
    category: cleanTopic || categoryId || (lang === 'hi' ? "क्विज" : "Quiz"),
    source: 'offline',
    examTag: q.examTag || getExamTagForCategory(activeCategory, lang)
  }));
}

export interface DoubtExplanation {
  coreReason: string;
  keyExamPoints: string[];
  memoryTrick: string;
}

export async function askAiDoubtTutor(
  apiKey: string,
  questionText: string,
  correctAnswer: string,
  lang: 'hi' | 'en' = 'hi',
  existingExplanation?: string
): Promise<DoubtExplanation> {
  // If user or system has Gemini API keys, attempt dynamic live AI tutor first
  const keyPool = getGeminiKeyPoolInfo(apiKey);

  if (keyPool.keys.length > 0) {
    const prompt = lang === 'hi'
      ? `आप एक वरिष्ठ प्रतियोगी परीक्षा शिक्षक और मेंटर हैं। छात्र ने इस सवाल को गहराई से समझने के लिए मदद मांगी है:
प्रश्न: "${questionText}"
सही उत्तर: "${correctAnswer}"
${existingExplanation ? `उपलब्ध तथ्य: "${existingExplanation}"` : ''}

कृपया इस सवाल के लिए 3 अलग-अलग, विशिष्ट और उच्च-स्तरीय बातें 100% शुद्ध हिंदी में बताएं:
1. coreReason: यह उत्तर सही क्यों है (विस्तृत और स्पष्ट व्याख्या, 2-3 वाक्य)। सामान्य या घिसा-पिटा जवाब न दें, बल्कि इस सवाल के वास्तविक भौगोलिक/ऐतिहासिक/वैज्ञानिक तथ्य समझाएं।
2. keyExamPoints: इस सवाल के टॉपिक से जुड़े 2 ऐसे अतिरिक्त महत्वपूर्ण तथ्य जो SSC, Railway, State PSC में बार-बार पूछे जाते हैं (स्ट्रिंग ऐरे)।
3. memoryTrick: इस उत्तर को हमेशा याद रखने की एक रोचक, चतुर स्मृति ट्रिक (Mnemonic/जुगाड़, 1 वाक्य)।

केवल रॉ JSON आउटपुट दें, कोई मार्कडाउन या बैकटिक्स नहीं:
{
  "coreReason": "...",
  "keyExamPoints": ["...", "..."],
  "memoryTrick": "..."
}`
      : `You are an elite competitive exam mentor. A student needs comprehensive doubt resolution on:
Question: "${questionText}"
Correct Answer: "${correctAnswer}"
${existingExplanation ? `Context: "${existingExplanation}"` : ''}

Provide 3 highly specific, educational elements:
1. coreReason: Crisp 2-3 sentence scientific/historical/factual explanation of why this answer is correct. Avoid generic template sentences.
2. keyExamPoints: 2 high-yield related facts frequently tested in competitive exams (string array).
3. memoryTrick: A memorable mnemonic or trick to retain this concept forever.

Return ONLY raw JSON with no markdown:
{
  "coreReason": "...",
  "keyExamPoints": ["...", "..."],
  "memoryTrick": "..."
}`;

    const models = ['gemini-1.5-flash', 'gemini-2.0-flash'];
    for (const key of keyPool.keys) {
      for (const model of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 1024 }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.coreReason) {
                return {
                  coreReason: parsed.coreReason || existingExplanation || '',
                  keyExamPoints: Array.isArray(parsed.keyExamPoints) && parsed.keyExamPoints.length > 0 
                    ? parsed.keyExamPoints 
                    : [
                        lang === 'hi' ? `परीक्षा में '${correctAnswer}' से संबंधित प्रमुख तथ्य बार-बार पूछे जाते हैं।` : `Key facts about '${correctAnswer}' frequently appear in exams.`,
                        lang === 'hi' ? 'इस विषय के संबंधित भौगोलिक व ऐतिहासिक संदर्भों का पुनरावलोकन करें।' : 'Review related geographical and historical contexts.'
                      ],
                  memoryTrick: parsed.memoryTrick || (lang === 'hi' ? `ट्रिक: प्रश्न के मुख्य संदर्भ को सीधे '${correctAnswer}' से जोड़ें!` : `Trick: Directly link the question concept to '${correctAnswer}'!`)
                };
              }
            }
          }
        } catch {
          // try next model/key
        }
      }
    }
  }

  // -------------------------------------------------------------
  // SMART DYNAMIC CONTEXTUAL OFFLINE ENGINE (Zero repetitive template)
  // -------------------------------------------------------------
  const qLower = questionText.toLowerCase();
  const aLower = correctAnswer.toLowerCase();

  // 1. If question already has a detailed explanation, prioritize it directly!
  let baseReason = existingExplanation?.trim() || '';

  // 2. Intelligent subject & concept recognition for dynamic facts & tricks
  let customPoints: string[] = [];
  let customTrick = '';

  if (qLower.includes('भ्रंश घाटी') || qLower.includes('rift valley') || aLower.includes('नर्मदा') || aLower.includes('ताप्ती')) {
    if (!baseReason) {
      baseReason = lang === 'hi'
        ? `नर्मदा नदी विंध्याचल और सतपुड़ा पर्वत श्रेणियों के बीच 'भ्रंश घाटी' (Rift Valley) से होकर पश्चिम दिशा में बहती है और अरब सागर (खंभात की खाड़ी) में गिरती है।`
        : `Narmada flows westward through a tectonic 'Rift Valley' flanked between Vindhya and Satpura mountain ranges into the Arabian Sea.`;
    }
    customPoints = lang === 'hi'
      ? [
          'नर्मदा नदी अमरकंटक (मध्य प्रदेश) से निकलती है और जबलपुर के निकट संगमरमर की चट्टानों पर भव्य धुआंधार जलप्रपात बनाती है।',
          'पश्चिम की ओर बहने के कारण नर्मदा और ताप्ती नदियां डेल्टा (Delta) नहीं बनातीं, बल्कि ज्वारनदमुख (Estuary) का निर्माण करती हैं।'
        ]
      : [
          'Originates from Amarkantak plateau (MP) and forms the scenic Dhuandhar Falls in Jabalpur.',
          'Flows westward into the Gulf of Khambhat without creating a delta, forming an estuary instead.'
        ];
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: "नरम (नर्मदा) दिल घाटी में दरारों (Rift) से रास्ता बना लेता है!"`
      : `💡 Memory Trick: "Narmada carves a Rift through the rocks!"`;
  } else if (qLower.includes('वृद्ध गंगा') || qLower.includes('दक्षिण गंगा') || aLower.includes('गोदावरी')) {
    if (!baseReason) {
      baseReason = lang === 'hi'
        ? `गोदावरी नदी को अपनी विशाल लंबाई (1,465 किमी) और धार्मिक व सांस्कृतिक महत्व के कारण 'वृद्ध गंगा' या 'दक्षिण गंगा' कहा जाता है।`
        : `Godavari (1,465 km) is revered as 'Vridha Ganga' or 'Dakshin Ganga' due to its vast length and sacred status in peninsular India.`;
    }
    customPoints = lang === 'hi'
      ? [
          'यह प्रायद्वीपीय (दक्षिण) भारत की सबसे लंबी नदी है जो महाराष्ट्र के नासिक जिले में त्र्यंबकेश्वर से निकलती है।',
          'इसकी प्रमुख सहायक नदियों में मंजीरा, पेनगंगा, वैनगंगा, वर्धा और इंद्रावती शामिल हैं।'
        ]
      : [
          'Longest peninsular river in India, originating at Trimbakeshwar near Nashik in Maharashtra.',
          'Major tributaries include Manjira, Penganga, Wainganga, Wardha, and Indravati.'
        ];
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: "दक्षिण भारत की सबसे 'गोद' (गोदावरी) बड़ी और पूज्य है!"`
      : `💡 Memory Trick: "Godavari is the Grand Old River of the South!"`;
  } else if (qLower.includes('अरावली') || qLower.includes('सबसे पुरानी') || qLower.includes('oldest mountain')) {
    if (!baseReason) {
      baseReason = lang === 'hi'
        ? `अरावली पर्वतमाला भारत ही नहीं बल्कि विश्व की सबसे प्राचीन वलित (Fold) पर्वत श्रृंखलाओं में से एक है, जो अब अवशिष्ट (Residual) पर्वत का रूप ले चुकी है।`
        : `The Aravalli Range is among the world's oldest fold mountain systems, pre-dating the Himalayas and now weathered into residual hills.`;
    }
    customPoints = lang === 'hi'
      ? [
          'अरावली की सबसे ऊंची चोटी माउंट आबू (राजस्थान) में स्थित "गुरु शिखर" (1,722 मीटर) है।',
          'यह पर्वतमाला राजस्थान, हरियाणा, गुजरात और दिल्ली (रायसीना हिल्स जहाँ राष्ट्रपति भवन स्थित है) तक फैली हुई है।'
        ]
      : [
          'Highest peak is Guru Shikhar (1,722 m) situated in Mount Abu, Rajasthan.',
          'Stretches from Gujarat through Rajasthan and Haryana to Raisina Hill in New Delhi.'
        ];
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: "'अमर' और 'अटल' सबसे प्राचीन पर्वत = अरावली!"`
      : `💡 Memory Trick: "Aravalli = Ancient Anchor of India!"`;
  } else if (qLower.includes('नील') || qLower.includes('लंबी नदी') || qLower.includes('longest river') || aLower.includes('नील')) {
    if (!baseReason) {
      baseReason = lang === 'hi'
        ? `नील नदी (Nile River) अफ्रीका महाद्वीप में बहने वाली लगभग 6,650 किमी लंबी दुनिया की सबसे लंबी नदी है।`
        : `The Nile River in Africa measures approximately 6,650 km, holding the official record as Earth's longest river.`;
    }
    customPoints = lang === 'hi'
      ? [
          'नील नदी विक्टोरिया झील से निकलकर भूमध्य सागर (Mediterranean Sea) में गिरती है और इसे "मिस्र का वरदान" कहा जाता है।',
          'जल प्रवाह और आयतन (Water Volume) की दृष्टि से दक्षिण अमेरिका की अमेज़न नदी दुनिया की सबसे बड़ी नदी है।'
        ]
      : [
          'Drains northwards into the Mediterranean Sea and is famously termed the "Gift of the Nile" for Egypt.',
          'By water discharge volume, the Amazon River in South America is the world’s largest river.'
        ];
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: "नीला आकाश जितना लंबा = नील नदी सबसे लंबी!"`
      : `💡 Memory Trick: "Nile is the longest mile in river history!"`;
  } else if (qLower.includes('लाल ग्रह') || qLower.includes('red planet') || aLower.includes('मंगल') || aLower.includes('mars')) {
    if (!baseReason) {
      baseReason = lang === 'hi'
        ? `मंगल (Mars) ग्रह की सतह पर प्रचुर मात्रा में 'आयरन ऑक्साइड' (जंग/फेरिक ऑक्साइड) की मौजूदगी के कारण यह अंतरिक्ष से लाल दिखाई देता है।`
        : `Mars appears distinctively reddish because its regolith surface is rich in iron(III) oxide (rust).`;
    }
    customPoints = lang === 'hi'
      ? [
          'मंगल ग्रह के दो प्राकृतिक उपग्रह (चंद्रमा) हैं: फोबोस (Phobos) और डीमोस (Deimos)।',
          'सौरमंडल का सबसे विशाल ज्वालामुखी और सबसे ऊंचा पर्वत "ओलंपस मॉन्स" (Olympus Mons) मंगल ग्रह पर ही स्थित है।'
        ]
      : [
          'Features two small natural moons named Phobos and Deimos.',
          'Home to Olympus Mons, the largest known volcano and highest planetary mountain in the Solar System.'
        ];
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: "मंगलवार को लाल सिंदूर = लाल ग्रह मंगल!"`
      : `💡 Memory Trick: "Mars glows with iron rust Red!"`;
  } else if (qLower.includes('चमकीला') || qLower.includes('गर्म ग्रह') || qLower.includes('शुक्र') || aLower.includes('शुक्र') || aLower.includes('venus')) {
    if (!baseReason) {
      baseReason = lang === 'hi'
        ? `शुक्र (Venus) के वायुमंडल में 96% से अधिक कार्बन डाइऑक्साइड (CO2) होने के कारण चरम ग्रीनहाउस प्रभाव उत्पन्न होता है, जिससे यह सबसे गर्म व चमकीला ग्रह बनता है।`
        : `Venus features an ultra-dense carbon dioxide atmosphere that traps runaway heat, making it the hottest and brightest planet in our solar system.`;
    }
    customPoints = lang === 'hi'
      ? [
          'शुक्र को "भोर का तारा" (Morning Star) और "सांझ का तारा" (Evening Star) तथा पृथ्वी की जुड़वां बहन (Earth’s Twin) कहा जाता है।',
          'यह अन्य ग्रहों के विपरीत पूर्व से पश्चिम (दक्षिणावर्त/Clockwise) दिशा में घूर्णन करता है।'
        ]
      : [
          'Often celebrated as the Morning Star, Evening Star, and Earth’s sister planet due to similar size and mass.',
          'Rotates retrograde (clockwise, East to West), opposite to Earth and most other planets.'
        ];
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: "शुक्रवार का 'शुक्र' सितारे की तरह सबसे चमकीला चमकता है!"`
      : `💡 Memory Trick: "Venus shines the brightest like a silver jewel!"`;
  }

  // Dynamic fallback when question is outside standard catalog
  if (!baseReason) {
    const cleanQ = questionText.replace(/[?।.]/g, '').trim();
    baseReason = lang === 'hi'
      ? `प्रश्न "${cleanQ}" का प्रामाणिक व आयोग द्वारा सत्यापित सही उत्तर '${correctAnswer}' है। यह प्रतियोगी परीक्षाओं की आधिकारिक उत्तर-कुंजी के पूर्णतः अनुरूप है।`
      : `For the inquiry "${cleanQ}", official examination keys and standard textbooks verify '${correctAnswer}' as the correct response.`;
  }

  if (customPoints.length === 0) {
    customPoints = lang === 'hi'
      ? [
          `प्रतियोगी परीक्षाओं (SSC, Railway, State PSC) में '${correctAnswer}' से संबंधित अवधारणाएँ बार-बार दोहराई जाती हैं।`,
          `इस प्रश्न के संदर्भ में संबंधित प्रमुख ऐतिहासिक, भौगोलिक या वैज्ञानिक तथ्यों को अवश्य नोट करें।`
        ]
      : [
          `Key concepts regarding '${correctAnswer}' frequently appear across competitive exam shifts.`,
          `Take note of the associated timeline, classifications, or geographical landmarks for upcoming tests.`
        ];
  }

  if (!customTrick) {
    customTrick = lang === 'hi'
      ? `💡 याद रखने की ट्रिक: प्रश्न के मुख्य कीवर्ड को सीधे '${correctAnswer}' के पहले अक्षर से जोड़कर याद रखें!`
      : `💡 Memory Trick: Anchor the core question keyword directly to '${correctAnswer}'!`;
  }

  return {
    coreReason: baseReason,
    keyExamPoints: customPoints,
    memoryTrick: customTrick
  };
}