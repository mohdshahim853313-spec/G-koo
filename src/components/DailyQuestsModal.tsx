import React from 'react';
import { Sparkles, CheckCircle2, Gift, X } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({ isOpen, onClose }) => {
  const { t, quests, claimQuest } = useAppContext();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-[#1A1A24] rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-[#FF9F1A] rounded-2xl">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  {t('dailyQuestsTitle')}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-400 font-medium mb-4">
            {t('dailyQuestsSubtitle')}
          </p>

          {/* Quests List */}
          <div className="space-y-3 mb-5">
            {quests.map((quest) => {
              const progressPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

              return (
                <div
                  key={quest.id}
                  className="bg-gray-50 dark:bg-[#121217] border border-gray-200 dark:border-gray-800 p-3.5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black text-gray-800 dark:text-gray-100">
                      {t(quest.titleKey)}
                    </p>
                    <span className="text-[11px] font-bold text-gray-400">
                      {quest.current} / {quest.target}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden mb-3">
                    <motion.div
                      className="bg-gradient-to-r from-[#FF9F1A] to-[#FF5F6D] h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Rewards and Claim Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-[11px] font-black text-gray-500 dark:text-gray-400">
                      <span className="text-sky-500">+{quest.rewardGems} 💎</span>
                      <span className="text-[#FF9F1A]">+{quest.rewardXp} XP</span>
                    </div>

                    {quest.claimed ? (
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('claimed')}</span>
                      </span>
                    ) : quest.completed ? (
                      <button
                        onClick={() => claimQuest(quest.id)}
                        className="bg-[#FF5F6D] hover:bg-[#E64553] text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-[0_2px_0_0_#D93848] active:translate-y-0.5 active:shadow-none transition-all flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('claimReward')}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-gray-400">In Progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs"
          >
            {t('close')}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
