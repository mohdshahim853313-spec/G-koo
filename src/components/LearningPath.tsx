import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Lock, 
  Gift, 
  Check, 
  Crown, 
  Sparkles, 
  Compass, 
  Flame, 
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic, playSound } from '../lib/audio';
import { 
  getCategoryLevelConfig, 
  getCategoryWorldConfig, 
  getCategoryInfo, 
  CATEGORIES_LIST,
  type LevelConfig 
} from '../lib/levelData';

interface LearningPathProps {
  onBackToCategories?: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ onBackToCategories }) => {
  const navigate = useNavigate();
  const { 
    t, 
    lang, 
    activeCategory, 
    setActiveCategory, 
    categoryLevelProgress, 
    getCategoryMaxUnlocked, 
    getCategoryTotalStars, 
    claimedChests, 
    claimChest, 
    soundEnabled, 
    hapticsEnabled,
    isOnline
  } = useAppContext();

  const currentCatId = activeCategory || 'ssc_cgl';
  const catInfo = getCategoryInfo(currentCatId);
  const catMaxUnlocked = getCategoryMaxUnlocked(currentCatId);
  const catTotalStars = getCategoryTotalStars(currentCatId);
  const catProgress = categoryLevelProgress[currentCatId] || {};

  // Active Selected World in Map (Defaults to current unlocked world for this category)
  const initialWorldId = Math.max(1, Math.floor((catMaxUnlocked - 1) / 10) + 1);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId);
  const [selectedLevel, setSelectedLevel] = useState<LevelConfig | null>(null);
  const [lockedToast, setLockedToast] = useState<string | null>(null);
  const [rewardToast, setRewardToast] = useState<string | null>(null);

  const worldConfig = getCategoryWorldConfig(currentCatId, selectedWorldId);
  const [startLevel, endLevel] = worldConfig.levelsRange;

  // Generate levels list for the selected world
  const worldLevels: LevelConfig[] = [];
  for (let lvl = startLevel; lvl <= endLevel; lvl++) {
    worldLevels.push(getCategoryLevelConfig(currentCatId, lvl));
  }

  // Calculate World Completion Stats
  const completedInWorld = worldLevels.filter(l => catProgress[l.level]?.completed).length;
  const worldStarsEarned = worldLevels.reduce((acc, l) => acc + (catProgress[l.level]?.stars || 0), 0);
  const maxWorldStars = worldLevels.length * 3;
  const worldPercent = Math.round((completedInWorld / worldLevels.length) * 100);

  const handleLevelClick = (level: LevelConfig) => {
    const isUnlocked = level.level <= catMaxUnlocked;

    if (!isUnlocked) {
      triggerHaptic('error', hapticsEnabled);
      playSound('error', soundEnabled);
      setLockedToast(t('lockedLevelMessage', { level: level.level - 1 }));
      setTimeout(() => setLockedToast(null), 3000);
      return;
    }

    triggerHaptic('click', hapticsEnabled);
    setSelectedLevel(level);
  };

  const handleStartLevel = (levelNum: number) => {
    triggerHaptic('click', hapticsEnabled);
    setSelectedLevel(null);
    navigate(`/quiz/level-${currentCatId}-${levelNum}`);
  };

  const handleClaimChest = (chestId: string, gems: number, xp: number) => {
    if (claimedChests[chestId]) return;
    triggerHaptic('success', hapticsEnabled);
    playSound('combo', soundEnabled);
    claimChest(chestId, gems, xp);
    setRewardToast(t('chestClaimSuccess', { gems, xp }));
    setTimeout(() => setRewardToast(null), 3500);
  };

  // Determine available world tabs (all unlocked worlds + 1 next preview world)
  const maxAvailableWorld = Math.max(4, Math.floor((catMaxUnlocked - 1) / 10) + 1);
  const worldTabs = [];
  for (let w = 1; w <= maxAvailableWorld; w++) {
    worldTabs.push(getCategoryWorldConfig(currentCatId, w));
  }

  return (
    <div className="flex flex-col items-center py-2 relative select-none w-full">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {lockedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-14 z-50 bg-rose-600 text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-2xl border-2 border-white flex items-center space-x-2 max-w-xs text-center"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>{lockedToast}</span>
          </motion.div>
        )}

        {rewardToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-14 z-50 bg-[#FFB020] text-amber-950 px-5 py-3 rounded-2xl font-black text-xs shadow-2xl border-2 border-white flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5 text-amber-900 animate-spin" />
            <span>{rewardToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Realm Header & Quick Selector */}
      <div className="w-full flex items-center justify-between mb-3">
        {onBackToCategories && (
          <button
            onClick={onBackToCategories}
            className="flex items-center space-x-1 bg-white dark:bg-[#1A1A24] border border-gray-200 dark:border-gray-800 px-3 py-1.5 rounded-xl text-xs font-black text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('allCategories')}</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5 ml-auto">
          <span className="text-[10px] font-black uppercase text-gray-400">
            {catInfo.type === 'exam' ? 'Govt Exam' : 'Core GK'}
          </span>
          <span className="text-sm">{catInfo.icon}</span>
        </div>
      </div>

      {/* Horizontal Category Switcher Pills */}
      <div className="w-full flex space-x-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = cat.id === currentCatId;
          const maxUnlocked = getCategoryMaxUnlocked(cat.id);

          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('click', hapticsEnabled);
                setActiveCategory(cat.id);
                const nextInitialWorld = Math.max(1, Math.floor((getCategoryMaxUnlocked(cat.id) - 1) / 10) + 1);
                setSelectedWorldId(nextInitialWorld);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center space-x-1.5 border-b-2 active:translate-y-0.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white border-b-[#991B1B] shadow-sm scale-102'
                  : 'bg-white dark:bg-[#1A1A24] text-gray-700 dark:text-gray-300 border-b-gray-200 dark:border-b-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{lang === 'hi' ? cat.titleHi.split('(')[0] : cat.titleEn.split(' ')[0]}</span>
              <span className="text-[9px] px-1 py-0.2 bg-black/20 rounded-md text-white/90">
                Lvl {maxUnlocked}
              </span>
            </button>
          );
        })}
      </div>

      {/* Top Map Header HUD for Category */}
      <div className="w-full bg-white dark:bg-[#1A1A24] rounded-3xl p-3.5 mb-3 border-2 border-gray-200 dark:border-gray-800 border-b-[4px] border-b-gray-300 dark:border-b-gray-950 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 shadow-inner">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              {t('starsEarned')}
            </p>
            <p className="text-sm font-black text-amber-500 dark:text-amber-400">
              {catTotalStars} ⭐
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 shadow-inner">
            <Flame className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              Active Stage
            </p>
            <p className="text-sm font-black text-[#FF5F6D]">
              Level {catMaxUnlocked}
            </p>
          </div>
        </div>
      </div>

      {/* Sector / World Selector Tabs for this Category */}
      <div className="w-full flex space-x-2 overflow-x-auto pb-2 scrollbar-none mb-3">
        {worldTabs.map((w) => {
          const isWorldUnlocked = catMaxUnlocked >= w.levelsRange[0];
          const isSelected = selectedWorldId === w.id;

          return (
            <button
              key={w.id}
              onClick={() => {
                triggerHaptic('click', hapticsEnabled);
                setSelectedWorldId(w.id);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center space-x-1.5 border-b-[3px] active:translate-y-0.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white border-b-[#991B1B] shadow-md scale-102'
                  : isWorldUnlocked
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b-gray-300 dark:border-b-gray-950 hover:bg-gray-200'
                  : 'bg-gray-100/70 dark:bg-gray-900/60 text-gray-400 dark:text-gray-600 border-b-transparent opacity-60'
              }`}
            >
              <span>Sector {w.id}</span>
              {!isWorldUnlocked && <Lock className="w-3 h-3 text-gray-400" />}
            </button>
          );
        })}
      </div>

      {/* Selected World Showcase Card */}
      <motion.div
        key={`${currentCatId}-${worldConfig.id}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`w-full bg-gradient-to-br ${catInfo.gradient} text-white rounded-3xl p-4.5 mb-6 shadow-xl border-b-[5px] ${catInfo.border3d} relative overflow-hidden`}
      >
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-lg pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10 mb-3">
          <div>
            <span className="bg-white/30 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center space-x-1 mb-1.5 shadow-xs">
              <Compass className="w-3 h-3" />
              <span>{lang === 'hi' ? catInfo.titleHi : catInfo.titleEn} • Levels {startLevel}-{endLevel}</span>
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-xs">
              {lang === 'hi' ? worldConfig.nameHi : worldConfig.nameEn}
            </h2>
            <p className="text-xs text-white/85 font-medium mt-0.5">
              {lang === 'hi' ? worldConfig.subtitleHi : worldConfig.subtitleEn}
            </p>
          </div>
          <div className="text-3xl bg-white/20 p-2.5 rounded-2xl shadow-inner">
            {catInfo.icon}
          </div>
        </div>

        {/* World Progress Bar & Stars */}
        <div className="relative z-10 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-black text-white/95 mb-1.5">
            <span>{worldPercent}% Completed</span>
            <span className="flex items-center space-x-1 bg-black/20 px-2 py-0.5 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{worldStarsEarned} / {maxWorldStars}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${worldPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full shadow-xs"
            />
          </div>
        </div>
      </motion.div>

      {/* Gamified Mission Nodes Layout */}
      <div className="w-full space-y-4 pb-8">
        {worldLevels.map((level) => {
          const isCompleted = catProgress[level.level]?.completed;
          const isCurrent = level.level === catMaxUnlocked;
          const isLocked = level.level > catMaxUnlocked;
          const record = catProgress[level.level];
          const stars = record?.stars || 0;

          // Chest attached to this level
          const chestId = `chest_${currentCatId}_lvl_${level.level}`;
          const hasChest = !!level.chestReward;
          const isChestClaimed = claimedChests[chestId];

          // Special Boss Stage Render
          if (level.isBoss) {
            return (
              <div key={level.level} className="w-full my-2 perf-card">
                <motion.div
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  whileTap={{ scale: isLocked ? 1 : 0.96 }}
                  onClick={() => handleLevelClick(level)}
                  className={`w-full rounded-3xl p-5 relative overflow-hidden transition-transform select-none cursor-pointer border-b-[6px] shadow-lg ${
                    isCompleted
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white border-b-amber-800'
                      : isCurrent
                      ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-rose-600 text-white border-b-purple-950 ring-4 ring-purple-300 dark:ring-purple-900'
                      : 'bg-gray-100 dark:bg-gray-800/80 text-gray-400 dark:text-gray-500 border-b-gray-300 dark:border-b-gray-950 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${
                        isLocked ? 'bg-gray-200 dark:bg-gray-700' : 'bg-white/20'
                      }`}>
                        {isLocked ? <Lock className="w-6 h-6 text-gray-400" /> : <Crown className="w-8 h-8 text-yellow-300 animate-bounce" />}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center space-x-1 ${
                          isLocked ? 'bg-gray-200 text-gray-500' : 'bg-black/20 text-yellow-300'
                        }`}>
                          <Crown className="w-3 h-3" />
                          <span>{t('bossStage')}</span>
                        </span>
                        <h3 className="text-base font-black text-white leading-tight mt-1">
                          {lang === 'hi' ? `लेवल ${level.level}` : `LEVEL ${level.level}`}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl text-white">
                        +{level.xpReward} XP
                      </span>
                      {isCompleted && (
                        <div className="flex space-x-0.5 mt-2 justify-end">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s <= stars ? 'fill-yellow-300 text-yellow-300' : 'text-white/30'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Claimable Boss Chest */}
                {hasChest && isCompleted && (
                  <div className="mt-2 flex justify-center">
                    <button
                      onClick={() => handleClaimChest(chestId, level.chestReward!.gems, level.chestReward!.xp)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all shadow-md active:scale-95 ${
                        isChestClaimed
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 animate-bounce border-2 border-white'
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      <span>
                        {isChestClaimed 
                          ? t('chestClaimed') 
                          : `Claim Boss Vault (+${level.chestReward!.gems} 💎 / +${level.chestReward!.xp} XP)`}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          // Standard Stage Card
          return (
            <div key={level.level} className="w-full perf-card">
              <motion.div
                whileHover={{ scale: isLocked ? 1 : 1.015 }}
                whileTap={{ scale: isLocked ? 1 : 0.97 }}
                onClick={() => handleLevelClick(level)}
                className={`w-full rounded-3xl p-4 border-b-[5px] transition-transform relative overflow-hidden select-none cursor-pointer flex items-center justify-between ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white border-b-teal-800 shadow-md'
                    : isCurrent
                    ? 'bg-gradient-to-r from-[#FF5F6D] via-[#FF7B54] to-[#FF8F8F] text-white border-b-[#991B1B] shadow-lg ring-4 ring-rose-200 dark:ring-rose-950'
                    : 'bg-white dark:bg-[#1A1A24] text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-gray-800 border-b-[5px] border-b-gray-300 dark:border-b-gray-950 opacity-75'
                }`}
              >
                {/* Left Side: Level Number + Icon + Title */}
                <div className="flex items-center space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                    isLocked 
                      ? 'bg-gray-100 dark:bg-gray-800' 
                      : 'bg-white/20 text-white'
                  }`}>
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                    ) : isCompleted ? (
                      <Check className="w-6 h-6 text-white stroke-[3.5]" />
                    ) : (
                      <span>{level.icon}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase ${
                        isCompleted || isCurrent ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {level.difficulty}
                      </span>
                    </div>

                    <h4 className={`text-sm sm:text-base font-black leading-tight ${
                      isCompleted || isCurrent ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {lang === 'hi' ? `लेवल ${level.level}` : `LEVEL ${level.level}`}
                    </h4>
                  </div>
                </div>

                {/* Right Side: Stars & XP */}
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-xl ${
                    isCompleted || isCurrent 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                  }`}>
                    +{level.xpReward} XP
                  </span>

                  {/* 3-Star Rating Display */}
                  <div className="flex space-x-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars 
                            ? 'fill-amber-300 text-amber-300 drop-shadow-xs' 
                            : isCompleted || isCurrent 
                            ? 'text-white/30' 
                            : 'text-gray-300 dark:text-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mystery Chest Between Stages */}
              {hasChest && (
                <div className="my-2.5 flex justify-center">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!isCompleted) {
                        setLockedToast(t('lockedLevelMessage', { level: level.level }));
                        setTimeout(() => setLockedToast(null), 3000);
                      } else {
                        handleClaimChest(chestId, level.chestReward!.gems, level.chestReward!.xp);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-2xl text-[11px] font-black flex items-center space-x-1.5 transition-all shadow-xs border-b-2 ${
                      isChestClaimed
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                        : isCompleted
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 border-amber-600 animate-bounce'
                        : 'bg-gray-100 dark:bg-gray-800/60 text-gray-400 border-gray-200 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <Gift className={`w-4 h-4 ${!isChestClaimed && isCompleted ? 'text-amber-950' : ''}`} />
                    <span>
                      {isChestClaimed 
                        ? t('chestClaimed') 
                        : isCompleted 
                        ? `Claim Loot (+${level.chestReward!.gems} 💎)` 
                        : `Loot Locked (Beat Level ${level.level})`}
                    </span>
                  </motion.button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3D Mission Briefing Modal */}
      <AnimatePresence>
        {selectedLevel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#1A1A24] rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-gray-100 dark:border-gray-800 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5F6D] to-[#FF8F8F] text-white flex items-center justify-center text-3xl shadow-md">
                  {selectedLevel.icon}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-[#FF5F6D] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    LVL {selectedLevel.level} • {selectedLevel.difficulty}
                  </span>
                  <p className="text-xs font-black text-amber-500 mt-1">
                    +{selectedLevel.xpReward} XP Bounty
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                {lang === 'hi' ? `लेवल ${selectedLevel.level}` : `LEVEL ${selectedLevel.level}`}
              </h3>

              {/* Offline notice if device is offline */}
              {!isOnline && (
                <div className="flex items-center space-x-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-2.5 rounded-2xl mb-4 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-xs">
                  <span className="text-base">📡</span>
                  <span>
                    {lang === 'hi'
                      ? 'आप ऑफलाइन हैं — यह स्तर ऑफलाइन प्रश्न बैंक से लोड होगा'
                      : 'You are offline — This level will load from offline question bank'}
                  </span>
                </div>
              )}

              {/* Star Target Rules */}
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 rounded-2xl mb-5 space-y-1.5">
                <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  {t('targetStars')}
                </p>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                  <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl text-center shadow-xs">
                    ⭐ 40% (1 Star)
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl text-center shadow-xs">
                    ⭐⭐ 70% (2 Stars)
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl text-center shadow-xs">
                    ⭐⭐⭐ 90% (3 Stars)
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedLevel(null)}
                  className="flex-1 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs active:scale-95"
                >
                  {t('close')}
                </button>

                <motion.button
                  whileTap={{ scale: 0.94, y: 2 }}
                  onClick={() => handleStartLevel(selectedLevel.level)}
                  className="flex-2 bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white font-black py-3 rounded-2xl text-xs shadow-[0_4px_0_0_#991B1B] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>{t('launchMission')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
