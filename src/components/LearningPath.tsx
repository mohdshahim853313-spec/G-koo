import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Lock, 
  Gift, 
  Check, 
  Crown, 
  Sparkles, 
  Compass, 
  ChevronLeft
} from 'lucide-react';
import { AppIcon } from './AppIcon';
import { useAppContext } from '../useAppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic, playSound } from '../lib/audio';
import { OfflineModal } from './OfflineModal';
import { 
  getCategoryLevelConfig, 
  getCategoryWorldConfig, 
  getCategoryInfo, 
  LEVELS_PER_SECTOR,
  type LevelConfig 
} from '../lib/levelData';

interface LearningPathProps {
  onBackToCategories?: () => void;
  onOpenDailyReward?: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ onBackToCategories }) => {
  const navigate = useNavigate();
  const { 
    t, 
    lang, 
    activeCategory, 
    categoryLevelProgress, 
    getCategoryMaxUnlocked, 
    claimedChests, 
    claimChest, 
    soundEnabled, 
    hapticsEnabled,
    isOnline
  } = useAppContext();

  const currentCatId = activeCategory || 'ssc_cgl';
  const catInfo = getCategoryInfo(currentCatId);
  const catMaxUnlocked = getCategoryMaxUnlocked(currentCatId);
  const catProgress = categoryLevelProgress[currentCatId] || {};

  // Active Selected World in Map (Defaults to current unlocked world for this category, 50 levels per sector)
  const initialWorldId = Math.max(1, Math.floor((catMaxUnlocked - 1) / LEVELS_PER_SECTOR) + 1);
  const [selectedWorldId, setSelectedWorldId] = useState<number>(initialWorldId);
  const [lockedToast, setLockedToast] = useState<string | null>(null);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineModalLevel, setOfflineModalLevel] = useState<number | null>(null);

  const isDeviceOffline = !isOnline || (typeof navigator !== 'undefined' && !navigator.onLine);

  // Always reset scroll to the very top whenever the level map opens or world/category changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentCatId, selectedWorldId]);

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

    // Offline check: If offline and this level is NOT yet completed, block and show Offline modal!
    const isCompleted = !!catProgress[level.level]?.completed;
    if (isDeviceOffline && !isCompleted && currentCatId !== 'india') {
      triggerHaptic('error', hapticsEnabled);
      playSound('error', soundEnabled);
      setOfflineModalLevel(level.level);
      setShowOfflineModal(true);
      return;
    }

    // Direct Launch Level: Jump straight to the quiz without showing any popup!
    triggerHaptic('click', hapticsEnabled);
    playSound('combo', soundEnabled);
    navigate(`/quiz/level-${currentCatId}-${level.level}`);
  };

  const handleStartLevel = (levelNum: number) => {
    triggerHaptic('click', hapticsEnabled);
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

  // Determine available world tabs (all unlocked worlds + 1 next preview world, 50 levels per sector)
  const maxAvailableWorld = currentCatId === 'india'
    ? 3
    : Math.max(3, Math.floor((catMaxUnlocked - 1) / LEVELS_PER_SECTOR) + 1);
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
            className="flex items-center space-x-1 bg-white dark:bg-[#13192B] border border-gray-200 dark:border-indigo-950/80 px-3 py-1.5 rounded-xl text-xs font-black text-gray-700 dark:text-gray-300 shadow-xs hover:bg-gray-50 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('allCategories')}</span>
          </button>
        )}

        <div className="flex items-center space-x-1.5 ml-auto">
          <span className="text-[10px] font-black uppercase text-gray-400">
            {catInfo.type === 'exam' ? 'Govt Exam' : 'Core GK'}
          </span>
          <AppIcon icon={catInfo.icon} className="w-4 h-4" />
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
              <span className="font-bold">{lang === 'hi' ? `खंड ${w.id}` : `Sector ${w.id}`}</span>
              <span className="text-[10px] opacity-80 font-normal">({w.levelsRange[0]}-{w.levelsRange[1]})</span>
              {!isWorldUnlocked && <Lock className="w-3 h-3 text-gray-400 shrink-0" />}
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
                  whileTap={{ scale: isLocked ? 1 : 0.99 }}
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
                whileTap={{ scale: isLocked ? 1 : 0.99 }}
                onClick={() => handleLevelClick(level)}
                className={`w-full rounded-3xl p-4 border-b-[5px] transition-transform relative overflow-hidden select-none cursor-pointer flex items-center justify-between ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white border-b-teal-800 shadow-md'
                    : isCurrent
                    ? 'bg-gradient-to-r from-[#FF5F6D] via-[#FF7B54] to-[#FF8F8F] text-white border-b-[#991B1B] shadow-lg ring-4 ring-rose-200 dark:ring-rose-950'
                    : 'bg-white dark:bg-[#13192B] text-gray-400 dark:text-gray-500 border-2 border-gray-200 dark:border-indigo-950/80 border-b-[5px] border-b-gray-300 dark:border-b-[#0B0F19] opacity-75'
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

      {/* Offline Alert Modal for new/unpassed levels */}
      <OfflineModal
        isOpen={showOfflineModal}
        levelNumber={offlineModalLevel || undefined}
        categoryName={catInfo?.titleEn || currentCatId}
        onClose={() => setShowOfflineModal(false)}
        onRetrySuccess={() => {
          setShowOfflineModal(false);
          if (offlineModalLevel) {
            handleStartLevel(offlineModalLevel);
          }
        }}
      />

    </div>
  );
};
