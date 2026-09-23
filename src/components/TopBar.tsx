import React, { useState } from 'react';
import { Flame, Heart, Sparkles, Plus } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { GkooBirdAvatar } from './Mascot';
import { motion, AnimatePresence } from 'framer-motion';

interface TopBarProps {
  onOpenQuests?: () => void;
  onOpenStreakFreeze?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenQuests, onOpenStreakFreeze }) => {
  const { t, streak, hearts, gems, refillHearts, addGems, setIsAuthModalOpen, isGuest, streakFreezes } = useAppContext();
  const [showHeartsModal, setShowHeartsModal] = useState(false);

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
      <header className="sticky top-0 z-40 bg-white dark:bg-[#121217] border-b border-gray-100 dark:border-gray-800 px-4 pt-[max(env(safe-area-inset-top,0px),26px)] md:pt-4 md:px-8 pb-3.5 text-xs font-black shadow-xs select-none [transform:translateZ(0)]">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left: App Brand with Real Gkoo Bird Vector Logo */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              triggerHaptic('click');
              if (isGuest) {
                setIsAuthModalOpen(true);
              }
            }}
            className="flex items-center space-x-2 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] p-0.5 shadow-md border-b-2 border-[#D93848] flex items-center justify-center shrink-0">
              <GkooBirdAvatar size="sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-gray-900 dark:text-white leading-none whitespace-nowrap">
                Gkoo
              </span>
              {isGuest && (
                <span className="text-[9px] text-[#FF5F6D] font-bold tracking-tight whitespace-nowrap">
                  {t('guestModeBadge')}
                </span>
              )}
            </div>
          </motion.div>

          {/* Right Stats: Streak, Gems, Hearts, Quests */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 shrink-0 whitespace-nowrap">
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
            <Flame className="w-5 h-5 fill-[#FF9F1A] dark:fill-[#FFB020] animate-pulse" />
            <span className="text-sm font-black">{streak}</span>
            {streakFreezes > 0 && (
              <span className="text-[10px] bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 px-1 py-0.2 rounded-full font-bold ml-0.5" title={`${streakFreezes} Streak Freeze active`}>
                ❄️{streakFreezes}
              </span>
            )}
          </motion.button>

          {/* Gems */}
          <div className="flex items-center space-x-1 text-sky-500 cursor-default">
            <span className="text-sm">💎</span>
            <span className="text-sm font-black text-sky-600 dark:text-sky-400">{gems}</span>
          </div>

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

          {/* Quests Button */}
          {onOpenQuests && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                triggerHaptic('click');
                onOpenQuests();
              }}
              className="p-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-purple-600 dark:fill-purple-400" />
            </motion.button>
          )}
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
              className="bg-white dark:bg-[#1A1A24] rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-4xl flex items-center justify-center mx-auto mb-3 border-2 border-rose-100 dark:border-rose-900/50 shadow-inner">
                ❤️
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
