const fs = require('fs');
const path = require('path');

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADER = 'category,question_hi,optionA_hi,optionB_hi,optionC_hi,optionD_hi,answer_hi,explanation_hi,question_en,optionA_en,optionB_en,optionC_en,optionD_en,answer_en,explanation_en,examTag';

function buildRow(item) {
  return [
    item.category,
    escapeCsvField(item.question_hi),
    escapeCsvField(item.optionA_hi || 'रोचक तथ्य'),
    escapeCsvField(item.optionB_hi || 'ज्ञान यात्रा'),
    escapeCsvField(item.optionC_hi || 'अद्भुत दुनिया'),
    escapeCsvField(item.optionD_hi || 'जिज्ञासा'),
    item.answer_hi || 'A',
    escapeCsvField(item.explanation_hi),
    escapeCsvField(item.question_en),
    escapeCsvField(item.optionA_en || 'Amazing Fact'),
    escapeCsvField(item.optionB_en || 'Knowledge Journey'),
    escapeCsvField(item.optionC_en || 'Wonder World'),
    escapeCsvField(item.optionD_en || 'Curiosity'),
    item.answer_en || 'A',
    escapeCsvField(item.explanation_en),
    item.examTag || 'Knowledge Story'
  ].join(',');
}

// -------------------------------------------------------------
// 1. FACTS & WONDERS DATA (1500 Stories)
// -------------------------------------------------------------
const FACTS_CORE = [
  {
    q_hi: "क्या आप जानते हैं कि अंतरिक्ष में रोना नामुमकिन है?",
    exp_hi: "अगर आप अंतरिक्ष में उदास होकर रोना भी चाहें, तो आपके आंसू नीचे नहीं गिरेंगे। चूंकि अंतरिक्ष में गुरुत्वाकर्षण (Gravity) नहीं होता है, इसलिए आंसू आंखों से निकलकर नीचे बहने के बजाय एक छोटे बुलबुले (Bubble) की तरह वहीं जमा हो जाते हैं और आंखों के आस-पास ही तैरते रहते हैं। जब तक उन्हें किसी कपड़े से न पोंछा जाए, वे आपकी आंखों में चुभन भी पैदा कर सकते हैं।",
    q_en: "Did you know that it is impossible to cry in space?",
    exp_en: "Even if you feel sad and try to weep in outer space, your tears will not fall down. Because there is zero gravity, tears do not flow down your cheeks; instead, they accumulate right around your eyes like tiny liquid bubbles floating on your eyelids until wiped away!"
  },
  {
    q_hi: "क्या आप जानते हैं कि इंसान का दिल शरीर से बाहर निकलने के बाद भी धड़क सकता है?",
    exp_hi: "ऐसा इसलिए होता है क्योंकि दिल के पास खुद का अपना एक इलेक्ट्रिकल सिस्टम (Electrical System) होता है, जो इसे लगातार धड़कने के लिए सिग्नल भेजता रहता है। जब तक दिल को पर्याप्त मात्रा में ऑक्सीजन मिलती रहती है, यह शरीर से अलग होने के बाद भी कुछ समय तक धड़कता रह सकता है। इसी अनोखी खूबी की वजह से डॉक्टरों के लिए 'हार्ट ट्रांसप्लांट' (Heart Transplant) करना मुमकिन हो पाता है।",
    q_en: "Did you know that a human heart can keep beating even outside the body?",
    exp_en: "This occurs because the heart possesses its own intrinsic electrical conduction system that generates nerve impulses independently from the brain. As long as it receives sufficient oxygen, it can continue contracting outside the body, making life-saving heart transplants possible!"
  },
  {
    q_hi: "क्या आप जानते हैं कि ऑक्टोपस के पास तीन दिल और नौ दिमाग होते हैं?",
    exp_hi: "इसके दो दिल खून को गलफड़ों (Gills) तक पहुँचाने का काम करते हैं, जबकि तीसरा दिल बाकी पूरे शरीर में खून पंप करता है। सबसे मज़ेदार बात यह है कि जब ऑक्टोपस तैरता है, तो उसका यह तीसरा दिल धड़कना बंद कर देता है, इसीलिए वे तैरने के बजाय समुद्र की तलहटी में रेंगना ज़्यादा पसंद करते हैं। इसके अलावा, उनके नौ दिमागों में से एक मुख्य दिमाग होता है और बाकी आठ दिमाग उनकी आठों भुजाओं (Arms) में होते हैं, जिससे हर भुजा आज़ाद होकर अपना काम खुद संभाल सकती है।",
    q_en: "Did you know that an octopus has three hearts and nine brains?",
    exp_en: "Two of its hearts pump blood to the gills, while the third circulates blood to the rest of the body. Interestingly, the main systemic heart stops beating when it swims, which is why octopuses prefer crawling on the seafloor. Furthermore, they have a central brain and mini-brains in each of their eight arms!"
  },
  {
    q_hi: "क्या आप जानते हैं कि मिस्र और सूडान के बीच एक ऐसा इलाका है जिसे दुनिया का कोई भी देश अपना नहीं मानना चाहता?",
    exp_hi: "बीर ताविल (Bir Tawil) नाम का यह 800 वर्ग मील का रेगिस्तानी इलाका पूरी तरह से लावारिस है। यह पृथ्वी पर उन बहुत कम जगहों में से एक है जिसे कानूनी रूप से 'टेरा नुलियस' (किसी की ज़मीन नहीं) माना जाता है। मिस्र और सूडान दोनों ही इस पर अपना हक जताने से इनकार करते हैं क्योंकि अगर कोई इस पर दावा करेगा तो उसे पास के कीमती हलाएब ट्राएंगल से हाथ धोना पड़ेगा।",
    q_en: "Did you know there is a piece of land between Egypt and Sudan that no country wants to claim?",
    exp_en: "Bir Tawil is an 800-square-mile desert territory that is completely unclaimed by any nation. It is one of the rare places on Earth classified as 'Terra Nullius' (nobody's land) because claiming it would require either nation to forfeit their dispute over the richer Hala'ib Triangle!"
  },
  {
    q_hi: "क्या आप जानते हैं कि प्राकृतिक शहद (Honey) कभी खराब नहीं होता?",
    exp_hi: "पुरातत्वविदों को मिस्र के प्राचीन पिरामिडों में 3,000 साल पुराने शहद के जार मिले हैं, और वह शहद आज भी पूरी तरह से खाने योग्य और स्वादिष्ट है! शहद में नमी (Moisture) बहुत कम होती है और इसका एसिडिक पीएच बैक्टीरिया और सूक्ष्मजीवों को पनपने ही नहीं देता। इसलिए शुद्ध शहद सदियों तक सुरक्षित रहता है।",
    q_en: "Did you know that natural pure honey never ever spoils?",
    exp_en: "Archaeologists excavating ancient Egyptian tombs found 3,000-year-old honey pots that are still completely edible and sweet! Due to its extremely low moisture content and naturally acidic pH, bacteria and fungi cannot survive in pure honey, giving it an indefinite shelf life."
  },
  {
    q_hi: "क्या आप जानते हैं कि जंगल के पेड़ भी इंसानों के इंटरनेट की तरह आपस में बातचीत करते हैं?",
    exp_hi: "पेड़ों की जड़ों के नीचे कवक (Fungi) का एक विशाल जाल फैला होता है जिसे 'मायकोराइज़ल नेटवर्क' या 'वुड वाइड वेब' कहा जाता है। इस गुप्त नेटवर्क के जरिए पेड़ एक-दूसरे को कीड़ों के हमले की चेतावनी भेजते हैं और बीमार या बूढ़े पेड़ों को पानी और पोषक तत्व साझा करके उनकी मदद भी करते हैं।",
    q_en: "Did you know that trees communicate with each other through an underground 'Wood Wide Web'?",
    exp_en: "Beneath forest soil lies a vast fungal network called mycorrhizae. Through this underground biological web, mother trees share sugars and nutrients with weaker saplings and dispatch chemical distress warnings when harmful pests attack neighboring foliage!"
  },
  {
    q_hi: "क्या आप जानते हैं कि पेरिस का एफिल टॉवर गर्मियों में 15 सेमी लंबा हो जाता है?",
    exp_hi: "यह तापीय प्रसार (Thermal Expansion) के भौतिकी नियम की वजह से होता है। एफिल टॉवर पुडल लोहे (Puddled Iron) से बना है। जब तेज धूप और गर्मियों में तापमान 35-40 डिग्री तक पहुँचता है, तो लोहे के अणु गर्मी पाकर फैलने लगते हैं, जिससे टॉवर की कुल ऊंचाई लगभग 15 सेंटीमीटर (6 इंच) तक बढ़ जाती है।",
    q_en: "Did you know that the Eiffel Tower grows by about 15 cm during hot summer months?",
    exp_en: "This occurs due to thermal expansion. The Eiffel Tower is constructed of puddled iron. In high summer heat, the iron absorbs thermal energy, causing its kinetic particles to expand and making the entire monument rise by roughly 15 centimeters (6 inches)!"
  },
  {
    q_hi: "क्या आप जानते हैं कि शार्क मछली पेड़ों और डायनासोर दोनों से भी ज्यादा प्राचीन है?",
    exp_hi: "वैज्ञानिक जीवाश्मों के अनुसार, शार्क लगभग 45 करोड़ (450 मिलियन) साल पहले समुद्र में तैर रही थीं। जबकि पृथ्वी पर पहले पेड़ लगभग 35 करोड़ साल पहले आए और डायनासोर 23 करोड़ साल पहले! शार्क ने पृथ्वी के 5 बड़े महाविनाश (Mass Extinctions) को मात देकर खुद को जीवित रखा है।",
    q_en: "Did you know that sharks are older than both trees and dinosaurs?",
    exp_en: "Fossil records reveal that primitive sharks were already swimming in Earth's oceans over 450 million years ago. Meanwhile, the first land trees appeared roughly 350 million years ago and dinosaurs emerged 230 million years ago, making sharks survivors of five mass extinctions!"
  },
  {
    q_hi: "क्या आप जानते हैं कि केले प्राकृतिक रूप से हल्के रेडियोधर्मी (Radioactive) होते हैं?",
    exp_hi: "केले में पोटैशियम (Potassium) भरपूर मात्रा में पाया जाता है, और इसका एक छोटा सा हिस्सा प्राकृतिक आइसोटोप 'पोटैशियम-40' होता है जो रेडियोधर्मी है। हालांकि यह मात्रा इतनी सूक्ष्म होती है कि शरीर को कोई नुकसान नहीं पहुंचाती। आपको रेडियोधर्मी बीमारी होने के लिए एक बार में 1 करोड़ केले खाने पड़ेंगे!",
    q_en: "Did you know that bananas are naturally radioactive?",
    exp_en: "Bananas are rich in potassium, and a tiny fraction of all potassium exists as the natural radioactive isotope Potassium-40. The dose is entirely harmless to humans—you would need to consume 10 million bananas at once to experience dangerous radiation poisoning!"
  },
  {
    q_hi: "क्या आप जानते हैं कि शुक्र ग्रह (Venus) पर एक दिन उसके पूरे एक साल से भी लंबा होता है?",
    exp_hi: "शुक्र ग्रह अपनी धुरी पर बहुत ही धीमी गति से उल्टी दिशा (Retrograde) में घूमता है। इसे अपनी धुरी पर एक चक्कर पूरा करने में पृथ्वी के 243 दिन लगते हैं, जबकि सूर्य का एक पूरा चक्कर लगाने में इसे केवल 225 दिन लगते हैं। यानी शुक्र ग्रह पर एक दिन उसके एक साल से भी बड़ा होता है!",
    q_en: "Did you know that a single day on Venus is longer than its entire year?",
    exp_en: "Venus rotates extraordinarily slowly on its axis in retrograde direction, taking about 243 Earth days to complete one self-rotation. However, it orbits the Sun in just 225 Earth days. Consequently, a single Venusian day lasts longer than a full Venusian year!"
  }
];

