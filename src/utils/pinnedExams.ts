import { ALL_INDIA_STATES, type StateData, type StateExamItem } from '../data/stateExamsData';

const PINNED_STATES_KEY = 'gkoo_pinned_states';
const PINNED_EXAMS_KEY = 'gkoo_pinned_exams';
export const PIN_EVENT_NAME = 'gkoo_pinned_updated';

// Helper to get pinned state IDs
export const getPinnedStateIds = (): string[] => {
  try {
    const raw = localStorage.getItem(PINNED_STATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// Helper to get pinned exam IDs
export const getPinnedExamIds = (): string[] => {
  try {
    const raw = localStorage.getItem(PINNED_EXAMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isStatePinned = (stateId: string): boolean => {
  return getPinnedStateIds().includes(stateId);
};

export const isExamPinned = (examId: string): boolean => {
  return getPinnedExamIds().includes(examId);
};

export const togglePinState = (stateId: string): boolean => {
  const current = getPinnedStateIds();
  let updated: string[];
  let isNowPinned = false;

  if (current.includes(stateId)) {
    updated = current.filter(id => id !== stateId);
    isNowPinned = false;
  } else {
    updated = [stateId, ...current];
    isNowPinned = true;
  }

  localStorage.setItem(PINNED_STATES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PIN_EVENT_NAME, { detail: { type: 'state', id: stateId, pinned: isNowPinned } }));
  return isNowPinned;
};

export const togglePinExam = (examId: string): boolean => {
  const current = getPinnedExamIds();
  let updated: string[];
  let isNowPinned = false;

  if (current.includes(examId)) {
    updated = current.filter(id => id !== examId);
    isNowPinned = false;
  } else {
    updated = [examId, ...current];
    isNowPinned = true;
  }

  localStorage.setItem(PINNED_EXAMS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(PIN_EVENT_NAME, { detail: { type: 'exam', id: examId, pinned: isNowPinned } }));
  return isNowPinned;
};

// Helper to resolve pinned states full objects
export const getPinnedStatesData = (): StateData[] => {
  const ids = getPinnedStateIds();
  return ids
    .map(id => ALL_INDIA_STATES.find(s => s.id === id))
    .filter((s): s is StateData => Boolean(s));
};

export interface PinnedExamWithState {
  exam: StateExamItem;
  state: StateData;
}

// Helper to resolve pinned exams full objects with parent state
export const getPinnedExamsData = (): PinnedExamWithState[] => {
  const ids = getPinnedExamIds();
  const results: PinnedExamWithState[] = [];

  for (const examId of ids) {
    for (const st of ALL_INDIA_STATES) {
      const foundExam = st.exams.find(e => e.id === examId);
      if (foundExam) {
        results.push({
          exam: foundExam,
          state: st,
        });
        break;
      }
    }
  }

  return results;
};
