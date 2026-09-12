export interface TopicBankItem {
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  promptEn: string;
  promptHi: string;
  icon: string;
}

export const SUBJECT_TOPIC_BANK: Record<string, TopicBankItem[]> = {
  // 1. GENERAL KNOWLEDGE & STATIC GK
  sub_gk: [
    {
      titleEn: "First in India & Superlatives",
      titleHi: "भारत में प्रथम व विश्व में सर्वाधिक",
      descEn: "First PM, President, High Courts, Longest Bridges & Tallest Statues",
      descHi: "प्रथम प्रधानमंत्री, राष्ट्रपति, सबसे लंबा पुल, सबसे ऊंची मूर्ति",
      promptEn: "Static GK First in India male and female, longest river bridge, tallest statue, highest award",
      promptHi: "भारत में प्रथम महिला व पुरुष, सबसे लंबी नदी, सबसे ऊंचा बांध और प्रमुख तथ्य",
      icon: "🌐"
    },
    {
      titleEn: "Famous Monuments & UNESCO Heritage",
      titleHi: "प्रसिद्ध स्मारक व यूनेस्को धरोहर स्थल",
      descEn: "Taj Mahal, Red Fort, Ajanta Caves, Sun Temple & Hampi",
      descHi: "ताजमहल, लाल किला, अजंता गुफाएं, सूर्य मंदिर कोणार्क और हम्पी",
      promptEn: "Static GK UNESCO world heritage sites in India, famous historical monuments, architectural styles",
      promptHi: "भारत के यूनेस्को विश्व धरोहर स्थल, ऐतिहासिक इमारतें और निर्माता",
      icon: "🏛️"
    },
    {
      titleEn: "National & International Awards",
      titleHi: "राष्ट्रीय व अंतरराष्ट्रीय पुरस्कार",
      descEn: "Bharat Ratna, Padma Awards, Nobel Prize, Oscar & Booker",
      descHi: "भारत रत्न, पद्म सम्मान, नोबेल पुरस्कार, ऑस्कर और बुकर पुरस्कार",
      promptEn: "Static GK Bharat Ratna first recipient, Nobel prize winners from India, Dadasaheb Phalke, Jnanpith",
      promptHi: "भारत रत्न विजेता, भारतीय नोबेल पुरस्कार विजेता, ज्ञानपीठ और दादा साहेब फाल्के",
      icon: "🎖️"
    },
    {
      titleEn: "Important National & World Days",
      titleHi: "महत्वपूर्ण राष्ट्रीय व अंतरराष्ट्रीय दिवस",
      descEn: "Army Day, Science Day, Yoga Day, Earth Day & Environment Day",
      descHi: "सेना दिवस, विज्ञान दिवस, योग दिवस, पृथ्वी दिवस व पर्यावरण दिवस",
      promptEn: "Static GK Important national and international days, celebration dates and annual themes",
      promptHi: "प्रमुख राष्ट्रीय और अंतरराष्ट्रीय दिवस, तिथियां और उनकी महत्ता",
      icon: "📅"
    },
    {
      titleEn: "National Parks & Sanctuaries",
      titleHi: "राष्ट्रीय उद्यान व वन्यजीव अभयारण्य",
      descEn: "Jim Corbett, Kaziranga, Sundarbans, Gir & Ranthambore",
      descHi: "जिम कॉर्बेट, काजीरंगा, सुंदरबन, गिर राष्ट्रीय उद्यान व रणथंभौर",
      promptEn: "Static GK National Parks in India, states location, key protected animals one horned rhino tiger lion",
      promptHi: "भारत के राष्ट्रीय उद्यान, उनकी अवस्थिति और संरक्षित वन्यजीव",
      icon: "🐅"
    },
    {
      titleEn: "Famous Books & Renowned Authors",
      titleHi: "प्रसिद्ध पुस्तकें व उनके लेखक",
      descEn: "Discovery of India, Wings of Fire, Arthashastra & Anandamath",
      descHi: "डिस्कवरी ऑफ इंडिया, विंग्स ऑफ फायर, अर्थशास्त्र और आनंदमठ",
      promptEn: "Static GK Famous books and authors, autobiographies of historical and political leaders",
      promptHi: "प्रसिद्ध पुस्तकें, आत्मकथाएं और उनके रचयिता",
      icon: "📖"
    },
    {
      titleEn: "Headquarters of Global Organizations",
      titleHi: "अंतरराष्ट्रीय संगठनों के मुख्यालय",
      descEn: "UN New York, WHO Geneva, UNESCO Paris, IMF & World Bank",
      descHi: "संयुक्त राष्ट्र न्यूयॉर्क, डब्ल्यूएचओ जिनेवा, यूनेस्को पेरिस व आईएमएफ",
      promptEn: "Static GK Headquarters of international bodies UN WHO WTO UNESCO IMF World Bank NATO ASEAN",
      promptHi: "अंतरराष्ट्रीय संगठनों के मुख्यालय, स्थापना वर्ष और प्रमुख कार्य",
      icon: "🏢"
    },
    {
      titleEn: "Folk Dances, Music & Festivals",
      titleHi: "लोक नृत्य, संगीत व क्षेत्रीय त्यौहार",
      descEn: "Garba, Bihu, Kathakali, Lavani, Hornbill & Chhath Puja",
      descHi: "गरबा, बिहू, कथकली, लावणी, हॉर्नबिल और छठ पूजा",
      promptEn: "Static GK Folk dances of states, state festivals Bihu Hornbill Pongal Onam Lohri",
      promptHi: "राज्यों के प्रसिद्ध लोक नृत्य, शास्त्रीय नृत्य और प्रमुख त्यौहार",
      icon: "🎭"
    },
    {
      titleEn: "Capitals, Currencies & Boundaries",
      titleHi: "राजधानियां, मुद्राएं व अंतरराष्ट्रीय सीमाएं",
      descEn: "World capitals, Yen, Dollar, Pound, Euro, Radcliffe Line & LOC",
      descHi: "विश्व के देशों की राजधानियां, मुद्राएं और सीमा रेखाएं",
      promptEn: "Static GK World capitals, official national currencies, border lines Durand Radcliffe McMahon",
      promptHi: "प्रमुख देशों की राजधानियां, आधिकारिक मुद्राएं और अंतरराष्ट्रीय सीमा रेखाएं",
      icon: "🗺️"
    },
    {
      titleEn: "👑 Static GK Titan Boss Championship",
      titleHi: "👑 सामान्य ज्ञान महा-बॉस मुकाबला",
      descEn: "Grand comprehensive exam testing every static GK domain!",
      descHi: "सभी स्टेटिक जीके विषयों की निर्णायक और सर्वोच्च परीक्षा!",
      promptEn: "Master Static GK championship exam covering all topics with competitive high-yield questions",
      promptHi: "संपूर्ण सामान्य ज्ञान (Static GK) का निर्णायक महा-मॉक टेस्ट",
      icon: "👑"
    }
  ],

  // 2. ENGLISH LANGUAGE & GRAMMAR
  sub_english: [
    {
      titleEn: "Parts of Speech & Nouns/Pronouns",
      titleHi: "पार्ट्स ऑफ स्पीच व संज्ञा-सर्वनाम",
      descEn: "Types of nouns, pronouns, collective nouns & subject-verb rules",
      descHi: "संज्ञा, सर्वनाम के प्रकार और आवश्यक नियम",
      promptEn: "English Grammar Parts of Speech, collective nouns, pronoun cases, rules and spotting errors",
      promptHi: "अंग्रेजी व्याकरण पार्ट्स ऑफ स्पीच, संज्ञा, सर्वनाम और एरर डिटेक्शन",
      icon: "🔤"
    },
    {
      titleEn: "Tenses & Verb Conjugation",
      titleHi: "काल (Tenses) व क्रिया के रूप",
      descEn: "Present, Past, Future tenses, irregular verbs & conditional sentences",
      descHi: "प्रेजेंट, पास्ट, फ्यूचर टेंस और कंडीशनल वाक्य",
      promptEn: "English Grammar Tenses rules, simple past vs present perfect, conditional clauses if-then",
      promptHi: "अंग्रेजी टेंस के नियम, क्रिया के रूप और कंडीशनल वाक्य",
      icon: "⏳"
    },
    {
      titleEn: "Synonyms & High-Frequency Words",
      titleHi: "समानार्थी शब्द (Synonyms)",
      descEn: "Competitive vocabulary, contextual meanings & word choices",
      descHi: "प्रतियोगी परीक्षाओं के महत्वपूर्ण पर्यायवाची शब्द",
      promptEn: "English Vocabulary Synonyms, high frequency competitive words, exact meanings and antonyms",
      promptHi: "अंग्रेजी पर्यायवाची शब्द (Synonyms) और उनके सही अर्थ",
      icon: "📚"
    },
    {
      titleEn: "Antonyms & Opposites",
      titleHi: "विलोम शब्द (Antonyms)",
      descEn: "Opposite word pairs, prefix antonyms & advanced vocabulary",
      descHi: "विपरीतार्थक शब्द और प्रतियोगी शब्दावली",
      promptEn: "English Vocabulary Antonyms, opposite words for competitive exams with clear options",
      promptHi: "अंग्रेजी विलोम शब्द (Antonyms) और शब्दावली",
      icon: "🔄"
    },
    {
      titleEn: "Idioms & Popular Phrases",
      titleHi: "मुहावरे व लोकोक्तियां (Idioms)",
      descEn: "Idiomatic expressions, origin meanings & usage in sentences",
      descHi: "अंग्रेजी मुहावरे और उनके व्यावहारिक अर्थ",
      promptEn: "English Idioms and Phrases, meanings of famous idioms like once in a blue moon, break the ice",
      promptHi: "प्रसिद्ध अंग्रेजी मुहावरे (Idioms and Phrases) और उनके अर्थ",
      icon: "💡"
    },
    {
      titleEn: "One Word Substitution",
      titleHi: "अनेक शब्दों के लिए एक शब्द",
      descEn: "Phobias, manias, professions, places & scientific terms",
      descHi: "फोबिया, विभिन्न पेशे और अनेक शब्दों के लिए एक शब्द",
      promptEn: "English One Word Substitution, scientific terms, study branches, phobias, government types",
      promptHi: "अंग्रेजी वन वर्ड सब्स्टिट्यूशन (One Word Substitution)",
      icon: "✍️"
    },
    {
      titleEn: "Active & Passive Voice",
      titleHi: "वाच्य परिवर्तन (Active & Passive)",
      descEn: "Transformation rules for all tenses, modals & imperatives",
      descHi: "एक्टिव से पैसिव वॉयस में बदलने के नियम",
      promptEn: "English Grammar Active and Passive voice transformation rules for all tenses and imperatives",
      promptHi: "एक्टिव और पैसिव वॉयस (Active-Passive Voice) नियम",
      icon: "📢"
    },
    {
      titleEn: "Direct & Indirect Speech",
      titleHi: "प्रत्यक्ष-अप्रत्यक्ष कथन (Narration)",
      descEn: "Reported speech, tense changes, reporting verbs & questions",
      descHi: "डायरेक्ट से इनडायरेक्ट स्पीच में परिवर्तन के नियम",
      promptEn: "English Grammar Direct and Indirect speech narration rules, tense backshift, reporting verbs",
      promptHi: "डायरेक्ट और इनडायरेक्ट स्पीच (Narration) के नियम",
      icon: "🗣️"
    },
    {
      titleEn: "Error Spotting & Sentence Improvement",
      titleHi: "वाक्य त्रुटि सुधार (Error Spotting)",
      descEn: "Prepositions, conjunctions, modifier placement & parallel structure",
      descHi: "प्रीपोजिशन, कंजंक्शन और वाक्य शुद्धि",
      promptEn: "English Grammar Error Spotting questions, identifying grammatical errors in sentences",
      promptHi: "अंग्रेजी वाक्य त्रुटि सुधार और व्याकरण नियम",
      icon: "🔍"
    },
    {
      titleEn: "👑 English Language Grand Master Boss",
      titleHi: "👑 अंग्रेजी भाषा महा-बॉस",
      descEn: "Ultimate comprehensive English grammar and vocabulary championship!",
      descHi: "संपूर्ण अंग्रेजी व्याकरण व शब्दावली का निर्णायक महा-मुकाबला!",
      promptEn: "Comprehensive English Language competitive mastery mock test covering grammar, vocab and idioms",
      promptHi: "अंग्रेजी भाषा और व्याकरण का संपूर्ण महा-मॉक टेस्ट",
      icon: "👑"
    }
  ],

  // 3. MATHEMATICS & QUANTITATIVE APTITUDE
  sub_math: [
    {
      titleEn: "Number System & Divisibility",
      titleHi: "संख्या पद्धति व विभाज्यता के नियम",
      descEn: "Prime numbers, HCF & LCM, divisibility rules & unit digit",
      descHi: "अभाज्य संख्याएं, ल.स.प. व म.स.प., इकाई अंक व विभाज्यता",
      promptEn: "Quantitative Aptitude Number System, HCF LCM, prime factorisation, unit digit calculation, divisibility",
      promptHi: "गणित संख्या पद्धति, लसावि-मसावि, इकाई अंक और विभाज्यता के नियम",
      icon: "🔢"
    },
    {
      titleEn: "Percentages & Fractions",
      titleHi: "प्रतिशत व भिन्न (Percentages)",
      descEn: "Percentage calculation, fraction conversions & successive changes",
      descHi: "प्रतिशत की गणना, भिन्न से प्रतिशत और उत्तरोत्तर बदलाव",
      promptEn: "Quantitative Aptitude Percentage concepts, fraction to percent, successive percentage increase decrease",
      promptHi: "अंकगणित प्रतिशत के नियम, भिन्न और प्रतिशत वृद्धि-कमी",
      icon: "📊"
    },
    {
      titleEn: "Profit, Loss & Discount",
      titleHi: "लाभ, हानि व बट्टा (Profit & Loss)",
      descEn: "Cost price, Selling price, Marked price & Marked discount",
      descHi: "क्रय मूल्य, विक्रय मूल्य, अंकित मूल्य और छूट",
      promptEn: "Quantitative Aptitude Profit and Loss, Cost price Selling price, profit margin, successive discounts",
      promptHi: "लाभ और हानि, क्रय-विक्रय मूल्य और छूट (Discount) के सूत्र",
      icon: "🏷️"
    },
    {
      titleEn: "Simple & Compound Interest",
      titleHi: "साधारण व चक्रवृद्धि ब्याज (SI & CI)",
      descEn: "Principal, Rate, Time, Annual compounding & Difference formula",
      descHi: "मूलधन, दर, समय, वार्षिक चक्रवृद्धि और अंतर सूत्र",
      promptEn: "Quantitative Aptitude Simple and Compound Interest formulas, CI minus SI difference for 2 and 3 years",
      promptHi: "साधारण और चक्रवृद्धि ब्याज, ब्याज दर और 2-3 वर्ष के अंतर सूत्र",
      icon: "💰"
    },
    {
      titleEn: "Ratio, Proportion & Partnership",
      titleHi: "अनुपात, समानुपात व साझेदारी",
      descEn: "Direct/Inverse ratio, Mean proportional & Profit sharing",
      descHi: "अनुपात, मध्यानुपाती और व्यापार में लाभ विभाजन",
      promptEn: "Quantitative Aptitude Ratio and Proportion, third proportional, mean proportional, partnership profit distribution",
      promptHi: "अनुपात और समानुपात, मध्यानुपाती और साझेदारी में लाभ विभाजन",
      icon: "⚖️"
    },
    {
      titleEn: "Time & Work / Pipes & Cisterns",
      titleHi: "समय और कार्य / नल व टंकी",
      descEn: "Efficiency concept, Days to complete, Alternate days & Leak pipes",
      descHi: "कार्यक्षमता, कुल दिन, एकांतर दिन और पाइप की दर",
      promptEn: "Quantitative Aptitude Time and Work, man days, efficiency, pipes and cisterns filling and emptying",
      promptHi: "समय और कार्य, कार्यक्षमता और नल-टंकी के प्रश्न",
      icon: "⏱️"
    },
    {
      titleEn: "Speed, Time & Distance / Trains",
      titleHi: "चाल, समय और दूरी / रेलगाड़ी",
      descEn: "Relative speed, Train crossing platforms, Average speed & Boats",
      descHi: "सापेक्ष चाल, रेलगाड़ी और प्लेटफॉर्म, औसत चाल व नाव-धारा",
      promptEn: "Quantitative Aptitude Speed Time Distance, train crossing length, relative speed, upstream downstream boat",
      promptHi: "चाल, समय और दूरी, ट्रेन और नाव-धारा के आवश्यक सूत्र",
      icon: "🚄"
    },
    {
      titleEn: "Averages & Mixtures / Alligation",
      titleHi: "औसत व मिश्रण (Alligation)",
      descEn: "Average age, Batting average, Rule of alligation & Ratio mixes",
      descHi: "औसत आयु, औसत रन और मिश्रण का नियम",
      promptEn: "Quantitative Aptitude Averages formula, weighted average, rule of alligation for mixtures",
      promptHi: "औसत की गणना, भारित औसत और मिश्रण के नियम",
      icon: "🥣"
    },
    {
      titleEn: "Geometry & Mensuration (2D & 3D)",
      titleHi: "ज्यामिति व क्षेत्रमिति (Mensuration)",
      descEn: "Area, Perimeter, Volume of Cylinder, Cone, Sphere & Circles",
      descHi: "क्षेत्रफल, परिमाप, बेलन, शंकु, गोला और वृत्त का आयतन",
      promptEn: "Quantitative Aptitude Mensuration 2D and 3D formulas, cylinder volume, sphere surface area, circle area",
      promptHi: "क्षेत्रमिति सूत्र, वृत्त, त्रिभुज, बेलन और गोले का क्षेत्रफल व आयतन",
      icon: "📐"
    },
    {
      titleEn: "👑 Mathematics Quantitative Grand Boss",
      titleHi: "👑 गणित एवं अंकगणित महा-बॉस",
      descEn: "High-yield calculation and problem-solving master challenge!",
      descHi: "सभी गणितीय सूत्रों और ट्रिक्स का संपूर्ण महा-मुकाबला!",
      promptEn: "Comprehensive Quantitative Aptitude master exam covering arithmetic, algebra and geometry",
      promptHi: "गणित एवं अंकगणित का संपूर्ण उच्च-स्तरीय महा-मॉक टेस्ट",
      icon: "👑"
    }
  ],

  // 4. PHYSICS & EVERYDAY SCIENCE
  sub_physics: [
    {
      titleEn: "SI Units, Dimensions & Measurements",
      titleHi: "एसआई मात्रक व मापन प्रणालियां",
      descEn: "Force (Newton), Power (Watt), Pressure (Pascal) & Measuring devices",
      descHi: "बल (न्यूटन), शक्ति (वाट), दाब (पास्कल) और मापक यंत्र",
      promptEn: "Physics SI Units, fundamental and derived units, measuring instruments barometer lactometer galvanometer",
      promptHi: "भौतिक विज्ञान एसआई मात्रक, मूल इकाइयां और प्रमुख मापक यंत्र",
      icon: "📏"
    },
    {
      titleEn: "Motion, Force & Newton's Laws",
      titleHi: "गति के नियम व बल (Newton's Laws)",
      descEn: "Inertia, Momentum, Action-Reaction, Friction & Circular motion",
      descHi: "जड़त्व, संवेग, क्रिया-प्रतिक्रिया, घर्षण और वृत्तीय गति",
      promptEn: "Physics Newton laws of motion, inertia, linear momentum, centripetal force, friction coefficient",
      promptHi: "न्यूटन के गति के तीनों नियम, जड़त्व, संवेग और घर्षण बल",
      icon: "⚡"
    },
    {
      titleEn: "Gravitation & Planetary Orbits",
      titleHi: "गुरुत्वाकर्षण व उपग्रहों की गति",
      descEn: "Universal Gravitation G, g value (9.8 m/s²), Escape velocity & Kepler",
      descHi: "गुरुत्वाकर्षण नियतांक G, g का मान, पलायन वेग और केपलर के नियम",
      promptEn: "Physics Gravitation, universal law, acceleration due to gravity, escape velocity 11.2 km/s, satellites",
      promptHi: "गुरुत्वाकर्षण बल, g का मान, पलायन वेग (11.2 km/s) और उपग्रह",
      icon: "🌍"
    },
    {
      titleEn: "Work, Energy & Power",
      titleHi: "कार्य, ऊर्जा और शक्ति (Work & Energy)",
      descEn: "Kinetic energy (1/2 mv²), Potential energy (mgh), Horsepower",
      descHi: "गतिज ऊर्जा, स्थितिज ऊर्जा, ऊर्जा संरक्षण और अश्वशक्ति",
      promptEn: "Physics Work Energy Power, kinetic energy formula, potential energy, law of conservation of energy, 1 HP = 746 W",
      promptHi: "कार्य, गतिज ऊर्जा, स्थितिज ऊर्जा और 1 हॉर्सपावर = 746 वाट",
      icon: "🔋"
    },
    {
      titleEn: "Light, Optics & Lenses",
      titleHi: "प्रकाशिकी, परावर्तन व लेंस (Optics)",
      descEn: "Concave/Convex mirrors, Refraction, Total Internal Reflection & Rainbow",
      descHi: "अवतल-उत्तल दर्पण, अपवर्तन, पूर्ण आंतरिक परावर्तन और इंद्रधनुष",
      promptEn: "Physics Optics, laws of reflection refraction, convex concave lenses, myopia hypermetropia, total internal reflection optical fibre",
      promptHi: "प्रकाश का परावर्तन, अपवर्तन, उत्तल-अवतल लेंस, दृष्टि दोष और ऑप्टिकल फाइबर",
      icon: "💡"
    },
    {
      titleEn: "Electricity, Current & Ohm's Law",
      titleHi: "विद्युत धारा, विभव व ओम का नियम",
      descEn: "V = IR, Series & Parallel resistance, Fuse wire & Transformer",
      descHi: "ओम का नियम V = IR, श्रेणी व समांतर क्रम, फ्यूज तार और ट्रांसफार्मर",
      promptEn: "Physics Electricity, Ohms law V=IR, resistance in series and parallel, electric power kilowatt hour, fuse wire alloy",
      promptHi: "विद्युत धारा, ओम का नियम, प्रतिरोध का संयोजन और विद्युत फ्यूज",
      icon: "🔌"
    },
    {
      titleEn: "Magnetism & Electromagnetic Induction",
      titleHi: "चुंबकत्व व विद्युत-चुंबकीय प्रेरण",
      descEn: "Magnetic poles, Fleming's rules, Dynamo & Electric Motor",
      descHi: "चुंबकीय ध्रुव, फ्लेमिंग के नियम, डायनेमो और विद्युत मोटर",
      promptEn: "Physics Magnetism, magnetic field lines, Flemings left right hand rule, electric motor, Faraday law of electromagnetic induction",
      promptHi: "चुंबकत्व, फ्लेमिंग के नियम, फैराडे के प्रेरण नियम और विद्युत मोटर",
      icon: "🧲"
    },
    {
      titleEn: "Sound, Waves & Acoustics",
      titleHi: "ध्वनि, तरंगें व प्रतिध्वनि (Sound)",
      descEn: "Speed of sound (343 m/s in air), Ultrasound, Doppler effect & Echo",
      descHi: "ध्वनि की चाल, पराश्रव्य तरंगें, डॉपलर प्रभाव और गूंज",
      promptEn: "Physics Sound and Waves, frequency Hertz, speed of sound in solids liquids gases, ultrasonic infrasonic, SONAR",
      promptHi: "ध्वनि की चाल, आवृत्ति (Hz), सोनार (SONAR) और पराश्रव्य तरंगें",
      icon: "🔊"
    },
    {
      titleEn: "Heat, Thermodynamics & States of Matter",
      titleHi: "ऊष्मा, तापक्रम व ऊष्मागतिकी",
      descEn: "Celsius-Fahrenheit relation, Latent heat, Conduction & Absolute Zero",
      descHi: "सेल्सियस-फारेनहाइट संबंध, गुप्त ऊष्मा, संवहन और परम शून्य ताप",
      promptEn: "Physics Heat and Thermodynamics, temperature scales C/5 = (F-32)/9, absolute zero -273.15 C, latent heat, heat transfer modes",
      promptHi: "ऊष्मा और तापमान, परम शून्य ताप (-273.15°C) और ऊष्मा संचरण की विधियां",
      icon: "🌡️"
    },
    {
      titleEn: "👑 Physics Grand Titan Boss Championship",
      titleHi: "👑 भौतिक विज्ञान महा-बॉस मुकाबला",
      descEn: "Comprehensive high-level examination testing all physics principles!",
      descHi: "सभी भौतिकी सिद्धांतों और नियमों का निर्णायक महा-मुकाबला!",
      promptEn: "Comprehensive Physics master test combining mechanics, optics, electricity, magnetism and thermodynamics",
      promptHi: "संपूर्ण भौतिक विज्ञान का निर्णायक महा-मॉक टेस्ट",
      icon: "👑"
    }
  ],

  // 5. CHEMISTRY & ELEMENTS
  sub_chemistry: [
    {
      titleEn: "Periodic Table & Classification",
      titleHi: "आवर्त सारणी व तत्वों का वर्गीकरण",
      descEn: "Mendeleev, Modern Periodic Table, Groups, Periods & Atomic size",
      descHi: "मेंडलीफ, आधुनिक आवर्त सारणी, समूह, आवर्त और परमाणु आकार",
      promptEn: "Chemistry Periodic Table, Modern periodic law Henry Moseley, periods groups, atomic radius trends, noble gases",
      promptHi: "आवर्त सारणी, मेंडलीफ व मोजले, समूह, आवर्त और अक्रिय गैसें",
      icon: "🧪"
    },
    {
      titleEn: "Acids, Bases, Salts & pH Scale",
      titleHi: "अम्ल, क्षार, लवण व पीएच मान (pH Scale)",
      descEn: "Litmus indicator, pH of blood/water, Baking soda & Bleaching powder",
      descHi: "लिटमस पत्र, रक्त का पीएच, बेकिंग सोडा और ब्लीचिंग पाउडर",
      promptEn: "Chemistry Acids Bases Salts, pH scale 0 to 14, pH of blood 7.4, baking soda NaHCO3, washing soda, Plaster of Paris",
      promptHi: "अम्ल-क्षार-लवण, पीएच मान, बेकिंग सोडा, प्लास्टर ऑफ पेरिस और रासायनिक सूत्र",
      icon: "🍶"
    },
    {
      titleEn: "Metals, Non-Metals & Metallurgy",
      titleHi: "धातुएं, अधातुएं व धातु निष्कर्षण",
      descEn: "Mercury (liquid metal), Bromine (liquid non-metal), Ores & Rusting",
      descHi: "पारा (द्रव धातु), ब्रोमीन (द्रव अधातु), अयस्क और जंग लगना",
      promptEn: "Chemistry Metals and Nonmetals, reactivity series, liquid metal mercury, liquid nonmetal bromine, bauxite aluminium ore",
      promptHi: "धातु और अधातु, द्रव धातु पारा, ब्रोमीन, बॉक्साइट और धातु शोधन",
      icon: "🪙"
    },
    {
      titleEn: "Alloys & Important Chemical Compounds",
      titleHi: "मिश्रधातुएं व प्रमुख रासायनिक यौगिक",
      descEn: "Brass (Cu+Zn), Bronze (Cu+Sn), Stainless Steel, Solder & Dry Ice",
      descHi: "पीतल (तांबा+जस्ता), कांसा, स्टेनलेस स्टील और शुष्क बर्फ",
      promptEn: "Chemistry Alloys and formulas, brass copper zinc, bronze copper tin, stainless steel, dry ice solid CO2, laughing gas N2O",
      promptHi: "मिश्रधातुएं - पीतल, कांसा, शोल्डर और शुष्क बर्फ (ठोस CO2)",
      icon: "🛡️"
    },
    {
      titleEn: "Chemical Bonding & Reactions",
      titleHi: "रासायनिक बंध व रासायनिक अभिक्रियाएं",
      descEn: "Ionic bond, Covalent bond, Oxidation-Reduction & Catalysts",
      descHi: "आयनिक बंध, सहसंयोजक बंध, ऑक्सीकरण-अपचयन और उत्प्रेरक",
      promptEn: "Chemistry Chemical Bonding, ionic covalent bonds, redox reactions, catalysts function, exothermic endothermic",
      promptHi: "रासायनिक बंध, आयनिक और सहसंयोजक बंध, रेडॉक्स अभिक्रियाएं और उत्प्रेरक",
      icon: "⚗️"
    },
    {
      titleEn: "Carbon & Organic Chemistry Basics",
      titleHi: "कार्बन व इसके अपररूप (Allotropes)",
      descEn: "Diamond, Graphite, Fullerenes, Hydrocarbons & Methane",
      descHi: "हीरा, ग्रेफाइट, फुलरीन, हाइड्रोकार्बन और मिथेन (मार्श गैस)",
      promptEn: "Chemistry Carbon and its compounds, allotropes diamond graphite graphene, hydrocarbons alkane alkene alkyne, methane biogas",
      promptHi: "कार्बन के अपररूप - हीरा, ग्रेफाइट, बायोगैस मिथेन और हाइड्रोकार्बन",
      icon: "💎"
    },
    {
      titleEn: "Polymers, Plastics & Fibres",
      titleHi: "बहुलक, प्लास्टिक व रेशे (Polymers)",
      descEn: "Nylon, Rayon, Teflon (Non-stick coating), Bakelite & PVC",
      descHi: "नायलॉन, रेयान, टेफ्लॉन (नॉन-स्टिक कोटिंग), बेकेलाइट और पीवीसी",
      promptEn: "Chemistry Polymers and Fibres, natural vs synthetic polymers, Teflon non stick pans, Bakelite electric switches, Rayon artificial silk",
      promptHi: "सिंथेटिक बहुलक, टेफ्लॉन, बेकेलाइट, नायलॉन और पीवीसी के उपयोग",
      icon: "🧵"
    },
    {
      titleEn: "Everyday Chemistry & Medicines",
      titleHi: "दैनिक जीवन का रसायन व औषधियां",
      descEn: "Soaps, Detergents, Antacids, Antibiotics, Aspirin & Preservatives",
      descHi: "साबुन, अपमार्जक, एंटासिड, एंटीबायोटिक और खाद्य परिरक्षक",
      promptEn: "Chemistry Daily Life, soap saponification, antacids magnesium hydroxide, antibiotics penicillin, sodium benzoate preservative",
      promptHi: "दैनिक रसायन, साबुन, एंटासिड, एंटीबायोटिक्स और सोडियम बेंजोएट",
      icon: "💊"
    },
    {
      titleEn: "Environmental Chemistry & Gases",
      titleHi: "पर्यावरणीय रसायन व प्रमुख गैसें",
      descEn: "Ozone (O3), Acid Rain (SO2, NO2), CFCs, Smog & Greenhouse Gases",
      descHi: "ओजोन, अम्ल वर्षा (SO2, NO2), सीएफसी, स्मॉग और ग्रीनहाउस गैसें",
      promptEn: "Chemistry Environmental gases, acid rain sulphur dioxide nitrogen oxides, ozone layer depletion chlorofluorocarbons, greenhouse effect",
      promptHi: "अम्ल वर्षा, ओजोन परत क्षरण, सीएफसी और ग्रीनहाउस प्रभाव गैसें",
      icon: "🌫️"
    },
    {
      titleEn: "👑 Chemistry Grand Master Boss",
      titleHi: "👑 रसायन विज्ञान महा-बॉस",
      descEn: "The ultimate examination of chemical reactions, elements and formulas!",
      descHi: "सभी रासायनिक सूत्रों और तत्वों का संपूर्ण महा-मुकाबला!",
      promptEn: "Comprehensive Chemistry master mock test combining periodic table, organic, inorganic and physical chemistry",
      promptHi: "संपूर्ण रसायन विज्ञान का निर्णायक महा-मॉक टेस्ट",
      icon: "👑"
    }
  ],

  // 6. BIOLOGY & LIFE SCIENCES
  sub_biology: [
    {
      titleEn: "Cell Structure & Organelles",
      titleHi: "कोशिका संरचना व कोशिकांग",
      descEn: "Mitochondria (Powerhouse), Nucleus, Ribosome & Plant vs Animal cells",
      descHi: "माइटोकॉन्ड्रिया (पावरहाउस), केंद्रक, राइबोसोम और कोशिका भित्ति",
      promptEn: "Biology Cell Biology, mitochondria powerhouse, ribosomes protein synthesis, chloroplast photosynthesis, plant vs animal cell",
      promptHi: "कोशिका जीवविज्ञान, माइटोकॉन्ड्रिया, राइबोसोम, पादप व जंतु कोशिका",
      icon: "🔬"
    },
    {
      titleEn: "Human Digestive & Excretory System",
      titleHi: "मानव पाचन व उत्सर्जन तंत्र",
      descEn: "Liver (Bile), Stomach (HCl), Small intestine & Kidney (Nephron)",
      descHi: "यकृत (पित्त रस), आमाशय (HCl), छोटी आंत और वृक्क (नेफ्रॉन)",
      promptEn: "Biology Human Physiology, digestive system enzymes pepsin trypsin, liver bile, kidneys functional unit nephron",
      promptHi: "मानव पाचन तंत्र, एंजाइम, यकृत, आमाशय और वृक्क (किडनी) नेफ्रॉन",
      icon: "🫀"
    },
    {
      titleEn: "Circulatory System & Blood Groups",
      titleHi: "परिसंचरण तंत्र व रक्त समूह",
      descEn: "Heart chambers, Hemoglobin, Universal donor O-, Universal recipient AB+",
      descHi: "हृदय के 4 कक्ष, हीमोग्लोबिन, सर्वदाता O- और सर्वग्राही AB+",
      promptEn: "Biology Circulatory System, 4 heart chambers, arteries veins, blood composition RBC WBC platelets, blood groups Karl Landsteiner",
      promptHi: "रक्त परिसंचरण तंत्र, हृदय के कक्ष, आरबीसी-डब्ल्यूबीसी और रक्त समूह",
      icon: "🩸"
    },
    {
      titleEn: "Nervous System & Endocrine Glands",
      titleHi: "तंत्रिका तंत्र व अंतःस्रावी ग्रंथियां",
      descEn: "Brain (Cerebrum, Cerebellum), Pituitary (Master gland), Insulin & Thyroid",
      descHi: "मस्तिष्क, पीयूष ग्रंथि (मास्टर ग्लैंड), इंसुलिन और थायरॉयड",
      promptEn: "Biology Nervous and Endocrine system, pituitary master gland, insulin pancreas diabetes, thyroid thyroxine iodine",
      promptHi: "मानव मस्तिष्क, पीयूष ग्रंथि, इंसुलिन, थायरॉयड और हार्मोन",
      icon: "🧠"
    },
    {
      titleEn: "Genetics, DNA & Heredity",
      titleHi: "आनुवंशिकी, डीएनए व मेंडल के नियम",
      descEn: "DNA double helix (Watson-Crick), Chromosomes (46/23 pairs) & Mendel",
      descHi: "डीएनए डबल हेलिक्स, गुणसूत्र (46/23 जोड़े) और मेंडल के आनुवंशिकी नियम",
      promptEn: "Biology Genetics, Gregor Mendel father of genetics, DNA double helix Watson Crick, human chromosomes 46, sex determination",
      promptHi: "आनुवंशिकी के नियम, डीएनए डबल हेलिक्स, 23 जोड़े गुणसूत्र और लिंग निर्धारण",
      icon: "🧬"
    },
    {
      titleEn: "Plant Physiology & Photosynthesis",
      titleHi: "पादप कार्यिकी व प्रकाश संश्लेषण",
      descEn: "Chlorophyll, Xylem (Water transport), Phloem (Food) & Plant hormones",
      descHi: "क्लोरोफिल, जाइलम (जल संवहन), फ्लोएम (भोजन) और पादप हार्मोन (ऑक्सिन)",
      promptEn: "Biology Plant Physiology, photosynthesis equation, xylem phloem functions, stomata transpiration, plant hormones auxin gibberellin",
      promptHi: "प्रकाश संश्लेषण, जाइलम-फ्लोएम, रंध्र और पादप हार्मोन",
      icon: "🌿"
    },
    {
      titleEn: "Human Diseases - Bacteria & Viruses",
      titleHi: "मानव रोग - जीवाणु व विषाणु जनित",
      descEn: "Tuberculosis, Typhoid, Malaria (Plasmodium), Dengue, Rabies & Polio",
      descHi: "टीबी, टाइफाइड, मलेरिया (प्लास्मोडियम), डेंगू, रेबीज और पोलियो",
      promptEn: "Biology Human Diseases, bacterial diseases cholera TB, viral diseases polio dengue rabies, protozoan malaria Plasmodium female Anopheles",
      promptHi: "जीवाणु और विषाणु जनित रोग, मलेरिया परजीवी, डेंगू और बचाव",
      icon: "🦠"
    },
    {
      titleEn: "Vitamins, Minerals & Nutrition",
      titleHi: "विटामिन, खनिज व पोषण की कमी के रोग",
      descEn: "Vitamin A (Night blindness), C (Scurvy), D (Rickets), B12 & Iron (Anemia)",
      descHi: "विटामिन A (रतौंधी), C (स्कर्वी), D (रिकेट्स), B12 और आयरन (एनीमिया)",
      promptEn: "Biology Vitamins and Deficiency, Vitamin A night blindness, Vitamin C scurvy ascorbic acid, Vitamin D rickets, iron deficiency anemia",
      promptHi: "विटामिनों के रासायनिक नाम, कमी से होने वाले रोग और संतुलित पोषण",
      icon: "🥗"
    },
    {
      titleEn: "Ecology, Biodiversity & Evolution",
      titleHi: "पारिस्थितिकी, खाद्य जाल व डार्विन का विकासवाद",
      descEn: "Food chain, Trophic levels, Darwin's Natural Selection & Biomes",
      descHi: "खाद्य श्रृंखला, पोषण स्तर, डार्विन का प्राकृतिक चयन सिद्धांत",
      promptEn: "Biology Ecology and Evolution, Charles Darwin natural selection Origin of Species, food chain primary producers, trophic levels 10 percent rule",
      promptHi: "पारिस्थितिकी, खाद्य जाल, 10% ऊर्जा नियम और डार्विन का विकासवाद",
      icon: "🌲"
    },
    {
      titleEn: "👑 Biology Grand Life Science Boss",
      titleHi: "👑 जीवविज्ञान महा-बॉस मुकाबला",
      descEn: "Championship challenge across all human anatomy, genetics and botany!",
      descHi: "मानव शरीर, वनस्पति और आनुवंशिकी का संपूर्ण महा-मुकाबला!",
      promptEn: "Comprehensive Biology master mock test combining human physiology, botany, zoology and genetics",
      promptHi: "संपूर्ण जीवविज्ञान (Biology) का निर्णायक महा-मॉक टेस्ट",
      icon: "👑"
    }
  ]
};