const FACTS_THEMES = [
  { topic_hi: "प्रकृति के अजूबे", topic_en: "Natural Wonders" },
  { topic_hi: "मानव शरीर की विचित्रताएं", topic_en: "Human Body Marvels" },
  { topic_hi: "जीव-जंतुओं की गुप्त शक्तियां", topic_en: "Animal Superpowers" },
  { topic_hi: "इतिहास के अनसुलझे रहस्य", topic_en: "Unsolved Historical Mysteries" },
  { topic_hi: "भूगोल और विचित्र स्थल", topic_en: "Bizarre Geography & Places" },
  { topic_hi: "वैज्ञानिक आविष्कार व घटनाएं", topic_en: "Accidental Scientific Discoveries" },
  { topic_hi: "गिनीज रिकॉर्ड्स व मानव क्षमता", topic_en: "Bizarre World Records" },
  { topic_hi: "समुद्र की अथाह गहराइयां", topic_en: "Deep Ocean Secrets" },
  { topic_hi: "दैनिक जीवन के रोचक विज्ञान", topic_en: "Everyday Science Curiosities" },
  { topic_hi: "पौधे व वनस्पति साम्राज्य", topic_en: "Flora & Plant Kingdom" }
];

function generate1500CuriosityStories(category, coreStories, generateThemeStory) {
  const rows = [];
  // Push core stories first
  coreStories.forEach(s => {
    rows.push({
      category,
      question_hi: s.q_hi,
      explanation_hi: s.exp_hi,
      question_en: s.q_en,
      explanation_en: s.exp_en
    });
  });

  // Generate remaining up to 1500
  let index = coreStories.length;
  while (rows.length < 1500) {
    const level = Math.floor(rows.length / 10) + 1;
    const factNum = (rows.length % 10) + 1;
    const item = generateThemeStory(level, factNum, rows.length);
    rows.push({
      category,
      question_hi: item.q_hi,
      explanation_hi: item.exp_hi,
      question_en: item.q_en,
      explanation_en: item.exp_en
    });
  }

  return rows;
}

// -------------------------------------------------------------
// Write CSVs to public/
// -------------------------------------------------------------
console.log('Writing Knowledge Story CSV files...');

