import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../useAppContext';
import { Award, Edit2, Check, Lock, Target, Zap, Bookmark, BarChart2, TrendingUp, ChevronRight, Sparkles, Flame, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import { AppIcon } from '../components/AppIcon';
import { triggerHaptic } from '../lib/audio';
import { GkooBirdAvatar } from '../components/Mascot';
import { GkooCompanionCard } from '../components/GkooCompanionCard';
import { SavedQuestionsModal } from '../components/SavedQuestionsModal';
import { getQuestionTrackerStats, getWeakCategorySummary } from '../lib/questionTracker';
import { motion } from 'framer-motion';
import type { UserBadge } from '../appContextStore';

const AVATARS = ['🦉', '🦁', '🦊', '🐼', '🐯', '🐨', '🦄', '🚀', '👑', '⚡'];

export default function Profile() {
  const navigate = useNavigate();
  const {
    t,
    lang,
    xp,
    streak,
    profile,
    updateProfile,
    stats,
    badges,
    bookmarks,
    categoryStats,
  } = useAppContext();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Level Progression: 100 XP per Level
  const currentLevel = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const accuracyRate = stats.totalAnswered > 0 ? Math.round((stats.correctAnswers / stats.totalAnswered) * 100) : 0;
  const { incorrectCount: mistakesCount } = getQuestionTrackerStats();
  const weakCategoriesSummary = getWeakCategorySummary();

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfile({ name: nameInput.trim() });
    }
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-[#0F121E] pb-28 px-4 pt-[calc(max(env(safe-area-inset-top,0px),28px)+24px)] md:pt-10 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-md md:max-w-4xl mx-auto relative">
        {/* Top Right Settings Button */}
        <div className="absolute right-0 top-0 z-20">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('click');
              navigate('/settings');
            }}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#141828] border-2 border-gray-200/90 dark:border-white/10 shadow-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white flex items-center justify-center active:scale-92 transition-all"
            aria-label={t('settings')}
            title={t('settings')}
          >
            <Settings className="w-5 h-5 stroke-[2.2]" />
          </motion.button>
        </div>

        {/* Profile Header & Avatar */}
        <div className="flex flex-col items-center text-center mt-2 mb-5">
        <div className="relative">
          <motion.button 
            whileTap={{ scale: 0.9, rotate: -4 }}
            onClick={() => {
              triggerHaptic('click');
              setShowAvatarPicker(true);
            }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] flex items-center justify-center p-2 shadow-xl border-4 border-white dark:border-gray-800 border-b-[6px] border-b-[#D93848] transition-all select-none overflow-hidden"
          >
            {profile.avatar === '🦉' ? (
              <GkooBirdAvatar size="lg" />
            ) : (
              <span className="text-5xl">{profile.avatar}</span>
            )}
          </motion.button>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-md text-xs font-black">
            Lvl {currentLevel}
          </div>
        </div>

        {/* Name Editing */}
        <div className="mt-3 flex items-center space-x-2">
          {isEditingName ? (
            <div className="flex items-center space-x-1.5">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1 bg-white dark:bg-gray-800 border-2 border-[#FF5F6D] rounded-xl text-base font-black focus:outline-none text-gray-800 dark:text-white"
                autoFocus
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSaveName}
                className="p-2 bg-[#FF5F6D] text-white rounded-xl shadow-[0_2px_0_0_#D93848] hover:bg-[#E64553]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-black">{profile.name}</h2>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  triggerHaptic('click');
                  setNameInput(profile.name);
                  setIsEditingName(true);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Edit2 className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-xs font-bold mt-0.5">{t('memberSince')} {profile.joinedDate}</p>
      </div>

      {/* Student Account Status 3D Card */}
      <div className="bg-white dark:bg-gray-800/90 border-2 border-emerald-100 dark:border-emerald-950/60 border-b-4 rounded-3xl p-4 shadow-sm mb-5 select-none flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black mb-0.5">
              <Check className="w-3 h-3 text-emerald-800 dark:text-emerald-300 stroke-[3]" />
              <span>{lang === 'hi' ? 'सक्रिय शिक्षार्थी प्रोफ़ाइल' : 'Active Learner Profile'}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-bold">
              {lang === 'hi' ? 'आपकी सारी प्रोग्रेस, स्ट्रीक और XP सुरक्षित हैं' : 'All your progress, streak & XP are saved'}
            </p>
          </div>
        </div>
      </div>

      {/* G-koo Best Friend Companion Card */}
      <GkooCompanionCard panel="profile" defaultMood="love" className="mb-5" />

      {/* Level Progression 3D Card */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white rounded-3xl p-4.5 shadow-lg border-b-[5px] border-indigo-950 mb-5 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-white font-black text-xs">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <span>{t('level')} {currentLevel} Scholar</span>
          </div>
          <span className="text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-full text-white">{currentLevelXp} / 100 XP</span>
        </div>
        <div className="w-full bg-black/25 h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner">
          <motion.div
            className="bg-gradient-to-r from-amber-300 to-amber-400 h-full rounded-full shadow-xs"
            initial={{ width: 0 }}
            animate={{ width: `${currentLevelXp}%` }}
          />
        </div>
        <p className="text-[11px] text-indigo-100 font-bold mt-2 text-right">
          {100 - currentLevelXp} {t('nextLevelAt')}
        </p>
      </motion.div>

      {/* Stats Overview - 4 Solid Colorful 3D Filled Boxes */}
      <div className="mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 ml-1">
          {t('statsOverview')}
        </h3>
        <div className="grid grid-cols-2 gap-3.5">
          {/* Lessons Finished */}
          <motion.div 
            whileTap={{ scale: 0.99 }}
            className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-3xl shadow-lg border-b-[5px] border-orange-800 flex items-center space-x-3 select-none"
          >
            <div className="p-3 rounded-2xl bg-white/25 text-white shadow-inner">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-orange-100">{t('quizzesCompletedLabel')}</p>
              <p className="text-xl font-black text-white drop-shadow-xs">{stats.quizzesCompleted}</p>
            </div>
          </motion.div>

          {/* Accuracy Rate */}
          <motion.div 
            whileTap={{ scale: 0.99 }}
            className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 text-white p-4 rounded-3xl shadow-lg border-b-[5px] border-teal-900 flex items-center space-x-3 select-none"
          >
            <div className="p-3 rounded-2xl bg-white/25 text-white shadow-inner">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-emerald-100">{t('accuracyLabel')}</p>
              <p className="text-xl font-black text-white drop-shadow-xs">{accuracyRate}%</p>
            </div>
          </motion.div>

          {/* Total XP */}
          <motion.div 
            whileTap={{ scale: 0.99 }}
            className="bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 text-white p-4 rounded-3xl shadow-lg border-b-[5px] border-indigo-900 flex items-center space-x-3 select-none"
          >
            <div className="p-3 rounded-2xl bg-white/25 text-white shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-blue-100">{t('xpEarned')}</p>
              <p className="text-xl font-black text-white drop-shadow-xs">{xp}</p>
            </div>
          </motion.div>

          {/* Daily Streak */}
          <motion.div 
            whileTap={{ scale: 0.99 }}
            className="bg-gradient-to-br from-[#FF5F6D] via-[#E64553] to-[#D93848] text-white p-4 rounded-3xl shadow-lg border-b-[5px] border-[#991B1B] flex items-center space-x-3 select-none"
          >
            <div className="p-3 rounded-2xl bg-white/25 text-white shadow-inner flex items-center justify-center">
              <Flame className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-rose-100">{t('streak')}</p>
              <p className="text-xl font-black text-white drop-shadow-xs">{streak}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Action: Saved Bookmarked Questions */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          triggerHaptic('click');
          setShowSavedModal(true);
        }}
        className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white p-4 rounded-3xl shadow-lg border-b-[5px] border-amber-800 flex items-center justify-between mb-4 select-none"
      >
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/25 text-white shadow-inner">
            <Bookmark className="w-6 h-6 fill-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-black text-white">{t('savedQuestions')}</h4>
            <p className="text-xs text-amber-100 font-semibold">
              {bookmarks.length > 0 
                ? (lang === 'hi' ? `${bookmarks.length} प्रश्न सेव किए गए हैं • अभ्यास करें` : `${bookmarks.length} questions saved • Practice now`)
                : (lang === 'hi' ? 'क्विज़ के दौरान प्रश्नों को बुकमार्क करें' : 'Bookmark tricky questions during quiz')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 bg-white/20 px-3 py-1.5 rounded-2xl text-xs font-black">
          <span>{bookmarks.length}</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </div>
      </motion.button>

      {/* Quick Action: Weak Spots / Mistakes Revision Hub */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="w-full bg-gradient-to-r from-rose-500 via-red-500 to-rose-600 text-white p-4 rounded-3xl shadow-lg border-b-[5px] border-rose-800 flex items-center justify-between mb-6 select-none"
      >
        <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-2">
          <div className="p-3 rounded-2xl bg-white/25 text-white shadow-inner shrink-0">
            <span className="text-xl">🎯</span>
          </div>
          <div className="text-left min-w-0">
            <h4 className="text-sm font-black text-white truncate">
              {lang === 'hi' ? 'कमजोर सवालों का सुधार केंद्र' : 'Mistakes & Weak Spots Hub'}
            </h4>
            <p className="text-xs text-rose-100 font-semibold truncate">
              {mistakesCount > 0
                ? (lang === 'hi' ? `${mistakesCount} गलत सवालों का संग्रह • री-टेस्ट दें` : `${mistakesCount} missed questions • Retest now`)
                : (lang === 'hi' ? 'शानदार! कोई कमजोर सवाल शेष नहीं' : 'Flawless! No weak spots pending')}
            </p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={mistakesCount === 0}
          onClick={() => {
            triggerHaptic('click');
            navigate('/quiz/mistakes?mistakes=true');
          }}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 shadow-xs flex items-center space-x-1 transition-all ${
            mistakesCount > 0
              ? 'bg-white text-rose-600 hover:bg-rose-50 cursor-pointer active:translate-y-0.5'
              : 'bg-white/20 text-white/60 cursor-not-allowed'
          }`}
        >
          <span>{lang === 'hi' ? 'सुधारें' : 'Practice'}</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </motion.button>
      </motion.div>

      {/* Weak Areas Summary Banner */}
      {weakCategoriesSummary.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 via-rose-500/10 to-amber-500/10 dark:from-purple-950/30 dark:via-rose-950/30 dark:to-amber-950/30 border border-purple-200 dark:border-purple-800/50 p-4 rounded-3xl mb-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 inline mr-0.5" />
              <span>{lang === 'hi' ? 'सर्वाधिक गलतियों वाले विषय' : 'Top Mistake-Prone Topics'}</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400">
              {lang === 'hi' ? 'कमजोर विषय विश्लेषण' : 'Weak Area Analysis'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakCategoriesSummary.slice(0, 3).map((item) => (
              <button
                key={item.category}
                onClick={() => {
                  triggerHaptic('click');
                  navigate(`/quiz/${item.category}?diff=medium&count=15`);
                }}
                className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 px-3 py-1.5 rounded-2xl text-xs font-black text-gray-800 dark:text-gray-200 hover:border-purple-400 flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Target className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 inline" />
                <span className="capitalize">{item.category}</span>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 px-1.5 py-0.5 rounded-full font-bold">
                  {item.count} {lang === 'hi' ? 'गलत' : 'mistakes'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject Performance & Weakness Analytics */}
      <div className="bg-white dark:bg-gray-800/90 border-2 border-gray-100 dark:border-gray-800 border-b-4 rounded-3xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-rose-100 dark:bg-rose-950/60 text-[#FF5F6D] rounded-xl">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase tracking-wider">
              {t('subjectPerformance')}
            </h3>
          </div>
          <span className="text-[10px] font-bold text-gray-400">
            {lang === 'hi' ? 'सटीकता विश्लेषण' : 'Accuracy Analysis'}
          </span>
        </div>

        {Object.keys(categoryStats).length === 0 ? (
          <div className="text-center py-6 px-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <TrendingUp className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              {lang === 'hi' ? 'विषयवार सटीकता देखने के लिए क्विज़ खेलें!' : 'Play quizzes to track your subject mastery!'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-black text-[#FF5F6D] hover:underline flex items-center justify-center mx-auto space-x-1"
            >
              <span>{lang === 'hi' ? 'क्विज़ शुरू करें' : 'Start a Quiz'}</span>
              <ArrowRight className="w-3.5 h-3.5 inline" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([catId, stat]) => {
              const catAccuracy = stat.totalAttempted > 0 ? Math.round((stat.totalCorrect / stat.totalAttempted) * 100) : 0;
              const isStrong = catAccuracy >= 75;
              const isModerate = catAccuracy >= 50 && catAccuracy < 75;

              // Friendly label resolver
              const getCatData = (id: string) => {
                const map: Record<string, { hi: string; en: string; icon: string }> = {
                  india: { hi: 'भारत सामान्य ज्ञान', en: 'India GK', icon: '🇮🇳' },
                  world: { hi: 'विश्व सामान्य ज्ञान', en: 'World GK', icon: '🌍' },
                  subjects: { hi: 'शैक्षणिक विषय', en: 'Core Subjects', icon: '📚' },
                  mix: { hi: 'मिश्रित अभ्यास', en: 'Mix Practice', icon: '⚡' },
                  ssc_cgl: { hi: 'SSC CGL', en: 'SSC CGL', icon: '🏛️' },
                  ssc_chsl: { hi: 'SSC CHSL', en: 'SSC CHSL', icon: '📑' },
                  uppsc: { hi: 'UPPSC / State PSC', en: 'State PSC', icon: '🎯' },
                  upsc: { hi: 'UPSC Civil Services', en: 'UPSC CSE', icon: '👑' },
                  railway: { hi: 'Railway RRB', en: 'Railway RRB', icon: '🚆' },
                  banking: { hi: 'Banking & IBPS', en: 'Banking Exams', icon: '🏦' }
                };
                const found = map[id];
                if (found) return { name: lang === 'hi' ? found.hi : found.en, icon: found.icon };
                return { name: id.toUpperCase(), icon: '📚' };
              };

              const catData = getCatData(catId);

              return (
                <div 
                  key={catId} 
                  className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-700/60"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
                      <AppIcon icon={catData.icon} className="w-3.5 h-3.5 inline" />
                      <span>{catData.name}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-gray-400">
                        {stat.totalCorrect}/{stat.totalAttempted}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isStrong 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                          : isModerate
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}>
                        {catAccuracy}% • {isStrong ? t('strongSubject') : isModerate ? (lang === 'hi' ? 'औसत' : 'Moderate') : t('weakSubject')}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isStrong 
                          ? 'bg-emerald-500' 
                          : isModerate 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${catAccuracy}%` }}
                    />
                  </div>
                  {catAccuracy < 75 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                        {lang === 'hi' ? 'कमजोर विषय सुधारें:' : 'Strengthen weak subject:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('click');
                          navigate(`/quiz/${catId}?diff=medium&count=15`);
                        }}
                        className="text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-2.5 py-1 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Target className="w-3 h-3" />
                        <span>{lang === 'hi' ? '🎯 अभ्यास करें (15 Qs)' : '🎯 Practice (15 Qs)'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievement Badges - 3D Colorful Boxes */}
      <div className="bg-white dark:bg-gray-800/90 border-2 border-gray-100 dark:border-gray-800 border-b-4 rounded-3xl p-5 shadow-sm mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
          {t('badgesTitle')}
        </h3>

        <div className="grid grid-cols-2 gap-3.5">
          {badges.map((badge: UserBadge) => (
            <motion.div
              key={badge.id}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center text-center relative select-none ${
                badge.unlocked
                  ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-b from-amber-50/80 to-amber-100/40 dark:from-amber-950/40 dark:to-amber-900/20 border-b-[4px] border-b-amber-500 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40 opacity-50 border-b-[3px]'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md mb-2 bg-gradient-to-tr ${badge.color} text-white border-2 border-white/50`}>
                {badge.icon}
              </div>
              <h4 className="text-xs font-black text-gray-900 dark:text-white mb-0.5">{t(badge.titleKey)}</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight mb-2.5">
                {t(badge.descriptionKey)}
              </p>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                badge.unlocked 
                  ? 'bg-emerald-500 text-white shadow-xs' 
                  : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 flex items-center space-x-1'
              }`}>
                {!badge.unlocked && <Lock className="w-2.5 h-2.5 mr-0.5" />}
                {badge.unlocked ? t('badgeUnlocked') : t('badgeLocked')}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SAVED QUESTIONS MODAL */}
      <SavedQuestionsModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
      />

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-gray-100 dark:border-gray-700"
          >
            <h3 className="text-base font-black text-gray-800 dark:text-white mb-3 text-center">
              {t('chooseAvatar')}
            </h3>
            <div className="grid grid-cols-5 gap-2.5 mb-4">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    updateProfile({ avatar: emoji });
                    setShowAvatarPicker(false);
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform active:scale-90 border-2 ${
                    profile.avatar === emoji
                      ? 'border-[#FF5F6D] bg-rose-50 dark:bg-rose-950/40 shadow-sm'
                      : 'border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarPicker(false)}
              className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs"
            >
              {t('dismiss')}
            </button>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
