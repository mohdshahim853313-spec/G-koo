import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Music, Trophy, Star, Volume2, VolumeX } from 'lucide-react';
import { GkooBirdSvg, type MascotMood } from './Mascot';
import { triggerHaptic, speakText, stopSpeech } from '../lib/audio';
import { useAppContext } from '../useAppContext';

export type CompanionPanel = 'dashboard' | 'leaderboard' | 'profile' | 'settings' | 'quiz';

interface GkooCompanionCardProps {
  panel: CompanionPanel;
  className?: string;
  defaultMood?: MascotMood;
  customMessageHi?: string;
  customMessageEn?: string;
  customTitleHi?: string;
  customTitleEn?: string;
  customButtonTextHi?: string;
  customButtonTextEn?: string;
  customButtonAction?: () => void;
  customMood?: MascotMood;
}

interface DialogOption {
  mood: MascotMood;
  textEn: string;
  textHi: string;
  particle: string;
}

const PANEL_DATA: Record<
  CompanionPanel,
  {
    titleEn: string;
    titleHi: string;
    buttonTextEn: string;
    buttonTextHi: string;
    buttonIcon: React.ElementType;
    buttonGradient: string;
    borderTheme: string;
    dialogs: DialogOption[];
  }
> = {
  dashboard: {
    titleEn: 'Gkoo Study Buddy',
    titleHi: 'Gkoo स्टडी बडी',
    buttonTextEn: '✨ + Practice Test',
    buttonTextHi: '✨ + नया प्रैक्टिस टेस्ट',
    buttonIcon: Sparkles,
    buttonGradient: 'from-purple-600 via-indigo-600 to-violet-700',
    borderTheme: 'border-purple-200 dark:border-purple-900/60',
    dialogs: [
      // Morning / High Energy slots
      { mood: 'waving', textEn: 'Good morning champ! 10 minutes of daily practice keeps you ahead! ☀️', textHi: 'सुप्रभात चैंपियन! रोज़ाना 10 मिनट का अभ्यास आपको सबसे आगे रखेगा! ☀️', particle: '👋' },
      { mood: 'wing_stretch', textEn: 'Stretching wings wide! Fresh day, fresh focus and unstoppable energy! 🌅', textHi: 'अंगड़ाई लेकर तैयार! नया दिन, नया संकल्प और जबरदस्त ऊर्जा! 🌅', particle: '💨' },
      { mood: 'fire', textEn: 'Your daily study streak is blazing hot! Keep the momentum burning! 🔥', textHi: 'आपकी डेली स्टडी स्ट्रीक आग की तरह चमक रही है! रफ्तार बनाए रखो! 🔥', particle: '🔥' },
      { mood: 'looking_around', textEn: 'Exploring new topics! General knowledge is your biggest strength! 🌍', textHi: 'हर विषय को समझो! सामान्य ज्ञान ही आपकी सबसे बड़ी ताकत है! 🌍', particle: '👀' },
      { mood: 'head_tilt', textEn: 'Curious minds master tough concepts. Keep asking why and how! ❓', textHi: 'जिज्ञासु दिमाग हर कठिन सवाल का हल ढूंढ लेता है! नया सीखते रहो! ❓', particle: '❓' },
      { mood: 'ninja', textEn: 'Focus like a master! Eliminate wrong options with precision! 🥷', textHi: 'पूरे ध्यान से पढ़ो! गलत विकल्पों को तुरंत पहचान कर सही चुनो! 🥷', particle: '⚡' },
      { mood: 'hop', textEn: 'Hop, hop! Small daily steps build massive exam readiness! ⚡', textHi: 'फुदकते रहो! रोज़ाना के छोटे कदम ही बड़ी परीक्षा में जीत दिलाते हैं! ⚡', particle: '⚡' },
      { mood: 'preening', textEn: 'Sharpening memory every day! Consistent revision makes you brilliant! 🫧', textHi: 'याददाश्त रोज़ तेज़ हो रही है! नियमित रिवीजन से सब कुछ पक्का होता है! 🫧', particle: '🫧' },
      { mood: 'excited', textEn: 'Aiming for a personal best today? Let’s conquer the lesson! 🚀', textHi: 'आज एक नया रिकॉर्ड बनाने के लिए तैयार हो? चलो शुरू करें! 🚀', particle: '⭐' },
      { mood: 'eating', textEn: 'Fueling up with knowledge gems! Complete practice sets to level up! 💎', textHi: 'ज्ञान के जेम्स कलेक्ट करो! हर प्रैक्टिस सेट आपकी रैंक मजबूत करता है! 💎', particle: '💎' },
      { mood: 'celebrate', textEn: 'Celebration time! Every correct answer brings you closer to selection! 🎉', textHi: 'पार्टी का समय! हर सही उत्तर आपको आपकी मंजिल के करीब ले जाता है! 🎉', particle: '🎉' },
      { mood: 'thinking', textEn: 'Think with clarity! Deep concept learning beats rote memorization! 💡', textHi: 'तर्क के साथ सोचो! गहराई से समझा हुआ ज्ञान हमेशा काम आता है! 💡', particle: '💡' },
      { mood: 'happy', textEn: 'Your brain is getting stronger and sharper with every practice session! 💪', textHi: 'आपका दिमाग हर प्रैक्टिस सेशन के साथ और भी तेज़ हो रहा है! 💪', particle: '💖' },
      { mood: 'love', textEn: 'Believe in your journey! You know far more than you give yourself credit for! ✨', textHi: 'अपनी मेहनत पर विश्वास रखो! आप जितना सोचते हो उससे कहीं आगे हो! ✨', particle: '💕' },
      { mood: 'dance', textEn: 'Grooving with confidence! Learning is exciting when you stay curious! 🕺', textHi: 'उत्साह से भरपूर रहो! जब मन लगाकर पढ़ो तो हर सवाल आसान लगता है! 🕺', particle: '🎵' },
      // Afternoon / Evening / Review slots
      { mood: 'scratching', textEn: 'Warming up the brain! Today’s hard work will pay off tomorrow! 🪶', textHi: 'दिमाग को वार्म अप करो! आज की मेहनत कल का सुनहरा परिणाम बनेगी! 🪶', particle: '🪶' },
      { mood: 'waving', textEn: 'Evening review time! Let’s solidify what you learned today! 🌙', textHi: 'शाम का रिवीजन समय! आज जो पढ़ा उसे पक्का कर लेते हैं! 🌙', particle: '🌙' },
      { mood: 'fire', textEn: 'Discipline beats motivation. Showing up daily is the champion mindset! 🏆', textHi: 'अनुशासन ही सबसे बड़ी कुंजी है। रोज़ अभ्यास करना ही असली जीत है! 🏆', particle: '🏆' },
      { mood: 'thinking', textEn: 'Analyze mistakes calmly. Every wrong answer teaches a lasting lesson! 🧠', textHi: 'गलतियों से मत घबराओ। हर गलती एक नया सबक सिखा कर जाती है! 🧠', particle: '🌟' },
      { mood: 'hop', textEn: 'Bouncing with high spirits! Consistency is building your dream future! 🌟', textHi: 'ऊंचे हौसलों के साथ आगे बढ़ो! आपकी निरंतरता ही भविष्य संवार रही है! 🌟', particle: '🌟' },
      { mood: 'ninja', textEn: 'Steady hands and sharp eyes! Strike the target score! 🎯', textHi: 'स्थिर मन और पैनी नज़र! अपने लक्ष्य पर बिल्कुल सटीक निशाना साधो! 🎯', particle: '🎯' },
      { mood: 'celebrate', textEn: 'Terrific effort today! Every milestone deserves a round of applause! 👑', textHi: 'शानदार प्रयास! हर पड़ाव पार करने पर खुद की पीठ थपथपाओ! 👑', particle: '👑' },
      { mood: 'happy', textEn: 'A calm and peaceful mind absorbs facts like a sponge! 🌸', textHi: 'शांत और प्रसन्न मन हर तथ्य को बहुत जल्दी याद कर लेता है! 🌸', particle: '🌸' },
      { mood: 'love', textEn: 'Gkoo is right here by your side cheering for every step you take! 💖', textHi: 'Gkoo हर कदम पर आपके साथ है और आपका हौसला बढ़ा रहा है! 💖', particle: '❤️' },
      { mood: 'wing_stretch', textEn: 'Take a quick deep breath, drink water, and keep moving forward! 💧', textHi: 'एक गहरी सांस लो, पानी पियो और पूरे जोश के साथ आगे बढ़ते रहो! 💧', particle: '💧' },
      { mood: 'preening', textEn: 'Polishing your revision strategy! Toppers review daily! 📚', textHi: 'अपनी रिवीजन रणनीति मजबूत रखो! टॉपर्स हमेशा रोज़ दोहराते हैं! 📚', particle: '📚' },
      { mood: 'looking_around', textEn: 'Look how far you’ve come since day one! Be proud of your growth! 📈', textHi: 'देखो पहले दिन से अब तक आप कितना आगे आ चुके हो! गर्व करो! 📈', particle: '🍀' },
      { mood: 'sleeping', textEn: 'Rest well tonight! A refreshed brain works wonders tomorrow! 🌙', textHi: 'अच्छी और सुकून भरी नींद लो! कल सुबह दिमाग फिर तरोताजा मिलेगा! 🌙', particle: '💤' },
    ],
  },
  leaderboard: {
    titleEn: 'Gkoo League Coach',
    titleHi: 'Gkoo लीग कोच',
    buttonTextEn: '🏆 Victory Hype',
    buttonTextHi: '🏆 विक्ट्री हाइप',
    buttonIcon: Trophy,
    buttonGradient: 'from-amber-500 via-orange-500 to-amber-600',
    borderTheme: 'border-amber-200 dark:border-amber-800/60',
    dialogs: [
      { mood: 'celebrate', textEn: 'Top podium rank is waiting for you! Show your power! 👑', textHi: 'टॉप पोडियम आपका इंतजार कर रहा है! अपना दम दिखाओ! 👑', particle: '👑' },
      { mood: 'fire', textEn: 'Challengers are pushing, but you are unstoppable! 🔥', textHi: 'प्रतियोगी आगे बढ़ रहे हैं, लेकिन आप अजेय हैं! 🔥', particle: '🔥' },
      { mood: 'ninja', textEn: 'Climb the leaderboard with steady precision! +50 XP bonus! 🥷', textHi: 'लीडरबोर्ड पर मजबूती से आगे बढ़ो! +50 XP बोनस हासिल करो! 🥷', particle: '⚡' },
      { mood: 'dance', textEn: 'Victory groove ready! Win this league season! 🕺', textHi: 'विक्ट्री डांस तैयार है! यह लीग सीजन जीतकर दिखाओ! 🕺', particle: '🏆' },
      { mood: 'excited', textEn: 'Climb the ranks! Every completed test gives you precious XP! 📈', textHi: 'रैंकिंग में ऊपर चढ़ो! हर पूरा किया गया टेस्ट कीमती XP देता है! 📈', particle: '🚀' },
      { mood: 'thinking', textEn: 'Champions aren’t born, they practice daily with Gkoo! 🥇', textHi: 'चैंपियन पैदा नहीं होते, वो रोज़ अभ्यास से तैयार होते हैं! 🥇', particle: '🌟' },
      { mood: 'love', textEn: 'The higher you aim, the brighter you shine! ✨', textHi: 'जितना बड़ा लक्ष्य, उतनी ही चमकदार सफलता! ✨', particle: '💎' },
      { mood: 'fire', textEn: 'Maintain your lead! Don’t let anyone break your stride! 🛡️', textHi: 'अपनी बढ़त बनाए रखो! किसी को आगे मत निकलने दो! 🛡️', particle: '🔥' },
      { mood: 'celebrate', textEn: 'Crown looks great on you! Defend your top spot! 👑', textHi: 'ताज आप पर बहुत जचता है! अपने शीर्ष स्थान की रक्षा करो! 👑', particle: '👑' },
      { mood: 'hop', textEn: 'Consistency always wins the league in the long run! ⚡', textHi: 'लगातार लगे रहने वाला ही आखिर में लीग जीतता है! ⚡', particle: '⚡' },
      { mood: 'ninja', textEn: 'True power lies in persistence! Score more XP! ⚡', textHi: 'असली ताकत लगातार डटे रहने में है! और XP स्कोर करो! ⚡', particle: '💨' },
      { mood: 'excited', textEn: 'League promotion is just a few perfect tests away! 🚀', textHi: 'लीग प्रमोशन बस कुछ परफेक्ट टेस्ट्स की दूरी पर है! 🚀', particle: '🏆' },
      { mood: 'happy', textEn: 'You have the speed, focus and knowledge to rule! 🦁', textHi: 'आपके पास टॉप पर रहने की स्पीड, फोकस और ज्ञान है! 🦁', particle: '⭐' },
    ],
  },
  profile: {
    titleEn: 'Gkoo Best Friend',
    titleHi: 'Gkoo पक्का दोस्त',
    buttonTextEn: '💖 Pet Gkoo',
    buttonTextHi: '💖 Gkoo से प्यार करो',
    buttonIcon: Heart,
    buttonGradient: 'from-pink-500 via-rose-500 to-red-500',
    borderTheme: 'border-pink-200 dark:border-pink-900/60',
    dialogs: [
      { mood: 'love', textEn: 'Gkoo loves learning with you! Best study buddies forever! 💖', textHi: 'Gkoo को आपके साथ पढ़ना बहुत पसंद है! पक्के दोस्त! 💖', particle: '❤️' },
      { mood: 'sleeping', textEn: 'Zzz... Rest well to keep your brain fresh and sharp! 🌙', textHi: 'ज़ू... अच्छी नींद लो ताकि दिमाग हमेशा तेज़ रहे! 🌙', particle: '💤' },
      { mood: 'waving', textEn: 'Hello champion! Look at your amazing badges and progress! 👋', textHi: 'नमस्ते चैंपियन! अपने शानदार बैज और प्रगति देखो! 👋', particle: '✨' },
      { mood: 'eating', textEn: 'Sharing secret energy gems with you for today’s practice! 💎', textHi: 'आज की पढ़ाई के लिए सीक्रेट एनर्जी वाले जेम्स शेयर कर रहा हूँ! 💎', particle: '💎' },
      { mood: 'excited', textEn: 'You are leveling up so fast! Proud of your dedication! 🌟', textHi: 'आप बहुत तेजी से आगे बढ़ रहे हो! आपकी मेहनत पर गर्व है! 🌟', particle: '🌟' },
      { mood: 'love', textEn: 'Every day spent learning with you is pure joy! 🌈', textHi: 'आपके साथ सीखने में बिताया हर दिन बहुत सुखद होता है! 🌈', particle: '💖' },
      { mood: 'waving', textEn: 'Your dedication inspires Gkoo to fly higher! 🕊️', textHi: 'आपकी मेहनत Gkoo को भी ऊंची उड़ान भरने की प्रेरणा देती है! 🕊️', particle: '🍀' },
      { mood: 'happy', textEn: 'Treat yourself to cool perks in the shop with your gems! 🎁', textHi: 'शॉप में जाकर अपने जेम्स से शानदार रिवार्ड्स अनलॉक करो! 🎁', particle: '💎' },
      { mood: 'celebrate', textEn: 'Smart, focused and hardworking—you are on the winning track! 🌟', textHi: 'होशियार, एकाग्र और मेहनती—आप बिल्कुल सही रास्ते पर हो! 🌟', particle: '⭐' },
      { mood: 'love', textEn: 'Let’s keep this friendship and streak going strong! 🤝', textHi: 'यह दोस्ती और सीखने का सिलसिला हमेशा ऐसे ही चलता रहे! 🤝', particle: '❤️' },
      { mood: 'excited', textEn: 'A fresh mind discovers wonders! Stay awesome! ✨', textHi: 'एक तरोताजा दिमाग चमत्कारों की खोज करता है! हमेशा खुश रहो! ✨', particle: '💫' },
      { mood: 'celebrate', textEn: 'High five! We make the ultimate dream team! ✋', textHi: 'हाई फाइव! हमारी और आपकी जोड़ी सचमुच लाजवाब है! ✋', particle: '🎉' },
    ],
  },
  settings: {
    titleEn: 'DJ Gkoo Audio Lab',
    titleHi: 'DJ Gkoo ऑडियो लैब',
    buttonTextEn: '🎧 DJ Beat Mode',
    buttonTextHi: '🎧 DJ बीट मोड',
    buttonIcon: Music,
    buttonGradient: 'from-purple-600 via-indigo-600 to-violet-600',
    borderTheme: 'border-purple-200 dark:border-purple-800/60',
    dialogs: [
      { mood: 'dance', textEn: 'DJ Gkoo drop the bass! Gentle Harp & Chime are tuned! 🎧', textHi: 'DJ Gkoo इन द हाउस! जेंटल हार्प और चाइम धुन सेट हैं! 🎧', particle: '🎵' },
      { mood: 'thinking', textEn: 'Optimizing your brain settings for maximum focus... 🧠', textHi: 'अधिकतम फोकस के लिए आपके माइंड सेटिंग्स ट्यून हो रही हैं... 🧠', particle: '💡' },
      { mood: 'ninja', textEn: 'Stealth night theme activated! Eyes protected! 🕶️', textHi: 'निंजा डार्क मोड एक्टिवेटेड! आँखें सुरक्षित और कूल! 🕶️', particle: '🌙' },
      { mood: 'happy', textEn: 'All systems customized to your style! Perfect! ✨', textHi: 'सभी सेटिंग्स आपके मनमुताबिक सेट हो चुकी हैं! परफेक्ट! ✨', particle: '✨' },
      { mood: 'excited', textEn: 'Feel free to test custom sounds anytime you want! 🔔', textHi: 'जब मन करे तब अपने पसंदीदा साउंड इफेक्ट्स टेस्ट करो! 🔔', particle: '🎶' },
      { mood: 'happy', textEn: 'Haptic feedback calibrated for tactile clicks! ⚡', textHi: 'टच और हैप्टिक फीडबैक एकदम स्मूथ सेट कर दिया गया है! ⚡', particle: '⚡' },
      { mood: 'waving', textEn: 'English or Hindi, learn comfortably at your own pace! 🌐', textHi: 'हिंदी हो या इंग्लिश, अपनी भाषा में आसानी से सीखें! 🌐', particle: '🌍' },
      { mood: 'thinking', textEn: 'Your preferences are saved and synced locally! 🔒', textHi: 'आपकी सभी पसंदीदा सेटिंग्स सुरक्षित सेव हो चुकी हैं! 🔒', particle: '🛡️' },
      { mood: 'love', textEn: 'Smooth animations keep your experience fun and engaging! 🎨', textHi: 'स्मूथ एनिमेशन्स आपके अनुभव को बेहद सुखद बनाते हैं! 🎨', particle: '💖' },
      { mood: 'celebrate', textEn: 'Fine-tuned to perfection for ultimate learning comfort! 🛠️', textHi: 'पढ़ाई के बेहतरीन आराम के लिए सब कुछ परफेक्ट ट्यून है! 🛠️', particle: '✨' },
    ],
  },
  quiz: {
    titleEn: 'Gkoo Exam Mentor',
    titleHi: 'Gkoo परीक्षा मेंटॉर',
    buttonTextEn: '💡 Hint & Cheer',
    buttonTextHi: '💡 हिंट और चीयर',
    buttonIcon: Star,
    buttonGradient: 'from-amber-500 via-red-500 to-rose-500',
    borderTheme: 'border-rose-200 dark:border-rose-800/60',
    dialogs: [
      { mood: 'thinking', textEn: 'Read carefully, eliminate wrong options one by one! 💡', textHi: 'ध्यान से पढ़ो, गलत विकल्पों को एक-एक करके हटाओ! 💡', particle: '💡' },
      { mood: 'fire', textEn: 'Combo power activated! Strike the right answer! 🔥', textHi: 'कॉम्बो पावर एक्टिव! सही उत्तर पर निशाना साधो! 🔥', particle: '🔥' },
      { mood: 'celebrate', textEn: 'You got this! Full 5 Hearts victory incoming! 🎯', textHi: 'आप कर सकते हो! पूरे 5 हार्ट्स के साथ जीत पक्की है! 🎯', particle: '🎯' },
      { mood: 'excited', textEn: 'Stay sharp and confident! Gems reward awaits! 💎', textHi: 'आत्मविश्वास बनाए रखो! जेम्स का इनाम आपका इंतजार कर रहा है! 💎', particle: '💎' },
      { mood: 'ninja', textEn: 'Trust your first instinct, it’s often the right one! ⚡', textHi: 'अपनी पहली समझ पर भरोसा करो, वह अक्सर सही होती है! ⚡', particle: '⚡' },
      { mood: 'happy', textEn: 'Don’t rush! Take a deep breath and conquer! 🧘', textHi: 'जल्दबाजी मत करो! गहरी सांस लो और जीत हासिल करो! 🧘', particle: '🌸' },
      { mood: 'celebrate', textEn: 'Every correct answer fills Gkoo with excitement! 🥳', textHi: 'हर सही उत्तर Gkoo को खुशी से भर देता है! 🥳', particle: '🎉' },
      { mood: 'fire', textEn: 'Knowledge is your superpower! Unleash it now! 🚀', textHi: 'ज्ञान ही आपकी महाशक्ति है! इसे साबित करने का वक्त है! 🚀', particle: '🔥' },
      { mood: 'thinking', textEn: 'Think logically, you are smarter than this question! 🧠', textHi: 'तर्क से सोचो, आप इस सवाल से कहीं ज्यादा होशियार हो! 🧠', particle: '🌟' },
      { mood: 'excited', textEn: '100% Accuracy bonus gives you extra shining gems! 👑', textHi: '100% एक्यूरेसी बोनस से आपको अतिरिक्त चमकदार जेम्स मिलते हैं! 👑', particle: '💎' },
      { mood: 'hop', textEn: 'Stay calm and steady! Victory is right around the corner! ⚡', textHi: 'शांत और एकाग्र रहो! जीत बिल्कुल सामने है! ⚡', particle: '⚡' },
      { mood: 'love', textEn: 'Believe in yourself! Every question practiced makes you stronger! ✨', textHi: 'खुद पर भरोसा रखो! हर हल किया गया सवाल आपको मजबूत बनाता है! ✨', particle: '💖' },
    ],
  },
};