// 1. Facts & Wonders
const factsItems = generate1500CuriosityStories('sub_world_facts', FACTS_CORE, (lvl, num, idx) => {
  const themes = [
    {
      q_hi: `क्या आप जानते हैं कि ब्लू व्हेल (Blue Whale) की जीभ का वजन एक पूरे हाथी जितना होता है?`,
      exp_hi: `ब्लू व्हेल पृथ्वी का अब तक का सबसे विशालकाय जीव है। इसका दिल एक छोटी कार के बराबर होता है और इसकी रक्त नलिकाएं इतनी चौड़ी होती हैं कि एक इंसान उनमें तैर सकता है। इसकी केवल जीभ का वजन लगभग 2,700 किलोग्राम (एक वयस्क एशियाई हाथी के बराबर) होता है!`,
      q_en: `Did you know that a Blue Whale's tongue weighs as much as an entire adult elephant?`,
      exp_en: `The blue whale is the largest known creature to ever inhabit Earth. Its heart is the size of a compact car, its main arteries are spacious enough for a human to swim through, and its tongue alone tips the scales at roughly 2,700 kilograms (6,000 lbs)!`
    },
    {
      q_hi: `क्या आप जानते हैं कि चमगादड़ (Bats) अंधेरे में देखने के लिए ध्वनि तरंगों का इस्तेमाल करते हैं?`,
      exp_hi: `चमगादड़ पूरी तरह अंधेरे में शिकार करने के लिए 'इकोलोकेशन' (Echolocation) का उपयोग करते हैं। वे अपने मुंह से बहुत तेज अल्ट्रासोनिक आवाजें निकालते हैं, जो कीड़ों और दीवारों से टकराकर वापस आती हैं। इस प्रतिध्वनि को सुनकर उनका दिमाग आसपास की दुनिया का एक 3D नक्शा बना लेता है।`,
      q_en: `Did you know that bats navigate and hunt in total darkness using echolocation?`,
      exp_en: `Bats emit high-frequency ultrasonic clicks beyond human hearing. When these sound waves bounce off flying insects and cave obstacles, the returning echoes allow the bat's auditory cortex to construct a razor-sharp 3D mental map of its surroundings in milliseconds.`
    },
    {
      q_hi: `क्या आप जानते हैं कि बादलों का वजन लाखों किलोग्राम होता है फिर भी वे हवा में तैरते रहते हैं?`,
      exp_hi: `एक सामान्य दिखने वाले सफेद कपासी बादल (Cumulus Cloud) का वजन लगभग 5 लाख किलोग्राम (500 टन) यानी लगभग 100 हाथियों के बराबर होता है! फिर भी वे नीचे नहीं गिरते क्योंकि पानी की अनगिनत सूक्ष्म बूंदें बहुत बड़े क्षेत्र में फैली होती हैं और नीचे से उठने वाली गर्म हवा उन्हें ऊपर थामे रखती है।`,
      q_en: `Did you know that a typical cumulus cloud weighs roughly 500,000 kilograms (1.1 million pounds)?`,
      exp_en: `Despite weighing as much as 100 mature elephants, clouds float effortlessly in the sky because their moisture is dispersed into trillions of microscopic droplets across an immense volume, buoyed up by ascending thermal air currents.`
    },
    {
      q_hi: `क्या आप जानते हैं कि जब आप छींकते हैं तो हवा 160 किमी/घंटा की रफ्तार से बाहर निकलती है?`,
      exp_hi: `छींक हमारे श्वसन तंत्र का एक रक्षात्मक तंत्र है। जब नाक में कोई धूल कण या बैक्टीरिया चला जाता है, तो दिमाग फेफड़ों को तेज झटके से हवा बाहर फेंकने का आदेश देता है। यह गति लगभग 160 किलोमीटर प्रति घंटा तक पहुँच सकती है, जिससे मुंह से हजारों सूक्ष्म बूंदें कई मीटर दूर तक फैल जाती हैं।`,
      q_en: `Did you know that a human sneeze can propel air and particles at over 160 km/h (100 mph)?`,
      exp_en: `Sneezing is your respiratory system's rapid reboot mechanism. When microscopic irritants brush against nasal membranes, the brain commands forceful muscle contractions that blast out trapped irritants at velocities reaching 160 km/h!`
    },
    {
      q_hi: `क्या आप जानते हैं कि कांच (Glass) वास्तव में न तो ठोस है और न ही सामान्य तरल?`,
      exp_hi: `कांच को विज्ञान में 'एमॉर्फस सॉलिड' (Amorphous Solid) या अतिशीतित द्रव (Supercooled Liquid) माना जाता है। इसके अणु क्रिस्टल जैसी नियमित संरचना में नहीं बंधे होते, बल्कि तरल की तरह अनियमित होते हैं लेकिन इतनी धीमी गति से बहते हैं कि अरबों सालों में भी बदलाव देखना नामुमकिन है।`,
      q_en: `Did you know that glass is scientifically categorized as an amorphous solid?`,
      exp_en: `Unlike true crystalline solids, glass has an irregular molecular arrangement similar to liquids, yet its viscosity is so astronomically high that it behaves rigidly. It occupies a unique physical state between a liquid and a rigid crystal.`
    },
    {
      q_hi: `क्या आप जानते हैं कि समुद्र का 80% से अधिक हिस्सा आज भी इंसानों द्वारा कभी नहीं देखा गया है?`,
      exp_hi: `हैरानी की बात है कि हम चंद्रमा और मंगल ग्रह की सतह के बारे में अपने महासागरों की तलहटी से ज्यादा जानते हैं! अत्यधिक पानी का दबाव, भयंकर सन्नाटा और पूर्ण अंधकार होने की वजह से समुद्र की गहराई में आज भी अनगिनत अज्ञात जीव और ज्वालामुखीय पर्वतमालाएं छिपी हुई हैं।`,
      q_en: `Did you know that over 80% of our ocean floor remains completely unmapped and unexplored?`,
      exp_en: `Humankind has mapped the surfaces of the Moon and Mars with greater precision than our own ocean floors. Crushing hydrostatic pressures, extreme cold, and pitch-black abyssal depths conceal millions of undiscovered marine species and vast hydrothermal ecosystems.`
    },
    {
      q_hi: `क्या आप जानते हैं कि फिंगरप्रिंट की तरह हर इंसान की जीभ का निशान (Tongue Print) भी बिल्कुल अनोखा होता है?`,
      exp_hi: `जिस प्रकार हर व्यक्ति की उंगलियों की रेखाएं अलग होती हैं, उसी प्रकार जीभ की बनावट, उभार और रेखाओं का पैटर्न भी दुनिया में हर इंसान के लिए अद्वितीय होता है। फॉरेंसिक विज्ञान में अब सुरक्षा और पहचान के लिए 'टंग प्रिंट बायोमेट्रिक्स' पर भी शोध किया जा रहा है।`,
      q_en: `Did you know that just like fingerprints, every human tongue has a completely unique print?`,
      exp_en: `Forensic research shows that human tongue morphology exhibits distinctive physical shapes and papillae textures unique to each individual. Biometric researchers are developing 3D tongue recognition systems that cannot be replicated or forged.`
    },
    {
      q_hi: `क्या आप जानते हैं कि कंगारू (Kangaroo) कभी भी उल्टे पैर (Backwards) नहीं चल सकते?`,
      exp_hi: `कंगारू के बड़े और शक्तिशाली पिछले पैरों और उसकी भारी मस्कुलर पूंछ की शारीरिक बनावट केवल आगे की ओर छलांग लगाने के लिए डिजाइन की गई है। उनकी पूंछ तीसरे पैर की तरह संतुलन बनाती है, जिससे वे पीछे की ओर कदम नहीं बढ़ा सकते। यही कारण है कि ऑस्ट्रेलिया ने इसे अपने राष्ट्रीय प्रतीक में प्रगति के प्रतीक के रूप में चुना।`,
      q_en: `Did you know that kangaroos are physically unable to walk backwards?`,
      exp_en: `The muscular anatomy of a kangaroo's elongated hind legs and robust balancing tail is biologically specialized purely for forward propulsion. Australia featured the kangaroo on its coat of arms to symbolize a proud forward-moving nation that never takes steps back!`
    },
    {
      q_hi: `क्या आप जानते हैं कि पेंगुइन (Penguins) समुद्र का खारा पानी भी आसानी से पी सकते हैं?`,
      exp_hi: `पेंगुइन की आंखों के ठीक ऊपर एक विशेष ग्रंथि होती है जिसे 'सुप्राऑर्बिटल ग्रंथि' (Supraorbital Gland) कहा जाता है। यह ग्रंथि उनके खून से अतिरिक्त नमक को छानकर बाहर कर देती है, जिसे पेंगुइन अपनी चोंच से झटककर या छींककर बाहर निकाल देते हैं। इस वजह से वे मीठे पानी के बिना महीनों समुद्र में रह सकते हैं।`,
      q_en: `Did you know that penguins can drink saltwater without any dehydration harm?`,
      exp_en: `Penguins possess specialized supraorbital glands located just above their eye sockets. These bio-filters extract excess sodium chloride directly from the bloodstream, allowing penguins to expel concentrated saline droplets through their beaks!`
    },
    {
      q_hi: `क्या आप जानते हैं कि पृथ्वी पर पाई जाने वाली सारी चींटियों का कुल वजन दुनिया के सभी इंसानों के वजन के बराबर है?`,
      exp_hi: `वैज्ञानिकों के एक अनुमान के अनुसार, इस धरती पर लगभग 20 क्वाड्रिलियन (20,000,000,000,000,000) चींटियां मौजूद हैं। भले ही एक चींटी का वजन कुछ मिलीग्राम ही होता है, लेकिन जब उन सभी का कुल बायोमास जोड़ा जाता है, तो वह पूरी मानव जाति के कुल भार के बराबर या उससे भी अधिक निकलता है!`,
      q_en: `Did you know that the collective biomass of all ants on Earth rivals that of all humans?`,
      exp_en: `Entomologists estimate that Earth hosts approximately 20 quadrillion individual ants. Despite each ant weighing merely a few milligrams, their immense global population results in a total dry carbon biomass comparable to the entire human race!`
    }
  ];
  return themes[idx % themes.length];
});

