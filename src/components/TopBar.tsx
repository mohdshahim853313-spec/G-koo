import React, { useState } from 'react';
import { Flame, Heart, Plus, Gem, Snowflake } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { GkooBirdAvatar } from './Mascot';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  onOpenQuests?: () => void;
  onOpenStreakFreeze?: () => void;
  onOpenDailyReward?: () => void;
  hasUnclaimedDailyReward?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  onOpenQuests, 
  onOpenStreakFreeze,
  onOpenDailyReward,
  hasUnclaimedDailyReward: propHasUnclaimed 
}) => {
  const { t, streak, hearts, gems, refillHearts, addGems, streakFreezes } = useAppContext();
  const [showHeartsModal, setShowHeartsModal] = useState(false);

  const hasUnclaimedDailyReward = propHasUnclaimed !== undefined 
    ? propHasUnclaimed 
    : (() => {
        try {
          return localStorage.getItem('gkoo_daily_reward_last_claim') !== new Date().toDateString();
        } catch {
          return false;
        }
      })();

  const handleRefillWithGems = () => {
    if (gems >= 20) {
      addGems(-20);
      refillHearts();
      setShowHeartsModal(false);
    } else {
      alert(t('notEnoughGems'));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FCF9F7] dark:bg-[#0F121E] border-b border-black/[0.06] dark:border-white/[0.08] px-4 pt-[calc(max(env(safe-area-inset-top,0px),28px)+8px)] md:pt-3.5 md:px-8 pb-2.5 text-xs font-black select-none transition-colors shadow-xs">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left: App Brand with Real Gkoo Bird Vector Logo */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-8.5 h-8.5 rounded-2xl bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] p-0.5 shadow-md border-b-2 border-[#D93848] flex items-center justify-center shrink-0">
              <GkooBirdAvatar size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-gray-900 dark:text-white leading-none whitespace-nowrap drop-shadow-xs">
                Gkoo
              </span>
            </div>
          </div>

          {/* Right Stats: Streak, Gems, Hearts in a unified floating glass pill */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 whitespace-nowrap bg-black/[0.05] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] px-3 py-1.5 rounded-full shadow-xs">
          {/* Streak */}
          <motion.button
            whileTap={onOpenStreakFreeze ? { scale: 0.9 } : {}}
            onClick={() => {
              if (onOpenStreakFreeze) {
                triggerHaptic('click');
                onOpenStreakFreeze();
              }
            }}
            className={`flex items-center space-x-1 text-[#FF9F1A] dark:text-[#FFB020] ${
              onOpenStreakFreeze ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
            }`}
            title="Daily Streak & Streak Freeze"
          >
            <Flame className="w-5 h-5 fill-[#FF9F1A] dark:fill-[#FFB020]" />
            <span className="text-sm font-black">{streak}</span>
            {streakFreezes > 0 && (
              <span className="text-[10px] bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 px-1.5 py-0.5 rounded-full font-bold ml-0.5 inline-flex items-center space-x-0.5 shadow-2xs" title={`${streakFreezes} Streak Freeze active`}>
                <Snowflake className="w-2.5 h-2.5 text-sky-500 inline mr-0.5" />
                <span>{streakFreezes}</span>
              </span>
            )}
          </motion.button>

          {/* Blue Gem / Daily Reward Button (No border, clean like others) */}
          <motion.button
            whileTap={(onOpenDailyReward || onOpenQuests) ? { scale: 0.88 } : {}}
            onClick={() => {
              if (onOpenDailyReward) {
                triggerHaptic('click');
                onOpenDailyReward();
              } else if (onOpenQuests) {
                triggerHaptic('click');
                onOpenQuests();
              }
            }}
            className={`relative flex items-center space-x-1.5 text-sky-500 hover:opacity-85 transition-all select-none ${(onOpenDailyReward || onOpenQuests) ? 'cursor-pointer' : 'cursor-default'}`}
            title="Gems & Daily Reward"
          >
            <Gem className="w-4 h-4 fill-sky-400 text-sky-500 shrink-0" />
            <span className="text-sm font-black text-sky-600 dark:text-sky-400 leading-none">{gems}</span>
            {hasUnclaimedDailyReward && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 border border-white dark:border-[#0F121E]"></span>
              </span>
            )}
          </motion.button>

          {/* Hearts / Lives */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              triggerHaptic('click');
              setShowHeartsModal(true);
            }}
            className="flex items-center space-x-1 text-[#FF5F6D] hover:opacity-85 transition-all"
          >
            <Heart className="w-5 h-5 fill-[#FF5F6D] text-[#FF5F6D]" />
            <span className="text-sm font-black">{hearts}</span>
            {hearts < 5 && <Plus className="w-3 h-3 text-[#FF5F6D] stroke-[3] -ml-0.5" />}
          </motion.button>
        </div>
        </div>
      </header>

      {/* Hearts Refill Modal */}
      <AnimatePresence>
        {showHeartsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-[#13192B] rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-gray-100 dark:border-indigo-950/80 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto mb-3 border-2 border-rose-100 dark:border-rose-900/50 shadow-inner">
                <Heart className="w-8 h-8 fill-[#FF5F6D] text-[#FF5F6D]" />
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                {hearts >= 5 ? t('fullHearts') : t('hearts')}
              </h3>

              <div className="flex justify-center space-x-2 my-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Heart
                    key={i}
                    className={`w-6 h-6 ${
                      i <= hearts
                        ? 'fill-[#FF5F6D] text-[#FF5F6D]'
                        : 'text-gray-300 dark:text-gray-700'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-300 font-medium mb-5 leading-relaxed">
                {hearts < 5 ? t('heartsRefillPrompt') : "You're all set to conquer lessons and maintain your streak!"}
              </p>

              {hearts < 5 && (
                <button
                  onClick={handleRefillWithGems}
                  className="w-full bg-[#FF5F6D] hover:bg-[#E64553] text-white font-black py-3.5 rounded-2xl shadow-[0_4px_0_0_#D93848] active:translate-y-0.5 active:shadow-none transition-all text-xs mb-2.5 flex items-center justify-center space-x-1.5"
                >
                  <span>{t('refillWithGems')}</span>
                </button>
              )}

              <button
                onClick={() => setShowHeartsModal(false)}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs"
              >
                {t('close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
