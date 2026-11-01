import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, Globe, Pin, Play, Bookmark, Target, Rocket, MapPin, Landmark, Layers, BookOpen, Sparkles } from 'lucide-react';
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
import { UnpinConfirmModal } from '../components/UnpinConfirmModal';
import { triggerHaptic } from '../lib/audio';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES_LIST } from '../lib/levelData';
import { getAllIncorrectQuestions } from '../lib/questionTracker';
import { type SubjectItem } from '../data/subjectsData';
import { 
  getPinnedStatesData, 
  getPinnedExamsData, 
  togglePinState, 
  togglePinExam, 
  PIN_EVENT_NAME, 
  type PinnedExamWithState 
} from '../utils/pinnedExams';
import { 
  getPinnedSubjectItems,
  unpinSubject, 
  PINNED_SUBJECTS_EVENT 
} from '../utils/pinnedSubjects';
import { type StateData } from '../data/stateExamsData';

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
  const [pinnedWorldSubjects, setPinnedWorldSubjects] = useState<SubjectItem[]>(() => getPinnedSubjectItems('world'));
  const [pinnedIndiaSubjects, setPinnedIndiaSubjects] = useState<SubjectItem[]>(() => getPinnedSubjectItems('india'));
  
  // Grouped Pinned Items by Category
  const pinnedIndiaExams = useMemo(() => {
    return pinnedIndiaSubjects.filter(item => CATEGORIES_LIST.some(c => c.id === item.id));
  }, [pinnedIndiaSubjects]);

  const pinnedIndiaGS = useMemo(() => {
    return pinnedIndiaSubjects.filter(item => !CATEGORIES_LIST.some(c => c.id === item.id));
  }, [pinnedIndiaSubjects]);

  const pinnedWorldAcademic = useMemo(() => {
    return pinnedWorldSubjects.filter(s => s.category === 'Science' || s.category === 'Language');
  }, [pinnedWorldSubjects]);

  const pinnedWorldGeneral = useMemo(() => {
    return pinnedWorldSubjects.filter(s => s.category === 'Social' || s.category === 'General' || s.category === 'General Studies' || s.category === 'Social Studies');
  }, [pinnedWorldSubjects]);

  const pinnedWorldCuriosity = useMemo(() => {
    return pinnedWorldSubjects.filter(s => s.category === 'Curiosity');
  }, [pinnedWorldSubjects]);
  
  // Collapsible category sections state (persisted across sessions)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('gkoo_dashboard_collapsed_sections');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSectionCollapse = (sectionKey: string) => {
    triggerHaptic('click');
    setCollapsedSections(prev => {
      const next = { ...prev, [sectionKey]: !prev[sectionKey] };
      try {
        localStorage.setItem('gkoo_dashboard_collapsed_sections', JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const [mistakesCount] = useState<number>(() => {
    try {
      return getAllIncorrectQuestions().length;
    } catch {
      return 0;
    }
  });

  // State for unpin confirmation modal on Home
  const [unpinTarget, setUnpinTarget] = useState<{
    type: 'subject' | 'state' | 'exam';
    id: string;
    title: string;
    mode?: 'world' | 'india';
  } | null>(null);

  const handleConfirmUnpin = () => {
    if (!unpinTarget) return;
    if (unpinTarget.type === 'subject') {
      unpinSubject(unpinTarget.id, unpinTarget.mode);
    } else if (unpinTarget.type === 'state') {
      togglePinState(unpinTarget.id);
    } else if (unpinTarget.type === 'exam') {
      togglePinExam(unpinTarget.id);
    }
    setUnpinTarget(null);
  };

  const handleRegionModeChange = (mode: 'india' | 'world') => {
    triggerHaptic('click');
    setRegionMode(mode);
    try {
      localStorage.setItem('gkoo_dashboard_region_mode', mode);
    } catch {}
  };

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
      setPinnedWorldSubjects(getPinnedSubjectItems('world'));
      setPinnedIndiaSubjects(getPinnedSubjectItems('india'));
    };
    syncPinned();
    window.addEventListener(PIN_EVENT_NAME, syncPinned);
    window.addEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    return () => {
      window.removeEventListener(PIN_EVENT_NAME, syncPinned);
      window.removeEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    };
  }, []);

  const handleSelectCategory = (catId: string) => {
    triggerHaptic('click');
    setActiveCategory(catId);
    navigate('/map');
    setActiveView('path');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Always reset scroll to the very top whenever view changes between categories and learning path
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeView]);

  const renderPinnedCard = (item: SubjectItem, mode: 'world' | 'india') => {
    const maxUnlocked = getCategoryMaxUnlocked(item.id);
    return (
      <motion.div
        key={`pinned_${mode}_${item.id}`}
        whileTap={{ scale: 0.99 }}
        onClick={() => {
          triggerHaptic('click');
          setActiveCategory(item.id);
          navigate('/map');
          setActiveView('path');
        }}
        className={`w-full min-h-[134px] sm:min-h-[142px] perf-card bg-gradient-to-r ${item.gradient} text-white ${item.border3d} active:border-b-[2px] rounded-3xl py-3 px-3.5 sm:py-3.5 sm:px-4 text-left shadow-md flex items-center justify-between gap-3 sm:gap-4 group select-none relative overflow-hidden cursor-pointer`}
      >
        {/* Left: Icon */}
        <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
          <AppIcon icon={item.icon} className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
        </div>

        {/* Center: Details */}
        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
          {/* Top Row: Category Badge + Level Badge + Pin Button */}
          <div className="flex items-center justify-between gap-2 -mt-0.5">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className={`text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full ${item.badgeBg} shadow-xs truncate max-w-[130px]`}>
                {item.badge}
              </span>
              <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-yellow-300 px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xs whitespace-nowrap">
                Level {maxUnlocked}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('click');
                setUnpinTarget({
                  type: 'subject',
                  id: item.id,
                  title: lang === 'hi' ? item.nameHi : item.nameEn,
                  mode,
                });
              }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black/25 hover:bg-rose-500 text-amber-300 hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer shrink-0 z-10"
              title={lang === 'hi' ? 'अनपिन करें' : 'Unpin'}
            >
              <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current rotate-45" />
            </button>
          </div>

          <h4 className="font-black text-[14px] sm:text-[17px] text-white leading-normal truncate drop-shadow-xs my-0.5">
            {lang === 'hi' ? item.nameHi : item.nameEn}
          </h4>

          <p className="text-[11px] sm:text-xs text-white/95 font-medium line-clamp-2 leading-relaxed pt-0.5 pb-0.5 pr-[62px] sm:pr-[70px]">
            {lang === 'hi' ? item.descHi : item.descEn}
          </p>
        </div>

        {/* Bottom-Right: Play Button */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 pointer-events-none">
          <div className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl bg-white text-gray-900 font-black text-[11px] sm:text-xs shadow-md group-hover:bg-yellow-300 transition-colors flex items-center space-x-1 shrink-0">
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-gray-900" />
            <span>Play</span>
          </div>
        </div>
      </motion.div>
    );
  };

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
      <main className="px-3 sm:px-4 py-3.5 sm:py-4 max-w-md sm:max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto">
        
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

            {/* -------------------- PINNED TARGETS (LANDSCAPE CARDS BY CATEGORY) -------------------- */}
            {regionMode === 'world' ? (
              // WORLD MODE: PINNED SUBJECTS GROUPED BY CATEGORY
              pinnedWorldSubjects.length > 0 ? (
                <div className="space-y-4 sm:space-y-5">
                  {/* 1. Academic & Science Subjects */}
                  {pinnedWorldAcademic.length > 0 && (
                    <div className="bg-sky-100/90 dark:bg-sky-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-sky-300/80 dark:border-sky-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div 
                          onClick={() => toggleSectionCollapse('pinned_world_academic')}
                          className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 min-w-0 flex-1 cursor-pointer select-none"
                        >
                          <BookOpen className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                            {lang === 'hi' ? 'प्रमुख विषय एवं विज्ञान (Core Subjects & Science)' : 'Core Subjects & Science'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-900/60 text-sky-950 dark:text-sky-200 shrink-0">
                            {pinnedWorldAcademic.length} {lang === 'hi' ? 'पिन' : 'Pinned'}
                          </span>
                          <button
                            onClick={() => {
                              triggerHaptic('click');
                              navigate('/subjects');
                            }}
                            className="text-[10px] sm:text-xs font-black text-sky-700 dark:text-sky-300 bg-sky-200/60 dark:bg-sky-900/50 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800 hover:bg-sky-300/60 transition-all cursor-pointer whitespace-nowrap"
                          >
                            + {lang === 'hi' ? 'और जोड़ें' : '+ Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse('pinned_world_academic')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-200/80 dark:bg-sky-900/60 hover:bg-sky-300 dark:hover:bg-amber-800 text-sky-950 dark:text-sky-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title={collapsedSections['pinned_world_academic'] ? (lang === 'hi' ? 'खोलें' : 'Expand') : (lang === 'hi' ? 'बंद करें' : 'Collapse')}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections['pinned_world_academic'] ? '-rotate-90' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedSections['pinned_world_academic'] && (
                          <motion.div
                            key="content_pinned_world_academic"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 overflow-hidden"
                          >
                            {pinnedWorldAcademic.map(item => renderPinnedCard(item, 'world'))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 2. World & General GK */}
                  {pinnedWorldGeneral.length > 0 && (
                    <div className="bg-emerald-100/80 dark:bg-emerald-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div 
                          onClick={() => toggleSectionCollapse('pinned_world_general')}
                          className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 min-w-0 flex-1 cursor-pointer select-none"
                        >
                          <Globe className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                            {lang === 'hi' ? 'विश्व एवं सामान्य ज्ञान (World & General GK)' : 'World & General GK'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 shrink-0">
                            {pinnedWorldGeneral.length} {lang === 'hi' ? 'पिन' : 'Pinned'}
                          </span>
                          <button
                            onClick={() => {
                              triggerHaptic('click');
                              navigate('/subjects');
                            }}
                            className="text-[10px] sm:text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-200/60 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-300/60 transition-all cursor-pointer whitespace-nowrap"
                          >
                            + {lang === 'hi' ? 'और जोड़ें' : '+ Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse('pinned_world_general')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-200/80 dark:bg-emerald-900/60 hover:bg-emerald-300 dark:hover:bg-amber-800 text-emerald-950 dark:text-emerald-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title={collapsedSections['pinned_world_general'] ? (lang === 'hi' ? 'खोलें' : 'Expand') : (lang === 'hi' ? 'बंद करें' : 'Collapse')}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections['pinned_world_general'] ? '-rotate-90' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedSections['pinned_world_general'] && (
                          <motion.div
                            key="content_pinned_world_general"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 overflow-hidden"
                          >
                            {pinnedWorldGeneral.map(item => renderPinnedCard(item, 'world'))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 3. Curiosity & Minds */}
                  {pinnedWorldCuriosity.length > 0 && (
                    <div className="bg-purple-100/85 dark:bg-purple-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-purple-300/80 dark:border-purple-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div 
                          onClick={() => toggleSectionCollapse('pinned_world_curiosity')}
                          className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 min-w-0 flex-1 cursor-pointer select-none"
                        >
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                            {lang === 'hi' ? 'रोचक ज्ञान एवं जिज्ञासा (Curiosity & Minds)' : 'Curiosity & Fascinating Minds'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-950 dark:text-purple-200 shrink-0">
                            {pinnedWorldCuriosity.length} {lang === 'hi' ? 'पिन' : 'Pinned'}
                          </span>
                          <button
                            onClick={() => {
                              triggerHaptic('click');
                              navigate('/subjects');
                            }}
                            className="text-[10px] sm:text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-200/60 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-full border border-purple-300 dark:border-purple-800 hover:bg-purple-300/60 transition-all cursor-pointer whitespace-nowrap"
                          >
                            + {lang === 'hi' ? 'और जोड़ें' : '+ Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse('pinned_world_curiosity')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-200/80 dark:bg-purple-900/60 hover:bg-purple-300 dark:hover:bg-amber-800 text-purple-950 dark:text-purple-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title={collapsedSections['pinned_world_curiosity'] ? (lang === 'hi' ? 'खोलें' : 'Expand') : (lang === 'hi' ? 'बंद करें' : 'Collapse')}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections['pinned_world_curiosity'] ? '-rotate-90' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedSections['pinned_world_curiosity'] && (
                          <motion.div
                            key="content_pinned_world_curiosity"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 overflow-hidden"
                          >
                            {pinnedWorldCuriosity.map(item => renderPinnedCard(item, 'world'))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-100/80 dark:bg-amber-950/40 p-6 rounded-3xl border-2 border-amber-300/80 dark:border-amber-800/60 shadow-sm text-center">
                  <Pin className="w-8 h-8 mx-auto text-amber-500 mb-2 rotate-45" />
                  <h4 className="font-black text-sm text-gray-800 dark:text-white mb-1">
                    {lang === 'hi' ? 'कोई पिन किया गया विषय नहीं' : 'No Pinned Subjects'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-bold">
                    {lang === 'hi' ? 'विषय पेज पर जाएं और अपने पसंदीदा विषयों को 📌 पिन करें' : 'Go to Subjects page and pin 📌 your favorite subjects to Home'}
                  </p>
                  <button
                    onClick={() => navigate('/subjects')}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs shadow-md cursor-pointer"
                  >
                    {lang === 'hi' ? 'विषय देखें' : 'Browse Subjects'}
                  </button>
                </div>
              )
            ) : (
              // INDIA MODE: PINNED TARGETS (EXAMS, GS & STATES IN SEPARATE CATEGORY CONTAINERS)
              (pinnedIndiaSubjects.length > 0 || pinnedStates.length > 0 || pinnedExams.length > 0) ? (
                <div className="space-y-4 sm:space-y-5">
                  {/* 1. Indian Competitive Exams Category */}
                  {pinnedIndiaExams.length > 0 && (
                    <div className="bg-orange-100/85 dark:bg-orange-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-orange-300/80 dark:border-orange-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div 
                          onClick={() => toggleSectionCollapse('pinned_india_exams')}
                          className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 min-w-0 flex-1 cursor-pointer select-none"
                        >
                          <Landmark className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                            {lang === 'hi' ? 'प्रमुख राष्ट्रीय परीक्षाएं (Central & State Exams)' : 'National Exam Specializations'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-200/80 dark:bg-orange-900/60 text-orange-950 dark:text-orange-200 shrink-0">
                            {pinnedIndiaExams.length} {lang === 'hi' ? 'पिन' : 'Pinned'}
                          </span>
                          <button
                            onClick={() => {
                              triggerHaptic('click');
                              navigate('/subjects');
                            }}
                            className="text-[10px] sm:text-xs font-black text-rose-700 dark:text-rose-300 bg-orange-200/60 dark:bg-orange-900/50 px-2.5 py-0.5 rounded-full border border-orange-300 dark:border-orange-800 hover:bg-orange-300/60 transition-all cursor-pointer whitespace-nowrap"
                          >
                            + {lang === 'hi' ? 'और जोड़ें' : '+ Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse('pinned_india_exams')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-200/80 dark:bg-orange-900/60 hover:bg-orange-300 dark:hover:bg-orange-800 text-orange-950 dark:text-orange-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title={collapsedSections['pinned_india_exams'] ? (lang === 'hi' ? 'खोलें' : 'Expand') : (lang === 'hi' ? 'बंद करें' : 'Collapse')}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections['pinned_india_exams'] ? '-rotate-90' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedSections['pinned_india_exams'] && (
                          <motion.div
                            key="content_pinned_india_exams"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 overflow-hidden"
                          >
                            {pinnedIndiaExams.map(item => renderPinnedCard(item, 'india'))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 2. Indian GS & Academic Subjects Category */}
                  {pinnedIndiaGS.length > 0 && (
                    <div className="bg-sky-100/90 dark:bg-sky-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-sky-300/80 dark:border-sky-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div 
                          onClick={() => toggleSectionCollapse('pinned_india_gs')}
                          className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 min-w-0 flex-1 cursor-pointer select-none"
                        >
                          <Layers className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                            {lang === 'hi' ? 'सामान्य अध्ययन व विषय (General Studies & Subjects)' : 'GS & Core Academic Subjects'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-900/60 text-sky-950 dark:text-sky-200 shrink-0">
                            {pinnedIndiaGS.length} {lang === 'hi' ? 'पिन' : 'Pinned'}
                          </span>
                          <button
                            onClick={() => {
                              triggerHaptic('click');
                              navigate('/subjects');
                            }}
                            className="text-[10px] sm:text-xs font-black text-sky-700 dark:text-sky-300 bg-sky-200/60 dark:bg-sky-900/50 px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800 hover:bg-sky-300/60 transition-all cursor-pointer whitespace-nowrap"
                          >
                            + {lang === 'hi' ? 'और जोड़ें' : '+ Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse('pinned_india_gs')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-sky-200/80 dark:bg-sky-900/60 hover:bg-sky-300 dark:hover:bg-amber-800 text-sky-950 dark:text-sky-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title={collapsedSections['pinned_india_gs'] ? (lang === 'hi' ? 'खोलें' : 'Expand') : (lang === 'hi' ? 'बंद करें' : 'Collapse')}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections['pinned_india_gs'] ? '-rotate-90' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedSections['pinned_india_gs'] && (
                          <motion.div
                            key="content_pinned_india_gs"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 overflow-hidden"
                          >
                            {pinnedIndiaGS.map(item => renderPinnedCard(item, 'india'))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 3. Indian State Special Exams Category */}
                  {(pinnedStates.length > 0 || pinnedExams.length > 0) && (
                    <div className="bg-amber-100/90 dark:bg-amber-950/40 p-2 sm:p-3.5 rounded-3xl border-2 border-amber-300/80 dark:border-amber-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div 
                          onClick={() => toggleSectionCollapse('pinned_india_states')}
                          className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 min-w-0 flex-1 cursor-pointer select-none"
                        >
                          <MapPin className="w-4 h-4 shrink-0" />
                          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                            {lang === 'hi' ? 'भारतीय राज्य विशेष परीक्षाएं (State Special GK & Exams)' : 'Indian States Special GK & Exams'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 shrink-0">
                            {pinnedStates.length + pinnedExams.length} {lang === 'hi' ? 'पिन' : 'Pinned'}
                          </span>
                          <button
                            onClick={() => {
                              triggerHaptic('click');
                              setShowStateModal(true);
                            }}
                            className="text-[10px] sm:text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800 hover:bg-amber-300/60 transition-all cursor-pointer whitespace-nowrap"
                          >
                            + {lang === 'hi' ? 'और जोड़ें' : '+ Add'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse('pinned_india_states')}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-200/80 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title={collapsedSections['pinned_india_states'] ? (lang === 'hi' ? 'खोलें' : 'Expand') : (lang === 'hi' ? 'बंद करें' : 'Collapse')}
                          >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${collapsedSections['pinned_india_states'] ? '-rotate-90' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!collapsedSections['pinned_india_states'] && (
                          <motion.div
                            key="content_pinned_india_states"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3.5 overflow-hidden"
                          >
                            {/* Pinned States */}
                            {pinnedStates.map((st) => (
                              <motion.div
                                key={`pinned_state_${st.id}`}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => {
                                  triggerHaptic('click');
                                  setModalInitialStateId(st.id);
                                  setShowStateModal(true);
                                }}
                                className={`w-full min-h-[134px] sm:min-h-[142px] perf-card bg-gradient-to-r ${st.gradient} text-white rounded-3xl py-3 px-3.5 sm:py-3.5 sm:px-4 text-left shadow-md flex items-center justify-between gap-3 sm:gap-4 group select-none relative overflow-hidden cursor-pointer border-b-[5px] border-black/30`}
                              >
                                <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                  <AppIcon icon={st.icon} className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                                </div>

                                <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                                  <div className="flex items-center justify-between gap-2 -mt-0.5">
                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                      <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-gray-950 shadow-xs flex items-center space-x-1">
                                        <MapPin className="w-2.5 h-2.5 inline shrink-0" />
                                        <span>{lang === 'hi' ? 'राज्य विशेष' : 'State Special'}</span>
                                      </span>
                                      <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-white px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xs whitespace-nowrap">
                                        {st.exams.length} {lang === 'hi' ? 'परीक्षाएं' : 'Exams'}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        triggerHaptic('click');
                                        setUnpinTarget({
                                          type: 'state',
                                          id: st.id,
                                          title: lang === 'hi' ? st.nameHi : st.nameEn,
                                        });
                                      }}
                                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black/25 hover:bg-rose-500 text-amber-300 hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer shrink-0 z-10"
                                      title={lang === 'hi' ? 'अनपिन करें' : 'Unpin'}
                                    >
                                      <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current rotate-45" />
                                    </button>
                                  </div>

                                  <h4 className="font-black text-[14px] sm:text-[17px] text-white leading-tight pt-1 pb-0.5 drop-shadow-xs line-clamp-1 my-1">
                                    {lang === 'hi' ? st.nameHi : st.nameEn}
                                  </h4>

                                  <p className="text-[11px] sm:text-xs text-white/95 font-medium line-clamp-2 leading-relaxed pt-0.5 pb-0.5 pr-[62px] sm:pr-[70px]">
                                    {lang === 'hi' ? `राजधानी: ${st.capitalHi}` : `Capital: ${st.capitalEn}`} • {st.exams.length} {lang === 'hi' ? 'प्रमुख परीक्षाएं' : 'Competitive Exams'}
                                  </p>
                                </div>

                                <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 pointer-events-none">
                                  <div className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl bg-white text-gray-900 font-black text-[11px] sm:text-xs shadow-md group-hover:bg-yellow-300 transition-colors flex items-center space-x-1 shrink-0">
                                    <span>Open</span>
                                    <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </div>
                                </div>
                              </motion.div>
                            ))}

                            {/* Pinned Individual State Exams */}
                            {pinnedExams.map(({ exam, state }) => {
                              const maxUnlocked = getCategoryMaxUnlocked(exam.id);
                              return (
                                <motion.div
                                  key={`pinned_exam_${exam.id}`}
                                  whileTap={{ scale: 0.99 }}
                                  onClick={() => {
                                    triggerHaptic('click');
                                    setActiveCategory(exam.id);
                                    navigate('/map');
                                    setActiveView('path');
                                  }}
                                  className="w-full min-h-[134px] sm:min-h-[142px] perf-card bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 text-white rounded-3xl py-3 px-3.5 sm:py-3.5 sm:px-4 text-left shadow-md flex items-center justify-between gap-3 sm:gap-4 group select-none relative overflow-hidden cursor-pointer border-b-[5px] border-amber-950"
                                >
                                  <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                    <AppIcon icon={state.icon} className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                                  </div>

                                  <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                                    <div className="flex items-center justify-between gap-2 -mt-0.5">
                                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                                        <span className="text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full bg-yellow-400 text-gray-950 shadow-xs truncate max-w-[130px]">
                                          {exam.badge}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-black bg-black/35 text-yellow-300 px-2.5 py-0.5 rounded-lg border border-white/10 shadow-xs whitespace-nowrap">
                                          Level {maxUnlocked}
                                        </span>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic('click');
                                          setUnpinTarget({
                                            type: 'exam',
                                            id: exam.id,
                                            title: lang === 'hi' ? exam.nameHi : exam.nameEn,
                                          });
                                        }}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-black/25 hover:bg-rose-500 text-amber-300 hover:text-white transition-all flex items-center justify-center shadow-xs cursor-pointer shrink-0 z-10"
                                        title={lang === 'hi' ? 'अनपिन करें' : 'Unpin'}
                                      >
                                        <Pin className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current rotate-45" />
                                      </button>
                                    </div>

                                    <h4 className="font-black text-[14px] sm:text-[17px] text-white leading-normal truncate drop-shadow-xs my-0.5">
                                      {lang === 'hi' ? exam.nameHi : exam.nameEn}
                                    </h4>

                                    <p className="text-[11px] sm:text-xs text-white/95 font-medium line-clamp-2 leading-relaxed pt-0.5 pb-0.5 pr-[62px] sm:pr-[70px]">
                                      {lang === 'hi' ? state.nameHi : state.nameEn} • {lang === 'hi' ? exam.descHi : exam.descEn}
                                    </p>
                                  </div>

                                  <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 pointer-events-none">
                                    <div className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl bg-white text-gray-900 font-black text-[11px] sm:text-xs shadow-md group-hover:bg-yellow-300 transition-colors flex items-center space-x-1 shrink-0">
                                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-gray-900" />
                                      <span>Play</span>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-100/80 dark:bg-amber-950/40 p-6 rounded-3xl border-2 border-amber-300/80 dark:border-amber-800/60 shadow-sm text-center">
                  <Pin className="w-8 h-8 mx-auto text-amber-500 mb-2 rotate-45" />
                  <h4 className="font-black text-sm text-gray-800 dark:text-white mb-1">
                    {lang === 'hi' ? 'कोई पिन किया गया लक्ष्य नहीं' : 'No Pinned Targets'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-bold">
                    {lang === 'hi' ? 'विषय पेज पर जाएं और अपनी परीक्षाएं या विषय 📌 पिन करें' : 'Go to Subjects page and pin 📌 your exams or subjects to Home'}
                  </p>
                  <button
                    onClick={() => navigate('/subjects')}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white rounded-2xl font-black text-xs shadow-md cursor-pointer"
                  >
                    {lang === 'hi' ? 'परीक्षाएं व विषय देखें' : 'Browse Exams & Subjects'}
                  </button>
                </div>
              )
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

      {/* UNPIN CONFIRMATION MODAL */}
      <UnpinConfirmModal
        isOpen={!!unpinTarget}
        title={unpinTarget?.title || ''}
        lang={lang}
        onCancel={() => setUnpinTarget(null)}
        onConfirm={handleConfirmUnpin}
      />

    </div>
  );
}