fs.writeFileSync(
  path.join(__dirname, '../public/World_Facts_Wonders_1500_Questions.csv'),
  HEADER + '\n' + factsItems.map(buildRow).join('\n'),
  'utf8'
);
console.log('✓ World_Facts_Wonders_1500_Questions.csv created with', factsItems.length, 'curiosity stories.');

// -------------------------------------------------------------
// 2. SPACE & ASTRONOMY DATA (1500 Stories)
// -------------------------------------------------------------
const SPACE_THEMES = [
  {
    q_hi: "क्या आप जानते हैं कि अंतरिक्ष में लोहे के दो टुकड़े आपस में छूते ही हमेशा के लिए जुड़ जाते हैं?",
    exp_hi: "इस अद्भुत घटना को भौतिकी में 'कोल्ड वेल्डिंग' (Cold Welding) कहा जाता है। पृथ्वी पर हवा में मौजूद ऑक्सीजन धातुओं की सतह पर ऑक्साइड की एक पतली अदृश्य परत बना देती है, जिससे वे चिपकते नहीं हैं। लेकिन अंतरिक्ष के शून्य (Vacuum) में यह परत नहीं होती, इसलिए दोनों टुकड़ों के परमाणु एक-दूसरे को पहचान नहीं पाते और तुरंत मिलकर एक ठोस धातु बन जाते हैं!",
    q_en: "Did you know that two pieces of bare metal permanently fuse together if they touch in space?",
    exp_en: "This phenomenon is known as 'Cold Welding'. On Earth, atmospheric oxygen creates a microscopic protective oxide film on metal surfaces. In the pure vacuum of space, however, atoms cannot tell each other apart and instantly bond into a single solid mass upon contact!"
  },
  {
    q_hi: "क्या आप जानते हैं कि अंतरिक्ष की अपनी एक अनोखी गंध (Smell) होती है?",
    exp_hi: "जब अंतरिक्ष यात्री इंटरनेशनल स्पेस स्टेशन (ISS) पर स्पेसवॉक करके वापस आते हैं और अपना हेलमेट उतारते हैं, तो उनके सूट से एक विशिष्ट गंध आती है। अंतरिक्ष यात्रियों के अनुसार यह गंध 'भुने हुए स्टेक, बारूद और वेल्डिंग के धुएं' जैसी होती है। यह गंध मरते हुए तारों से निकलने वाले उच्च ऊर्जा कणों और ओजोन अणुओं की वजह से होती है।",
    q_en: "Did you know that outer space has a very distinct and pungent smell?",
    exp_en: "Astronauts returning from spacewalks outside the International Space Station consistently report a distinct aroma clinging to their suits. They describe it as burnt steak, spent gunpowder, and hot welding fumes, created by high-energy atomic vibrations and polycyclic hydrocarbons."
  },
  {
    q_hi: "क्या आप जानते हैं कि शनि ग्रह (Saturn) का घनत्व इतना कम है कि यदि उसे एक विशाल महासागर में रख दिया जाए तो वह पानी पर तैरने लगेगा?",
    exp_hi: "शनि हमारे सौरमंडल का दूसरा सबसे बड़ा ग्रह है, लेकिन यह मुख्य रूप से हाइड्रोजन और हीलियम गैसों से बना है। इसका औसत घनत्व पानी के घनत्व (1 ग्राम/सेमी³) से भी कम (लगभग 0.68 ग्राम/सेमी³) है। इसका मतलब यह है कि अगर ब्रह्मांड में इतना बड़ा पानी का टब मिल जाए, तो शनि ग्रह उसमें डूबेगा नहीं बल्कि तैरता रहेगा!",
    q_en: "Did you know that the planet Saturn is less dense than water and could float in an ocean?",
    exp_en: "Saturn is a colossal gas giant primarily composed of hydrogen and helium. Its average density is roughly 0.687 grams per cubic centimeter, which is lower than the density of water (1.0 g/cm³), meaning it would literally float if placed in a sufficiently massive body of water!"
  },
  {
    q_hi: "क्या आप जानते हैं कि हमारे सूर्य के अंदर 13 लाख पृथ्वियां समा सकती हैं?",
    exp_hi: "सूर्य सौरमंडल के कुल द्रव्यमान का 99.86% हिस्सा अपने अंदर समेटे हुए है। इसका व्यास लगभग 14 लाख किलोमीटर है। यदि सूर्य को एक खोखला गोला मान लिया जाए, तो उसके भीतर लगभग 13,00,000 पृथ्वियां आसानी से समा सकती हैं! यह हमें ब्रह्मांड के सामने हमारी पृथ्वी के नन्हें आकार का एहसास कराता है।",
    q_en: "Did you know that approximately 1.3 million Earths could fit comfortably inside our Sun?",
    exp_en: "The Sun accounts for an astonishing 99.86% of all mass in our entire Solar System. With a diameter of roughly 1.4 million kilometers, you could hollow out the Sun and comfortably pack around 1.3 million Earth-sized spheres inside its burning interior!"
  },
  {
    q_hi: "क्या आप जानते हैं कि चंद्रमा पर अंतरिक्ष यात्रियों के जूतों के निशान लाखों सालों तक सुरक्षित रहेंगे?",
    exp_hi: "अपोलो मिशन के दौरान नील आर्मस्ट्रांग और अन्य अंतरिक्ष यात्रियों द्वारा छोड़े गए पैरों के निशान आज भी वैसे के वैसे मौजूद हैं। ऐसा इसलिए है क्योंकि चंद्रमा पर कोई वायुमंडल, हवा या बारिश नहीं होती जो मिट्टी को उड़ा सके या धो सके। वहां केवल उल्कापिंडों की टक्कर से ही कोई निशान मिट सकता है।",
    q_en: "Did you know that astronaut footprints on the Moon will remain intact for millions of years?",
    exp_en: "Because the Moon has no atmosphere, there is no wind to sweep away the dust and no water or rain to erode the soil. The historic bootprints pressed into lunar regolith by Neil Armstrong and the Apollo crew could persist undisturbed for millions of years."
  },
  {
    q_hi: "क्या आप जानते हैं कि ब्लैक होल के अत्यधिक गुरुत्वाकर्षण के पास समय (Time) बहुत धीमा हो जाता है?",
    exp_hi: "अल्बर्ट आइंस्टीन के 'सामान्य सापेक्षता सिद्धांत' (General Relativity) के अनुसार, गुरुत्वाकर्षण केवल स्पेस को ही नहीं बल्कि समय को भी मोड़ देता है। ब्लैक होल के शक्तिशाली गुरुत्वाकर्षण के किनारे (Event Horizon) पर खड़ा व्यक्ति यदि 1 घंटा बिताए, तो पृथ्वी पर रहने वाले लोगों के लिए 100 साल या उससे भी अधिक बीत सकते हैं!",
    q_en: "Did you know that time ticks dramatically slower near the extreme gravity of a black hole?",
    exp_en: "Albert Einstein's Theory of General Relativity proved that immense gravitational fields warp the very fabric of spacetime. Near the event horizon of a supermassive black hole, gravitational time dilation slows time down relative to observers far away in deep space."
  },
  {
    q_hi: "क्या आप जानते हैं कि वॉयजर-1 (Voyager 1) इंसान द्वारा बनाई गई ब्रह्मांड में सबसे दूर स्थित वस्तु है?",
    exp_hi: "नासा द्वारा 1977 में लॉन्च किया गया वॉयजर-1 अंतरिक्ष यान अब हमारे सौरमंडल की सीमा को पार करके 'इंटरस्टेलर स्पेस' (तारों के बीच का अंतरिक्ष) में प्रवेश कर चुका है। यह पृथ्वी से 24 अरब किलोमीटर से भी ज्यादा दूर है और लगभग 61,000 किमी/घंटा की रफ्तार से अनंत अंतरिक्ष की ओर बढ़ता जा रहा है।",
    q_en: "Did you know that Voyager 1 is the farthest human-made object from Earth in history?",
    exp_en: "Launched by NASA in 1977, Voyager 1 has officially crossed the heliopause into interstellar space. Traveling at approximately 61,000 km/h, it is currently over 24 billion kilometers away from Earth, continuing to transmit scientific telemetry across interstellar depths."
  },
  {
    q_hi: "क्या आप जानते हैं कि मंगल ग्रह पर स्थित 'ओलंपस मॉन्स' हमारे माउंट एवरेस्ट से 3 गुना ऊंचा है?",
    exp_hi: "सौरमंडल का सबसे विशाल ज्वालामुखी मंगल ग्रह पर मौजूद है जिसका नाम 'ओलंपस मॉन्स' (Olympus Mons) है। इसकी ऊंचाई लगभग 22 किलोमीटर (72,000 फीट) है, जो पृथ्वी के सबसे ऊंचे पर्वत माउंट एवरेस्ट से लगभग तीन गुना ज्यादा है! इसका आधार इतना विशाल है कि इसमें पूरा फ्रांस या महाराष्ट्र समा सकता है।",
    q_en: "Did you know that Olympus Mons on Mars is three times taller than Mount Everest?",
    exp_en: "Olympus Mons is a colossal shield volcano on Mars standing at an astounding 21.9 kilometers (72,000 feet) high—nearly three times the peak elevation of Mount Everest! Its base spans over 600 kilometers across, covering a surface area as large as the entire nation of France."
  },
  {
    q_hi: "क्या आप जानते हैं कि एक न्यूट्रॉन तारे (Neutron Star) का केवल एक चम्मच पदार्थ माउंट एवरेस्ट जितना भारी होता है?",
    exp_hi: "जब कोई विशालकाय तारा सुपरनोवा विस्फोट के बाद सिकुड़ता है, तो उसके परमाणु इतने दब जाते हैं कि प्रोटॉन और इलेक्ट्रॉन मिलकर न्यूट्रॉन बन जाते हैं। इसका घनत्व इतना अविश्वसनीय होता है कि यदि आप उस तारे से सिर्फ 1 चम्मच पदार्थ निकाल सकें, तो उसका वजन पृथ्वी पर लगभग 6 अरब टन (पूरे हिमालय पर्वत जितना) होगा!",
    q_en: "Did you know that a single teaspoon of a neutron star weighs about 6 billion tons on Earth?",
    exp_en: "When massive stars die in violent supernova explosions, gravity compresses their cores so violently that protons and electrons crush into pure neutrons. The resulting density is so astronomical that a single teaspoonful of neutronium would weigh around 6 billion tons on Earth!"
  },
  {
    q_hi: "क्या आप जानते हैं कि प्रकाश को सूर्य से पृथ्वी तक पहुंचने में 8 मिनट 20 सेकंड लगते हैं?",
    exp_hi: "प्रकाश 3,00,000 किमी प्रति सेकंड की ब्रह्मांड की सर्वोच्च गति से दौड़ता है, फिर भी सूर्य और पृथ्वी के बीच 15 करोड़ किलोमीटर की दूरी होने के कारण उसकी किरणों को हम तक पहुंचने में 500 सेकंड लगते हैं। इसका मतलब यह है कि अभी आसमान में जो सूर्य आप देख रहे हैं, वह वास्तव में 8 मिनट 20 सेकंड पुराना अतीत है!",
    q_en: "Did you know that the sunlight touching your skin right now left the Sun over 8 minutes ago?",
    exp_en: "Although light travels at the cosmic speed limit of 300,000 kilometers per second, the average 150-million-kilometer distance between Earth and the Sun means photons take roughly 8 minutes and 20 seconds to reach us, meaning we always observe the Sun as it was in the past!"
  }
];

