import { CATEGORIES_LIST } from '../lib/levelData';
import { ALL_SUBJECTS_LIST } from '../data/subjectsData';

export const DEFAULT_CATEGORY_IDS: [string, string, string, string] = [
  'india',
  'world',
  'subjects',
  'mix',
];

const PINNED_SUBJECTS_KEY = 'gkoo_pinned_custom_subjects';
export const PINNED_SUBJECTS_EVENT = 'gkoo_pinned_subjects_updated';

export interface DashboardSubjectCard {
  slotIndex: number;
  pinRank: number; // 1, 2, 3, 4 if custom pinned, 0 if default
  id: string;
  isCustomSubject: boolean;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: string;
  gradient: string;
  border3d: string;
  activeBorder: string;
  badgeBg: string;
  badgeText: string;
  syllabusTopicEn?: string;
  syllabusTopicHi?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

// Get the array of custom pinned subject IDs (max 4, verified against ALL_SUBJECTS_LIST)
export const getPinnedSubjectIds = (): string[] => {
  try {
    const raw = localStorage.getItem(PINNED_SUBJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(id => ALL_SUBJECTS_LIST.some(s => s.id === id)).slice(0, 4);
      }
    }
  } catch {
    // ignore
  }
  return [];
};

// Check if a subject is pinned
export const isSubjectPinned = (subjectId: string): boolean => {
  return getPinnedSubjectIds().includes(subjectId);
};

// Get the pin rank of a subject: 1 for 1st pin, 2 for 2nd, 3 for 3rd, 4 for 4th, 0 if not pinned
export const getSubjectPinRank = (subjectId: string): number => {
  const ids = getPinnedSubjectIds();
  const idx = ids.indexOf(subjectId);
  return idx !== -1 ? idx + 1 : 0;
};

// Unpin a subject directly
export const unpinSubject = (subjectId: string): void => {
  const current = getPinnedSubjectIds();
  const updated = current.filter(id => id !== subjectId);
  localStorage.setItem(PINNED_SUBJECTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PINNED_SUBJECTS_EVENT, { detail: { pinnedIds: updated, subjectId, isPinned: false } }));
};

// Reset all pinned subjects to default
export const resetPinnedSubjects = (): void => {
  localStorage.setItem(PINNED_SUBJECTS_KEY, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent(PINNED_SUBJECTS_EVENT, { detail: { pinnedIds: [], isPinned: false } }));
};

// Toggle pin: automatically assigns 1st, 2nd, 3rd, 4th slot
export const togglePinSubject = (subjectId: string): { isPinned: boolean; rank: number } => {
  const current = getPinnedSubjectIds();
  let updated: string[];
  let isPinned = false;

  if (current.includes(subjectId)) {
    // Unpin and shift remaining
    updated = current.filter(id => id !== subjectId);
    isPinned = false;
  } else {
    // If already 4 pinned, replace the 4th (or push to end)
    if (current.length >= 4) {
      updated = [...current.slice(0, 3), subjectId];
    } else {
      updated = [...current, subjectId];
    }
    isPinned = true;
  }

  localStorage.setItem(PINNED_SUBJECTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PINNED_SUBJECTS_EVENT, { detail: { pinnedIds: updated, subjectId, isPinned } }));
  const rank = updated.indexOf(subjectId) + 1;
  return { isPinned, rank: isPinned ? rank : 0 };
};

// Helper to resolve card presentation data
export const resolveSubjectCard = (id: string, slotIndex: number, pinRank: number): DashboardSubjectCard => {
  // 1. Check if ID matches a Subject in ALL_SUBJECTS_LIST
  const sub = ALL_SUBJECTS_LIST.find(s => s.id === id);
  if (sub) {
    return {
      slotIndex,
      pinRank,
      id: sub.id,
      isCustomSubject: true,
      titleEn: sub.nameEn,
      titleHi: sub.nameHi,
      descEn: sub.descEn,
      descHi: sub.descHi,
      icon: sub.icon,
      gradient: sub.gradient,
      border3d: sub.border3d,
      activeBorder: 'active:border-b-[2px]',
      badgeBg: sub.badgeBg,
      badgeText: sub.badge,
      syllabusTopicEn: sub.syllabusTopicEn,
      syllabusTopicHi: sub.syllabusTopicHi,
      difficulty: sub.difficulty,
    };
  }

  // 2. Check if ID matches a General Category in CATEGORIES_LIST
  const cat = CATEGORIES_LIST.find(c => c.id === id) || CATEGORIES_LIST.find(c => c.id === DEFAULT_CATEGORY_IDS[slotIndex]) || CATEGORIES_LIST[0];
  return {
    slotIndex,
    pinRank,
    id: cat.id,
    isCustomSubject: false,
    titleEn: cat.titleEn,
    titleHi: cat.titleHi,
    descEn: cat.descEn,
    descHi: cat.descHi,
    icon: cat.icon,
    gradient: cat.gradient,
    border3d: cat.border3d,
    activeBorder: cat.activeBorder,
    badgeBg: cat.badgeBg,
    badgeText: cat.badgeText,
  };
};

// Helper to get all 4 resolved cards for Dashboard
// Slot 0..3 will be filled by pinned subjects first (1st pin -> Slot 0, 2nd pin -> Slot 1, etc.),
// and the remaining slots will be filled with default categories!
export const getDashboardSubjectCards = (): DashboardSubjectCard[] => {
  const pinnedIds = getPinnedSubjectIds();
  const cards: DashboardSubjectCard[] = [];

  for (let i = 0; i < 4; i++) {
    if (i < pinnedIds.length) {
      cards.push(resolveSubjectCard(pinnedIds[i], i, i + 1));
    } else {
      cards.push(resolveSubjectCard(DEFAULT_CATEGORY_IDS[i], i, 0));
    }
  }

  return cards;
};
