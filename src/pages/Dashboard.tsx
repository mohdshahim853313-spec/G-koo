import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Zap, ChevronRight, GraduationCap, Globe, Pin, Play, BookOpen, Bookmark, Target, ArrowRight, Rocket, MapPin, Timer, Star, Sparkles } from 'lucide-react';
import { AppIcon } from '../components/AppIcon';
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
import { motion } from 'framer-motion';
import { CATEGORIES_LIST } from '../lib/levelData';
import { getAllIncorrectQuestions } from '../lib/questionTracker';
import { ALL_SUBJECTS_LIST, type SubjectItem } from '../data/subjectsData';
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
import { type StateData } from '../data/stateExamsData';

// World Mode subject groupings
const WORLD_ACADEMIC_IDS = ['sub_english', 'sub_math', 'sub_physics', 'sub_biology', 'sub_chemistry'];
const WORLD_GENERAL_IDS = ['sub_geography', 'sub_history', 'sub_political_science', 'sub_gk'];
const WORLD_CURIOSITY_IDS = ['sub_psychology', 'sub_facts', 'sub_space', 'sub_philosophy'];

interface DashboardProps {
  initialView?: 'categories' | 'path';
}

export default function Dashboard({ initialView }: DashboardProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t, lang, setActiveCategory, getCategoryMaxUnlocked, bookmarks } = useAppContext();

  const isMapRoute = location.pathname === '/map' || searchParams.get('view') === 'map' || initialView === 'path';
  const [activeView, setActiveView] = useState<'categories' | 'path'>(isMapRoute ? 'path' : 'categories');

  useEffect(() => {
    if (location.pathname === '/map' || searchParams.get('view') === 'map') {
      setActiveView('path');
    } else if (location.pathname === '/' && !searchParams.get('view')) {
      setActiveView('categories');
    }
  }, [location.pathname, searchParams]);
  const [regionMode, setRegionMode] = useState<'india' | 'world'>(() => {
    try {
      return (localStorage.getItem('gkoo_dashboard_region_mode') as 'india' | 'world') || 'india';
    } catch {
      return 'india';
    }
  });
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [showStreakFreezeModal, setShowStreakFreezeModal] = useState(false);
  const [modalInitialStateId, setModalInitialStateId] = useState<string | null>(null);
  const [pinnedStates, setPinnedStates] = useState<StateData[]>([]);
  const [pinnedExams, setPinnedExams] = useState<PinnedExamWithState[]>([]);
  const [pinnedSubjectCards, setPinnedSubjectCards] = useState<DashboardSubjectCard[]>(() => getDashboardSubjectCards());
  const [mistakesCount] = useState<number>(() => {
    try {
      return getAllIncorrectQuestions().length;
    } catch {
      return 0;
    }
  });

  const handleRegionModeChange = (mode: 'india' | 'world') => {
    triggerHaptic('click');
    setRegionMode(mode);
    try {
      localStorage.setItem('gkoo_dashboard_region_mode', mode);
    } catch {}
  };

  // World Mode subjects
  const worldAcademicSubjects = WORLD_ACADEMIC_IDS
    .map(id => ALL_SUBJECTS_LIST.find(s => s.id === id))
    .filter(Boolean) as SubjectItem[];

  const worldGeneralSubjects = WORLD_GENERAL_IDS
    .map(id => ALL_SUBJECTS_LIST.find(s => s.id === id))
    .filter(Boolean) as SubjectItem[];

  const worldCuriositySubjects = WORLD_CURIOSITY_IDS
    .map(id => ALL_SUBJECTS_LIST.find(s => s.id === id))
    .filter(Boolean) as SubjectItem[];

  interface ActiveQuizSession {
    url: string;
    categoryId: string;
    levelCategory?: string;
    levelNumber?: number | null;
    isLevelQuiz?: boolean;
    categoryTitle: string;
    currentIndex: number;
    totalQuestions: number;
    timestamp: number;
  }

  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(() => {
    try {
      const raw = localStorage.getItem('gkoo_active_quiz_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.url && Array.isArray(parsed.questions) && parsed.questions.length > 0 && typeof parsed.currentIndex === 'number' && parsed.currentIndex < parsed.questions.length) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const checkActiveSession = () => {
      try {
        const raw = localStorage.getItem('gkoo_active_quiz_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.url && Array.isArray(parsed.questions) && parsed.questions.length > 0 && typeof parsed.currentIndex === 'number' && parsed.currentIndex < parsed.questions.length) {
            setActiveSession(parsed);
            return;
          }
        }
      } catch {}
      setActiveSession(null);
    };
    checkActiveSession();
    window.addEventListener('focus', checkActiveSession);
    return () => {
      window.removeEventListener('focus', checkActiveSession);
    };
  }, []);

  // Daily Login Reward claim status
  const [hasUnclaimedDailyReward, setHasUnclaimedDailyReward] = useState<boolean>(() => {
    try {
      return localStorage.getItem('gkoo_daily_reward_last_claim') !== new Date().toDateString();
    } catch {
      return false;
    }
  });

  // Sync Pinned States & Exams + Pinned Subject Slots
  useEffect(() => {
    const syncPinned = () => {
      setPinnedStates(getPinnedStatesData());
      setPinnedExams(getPinnedExamsData());
      setPinnedSubjectCards(getDashboardSubjectCards());
    };
    syncPinned();
    window.addEventListener(PIN_EVENT_NAME, syncPinned);
    window.addEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    return () => {
      window.removeEventListener(PIN_EVENT_NAME, syncPinned);
      window.removeEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    };
  }, []);

  const examCategories = CATEGORIES_LIST.filter(c => c.type === 'exam');

  const handleSelectCategory = (catId: string) => {
    triggerHaptic('click');
    setActiveCategory(catId);
    navigate('/map');
    setActiveView('path');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleSubjectCardClick = (card: DashboardSubjectCard) => {
    triggerHaptic('click');
    setActiveCategory(card.id);
    navigate('/map');
    setActiveView('path');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Always reset scroll to the very top whenever view changes between categories and learning path
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeView]);

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-transparent pb-28 font-sans transition-colors duration-200">
      {/* G-koo HUD Top Bar */}
      <TopBar 
        onOpenQuests={() => setShowQuestsModal(true)} 
        onOpenStreakFreeze={() => setShowStreakFreezeModal(true)} 
        onOpenDailyReward={() => setShowDailyRewardModal(true)}
        hasUnclaimedDailyReward={hasUnclaimedDailyReward}
      />

      {/* Main Container */}
      <main className="p-4 pt-3.5 sm:pt-4 max-w-md md:max-w-5xl lg:max-w-6xl mx-auto">
        
        {/* Slim 3D Mode Switcher: 1st World Mode, 2nd India Mode (Only visible in categories view, hidden in level map) */}
        {activeView === 'categories' && (
          <div className="flex bg-gray-200/90 dark:bg-[#13192B] p-1.5 rounded-2xl mb-4 sm:mb-5 text-xs font-black shadow-inner border border-gray-300/40 dark:border-indigo-950/80 max-w-md mx-auto">
            {/* 1st Button: World Mode */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                handleRegionModeChange('world');
                setActiveView('categories');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all select-none whitespace-nowrap ${
                regionMode === 'world'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md border-b-2 border-indigo-950'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{lang === 'hi' ? 'विश्व (विषय व ज्ञान)' : 'World (Subjects & GK)'}</span>
            </motion.button>

            {/* 2nd Button: India Mode */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                handleRegionModeChange('india');
                setActiveView('categories');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }}
              className={`flex-1 py-2.5 px-2 rounded-xl flex items-center justify-center space-x-1.5 transition-all select-none whitespace-nowrap ${
                regionMode === 'india'
                  ? 'bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white shadow-md border-b-2 border-[#D93848]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-sm shrink-0">🇮🇳</span>
              <span className="whitespace-nowrap">{lang === 'hi' ? 'भारत (परीक्षाएं व GS)' : 'India (Exams & GS)'}</span>
            </motion.button>
          </div>
        )}

        {activeView === 'path' ? (
          /* Category-Specific Staged Level Map View */
          <div>
            <LearningPath 
              onBackToCategories={() => {
                navigate('/');
                setActiveView('categories');
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
              }} 
              onOpenDailyReward={() => setShowDailyRewardModal(true)}
            />
          </div>
        ) : (
          /* Classic Clean Category Cards View */
          <div className="space-y-6">

            {/* Top Banners Grid (Side-by-side on PC/Tablet, Stacked on Mobile) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Interactive Gkoo Study Buddy Companion Card */}
              <GkooCompanionCard 
                panel="dashboard" 
                defaultMood="excited" 
              />

              {/* Continue Quiz / Resume Card (Replaces Daily Challenge) */}
              {(() => {
                const fallbackCatId = (() => {
                  try {
                    return localStorage.getItem('gkoo_last_active_category') || 'ssc_cgl';
                  } catch {
                    return 'ssc_cgl';
                  }
                })();
                const fallbackMaxUnlocked = getCategoryMaxUnlocked(fallbackCatId);
                const fallbackCatInfo = CATEGORIES_LIST.find(c => c.id === fallbackCatId);
                const fallbackTitle = fallbackCatInfo ? (lang === 'hi' ? fallbackCatInfo.titleHi : fallbackCatInfo.titleEn) : (lang === 'hi' ? 'एसएससी सीजीएल' : 'SSC CGL');

                return (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gradient-to-r from-[#FF5F6D] via-[#FF7B54] to-[#FF9E2C] text-white rounded-2xl p-3 shadow-md border-b-[3px] border-[#D93848] flex items-center justify-between gap-2.5"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-1">
                        <span className="bg-white/30 text-white text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center space-x-1 shadow-xs whitespace-nowrap shrink-0">
                          <Play className="w-2.5 h-2.5 fill-white shrink-0" />
                          <span className="whitespace-nowrap">
                            {activeSession ? (lang === 'hi' ? 'जारी रखें' : 'RESUME') : (lang === 'hi' ? 'अगला लेवल' : 'CONTINUE')}
                          </span>
                        </span>
                        {activeSession ? (
                          <span className="bg-rose-950/40 text-rose-100 border border-white/20 text-[9.5px] font-black px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0 flex items-center space-x-1">
                            <span>{lang === 'hi' ? `प्रश्न ${activeSession.currentIndex + 1}/${activeSession.totalQuestions}` : `Q ${activeSession.currentIndex + 1}/${activeSession.totalQuestions}`}</span>
                          </span>
                        ) : (
                          <span className="bg-rose-950/40 text-rose-100 border border-white/20 text-[9.5px] font-black px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0 flex items-center space-x-1">
                            <span>{lang === 'hi' ? `लेवल ${fallbackMaxUnlocked}` : `Level ${fallbackMaxUnlocked}`}</span>
                          </span>
                        )}
                        <span className="text-[9.5px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap shrink-0">
                          ⚡ +100 XP
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-white leading-tight truncate">
                        {activeSession 
                          ? (activeSession.levelNumber 
                              ? `${activeSession.categoryTitle} • Level ${activeSession.levelNumber}`
                              : activeSession.categoryTitle)
                          : `${fallbackTitle} • Level ${fallbackMaxUnlocked}`}
                      </h3>
                      <p className="text-[10.5px] text-rose-100 font-medium truncate mt-0.5">
                        {activeSession
                          ? (lang === 'hi'
                              ? `जहाँ छोड़ा था (सवाल ${activeSession.currentIndex + 1}), वहीं से तुरंत शुरू करें`
                              : `Resume right from Question ${activeSession.currentIndex + 1}`)
                          : (lang === 'hi'
                              ? 'अपनी तैयारी जारी रखें और अगला लेवल अनलॉक करें'
                              : 'Continue your progress and level up')}
                      </p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic('click');
                        if (activeSession) {
                          navigate(`${activeSession.url}${activeSession.url.includes('?') ? '&' : '?'}resume=true`);
                        } else {
                          navigate(`/quiz/level-${fallbackCatId}-${fallbackMaxUnlocked}`);
                        }
                      }}
                      className="bg-white text-[#E64553] font-black px-3.5 py-2.5 rounded-xl text-xs shadow-[0_3px_0_0_#FCD5D8] active:translate-y-0.5 active:shadow-none transition-all flex items-center space-x-1 select-none whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span className="whitespace-nowrap">
                        {activeSession
                          ? (lang === 'hi' ? 'जारी रखें' : 'CONTINUE')
                          : (lang === 'hi' ? 'शुरू करें' : 'START')}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                    </motion.button>
                  </motion.div>
                );
              })()}
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

            {/* Quick Practice: Weak Areas / Mistakes Retest */}
            {mistakesCount > 0 && (
              <motion.div
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  triggerHaptic('click');
                  navigate('/quiz/mistakes?mistakes=true');
                }}
                className="w-full bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800/60 rounded-2xl p-3 flex items-center justify-between shadow-xs hover:border-rose-400 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Target className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-rose-900 dark:text-rose-200 flex items-center">
                      <Target className="w-3.5 h-3.5 inline mr-1.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{lang === 'hi' ? `${mistakesCount} कमजोर प्रश्न दर्ज हैं` : `${mistakesCount} Mistakes Recorded`}</span>
                    </h4>
                    <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                      {lang === 'hi' ? 'गलतियां सुधारें व दोबारा अभ्यास करें' : 'Retest your mistakes and master weak concepts'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black bg-rose-600 text-white px-3 py-1.5 rounded-xl shadow-xs whitespace-nowrap shrink-0 flex items-center space-x-1">
                  <span>{lang === 'hi' ? 'सुधारें' : 'Retest'}</span>
                  <Rocket className="w-3 h-3 inline" />
                </span>
              </motion.div>
            )}

            {regionMode === 'india' ? (
              <>
                {/* SECTION 1: GENERAL KNOWLEDGE & SUBJECTS */}
                <div className="bg-indigo-100/85 dark:bg-indigo-950/50 p-3.5 sm:p-4.5 rounded-3xl border-2 border-indigo-300/80 dark:border-indigo-800/60 shadow-sm space-y-3">
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
                    navigate('/subjects');
                  }}
                  className="text-xs sm:text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-2xl shadow-lg border-b-[3px] border-indigo-950 flex items-center space-x-1.5 sm:space-x-2 hover:opacity-95 shrink-0 whitespace-nowrap cursor-pointer active:translate-y-0.5"
                >
                  <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  <span className="whitespace-nowrap">{lang === 'hi' ? '+ और विषय (More)' : '+ More Subjects'}</span>
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
                          <div className="w-11 h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                            <AppIcon icon={card.icon} className="w-6 h-6 stroke-[2.2]" />
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

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] tracking-tight">
                          {lang === 'hi' ? card.titleHi : card.titleEn}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2">
                          {lang === 'hi' ? card.descHi : card.descEn}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                          {card.isCustomSubject ? '15 Questions' : `Lvl ${maxUnlocked} Unlocked`}
                        </span>
                        <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

                {/* SECTION: PINNED STATES & EXAMS (MY TARGETS) */}
                {(pinnedStates.length > 0 || pinnedExams.length > 0) && (
                  <div className="bg-amber-100/85 dark:bg-amber-950/50 p-3.5 sm:p-4.5 rounded-3xl border-2 border-amber-300/80 dark:border-amber-800/60 shadow-sm space-y-3">
                    <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-1.5 text-amber-500 dark:text-amber-400 min-w-0 flex-1">
                    <Pin className="w-4 h-4 shrink-0 fill-amber-500 rotate-45" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'मेरे पिन किए गए राज्य व परीक्षाएं (My Targets)' : 'My Pinned States & Exams'}
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
                          <div className="w-11 h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                            <AppIcon icon={st.icon} className="w-6 h-6 stroke-[2.2]" />
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-gray-950 shadow-xs flex items-center space-x-1">
                              <MapPin className="w-2.5 h-2.5 inline" />
                              <span>{lang === 'hi' ? 'राज्य' : 'State'}</span>
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
                          <ArrowRight className="w-3.5 h-3.5" />
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
                            <span className="p-1.5 rounded-xl bg-black/20 dark:bg-black/40 border border-white/20 shadow-inner flex items-center justify-center">
                              <AppIcon icon={state.icon} className="w-4 h-4 stroke-[2.2]" />
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
                <div className="bg-orange-100/85 dark:bg-orange-950/50 p-3.5 sm:p-4.5 rounded-3xl border-2 border-orange-300/80 dark:border-orange-800/60 shadow-sm space-y-3">
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
                {/* REAL EXAM FULL MOCK TEST HERO CARD */}
                <motion.button
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    triggerHaptic('click');
                    navigate('/quiz/ssc_cgl?mode=mock&count=15');
                  }}
                  className="perf-card col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 text-white border-b-4 border-purple-950 rounded-3xl p-4 sm:p-5 text-left shadow-xl active:brightness-95 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group select-none relative overflow-hidden ring-2 ring-purple-400/50 cursor-pointer"
                >
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                      <Target className="w-8 h-8 text-rose-400 drop-shadow-[0_1px_3px_rgba(251,113,133,0.3)] stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                        <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-gray-950 shadow-xs whitespace-nowrap flex items-center space-x-1">
                          <Zap className="w-3 h-3 fill-amber-950 inline" />
                          <span>Real Exam Mock Mode</span>
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white whitespace-nowrap">
                          +2 Correct / -0.5 Negative
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-200 whitespace-nowrap flex items-center space-x-1">
                          <Timer className="w-3 h-3 inline text-purple-200" />
                          <span>30s Speed Timer</span>
                        </span>
                      </div>
                      <h4 className="font-black text-sm sm:text-lg text-white leading-tight [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] flex items-center">
                        <Target className="w-4 h-4 inline mr-1.5 shrink-0 text-amber-300" />
                        <span>{lang === 'hi' ? 'प्रतियोगी परीक्षा फुल मॉक टेस्ट (Real Exam Simulation)' : 'Full Competitive Exam Mock Test'}</span>
                      </h4>
                      <p className="text-[11px] sm:text-xs text-purple-100 font-bold mt-1 line-clamp-1">
                        {lang === 'hi' ? 'नेगेटिव मार्किंग, टाइमर व कट-ऑफ स्कोरकार्ड के साथ असली परीक्षा जैसा अनुभव' : 'Test your speed, negative marking penalty, accuracy & cut-off score'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/20">
                    <span className="text-xs font-black bg-white text-purple-900 px-3.5 sm:px-4 py-2 rounded-2xl shadow-md group-hover:bg-amber-300 group-hover:text-gray-950 transition-colors flex items-center space-x-1.5 whitespace-nowrap">
                      <span>{lang === 'hi' ? 'मॉक टेस्ट दें' : 'Start Mock'}</span>
                      <Rocket className="w-3.5 h-3.5 text-purple-600 group-hover:text-gray-950" />
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
                          <div className="w-11 h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                            <AppIcon icon={cat.icon} className="w-6 h-6 stroke-[2.2]" />
                          </div>
                          <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full ${cat.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                            {cat.badgeText}
                          </span>
                        </div>

                        <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] tracking-tight">
                          {lang === 'hi' ? cat.titleHi : cat.titleEn}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2">
                          {lang === 'hi' ? cat.descHi : cat.descEn}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                        <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-yellow-300 px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                          Lvl {maxUnlocked} Unlocked
                        </span>
                        <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: ALL INDIA STATE COMPETITIVE EXAMS (DEDICATED SEPARATE CATEGORY) */}
            <div className="bg-amber-100/90 dark:bg-amber-950/40 p-3.5 sm:p-4.5 rounded-3xl border-2 border-amber-300/80 dark:border-amber-800/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-sm shrink-0">🏛️</span>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                    {lang === 'hi' ? 'राज्य स्तरीय परीक्षाएं (State Special Exams & GK)' : 'State Special Exams & GK'}
                  </h3>
                </div>
                <span className="text-[10px] font-black bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shrink-0 whitespace-nowrap">
                  28+ States
                </span>
              </div>

              {/* Standalone Full-Width 3D Banner in Warm Royal Saffron-Amber-Rose (Distinct from Green Cards) */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  triggerHaptic('click');
                  setModalInitialStateId(null);
                  setShowStateModal(true);
                }}
                className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white border-b-4 border-rose-950 rounded-3xl p-4 sm:p-5 text-left shadow-xl active:brightness-95 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group select-none relative overflow-hidden ring-2 ring-amber-400/50 cursor-pointer"
              >
                <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                    <AppIcon icon="🏛️" className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                      <span className="text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full bg-yellow-400 text-gray-950 shadow-xs whitespace-nowrap flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-gray-950 inline" />
                        <span>28+ States Directory</span>
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white whitespace-nowrap">
                        100+ State Exams
                      </span>
                    </div>
                    <h4 className="font-black text-sm sm:text-lg text-white leading-tight [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)]">
                      {lang === 'hi' ? 'सभी राज्य प्रतियोगी परीक्षाएं (State Exams Directory)' : 'All India State Competitive Exams Directory'}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-amber-100 font-bold mt-1 line-clamp-1">
                      {lang === 'hi' ? 'UP, बिहार, राजस्थान, MP, महाराष्ट्र, दिल्ली आदि सभी 28+ राज्यों के एग्जाम्स देखें व पिन करें' : 'Access & Pin UPPSC, BPSC, RAS, MPPSC, Police & all state government quizzes'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/20">
                  <span className="text-xs font-black bg-white text-orange-950 px-3.5 sm:px-4 py-2 rounded-2xl shadow-md group-hover:bg-yellow-300 group-hover:text-gray-950 transition-colors flex items-center space-x-1.5 whitespace-nowrap">
                    <span>{lang === 'hi' ? 'सभी राज्य देखें / खोलें' : 'Explore All States'}</span>
                    <Pin className="w-3.5 h-3.5 inline fill-current rotate-45" />
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </motion.button>
            </div>
              </>
            ) : (
              /* WORLD MODE - 3 RICH CATEGORY REALMS */
              <div className="space-y-6 pt-1">
                {/* SECTION 1: CORE ACADEMIC & SCIENCE SUBJECTS (ENGLISH, MATH, PHYSICS, BIOLOGY, CHEMISTRY) */}
                <div className="bg-sky-100/90 dark:bg-sky-950/50 p-3.5 sm:p-4.5 rounded-3xl border-2 border-sky-300/80 dark:border-sky-800/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 min-w-0 flex-1">
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                        {lang === 'hi' ? 'प्रमुख विषय एवं विज्ञान (Core Subjects)' : 'Academic & Science Subjects'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900 shrink-0 whitespace-nowrap">
                      5 Core Subjects
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 md:gap-4">
                    {worldAcademicSubjects.map((item) => {
                      const maxUnlocked = getCategoryMaxUnlocked(item.id);
                      return (
                        <motion.button
                          key={item.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectCategory(item.id)}
                          className={`perf-card bg-gradient-to-br ${item.gradient} text-white ${item.border3d} active:border-b-[2px] rounded-3xl p-4 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5 gap-1">
                              <div className="w-11 h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                                <AppIcon icon={item.icon} className="w-6 h-6 stroke-[2.2]" />
                              </div>
                              <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                                {item.badge}
                              </span>
                            </div>

                            <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] tracking-tight">
                              {lang === 'hi' ? item.nameHi : item.nameEn}
                            </h4>
                            <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2">
                              {lang === 'hi' ? item.descHi : item.descEn}
                            </p>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                              Lvl {maxUnlocked} Unlocked
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: WORLD & GENERAL GK (4 PINNED CATEGORIES WITH DISTINCT BACKGROUNDS) */}
                <div className="bg-emerald-100/80 dark:bg-emerald-950/50 p-3.5 sm:p-4.5 rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-800/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center space-x-1.5 text-teal-600 dark:text-teal-400 min-w-0 flex-1">
                      <Globe className="w-4 h-4 shrink-0" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                        {lang === 'hi' ? 'विश्व सामान्य ज्ञान व मामले (World GK)' : 'World & General Knowledge'}
                      </h3>
                    </div>
                    <span className="text-[10px] font-black bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-900 shrink-0 whitespace-nowrap">
                      4 Global Realms
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
                    {worldGeneralSubjects.map((item) => {
                      const maxUnlocked = getCategoryMaxUnlocked(item.id);
                      return (
                        <motion.button
                          key={item.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectCategory(item.id)}
                          className={`perf-card bg-gradient-to-br ${item.gradient} text-white ${item.border3d} active:border-b-[2px] rounded-3xl p-4 sm:p-4.5 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5 gap-1">
                              <div className="w-11 h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                                <AppIcon icon={item.icon} className="w-6 h-6 stroke-[2.2]" />
                              </div>
                              <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                                {item.badge}
                              </span>
                            </div>

                            <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] tracking-tight">
                              {lang === 'hi' ? item.nameHi : item.nameEn}
                            </h4>
                            <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2">
                              {lang === 'hi' ? item.descHi : item.descEn}
                            </p>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                              Lvl {maxUnlocked} Unlocked
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 3: CURIOSITY & FASCINATING MINDS (PSYCHOLOGY, FACTS, SPACE, PHILOSOPHY) */}
                <div className="bg-purple-100/85 dark:bg-purple-950/50 p-3.5 sm:p-4.5 rounded-3xl border-2 border-purple-300/80 dark:border-purple-800/60 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center space-x-1.5 text-pink-600 dark:text-pink-400 min-w-0 flex-1">
                      <Sparkles className="w-4 h-4 shrink-0 text-pink-500" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                        {lang === 'hi' ? 'रोचक विषय एवं जिज्ञासा (Curiosity & Mind)' : 'Fascinating Minds & Curiosities'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-black bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-200 dark:border-pink-900 whitespace-nowrap">
                        4 Mind Topics
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          triggerHaptic('click');
                          navigate('/subjects');
                        }}
                        className="text-[10px] sm:text-xs font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1 rounded-xl shadow-sm border border-purple-800 flex items-center space-x-1 whitespace-nowrap cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 inline" />
                        <span>{lang === 'hi' ? 'सभी 17+ विषय' : 'All 17+ Subjects'}</span>
                      </motion.button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-5">
                    {worldCuriositySubjects.map((item) => {
                      const maxUnlocked = getCategoryMaxUnlocked(item.id);
                      return (
                        <motion.button
                          key={item.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectCategory(item.id)}
                          className={`perf-card bg-gradient-to-br ${item.gradient} text-white ${item.border3d} active:border-b-[2px] rounded-3xl p-4 sm:p-4.5 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2.5 gap-1">
                              <div className="w-11 h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                                <AppIcon icon={item.icon} className="w-6 h-6 stroke-[2.2]" />
                              </div>
                              <span className={`text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full ${item.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                                {item.badge}
                              </span>
                            </div>

                            <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1.5 [text-shadow:_0_1px_2px_rgba(0,0,0,0.5)] tracking-tight">
                              {lang === 'hi' ? item.nameHi : item.nameEn}
                            </h4>
                            <p className="text-[11px] sm:text-xs text-white/95 font-bold leading-snug line-clamp-2">
                              {lang === 'hi' ? item.descHi : item.descEn}
                            </p>
                          </div>

                          <div className="mt-4 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
                            <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-1 rounded-xl whitespace-nowrap shrink-0 border border-white/15 shadow-xs">
                              Lvl {maxUnlocked} Unlocked
                            </span>
                            <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-black text-white group-hover:translate-x-0.5 group-hover:bg-white group-hover:text-gray-900 transition-all shrink-0">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}



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
          onOpenQuests={() => setShowQuestsModal(true)}
          onClose={() => {
            setShowDailyRewardModal(false);
            try {
              const today = new Date().toDateString();
              localStorage.setItem('gkoo_daily_reward_last_shown', today);
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

