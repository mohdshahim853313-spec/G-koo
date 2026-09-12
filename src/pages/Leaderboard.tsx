import { useState, useMemo } from 'react';
import { useAppContext } from '../useAppContext';
import { Trophy, Clock, ArrowUp, Sparkles, CheckCircle2, UserCheck, LogIn } from 'lucide-react';
import { triggerHaptic } from '../lib/audio';
import { GkooCompanionCard } from '../components/GkooCompanionCard';
import { motion } from 'framer-motion';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isUser?: boolean;
  isGuest?: boolean;
  isVerified?: boolean;
}

const LEAGUE_ROSTER: Record<string, LeaderboardUser[]> = {
  gold: [
    { id: '1', name: 'Aarav Patel', avatar: '🦁', xp: 840, isVerified: true },
    { id: '2', name: 'Priya Sharma', avatar: '🦊', xp: 710, isVerified: true },
    { id: '3', name: 'Rohan Gupta', avatar: '🐼', xp: 620, isVerified: true },
    { id: '4', name: 'Ananya Roy', avatar: '🐯', xp: 540, isVerified: true },
    { id: '5', name: 'Kabir Mehta', avatar: '🐨', xp: 480, isVerified: true },
    { id: '6', name: 'Sneha Verma', avatar: '🐱', xp: 390, isVerified: true },
    { id: '7', name: 'Vikram Singh', avatar: '🐶', xp: 310, isVerified: true },
  ],
  silver: [
    { id: 's1', name: 'Meera Nair', avatar: '🦄', xp: 420, isVerified: true },
    { id: 's2', name: 'Aditya Sen', avatar: '🐰', xp: 380, isVerified: true },
    { id: 's3', name: 'Tanvi Joshi', avatar: '🐻', xp: 320, isVerified: true },
    { id: 's4', name: 'Kavya Pillai', avatar: '🌸', xp: 260, isVerified: true },
  ],
  bronze: [
    { id: 'b1', name: 'Dev Malik', avatar: '🐸', xp: 210, isVerified: true },
    { id: 'b2', name: 'Rhea Kapoor', avatar: '🦋', xp: 190, isVerified: true },
    { id: 'b3', name: 'Ishaan Reddy', avatar: '🦉', xp: 140, isVerified: true },
  ],
  diamond: [
    { id: 'd1', name: 'Siddharth Rao', avatar: '👑', xp: 1950, isVerified: true },
    { id: 'd2', name: 'Neha Chawla', avatar: '💎', xp: 1820, isVerified: true },
    { id: 'd3', name: 'Arjun Das', avatar: '⚡', xp: 1690, isVerified: true },
    { id: 'd4', name: 'Simran Gill', avatar: '🔥', xp: 1540, isVerified: true },
  ]
};

