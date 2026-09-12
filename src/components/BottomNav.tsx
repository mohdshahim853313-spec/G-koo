import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Award, User, Settings } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { motion } from 'framer-motion';

export const BottomNav: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t } = useAppContext();

  const navItems = [
    { to: '/', icon: Home, label: t('home') },
    { to: '/leaderboard', icon: Award, label: t('rank') },
    { to: '/profile', icon: User, label: t('profile') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-[#121217] border-t border-gray-100 dark:border-gray-800 px-6 py-2 flex justify-around items-center z-50 max-w-md mx-auto shadow-sm select-none [transform:translateZ(0)] ${className}`}>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => triggerHaptic('click')}
          className={({ isActive }) =>
            `flex flex-col items-center py-1 transition-all ${
              isActive
                ? 'text-[#FF5F6D] font-black'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold'
            }`
          }
        >
          {({ isActive }) => (
            <motion.div
              whileTap={{ scale: 0.82, y: 1 }}
              className="flex flex-col items-center space-y-1"
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-rose-50 dark:bg-rose-950/50' : ''}`}>
                <Icon className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="text-[11px] tracking-wide whitespace-nowrap shrink-0">{label}</span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
