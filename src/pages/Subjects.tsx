import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, BookOpen, Search, Pin, Play, Sparkles, Layers, Landmark, ChevronRight } from 'lucide-react';
import { TopBar } from '../components/TopBar';
import { AppIcon } from '../components/AppIcon';
import { StateExamModal } from '../components/StateExamModal';
import { DailyQuestsModal } from '../components/DailyQuestsModal';
import { DailyLoginRewardModal } from '../components/DailyLoginRewardModal';
import { StreakFreezeModal } from '../components/StreakFreezeModal';
import { ALL_SUBJECTS_LIST, type SubjectItem } from '../data/subjectsData';
import { CATEGORIES_LIST, type CategoryInfo } from '../lib/levelData';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { 
  getPinnedSubjectIds, 
  togglePinSubject, 
  getSubjectPinRank,
  PINNED_SUBJECTS_EVENT,
  WORLD_SUBJECT_IDS,
  INDIA_GS_SUBJECT_IDS
} from '../utils/pinnedSubjects';

const WORLD_ACADEMIC_IDS = ['sub_english', 'sub_hindi', 'sub_math', 'sub_physics', 'sub_biology', 'sub_chemistry'];
const WORLD_GENERAL_IDS = ['sub_world_geography', 'sub_world_history', 'sub_international', 'sub_gk'];
const WORLD_CURIOSITY_IDS = ['sub_psychology', 'sub_facts', 'sub_space', 'sub_philosophy'];

