import { CATEGORIES_LIST } from '../lib/levelData';
import { ALL_SUBJECTS_LIST, type SubjectItem } from '../data/subjectsData';

export const DEFAULT_CATEGORY_IDS: [string, string, string, string] = [
  'india',
  'world',
  'subjects',
  'mix',
];

const PINNED_SUBJECTS_KEY = 'gkoo_pinned_custom_subjects';
const PINNED_WORLD_SUBJECTS_KEY = 'gkoo_pinned_world_subjects';
const PINNED_INDIA_SUBJECTS_KEY = 'gkoo_pinned_india_subjects';
export const PINNED_SUBJECTS_EVENT = 'gkoo_pinned_subjects_updated';

export interface DashboardSubjectCard {
  slotIndex: number;
  pinRank: number;
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

// Universal Subject Membership Sets
export const WORLD_SUBJECT_IDS = new Set([
  'sub_world_geography',
  'sub_world_history',
  'sub_international',
  'sub_space',
  'sub_facts',
  'sub_psychology',
  'sub_philosophy',
  'sub_gk',
  'sub_english',
  'sub_math',
  'sub_physics',
  'sub_chemistry',
  'sub_biology',
  'sub_hindi'
]);

export const INDIA_GS_SUBJECT_IDS = new Set([
  'sub_civics',
  'sub_history',
  'sub_geography',
  'sub_economics',
  'sub_reasoning',
  'sub_computer',
  'sub_art_culture',
  'sub_environment',
  'sub_physics',
  'sub_chemistry',
  'sub_biology',
  'sub_math',
  'sub_gk'
]);

export const DEFAULT_INDIA_PINNED_IDS: string[] = [
  'ssc',
  'ssc_chsl',
  'uppsc',
  'upsc',
  'rrb',
  'bank',
  'sub_gk',
  'sub_math',
  'sub_reasoning',
  'sub_english',
  'sub_hindi',
  'sub_history',
  'sub_geography',
  'sub_civics'
];

export const DEFAULT_WORLD_PINNED_IDS: string[] = [
  'sub_world_geography',
  'sub_world_history',
  'sub_international',
  'sub_space',
  'sub_facts',
  'sub_psychology',
  'sub_philosophy',
  'sub_gk',
  'sub_english',
  'sub_math',
  'sub_physics',
  'sub_chemistry',
  'sub_biology',
  'sub_hindi'
];

// Migration: Distribute legacy custom pinned subjects into world and india buckets
function ensureMigratedKeys() {
  try {
    const initialized14 = localStorage.getItem('gkoo_pinned_world_v3') === 'true';
    if (!initialized14) {
      localStorage.setItem(PINNED_INDIA_SUBJECTS_KEY, JSON.stringify(DEFAULT_INDIA_PINNED_IDS));
      localStorage.setItem(PINNED_WORLD_SUBJECTS_KEY, JSON.stringify(DEFAULT_WORLD_PINNED_IDS));
      localStorage.setItem('gkoo_pinned_world_v3', 'true');
      return;
    }

    const currentWorldRaw = localStorage.getItem(PINNED_WORLD_SUBJECTS_KEY);
    if (currentWorldRaw) {
      const parsed = JSON.parse(currentWorldRaw);
      if (Array.isArray(parsed) && (parsed.includes('sub_history') || parsed.includes('sub_geography'))) {
        const updated = parsed.map(id => {
          if (id === 'sub_history') return 'sub_world_history';
          if (id === 'sub_geography') return 'sub_world_geography';
          return id;
        });
        localStorage.setItem(PINNED_WORLD_SUBJECTS_KEY, JSON.stringify(updated));
      }
    }

    const hasWorld = localStorage.getItem(PINNED_WORLD_SUBJECTS_KEY) !== null;
    const hasIndia = localStorage.getItem(PINNED_INDIA_SUBJECTS_KEY) !== null;
    if (!hasWorld) {
      localStorage.setItem(PINNED_WORLD_SUBJECTS_KEY, JSON.stringify(DEFAULT_WORLD_PINNED_IDS));
    }
    if (!hasIndia) {
      localStorage.setItem(PINNED_INDIA_SUBJECTS_KEY, JSON.stringify(DEFAULT_INDIA_PINNED_IDS));
    }
  } catch {
    // Ignore storage errors
  }
}

// Get array of pinned subject IDs for a given mode or across all
export const getPinnedSubjectIds = (mode?: 'world' | 'india'): string[] => {
  ensureMigratedKeys();
  try {
    const isValidId = (id: string) =>
      ALL_SUBJECTS_LIST.some(s => s.id === id) ||
      CATEGORIES_LIST.some(c => c.id === id);

    if (mode === 'world') {
      const raw = localStorage.getItem(PINNED_WORLD_SUBJECTS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.filter(isValidId);
          }
        } catch {}
      }
      return DEFAULT_WORLD_PINNED_IDS;
    }
    if (mode === 'india') {
      const raw = localStorage.getItem(PINNED_INDIA_SUBJECTS_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.filter(isValidId);
          }
        } catch {}
      }
      return DEFAULT_INDIA_PINNED_IDS;
    }

    // Both modes combined
    const worldIds = getPinnedSubjectIds('world');
    const indiaIds = getPinnedSubjectIds('india');
    return Array.from(new Set([...worldIds, ...indiaIds]));
  } catch {
    return [];
  }
};