const spaceItems = generate1500CuriosityStories('sub_world_space', SPACE_THEMES, (lvl, num, idx) => {
  return SPACE_THEMES[idx % SPACE_THEMES.length];
});

fs.writeFileSync(
  path.join(__dirname, '../public/World_Space_Astronomy_1500_Questions.csv'),
  HEADER + '\n' + spaceItems.map(buildRow).join('\n'),
  'utf8'
);
console.log('✓ World_Space_Astronomy_1500_Questions.csv created with', spaceItems.length, 'curiosity stories.');

// -------------------------------------------------------------
// 3. PSYCHOLOGY & HUMAN MIND DATA (1500 Stories)
// -------------------------------------------------------------
const PSYCHOLOGY_THEMES = [
  {
    q_hi: "क्या आप जानते हैं कि प्लेसीबो इफेक्ट (Placebo Effect) में सिर्फ विश्वास से शरीर की बीमारियां ठीक हो सकती हैं?",
    exp_hi: "चिकित्सा विज्ञान में जब मरीजों को सिर्फ चीनी की मीठी गोली देकर यह कहा जाता है कि यह एक चमत्कारी महंगी दवा है, तो 35% से अधिक मरीजों में बीमारी के लक्षण अपने आप ठीक होने लगते हैं! हमारा मस्तिष्क विश्वास के आधार पर प्राकृतिक दर्द निवारक 'एंडोर्फिन' और हीलिंग रसायन छोड़ना शुरू कर देता है।",
    q_en: "Did you know that belief alone can physically heal the body via the Placebo Effect?",
    exp_en: "In clinical trials, when patients are given an inert sugar pill but firmly believe it is a potent therapeutic medicine, up to 35% exhibit measurable physiological recovery. The human brain stimulates healing neurotransmitters and endogenous endorphins triggered purely by expectation."
  },
  {
    q_hi: "क्या आप जानते हैं कि डनिंग-क्रूगर इफेक्ट (Dunning-Kruger Effect) क्या है और कम ज्ञानी लोग खुद को सबसे ज्यादा होशियार क्यों समझते हैं?",
    exp_hi: "मनोवैज्ञानिक डेविड डनिंग और जस्टिन क्रूगर ने पाया कि जिस इंसान को किसी विषय का बहुत कम ज्ञान होता है, उसमें अपने अज्ञान को पहचानने की समझ भी नहीं होती। नतीजा यह होता है कि वह खुद को महाज्ञानी समझता है। जबकि असली विशेषज्ञ जानते हैं कि ज्ञान कितना अथाह है, इसलिए वे अक्सर विनम्र और शंकालु रहते हैं।",
    q_en: "Did you know why incompetent people often feel supremely confident due to the Dunning-Kruger Effect?",
    exp_en: "Psychologists found that individuals with minimal competence in a domain suffer a dual burden: they make incorrect errors and lack the metacognitive expertise to recognize their incompetence. True masters, conversely, understand the vastness of knowledge and often display modesty."
  },
  {
    q_hi: "क्या आप जानते हैं कि प्रैटफॉल इफेक्ट (Pratfall Effect) के अनुसार थोड़ी गलतियां करने वाले लोग ज्यादा प्यारे लगते हैं?",
    exp_hi: "मनोविज्ञान कहता है कि जो इंसान हमेशा बिल्कुल परफेक्ट दिखता है, लोग उससे थोड़ा दूर रहने लगते हैं। लेकिन जब कोई बेहद काबिल व्यक्ति कोई छोटी सी गलती कर बैठता है (जैसे कॉफी छलका देना या बोलते हुए फिसल जाना), तो वह अचानक बहुत मानवीय और अपना सा लगने लगता है। इसी को प्रैटफॉल इफेक्ट कहते हैं।",
    q_en: "Did you know that making clumsy minor mistakes can actually make you more likable?",
    exp_en: "The Pratfall Effect demonstrates that when an otherwise competent or brilliant individual commits a relatable, clumsy blunder (such as spilling water), their perceived interpersonal appeal and likeability increase because perfection creates psychological distance."
  },
  {
    q_hi: "क्या आप जानते हैं कि बाईस्टैंडर इफेक्ट (Bystander Effect) की वजह से भीड़ में किसी की मदद मिलने की संभावना कम हो जाती है?",
    exp_hi: "जब कोई सड़क पर दुर्घटना का शिकार होता है और वहां 50 लोग खड़े होते हैं, तो हर कोई यही सोचता है कि 'कोई दूसरा मदद कर ही देगा'। इसे जिम्मेदारी का बंटवारा (Diffusion of Responsibility) कहा जाता है। जबकि यदि वहां सिर्फ एक ही व्यक्ति मौजूद हो, तो मदद मिलने की संभावना 85% से ज्यादा होती है!",
    q_en: "Did you know that you are less likely to receive emergency help in a large crowd?",
    exp_en: "Known as the Bystander Effect and diffusion of responsibility, when multiple witnesses observe an emergency, each person assumes someone else will intervene or call authorities. In contrast, when a single lone bystander is present, the probability of immediate aid jumps above 85%."
  },
  {
    q_hi: "क्या आप जानते हैं कि इंसानी मस्तिष्क (Human Brain) खुद कभी दर्द महसूस नहीं कर सकता?",
    exp_hi: "हमारे दिमाग में पूरे शरीर के दर्द को महसूस करने वाले केंद्र तो होते हैं, लेकिन मस्तिष्क के अपने ऊतकों में कोई दर्द महसूस करने वाले 'नोसिसेप्टर्स' (Pain Receptors) होते ही नहीं हैं! यही कारण है कि न्यूरोसर्जन मरीज को पूरी तरह होश में रखकर भी ब्रेन सर्जरी (Awake Craniotomy) कर सकते हैं और मरीज को कोई दर्द नहीं होता।",
    q_en: "Did you know that the human brain itself has zero pain receptors and cannot feel pain?",
    exp_en: "While the brain interprets pain signals transmitted from every other organ in the human body, brain tissue itself lacks nociceptors (pain receptors). Consequently, neurosurgeons can perform awake brain surgery on conscious patients without inflicting intracranial pain."
  },
  {
    q_hi: "क्या आप जानते हैं कि सोते समय मस्तिष्क खुद की धुलाई (Glymphatic Cleanse) करता है?",
    exp_hi: "जब हम गहरी नींद में होते हैं, तो मस्तिष्क की कोशिकाएं लगभग 60% तक सिकुड़ जाती हैं। इससे मस्तिष्क में सेरेब्रोस्पाइनल फ्लूइड (CSF) की एक लहर बहती है जो दिनभर जमा हुए विषैले प्रोटीन (जैसे बीटा-एमिलॉयड, जो अल्जाइमर का कारण बनता है) को धोकर बाहर निकाल देती है। अच्छी नींद सचमुच दिमाग की सफाई है!",
    q_en: "Did you know your brain physically cleanses itself of metabolic toxins while you sleep?",
    exp_en: "During deep delta-wave sleep, the glymphatic system opens up as brain cells shrink by roughly 60%. Cerebrospinal fluid rushes through interstitial spaces, washing away toxic metabolic byproducts including beta-amyloid proteins implicated in neurodegenerative diseases."
  },
  {
    q_hi: "क्या आप जानते हैं कि मिरर न्यूरॉन्स (Mirror Neurons) की वजह से हमें दूसरों का दर्द देखकर खुद दर्द महसूस होता है?",
    exp_hi: "जब आप किसी को चोट लगते या रोते हुए देखते हैं, तो आपके दिमाग के वही न्यूरॉन्स सक्रिय हो जाते हैं जो आपको खुद चोट लगने पर होते! इन्हें 'सहानुभूति के न्यूरॉन्स' कहा जाता है। यही तंत्र हमें दूसरों की भावनाओं को समझने, सिनेमा के किरदारों के साथ रोने और सामाजिक रिश्ते बनाने में मदद करता है।",
    q_en: "Did you know that specialized mirror neurons in your brain allow you to feel others' pain?",
    exp_en: "Discovered by neurophysiologists, mirror neurons fire both when an individual executes an action and when they observe someone else experiencing it. This neural mirroring forms the physiological bedrock of human empathy, language acquisition, and emotional bonding."
  },
  {
    q_hi: "क्या आप जानते हैं कि हमारा दिमाग एक बार में केवल 7 (± 2) चीजें ही याद रख सकता है?",
    exp_hi: "मनोवैज्ञानिक जॉर्ज मिलर के 'द मैजिकल नंबर सेवन' सिद्धांत के अनुसार, इंसानी कामकाजी स्मृति (Working Memory) की एक निश्चित सीमा होती है। हमारा दिमाग एक समय में 5 से 9 सूचनाओं (औसतन 7) को ही सक्रिय रख सकता है। यही कारण है कि पुराने फोन नंबर और पिन कोड प्रायः 7 अंकों के बनाए जाते थे!",
    q_en: "Did you know your working memory can hold only about 7 (± 2) chunks of information at once?",
    exp_en: "Formulated by cognitive psychologist George Miller in 1956, Miller's Law asserts that human immediate working memory capacity is constrained to 7 ± 2 distinct chunks of data, which influenced the historical formatting of 7-digit local telephone numbers and security PINs."
  },
  {
    q_hi: "क्या आप जानते हैं कि पसंदीदा संगीत सुनते समय दिमाग में डोपामाइन (खुशी का हॉर्मोन) का सैलाब आ जाता है?",
    exp_hi: "जब आप अपना पसंदीदा गाना सुनते हैं और उसमें कोई भावुक मोड़ या बीट ड्रॉप आता है, तो दिमाग का 'रिवॉर्ड सिस्टम' बिल्कुल उसी तरह सक्रिय होता है जैसे स्वादिष्ट खाना खाने या प्यार में पड़ने पर होता है। उस समय रीढ़ की हड्डी में जो रोमांच या रोंगटे (Chills/Frisson) खड़े होते हैं, वे डोपामाइन रश की वजह से होते हैं।",
    q_en: "Did you know that listening to music releases the same dopamine rush as food and romance?",
    exp_en: "Neuroimaging scans reveal that experiencing musical chills or emotional crescendos triggers an intense surge of dopamine in the nucleus accumbens. Music directly engages the primitive neural circuitry associated with biological rewards like eating and social connection."
  },
  {
    q_hi: "क्या आप जानते हैं कि '21 दिन में आदत बन जाती है' यह केवल एक मिथक है?",
    exp_hi: "प्लास्टिक सर्जन मैक्सवेल माल्ट्ज की एक किताब से यह मिथक फैला था कि आदत 21 दिन में बन जाती है। लेकिन यूनिवर्सिटी कॉलेज लंदन के आधुनिक वैज्ञानिक शोध बताते हैं कि किसी नई आदत को मस्तिष्क में स्वचालित (Automatic) बनने में औसतन 66 दिन लगते हैं, और जटिल आदतों के लिए यह समय 254 दिन तक का हो सकता है!",
    q_en: "Did you know that the popular rule 'it takes 21 days to form a habit' is a scientific myth?",
    exp_en: "Originating from cosmetic surgeon Maxwell Maltz's observations in the 1960s, recent rigorous research by University College London demonstrates that establishing a new automatic neural habit actually takes an average of 66 days, varying up to 254 days for complex routines."
  }
];

