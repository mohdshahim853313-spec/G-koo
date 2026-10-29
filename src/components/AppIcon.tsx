import React from 'react';
import {
  Landmark,
  GraduationCap,
  Scale,
  Crown,
  Train,
  Building2,
  Globe,
  Languages,
  Compass,
  Calculator,
  Zap,
  FlaskConical,
  Dna,
  BookText,
  BookOpen,
  Swords,
  Map,
  ScrollText,
  Laptop,
  Brain,
  TrendingUp,
  Microscope,
  Flag,
  Earth,
  Target,
  Gift,
  Gem,
  Snowflake,
  Heart,
  Trophy,
  MapPin,
  Pin,
  Sparkles,
  HelpCircle,
  FileText,
  Flame,
  Award,
  ShieldCheck,
  Star,
  Coins
} from 'lucide-react';

interface AppIconProps {
  icon?: string;
  className?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  // Competitive Exams
  '🏛️': Landmark,
  'landmark': Landmark,
  '📚': GraduationCap,
  'books': BookOpen,
  '⚖️': Scale,
  'justice': Scale,
  '👑': Crown,
  'crown': Crown,
  '🚆': Train,
  'train': Train,
  '🏦': Building2,
  'bank': Building2,

  // General Categories & Subjects
  '🇮🇳': Flag,
  'flag': Flag,
  '🌍': Earth,
  'earth': Earth,
  '🔬': Microscope,
  'microscope': Microscope,
  '🎯': Target,
  'target': Target,
  '🌐': Globe,
  'globe': Globe,
  '🔤': Languages,
  'languages': Languages,
  '📐': Calculator,
  'math': Calculator,
  '⚡': Zap,
  'zap': Zap,
  '🧪': FlaskConical,
  'chemistry': FlaskConical,
  '🧬': Dna,
  'biology': Dna,
  '📖': BookText,
  'hindi': BookText,
  '⚔️': Swords,
  'history': Swords,
  '🗺️': Map,
  'map': Map,
  '📜': ScrollText,
  'polity': ScrollText,
  '💻': Laptop,
  'computer': Laptop,
  '🧠': Brain,
  'reasoning': Brain,
  '📈': TrendingUp,
  'economy': TrendingUp,
  '📊': TrendingUp,
  '🧭': Compass,
  'compass': Compass,
  '📑': FileText,
  'file': FileText,

  // Rewards & Gamification
  '🎁': Gift,
  'gift': Gift,
  '💎': Gem,
  'gem': Gem,
  '❄️': Snowflake,
  'snowflake': Snowflake,
  '❤️': Heart,
  'heart': Heart,
  '🏆': Trophy,
  'trophy': Trophy,
  '📍': MapPin,
  'pin': Pin,
  '📌': Pin,
  '✨': Sparkles,
  'sparkles': Sparkles,
  '🔥': Flame,
  'flame': Flame,
  '⭐': Star,
  'star': Star,
  '🪙': Coins,
  'coins': Coins,
  '🛡️': ShieldCheck,
  'shield': ShieldCheck,
  '🎖️': Award,
  'award': Award,
};

