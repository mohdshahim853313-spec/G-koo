import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, ArrowRight, Compass, Layers, Zap, ChevronRight, GraduationCap, Globe, Newspaper, Pin, Play, BookOpen, Bookmark } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { TopBar } from '../components/TopBar';
import { LearningPath } from '../components/LearningPath';
import { DailyQuestsModal } from '../components/DailyQuestsModal';
import { GkooCompanionCard } from '../components/GkooCompanionCard';
import { StateExamModal } from '../components/StateExamModal';
import { SubjectDirectoryModal } from '../components/SubjectDirectoryModal';
import { SavedQuestionsModal } from '../components/SavedQuestionsModal';
import { DailyLoginRewardModal } from '../components/DailyLoginRewardModal';
import { StreakFreezeModal } from '../components/StreakFreezeModal';
import { triggerHaptic } from '../lib/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES_LIST } from '../lib/levelData';
import { 
  getPinnedStatesData, 
  getPinnedExamsData, 
  togglePinState, 
  togglePinExam, 
  PIN_EVENT_NAME, 
  type PinnedExamWithState 
} from '../utils/pinnedExams';
import { 
  getDashboardSubjectCards, 
  unpinSubject, 
  PINNED_SUBJECTS_EVENT, 
  type DashboardSubjectCard 
} from '../utils/pinnedSubjects';
import { getDailyCaCount } from '../lib/dailyCurrentAffairs';
import { type StateData } from '../data/stateExamsData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, lang, setActiveCategory, getCategoryMaxUnlocked, bookmarks } = useAppContext();
  const [activeView, setActiveView] = useState<'categories' | 'path'>('categories');
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [showStreakFreezeModal, setShowStreakFreezeModal] = useState(false);
  const [modalInitialStateId, setModalInitialStateId] = useState<string | null>(null);
  const [pinnedStates, setPinnedStates] = useState<StateData[]>([]);
  const [pinnedExams, setPinnedExams] = useState<PinnedExamWithState[]>([]);
  const [pinnedSubjectCards, setPinnedSubjectCards] = useState<DashboardSubjectCard[]>(() => getDashboardSubjectCards());
  const [customTopic, setCustomTopic] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState<10 | 15 | 20>(15);
  const [dailyCaCount, setDailyCaCount] = useState<number>(() => getDailyCaCount());

  // Daily Challenge completion status for today
  const [isDailyCompletedToday, setIsDailyCompletedToday] = useState<boolean>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return localStorage.getItem('gkoo_daily_challenge_completed_date') === today;
    } catch {
      return false;
    }
  });

  // Daily Login Reward claim status
  const [hasUnclaimedDailyReward, setHasUnclaimedDailyReward] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gkoo_daily_reward_last_claim') !== new Date().toDateString();
    } catch {
      return false;
    }
  });

  // Auto-open Daily Login Reward modal on first daily visit
  useEffect(() => {
    try {
      const today = new Date().toDateString();
      if (localStorage.getItem('gkoo_daily_reward_last_claim') !== today) {
        const timer = setTimeout(() => {
          setShowDailyRewardModal(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync Pinned States & Exams + Pinned Subject Slots + Daily completion
  useEffect(() => {
    const syncPinned = () => {
      setPinnedStates(getPinnedStatesData());
      setPinnedExams(getPinnedExamsData());
      setPinnedSubjectCards(getDashboardSubjectCards());
    };
    const checkDaily = () => {
      const today = new Date().toISOString().split('T')[0];
      setIsDailyCompletedToday(localStorage.getItem('gkoo_daily_challenge_completed_date') === today);
      setDailyCaCount(getDailyCaCount());
    };
    syncPinned();
    checkDaily();
    window.addEventListener(PIN_EVENT_NAME, syncPinned);
    window.addEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    window.addEventListener('gkoo_daily_completed', checkDaily);
    window.addEventListener('gkoo_daily_ca_updated', checkDaily);
    return () => {
      window.removeEventListener(PIN_EVENT_NAME, syncPinned);
      window.removeEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
      window.removeEventListener('gkoo_daily_completed', checkDaily);
      window.removeEventListener('gkoo_daily_ca_updated', checkDaily);
    };
  }, []);

  const PRESET_TOPICS = [
    { label: '🚀 Space Exploration', prompt: 'James Webb Space Telescope, Mars Missions, and Solar System facts' },
    { label: '🏛️ Indian History', prompt: 'Freedom movement, ancient dynasties, and historical monuments of India' },
    { label: '🏏 Cricket & Sports', prompt: 'World Cup records, famous cricketers, and Olympic moments' },
    { label: '💻 Coding & Tech', prompt: 'Python, JavaScript, AI concepts, and modern computer fundamentals' },
    { label: '🧠 Science Riddles', prompt: 'Fun tricky science puzzles, everyday physics, and biology facts' },
  ];

  const handleLaunchAiQuiz = () => {
    triggerHaptic('success');
    setShowAiModal(false);

    const params = new URLSearchParams();
    if (customTopic.trim()) params.set('topic', customTopic.trim());
    if (customPrompt.trim()) params.set('prompt', customPrompt.trim());
    params.set('diff', difficulty);
    params.set('count', questionCount.toString());

    navigate(`/quiz/ai?${params.toString()}`);
  };

  const caCategories = CATEGORIES_LIST.filter(c => c.type === 'ca');
  const examCategories = CATEGORIES_LIST.filter(c => c.type === 'exam');

  const handleSelectCategory = (catId: string) => {
    triggerHaptic('click');
    setActiveCategory(catId);
    setActiveView('path');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleSubjectCardClick = (card: DashboardSubjectCard) => {
    triggerHaptic('click');
    setActiveCategory(card.id);
    setActiveView('path');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Always reset scroll to the very top whenever view changes between categories and learning path
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeView]);

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-[#121217] pb-28 font-sans transition-colors duration-300">
      {/* G-koo HUD Top Bar */}
      <TopBar 
        onOpenQuests={() => setShowQuestsModal(true)} 
        onOpenStreakFreeze={() => setShowStreakFreezeModal(true)} 
      />

      {/* Main Container */}
      <main className="p-4 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto">
        
        {/* Daily Login Reward Prompt Banner (when unclaimed today) */}
        {hasUnclaimedDailyReward && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('click');
              setShowDailyRewardModal(true);
            }}
            className="mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-3 rounded-2xl text-white shadow-md flex items-center justify-between cursor-pointer border-b-2 border-orange-600 active:translate-y-0.5"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner shrink-0">
                🎁
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm leading-tight">
                  {lang === 'hi' ? 'आज का दैनिक उपहार प्राप्त करें!' : 'Claim Your Daily Login Reward!'}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-white/90 font-medium">
                  {lang === 'hi' ? 'मुफ्त जेम्स 💎 और स्ट्रीक शील्ड ❄️ अनलॉक करें' : 'Earn free Gems 💎 and Streak Shield ❄️'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-black bg-white text-orange-600 px-3 py-1.5 rounded-xl shadow-xs whitespace-nowrap">
              {lang === 'hi' ? 'खोलें' : 'Claim'}
            </span>
          </motion.div>
        )}

        {/* Clean 3D View Switcher: Categories vs Learning Path */}
        {/* View Switcher: Categories vs Learning Path */}
        <div className="flex bg-gray-200/90 dark:bg-gray-800/90 p-1.5 rounded-2xl mb-5 text-xs font-black shadow-inner border border-gray-300/40 dark:border-gray-700/50 max-w-md mx-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setActiveView('categories');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all select-none whitespace-nowrap ${
              activeView === 'categories'
                ? 'bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white shadow-md border-b-2 border-[#D93848]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t('viewCategories')}</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setActiveView('path');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all select-none whitespace-nowrap ${
              activeView === 'path'
                ? 'bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white shadow-md border-b-2 border-[#D93848]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t('viewPath')}</span>
          </motion.button>
        </div>

        {activeView === 'path' ? (
          /* Category-Specific Staged Level Map View */
          <div>
            <LearningPath onBackToCategories={() => {
              setActiveView('categories');
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }} />
          </div>
        ) : (
          /* Classic Clean Category Cards View */
          <div className="space-y-6">
            
            {/* Top Banners Grid (Side-by-side on PC/Tablet, Stacked on Mobile) */}
            <div className={`grid grid-cols-1 ${!isDailyCompletedToday ? 'md:grid-cols-2' : ''} gap-4 md:gap-6`}>
              {/* Interactive Gkoo Study Buddy Companion Card */}
              <GkooCompanionCard 
                panel="dashboard" 
                defaultMood="excited" 
              />

              {/* Featured Daily Challenge 3D Card (Hidden automatically when completed today, reappears next day) */}
              {!isDailyCompletedToday && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B54] to-[#FFB020] text-white rounded-3xl p-4.5 shadow-lg relative overflow-hidden border-b-[5px] border-[#D93848] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        <span className="bg-white/30 text-white text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-xs whitespace-nowrap shrink-0">
                          <Zap className="w-3 h-3 fill-white shrink-0" />
                          <span className="whitespace-nowrap">{t('dailyGoal')}</span>
                        </span>
                        <span className="bg-rose-950/40 text-rose-100 border border-white/20 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
                          ❤️ {lang === 'hi' ? 'नो हार्ट लॉस' : 'Zero Heart Loss'}
                        </span>
                      </div>
                      <span className="text-xs font-black bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
                        Max +100 XP
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white leading-snug drop-shadow-xs">
                      {t('dailyChallengeTitle')}
                    </h3>
                    <p className="text-xs text-rose-100 font-medium mb-4 mt-0.5">
                      {lang === 'hi'
                        ? '10 प्रश्नों की दैनिक चुनौती! हार्ट्स सुरक्षित रहेंगे (गलत उत्तर पर केवल XP कम होगी)।'
                        : '10 quick questions! Zero heart loss (XP is deducted for wrong answers).'}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('click');
                      navigate('/quiz/mix?daily=true&count=10');
                    }}
                    className="w-full bg-white text-[#E64553] font-black py-3 rounded-2xl text-xs shadow-[0_4px_0_0_#FCD5D8] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center space-x-2 select-none whitespace-nowrap cursor-pointer"
                  >
                    <span className="whitespace-nowrap">{t('startQuiz')} (10 Qs)</span>
                    <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Quick Actions Bar: Saved Bookmarked Questions Button */}
            {bookmarks.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  triggerHaptic('click');
                  setShowSavedModal(true);
                }}
                className="w-full bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-amber-400 transition-all text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                    <Bookmark className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                      {t('savedQuestions')} ({bookmarks.length})
                    </h4>
                    <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      {lang === 'hi' ? 'सेव किए गए प्रश्नों का अभ्यास करें' : 'Practice your bookmarked questions anytime'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </motion.button>
            )}

            {/* SECTION 0: CURRENT AFFAIRS (DAILY ENDLESS FLOW) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 min-w-0 flex-1">
                  <Newspaper className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                    {t('currentAffairsTitle')}
                  </h3>
                </div>
                <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900 shrink-0 whitespace-nowrap">
                  🔥 2024-2026 Live
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-3.5 md:gap-5">
                {caCategories.map((cat) => {
                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`perf-card bg-gradient-to-br ${cat.gradient} text-white ${cat.border3d} ${cat.activeBorder} rounded-3xl p-4 sm:p-4.5 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden cursor-pointer`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5 gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-white/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                            {cat.icon}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full ${cat.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                            {cat.badgeText}
                          </span>
                        </div>

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] tracking-tight">
                          {lang === 'hi' ? cat.titleHi : cat.titleEn}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2 drop-shadow-xs">
                          {lang === 'hi' ? cat.descHi : cat.descEn}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                          {dailyCaCount === 0 
                            ? (lang === 'hi' ? '10 प्रश्न दैनिक' : '10 Qs Daily') 
                            : `${dailyCaCount} ${lang === 'hi' ? 'आज पूरे' : 'Done Today'}`}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-black flex items-center space-x-1 text-white group-hover:translate-x-0.5 transition-transform shrink-0">
                          <span>{dailyCaCount === 0 ? (lang === 'hi' ? 'खोलें' : 'Open') : (lang === 'hi' ? '+10 और' : '+10 More')}</span>
                          <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-xs">→</span>
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 1: GENERAL KNOWLEDGE & SUBJECTS */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 min-w-0 flex-1">
                  <Globe className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                    {t('generalGkTitle')}
                  </h3>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    triggerHaptic('click');
                    setShowSubjectsModal(true);
                  }}
                  className="text-xs sm:text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl shadow-lg border-b-[3px] border-indigo-950 flex items-center space-x-1.5 sm:space-x-2 hover:opacity-95 shrink-0 whitespace-nowrap cursor-pointer active:translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  <span className="whitespace-nowrap">{lang === 'hi' ? '📚 + और विषय (More)' : '📚 + More Subjects'}</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
                {pinnedSubjectCards.map((card) => {
                  const maxUnlocked = getCategoryMaxUnlocked(card.id);

                  return (
                    <motion.button
                      key={`${card.id}_slot_${card.slotIndex}`}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSubjectCardClick(card)}
                      className={`perf-card bg-gradient-to-br ${card.gradient} text-white ${card.border3d} ${card.activeBorder} rounded-3xl p-4 sm:p-4.5 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5 gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-white/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            {card.icon}
                          </div>
                          {card.isCustomSubject ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic('click');
                                unpinSubject(card.id);
                              }}
                              className="text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 shadow-xs whitespace-nowrap shrink-0 flex items-center space-x-1 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                              title={lang === 'hi' ? 'अनपिन करने के लिए क्लिक करें' : 'Click to unpin'}
                            >
                              <Pin className="w-2.5 h-2.5 fill-current stroke-none inline" />
                              <span>{card.pinRank === 1 ? '1st Pin ✕' : card.pinRank === 2 ? '2nd Pin ✕' : card.pinRank === 3 ? '3rd Pin ✕' : '4th Pin ✕'}</span>
                            </button>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/25 text-white shadow-xs whitespace-nowrap shrink-0">
                              {card.badgeText || 'Core GK'}
                            </span>
                          )}
                        </div>

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] tracking-tight">
                          {lang === 'hi' ? card.titleHi : card.titleEn}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2 drop-shadow-xs">
                          {lang === 'hi' ? card.descHi : card.descEn}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                          {card.isCustomSubject ? '15 Questions' : `Lvl ${maxUnlocked} Unlocked`}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                          →
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* SECTION: PINNED STATES & EXAMS (MY TARGETS) */}
            {(pinnedStates.length > 0 || pinnedExams.length > 0) && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-1.5 text-amber-500 dark:text-amber-400 min-w-0 flex-1">
                    <Pin className="w-4 h-4 shrink-0 fill-amber-500 rotate-45" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? '📌 मेरे पिन किए गए राज्य व परीक्षाएं (My Targets)' : '📌 My Pinned States & Exams'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic('click');
                      setModalInitialStateId(null);
                      setShowStateModal(true);
                    }}
                    className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all shrink-0"
                  >
                    + {lang === 'hi' ? 'और जोड़ें' : 'Manage / Add'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 md:gap-4">
                  {/* Pinned States */}
                  {pinnedStates.map(st => (
                    <motion.div
                      key={st.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        triggerHaptic('click');
                        setModalInitialStateId(st.id);
                        setShowStateModal(true);
                      }}
                      className={`perf-card bg-gradient-to-br ${st.gradient} text-white rounded-3xl p-4 shadow-lg border-b-4 border-black/30 flex flex-col justify-between relative overflow-hidden group cursor-pointer ring-2 ring-amber-400/40`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                            {st.icon}
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-gray-950 shadow-xs">
                              📍 {lang === 'hi' ? 'राज्य' : 'State'}
                            </span>
                            <button
                              type="button"
                              title="Unpin"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic('click');
                                togglePinState(st.id);
                              }}
                              className="w-7 h-7 rounded-xl bg-black/30 hover:bg-black/50 text-amber-300 flex items-center justify-center transition-colors"
                            >
                              <Pin className="w-3.5 h-3.5 fill-amber-300 rotate-45" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1 drop-shadow-md">
                          {lang === 'hi' ? st.nameHi : st.nameEn}
                        </h4>
                        <p className="text-[11px] text-white/90 font-medium line-clamp-1">
                          {lang === 'hi' ? `राजधानी: ${st.capitalHi}` : `Capital: ${st.capitalEn}`} • {st.exams.length} {lang === 'hi' ? 'परीक्षाएं' : 'Exams'}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2 border-t border-white/20 flex items-center justify-between">
                        <span className="text-[10px] font-black bg-black/35 text-yellow-300 px-2.5 py-1 rounded-xl border border-white/10 shadow-xs">
                          {lang === 'hi' ? 'सभी परीक्षाएं खोलें' : 'View All Exams'}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pinned Individual Exams */}
                  {pinnedExams.map(({ exam, state }) => (
                    <motion.div
                      key={exam.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        triggerHaptic('click');
                        const topicParam = lang === 'hi' ? exam.syllabusTopicHi : exam.syllabusTopicEn;
                        const promptParam = `Focus on authentic examination questions for ${exam.nameEn} (${state.nameEn}). Include state special GK, past year pattern questions, constitutional and factual topics.`;
                        navigate(`/quiz/${exam.id}?topic=${encodeURIComponent(topicParam)}&prompt=${encodeURIComponent(promptParam)}&diff=${exam.difficulty}&count=15`);
                      }}
                      className="perf-card bg-gradient-to-br from-indigo-800 via-purple-800 to-slate-950 text-white rounded-3xl p-4 shadow-lg border-b-4 border-purple-950 flex flex-col justify-between relative overflow-hidden group cursor-pointer ring-2 ring-purple-400/40"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-lg bg-white/20 p-1.5 rounded-xl shadow-inner">
                              {state.icon}
                            </span>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-gray-950 shadow-xs">
                              {lang === 'hi' ? state.nameHi : state.nameEn}
                            </span>
                          </div>
                          <button
                            type="button"
                            title="Unpin"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic('click');
                              togglePinExam(exam.id);
                            }}
                            className="w-7 h-7 rounded-xl bg-black/30 hover:bg-black/50 text-amber-300 flex items-center justify-center transition-colors"
                          >
                            <Pin className="w-3.5 h-3.5 fill-amber-300 rotate-45" />
                          </button>
                        </div>

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1 drop-shadow-md line-clamp-1">
                          {lang === 'hi' ? exam.nameHi : exam.nameEn}
                        </h4>
                        <p className="text-[11px] text-purple-200 font-medium line-clamp-2">
                          {lang === 'hi' ? exam.descHi : exam.descEn}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2 border-t border-white/20 flex items-center justify-between">
                        <span className="text-[10px] font-black bg-gradient-to-r from-[#FF5F6D] to-rose-600 text-white px-2.5 py-1 rounded-xl shadow-xs flex items-center space-x-1 border border-white/20">
                          <Play className="w-3 h-3 fill-white" />
                          <span>{lang === 'hi' ? 'टेस्ट दें (15 Qs)' : 'Start Test (15 Qs)'}</span>
                        </span>
                        <span className="text-[10px] font-black uppercase text-amber-300">
                          {exam.badge}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: INDIAN COMPETITIVE EXAMS PREPARATION */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 min-w-0 flex-1">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                    {t('examPrepTitle')}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-gray-400 shrink-0 whitespace-nowrap">
                  17+ States • 100+ Exams
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 md:gap-5">
                {/* ALL STATES HERO FEATURED CARD */}
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    triggerHaptic('click');
                    setModalInitialStateId(null);
                    setShowStateModal(true);
                  }}
                  className="perf-card col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white border-b-4 border-emerald-950 rounded-3xl p-4 sm:p-5 text-left shadow-xl active:brightness-95 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group select-none relative overflow-hidden ring-2 ring-emerald-400/50"
                >
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/25 flex items-center justify-center text-2xl sm:text-3xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                      🏛️
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                        <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-yellow-400 text-gray-950 shadow-xs whitespace-nowrap">
                          ⭐ 17+ States Directory
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white whitespace-nowrap">
                          100+ State Exams
                        </span>
                      </div>
                      <h4 className="font-black text-sm sm:text-lg text-white leading-tight drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)]">
                        {lang === 'hi' ? '🇮🇳 (All) सभी राज्य प्रतियोगी परीक्षाएं (State Exams Directory)' : '🇮🇳 (All) All India State Competitive Exams Directory'}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-emerald-100 font-bold mt-1 line-clamp-1">
                        {lang === 'hi' ? 'UP, Bihar, Rajasthan, MP, Maharashtra, Delhi आदि सभी राज्यों के टेस्ट दें व पिन 📌 करें' : 'Access & Pin UPPSC, BPSC, RAS, MPPSC, Police & all state government quizzes'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/20">
                    <span className="text-xs font-black bg-white text-emerald-800 px-3.5 sm:px-4 py-2 rounded-2xl shadow-md group-hover:bg-yellow-300 group-hover:text-gray-950 transition-colors flex items-center space-x-1.5 whitespace-nowrap">
                      <span>{lang === 'hi' ? 'खोलें / पिन करें 📌' : 'Explore & Pin 📌'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.button>

                {examCategories.map((cat) => {
                  const maxUnlocked = getCategoryMaxUnlocked(cat.id);

                  return (
                    <motion.button
                      key={cat.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`perf-card bg-gradient-to-br ${cat.gradient} text-white ${cat.border3d} ${cat.activeBorder} rounded-3xl p-4 sm:p-4.5 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5 gap-1">
                          <div className="w-11 h-11 rounded-2xl bg-white/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                            {cat.icon}
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full ${cat.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                            {cat.badgeText}
                          </span>
                        </div>

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.5)] tracking-tight">
                          {lang === 'hi' ? cat.titleHi : cat.titleEn}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2 drop-shadow-xs">
                          {lang === 'hi' ? cat.descHi : cat.descEn}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-yellow-300 px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                          Lvl {maxUnlocked} Unlocked
                        </span>
                        <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                          →
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Gemini AI Custom Quiz Launcher Card */}
            <div className="bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-700 text-white rounded-3xl p-4 shadow-lg border-b-[5px] border-purple-950 flex items-center justify-between gap-3 relative overflow-hidden">
              <div className="flex items-center space-x-3 z-10 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-white/25 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  🤖
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs sm:text-sm text-white drop-shadow-xs truncate">{t('catAiTitle')}</h4>
                  <p className="text-[10px] sm:text-[11px] text-purple-100 font-medium line-clamp-1">{t('catAiDesc')}</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('click');
                  setShowAiModal(true);
                }}
                className="z-10 bg-white text-purple-700 font-black px-4 py-2.5 rounded-2xl text-xs shadow-[0_3px_0_0_#D8B4FE] hover:bg-purple-50 active:translate-y-0.5 active:shadow-none transition-all flex items-center space-x-1.5 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <span className="whitespace-nowrap">{t('playQuiz')}</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </motion.button>
            </div>

          </div>
        )}

      </main>

      {/* Daily Quests Modal */}
      {showQuestsModal && (
        <DailyQuestsModal
          isOpen={showQuestsModal}
          onClose={() => setShowQuestsModal(false)}
        />
      )}

      {/* Custom AI Prompt & Quiz Generator Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#1A1A24] rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-black mb-1">
                <Wand2 className="w-5 h-5" />
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Gemini AI Quiz Creator
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-3">
                Create custom questions by entering a topic or full custom prompt:
              </p>

              {/* Quick Topic Title */}
              <div className="mb-2.5">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={t('enterTopicPlaceholder')}
                  className="w-full p-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-800 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Quick Preset Pills */}
              <div className="mb-3">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5">
                  Popular Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TOPICS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setCustomTopic(p.label.replace(/^[^\s]+\s/, ''));
                        setCustomPrompt(p.prompt);
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 hover:bg-purple-100 active:scale-95 transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Custom Prompt Textarea */}
              <div className="mb-3">
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                  Full Custom Prompt / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Ask 5 tricky questions on Class 10 CBSE Biology Cell with Hindi explanation, or UPSC Prelims level economy questions."
                  className="w-full p-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-800 dark:text-white focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                />
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                    Difficulty
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-900 p-0.5 rounded-xl text-[10px] font-black">
                    {(['easy', 'medium', 'hard'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        className={`flex-1 py-1.5 rounded-lg capitalize transition-all ${
                          difficulty === d
                            ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-xs'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">
                    Questions
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-900 p-0.5 rounded-xl text-[10px] font-black">
                    {([10, 15, 20] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setQuestionCount(cnt)}
                        className={`flex-1 py-1.5 rounded-lg transition-all ${
                          questionCount === cnt
                            ? 'bg-white dark:bg-gray-800 text-purple-600 shadow-xs'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {cnt} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {t('close')}
                </button>
                <button
                  type="button"
                  onClick={handleLaunchAiQuiz}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF5F6D] hover:bg-[#E64553] text-white font-black text-xs shadow-[0_3px_0_0_#D93848] active:translate-y-0.5 active:shadow-none flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Quiz</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ALL STATES COMPETITIVE EXAM MODAL */}
      {showStateModal && (
        <StateExamModal
          isOpen={showStateModal}
          onClose={() => {
            setShowStateModal(false);
            setModalInitialStateId(null);
          }}
          initialStateId={modalInitialStateId}
        />
      )}

      {/* MORE SUBJECTS DIRECTORY MODAL */}
      {showSubjectsModal && (
        <SubjectDirectoryModal
          isOpen={showSubjectsModal}
          onClose={() => setShowSubjectsModal(false)}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* SAVED / BOOKMARKED QUESTIONS MODAL */}
      {showSavedModal && (
        <SavedQuestionsModal
          isOpen={showSavedModal}
          onClose={() => setShowSavedModal(false)}
        />
      )}

      {/* 7-DAY DAILY LOGIN REWARD MODAL */}
      {showDailyRewardModal && (
        <DailyLoginRewardModal
          isOpen={showDailyRewardModal}
          onClose={() => {
            setShowDailyRewardModal(false);
            try {
              const today = new Date().toDateString();
              setHasUnclaimedDailyReward(localStorage.getItem('gkoo_daily_reward_last_claim') !== today);
            } catch (e) {
              // ignore
            }
          }}
        />
      )}

      {/* STREAK FREEZE SHIELD MODAL */}
      {showStreakFreezeModal && (
        <StreakFreezeModal
          isOpen={showStreakFreezeModal}
          onClose={() => setShowStreakFreezeModal(false)}
        />
      )}

    </div>
  );
}