export const GkooCompanionCard: React.FC<GkooCompanionCardProps> = ({
  panel,
  className = '',
  defaultMood = 'happy',
  customMessageHi,
  customMessageEn,
  customTitleHi,
  customTitleEn,
  customButtonTextHi,
  customButtonTextEn,
  customButtonAction,
  customMood,
}) => {
  const { lang, hapticsEnabled } = useAppContext();
  const config = PANEL_DATA[panel];

  // User manual tap offset so user can tap Gkoo to shuffle dialogue anytime!
  const [tapOffset, setTapOffset] = useState(0);

  // Deterministically select dialog and animation 2 times a day:
  // Slot 0: 00:00 - 13:59 (Morning / Midday)
  // Slot 1: 14:00 - 23:59 (Evening / Night)
  const baseSlotIndex = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const slot = now.getHours() < 14 ? 0 : 1;
    return (dayOfYear * 2 + slot) % config.dialogs.length;
  }, [config.dialogs.length]);

  const activeIndex = (baseSlotIndex + tapOffset) % config.dialogs.length;
  const currentDialog = config.dialogs[activeIndex] || config.dialogs[0];
  const currentMood: MascotMood = customMood || currentDialog.mood || defaultMood;
  const activeMessage = lang === 'hi'
    ? (customMessageHi || currentDialog.textHi)
    : (customMessageEn || currentDialog.textEn);
  const activeTitle = lang === 'hi'
    ? (customTitleHi || config.titleHi)
    : (customTitleEn || config.titleEn);
  const activeBtnText = lang === 'hi'
    ? (customButtonTextHi !== undefined ? customButtonTextHi : config.buttonTextHi)
    : (customButtonTextEn !== undefined ? customButtonTextEn : config.buttonTextEn);

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech if unmounted or message changes
  useEffect(() => {
    return () => {
      stopSpeech();
      setIsSpeaking(false);
    };
  }, [activeMessage]);

  const handleToggleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      triggerHaptic('click', hapticsEnabled);
      setIsSpeaking(true);
      speakText(activeMessage, lang, () => setIsSpeaking(false));
    }
  };

  const handleTapMascot = () => {
    triggerHaptic('click', hapticsEnabled);
    // Cycle to next motivational quote and animation
    setTapOffset(prev => prev + 1);
  };

  const IconComponent = config.buttonIcon;

  return (
    <div className={`relative flex items-center justify-between gap-3 sm:gap-5 select-none py-1 ${className}`}>
      {/* G-koo Speech Message Bubble */}
      <div className="flex-1 min-w-0" onClick={handleTapMascot} title="Tap to see next message!">
        <div
          className="bg-white dark:bg-[#13192B] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-gray-200 dark:border-indigo-900/40 shadow-md relative flex flex-col justify-between cursor-pointer hover:border-rose-300 dark:hover:border-indigo-700/60 transition-colors"
        >
          {/* Speech Bubble Arrow Tail pointing towards G-koo bird on right */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-gray-200 dark:border-l-indigo-900/40 pointer-events-none" />
          <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[7px] border-l-white dark:border-l-[#13192B] pointer-events-none" />

          {/* Bubble Header */}
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-black text-rose-500 dark:text-rose-400">
              <Sparkles className="w-3.5 h-3.5 fill-rose-400" />
              <span>{activeTitle}</span>
            </div>

            {/* Dedicated Voice Pronounce Button */}
            <button
              type="button"
              onClick={handleToggleSpeak}
              className={`p-1.5 rounded-xl transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                isSpeaking
                  ? 'bg-[#FF5F6D] text-white shadow-xs animate-pulse'
                  : 'text-gray-400 hover:text-[#FF5F6D] dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-800'
              }`}
              title={lang === 'hi' ? 'आवाज़ सुनें (Voice)' : 'Listen voice'}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Volume2 className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>

          {/* Message Text */}
          <p className="text-xs sm:text-sm md:text-base font-black text-gray-800 dark:text-gray-100 leading-snug">
            {activeMessage}
          </p>

          {/* Optional Action Button for Non-Dashboard panels */}
          {panel !== 'dashboard' && activeBtnText && (
            <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('click', hapticsEnabled);
                  if (customButtonAction) customButtonAction();
                }}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r ${config.buttonGradient} text-white font-black text-xs shadow-[0_3px_0_0_rgba(0,0,0,0.2)] flex items-center justify-center space-x-1.5 select-none whitespace-nowrap cursor-pointer hover:brightness-105 active:scale-98 transition-all`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{activeBtnText}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Animated Extra-Large G-koo Mascot (Stable & Smooth, No Hover Shifts) */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileTap={{ scale: 0.92 }}
        onClick={handleTapMascot}
        className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 cursor-pointer relative select-none self-center"
        title="Gkoo Study Buddy - Tap to change! 🦉"
      >
        <GkooBirdSvg mood={currentMood} className="w-full h-full drop-shadow-xl" />
      </motion.div>
    </div>
  );
};
