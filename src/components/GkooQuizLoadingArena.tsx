import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { GkooBirdSvg, type MascotMood } from './Mascot';
import { useAppContext } from '../useAppContext';

interface LoadingTemplate {
  mood: MascotMood;
  particle: string;
  badgeHi: string;
  badgeEn: string;
  textHi: string;
  textEn: string;
}

const LOADING_TEMPLATES: LoadingTemplate[] = [
  {
    mood: 'thinking',
    particle: '🔍',
    badgeHi: 'ज्ञान की खोज 🔍',
    badgeEn: 'Discovering Knowledge 🔍',
    textHi: 'Gkoo आपके लिए सबसे बेहतरीन और मजेदार सवाल खोज रहा है...',
    textEn: 'Gkoo is exploring the finest and most exciting questions for you...',
  },
  {
    mood: 'excited',
    particle: '📖',
    badgeHi: 'जादुई किताब 📖',
    badgeEn: 'Wisdom Book 📖',
    textHi: 'Gkoo अपनी जादुई ज्ञान की किताब से खास प्रश्न चुन रहा है...',
    textEn: 'Gkoo is picking special questions from his magical book of wisdom...',
  },
  {
    mood: 'fire',
    particle: '🧠',
    badgeHi: 'दिमागी कसरत 🧠',
    badgeEn: 'Brain Workout 🧠',
    textHi: 'आपके दिमाग की कसरत के लिए टॉप क्लास सवाल तैयार हो रहे हैं...',
    textEn: 'Crafting top-class brain-power questions just for you...',
  },
  {
    mood: 'celebrate',
    particle: '💎',
    badgeHi: 'सवालों का खजाना 💎',
    badgeEn: 'Treasure Hunt 💎',
    textHi: 'Gkoo नए और रोमांचक सवालों का खजाना खोल रहा है...',
    textEn: 'Gkoo is unlocking a treasure of exciting new challenges...',
  },
  {
    mood: 'ninja',
    particle: '⚡',
    badgeHi: 'सुपर स्पीड ⚡',
    badgeEn: 'Lightning Speed ⚡',
    textHi: 'रॉकेट स्पीड से ज्ञान की दुनिया के चुनिंदा सवाल लोड हो रहे हैं...',
    textEn: 'Loading handpicked fascinating questions from across the world...',
  },
  {
    mood: 'waving',
    particle: '🌟',
    badgeHi: 'लेवल रेडी 🌟',
    badgeEn: 'Level Ready 🌟',
    textHi: 'Gkoo आपके अगले लेवल के लिए एकदम परफेक्ट सवाल सेट कर रहा है...',
    textEn: 'Gkoo is setting up the perfect questions for your next triumph...',
  },
  {
    mood: 'eating',
    particle: '💎',
    badgeHi: 'डायमंड राउंड 💎',
    badgeEn: 'Diamond Grade 💎',
    textHi: 'Gkoo आपके लिए डायमंड ग्रेड के ज्ञानवर्धक सवाल ला रहा है...',
    textEn: 'Gkoo is bringing diamond-grade knowledge challenges for you...',
  },
  {
    mood: 'excited',
    particle: '🏆',
    badgeHi: 'चैंपियन अरीना 🏆',
    badgeEn: 'Champion Arena 🏆',
    textHi: 'चैंपियन बनने के लिए बेहतरीन क्विज अरीना तैयार हो रहा है...',
    textEn: 'The champion quiz arena is getting ready for your victory...',
  },
  {
    mood: 'thinking',
    particle: '📝',
    badgeHi: 'सीक्रेट डायरी 📝',
    badgeEn: 'Secret Diary 📝',
    textHi: 'Gkoo अपनी सीक्रेट डायरी से सबसे दिलचस्प सवाल निकाल रहा है...',
    textEn: 'Gkoo is pulling the most interesting questions from his secret diary...',
  },
  {
    mood: 'dance',
    particle: '🚀',
    badgeHi: 'ज्ञान का सफर 🚀',
    badgeEn: 'Knowledge Quest 🚀',
    textHi: 'शानदार ज्ञान का सफर शुरू होने वाला है, तैयार हो जाइए! 🚀',
    textEn: 'An exciting adventure of knowledge is about to begin, buckle up! 🚀',
  },
  {
    mood: 'fire',
    particle: '🔥',
    badgeHi: 'हाई एनर्जी राउंड 🔥',
    badgeEn: 'High Energy Round 🔥',
    textHi: 'Gkoo आपके फोकस और मेमोरी को बूस्ट करने वाले सवाल बना रहा है...',
    textEn: 'Gkoo is crafting questions to supercharge your focus and memory...',
  },
  {
    mood: 'celebrate',
    particle: '🎯',
    badgeHi: 'परफेक्ट टारगेट 🎯',
    badgeEn: 'Bullseye Ready 🎯',
    textHi: 'मैजिकल क्विज राउंड लोड हो रहा है, गहरी सांस लें और तैयार रहें! 🎯',
    textEn: 'Magic quiz round is loading, take a breath and aim for 100%! 🎯',
  },
  {
    mood: 'ninja',
    particle: '🥷',
    badgeHi: 'निंजा फोकस 🥷',
    badgeEn: 'Ninja Focus 🥷',
    textHi: 'Gkoo आपके लिए आज का सबसे रोमांचक चैलेंज डिजाइन कर रहा है...',
    textEn: 'Gkoo is designing today’s most thrilling and rewarding challenge...',
  },
  {
    mood: 'love',
    particle: '💖',
    badgeHi: 'सुपर बडी 💖',
    badgeEn: 'Learning Buddy 💖',
    textHi: 'ज्ञान और समझ बढ़ाने वाले अद्भुत सवाल बस कुछ ही पलों में आ रहे हैं...',
    textEn: 'Brilliant questions to sharpen your brilliance are arriving in seconds...',
  },
  {
    mood: 'excited',
    particle: '👑',
    badgeHi: 'मास्टर क्लास 👑',
    badgeEn: 'Master Class 👑',
    textHi: 'Gkoo आपके लिए खास स्तर के रोचक सवाल सजा रहा है...',
    textEn: 'Gkoo is polishing high-reward questions for your learning journey...',
  },
];

