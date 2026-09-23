import { ALL_SUBJECTS_LIST } from '../data/subjectsData';
import { SUBJECT_TOPIC_BANK } from '../data/subjectTopicsBank';

export interface LevelConfig {
  level: number;
  worldId: number;
  categoryId?: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  topicPromptEn: string;
  topicPromptHi: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  isBoss: boolean;
  questionCount: number;
  chestReward?: { gems: number; xp: number };
}

export interface WorldConfig {
  id: number;
  categoryId?: string;
  nameEn: string;
  nameHi: string;
  subtitleEn: string;
  subtitleHi: string;
  icon: string;
  gradient: string;
  borderColor: string;
  badgeBg: string;
  levelsRange: [number, number];
}

export interface CategoryInfo {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  type: 'ca' | 'exam' | 'general';
  gradient: string;
  border3d: string;
  activeBorder: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORIES_LIST: CategoryInfo[] = [
  // --- CURRENT AFFAIRS (NATIONAL & GLOBAL) ---
  {
    id: 'ca_india',
    icon: '🇮🇳',
    titleKey: 'catCaIndiaTitle',
    descKey: 'catCaIndiaDesc',
    titleEn: 'India Current Affairs',
    titleHi: 'भारत करेंट अफेयर्स',
    descEn: 'National News, Schemes, Summits, Awards & Defence',
    descHi: 'राष्ट्रीय घटनाएं, सरकारी योजनाएं, सम्मेलन, पुरस्कार व रक्षा',
    type: 'ca',
    gradient: 'from-orange-500 via-rose-500 to-amber-600',
    border3d: 'border-b-[5px] border-orange-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-orange-400 text-orange-950 font-black',
    badgeText: 'National CA',
  },
  {
    id: 'ca_world',
    icon: '🌐',
    titleKey: 'catCaWorldTitle',
    descKey: 'catCaWorldDesc',
    titleEn: 'World Current Affairs',
    titleHi: 'विश्व करेंट अफेयर्स',
    descEn: 'Global Summits, UN, Space, Bilateral Ties & Geopolitics',
    descHi: 'वैश्विक सम्मेलन, संयुक्त राष्ट्र, अंतरिक्ष, द्विपक्षीय संबंध व वैश्विक घटनाएं',
    type: 'ca',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    border3d: 'border-b-[5px] border-blue-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-sky-400 text-sky-950 font-black',
    badgeText: 'Global CA',
  },

  // --- INDIAN COMPETITIVE EXAM PREPARATION ---
  {
    id: 'ssc_cgl',
    icon: '🏛️',
    titleKey: 'catSscCglTitle',
    descKey: 'catSscCglDesc',
    titleEn: 'SSC CGL Exam',
    titleHi: 'एसएससी सीजीएल (SSC CGL)',
    descEn: 'Tier-1 & 2: Polity, History, Economy, Science & Static GK',
    descHi: 'टियर-1 व 2: संविधान, इतिहास, अर्थव्यवस्था, विज्ञान व सामान्य ज्ञान',
    type: 'exam',
    gradient: 'from-amber-600 via-orange-600 to-amber-700',
    border3d: 'border-b-[5px] border-amber-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-amber-400 text-amber-950 font-black',
    badgeText: 'Govt Exam',
  },
  {
    id: 'ssc_chsl',
    icon: '📚',
    titleKey: 'catSscChslTitle',
    descKey: 'catSscChslDesc',
    titleEn: 'SSC CHSL Exam',
    titleHi: 'एसएससी सीएचएसएल (SSC CHSL)',
    descEn: '10+2 Level: Static GK, Current Affairs, Science & Art',
    descHi: '10+2 स्तर: स्टेटिक जीके, समसामयिकी, सामान्य विज्ञान व कला',
    type: 'exam',
    gradient: 'from-indigo-600 via-blue-600 to-indigo-700',
    border3d: 'border-b-[5px] border-indigo-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-blue-400 text-blue-950 font-black',
    badgeText: '10+2 Exam',
  },
  {
    id: 'uppsc',
    icon: '⚖️',
    titleKey: 'catUppscTitle',
    descKey: 'catUppscDesc',
    titleEn: 'UPPSC & State PCS',
    titleHi: 'यूपीपीएससी / राज्य पीसीएस (UPPSC)',
    descEn: 'UP Special GK, History, Geography, Polity & Budget',
    descHi: 'उत्तर प्रदेश विशेष ज्ञान, इतिहास, भूगोल, राजव्यवस्था व बजट',
    type: 'exam',
    gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    border3d: 'border-b-[5px] border-teal-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-emerald-400 text-emerald-950 font-black',
    badgeText: 'State PCS',
  },
  {
    id: 'upsc',
    icon: '👑',
    titleKey: 'catUpscTitle',
    descKey: 'catUpscDesc',
    titleEn: 'UPSC Civil Services',
    titleHi: 'यूपीएससी सिविल सेवा (IAS/IPS)',
    descEn: 'IAS/IPS Prelims GS: Indian Polity, Environment, History',
    descHi: 'आईएएस/आईपीएस प्रारंभिक परीक्षा: संविधान, पर्यावरण, इतिहास व भूगोल',
    type: 'exam',
    gradient: 'from-purple-600 via-violet-700 to-purple-800',
    border3d: 'border-b-[5px] border-purple-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-purple-400 text-purple-950 font-black',
    badgeText: 'UPSC Prelims',
  },
  {
    id: 'railway',
    icon: '🚆',
    titleKey: 'catRailwayTitle',
    descKey: 'catRailwayDesc',
    titleEn: 'Railway RRB NTPC',
    titleHi: 'रेलवे आरआरबी (RRB NTPC)',
    descEn: 'NTPC & Group D: Railway GK, Physics, Biology & Tech',
    descHi: 'आरआरबी एनटीपीसी व ग्रुप डी: रेलवे ज्ञान, भौतिकी, जीवविज्ञान व सामान्य अध्ययन',
    type: 'exam',
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
    border3d: 'border-b-[5px] border-rose-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-pink-400 text-pink-950 font-black',
    badgeText: 'RRB NTPC',
  },
  {
    id: 'banking',
    icon: '🏦',
    titleKey: 'catBankingTitle',
    descKey: 'catBankingDesc',
    titleEn: 'Banking & IBPS',
    titleHi: 'बैंकिंग एवं आईबीपीएस (IBPS PO)',
    descEn: 'Banking Awareness, RBI Monetary Policy & Economy',
    descHi: 'बैंकिंग अवेयरनेस, आरबीआई मौद्रिक नीति, वित्तीय संस्थान व अर्थव्यवस्था',
    type: 'exam',
    gradient: 'from-cyan-600 via-blue-700 to-cyan-800',
    border3d: 'border-b-[5px] border-cyan-950',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-cyan-400 text-cyan-950 font-black',
    badgeText: 'Bank PO',
  },

  // --- GENERAL KNOWLEDGE & SUBJECT REALMS ---
  {
    id: 'india',
    icon: '🇮🇳',
    titleKey: 'catIndiaTitle',
    descKey: 'catIndiaDesc',
    titleEn: 'India GK & Heritage',
    titleHi: 'भारत ज्ञान एवं संस्कृति',
    descEn: 'History, States, Culture, Geography & Freedom Struggle',
    descHi: 'इतिहास, राज्य, संस्कृति, भूगोल व स्वतंत्रता संग्राम',
    type: 'general',
    gradient: 'from-amber-500 via-orange-500 to-amber-600',
    border3d: 'border-b-[5px] border-orange-800',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-white/25 text-white',
    badgeText: 'Core GK',
  },
  {
    id: 'world',
    icon: '🌍',
    titleKey: 'catWorldTitle',
    descKey: 'catWorldDesc',
    titleEn: 'World Geography',
    titleHi: 'विश्व भूगोल',
    descEn: 'Capitals, Oceans, Landmarks, Flags & Wonders',
    descHi: 'राजधानियां, महासागर, धरोहर, ध्वज एवं अजूबे',
    type: 'general',
    gradient: 'from-blue-500 via-indigo-500 to-blue-600',
    border3d: 'border-b-[5px] border-indigo-900',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-white/25 text-white',
    badgeText: 'Global',
  },
  {
    id: 'subjects',
    icon: '🔬',
    titleKey: 'catScienceTitle',
    descKey: 'catScienceDesc',
    titleEn: 'Science & Inventions',
    titleHi: 'विज्ञान एवं खोजें',
    descEn: 'Physics, Biology, Chemistry & Space Exploration',
    descHi: 'भौतिकी, जीवविज्ञान, रसायन व अंतरिक्ष अन्वेषण',
    type: 'general',
    gradient: 'from-emerald-500 via-teal-500 to-emerald-600',
    border3d: 'border-b-[5px] border-teal-900',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-white/25 text-white',
    badgeText: 'Science',
  },
  {
    id: 'mix',
    icon: '🎯',
    titleKey: 'catMixTitle',
    descKey: 'catMixDesc',
    titleEn: 'Mix Potpourri',
    titleHi: 'मिश्रित सामान्य ज्ञान',
    descEn: 'Test yourself across all competitive topics',
    descHi: 'सभी विषयों की मिली-जुली व्यापक ज्ञान परीक्षा',
    type: 'general',
    gradient: 'from-[#FF5F6D] via-[#E64553] to-[#D93848]',
    border3d: 'border-b-[5px] border-[#991B1B]',
    activeBorder: 'active:border-b-[2px]',
    badgeBg: 'bg-white/25 text-white',
    badgeText: 'Mega Mix',
  },
];

export function getCategoryInfo(categoryId: string): CategoryInfo {
  const existing = CATEGORIES_LIST.find(c => c.id === categoryId);
  if (existing) return existing;

  const sub = ALL_SUBJECTS_LIST.find(s => s.id === categoryId);
  if (sub) {
    return {
      id: sub.id,
      icon: sub.icon,
      titleKey: sub.id,
      descKey: sub.id,
      titleEn: sub.nameEn,
      titleHi: sub.nameHi,
      descEn: sub.descEn,
      descHi: sub.descHi,
      type: 'general',
      gradient: sub.gradient,
      border3d: sub.border3d,
      activeBorder: 'active:border-b-[2px]',
      badgeBg: sub.badgeBg,
      badgeText: sub.badge,
    };
  }

  return CATEGORIES_LIST[0];
}

// -------------------------------------------------------------
// CURATED TOPICS PER CATEGORY FOR REALM GENERATION
// -------------------------------------------------------------
const CATEGORY_TOPIC_BANK: Record<string, { titleEn: string; titleHi: string; descEn: string; descHi: string; promptEn: string; promptHi: string; icon: string }[]> = {
  ca_india: [
    { titleEn: "National News, Cabinet & Governance", titleHi: "राष्ट्रीय समाचार, कैबिनेट व शासन", descEn: "Top national events, major Bills passed, Parliament sessions & Policies", descHi: "प्रमुख राष्ट्रीय घटनाएं, नए कानून, संसद सत्र और नीतियां", promptEn: "India Current Affairs latest national news, government policies, cabinet decisions, parliament bills and governance", promptHi: "भारत के नवीनतम राष्ट्रीय करेंट अफेयर्स, सरकारी नीतियां, कैबिनेट के फैसले और संसद", icon: "🇮🇳" },
    { titleEn: "Central Schemes & Infrastructure", titleHi: "केंद्रीय योजनाएं व राष्ट्रीय इन्फ्रास्ट्रक्चर", descEn: "PM GatiShakti, Vande Bharat, Expressway projects & Smart Cities", descHi: "पीएम गतिशक्ति, वंदे भारत नेटवर्क, एक्सप्रेसवे और स्मार्ट सिटीज", promptEn: "India Current Affairs government flagship schemes, PM GatiShakti, infrastructure expressways, railway modernization", promptHi: "भारत की प्रमुख सरकारी योजनाएं, गतिशक्ति, एक्सप्रेसवे और आधुनिकीकरण परियोजनाएं", icon: "🏗️" },
    { titleEn: "Defence, Missiles & Armed Forces", titleHi: "रक्षा, मिसाइल व भारतीय सशस्त्र बल", descEn: "Agni-5, BrahMos, INS Vikrant, joint military exercises & DRDO", descHi: "अग्नि-5, ब्रह्मोस, आईएनएस विक्रांत, संयुक्त युद्धाभ्यास और डीआरडीओ", promptEn: "India Current Affairs Defence, DRDO missile tests Agni BrahMos, Indian Navy aircraft carriers, joint military exercises with friendly nations", promptHi: "भारतीय रक्षा करेंट अफेयर्स, डीआरडीओ मिसाइल परीक्षण, नौसेना पोत और संयुक्त सैन्य अभ्यास", icon: "🛡️" },
    { titleEn: "ISRO, Space Missions & Science Tech", titleHi: "इसरो, अंतरिक्ष मिशन व विज्ञान नवाचार", descEn: "Chandrayaan-3, Gaganyaan, Aditya-L1, SSLV & AI initiatives", descHi: "चंद्रयान-3, गगनयान, आदित्य-L1, एसएसएलवी और एआई पहल", promptEn: "India Current Affairs ISRO space missions, Gaganyaan astronaut training, Aditya L1 solar observatory, quantum mission, deep tech", promptHi: "इसरो अंतरिक्ष मिशन, गगनयान, आदित्य L1, क्वांटम मिशन और वैज्ञानिक उपलब्धियां", icon: "🚀" },
    { titleEn: "Economy, Union Budget & RBI Updates", titleHi: "अर्थव्यवस्था, केंद्रीय बजट व आरबीआई", descEn: "GDP growth, GST collections, Repo rate, Inflation & Export records", descHi: "जीडीपी विकास दर, जीएसटी संग्रह, रेपो दर, मुद्रास्फीति और निर्यात", promptEn: "India Current Affairs Economy, Union Budget highlights, GST collection milestones, RBI monetary policy rate changes, trade balance", promptHi: "भारतीय अर्थव्यवस्था करेंट अफेयर्स, केंद्रीय बजट, जीएसटी संग्रह और आरबीआई मौद्रिक नीति", icon: "📈" },
    { titleEn: "National Awards, Honours & Culture", titleHi: "राष्ट्रीय पुरस्कार, सम्मान व संस्कृति", descEn: "Bharat Ratna, Padma Awards, Sahitya Akademi & National Film Awards", descHi: "भारत रत्न, पद्म पुरस्कार, साहित्य अकादमी और राष्ट्रीय फिल्म पुरस्कार", promptEn: "India Current Affairs Awards, latest Bharat Ratna recipients, Padma Vibhushan, Dadasaheb Phalke, National Film Awards winners", promptHi: "भारत के प्रमुख पुरस्कार, भारत रत्न विजेता, पद्म सम्मान, दादा साहेब फाल्के और राष्ट्रीय फिल्म पुरस्कार", icon: "🎖️" },
    { titleEn: "Sports in India - Cricket, Chess & Olympics", titleHi: "भारतीय खेल - क्रिकेट, शतरंज व पदक विजेता", descEn: "T20 World Cup, Asian Games, Chess Grandmasters & National Games", descHi: "टी20 विश्व कप, एशियाई खेल, शतरंज ग्रैंडमास्टर और नेशनल गेम्स", promptEn: "India Current Affairs Sports, Indian cricket victories, Chess Olympiad champions Gukesh Praggnanandhaa, Olympic medalists, Khelo India", promptHi: "भारतीय खेल करेंट अफेयर्स, क्रिकेट, शतरंज ओलंपियाड चैंपियन और ओलंपिक पदक", icon: "🏆" },
    { titleEn: "Environment, Green Energy & Ramsar Sites", titleHi: "पर्यावरण, हरित ऊर्जा व रामसर स्थल", descEn: "Solar parks, Green Hydrogen, new Ramsar wetlands & Cheetah project", descHi: "सोलर पार्क, ग्रीन हाइड्रोजन मिशन, नए रामसर स्थल और चीता प्रोजेक्ट", promptEn: "India Current Affairs Environment, Green hydrogen mission, renewable solar energy capacity, new Ramsar wetland sites in India, Kuno cheetah project", promptHi: "भारतीय पर्यावरण करेंट अफेयर्स, ग्रीन हाइड्रोजन, सौर ऊर्जा और नए रामसर स्थल", icon: "🌿" },
    { titleEn: "Key Appointments, Chief Justices & Envoys", titleHi: "प्रमुख नियुक्तियां, मुख्य न्यायाधीश व राजदूत", descEn: "New CJI, Election Commissioners, Army Chief, Governors & Ambassadors", descHi: "नए मुख्य न्यायाधीश (CJI), चुनाव आयुक्त, सेना प्रमुख, राज्यपाल और राजदूत", promptEn: "India Current Affairs Appointments, Chief Justice of India, Chief Election Commissioner, UPSC Chairman, Army Chief, state Governors", promptHi: "भारत की महत्वपूर्ण नियुक्तियां, मुख्य न्यायाधीश, मुख्य चुनाव आयुक्त और राज्यपाल", icon: "👔" },
    { titleEn: "👑 India Current Affairs Mega Titan Boss", titleHi: "👑 भारत समसामयिकी महा-टाइटैन बॉस", descEn: "The Ultimate Grand Championship covering entire National Current Affairs!", descHi: "संपूर्ण राष्ट्रीय समसामयिकी का महा-मुकाबला! क्या आप पूरे अंक लाएंगे?", promptEn: "Comprehensive India National Current Affairs master mock test combining news, schemes, defence, ISRO, economy and sports", promptHi: "संपूर्ण भारत राष्ट्रीय करेंट अफेयर्स का निर्णायक महा-मॉक टेस्ट", icon: "👑" },
  ],

  ca_world: [
    { titleEn: "Global Summits - G20, BRICS, SCO & QUAD", titleHi: "वैश्विक शिखर सम्मेलन - जी20, ब्रिक्स व क्वाड", descEn: "Host nations, themes, declarations & historic multilateral agreements", descHi: "मेजबान देश, थीम, घोषणापत्र और बहुपक्षीय समझौते", promptEn: "World Current Affairs Global Summits, G20 Summit host, BRICS expansion countries, SCO summit, QUAD leaders meet", promptHi: "विश्व शिखर सम्मेलन करेंट अफेयर्स, जी20, ब्रिक्स विस्तार, एससीओ और क्वाड बैठक", icon: "🌐" },
    { titleEn: "UN, WHO & Climate Conferences (COP)", titleHi: "संयुक्त राष्ट्र, डब्ल्यूएचओ व जलवायु सम्मेलन", descEn: "UN General Assembly, UNFCCC COP climate goals & Global Health pacts", descHi: "संयुक्त राष्ट्र महासभा, यूएनएफसीसीसी कॉप जलवायु लक्ष्य और स्वास्थ्य समझौते", promptEn: "World Current Affairs United Nations, UNFCCC COP climate summit resolutions, WHO global health treaties, UNESCO heritage declarations", promptHi: "संयुक्त राष्ट्र, यूएन कॉप जलवायु सम्मेलन और वैश्विक स्वास्थ्य समझौते", icon: "🌍" },
    { titleEn: "Bilateral Relations & Geopolitics", titleHi: "द्विपक्षीय संबंध व अंतर्राष्ट्रीय भू-राजनीति", descEn: "Strategic partnerships, Free Trade Agreements (FTA) & Global corridors", descHi: "रणनीतिक साझेदारी, मुक्त व्यापार समझौते (FTA) और वैश्विक कॉरिडोर (IMEC)", promptEn: "World Current Affairs Geopolitics, India bilateral agreements, India-Middle East-Europe Corridor (IMEC), Free Trade Agreements", promptHi: "अंतर्राष्ट्रीय भू-राजनीति, द्विपक्षीय समझौते और मुक्त व्यापार समझौते", icon: "🤝" },
    { titleEn: "International Awards - Nobel, Oscar & Booker", titleHi: "अंतर्राष्ट्रीय पुरस्कार - नोबेल, ऑस्कर व बुकर", descEn: "Nobel Prizes in Medicine, Physics, Chemistry, Peace, Oscars & Booker", descHi: "चिकित्सा, भौतिकी, रसायन, शांति का नोबेल पुरस्कार, ऑस्कर और बुकर सम्मान", promptEn: "World Current Affairs International Awards, latest Nobel Prize winners in all fields, Academy Awards Oscars best picture, International Booker Prize", promptHi: "विश्व के प्रतिष्ठित पुरस्कार, नोबेल पुरस्कार विजेता, ऑस्कर और अंतरराष्ट्रीय बुकर पुरस्कार", icon: "🎖️" },
    { titleEn: "Global Science, AI & NASA Artemis", titleHi: "विश्व विज्ञान, कृत्रिम बुद्धिमत्ता व नासा", descEn: "NASA Moon missions, OpenAI, European Space Agency & Quantum tech", descHi: "नासा मून मिशन, ओपनएआई, यूरोपीय स्पेस एजेंसी और क्वांटम तकनीक", promptEn: "World Current Affairs Science and Tech, NASA Artemis program, breakthroughs in Generative AI, CERN particle physics, James Webb space telescope", promptHi: "विश्व विज्ञान और तकनीक, नासा आर्टेमिस प्रोग्राम, एआई क्रांतियां और जेम्स वेब टेलिस्कोप", icon: "🔬" },
    { titleEn: "Global Economy, IMF & Trade Corridors", titleHi: "वैश्विक अर्थव्यवस्था, आईएमएफ व व्यापार मार्ग", descEn: "World Bank forecasts, currency shifts, OPEC oil decisions & Suez/Red Sea", descHi: "विश्व बैंक अनुमान, मुद्रा विनिमय, ओपेक निर्णय और समुद्री व्यापार मार्ग", promptEn: "World Current Affairs Economy, World Bank GDP outlook, IMF projections, OPEC oil quotas, global supply chain routes", promptHi: "विश्व अर्थव्यवस्था करेंट अफेयर्स, विश्व बैंक, आईएमएफ रिपोर्ट और वैश्विक व्यापार मार्ग", icon: "📊" },
    { titleEn: "International Sports - Olympics, FIFA & Slams", titleHi: "अंतर्राष्ट्रीय खेल - ओलंपिक, फीफा व ग्रैंड स्लैम", descEn: "Paris Olympics, FIFA World Cup, Tennis Grand Slams & Formula 1", descHi: "पेरिस ओलंपिक, फीफा विश्व कप, टेनिस ग्रैंड स्लैम और फॉर्मूला 1", promptEn: "World Current Affairs Sports, Summer Olympic Games records, FIFA World Cup host nations, Wimbledon Australian Open tennis champions", promptHi: "अंतर्राष्ट्रीय खेल करेंट अफेयर्स, ओलंपिक खेल, फीफा और ग्रैंड स्लैम टेनिस विजेता", icon: "🥇" },
    { titleEn: "World Leaders, Elections & New PMs/Presidents", titleHi: "विश्व के नेता, चुनाव व नए प्रधानमंत्री/राष्ट्रपति", descEn: "Elections in major democracies, new Heads of State & Global Diplomats", descHi: "प्रमुख देशों के चुनाव, नए राष्ट्राध्यक्ष, प्रधानमंत्री और राष्ट्रपति", promptEn: "World Current Affairs World Leaders, elections in USA, UK, France, Japan, new Prime Ministers and Presidents around the world", promptHi: "विश्व के प्रमुख नेता, अमेरिका-ब्रिटेन चुनाव और नए प्रधानमंत्री व राष्ट्रपति", icon: "🏛️" },
    { titleEn: "Global Reports, Indices & World Rankings", titleHi: "वैश्विक रिपोर्ट, सूचकांक व रैंकिंग", descEn: "World Happiness Report, Global Innovation Index, Climate Risk Index", descHi: "विश्व प्रसन्नता सूचकांक, वैश्विक नवाचार सूचकांक, जलवायु जोखिम रिपोर्ट", promptEn: "World Current Affairs Global Indices, World Happiness Report rankings, Global Innovation Index India rank, Press Freedom, Human Development Index", promptHi: "वैश्विक सूचकांक और रैंकिंग, विश्व प्रसन्नता रिपोर्ट, ग्लोबल इनोवेशन इंडेक्स और मानव विकास रिपोर्ट", icon: "📑" },
    { titleEn: "👑 World Current Affairs Global Titan Boss", titleHi: "👑 विश्व समसामयिकी ग्लोबल महा-बॉस", descEn: "The Master International Current Affairs World Championship Challenge!", descHi: "संपूर्ण विश्व समसामयिकी का सर्वोच्च और सबसे रोमांचक महा-मुकाबला!", promptEn: "Comprehensive World Global Current Affairs master mock test covering summits, UN, geopolitics, Nobel awards, science and world leaders", promptHi: "संपूर्ण विश्व करेंट अफेयर्स का निर्णायक ग्लोबल महा-मॉक टेस्ट", icon: "👑" },
  ],

  ssc_cgl: [
    { titleEn: "Indian Constitution & Articles", titleHi: "भारतीय संविधान और अनुच्छेद", descEn: "Fundamental Rights, Directive Principles, Preamble & Articles", descHi: "मौलिक अधिकार, नीति निदेशक तत्व, प्रस्तावना और महत्वपूर्ण अनुच्छेद", promptEn: "SSC CGL Indian Polity, Constitution Articles, Fundamental Rights Article 14 to 32, President powers, Parliament", promptHi: "एसएससी सीजीएल भारतीय संविधान, मौलिक अधिकार अनुच्छेद 14-32, संसद और राष्ट्रपति की शक्तियां", icon: "📜" },
    { titleEn: "Ancient India & Harappan Civilization", titleHi: "प्राचीन भारत व हड़प्पा सभ्यता", descEn: "Indus Valley, Vedic Age, Buddhism, Jainism & Maurya Empire", descHi: "सिंधु घाटी सभ्यता, वैदिक काल, बौद्ध धर्म, जैन धर्म व मौर्य साम्राज्य", promptEn: "SSC CGL Ancient Indian History, Indus Valley Civilization sites, Ashoka edicts, Vedic literature, Gupta Empire", promptHi: "एसएससी प्राचीन भारतीय इतिहास, सिंधु घाटी स्थल, अशोक के शिलालेख और गुप्त काल", icon: "🏺" },
    { titleEn: "Indian Geography & River Systems", titleHi: "भारत का भूगोल और नदी तंत्र", descEn: "Himalayas, Peninsular rivers, Mountain passes, Soil & Monsoons", descHi: "हिमालय, प्रायद्वीपीय नदियां, दर्रे, मिट्टी और मानसून", promptEn: "SSC CGL Indian Geography, Himalayan passes, Ganga river tributaries, Western Ghats, soil types in India", promptHi: "भारतीय भूगोल, प्रमुख दर्रे, गंगा की सहायक नदियां, पश्चिमी घाट और मिट्टी के प्रकार", icon: "🏞️" },
    { titleEn: "General Science - Everyday Physics", titleHi: "सामान्य विज्ञान - भौतिकी", descEn: "Newton laws, Optics, Heat, Waves, Thermodynamics & Units", descHi: "न्यूटन के नियम, प्रकाशिकी, ऊष्मा, तरंगें और भौतिक इकाइयां", promptEn: "SSC CGL General Science Physics, SI units, Newton laws of motion, reflection, sound speed, atmospheric pressure", promptHi: "एसएससी सीजीएल सामान्य विज्ञान भौतिकी, एसआई मात्रक, गति के नियम और प्रकाश", icon: "⚡" },
    { titleEn: "Indian Economy & National Income", titleHi: "भारतीय अर्थव्यवस्था व राष्ट्रीय आय", descEn: "GDP, GNP, Five Year Plans, NITI Aayog, GST & Inflation", descHi: "जीडीपी, पंचवर्षीय योजनाएं, नीति आयोग, जीएसटी और मुद्रास्फीति", promptEn: "SSC CGL Indian Economy, GDP GNP calculation, Five year plans, NITI Aayog, GST indirect taxes, inflation indices", promptHi: "भारतीय अर्थव्यवस्था, जीडीपी, नीति आयोग, जीएसटी और मुद्रास्फीति", icon: "📊" },
    { titleEn: "Modern History & Freedom Struggle", titleHi: "आधुनिक इतिहास व स्वतंत्रता संग्राम", descEn: "1857 Revolt, INC Sessions, Gandhi movements & Partition", descHi: "1857 की क्रांति, कांग्रेस अधिवेशन, गांधीजी के आंदोलन और स्वतंत्रता", promptEn: "SSC CGL Modern Indian History, 1857 revolt leaders, INC sessions, Non-Cooperation movement, Quit India 1942", promptHi: "आधुनिक भारतीय इतिहास, 1857 क्रांति, कांग्रेस के मुख्य अधिवेशन, असहयोग और भारत छोड़ो आंदोलन", icon: "⚔️" },
    { titleEn: "General Science - Biology & Nutrition", titleHi: "सामान्य विज्ञान - जीवविज्ञान व पोषण", descEn: "Human diseases, Vitamins, Plant hormones & Digestive system", descHi: "मानव रोग, विटामिन, पादप हार्मोन और पाचन तंत्र", promptEn: "SSC CGL General Science Biology, human diseases bacteria virus, vitamins deficiency, human digestive system, blood circulatory", promptHi: "एसएससी सामान्य विज्ञान जीवविज्ञान, विटामिन की कमी, जीवाणु-विषाणु रोग और मानव शरीर रचना", icon: "🧬" },
    { titleEn: "Static GK - Art, Culture & Dances", titleHi: "स्टेटिक जीके - कला, संस्कृति व नृत्य", descEn: "Classical dances, Musical gharanas, Folk arts & GI Tags", descHi: "शास्त्रीय नृत्य, संगीत घराने, लोक कलाएं और जीआई टैग", promptEn: "SSC CGL Static GK, Classical dance exponents, musical instruments players, folk festivals of states, GI tags", promptHi: "एसएससी स्टेटिक जीके, शास्त्रीय नृत्य कलाकार, वाद्य यंत्र और राज्यों के लोक त्यौहार", icon: "🎭" },
    { titleEn: "General Chemistry & Everyday Reactions", titleHi: "सामान्य रसायन - दैनिक जीवन के रसायन", descEn: "Acids, Bases, Salts, Metals, Alloys & Polymers", descHi: "अम्ल, क्षार, लवण, धातुएं, मिश्रधातुएं और बहुलक", promptEn: "SSC CGL Chemistry, acids bases pH scale, common chemical names, baking soda, washing soda, alloys brass bronze", promptHi: "एसएससी रसायन विज्ञान, अम्ल-क्षार पीएच मान, बेकिंग सोडा, मिश्रधातुएं और रासायनिक सूत्र", icon: "🧪" },
    { titleEn: "👑 SSC CGL Tier-1 Grand Titan Boss", titleHi: "👑 एसएससी सीजीएल टियर-1 महा-बॉस", descEn: "Comprehensive high-yield mock test covering all Tier-1 GS subjects!", descHi: "सभी विषयों का संपूर्ण टियर-1 महा-मुकाबला! क्या आप सफल होंगे?", promptEn: "Comprehensive SSC CGL Tier-1 General Awareness mock questions combining polity, history, economy, science and geography", promptHi: "एसएससी सीजीएल टियर-1 का संपूर्ण सामान्य अध्ययन महा-मॉक टेस्ट", icon: "👑" },
  ],

  ssc_chsl: [
    { titleEn: "Static GK - Festivals & Fairs", titleHi: "स्टेटिक जीके - त्यौहार व मेले", descEn: "Hornbill, Pushkar, Bihu, Kumbh & Regional Celebrations", descHi: "हॉर्नबिल, पुष्कर, बिहू, कुंभ और क्षेत्रीय मेले", promptEn: "SSC CHSL Static GK, Indian state festivals Hornbill, Hemis, Losar, Pushkar camel fair, Bihu Assam", promptHi: "एसएससी सीएचएसएल स्टेटिक जीके, प्रमुख राज्यों के त्यौहार और मेले", icon: "🪔" },
    { titleEn: "Indian Geography - Capitals & Boundaries", titleHi: "भारतीय भूगोल - सीमाएं व राजधानियां", descEn: "International borders, Coastal states & Union Territories", descHi: "अंतरराष्ट्रीय सीमाएं, तटीय राज्य और केंद्र शासित प्रदेश", promptEn: "SSC CHSL Indian geography, coastal states, neighbouring countries border lengths, Radcliffe line, MacMahon line", promptHi: "भारतीय भूगोल, तटीय राज्य, पड़ोसी देशों की सीमाएं और रेडक्लिफ रेखा", icon: "🗺️" },
    { titleEn: "Indian History - Delhi Sultanate & Mughals", titleHi: "इतिहास - दिल्ली सल्तनत व मुगल काल", descEn: "Slave dynasty, Alauddin Khilji, Akbar, Monuments & Administration", descHi: "गुलाम वंश, अलाउद्दीन खिलजी, अकबर, स्मारक और मनसबदारी", promptEn: "SSC CHSL Medieval History, Delhi sultanate rulers, Qutub Minar builder, Akbar administrative system, Battle of Panipat", promptHi: "मध्यकालीन भारत, दिल्ली सल्तनत, कुतुब मीनार, अकबर और पानीपत के युद्ध", icon: "🏰" },
    { titleEn: "General Science - Human Body Facts", titleHi: "सामान्य विज्ञान - मानव शरीर के तथ्य", descEn: "Bones, Hormones, Blood Groups & Sense Organs", descHi: "हड्डियां, हार्मोन, रक्त समूह और ज्ञानेंद्रियां", promptEn: "SSC CHSL General Science, largest gland liver, pituitary master gland, smallest bone stapes, universal donor blood O negative", promptHi: "मानव शरीर की सबसे बड़ी ग्रंथि, मास्टर ग्रंथि, सबसे छोटी हड्डी और रक्त समूह", icon: "🩺" },
    { titleEn: "Indian Polity - President & PM Powers", titleHi: "भारतीय राजव्यवस्था - राष्ट्रपति व प्रधानमंत्री", descEn: "Elections, Term, Impeachment, Emergency Articles 352-360", descHi: "चुनाव, कार्यकाल, महाभियोग और आपातकाल अनुच्छेद 352-360", promptEn: "SSC CHSL Indian Polity, President election, impeachment Article 61, Emergency provisions 352 356 360, Prime Minister appointment", promptHi: "राष्ट्रपति का चुनाव, महाभियोग अनुच्छेद 61, आपातकाल प्रावधान और प्रधानमंत्री", icon: "🏛️" },
    { titleEn: "National Parks & Bird Sanctuaries", titleHi: "राष्ट्रीय उद्यान व पक्षी अभयारण्य", descEn: "Jim Corbett, Kaziranga, Bharatpur, Silent Valley & Ranthambore", descHi: "जिम कॉर्बेट, काजीरंगा, भरतपुर, साइलेंट वैली व रणथंभौर", promptEn: "SSC CHSL Wildlife sanctuaries, national parks Jim Corbett first, Kaziranga one horned rhino, Keoladeo bird sanctuary", promptHi: "भारत के राष्ट्रीय उद्यान, जिम कॉर्बेट, काजीरंगा एक सींग वाला गैंडा और पक्षी अभयारण्य", icon: "🐅" },
    { titleEn: "Books, Authors & Famous Awards", titleHi: "पुस्तकें, लेखक व प्रमुख पुरस्कार", descEn: "Nobel, Bharat Ratna, Jnanpith, Booker & Famous Autobiographies", descHi: "नोबेल, भारत रत्न, ज्ञानपीठ, बुकर पुरस्कार और प्रसिद्ध आत्मकथाएं", promptEn: "SSC CHSL Books and Authors, Jnanpith award winners, Bharat Ratna recipients, famous books of APJ Abdul Kalam, Gandhi", promptHi: "प्रसिद्ध पुस्तकें और लेखक, ज्ञानपीठ पुरस्कार, भारत रत्न और आत्मकथाएं", icon: "📖" },
    { titleEn: "Basic Computers & Internet GK", titleHi: "कंप्यूटर व इंटरनेट सामान्य ज्ञान", descEn: "RAM/ROM, Shortcuts, Full Forms, OS & Protocols", descHi: "रैम/रोम, शॉर्टकट कीज, फुल फॉर्म, ऑपरेटिंग सिस्टम व प्रोटोकॉल", promptEn: "SSC CHSL Computer fundamentals, RAM ROM difference, HTTP HTML full forms, shortcut keys Ctrl C Ctrl V, binary language", promptHi: "कंप्यूटर के मूल सिद्धांत, रैम-रोम, फुल फॉर्म, शॉर्टकट कीज और इंटरनेट", icon: "💻" },
    { titleEn: "Sports Records & Trophies", titleHi: "खेल रिकॉर्ड व ट्रॉफियां", descEn: "Cricket, Olympics, Badminton, Ranji Trophy & Grand Slams", descHi: "क्रिकेट, ओलंपिक, बैडमिंटन, रणजी ट्रॉफी व ग्रैंड स्लैम", promptEn: "SSC CHSL Sports GK, Ranji trophy, Thomas cup badminton, Grand slam tennis tournaments, Olympic medalists India", promptHi: "खेल सामान्य ज्ञान, रणजी ट्रॉफी, थॉमस कप, ग्रैंड स्लैम और ओलंपिक पदक विजेता", icon: "🏆" },
    { titleEn: "👑 SSC CHSL 10+2 Master Boss", titleHi: "👑 एसएससी सीएचएसएल 10+2 महा-बॉस", descEn: "Championship speed mock test across all CHSL GS topics!", descHi: "सभी सीएचएसएल विषयों का निर्णायक स्पीड महा-मुकाबला!", promptEn: "Comprehensive SSC CHSL 10+2 General Awareness mock exam with static GK, science, polity, history and geography", promptHi: "एसएससी सीएचएसएल 10+2 सामान्य ज्ञान का संपूर्ण महा-मॉक टेस्ट", icon: "👑" },
  ],

  uppsc: [
    { titleEn: "Uttar Pradesh - Geography & Rivers", titleHi: "उत्तर प्रदेश - भूगोल व नदियां", descEn: "UP borders, Ganga, Yamuna, Gomti, Ken-Betwa & Soil zones", descHi: "यूपी की सीमाएं, गंगा, यमुना, गोमती, केन-बेतवा लिंक व मिट्टी", promptEn: "UPPSC UP Special Geography, UP boundary sharing 8 states, rivers Ganga Gomti origin, Sonbhadra border 4 states", promptHi: "यूपी विशेष भूगोल, उत्तर प्रदेश की 8 राज्यों से सीमा, गोमती नदी और सोनभद्र जिला", icon: "🗺️" },
    { titleEn: "UP History & Freedom Movement", titleHi: "यूपी का इतिहास व 1857 क्रांति", descEn: "Meerut 1857, Kakori Train Action, Chauri Chaura & Mahajanapadas", descHi: "मेरठ 1857, काकोरी एक्शन, चौरी-चौरा और प्राचीन महाजनपद", promptEn: "UPPSC UP History, 1857 revolt Meerut Lucknow Begum Hazrat Mahal, Kakori train action 1925, Chauri Chaura Gorakhpur", promptHi: "उत्तर प्रदेश का इतिहास, 1857 क्रांति बेगम हजरत महल, काकोरी एक्शन और चौरी-चौरा घटना", icon: "⚔️" },
    { titleEn: "UP Districts & One District One Product", titleHi: "यूपी जिले व ओडीओपी (ODOP)", descEn: "75 districts, Firozabad glass, Varanasi silk, Moradabad brass", descHi: "75 जिले, फिरोजाबाद कांच, वाराणसी रेशम, मुरादाबाद पीतल", promptEn: "UPPSC UP ODOP One District One Product scheme, Firozabad glass bangles, Moradabad brassware, Bhadohi carpets, Lucknow chikankari", promptHi: "यूपी ओडीओपी योजना, फिरोजाबाद की चूड़ियां, मुरादाबाद पीतल और लखनऊ चिकनकारी", icon: "🏺" },
    { titleEn: "Indian Constitution & UP Governance", titleHi: "भारतीय संविधान व यूपी शासन व्यवस्था", descEn: "Governor, Vidhan Sabha (403 seats), Vidhan Parishad & Panchayati Raj", descHi: "राज्यपाल, विधानसभा (403 सीटें), विधान परिषद और पंचायती राज", promptEn: "UPPSC UP Polity and Governance, Vidhan Sabha seats 403, Legislative council 100 seats, Panchayati Raj 73rd Amendment, High Court Prayagraj", promptHi: "यूपी शासन व्यवस्था, विधानसभा 403 सीटें, विधान परिषद, पंचायती राज और प्रयागराज हाईकोर्ट", icon: "⚖️" },
    { titleEn: "UP Census, Demographics & Economy", titleHi: "यूपी जनगणना 2011 व अर्थव्यवस्था", descEn: "Population density, Literacy, Sex ratio & UP Budget highlights", descHi: "जनसंख्या घनत्व, साक्षरता दर, लिंगानुपात और यूपी बजट", promptEn: "UPPSC UP Census 2011, highest populated district Prayagraj, lowest Mahoba, literacy rate UP, sex ratio", promptHi: "यूपी जनगणना 2011, सर्वाधिक जनसंख्या वाला जिला प्रयागराज, साक्षरता दर और लिंगानुपात", icon: "📊" },
    { titleEn: "UP Culture, Fairs & Folk Music", titleHi: "यूपी संस्कृति, मेले व लोक संगीत", descEn: "Kumbh Mela, Nautanki, Raslila, Birha, Kajari & Charkula", descHi: "कुंभ मेला, नौटंकी, रासलीला, बिरहा, कजरी और चरकुला नृत्य", promptEn: "UPPSC UP Art and Culture, Charkula dance Braj, Kajari Mirzapur, Birha folk song, Magh Mela Prayagraj", promptHi: "यूपी कला एवं संस्कृति, चरकुला नृत्य ब्रज, कजरी मिर्जापुर, बिरहा और माघ मेला", icon: "🎭" },
    { titleEn: "UP Agriculture, Crops & Irrigation", titleHi: "यूपी कृषि, फसलें व सिंचाई", descEn: "Wheat, Sugarcane, Potato, Canals (Sharda Canal) & Tubewells", descHi: "गेहूं, गन्ना, आलू, शारदा नहर और नलकूप सिंचाई", promptEn: "UPPSC UP Agriculture, highest producer sugarcane wheat potato, Sharda canal largest network, tubewell irrigation percentage", promptHi: "यूपी कृषि, गेहूं-गन्ना-आलू उत्पादन में प्रथम स्थान, शारदा नहर और सिंचाई साधन", icon: "🌾" },
    { titleEn: "Environment, Ecology & UP Sanctuaries", titleHi: "पर्यावरण व यूपी के वन्यजीव अभयारण्य", descEn: "Dudhwa National Park, Pilibhit Tiger Reserve, Nawabganj Bird", descHi: "दुधवा राष्ट्रीय उद्यान, पीलीभीत टाइगर रिजर्व, नवाबगंज पक्षी विहार", promptEn: "UPPSC UP Environment and Wildlife, Dudhwa National Park Lakhimpur Kheri, Pilibhit tiger reserve, Okhla bird sanctuary", promptHi: "यूपी पर्यावरण, दुधवा राष्ट्रीय उद्यान लखीमपुर खीरी, पीलीभीत टाइगर रिजर्व और पक्षी विहार", icon: "🌲" },
    { titleEn: "General Studies - Science & Modern Tech", titleHi: "सामान्य अध्ययन - विज्ञान व तकनीक", descEn: "Space, AI, Supercomputers, Nanotech & Renewable Energy", descHi: "अंतरिक्ष, एआई, सुपरकंप्यूटर, नैनोटेक और नवीकरणीय ऊर्जा", promptEn: "UPPSC General Science and Technology, ISRO Gaganyaan, AI applications, renewable energy targets India, nuclear energy", promptHi: "सामान्य विज्ञान व तकनीक, इसरो गगनयान, एआई और भारत के सौर ऊर्जा लक्ष्य", icon: "🔬" },
    { titleEn: "👑 UPPSC PCS Prelims Grand Boss", titleHi: "👑 यूपीपीएससी पीसीएस प्रारंभिक महा-बॉस", descEn: "The ultimate State Civil Services GS Paper-1 Master Challenge!", descHi: "यूपी पीसीएस प्रारंभिक परीक्षा का संपूर्ण सामान्य अध्ययन महा-टेस्ट!", promptEn: "Comprehensive UPPSC State PCS General Studies Paper 1 mock test combining UP Special, Indian polity, history and geography", promptHi: "यूपीपीएससी पीसीएस प्रारंभिक परीक्षा का संपूर्ण महा-मॉक टेस्ट", icon: "👑" },
  ],

  upsc: [
    { titleEn: "Constitutional Framework & Preamble", titleHi: "संविधान का ढांचा व प्रस्तावना", descEn: "Basic Structure Doctrine, Kesavananda Bharati, Federalism", descHi: "मूल ढांचा सिद्धांत, केशवानंद भारती केस, संघवाद और प्रस्तावना", promptEn: "UPSC Prelims Indian Polity, Basic Structure doctrine Kesavananda Bharati 1973, Federal vs Unitary features, Preamble keywords", promptHi: "यूपीएससी प्रारंभिक राजव्यवस्था, मूल ढांचा सिद्धांत, केशवानंद भारती केस और संविधान की प्रस्तावना", icon: "📜" },
    { titleEn: "Ecology, Biodiversity & IUCN Red List", titleHi: "पारिस्थितिकी, जैव विविधता व आईयूसीएन", descEn: "Biosphere Reserves, Ramsar Wetlands, Critically Endangered Species", descHi: "बायोस्फीयर रिजर्व, रामसर आर्द्रभूमि और संकटग्रस्त प्रजातियां", promptEn: "UPSC Prelims Environment Ecology, Ramsar wetland sites India, IUCN Red list critically endangered, Biosphere reserves MAB program", promptHi: "पर्यावरण और पारिस्थितिकी, रामसर स्थल, आईयूसीएन रेड लिस्ट और बायोस्फीयर रिजर्व", icon: "🌿" },
    { titleEn: "Modern History - Gandhian Movements", titleHi: "आधुनिक इतिहास - गांधीवादी आंदोलन", descEn: "Champaran, Non-Cooperation, Civil Disobedience & Poona Pact", descHi: "चंपारण, असहयोग, सविनय अवज्ञा, दांडी मार्च और पूना पैक्ट", promptEn: "UPSC Prelims Modern Indian History, Champaran Satyagraha 1917, Dandi March 1930, Gandhi-Irwin pact, Poona pact Ambedkar", promptHi: "आधुनिक भारत का इतिहास, चंपारण सत्याग्रह, दांडी मार्च 1930, गांधी-इरविन समझौता और पूना पैक्ट", icon: "⚔️" },
    { titleEn: "Physical Geography - Climatology & Oceans", titleHi: "भौतिक भूगोल - जलवायु व महासागर", descEn: "El Nino, Monsoons, Ocean Currents, Jet Streams & Cyclones", descHi: "अल नीनो, भारतीय मानसून, महासागरीय धाराएं और चक्रवात", promptEn: "UPSC Prelims Physical Geography, El Nino Southern Oscillation ENSO, Jet streams, tropical cyclones Coriolis force, ocean currents", promptHi: "भौतिक भूगोल, अल नीनो, जेट स्ट्रीम, उष्णकटिबंधीय चक्रवात और समुद्री धाराएं", icon: "🌪️" },
    { titleEn: "Indian Economy - Fiscal & Monetary Policy", titleHi: "भारतीय अर्थव्यवस्था - राजकोषीय व मौद्रिक नीति", descEn: "Repo Rate, Inflation Targeting, Balance of Payments, Foreign Reserves", descHi: "रेपो रेट, मुद्रास्फीति लक्ष्यीकरण, भुगतान संतुलन और विदेशी मुद्रा भंडार", promptEn: "UPSC Prelims Indian Economy, RBI Monetary Policy Committee MPC, Repo Reverse Repo, Balance of Payments current account deficit, Forex", promptHi: "भारतीय अर्थव्यवस्था, मौद्रिक नीति समिति, चालू खाता घाटा और विदेशी मुद्रा भंडार", icon: "📈" },
    { titleEn: "Art, Architecture & Ancient Literature", titleHi: "कला, वास्तुकला व प्राचीन साहित्य", descEn: "Nagara & Dravida temples, Gandhara Art, Sangam Literature", descHi: "नागर व द्रविड़ मंदिर शैली, गांधार कला और संगम साहित्य", promptEn: "UPSC Prelims Art and Culture, Nagara vs Dravida temple architecture, Gandhara vs Mathura art, Sangam literature poets", promptHi: "भारतीय कला और संस्कृति, नागर व द्रविड़ मंदिर वास्तुकला, गांधार कला और संगम साहित्य", icon: "🏛️" },
    { titleEn: "International Bodies - UN, WTO, IMF & G20", titleHi: "अंतरराष्ट्रीय संगठन - यूएन, डब्ल्यूटीओ व जी20", descEn: "Security Council, Bretton Woods, Climate COPs & G20 Summits", descHi: "सुरक्षा परिषद, विश्व बैंक, जलवायु सम्मेलन और जी20 शिखर सम्मेलन", promptEn: "UPSC Prelims International Relations, United Nations Security Council, WTO dispute settlement, UNFCCC COP summits, G20 New Delhi", promptHi: "अंतरराष्ट्रीय संगठन, संयुक्त राष्ट्र, विश्व व्यापार संगठन, जलवायु कॉप शिखर सम्मेलन और जी20", icon: "🌐" },
    { titleEn: "Science & Frontier Tech - CRISPR & Space", titleHi: "विज्ञान व अत्याधुनिक तकनीक - क्रिसपर व स्पेस", descEn: "Gene Editing CRISPR-Cas9, Quantum Encryption, Gravitational Waves", descHi: "जीन एडिटिंग क्रिसपर, क्वांटम एन्क्रिप्शन और गुरुत्वाकर्षण तरंगें", promptEn: "UPSC Prelims Science and Technology, CRISPR Cas9 gene editing Nobel, LIGO gravitational waves, quantum computing qubits", promptHi: "अत्याधुनिक विज्ञान, क्रिसपर जीन एडिटिंग, लीगो गुरुत्वाकर्षण तरंगें और क्वांटम कंप्यूटिंग", icon: "🧬" },
    { titleEn: "Government Schemes & Social Sector", titleHi: "सरकारी योजनाएं व सामाजिक क्षेत्र", descEn: "Ayushman Bharat, PM-KISAN, Jal Jeevan Mission, Digital India", descHi: "आयुष्मान भारत, पीएम-किसान, जल जीवन मिशन और डिजिटल इंडिया", promptEn: "UPSC Prelims Government Schemes, Ayushman Bharat PMJAY, Jal Jeevan mission rural tap water, PM KISAN income support", promptHi: "भारत सरकार की प्रमुख योजनाएं, आयुष्मान भारत, जल जीवन मिशन और पीएम किसान योजना", icon: "🤝" },
    { titleEn: "👑 UPSC IAS/IPS Prelims Grand Boss", titleHi: "👑 यूपीएससी सिविल सेवा महा-बॉस", descEn: "The Pinnacle General Studies Paper 1 Civil Services Simulation!", descHi: "सिविल सेवा प्रारंभिक परीक्षा का सर्वोच्च और सबसे प्रतिष्ठित महा-मुकाबला!", promptEn: "Ultimate UPSC Civil Services IAS Prelims General Studies Paper 1 conceptual multi-statement mock test", promptHi: "यूपीएससी सिविल सेवा आईएएस प्रारंभिक परीक्षा का सर्वोच्च सामान्य अध्ययन महा-टेस्ट", icon: "👑" },
  ],

  railway: [
    { titleEn: "Indian Railways - History & Firsts", titleHi: "भारतीय रेलवे - इतिहास व प्रथम घटनाएं", descEn: "1853 Mumbai-Thane first train, Lord Dalhousie, First Electric Train", descHi: "1853 मुंबई-ठाणे पहली ट्रेन, लॉर्ड डलहौजी, पहली इलेक्ट्रिक ट्रेन", promptEn: "Railway RRB Indian Railways history, first passenger train 1853 Mumbai Thane, Lord Dalhousie, first electric train 1925 Deccan Queen", promptHi: "भारतीय रेलवे का इतिहास, 1853 मुंबई-ठाणे पहली ट्रेन, लॉर्ड डलहौजी और पहली इलेक्ट्रिक ट्रेन", icon: "🚆" },
    { titleEn: "Railway Zones & Headquarters", titleHi: "रेलवे ज़ोन व मुख्यालय", descEn: "18 Zones, Northern Railway (Delhi), Western Railway (Mumbai), Konkan", descHi: "18 रेलवे जोन, उत्तर रेलवे (दिल्ली), पश्चिम रेलवे (मुंबई) और कोंकण रेलवे", promptEn: "Railway RRB Indian Railway Zones and headquarters, 18 zones, Northern Delhi, Southern Chennai, Eastern Kolkata, Konkan railway", promptHi: "भारतीय रेलवे के 18 जोन और उनके मुख्यालय, उत्तर रेलवे दिल्ली, दक्षिण रेलवे चेन्नई", icon: "🚉" },
    { titleEn: "General Science - Motion & Electricity", titleHi: "सामान्य विज्ञान - गति, बल व विद्युत", descEn: "Ohm's Law, Resistance, Power, Kinetic Energy & Gravity", descHi: "ओम का नियम, प्रतिरोध, शक्ति, गतिज ऊर्जा और गुरुत्वाकर्षण", promptEn: "Railway RRB General Science Physics, Ohm law V=IR, electrical power Watt, kinetic energy formula, gravitational acceleration g=9.8", promptHi: "रेलवे सामान्य विज्ञान भौतिकी, ओम का नियम, विद्युत शक्ति वाट और गतिज ऊर्जा", icon: "⚡" },
    { titleEn: "Indian Geography - Major Ports & Minerals", titleHi: "भूगोल - प्रमुख बंदरगाह व खनिज", descEn: "Kandla, Nhava Sheva, Paradip, Coal mines & Iron ore belts", descHi: "कांडला, न्हावा शेवा, पारादीप, कोयला खदानें व लौह अयस्क", promptEn: "Railway RRB Indian Geography, Major sea ports Kandla Gujarat, Paradip Odisha, Jharia coal mines Jharkhand, Kudremukh iron ore", promptHi: "भारतीय भूगोल, प्रमुख बंदरगाह कांडला, पारादीप, झरिया कोयला खदानें और लौह अयस्क", icon: "⚓" },
    { titleEn: "General Science - Chemistry & Metals", titleHi: "सामान्य विज्ञान - रसायन व धातुएं", descEn: "Rusting of iron, Galvanization, Heavy metals & Noble gases", descHi: "लोहे पर जंग, गैल्वनीकरण, भारी धातुएं और उत्कृष्ट गैसें", promptEn: "Railway RRB General Science Chemistry, Galvanization zinc coating, heavy water D2O, noble gases argon helium, atomic mass", promptHi: "रेलवे रसायन विज्ञान, लोहे पर जंग लगना, गैल्वनीकरण जस्ता परत और भारी जल D2O", icon: "🧪" },
    { titleEn: "Indian History - Wars & Treaties", titleHi: "इतिहास - प्रमुख युद्ध व संधियां", descEn: "Battle of Buxar, Anglo-Mysore wars, Treaty of Salbai", descHi: "बक्सर का युद्ध, आंग्ल-मैसूर युद्ध, सालबाई की संधि", promptEn: "Railway RRB History, Battle of Buxar 1764, Tipu Sultan Anglo-Mysore wars, Treaty of Bassein, Revolt of 1857", promptHi: "इतिहास, बक्सर का युद्ध 1764, टीपू सुल्तान और आंग्ल-मैसूर युद्ध", icon: "⚔️" },
    { titleEn: "General Science - Biology & Human Body", titleHi: "सामान्य विज्ञान - जीवविज्ञान व मानव शरीर", descEn: "Red Blood Cells, White Blood Cells, Nephrons, Photosynthesis", descHi: "लाल रक्त कणिकाएं (RBC), नेफ्रॉन (किडनी), हीमोग्लोबिन व श्वसन", promptEn: "Railway RRB General Science Biology, RBC lifespan 120 days, kidney unit nephron, hemoglobin iron, respiration in cells", promptHi: "रेलवे जीवविज्ञान, आरबीसी जीवनकाल 120 दिन, नेफ्रॉन, हीमोग्लोबिन और श्वसन क्रिया", icon: "🫀" },
    { titleEn: "Vande Bharat, Bullet Train & Modern Tech", titleHi: "वंदे भारत, बुलेट ट्रेन व आधुनिक तकनीक", descEn: "Train 18, Ahmedabad-Mumbai bullet train, DFC corridors", descHi: "ट्रेन 18, अहमदाबाद-मुंबई बुलेट ट्रेन, डेडिकेटेड फ्रेट कॉरिडोर", promptEn: "Railway RRB Modern Railways, Vande Bharat Express Train 18 speed, Mumbai Ahmedabad bullet train Shinkansen, Dedicated Freight Corridor", promptHi: "आधुनिक भारतीय रेलवे, वंदे भारत ट्रेन 18, बुलेट ट्रेन परियोजना और डेडिकेटेड फ्रेट कॉरिडोर", icon: "🚄" },
    { titleEn: "Indian Constitution - Fundamental Duties", titleHi: "भारतीय संविधान - मौलिक कर्तव्य व संसद", descEn: "Article 51A, 42nd Amendment, Lok Sabha & Rajya Sabha terms", descHi: "अनुच्छेद 51A, 42वां संशोधन, लोकसभा व राज्यसभा का कार्यकाल", promptEn: "Railway RRB Indian Polity, Fundamental duties Article 51A Swaran Singh committee, 42nd amendment 1976, Lok Sabha term 5 years", promptHi: "भारतीय संविधान, मौलिक कर्तव्य अनुच्छेद 51A, 42वां संशोधन और लोकसभा", icon: "🏛️" },
    { titleEn: "👑 RRB NTPC Grand Speed Boss", titleHi: "👑 रेलवे एनटीपीसी महा-बॉस", descEn: "Full Speed Championship mock test for Railway Aspirants!", descHi: "रेलवे भर्ती परीक्षा का संपूर्ण स्पीड और एक्यूरेसी महा-मुकाबला!", promptEn: "Comprehensive Railway RRB NTPC General Awareness mock test with railway GK, physics, biology, history and geography", promptHi: "रेलवे आरआरबी एनटीपीसी सामान्य ज्ञान का संपूर्ण महा-मॉक टेस्ट", icon: "👑" },
  ],

  banking: [
    { titleEn: "Reserve Bank of India (RBI) & Structure", titleHi: "भारतीय रिजर्व बैंक (RBI) व संरचना", descEn: "RBI Act 1934, Governor, Functions, Currency Printing & MPC", descHi: "आरबीआई अधिनियम 1934, गवर्नर, कार्य, नोट छपाई और मौद्रिक नीति", promptEn: "Banking IBPS RBI history, established 1935 RBI Act 1934, nationalization 1949, RBI governor powers, currency printing presses", promptHi: "बैंकिंग आईबीपीएस, आरबीआई स्थापना 1935, राष्ट्रीयकरण 1949, नोट प्रेस और गवर्नर", icon: "🏦" },
    { titleEn: "Monetary Policy & Interest Rates", titleHi: "मौद्रिक नीति व ब्याज दरें", descEn: "Repo Rate, Reverse Repo, CRR, SLR, MSF & Bank Rate", descHi: "रेपो रेट, रिवर्स रेपो, सीआरआर (CRR), एसएलआर (SLR), एमएसएफ", promptEn: "Banking Awareness, Repo rate, Cash Reserve Ratio CRR, Statutory Liquidity Ratio SLR, Marginal Standing Facility MSF", promptHi: "बैंकिंग अवेयरनेस, रेपो रेट, नकद आरक्षित अनुपात सीआरआर, एसएलआर और एमएसएफ", icon: "📈" },
    { titleEn: "Types of Bank Accounts & Cheques", titleHi: "बैंक खातों के प्रकार व चेक के नियम", descEn: "Savings, Current, FD, RD, CTS-2010, Crossing of Cheques", descHi: "बचत खाता, चालू खाता, एफडी, आरडी, चेक रेखांकन और सीटीएस", promptEn: "Banking Awareness, Savings vs Current account, Fixed deposit, recurring deposit, bearer cheque, crossed cheque, CTS 2010", promptHi: "बैंक खातों के प्रकार, बचत-चालू खाता, फिक्स्ड डिपॉजिट और रेखांकित चेक", icon: "💳" },
    { titleEn: "Digital Payments - UPI, NEFT, RTGS & IMPS", titleHi: "डिजिटल भुगतान - यूपीआई, एनईएफटी व आरटीजीएस", descEn: "NPCI, UPI limits, RTGS 24x7, NEFT batch processing, IFSC code", descHi: "एनपीसीआई, यूपीआई सीमाएं, आरटीजीएस, एनईएफटी और आईएफएससी कोड", promptEn: "Banking Awareness Digital Payments, NPCI National Payments Corporation, Unified Payments Interface UPI, NEFT RTGS timing, IFSC 11 characters", promptHi: "डिजिटल भुगतान, यूपीआई, एनपीसीआई, एनईएफटी, आरटीजीएस और 11 अंकों का आईएफएससी कोड", icon: "📱" },
    { titleEn: "Inflation, Deflation & CPI/WPI", titleHi: "मुद्रास्फीति, डिफ्लेशन व सीपीआई/डब्ल्यूपीआई", descEn: "Consumer Price Index, Wholesale Price Index, Core Inflation", descHi: "उपभोक्ता मूल्य सूचकांक (CPI), थोक मूल्य सूचकांक (WPI) और महंगाई", promptEn: "Banking Awareness Inflation, Consumer price index CPI base year 2012, Wholesale price index WPI, headline vs core inflation", promptHi: "मुद्रास्फीति, उपभोक्ता मूल्य सूचकांक सीपीआई, थोक मूल्य सूचकांक और आधार वर्ष", icon: "📉" },
    { titleEn: "Financial Regulators - SEBI, IRDAI & PFRDA", titleHi: "वित्तीय नियामक - सेबी, इरडा व पीएफआरडीए", descEn: "Stock markets, Insurance regulator, Pension funds & NABARD", descHi: "शेयर बाजार नियामक सेबी, बीमा नियामक इरडा और नाबार्ड", promptEn: "Banking Awareness Regulators, SEBI stock exchange regulator 1992, IRDAI insurance Hyderabad, NABARD agriculture 1982, PFRDA pension", promptHi: "वित्तीय नियामक, सेबी शेयर बाजार, इरडा बीमा, नाबार्ड कृषि बैंक और पीएफआरडीए", icon: "🏢" },
    { titleEn: "NPA, Basel Norms & SARFAESI Act", titleHi: "एनपीए (NPA), बेसल मानक व सरफेसी एक्ट", descEn: "Non-Performing Assets (90 days), Capital Adequacy, IBC Code", descHi: "गैर-निष्पादित संपत्ति (90 दिन), बेसल III नियम और ऋण वसूली", promptEn: "Banking Awareness, Non Performing Asset NPA 90 days criteria, Basel III capital adequacy ratio CAR, SARFAESI act 2002", promptHi: "बैंकिंग एनपीए 90 दिन नियम, बेसल 3 मानक और सरफेसी एक्ट 2002", icon: "📑" },
    { titleEn: "Financial Inclusion & Jan Dhan (PMJDY)", titleHi: "वित्तीय समावेशन व जन धन योजना", descEn: "PMJDY zero balance, Overdraft, RuPay debit card, Microfinance", descHi: "पीएम जन धन योजना, ओवरड्राफ्ट सुविधा, रुपे डेबिट कार्ड", promptEn: "Banking Awareness Government Schemes, Pradhan Mantri Jan Dhan Yojana PMJDY, RuPay card insurance, MUDRA loans Shishu Kishor Tarun", promptHi: "प्रधानमंत्री जन धन योजना, रुपे कार्ड, ओवरड्राफ्ट और मुद्रा लोन शिशु किशोर तरुण", icon: "💰" },
    { titleEn: "International Financial Org - IMF, World Bank, ADB", titleHi: "अंतरराष्ट्रीय वित्तीय संस्थाएं - आईएमएफ व एडीबी", descEn: "Special Drawing Rights (SDR), Manila ADB, Washington DC", descHi: "स्पेशल ड्रॉइंग राइट्स (SDR), एशियाई विकास बैंक और विश्व बैंक", promptEn: "Banking Awareness International Institutions, IMF World Bank headquarters Washington DC, SDR currency basket, Asian Development Bank Manila", promptHi: "अंतरराष्ट्रीय वित्तीय संगठन, आईएमएफ, विश्व बैंक वाशिंगटन, एसडीआर और एशियाई विकास बैंक", icon: "🌐" },
    { titleEn: "👑 IBPS PO Banking Titan Boss", titleHi: "👑 आईबीपीएस पीओ बैंकिंग महा-बॉस", descEn: "The Ultimate Banking Awareness & Financial Mastery Challenge!", descHi: "बैंकिंग अवेयरनेस और वित्तीय ज्ञान का संपूर्ण निर्णायक महा-मुकाबला!", promptEn: "Comprehensive IBPS PO Banking Awareness mock test covering RBI monetary policy, digital banking, financial terms and economy", promptHi: "आईबीपीएस पीओ बैंकिंग अवेयरनेस का संपूर्ण महा-मॉक टेस्ट", icon: "👑" },
  ],

  india: [
    { titleEn: "Incredible India Heritage & Symbols", titleHi: "अतुल्य भारत - राष्ट्रीय प्रतीक व धरोहर", descEn: "National Flag, Emblem, Anthem, Tiger, Lotus & Heritage Sites", descHi: "राष्ट्रीय ध्वज, प्रतीक, गान, बाघ, कमल व यूनेस्को धरोहर स्थल", promptEn: "India GK National symbols, Tiranga design Pingali Venkayya, National song Vande Mataram, UNESCO heritage sites India Taj Mahal Red Fort", promptHi: "भारत के राष्ट्रीय प्रतीक, तिरंगा, राष्ट्रगान, यूनेस्को धरोहर स्थल और ताजमहल", icon: "🇮🇳" },
    { titleEn: "Indian States, Capitals & High Courts", titleHi: "भारतीय राज्य, राजधानियां व उच्च न्यायालय", descEn: "28 States, 8 UTs, Capitals, Official Languages & High Courts", descHi: "28 राज्य, 8 केंद्र शासित प्रदेश, राजधानियां और भाषाएं", promptEn: "Indian States capitals, North Eastern seven sisters capitals, Union Territories capitals, High Courts with jurisdiction", promptHi: "भारतीय राज्य और राजधानियां, पूर्वोत्तर राज्य, केंद्र शासित प्रदेश और उच्च न्यायालय", icon: "🗺️" },
    { titleEn: "Sacred Rivers, Dams & Waterfalls", titleHi: "पवित्र नदियां, प्रमुख बांध व जलप्रपात", descEn: "Ganga, Godavari (Dakshin Ganga), Tehri Dam, Jog Falls", descHi: "गंगा, गोदावरी (दक्षिण गंगा), टिहरी बांध और जोग जलप्रपात", promptEn: "Major Indian Rivers, longest river Ganga, Dakshin Ganga Godavari, highest dam Tehri, Hirakud longest dam, Jog Falls", promptHi: "भारत की प्रमुख नदियां, टिहरी बांध, हीराकुंड बांध और जोग जलप्रपात", icon: "🌊" },
    { titleEn: "Freedom Struggle & National Heroes", titleHi: "स्वतंत्रता संग्राम व राष्ट्रीय महानायक", descEn: "Bhagat Singh, Subhash Chandra Bose, Gandhi, 1857 Revolt", descHi: "भगत सिंह, सुभाष चंद्र बोस, महात्मा गांधी और 1857 की क्रांति", promptEn: "Indian Freedom Struggle, Netaji Azad Hind Fauj, Bhagat Singh, Dandi March 1930, Quit India movement", promptHi: "भारतीय स्वतंत्रता संग्राम, नेताजी सुभाष चंद्र बोस, भगत सिंह, दांडी यात्रा और भारत छोड़ो आंदोलन", icon: "⚔️" },
    { titleEn: "Indian Constitution & Democratic System", titleHi: "भारतीय संविधान व लोकतांत्रिक व्यवस्था", descEn: "Preamble, Fundamental Rights, Lok Sabha, Rajya Sabha & President", descHi: "प्रस्तावना, मौलिक अधिकार, लोकसभा, राज्यसभा और राष्ट्रपति", promptEn: "Indian Constitution fundamentals, Father of constitution Dr BR Ambedkar, Lok Sabha speaker, Supreme Court Chief Justice", promptHi: "भारतीय संविधान, डॉ. भीमराव अंबेडकर, मौलिक अधिकार, लोकसभा और राज्यसभा", icon: "📜" },
    { titleEn: "Famous Temples, Monuments & Caves", titleHi: "प्रसिद्ध मंदिर, स्मारक व ऐतिहासिक गुफाएं", descEn: "Ajanta-Ellora, Konark Sun Temple, Meenakshi & Qutub Minar", descHi: "अजंता-एलोरा, कोणार्क सूर्य मंदिर, मीनाक्षी मंदिर और कुतुब मीनार", promptEn: "Indian historical monuments, Ajanta Ellora caves Maharashtra, Konark Sun Temple Odisha, Meenakshi temple Madurai, Brihadeeswara", promptHi: "भारत के प्रसिद्ध मंदिर, अजंता एलोरा गुफाएं, कोणार्क सूर्य मंदिर और मीनाक्षी मंदिर", icon: "🏰" },
    { titleEn: "Mountain Peaks, Passes & Desert", titleHi: "पर्वत शिखर, दर्रे व थार रेगिस्तान", descEn: "Kanchenjunga, Western Ghats, Nathu La, Thar & Rann of Kutch", descHi: "कंचनजंगा, पश्चिमी घाट, नाथू ला दर्रा और कच्छ का रण", promptEn: "Indian Mountains and geography, highest peak Kanchenjunga in India, Zoji La pass, Thar desert, Western vs Eastern Ghats", promptHi: "भारत के पर्वत शिखर, कंचनजंगा, नाथू ला दर्रा और थार रेगिस्तान", icon: "🏔️" },
    { titleEn: "Classical Dances & Musical Traditions", titleHi: "शास्त्रीय नृत्य व संगीत परंपराएं", descEn: "Kathak, Bharatanatyam, Kathakali, Sitar, Tabla & Gharanas", descHi: "कथक, भरतनाट्यम, कथकली, सितार, तबला और प्रमुख घराने", promptEn: "Indian Classical Dances Bharatanatyam Tamil Nadu, Kathak UP, Kathakali Kerala, Pandit Ravi Shankar Sitar, Ustad Bismillah Khan Shehnai", promptHi: "भारतीय शास्त्रीय नृत्य, भरतनाट्यम, कथक, कथकली, पंडित रविशंकर और बिस्मिल्लाह खान", icon: "🎭" },
    { titleEn: "ISRO Space Missions & Nuclear Tech", titleHi: "इसरो अंतरिक्ष अभियान व विज्ञान", descEn: "Chandrayaan-3, Mangalyaan, Gaganyaan, Pokhran & APJ Abdul Kalam", descHi: "चंद्रयान-3, मंगलयान, गगनयान, पोखरण और डॉ. कलाम", promptEn: "ISRO space achievements, Chandrayaan 3 Moon South Pole, Mangalyaan Mars mission, Dr APJ Abdul Kalam Missile Man of India", promptHi: "इसरो की उपलब्धियां, चंद्रयान-3, मंगलयान, डॉ. एपीजे अब्दुल कलाम और भारत का अंतरिक्ष कार्यक्रम", icon: "🚀" },
    { titleEn: "👑 Bharat Ratna Grand Emperor Boss", titleHi: "👑 भारत रत्न महा-सम्राट बॉस", descEn: "The ultimate India General Knowledge mastery championship!", descHi: "संपूर्ण भारत सामान्य ज्ञान का निर्णायक महा-मुकाबला!", promptEn: "Comprehensive India General Knowledge championship questions on Indian history, geography, constitution, culture and heritage", promptHi: "संपूर्ण भारत सामान्य ज्ञान महा-मॉक टेस्ट - इतिहास, भूगोल, संस्कृति व संविधान", icon: "👑" },
  ],

  world: [
    { titleEn: "World Capitals & Major Currencies", titleHi: "विश्व की राजधानियां व मुद्राएं", descEn: "Tokyo (Yen), London (Pound), Paris (Euro), Washington (Dollar)", descHi: "टोक्यो, लंदन, पेरिस, वाशिंगटन और दुनिया की प्रमुख मुद्राएं", promptEn: "World geography capitals and currencies, Japan Tokyo Yen, UK London Pound, Australia Canberra, Canada Ottawa", promptHi: "विश्व की राजधानियां और मुद्राएं, जापान, यूके, ऑस्ट्रेलिया और कनाडा", icon: "🌍" },
    { titleEn: "7 Wonders & Global Landmarks", titleHi: "विश्व के 7 अजूबे व प्रसिद्ध स्मारक", descEn: "Great Wall of China, Colosseum, Machu Picchu, Pyramids of Giza", descHi: "चीन की दीवार, कोलोसियम, माचू पिच्चू और मिस्र के पिरामिड", promptEn: "Seven Wonders of the World, Great Wall of China, Machu Picchu Peru, Colosseum Rome, Pyramids of Giza Egypt", promptHi: "विश्व के सात अजूबे, चीन की विशाल दीवार, माचू पिच्चू और गीजा के पिरामिड", icon: "🏛️" },
    { titleEn: "Oceans, Seas & Famous Straits", titleHi: "महासागर, समुद्र व जलसंधियां", descEn: "Pacific, Atlantic, Mariana Trench, Strait of Malacca, Suez Canal", descHi: "प्रशांत, अटलांटिक महासागर, मेरियाना गर्त और स्वेज नहर", promptEn: "World Oceans and straits, deepest point Mariana Trench Pacific, Suez Canal connecting Mediterranean Red Sea, Strait of Gibraltar", promptHi: "विश्व के महासागर, सबसे गहरा गर्त मेरियाना ट्रेंच और स्वेज नहर", icon: "🌊" },
    { titleEn: "Continents, Deserts & Longest Rivers", titleHi: "महाद्वीप, रेगिस्तान व सबसे लंबी नदियां", descEn: "Nile, Amazon, Sahara Desert, Antarctica & Mount Everest", descHi: "नील नदी, अमेज़न, सहारा मरुस्थल और माउंट एवरेस्ट", promptEn: "World geography superlatives, longest river Nile, largest river by volume Amazon, largest hot desert Sahara, highest peak Mount Everest", promptHi: "विश्व का भूगोल, सबसे लंबी नदी नील, सहारा रेगिस्तान और माउंट एवरेस्ट", icon: "🏔️" },
    { titleEn: "International Organizations & UN", titleHi: "अंतरराष्ट्रीय संगठन व संयुक्त राष्ट्र", descEn: "United Nations (UN), UNESCO, WHO Geneva, ICJ The Hague", descHi: "संयुक्त राष्ट्र (UN), यूनेस्को, डब्ल्यूएचओ और अंतरराष्ट्रीय न्यायालय", promptEn: "International Organizations, UN headquarters New York, WHO Geneva, ICJ The Hague Netherlands, UNESCO Paris", promptHi: "अंतरराष्ट्रीय संगठन, संयुक्त राष्ट्र संघ, डब्ल्यूएचओ और यूनेस्को", icon: "🌐" },
    { titleEn: "World History - Wars & Revolutions", titleHi: "विश्व इतिहास - क्रांतियां व महायुद्ध", descEn: "French Revolution 1789, World War I, World War II, Industrial Rev", descHi: "फ्रांसीसी क्रांति, प्रथम व द्वितीय विश्व युद्ध और औद्योगिक क्रांति", promptEn: "World History, French Revolution 1789 Bastille, World War I 1914 1918, World War II atomic bomb Hiroshima Nagasaki", promptHi: "विश्व इतिहास, फ्रांसीसी क्रांति 1789, प्रथम व द्वितीय विश्व युद्ध", icon: "⚔️" },
    { titleEn: "Global Volcanoes, Earthquakes & Islands", titleHi: "ज्वालामुखी, भूकंप व प्रमुख द्वीप", descEn: "Ring of Fire, Greenland (Largest Island), Mount Fuji, Hawaii", descHi: "रिंग ऑफ फायर, ग्रीनलैंड (सबसे बड़ा द्वीप) और माउंट फूजी", promptEn: "Physical Geography, Pacific Ring of Fire volcanoes, largest island Greenland, Mount Vesuvius, archipelago Indonesia", promptHi: "विश्व भूगोल, प्रशांत रिंग ऑफ फायर, ग्रीनलैंड और प्रमुख द्वीप", icon: "🌋" },
    { titleEn: "World Flags, National Anthems & Maps", titleHi: "विश्व के ध्वज, राष्ट्रगान व मानचित्र", descEn: "Maple Leaf (Canada), Union Jack, Land of Rising Sun (Japan)", descHi: "विभिन्न देशों के ध्वज, उपनाम और उगते सूरज का देश", promptEn: "World Static GK, Land of Rising Sun Japan, Land of Midnight Sun Norway, Maple leaf flag Canada, Union Jack UK", promptHi: "विश्व स्टेटिक जीके, उगते सूरज का देश जापान, मध्य रात्रि के सूरज का देश नॉर्वे", icon: "🚩" },
    { titleEn: "Space Exploration & Solar System", titleHi: "अंतरिक्ष व हमारा सौरमंडल", descEn: "Sun, Jupiter (Largest Planet), Mars (Red Planet), Moon Missions", descHi: "सूर्य, बृहस्पति, मंगल ग्रह (लाल ग्रह) और अपोलो मिशन", promptEn: "Astronomy and solar system, largest planet Jupiter, Red Planet Mars, Neil Armstrong first man on Moon 1969 Apollo 11", promptHi: "सौरमंडल, सबसे बड़ा ग्रह बृहस्पति, लाल ग्रह मंगल और नील आर्मस्ट्रांग", icon: "🪐" },
    { titleEn: "👑 Global Realm Supreme Titan Boss", titleHi: "👑 विश्व भूगोल महा-टाइटैन बॉस", descEn: "The Ultimate World Geography & Global General Knowledge Championship!", descHi: "संपूर्ण विश्व भूगोल और अंतरराष्ट्रीय ज्ञान का महा-मुकाबला!", promptEn: "Comprehensive World Geography and Global GK championship quiz covering capitals, rivers, wonders, UN and history", promptHi: "संपूर्ण विश्व भूगोल व अंतरराष्ट्रीय सामान्य ज्ञान का महा-मॉक टेस्ट", icon: "👑" },
  ],

  subjects: [
    { titleEn: "Physics - Motion, Gravity & Energy", titleHi: "भौतिकी - गति, गुरुत्वाकर्षण व ऊर्जा", descEn: "Newton laws, Speed of light (3x10^8 m/s), Kinetic & Potential energy", descHi: "न्यूटन के नियम, प्रकाश की चाल और गतिज ऊर्जा", promptEn: "General Science Physics, Newton laws of motion, speed of light, gravity acceleration 9.8, kinetic energy", promptHi: "सामान्य विज्ञान भौतिकी, गति के नियम, प्रकाश की गति और गुरुत्वाकर्षण", icon: "⚡" },
    { titleEn: "Biology - Cells, DNA & Genetics", titleHi: "जीवविज्ञान - कोशिका, डीएनए व आनुवंशिकी", descEn: "Mitochondria (Powerhouse of Cell), DNA double helix, Plant cells", descHi: "माइटोकॉन्ड्रिया (कोशिका का पावरहाउस), डीएनए और पादप कोशिका", promptEn: "General Science Biology cell structure, mitochondria powerhouse of cell, DNA double helix Watson Crick, plant photosynthesis chlorophyll", promptHi: "कोशिका संरचना, माइटोकॉन्ड्रिया, डीएनए और प्रकाश संश्लेषण क्लोरोफिल", icon: "🧬" },
    { titleEn: "Chemistry - Periodic Table & Elements", titleHi: "रसायन - आवर्त सारणी व प्रमुख तत्व", descEn: "Hydrogen, Gold (Au), Silver (Ag), Noble gases & Atomic number", descHi: "हाइड्रोजन, सोना, चांदी, नोबल गैसें और परमाणु क्रमांक", promptEn: "General Science Chemistry periodic table, lightest element Hydrogen, liquid metal Mercury, atomic number", promptHi: "रसायन विज्ञान आवर्त सारणी, सबसे हल्का तत्व, द्रव धातु पारा और नोबल गैसें", icon: "🧪" },
    { titleEn: "Human Anatomy - Brain, Heart & Blood", titleHi: "मानव शरीर - मस्तिष्क, हृदय व रक्त", descEn: "4 Heart Chambers, Hemoglobin, Universal Donor O-, Cerebrum", descHi: "हृदय के 4 कक्ष, हीमोग्लोबिन, सर्वदाता रक्त O- और मस्तिष्क", promptEn: "Human Anatomy, 4 chambers of heart, hemoglobin oxygen carrier, blood groups Karl Landsteiner, cerebrum largest brain part", promptHi: "मानव शरीर रचना, हृदय के कक्ष, हीमोग्लोबिन, रक्त समूह और मस्तिष्क", icon: "🫀" },
    { titleEn: "Inventions & Great Scientists", titleHi: "प्रमुख आविष्कार व महान वैज्ञानिक", descEn: "Einstein, Thomas Edison, Alexander Fleming (Penicillin), Newton", descHi: "आइंस्टीन, थॉमस एडिसन, अलेक्जेंडर फ्लेमिंग (पेनिसिलिन) व न्यूटन", promptEn: "Famous scientific inventions, Penicillin Alexander Fleming, Telephone Alexander Graham Bell, Light bulb Edison, Theory of Relativity Einstein", promptHi: "महान आविष्कारक, पेनिसिलिन की खोज, टेलीफोन, बल्ब और आइंस्टीन", icon: "🔬" },
    { titleEn: "Ecology, Environment & Global Warming", titleHi: "पारिस्थितिकी, पर्यावरण व ग्लोबल वार्मिंग", descEn: "Greenhouse effect, Ozone layer (O3), Food chain & Biodiversity", descHi: "ग्रीनहाउस प्रभाव, ओजोन परत (O3), खाद्य श्रृंखला व जैव विविधता", promptEn: "Environmental Science, Greenhouse gases CO2 methane, Ozone layer depletion CFCs stratosphere, trophic levels food chain", promptHi: "पर्यावरण विज्ञान, ग्रीनहाउस गैसें, ओजोन परत और खाद्य श्रृंखला", icon: "🌱" },
    { titleEn: "Everyday Science & Chemical Reactions", titleHi: "दैनिक विज्ञान व रासायनिक क्रियाएं", descEn: "Rusting of iron, Milk to curd (Lactobacillus), Baking soda pH", descHi: "लोहे पर जंग, दूध से दही जमना (लैक्टोबैसिलस) और बेकिंग सोडा", promptEn: "Everyday Science, rusting of iron oxidation, Lactobacillus bacteria milk to curd, baking soda sodium bicarbonate, vinegar acetic acid", promptHi: "दैनिक जीवन का विज्ञान, जंग लगना, लैक्टोबैसिलस जीवाणु और सिरका एसिटिक अम्ल", icon: "💡" },
    { titleEn: "Modern Tech - AI, Computers & Internet", titleHi: "आधुनिक तकनीक - एआई, कंप्यूटर व इंटरनेट", descEn: "CPU (Brain of Computer), Artificial Intelligence, Binary, WiFi", descHi: "सीपीयू (कंप्यूटर का मस्तिष्क), एआई, बाइनरी कोड और वाई-फाई", promptEn: "Computer and Modern Technology, CPU central processing unit, Alan Turing father of modern computing, binary 0 and 1, cloud computing", promptHi: "कंप्यूटर व आधुनिक तकनीक, सीपीयू, एलन ट्यूरिंग, बाइनरी कोड और इंटरनेट", icon: "💻" },
    { titleEn: "Space, Stars & Astrophysics", titleHi: "अंतरिक्ष, तारे व खगोल भौतिकी", descEn: "Black holes, Supernova, Light year (Distance unit), Hubble", descHi: "ब्लैक होल, सुपरनोवा, प्रकाश वर्ष (दूरी का मात्रक) और हबल", promptEn: "Astronomy and Astrophysics, Light year unit of astronomical distance, Black hole event horizon, Sun closest star, Andromeda galaxy", promptHi: "खगोल विज्ञान, प्रकाश वर्ष दूरी का मात्रक, ब्लैक होल और सूर्य", icon: "🌌" },
    { titleEn: "👑 Grand Science Einstein Titan Boss", titleHi: "👑 महा-वैज्ञानिक आइंस्टीन बॉस", descEn: "The Ultimate Science & Technology Grand Championship Test!", descHi: "संपूर्ण विज्ञान और तकनीक का निर्णायक महा-मुकाबला!", promptEn: "Comprehensive General Science championship test combining physics, chemistry, biology, space and technology", promptHi: "संपूर्ण सामान्य विज्ञान महा-मॉक टेस्ट - भौतिकी, रसायन, जीवविज्ञान व तकनीक", icon: "👑" },
  ],

  mix: [
    { titleEn: "Potpourri GK - India & World Mix", titleHi: "मिश्रित सामान्य ज्ञान - भारत व विश्व", descEn: "A vibrant blend of top facts from Indian history and world wonders", descHi: "भारतीय इतिहास, विश्व भूगोल और सामान्य ज्ञान का रोचक मिश्रण", promptEn: "Mix General Knowledge potpourri questions covering Indian history, world geography, monuments and sports", promptHi: "मिश्रित सामान्य ज्ञान, भारतीय इतिहास, विश्व भूगोल और खेल", icon: "🎯" },
    { titleEn: "Science & Nature Potpourri", titleHi: "विज्ञान व प्रकृति का संगम", descEn: "Fascinating facts across biology, physics and our planet Earth", descHi: "जीवविज्ञान, भौतिकी और पृथ्वी के आश्चर्यजनक तथ्य", promptEn: "Mix GK Science questions combining everyday physics, human body, animals and ecology", promptHi: "सामान्य विज्ञान व प्रकृति के रोचक और आवश्यक प्रश्न", icon: "🌿" },
    { titleEn: "History & Cultural Heritage Blend", titleHi: "इतिहास व संस्कृति की महा-परीक्षा", descEn: "Empires, revolutions, monuments and classical traditions", descHi: "साम्राज्य, क्रांतियां, ऐतिहासिक इमारतें और सांस्कृतिक परंपराएं", promptEn: "Mix GK History and Culture combining ancient India, medieval monuments and world landmarks", promptHi: "इतिहास और संस्कृति का मिला-जुला महा-टेस्ट", icon: "🏺" },
    { titleEn: "Sports, Awards & Famous Personalities", titleHi: "खेल, सम्मान व विश्व विभूतियां", descEn: "Olympics, Nobel Prizes, Bharat Ratna & Legendary Leaders", descHi: "ओलंपिक, नोबेल पुरस्कार, भारत रत्न और महान नेता", promptEn: "Mix GK Sports and Awards, Nobel prize winners, Olympic records, Bharat Ratna, famous world personalities", promptHi: "खेल, नोबेल पुरस्कार, भारत रत्न और प्रसिद्ध हस्तियां", icon: "🏆" },
    { titleEn: "Constitution, Politics & Global Orgs", titleHi: "संविधान, राजनीति व अंतरराष्ट्रीय मंच", descEn: "Democratic systems, UN bodies, Prime Ministers and global treaties", descHi: "लोकतांत्रिक व्यवस्थाएं, संयुक्त राष्ट्र और अंतरराष्ट्रीय मंच", promptEn: "Mix GK Indian Polity and International relations, UN agencies, Constitution preamble, parliament system", promptHi: "भारतीय राजव्यवस्था, संयुक्त राष्ट्र और वैश्विक संगठन", icon: "⚖️" },
    { titleEn: "Geography & Oceans Potpourri", titleHi: "भूगोल व महासागरों का महा-संगम", descEn: "Rivers, mountains, capitals, deserts and oceanic trenches", descHi: "नदियां, पर्वत, राजधानियां, रेगिस्तान और महासागरीय गर्त", promptEn: "Mix GK Geography combining Indian rivers, world capitals, mountain passes and oceans", promptHi: "भूगोल का मिश्रित टेस्ट - नदियां, राजधानियां और पर्वत", icon: "🗺️" },
    { titleEn: "Inventions, Discoveries & Modern Tech", titleHi: "आविष्कार, खोजें व आधुनिक तकनीक", descEn: "From the invention of wheel and electricity to AI and space probes", descHi: "पहिए और बिजली के आविष्कार से लेकर एआई व अंतरिक्ष यान तक", promptEn: "Mix GK Inventions and discoveries, famous scientists, computer milestones, space exploration", promptHi: "प्रसिद्ध आविष्कार, वैज्ञानिक खोजें और आधुनिक तकनीक", icon: "💡" },
    { titleEn: "Books, Authors, Cinema & Art", titleHi: "साहित्य, कला, पुस्तकें व सिनेमा", descEn: "Classic literature, Oscar awards, renowned painters and epics", descHi: "कालजयी साहित्य, ऑस्कर पुरस्कार, प्रसिद्ध चित्रकार और महाकाव्य", promptEn: "Mix GK Art and Literature, famous world books, Oscar winning cinema, Shakespeare, Indian epics Ramayana Mahabharata", promptHi: "कला, साहित्य, प्रसिद्ध पुस्तकें, ऑस्कर और भारतीय महाकाव्य", icon: "📚" },
    { titleEn: "Speed Round - Rapid Fire Potpourri", titleHi: "रैपिड फायर - स्पीड सामान्य ज्ञान", descEn: "Fast-paced questions testing sharp memory across all subjects", descHi: "तीव्र गति से सभी विषयों की मेमोरी और ज्ञान की परख", promptEn: "Mix GK Rapid fire quick general knowledge questions testing multi-subject proficiency", promptHi: "रैपिड फायर बहु-विषयक सामान्य ज्ञान स्पीड टेस्ट", icon: "⚡" },
    { titleEn: "👑 Ultimate All-Rounder Grand Boss", titleHi: "👑 सर्वांगीण महा-चैंपियन ऑल-राउंडर बॉस", descEn: "The supreme all-subject mastery test for true GK champions!", descHi: "सभी विषयों में निपुण सच्चे ज्ञान सम्राटों की सर्वोच्च परीक्षा!", promptEn: "The Ultimate Mix GK championship challenge testing all domains of knowledge across history, science, polity, geography and current affairs", promptHi: "सर्वोच्च ऑल-राउंडर सामान्य ज्ञान महा-मुकाबला", icon: "👑" },
  ]
};

// -------------------------------------------------------------
// GET CATEGORY LEVEL CONFIG (Curated + Procedural Endless)
// -------------------------------------------------------------
export function getCategoryLevelConfig(categoryId: string, levelNumber: number): LevelConfig {
  let catTopics = CATEGORY_TOPIC_BANK[categoryId] || SUBJECT_TOPIC_BANK[categoryId];

  if (!catTopics) {
    const sub = ALL_SUBJECTS_LIST.find(s => s.id === categoryId);
    if (sub) {
      catTopics = [
        {
          titleEn: `${sub.shortName} Foundations & Key Concepts`,
          titleHi: `${sub.nameHi} - आधारभूत ज्ञान`,
          descEn: `Core principles and fundamentals of ${sub.nameEn}`,
          descHi: `${sub.nameHi} के मूलभूत सिद्धांत और संकल्पनाएं`,
          promptEn: `Fundamentals of ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} की मूलभूत संकल्पनाएं, ${sub.syllabusTopicHi}`,
          icon: sub.icon
        },
        {
          titleEn: `${sub.shortName} Core Syllabus Level 2`,
          titleHi: `${sub.nameHi} - स्तर 2`,
          descEn: `Essential exam facts and terminology in ${sub.nameEn}`,
          descHi: `${sub.nameHi} के महत्वपूर्ण तथ्य व शब्दावली`,
          promptEn: `Core exam questions on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} के महत्वपूर्ण परीक्षा उपयोगी प्रश्न`,
          icon: sub.icon
        },
        {
          titleEn: `${sub.shortName} Intermediate Stage`,
          titleHi: `${sub.nameHi} - मध्यम स्तर`,
          descEn: `Important competitive patterns in ${sub.nameEn}`,
          descHi: `${sub.nameHi} के मुख्य परीक्षा पैटर्न`,
          promptEn: `Intermediate competitive exam questions on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} के मध्यम स्तरीय प्रश्न`,
          icon: sub.icon
        },
        {
          titleEn: `${sub.shortName} Applied Knowledge`,
          titleHi: `${sub.nameHi} - व्यावहारिक अनुप्रयोग`,
          descEn: `Practical applications and analytical facts of ${sub.nameEn}`,
          descHi: `${sub.nameHi} के व्यावहारिक अनुप्रयोग व तथ्य`,
          promptEn: `Applied concepts in ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} के व्यावहारिक प्रश्न`,
          icon: sub.icon
        },
        {
          titleEn: `🎁 ${sub.shortName} Milestone Stage`,
          titleHi: `🎁 ${sub.nameHi} - माइलस्टोन स्टेज`,
          descEn: `High-yield milestone test with bonus chest rewards!`,
          descHi: `बोनस संदूक इनामों के साथ विशेष माइलस्टोन टेस्ट!`,
          promptEn: `High-yield exam test on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} का उच्च स्तरीय महत्वपूर्ण टेस्ट`,
          icon: "🎁"
        },
        {
          titleEn: `${sub.shortName} Advanced Concepts`,
          titleHi: `${sub.nameHi} - उच्च स्तरीय संकल्पनाएं`,
          descEn: `In-depth theoretical questions on ${sub.nameEn}`,
          descHi: `${sub.nameHi} के गहन सैद्धांतिक प्रश्न`,
          promptEn: `Advanced theory and conceptual questions on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} के कठिन व उच्च स्तरीय प्रश्न`,
          icon: sub.icon
        },
        {
          titleEn: `${sub.shortName} Speed & Accuracy`,
          titleHi: `${sub.nameHi} - स्पीड व सटीकता`,
          descEn: `Fast-paced problem solving in ${sub.nameEn}`,
          descHi: `${sub.nameHi} में तीव्र गति व सटीकता की परख`,
          promptEn: `Speed-oriented competitive questions on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} के तीव्र गति स्पीड टेस्ट प्रश्न`,
          icon: "⚡"
        },
        {
          titleEn: `${sub.shortName} Deep Mastery`,
          titleHi: `${sub.nameHi} - गहन प्रवीणता`,
          descEn: `Challenging questions testing comprehensive grasp`,
          descHi: `${sub.nameHi} के चुनौतीपूर्ण और महत्वपूर्ण प्रश्न`,
          promptEn: `Comprehensive mastery questions on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} के संपूर्ण पाठ्यक्रम के प्रश्न`,
          icon: sub.icon
        },
        {
          titleEn: `${sub.shortName} Pre-Boss Qualifier`,
          titleHi: `${sub.nameHi} - प्री-बॉस क्वालीफायर`,
          descEn: `Ultimate preparation before the sector boss battle!`,
          descHi: `सेक्टर बॉस मुकाबले से पहले की अंतिम तैयारी!`,
          promptEn: `Pre-boss comprehensive exam on ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} का प्री-बॉस महा-टेस्ट`,
          icon: "🔥"
        },
        {
          titleEn: `👑 ${sub.shortName} Grand Sector Boss`,
          titleHi: `👑 ${sub.nameHi} - महा-बॉस मुकाबला`,
          descEn: `The Supreme Championship Test across all ${sub.nameEn} topics!`,
          descHi: `${sub.nameHi} का संपूर्ण महा-बॉस मुकाबला!`,
          promptEn: `Supreme championship boss exam covering all domains of ${sub.nameEn}, ${sub.syllabusTopicEn}`,
          promptHi: `${sub.nameHi} का संपूर्ण और सर्वोच्च महा-बॉस टेस्ट`,
          icon: "👑"
        }
      ];
    }
  }

  if (!catTopics) {
    catTopics = CATEGORY_TOPIC_BANK.india || CATEGORY_TOPIC_BANK.ssc_cgl;
  }
  const worldId = Math.floor((levelNumber - 1) / 10) + 1;
  const topicIndex = (levelNumber - 1) % catTopics.length;
  const baseTopic = catTopics[topicIndex];
  const isBoss = levelNumber % 10 === 0;

  const cycleNum = Math.floor((levelNumber - 1) / catTopics.length) + 1;
  const suffix = cycleNum > 1 ? ` (Phase ${cycleNum})` : '';

  return {
    level: levelNumber,
    worldId,
    categoryId,
    titleEn: isBoss ? `👑 ${baseTopic.titleEn}${suffix}` : `${baseTopic.titleEn}${suffix}`,
    titleHi: isBoss ? `👑 ${baseTopic.titleHi}${suffix}` : `${baseTopic.titleHi}${suffix}`,
    descEn: isBoss ? `Boss Challenge: Master ${baseTopic.descEn}!` : baseTopic.descEn,
    descHi: isBoss ? `महा-बॉस मुकाबला: ${baseTopic.descHi}!` : baseTopic.descHi,
    topicPromptEn: isBoss ? `Advanced master test on ${baseTopic.promptEn}` : baseTopic.promptEn,
    topicPromptHi: isBoss ? `${baseTopic.promptHi} पर आधारित सबसे कठिन परीक्षा` : baseTopic.promptHi,
    icon: isBoss ? '👑' : baseTopic.icon,
    difficulty: levelNumber > 20 ? 'hard' : levelNumber > 8 ? 'medium' : 'easy',
    xpReward: isBoss ? 150 + (worldId * 20) : 75 + ((levelNumber % 10) * 5),
    isBoss,
    questionCount: 10,
    chestReward: (levelNumber % 5 === 0) ? { gems: 20 + worldId * 5, xp: 30 + worldId * 10 } : undefined
  };
}

export function getCategoryWorldConfig(categoryId: string, worldId: number): WorldConfig {
  const catInfo = getCategoryInfo(categoryId);
  const startLevel = (worldId - 1) * 10 + 1;
  const endLevel = worldId * 10;

  const worldNamesEn = [
    "Foundations & Core Syllabus",
    "Intermediate Mastery & Deep Concepts",
    "High-Yield Advanced Applications",
    "Grand Championship & Titan Colosseum",
    "Infinite Grandmaster Frontier",
  ];

  const worldNamesHi = [
    "मूलभूत व आवश्यक पाठ्यक्रम",
    "गहन अवधारणाएं व मध्यम स्तर",
    "अति-महत्वपूर्ण उच्च स्तरीय विषय",
    "महा-संग्राम व फाइनल महा-मुकाबला",
    "अनंत ज्ञान लोक",
  ];

  const wIdx = Math.min(worldId - 1, worldNamesEn.length - 1);

  return {
    id: worldId,
    categoryId,
    nameEn: `${catInfo.titleEn} - Sector ${worldId}: ${worldNamesEn[wIdx]}`,
    nameHi: `${catInfo.titleHi} - खंड ${worldId}: ${worldNamesHi[wIdx]}`,
    subtitleEn: `Progressive locked levels ${startLevel} to ${endLevel} for ${catInfo.titleEn}`,
    subtitleHi: `${catInfo.titleHi} के स्तर ${startLevel} से ${endLevel} तक का सफर`,
    icon: catInfo.icon,
    gradient: catInfo.gradient,
    borderColor: 'border-black/30',
    badgeBg: catInfo.badgeBg,
    levelsRange: [startLevel, endLevel]
  };
}

// Backward Compatibility Helpers
export function getLevelConfig(levelNumber: number): LevelConfig {
  return getCategoryLevelConfig('india', levelNumber);
}

export function getWorldConfig(worldId: number): WorldConfig {
  return getCategoryWorldConfig('india', worldId);
}
