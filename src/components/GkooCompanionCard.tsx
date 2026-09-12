import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Music, Trophy, Star, Volume2, VolumeX } from 'lucide-react';
import { GkooBirdSvg, type MascotMood } from './Mascot';
import { triggerHaptic, speakText, stopSpeech } from '../lib/audio';
import { useAppContext } from '../useAppContext';

export type CompanionPanel = 'dashboard' | 'leaderboard' | 'profile' | 'settings' | 'quiz';

interface GkooCompanionCardProps {
  panel: CompanionPanel;
  className?: string;
  defaultMood?: MascotMood;
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
    titleEn: 'G-koo Study Buddy',
    titleHi: 'G-koo स्टडी बडी',
    buttonTextEn: '✨ + Custom AI Quiz',
    buttonTextHi: '✨ + कस्टम AI क्विज',
    buttonIcon: Sparkles,
    buttonGradient: 'from-purple-600 via-indigo-600 to-violet-700',
    borderTheme: 'border-purple-200 dark:border-purple-900/60',
    dialogs: [
      { mood: 'excited', textEn: 'Ready for high score today? Let’s conquer! 🚀', textHi: 'आज नया रिकॉर्ड बनाने के लिए तैयार हो? चलो शुरू करें! 🚀', particle: '⭐' },
      { mood: 'fire', textEn: 'Your daily streak is blazing hot! Keep going! 🔥', textHi: 'आपकी डेली स्ट्रीक आग की तरह चमक रही है! जारी रखो! 🔥', particle: '🔥' },
      { mood: 'ninja', textEn: 'Focus like a ninja, answer with lightning speed! ⚡', textHi: 'निंजा की तरह फोकस करो और बिजली की तेज़ी से जवाब दो! ⚡', particle: '💨' },
      { mood: 'eating', textEn: 'Munching on diamonds! Earn gems in quizzes! 💎', textHi: 'मैं डायमंड्स खा रहा हूँ! क्विज खेलो और जेम्स कमाओ! 💎', particle: '💎' },
      { mood: 'celebrate', textEn: 'Party time! Every correct answer brings you closer to #1! 🎉', textHi: 'पार्टी का समय! हर सही उत्तर आपको #1 के करीब ले जाता है! 🎉', particle: '🎉' },
      { mood: 'thinking', textEn: 'Wisdom is power! Just 10 minutes of quiz builds genius! 🧠', textHi: 'ज्ञान ही असली ताकत है! रोज़ाना 10 मिनट क्विज आपको जीनियस बनाता है! 🧠', particle: '💡' },
      { mood: 'waving', textEn: 'G-koo is always by your side cheering for you! 🌟', textHi: 'G-koo हमेशा आपके साथ है और आपके लिए चीयर कर रहा है! 🌟', particle: '✨' },
      { mood: 'excited', textEn: 'Small daily steps lead to gigantic victories! 🏆', textHi: 'रोज़ाना छोटे-छोटे कदम बड़ी जीत दिलाते हैं! 🏆', particle: '🚀' },
      { mood: 'happy', textEn: 'Your brain is getting sharper every single day! 💪', textHi: 'आपका दिमाग हर दिन और भी ज़्यादा तेज़ हो रहा है! 💪', particle: '💖' },
      { mood: 'thinking', textEn: 'Keep your curiosity alive! Every question is a new world! 🌍', textHi: 'अपनी जिज्ञासा ज़िंदा रखो! हर सवाल एक नई दुनिया है! 🌍', particle: '🌟' },
      { mood: 'excited', textEn: 'Super scholar in the making! Let’s solve some quizzes! 📚', textHi: 'भावी टॉपर तैयार हो रहा है! चलो कुछ मजेदार क्विज हल करें! 📚', particle: '📖' },
      { mood: 'love', textEn: 'Believe in yourself, champ! You know more than you think! ✨', textHi: 'खुद पर भरोसा रखो चैंपियन! तुम जितना सोचते हो उससे कहीं ज़्यादा जानते हो! ✨', particle: '💕' },
      { mood: 'celebrate', textEn: 'Consistency is the golden secret of true legends! 👑', textHi: 'लगातार अभ्यास ही दिग्गजों का सबसे बड़ा सीक्रेट है! 👑', particle: '👑' },
      { mood: 'happy', textEn: 'Let’s make today productive, fun and victorious! 🎯', textHi: 'चलो आज के दिन को ज्ञानवर्धक और मजेदार बनाएं! 🎯', particle: '🎯' },
      { mood: 'waving', textEn: 'Mistakes are proof that you are trying and learning! 🌱', textHi: 'गलतियां इस बात का सबूत हैं कि आप कोशिश कर रहे हैं और सीख रहे हैं! 🌱', particle: '🍀' },
    ],
  },
  leaderboard: {
    titleEn: 'G-koo League Coach',
    titleHi: 'G-koo लीग कोच',
    buttonTextEn: '🏆 Victory Hype',
    buttonTextHi: '🏆 विक्ट्री हाइप',
    buttonIcon: Trophy,
    buttonGradient: 'from-amber-500 via-orange-500 to-amber-600',
    borderTheme: 'border-amber-200 dark:border-amber-800/60',
    dialogs: [
      { mood: 'celebrate', textEn: 'Top 3 podium is waiting for you! Show your power! 👑', textHi: 'टॉप 3 पोडियम आपका इंतजार कर रहा है! अपना दम दिखाओ! 👑', particle: '👑' },
      { mood: 'fire', textEn: 'Challengers are pushing, but you are unstoppable! 🔥', textHi: 'प्रतिद्वंद्वी आगे बढ़ रहे हैं, लेकिन आप अजेय हैं! 🔥', particle: '🔥' },
      { mood: 'ninja', textEn: 'Stealth attack the leaderboard! +50 XP combo! 🥷', textHi: 'लीडरबोर्ड पर निंजा स्ट्राइक करो! +50 XP कॉम्बो लूटो! 🥷', particle: '⚡' },
      { mood: 'dance', textEn: 'Victory dance ready! Win the league season! 🕺', textHi: 'विक्ट्री डांस तैयार है! यह लीग सीजन जीतकर दिखाओ! 🕺', particle: '🏆' },
      { mood: 'excited', textEn: 'Climb the ranks! Every quiz gives you precious XP! 📈', textHi: 'रैंकिंग में ऊपर चढ़ो! हर क्विज आपको कीमती XP दिलाता है! 📈', particle: '🚀' },
      { mood: 'thinking', textEn: 'Champions aren’t born, they practice daily with G-koo! 🥇', textHi: 'चैंपियन पैदा नहीं होते, वो रोज़ G-koo के साथ अभ्यास करते हैं! 🥇', particle: '🌟' },
      { mood: 'love', textEn: 'The higher you aim, the brighter you shine! ✨', textHi: 'जितना बड़ा लक्ष्य, उतनी ही चमकदार सफलता! ✨', particle: '💎' },
      { mood: 'fire', textEn: 'Maintain your lead! Don’t let rivals catch up! 🛡️', textHi: 'अपनी बढ़त बनाए रखो! प्रतिद्वंदियों को आगे मत निकलने दो! 🛡️', particle: '🔥' },
      { mood: 'celebrate', textEn: 'Crown looks great on you! Defend your throne! 👑', textHi: 'ताज आप पर बहुत जचता है! अपने सिंहासन की रक्षा करो! 👑', particle: '👑' },
      { mood: 'ninja', textEn: 'True power lies in persistence! Score more XP! ⚡', textHi: 'असली ताकत लगातार डटे रहने में है! और XP स्कोर करो! ⚡', particle: '💨' },
      { mood: 'excited', textEn: 'League promotion is just a few perfect tests away! 🚀', textHi: 'लीग प्रमोशन बस कुछ परफेक्ट टेस्ट्स की दूरी पर है! 🚀', particle: '🏆' },
      { mood: 'happy', textEn: 'You have the speed, focus and knowledge to rule! 🦁', textHi: 'आपके पास टॉप पर राज करने की स्पीड, फोकस और ज्ञान है! 🦁', particle: '⭐' },
    ],
  },
  profile: {
    titleEn: 'G-koo Best Friend',
    titleHi: 'G-koo पक्का दोस्त',
    buttonTextEn: '💖 Pet G-koo',
    buttonTextHi: '💖 G-koo से प्यार करो',
    buttonIcon: Heart,
    buttonGradient: 'from-pink-500 via-rose-500 to-red-500',
    borderTheme: 'border-pink-200 dark:border-pink-900/60',
    dialogs: [
      { mood: 'love', textEn: 'G-koo loves learning with you! Best friends forever! 💖', textHi: 'G-koo को आपके साथ पढ़ना बहुत पसंद है! पक्के दोस्त! 💖', particle: '❤️' },
      { mood: 'sleeping', textEn: 'Zzz... Rest well to keep your brain sharp! 🌙', textHi: 'ज़ू... अच्छी नींद लो ताकि दिमाग हमेशा तेज़ रहे! 🌙', particle: '💤' },
      { mood: 'waving', textEn: 'Hello champion! Look at your amazing badges! 👋', textHi: 'नमस्ते चैंपियन! अपने शानदार बैज और लेवल देखो! 👋', particle: '✨' },
      { mood: 'eating', textEn: 'Sharing my secret energy gems with you! 💎', textHi: 'अपनी सीक्रेट एनर्जी वाले जेम्स आपके साथ शेयर कर रहा हूँ! 💎', particle: '💎' },
      { mood: 'excited', textEn: 'You are leveling up so fast! Proud of you! 🌟', textHi: 'आप बहुत तेजी से लेवल अप कर रहे हो! मुझे गर्व है! 🌟', particle: '🌟' },
      { mood: 'love', textEn: 'Every day spent learning with you is pure joy! 🌈', textHi: 'आपके साथ सीखने में बिताया हर दिन बहुत सुखद होता है! 🌈', particle: '💖' },
      { mood: 'waving', textEn: 'Your dedication inspires G-koo to fly higher! 🕊️', textHi: 'आपकी मेहनत G-koo को भी ऊंची उड़ान भरने की प्रेरणा देती है! 🕊️', particle: '🍀' },
      { mood: 'happy', textEn: 'Treat yourself to some cool perks in the shop! 🎁', textHi: 'शॉप में जाकर अपने लिए कुछ शानदार रिवार्ड्स अनलॉक करो! 🎁', particle: '💎' },
      { mood: 'celebrate', textEn: 'Smart, focused and kind—you are the complete package! 🌟', textHi: 'होशियार, एकाग्र और दयालु—आप एक सच्चे ऑलराउंडर हो! 🌟', particle: '⭐' },
      { mood: 'love', textEn: 'Let’s keep this friendship and streak going forever! 🤝', textHi: 'यह दोस्ती और सीखने का सिलसिला हमेशा ऐसे ही चलता रहे! 🤝', particle: '❤️' },
      { mood: 'excited', textEn: 'A fresh mind discovers wonders! Stay awesome! ✨', textHi: 'एक तरोताजा दिमाग चमत्कारों की खोज करता है! हमेशा खुश रहो! ✨', particle: '💫' },
      { mood: 'celebrate', textEn: 'High five! We make the ultimate dream team! ✋', textHi: 'हाई फाइव! हमारी और आपकी जोड़ी सचमुच लाजवाब है! ✋', particle: '🎉' },
    ],
  },
  settings: {
    titleEn: 'DJ G-koo Audio Lab',
    titleHi: 'DJ G-koo ऑडियो लैब',
    buttonTextEn: '🎧 DJ Beat Mode',
    buttonTextHi: '🎧 DJ बीट मोड',
    buttonIcon: Music,
    buttonGradient: 'from-purple-600 via-indigo-600 to-violet-600',
    borderTheme: 'border-purple-200 dark:border-purple-800/60',
    dialogs: [
      { mood: 'dance', textEn: 'DJ G-koo drop the bass! Gentle Harp & Chime are tuned! 🎧', textHi: 'DJ G-koo इन द हाउस! जेंटल हार्प और चाइम धुन सेट हैं! 🎧', particle: '🎵' },
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
    titleEn: 'G-koo Exam Mentor',
    titleHi: 'G-koo परीक्षा मेंटॉर',
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
      { mood: 'celebrate', textEn: 'Every correct answer fills G-koo with excitement! 🥳', textHi: 'हर सही उत्तर G-koo को खुशी से भर देता है! 🥳', particle: '🎉' },
      { mood: 'fire', textEn: 'Knowledge is your superpower! Unleash it now! 🚀', textHi: 'ज्ञान ही आपकी महाशक्ति है! इसे साबित करने का वक्त है! 🚀', particle: '🔥' },
      { mood: 'thinking', textEn: 'Think logically, you are smarter than this question! 🧠', textHi: 'तर्क से सोचो, आप इस सवाल से कहीं ज्यादा होशियार हो! 🧠', particle: '🌟' },
      { mood: 'excited', textEn: '100% Accuracy bonus gives you extra shining gems! 👑', textHi: '100% एक्यूरेसी बोनस से आपको अतिरिक्त चमकदार जेम्स मिलते हैं! 👑', particle: '💎' },
    ],
  },
};

