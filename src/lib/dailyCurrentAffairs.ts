export interface DailyCaMilestone {
  completedCount: number;
  nextTarget: number;
  currentTitleEn: string;
  currentTitleHi: string;
  nextTitleEn: string;
  nextTitleHi: string;
  badge: string;
  congratsEn: string;
  congratsHi: string;
  nextPromptEn: string;
  nextPromptHi: string;
}

const DAILY_CA_KEY = 'gkoo_daily_ca_progress_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyCaCount(): number {
  try {
    const raw = localStorage.getItem(DAILY_CA_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const today = getTodayDateString();
    if (parsed.date === today) {
      return typeof parsed.count === 'number' ? parsed.count : 0;
    }
    // New day reset
    return 0;
  } catch {
    return 0;
  }
}

export function addDailyCaCompleted(amount: number = 10): number {
  try {
    const today = getTodayDateString();
    const current = getDailyCaCount();
    const updated = current + amount;
    localStorage.setItem(DAILY_CA_KEY, JSON.stringify({ date: today, count: updated }));
    window.dispatchEvent(new CustomEvent('gkoo_daily_ca_updated', { detail: { count: updated } }));
    return updated;
  } catch {
    return amount;
  }
}

export function getDailyCaMilestone(count: number): DailyCaMilestone {
  const nextTarget = count + 10;
  
  if (count <= 10) {
    return {
      completedCount: count,
      nextTarget,
      currentTitleEn: 'Daily News Explorer',
      currentTitleHi: 'दैनिक समाचार अन्वेषक',
      nextTitleEn: 'Current Affairs Specialist',
      nextTitleHi: 'करेंट अफेयर्स विशेषज्ञ',
      badge: '📰',
      congratsEn: 'Great Start! You have completed 10 Current Affairs today! 🎉',
      congratsHi: 'शानदार शुरुआत! आपने आज 10 करेंट अफेयर्स पूरे कर लिए हैं! 🎉',
      nextPromptEn: "Continue 10 more to achieve 'Current Affairs Specialist' title! 🚀",
      nextPromptHi: "'करेंट अफेयर्स विशेषज्ञ' का खिताब पाने के लिए 10 और हल करें! 🚀",
    };
  }

  if (count <= 20) {
    return {
      completedCount: count,
      nextTarget,
      currentTitleEn: 'Current Affairs Specialist',
      currentTitleHi: 'करेंट अफेयर्स विशेषज्ञ',
      nextTitleEn: 'National Affairs Master',
      nextTitleHi: 'राष्ट्रीय मामलों के मास्टर',
      badge: '🔥',
      congratsEn: 'Awesome! You have completed 20 Current Affairs today! 🌟',
      congratsHi: 'अद्भुत! आपने आज 20 करेंट अफेयर्स पूरे कर लिए हैं! 🌟',
      nextPromptEn: "Try 10 more to achieve 'National Affairs Master' title! 🏆",
      nextPromptHi: "'राष्ट्रीय मामलों के मास्टर' बनने के लिए 10 और सवाल हल करें! 🏆",
    };
  }

  if (count <= 30) {
    return {
      completedCount: count,
      nextTarget,
      currentTitleEn: 'National Affairs Master',
      currentTitleHi: 'राष्ट्रीय मामलों के मास्टर',
      nextTitleEn: 'Top National Analyst',
      nextTitleHi: 'शीर्ष राष्ट्रीय विश्लेषक',
      badge: '🏆',
      congratsEn: 'Woow! You have completed 30 Current Affairs today! 🏆',
      congratsHi: 'वाह! आज आपने 30 करेंट अफेयर्स पूरे कर लिए हैं! 🏆',
      nextPromptEn: "Try 10 more to achieve 'Top National Analyst' title! ✨",
      nextPromptHi: "'शीर्ष राष्ट्रीय विश्लेषक' का पद पाने के लिए 10 और सवाल हल करें! ✨",
    };
  }

  if (count <= 40) {
    return {
      completedCount: count,
      nextTarget,
      currentTitleEn: 'Top National Analyst',
      currentTitleHi: 'शीर्ष राष्ट्रीय विश्लेषक',
      nextTitleEn: 'Daily CA Champion',
      nextTitleHi: 'दैनिक सीए चैंपियन',
      badge: '⚡',
      congratsEn: 'Sensational! You have completed 40 Current Affairs today! ⚡',
      congratsHi: 'अविश्वसनीय! आपने आज 40 करेंट अफेयर्स पूरे कर लिए हैं! ⚡',
      nextPromptEn: "Try 10 more to achieve 'Daily CA Champion' title! 🥇",
      nextPromptHi: "'दैनिक सीए चैंपियन' बनने के लिए 10 और सवाल हल करें! 🥇",
    };
  }

  if (count <= 50) {
    return {
      completedCount: count,
      nextTarget,
      currentTitleEn: 'Daily CA Champion',
      currentTitleHi: 'दैनिक सीए चैंपियन',
      nextTitleEn: 'Current Affairs Titan',
      nextTitleHi: 'करेंट अफेयर्स टाइटैन',
      badge: '👑',
      congratsEn: 'Legendary! You have completed 50 Current Affairs today! 👑',
      congratsHi: 'ऐतिहासिक! आपने आज 50 करेंट अफेयर्स पूरे कर लिए हैं! 👑',
      nextPromptEn: "Try 10 more to achieve 'Current Affairs Titan' title! 🌟",
      nextPromptHi: "'करेंट अफेयर्स टाइटैन' बनने के लिए 10 और सवाल हल करें! 🌟",
    };
  }

  return {
    completedCount: count,
    nextTarget,
    currentTitleEn: 'Unstoppable Titan',
    currentTitleHi: 'अजेय टाइटैन',
    nextTitleEn: `Record Breaker (${nextTarget} Qs)`,
    nextTitleHi: `रिकॉर्ड ब्रेकर (${nextTarget} प्रश्न)`,
    badge: '🚀',
    congratsEn: `Unstoppable! You have completed ${count} Current Affairs today! 🚀`,
    congratsHi: `अजेय प्रदर्शन! आज आपने ${count} करेंट अफेयर्स पूरे कर लिए हैं! 🚀`,
    nextPromptEn: `Try 10 more to set a new daily record of ${nextTarget}! 🔥`,
    nextPromptHi: `${nextTarget} का नया दैनिक रिकॉर्ड बनाने के लिए 10 और हल करें! 🔥`,
  };
}
