import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Gift, Lock, X } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { playSound, triggerHaptic } from '../lib/audio';

const STORAGE_KEY_LAST_CLAIM = 'gkoo_daily_reward_last_claim';
const STORAGE_KEY_CURRENT_DAY = 'gkoo_daily_reward_cycle_day';

interface RewardTier {
  day: number;
  gems: number;
  hasFreeze?: boolean;
}

const REWARDS: RewardTier[] = [
  { day: 1, gems: 10 },
  { day: 2, gems: 15 },
  { day: 3, gems: 20 },
  { day: 4, gems: 25 },
  { day: 5, gems: 30 },
  { day: 6, gems: 40 },
  { day: 7, gems: 50, hasFreeze: true },
];

export function DailyLoginRewardModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { lang, addGems, addStreakFreeze } = useAppContext();
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [alreadyClaimedToday, setAlreadyClaimedToday] = useState<boolean>(false);
  const [claimedReward, setClaimedReward] = useState<RewardTier | null>(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastClaim = localStorage.getItem(STORAGE_KEY_LAST_CLAIM);
    const savedDay = parseInt(localStorage.getItem(STORAGE_KEY_CURRENT_DAY) || '1', 10);

    if (lastClaim === today) {
      setAlreadyClaimedToday(true);
      setCurrentDay(savedDay);
    } else {
      setAlreadyClaimedToday(false);
      // If last claim was yesterday, advance day. If older, keep or advance cycle
      if (lastClaim) {
        const lastDate = new Date(lastClaim);
        const todayDate = new Date();
        const diffDays = Math.ceil((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          const nextDay = savedDay >= 7 ? 1 : savedDay + 1;
          setCurrentDay(nextDay);
        } else if (diffDays > 2) {
          // Reset cycle to day 1 after 2+ missed days
          setCurrentDay(1);
        } else {
          setCurrentDay(savedDay);
        }
      } else {
        setCurrentDay(1);
      }
    }
  }, [isOpen]);

  const handleClaim = () => {
    if (alreadyClaimedToday) return;

    triggerHaptic('success');
    playSound('success');

    const reward = REWARDS[currentDay - 1];
    addGems(reward.gems);
    if (reward.hasFreeze) {
      addStreakFreeze(1);
    }

    const today = new Date().toDateString();
    localStorage.setItem(STORAGE_KEY_LAST_CLAIM, today);
    localStorage.setItem(STORAGE_KEY_CURRENT_DAY, currentDay.toString());

    setAlreadyClaimedToday(true);
    setClaimedReward(reward);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md bg-white dark:bg-[#1A2234] rounded-3xl border-2 border-amber-300 dark:border-amber-700 shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge & Title */}
            <div className="text-center mb-5">
              <div className="inline-flex p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-md text-3xl mb-2">
                🎁
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                {lang === 'hi' ? 'दैनिक लॉगिन उपहार' : 'Daily Login Rewards'}
              </h2>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {lang === 'hi'
                  ? 'हर दिन लॉगिन करें और मुफ्त जेम्स व स्ट्रीक शील्ड पाएं!'
                  : 'Log in daily to claim free Gems and Streak Shields!'}
              </p>
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-4 gap-2.5 mb-5">
              {REWARDS.map((r) => {
                const isPast = r.day < currentDay || (r.day === currentDay && alreadyClaimedToday);
                const isCurrent = r.day === currentDay && !alreadyClaimedToday;

                return (
                  <div
                    key={r.day}
                    className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-between text-center transition-all ${
                      r.day === 7 ? 'col-span-2' : 'col-span-1'
                    } ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-950/60 dark:to-amber-900/60 border-2 border-amber-500 shadow-lg scale-105'
                        : isPast
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 opacity-70'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">
                      {lang === 'hi' ? `दिन ${r.day}` : `Day ${r.day}`}
                    </span>

                    <div className="my-1.5 flex items-center justify-center">
                      {isPast ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      ) : isCurrent ? (
                        <span className="text-2xl animate-bounce">💎</span>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-black text-gray-900 dark:text-white">
                      +{r.gems} 💎
                    </div>

                    {r.hasFreeze && (
                      <span className="mt-0.5 text-[9px] font-black text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950/60 px-1.5 py-0.5 rounded-md">
                        {lang === 'hi' ? '+1 ❄️ शील्ड' : '+1 ❄️ Shield'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Claimed Success Banner or Claim Button */}
            {claimedReward ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500 text-white p-3.5 rounded-2xl text-center font-black shadow-lg mb-2"
              >
                🎉 {lang === 'hi' ? 'बधाई! आपको मिले +' : 'Claimed! +'}
                {claimedReward.gems} 💎
                {claimedReward.hasFreeze && (lang === 'hi' ? ' और 1 ❄️ स्ट्रीक शील्ड!' : ' & 1 ❄️ Streak Shield!')}
              </motion.div>
            ) : alreadyClaimedToday ? (
              <div className="w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center font-bold text-sm rounded-2xl mb-2">
                ✓ {lang === 'hi' ? 'आज का उपहार प्राप्त हो चुका है!' : "Today's reward already claimed!"}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleClaim}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base rounded-2xl shadow-[0_4px_0_0_#B45309] border-b-2 border-amber-800 flex items-center justify-center space-x-2 mb-2"
              >
                <Gift className="w-5 h-5" />
                <span>
                  {lang === 'hi'
                    ? `दिन ${currentDay} का उपहार प्राप्त करें (+${REWARDS[currentDay - 1]?.gems} 💎)`
                    : `Claim Day ${currentDay} Reward (+${REWARDS[currentDay - 1]?.gems} 💎)`}
                </span>
              </motion.button>
            )}

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {lang === 'hi' ? 'आगे बढ़ें (बंद करें)' : 'Continue'}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
