import { useState, useEffect } from 'react';
import { useAppContext } from '../useAppContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, triggerHaptic, speakText, stopSpeech } from '../lib/audio';
import { Mascot, GkooBirdAvatar, GkooBirdSvg } from '../components/Mascot';
import { X, CheckCircle2, XCircle, Sparkles, Heart, RotateCcw, Volume2, VolumeX, Star, ArrowRight, Clock, WifiOff, Play, Bookmark, Zap, BookOpen, ChevronRight, ChevronLeft, Gem, Landmark, Globe, Flame, Target, HardDrive, AlertTriangle, Languages } from 'lucide-react';
import { generateAiQuiz, type QuizQuestion } from '../lib/gemini';
import { getSyncedQuestionsByCategory, syncCategoryQuestions, filterQuestionsByLanguage } from '../lib/sheetSync';
import { getCategoryLevelConfig, getCategoryInfo } from '../lib/levelData';
import { recordQuestionAnswer, getAllIncorrectQuestions } from '../lib/questionTracker';
import { saveCategoryAssignedQuestions, isLevelCacheCorruptedWithDuplicates } from '../lib/levelDeduplicator';
import { MistakesReviewModal, type MistakeRecord } from '../components/MistakesReviewModal';
import { RateAppModal } from '../components/RateAppModal';
import { AdMobRewardModal } from '../components/AdMobRewardModal';
import { isAndroidApp } from '../utils/platform';

const QUIT_MESSAGES = [
  {
    titleHi: 'क्या आप सचमुच छोड़कर जा रहे हैं? 🥺',
    titleEn: 'Wait, don’t leave yet! 🥺',
    msgHi: 'You are leaving? Gkoo is so sad! 🥺 बस कुछ ही सवाल बचे हैं, पूरा करके ही जाओ ना!',
    msgEn: 'You are leaving? Gkoo is so sad! 🥺 Just a few questions left, let’s finish together!',
  },
  {
    titleHi: 'अरे रुकिए! मत जाइए ना! 💔',
    titleEn: 'Please don’t give up now! 💔',
    msgHi: 'आपकी मेहनत और स्ट्रीक बहुत कीमती है! अगर अभी छोड़ दिया तो प्रोग्रेस सेव नहीं होगी... 😢',
    msgEn: 'Your hard work and streak are so precious! If you leave now, your progress won’t be saved... 😢',
  },
  {
    titleHi: 'Gkoo बहुत उदास हो जाएगा... 😭',
    titleEn: 'Gkoo is feeling so heartbroken... 😭',
    msgHi: 'इतनी अच्छी तैयारी चल रही है! थोड़े से सवाल और बाकी हैं, Gkoo पर भरोसा रखो! ✨',
    msgEn: 'You were doing so well! Just a few more questions, Gkoo believes in you! ✨',
  },
  {
    titleHi: 'हार मत मानो चैंपियन! 🦁',
    titleEn: 'Never give up, Champion! 🦁',
    msgHi: 'असली टॉपर्स बीच में कभी नहीं रुकते! आप यह टेस्ट आसानी से जीत सकते हो! 🚀',
    msgEn: 'True toppers never stop midway! You have what it takes to conquer this stage! 🚀',
  },
  {
    titleHi: 'थोड़ी सी और कोशिश! 🌟',
    titleEn: 'Just one more step! 🌟',
    msgHi: 'जीत बस कुछ ही कदम दूर है! प्लीज टेस्ट पूरा कर लो ना! 🥺💕',
    msgEn: 'Victory is just around the corner! Please stay and finish the test! 🥺💕',
  },
];

// Helper to shuffle options and question order on level retries
const shuffleQuestionsAndOptions = (rawList: QuizQuestion[]): QuizQuestion[] => {
  return rawList.map((q) => {
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    return {
      ...q,
      options: shuffledOptions,
    };
  });
};

// Synchronously loads questions from cached level storage or in-memory synced categories
function getSynchronousQuizQuestions(
  categoryId: string | undefined,
  bookmarks: any[],
  lang: 'hi' | 'en'
): QuizQuestion[] {
  const cat = categoryId || 'india';

  if (cat === 'saved') {
    if (bookmarks && bookmarks.length > 0) {
      return bookmarks.map(b => ({
        id: b.id,
        text: b.text,
        options: b.options,
        answer: b.answer,
        explanation: b.explanation,
        category: b.category || "Saved Questions",
      }));
    }
    return [];
  }

  if (cat === 'mistakes') {
    const pastMistakes = getAllIncorrectQuestions();
    return pastMistakes.slice(0, 15);
  }

  let levelCat = 'india';
  let levelNum: number | null = null;
  const isLevel = cat.startsWith('level-');

  if (isLevel) {
    const raw = cat.replace('level-', '');
    const lastDashIdx = raw.lastIndexOf('-');
    if (lastDashIdx !== -1) {
      levelCat = raw.substring(0, lastDashIdx);
      levelNum = parseInt(raw.substring(lastDashIdx + 1), 10);
    } else {
      levelNum = parseInt(raw, 10);
      levelCat = 'india';
    }

    if (levelNum) {
      try {
        const levelKey = `gkoo_level_q_${levelCat}_${levelNum}_${lang}`;
        const saved = localStorage.getItem(levelKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return filterQuestionsByLanguage(parsed, lang);
          }
        }
      } catch { }
    }
  }

  const activeCat = isLevel ? levelCat : cat;
  const synced = getSyncedQuestionsByCategory(activeCat, lang);
  if (synced && synced.length > 0) {
    if (isLevel && levelNum) {
      const startIdx = ((levelNum - 1) * 10) % synced.length;
      const slice = synced.slice(startIdx, startIdx + 10);
      return slice.length > 0 ? slice : synced.slice(0, 10);
    }
    return synced.slice(0, 10);
  }

  const fallback = getSyncedQuestionsByCategory('ssc_cgl', lang);
  if (fallback && fallback.length > 0) {
    if (isLevel && levelNum) {
      const startIdx = ((levelNum - 1) * 10) % fallback.length;
      const slice = fallback.slice(startIdx, startIdx + 10);
      return slice.length > 0 ? slice : fallback.slice(0, 10);
    }
    return fallback.slice(0, 10);
  }

  return [];
}