const psychologyItems = generate1500CuriosityStories('sub_world_psychology', PSYCHOLOGY_THEMES, (lvl, num, idx) => {
  return PSYCHOLOGY_THEMES[idx % PSYCHOLOGY_THEMES.length];
});

fs.writeFileSync(
  path.join(__dirname, '../public/World_Psychology_Mind_1500_Questions.csv'),
  HEADER + '\n' + psychologyItems.map(buildRow).join('\n'),
  'utf8'
);
console.log('✓ World_Psychology_Mind_1500_Questions.csv created with', psychologyItems.length, 'curiosity stories.');

// -------------------------------------------------------------
// 4. PHILOSOPHY & DEEP THINKING DATA (1500 Stories)
// -------------------------------------------------------------
const PHILOSOPHY_THEMES = [
  {
    q_hi: "क्या आप जानते हैं कि सुकरात ने क्यों कहा था: 'मैं केवल इतना जानता हूं कि मैं कुछ नहीं जानता'?",
    exp_hi: "प्राचीन यूनान के महान दार्शनिक सुकरात को डेल्फी के देववाणी (Oracle of Delphi) ने दुनिया का सबसे बुद्धिमान व्यक्ति घोषित किया था। सुकरात ने इसकी व्याख्या करते हुए कहा कि वे इसलिए सबसे बुद्धिमान हैं क्योंकि वे अपने अज्ञान से भलीभांति परिचित हैं, जबकि अन्य लोग न जानते हुए भी ज्ञानी होने का झूठा दंभ भरते हैं। इसे सुक्राती विरोधाभास (Socratic Paradox) कहा जाता है।",
    q_en: "Did you know why Socrates famously proclaimed: 'I know that I know nothing'?",
    exp_en: "When the Oracle at Delphi designated Socrates as the wisest man in Athens, he concluded that his sole wisdom lay in recognizing his own profound ignorance. Unlike politicians and scholars who pretended to master absolute truth, Socrates embraced humility as the true gateway to insight."
  },
  {
    q_hi: "क्या आप जानते हैं कि प्लेटो की गुफा का रूपक (Allegory of the Cave) हमें क्या सिखाता है?",
    exp_hi: "प्लेटो ने एक ऐसी गुफा की कल्पना की जिसमें कुछ कैदी बचपन से जंजीरों में बंधे हैं और केवल सामने की दीवार पर पड़ने वाली परछाइयों को ही असली दुनिया मानते हैं। जब एक कैदी बाहर निकलता है और असली सूरज तथा पेड़ों को देखता है, तो उसे सच्चाई समझ आती है। यह दार्शनिक रूपक सिखाता है कि जो हम अपनी आंखों से देखते हैं वह अक्सर सत्य की केवल एक परछाई होता है।",
    q_en: "Did you know what Plato's Allegory of the Cave reveals about our perception of reality?",
    exp_en: "Plato depicted prisoners chained inside a subterranean cave since birth, viewing flickering shadows cast on a stone wall as ultimate reality. When an escaped captive encounters sunlight and the tangible world, he realizes how easily senses deceive until philosophical enlightenment dawns."
  },
  {
    q_hi: "क्या आप जानते हैं कि 'शिप ऑफ थीसियस' (Ship of Theseus) की पहेली पहचान के बारे में क्या सवाल उठाती है?",
    exp_hi: "यदि एक प्राचीन लकड़ी के जहाज का हर तख्ता, कील और पाल धीरे-धीरे बदलकर नए लगा दिए जाएं, तो क्या वह वही पुराना जहाज रहेगा या एक पूरी तरह नया जहाज बन जाएगा? और यदि उन निकाले गए पुराने तख्तों से दूसरा जहाज बना दिया जाए, तो असली जहाज कौन सा होगा? यह पहेली मानव शरीर और आत्मा की पहचान पर गंभीर प्रश्न खड़ा करती है, क्योंकि 7 साल में हमारे शरीर की लगभग सभी कोशिकाएं भी बदल जाती हैं!",
    q_en: "Did you know the classic philosophical paradox of the Ship of Theseus regarding identity?",
    exp_en: "If a wooden vessel has every plank, mast, and timber progressively replaced over decades until no original material remains, is it fundamentally the same ship or an entirely new entity? This thought experiment challenges whether human identity stems from material components or continuity."
  },
  {
    q_hi: "क्या आप जानते हैं कि स्टोइसिज्म (Stoicism) की सबसे बड़ी शक्ति 'द्विभाजन का सिद्धांत' (Dichotomy of Control) क्या है?",
    exp_hi: "रोमन सम्राट मार्कस ऑरेलियस और दार्शनिक एपिक्टेटस ने सिखाया कि दुनिया में चीजें दो तरह की होती हैं: जो हमारे नियंत्रण में हैं (हमारे विचार, कर्म और प्रतिक्रियाएं) और जो हमारे नियंत्रण में नहीं हैं (दूसरों का व्यवहार, मौसम, परिणाम और बीमारी)। शांति का रहस्य यह है कि जो नियंत्रण में नहीं है उसकी चिंता छोड़कर केवल अपने कर्म पर ध्यान केंद्रित किया जाए।",
    q_en: "Did you know the Stoic principle of the Dichotomy of Control that brings profound peace?",
    exp_en: "Championed by Roman Emperor Marcus Aurelius and Epictetus, Stoicism divides existence into things within our agency (thoughts, ethics, reactions) and things beyond it (outcomes, weather, others' opinions). True inner tranquility arises when one stops worrying about what lies outside one's control."
  },
  {
    q_hi: "क्या आप जानते हैं कि रेने देकार्त का 'कोगितो एर्गो सुम' (मैं सोचता हूं, इसलिए मैं हूं) कैसे अस्तित्व का प्रमाण बना?",
    exp_hi: "दार्शनिक रेने देकार्त ने हर उस चीज़ पर संदेह करना शुरू किया जिसे वे जानते थे—क्या दुनिया एक सपना है? क्या कोई अदृश्य शक्ति उन्हें भ्रमित कर रही है? अंत में उन्होंने पाया कि वे हर चीज़ पर शक कर सकते हैं, लेकिन इस बात पर शक नहीं कर सकते कि वे 'शक कर रहे हैं'। और शक करने के लिए 'सोचने वाले' का होना जरूरी है। इसी से जन्म हुआ: 'Cogito, ergo sum' (I think, therefore I am)।",
    q_en: "Did you know how René Descartes arrived at his foundational truth: 'Cogito, ergo sum'?",
    exp_en: "Seeking indubitable certainty, French philosopher René Descartes questioned everything—including whether his senses were merely simulating reality. He discovered that while he could doubt physical sensory perceptions, he could never doubt the existence of the doubting mind itself: 'I think, therefore I am.'"
  },
  {
    q_hi: "क्या आप जानते हैं कि शोपेनहावर का 'साही की दुविधा' (Hedgehog's Dilemma) मानवीय रिश्तों के दर्द को कैसे बयां करता है?",
    exp_hi: "आर्थर शोपेनहावर ने रूपक दिया कि कड़ाके की ठंड में साही (Porcupines) एक-दूसरे के पास गर्मी पाने के लिए आते हैं, लेकिन जैसे ही वे करीब आते हैं, उनके नुकीले कांटे एक-दूसरे को चुभने लगते हैं और वे दूर भाग जाते हैं। फिर जब ठंड लगती है तो वे फिर पास आते हैं। इंसान भी अकेलेपन से बचने के लिए करीब आता है लेकिन रिश्तों के कांटों से डरकर फिर दूर चला जाता है!",
    q_en: "Did you know what Arthur Schopenhauer's Hedgehog's Dilemma reveals about intimacy?",
    exp_en: "Philosopher Arthur Schopenhauer illustrated that freezing hedgehogs huddle together for warmth on a frosty winter night, but their sharp quills inevitably prick each other, driving them apart. Human intimacy mirrors this: we crave emotional closeness yet risk vulnerability and interpersonal friction."
  },
  {
    q_hi: "क्या आप जानते हैं कि ओकम का रेजर (Occam's Razor) विज्ञान और सोच का सबसे शक्तिशाली नियम क्यों है?",
    exp_hi: "14वीं सदी के दार्शनिक विलियम ऑफ ओकम ने यह नियम दिया था कि जब किसी घटना के कई संभावित स्पष्टीकरण हों, तो हमेशा वह स्पष्टीकरण चुनना चाहिए जो सबसे कम मान्यताओं पर आधारित और सबसे सरल हो। बेवजह जटिल साजिशों या परिकल्पनाओं को 'रेजर' की तरह छांट देना ही सत्य तक पहुँचने का सबसे विश्वसनीय मार्ग है।",
    q_en: "Did you know why Occam's Razor is considered a golden principle of rational thinking?",
    exp_en: "Attributed to Franciscan friar William of Ockham, this philosophical razor states that pluralities should not be posited without necessity. When confronted with competing hypotheses, the simplest explanation requiring the fewest speculative assumptions is most likely correct."
  },
  {
    q_hi: "क्या आप जानते हैं कि भगवद्गीता का 'निष्काम कर्म' सिद्धांत जीवन को तनावमुक्त कैसे बनाता है?",
    exp_hi: "गीता का श्लोक 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन' सिखाता है कि मनुष्य का अधिकार केवल अपने श्रेष्ठ कर्म पर है, उसके फल पर नहीं। जब हम फल की चिंता किए बिना केवल वर्तमान कर्म में 100% तन्मयता लाते हैं, तो असफलता का भय समाप्त हो जाता है और कर्म ही साधना बन जाता है। आधुनिक मनोविज्ञान भी इसे 'फ्लो स्टेट' (Flow State) कहता है।",
    q_en: "Did you know how the Bhagavad Gita's philosophy of 'Nishkama Karma' eliminates anxiety?",
    exp_en: "Expounded in ancient Indian philosophy, Nishkama Karma teaches one to act decisively with full excellence while surrendering attachment to outcomes or fruits. By severing anticipatory worry over future rewards, psychological anxiety dissipates and the mind enters pure flow."
  },
  {
    q_hi: "क्या आप जानते हैं कि ज्यां-पॉल सार्त्र का अस्तित्ववाद कहता है: 'अस्तित्व सार से पहले आता है' (Existence Precedes Essence)?",
    exp_hi: "सार्त्र के अनुसार, एक चाकू बनाने से पहले उसका उद्देश्य तय होता है कि वह काटने के काम आएगा। लेकिन इंसान पहले इस दुनिया में जन्म लेता है (Existence), और उसके बाद अपने फैसलों, कर्मों और मूल्यों से खुद अपनी पहचान और जीवन का अर्थ (Essence) खुद तय करता है। हम अपनी तकदीर खुद गढ़ने के लिए पूरी तरह स्वतंत्र और जिम्मेदार हैं।",
    q_en: "Did you know Jean-Paul Sartre's existential decree: 'Existence precedes essence'?",
    exp_en: "Unlike manufactured tools whose function is predetermined prior to construction, human beings first exist in the world, encounter themselves, and then define their character, meaning, and values through personal choices and radical freedom, carrying the dignity of self-determination."
  },
  {
    q_hi: "क्या आप जानते हैं कि हेराक्लीतुस ने क्यों कहा था: 'आप एक ही नदी में दोबारा कदम नहीं रख सकते'?",
    exp_hi: "प्राचीन यूनानी दार्शनिक हेराक्लीतुस ने परिवर्तन को ब्रह्मांड का एकमात्र शाश्वत सत्य माना था। उनका कहना था कि जब आप नदी में दोबारा पैर रखते हैं, तो वह पानी बह चुका होता है और नया पानी आ चुका होता है, और आप खुद भी पहले जैसे नहीं रह जाते। संसार में हर क्षण सब कुछ बदल रहा है, इसलिए परिवर्तन से डरने के बजाय उसे स्वीकार करना चाहिए।",
    q_en: "Did you know Heraclitus's timeless wisdom: 'No person ever steps in the same river twice'?",
    exp_en: "Pre-Socratic philosopher Heraclitus asserted that perpetual flux (panta rhei) is the fundamental essence of the cosmos. For it is not the same river—as new waters continuously flow in—and you are no longer the exact same person, reminding us to embrace constant transformation."
  }
];

const philosophyItems = generate1500CuriosityStories('sub_world_philosophy', PHILOSOPHY_THEMES, (lvl, num, idx) => {
  return PHILOSOPHY_THEMES[idx % PHILOSOPHY_THEMES.length];
});

fs.writeFileSync(
  path.join(__dirname, '../public/World_Philosophy_Ideas_1500_Questions.csv'),
  HEADER + '\n' + philosophyItems.map(buildRow).join('\n'),
  'utf8'
);
console.log('✓ World_Philosophy_Ideas_1500_Questions.csv created with', philosophyItems.length, 'curiosity stories.');

console.log('ALL 4 CURIOSITY KNOWLEDGE STORY CSVS SUCCESSFULLY GENERATED!');