export default function Leaderboard() {
  const { t, xp, profile, currentUser, isGuest, setIsAuthModalOpen, lang } = useAppContext();
  const [activeLeague, setActiveLeague] = useState<'bronze' | 'silver' | 'gold' | 'diamond'>('gold');
  const [tab, setTab] = useState<'weekly' | 'allTime'>('weekly');

  // Inject current signed-in user and any registered local accounts
  const sortedUsers = useMemo(() => {
    const baseList = [...(LEAGUE_ROSTER[activeLeague] || LEAGUE_ROSTER.gold)];
    
    // Add other registered local accounts if any exist
    const otherAccounts: LeaderboardUser[] = [];
    try {
      const savedAccounts = localStorage.getItem('gkoo_accounts');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        Object.values(parsed).forEach((acc: any) => {
          if (currentUser && acc.id === currentUser.id) return;
          if (acc.name) {
            otherAccounts.push({
              id: acc.id,
              name: acc.name,
              avatar: acc.avatar || '🦉',
              xp: acc.xp || 180,
              isUser: false,
              isVerified: true,
            });
          }
        });
      }
    } catch (e) {
      // Ignore
    }

    // Determine current user display name
    const isUserSignedIn = !!currentUser && !isGuest;
    const currentUserName = isUserSignedIn
      ? currentUser.name
      : (profile.name && profile.name !== 'Guest Scholar' && profile.name !== 'Rahul Sharma'
          ? profile.name
          : (lang === 'hi' ? 'अतिथि शिक्षार्थी (Guest)' : 'Guest Learner'));

    const currentUserAvatar = isUserSignedIn ? currentUser.avatar : (profile.avatar || '🦉');

    const activeUserEntry: LeaderboardUser = {
      id: isUserSignedIn ? currentUser.id : 'current_user',
      name: currentUserName,
      avatar: currentUserAvatar,
      xp: xp,
      isUser: true,
      isGuest: !isUserSignedIn,
      isVerified: isUserSignedIn,
    };

    const combined = [...baseList, ...otherAccounts, activeUserEntry];
    return combined.sort((a, b) => b.xp - a.xp);
  }, [activeLeague, currentUser, isGuest, profile.name, profile.avatar, xp, lang]);

  const userRank = sortedUsers.findIndex(u => u.isUser) + 1;
  const topThree = sortedUsers.slice(0, 3);
  const remainingRankers = sortedUsers.slice(3);

  const leagueLabels = {
    bronze: t('bronzeLeague'),
    silver: t('silverLeague'),
    gold: t('goldLeague'),
    diamond: t('diamondLeague'),
  };

  const isUserSignedIn = !!currentUser && !isGuest;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120] pb-28 px-4 pt-[max(env(safe-area-inset-top,0px),30px)] md:pt-8 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 mt-1">
          <h1 className="text-2xl font-black">{t('leaderboardTitle')}</h1>
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('weeklySeason')}</span>
          </div>
        </div>

        {/* Guest Callout Banner: Prompt to Sign In for Real Name on Leaderboard */}
        {!isUserSignedIn && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500 via-[#FF5F6D] to-rose-600 text-white rounded-3xl p-4 shadow-lg mb-4 flex items-center justify-between gap-3 border-2 border-amber-300 dark:border-amber-600 select-none"
          >
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner shrink-0">
                👑
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-black text-white truncate">
                  {lang === 'hi' ? 'लीडरबोर्ड में अपना असली नाम लाएं!' : 'Join the Real Leaderboard!'}
                </p>
                <p className="text-[11px] text-rose-100 font-medium leading-tight mt-0.5 line-clamp-2">
                  {lang === 'hi' ? 'साइन इन करें और अपनी असली रैंक व नाम दुनिया को दिखाएं' : 'Sign in to showcase your real name, avatar & live XP rank'}
                </p>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.92, y: 1 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => {
                triggerHaptic('click');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white text-gray-900 font-black text-xs shadow-md shrink-0 hover:bg-amber-50 active:shadow-none transition-all flex items-center space-x-1.5 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{lang === 'hi' ? 'साइन इन' : 'Sign In'}</span>
            </motion.button>
          </motion.div>
        )}

        {/* Verified Account Banner when Signed In */}
        {isUserSignedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 px-4 mb-4 flex items-center justify-between gap-2 text-xs select-none shadow-xs"
          >
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-black text-emerald-800 dark:text-emerald-300 truncate">
                {lang === 'hi' ? `सत्यापित खिलाड़ी: ${currentUser.name}` : `Verified Player: ${currentUser.name}`}
              </span>
            </div>
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700 shrink-0 whitespace-nowrap">
              Rank #{userRank}
            </span>
          </motion.div>
        )}

        {/* G-koo League Coach Companion Card */}
        <GkooCompanionCard panel="leaderboard" defaultMood="celebrate" className="mb-4" />

        {/* League Selection Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl mb-4 text-xs font-black">
          {(['bronze', 'silver', 'gold', 'diamond'] as const).map((league) => (
            <motion.button
              key={league}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                triggerHaptic('click');
                setActiveLeague(league);
              }}
              className={`py-2 rounded-xl capitalize transition-all select-none whitespace-nowrap ${
                activeLeague === league
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm scale-100'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {league === 'bronze' && '🥉 '}
              {league === 'silver' && '🥈 '}
              {league === 'gold' && '🥇 '}
              {league === 'diamond' && '💎 '}
              <span className="hidden sm:inline">{league}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Switcher: Weekly League vs All Time */}
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700 shadow-sm mb-5 text-xs font-bold">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setTab('weekly');
            }}
            className={`flex-1 py-2 px-1 rounded-xl transition-all select-none whitespace-nowrap ${
              tab === 'weekly' ? 'bg-[#FF5F6D] text-white font-black shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t('weekly')} ({leagueLabels[activeLeague]})
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerHaptic('click');
              setTab('allTime');
            }}
            className={`flex-1 py-2 px-1 rounded-xl transition-all select-none whitespace-nowrap ${
              tab === 'allTime' ? 'bg-[#FF5F6D] text-white font-black shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t('allTime')}
          </motion.button>
        </div>

        {/* Top 3 Podium View - Solid 3D Pedestals */}
        {topThree.length >= 3 && (
          <div className="bg-white dark:bg-gray-800/90 border-2 border-gray-100 dark:border-gray-800 border-b-4 rounded-3xl p-5 mb-5 shadow-md">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider text-center mb-4 flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>{t('topRankers')}</span>
            </p>

            <div className="flex items-end justify-center space-x-2.5 pt-4 pb-2">
              {/* 2nd Place - Silver 3D Pedestal */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                className="flex-1 flex flex-col items-center select-none"
              >
                <div className="text-3xl mb-1 drop-shadow-sm">{topThree[1].avatar}</div>
                <div className="w-8 h-8 rounded-full bg-slate-200 font-black text-xs flex items-center justify-center border-2 border-white shadow-md mb-1 text-slate-800">
                  🥈
                </div>
                <p className="text-xs font-black text-center truncate max-w-[80px] text-gray-800 dark:text-gray-100">
                  {topThree[1].name.split(' ')[0]} {topThree[1].isUser && '(You)'}
                </p>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-300">{topThree[1].xp} XP</span>
                
                <div className="w-full h-20 bg-gradient-to-t from-slate-400 via-slate-200 to-sky-100 rounded-t-2xl mt-2 flex flex-col items-center justify-center font-black text-slate-800 text-lg shadow-md border-b-[4px] border-slate-500">
                  <span className="text-base font-black">2</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-600 font-extrabold">Silver</span>
                </div>
              </motion.div>

              {/* 1st Place - Gold 3D Pedestal */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05 }}
                className="flex-1 flex flex-col items-center -mt-6 select-none z-10"
              >
                <div className="text-4xl mb-1 drop-shadow-md">{topThree[0].avatar}</div>
                <div className="w-9 h-9 rounded-full bg-amber-400 font-black text-xs flex items-center justify-center border-2 border-white shadow-lg mb-1 text-amber-950">
                  <Trophy className="w-4 h-4 fill-amber-950" />
                </div>
                <p className="text-xs font-black text-center truncate max-w-[85px] text-amber-600 dark:text-amber-400">
                  {topThree[0].name.split(' ')[0]} {topThree[0].isUser && '(You)'}
                </p>
                <span className="text-[11px] font-black text-amber-600 dark:text-amber-400">{topThree[0].xp} XP</span>
                
                <div className="w-full h-28 bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 rounded-t-2xl mt-2 flex flex-col items-center justify-center font-black text-amber-950 text-xl shadow-xl border-b-[5px] border-amber-700">
                  <span className="text-xl font-black">🥇</span>
                  <span className="text-[10px] uppercase tracking-wider text-amber-900 font-black">Champion</span>
                </div>
              </motion.div>

              {/* 3rd Place - Bronze 3D Pedestal */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                className="flex-1 flex flex-col items-center select-none"
              >
                <div className="text-3xl mb-1 drop-shadow-sm">{topThree[2].avatar}</div>
                <div className="w-8 h-8 rounded-full bg-amber-800 font-black text-xs flex items-center justify-center border-2 border-white shadow-md mb-1 text-amber-100">
                  🥉
                </div>
                <p className="text-xs font-black text-center truncate max-w-[80px] text-gray-800 dark:text-gray-100">
                  {topThree[2].name.split(' ')[0]} {topThree[2].isUser && '(You)'}
                </p>
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">{topThree[2].xp} XP</span>
                
                <div className="w-full h-16 bg-gradient-to-t from-amber-900 via-orange-800 to-amber-700 rounded-t-2xl mt-2 flex flex-col items-center justify-center font-black text-amber-100 text-base shadow-md border-b-[4px] border-amber-950">
                  <span className="text-base font-black">3</span>
                  <span className="text-[9px] uppercase tracking-wider text-amber-200 font-extrabold">Bronze</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Promotion Zone Banner - Solid 3D Emerald */}
        <div className="flex items-center space-x-2 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-600 p-3 px-4 rounded-2xl mb-4 shadow-md border-b-[4px] border-emerald-800">
          <ArrowUp className="w-4 h-4 stroke-[3]" />
          <span>{t('promotionZone')}</span>
        </div>

        {/* Full Leaderboard List - 3D Cards */}
        <div className="space-y-2.5 mb-6">
          {remainingRankers.map((user, idx) => {
            const rankNum = idx + 4;
            const isMe = user.isUser;

            return (
              <motion.div
                key={user.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => triggerHaptic('click')}
                className={`flex items-center justify-between p-3.5 px-4 rounded-2xl border-2 border-b-[4px] transition-all select-none ${
                  isMe
                    ? 'bg-gradient-to-r from-rose-50 to-rose-100/60 dark:from-rose-950/60 dark:to-rose-900/40 border-[#FF5F6D] border-b-[#D93848] shadow-md font-black'
                    : 'bg-white dark:bg-gray-800/90 border-gray-100 dark:border-gray-800 border-b-gray-200 dark:border-b-gray-900 shadow-xs'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-black text-xs ${
                    isMe 
                      ? 'bg-[#FF5F6D] text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                  }`}>
                    {rankNum}
                  </span>
                  <span className="text-2xl">{user.avatar}</span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className={`text-xs font-black ${isMe ? 'text-[#E64553] dark:text-rose-300' : 'text-gray-800 dark:text-gray-100'}`}>
                        {user.name} {isMe && `(${t('yourRank')})`}
                      </p>
                      {user.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                      )}
                    </div>
                    {isMe && !isUserSignedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('click');
                          setIsAuthModalOpen(true);
                        }}
                        className="text-[10px] font-black text-[#FF5F6D] hover:underline"
                      >
                        {lang === 'hi' ? '👉 साइन इन करके नाम सेट करें' : '👉 Sign in to set name'}
                      </button>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-black ${isMe ? 'text-[#FF5F6D]' : 'text-gray-500 dark:text-gray-400'}`}>
                  {user.xp} XP
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Fixed Sticky User Rank Floating Banner - 3D Gradient Coral-Gold */}
        <motion.div 
          whileTap={{ scale: 0.96 }}
          className="bg-gradient-to-r from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] text-white rounded-3xl p-3.5 px-4.5 shadow-2xl border-b-[5px] border-[#D93848] flex items-center justify-between sticky bottom-16 select-none z-30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-white text-[#E64553] flex items-center justify-center font-black text-sm shadow-md">
              #{userRank}
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-black text-white drop-shadow-xs">
                  {isUserSignedIn ? currentUser.name : (lang === 'hi' ? 'अतिथि (Guest)' : profile.name)}
                </p>
                {isUserSignedIn && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-200 fill-amber-400/30 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-rose-100 font-bold">
                {t('yourRank')} in {leagueLabels[activeLeague]} {!isUserSignedIn && '(Guest Mode)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isUserSignedIn && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('click');
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-[10px] border border-white/40 shadow-xs"
              >
                {lang === 'hi' ? 'साइन इन' : 'Sign In'}
              </button>
            )}
            <span className="text-base font-black text-white bg-black/20 px-3 py-1 rounded-full shadow-inner">
              {xp} XP
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
