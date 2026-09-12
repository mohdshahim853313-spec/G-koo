export interface StateExamItem {
  id: string;
  nameEn: string;
  nameHi: string;
  shortName: string;
  category: string;
  descEn: string;
  descHi: string;
  syllabusTopicEn: string;
  syllabusTopicHi: string;
  difficulty: 'easy' | 'medium' | 'hard';
  badge: string;
}

export interface StateData {
  id: string;
  nameEn: string;
  nameHi: string;
  capitalEn: string;
  capitalHi: string;
  icon: string;
  gradient: string;
  exams: StateExamItem[];
}

export const ALL_INDIA_STATES: StateData[] = [
  {
    id: 'up',
    nameEn: 'Uttar Pradesh',
    nameHi: 'उत्तर प्रदेश',
    capitalEn: 'Lucknow',
    capitalHi: 'लखनऊ',
    icon: '🏛️',
    gradient: 'from-amber-500 via-orange-600 to-rose-600',
    exams: [
      {
        id: 'up_uppsc',
        nameEn: 'UPPSC Combined State / PCS Prelims',
        nameHi: 'UPPSC सम्मिलित राज्य / प्रवर अधीनस्थ सेवा (PCS)',
        shortName: 'UPPSC PCS',
        category: 'Civil Services',
        descEn: 'General Studies, UP Special GK, History, Polity & Current Affairs',
        descHi: 'सामान्य अध्ययन, यूपी स्पेशल सामान्य ज्ञान, इतिहास, राजव्यवस्था व समसामयिकी',
        syllabusTopicEn: 'UPPSC PCS Exam Prelims: General Studies Paper 1, UP Special GK, Indian Polity, Geography, History, Economy and UP Government Schemes',
        syllabusTopicHi: 'UPPSC PCS परीक्षा: सामान्य अध्ययन, उत्तर प्रदेश विशेष सामान्य ज्ञान, भारतीय राजव्यवस्था, इतिहास, भूगोल, अर्थव्यवस्था और यूपी बजट',
        difficulty: 'hard',
        badge: 'Top PCS'
      },
      {
        id: 'up_police',
        nameEn: 'UP Police (Constable & Sub-Inspector SI)',
        nameHi: 'यूपी पुलिस (कांस्टेबल एवं उपनिरीक्षक SI)',
        shortName: 'UP Police',
        category: 'Police & Defence',
        descEn: 'General Knowledge, Law & Constitution, Mental Ability, UP Crime & Society',
        descHi: 'सामान्य ज्ञान, मूलविधि एवं संविधान, मानसिक योग्यता, यूपी कानून व्यवस्था',
        syllabusTopicEn: 'UP Police Constable and SI Exam: General Knowledge, Law, Constitution, Current Affairs, UP State History, Geography and Numerical Aptitude',
        syllabusTopicHi: 'यूपी पुलिस भर्ती: सामान्य ज्ञान, मूलविधि, संविधान, समसामयिकी, यूपी का इतिहास, भूगोल और मानसिक अभिरुचि',
        difficulty: 'medium',
        badge: 'High Vacancy'
      },
      {
        id: 'up_pet',
        nameEn: 'UPSSSC PET (Preliminary Eligibility Test)',
        nameHi: 'UPSSSC पीईटी (PET परीक्षा)',
        shortName: 'UPSSSC PET',
        category: 'State Group C',
        descEn: 'History, National Movement, Geography, Indian Economy, General Science',
        descHi: 'भारतीय इतिहास, राष्ट्रीय आंदोलन, भूगोल, अर्थव्यवस्था, विज्ञान व करेंट अफेयर्स',
        syllabusTopicEn: 'UPSSSC PET Exam: Complete General Studies Syllabus, Indian History, National Movement, Geography, Economy, Science, Current Affairs',
        syllabusTopicHi: 'UPSSSC PET परीक्षा: संपूर्ण सामान्य अध्ययन, भारतीय इतिहास, भूगोल, अर्थशास्त्र, सामान्य विज्ञान और करेंट अफेयर्स',
        difficulty: 'easy',
        badge: 'Qualifying'
      },
      {
        id: 'up_ro_aro',
        nameEn: 'UPPSC Review Officer (RO / ARO)',
        nameHi: 'UPPSC समीक्षा अधिकारी / सहायक समीक्षा अधिकारी (RO/ARO)',
        shortName: 'UP RO/ARO',
        category: 'Secretariat Services',
        descEn: 'General Studies Paper & General Hindi for UP Secretariat',
        descHi: 'यूपी सचिवालय सामान्य अध्ययन एवं सामान्य हिंदी',
        syllabusTopicEn: 'UPPSC RO ARO Exam: GS Paper, UP Agriculture, Culture, Trade, History and General Hindi Vocabulary',
        syllabusTopicHi: 'UPPSC आरओ/एआरओ: सामान्य अध्ययन, उत्तर प्रदेश कृषि, संस्कृति, व्यापार, इतिहास और सामान्य हिंदी',
        difficulty: 'hard',
        badge: 'Officer Post'
      },
      {
        id: 'up_lekhpal',
        nameEn: 'UPSSSC Rajasva Lekhpal & Revenue Inspector',
        nameHi: 'यूपी राजस्व लेखपाल एवं कानूनगो भर्ती',
        shortName: 'UP Lekhpal',
        category: 'Land & Revenue',
        descEn: 'Rural Development & Society (Gram Samaj), UP Land Records, General Knowledge',
        descHi: 'ग्राम्य समाज एवं विकास, यूपी भू-राजस्व, पंचायती राज व सामान्य ज्ञान',
        syllabusTopicEn: 'UP Lekhpal Exam: Rural Development and Society, UP Panchayati Raj, Land Measurement, General Knowledge and Hindi',
        syllabusTopicHi: 'यूपी लेखपाल परीक्षा: ग्राम समाज एवं विकास, पंचायती राज व्यवस्था, भूमि मापन, सामान्य ज्ञान और हिंदी',
        difficulty: 'medium',
        badge: 'Revenue'
      },
      {
        id: 'up_tet',
        nameEn: 'UP Teacher Eligibility & Super TET',
        nameHi: 'यूपी शिक्षक पात्रता एवं सुपर टीईटी (Super TET)',
        shortName: 'UP Super TET',
        category: 'Teaching',
        descEn: 'Child Psychology, Teaching Methodology, General Knowledge & Current Events',
        descHi: 'बाल मनोविज्ञान, शिक्षण कौशल, सामान्य ज्ञान व समसामयिक घटनाएं',
        syllabusTopicEn: 'UP Super TET Exam: Teaching Skills, Child Psychology, General Knowledge, Environment, Indian Culture and Current Affairs',
        syllabusTopicHi: 'यूपी सुपर टीईटी: शिक्षण कौशल, बाल मनोविज्ञान, सामान्य ज्ञान, पर्यावरण अध्ययन और समसामयिकी',
        difficulty: 'medium',
        badge: 'Teaching'
      }
    ]
  },
  {
    id: 'bihar',
    nameEn: 'Bihar',
    nameHi: 'बिहार',
    capitalEn: 'Patna',
    capitalHi: 'पटना',
    icon: '🌾',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    exams: [
      {
        id: 'bihar_bpsc',
        nameEn: 'BPSC Integrated CCE (Civil Services Prelims)',
        nameHi: 'BPSC संयुक्त सिविल सेवा परीक्षा (प्रारंभिक)',
        shortName: 'BPSC CCE',
        category: 'Civil Services',
        descEn: 'Bihar History, Freedom Movement in Bihar, Bihar Geography, Polity & GS',
        descHi: 'बिहार का इतिहास, 1857 व स्वतंत्रता में बिहार की भूमिका, भूगोल व राजव्यवस्था',
        syllabusTopicEn: 'BPSC CCE Prelims: Bihar Special History, Geography, Champaran Satyagraha, Economy, Indian Polity, General Science and Current Events',
        syllabusTopicHi: 'BPSC सिविल सेवा: बिहार का इतिहास, भूगोल, चंपारण सत्याग्रह, अर्थव्यवस्था, राजव्यवस्था, विज्ञान और करेंट अफेयर्स',
        difficulty: 'hard',
        badge: 'Top BPSC'
      },
      {
        id: 'bihar_police_si',
        nameEn: 'Bihar Police Sub-Inspector (BPSSC SI) & Constable',
        nameHi: 'बिहार दारोगा (BPSSC SI) एवं सिपाही भर्ती',
        shortName: 'Bihar SI / Constable',
        category: 'Police & Defence',
        descEn: 'General Studies, Current Affairs, Science, Bihar GK & Social Studies',
        descHi: 'सामान्य अध्ययन, समसामयिकी, विज्ञान, बिहार सामान्य ज्ञान',
        syllabusTopicEn: 'Bihar Police SI and Constable: General Studies, Current Affairs, General Science, Bihar History and Civics',
        syllabusTopicHi: 'बिहार दारोगा व सिपाही: सामान्य अध्ययन, राष्ट्रीय व अंतर्राष्ट्रीय समसामयिकी, सामान्य विज्ञान, बिहार जीके',
        difficulty: 'medium',
        badge: 'High Demand'
      },
      {
        id: 'bihar_bssc_cgl',
        nameEn: 'BSSC CGL Graduate Level & Inter Level',
        nameHi: 'BSSC सीजीएल एवं इंटर स्तरीय भर्ती',
        shortName: 'BSSC CGL',
        category: 'Staff Selection',
        descEn: 'General Studies, General Science, Mathematics & Reasoning',
        descHi: 'सामान्य अध्ययन, सामान्य विज्ञान, गणित व मानसिक क्षमता',
        syllabusTopicEn: 'BSSC CGL Exam: General Studies, General Science, Indian History, Neighboring Countries, Bihar State Facts',
        syllabusTopicHi: 'BSSC सीजीएल: सामान्य अध्ययन, पड़ोसी देश, भारतीय इतिहास, सामान्य विज्ञान और बिहार राज्य तथ्य',
        difficulty: 'medium',
        badge: 'Graduate'
      },
      {
        id: 'bihar_tre',
        nameEn: 'BPSC School Teacher Recruitment (TRE)',
        nameHi: 'BPSC शिक्षक भर्ती परीक्षा (TRE)',
        shortName: 'Bihar TRE',
        category: 'Teaching',
        descEn: 'General Studies, National Movement, Elementary Maths, Environment & SCERT',
        descHi: 'सामान्य अध्ययन, भारतीय राष्ट्रीय आंदोलन, पर्यावरण अध्ययन व सामान्य ज्ञान',
        syllabusTopicEn: 'BPSC Teacher TRE Exam: General Studies, Indian National Movement, Geography, Science and General Awareness',
        syllabusTopicHi: 'BPSC शिक्षक TRE: सामान्य अध्ययन, भारतीय राष्ट्रीय आंदोलन, भूगोल, सामान्य विज्ञान और पर्यावरण',
        difficulty: 'medium',
        badge: 'Teacher'
      }
    ]
  },
  {
    id: 'rajasthan',
    nameEn: 'Rajasthan',
    nameHi: 'राजस्थान',
    capitalEn: 'Jaipur',
    capitalHi: 'जयपुर',
    icon: '🏰',
    gradient: 'from-rose-600 via-pink-600 to-amber-600',
    exams: [
      {
        id: 'raj_ras',
        nameEn: 'RPSC RAS / RTS State & Subordinate Services',
        nameHi: 'RPSC आरएएस / आरटीएस संयुक्त प्रतियोगी परीक्षा',
        shortName: 'RAS / RTS',
        category: 'Civil Services',
        descEn: 'History, Art, Culture, Literature & Heritage of Rajasthan, Geography, Economy',
        descHi: 'राजस्थान का इतिहास, कला, संस्कृति, साहित्य, परंपराएं, भूगोल व अर्थव्यवस्था',
        syllabusTopicEn: 'RPSC RAS Prelims: Rajasthan History, Art, Culture, Architecture, Geography, Economy, Indian Constitution and Current Affairs',
        syllabusTopicHi: 'RPSC RAS प्रारंभिक परीक्षा: राजस्थान का इतिहास, कला, संस्कृति, दुर्ग व महल, भूगोल, अर्थव्यवस्था और संविधान',
        difficulty: 'hard',
        badge: 'Top RAS'
      },
      {
        id: 'raj_cet',
        nameEn: 'RSMSSB CET (Graduation & 12th Level)',
        nameHi: 'RSMSSB समान पात्रता परीक्षा (CET)',
        shortName: 'Rajasthan CET',
        category: 'Eligibility',
        descEn: 'Rajasthan Special GK, History, Geography, Polity, Science & Technology',
        descHi: 'राजस्थान सामान्य ज्ञान, इतिहास, भूगोल, राजव्यवस्था, विज्ञान एवं प्रौद्योगिकी',
        syllabusTopicEn: 'Rajasthan CET Exam: Complete Rajasthan General Knowledge, History, Geography, Economy, General Science and Computer',
        syllabusTopicHi: 'राजस्थान सीईटी: संपूर्ण राजस्थान सामान्य ज्ञान, इतिहास, कला-संस्कृति, भूगोल, सामान्य विज्ञान और कंप्यूटर',
        difficulty: 'medium',
        badge: 'Eligibility'
      },
      {
        id: 'raj_police',
        nameEn: 'Rajasthan Police Constable & SI',
        nameHi: 'राजस्थान पुलिस कांस्टेबल एवं सब इंस्पेक्टर',
        shortName: 'Raj Police',
        category: 'Police & Defence',
        descEn: 'Crime against Women & Children, Rajasthan GK, Reasoning & Science',
        descHi: 'महिला एवं बाल अपराध कानून, राजस्थान सामान्य ज्ञान, तर्कशक्ति व विज्ञान',
        syllabusTopicEn: 'Rajasthan Police Exam: Rajasthan GK, Women and Children Legal Provisions, General Science, Current Affairs and Reasoning',
        syllabusTopicHi: 'राजस्थान पुलिस: राजस्थान सामान्य ज्ञान, महिला व बाल अपराध प्रावधान, सामान्य विज्ञान और समसामयिकी',
        difficulty: 'medium',
        badge: 'Police'
      },
      {
        id: 'raj_patwari',
        nameEn: 'Rajasthan Patwari & VDO Gram Vikas Adhikari',
        nameHi: 'राजस्थान पटवारी एवं ग्राम विकास अधिकारी (VDO)',
        shortName: 'Patwari / VDO',
        category: 'Revenue & Panchayat',
        descEn: 'Rajasthan Geography, History, Panchayati Raj, Land Records & Culture',
        descHi: 'राजस्थान भूगोल, इतिहास, पंचायती राज व्यवस्था, राजस्व व संस्कृति',
        syllabusTopicEn: 'Rajasthan Patwari and VDO Exam: Administrative Setup, Rural Development, Geography, Art and Culture of Rajasthan',
        syllabusTopicHi: 'राजस्थान पटवारी व वीडीओ: प्रशासनिक ढांचा, ग्रामीण विकास, राजस्थान का भूगोल, कला एवं संस्कृति',
        difficulty: 'medium',
        badge: 'Panchayat'
      }
    ]
  },
  {
    id: 'mp',
    nameEn: 'Madhya Pradesh',
    nameHi: 'मध्य प्रदेश',
    capitalEn: 'Bhopal',
    capitalHi: 'भोपाल',
    icon: '🐅',
    gradient: 'from-amber-600 via-yellow-600 to-orange-700',
    exams: [
      {
        id: 'mp_mppsc',
        nameEn: 'MPPSC State Service Exam (Prelims)',
        nameHi: 'MPPSC राज्य सेवा परीक्षा (प्रारंभिक)',
        shortName: 'MPPSC SSE',
        category: 'Civil Services',
        descEn: 'History, Culture & Literature of MP, Geography of MP, Constitutional System of MP',
        descHi: 'मध्य प्रदेश का इतिहास, संस्कृति, साहित्य, जनजातियां, भूगोल व संवैधानिक व्यवस्था',
        syllabusTopicEn: 'MPPSC Prelims: MP History, Major Tribes, Festivals, Geography, Economy, Panchayati Raj, National Parks and Current Events',
        syllabusTopicHi: 'MPPSC प्रारंभिक परीक्षा: एमपी का इतिहास, प्रमुख जनजातियां, लोक कलाएं, नदियां, राष्ट्रीय उद्यान और राजव्यवस्था',
        difficulty: 'hard',
        badge: 'Top MPPSC'
      },
      {
        id: 'mp_police',
        nameEn: 'MP Police Constable & Subedar SI',
        nameHi: 'एमपी पुलिस कांस्टेबल एवं सूबेदार SI भर्ती',
        shortName: 'MP Police',
        category: 'Police',
        descEn: 'General Knowledge of MP, General Science, Aptitude & Reasoning',
        descHi: 'मध्य प्रदेश सामान्य ज्ञान, सामान्य विज्ञान, बौद्धिक क्षमता व मानसिक अभिरुचि',
        syllabusTopicEn: 'MP Police Exam: MP State General Knowledge, Indian History, General Science, Physics, Chemistry, Biology and Current Affairs',
        syllabusTopicHi: 'एमपी पुलिस: मध्य प्रदेश सामान्य ज्ञान, सामान्य विज्ञान (भौतिकी, रसायन, जीवविज्ञान) और समसामयिकी',
        difficulty: 'medium',
        badge: 'Police'
      },
      {
        id: 'mp_patwari',
        nameEn: 'MPESB Patwari & Group 2 Sub Group 4',
        nameHi: 'एमपी पटवारी एवं ग्रुप 2 सब ग्रुप 4',
        shortName: 'MP Patwari',
        category: 'Revenue',
        descEn: 'General Knowledge, Rural Economy & Panchayati Raj, General Management',
        descHi: 'सामान्य ज्ञान, ग्रामीण अर्थव्यवस्था, पंचायती राज व सामान्य प्रबंधन',
        syllabusTopicEn: 'MP Patwari Exam: Rural Economy, Panchayati Raj System, General Knowledge, MP Geography, Agriculture and General Management',
        syllabusTopicHi: 'एमपी पटवारी: ग्रामीण अर्थव्यवस्था, पंचायती राज, मध्य प्रदेश कृषि, सामान्य ज्ञान और सामान्य प्रबंधन',
        difficulty: 'medium',
        badge: 'Revenue'
      }
    ]
  },
  {
    id: 'maharashtra',
    nameEn: 'Maharashtra',
    nameHi: 'महाराष्ट्र',
    capitalEn: 'Mumbai',
    capitalHi: 'मुंबई',
    icon: '🌊',
    gradient: 'from-orange-600 via-rose-600 to-purple-700',
    exams: [
      {
        id: 'maha_mpsc',
        nameEn: 'MPSC State Services (Rajyaseva Prelims)',
        nameHi: 'MPSC राज्यसेवा परीक्षा (पूर्व परीक्षा)',
        shortName: 'MPSC Rajyaseva',
        category: 'Civil Services',
        descEn: 'History of Modern India & Maharashtra, Maharashtra Geography, Indian Polity',
        descHi: 'महाराष्ट्र व आधुनिक भारताचा इतिहास, महाराष्ट्राचा भूगोल, भारतीय राज्यघटना',
        syllabusTopicEn: 'MPSC State Services: Maharashtra History, Social Reformers, Geography, Economy, Environment and Indian Polity',
        syllabusTopicHi: 'MPSC राज्यसेवा: महाराष्ट्राचा इतिहास, समाजसुधारक, भूगोल, अर्थव्यवस्था, पर्यावरण आणि राज्यशास्त्र',
        difficulty: 'hard',
        badge: 'Top MPSC'
      },
      {
        id: 'maha_police',
        nameEn: 'Maharashtra Police Bharti (Constable & Driver)',
        nameHi: 'महाराष्ट्र पोलीस भरती (शिपाई व चालक)',
        shortName: 'Maha Police',
        category: 'Police',
        descEn: 'General Knowledge, Current Affairs, Maharashtra District GK & Science',
        descHi: 'सामान्य ज्ञान, चालू घडामोडी, महाराष्ट्र जिल्हा विशेष व सामान्य विज्ञान',
        syllabusTopicEn: 'Maharashtra Police Bharti: General Knowledge, Maharashtra History, Geography, General Science and Current Events',
        syllabusTopicHi: 'महाराष्ट्र पोलीस भरती: सामान्य ज्ञान, चालू घडामोडी, महाराष्ट्राचा भूगोल आणि सामान्य विज्ञान',
        difficulty: 'medium',
        badge: 'Police'
      },
      {
        id: 'maha_talathi',
        nameEn: 'Maharashtra Talathi Bharti & Revenue',
        nameHi: 'महाराष्ट्र तलाठी भरती व महसूल विभाग',
        shortName: 'Maha Talathi',
        category: 'Revenue',
        descEn: 'General Knowledge, Maharashtra Land Records, History & Geography',
        descHi: 'सामान्य ज्ञान, महसूल प्रशासन, महाराष्ट्राचा इतिहास व भूगोल',
        syllabusTopicEn: 'Maharashtra Talathi Exam: General Studies, Maharashtra Culture, Agriculture, Indian Constitution and Current Affairs',
        syllabusTopicHi: 'महाराष्ट्र तलाठी: सामान्य अध्ययन, महाराष्ट्राची संस्कृती, शेती, राज्यघटना आणि चालू घडामोडी',
        difficulty: 'medium',
        badge: 'Talathi'
      }
    ]
  },
  {
    id: 'delhi',
    nameEn: 'Delhi (UT & Central NCR)',
    nameHi: 'दिल्ली (एनसीआर)',
    capitalEn: 'New Delhi',
    capitalHi: 'नई दिल्ली',
    icon: '🏙️',
    gradient: 'from-blue-600 via-indigo-600 to-sky-700',
    exams: [
      {
        id: 'delhi_dsssb',
        nameEn: 'DSSSB Recruitment (TGT, PGT, PRT & Non-Teaching)',
        nameHi: 'DSSSB भर्ती (शिक्षक एवं गैर-शैक्षणिक पद)',
        shortName: 'DSSSB Exam',
        category: 'State Selection',
        descEn: 'General Awareness, History, Geography, Polity, Scientific Research & Hindi',
        descHi: 'सामान्य जागरूकता, इतिहास, भूगोल, संविधान, वैज्ञानिक अनुसंधान व हिंदी',
        syllabusTopicEn: 'DSSSB Exam: General Awareness, Current Events, Indian Constitution, Geography, Economics and General Science',
        syllabusTopicHi: 'DSSSB परीक्षा: सामान्य जागरूकता, समसामयिक घटनाएं, संविधान, भूगोल, अर्थशास्त्र और सामान्य विज्ञान',
        difficulty: 'medium',
        badge: 'DSSSB'
      },
      {
        id: 'delhi_police',
        nameEn: 'Delhi Police Constable & Executive Head Constable',
        nameHi: 'दिल्ली पुलिस कांस्टेबल एवं हेड कांस्टेबल',
        shortName: 'Delhi Police',
        category: 'Police',
        descEn: 'General Knowledge, Current Affairs, Computer Fundamentals & Reasoning',
        descHi: 'सामान्य ज्ञान, समसामयिक मामले, कंप्यूटर ज्ञान व तर्कशक्ति',
        syllabusTopicEn: 'Delhi Police Exam: General Knowledge, Current Affairs, Indian History, Culture, Geography, Sports and Computer Basics',
        syllabusTopicHi: 'दिल्ली पुलिस: सामान्य ज्ञान, समसामयिकी, भारतीय इतिहास, कला-संस्कृति, भूगोल, खेल और कंप्यूटर',
        difficulty: 'medium',
        badge: 'Central Police'
      }
    ]
  },
  {
    id: 'haryana',
    nameEn: 'Haryana',
    nameHi: 'हरियाणा',
    capitalEn: 'Chandigarh',
    capitalHi: 'चंडीगढ़',
    icon: '🌾',
    gradient: 'from-teal-600 via-emerald-600 to-green-700',
    exams: [
      {
        id: 'har_hpsc',
        nameEn: 'HPSC HCS (Haryana Civil Services Prelims)',
        nameHi: 'HPSC एचसीएस (हरियाणा सिविल सेवा)',
        shortName: 'HPSC HCS',
        category: 'Civil Services',
        descEn: 'Haryana Special History, Culture, Geography & Economy, General Studies',
        descHi: 'हरियाणा का इतिहास, संस्कृति, भूगोल, अर्थव्यवस्था व सामान्य अध्ययन',
        syllabusTopicEn: 'HPSC HCS Prelims: Haryana State GK, History of Haryana, Geography, Indian Polity, Economy and General Science',
        syllabusTopicHi: 'HPSC एचसीएस: हरियाणा सामान्य ज्ञान, हरियाणा का इतिहास, भूगोल, राजव्यवस्था और समसामयिकी',
        difficulty: 'hard',
        badge: 'Top HCS'
      },
      {
        id: 'har_cet',
        nameEn: 'HSSC Common Eligibility Test (CET Group C & D)',
        nameHi: 'HSSC सीईटी (ग्रुप सी एवं ग्रुप डी)',
        shortName: 'Haryana CET',
        category: 'Eligibility',
        descEn: 'Haryana GK (25%), General Awareness, Science, History & Literature',
        descHi: 'हरियाणा सामान्य ज्ञान (25%), सामान्य जागरूकता, विज्ञान, इतिहास व साहित्य',
        syllabusTopicEn: 'Haryana CET Exam: Haryana Special GK, Folk Dance, Monuments, History, Geography, Science and Current Affairs',
        syllabusTopicHi: 'हरियाणा सीईटी: हरियाणा विशेष सामान्य ज्ञान, लोक नृत्य, धरोहर, इतिहास, भूगोल और सामान्य विज्ञान',
        difficulty: 'medium',
        badge: 'CET'
      },
      {
        id: 'har_police',
        nameEn: 'Haryana Police Constable & SI',
        nameHi: 'हरियाणा पुलिस कांस्टेबल एवं एसआई',
        shortName: 'Haryana Police',
        category: 'Police',
        descEn: 'General Studies, Agriculture & Animal Husbandry, Haryana GK',
        descHi: 'सामान्य अध्ययन, कृषि एवं पशुपालन, हरियाणा सामान्य ज्ञान',
        syllabusTopicEn: 'Haryana Police: Haryana GK, Agriculture, Animal Husbandry, General Science, Current Affairs and Basic Computer',
        syllabusTopicHi: 'हरियाणा पुलिस: हरियाणा जीके, कृषि व पशुपालन, सामान्य विज्ञान, समसामयिकी और कंप्यूटर',
        difficulty: 'medium',
        badge: 'Police'
      }
    ]
  },
  {
    id: 'punjab',
    nameEn: 'Punjab',
    nameHi: 'पंजाब',
    capitalEn: 'Chandigarh',
    capitalHi: 'चंडीगढ़',
    icon: '🌾',
    gradient: 'from-amber-500 via-yellow-600 to-rose-600',
    exams: [
      {
        id: 'pun_ppsc',
        nameEn: 'PPSC Combined Competitive Examination (CCE)',
        nameHi: 'PPSC संयुक्त प्रतियोगी परीक्षा (PCS)',
        shortName: 'PPSC CCE',
        category: 'Civil Services',
        descEn: 'Punjab History & Culture, Sikh Gurus, Punjabi Heritage, Indian Polity & GS',
        descHi: 'पंजाब का इतिहास, सिख गुरु, पंजाबी विरासत, भारतीय राजव्यवस्था',
        syllabusTopicEn: 'PPSC CCE: Punjab History, Sikhism History, Geography of Punjab, Environment, Indian Polity and Current Affairs',
        syllabusTopicHi: 'PPSC पीसीएस: पंजाब का इतिहास, सिख गुरु परंपरा, पंजाब का भूगोल, राजव्यवस्था और समसामयिकी',
        difficulty: 'hard',
        badge: 'Top PPSC'
      },
      {
        id: 'pun_police',
        nameEn: 'Punjab Police Constable & Sub-Inspector',
        nameHi: 'पंजाब पुलिस कांस्टेबल एवं सब इंस्पेक्टर',
        shortName: 'Punjab Police',
        category: 'Police',
        descEn: 'General Awareness, Punjab GK, Constitution of India, Science & Tech',
        descHi: 'सामान्य जागरूकता, पंजाब सामान्य ज्ञान, भारतीय संविधान व विज्ञान',
        syllabusTopicEn: 'Punjab Police Exam: Punjab History, Culture, Economy, Indian Constitution, Science and Current Affairs',
        syllabusTopicHi: 'पंजाब पुलिस: पंजाब का इतिहास, संस्कृति, अर्थव्यवस्था, संविधान और सामान्य ज्ञान',
        difficulty: 'medium',
        badge: 'Police'
      }
    ]
  },
  {
    id: 'west_bengal',
    nameEn: 'West Bengal',
    nameHi: 'पश्चिम बंगाल',
    capitalEn: 'Kolkata',
    capitalHi: 'कोलकाता',
    icon: '🎨',
    gradient: 'from-purple-600 via-indigo-600 to-blue-700',
    exams: [
      {
        id: 'wb_wbcs',
        nameEn: 'WBCS Executive (Civil Service Prelims)',
        nameHi: 'WBCS सिविल सेवा (पूर्व परीक्षा)',
        shortName: 'WBCS Exam',
        category: 'Civil Services',
        descEn: 'History of Bengal, Indian National Movement, Geography of India with special reference to West Bengal',
        descHi: 'बंगाल का इतिहास, भारतीय राष्ट्रीय आंदोलन, पश्चिम बंगाल का विशेष भूगोल',
        syllabusTopicEn: 'WBCS Prelims: Bengal Renaissance, Indian National Movement, West Bengal Geography, Indian Polity, Economy and Science',
        syllabusTopicHi: 'WBCS परीक्षा: बंगाल का इतिहास, राष्ट्रीय आंदोलन, पश्चिम बंगाल का भूगोल, राजव्यवस्था और सामान्य विज्ञान',
        difficulty: 'hard',
        badge: 'Top WBCS'
      },
      {
        id: 'wb_police',
        nameEn: 'WB Police (WBP Constable & SI)',
        nameHi: 'पश्चिम बंगाल पुलिस (WBP कांस्टेबल एवं SI)',
        shortName: 'WB Police',
        category: 'Police',
        descEn: 'General Awareness, General Knowledge, Science & Current Events',
        descHi: 'सामान्य जागरूकता, सामान्य ज्ञान, विज्ञान व समसामयिक घटनाएं',
        syllabusTopicEn: 'West Bengal Police: General Awareness, West Bengal History, Geography, General Science and Current Events',
        syllabusTopicHi: 'पश्चिम बंगाल पुलिस: सामान्य ज्ञान, पश्चिम बंगाल का इतिहास, भूगोल और विज्ञान',
        difficulty: 'medium',
        badge: 'Police'
      }
    ]
  },
  {
    id: 'gujarat',
    nameEn: 'Gujarat',
    nameHi: 'गुजरात',
    capitalEn: 'Gandhinagar',
    capitalHi: 'गांधीनगर',
    icon: '🦁',
    gradient: 'from-amber-600 via-orange-600 to-yellow-600',
    exams: [
      {
        id: 'guj_gpsc',
        nameEn: 'GPSC Class 1 & 2 Administrative Services',
        nameHi: 'GPSC वर्ग 1 एवं 2 प्रशासनिक सेवा परीक्षा',
        shortName: 'GPSC Class 1-2',
        category: 'Civil Services',
        descEn: 'History & Cultural Heritage of Gujarat, Constitution of India, Geography of Gujarat',
        descHi: 'गुजरात का इतिहास व सांस्कृतिक विरासत, भारतीय संविधान, गुजरात का भूगोल',
        syllabusTopicEn: 'GPSC Prelims: Gujarat History, Cultural Heritage, Architecture, Geography, Indian Constitution, Economy and Science',
        syllabusTopicHi: 'GPSC परीक्षा: गुजरात का इतिहास, सांस्कृतिक विरासत, स्थापत्य, गुजरात का भूगोल, संविधान और सामान्य विज्ञान',
        difficulty: 'hard',
        badge: 'Top GPSC'
      },
      {
        id: 'guj_police',
        nameEn: 'Gujarat Police LRD Constable & PSI',
        nameHi: 'गुजरात पुलिस (LRD कांस्टेबल एवं PSI)',
        shortName: 'Gujarat Police',
        category: 'Police',
        descEn: 'General Knowledge, Law & Constitution, Gujarat Heritage & Science',
        descHi: 'सामान्य ज्ञान, कानून व संविधान, गुजरात विरासत व विज्ञान',
        syllabusTopicEn: 'Gujarat Police Exam: Gujarat GK, History, Geography, Indian Constitution, Law Principles and General Science',
        syllabusTopicHi: 'गुजरात पुलिस: गुजरात सामान्य ज्ञान, इतिहास, भूगोल, भारतीय संविधान और सामान्य विज्ञान',
        difficulty: 'medium',
        badge: 'Police'
      }
    ]
  },
  {
    id: 'jharkhand',
    nameEn: 'Jharkhand',
    nameHi: 'झारखंड',
    capitalEn: 'Ranchi',
    capitalHi: 'रांची',
    icon: '🌲',
    gradient: 'from-emerald-700 via-teal-700 to-green-800',
    exams: [
      {
        id: 'jhk_jpsc',
        nameEn: 'JPSC Combined Civil Services Examination',
        nameHi: 'JPSC संयुक्त सिविल सेवा परीक्षा',
        shortName: 'JPSC Civil Services',
        category: 'Civil Services',
        descEn: 'Jharkhand Special Paper 2, Tribal History, Chota Nagpur Tenancy (CNT), Santhal Pargana Tenancy (SPT)',
        descHi: 'झारखंड विशेष पत्र 2, जनजातीय इतिहास, सीएनटी/एसपीटी एक्ट, भूगोल व खनिज',
        syllabusTopicEn: 'JPSC Prelims: Jharkhand History, Freedom Fighters, CNT Act, SPT Act, Minerals, Forests, Geography and Culture',
        syllabusTopicHi: 'JPSC प्रारंभिक: झारखंड का इतिहास, बिरसा मुंडा, सीएनटी व एसपीटी एक्ट, खनिज संपदा, भूगोल और संस्कृति',
        difficulty: 'hard',
        badge: 'Top JPSC'
      },
      {
        id: 'jhk_jssc_cgl',
        nameEn: 'JSSC CGL (Jharkhand General Graduate Level)',
        nameHi: 'JSSC सीजीएल (झारखंड सामान्य स्नातक स्तरीय)',
        shortName: 'JSSC CGL',
        category: 'Staff Selection',
        descEn: 'Jharkhand GK (40 questions), General Studies, Science & Computer',
        descHi: 'झारखंड सामान्य ज्ञान (40 प्रश्न), सामान्य अध्ययन, विज्ञान व कंप्यूटर',
        syllabusTopicEn: 'JSSC CGL Exam: Comprehensive Jharkhand GK, Rivers, Minerals, Industries, Indian History, General Science and Computer',
        syllabusTopicHi: 'JSSC सीजीएल: संपूर्ण झारखंड जीके, नदियां, उद्योग, खनिज, सामान्य अध्ययन और सामान्य विज्ञान',
        difficulty: 'medium',
        badge: 'Graduate'
      }
    ]
  },
  {
    id: 'uttarakhand',
    nameEn: 'Uttarakhand',
    nameHi: 'उत्तराखंड',
    capitalEn: 'Dehradun',
    capitalHi: 'देहरादून',
    icon: '🏔️',
    gradient: 'from-sky-600 via-cyan-600 to-blue-700',
    exams: [
      {
        id: 'uk_ukpsc',
        nameEn: 'UKPSC Combined State Civil / Upper PCS',
        nameHi: 'UKPSC सम्मिलित राज्य सिविल / प्रवर अधीनस्थ (Upper PCS)',
        shortName: 'UKPSC PCS',
        category: 'Civil Services',
        descEn: 'History, Culture & Geography of Uttarakhand, Himalayas & River Systems',
        descHi: 'उत्तराखंड का इतिहास, संस्कृति, गढ़वाल व कुमाऊं, हिमालयी भूगोल व नदियां',
        syllabusTopicEn: 'UKPSC PCS: Uttarakhand History, Garhwal and Kumaon Dynasties, Geography, Glaciers, Economy and Indian Polity',
        syllabusTopicHi: 'UKPSC पीसीएस: उत्तराखंड का इतिहास, कत्यूरी व चंद वंश, भूगोल, हिमनद, नदियां, संस्कृति और संविधान',
        difficulty: 'hard',
        badge: 'Top UKPSC'
      },
      {
        id: 'uk_uksssc',
        nameEn: 'UKSSSC Graduate Level & Patwari / Lekhpal',
        nameHi: 'UKSSSC स्नातक स्तरीय एवं पटवारी / लेखपाल',
        shortName: 'UKSSSC Exam',
        category: 'State Selection',
        descEn: 'Uttarakhand GK (40 Marks), General Hindi (20 Marks), General Studies',
        descHi: 'उत्तराखंड सामान्य ज्ञान (40 अंक), सामान्य हिंदी (20 अंक), सामान्य अध्ययन',
        syllabusTopicEn: 'UKSSSC Exam: Uttarakhand GK, District Profiles, Famous Personalities, Tourism, General Hindi and General Studies',
        syllabusTopicHi: 'UKSSSC परीक्षा: उत्तराखंड सामान्य ज्ञान, जिले, प्रमुख व्यक्तित्व, पर्यटन, हिंदी और सामान्य अध्ययन',
        difficulty: 'medium',
        badge: 'Revenue'
      }
    ]
  },
  {
    id: 'chhattisgarh',
    nameEn: 'Chhattisgarh',
    nameHi: 'छत्तीसगढ़',
    capitalEn: 'Raipur',
    capitalHi: 'रायपुर',
    icon: '🌾',
    gradient: 'from-emerald-600 via-green-600 to-teal-700',
    exams: [
      {
        id: 'cg_cgpsc',
        nameEn: 'CGPSC State Service Prelims',
        nameHi: 'CGPSC राज्य सेवा परीक्षा (प्रारंभिक)',
        shortName: 'CGPSC SSE',
        category: 'Civil Services',
        descEn: 'General Knowledge of Chhattisgarh (50 Questions) & General Studies (50 Questions)',
        descHi: 'छत्तीसगढ़ का सामान्य ज्ञान (50 प्रश्न) एवं भारत का सामान्य अध्ययन (50 प्रश्न)',
        syllabusTopicEn: 'CGPSC Prelims: Chhattisgarh History, Freedom Struggle, Tribes, Folk Art, Geography, Minerals, Forests and Panchayati Raj',
        syllabusTopicHi: 'CGPSC प्रारंभिक: छत्तीसगढ़ का इतिहास, जनजातियां, लोक कलाएं, बस्तर दशहरा, भूगोल, खनिज और पंचायती राज',
        difficulty: 'hard',
        badge: 'Top CGPSC'
      },
      {
        id: 'cg_vyapam',
        nameEn: 'CG Vyapam (Patwari, RI, Hostel Warden)',
        nameHi: 'सीजी व्यापम (पटवारी, आरआई, छात्रावास अधीक्षक)',
        shortName: 'CG Vyapam',
        category: 'State Selection',
        descEn: 'Chhattisgarh GK, Computer Knowledge, General Studies & Science',
        descHi: 'छत्तीसगढ़ सामान्य ज्ञान, कंप्यूटर ज्ञान, सामान्य अध्ययन व विज्ञान',
        syllabusTopicEn: 'CG Vyapam Exam: Chhattisgarh General Knowledge, District Facts, Computer Basics, Indian Polity and General Science',
        syllabusTopicHi: 'सीजी व्यापम: छत्तीसगढ़ सामान्य ज्ञान, जिले, कंप्यूटर ज्ञान, सामान्य अध्ययन और विज्ञान',
        difficulty: 'medium',
        badge: 'Vyapam'
      }
    ]
  },
  {
    id: 'himachal',
    nameEn: 'Himachal Pradesh',
    nameHi: 'हिमाचल प्रदेश',
    capitalEn: 'Shimla',
    capitalHi: 'शिमला',
    icon: '🏔️',
    gradient: 'from-blue-600 via-indigo-600 to-sky-800',
    exams: [
      {
        id: 'hp_hpas',
        nameEn: 'HPPSC HPAS (Himachal Pradesh Administrative Services)',
        nameHi: 'HPPSC एचपीएएस (हिमाचल प्रदेश प्रशासनिक सेवा)',
        shortName: 'HPPSC HPAS',
        category: 'Civil Services',
        descEn: 'History, Geography & Socio-Economic Development of Himachal Pradesh',
        descHi: 'हिमाचल प्रदेश का इतिहास, भूगोल व सामाजिक-आर्थिक विकास',
        syllabusTopicEn: 'HPAS Prelims: HP History, Princely States, Geography, Hydroelectric Projects, Culture, Economy and Indian Polity',
        syllabusTopicHi: 'HPAS प्रारंभिक: हिमाचल का इतिहास, रियासतें, भूगोल, जलविद्युत परियोजनाएं, संस्कृति और सामान्य अध्ययन',
        difficulty: 'hard',
        badge: 'Top HPAS'
      }
    ]
  },
  {
    id: 'odisha',
    nameEn: 'Odisha',
    nameHi: 'ओडिशा',
    capitalEn: 'Bhubaneswar',
    capitalHi: 'भुवनेश्वर',
    icon: '☀️',
    gradient: 'from-amber-600 via-rose-600 to-purple-700',
    exams: [
      {
        id: 'od_opsc',
        nameEn: 'OPSC Odisha Civil Services (OAS Prelims)',
        nameHi: 'OPSC ओडिशा सिविल सेवा (OAS)',
        shortName: 'OPSC OAS',
        category: 'Civil Services',
        descEn: 'History of Odisha, Temple Architecture, Geography of Odisha, Polity & GS',
        descHi: 'ओडिशा का इतिहास, मंदिर स्थापत्य, ओडिशा का भूगोल व सामान्य अध्ययन',
        syllabusTopicEn: 'OPSC OAS: Odisha History, Kalinga War, Temple Architecture, Geography, Minerals, Tribes and Indian Polity',
        syllabusTopicHi: 'OPSC ओएएस: ओडिशा का इतिहास, कलिंग युद्ध, मंदिर स्थापत्य, भूगोल, खनिज और सामान्य ज्ञान',
        difficulty: 'hard',
        badge: 'Top OPSC'
      }
    ]
  },
  {
    id: 'assam',
    nameEn: 'Assam & North East',
    nameHi: 'असम एवं पूर्वोत्तर',
    capitalEn: 'Dispur',
    capitalHi: 'दिसपुर',
    icon: '🦏',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-700',
    exams: [
      {
        id: 'as_apsc',
        nameEn: 'APSC Combined Competitive Exam (CCE Prelims)',
        nameHi: 'APSC संयुक्त प्रतियोगी परीक्षा (CCE)',
        shortName: 'APSC CCE',
        category: 'Civil Services',
        descEn: 'History, Heritage & Culture of Assam & North East, Geography & Biodiversity',
        descHi: 'असम व पूर्वोत्तर का इतिहास, अहोम साम्राज्य, जैव विविधता व भूगोल',
        syllabusTopicEn: 'APSC CCE: Ahom Kingdom, Assam History, Brahmaputra River System, National Parks, Tea Industry, Polity and Current Affairs',
        syllabusTopicHi: 'APSC सीसीई: अहोम राजवंश, असम का इतिहास, ब्रह्मपुत्र नदी तंत्र, राष्ट्रीय उद्यान, संस्कृति और समसामयिकी',
        difficulty: 'hard',
        badge: 'Top APSC'
      }
    ]
  },
  {
    id: 'south_states',
    nameEn: 'Southern States (TS, AP, KA, TN, KL)',
    nameHi: 'दक्षिण भारतीय राज्य (TS, AP, KA, TN, KL)',
    capitalEn: 'Hyderabad / Chennai / Bengaluru',
    capitalHi: 'हैदराबाद / चेन्नई / बेंगलुरु',
    icon: '🏛️',
    gradient: 'from-indigo-600 via-purple-600 to-rose-700',
    exams: [
      {
        id: 'ts_ap_psc',
        nameEn: 'TSPSC & APPSC Group 1-4 Services',
        nameHi: 'TSPSC एवं APPSC ग्रुप 1-4 भर्ती',
        shortName: 'TSPSC / APPSC',
        category: 'Civil Services',
        descEn: 'Telangana & Andhra Pradesh History, Culture, Geography, Bifurcation & Polity',
        descHi: 'तेलंगाना व आंध्र प्रदेश इतिहास, संस्कृति, भूगोल, अर्थव्यवस्था व सामान्य अध्ययन',
        syllabusTopicEn: 'TSPSC and APPSC: History of Deccan, Kakatiyas, Satavahanas, Geography, Economy, Polity and Current Events',
        syllabusTopicHi: 'TSPSC व APPSC: दक्कन का इतिहास, काकतीय, सातवाहन, भूगोल, राजव्यवस्था और समसामयिकी',
        difficulty: 'hard',
        badge: 'South PSC'
      },
      {
        id: 'tn_kerala_psc',
        nameEn: 'TNPSC & Kerala PSC (KAS) Exams',
        nameHi: 'TNPSC एवं केरल पीएससी (KAS) परीक्षा',
        shortName: 'TNPSC / Kerala PSC',
        category: 'Civil Services',
        descEn: 'Tamil Nadu & Kerala History, Social Justice, Geography, Constitution & GS',
        descHi: 'तमिलनाडु व केरल इतिहास, सामाजिक सुधार आंदोलन, भूगोल व सामान्य अध्ययन',
        syllabusTopicEn: 'TNPSC and Kerala PSC: Sangam Age, Dravidian Movement, Kerala Renaissance, Geography, Indian Constitution and Science',
        syllabusTopicHi: 'TNPSC व केरल PSC: संगम युग, सामाजिक आंदोलन, केरल पुनर्जागरण, भूगोल और संविधान',
        difficulty: 'hard',
        badge: 'State PSC'
      }
    ]
  }
];
