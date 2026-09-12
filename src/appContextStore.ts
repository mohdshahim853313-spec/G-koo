import { createContext } from 'react';

export type LangKey = 'en' | 'hi';
export type ThemeKey = 'light' | 'dark' | 'system';

export interface UserBadge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  unlocked: boolean;
  requiredXp?: number;
  requiredStreak?: number;
  requiredQuizzes?: number;
}

export interface Quest {
  id: string;
  titleKey: string;
  target: number;
  current: number;
  rewardGems: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
}

export interface UserStats {
  quizzesCompleted: number;
  totalAnswered: number;
  correctAnswers: number;
  bestCombo: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  joinedDate: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  joinedDate: string;
  xp: number;
  streak: number;
  gems: number;
  hearts: number;
  stats: UserStats;
  isGuest?: boolean;
}

export interface LevelRecord {
  completed: boolean;
  stars: number; // 0, 1, 2, 3
  highAccuracy: number; // percentage (0-100)
  bestScore: number;
}

export interface AppContextType {
  lang: LangKey;
  setLang: (lang: LangKey) => void;
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  xp: number;
  streak: number;
  addXp: (amount: number) => void;
  hearts: number;
  spendHeart: () => boolean;
  refillHearts: () => void;
  gems: number;
  addGems: (amount: number) => void;
  quests: Quest[];
  claimQuest: (questId: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  triggerTestNotification: () => Promise<boolean>;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  stats: UserStats;
  recordQuizResult: (answered: number, correct: number, bestCombo: number, gemsEarned?: number) => void;
  badges: UserBadge[];
  resetAllProgress: () => void;
  currentUser: UserAccount | null;
  isGuest: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signIn: (email: string, password?: string) => { success: boolean; message?: string };
  signUp: (name: string, email: string, password?: string, avatar?: string) => { success: boolean; message?: string };
  signInWithGoogle: (googleProfile: { id?: string; name: string; email: string; avatar?: string }) => { success: boolean; message?: string };
  signOut: () => void;
  // Level Progression System
  levelProgress: Record<number, LevelRecord>;
  completeLevel: (levelNum: number, accuracy: number, score: number) => { starsEarned: number; nextUnlocked: number };
  claimedChests: Record<string, boolean>;
  claimChest: (chestId: string, gems: number, xp: number) => void;
  totalStars: number;
  maxUnlockedLevel: number;
  // Category-specific Level Progression
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
  categoryLevelProgress: Record<string, Record<number, LevelRecord>>;
  getCategoryMaxUnlocked: (catId: string) => number;
  getCategoryTotalStars: (catId: string) => number;
  completeCategoryLevel: (catId: string, levelNum: number, accuracy: number, score: number) => { starsEarned: number; nextUnlocked: number };
}


export const AppContext = createContext<AppContextType | null>(null);



