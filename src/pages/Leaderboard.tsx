import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../useAppContext';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark, 
  Sparkles, 
  Flame, 
  Award, 
  ArrowRight, 
  Target, 
  RotateCcw,
  BookOpen,
  Trophy,
  Zap,
  Star,
  Check
} from 'lucide-react';
import { triggerHaptic } from '../lib/audio';
import { GkooCompanionCard } from '../components/GkooCompanionCard';
import { SavedQuestionsModal } from '../components/SavedQuestionsModal';
import { getQuestionTrackerStats, getAllIncorrectQuestions } from '../lib/questionTracker';
import { CATEGORIES_LIST } from '../lib/levelData';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { 
    t, 
    lang, 
    xp, 
    streak, 
    stats, 
    profile, 
    badges, 
    bookmarks, 
    categoryStats,
    activeCategory,
    getCategoryMaxUnlocked,
    setActiveCategory,
    resetAnalyticsReports 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'mistakes'>('overview');
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetCount, setResetCount] = useState<number>(0);

  // Question tracker metrics
  const trackerStats = useMemo(() => getQuestionTrackerStats(), [resetCount, stats]);
  const incorrectQuestions = useMemo(() => getAllIncorrectQuestions(), [resetCount, stats]);

  // Accuracy calculation
  const totalAnswered = stats.totalAnswered || 0;
  const correctAnswers = stats.correctAnswers || 0;
  const accuracyRate = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  // Student Level
  const currentLevel = Math.floor(xp / 100) + 1;

  // Exam Readiness Score (0 to 100)
  // Combines accuracy (45%), questions volume up to 100 Qs (35%), and streak up to 7 days (20%)
  const examReadiness = useMemo(() => {
    if (totalAnswered === 0) return 0;
    const accuracyScore = Math.min(accuracyRate, 100) * 0.45;
    const volumeScore = Math.min((totalAnswered / 100) * 100, 100) * 0.35;
    const streakScore = Math.min((streak / 7) * 100, 100) * 0.20;
    return Math.round(accuracyScore + volumeScore + streakScore);
  }, [totalAnswered, accuracyRate, streak]);

  // Subject breakdown list
  const subjectBreakdown = useMemo(() => {
    return CATEGORIES_LIST.map((cat) => {
      const stat = categoryStats?.[cat.id];
      const attempted = stat?.totalAttempted || 0;
      const correct = stat?.totalCorrect || 0;
      const rate = attempted > 0 ? Math.round((correct / attempted) * 100) : null;

      let status: 'strong' | 'average' | 'weak' | 'unattempted' = 'unattempted';
      if (attempted > 0) {
        if (rate! >= 70) status = 'strong';
        else if (rate! >= 45) status = 'average';
        else status = 'weak';
      }

      return {
        ...cat,
        attempted,
        correct,
        accuracy: rate,
        status,
      };
    }).sort((a, b) => (b.attempted || 0) - (a.attempted || 0));
  }, [categoryStats]);

  const strongSubjects = subjectBreakdown.filter((s) => s.status === 'strong');
  const weakSubjects = subjectBreakdown.filter((s) => s.status === 'weak');

  const studentName = profile.name && profile.name !== 'Guest Scholar' 
    ? profile.name 
    : (lang === 'hi' ? 'शिक्षार्थी' : 'Student');

  // Dynamic G-koo Performance & Report Overview (1-3 sentences)
  const gkooReportOverview = useMemo(() => {
    const targetCat = activeCategory || 'india';
    const unlockedLevel = getCategoryMaxUnlocked ? (getCategoryMaxUnlocked(targetCat) || 1) : 1;
    const launchQuizAction = () => {
      navigate(`/quiz/level-${targetCat}-${unlockedLevel}`);
    };

    // Case 1: Fresh state or after reset (0 questions answered)
    if (totalAnswered === 0) {
      return {
        mood: 'thinking' as const,
        titleHi: 'Gkoo रिपोर्ट विश्लेषक',
        titleEn: 'Gkoo Report Analyst',
        textHi: 'अभी कोई परीक्षा रिपोर्ट दर्ज नहीं हुई है। कम से कम 1 या 2 टेस्ट पूरे करें ताकि मैं आपकी तैयारी, सटीकता और मजबूत विषयों का पूरा विश्लेषण दे सकूँ!',
        textEn: 'No test reports recorded yet. Complete 1 or 2 quizzes so I can give you a full breakdown of your accuracy, strength & exam readiness!',
        btnHi: 'पहला टेस्ट शुरू करें',
        btnEn: 'Start First Quiz',
        action: launchQuizAction
      };
    }

    // Determine Mascot mood based on real performance
    let mood: 'celebrate' | 'happy' | 'fire' | 'thinking' | 'excited' = 'happy';
    if (accuracyRate >= 80) mood = 'celebrate';
    else if (accuracyRate >= 60) mood = 'fire';
    else if (accuracyRate < 45) mood = 'thinking';

    const topStrong = strongSubjects[0];
    const topWeak = weakSubjects[0];

    const topStrongTitle = topStrong ? (lang === 'hi' ? (topStrong.titleHi || topStrong.titleEn) : topStrong.titleEn) : '';
    const topWeakTitle = topWeak ? (lang === 'hi' ? (topWeak.titleHi || topWeak.titleEn) : topWeak.titleEn) : '';

    // Sentence 1: Real Core Accuracy & Volume Overview
    const s1Hi = `आपने कुल ${totalAnswered} प्रश्नों में ${accuracyRate}% सटीकता के साथ ${examReadiness}% परीक्षा तत्परता हासिल की है।`;
    const s1En = `You achieved ${accuracyRate}% accuracy across ${totalAnswered} questions, reaching an exam readiness score of ${examReadiness}%.`;

    // Sentence 2: Strengths, Weaknesses & Mistakes
    let s2Hi = '';
    let s2En = '';
    if (topStrong && trackerStats.incorrectCount > 0) {
      s2Hi = `आपका सबसे मजबूत विषय '${topStrongTitle}' है, जबकि ${trackerStats.incorrectCount} गलत प्रश्नों पर सुधार की ज़रूरत है।`;
      s2En = `Your strongest subject is '${topStrongTitle}', while ${trackerStats.incorrectCount} mistakes need review.`;
    } else if (trackerStats.incorrectCount > 0) {
      s2Hi = `फिलहाल ${trackerStats.incorrectCount} प्रश्नों में गलतियाँ दर्ज हैं, जिन्हें री-टेस्ट करके आप 100% सटीकता पा सकते हैं।`;
      s2En = `Currently ${trackerStats.incorrectCount} questions need practice to achieve 100% accuracy.`;
    } else if (topStrong) {
      s2Hi = `शानदार! '${topStrongTitle}' में आपका प्रदर्शन शीर्ष पर है और आपकी कोई पेंडिंग गलती नहीं है।`;
      s2En = `Outstanding! Your performance in '${topStrongTitle}' is top-notch with zero pending mistakes.`;
    } else {
      s2Hi = `आपकी तैयारी सही दिशा में बढ़ रही है और विषयवार समझ निरंतर मजबूत हो रही है।`;
      s2En = `Your preparation is progressing well with steady improvement across topics.`;
    }

    // Sentence 3: Direct Actionable Guidance
    let s3Hi = '';
    let s3En = '';
    if (topWeak) {
      s3Hi = `'${topWeakTitle}' में थोड़ा और अभ्यास करके आप अपना स्कोर 90%+ तक ले जा सकते हैं! 🎯`;
      s3En = `Practicing more in '${topWeakTitle}' will elevate your score above 90%! 🎯`;
    } else if (accuracyRate >= 80) {
      s3Hi = `आपकी तैयारी बेहतरीन स्तर पर है, इसी लय के साथ अगले लेवल्स जीतते रहें! 🏆`;
      s3En = `Your performance is outstanding, keep conquering new levels with this rhythm! 🏆`;
    } else {
      s3Hi = `प्रतिदिन 10 मिनट अभ्यास करें ताकि आपकी सटीकता और स्पीड दोनों में तेजी से सुधार हो! 🚀`;
      s3En = `Practice 10 minutes daily to rapidly boost both your accuracy and speed! 🚀`;
    }

    const fullHi = `${s1Hi} ${s2Hi} ${s3Hi}`;
    const fullEn = `${s1En} ${s2En} ${s3En}`;

    const btnHi = trackerStats.incorrectCount > 0 
      ? `गलतियाँ सुधारें (${trackerStats.incorrectCount})`
      : 'अगला टेस्ट खेलें';
    const btnEn = trackerStats.incorrectCount > 0 
      ? `Review Mistakes (${trackerStats.incorrectCount})`
      : 'Practice Next Level';

    const action = trackerStats.incorrectCount > 0
      ? () => navigate('/quiz/mistakes')
      : launchQuizAction;

    return {
      mood,
      titleHi: 'Gkoo रिपोर्ट विश्लेषक',
      titleEn: 'Gkoo Report Analyst',
      textHi: fullHi,
      textEn: fullEn,
      btnHi,
      btnEn,
      action
    };
  }, [totalAnswered, accuracyRate, examReadiness, strongSubjects, weakSubjects, trackerStats.incorrectCount, lang, navigate, activeCategory, getCategoryMaxUnlocked]);

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-[#0F121E] pb-28 px-4 pt-[calc(max(env(safe-area-inset-top,0px),28px)+24px)] md:pt-10 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300 select-none">
      <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#FF5F6D] flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                {lang === 'hi' ? 'परीक्षा रिपोर्ट एवं विश्लेषण' : 'Exam Analytics & Report'}
              </h1>
            </div>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1">
              {lang === 'hi' 
                ? 'आपकी तैयारी, सटीकता और विषयवार प्रदर्शन का वास्तविक विश्लेषण' 
                : 'Real-time breakdown of your accuracy, strength & exam readiness'}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black shrink-0">
            <span>{profile.avatar || '🦉'}</span>
            <span className="hidden sm:inline">{studentName} (Lvl {currentLevel})</span>
          </div>
        </div>

        {/* Dynamic Gkoo Performance & Report Overview Card */}
        <GkooCompanionCard
          panel="leaderboard"
          className="mb-4"
          customMood={gkooReportOverview.mood}
          customTitleHi={gkooReportOverview.titleHi}
          customTitleEn={gkooReportOverview.titleEn}
          customMessageHi={gkooReportOverview.textHi}
          customMessageEn={gkooReportOverview.textEn}
          customButtonTextHi={gkooReportOverview.btnHi}
          customButtonTextEn={gkooReportOverview.btnEn}
          customButtonAction={gkooReportOverview.action}
        />

        {/* Exam Readiness Score Meter */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 text-white rounded-3xl p-5 mb-5 shadow-lg border-b-[5px] border-indigo-950 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-100">
                  {lang === 'hi' ? 'परीक्षा तत्परता मीटर (Exam Readiness)' : 'Exam Readiness Score'}
                </h3>
                <p className="text-sm font-black flex items-center space-x-1.5 flex-wrap">
                  {examReadiness >= 75 ? (
                    <>
                      <Trophy className="w-4 h-4 text-amber-300 inline shrink-0" />
                      <span>{lang === 'hi' ? 'उत्कृष्ट स्तर — मुख्य परीक्षा के लिए तैयार' : 'Outstanding — Exam Ready'}</span>
                    </>
                  ) : examReadiness >= 45 ? (
                    <>
                      <Zap className="w-4 h-4 text-amber-300 inline shrink-0" />
                      <span>{lang === 'hi' ? 'अच्छी तैयारी — अभ्यास जारी रखें' : 'Good Progress — Keep Practicing'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300 inline shrink-0" />
                      <span>{lang === 'hi' ? 'शुरुआती चरण — नियमित टेस्ट दें' : 'Building Foundation — Practice Daily'}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <span className="text-2xl font-black bg-white/20 px-3 py-1 rounded-2xl shadow-inner">
              {examReadiness}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/25 h-3 rounded-full overflow-hidden p-0.5 shadow-inner mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${examReadiness}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 h-full rounded-full shadow-xs"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-indigo-100 font-bold">
            <span>{totalAnswered} {lang === 'hi' ? 'सवाल हल' : 'Questions Attempted'}</span>
            <span>{accuracyRate}% {lang === 'hi' ? 'सटीकता' : 'Accuracy'}</span>
            <span className="flex items-center space-x-1">
              <span>{streak} {lang === 'hi' ? 'दिन स्ट्रीक' : 'Days Streak'}</span>
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 inline" />
            </span>
          </div>
        </motion.div>

        {/* 4 Core Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* Accuracy */}
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-3.5 border-2 border-emerald-100 dark:border-emerald-950/60 border-b-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-gray-400">
                {lang === 'hi' ? 'सटीकता (Accuracy)' : 'Accuracy'}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {accuracyRate}%
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
              {correctAnswers}/{totalAnswered} {lang === 'hi' ? 'सही उत्तर' : 'Correct'}
            </p>
          </div>

          {/* Total Questions */}
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-3.5 border-2 border-blue-100 dark:border-blue-950/60 border-b-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-gray-400">
                {lang === 'hi' ? 'कुल प्रश्न' : 'Answered'}
              </span>
              <BookOpen className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {totalAnswered}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
              {stats.quizzesCompleted || 0} {lang === 'hi' ? 'टेस्ट पूरे किए' : 'Quizzes Done'}
            </p>
          </div>

          {/* Best Combo / Streak */}
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-3.5 border-2 border-amber-100 dark:border-amber-950/60 border-b-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-gray-400">
                {lang === 'hi' ? 'सर्वोत्तम कॉम्बो' : 'Best Combo'}
              </span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-500">
              {stats.bestCombo || 0}x
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
              {lang === 'hi' ? 'लगातार सही उत्तर' : 'Consecutive Correct'}
            </p>
          </div>

          {/* Mastered / Weak Ratio */}
          <div className="bg-white dark:bg-gray-800/90 rounded-2xl p-3.5 border-2 border-purple-100 dark:border-purple-950/60 border-b-4 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black uppercase text-gray-400">
                {lang === 'hi' ? 'मास्टर सवाल' : 'Mastered'}
              </span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {trackerStats.masteredCount}
            </p>
            <p className="text-[10px] text-rose-500 font-bold mt-0.5">
              {trackerStats.incorrectCount} {lang === 'hi' ? 'कमज़ोर सवाल' : 'Weak Questions'}
            </p>
          </div>
        </div>

        {/* Tab Switcher: Overview vs Subjects vs Mistakes */}
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm mb-5 text-xs font-bold">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setActiveTab('overview');
            }}
            className={`flex-1 py-2.5 px-1 rounded-xl transition-all select-none text-center ${
              activeTab === 'overview' ? 'bg-[#FF5F6D] text-white font-black shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="flex items-center justify-center space-x-1">
              <BarChart3 className="w-3.5 h-3.5 inline shrink-0" />
              <span>{lang === 'hi' ? 'समग्र अवलोकन' : 'Overview'}</span>
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setActiveTab('subjects');
            }}
            className={`flex-1 py-2.5 px-1 rounded-xl transition-all select-none text-center ${
              activeTab === 'subjects' ? 'bg-[#FF5F6D] text-white font-black shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="flex items-center justify-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 inline shrink-0" />
              <span>{lang === 'hi' ? 'विषयवार' : 'Subjects'}</span>
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setActiveTab('mistakes');
            }}
            className={`flex-1 py-2.5 px-1 rounded-xl transition-all select-none text-center ${
              activeTab === 'mistakes' ? 'bg-[#FF5F6D] text-white font-black shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="flex items-center justify-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 inline shrink-0" />
              <span>{lang === 'hi' ? `गलतियाँ (${trackerStats.incorrectCount})` : `Mistakes (${trackerStats.incorrectCount})`}</span>
            </span>
          </motion.button>
        </div>

        {/* Discreet Reset Analytics Button (Directly below tabs) */}
        <div className="flex items-center justify-end px-1 mb-4 -mt-3">
          <button
            onClick={() => {
              triggerHaptic('click');
              setShowResetConfirm(true);
            }}
            className="text-[11px] font-bold text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center space-x-1.5 py-1 px-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700/60 shadow-xs"
            title={lang === 'hi' ? 'रिपोर्ट डेटा रीसेट करें' : 'Reset Reports'}
          >
            <RotateCcw className="w-3 h-3 text-gray-400 hover:text-rose-500 transition-colors" />
            <span>{lang === 'hi' ? 'रिपोर्ट रीसेट करें' : 'Reset Reports'}</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            
            {/* Quick Action: Mistakes Review Card */}
            {trackerStats.incorrectCount > 0 && (
              <div className="bg-gradient-to-r from-rose-500 to-amber-500 text-white rounded-3xl p-4 shadow-md flex items-center justify-between gap-3 border-b-[4px] border-rose-700">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-black truncate">
                      {lang === 'hi' 
                        ? `${trackerStats.incorrectCount} प्रश्नों में सुधार की ज़रूरत है` 
                        : `${trackerStats.incorrectCount} mistakes need your review`}
                    </h4>
                    <p className="text-[10px] text-rose-100 font-medium line-clamp-1">
                      {lang === 'hi' 
                        ? 'अपनी पुरानी गलतियों को दोबारा हल करें और 100% सटीकता हासिल करें' 
                        : 'Practice questions you previously got wrong to master them'}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    triggerHaptic('click');
                    navigate('/quiz/mistakes');
                  }}
                  className="px-3.5 py-2.5 bg-white text-rose-600 rounded-xl font-black text-xs shadow-sm shrink-0 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'अभी सुधारें' : 'Fix Now'}</span>
                </motion.button>
              </div>
            )}

            {/* Quick Strengths & Weaknesses Snapshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Strong Areas */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    {lang === 'hi' ? '🟢 आपके मजबूत विषय (Strength)' : '🟢 Strong Subjects'}
                  </h3>
                </div>
                {strongSubjects.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {strongSubjects.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-xs font-bold p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                        <span className="flex items-center space-x-1.5">
                          <span>{sub.icon}</span>
                          <span>{lang === 'hi' ? (sub.titleHi || sub.titleEn) : sub.titleEn}</span>
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{sub.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 font-medium py-3 text-center">
                    {lang === 'hi' ? 'कम से कम 2-3 टेस्ट पूरे करें ताकि आपकी ताक़त यहाँ दिखे।' : 'Complete a few quizzes to see your top subjects.'}
                  </p>
                )}
              </div>

              {/* Weak Areas */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center space-x-2 text-rose-500 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    {lang === 'hi' ? '🔴 ध्यान देने योग्य विषय (Weak Areas)' : '🔴 Focus Needed'}
                  </h3>
                </div>
                {weakSubjects.length > 0 ? (
                  <div className="space-y-2 mt-2">
                    {weakSubjects.slice(0, 3).map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between text-xs font-bold p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                        <span className="flex items-center space-x-1.5">
                          <span>{sub.icon}</span>
                          <span>{lang === 'hi' ? (sub.titleHi || sub.titleEn) : sub.titleEn}</span>
                        </span>
                        <span className="text-rose-600 font-black">{sub.accuracy}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 font-medium py-3 text-center">
                    {lang === 'hi' ? 'बहुत खूब! अभी कोई गंभीर कमज़ोरी दर्ज नहीं है।' : 'Great job! No weak subject areas detected.'}
                  </p>
                )}
              </div>
            </div>

            {/* Bookmarked Questions Quick Launcher Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                    {lang === 'hi' ? 'बुकमार्क किए गए महत्वपूर्ण सवाल' : 'Saved Questions'}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                    {bookmarks.length > 0 
                      ? (lang === 'hi' ? `${bookmarks.length} सवाल रिवीजन के लिए सेव हैं` : `${bookmarks.length} questions saved for revision`)
                      : (
                        <span className="flex items-center space-x-1">
                          <span>{lang === 'hi' ? 'क्विज़ के दौरान कठिन सवालों को स्टार' : 'Bookmark tricky questions during quiz to revise'}</span>
                          <Star className="w-3 h-3 inline fill-amber-400 text-amber-400" />
                          <span>{lang === 'hi' ? 'करें' : ''}</span>
                        </span>
                      )}
                  </p>
                </div>
              </div>

              {bookmarks.length > 0 && (
                <button
                  onClick={() => setShowSavedModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-colors flex items-center space-x-1"
                >
                  <span>{lang === 'hi' ? 'देखें' : 'View'}</span>
                  <Bookmark className="w-3.5 h-3.5 fill-current inline" />
                </button>
              )}
            </div>

            {/* Earned Badges Carousel/List */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 mb-3">
                <Award className="w-4 h-4" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  {lang === 'hi' ? 'अर्जित उपलब्धियां एवं बैज' : 'Unlocked Milestones'}
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {badges.filter(b => b.unlocked).slice(0, 4).map((badge) => (
                  <div key={badge.id} className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-center">
                    <span className="text-2xl block mb-1">{badge.icon}</span>
                    <p className="text-[11px] font-black truncate text-gray-800 dark:text-gray-100">{t(badge.titleKey as any)}</p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{t('unlocked')}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SUBJECT BREAKDOWN */}
        {activeTab === 'subjects' && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">
              {lang === 'hi' 
                ? 'प्रत्येक विषय में आपका प्रदर्शन और सही उत्तरों का प्रतिशत:' 
                : 'Your accuracy and total attempted questions per subject:'}
            </p>

            {subjectBreakdown.map((sub) => {
              const hasAttempted = sub.attempted > 0;

              return (
                <div
                  key={sub.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <span className="text-2xl shrink-0">{sub.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {lang === 'hi' ? (sub.titleHi || sub.titleEn) : sub.titleEn}
                        </p>
                        {hasAttempted && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            sub.status === 'strong' 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : sub.status === 'average'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}>
                            {sub.status === 'strong' ? (lang === 'hi' ? 'मजबूत' : 'Strong') : sub.status === 'average' ? (lang === 'hi' ? 'सामान्य' : 'Average') : (lang === 'hi' ? 'कमज़ोर' : 'Weak')}
                          </span>
                        )}
                      </div>

                      {hasAttempted ? (
                        <div className="mt-1.5 flex items-center space-x-2">
                          <div className="w-24 sm:w-32 bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                sub.status === 'strong' ? 'bg-emerald-500' : sub.status === 'average' ? 'bg-amber-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${sub.accuracy}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">
                            {sub.correct}/{sub.attempted} ({sub.accuracy}%)
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                          {lang === 'hi' ? 'अभी कोई प्रश्न हल नहीं किया' : 'Not attempted yet'}
                        </p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      triggerHaptic('click');
                      setActiveCategory(sub.id);
                      navigate(`/quiz/${sub.id}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-[#FF5F6D] hover:text-white text-gray-700 dark:text-gray-300 text-xs font-black flex items-center space-x-1 shrink-0 transition-colors"
                  >
                    <span>{lang === 'hi' ? 'टेस्ट दें' : 'Practice'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: MISTAKES AUDIT */}
        {activeTab === 'mistakes' && (
          <div className="space-y-3">
            {incorrectQuestions.length > 0 ? (
              <>
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-xs min-w-0">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="leading-snug">
                      {lang === 'hi'
                        ? `कुल ${incorrectQuestions.length} सवाल जिनमें सुधार की ज़रूरत है:`
                        : `Total ${incorrectQuestions.length} questions to fix:`}
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      triggerHaptic('click');
                      navigate('/quiz/mistakes');
                    }}
                    className="px-3.5 py-2 bg-[#FF5F6D] hover:bg-[#E64553] text-white rounded-xl text-xs font-black shadow-xs flex items-center space-x-1.5 cursor-pointer shrink-0 whitespace-nowrap active:scale-95 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{lang === 'hi' ? 'दोबारा हल करें' : 'Practice All'}</span>
                  </motion.button>
                </div>

                <div className="space-y-2.5">
                  {incorrectQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-gray-100 dark:border-gray-700 shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-rose-500 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                          {q.category || 'General'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          Q #{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
                        {q.text}
                      </p>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-2 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 inline text-emerald-700 dark:text-emerald-300 stroke-[3]" />
                        <span>{lang === 'hi' ? 'सही उत्तर:' : 'Correct Answer:'} {q.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-gray-900 dark:text-white mb-1">
                  {lang === 'hi' ? 'कोई गलत सवाल लंबित नहीं है!' : 'Zero Mistakes Pending!'}
                </h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {lang === 'hi' 
                    ? 'आपने जो भी सवाल हल किए हैं उन सभी को सफलता से सही कर लिया है।' 
                    : 'All answered questions have been mastered or got correct.'}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Saved Questions Modal */}
      {showSavedModal && (
        <SavedQuestionsModal
          isOpen={showSavedModal}
          onClose={() => setShowSavedModal(false)}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-2">
              {lang === 'hi' ? 'रिपोर्ट रीसेट करें?' : 'Reset All Reports?'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              {lang === 'hi'
                ? 'क्या आप वाकई सभी परीक्षा रिपोर्ट, गलतियों की सूची और विषयवार आंकड़े रीसेट करना चाहते हैं? इसके बाद आपकी नई प्रोग्रेस और नए टेस्ट की रिपोर्ट शुरू से बनेगी।'
                : 'Are you sure you want to reset all reports, mistake logs, and subject accuracy? New reports will start tracking freshly from this moment onwards.'}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  resetAnalyticsReports();
                  setResetCount((prev) => prev + 1);
                  setShowResetConfirm(false);
                  triggerHaptic('success');
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold text-xs text-white shadow-md hover:shadow-lg transition-all"
              >
                {lang === 'hi' ? 'हाँ, रीसेट करें' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
