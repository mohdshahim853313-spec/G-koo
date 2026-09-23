import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Award, User, Settings, Flame, Heart } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { GkooBirdAvatar } from './Mascot';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { t, streak, hearts, gems, profile, isGuest, setIsAuthModalOpen } = useAppContext();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/leaderboard', icon: Award, label: t('rank') },
    { to: '/profile', icon: User, label: t('profile') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#121217] border-r border-gray-100 dark:border-gray-800 p-5 z-40 select-none shadow-xs">
      {/* Brand Header */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          triggerHaptic('click');
          navigate('/');
        }}
        className="flex items-center space-x-3 mb-8 cursor-pointer px-2"
      >
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] p-0.5 shadow-md border-b-2 border-[#D93848] flex items-center justify-center">
          <GkooBirdAvatar size="sm" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-[#FF5F6D] to-[#FF9F1A] bg-clip-text text-transparent leading-none">
            Gkoo
          </span>
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400 mt-0.5">
            AI Quiz Adventure
          </span>
        </div>
      </motion.div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => triggerHaptic('click')}
            className={({ isActive }) =>
              `flex items-center space-x-3.5 px-4 py-3 rounded-2xl font-black text-sm transition-all ${
                isActive
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-[#FF5F6D] border-2 border-rose-200 dark:border-rose-900/60 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-gray-800/60 border-2 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive ? 'bg-[#FF5F6D] text-white shadow-xs' : 'text-gray-400 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.4]" />
                </div>
                <span className="tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Live Stats & Status Card in Desktop Sidebar */}
      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-center">
          <div className="flex flex-col items-center">
            <span className="flex items-center space-x-0.5 text-xs font-black text-[#FF9F1A]">
              <Flame className="w-3.5 h-3.5 fill-[#FF9F1A]" />
              <span>{streak}</span>
            </span>
            <span className="text-[10px] text-gray-400 font-bold">Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-sky-500">
              💎 {gems}
            </span>
            <span className="text-[10px] text-gray-400 font-bold">Gems</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="flex items-center space-x-0.5 text-xs font-black text-[#FF5F6D]">
              <Heart className="w-3.5 h-3.5 fill-[#FF5F6D]" />
              <span>{hearts}</span>
            </span>
            <span className="text-[10px] text-gray-400 font-bold">Hearts</span>
          </div>
        </div>

        {/* User Badge / Guest Sign in */}
        <div
          onClick={() => {
            if (isGuest) {
              triggerHaptic('click');
              setIsAuthModalOpen(true);
            } else {
              navigate('/profile');
            }
          }}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
        >
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="text-xl shrink-0">{profile.avatar || '🦉'}</span>
            <div className="truncate text-left">
              <p className="text-xs font-black text-gray-800 dark:text-gray-100 truncate">
                {profile.name || 'User'}
              </p>
              <p className="text-[10px] font-bold text-[#FF5F6D]">
                {isGuest ? t('guestModeBadge') : 'Active Member'}
              </p>
            </div>
          </div>
          {isGuest && (
            <span className="text-[10px] font-black bg-[#FF5F6D] text-white px-2 py-0.5 rounded-lg shrink-0">
              Sign In
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};
