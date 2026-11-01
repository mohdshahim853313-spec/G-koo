import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, User } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { motion } from 'framer-motion';

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastScrollY = window.pageYOffset || window.scrollY || 0;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset || window.scrollY || document.documentElement.scrollTop || 0;
      
      // Always show when near the top of the page
      if (scrollY <= 40) {
        setScrollDirection('up');
        lastScrollY = scrollY > 0 ? scrollY : 0;
        return;
      }

      const diff = scrollY - lastScrollY;
      // Instant trigger on 6px scroll
      if (diff > 6 && scrollDirection !== 'down') {
        setScrollDirection('down');
      } else if (diff < -6 && scrollDirection !== 'up') {
        setScrollDirection('up');
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [scrollDirection]);

  return scrollDirection;
}

export const BottomNav: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t, lang } = useAppContext();
  const location = useLocation();
  const currentPath = location.pathname;
  const scrollDirection = useScrollDirection();

  const navItems = [
    { to: '/', icon: Home, label: t('home'), checkActive: (p: string) => p === '/' },
    { to: '/subjects', icon: BookOpen, label: lang === 'hi' ? 'विषय' : 'Subjects', checkActive: (p: string) => p === '/subjects' },
    { to: '/leaderboard', icon: BarChart3, label: lang === 'hi' ? 'रिपोर्ट' : 'Report', checkActive: (p: string) => p === '/leaderboard' || p === '/report' || p === '/analytics' },
    { to: '/profile', icon: User, label: t('profile'), checkActive: (p: string) => p === '/profile' },
  ];

  return (
    <nav 
      className={`fixed bottom-[8px] left-1/2 -translate-x-1/2 w-[90%] max-w-[330px] md:hidden bg-white/95 dark:bg-[#141828]/95 border border-white/70 dark:border-white/[0.14] p-1 px-1.5 flex justify-around items-center z-50 rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.6)] dark:shadow-[0_12px_35px_-4px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.1)] select-none transition-transform duration-300 ease-in-out ${
        scrollDirection === 'down' ? 'translate-y-[130px]' : 'translate-y-0'
      } ${className}`}
    >
      {navItems.map(({ to, icon: Icon, label, checkActive }) => {
        const isActive = checkActive(currentPath);
        return (
          <NavLink
            key={to}
            to={to}
            onClick={() => triggerHaptic('click')}
            className="flex-1 flex justify-center py-0.5 select-none"
          >
            <motion.div
              whileTap={{ scale: 0.94 }}
              className={`w-full max-w-[72px] min-h-[44px] py-1.5 px-1 rounded-full flex flex-col items-center justify-center space-y-0.5 relative transition-colors duration-100 ${
                isActive
                  ? 'text-[#FF5F6D]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {isActive && (
                <motion.div
                  initial={{ scale: 0.82, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.08, ease: [0.18, 0.9, 0.3, 1.2] }}
                  className="absolute inset-0 bg-[#FF5F6D]/15 dark:bg-[#FF5F6D]/22 rounded-full shadow-xs pointer-events-none"
                />
              )}
              <Icon className={`w-[18.5px] h-[18.5px] relative z-10 transition-transform duration-100 ${isActive ? 'stroke-[2.5] scale-105' : 'stroke-[2]'}`} />
              <span className={`text-[11px] relative z-10 tracking-tight whitespace-nowrap leading-none ${isActive ? 'font-black' : 'font-semibold'}`}>
                {label}
              </span>
            </motion.div>
          </NavLink>
        );
      })}
    </nav>
  );
};