export const GkooCompanionCard: React.FC<GkooCompanionCardProps> = ({
  panel,
  className = '',
  defaultMood = 'happy',
}) => {
  const { lang, hapticsEnabled } = useAppContext();
  const config = PANEL_DATA[panel];

  const [currentIndex] = useState(() => Math.floor(Math.random() * config.dialogs.length));
  const [currentMood, setCurrentMood] = useState<MascotMood>(defaultMood);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);

  const lastStrokeTimeRef = useRef<number>(0);
  const pettingTimerRef = useRef<any>(null);
  const pettingSessionIdxRef = useRef<number>(-1);

  const PETTING_MOODS = useMemo<MascotMood[]>(() => [
    'petting',
    'petting_love',
    'petting_wink',
    'petting_stars',
    'petting_tickle',
    'petting_snuggle',
  ], []);

  const PETTING_DIALOGS = useMemo(() => [
    {
      textHi: 'Aww... सहलाने में कितना सुकून मिलता है! 💖 पढ़ने में और भी मज़ा आएगा!',
      textEn: 'Aww... that feels so peaceful and sweet! 💖 Ready to study!',
    },
    {
      textHi: 'G-koo को आपसे बहुत प्यार है! 🥰 आप सचमुच मेरे बेस्ट फ्रेंड हो!',
      textEn: 'G-koo loves you so much! 🥰 You are my absolute best friend!',
    },
    {
      textHi: 'चलो चैंपियन! 😉 आज मिलकर क्विज में नया रिकॉर्ड बनाते हैं!',
      textEn: 'Let’s do this, champ! 😉 Today we smash a new quiz record!',
    },
    {
      textHi: 'वाह! 🤩 इतनी ऊर्जा! आज तो टॉप रैंक पक्की है!',
      textEn: 'Wow! 🤩 So much energy! Top rank is definitely ours today!',
    },
    {
      textHi: 'गुदगुदी हो रही है! 😆 आपकी लगन देखकर मुझे बहुत खुशी होती है!',
      textEn: 'Hehe, that tickles! 😆 I love studying with you so much!',
    },
    {
      textHi: 'कितना आरामदायक लग रहा है! ✨ एकाग्र मन से बड़ी सफलता मिलती है!',
      textEn: 'So cozy and relaxing! ✨ A focused mind achieves greatness!',
    },
  ], []);

  const [pettingMessageIdx, setPettingMessageIdx] = useState(0);

  const currentDialog = config.dialogs[currentIndex] || config.dialogs[0];
  const activeMessage = isPetting 
    ? (lang === 'hi' ? PETTING_DIALOGS[pettingMessageIdx].textHi : PETTING_DIALOGS[pettingMessageIdx].textEn)
    : (lang === 'hi' ? currentDialog.textHi : currentDialog.textEn);

  // Stop speech if unmounted
  useEffect(() => {
    return () => {
      stopSpeech();
      setIsSpeaking(false);
      if (pettingTimerRef.current) clearTimeout(pettingTimerRef.current);
    };
  }, []);

  // Stroke / Petting (सहलाना) Handler for Mobile Touch and Desktop Hover/Move
  const handlePetting = () => {
    const now = Date.now();
    if (now - lastStrokeTimeRef.current < 60) return; // Throttle strokes
    lastStrokeTimeRef.current = now;

    // If starting a fresh petting session, advance to the NEXT single emotion (1st -> 2nd -> 3rd -> 4th...)
    if (!isPetting) {
      const nextSessionIdx = (pettingSessionIdxRef.current + 1) % PETTING_MOODS.length;
      pettingSessionIdxRef.current = nextSessionIdx;

      const chosenMood = PETTING_MOODS[nextSessionIdx];
      const chosenDialogIdx = nextSessionIdx % PETTING_DIALOGS.length;

      setIsPetting(true);
      setCurrentMood(chosenMood);
      setPettingMessageIdx(chosenDialogIdx);
    }

    // Light tactile feedback on each stroke without any audio noise
    triggerHaptic('click', hapticsEnabled);

    // Spawn floating love particles (💖, 💕, ✨, 🌸, 💗)
    const heartIcons = ['💖', '💕', '✨', '🌸', '💗', '🥰', '⭐', '🌟'];
    const randomHeart = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    const newParticle = {
      id: Date.now() + Math.random(),
      char: randomHeart,
      x: (Math.random() - 0.5) * 70,
      y: -10 - Math.random() * 40,
    };
    setParticles(prev => [...prev.slice(-14), newParticle]);

    // Reset timer: Hold this one emotion throughout current petting session, restore after user stops
    if (pettingTimerRef.current) clearTimeout(pettingTimerRef.current);
    pettingTimerRef.current = setTimeout(() => {
      setIsPetting(false);
      setCurrentMood('happy');
      // After 1.5s restore default mood
      setTimeout(() => {
        setCurrentMood(defaultMood);
      }, 1500);
    }, 1800);
  };

  const handleTouchMove = () => {
    handlePetting();
  };

  const handleMouseMove = () => {
    handlePetting();
  };

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

  const IconComponent = config.buttonIcon;

  return (
    <div className={`relative flex items-center justify-between gap-3 sm:gap-5 select-none py-1 ${className}`}>
      {/* Floating Love Particles Animation during Petting (सहलाना) */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0.6, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 2, x: p.x, y: p.y - 60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className="absolute top-1/4 right-16 text-2xl pointer-events-none z-30 drop-shadow-md"
          >
            {p.char}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Left Duolingo-style Speech Message Bubble */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMessage}
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            className={`bg-white dark:bg-[#1E2536] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border-2 transition-colors duration-300 ${
              isPetting ? 'border-pink-300 dark:border-pink-800 shadow-pink-100 dark:shadow-none' : 'border-gray-200 dark:border-gray-700/80 shadow-md'
            } shadow-md relative flex flex-col justify-between`}
          >
            {/* Speech Bubble Arrow Tail pointing towards G-koo bird on right */}
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-gray-200 dark:border-l-gray-700 pointer-events-none" />
            <div className="absolute top-1/2 -right-[6px] -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[7px] border-l-white dark:border-l-[#1E2536] pointer-events-none" />

            {/* Bubble Header */}
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-black text-rose-500 dark:text-rose-400">
                <Sparkles className={`w-3.5 h-3.5 fill-rose-400 ${isPetting ? 'animate-bounce' : 'animate-spin'}`} />
                <span>{isPetting ? (lang === 'hi' ? '🥰 सहलाने का प्यार' : '🥰 Loved & Petted') : (lang === 'hi' ? config.titleHi : config.titleEn)}</span>
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
            {panel !== 'dashboard' && config.buttonTextEn && (
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                <motion.button
                  whileTap={{ scale: 0.92, y: 2 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    handlePetting();
                  }}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r ${config.buttonGradient} text-white font-black text-xs shadow-[0_3px_0_0_rgba(0,0,0,0.2)] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center space-x-1.5 select-none whitespace-nowrap cursor-pointer`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">{lang === 'hi' ? config.buttonTextHi : config.buttonTextEn}</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Animated Extra-Large G-koo Mascot with Petting (सहलाना) Touch & Hover */}
      <motion.div
        animate={
          isPetting
            ? {
                scale: [1.02, 1.09, 1.03],
                rotate: [-4, 4, -3, 3],
                y: [0, -5, 0],
              }
            : {
                y: [0, -6, 0],
              }
        }
        transition={{
          duration: isPetting ? 0.7 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 shrink-0 cursor-pointer relative select-none self-center touch-none"
        title={lang === 'hi' ? 'G-koo को सहलाएं (Pet & Stroke)' : 'Stroke or Pet G-koo! 🦉💖'}
      >
        <GkooBirdSvg mood={currentMood} className="w-full h-full drop-shadow-xl" />
      </motion.div>
    </div>
  );
};