export default function Subjects() {
  const navigate = useNavigate();
  const { lang, setActiveCategory, getCategoryMaxUnlocked } = useAppContext();

  // Region Mode: World vs India (Synchronized with Home Dashboard)
  const [regionMode, setRegionMode] = useState<'india' | 'world'>(() => {
    try {
      return (localStorage.getItem('gkoo_dashboard_region_mode') as 'india' | 'world') || 'india';
    } catch {
      return 'india';
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [worldCategoryFilter, setWorldCategoryFilter] = useState<'all' | 'Science' | 'Language' | 'Social' | 'Curiosity'>('all');
  const [indiaCategoryFilter, setIndiaCategoryFilter] = useState<'all' | 'exam' | 'subject' | 'state'>('all');
  const [showStateModal, setShowStateModal] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [showStreakFreezeModal, setShowStreakFreezeModal] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [, setPinnedIds] = useState<string[]>(() => getPinnedSubjectIds());

  useEffect(() => {
    const syncPinned = () => setPinnedIds(getPinnedSubjectIds());
    syncPinned();
    window.addEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    return () => window.removeEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
  }, []);

  const handleRegionModeChange = (mode: 'india' | 'world') => {
    triggerHaptic('click');
    setRegionMode(mode);
    setSearchQuery('');
    try {
      localStorage.setItem('gkoo_dashboard_region_mode', mode);
    } catch {}
  };

  const handleSelectSubject = (catId: string) => {
    triggerHaptic('click');
    setActiveCategory(catId);
    navigate('/map');
  };

  const handleStartDirectQuiz = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    triggerHaptic('click');
    setActiveCategory(catId);
    const maxUnlocked = getCategoryMaxUnlocked(catId);
    navigate(`/quiz/level-${catId}-${maxUnlocked}`);
  };

  const handleTogglePin = (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    triggerHaptic('success');
    togglePinSubject(subId, regionMode);
  };

  // Pure World Subjects filtering (Excludes local Indian exam topics)
  const filteredWorldSubjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_SUBJECTS_LIST
      .filter(sub => WORLD_SUBJECT_IDS.has(sub.id))
      .filter(sub => {
        const matchesSearch = !q ||
          sub.nameEn.toLowerCase().includes(q) ||
          sub.nameHi.toLowerCase().includes(q) ||
          sub.shortName.toLowerCase().includes(q) ||
          sub.descEn.toLowerCase().includes(q) ||
          sub.descHi.toLowerCase().includes(q);

        if (!matchesSearch) return false;

        if (worldCategoryFilter === 'all') return true;
        if (worldCategoryFilter === 'Science') return sub.category === 'Science' || sub.category === 'Quantitative';
        if (worldCategoryFilter === 'Language') return sub.category === 'Language';
        if (worldCategoryFilter === 'Social') return sub.category === 'General' || sub.category === 'Social Studies' || sub.category === 'General Studies';
        if (worldCategoryFilter === 'Curiosity') return sub.category === 'Curiosity' || sub.id.includes('facts') || sub.id.includes('space') || sub.id.includes('psychology') || sub.id.includes('philosophy');
        return true;
      });
  }, [searchQuery, worldCategoryFilter]);

  // India Exam and GS categories
  const examCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CATEGORIES_LIST.filter(c => {
      if (c.type !== 'exam') return false;
      if (!q) return true;
      return (
        c.titleEn.toLowerCase().includes(q) ||
        c.titleHi.toLowerCase().includes(q) ||
        c.descEn.toLowerCase().includes(q) ||
        c.descHi.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const gsSubjectCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_SUBJECTS_LIST
      .filter(sub => INDIA_GS_SUBJECT_IDS.has(sub.id))
      .filter(sub => {
        if (!q) return true;
        return (
          sub.nameEn.toLowerCase().includes(q) ||
          sub.nameHi.toLowerCase().includes(q) ||
          sub.shortName.toLowerCase().includes(q) ||
          sub.descEn.toLowerCase().includes(q) ||
          sub.descHi.toLowerCase().includes(q)
        );
      });
  }, [searchQuery]);

  // World Mode grouped realms
  const worldAcademicSubjects = useMemo(() => {
    return filteredWorldSubjects.filter(sub => WORLD_ACADEMIC_IDS.includes(sub.id));
  }, [filteredWorldSubjects]);

  const worldGeneralSubjects = useMemo(() => {
    return filteredWorldSubjects.filter(sub => WORLD_GENERAL_IDS.includes(sub.id));
  }, [filteredWorldSubjects]);

  const worldCuriositySubjects = useMemo(() => {
    return filteredWorldSubjects.filter(sub => WORLD_CURIOSITY_IDS.includes(sub.id));
  }, [filteredWorldSubjects]);

  const renderSubjectCard = (sub: SubjectItem) => {
    const maxUnlocked = getCategoryMaxUnlocked(sub.id);
    const pinRank = getSubjectPinRank(sub.id, regionMode);

    return (
      <motion.div
        key={sub.id}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelectSubject(sub.id)}
        className={`perf-card bg-gradient-to-br ${sub.gradient} text-white ${sub.border3d} rounded-3xl px-2.5 py-3 sm:p-4 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden cursor-pointer`}
      >
        <div>
          {/* Top Row: Icon + Pin Button */}
          <div className="flex items-center justify-between mb-2 gap-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <AppIcon icon={sub.icon} className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>

            <button
              type="button"
              onClick={(e) => handleTogglePin(e, sub.id)}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                pinRank > 0
                  ? 'bg-amber-400 text-gray-950 shadow-xs ring-2 ring-amber-200'
                  : 'bg-black/20 hover:bg-black/40 text-white/80'
              }`}
              title={pinRank > 0 ? (lang === 'hi' ? 'होम से अनपिन करें' : 'Unpin from Home') : (lang === 'hi' ? 'होम पर पिन करें' : 'Pin to Home')}
            >
              <Pin className={`w-3.5 h-3.5 ${pinRank > 0 ? 'fill-gray-950 rotate-45' : ''}`} />
            </button>
          </div>

          {/* Category Badge Pill */}
          <div className="mb-1.5 flex items-center">
            <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full ${sub.badgeBg} shadow-xs truncate max-w-full`}>
              {sub.badge}
            </span>
          </div>

          <h3 className="font-black text-[13px] sm:text-base text-white leading-tight min-h-[2.4rem] line-clamp-2 pt-0.5 mb-1 drop-shadow-xs flex items-center">
            {lang === 'hi' ? sub.nameHi : sub.nameEn}
          </h3>

          <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-relaxed mb-3">
            {lang === 'hi' ? sub.descHi : sub.descEn}
          </p>
        </div>

        {/* Bottom Action Footer */}
        <div className="mt-2 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
          <span className="text-[10px] font-black bg-black/35 text-yellow-300 px-2 py-1 rounded-xl border border-white/10 shadow-xs whitespace-nowrap shrink-0">
            Level {maxUnlocked}
          </span>

          <button
            type="button"
            onClick={(e) => handleStartDirectQuiz(e, sub.id)}
            className="px-2.5 py-1 rounded-xl bg-white text-gray-900 hover:bg-yellow-300 text-[10px] font-black flex items-center space-x-1 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>{lang === 'hi' ? 'खेलें' : 'Play'}</span>
          </button>
        </div>
      </motion.div>
    );
  };

  const renderExamCard = (cat: CategoryInfo) => {
    const maxUnlocked = getCategoryMaxUnlocked(cat.id);
    const pinRank = getSubjectPinRank(cat.id, 'india');

    return (
      <motion.div
        key={cat.id}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelectSubject(cat.id)}
        className={`perf-card bg-gradient-to-br ${cat.gradient} text-white ${cat.border3d} rounded-3xl px-2.5 py-3 sm:p-4 text-left shadow-md active:brightness-95 transition-all flex flex-col justify-between group select-none relative overflow-hidden cursor-pointer`}
      >
        <div>
          <div className="flex items-center justify-between mb-2 gap-1">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/20 dark:bg-black/40 border border-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform shrink-0">
              <AppIcon icon={cat.icon} className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>

            <button
              type="button"
              onClick={(e) => handleTogglePin(e, cat.id)}
              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                pinRank > 0
                  ? 'bg-amber-400 text-gray-950 shadow-xs ring-2 ring-amber-200'
                  : 'bg-black/20 hover:bg-black/40 text-white/80'
              }`}
              title={pinRank > 0 ? (lang === 'hi' ? 'होम से अनपिन करें' : 'Unpin from Home') : (lang === 'hi' ? 'होम पर पिन करें' : 'Pin to Home')}
            >
              <Pin className={`w-3.5 h-3.5 ${pinRank > 0 ? 'fill-gray-950 rotate-45' : ''}`} />
            </button>
          </div>

          <div className="mb-1.5 flex items-center">
            <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full ${cat.badgeBg} shadow-xs truncate max-w-full`}>
              {cat.badgeText}
            </span>
          </div>

          <h3 className="font-black text-[13px] sm:text-base text-white leading-tight min-h-[2.4rem] line-clamp-2 pt-0.5 mb-1 drop-shadow-xs flex items-center">
            {lang === 'hi' ? cat.titleHi : cat.titleEn}
          </h3>
          <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-relaxed mb-3">
            {lang === 'hi' ? cat.descHi : cat.descEn}
          </p>
        </div>

        <div className="mt-2 pt-2.5 border-t border-white/25 flex items-center justify-between gap-1">
          <span className="text-[10px] font-black bg-black/35 text-yellow-300 px-2 py-1 rounded-xl border border-white/10 shadow-xs whitespace-nowrap shrink-0">
            Level {maxUnlocked}
          </span>

          <button
            type="button"
            onClick={(e) => handleStartDirectQuiz(e, cat.id)}
            className="px-2.5 py-1 rounded-xl bg-white text-gray-900 hover:bg-yellow-300 text-[10px] font-black flex items-center space-x-1 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>{lang === 'hi' ? 'टेस्ट दें' : 'Test'}</span>
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-transparent pb-28 font-sans transition-colors duration-200">
      <TopBar 
        onOpenQuests={() => setShowQuestsModal(true)} 
        onOpenStreakFreeze={() => setShowStreakFreezeModal(true)} 
        onOpenDailyReward={() => setShowDailyRewardModal(true)}
      />

      <main className="px-3 sm:px-4 py-3.5 sm:py-4 max-w-md sm:max-w-xl md:max-w-5xl lg:max-w-6xl mx-auto">
        {/* World vs India Switcher (Crystal clear descriptive pills) */}
        <div className="flex bg-gray-200/90 dark:bg-[#13192B] p-1.5 rounded-2xl mb-4 sm:mb-5 text-xs font-black shadow-inner border border-gray-300/40 dark:border-indigo-950/80 max-w-md mx-auto">
          {/* 1st Button: World Mode */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRegionModeChange('world')}
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
            onClick={() => handleRegionModeChange('india')}
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

        {/* Page Banner Header */}
        <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 rounded-3xl p-4 sm:p-5 border-2 border-indigo-200/60 dark:border-indigo-900/50 mb-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] text-white flex items-center justify-center text-2xl shadow-md border-b-2 border-[#D93848] shrink-0">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight">
                {regionMode === 'world'
                  ? (lang === 'hi' ? '🌍 विश्व विषय एवं सामान्य ज्ञान' : '🌍 World Subjects & Global Knowledge')
                  : (lang === 'hi' ? '🇮🇳 भारत परीक्षा एवं विषय डायरेक्टरी' : '🇮🇳 India Exams & Subject Directory')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                {lang === 'hi'
                  ? 'अपना पसंदीदा विषय चुनें, लेवल पार करें या होम स्क्रीन पर 📌 पिन करें'
                  : 'Select any subject to begin learning or pin 📌 to your home screen'}
              </p>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center space-x-2 self-start sm:self-auto bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-2xl border border-gray-200/60 dark:border-gray-800 text-xs font-black text-gray-700 dark:text-gray-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {regionMode === 'world' 
                ? (lang === 'hi' ? '15+ अंतरराष्ट्रीय विषय' : '15+ World Subjects') 
                : (lang === 'hi' ? '26+ परीक्षा व विषय श्रेणियां' : '26+ Exam & GS Categories')}
            </span>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              regionMode === 'world'
                ? (lang === 'hi' ? 'विषय खोजें (e.g. Physics, Maths, Space, Biology)...' : 'Search world subjects (e.g. Physics, Maths, Space)...')
                : (lang === 'hi' ? 'परीक्षा या विषय खोजें (e.g. SSC CGL, Railway, भूगोल, संविधान)...' : 'Search exams or subjects (e.g. SSC, Railway, Polity)...')
            }
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#13192B] border-2 border-gray-200 dark:border-indigo-950/80 rounded-2xl text-xs sm:text-sm font-bold text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#FF5F6D] transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {regionMode === 'world' ? (
            <>
              {[
                { id: 'all', labelHi: 'सभी विषय', labelEn: 'All Subjects' },
                { id: 'Science', labelHi: 'विज्ञान व गणित', labelEn: 'Science & Maths' },
                { id: 'Language', labelHi: 'अंग्रेजी भाषा', labelEn: 'English' },
                { id: 'Social', labelHi: 'भूगोल व इतिहास', labelEn: 'Social & GK' },
                { id: 'Curiosity', labelHi: 'अंतरिक्ष व जिज्ञासा', labelEn: 'Space & Facts' },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => {
                    triggerHaptic('click');
                    setWorldCategoryFilter(chip.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                    worldCategoryFilter === chip.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#13192B] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-indigo-950/80 hover:border-gray-300'
                  }`}
                >
                  {lang === 'hi' ? chip.labelHi : chip.labelEn}
                </button>
              ))}
            </>
          ) : (
            <>
              {[
                { id: 'all', labelHi: 'सभी श्रेणियां', labelEn: 'All Categories' },
                { id: 'exam', labelHi: 'प्रतियोगी परीक्षाएं (SSC / Rly / UPSC)', labelEn: 'Competitive Exams' },
                { id: 'subject', labelHi: 'सामान्य अध्ययन व विषय (GS Subjects)', labelEn: 'GS Subjects' },
                { id: 'state', labelHi: 'राज्य परीक्षाएं (State GK)', labelEn: 'State Exams' },
              ].map(chip => (
                <button
                  key={chip.id}
                  onClick={() => {
                    triggerHaptic('click');
                    setIndiaCategoryFilter(chip.id as any);
                    if (chip.id === 'state') {
                      setShowStateModal(true);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                    indiaCategoryFilter === chip.id
                      ? 'bg-[#FF5F6D] text-white shadow-xs'
                      : 'bg-white dark:bg-[#13192B] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-indigo-950/80 hover:border-gray-300'
                  }`}
                >
                  {lang === 'hi' ? chip.labelHi : chip.labelEn}
                </button>
              ))}
            </>
          )}
        </div>

        {/* -------------------- WORLD MODE SUBJECTS CATEGORIES -------------------- */}
        {regionMode === 'world' ? (
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Academic & Science Subjects */}
            {worldAcademicSubjects.length > 0 && (
              <div className="bg-sky-100/90 dark:bg-sky-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-sky-300/80 dark:border-sky-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 min-w-0 flex-1">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'प्रमुख विषय एवं विज्ञान (Core Subjects & Science)' : 'Core Subjects & Science'}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-900/60 text-sky-950 dark:text-sky-200 shrink-0">
                    {worldAcademicSubjects.length} {lang === 'hi' ? 'विषय' : 'Subjects'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-1">
                  {worldAcademicSubjects.map(renderSubjectCard)}
                </div>
              </div>
            )}

            {/* 2. World & General GK */}
            {worldGeneralSubjects.length > 0 && (
              <div className="bg-emerald-100/80 dark:bg-emerald-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-emerald-300/80 dark:border-emerald-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 min-w-0 flex-1">
                    <Globe className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'विश्व एवं सामान्य ज्ञान (World & General GK)' : 'World & General GK'}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 shrink-0">
                    {worldGeneralSubjects.length} {lang === 'hi' ? 'विषय' : 'Subjects'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-1">
                  {worldGeneralSubjects.map(renderSubjectCard)}
                </div>
              </div>
            )}

            {/* 3. Curiosity & Fascinating Minds */}
            {worldCuriositySubjects.length > 0 && (
              <div className="bg-purple-100/85 dark:bg-purple-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-purple-300/80 dark:border-purple-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 min-w-0 flex-1">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'रोचक ज्ञान एवं जिज्ञासा (Curiosity & Minds)' : 'Curiosity & Fascinating Minds'}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-200/80 dark:bg-purple-900/60 text-purple-950 dark:text-purple-200 shrink-0">
                    {worldCuriositySubjects.length} {lang === 'hi' ? 'विषय' : 'Subjects'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-1">
                  {worldCuriositySubjects.map(renderSubjectCard)}
                </div>
              </div>
            )}

            {/* Empty State for World Mode */}
            {worldAcademicSubjects.length === 0 && worldGeneralSubjects.length === 0 && worldCuriositySubjects.length === 0 && (
              <div className="text-center py-12 px-4 bg-white/60 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                  {lang === 'hi' ? 'कोई विषय नहीं मिला। कृपया दूसरा शब्द खोजें।' : 'No subjects found matching your search.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* -------------------- INDIA MODE SUBJECTS & EXAMS CATEGORIES -------------------- */
          <div className="space-y-4 sm:space-y-5">
            {/* 1. Indian Competitive Exams Section */}
            {(indiaCategoryFilter === 'all' || indiaCategoryFilter === 'exam') && examCategories.length > 0 && (
              <div className="bg-orange-100/85 dark:bg-orange-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-orange-300/80 dark:border-orange-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 min-w-0 flex-1">
                    <Landmark className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'प्रमुख राष्ट्रीय परीक्षाएं (Central & State Exams)' : 'National Exam Specializations'}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-200/80 dark:bg-orange-900/60 text-orange-950 dark:text-orange-200 shrink-0">
                    {examCategories.length} {lang === 'hi' ? 'परीक्षाएं' : 'Exams'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-1">
                  {examCategories.map(renderExamCard)}
                </div>
              </div>
            )}

            {/* 2. Indian GS & Academic Subjects Section */}
            {(indiaCategoryFilter === 'all' || indiaCategoryFilter === 'subject') && gsSubjectCategories.length > 0 && (
              <div className="bg-sky-100/90 dark:bg-sky-950/50 p-2 sm:p-3.5 rounded-3xl border-2 border-sky-300/80 dark:border-sky-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 min-w-0 flex-1">
                    <Layers className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'सामान्य अध्ययन व विषय (General Studies & Subjects)' : 'GS & Core Academic Subjects'}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-900/60 text-sky-950 dark:text-sky-200 shrink-0">
                    {gsSubjectCategories.length} {lang === 'hi' ? 'विषय' : 'Subjects'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 pt-1">
                  {gsSubjectCategories.map(renderSubjectCard)}
                </div>
              </div>
            )}

            {/* 3. State Special Exams Hero Banner Section */}
            {(indiaCategoryFilter === 'all' || indiaCategoryFilter === 'state') && (
              <div className="bg-amber-100/90 dark:bg-amber-950/40 p-2 sm:p-3.5 rounded-3xl border-2 border-amber-300/80 dark:border-amber-800/60 shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2 px-1">
                  <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 min-w-0 flex-1">
                    <Landmark className="w-4 h-4 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white truncate">
                      {lang === 'hi' ? 'भारतीय राज्य विशेष परीक्षाएं (17+ States Special GK)' : 'Indian States Special GK & Exams'}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 shrink-0">
                    17+ States
                  </span>
                </div>

                <motion.div
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowStateModal(true)}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg border-b-4 border-amber-900 cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      🏛️
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black leading-tight">
                        {lang === 'hi' ? '🇮🇳 17+ भारतीय राज्य विशेष परीक्षाएं (State Special GK & Exams)' : '🇮🇳 17+ Indian States Special GK & Exams'}
                      </h3>
                      <p className="text-xs text-white/90 font-medium mt-0.5">
                        {lang === 'hi'
                          ? 'उत्तर प्रदेश, बिहार, राजस्थान, एमपी, दिल्ली, हरियाणा व सभी राज्यों की परीक्षाएं खोलें'
                          : 'Explore UP, Bihar, Rajasthan, MP, Haryana, Delhi & all state exams'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white text-amber-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md shrink-0">
                    <span>{lang === 'hi' ? 'सभी राज्य देखें' : 'View All States'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </div>
            )}

            {/* Empty State for India Mode */}
            {examCategories.length === 0 && gsSubjectCategories.length === 0 && (
              <div className="text-center py-12 px-4 bg-white/60 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/10">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">
                  {lang === 'hi' ? 'कोई परीक्षा या विषय नहीं मिला। कृपया दूसरा शब्द खोजें।' : 'No exams or subjects found matching your search.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* State Exam Directory Modal */}
      <StateExamModal
        isOpen={showStateModal}
        onClose={() => setShowStateModal(false)}
      />

      {/* Quests, Streak Freeze & Daily Reward Modals */}
      <DailyQuestsModal
        isOpen={showQuestsModal}
        onClose={() => setShowQuestsModal(false)}
      />
      <StreakFreezeModal
        isOpen={showStreakFreezeModal}
        onClose={() => setShowStreakFreezeModal(false)}
      />
      <DailyLoginRewardModal
        isOpen={showDailyRewardModal}
        onClose={() => setShowDailyRewardModal(false)}
      />
    </div>
  );
}
