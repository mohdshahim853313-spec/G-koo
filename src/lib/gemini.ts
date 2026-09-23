import { 
  filterUnmasteredQuestions, 
  getRetryQuestions, 
  isQuestionMastered, 
  normalizeQuestionKey 
} from './questionTracker';
import { CURATED_BANK_HI, CURATED_BANK_EN } from '../data/curatedQuestionBank';
import { deduplicateForLevel, saveCategoryAssignedQuestions } from './levelDeduplicator';

export interface QuizQuestion {
  id: number | string;
  text: string;
  options: string[];
  answer: string;
  explanation?: string;
  category?: string;
  source?: 'ai' | 'offline' | 'saved';
}

export interface AiQuizOptions {
  topic?: string;
  categoryId?: string;
  levelNumber?: number;
  customPrompt?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  lang?: 'en' | 'hi';
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------------------------------------------------
// DYNAMIC EXPANDED QUESTION REPOSITORY - ENGLISH
// -------------------------------------------------------------
const QUESTION_BANK_EN: Record<string, QuizQuestion[]> = {
  india: [
    { id: "in-1", text: "Which city is known as the 'Pink City' of India?", options: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer"], answer: "Jaipur", explanation: "Jaipur was painted terracotta pink in 1876 by Maharaja Ram Singh to welcome the Prince of Wales." },
    { id: "in-2", text: "Who was widely known as the 'Iron Man' of India?", options: ["Sardar Patel", "Jawaharlal Nehru", "Mahatma Gandhi", "Subhash C. Bose"], answer: "Sardar Patel", explanation: "Sardar Vallabhbhai Patel unified over 560 princely states into one united Indian nation." },
    { id: "in-3", text: "Which Indian state is known as the 'Land of Five Rivers'?", options: ["Punjab", "Haryana", "Gujarat", "Maharashtra"], answer: "Punjab", explanation: "Punjab gets its name from Persian 'Panj' (five) and 'Aab' (water) for the 5 tributary rivers of Indus." },
    { id: "in-4", text: "What is the highest civilian award in India?", options: ["Bharat Ratna", "Padma Vibhushan", "Param Vir Chakra", "Padma Shri"], answer: "Bharat Ratna", explanation: "Instituted in 1954, Bharat Ratna is conferred for exceptional service in public life, art, and science." },
    { id: "in-5", text: "Where is ISRO's primary satellite launch centre located in India?", options: ["Sriharikota", "Thiruvananthapuram", "Bengaluru", "Chandipur"], answer: "Sriharikota", explanation: "Satish Dhawan Space Centre (SDSC) in Sriharikota, Andhra Pradesh, is India's premier spaceport." },
    { id: "in-6", text: "Which river is considered the longest in India within its borders?", options: ["Ganga", "Godavari", "Brahmaputra", "Narmada"], answer: "Ganga", explanation: "The sacred Ganga flows over 2,525 km through India before entering the Bay of Bengal." },
    { id: "in-7", text: "Which monumental dam is built on the Mahanadi River in Odisha?", options: ["Hirakud Dam", "Bhakra Nangal", "Tehri Dam", "Sardar Sarovar"], answer: "Hirakud Dam", explanation: "Hirakud is one of the longest man-made earthen dams in the world." },
    { id: "in-8", text: "Which Indian state has the highest literacy rate according to census records?", options: ["Kerala", "Mizoram", "Goa", "Himachal Pradesh"], answer: "Kerala", explanation: "Kerala consistently leads India with literacy rates exceeding 94%." }
  ],
  world: [
    { id: "w-1", text: "What is the capital city of Australia?", options: ["Canberra", "Sydney", "Melbourne", "Brisbane"], answer: "Canberra", explanation: "Canberra was chosen in 1908 as a federal compromise between rival cities Sydney and Melbourne." },
    { id: "w-2", text: "Which is the longest river in the world by total length?", options: ["Nile", "Amazon", "Yangtze", "Mississippi"], answer: "Nile", explanation: "The Nile River spans approx 6,650 km flowing northward across northeastern Africa." },
    { id: "w-3", text: "Which country has the most natural lakes in the world?", options: ["Canada", "Russia", "USA", "Finland"], answer: "Canada", explanation: "Canada contains more than 60% of all the world's natural lakes (over 879,000 lakes)." },
    { id: "w-4", text: "Which mountain is the highest peak on Earth above sea level?", options: ["Mount Everest", "K2", "Kangchenjunga", "Lhotse"], answer: "Mount Everest", explanation: "Mount Everest reaches 8,848.86 meters (29,031.7 ft) in the Himalayas." },
    { id: "w-5", text: "What is the official currency of Japan?", options: ["Yen", "Won", "Yuan", "Ringgit"], answer: "Yen", explanation: "The Japanese Yen (¥) is one of the most widely traded global reserve currencies." },
    { id: "w-6", text: "Which country is called the 'Land of the Midnight Sun'?", options: ["Norway", "Iceland", "Sweden", "New Zealand"], answer: "Norway", explanation: "Northern Norway experiences continuous daylight from May to late July due to Earth's axial tilt." }
  ],
  subjects: [
    { id: "s-1", text: "What is known as the powerhouse of the biological cell?", options: ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"], answer: "Mitochondria", explanation: "Mitochondria generate ATP (adenosine triphosphate) which fuels cellular metabolic processes." },
    { id: "s-2", text: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Pb"], answer: "Au", explanation: "Au originates from the Latin word 'Aurum', meaning shining dawn." },
    { id: "s-3", text: "Who discovered the universal law of Gravitation?", options: ["Sir Isaac Newton", "Albert Einstein", "Galileo Galilei", "Niels Bohr"], answer: "Sir Isaac Newton", explanation: "Newton formulated the law of universal gravitation in his masterwork 'Principia' in 1687." },
    { id: "s-4", text: "Which gas is most abundant in Earth's atmosphere?", options: ["Nitrogen (78%)", "Oxygen (21%)", "Carbon Dioxide", "Argon"], answer: "Nitrogen (78%)", explanation: "Nitrogen makes up roughly 78.08% of dry atmosphere, with oxygen at 20.95%." },
    { id: "s-5", text: "What is the approximate speed of light in vacuum?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], answer: "300,000 km/s", explanation: "Light travels at exactly 299,792,458 meters per second in a vacuum." }
  ],
  mix: [
    { id: "m-1", text: "Which is the hardest known natural mineral on Earth?", options: ["Diamond", "Corundum", "Quartz", "Topaz"], answer: "Diamond", explanation: "Diamond's rigid crystal covalent bonds give it the highest rating of 10 on the Mohs hardness scale." },
    { id: "m-2", text: "Who invented the World Wide Web (WWW) in 1989?", options: ["Tim Berners-Lee", "Bill Gates", "Alan Turing", "Steve Wozniak"], answer: "Tim Berners-Lee", explanation: "Sir Tim Berners-Lee invented the World Wide Web while working at CERN in Geneva." },
    { id: "m-3", text: "How many bones are there in an adult human body?", options: ["206", "214", "198", "250"], answer: "206", explanation: "Babies are born with around 270 bones, which fuse together over growth into 206 bones in adults." },
    { id: "m-4", text: "Which bird is universally recognized for being the fastest diving animal in the world?", options: ["Peregrine Falcon", "Golden Eagle", "Cheetah", "Swift"], answer: "Peregrine Falcon", explanation: "The Peregrine Falcon reaches diving hunting speeds exceeding 320 km/h (200 mph)." },
    { id: "m-5", text: "Which chess piece can move only diagonally?", options: ["Bishop", "Rook", "Knight", "Pawn"], answer: "Bishop", explanation: "A Bishop stays on its starting color tile and moves diagonally any number of open squares." }
  ],
  current: [
    { id: "c-1", text: "Which country launched 'LignoSat', the world's first wooden experimental satellite?", options: ["Japan", "USA", "India", "Germany"], answer: "Japan", explanation: "Kyoto University designed LignoSat to reduce metal space debris upon atmospheric re-entry." },
    { id: "c-2", text: "Who received the Nobel Prize in Physics for foundational discoveries in Machine Learning?", options: ["John Hopfield & Geoffrey Hinton", "Demis Hassabis & John Jumper", "Roger Penrose", "Klaus Hasselmann"], answer: "John Hopfield & Geoffrey Hinton", explanation: "Hopfield and Hinton pioneered neural network physics and machine learning architectures." },
    { id: "c-3", text: "Which space telescope captured the deepest infrared views of early universe galaxies (JADES-GS-z14-0)?", options: ["James Webb Space Telescope", "Hubble Space Telescope", "Spitzer", "Euclid Telescope"], answer: "James Webb Space Telescope", explanation: "JWST detected galaxies that formed less than 300 million years after the Big Bang." },
    { id: "c-4", text: "What is the primary target of NASA's Artemis program?", options: ["Sustainable human exploration of the Moon", "Manned landing on Venus", "Asteroid deflection system", "Orbital solar farm"], answer: "Sustainable human exploration of the Moon", explanation: "Artemis plans to land the first woman and person of color on the lunar south pole." },
    { id: "c-5", text: "Which Indian state launched India's first AI-driven adaptive traffic signal network?", options: ["Karnataka (Bengaluru)", "Maharashtra", "Telangana", "Gujarat"], answer: "Karnataka (Bengaluru)", explanation: "Bengaluru implemented AI-controlled cameras to calculate vehicle density and dynamically change green lights." }
  ],
  ca_india: [
    { id: "cai-1", text: "Which indigenous aircraft carrier was officially commissioned into the Indian Navy at Cochin Shipyard?", options: ["INS Vikrant", "INS Vikramaditya", "INS Vishal", "INS Arihant"], answer: "INS Vikrant", explanation: "INS Vikrant (IAC-1) is India's first indigenously designed and built aircraft carrier." },
    { id: "cai-2", text: "Under ISRO's Gaganyaan mission, where are the Indian astronauts (Gaganyatris) designated to orbit?", options: ["Low Earth Orbit (400 km)", "Geostationary Orbit", "Lunar Orbit", "Lagrange Point L1"], answer: "Low Earth Orbit (400 km)", explanation: "Gaganyaan will launch a 3-member crew into a 400 km Low Earth Orbit for a 3-day mission." },
    { id: "cai-3", text: "Which grand infrastructure corridor was inaugurated to connect Delhi and Mumbai in record travel time?", options: ["Delhi-Mumbai Expressway", "Purvanchal Expressway", "Samruddhi Mahamarg", "Ganga Expressway"], answer: "Delhi-Mumbai Expressway", explanation: "The 1,386 km Delhi-Mumbai Expressway is India's longest 8-lane access-controlled greenfield highway." },
    { id: "cai-4", text: "Who was awarded the prestigious Bharat Ratna posthumously in 2024 for championing farmer welfare & social justice?", options: ["Chaudhary Charan Singh & Karpoori Thakur", "Atal Bihari Vajpayee", "Pranab Mukherjee", "Nanaji Deshmukh"], answer: "Chaudhary Charan Singh & Karpoori Thakur", explanation: "Bharat Ratna was conferred upon Chaudhary Charan Singh, Karpoori Thakur, PV Narasimha Rao, MS Swaminathan & LK Advani." },
    { id: "cai-5", text: "Which Indian grandmaster made history by winning the FIDE Candidates Tournament at age 17?", options: ["D Gukesh", "R Praggnanandhaa", "Vidit Gujrathi", "Arjun Erigaisi"], answer: "D Gukesh", explanation: "Dommaraju Gukesh became the youngest-ever challenger in world chess championship history." },
    { id: "cai-6", text: "Which national mission aims to produce 5 Million Metric Tonnes of green hydrogen annually in India by 2030?", options: ["National Green Hydrogen Mission", "Solar India Mission", "PM-KUSUM", "Atmanirbhar Energy"], answer: "National Green Hydrogen Mission", explanation: "The National Green Hydrogen Mission was launched with an outlay of ₹19,744 crore to lead global clean fuel exports." }
  ],
  ca_world: [
    { id: "caw-1", text: "Which historic global connectivity corridor was announced at the New Delhi G20 Leaders Summit?", options: ["India-Middle East-Europe Economic Corridor (IMEC)", "Belt and Road Initiative (BRI)", "Nord Stream 2", "Trans-Siberian Link"], answer: "India-Middle East-Europe Economic Corridor (IMEC)", explanation: "IMEC aims to stimulate economic development through enhanced connectivity between Asia, Arabian Gulf and Europe." },
    { id: "caw-2", text: "Which five countries officially joined the BRICS grouping in its landmark expansion?", options: ["Egypt, Ethiopia, Iran, Saudi Arabia & UAE", "Argentina, Mexico, Turkey, Nigeria & Qatar", "Indonesia, Vietnam, Thailand, Malaysia & Peru", "Kenya, Chile, Poland, Norway & Singapore"], answer: "Egypt, Ethiopia, Iran, Saudi Arabia & UAE", explanation: "BRICS doubled its membership with new energy powerhouses joining the multilateral bloc." },
    { id: "caw-3", text: "Which city hosted the 33rd Summer Olympic Games in 2024?", options: ["Paris (France)", "Los Angeles (USA)", "Brisbane (Australia)", "Rome (Italy)"], answer: "Paris (France)", explanation: "Paris hosted the 2024 Summer Olympics with an iconic open-air opening ceremony on the River Seine." },
    { id: "caw-4", text: "Which UN climate agreement target commits the world to limiting global temperature rise to 1.5°C?", options: ["Paris Climate Agreement (COP21)", "Kyoto Protocol", "Montreal Protocol", "Stockholm Declaration"], answer: "Paris Climate Agreement (COP21)", explanation: "The landmark 2015 Paris Agreement sets global commitments to limit warming well below 2°C, pursuing 1.5°C." },
    { id: "caw-5", text: "Which European nation became the 32nd official member country of NATO in 2024?", options: ["Sweden", "Finland", "Ukraine", "Switzerland"], answer: "Sweden", explanation: "Sweden formally joined NATO on March 7, 2024, following Finland's accession in 2023." }
  ],
  ssc_cgl: [
    { id: "cgl-1", text: "Which Fundamental Right in the Indian Constitution is termed as the 'Heart and Soul of the Constitution' by Dr. B.R. Ambedkar?", options: ["Right to Constitutional Remedies (Art 32)", "Right to Equality (Art 14)", "Right to Freedom of Speech (Art 19)", "Right to Life (Art 21)"], answer: "Right to Constitutional Remedies (Art 32)", explanation: "Article 32 allows citizens to move the Supreme Court directly for enforcement of Fundamental Rights via writs." },
    { id: "cgl-2", text: "The famous 'Dancing Girl' bronze statue was excavated from which Indus Valley site?", options: ["Mohenjo-daro", "Harappa", "Lothal", "Kalibangan"], answer: "Mohenjo-daro", explanation: "Discovered by Ernest Mackay in 1926 at Mohenjo-daro, it represents prehistoric lost-wax bronze casting mastercraft." },
    { id: "cgl-3", text: "Which atmospheric layer contains the protective Ozone Layer?", options: ["Stratosphere", "Troposphere", "Mesosphere", "Thermosphere"], answer: "Stratosphere", explanation: "The Ozone layer is situated in the lower stratosphere between 15 to 35 km above Earth." },
    { id: "cgl-4", text: "Which Five Year Plan was based on the Mahalanobis Model in India?", options: ["Second Plan (1956-61)", "First Plan (1951-56)", "Third Plan (1961-66)", "Fourth Plan (1969-74)"], answer: "Second Plan (1956-61)", explanation: "The Second Five Year Plan prioritized rapid heavy industrialization formulated by PC Mahalanobis." },
    { id: "cgl-5", text: "What is the SI unit of Magnetic Flux?", options: ["Weber", "Tesla", "Henry", "Pascal"], answer: "Weber", explanation: "The SI unit of magnetic flux is Weber (Wb), named after German physicist Wilhelm Eduard Weber." }
  ],
  ssc_chsl: [
    { id: "chsl-1", text: "The famous 'Hornbill Festival' is celebrated annually in which Indian state?", options: ["Nagaland", "Manipur", "Mizoram", "Arunachal Pradesh"], answer: "Nagaland", explanation: "Celebrated in Kohima, Nagaland every December, it showcases vibrant indigenous Naga cultural heritage." },
    { id: "chsl-2", text: "Which Indian state has the longest coastline on the mainland?", options: ["Gujarat", "Andhra Pradesh", "Tamil Nadu", "Maharashtra"], answer: "Gujarat", explanation: "Gujarat has a coastline spanning over 1,600 km along the Arabian Sea." },
    { id: "chsl-3", text: "Who was the founder of the Slave Dynasty in Medieval India?", options: ["Qutb-ud-din Aibak", "Iltutmish", "Balban", "Razia Sultana"], answer: "Qutb-ud-din Aibak", explanation: "Qutb-ud-din Aibak established the Mamluk (Slave) dynasty in 1206 AD and initiated the Qutub Minar." },
    { id: "chsl-4", text: "Which organ produces Insulin in the human body?", options: ["Pancreas", "Liver", "Kidney", "Thyroid"], answer: "Pancreas", explanation: "Beta cells in the Islets of Langerhans within the Pancreas produce and secrete insulin." },
    { id: "chsl-5", text: "What is the shortcut key in Windows to permanently delete a selected file?", options: ["Shift + Delete", "Ctrl + Delete", "Alt + Delete", "F8 + Delete"], answer: "Shift + Delete", explanation: "Shift + Delete bypasses the Recycle Bin and deletes the item directly." }
  ],
  uppsc: [
    { id: "uppsc-1", text: "Which district of Uttar Pradesh shares international border with Nepal as well as boundaries with multiple districts?", options: ["Lakhimpur Kheri", "Sonbhadra", "Bahraich", "Maharajganj"], answer: "Lakhimpur Kheri", explanation: "Lakhimpur Kheri is the largest district by area in UP and borders Nepal with Dudhwa National Park." },
    { id: "uppsc-2", text: "How many state legislative assembly (Vidhan Sabha) seats are there in Uttar Pradesh?", options: ["403", "400", "395", "415"], answer: "403", explanation: "UP has the largest unicameral assembly representation in India with 403 elected members." },
    { id: "uppsc-3", text: "Under UP's ODOP (One District One Product) scheme, which product is matched with Firozabad?", options: ["Glassware & Bangles", "Brassware", "Silk Sarees", "Leather Goods"], answer: "Glassware & Bangles", explanation: "Firozabad is globally known as 'Suhag Nagari' for traditional and modern decorative glass craftsmanship." },
    { id: "uppsc-4", text: "Which river originates from Gomat Taal (Fulhar Jheel) in Pilibhit district of UP?", options: ["Gomti", "Ghaghara", "Betwa", "Ramganga"], answer: "Gomti", explanation: "Gomti river flows 960 km through Lucknow and Jaunpur before meeting the Ganga near Varanasi." },
    { id: "uppsc-5", text: "Where did the historic 1857 Revolt officially ignite on May 10, 1857?", options: ["Meerut", "Lucknow", "Kanpur", "Jhansi"], answer: "Meerut", explanation: "Sepoys of the 3rd Bengal Light Cavalry mutinied at Meerut cantonment on May 10, 1857." }
  ],
  upsc: [
    { id: "upsc-1", text: "The 'Basic Structure Doctrine' was propounded by the Supreme Court in which landmark constitutional judgment?", options: ["Kesavananda Bharati v. State of Kerala (1973)", "Golaknath Case (1967)", "Minerva Mills Case (1980)", "Maneka Gandhi Case (1978)"], answer: "Kesavananda Bharati v. State of Kerala (1973)", explanation: "A 13-judge bench ruled that Parliament cannot alter the basic constitutional framework under Article 368." },
    { id: "upsc-2", text: "Which international convention governs the conservation and sustainable use of Wetlands?", options: ["Ramsar Convention (1971)", "Bonn Convention", "Basel Convention", "Stockholm Convention"], answer: "Ramsar Convention (1971)", explanation: "Signed in Ramsar, Iran, it provides the framework for national action and international cooperation on wetlands." },
    { id: "upsc-3", text: "What causes the Coriolis force that deflects winds to the right in the Northern Hemisphere?", options: ["Rotation of the Earth on its axis", "Revolution around the Sun", "Axial tilt of Earth", "Gravitational tidal bulge"], answer: "Rotation of the Earth on its axis", explanation: "Earth's eastward rotation causes moving air and water to curve relative to Earth's surface." },
    { id: "upsc-4", text: "What is the primary function of the CRISPR-Cas9 technology in modern biotechnology?", options: ["Targeted Gene Editing & Molecular Scissors", "Deep-sea Oil Spill Cleanup", "Quantum Encryption Protocol", "Nuclear Waste Recycling"], answer: "Targeted Gene Editing & Molecular Scissors", explanation: "CRISPR-Cas9 acts as programmable molecular scissors allowing precise genetic code alterations." }
  ],
  railway: [
    { id: "rr-1", text: "When did the first passenger train in India run between Mumbai (Bori Bunder) and Thane?", options: ["16 April 1853", "15 August 1857", "26 January 1850", "1 May 1860"], answer: "16 April 1853", explanation: "Dedicated on 16 April 1853, the train covered 34 km with 400 passengers hauled by 3 steam locomotives." },
    { id: "rr-2", text: "Where is the headquarters of the Northern Railway Zone located in India?", options: ["New Delhi", "Gorakhpur", "Prayagraj", "Jaipur"], answer: "New Delhi", explanation: "Northern Railway is headquartered at Baroda House, New Delhi." },
    { id: "rr-3", text: "What is the normal lifespan of Red Blood Cells (RBCs) in human body?", options: ["120 Days", "60 Days", "180 Days", "365 Days"], answer: "120 Days", explanation: "RBCs circulate for approximately 120 days before being filtered and recycled in the spleen." },
    { id: "rr-4", text: "What coating is applied to iron during the Galvanization process to prevent rusting?", options: ["Zinc", "Copper", "Tin", "Nickel"], answer: "Zinc", explanation: "Galvanization coats iron or steel with a protective sacrificial layer of zinc." }
  ],
  banking: [
    { id: "bk-1", text: "In which year was the Reserve Bank of India (RBI) established under the RBI Act 1934?", options: ["1 April 1935", "15 August 1947", "1 January 1949", "26 January 1950"], answer: "1 April 1935", explanation: "RBI commenced operations on April 1, 1935, based on the recommendations of the Hilton Young Commission." },
    { id: "bk-2", text: "What is the interest rate at which RBI lends money to commercial banks against government securities?", options: ["Repo Rate", "Reverse Repo Rate", "CRR", "Bank Rate"], answer: "Repo Rate", explanation: "Repo Rate (Repurchasing Option) is the benchmark policy rate used by RBI to control inflation and liquidity." },
    { id: "bk-3", text: "How many alphanumeric characters are there in an Indian Financial System Code (IFSC)?", options: ["11 Characters", "10 Characters", "12 Characters", "16 Characters"], answer: "11 Characters", explanation: "IFSC has 11 characters: first 4 represent bank, 5th is zero, and last 6 identify the branch." },
    { id: "bk-4", text: "A loan asset is classified as Non-Performing Asset (NPA) when interest or principal remains overdue for more than:", options: ["90 Days", "60 Days", "180 Days", "30 Days"], answer: "90 Days", explanation: "RBI guidelines mandate classification as NPA when overdue surpasses 90 continuous days." }
  ]
};

// -------------------------------------------------------------
// DYNAMIC EXPANDED QUESTION REPOSITORY - PURE HINDI (हिंदी)
// -------------------------------------------------------------
const QUESTION_BANK_HI: Record<string, QuizQuestion[]> = {
  india: [
    { id: "hi-in-1", text: "भारत के किस शहर को 'गुलाबी नगर' (Pink City) कहा जाता है?", options: ["जयपुर", "उदयपुर", "जोधपुर", "जैसलमेर"], answer: "जयपुर", explanation: "महाराजा राम सिंह ने 1876 में प्रिंस ऑफ वेल्स के स्वागत में जयपुर को गुलाबी रंग से रंगवाया था।" },
    { id: "hi-in-2", text: "भारत का 'लौह पुरुष' किसे कहा जाता है?", options: ["सरदार वल्लभभाई पटेल", "जवाहरलाल नेहरू", "सुभाष चंद्र बोस", "महात्मा गांधी"], answer: "सरदार वल्लभभाई पटेल", explanation: "सरदार पटेल ने 560 से अधिक रियासतों का एकीकरण कर आधुनिक भारत का निर्माण किया।" },
    { id: "hi-in-3", text: "भारत का सर्वोच्च नागरिक सम्मान कौन सा है?", options: ["भारत रत्न", "पद्म विभूषण", "परमवीर चक्र", "पद्म श्री"], answer: "भारत रत्न", explanation: "भारत रत्न देश का सर्वोच्च नागरिक सम्मान है जो कला, साहित्य, विज्ञान और सार्वजनिक सेवा के लिए दिया जाता है।" },
    { id: "hi-in-4", text: "भारत की सबसे लंबी और पवित्र नदी कौन सी है?", options: ["गंगा नदी", "गोदावरी नदी", "यमुना नदी", "नर्मदा नदी"], answer: "गंगा नदी", explanation: "गंगा नदी 2,525 किमी की लंबाई के साथ भारत की सबसे लंबी नदी है।" },
    { id: "hi-in-5", text: "भारतीय अंतरिक्ष अनुसंधान संगठन (ISRO) का प्रमुख रॉकेट लॉन्च केंद्र कहाँ स्थित है?", options: ["श्रीहरिकोटा (आंध्र प्रदेश)", "तिरुवनंतपुरम", "बेंगलुरु", "चांदीपुर"], answer: "श्रीहरिकोटा (आंध्र प्रदेश)", explanation: "सतीश धवन अंतरिक्ष केंद्र (SDSC) श्रीहरिकोटा में स्थित भारत का प्रमुख स्पेसपोर्ट है।" },
    { id: "hi-in-6", text: "किस राज्य को 'पांच नदियों की भूमि' कहा जाता है?", options: ["पंजाब", "हरियाणा", "उत्तर प्रदेश", "बिहार"], answer: "पंजाब", explanation: "पंजाब नाम फ़ारसी के 'पंज' (पाँच) और 'आब' (पानी) से मिलकर बना है।" },
    { id: "hi-in-7", text: "भारत की पहली महिला प्रधानमंत्री कौन थीं?", options: ["श्रीमती इंदिरा गांधी", "सरोजिनी नायडू", "प्रतिभा पाटिल", "सुषमा स्वराज"], answer: "श्रीमती इंदिरा गांधी", explanation: "इंदिरा गांधी 1966 से 1977 और 1980 से 1984 तक भारत की प्रधानमंत्री रहीं।" }
  ],
  world: [
    { id: "hi-w-1", text: "ऑस्ट्रेलिया की आधिकारिक राजधानी कौन सी है?", options: ["कैनबरा", "सिडनी", "मेलबर्न", "पर्थ"], answer: "कैनबरा", explanation: "सिडनी और मेलबर्न के बीच समझौते के रूप में 1908 में कैनबरा को राजधानी चुना गया था।" },
    { id: "hi-w-2", text: "विश्व की सबसे लंबी नदी कौन सी है?", options: ["नील नदी", "अमेज़न नदी", "यांग्त्से नदी", "मिसिसिपी नदी"], answer: "नील नदी", explanation: "नील नदी अफ्रीका महाद्वीप में लगभग 6,650 किमी लंबी है।" },
    { id: "hi-w-3", text: "जापान की आधिकारिक मुद्रा (Currency) क्या है?", options: ["येन", "वोन", "युआन", "डॉलर"], answer: "येन", explanation: "जापानी येन (¥) दुनिया की प्रमुख व्यापारिक मुद्राओं में से एक है।" },
    { id: "hi-w-4", text: "विश्व का सबसे ऊँचा पर्वत शिखर कौन सा है?", options: ["माउंट एवरेस्ट", "के2 (गॉडविन ऑस्टिन)", "कंचनजंगा", "ल्होत्से"], answer: "माउंट एवरेस्ट", explanation: "माउंट एवरेस्ट हिमालय में 8,848.86 मीटर की ऊँचाई के साथ दुनिया का सबसे ऊँचा पर्वत है।" },
    { id: "hi-w-5", text: "विश्व में सबसे अधिक प्राकृतिक झीलों वाला देश कौन सा है?", options: ["कनाडा", "रूस", "अमेरिका", "फिनलैंड"], answer: "कनाडा", explanation: "कनाडा में दुनिया की 60% से अधिक प्राकृतिक झीलें मौजूद हैं।" }
  ],
  subjects: [
    { id: "hi-s-1", text: "जैविक कोशिका (Cell) का 'पावरहाउस' किसे कहा जाता है?", options: ["माइटोकॉन्ड्रिया", "केंद्रक (Nucleus)", "राइबोसोम", "लाइसोसोम"], answer: "माइटोकॉन्ड्रिया", explanation: "माइटोकॉन्ड्रिया कोशिका के लिए एटीपी (ATP) के रूप में ऊर्जा का निर्माण करता है।" },
    { id: "hi-s-2", text: "सोने (Gold) का रासायनिक प्रतीक क्या है?", options: ["Au", "Ag", "Fe", "Pb"], answer: "Au", explanation: "Au लैटिन शब्द 'Aurum' से लिया गया है जिसका अर्थ है चमकती हुई सुबह।" },
    { id: "hi-s-3", text: "गुरुत्वाकर्षण (Gravity) का सार्वभौमिक नियम किसने प्रतिपादित किया?", options: ["सर आइजक न्यूटन", "अल्बर्ट आइंस्टीन", "गैलीलियो गैलीली", "मैरी क्यूरी"], answer: "सर आइजक न्यूटन", explanation: "न्यूटन ने 1687 में गुरुत्वाकर्षण और गति के तीन बुनियादी नियमों की खोज की थी।" },
    { id: "hi-s-4", text: "पृथ्वी के वायुमंडल में सबसे अधिक मात्रा में कौन सी गैस पाई जाती है?", options: ["नाइट्रोजन (78%)", "ऑक्सीजन (21%)", "कार्बन डाइऑक्साइड", "हीलियम"], answer: "नाइट्रोजन (78%)", explanation: "पृथ्वी के शुष्क वायुमंडल में लगभग 78.08% नाइट्रोजन और 20.95% ऑक्सीजन मौजूद है।" },
    { id: "hi-s-5", text: "प्रकाश की चाल निर्वात में लगभग कितनी होती है?", options: ["3 लाख किमी/सेकंड", "1.5 लाख किमी/सेकंड", "5 लाख किमी/सेकंड", "10 लाख किमी/सेकंड"], answer: "3 लाख किमी/सेकंड", explanation: "निर्वात में प्रकाश की गति 299,792,458 मीटर प्रति सेकंड होती है।" }
  ],
  mix: [
    { id: "hi-m-1", text: "पृथ्वी पर पाया जाने वाला सबसे कठोर प्राकृतिक पदार्थ कौन सा है?", options: ["हीरा (Diamond)", "क्वार्ट्ज", "लोहा", "प्लेटिनम"], answer: "हीरा (Diamond)", explanation: "हीरा कार्बन का अपररूप है और मोह पैमाने पर 10 की कठोरता रखता है।" },
    { id: "hi-m-2", text: "शतरंज (Chess) के खेल में कौन सा मोहरा केवल तिरछी चाल चलता है?", options: ["ऊंट (Bishop)", "हाथी (Rook)", "घोड़ा (Knight)", "प्यादा (Pawn)"], answer: "ऊंट (Bishop)", explanation: "ऊंट केवल अपने रंग के खानों पर तिरछी चाल चलता है।" },
    { id: "hi-m-3", text: "मानव शरीर में कुल कितनी हड्डियाँ होती हैं?", options: ["206", "214", "198", "250"], answer: "206", explanation: "वयस्क मानव शरीर में कुल 206 हड्डियाँ होती हैं।" },
    { id: "hi-m-4", text: "विश्व का सबसे तेज उड़ने वाला पक्षी कौन सा है?", options: ["पेरेग्रीन बाज़ (Falcon)", "चील (Eagle)", "स्विफ्ट", "कबूतर"], answer: "पेरेग्रीन बाज़ (Falcon)", explanation: "पेरेग्रीन बाज़ शिकार के समय 320 किमी/घंटा से अधिक की गति से गोता लगा सकता है।" }
  ],
  current: [
    { id: "hi-c-1", text: "पर्यावरण अनुकूल अंतरिक्ष अन्वेषण के लिए विश्व का पहला लकड़ी का उपग्रह 'लिग्नोसैट' किसने लॉन्च किया?", options: ["जापान", "अमेरिका", "भारत", "जर्मनी"], answer: "जापान", explanation: "क्योतो विश्वविद्यालय और जापानी वैज्ञानिकों ने अंतरिक्ष मलबे को घटाने हेतु लिग्नोसैट उपग्रह बनाया।" },
    { id: "hi-c-2", text: "मशीन लर्निंग और न्यूरल नेटवर्क के विकास के लिए भौतिकी का नोबेल पुरस्कार किसे दिया गया?", options: ["जॉन हॉपफील्ड और जेफ्री हिंटन", "डेमिस हसाबिस", "रोजर पेनरोज़", "क्लाउस हैसलमैन"], answer: "जॉन हॉपफील्ड और जेफ्री हिंटन", explanation: "हॉपफील्ड और हिंटन को एआई और न्यूरल नेटवर्क के भौतिकी सिद्धांतों के लिए सम्मानित किया गया।" },
    { id: "hi-c-3", text: "जेम्स वेब स्पेस टेलीस्कोप (JWST) का मुख्य उद्देश्य क्या है?", options: ["प्रारंभिक ब्रह्मांड और आकाशगंगाओं का अध्ययन", "मंगल ग्रह पर पानी खोजना", "चंद्रमा पर बेस बनाना", "सौर तूफान रोकना"], answer: "प्रारंभिक ब्रह्मांड और आकाशगंगाओं का अध्ययन", explanation: "JWST ने बिग बैंग के 30 करोड़ साल बाद बनी सबसे शुरुआती आकाशगंगाओं की तस्वीरें ली हैं।" }
  ],
  ca_india: [
    { id: "hi-cai-1", text: "भारत का पहला स्वदेशी विमानवाहक पोत (Aircraft Carrier) कौन सा है जिसे नौसेना में शामिल किया गया?", options: ["आईएनएस विक्रांत", "आईएनएस विक्रमादित्य", "आईएनएस विशाल", "आईएनएस अरिहंत"], answer: "आईएनएस विक्रांत", explanation: "आईएनएस विक्रांत (IAC-1) को कोचीन शिपयार्ड में भारत में ही पूरी तरह डिजाइन और निर्मित किया गया है।" },
    { id: "hi-cai-2", text: "इसरो के 'गगनयान' मिशन के तहत भारतीय अंतरिक्ष यात्रियों को पृथ्वी की किस कक्षा में भेजा जाएगा?", options: ["निम्न भू-कक्षा (400 किमी)", "भू-स्थैतिक कक्षा", "चंद्र कक्षा", "लैग्रेंज बिंदु L1"], answer: "निम्न भू-कक्षा (400 किमी)", explanation: "गगनयान मिशन के तहत 3 सदस्यों के दल को 400 किमी की कक्षा में 3 दिनों के लिए भेजा जाएगा।" },
    { id: "hi-cai-3", text: "वर्ष 2024 में मरणोपरांत किन महान जननायकों को देश के सर्वोच्च नागरिक सम्मान 'भारत रत्न' से सम्मानित किया गया?", options: ["चौधरी चरण सिंह एवं कर्पूरी ठाकुर", "अटल बिहारी वाजपेयी", "प्रणब मुखर्जी", "नानाजी देशमुख"], answer: "चौधरी चरण सिंह एवं कर्पूरी ठाकुर", explanation: "2024 में कर्पूरी ठाकुर, चौधरी चरण सिंह, पी.वी. नरसिम्हा राव, एम.एस. स्वामीनाथन और लालकृष्ण आडवाणी को भारत रत्न दिया गया।" },
    { id: "hi-cai-4", text: "कैंडिडेट्स शतरंज टूर्नामेंट जीतकर विश्व चैंपियनशिप का सबसे युवा चैलेंजर बनने का इतिहास किसने रचा?", options: ["डी. गुकेश", "आर. प्रज्ञानानंद", "विदित गुजराती", "अर्जुन एरिगैसी"], answer: "डी. गुकेश", explanation: "17 वर्षीय डी. गुकेश (डोम्माराजू गुकेश) ने कैंडिडेट्स टूर्नामेंट जीतकर विश्व इतिहास रच दिया।" },
    { id: "hi-cai-5", text: "2030 तक प्रतिवर्ष 50 लाख टन हरित हाइड्रोजन उत्पादन हेतु भारत सरकार ने कौन सा राष्ट्रीय मिशन शुरू किया?", options: ["राष्ट्रीय हरित हाइड्रोजन मिशन", "सोलर मिशन", "पीएम-कुसुम", "ऊर्जा आत्मनिर्भर योजना"], answer: "राष्ट्रीय हरित हाइड्रोजन मिशन", explanation: "राष्ट्रीय हरित हाइड्रोजन मिशन को ₹19,744 करोड़ के परिव्यय के साथ मंजूरी दी गई है।" }
  ],
  ca_world: [
    { id: "hi-caw-1", text: "नई दिल्ली में आयोजित जी20 शिखर सम्मेलन में किस ऐतिहासिक वैश्विक कनेक्टिविटी कॉरिडोर की घोषणा की गई थी?", options: ["भारत-मध्य पूर्व-यूरोप आर्थिक गलियारा (IMEC)", "बेल्ट एंड रोड (BRI)", "नॉर्ड स्ट्रीम 2", "ट्रांस साइबेरियन लिंक"], answer: "भारत-मध्य पूर्व-यूरोप आर्थिक गलियारा (IMEC)", explanation: "IMEC गलियारा भारत, अरब खाड़ी और यूरोप के बीच व्यापार व बुनियादी ढांचे को जोड़ेगा।" },
    { id: "hi-caw-2", text: "वर्ष 2024 में कौन से प्रमुख देश आधिकारिक तौर पर ब्रिक्स (BRICS) समूह के नए सदस्य बने?", options: ["मिस्र, इथियोपिया, ईरान, सऊदी अरब व यूएई", "अर्जेंटीना, मैक्सिको व तुर्की", "इंडोनेशिया, वियतनाम व थाईलैंड", "केन्या, चिली व पोलैंड"], answer: "मिस्र, इथियोपिया, ईरान, सऊदी अरब व यूएई", explanation: "ब्रिक्स के ऐतिहासिक विस्तार में ऊर्जा महाशक्तियों और अफ्रीकी देशों को शामिल किया गया।" },
    { id: "hi-caw-3", text: "वर्ष 2024 में 33वें ग्रीष्मकालीन ओलंपिक खेलों का भव्य आयोजन किस शहर में हुआ?", options: ["पेरिस (फ्रांस)", "लॉस एंजिल्स (अमेरिका)", "ब्रिस्बेन (ऑस्ट्रेलिया)", "रोम (इटली)"], answer: "पेरिस (फ्रांस)", explanation: "पेरिस 2024 ओलंपिक का उद्घाटन सीन नदी पर ऐतिहासिक ओपन-एयर परेड के साथ हुआ।" },
    { id: "hi-caw-4", text: "वर्ष 2024 में कौन सा यूरोपीय देश नाटो (NATO) का 32वां आधिकारिक सदस्य देश बना?", options: ["स्वीडन", "फिनलैंड", "यूक्रेन", "स्विट्जरलैंड"], answer: "स्वीडन", explanation: "स्वीडन 7 मार्च 2024 को औपचारिक रूप से नाटो सैन्य गठबंधन का 32वां सदस्य बन गया।" }
  ],
  ssc_cgl: [
    { id: "hi-cgl-1", text: "डॉ. बी.आर. अंबेडकर ने किस मौलिक अधिकार को 'संविधान का हृदय और आत्मा' कहा था?", options: ["संवैधानिक उपचारों का अधिकार (अनुच्छेद 32)", "समानता का अधिकार (अनुच्छेद 14)", "स्वतंत्रता का अधिकार (अनुच्छेद 19)", "धार्मिक स्वतंत्रता का अधिकार"], answer: "संवैधानिक उपचारों का अधिकार (अनुच्छेद 32)", explanation: "अनुच्छेद 32 के तहत नागरिक अपने मौलिक अधिकारों के उल्लंघन पर सीधे सर्वोच्च न्यायालय जा सकते हैं।" },
    { id: "hi-cgl-2", text: "सिंधु घाटी सभ्यता की प्रसिद्ध कांस्य 'नर्तकी की मूर्ति' कहाँ से प्राप्त हुई थी?", options: ["मोहनजोदड़ो", "हड़प्पा", "लोथल", "कालीबंगा"], answer: "मोहनजोदड़ो", explanation: "1926 में अर्नेस्ट मैके ने मोहनजोदड़ो से 'लॉस्ट-वैक्स' तकनीक से निर्मित यह अद्वितीय मूर्ति खोजी थी।" },
    { id: "hi-cgl-3", text: "भारत की कौन सी पंचवर्षीय योजना पीसी महालनोबिस मॉडल पर आधारित थी?", options: ["द्वितीय पंचवर्षीय योजना (1956-61)", "प्रथम पंचवर्षीय योजना", "तृतीय पंचवर्षीय योजना", "चतुर्थ योजना"], answer: "द्वितीय पंचवर्षीय योजना (1956-61)", explanation: "द्वितीय योजना में भारी उद्योगों और बुनियादी ढांचे के तीव्र विकास पर विशेष बल दिया गया था।" },
    { id: "hi-cgl-4", text: "चुंबकीय फ्लक्स (Magnetic Flux) की एसआई (SI) इकाई क्या है?", options: ["वेबर (Weber)", "टेस्ला", "हेनरी", "पास्कल"], answer: "वेबर (Weber)", explanation: "चुंबकीय फ्लक्स की मानक इकाई वेबर (Wb) होती है।" },
    { id: "hi-cgl-5", text: "भारतीय संविधान का कौन सा अनुच्छेद अस्पृश्यता (छुआछूत) के उन्मूलन से संबंधित है?", options: ["अनुच्छेद 17", "अनुच्छेद 18", "अनुच्छेद 15", "अनुच्छेद 19"], answer: "अनुच्छेद 17", explanation: "अनुच्छेद 17 अस्पृश्यता का पूर्ण रूप से अंत करता है और इसका आचरण दंडनीय अपराध घोषित करता है।" }
  ],
  ssc_chsl: [
    { id: "hi-chsl-1", text: "प्रसिद्ध 'हॉर्नबिल महोत्सव' प्रतिवर्ष भारत के किस राज्य में मनाया जाता है?", options: ["नागालैंड", "मणिपुर", "मिजोरम", "असम"], answer: "नागालैंड", explanation: "नागालैंड में दिसंबर माह में हॉर्नबिल महोत्सव नगा जनजाति की समृद्ध संस्कृति को प्रदर्शित करता है।" },
    { id: "hi-chsl-2", text: "भारत की मुख्य भूमि पर सबसे लंबी तटरेखा (Coastline) वाला राज्य कौन सा है?", options: ["गुजरात", "आंध्र प्रदेश", "तमिलनाडु", "महाराष्ट्र"], answer: "गुजरात", explanation: "गुजरात की तटीय सीमा 1600 किमी से अधिक लंबी है।" },
    { id: "hi-chsl-3", text: "मध्यकालीन भारत में गुलाम वंश (मामलुक वंश) का संस्थापक कौन था?", options: ["कुतुबुद्दीन ऐबक", "इल्तुतमिश", "बलबन", "रजिया सुल्तान"], answer: "कुतुबुद्दीन ऐबक", explanation: "कुतुबुद्दीन ऐबक ने 1206 ईस्वी में गुलाम वंश की स्थापना की और कुतुब मीनार का निर्माण शुरू कराया।" },
    { id: "hi-chsl-4", text: "मानव शरीर में इंसुलिन का निर्माण किस ग्रंथि/अंग द्वारा किया जाता है?", options: ["अग्न्याशय (Pancreas)", "यकृत (Liver)", "गुर्दा (Kidney)", "थायरॉयड"], answer: "अग्न्याशय (Pancreas)", explanation: "अग्न्याशय के लैंगरहैंस द्वीपसमूह की बीटा कोशिकाएं रक्त शर्करा नियंत्रित करने वाला इंसुलिन बनाती हैं।" },
    { id: "hi-chsl-5", text: "विंडोज में किसी चयनित फाइल को बिना रीसायकल बिन भेजे स्थायी रूप से हटाने का शॉर्टकट क्या है?", options: ["Shift + Delete", "Ctrl + Delete", "Alt + Delete", "F8 + Delete"], answer: "Shift + Delete", explanation: "Shift + Delete दबाने से फाइल स्थायी रूप से नष्ट हो जाती है।" }
  ],
  uppsc: [
    { id: "hi-uppsc-1", text: "उत्तर प्रदेश का कौन सा जिला क्षेत्रफल की दृष्टि से सबसे बड़ा है और नेपाल से सीमा साझा करता है?", options: ["लखीमपुर खीरी", "सोनभद्र", "बहराइच", "महराजगंज"], answer: "लखीमपुर खीरी", explanation: "लखीमपुर खीरी यूपी का सबसे बड़ा जिला है और यहीं पर प्रसिद्ध दुधवा राष्ट्रीय उद्यान स्थित है।" },
    { id: "hi-uppsc-2", text: "उत्तर प्रदेश विधानसभा (Vidhan Sabha) में कुल कितनी निर्वाचित सीटें हैं?", options: ["403 सीटें", "400 सीटें", "395 सीटें", "415 सीटें"], answer: "403 सीटें", explanation: "उत्तर प्रदेश विधानसभा में कुल 403 सदस्य जनता द्वारा प्रत्यक्ष चुने जाते हैं।" },
    { id: "hi-uppsc-3", text: "यूपी की 'एक जिला एक उत्पाद' (ODOP) योजना के तहत फिरोजाबाद को किस उत्पाद के लिए चुना गया है?", options: ["कांच के उत्पाद एवं चूड़ियां", "पीतल के बर्तन", "कालीन", "चमड़े के जूते"], answer: "कांच के उत्पाद एवं चूड़ियां", explanation: "फिरोजाबाद सदियों से रंग-बिरंगी कांच की चूड़ियों और कलात्मक ग्लासवेयर के लिए 'सुहाग नगरी' कहलाता है।" },
    { id: "hi-uppsc-4", text: "गोमती नदी का उद्गम उत्तर प्रदेश के किस जिले की गोमत ताल (फुलहर झील) से होता है?", options: ["पीलीभीत", "शाहजहांपुर", "लखीमपुर", "हरदोई"], answer: "पीलीभीत", explanation: "गोमती नदी पीलीभीत के फुलहर झील से निकलकर लखनऊ, जौनपुर होते हुए गाजीपुर के पास गंगा में मिलती है।" },
    { id: "hi-uppsc-5", text: "1857 की महान क्रांति का औपचारिक प्रारंभ 10 मई 1857 को उत्तर प्रदेश के किस नगर से हुआ था?", options: ["मेरठ", "लखनऊ", "कानपुर", "झांसी"], answer: "मेरठ", explanation: "मेरठ छावनी के भारतीय सैनिकों ने 10 मई 1857 को अंग्रेजों के विरुद्ध खुला विद्रोह कर दिया था।" }
  ],
  upsc: [
    { id: "hi-upsc-1", text: "सर्वोच्च न्यायालय ने किस ऐतिहासिक फैसले में 'संविधान के मूल ढांचे के सिद्धांत' (Basic Structure Doctrine) का प्रतिपादन किया?", options: ["केशवानंद भारती बनाम केरल राज्य (1973)", "गोलकनाथ वाद (1967)", "मिनर्वा मिल्स वाद (1980)", "मेनका गांधी वाद (1978)"], answer: "केशवानंद भारती बनाम केरल राज्य (1973)", explanation: "13 जजों की पीठ ने फैसला सुनाया कि संसद अनुच्छेद 368 के तहत संविधान के बुनियादी ढांचे को नष्ट नहीं कर सकती।" },
    { id: "hi-upsc-2", text: "विश्व भर में आर्द्रभूमियों (Wetlands) के संरक्षण के लिए 1971 में कौन सा अंतरराष्ट्रीय सम्मेलन हुआ था?", options: ["रामसर सम्मेलन (Ramsar)", "बॉन सम्मेलन", "स्टॉकहोम सम्मेलन", "क्योटो प्रोटोकॉल"], answer: "रामसर सम्मेलन (Ramsar)", explanation: "ईरान के रामसर शहर में हस्ताक्षरित यह संधि अंतरराष्ट्रीय महत्व की आर्द्रभूमियों के संरक्षण की रूपरेखा तय करती है।" },
    { id: "hi-upsc-3", text: "उत्तरी गोलार्ध में हवाओं को दाईं ओर मोड़ने वाले 'कोरिओलिस बल' (Coriolis Force) का मुख्य कारण क्या है?", options: ["पृथ्वी का अपने अक्ष पर घूर्णन (Rotation)", "सूर्य की परिक्रमा", "पृथ्वी का झुकाव", "ज्वार-भाटा"], answer: "पृथ्वी का अपने अक्ष पर घूर्णन (Rotation)", explanation: "पृथ्वी के पश्चिम से पूर्व घूर्णन के कारण गतिशील हवाओं और धाराओं की दिशा में विक्षेपण होता है।" },
    { id: "hi-upsc-4", text: "आधुनिक जैव प्रौद्योगिकी में 'क्रिसपर-कैस9' (CRISPR-Cas9) तकनीक का मुख्य उपयोग किस क्षेत्र में होता है?", options: ["सटीक जीन एडिटिंग (जीन संपादन)", "तेल रिसाव सफाई", "क्वांटम कंप्यूटर", "परमाणु संलयन"], answer: "सटीक जीन एडिटिंग (जीन संपादन)", explanation: "क्रिसपर-कैस9 एक आणविक कैंची की तरह काम करता है जिससे डीएनए के विशिष्ट भाग को आसानी से संपादित किया जा सकता है।" }
  ],
  railway: [
    { id: "hi-rr-1", text: "भारत में पहली यात्री रेलगाड़ी 16 अप्रैल 1853 को किन दो स्टेशनों के बीच चलाई गई थी?", options: ["मुंबई (बोरीबंदर) से ठाणे", "हावड़ा से हुगली", "चेन्नई से अरक्कोणम", "दिल्ली से मेरठ"], answer: "मुंबई (बोरीबंदर) से ठाणे", explanation: "लॉर्ड डलहौजी के कार्यकाल में 34 किमी की दूरी पर 3 भाप इंजनों (सिंध, सुल्तान, साहिब) के साथ पहली ट्रेन चली थी।" },
    { id: "hi-rr-2", text: "भारतीय रेल के उत्तर रेलवे (Northern Railway) ज़ोन का मुख्यालय कहाँ स्थित है?", options: ["नई दिल्ली (बड़ौदा हाउस)", "गोरखपुर", "प्रयागराज", "जयपुर"], answer: "नई दिल्ली (बड़ौदा हाउस)", explanation: "उत्तर रेलवे ज़ोन का प्रशासनिक मुख्यालय नई दिल्ली के बड़ौदा हाउस में है।" },
    { id: "hi-rr-3", text: "मानव शरीर में लाल रक्त कणिकाओं (RBC) का औसत जीवनकाल कितना होता है?", options: ["120 दिन", "60 दिन", "180 दिन", "365 दिन"], answer: "120 दिन", explanation: "आरबीसी लगभग 120 दिनों तक रक्त में ऑक्सीजन परिवहन करती हैं और फिर प्लीहा में नष्ट होती हैं।" },
    { id: "hi-rr-4", text: "लोहे को जंग से बचाने के लिए उस पर किस धातु की परत चढ़ाई जाती है (गैल्वनीकरण)?", options: ["जस्ता (Zinc)", "तांबा", "टिन", "निकल"], answer: "जस्ता (Zinc)", explanation: "गैल्वनाइजेशन प्रक्रिया में लोहे या स्टील पर पिघले हुए जस्ते (जिंक) की सुरक्षात्मक परत चढ़ाई जाती है।" }
  ],
  banking: [
    { id: "hi-bk-1", text: "भारतीय रिजर्व बैंक (RBI) की स्थापना किस वर्ष हिल्टन यंग कमीशन की सिफारिश पर हुई थी?", options: ["1 अप्रैल 1935", "15 अगस्त 1947", "1 जनवरी 1949", "26 जनवरी 1950"], answer: "1 अप्रैल 1935", explanation: "आरबीआई अधिनियम 1934 के तहत 1 अप्रैल 1935 को 5 करोड़ की अधिकृत पूंजी के साथ आरबीआई स्थापित हुआ था।" },
    { id: "hi-bk-2", text: "वह ब्याज दर जिस पर वाणिज्यिक बैंक आरबीआई से अल्पकालिक ऋण लेते हैं, क्या कहलाती है?", options: ["रेपो दर (Repo Rate)", "रिवर्स रेपो दर", "बैंक दर", "सीआरआर"], answer: "रेपो दर (Repo Rate)", explanation: "रेपो दर मुद्रास्फीति और बाजार में तरलता (लिक्विडिटी) को नियंत्रित करने का आरबीआई का मुख्य साधन है।" },
    { id: "hi-bk-3", text: "भारतीय वित्तीय प्रणाली कोड (IFSC Code) में कुल कितने अल्फ़ान्यूमेरिक अक्षर होते हैं?", options: ["11 अक्षर", "10 अक्षर", "12 अक्षर", "16 अक्षर"], answer: "11 अक्षर", explanation: "आईएफएससी कोड में 11 अक्षर होते हैं (पहले 4 बैंक कोड, 5वां 0 और अंतिम 6 शाखा पहचान)।" },
    { id: "hi-bk-4", text: "किसी बैंक ऋण को एनपीए (Non-Performing Asset) तब माना जाता है जब मूलधन या ब्याज कितने दिनों तक बकाया रहे?", options: ["90 दिन", "60 दिन", "180 दिन", "30 दिन"], answer: "90 दिन", explanation: "आरबीआई नियमों के अनुसार 90 दिनों से अधिक की लगातार चूक होने पर संपत्ति एनपीए श्रेणी में आ जाती है।" }
  ]
};

// Merge curated high-yield question repositories into banks to eliminate repetition
Object.entries(CURATED_BANK_HI).forEach(([cat, list]) => {
  if (!QUESTION_BANK_HI[cat]) {
    QUESTION_BANK_HI[cat] = [...list];
  } else {
    const existingKeys = new Set(QUESTION_BANK_HI[cat].map(q => normalizeQuestionKey(q.text)));
    for (const q of list) {
      const k = normalizeQuestionKey(q.text);
      if (!existingKeys.has(k)) {
        existingKeys.add(k);
        QUESTION_BANK_HI[cat].push(q);
      }
    }
  }
});

Object.entries(CURATED_BANK_EN).forEach(([cat, list]) => {
  if (!QUESTION_BANK_EN[cat]) {
    QUESTION_BANK_EN[cat] = [...list];
  } else {
    const existingKeys = new Set(QUESTION_BANK_EN[cat].map(q => normalizeQuestionKey(q.text)));
    for (const q of list) {
      const k = normalizeQuestionKey(q.text);
      if (!existingKeys.has(k)) {
        existingKeys.add(k);
        QUESTION_BANK_EN[cat].push(q);
      }
    }
  }
});

// -------------------------------------------------------------
// MULTI-API-KEY POOL & ROTATION SYSTEM
// -------------------------------------------------------------
let currentKeyRotationIndex = 0;

/**
 * Parses single or multiple Gemini API keys from custom input or .env
 * Supports comma (,), semicolon (;), whitespace, or newline separation.
 */
export function parseGeminiApiKeys(keyInput?: string): string[] {
  const rawSources: string[] = [];

  if (keyInput && typeof keyInput === 'string' && keyInput.trim().length > 0) {
    rawSources.push(keyInput);
  }

  // Check .env variables
  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const envKeys = (import.meta.env.VITE_GEMINI_API_KEYS || '').trim();
  
  if (envKey) rawSources.push(envKey);
  if (envKeys) rawSources.push(envKeys);

  const keyList: string[] = [];

  for (const src of rawSources) {
    // Split by comma, semicolon, or newlines/spaces
    const segments = src.split(/[\s,;\n\r]+/);
    for (const segment of segments) {
      const clean = segment.trim().replace(/^['"]|['"]$/g, '');
      if (clean.length > 10 && !keyList.includes(clean)) {
        keyList.push(clean);
      }
    }
  }

  return keyList;
}

/**
 * Returns summary of currently available keys in the pool
 */
export function getGeminiKeyPoolInfo(customKeyInput?: string): {
  keys: string[];
  count: number;
  source: 'custom' | 'env' | 'none';
} {
  const customKeys = (customKeyInput && customKeyInput.trim().length > 0)
    ? parseGeminiApiKeys(customKeyInput)
    : [];

  if (customKeys.length > 0) {
    return {
      keys: customKeys,
      count: customKeys.length,
      source: 'custom'
    };
  }

  const envKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const envKeys = (import.meta.env.VITE_GEMINI_API_KEYS || '').trim();
  const systemKeys = parseGeminiApiKeys(`${envKey},${envKeys}`);

  if (systemKeys.length > 0) {
    return {
      keys: systemKeys,
      count: systemKeys.length,
      source: 'env'
    };
  }

  return {
    keys: [],
    count: 0,
    source: 'none'
  };
}

// -------------------------------------------------------------
// PRIMARY AI QUIZ GENERATOR FUNCTION (GEMINI MULTI-KEY REST + SMART FALLBACK)
// -------------------------------------------------------------
export async function generateAiQuiz(
  apiKey: string,
  topicOrOptions: string | AiQuizOptions,
  langFallback: 'en' | 'hi' = 'en'
): Promise<QuizQuestion[]> {
  const options: AiQuizOptions = typeof topicOrOptions === 'string'
    ? { topic: topicOrOptions, lang: langFallback }
    : topicOrOptions;

  const cleanTopic = (options.topic || '').trim();
  const categoryId = (options.categoryId || '').toLowerCase();
  const customPrompt = (options.customPrompt || '').trim();
  const difficulty = options.difficulty || 'medium';
  const count = options.count || 10;
  const lang = options.lang || langFallback || 'en';

  // 1. Check if device is currently offline
  const isDeviceOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // 2. Get all available API keys from custom settings or .env pool
  const keysPool = isDeviceOffline ? [] : parseGeminiApiKeys(apiKey);

  // 3. Try calling Google Gemini AI REST API with multi-key pool
  if (!isDeviceOffline && keysPool.length > 0) {
    // Round-robin start index so load is distributed evenly across all keys
    const startIndex = currentKeyRotationIndex % keysPool.length;
    currentKeyRotationIndex = (currentKeyRotationIndex + 1) % keysPool.length;

    // Arrange keys starting from rotated index
    const orderedKeys: string[] = [];
    for (let i = 0; i < keysPool.length; i++) {
      orderedKeys.push(keysPool[(startIndex + i) % keysPool.length]);
    }

    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
      'gemini-1.5-flash',
      'gemini-pro-latest'
    ];

    // Current dynamic time context (Real-time 2026)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentDateFormatted = now.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Iterate through keys in the pool (Auto-Failover / Load Balancing)
    for (let kIdx = 0; kIdx < orderedKeys.length; kIdx++) {
      const activeKey = orderedKeys[kIdx];
      const keyMask = activeKey.substring(0, 6) + '...' + activeKey.slice(-4);

      for (const model of modelsToTry) {
        try {
          const languagePrompt = lang === 'hi'
            ? "CRITICAL LANGUAGE REQUIREMENT: PURE HINDI (हिंदी). Everything including question 'text', all 4 'options', 'answer', and 'explanation' MUST be written in 100% natural, correct Devanagari Hindi. Do NOT use English words."
            : "Language: English.";

          const isDailyOrFactTopic = (cleanTopic && (cleanTopic.toLowerCase().includes('daily') || cleanTopic.toLowerCase().includes('challenge') || cleanTopic.toLowerCase().includes('fact') || cleanTopic.includes('तथ्य') || cleanTopic.includes('चुनौती')));

          const promptInstruction = customPrompt
            ? `User Custom Instructions: "${customPrompt}"`
            : isDailyOrFactTopic
            ? `Generate exactly ${count} extraordinarily interesting, curiosity-sparking multiple-choice questions on: "${cleanTopic}". Focus on mind-blowing real-world facts, "Did You Know?" mysteries, unbelievable science wonders, historic oddities, space anomalies, animal kingdom secrets, and latest global records. Make questions fun, educational, and completely fresh without repetition.`
            : options.levelNumber
            ? `Generate exactly ${count} unique, non-repeating multiple-choice questions specifically for Level ${options.levelNumber} on topic: "${cleanTopic || categoryId}". Distribute questions across relevant subtopics (politics, geography, national/international news, states, policies, discoveries, key facts). NEVER repeat previously generated questions.`
            : `Generate a brand-new, educational quiz of ${count} questions on: "${cleanTopic || categoryId || 'General Knowledge & Current Affairs'}".`;

          const systemPrompt = `You are an expert quiz master with real-time Google search live knowledge. Create an engaging multiple-choice quiz of exactly ${count} questions.
Temporal Context:
- Today's Date: ${currentDateFormatted} (Year ${currentYear}).
- CRITICAL: Ground all Current Affairs, National/International News, Awards, Sports, Summits, Policies, and Discoveries in real-world facts up to ${currentYear}. Do NOT treat 2024 or earlier years as the current year.

Instructions:
- Topic: ${promptInstruction}
- Difficulty: ${difficulty.toUpperCase()}
- ${languagePrompt}
- Each question must have exactly 4 distinct plausible options.
- The 'answer' field MUST match one of the 4 options verbatim.
- Provide a captivating, educational explanation for each question starting with a fun "Did you know?" insight.
- NEVER repeat trivial or duplicate questions. Keep questions exciting, accurate, and surprising!

Return ONLY a valid raw JSON array with NO markdown formatting, no backticks, no codeblocks:
[
  {
    "id": 1,
    "text": "Question text?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Option 1",
    "explanation": "Brief educational fact."
  }
]`;

          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;

          const headers: Record<string, string> = { 
            'Content-Type': 'application/json',
            'x-goog-api-key': activeKey 
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          // Request payload with Google Search Live Grounding enabled
          const requestBodyWithGrounding = {
            contents: [{ parts: [{ text: systemPrompt }] }],
            tools: [{ googleSearch: {} }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            }
          };

          let response = await fetch(url, {
            method: 'POST',
            headers,
            signal: controller.signal,
            body: JSON.stringify(requestBodyWithGrounding)
          });

          // Fallback without tools if a specific preview model doesn't support tools schema
          if (!response.ok && response.status === 400) {
            response = await fetch(url, {
              method: 'POST',
              headers,
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: {
                  temperature: 0.8,
                  maxOutputTokens: 4096,
                }
              })
            });
          }

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              const cleanedJson = candidateText
                .replace(/```json/gi, '')
                .replace(/```/g, '')
                .trim();
              const parsed = JSON.parse(cleanedJson);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const formattedAiQuestions: QuizQuestion[] = parsed.map((q, idx) => ({
                  id: `ai-${Date.now()}-${idx + 1}`,
                  text: q.text,
                  options: shuffleArray(q.options || []),
                  answer: q.answer,
                  explanation: q.explanation || (lang === 'hi' ? "शानदार उत्तर! हर सवाल से आपका ज्ञान और मजबूत होता है।" : "Great job learning this key concept!"),
                  category: cleanTopic || categoryId || "Gemini AI",
                  source: 'ai'
                }));

                // 1. Exclude already mastered questions so they never repeat
                const unmasteredAi = formattedAiQuestions.filter(q => !isQuestionMastered(q.text));

                // 2. Prioritize past incorrect questions for spaced repetition
                const retryQuestions = getRetryQuestions(categoryId || cleanTopic, 2);

                const finalAiList: QuizQuestion[] = [];
                const seenKeys = new Set<string>();

                // Blend retry questions first
                for (const rq of retryQuestions) {
                  const k = normalizeQuestionKey(rq.text);
                  if (!seenKeys.has(k)) {
                    seenKeys.add(k);
                    finalAiList.push(rq);
                  }
                }

                // Add fresh unmastered AI questions
                for (const uq of unmasteredAi) {
                  const k = normalizeQuestionKey(uq.text);
                  if (!seenKeys.has(k)) {
                    seenKeys.add(k);
                    finalAiList.push(uq);
                  }
                  if (finalAiList.length >= count) break;
                }

                // If still under count, backfill with remaining AI items
                if (finalAiList.length < count) {
                  for (const q of formattedAiQuestions) {
                    const k = normalizeQuestionKey(q.text);
                    if (!seenKeys.has(k)) {
                      seenKeys.add(k);
                      finalAiList.push(q);
                    }
                    if (finalAiList.length >= count) break;
                  }
                }

                if (finalAiList.length > 0) {
                  const result = finalAiList.slice(0, count);
                  if (options.levelNumber && (categoryId || cleanTopic)) {
                    saveCategoryAssignedQuestions(categoryId || cleanTopic, options.levelNumber, result);
                  }
                  return result;
                }
              }
            }
          } else {
            const status = response.status;
            console.warn(`[Gemini Pool] Key [${keyMask}] received HTTP ${status} for model ${model}.`);
            // If Rate-limited (429), unauthorized (401/403), or quota reached, jump immediately to the NEXT key in pool!
            if (status === 429 || status === 403 || status === 401 || status === 400) {
              console.warn(`[Gemini Pool] Key [${keyMask}] quota/rate exceeded. Switching to next key in pool...`);
              break; // Breaks model loop for this key, moves to next key in pool
            }
          }
        } catch (err) {
          console.warn(`[Gemini Pool] Key [${keyMask}] attempt with model ${model} failed, testing next option...`, err);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // SMART DYNAMIC OFFLINE GENERATOR (Deduplication + Spaced Repetition)
  // -------------------------------------------------------------
  await new Promise(resolve => setTimeout(resolve, 400));

  const repo = lang === 'hi' ? QUESTION_BANK_HI : QUESTION_BANK_EN;
  let pool: QuizQuestion[] = [];

  if (categoryId && repo[categoryId]) {
    pool = [...repo[categoryId]];
    // If pool has fewer than 35 items, blend in mix questions to ensure no level repeats
    if (pool.length < 35 && repo.mix) {
      const existingKeys = new Set(pool.map(q => normalizeQuestionKey(q.text)));
      for (const mq of repo.mix) {
        const k = normalizeQuestionKey(mq.text);
        if (!existingKeys.has(k)) {
          existingKeys.add(k);
          pool.push(mq);
        }
      }
    }
  } else if (cleanTopic) {
    const topicLower = cleanTopic.toLowerCase();
    if (topicLower.includes('current') || topicLower.includes('समसामयिकी') || topicLower.includes('affair')) {
      pool = [...(repo.ca_india || []), ...(repo.ca_world || []), ...(repo.current || [])];
    } else if (topicLower.includes('india') || topicLower.includes('भारत')) {
      pool = [...(repo.india || []), ...(repo.ca_india || [])];
    } else if (topicLower.includes('world') || topicLower.includes('geography') || topicLower.includes('विश्व')) {
      pool = [...(repo.world || []), ...(repo.ca_world || [])];
    } else if (topicLower.includes('science') || topicLower.includes('विज्ञान')) {
      pool = [...(repo.subjects || [])];
    } else if (topicLower.includes('space') || topicLower.includes('अंतरिक्ष')) {
      pool = [...(repo.current || [])];
    } else {
      // Combine all pools for rich variety
      pool = Object.values(repo).flat();
    }
  } else {
    pool = Object.values(repo).flat();
  }

  if (pool.length === 0) {
    pool = Object.values(QUESTION_BANK_HI).flat();
  }

  const activeCategory = categoryId || cleanTopic || 'mix';

  // 1. Cross-Level Deduplication: If levelNumber is given, ensure questions never repeat across levels!
  if (options.levelNumber) {
    const deduplicated = deduplicateForLevel(pool, activeCategory, options.levelNumber, count);
    if (deduplicated.length > 0) {
      saveCategoryAssignedQuestions(activeCategory, options.levelNumber, deduplicated);
      return deduplicated.map((q, idx) => ({
        ...q,
        id: `dyn-${Date.now()}-${idx}`,
        options: shuffleArray(q.options),
        category: cleanTopic || categoryId || (lang === 'hi' ? "क्विज" : "Quiz"),
        source: 'offline'
      }));
    }
  }

  // 2. Get past incorrect questions for spaced repetition (up to 3)
  const retryQuestions = getRetryQuestions(categoryId || cleanTopic, 3);

  // 3. Filter out already mastered questions from pool
  const unmasteredPool = filterUnmasteredQuestions(pool);
  const shuffledUnmastered = shuffleArray(unmasteredPool);

  const selectedList: QuizQuestion[] = [];
  const seenKeys = new Set<string>();

  // Add retry questions first
  for (const rq of retryQuestions) {
    const k = normalizeQuestionKey(rq.text);
    if (!seenKeys.has(k)) {
      seenKeys.add(k);
      selectedList.push(rq);
    }
  }

  // Add unmastered questions
  for (const uq of shuffledUnmastered) {
    const k = normalizeQuestionKey(uq.text);
    if (!seenKeys.has(k)) {
      seenKeys.add(k);
      selectedList.push(uq);
    }
    if (selectedList.length >= count) break;
  }

  // If unmastered pool ran out, fallback to shuffled full pool so user never faces empty quiz
  if (selectedList.length < count) {
    const shuffledFull = shuffleArray(pool);
    for (const q of shuffledFull) {
      const k = normalizeQuestionKey(q.text);
      if (!seenKeys.has(k)) {
        seenKeys.add(k);
        selectedList.push(q);
      }
      if (selectedList.length >= count) break;
    }
  }

  const finalSelected = selectedList.slice(0, Math.min(count, selectedList.length));

  return finalSelected.map((q, idx) => ({
    ...q,
    id: `dyn-${Date.now()}-${idx}`,
    options: shuffleArray(q.options),
    category: cleanTopic || categoryId || (lang === 'hi' ? "क्विज" : "Quiz"),
    source: 'offline'
  }));
}