// Check if a subject is pinned in a specific mode (or any mode)
export const isSubjectPinned = (subjectId: string, mode?: 'world' | 'india'): boolean => {
  return getPinnedSubjectIds(mode).includes(subjectId);
};

// Get the pin rank of a subject in a specific mode (or any mode)
export const getSubjectPinRank = (subjectId: string, mode?: 'world' | 'india'): number => {
  const ids = getPinnedSubjectIds(mode);
  const idx = ids.indexOf(subjectId);
  return idx !== -1 ? idx + 1 : 0;
};

// Unpin a subject directly from a specific mode or all modes
export const unpinSubject = (subjectId: string, mode?: 'world' | 'india'): void => {
  ensureMigratedKeys();
  try {
    if (mode === 'world' || !mode) {
      const current = getPinnedSubjectIds('world');
      const updated = current.filter(id => id !== subjectId);
      localStorage.setItem(PINNED_WORLD_SUBJECTS_KEY, JSON.stringify(updated));
    }
    if (mode === 'india' || !mode) {
      const current = getPinnedSubjectIds('india');
      const updated = current.filter(id => id !== subjectId);
      localStorage.setItem(PINNED_INDIA_SUBJECTS_KEY, JSON.stringify(updated));
    }
    // Also keep legacy key synced for backward compatibility
    const legacy = getPinnedSubjectIds();
    localStorage.setItem(PINNED_SUBJECTS_KEY, JSON.stringify(legacy));

    window.dispatchEvent(new CustomEvent(PINNED_SUBJECTS_EVENT, { 
      detail: { subjectId, isPinned: false, mode } 
    }));
  } catch {
    // Ignore storage errors
  }
};

// Toggle pin for a subject under a specific mode
export const togglePinSubject = (subjectId: string, mode?: 'world' | 'india'): { isPinned: boolean; rank: number } => {
  ensureMigratedKeys();
  
  // Resolve mode if not provided
  let targetMode = mode;
  if (!targetMode) {
    if (WORLD_SUBJECT_IDS.has(subjectId) && !INDIA_GS_SUBJECT_IDS.has(subjectId)) {
      targetMode = 'world';
    } else if (INDIA_GS_SUBJECT_IDS.has(subjectId) && !WORLD_SUBJECT_IDS.has(subjectId)) {
      targetMode = 'india';
    } else if (CATEGORIES_LIST.some(c => c.id === subjectId && c.type === 'exam')) {
      targetMode = 'india';
    } else {
      try {
        targetMode = (localStorage.getItem('gkoo_dashboard_region_mode') as 'world' | 'india') || 'world';
      } catch {
        targetMode = 'world';
      }
    }
  }

  const storageKey = targetMode === 'world' ? PINNED_WORLD_SUBJECTS_KEY : PINNED_INDIA_SUBJECTS_KEY;
  const current = getPinnedSubjectIds(targetMode);
  let updated: string[];
  let isPinned = false;

  if (current.includes(subjectId)) {
    updated = current.filter(id => id !== subjectId);
    isPinned = false;
  } else {
    updated = [...current, subjectId];
    isPinned = true;
  }

  localStorage.setItem(storageKey, JSON.stringify(updated));
  // Keep legacy key updated
  const legacy = getPinnedSubjectIds();
  localStorage.setItem(PINNED_SUBJECTS_KEY, JSON.stringify(legacy));

  window.dispatchEvent(new CustomEvent(PINNED_SUBJECTS_EVENT, { 
    detail: { pinnedIds: updated, subjectId, isPinned, mode: targetMode } 
  }));

  const rank = updated.indexOf(subjectId) + 1;
  return { isPinned, rank: isPinned ? rank : 0 };
};

// Helper to resolve card presentation data
export const resolveSubjectCard = (id: string, slotIndex: number, pinRank: number): DashboardSubjectCard => {
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

// Helper to get resolved SubjectItem objects for pinned subjects in a mode
export const getPinnedSubjectItems = (mode: 'world' | 'india'): SubjectItem[] => {
  const ids = getPinnedSubjectIds(mode);
  return ids
    .map(id => {
      const sub = ALL_SUBJECTS_LIST.find(s => s.id === id);
      if (sub) return sub;
      const cat = CATEGORIES_LIST.find(c => c.id === id);
      if (cat) {
        return {
          id: cat.id,
          nameEn: cat.titleEn,
          nameHi: cat.titleHi,
          shortName: cat.titleEn,
          category: 'General',
          icon: cat.icon,
          gradient: cat.gradient,
          border3d: cat.border3d,
          badgeBg: cat.badgeBg,
          descEn: cat.descEn,
          descHi: cat.descHi,
          syllabusTopicEn: cat.descEn,
          syllabusTopicHi: cat.descHi,
          difficulty: 'medium' as const,
          badge: cat.badgeText || 'Core GK'
        };
      }
      return undefined;
    })
    .filter((s): s is SubjectItem => s !== undefined);
};

// Default standard 4 general categories for India mode Section 1
export const getStandardGeneralCards = (): DashboardSubjectCard[] => {
  return DEFAULT_CATEGORY_IDS.map((catId, idx) => resolveSubjectCard(catId, idx, 0));
};

// Legacy helper for DashboardSubjectCards
export const getDashboardSubjectCards = (): DashboardSubjectCard[] => {
  return getStandardGeneralCards();
};
