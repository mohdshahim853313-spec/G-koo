import { useState, useEffect } from 'react';
import { useAppContext } from '../useAppContext';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound, triggerHaptic, speakText, stopSpeech } from '../lib/audio';
import { Mascot, GkooBirdAvatar, GkooBirdSvg } from '../components/Mascot';
import { GkooQuizLoadingArena } from '../components/GkooQuizLoadingArena';
import { X, CheckCircle2, XCircle, Sparkles, Heart, RotateCcw, Volume2, VolumeX, Star, ArrowRight, Clock, WifiOff, Share2, Play } from 'lucide-react';
import { generateAiQuiz, type QuizQuestion } from '../lib/gemini';
import { getCategoryLevelConfig, getCategoryInfo } from '../lib/levelData';
import { recordQuestionAnswer } from '../lib/questionTracker';
import { saveCategoryAssignedQuestions, isLevelCacheCorruptedWithDuplicates } from '../lib/levelDeduplicator';
import { MistakesReviewModal, type MistakeRecord } from '../components/MistakesReviewModal';
import { RateAppModal } from '../components/RateAppModal';
import { AdMobRewardModal } from '../components/AdMobRewardModal';
import { isAndroidApp, PLAY_STORE_APP_URL } from '../utils/platform';

const QUIT_MESSAGES = [
  {
    titleHi: 'क्या आप सचमुच छोड़कर जा रहे हैं? 🥺',
    titleEn: 'Wait, don’t leave yet! 🥺',
    msgHi: 'You are leaving? G-koo is so sad! 🥺 बस कुछ ही सवाल बचे हैं, पूरा करके ही जाओ ना!',
    msgEn: 'You are leaving? G-koo is so sad! 🥺 Just a few questions left, let’s finish together!',
  },
  {
    titleHi: 'अरे रुकिए! मत जाइए ना! 💔',
    titleEn: 'Please don’t give up now! 💔',
    msgHi: 'आपकी मेहनत और स्ट्रीक बहुत कीमती है! अगर अभी छोड़ दिया तो प्रोग्रेस सेव नहीं होगी... 😢',
    msgEn: 'Your hard work and streak are so precious! If you leave now, your progress won’t be saved... 😢',
  },
  {
    titleHi: 'G-koo बहुत उदास हो जाएगा... 😭',
    titleEn: 'G-koo is feeling so heartbroken... 😭',
    msgHi: 'इतनी अच्छी तैयारी चल रही है! थोड़े से सवाल और बाकी हैं, G-koo पर भरोसा रखो! ✨',
    msgEn: 'You were doing so well! Just a few more questions, G-koo believes in you! ✨',
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

export default function Quiz() {

  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const customTopic = searchParams.get('topic') || '';
  const customPrompt = searchParams.get('prompt') || '';
  const difficulty = (searchParams.get('diff') || 'medium') as 'easy' | 'medium' | 'hard';
  const questionCount = parseInt(searchParams.get('count') || '15', 10);

  const {
    addXp,
    soundEnabled,
    setSoundEnabled,
    hapticsEnabled,
    geminiApiKey,
    lang,
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
  const isLevelQuiz = !!(categoryId && categoryId.startsWith('level-'));
  const isDailyChallenge = searchParams.get('daily') === 'true' || categoryId === 'daily';
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

  const [quizHearts, setQuizHearts] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineQuiz, setIsOfflineQuiz] = useState(false);
  const [isOfflineBlocked, setIsOfflineBlocked] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(true);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showAdMobModal, setShowAdMobModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [quitMessageIdx, setQuitMessageIdx] = useState(0);

  // Mistakes & Bookmarks & Timer States
  const [mistakesList, setMistakesList] = useState<MistakeRecord[]>([]);
  const [showMistakesModal, setShowMistakesModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(examTimerSeconds || 20);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  // Score and Gamified Combos
  const [correctCount, setCorrectCount] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [bonusXp, setBonusXp] = useState(0);
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
    setIsLoading(true);
    setQuizHearts(5);
    setCurrentIndex(0);
    setCorrectCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setBonusXp(0);
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
      topicName = lang === 'hi'
        ? 'दैनिक करेंट अफेयर्स, भारत सामान्य ज्ञान, विज्ञान, भूगोल व प्रमुख तथ्य'
        : 'Daily Current Affairs, India GK, General Science, World Geography & Key Facts';
      effectiveDifficulty = 'medium';
      effectiveCount = 10;
    } else if (!customTopic) {
      const catKey = categoryId || 'mix';
      const defaultTopic = lang === 'hi'
        ? (CATEGORY_TOPICS_HI[catKey] || CATEGORY_TOPICS_HI.mix)
        : (CATEGORY_TOPICS_EN[catKey] || CATEGORY_TOPICS_EN.mix);
      topicName = defaultTopic;
    }

    const levelQuestionsKey = isLevelQuiz && levelNumber
      ? `gkoo_level_q_${levelCategory}_${levelNumber}_${lang}`
      : null;

    let generated: QuizQuestion[] = [];

    const isCurrentlyOffline = !isOnline || (typeof navigator !== 'undefined' && !navigator.onLine);
    const isPassedLevel = isLevelQuiz && levelNumber
      ? !!categoryLevelProgress[levelCategory]?.[levelNumber]?.completed
      : false;

    // Strict Offline Check:
    // If device is offline:
    // - For Level Quiz: only allow if this level has already been passed/completed!
    // - If it's a new unpassed level -> block and show "You Are Offline" screen
    if (isCurrentlyOffline && isLevelQuiz && !isPassedLevel) {
      setIsOfflineBlocked(true);
      setIsLoading(false);
      return;
    }

    // - If AI custom quiz and offline -> block and show "You Are Offline" screen
    if (isCurrentlyOffline && categoryId === 'ai') {
      setIsOfflineBlocked(true);
      setIsLoading(false);
      return;
    }

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
    } else {
      // Check if questions were already generated for this level on 1st load
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
              } else {
                generated = parsed;
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
    }

    const wasOfflineGenerated = generated.length > 0 && generated[0]?.source === 'offline';
    setIsOfflineQuiz(isCurrentlyOffline || wasOfflineGenerated);
    setMistakesList([]);

    setQuestions(shuffleQuestionsAndOptions(generated));
    setIsLoading(false);
  };

  const handleRestartSameQuiz = () => {
    stopSpeech();
    setQuestions(prev => shuffleQuestionsAndOptions(prev));
    setCurrentIndex(0);
    setQuizHearts(5);
    setCorrectCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setBonusXp(0);
    setMistakesList([]);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setIsSpeaking(false);
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
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(null);
    setIsSpeaking(false);
    refillHearts();
  };

  useEffect(() => {
    loadQuizData();
  }, [categoryId, customTopic, customPrompt, difficulty, questionCount, geminiApiKey, lang]);

  const currentQ = questions[currentIndex];

  // Exam Countdown Timer Effect
  useEffect(() => {
    if (!examTimerEnabled || isAnswerChecked || isLoading || !currentQ || currentIndex >= questions.length) {
      return;
    }

    setTimeLeft(examTimerSeconds || 20);
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
  }, [currentIndex, isAnswerChecked, isLoading, examTimerEnabled, examTimerSeconds, currentQ]);

  const handleTimeout = () => {
    if (isAnswerChecked || !currentQ) return;
    stopSpeech();
    setIsSpeaking(false);
    setIsCorrect(false);
    setIsAnswerChecked(true);

    // Record mistake
    setMistakesList(prev => [...prev, { question: currentQ, userAnswer: '' }]);
    recordQuestionAnswer(currentQ, false, isLevelQuiz ? levelCategory : (categoryId || 'mix'));
    recordCategoryAnswers(isLevelQuiz ? levelCategory : (categoryId || 'mix'), 1, 0);

    if (!isDailyChallenge && !isSavedQuiz) {
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
    if (!selectedOption || !currentQ || isAnswerChecked) return;
    stopSpeech();
    setIsSpeaking(false);

    const correct = selectedOption === currentQ.answer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    // Track category accuracy
    const activeCatKey = isLevelQuiz ? levelCategory : (categoryId || 'mix');
    recordCategoryAnswers(activeCatKey, 1, correct ? 1 : 0);

    // Track mastered and weak/incorrect questions for deduplication and spaced repetition
    recordQuestionAnswer(currentQ, correct, activeCatKey);

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

      if (!isDailyChallenge && !isSavedQuiz) {
        setQuizHearts(prev => Math.max(0, prev - 1));
        spendHeart();
      }
      setCurrentCombo(0);
      playSound('error', soundEnabled);
      triggerHaptic('error', hapticsEnabled);
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
    } else if (currentQ) {
      triggerHaptic('click');
      setIsSpeaking(true);
      const textToSpeak = `${currentQ.text}. ${lang === 'hi' ? 'विकल्प हैं:' : 'Options are:'} ${currentQ.options.join(', ')}`;
      speakText(textToSpeak, lang, () => setIsSpeaking(false));
    }
  };

  const speakSingleOption = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    triggerHaptic('click');
    setIsSpeaking(true);
    speakText(opt, lang, () => setIsSpeaking(false));
  };

  // Stop speech when question changes or unmounts
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
    return () => {
      stopSpeech();
    };
  }, [currentIndex]);

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
    setIsCorrect(null);
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-[max(env(safe-area-inset-top,0px),30px)] pb-[max(env(safe-area-inset-bottom,0px),28px)] text-center max-w-md mx-auto bg-[#FCF9F7] dark:bg-[#121217] select-none">
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
          {lang === 'hi' ? 'इंटरनेट कनेक्शन नहीं है!' : "You're Offline!"}
        </h2>

        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 mb-6 text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-xs leading-relaxed space-y-2 text-left shadow-xs">
          {levelNumber ? (
            <p>
              {lang === 'hi' ? (
                <>
                  लेवल <strong>{levelNumber}</strong> {categoryInfo ? `(${categoryInfo.titleHi})` : ''} एक <span className="text-rose-500 dark:text-rose-400 font-bold">नया लेवल</span> है जो अभी तक पास नहीं हुआ है।
                </>
              ) : (
                <>
                  Level <strong>{levelNumber}</strong> {categoryInfo ? `(${categoryInfo.titleEn})` : ''} is a <span className="text-rose-500 dark:text-rose-400 font-bold">new level</span> that has not been completed yet.
                </>
              )}
            </p>
          ) : null}

          <p>
            {lang === 'hi' ? (
              <>
                📡 <strong>ऑफ़लाइन नियम:</strong> आप बिना इंटरनेट केवल अपने <span className="text-emerald-600 dark:text-emerald-400 font-bold">पास किए हुए लेवल्स</span> ही खेल सकते हैं (जिनका डेटा पहले से सेव है)।
              </>
            ) : (
              <>
                📡 <strong>Offline Rule:</strong> While offline, you can only replay levels you have <span className="text-emerald-600 dark:text-emerald-400 font-bold">already completed</span> using saved data.
              </>
            )}
          </p>

          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === 'hi'
              ? 'नए लेवल्स अनलॉक और डाउनलोड करने के लिए कृपया अपना इंटरनेट चालू करें।'
              : 'Please connect to the internet to unlock and download questions for new levels.'}
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

  // Loading Screen for AI Question Generation (Engaging Animated G-koo with 15 dynamic sentence templates)
  if (isLoading) {
    return <GkooQuizLoadingArena isOffline={!isOnline || isOfflineQuiz || (typeof navigator !== 'undefined' && !navigator.onLine)} />;
  }

  // Out of Hearts Game Over Screen (When all 5 hearts are lost in this quiz)
  if (!isDailyChallenge && quizHearts <= 0 && isAnswerChecked && !isCorrect) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-[max(env(safe-area-inset-top,0px),30px)] pb-[max(env(safe-area-inset-bottom,0px),28px)] text-center max-w-md mx-auto bg-[#FCF9F7] dark:bg-[#121217]">
        <Mascot size="lg" mood="sad" message={lang === 'hi' ? 'ओह नहीं! सारे हार्ट्स खत्म हो गए 💔' : 'Out of Hearts! 💔'} />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          {lang === 'hi' ? 'सभी 5 हार्ट्स समाप्त हो गए! 💔' : 'Out of Hearts (5/5 Lost)! 💔'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-300 font-medium max-w-xs mb-6 leading-relaxed">
          {lang === 'hi' 
            ? 'आप 5 गलत उत्तर देने के कारण बाहर हो गए हैं। आप इन्हीं समान 15 प्रश्नों के साथ दोबारा टेस्ट शुरू कर सकते हैं!' 
            : 'You used up all 5 hearts in this quiz. You can restart the test with the exact same 15 questions!'}
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
                <span>{lang === 'hi' ? '💎 30 जेम्स से 5 हार्ट्स रिफिल करें' : '💎 Refill 5 Hearts for 30 Gems'}</span>
              </button>
            )
          )}

          <button
            onClick={handleRestartSameQuiz}
            className="w-full bg-[#FF5F6D] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#D93848] active:translate-y-0.5 active:shadow-none text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'hi' ? '🔄 दोबारा टेस्ट दें' : '🔄 Restart Test'}</span>
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

  // Quiz Completed Screen
  if (currentIndex >= questions.length) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const baseReward = levelConfig 
      ? levelConfig.xpReward 
      : (isDailyChallenge ? Math.max(0, Math.round((correctCount / questions.length) * 100)) : 50);
    const totalGained = baseReward + bonusXp;
    const incorrectCount = questions.length - correctCount;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-screen px-4 pt-[max(env(safe-area-inset-top,0px),30px)] md:pt-10 pb-[max(env(safe-area-inset-bottom,0px),28px)] text-center max-w-md md:max-w-lg mx-auto bg-[#FCF9F7] dark:bg-[#121217]"
      >

        <Mascot message={isLevelQuiz ? "Stage Conquered! Realm Master! 🌟" : (isDailyChallenge ? "Daily Challenge Conquered! ⚡" : "Great job! Your streak continues! 🔥")} size="lg" mood="celebrate" />
        
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-3">
          {isLevelQuiz ? `${categoryInfo.icon} Level ${levelNumber} Cleared! 🎉` : (isDailyChallenge ? (lang === 'hi' ? 'दैनिक चुनौती पूर्ण! ⚡' : "Today's Daily Challenge Cleared! ⚡") : t('quizCompleted'))}
        </h2>
        {isLevelQuiz && (
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
            {lang === 'hi' ? categoryInfo.titleHi : categoryInfo.titleEn}
          </p>
        )}

        {/* Offline Badge on Completion */}
        {isOfflineQuiz && (
          <div className="inline-flex items-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-3.5 py-1 rounded-full text-xs font-black text-amber-800 dark:text-amber-300 mt-2 shadow-xs">
            <span>📡</span>
            <span>{lang === 'hi' ? 'ऑफलाइन मोड में पूरा किया गया' : 'Completed in Offline Mode'}</span>
          </div>
        )}

        {/* 3-Star Rating Showcase on Level Finish */}
        {isLevelQuiz && (
          <div className="flex items-center space-x-2 my-3 bg-amber-50 dark:bg-amber-950/40 px-5 py-2.5 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: s * 0.15, type: 'spring' }}
              >
                <Star
                  className={`w-7 h-7 ${
                    s <= (earnedStars || (accuracy >= 90 ? 3 : accuracy >= 65 ? 2 : 1))
                      ? 'fill-amber-400 text-amber-500 drop-shadow-md'
                      : 'text-gray-300 dark:text-gray-700'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Daily Challenge XP Breakdown Banner */}
        {isDailyChallenge && (
          <div className="w-full bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 p-3 rounded-2xl my-3 text-xs text-amber-900 dark:text-amber-200 text-left">
            <div className="flex items-center justify-between font-black">
              <span>⚡ {lang === 'hi' ? 'दैनिक चुनौती XP रिवॉर्ड' : 'Daily Challenge XP Reward'}</span>
              <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{baseReward} / 100 XP</span>
            </div>
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-1">
              {lang === 'hi'
                ? (incorrectCount > 0 
                    ? `${incorrectCount} गलत उत्तरों के कारण ${100 - baseReward} XP काटे गए (-10 XP प्रति गलत उत्तर)। कुल अर्जित: +${totalGained} XP। अगली चुनौती कल आएगी!` 
                    : 'शानदार! सभी 10 सही उत्तर (पूरे +100 XP अर्जित)। अगली चुनौती कल उपलब्ध होगी!')
                : (incorrectCount > 0 
                    ? `${100 - baseReward} XP deducted for ${incorrectCount} wrong answers (-10 XP per wrong answer). Total Earned: +${totalGained} XP. Next challenge opens tomorrow!` 
                    : 'Flawless! All 10 correct (Full +100 XP earned). Next challenge opens tomorrow!')}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full my-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-800/60 p-2.5 rounded-2xl">
            <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('xpEarned')}</p>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400">+{totalGained}</p>
          </div>
          <div className="bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-200 dark:border-sky-800/60 p-2.5 rounded-2xl">
            <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-wider">{t('gems')}</p>
            <p className="text-lg font-black text-sky-600 dark:text-sky-400">+{earnedGems || 15} 💎</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-2xl">
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('accuracy')}</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800/60 p-2.5 rounded-2xl">
            <p className="text-[10px] font-black text-[#FF5F6D] uppercase tracking-wider">Hearts</p>
            <p className="text-lg font-black text-[#FF5F6D]">
              {isDailyChallenge ? (lang === 'hi' ? 'सुरक्षित ❤️' : 'Safe ❤️') : `${quizHearts} ❤️`}
            </p>
          </div>
        </div>

        {/* Level Unlocked Banner */}
        {isLevelQuiz && nextUnlockedLevel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-2xl mb-4 font-black text-xs shadow-md flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Level {nextUnlockedLevel} is now Unlocked!</span>
          </motion.div>
        )}

        <div className="space-y-2.5 w-full">
          {/* Review Mistakes Button */}
          {mistakesList.length > 0 && (
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowMistakesModal(true)}
              className="w-full bg-gradient-to-r from-rose-500/15 via-orange-500/15 to-amber-500/15 dark:from-rose-950/50 dark:to-amber-950/50 border-2 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-black py-3.5 rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <span>📝 {t('reviewMistakes')} ({mistakesList.length})</span>
            </motion.button>
          )}

          {isLevelQuiz && nextUnlockedLevel ? (
            <button 
              onClick={() => {
                const isCurrentlyOffline = !isOnline || (typeof navigator !== 'undefined' && !navigator.onLine);
                const isNextPassed = !!categoryLevelProgress[levelCategory]?.[nextUnlockedLevel]?.completed;
                if (isCurrentlyOffline && !isNextPassed) {
                  setIsOfflineBlocked(true);
                  return;
                }
                navigate(`/quiz/level-${levelCategory}-${nextUnlockedLevel}`);
              }}
              className="w-full bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white font-black py-4 rounded-2xl shadow-[0_4px_0_0_#991B1B] active:translate-y-1 active:shadow-none transition-all text-sm flex items-center justify-center space-x-2"
            >
              <span>{t('playNextLevel')} (LVL {nextUnlockedLevel})</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          ) : null}

          <button 
            onClick={() => navigate('/')}
            className={`w-full font-black py-3.5 rounded-2xl transition-all text-xs ${
              isLevelQuiz
                ? 'bg-white dark:bg-[#1A1A24] text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 shadow-sm active:scale-98'
                : 'bg-[#FF5F6D] text-white shadow-[0_4px_0_0_#D93848] active:translate-y-1 active:shadow-none text-sm'
            }`}
          >
            {isLevelQuiz ? (lang === 'hi' ? 'लेवल्स मैप पर लौटें' : 'Back to Level Map') : t('returnHome')}
          </button>

          {/* WhatsApp / Social Share Score Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('success', hapticsEnabled);
              const title = categoryInfo ? (lang === 'hi' ? categoryInfo.titleHi : categoryInfo.titleEn) : 'G-koo GK';
              const lvlText = levelNumber ? `Level ${levelNumber}` : 'Quiz';
              const shareText = lang === 'hi'
                ? `🏆 मैंने G-koo ऐप में ${title} (${lvlText}) में ${accuracy}% स्कोर किया और ${totalGained} XP हासिल किया! 🧠✨\nक्या आप मेरे स्कोर को हरा सकते हैं? 🚀\n👉 अभी मुफ़्त में डाउनलोड करें और खेलें: ${PLAY_STORE_APP_URL}`
                : `🏆 I scored ${accuracy}% and won ${totalGained} XP in G-koo Quiz (${title} - ${lvlText})! 🧠✨\nCan you beat my score? 🚀\n👉 Download & Play now: ${PLAY_STORE_APP_URL}`;

              if (typeof navigator !== 'undefined' && navigator.share) {
                navigator.share({
                  title: 'G-koo - AI Quiz & GK Arena',
                  text: shareText,
                  url: PLAY_STORE_APP_URL,
                }).catch(() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                });
              } else {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
              }
            }}
            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 hover:from-emerald-600 hover:to-green-700 text-white font-black py-3.5 rounded-2xl shadow-[0_4px_0_0_#065F46] active:translate-y-0.5 active:shadow-none transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{lang === 'hi' ? '💬 WhatsApp पर स्कोर शेयर करें' : '💬 Share Score on WhatsApp'}</span>
          </motion.button>

          <button 
            onClick={handleRestartSameQuiz}
            className="w-full bg-transparent text-gray-500 dark:text-gray-400 font-bold py-2.5 rounded-2xl active:scale-98 transition-all flex items-center justify-center space-x-2 text-xs"
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
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-[#121217] flex flex-col justify-between pt-[max(env(safe-area-inset-top,0px),8px)] pb-[max(env(safe-area-inset-bottom,0px),16px)] select-none">
      {/* Top Navigation HUD */}
      <div className="max-w-md mx-auto w-full px-4 mb-2">
        <div className="flex items-center justify-between gap-2.5 mb-2">
          {/* Top Left Actions: Close/Quit Cross + Quick Sound Toggle */}
          <div className="flex items-center space-x-1 shrink-0">
            <button 
              onClick={() => {
                const randIdx = Math.floor(Math.random() * QUIT_MESSAGES.length);
                setQuitMessageIdx(randIdx);
                setShowQuitModal(true);
              }} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title={lang === 'hi' ? 'क्विज छोड़ें' : 'Quit quiz'}
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                triggerHaptic('click', hapticsEnabled);
              }}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                soundEnabled
                  ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={soundEnabled ? (lang === 'hi' ? 'आवाज़ बंद करें' : 'Mute Sound') : (lang === 'hi' ? 'आवाज़ चालू करें' : 'Unmute Sound')}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          {/* Duolingo Progress Bar + Hearts */}
          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
            <div className="flex-1 bg-gray-200 dark:bg-gray-800 h-3.5 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-[#FF7B7B] to-[#FF5F6D] h-full rounded-full transition-all duration-300" 
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Offline Status Badge in Top Bar */}
            {isOfflineQuiz && (
              <div 
                className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-700 dark:text-amber-300 shrink-0 shadow-xs"
                title={lang === 'hi' ? 'ऑफलाइन सुरक्षित डेटा' : 'Offline Saved Data'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{lang === 'hi' ? '💾 ऑफलाइन सेव्ड' : '💾 Offline Saved'}</span>
              </div>
            )}

            {/* 5-Heart HUD Indicator or Unlimited Hearts for Daily Challenge */}
            {isDailyChallenge ? (
              <div className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500/15 to-rose-500/15 dark:from-amber-950/40 dark:to-rose-950/40 px-3 py-1.5 rounded-full border border-amber-300/60 dark:border-amber-700/50 shadow-xs shrink-0">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                  <span>⚡ ∞</span>
                  <Heart className="w-3.5 h-3.5 fill-[#FF5F6D] text-[#FF5F6D] inline" />
                </span>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight">
                  {lang === 'hi' ? 'नो हार्ट लॉस' : 'Free Hearts'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50 shrink-0">
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Heart
                      key={i}
                      className={`w-3.5 h-3.5 transition-transform ${
                        i <= quizHearts
                          ? 'fill-[#FF5F6D] text-[#FF5F6D]'
                          : 'text-gray-300 dark:text-gray-600 scale-90'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-black text-[#FF5F6D] ml-0.5">{quizHearts}</span>
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
              <span className="text-sm">💾</span>
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
            key={currentIndex}
            initial={{ x: 25, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -25, opacity: 0 }}
            className="w-full"
          >
            <div className="flex items-start justify-between gap-2.5 mb-5 md:mb-6 w-full">
              <div className="flex-1">
                {/* Active Exam Timer countdown pill */}
                {examTimerEnabled && !isAnswerChecked && (
                  <div className="mb-2">
                    <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border text-xs font-black shadow-xs ${
                      timeLeft <= 5 
                        ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-400 text-rose-600 animate-pulse' 
                        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-700 dark:text-amber-300'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeLeft}s</span>
                    </span>
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                  {currentQ.text}
                </h2>
              </div>

              {/* Action Buttons: Bookmark & Audio Speaker */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Bookmark Toggle Button */}
                <motion.button
                  whileTap={{ scale: 0.88, y: 1 }}
                  onClick={handleBookmarkCurrent}
                  className={`p-3 rounded-2xl border-2 transition-all shadow-md flex items-center justify-center cursor-pointer ${
                    isBookmarked(currentQ.text)
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-500 shadow-[0_3px_0_0_#D97706]'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-amber-500 hover:bg-amber-50 shadow-[0_3px_0_0_#E2E8F0] dark:shadow-[0_3px_0_0_#1E293B]'
                  }`}
                  title={isBookmarked(currentQ.text) ? t('removeBookmark') : t('bookmarkQuestion')}
                >
                  <Star className={`w-5 h-5 ${isBookmarked(currentQ.text) ? 'fill-amber-500 text-amber-500' : ''}`} />
                </motion.button>

                {/* Question Audio Speaker Button */}
                <motion.button
                  whileTap={{ scale: 0.88, y: 1 }}
                  onClick={toggleSpeakQuestion}
                  className={`p-3 rounded-2xl border-2 transition-all shadow-md flex items-center justify-center cursor-pointer ${
                    isSpeaking
                      ? 'bg-[#FF5F6D] border-[#D93848] text-white shadow-[0_3px_0_0_#991B1B] animate-pulse'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-[#FF5F6D] hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-[0_3px_0_0_#E2E8F0] dark:shadow-[0_3px_0_0_#1E293B]'
                  }`}
                  title={lang === 'hi' ? 'सवाल सुनें (Audio)' : 'Listen Question (Audio)'}
                >
                  {isSpeaking ? (
                    <VolumeX className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Volume2 className="w-5 h-5 stroke-[2.5]" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* 3D Tactile Option Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
              {currentQ.options.map((option) => {
                const isSelected = selectedOption === option;

                let btnStyles = "w-full p-4 rounded-2xl border-2 font-black text-left transition-all flex justify-between items-center text-sm ";

                if (!isAnswerChecked) {
                  if (isSelected) {
                    btnStyles += "border-[#FF5F6D] bg-rose-50/70 dark:bg-rose-950/30 text-[#FF5F6D] shadow-[0_3px_0_0_#FF5F6D]";
                  } else {
                    btnStyles += "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A1A24] text-gray-800 dark:text-white hover:border-gray-300 shadow-[0_3px_0_0_#E2E8F0] dark:shadow-[0_3px_0_0_#1E293B] active:translate-y-0.5 active:shadow-none";
                  }
                } else {
                  if (option === currentQ.answer) {
                    btnStyles += "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-[0_3px_0_0_#10B981]";
                  } else if (isSelected && !isCorrect) {
                    btnStyles += "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-[0_3px_0_0_#F43F5E]";
                  } else {
                    btnStyles += "border-gray-200 dark:border-gray-800 opacity-40 bg-white dark:bg-[#1A1A24] text-gray-400";
                  }
                }

                return (
                  <motion.button 
                    key={option} 
                    whileTap={!isAnswerChecked ? { scale: 0.96, y: 3 } : {}}
                    whileHover={!isAnswerChecked ? { scale: 1.01 } : {}}
                    onClick={() => {
                      triggerHaptic('click');
                      handleSelect(option);
                    }} 
                    disabled={isAnswerChecked}
                    className={btnStyles}
                  >
                    <div className="flex items-center space-x-2.5 flex-1 pr-2">
                      {/* Optional micro audio button on option */}
                      <button
                        type="button"
                        onClick={(e) => speakSingleOption(e, option)}
                        className="p-1 rounded-lg text-gray-400 hover:text-[#FF5F6D] dark:hover:text-rose-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title={lang === 'hi' ? 'विकल्प सुनें' : 'Listen option'}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <span>{option}</span>
                    </div>

                    {isAnswerChecked && option === currentQ.answer && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section: Unified Action Button & Feedback (Positioned at bottom with 15px padding) */}
      <div className="w-full pt-4">
        <AnimatePresence>
          {isAnswerChecked && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className={`p-3.5 sm:p-4 rounded-2xl mb-3 border-2 ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-black text-sm text-emerald-700 dark:text-emerald-300">
                        {lang === 'hi' ? 'शाबाश! सही उत्तर 🎉' : 'Nicely done! 🎉'}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span className="font-black text-sm text-rose-700 dark:text-rose-300">
                        {t('lostAHeart')}
                      </span>
                    </>
                  )}
                </div>
                <GkooBirdAvatar size="sm" mood={isCorrect ? 'celebrate' : 'sad'} />
              </div>

              {/* Fact Explanation & Audio */}
              {currentQ.explanation && (
                <div className="flex items-start justify-between gap-2 bg-white/70 dark:bg-black/25 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                  <p className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-relaxed flex-1">
                    {currentQ.explanation}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('click');
                      speakText(currentQ.explanation || '', lang);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white shrink-0"
                    title={lang === 'hi' ? 'तथ्य सुनें' : 'Listen fact'}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unified Action Button: CHECK -> in-place replaces with -> CONTINUE */}
        <motion.button
          whileTap={(!isAnswerChecked && !selectedOption) ? {} : { scale: 0.96, y: 2 }}
          whileHover={(!isAnswerChecked && !selectedOption) ? {} : { scale: 1.01 }}
          onClick={() => {
            triggerHaptic('click');
            if (!isAnswerChecked) {
              handleCheck();
            } else {
              handleNext();
            }
          }}
          disabled={!isAnswerChecked && !selectedOption}
          className={`w-full py-4 rounded-2xl font-black text-white text-sm sm:text-base tracking-wide transition-all shadow-md ${
            !isAnswerChecked
              ? selectedOption
                ? 'bg-[#FF5F6D] hover:bg-[#E64553] shadow-[0_4px_0_0_#D93848] active:translate-y-1 active:shadow-none'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-none'
              : isCorrect
              ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_0_0_#059669] active:translate-y-1 active:shadow-none'
              : 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_0_0_#E11D48] active:translate-y-1 active:shadow-none'
          }`}
        >
          {!isAnswerChecked ? t('checkBtn') : t('continueBtn')}
        </motion.button>
      </div>

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