interface GkooQuizLoadingArenaProps {
  isOffline?: boolean;
}

export const GkooQuizLoadingArena: React.FC<GkooQuizLoadingArenaProps> = ({ isOffline: propIsOffline }) => {
  const { lang, isOnline } = useAppContext();
  const isOffline = propIsOffline !== undefined ? propIsOffline : (!isOnline || (typeof navigator !== 'undefined' && !navigator.onLine));

  // Pick a random unique template for each level load session
  const [templateIndex] = useState(() => Math.floor(Math.random() * LOADING_TEMPLATES.length));
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);

  const currentTemplate = LOADING_TEMPLATES[templateIndex];

  // Spawn floating sparkles with subtle gentle float for visual charm
  useEffect(() => {
    const spawnParticles = () => {
      const newItems = Array.from({ length: 3 }).map((_, i) => ({
        id: Date.now() + Math.random() + i,
        char: currentTemplate.particle,
        x: (Math.random() - 0.5) * 160,
        y: -30 - Math.random() * 60,
      }));
      setParticles(prev => [...prev.slice(-6), ...newItems]);
    };

    spawnParticles();
    const interval = setInterval(spawnParticles, 1800);
    return () => clearInterval(interval);
  }, [currentTemplate.particle]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-[max(env(safe-area-inset-top,0px),30px)] pb-[max(env(safe-area-inset-bottom,0px),28px)] text-center max-w-lg mx-auto bg-[#FCF9F7] dark:bg-[#121217] select-none font-sans relative overflow-hidden">
      {/* Ambient Pulsing Glow Background */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.65, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
        className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-rose-400/30 via-[#FF5F6D]/20 to-amber-300/30 blur-3xl pointer-events-none"
      />

      {/* Floating Magic Particle Emojis */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.8, x: p.x, y: p.y - 50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute top-1/3 text-2xl pointer-events-none z-20"
          >
            {p.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Big Animated G-koo Character */}
      <motion.div
        animate={{
          y: [0, -16, 0, -8, 0],
          rotate: [-3, 4, -3, 2, 0],
          scale: [1, 1.05, 0.98, 1.03, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
        className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 relative z-10 drop-shadow-2xl mb-4"
      >
        <GkooBirdSvg mood={currentTemplate.mood} className="w-full h-full" />
      </motion.div>

      {/* Dynamic Animated Badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isOffline ? 'offline-badge' : currentTemplate.badgeEn}
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border shadow-xs mb-3 ${
            isOffline
              ? 'bg-amber-500/15 dark:bg-amber-500/25 border-amber-400 dark:border-amber-600/60'
              : 'bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-rose-500/15 dark:from-rose-500/25 dark:to-amber-500/25 border-rose-300 dark:border-rose-700/60'
          }`}
        >
          {isOffline ? (
            <span className="text-sm">📡</span>
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#FF5F6D] animate-spin" />
          )}
          <span className={`text-xs font-black tracking-wide ${isOffline ? 'text-amber-600 dark:text-amber-400' : 'text-[#FF5F6D] dark:text-rose-400'}`}>
            {isOffline 
              ? (lang === 'hi' ? '📡 ऑफलाइन मोड (Offline Mode)' : '📡 Offline Mode Active')
              : (lang === 'hi' ? currentTemplate.badgeHi : currentTemplate.badgeEn)}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Rotating 15-Template Message Speech Bubble */}
      <div className="w-full max-w-sm px-2 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={isOffline ? 'offline-text' : currentTemplate.textEn}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`backdrop-blur-md border-2 p-4 rounded-3xl shadow-lg relative ${
              isOffline
                ? 'bg-amber-50/95 dark:bg-[#1C1814]/95 border-amber-300 dark:border-amber-700/70'
                : 'bg-white/95 dark:bg-gray-800/95 border-rose-200 dark:border-rose-900/60'
            }`}
          >
            <p className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100 leading-snug">
              {isOffline
                ? (lang === 'hi' 
                    ? '📡 आप ऑफलाइन हैं! Gkoo ऑफलाइन प्रश्न बैंक से आपके लिए सवाल तैयार कर रहा है...' 
                    : '📡 You are offline! Gkoo is preparing questions from the offline question bank...')
                : (lang === 'hi' ? currentTemplate.textHi : currentTemplate.textEn)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Smooth Loading Pulse Bar */}
      <div className="w-48 bg-gray-200 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden shadow-inner">
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: 'easeInOut',
          }}
          className={`w-1/2 h-full rounded-full ${
            isOffline
              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
              : 'bg-gradient-to-r from-[#FF7B7B] via-[#FF5F6D] to-[#FF9F1A]'
          }`}
        />
      </div>

      {/* Bottom Subtitle */}
      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-400 mt-3 tracking-wide">
        {isOffline
          ? (lang === 'hi' ? '⚡ ऑफलाइन मोड चालू • बिना इंटरनेट भी सीखें' : '⚡ Offline Mode • Keep learning without internet')
          : (lang === 'hi' ? '✨ क्विज बस शुरू होने ही वाला है...' : '✨ Quiz starting in a moment...')}
      </p>
    </div>
  );
};