const ICON_COLORS: Record<string, string> = {
  // Competitive Exams
  '🏛️': 'text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.3)]',
  'landmark': 'text-amber-400 drop-shadow-[0_1px_3px_rgba(251,191,36,0.3)]',
  '📚': 'text-cyan-300 drop-shadow-[0_1px_3px_rgba(103,232,249,0.3)]',
  'books': 'text-cyan-300 drop-shadow-[0_1px_3px_rgba(103,232,249,0.3)]',
  '⚖️': 'text-amber-300 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  'justice': 'text-amber-300 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  '👑': 'text-yellow-400 drop-shadow-[0_1px_3px_rgba(250,204,21,0.3)]',
  'crown': 'text-yellow-400 drop-shadow-[0_1px_3px_rgba(250,204,21,0.3)]',
  '🚆': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  'train': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  '🏦': 'text-indigo-300 drop-shadow-[0_1px_3px_rgba(165,180,252,0.3)]',
  'bank': 'text-indigo-300 drop-shadow-[0_1px_3px_rgba(165,180,252,0.3)]',

  // General Categories & Subjects
  '🇮🇳': 'text-orange-400 drop-shadow-[0_1px_3px_rgba(251,146,60,0.3)]',
  'flag': 'text-orange-400 drop-shadow-[0_1px_3px_rgba(251,146,60,0.3)]',
  '🌍': 'text-cyan-300 drop-shadow-[0_1px_3px_rgba(103,232,249,0.4)]',
  'earth': 'text-cyan-300 drop-shadow-[0_1px_3px_rgba(103,232,249,0.4)]',
  '🔬': 'text-teal-300 drop-shadow-[0_1px_3px_rgba(94,234,212,0.3)]',
  'microscope': 'text-teal-300 drop-shadow-[0_1px_3px_rgba(94,234,212,0.3)]',
  '🎯': 'text-rose-400 drop-shadow-[0_1px_3px_rgba(251,113,133,0.3)]',
  'target': 'text-rose-400 drop-shadow-[0_1px_3px_rgba(251,113,133,0.3)]',
  '🌐': 'text-sky-300 drop-shadow-[0_1px_3px_rgba(125,211,252,0.3)]',
  'globe': 'text-sky-300 drop-shadow-[0_1px_3px_rgba(125,211,252,0.3)]',
  '🔤': 'text-pink-300 drop-shadow-[0_1px_3px_rgba(249,168,212,0.3)]',
  'languages': 'text-pink-300 drop-shadow-[0_1px_3px_rgba(249,168,212,0.3)]',
  '📐': 'text-orange-400 drop-shadow-[0_1px_3px_rgba(251,146,60,0.3)]',
  'math': 'text-orange-400 drop-shadow-[0_1px_3px_rgba(251,146,60,0.3)]',
  '⚡': 'text-yellow-400 fill-yellow-400/40 drop-shadow-[0_1px_3px_rgba(250,204,21,0.4)]',
  'zap': 'text-yellow-400 fill-yellow-400/40 drop-shadow-[0_1px_3px_rgba(250,204,21,0.4)]',
  '🧪': 'text-lime-300 drop-shadow-[0_1px_3px_rgba(190,242,100,0.3)]',
  'chemistry': 'text-lime-300 drop-shadow-[0_1px_3px_rgba(190,242,100,0.3)]',
  '🧬': 'text-fuchsia-400 drop-shadow-[0_1px_3px_rgba(232,121,249,0.3)]',
  'biology': 'text-fuchsia-400 drop-shadow-[0_1px_3px_rgba(232,121,249,0.3)]',
  '📖': 'text-amber-300 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  'hindi': 'text-amber-300 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  '⚔️': 'text-rose-400 drop-shadow-[0_1px_3px_rgba(251,113,133,0.3)]',
  'history': 'text-rose-400 drop-shadow-[0_1px_3px_rgba(251,113,133,0.3)]',
  '🗺️': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  'map': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  '📜': 'text-yellow-300 drop-shadow-[0_1px_3px_rgba(253,224,71,0.3)]',
  'polity': 'text-yellow-300 drop-shadow-[0_1px_3px_rgba(253,224,71,0.3)]',
  '💻': 'text-sky-400 drop-shadow-[0_1px_3px_rgba(56,189,248,0.3)]',
  'computer': 'text-sky-400 drop-shadow-[0_1px_3px_rgba(56,189,248,0.3)]',
  '🧠': 'text-violet-400 drop-shadow-[0_1px_3px_rgba(167,139,250,0.3)]',
  'reasoning': 'text-violet-400 drop-shadow-[0_1px_3px_rgba(167,139,250,0.3)]',
  '📈': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  'economy': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  '📊': 'text-emerald-400 drop-shadow-[0_1px_3px_rgba(52,211,153,0.3)]',
  '🧭': 'text-sky-400 drop-shadow-[0_1px_3px_rgba(56,189,248,0.3)]',
  'compass': 'text-sky-400 drop-shadow-[0_1px_3px_rgba(56,189,248,0.3)]',
  '📑': 'text-indigo-300 drop-shadow-[0_1px_3px_rgba(165,180,252,0.3)]',
  'file': 'text-indigo-300 drop-shadow-[0_1px_3px_rgba(165,180,252,0.3)]',

  // Rewards & Gamification
  '🎁': 'text-amber-300 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  'gift': 'text-amber-300 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  '💎': 'text-cyan-300 fill-cyan-400/30 drop-shadow-[0_1px_3px_rgba(103,232,249,0.4)]',
  'gem': 'text-cyan-300 fill-cyan-400/30 drop-shadow-[0_1px_3px_rgba(103,232,249,0.4)]',
  '❄️': 'text-sky-300 drop-shadow-[0_1px_3px_rgba(125,211,252,0.3)]',
  'snowflake': 'text-sky-300 drop-shadow-[0_1px_3px_rgba(125,211,252,0.3)]',
  '❤️': 'text-rose-500 fill-rose-500/80 drop-shadow-[0_1px_3px_rgba(244,63,94,0.4)]',
  'heart': 'text-rose-500 fill-rose-500/80 drop-shadow-[0_1px_3px_rgba(244,63,94,0.4)]',
  '🏆': 'text-amber-300 fill-amber-400/30 drop-shadow-[0_1px_3px_rgba(252,211,77,0.4)]',
  'trophy': 'text-amber-300 fill-amber-400/30 drop-shadow-[0_1px_3px_rgba(252,211,77,0.4)]',
  '📍': 'text-rose-400 drop-shadow-[0_1px_3px_rgba(251,113,133,0.3)]',
  'pin': 'text-amber-400 fill-amber-400/50',
  '📌': 'text-amber-400 fill-amber-400/50',
  '✨': 'text-yellow-300 fill-yellow-400/40 drop-shadow-[0_1px_3px_rgba(253,224,71,0.4)]',
  'sparkles': 'text-yellow-300 fill-yellow-400/40 drop-shadow-[0_1px_3px_rgba(253,224,71,0.4)]',
  '🔥': 'text-amber-400 fill-orange-500/60 drop-shadow-[0_1px_3px_rgba(251,146,60,0.4)]',
  'flame': 'text-amber-400 fill-orange-500/60 drop-shadow-[0_1px_3px_rgba(251,146,60,0.4)]',
  '⭐': 'text-yellow-300 fill-yellow-400/50 drop-shadow-[0_1px_3px_rgba(253,224,71,0.4)]',
  'star': 'text-yellow-300 fill-yellow-400/50 drop-shadow-[0_1px_3px_rgba(253,224,71,0.4)]',
  '🪙': 'text-yellow-300 fill-amber-400/50 drop-shadow-[0_1px_3px_rgba(253,224,71,0.4)]',
  'coins': 'text-yellow-300 fill-amber-400/50 drop-shadow-[0_1px_3px_rgba(253,224,71,0.4)]',
  '🛡️': 'text-indigo-300 fill-indigo-400/30 drop-shadow-[0_1px_3px_rgba(165,180,252,0.3)]',
  'shield': 'text-indigo-300 fill-indigo-400/30 drop-shadow-[0_1px_3px_rgba(165,180,252,0.3)]',
  '🎖️': 'text-amber-300 fill-amber-400/30 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
  'award': 'text-amber-300 fill-amber-400/30 drop-shadow-[0_1px_3px_rgba(252,211,77,0.3)]',
};

export const AppIcon: React.FC<AppIconProps> = ({ icon = '', className = 'w-6 h-6', size }) => {
  if (!icon) return <HelpCircle className={`text-gray-400 ${className}`} size={size} />;

  const trimmed = icon.trim();
  const Component = ICON_MAP[trimmed] || ICON_MAP[trimmed.toLowerCase()];

  if (Component) {
    // If className has text-white or text-gray-*, ignore it in favor of vivid icon line colors
    const hasExplicitSpecialColor = /\btext-(?!white\b|gray-\d+)/.test(className);
    const colorStyle = hasExplicitSpecialColor
      ? ''
      : (ICON_COLORS[trimmed] || ICON_COLORS[trimmed.toLowerCase()] || 'text-amber-400');
    
    // Clean any unwanted text-white or text-gray-* that might dull the SVG stroke
    const cleanClassName = className
      .replace(/\btext-white\b/g, '')
      .replace(/\btext-gray-\d+\b/g, '')
      .trim();

    return <Component className={`${colorStyle} ${cleanClassName}`.trim()} size={size} />;
  }

  // Fallback for custom text / mascot
  return <span className="inline-flex items-center justify-center select-none text-xl leading-none">{icon}</span>;
};