export default function Quiz() {

  const navigate = useNavigate();
  const { categoryId: rawCategoryId } = useParams();
  const categoryId = rawCategoryId || 'india';
  const [searchParams] = useSearchParams();
  const customTopic = searchParams.get('topic') || '';
  const customPrompt = searchParams.get('prompt') || '';
  const difficulty = (searchParams.get('diff') || 'medium') as 'easy' | 'medium' | 'hard';
  const questionCount = parseInt(searchParams.get('count') || '15', 10);

  const {
    addXp,
    soundEnabled,
    hapticsEnabled,
    geminiApiKey,
    lang,
    setLang,
    t,
    recordQuizResult,
    spendHeart,
    refillHearts,
    completeCategoryLevel,
    isOnline,
    categoryLevelProgress,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    examTimerEnabled,
    examTimerSeconds,
    recordCategoryAnswers,
    gems,
    addGems,
  } = useAppContext();

  const isSavedQuiz = categoryId === 'saved';
  const isMistakesQuiz = categoryId === 'mistakes' || searchParams.get('mistakes') === 'true';
  const isLevelQuiz = !!(categoryId && categoryId.startsWith('level-'));
  const isDailyChallenge = searchParams.get('daily') === 'true' || categoryId === 'daily';
  const isExamMockMode = searchParams.get('mode') === 'mock' || searchParams.get('mock') === 'true';
  let levelCategory = 'india';
  let levelNumber: number | null = null;

  if (isLevelQuiz && categoryId) {
    const raw = categoryId.replace('level-', '');
    const lastDashIdx = raw.lastIndexOf('-');
    if (lastDashIdx !== -1) {
      levelCategory = raw.substring(0, lastDashIdx);
      levelNumber = parseInt(raw.substring(lastDashIdx + 1), 10);
    } else {
      levelNumber = parseInt(raw, 10);
      levelCategory = 'india';
    }
  }

  const levelConfig = (levelNumber && levelCategory) ? getCategoryLevelConfig(levelCategory, levelNumber) : null;
  const categoryInfo = getCategoryInfo(levelCategory);

  const isResumeMode = searchParams.get('resume') === 'true';
  const savedResumeSession = (() => {
    if (!isResumeMode) return null;
    try {
      const raw = localStorage.getItem('gkoo_active_quiz_session');
      if (raw) {
        const s = JSON.parse(raw);
        if (s && Array.isArray(s.questions) && s.questions.length > 0 && typeof s.currentIndex === 'number' && s.currentIndex < s.questions.length) {
          return s;
        }
      }
    } catch { }
    return null;
  })();

  const [quizHearts, setQuizHearts] = useState<number>(() => savedResumeSession?.quizHearts ?? 5);
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    if (savedResumeSession?.questions && savedResumeSession.questions.length > 0) {
      return savedResumeSession.questions;
    }
    try {
      const initial = getSynchronousQuizQuestions(categoryId, bookmarks, lang);
      if (initial && initial.length > 0) {
        return shuffleQuestionsAndOptions(initial);
      }
    } catch { }
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (savedResumeSession?.questions?.length) return false;
    return questions.length === 0;
  });
  const [isOfflineQuiz, setIsOfflineQuiz] = useState(false);
  const [isOfflineBlocked, setIsOfflineBlocked] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showAdMobModal, setShowAdMobModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(() => savedResumeSession?.currentIndex ?? 0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isExplanationDismissed, setIsExplanationDismissed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [quitMessageIdx, setQuitMessageIdx] = useState(0);

  // Controlled 2-second delayed reveal for options to give reading focus
  const [showOptions, setShowOptions] = useState(false);

  // Lifelines States
  const [removedOptions, setRemovedOptions] = useState<string[]>([]);

  // Mistakes & Bookmarks & Timer States
  const [mistakesList, setMistakesList] = useState<MistakeRecord[]>(() => savedResumeSession?.mistakesList ?? []);
  const [showMistakesModal, setShowMistakesModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(examTimerSeconds || (isExamMockMode ? 30 : 20));
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  // Past Answer History for Back Arrow Question Review
  const [pastAnswers, setPastAnswers] = useState<Record<number, { userSelected: string; isCorrect: boolean; correctAnswer: string }>>({});
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);

  // Score and Gamified Combos
  const [correctCount, setCorrectCount] = useState<number>(() => savedResumeSession?.correctCount ?? 0);
  const [currentCombo, setCurrentCombo] = useState<number>(() => savedResumeSession?.currentCombo ?? 0);
  const [maxCombo, setMaxCombo] = useState<number>(() => savedResumeSession?.maxCombo ?? 0);
  const [bonusXp, setBonusXp] = useState<number>(() => savedResumeSession?.bonusXp ?? 0);
  const [earnedGems, setEarnedGems] = useState(0);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [nextUnlockedLevel, setNextUnlockedLevel] = useState<number | null>(null);

  const CATEGORY_TOPICS_EN: Record<string, string> = {
    india: "India GK, States, Monuments, Freedom Struggle & Geography",
    world: "World Geography, International Capitals, Wonders & Oceans",
    subjects: "Science Inventions, Biology, Physics & Modern Tech",
    mix: "Mix Potpourri GK & General Knowledge",
    ai: "Current Affairs & Space Discoveries 2026",
  };

  const CATEGORY_TOPICS_HI: Record<string, string> = {
    india: "भारत का इतिहास, राज्य, धरोहर और भूगोल",
    world: "विश्व भूगोल, राजधानियां, महासागर और स्मारक",
    subjects: "सामान्य विज्ञान, भौतिकी, जीवविज्ञान और खोजें",
    mix: "मिश्रित सामान्य ज्ञान और तथ्य",
    ai: "दैनिक करेंट अफेयर्स और अंतरिक्ष खोजें 2026",
  };

  const loadQuizData = async () => {
    if (questions.length === 0) {
      setIsLoading(true);
    }
    setQuizHearts(5);
    setCurrentIndex(0);
    setCorrectCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setBonusXp(0);
    setPastAnswers({});
    setReviewIndex(null);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setEarnedStars(0);
    setNextUnlockedLevel(null);
    setIsSpeaking(false);

    let topicName = customTopic;
    let effectiveDifficulty = difficulty;
    let effectiveCount = questionCount;

    if (levelConfig) {
      topicName = lang === 'hi' ? levelConfig.topicPromptHi : levelConfig.topicPromptEn;
      effectiveDifficulty = levelConfig.difficulty;
      effectiveCount = levelConfig.questionCount;
    } else if (isDailyChallenge) {
      // Rotate through 8 diverse curiosity-packed fact domains based on day of the year
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      const DAILY_THEMES = [
        {
          hi: 'अंतरिक्ष के अनसुलझे रहस्य, ब्लैक होल, नासा व इसरो खोजें और ब्रह्मांड के हैरतअंगेज तथ्य (Did You Know Space Facts)',
          en: 'Mysteries of Space, Black Holes, NASA & ISRO Discoveries, Cosmic Wonders and Mind-Blowing Astronomy Facts'
        },
        {
          hi: 'जीव-जंतु जगत के अविश्वसनीय तथ्य, दुर्लभ समुद्री जीव, विचित्र पशु क्षमताएं और प्रकृति के रहस्य (Amazing Animal Facts)',
          en: 'Unbelievable Animal Kingdom Secrets, Deep Sea Creatures, Strange Wildlife Abilities & Bizarre Nature Facts'
        },
        {
          hi: 'मानव शरीर और मस्तिष्क के हैरतअंगेज विज्ञान तथ्य, डीएनए और जैविक चमत्कार (Fascinating Human Body Facts)',
          en: 'Astonishing Human Body & Brain Science, DNA Wonders, Neurological Curiosities & Medical Marvels'
        },
        {
          hi: 'प्राचीन सभ्यताएं, ऐतिहासिक रहस्यमयी स्मारक, अनोखे आविष्कार और भारत व विश्व धरोहर (Ancient Mysteries & Inventions)',
          en: 'Ancient Lost Civilizations, Archaeological Marvels, Historical Inventions & Hidden Heritage Facts'
        },
        {
          hi: 'पृथ्वी के सबसे अनोखे स्थान, विचित्र भौगोलिक घटनाएं, रहस्यमयी मौसम और प्राकृतिक रिकॉर्ड (Extreme Geography Facts)',
          en: 'Bizarre Earth Geography, Extreme Natural Phenomena, Mysterious Places & World Wonders'
        },
        {
          hi: 'क्वांटम भौतिकी, भविष्य की तकनीक, रोबोटिक्स, एआई और आधुनिक विज्ञान के चमत्कारी तथ्य (Future Science & Tech Facts)',
          en: 'Quantum Physics Wonders, AI & Robotics Breakthroughs, Futuristic Tech & Science Curiosities'
        },
        {
          hi: 'अविश्वसनीय गिनीज वर्ल्ड रिकॉर्ड्स, इंसानी कारनामे, खेल इतिहास के रोचक क्षण और अनोखे तथ्य (Unbelievable World Records)',
          en: 'Fascinating Guinness World Records, Incredible Human Feats, Sports History Curiosities & Unique Trivia'
        },
        {
          hi: 'रोचक ऐतिहासिक घटनाएं, अनसुलझे रहस्य, गुप्त शहर और ऐतिहासिक रोचक तथ्य (Fascinating History Trivia)',
          en: 'Intriguing World & Indian History Oddities, Hidden Forts, Historical Paradoxes & Strange True Facts'
        }
      ];

      const chosenTheme = DAILY_THEMES[dayOfYear % DAILY_THEMES.length];
      topicName = lang === 'hi' ? chosenTheme.hi : chosenTheme.en;
      effectiveDifficulty = 'medium';
      effectiveCount = 10;
    } else if (!customTopic) {
      const catKey = categoryId || 'mix';
      const defaultTopic = lang === 'hi'
        ? (CATEGORY_TOPICS_HI[catKey] || CATEGORY_TOPICS_HI.mix)
        : (CATEGORY_TOPICS_EN[catKey] || CATEGORY_TOPICS_EN.mix);
      topicName = defaultTopic;
    }

    const levelQuestionsKey = (isLevelQuiz && levelNumber)
      ? `gkoo_level_q_${levelCategory}_${levelNumber}_${lang}`
      : null;

    let generated: QuizQuestion[] = [];

    const isCurrentlyOffline = !isOnline || (typeof navigator !== 'undefined' && !navigator.onLine);
    const isPassedLevel = isLevelQuiz && levelNumber
      ? !!categoryLevelProgress[levelCategory]?.[levelNumber]?.completed
      : false;

    setIsOfflineBlocked(false);

    // If practicing saved questions
    if (isSavedQuiz) {
      if (bookmarks.length === 0) {
        navigate('/');
        return;
      }
      generated = bookmarks.map(b => ({
        id: b.id,
        text: b.text,
        options: b.options,
        answer: b.answer,
        explanation: b.explanation,
        category: b.category || "Saved Questions",
      }));
    } else if (isMistakesQuiz) {
      const pastMistakes = getAllIncorrectQuestions();
      if (pastMistakes.length === 0) {
        navigate('/');
        return;
      }
      generated = pastMistakes.slice(0, 15);
    } else {
      // 1. First check if questions were already generated & cached for this level in localStorage
      if (levelQuestionsKey) {
        try {
          const saved = localStorage.getItem(levelQuestionsKey);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Check if cached questions are duplicates of other levels (from prior bug)
              if (isLevelQuiz && levelNumber && isLevelCacheCorruptedWithDuplicates(levelCategory, levelNumber, parsed)) {
                console.warn(`[Quiz] Level ${levelNumber} cache has duplicate questions from prior levels, regenerating clean unique questions...`);
                generated = [];
              } else if (isPassedLevel) {
                generated = [];
              } else {
                generated = filterQuestionsByLanguage(parsed, lang);
                if (isLevelQuiz && levelNumber) {
                  saveCategoryAssignedQuestions(levelCategory, levelNumber, parsed);
                }
              }
            }
          }
        } catch (e) {
          // Fallback to generation
        }
      }

      if (generated.length === 0) {
        // Load questions directly from bundled CSV / Google Sheets for all 26 categories
        const activeCat = isLevelQuiz ? levelCategory : (categoryId || 'mix');

        // 1. Check if questions for this category are already in memory or cached
        let syncedForCat = getSyncedQuestionsByCategory(activeCat, lang);

        // 2. If not in memory yet, auto-load from bundled CSV (or Google Sheet if online)
        if (syncedForCat.length === 0) {
          syncedForCat = await syncCategoryQuestions(activeCat, lang);
        }

        // 3. Fallback to SSC CGL / India question bank if still empty
        if (syncedForCat.length === 0) {
          syncedForCat = getSyncedQuestionsByCategory('ssc_cgl', lang);
          if (syncedForCat.length === 0) {
            syncedForCat = await syncCategoryQuestions('ssc_cgl', lang);
          }
        }

        if (syncedForCat.length > 0) {
          if (isLevelQuiz && levelNumber) {
            const startIdx = ((levelNumber - 1) * 10) % syncedForCat.length;
            const slice = syncedForCat.slice(startIdx, startIdx + 10);
            generated = slice.length > 0 ? slice : syncedForCat.slice(0, 10);
          } else {
            const count = effectiveCount || 10;
            generated = [...syncedForCat].sort(() => Math.random() - 0.5).slice(0, count);
          }

          if (levelQuestionsKey && generated.length > 0) {
            try {
              localStorage.setItem(levelQuestionsKey, JSON.stringify(generated));
            } catch (e) { }
            if (isLevelQuiz && levelNumber) {
              saveCategoryAssignedQuestions(levelCategory, levelNumber, generated);
            }
          }
        }
      }

      try {
        if (generated.length === 0) {
          generated = await generateAiQuiz(geminiApiKey, {
            topic: topicName,
            categoryId: isLevelQuiz ? levelCategory : (categoryId || 'mix'),
            levelNumber: isLevelQuiz ? (levelNumber || undefined) : undefined,
            customPrompt: customPrompt || undefined,
            difficulty: effectiveDifficulty,
            count: effectiveCount,
            lang
          }, lang);

          // Save the 1st-time generated questions for this level permanently
          if (levelQuestionsKey && generated.length > 0) {
            try {
              localStorage.setItem(levelQuestionsKey, JSON.stringify(generated));
              if (isLevelQuiz && levelNumber) {
                saveCategoryAssignedQuestions(levelCategory, levelNumber, generated);
              }
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('[Quiz] Error loading questions:', err);
        try {
          generated = await generateAiQuiz('', {
            categoryId: isLevelQuiz ? levelCategory : (categoryId || 'mix'),
            count: effectiveCount,
            lang
          }, lang);
        } catch {
          // ignore
        }
      }
    }

    setIsOfflineQuiz(isCurrentlyOffline);
    setMistakesList([]);

    setQuestions(shuffleQuestionsAndOptions(filterQuestionsByLanguage(generated, lang)));
    setIsLoading(false);
  };

  const handleRestartSameQuiz = () => {
    stopSpeech();
    setShowMistakesModal(false);
    setQuestions(prev => shuffleQuestionsAndOptions(prev));
    setCurrentIndex(0);
    setQuizHearts(5);
    setCorrectCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setBonusXp(0);
    setMistakesList([]);
    setPastAnswers({});
    setReviewIndex(null);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setIsSpeaking(false);
    setRemovedOptions([]);
    refillHearts();
  };

  const handleRetestMistakes = () => {
    setShowMistakesModal(false);
    if (mistakesList.length === 0) return;
    const missedQuestions = mistakesList.map(m => m.question);
    setQuestions(shuffleQuestionsAndOptions(missedQuestions));
    setMistakesList([]);
    setCurrentIndex(0);
    setQuizHearts(5);
    setCorrectCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setBonusXp(0);
    setPastAnswers({});
    setReviewIndex(null);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setIsSpeaking(false);
    setRemovedOptions([]);
    refillHearts();
  };

  const handleStartNextLevel = (targetLvl: number) => {
    stopSpeech();
    triggerHaptic('click', hapticsEnabled);
    navigate(`/quiz/level-${levelCategory}-${targetLvl}`);
  };

  useEffect(() => {
    if (isResumeMode && savedResumeSession) {
      return;
    }
    loadQuizData();
  }, [categoryId, customTopic, customPrompt, difficulty, questionCount, geminiApiKey]);

  // Persist in-progress active quiz session so user can resume from Dashboard
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !isLoading) {
      try {
        const fullUrl = window.location.pathname + window.location.search.replace(/[?&]resume=true/g, '');
        const sessionData = {
          url: fullUrl,
          categoryId: categoryId || 'mix',
          levelCategory: levelCategory || 'india',
          levelNumber: levelNumber ?? null,
          isLevelQuiz,
          categoryTitle: categoryInfo ? (lang === 'hi' ? categoryInfo.titleHi : categoryInfo.titleEn) : (categoryId || 'General Knowledge'),
          currentIndex,
          totalQuestions: questions.length,
          questions,
          quizHearts,
          correctCount,
          currentCombo,
          maxCombo,
          bonusXp,
          mistakesList,
          timestamp: Date.now(),
        };
        localStorage.setItem('gkoo_active_quiz_session', JSON.stringify(sessionData));
        if (levelCategory) {
          localStorage.setItem('gkoo_last_active_category', levelCategory);
        } else if (categoryId && !categoryId.startsWith('level-') && categoryId !== 'mix') {
          localStorage.setItem('gkoo_last_active_category', categoryId);
        }
      } catch { }
    }
  }, [currentIndex, questions, quizHearts, correctCount, currentCombo, maxCombo, bonusXp, mistakesList, categoryId, levelCategory, levelNumber, isLevelQuiz, categoryInfo, lang, isLoading]);

  // Clear in-progress session when quiz finishes
  useEffect(() => {
    if (questions.length > 0 && currentIndex >= questions.length) {
      try {
        localStorage.removeItem('gkoo_active_quiz_session');
      } catch { }
    }
  }, [currentIndex, questions.length]);

  const isReviewMode = reviewIndex !== null;
  const activeDisplayIndex = isReviewMode ? reviewIndex : currentIndex;
  const currentQ = questions[activeDisplayIndex];
  const activePastRecord = isReviewMode ? pastAnswers[reviewIndex] : null;

  // Check if current mode is World Mode
  const isWorldMode = (() => {
    try {
      const saved = localStorage.getItem('gkoo_dashboard_region_mode');
      if (saved === 'world') return true;
    } catch { }
    const cat = (levelCategory || categoryId || '').toLowerCase();
    const WORLD_CATS = [
      'world', 'sub_english', 'sub_math', 'sub_physics', 'sub_biology', 'sub_chemistry',
      'sub_geography', 'sub_history', 'sub_political_science', 'sub_gk',
      'sub_psychology', 'sub_facts', 'sub_space', 'sub_philosophy'
    ];
    return WORLD_CATS.some(wc => cat.includes(wc));
  })();

  // Resolve clean badge tag above question (Strips all Indian exam names when in World Mode)
  const getCleanExamTag = (tag?: string): string => {
    if (!tag) {
      if (isWorldMode) {
        if (categoryInfo) return lang === 'hi' ? categoryInfo.titleHi : categoryInfo.titleEn;
        return lang === 'hi' ? 'विश्व ज्ञान' : 'World Knowledge';
      }
      return '';
    }

    if (isWorldMode) {
      // In World Mode: Completely strip out any Indian exam names e.g. "SSC CGL / RRB NTPC Physics Mechanics" -> "Physics Mechanics"
      const cleaned = tag
        .replace(/\b(SSC\s*(?:CGL|CHSL|MTS|GD|JE|CPO)?|RRB\s*(?:NTPC|Group\s*D|ALP)?|UPPSC|UPSC|BPSC|MPPSC|RPSC|Railway|State\s*Exam|Govt\s*Exam|Police|PYQ|Tier-[12]|Prelims)\b[\s/,-]*/gi, '')
        .replace(/^[\s/,-]+|[\s/,-]+$/g, '')
        .trim();

      if (cleaned.length > 2) {
        return cleaned;
      }

      // If stripped text is empty or too short, show clean subject/category name
      if (categoryInfo) {
        return lang === 'hi' ? categoryInfo.titleHi : categoryInfo.titleEn;
      }
      return lang === 'hi' ? 'विश्व ज्ञान' : 'World Knowledge';
    }

    return tag;
  };

  const displayExamTag = getCleanExamTag(currentQ?.examTag);

  // Controlled 2-second delayed reveal for options to give reading focus (only on question index change)
  useEffect(() => {
    setShowOptions(false);
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Exam Countdown Timer Effect (paused during review of past questions)
  const isTimerActive = (examTimerEnabled || isExamMockMode) && !isReviewMode;

  useEffect(() => {
    if (!isTimerActive || isAnswerChecked || isLoading || !currentQ || currentIndex >= questions.length) {
      return;
    }

    setTimeLeft(examTimerSeconds || (isExamMockMode ? 30 : 20));
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isAnswerChecked) {
            handleTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, isAnswerChecked, isLoading, isTimerActive, examTimerSeconds, currentQ, isExamMockMode]);

  const handleTimeout = () => {
    if (isAnswerChecked || !currentQ) return;
    stopSpeech();
    setIsSpeaking(false);
    setIsCorrect(false);
    setIsAnswerChecked(true);

    // Record mistake
    setMistakesList(prev => [...prev, { question: currentQ, userAnswer: '' }]);
    setPastAnswers(prev => ({
      ...prev,
      [currentIndex]: {
        userSelected: '',
        isCorrect: false,
        correctAnswer: currentQ.answer
      }
    }));
    recordQuestionAnswer(currentQ, false, isLevelQuiz ? levelCategory : (categoryId || 'mix'));
    recordCategoryAnswers(isLevelQuiz ? levelCategory : (categoryId || 'mix'), 1, 0);

    if (!isDailyChallenge && !isSavedQuiz && !isExamMockMode) {
      setQuizHearts(prev => Math.max(0, prev - 1));
      spendHeart();
    }
    setCurrentCombo(0);
    playSound('error', soundEnabled);
    triggerHaptic('error', hapticsEnabled);
  };

  const handleSelect = (option: string) => {
    if (isAnswerChecked) return;
    stopSpeech();
    setIsSpeaking(false);
    setSelectedOption(option);
  };

  const handleCheck = () => {
    try {
      if (!selectedOption || !currentQ || isAnswerChecked) return;
      stopSpeech();
      setIsSpeaking(false);

      const correct = selectedOption === currentQ.answer;
      setIsCorrect(correct);
      setIsAnswerChecked(true);
      setIsExplanationDismissed(false);

      // Record in past answers for reviewing previous questions
      setPastAnswers(prev => ({
        ...prev,
        [currentIndex]: {
          userSelected: selectedOption,
          isCorrect: correct,
          correctAnswer: currentQ.answer
        }
      }));

      // Track category accuracy safely
      try {
        const activeCatKey = isLevelQuiz ? levelCategory : (categoryId || 'mix');
        recordCategoryAnswers(activeCatKey, 1, correct ? 1 : 0);
        recordQuestionAnswer(currentQ, correct, activeCatKey);
      } catch (trackErr) {
        console.warn('[Quiz] Error recording answer tracking:', trackErr);
      }

      if (correct) {
        const nextCombo = currentCombo + 1;
        setCurrentCombo(nextCombo);
        setMaxCombo(prev => Math.max(prev, nextCombo));
        setCorrectCount(prev => prev + 1);

        if (nextCombo >= 2) {
          setBonusXp(prev => prev + 5);
          playSound('combo', soundEnabled);
        } else {
          playSound('success', soundEnabled);
        }
        triggerHaptic('success', hapticsEnabled);
      } else {
        // Record in mistakes list for end-of-quiz review & re-test
        setMistakesList(prev => [...prev, { question: currentQ, userAnswer: selectedOption }]);

        if (!isDailyChallenge && !isSavedQuiz && !isExamMockMode) {
          setQuizHearts(prev => Math.max(0, prev - 1));
          spendHeart();
        }
        setCurrentCombo(0);
        playSound('error', soundEnabled);
        triggerHaptic('error', hapticsEnabled);
      }
    } catch (err) {
      console.error('[Quiz] Exception in handleCheck:', err);
    }
  };

  const handleBookmarkCurrent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentQ) return;
    triggerHaptic('success', hapticsEnabled);
    const added = toggleBookmark(currentQ);
    setBookmarkToast(added ? t('questionSavedToast') : t('questionRemovedToast'));
    setTimeout(() => setBookmarkToast(null), 2500);
  };

  const toggleSpeakQuestion = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      triggerHaptic('click', hapticsEnabled);
    } else if (currentQ) {
      triggerHaptic('click', hapticsEnabled);
      setIsSpeaking(true);
      const textToSpeak = `${currentQ.text}. ${lang === 'hi' ? 'विकल्प हैं:' : 'Options are:'} ${currentQ.options.join(', ')}`;
      speakText(textToSpeak, lang, () => setIsSpeaking(false));
    }
  };



  const toggleQuizLanguage = () => {
    triggerHaptic('click', hapticsEnabled);
    stopSpeech();
    setIsSpeaking(false);
    const nextLang = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
    setShowOptions(true);
    try {
      localStorage.setItem('lang', nextLang);
    } catch { }

    const currentSelectedIdx = (currentQ && selectedOption)
      ? currentQ.options.indexOf(selectedOption)
      : -1;

    setQuestions(prev => {
      let updated = filterQuestionsByLanguage(prev, nextLang);
      const needsFallback = updated.some(q => (nextLang === 'en' ? !q.textEn : !q.textHi));
      if (needsFallback && isLevelQuiz && levelNumber) {
        try {
          const nextLangKey = `gkoo_level_q_${levelCategory}_${levelNumber}_${nextLang}`;
          const cached = localStorage.getItem(nextLangKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length === prev.length) {
              updated = parsed;
            }
          }
        } catch { }
      }
      return updated;
    });

    // Keep selected option in sync with option at same index in new language
    if (currentQ && currentSelectedIdx >= 0) {
      const updatedCurrentQ = filterQuestionsByLanguage([currentQ], nextLang)[0];
      if (updatedCurrentQ && updatedCurrentQ.options[currentSelectedIdx]) {
        setSelectedOption(updatedCurrentQ.options[currentSelectedIdx]);
      }
    }
  };

  // Stop speech when question changes or unmounts
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    return () => {
      stopSpeech();
    };
  }, [currentIndex, reviewIndex]);

  const handleGoBack = () => {
    triggerHaptic('click', hapticsEnabled);
    stopSpeech();
    setIsSpeaking(false);
    if (isReviewMode) {
      if (reviewIndex !== null && reviewIndex > 0) {
        setReviewIndex(reviewIndex - 1);
        setShowOptions(true);
      }
    } else {
      if (currentIndex > 0) {
        setReviewIndex(currentIndex - 1);
        setShowOptions(true);
      }
    }
  };

  const handleGoForward = () => {
    triggerHaptic('click', hapticsEnabled);
    stopSpeech();
    setIsSpeaking(false);
    if (isReviewMode && reviewIndex !== null) {
      if (reviewIndex < currentIndex - 1) {
        setReviewIndex(reviewIndex + 1);
        setShowOptions(true);
      } else {
        setReviewIndex(null);
      }
    }
  };

  const handleReturnToCurrent = () => {
    triggerHaptic('click', hapticsEnabled);
    stopSpeech();
    setIsSpeaking(false);
    setReviewIndex(null);
  };

  const handleNext = () => {
    stopSpeech();
    setIsSpeaking(false);
    const isLast = currentIndex === questions.length - 1;

    if (isLast) {
      const finalCorrect = correctCount + (isCorrect ? 1 : 0);
      const finalAccuracy = Math.round((finalCorrect / questions.length) * 100);

      let baseReward = levelConfig ? levelConfig.xpReward : 50;

      // If Daily Challenge, calculate XP out of 100 deducting proportionally for each wrong answer
      if (isDailyChallenge) {
        baseReward = Math.max(0, Math.round((finalCorrect / questions.length) * 100));

        // Mark Daily Challenge completed for today
        try {
          const today = new Date().toISOString().split('T')[0];
          localStorage.setItem('gkoo_daily_challenge_completed_date', today);
          window.dispatchEvent(new Event('gkoo_daily_completed'));
        } catch (e) {
          // ignore
        }
      }

      const totalXpEarned = baseReward + bonusXp;

      // Calculate Gems reward based on accuracy and performance
      let gemsReward = 15;
      if (finalAccuracy >= 90) gemsReward = 25;
      else if (finalAccuracy >= 65) gemsReward = 20;
      if (quizHearts === 5) gemsReward += 5; // Flawless bonus!

      setEarnedGems(gemsReward);
      addXp(totalXpEarned);
      recordQuizResult(questions.length, finalCorrect, Math.max(maxCombo, currentCombo), gemsReward);
      playSound('complete', soundEnabled);

      if (isLevelQuiz && levelNumber) {
        const result = completeCategoryLevel(levelCategory, levelNumber, finalAccuracy, totalXpEarned);
        setEarnedStars(result.starsEarned);
        setNextUnlockedLevel(result.nextUnlocked);
      }
    }

    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsExplanationDismissed(false);
    setIsCorrect(null);
    setRemovedOptions([]);
    setReviewIndex(null);
    setCurrentIndex(prev => prev + 1);
  };


  // Google Play Store 5-Star Rating Prompt (Android App Only)
  useEffect(() => {
    if (currentIndex >= questions.length && questions.length > 0 && isAndroidApp()) {
      const finalAccuracy = Math.round((correctCount / questions.length) * 100);
      if (finalAccuracy >= 65) {
        try {
          const hasRated = localStorage.getItem('gkoo_has_rated_app');
          const lastPrompt = localStorage.getItem('gkoo_last_rate_prompt');
          const now = Date.now();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

          if (!hasRated && (!lastPrompt || (now - parseInt(lastPrompt, 10)) > sevenDaysMs)) {
            const timer = setTimeout(() => {
              setShowRateModal(true);
            }, 1800);
            return () => clearTimeout(timer);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [currentIndex, questions.length, correctCount]);

  // Offline Blocked Screen (Shown when trying to play an unpassed new level or online-only quiz while offline)
  if (isOfflineBlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-[max(env(safe-area-inset-top,0px),30px)] pb-[max(env(safe-area-inset-bottom,0px),28px)] text-center max-w-md mx-auto bg-[#FCF9F7] dark:bg-[#0B0F19] select-none">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-lg mx-auto">
            <WifiOff className="w-10 h-10 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1.5 shadow-sm">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        </div>

        <div className="my-1">
          <Mascot size="md" mood="sad" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-2 mb-2">
          {lang === 'hi' ? 'इंटरनेट कनेक्शन आवश्यक है!' : "Internet Connection Required!"}
        </h2>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 mb-6 text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-xs leading-relaxed space-y-2 text-left shadow-xs">
          <p>
            {lang === 'hi' ? (
              <>
                🌐 <strong>लाइव टेस्ट मोड:</strong> सभी प्रश्न सीधे आधिकारिक <strong>Google Sheets</strong> से लोड होते हैं। क्विज खेलने के लिए सक्रिय इंटरनेट कनेक्शन आवश्यक है।
              </>
            ) : (
              <>
                🌐 <strong>Live Quiz Mode:</strong> All questions are loaded directly from the official <strong>Google Sheets</strong>. An active internet connection is required to play.
              </>
            )}
          </p>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === 'hi'
              ? 'कृपया अपना Wi-Fi या मोबाइल डेटा चालू करें और "इंटरनेट दोबारा जाँचें" पर टैप करें।'
              : 'Please enable Wi-Fi or Mobile Data and tap "Check Connection / Retry".'}
          </p>
        </div>

        <div className="space-y-3 w-full max-w-xs">
          {/* Retry Connection Button */}
          <button
            onClick={() => {
              triggerHaptic('click', hapticsEnabled);
              const isNowOnline = typeof navigator !== 'undefined' ? navigator.onLine : isOnline;
              if (isNowOnline) {
                setIsOfflineBlocked(false);
                loadQuizData();
              } else {
                playSound('error', soundEnabled);
                triggerHaptic('error', hapticsEnabled);
                alert(lang === 'hi' ? 'अभी भी इंटरनेट कनेक्ट नहीं है! कृपया Wi-Fi या मोबाइल डेटा चालू करें।' : 'Still offline! Please enable Wi-Fi or Mobile Data.');
              }
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-3.5 rounded-2xl shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'hi' ? 'इंटरनेट दोबारा जाँचें (Retry)' : 'Check Connection / Retry'}</span>
          </button>

          {/* Go to Passed Levels button */}
          <button
            onClick={() => {
              triggerHaptic('click', hapticsEnabled);
              navigate('/');
            }}
            className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-black py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-98 transition-all cursor-pointer shadow-xs"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>{lang === 'hi' ? 'पास किए लेवल्स खेलें (Back to Levels)' : 'Choose Completed Level'}</span>
          </button>
        </div>
      </div>
    );
  }

  // If questions are still loading on cold start, show clean minimal loader (no mascot popup)
  if (isLoading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center bg-[#FCF9F7] dark:bg-[#0B0F19]">
        <div className="w-10 h-10 rounded-full border-3 border-[#FF5F6D] border-t-transparent animate-spin mb-3" />
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {lang === 'hi' ? 'सवाल तैयार हो रहे हैं...' : 'Loading questions...'}
        </span>
      </div>
    );
  }

  // Out of Hearts Game Over Screen (When all 5 hearts are lost in this quiz)
  if (!isDailyChallenge && !isExamMockMode && quizHearts <= 0 && isAnswerChecked && !isCorrect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-[max(env(safe-area-inset-top,0px),30px)] pb-[max(env(safe-area-inset-bottom,0px),28px)] text-center max-w-md md:max-w-xl mx-auto bg-[#FCF9F7] dark:bg-[#0B0F19]">
        <Mascot size="lg" mood="sad" message={lang === 'hi' ? 'ओह नहीं! सारे हार्ट्स खत्म हो गए 💔' : 'Out of Hearts! 💔'} />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          {lang === 'hi' ? 'सभी 5 हार्ट्स समाप्त हो गए! 💔' : 'Out of Hearts (5/5 Lost)! 💔'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-300 font-medium max-w-xs mb-6 leading-relaxed">
          {lang === 'hi'
            ? 'आप 5 गलत उत्तर देने के कारण बाहर हो गए हैं। आप इन्हीं समान 10 प्रश्नों के साथ दोबारा टेस्ट शुरू कर सकते हैं!'
            : 'You used up all 5 hearts in this quiz. You can restart the test with the exact same 10 questions!'}
        </p>
        <div className="space-y-3 w-full">
          {/* Option A: Watch Ad to Refill (ONLY on Android App) */}
          {isAndroidApp() ? (
            <button
              onClick={() => {
                triggerHaptic('click', hapticsEnabled);
                setShowAdMobModal(true);
              }}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#065F46] active:translate-y-0.5 active:shadow-none text-xs flex items-center justify-center space-x-2 animate-pulse cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{lang === 'hi' ? '🎬 वीडियो देखें और 5 हार्ट्स पाएँ (Free)' : '🎬 Watch Video to Refill 5 Hearts (Free)'}</span>
            </button>
          ) : (
            /* Option B: Refill with Gems on Web / Desktop */
            gems >= 30 && (
              <button
                onClick={() => {
                  addGems(-30);
                  refillHearts();
                  setQuizHearts(5);
                  playSound('success', soundEnabled);
                  triggerHaptic('success', hapticsEnabled);
                }}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none text-xs flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Gem className="w-4 h-4 fill-sky-200 text-sky-100 inline" />
                <span>{lang === 'hi' ? '30 जेम्स से 5 हार्ट्स रिफिल करें' : 'Refill 5 Hearts for 30 Gems'}</span>
              </button>
            )
          )}

          <button
            onClick={handleRestartSameQuiz}
            className="w-full bg-[#FF5F6D] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#D93848] active:translate-y-0.5 active:shadow-none text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'hi' ? 'दोबारा टेस्ट दें' : 'Restart Test'}</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs cursor-pointer"
          >
            {t('returnHome')}
          </button>
        </div>

        {/* AdMob Rewarded Video Modal for Android */}
        <AdMobRewardModal
          isOpen={showAdMobModal}
          onClose={() => setShowAdMobModal(false)}
          onRewardGranted={() => {
            refillHearts();
            setQuizHearts(5);
            setShowAdMobModal(false);
          }}
        />
      </div>
    );
  }

  // If questions are not loaded or empty, show retry state, NEVER "Level Cleared" with NaN%
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center bg-[#FCF9F7] dark:bg-[#0B0F19]">
        <Mascot mood="thinking" size="md" message={lang === 'hi' ? 'सवाल लोड हो रहे हैं...' : 'Loading questions...'} />
        <p className="mt-3 text-xs font-bold text-gray-500">
          {lang === 'hi' ? 'इस लेवल के सवाल तैयार किए जा रहे हैं।' : 'Preparing questions for this level.'}
        </p>
        <button
          onClick={() => {
            setIsLoading(true);
            loadQuizData();
          }}
          className="mt-4 px-6 py-2.5 bg-[#FF5F6D] hover:bg-[#E64553] text-white font-black rounded-2xl text-xs shadow-md active:scale-95 transition-all"
        >
          {lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry'}
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-2 text-xs font-bold text-gray-400 hover:text-gray-600"
        >
          {lang === 'hi' ? 'वापस जाएं' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // Quiz Completed Screen (Compact and fitting phone height cleanly)
  if (currentIndex >= questions.length) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const baseReward = levelConfig
      ? levelConfig.xpReward
      : (isDailyChallenge ? Math.max(0, Math.round((correctCount / questions.length) * 100)) : 50);
    const totalGained = baseReward + bonusXp;
    const incorrectCount = questions.length - correctCount;
    const nextTargetLevel = isLevelQuiz && levelNumber ? (nextUnlockedLevel || levelNumber + 1) : null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 py-3 md:py-6 text-center max-w-md mx-auto bg-[#FCF9F7] dark:bg-[#0B0F19]"
      >

        <Mascot
          message={
            isLevelQuiz && nextTargetLevel
              ? (lang === 'hi'
                ? `शानदार जीत! 🌟 अगला लेवल ${nextTargetLevel} खेलें? 🚀`
                : `Level ${levelNumber} Cleared! 🌟 Ready for Level ${nextTargetLevel}? 🚀`)
              : (isDailyChallenge ? "Daily Challenge Conquered! ⚡" : "Great job! Your streak continues! 🔥")
          }
          size="md"
          mood="celebrate"
        />

        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1.5 leading-tight">
          {isLevelQuiz ? `${categoryInfo.icon} Level ${levelNumber} Cleared! 🎉` : (isDailyChallenge ? (lang === 'hi' ? 'दैनिक चुनौती पूर्ण! ⚡' : "Today's Daily Challenge Cleared! ⚡") : t('quizCompleted'))}
        </h2>
        {isLevelQuiz && (
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
            {lang === 'hi' ? categoryInfo.titleHi : categoryInfo.titleEn}
          </p>
        )}

        {/* Offline Badge on Completion */}
        {isOfflineQuiz && (
          <div className="inline-flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-3 py-0.5 rounded-full text-[11px] font-black text-amber-800 dark:text-amber-300 mt-1 shadow-xs">
            <span>📡</span>
            <span>{lang === 'hi' ? 'ऑफलाइन मोड' : 'Offline Mode'}</span>
          </div>
        )}

        {/* 3-Star Rating Showcase on Level Finish */}
        {isLevelQuiz && (
          <div className="flex items-center justify-center space-x-2.5 my-2">
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -20 }}
                animate={{
                  scale: star <= earnedStars ? [0, 1.25, 1] : 1,
                  rotate: star <= earnedStars ? [0, 15, 0] : 0
                }}
                transition={{ delay: 0.2 + (star * 0.2), duration: 0.4, type: 'spring' }}
                className="relative"
              >
                <Star
                  className={`w-8 h-8 ${star <= earnedStars
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]'
                      : 'text-gray-300 dark:text-gray-700 fill-gray-100 dark:fill-gray-800/40'
                    }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Gkoo Next Level Card: Asks user and immediately switches on click */}
        {isLevelQuiz && nextTargetLevel && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring' }}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 p-3 rounded-2xl text-white shadow-lg my-2 border-2 border-emerald-300/40 relative overflow-hidden text-left"
          >
            <div className="flex items-center space-x-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
                <Zap className="w-4.5 h-4.5 fill-amber-300 text-amber-300 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black tracking-widest uppercase bg-white/20 px-1.5 py-0.5 rounded-full inline-block mb-0.5">
                  {lang === 'hi' ? 'अगला पड़ाव' : 'NEXT STAGE'}
                </span>
                <h3 className="text-xs sm:text-sm font-black leading-tight text-white drop-shadow-xs">
                  {lang === 'hi'
                    ? `Ready for Level ${nextTargetLevel}?`
                    : `Ready for Level ${nextTargetLevel}?`}
                </h3>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleStartNextLevel(nextTargetLevel)}
              className="w-full bg-white text-emerald-950 font-black py-2.5 px-3 rounded-xl shadow-[0_3px_0_0_#065F46] active:translate-y-0.5 active:shadow-none transition-all text-xs flex items-center justify-center space-x-1.5 cursor-pointer select-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500 shrink-0" />
              <span>{lang === 'hi' ? `हाँ, तुरंत अगला लेवल ${nextTargetLevel} खेलें! 🚀` : `Yes, Start Level ${nextTargetLevel} Now! 🚀`}</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3] shrink-0" />
            </motion.button>
          </motion.div>
        )}

        {/* Daily Challenge XP Breakdown Banner */}
        {isDailyChallenge && (
          <div className="w-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 p-2.5 rounded-xl my-2 text-xs text-amber-900 dark:text-amber-200 text-left">
            <div className="flex items-center justify-between font-black">
              <span className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 inline" />
                <span>{lang === 'hi' ? 'दैनिक चुनौती XP रिवॉर्ड' : 'Daily Challenge XP Reward'}</span>
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-xs">{baseReward} / 100 XP</span>
            </div>
            <p className="text-[10px] font-medium text-amber-700 dark:text-amber-400 mt-0.5">
              {lang === 'hi'
                ? (incorrectCount > 0
                  ? `${incorrectCount} गलत उत्तर (-10 XP प्रति गलत उत्तर)। कुल: +${totalGained} XP।`
                  : 'शानदार! सभी 10 सही उत्तर (+100 XP अर्जित)।')
                : (incorrectCount > 0
                  ? `${100 - baseReward} XP deducted for ${incorrectCount} wrong answers. Total: +${totalGained} XP.`
                  : 'Flawless! All 10 correct (+100 XP earned).')}
            </p>
          </div>
        )}

        {/* Mock Exam Official Scorecard Banner */}
        {isExamMockMode && (() => {
          const totalMarks = Number(Math.max(0, (correctCount * 2) - (incorrectCount * 0.5)).toFixed(2));
          const maxMarks = questions.length * 2;
          const percentage = Math.round((totalMarks / maxMarks) * 100);
          const isCleared = percentage >= 65;
          return (
            <div className="w-full bg-white dark:bg-[#13192B] border-2 border-purple-200 dark:border-purple-800/60 p-3 rounded-2xl my-2 shadow-sm text-left">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-700 dark:text-purple-300 shadow-inner">
                    <Landmark className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                      {lang === 'hi' ? 'प्रतियोगी परीक्षा स्कोरकार्ड' : 'Govt Exam Scorecard'}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-purple-600 dark:text-purple-400">
                    {totalMarks} <span className="text-[10px] font-bold text-gray-400">/ {maxMarks}</span>
                  </div>
                  <span className="text-[9px] font-black text-indigo-500">
                    {percentage}% Score
                  </span>
                </div>
              </div>

              {/* Marks breakup table */}
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs mb-2">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 block">
                    {lang === 'hi' ? 'सही (+2)' : 'Correct (+2)'}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-300">
                    +{correctCount * 2}
                  </span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-black text-rose-700 dark:text-rose-400 block">
                    {lang === 'hi' ? 'नेगेटिव (-0.5)' : 'Penalty (-0.5)'}
                  </span>
                  <span className="text-xs font-black text-rose-600 dark:text-rose-300">
                    -{Number((incorrectCount * 0.5).toFixed(2))}
                  </span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-1.5 rounded-lg">
                  <span className="text-[9px] font-black text-purple-700 dark:text-purple-400 block">
                    {lang === 'hi' ? 'सटीकता' : 'Accuracy'}
                  </span>
                  <span className="text-xs font-black text-purple-600 dark:text-purple-300">
                    {accuracy}%
                  </span>
                </div>
              </div>

              {/* Cut-off evaluation badge */}
              <div className={`p-2 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 ${isCleared
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}>
                {isCleared ? (
                  <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span className="leading-tight">
                  {lang === 'hi'
                    ? (isCleared
                      ? 'शानदार प्रदर्शन! आपने अनुमानित कट-ऑफ पार कर लिया है।'
                      : 'कट-ऑफ से कम स्कोर। कमजोर विषयों का पुनः अभ्यास करें।')
                    : (isCleared
                      ? 'Great! You cleared the estimated Qualifying Cut-off.'
                      : 'Score below Cut-off. Review mistakes and revise weak topics.')}
                </span>
              </div>
            </div>
          );
        })()}

        {/* 4 Stats Result Tiles Grid (Compact) */}
        <div className="grid grid-cols-4 gap-2 w-full my-2.5">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{t('accuracy')}</span>
            <span className={`text-base font-black ${accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
              {accuracy}%
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{t('xpEarned')}</span>
            <span className="text-base font-black text-amber-500 flex items-center justify-center space-x-0.5">
              <Zap className="w-3.5 h-3.5 fill-amber-500 inline" />
              <span>+{totalGained}</span>
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{t('bestComboLabel')}</span>
            <span className="text-base font-black text-orange-500 flex items-center justify-center space-x-0.5">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 inline" />
              <span>{maxCombo}x</span>
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700/80 shadow-2xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{t('gems')}</span>
            <span className="text-base font-black text-cyan-500 flex items-center justify-center space-x-0.5">
              <span>+{earnedGems}</span>
              <Gem className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 inline" />
            </span>
          </div>
        </div>

        <div className="space-y-2 w-full mt-1">
          {/* Review Mistakes Button (if user got any question wrong) */}
          {incorrectCount > 0 && mistakesList.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMistakesModal(true)}
              className="w-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 font-black py-2.5 rounded-xl transition-all text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {lang === 'hi'
                  ? `गलत उत्तरों की समीक्षा करें (${mistakesList.length} गलतियां)`
                  : `Review Mistakes (${mistakesList.length} Missed)`}
              </span>
            </motion.button>
          )}

          {/* Back to Level Map Button (Light Red theme color) */}
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#FF5F6D] hover:bg-[#E64553] text-white font-black py-3 rounded-2xl shadow-[0_4px_0_0_#D93848] active:translate-y-0.5 active:shadow-none transition-all text-xs cursor-pointer border-b-2 border-[#D93848]"
          >
            {isLevelQuiz ? (lang === 'hi' ? 'लेवल्स मैप पर लौटें' : 'Back to Level Map') : t('returnHome')}
          </button>

          {/* Try Again Button */}
          <button
            onClick={handleRestartSameQuiz}
            className="w-full bg-transparent text-gray-500 dark:text-gray-400 font-bold py-2 rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('tryAgain')}</span>
          </button>
        </div>

        {/* Rate Us on Google Play Modal (Android App Only) */}
        <RateAppModal
          isOpen={showRateModal}
          onClose={() => setShowRateModal(false)}
        />

        {/* Mistakes Review Modal */}
        <MistakesReviewModal
          isOpen={showMistakesModal}
          onClose={() => setShowMistakesModal(false)}
          mistakes={mistakesList}
          onRetest={handleRetestMistakes}
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-transparent flex flex-col justify-between pt-[max(env(safe-area-inset-top,0px),34px)] md:pt-4 pb-[max(env(safe-area-inset-bottom,0px),16px)] select-none">
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex-1 flex flex-col justify-between">

        {/* Top Section: HUD + Questions */}
        <div className="w-full">
          {/* Top Navigation HUD */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 mb-3 md:mb-6">
            {/* Top Left Actions: Close/Quit Cross + Compact Language & Level Badges */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => {
                  const randIdx = Math.floor(Math.random() * QUIT_MESSAGES.length);
                  setQuitMessageIdx(randIdx);
                  setShowQuitModal(true);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 sm:p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title={lang === 'hi' ? 'क्विज छोड़ें' : 'Quit quiz'}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              {/* Ultra-compact 1-Tap Language Toggle (हिन्दी / EN) */}
              <button
                type="button"
                onClick={toggleQuizLanguage}
                className="px-1.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-[11px] font-black flex items-center space-x-0.5 cursor-pointer transition-colors shrink-0"
                title={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              >
                <Languages className="w-3 h-3 text-[#FF5F6D]" />
                <span>{lang === 'hi' ? 'हिन्दी' : 'EN'}</span>
              </button>

              {/* Ultra-compact Current Active Level Badge (Lev / लेवल) */}
              {isLevelQuiz && levelNumber && (
                <div
                  className="px-1.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-300/80 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 font-black text-[11px] flex items-center space-x-0.5 shrink-0 shadow-2xs"
                  title={`Level ${levelNumber}`}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {lang === 'hi' ? 'लेवल' : 'Lev'}
                  </span>
                  <span className="text-[11px] font-black text-orange-600 dark:text-orange-400">
                    {levelNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Gkoo Progress Bar + Hearts */}
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="flex-1 bg-gray-200 dark:bg-gray-800 h-3.5 md:h-4 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[#FF7B7B] to-[#FF5F6D] h-full rounded-full transition-all duration-300"
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Offline Status Badge in Top Bar (Only when actually offline) */}
              {isOfflineQuiz && (
                <div
                  className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-700 dark:text-amber-300 shrink-0 shadow-xs"
                  title={lang === 'hi' ? 'ऑफलाइन सुरक्षित डेटा' : 'Offline Saved Data'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3 inline text-amber-600 dark:text-amber-400" />
                    <span>{lang === 'hi' ? 'ऑफलाइन सेव्ड' : 'Offline Saved'}</span>
                  </span>
                </div>
              )}

              {/* 5-Heart HUD Indicator or Unlimited Hearts for Daily Challenge / Mock Exam */}
              {isDailyChallenge ? (
                <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/15 to-rose-500/15 dark:from-amber-950/40 dark:to-rose-950/40 px-3 py-1.5 rounded-full border border-amber-300/60 dark:border-amber-700/50 shadow-xs shrink-0">
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-500 inline" />
                    <span>∞</span>
                    <Heart className="w-3.5 h-3.5 fill-[#FF5F6D] text-[#FF5F6D] inline" />
                  </span>
                  <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                    {lang === 'hi' ? 'नो हार्ट लॉस' : 'Free Hearts'}
                  </span>
                </div>
              ) : isExamMockMode ? (
                <div className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-500/15 to-indigo-500/15 dark:from-purple-950/40 dark:to-indigo-950/40 px-3 py-1.5 rounded-full border border-purple-300/60 dark:border-purple-700/50 shadow-xs shrink-0">
                  <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center space-x-1">
                    <Target className="w-3 h-3 text-purple-600 dark:text-purple-400 inline" />
                    <span>Mock Exam</span>
                  </span>
                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
                    +2 / -0.5 Mark
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50 shrink-0">
                  <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Heart
                        key={i}
                        className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform ${i <= quizHearts
                            ? 'fill-[#FF5F6D] text-[#FF5F6D]'
                            : 'text-gray-300 dark:text-gray-600 scale-90'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm font-black text-[#FF5F6D] ml-0.5">{quizHearts}</span>
                </div>
              )}
            </div>
          </div>



          {/* Offline Notification Banner */}
          {isOfflineQuiz && showOfflineBanner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 px-3.5 py-2 rounded-2xl mb-4 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-xs"
            >
              <div className="flex items-center space-x-2 truncate">
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {lang === 'hi'
                    ? 'ऑफलाइन मोड: पास किए गए स्तर का सुरक्षित डेटा लोड हुआ है'
                    : 'Offline Mode: Playing completed level from saved data'}
                </span>
              </div>
              <button
                onClick={() => setShowOfflineBanner(false)}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 p-0.5 ml-2 cursor-pointer shrink-0"
                title={lang === 'hi' ? 'बंद करें' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Question Prompt & Options Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDisplayIndex}
              initial={{ x: 25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -25, opacity: 0 }}
              className="w-full"
            >
              {/* Question Text Box with TTS & Bookmark */}
              <div className="w-full bg-white dark:bg-[#13192B] p-4.5 sm:p-6 rounded-3xl border border-gray-100 dark:border-indigo-950/80 shadow-sm mb-4 sm:mb-6 flex flex-col">
                {/* Top Action Row: Tag & Timer on Left, Bookmark & Audio on Right */}
                <div className="flex items-center justify-between gap-2 mb-3.5 w-full">
                  <div className="flex items-center flex-wrap gap-2 min-w-0">
                    {/* Back Arrow button to inspect previously passed questions */}
                    {(currentIndex > 0 || isReviewMode) && (
                      <button
                        type="button"
                        onClick={handleGoBack}
                        disabled={isReviewMode && reviewIndex === 0}
                        className={`p-1.5 rounded-xl border flex items-center justify-center transition-all ${isReviewMode && reviewIndex === 0
                            ? 'opacity-40 border-gray-200 dark:border-gray-800 text-gray-400 cursor-not-allowed'
                            : 'border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs active:scale-95 cursor-pointer'
                          }`}
                        title={lang === 'hi' ? 'पिछला सवाल देखें' : 'View Previous Question'}
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}

                    {/* Forward Arrow button when in review mode */}
                    {isReviewMode && (
                      <button
                        type="button"
                        onClick={handleGoForward}
                        className="p-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center"
                        title={reviewIndex! < currentIndex - 1 ? (lang === 'hi' ? 'अगला सवाल' : 'Next Question') : (lang === 'hi' ? 'वर्तमान सवाल पर लौटें' : 'Return to Current Question')}
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}

                    {/* Review Mode Indicator Badge */}
                    {isReviewMode && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider">
                        <span>{lang === 'hi' ? `समीक्षा: सवाल ${(reviewIndex ?? 0) + 1}` : `Review: Q${(reviewIndex ?? 0) + 1}`}</span>
                      </span>
                    )}

                    {/* Real Exam PYQ Tag Badge */}
                    {displayExamTag && (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-black shadow-2xs">
                        {isWorldMode ? (
                          <Globe className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        ) : (
                          <Landmark className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[200px] sm:max-w-none">{displayExamTag}</span>
                      </span>
                    )}

                    {/* Active Exam Timer countdown pill */}
                    {(examTimerEnabled || isExamMockMode) && !isAnswerChecked && !isReviewMode && (
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-black shadow-xs ${timeLeft <= 5
                          ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 text-rose-600 animate-pulse'
                          : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-700 dark:text-amber-300'
                        }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeLeft}s</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={handleBookmarkCurrent}
                      className={`p-2 rounded-2xl border transition-all ${isBookmarked(currentQ.text)
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-500 shadow-xs'
                          : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                        }`}
                      title={isBookmarked(currentQ.text) ? (lang === 'hi' ? 'बुकमार्क हटाया' : 'Remove Bookmark') : (lang === 'hi' ? 'बुकमार्क करें' : 'Bookmark Question')}
                    >
                      <Bookmark className={`w-5 h-5 ${isBookmarked(currentQ.text) ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Question TTS Audio Button (Toggles ON and OFF on 2nd press) */}
                    <button
                      type="button"
                      onClick={toggleSpeakQuestion}
                      className={`p-2 rounded-2xl border transition-all cursor-pointer ${isSpeaking
                          ? 'border-[#FF5F6D] bg-rose-50 dark:bg-rose-950/40 text-[#FF5F6D] shadow-xs'
                          : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:text-[#FF5F6D] hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                        }`}
                      title={
                        isSpeaking
                          ? (lang === 'hi' ? 'आवाज़ बंद करें' : 'Stop Reading')
                          : (lang === 'hi' ? 'सवाल और विकल्प सुनें' : 'Read Question & Options Aloud')
                      }
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-5 h-5 text-[#FF5F6D] animate-pulse" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Text takes the FULL width of the card across left to right */}
                <h2 className="w-full text-base sm:text-lg md:text-xl font-black text-gray-800 dark:text-white leading-relaxed text-left">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options Section: 2-second Delayed Reveal (Skipped in Review Mode) */}
              <div className="w-full mt-2 sm:mt-3 mb-4">
                {!showOptions && !isReviewMode ? (
                  /* 4 Soft Pulsing Skeleton Option Placeholders with exact matching height and spacing */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-[58px] rounded-2xl bg-gray-200/70 dark:bg-gray-800/60 animate-pulse border-2 border-gray-100 dark:border-gray-800/40 shadow-[0_3px_0_0_#E2E8F0]/30 dark:shadow-[0_3px_0_0_#1E293B]/30"
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full"
                  >
                    {currentQ.options.map((option, optIdx) => {
                      const isSelected = selectedOption === option;
                      const isRemoved = !isReviewMode && removedOptions.includes(option);

                      let btnStyles = "w-full p-4 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center text-sm ";
                      let badgeColor = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';

                      if (isReviewMode) {
                        const isUserChoice = activePastRecord?.userSelected === option;
                        const isThisCorrect = option === currentQ.answer;

                        if (isUserChoice && activePastRecord?.isCorrect) {
                          // User selected correctly -> Emerald / Green
                          btnStyles += "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-[0_3px_0_0_#10B981]";
                          badgeColor = 'bg-emerald-500 text-white';
                        } else if (isUserChoice && !activePastRecord?.isCorrect) {
                          // User selected incorrectly -> Rose / Red
                          btnStyles += "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 shadow-[0_3px_0_0_#F43F5E]";
                          badgeColor = 'bg-rose-500 text-white';
                        } else if (isThisCorrect) {
                          // The correct answer -> Emerald / Green
                          btnStyles += "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-[0_3px_0_0_#10B981]";
                          badgeColor = 'bg-emerald-500 text-white';
                        } else {
                          // Other neutral unselected option
                          btnStyles += "border-gray-200 dark:border-indigo-950/60 opacity-40 bg-white dark:bg-[#13192B] text-gray-400";
                        }
                      } else if (isRemoved) {
                        btnStyles += "border-dashed border-gray-300 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 line-through opacity-30 cursor-not-allowed";
                      } else if (!isAnswerChecked) {
                        if (isSelected) {
                          btnStyles += "border-[#FF5F6D] bg-rose-50/70 dark:bg-rose-950/30 text-[#FF5F6D] shadow-[0_3px_0_0_#FF5F6D]";
                          badgeColor = 'bg-[#FF5F6D] text-white shadow-xs';
                        } else {
                          btnStyles += "border-gray-200 dark:border-indigo-950/80 bg-white dark:bg-[#13192B] text-gray-800 dark:text-white hover:border-gray-300 dark:hover:border-indigo-800 shadow-[0_3px_0_0_#E2E8F0] dark:shadow-[0_3px_0_0_#0F1424] active:translate-y-0.5 active:shadow-none";
                        }
                      } else {
                        if (option === currentQ.answer) {
                          btnStyles += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-[0_3px_0_0_#10B981]";
                          badgeColor = 'bg-emerald-500 text-white';
                        } else if (isSelected && !isCorrect) {
                          btnStyles += "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-[0_3px_0_0_#F43F5E]";
                          badgeColor = 'bg-rose-500 text-white';
                        } else {
                          btnStyles += "border-gray-200 dark:border-indigo-950/60 opacity-40 bg-white dark:bg-[#13192B] text-gray-400";
                        }
                      }

                      return (
                        <motion.button
                          key={option}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.15 }}
                          whileTap={!isReviewMode && ((!isAnswerChecked && !isRemoved) || (isAnswerChecked && isExplanationDismissed)) ? { scale: 0.98 } : {}}
                          onClick={() => {
                            if (isReviewMode) return;
                            if (isRemoved) return;
                            if (isAnswerChecked) {
                              if (isExplanationDismissed) {
                                triggerHaptic('click', hapticsEnabled);
                                setIsExplanationDismissed(false);
                              }
                              return;
                            }
                            triggerHaptic('click', hapticsEnabled);
                            handleSelect(option);
                          }}
                          disabled={isRemoved || isReviewMode}
                          className={btnStyles + (!isReviewMode && isAnswerChecked && isExplanationDismissed ? " cursor-pointer" : "")}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 pr-2">
                            {/* Option Tag Badge: A, B, C, D */}
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${badgeColor}`}>
                              {['A', 'B', 'C', 'D'][optIdx] || (optIdx + 1)}
                            </span>
                            <span className="font-bold text-sm sm:text-base leading-snug">{option}</span>
                          </div>

                          {/* Review Mode Answer Status Badges */}
                          {isReviewMode && (
                            <div className="flex items-center space-x-1.5 shrink-0 ml-1">
                              {activePastRecord?.userSelected === option && activePastRecord.isCorrect && (
                                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                                  <span className="hidden sm:inline">{lang === 'hi' ? 'आपका सही उत्तर' : 'Your Answer'}</span>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </span>
                              )}
                              {activePastRecord?.userSelected === option && !activePastRecord.isCorrect && (
                                <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 text-xs font-black">
                                  <span className="hidden sm:inline">{lang === 'hi' ? 'आपने यह चुना (गलत)' : 'Your Pick (Wrong)'}</span>
                                  <XCircle className="w-5 h-5 text-rose-500" />
                                </span>
                              )}
                              {option === currentQ.answer && activePastRecord?.userSelected !== option && (
                                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                                  <span className="hidden sm:inline">{lang === 'hi' ? 'सही उत्तर' : 'Correct'}</span>
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </span>
                              )}
                            </div>
                          )}

                          {!isReviewMode && isAnswerChecked && option === currentQ.answer && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          )}
                          {!isReviewMode && isAnswerChecked && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}

                {/* Review Mode Educational Explanation Card */}
                {isReviewMode && currentQ.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-3 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-xs"
                  >
                    <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 font-black text-xs sm:text-sm mb-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{lang === 'hi' ? '💡 व्याख्या (Explanation):' : '💡 Explanation:'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Re-Open Explanation Button (Shown when user dismissed the popup to review options) */}
        {!isReviewMode && isAnswerChecked && isExplanationDismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full flex justify-center pt-2 pb-1 relative z-30"
          >
            <button
              type="button"
              onClick={() => {
                triggerHaptic('click', hapticsEnabled);
                setIsExplanationDismissed(false);
              }}
              className="px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-200 font-black text-xs flex items-center space-x-2 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{lang === 'hi' ? '💡 व्याख्या व सही उत्तर देखें' : '💡 View Explanation & Answer'}</span>
            </button>
          </motion.div>
        )}

        {/* Bottom Section: Single Unified Action Button */}
        <div className="w-full pt-4 relative z-50">
          {isReviewMode ? (
            <motion.button
              key="quiz-review-return-btn"
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.01 }}
              type="button"
              onClick={handleReturnToCurrent}
              className="w-full py-4 rounded-2xl font-black text-white text-base tracking-wide bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0_4px_0_0_#4338CA] active:translate-y-1 active:shadow-none cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{lang === 'hi' ? `वर्तमान सवाल (Q ${currentIndex + 1}) पर वापस जाएं` : `Return to Active Q (${currentIndex + 1})`}</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </motion.button>
          ) : (
            <motion.button
              key="quiz-main-action-btn"
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              whileTap={(!isAnswerChecked && !selectedOption) ? {} : { scale: 0.96 }}
              whileHover={(!isAnswerChecked && !selectedOption) ? {} : { scale: 1.01 }}
              onClick={() => {
                triggerHaptic('click', hapticsEnabled);
                if (!isAnswerChecked) {
                  handleCheck();
                } else {
                  handleNext();
                }
              }}
              disabled={!isAnswerChecked && !selectedOption}
              className={`w-full py-4 rounded-2xl font-black text-white text-base tracking-wide transition-colors duration-300 shadow-md flex items-center justify-center space-x-2 ${!isAnswerChecked
                  ? selectedOption
                    ? 'bg-[#FF5F6D] hover:bg-[#E64553] shadow-[0_4px_0_0_#D93848] active:translate-y-1 active:shadow-none cursor-pointer'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
                  : isCorrect
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none cursor-pointer'
                    : 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_0_0_#E11D48] active:translate-y-1 active:shadow-none cursor-pointer'
                }`}
            >
              <span>{!isAnswerChecked ? t('checkBtn') : t('continueBtn')}</span>
              {isAnswerChecked && <ArrowRight className="w-5 h-5 stroke-[2.5]" />}
            </motion.button>
          )}
        </div>
      </div>

      {/* EXPLANATION POPUP MODAL (Blur Backdrop + Center Popup Card) */}
      <AnimatePresence>
        {isAnswerChecked && !isExplanationDismissed && currentQ && (
          <motion.div
            key="explanation-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              triggerHaptic('click');
              setIsExplanationDismissed(true);
            }}
            className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center p-4 pb-28 sm:pb-32 overflow-y-auto cursor-pointer"
          >
            {/* Center Area (Clicking inside does NOT dismiss) */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-md md:max-w-xl bg-white/95 dark:bg-[#13192B]/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border-2 shadow-2xl relative max-h-[72vh] overflow-y-auto cursor-default ${isCorrect
                  ? 'border-emerald-500/30 dark:border-emerald-500/40 shadow-emerald-500/10'
                  : 'border-rose-500/30 dark:border-rose-500/40 shadow-rose-500/10'
                }`}
            >
              {/* Close (X) button at top right of card for quick dismissal */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  setIsExplanationDismissed(true);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                title={lang === 'hi' ? 'बंद करें' : 'Close'}
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Result Header Badge */}
              <div className="flex items-center justify-between mb-3.5 pr-8">
                <div className="flex items-center space-x-2.5">
                  {isCorrect ? (
                    <div className="flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                        {isExamMockMode
                          ? (lang === 'hi' ? 'शाबाश! सही उत्तर (+2 अंक) 🎉' : 'Correct (+2 Marks) 🎉')
                          : (lang === 'hi' ? 'शाबाश! सही उत्तर 🎉' : 'Nicely done! 🎉')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-rose-100 dark:bg-rose-950/60 px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800/80">
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="font-black text-xs sm:text-sm text-rose-700 dark:text-rose-300">
                        {isExamMockMode
                          ? (lang === 'hi' ? 'गलत उत्तर (-0.5 अंक पेनाल्टी)' : 'Incorrect (-0.5 Mark Penalty)')
                          : t('lostAHeart')}
                      </span>
                    </div>
                  )}
                </div>
                <GkooBirdAvatar size="sm" mood={isCorrect ? 'celebrate' : 'sad'} />
              </div>

              {/* If Incorrect: Highlight the Correct Answer so student learns immediately! */}
              {!isCorrect && (
                <div className="mb-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-2xl flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                      {lang === 'hi' ? 'सही उत्तर (Correct Answer):' : 'Correct Answer:'}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-200 leading-snug">
                      {String(currentQ.answer || '')}
                    </p>
                  </div>
                </div>
              )}

              {/* Fact Explanation & Audio */}
              {currentQ.explanation && (
                <div className="bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 p-3.5 rounded-2xl mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      💡 {lang === 'hi' ? 'विस्तृत व्याख्या' : 'Explanation'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('click');
                        speakText(String(currentQ.explanation || ''), lang);
                      }}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      title={lang === 'hi' ? 'तथ्य सुनें' : 'Listen fact'}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium leading-relaxed">
                    {String(currentQ.explanation || '')}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CUTE SAD G-KOO QUIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showQuitModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="bg-white dark:bg-[#151B28] rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-rose-100 dark:border-rose-900/40 text-center relative overflow-hidden"
            >
              {/* Center Extra-Large Sad Crying G-koo Mascot */}
              <motion.div
                animate={{
                  y: [0, 4, 0],
                  scale: [1, 0.97, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                }}
                className="w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-2 relative select-none"
              >
                <GkooBirdSvg mood="sad" className="w-full h-full drop-shadow-2xl" />
              </motion.div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                {lang === 'hi' ? QUIT_MESSAGES[quitMessageIdx].titleHi : QUIT_MESSAGES[quitMessageIdx].titleEn}
              </h3>

              {/* Emotional Description */}
              <p className="text-xs sm:text-[13px] font-bold text-gray-600 dark:text-gray-300 leading-relaxed mb-6 px-1">
                {lang === 'hi' ? QUIT_MESSAGES[quitMessageIdx].msgHi : QUIT_MESSAGES[quitMessageIdx].msgEn}
              </p>

              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  whileTap={{ scale: 0.95, y: 2 }}
                  whileHover={{ scale: 1.02 }}
                  type="button"
                  onClick={() => {
                    triggerHaptic('success');
                    setShowQuitModal(false);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white font-black rounded-2xl shadow-[0_4px_0_0_#D93848] text-sm active:translate-y-1 active:shadow-none flex items-center justify-center space-x-2 select-none cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'नहीं, खेलना जारी रखें! 🚀' : 'Keep Learning / Stay 🚀'}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('click');
                    setShowQuitModal(false);
                    stopSpeech();
                    setIsSpeaking(false);
                    navigate('/');
                  }}
                  className="w-full py-2.5 text-xs font-bold text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors select-none cursor-pointer"
                >
                  {lang === 'hi' ? 'हाँ, बाद में खेलूँगा (Exit)' : 'End Session / Exit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bookmark Toast */}
      <AnimatePresence>
        {bookmarkToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 pointer-events-none"
          >
            <Star className="w-4 h-4 fill-white shrink-0" />
            <span>{bookmarkToast}</span>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Mistakes Review Modal */}
      <MistakesReviewModal
        isOpen={showMistakesModal}
        onClose={() => setShowMistakesModal(false)}
        mistakes={mistakesList}
        onRetest={handleRetestMistakes}
      />
    </div>
  );
}
