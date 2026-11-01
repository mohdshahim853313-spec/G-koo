import type { QuizQuestion } from './gemini';
// Hardcoded questions removed: all questions load exclusively from Google Sheets

export interface SheetQuestionRow {
  id: string;
  category: string;
  text: string;
  options: string[];
  answer: string;
  explanation: string;
  examTag: string;
  lang: 'hi' | 'en';
}

const STORAGE_KEY_QUESTIONS = 'gkoo_synced_sheet_questions';
const STORAGE_KEY_URL = 'gkoo_sheet_sync_url';
const STORAGE_KEY_LAST_SYNC = 'gkoo_last_sheet_sync_time';

// Self-healing migration: cleans up poisoned cross-category caches
(function sanitizeLegacySheetCaches() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const SANITIZE_VERSION = 'v5_strict_category_isolation';
    if (localStorage.getItem('gkoo_cache_version') !== SANITIZE_VERSION) {
      localStorage.removeItem(STORAGE_KEY_URL);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('gkoo_level_q_') || 
          key.startsWith('gkoo_cat_') || 
          key.startsWith('gkoo_hash_') ||
          key.startsWith('gkoo_env_url_')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('gkoo_cache_version', SANITIZE_VERSION);
    }
  } catch (e) {
    // ignore
  }
})();

// Official Google Sheet URL for 1_SSC_CGL (1500 PYQ Questions Bank)
export const DEFAULT_SHEET_TEMPLATE_URL =
  import.meta.env.VITE_SHEET_URL_1_SSC_CGL ||
  'https://docs.google.com/spreadsheets/d/1-HF5XhSVLZbiMaRdvVcAGIbBZuzTGWhzzv9TVKK3R9o/edit?usp=sharing';

export interface CategorySheetMeta {
  envKey: string;
  tabName: string;
  nameHi: string;
  nameEn: string;
}

/**
 * Registry of all 26 Exam & Subject Categories mapped to .env keys and sheet tabs.
 */
export const CATEGORY_SHEET_ENV_MAP: Record<string, CategorySheetMeta> = {
  // Exam Categories (1 to 10)
  'ssc_cgl': { envKey: 'VITE_SHEET_URL_1_SSC_CGL', tabName: '1_SSC_CGL', nameHi: 'एसएससी सीजीएल', nameEn: 'SSC CGL' },
  'ssc_chsl': { envKey: 'VITE_SHEET_URL_2_SSC_CHSL', tabName: '2_SSC_CHSL', nameHi: 'एसएससी सीएचएसएल', nameEn: 'SSC CHSL' },
  'ssc_mts': { envKey: 'VITE_SHEET_URL_3_SSC_MTS', tabName: '3_SSC_MTS', nameHi: 'एसएससी एमटीएस', nameEn: 'SSC MTS' },
  'ssc_cpo': { envKey: 'VITE_SHEET_URL_4_SSC_CPO', tabName: '4_SSC_CPO', nameHi: 'एसएससी सीपीओ', nameEn: 'SSC CPO' },
  'ssc_gd': { envKey: 'VITE_SHEET_URL_5_SSC_GD', tabName: '5_SSC_GD', nameHi: 'एसएससी जीडी', nameEn: 'SSC GD' },
  'rrb_ntpc': { envKey: 'VITE_SHEET_URL_6_RRB_NTPC', tabName: '6_RRB_NTPC', nameHi: 'रेलवे एनटीपीसी', nameEn: 'RRB NTPC' },
  'rrb_group_d': { envKey: 'VITE_SHEET_URL_7_RRB_GROUP_D', tabName: '7_RRB_Group_D', nameHi: 'रेलवे ग्रुप डी', nameEn: 'RRB Group D' },
  'upsc_prelims': { envKey: 'VITE_SHEET_URL_8_UPSC_PRELIMS', tabName: '8_UPSC_Prelims', nameHi: 'यूपीएससी प्रारंभिक', nameEn: 'UPSC Prelims' },
  'state_pcs': { envKey: 'VITE_SHEET_URL_9_STATE_PCS', tabName: '9_State_PCS', nameHi: 'राज्य पीसीएस', nameEn: 'State PCS' },
  'banking_ibps': { envKey: 'VITE_SHEET_URL_10_BANKING_IBPS', tabName: '10_Banking_IBPS', nameHi: 'बैंकिंग आईबीपीएस', nameEn: 'Banking IBPS' },

  // GS & Subject Categories (11 to 26)
  'sub_geography': { envKey: 'VITE_SHEET_URL_11_GEOGRAPHY', tabName: '11_Geography', nameHi: 'भूगोल', nameEn: 'Geography' },
  'sub_ancient_history': { envKey: 'VITE_SHEET_URL_12_ANCIENT_HISTORY', tabName: '12_Ancient_History', nameHi: 'प्राचीन इतिहास', nameEn: 'Ancient History' },
  'sub_medieval_history': { envKey: 'VITE_SHEET_URL_13_MEDIEVAL_HISTORY', tabName: '13_Medieval_History', nameHi: 'मध्यकालीन इतिहास', nameEn: 'Medieval History' },
  'sub_modern_history': { envKey: 'VITE_SHEET_URL_14_MODERN_HISTORY', tabName: '14_Modern_History', nameHi: 'आधुनिक इतिहास', nameEn: 'Modern History' },
  'sub_polity': { envKey: 'VITE_SHEET_URL_15_POLITY_CONSTITUTION', tabName: '15_Polity_Constitution', nameHi: 'संविधान व राजव्यवस्था', nameEn: 'Polity & Constitution' },
  'sub_economy': { envKey: 'VITE_SHEET_URL_16_ECONOMICS', tabName: '16_Economics', nameHi: 'अर्थशास्त्र', nameEn: 'Economics' },
  'sub_physics': { envKey: 'VITE_SHEET_URL_17_PHYSICS', tabName: '17_Physics', nameHi: 'भौतिक विज्ञान', nameEn: 'Physics' },
  'sub_chemistry': { envKey: 'VITE_SHEET_URL_18_CHEMISTRY', tabName: '18_Chemistry', nameHi: 'रसायन विज्ञान', nameEn: 'Chemistry' },
  'sub_biology': { envKey: 'VITE_SHEET_URL_19_BIOLOGY', tabName: '19_Biology', nameHi: 'जीव विज्ञान', nameEn: 'Biology' },
  'sub_gk': { envKey: 'VITE_SHEET_URL_20_STATIC_GK', tabName: '20_Static_GK', nameHi: 'स्टैटिक सामान्य ज्ञान', nameEn: 'Static GK' },
  'sub_computer': { envKey: 'VITE_SHEET_URL_21_COMPUTER_AWARENESS', tabName: '21_Computer_Awareness', nameHi: 'कंप्यूटर ज्ञान', nameEn: 'Computer Awareness' },
  'sub_current_affairs': { envKey: 'VITE_SHEET_URL_22_CURRENT_AFFAIRS', tabName: '22_Current_Affairs', nameHi: 'समसामयिकी', nameEn: 'Current Affairs' },
  'sub_hindi': { envKey: 'VITE_SHEET_URL_23_HINDI_GRAMMAR', tabName: '23_Hindi_Grammar', nameHi: 'हिंदी व्याकरण', nameEn: 'Hindi Grammar' },
  'sub_english': { envKey: 'VITE_SHEET_URL_24_ENGLISH_GRAMMAR', tabName: '24_English_Grammar', nameHi: 'अंग्रेजी व्याकरण', nameEn: 'English Grammar' },
  'sub_math': { envKey: 'VITE_SHEET_URL_25_MATHS_APTITUDE', tabName: '25_Maths_Aptitude', nameHi: 'गणित एवं अंकगणित', nameEn: 'Maths Aptitude' },
  'sub_reasoning': { envKey: 'VITE_SHEET_URL_26_REASONING', tabName: '26_Reasoning', nameHi: 'तर्कशक्ति व रीजनिंग', nameEn: 'Reasoning' },

  // India State & Special Categories (27 to 38)
  'up': { envKey: 'VITE_SHEET_URL_27_UP_SPECIAL', tabName: '27_UP_Special', nameHi: 'उत्तर प्रदेश विशेष', nameEn: 'UP Special' },
  'state_up': { envKey: 'VITE_SHEET_URL_27_UP_SPECIAL', tabName: '27_UP_Special', nameHi: 'उत्तर प्रदेश विशेष', nameEn: 'UP Special' },
  'bihar': { envKey: 'VITE_SHEET_URL_28_BIHAR_SPECIAL', tabName: '28_Bihar_Special', nameHi: 'बिहार विशेष', nameEn: 'Bihar Special' },
  'state_bihar': { envKey: 'VITE_SHEET_URL_28_BIHAR_SPECIAL', tabName: '28_Bihar_Special', nameHi: 'बिहार विशेष', nameEn: 'Bihar Special' },
  'rajasthan': { envKey: 'VITE_SHEET_URL_29_RAJASTHAN_SPECIAL', tabName: '29_Rajasthan_Special', nameHi: 'राजस्थान विशेष', nameEn: 'Rajasthan Special' },
  'state_rajasthan': { envKey: 'VITE_SHEET_URL_29_RAJASTHAN_SPECIAL', tabName: '29_Rajasthan_Special', nameHi: 'राजस्थान विशेष', nameEn: 'Rajasthan Special' },
  'mp': { envKey: 'VITE_SHEET_URL_30_MP_SPECIAL', tabName: '30_MP_Special', nameHi: 'मध्य प्रदेश विशेष', nameEn: 'MP Special' },
  'state_mp': { envKey: 'VITE_SHEET_URL_30_MP_SPECIAL', tabName: '30_MP_Special', nameHi: 'मध्य प्रदेश विशेष', nameEn: 'MP Special' },
  'haryana': { envKey: 'VITE_SHEET_URL_31_HARYANA_DELHI', tabName: '31_Haryana_Delhi', nameHi: 'हरियाणा व दिल्ली', nameEn: 'Haryana & Delhi' },
  'delhi': { envKey: 'VITE_SHEET_URL_31_HARYANA_DELHI', tabName: '31_Haryana_Delhi', nameHi: 'हरियाणा व दिल्ली', nameEn: 'Haryana & Delhi' },
  'state_haryana_delhi': { envKey: 'VITE_SHEET_URL_31_HARYANA_DELHI', tabName: '31_Haryana_Delhi', nameHi: 'हरियाणा व दिल्ली', nameEn: 'Haryana & Delhi' },
  'uttarakhand': { envKey: 'VITE_SHEET_URL_32_UTTARAKHAND', tabName: '32_Uttarakhand', nameHi: 'उत्तराखंड विशेष', nameEn: 'Uttarakhand Special' },
  'state_uttarakhand': { envKey: 'VITE_SHEET_URL_32_UTTARAKHAND', tabName: '32_Uttarakhand', nameHi: 'उत्तराखंड विशेष', nameEn: 'Uttarakhand Special' },
  'jharkhand': { envKey: 'VITE_SHEET_URL_33_JHARKHAND', tabName: '33_Jharkhand', nameHi: 'झारखंड विशेष', nameEn: 'Jharkhand Special' },
  'state_jharkhand': { envKey: 'VITE_SHEET_URL_33_JHARKHAND', tabName: '33_Jharkhand', nameHi: 'झारखंड विशेष', nameEn: 'Jharkhand Special' },
  'chhattisgarh': { envKey: 'VITE_SHEET_URL_34_CHHATTISGARH', tabName: '34_Chhattisgarh', nameHi: 'छत्तीसगढ़ विशेष', nameEn: 'Chhattisgarh Special' },
  'state_chhattisgarh': { envKey: 'VITE_SHEET_URL_34_CHHATTISGARH', tabName: '34_Chhattisgarh', nameHi: 'छत्तीसगढ़ विशेष', nameEn: 'Chhattisgarh Special' },
  'defence': { envKey: 'VITE_SHEET_URL_35_DEFENCE_EXAMS', tabName: '35_Defence_Exams', nameHi: 'डिफेंस परीक्षाएं (NDA/CDS)', nameEn: 'Defence Exams' },
  'exam_defence': { envKey: 'VITE_SHEET_URL_35_DEFENCE_EXAMS', tabName: '35_Defence_Exams', nameHi: 'डिफेंस परीक्षाएं (NDA/CDS)', nameEn: 'Defence Exams' },
  'teaching': { envKey: 'VITE_SHEET_URL_36_TEACHING_EXAMS', tabName: '36_Teaching_Exams', nameHi: 'शिक्षक पात्रता (CTET/TET)', nameEn: 'Teaching Exams' },
  'exam_teaching': { envKey: 'VITE_SHEET_URL_36_TEACHING_EXAMS', tabName: '36_Teaching_Exams', nameHi: 'शिक्षक पात्रता (CTET/TET)', nameEn: 'Teaching Exams' },
  'environment': { envKey: 'VITE_SHEET_URL_37_ENVIRONMENT', tabName: '37_Environment', nameHi: 'पर्यावरण एवं पारिस्थितिकी', nameEn: 'Environment & Ecology' },
  'sub_environment': { envKey: 'VITE_SHEET_URL_37_ENVIRONMENT', tabName: '37_Environment', nameHi: 'पर्यावरण एवं पारिस्थितिकी', nameEn: 'Environment & Ecology' },
  'art_culture': { envKey: 'VITE_SHEET_URL_38_ART_CULTURE', tabName: '38_Art_Culture', nameHi: 'भारतीय कला एवं संस्कृति', nameEn: 'Art & Culture' },
  'sub_art_culture': { envKey: 'VITE_SHEET_URL_38_ART_CULTURE', tabName: '38_Art_Culture', nameHi: 'भारतीय कला एवं संस्कृति', nameEn: 'Art & Culture' },

  // World Series Categories (39 to 45)
  'world_geography': { envKey: 'VITE_SHEET_URL_39_WORLD_GEOGRAPHY', tabName: '39_World_Geography', nameHi: 'विश्व भूगोल', nameEn: 'World Geography' },
  'world_history': { envKey: 'VITE_SHEET_URL_40_WORLD_HISTORY', tabName: '40_World_History', nameHi: 'विश्व इतिहास', nameEn: 'World History' },
  'world_space': { envKey: 'VITE_SHEET_URL_41_WORLD_SPACE_ASTRONOMY', tabName: '41_World_Space_Astronomy', nameHi: 'अंतरिक्ष व खगोल विज्ञान', nameEn: 'World Space & Astronomy' },
  'world_facts': { envKey: 'VITE_SHEET_URL_42_WORLD_FACTS_WONDERS', tabName: '42_World_Facts_Wonders', nameHi: 'विश्व के अजूबे व रोचक तथ्य', nameEn: 'World Facts & Wonders' },
  'world_psychology': { envKey: 'VITE_SHEET_URL_43_WORLD_PSYCHOLOGY_MIND', tabName: '43_World_Psychology_Mind', nameHi: 'मनोविज्ञान व मस्तिष्क', nameEn: 'World Psychology & Mind' },
  'world_philosophy': { envKey: 'VITE_SHEET_URL_44_WORLD_PHILOSOPHY_IDEAS', tabName: '44_World_Philosophy_Ideas', nameHi: 'दर्शनशास्त्र व महान विचारक', nameEn: 'World Philosophy & Ideas' },
  'world_international': { envKey: 'VITE_SHEET_URL_45_WORLD_INTERNATIONAL_AFFAIRS', tabName: '45_World_International_Affairs', nameHi: 'अंतर्राष्ट्रीय संबंध व संगठन', nameEn: 'World International Affairs' },

  // Additional India State Categories (46 to 53)
  'maharashtra': { envKey: 'VITE_SHEET_URL_46_MAHARASHTRA', tabName: '46_Maharashtra', nameHi: 'महाराष्ट्र विशेष', nameEn: 'Maharashtra' },
  'state_maharashtra': { envKey: 'VITE_SHEET_URL_46_MAHARASHTRA', tabName: '46_Maharashtra', nameHi: 'महाराष्ट्र विशेष', nameEn: 'Maharashtra' },
  'punjab': { envKey: 'VITE_SHEET_URL_47_PUNJAB', tabName: '47_Punjab', nameHi: 'पंजाब विशेष', nameEn: 'Punjab' },
  'state_punjab': { envKey: 'VITE_SHEET_URL_47_PUNJAB', tabName: '47_Punjab', nameHi: 'पंजाब विशेष', nameEn: 'Punjab' },
  'west_bengal': { envKey: 'VITE_SHEET_URL_48_WEST_BENGAL', tabName: '48_West_Bengal', nameHi: 'पश्चिम बंगाल विशेष', nameEn: 'West Bengal' },
  'state_west_bengal': { envKey: 'VITE_SHEET_URL_48_WEST_BENGAL', tabName: '48_West_Bengal', nameHi: 'पश्चिम बंगाल विशेष', nameEn: 'West Bengal' },
  'gujarat': { envKey: 'VITE_SHEET_URL_49_GUJARAT', tabName: '49_Gujarat', nameHi: 'गुजरात विशेष', nameEn: 'Gujarat' },
  'state_gujarat': { envKey: 'VITE_SHEET_URL_49_GUJARAT', tabName: '49_Gujarat', nameHi: 'गुजरात विशेष', nameEn: 'Gujarat Special' },
  'himachal': { envKey: 'VITE_SHEET_URL_50_HIMACHAL', tabName: '50_Himachal', nameHi: 'हिमाचल प्रदेश विशेष', nameEn: 'Himachal Pradesh' },
  'state_himachal': { envKey: 'VITE_SHEET_URL_50_HIMACHAL', tabName: '50_Himachal', nameHi: 'हिमाचल प्रदेश विशेष', nameEn: 'Himachal Pradesh' },
  'odisha': { envKey: 'VITE_SHEET_URL_51_ODISHA', tabName: '51_Odisha', nameHi: 'ओडिशा विशेष', nameEn: 'Odisha' },
  'state_odisha': { envKey: 'VITE_SHEET_URL_51_ODISHA', tabName: '51_Odisha', nameHi: 'ओडिशा विशेष', nameEn: 'Odisha' },
  'assam': { envKey: 'VITE_SHEET_URL_52_ASSAM_NORTHEAST', tabName: '52_Assam_NorthEast', nameHi: 'असम एवं पूर्वोत्तर विशेष', nameEn: 'Assam & North East' },
  'state_assam': { envKey: 'VITE_SHEET_URL_52_ASSAM_NORTHEAST', tabName: '52_Assam_NorthEast', nameHi: 'असम एवं पूर्वोत्तर विशेष', nameEn: 'Assam & North East' },
  'south_states': { envKey: 'VITE_SHEET_URL_53_SOUTH_STATES', tabName: '53_South_States', nameHi: 'दक्षिण भारतीय राज्य विशेष', nameEn: 'South Indian States' },
  'state_south_states': { envKey: 'VITE_SHEET_URL_53_SOUTH_STATES', tabName: '53_South_States', nameHi: 'दक्षिण भारतीय राज्य विशेष', nameEn: 'South Indian States' },

  // Common subject & short aliases
  'english': { envKey: 'VITE_SHEET_URL_24_ENGLISH_GRAMMAR', tabName: '24_English_Grammar', nameHi: 'अंग्रेजी व्याकरण', nameEn: 'English Grammar' },
  'math': { envKey: 'VITE_SHEET_URL_25_MATHS_APTITUDE', tabName: '25_Maths_Aptitude', nameHi: 'गणित एवं अंकगणित', nameEn: 'Maths Aptitude' },
  'maths': { envKey: 'VITE_SHEET_URL_25_MATHS_APTITUDE', tabName: '25_Maths_Aptitude', nameHi: 'गणित एवं अंकगणित', nameEn: 'Maths Aptitude' },
  'reasoning': { envKey: 'VITE_SHEET_URL_26_REASONING', tabName: '26_Reasoning', nameHi: 'तर्कशक्ति व रीजनिंग', nameEn: 'Reasoning' },
  'geography': { envKey: 'VITE_SHEET_URL_11_GEOGRAPHY', tabName: '11_Geography', nameHi: 'भूगोल', nameEn: 'Geography' },
  'ancient_history': { envKey: 'VITE_SHEET_URL_12_ANCIENT_HISTORY', tabName: '12_Ancient_History', nameHi: 'प्राचीन इतिहास', nameEn: 'Ancient History' },
  'medieval_history': { envKey: 'VITE_SHEET_URL_13_MEDIEVAL_HISTORY', tabName: '13_Medieval_History', nameHi: 'मध्यकालीन इतिहास', nameEn: 'Medieval History' },
  'modern_history': { envKey: 'VITE_SHEET_URL_14_MODERN_HISTORY', tabName: '14_Modern_History', nameHi: 'आधुनिक इतिहास', nameEn: 'Modern History' },
  'history': { envKey: 'VITE_SHEET_URL_14_MODERN_HISTORY', tabName: '14_Modern_History', nameHi: 'आधुनिक इतिहास', nameEn: 'Modern History' },
  'polity': { envKey: 'VITE_SHEET_URL_15_POLITY_CONSTITUTION', tabName: '15_Polity_Constitution', nameHi: 'संविधान व राजव्यवस्था', nameEn: 'Polity & Constitution' },
  'constitution': { envKey: 'VITE_SHEET_URL_15_POLITY_CONSTITUTION', tabName: '15_Polity_Constitution', nameHi: 'संविधान व राजव्यवस्था', nameEn: 'Polity & Constitution' },
  'economics': { envKey: 'VITE_SHEET_URL_16_ECONOMICS', tabName: '16_Economics', nameHi: 'अर्थशास्त्र', nameEn: 'Economics' },
  'economy': { envKey: 'VITE_SHEET_URL_16_ECONOMICS', tabName: '16_Economics', nameHi: 'अर्थशास्त्र', nameEn: 'Economics' },
  'physics': { envKey: 'VITE_SHEET_URL_17_PHYSICS', tabName: '17_Physics', nameHi: 'भौतिक विज्ञान', nameEn: 'Physics' },
  'chemistry': { envKey: 'VITE_SHEET_URL_18_CHEMISTRY', tabName: '18_Chemistry', nameHi: 'रसायन विज्ञान', nameEn: 'Chemistry' },
  'biology': { envKey: 'VITE_SHEET_URL_19_BIOLOGY', tabName: '19_Biology', nameHi: 'जीव विज्ञान', nameEn: 'Biology' },
  'static_gk': { envKey: 'VITE_SHEET_URL_20_STATIC_GK', tabName: '20_Static_GK', nameHi: 'स्टैटिक सामान्य ज्ञान', nameEn: 'Static GK' },
  'gk': { envKey: 'VITE_SHEET_URL_20_STATIC_GK', tabName: '20_Static_GK', nameHi: 'स्टैटिक सामान्य ज्ञान', nameEn: 'Static GK' },
  'computer': { envKey: 'VITE_SHEET_URL_21_COMPUTER_AWARENESS', tabName: '21_Computer_Awareness', nameHi: 'कंप्यूटर ज्ञान', nameEn: 'Computer Awareness' },
  'current_affairs': { envKey: 'VITE_SHEET_URL_22_CURRENT_AFFAIRS', tabName: '22_Current_Affairs', nameHi: 'समसामयिकी', nameEn: 'Current Affairs' },
  'ca': { envKey: 'VITE_SHEET_URL_22_CURRENT_AFFAIRS', tabName: '22_Current_Affairs', nameHi: 'समसामयिकी', nameEn: 'Current Affairs' },
  'hindi': { envKey: 'VITE_SHEET_URL_23_HINDI_GRAMMAR', tabName: '23_Hindi_Grammar', nameHi: 'हिंदी व्याकरण', nameEn: 'Hindi Grammar' },
  'world': { envKey: 'VITE_SHEET_URL_39_WORLD_GEOGRAPHY', tabName: '39_World_Geography', nameHi: 'विश्व भूगोल', nameEn: 'World Geography' },
  'sub_world_geography': { envKey: 'VITE_SHEET_URL_39_WORLD_GEOGRAPHY', tabName: '39_World_Geography', nameHi: 'विश्व भूगोल', nameEn: 'World Geography' },
  'sub_world_history': { envKey: 'VITE_SHEET_URL_40_WORLD_HISTORY', tabName: '40_World_History', nameHi: 'विश्व इतिहास', nameEn: 'World History' },
  'sub_space': { envKey: 'VITE_SHEET_URL_41_WORLD_SPACE_ASTRONOMY', tabName: '41_World_Space_Astronomy', nameHi: 'अंतरिक्ष व खगोल विज्ञान', nameEn: 'World Space & Astronomy' },
  'sub_world_space': { envKey: 'VITE_SHEET_URL_41_WORLD_SPACE_ASTRONOMY', tabName: '41_World_Space_Astronomy', nameHi: 'अंतरिक्ष व खगोल विज्ञान', nameEn: 'World Space & Astronomy' },
  'sub_facts': { envKey: 'VITE_SHEET_URL_42_WORLD_FACTS_WONDERS', tabName: '42_World_Facts_Wonders', nameHi: 'विश्व के अजूबे व रोचक तथ्य', nameEn: 'World Facts & Wonders' },
  'sub_world_facts': { envKey: 'VITE_SHEET_URL_42_WORLD_FACTS_WONDERS', tabName: '42_World_Facts_Wonders', nameHi: 'विश्व के अजूबे व रोचक तथ्य', nameEn: 'World Facts & Wonders' },
  'sub_psychology': { envKey: 'VITE_SHEET_URL_43_WORLD_PSYCHOLOGY_MIND', tabName: '43_World_Psychology_Mind', nameHi: 'मनोविज्ञान व मस्तिष्क', nameEn: 'World Psychology & Mind' },
  'sub_world_psychology': { envKey: 'VITE_SHEET_URL_43_WORLD_PSYCHOLOGY_MIND', tabName: '43_World_Psychology_Mind', nameHi: 'मनोविज्ञान व मस्तिष्क', nameEn: 'World Psychology & Mind' },
  'sub_philosophy': { envKey: 'VITE_SHEET_URL_44_WORLD_PHILOSOPHY_IDEAS', tabName: '44_World_Philosophy_Ideas', nameHi: 'दर्शनशास्त्र व महान विचारक', nameEn: 'World Philosophy & Ideas' },
  'sub_world_philosophy': { envKey: 'VITE_SHEET_URL_44_WORLD_PHILOSOPHY_IDEAS', tabName: '44_World_Philosophy_Ideas', nameHi: 'दर्शनशास्त्र व महान विचारक', nameEn: 'World Philosophy & Ideas' },
  'sub_international': { envKey: 'VITE_SHEET_URL_45_WORLD_INTERNATIONAL_AFFAIRS', tabName: '45_World_International_Affairs', nameHi: 'अंतर्राष्ट्रीय संबंध व संगठन', nameEn: 'World International Affairs' },
  'sub_world_international': { envKey: 'VITE_SHEET_URL_45_WORLD_INTERNATIONAL_AFFAIRS', tabName: '45_World_International_Affairs', nameHi: 'अंतर्राष्ट्रीय संबंध व संगठन', nameEn: 'World International Affairs' }
};

/**
 * Mapping of all categories to their bundled 1500 PYQ CSV files in /public.
 */
export const CATEGORY_LOCAL_CSV_MAP: Record<string, string> = {
  // Exam Categories (1 to 10)
  'ssc_cgl': 'SSC_CGL_1500_PYQ_Questions.csv',
  'ssc': 'SSC_CGL_1500_PYQ_Questions.csv',
  'india': 'SSC_CGL_1500_PYQ_Questions.csv',
  '1_ssc_cgl': 'SSC_CGL_1500_PYQ_Questions.csv',

  'ssc_chsl': 'SSC_CHSL_1500_PYQ_Questions.csv',
  '2_ssc_chsl': 'SSC_CHSL_1500_PYQ_Questions.csv',

  'ssc_mts': 'SSC_MTS_1500_PYQ_Questions.csv',
  '3_ssc_mts': 'SSC_MTS_1500_PYQ_Questions.csv',

  'ssc_cpo': 'SSC_CPO_1500_PYQ_Questions.csv',
  '4_ssc_cpo': 'SSC_CPO_1500_PYQ_Questions.csv',

  'ssc_gd': 'SSC_GD_1500_PYQ_Questions.csv',
  '5_ssc_gd': 'SSC_GD_1500_PYQ_Questions.csv',

  'rrb_ntpc': 'RRB_NTPC_1500_PYQ_Questions.csv',
  'railway': 'RRB_NTPC_1500_PYQ_Questions.csv',
  '6_rrb_ntpc': 'RRB_NTPC_1500_PYQ_Questions.csv',

  'rrb_group_d': 'RRB_Group_D_1500_PYQ_Questions.csv',
  'group_d': 'RRB_Group_D_1500_PYQ_Questions.csv',
  '7_rrb_group_d': 'RRB_Group_D_1500_PYQ_Questions.csv',

  'upsc_prelims': 'UPSC_Prelims_1500_PYQ_Questions.csv',
  'upsc': 'UPSC_Prelims_1500_PYQ_Questions.csv',
  '8_upsc_prelims': 'UPSC_Prelims_1500_PYQ_Questions.csv',

  'state_pcs': 'State_PCS_1500_PYQ_Questions.csv',
  'uppsc': 'State_PCS_1500_PYQ_Questions.csv',
  '9_state_pcs': 'State_PCS_1500_PYQ_Questions.csv',

  'banking_ibps': 'Banking_IBPS_1500_PYQ_Questions.csv',
  'banking': 'Banking_IBPS_1500_PYQ_Questions.csv',
  'ibps': 'Banking_IBPS_1500_PYQ_Questions.csv',
  '10_banking_ibps': 'Banking_IBPS_1500_PYQ_Questions.csv',

  // GS & Subject Categories (11 to 26)
  'sub_geography': 'Geography_1500_PYQ_Questions.csv',
  'geography': 'Geography_1500_PYQ_Questions.csv',
  '11_geography': 'Geography_1500_PYQ_Questions.csv',

  'sub_ancient_history': 'Ancient_History_1500_PYQ_Questions.csv',
  'ancient_history': 'Ancient_History_1500_PYQ_Questions.csv',
  '12_ancient_history': 'Ancient_History_1500_PYQ_Questions.csv',

  'sub_medieval_history': 'Medieval_History_1500_PYQ_Questions.csv',
  'medieval_history': 'Medieval_History_1500_PYQ_Questions.csv',
  '13_medieval_history': 'Medieval_History_1500_PYQ_Questions.csv',

  'sub_modern_history': 'Modern_History_1500_PYQ_Questions.csv',
  'modern_history': 'Modern_History_1500_PYQ_Questions.csv',
  'history': 'Modern_History_1500_PYQ_Questions.csv',
  '14_modern_history': 'Modern_History_1500_PYQ_Questions.csv',

  'sub_polity': 'Polity_1500_PYQ_Questions.csv',
  'polity': 'Polity_1500_PYQ_Questions.csv',
  'constitution': 'Polity_1500_PYQ_Questions.csv',
  '15_polity_constitution': 'Polity_1500_PYQ_Questions.csv',

  'sub_economy': 'Economics_1500_PYQ_Questions.csv',
  'economics': 'Economics_1500_PYQ_Questions.csv',
  'economy': 'Economics_1500_PYQ_Questions.csv',
  '16_economics': 'Economics_1500_PYQ_Questions.csv',

  'sub_physics': 'Physics_1500_PYQ_Questions.csv',
  'physics': 'Physics_1500_PYQ_Questions.csv',
  '17_physics': 'Physics_1500_PYQ_Questions.csv',

  'sub_chemistry': 'Chemistry_1500_PYQ_Questions.csv',
  'chemistry': 'Chemistry_1500_PYQ_Questions.csv',
  '18_chemistry': 'Chemistry_1500_PYQ_Questions.csv',

  'sub_biology': 'Biology_1500_PYQ_Questions.csv',
  'biology': 'Biology_1500_PYQ_Questions.csv',
  'science': 'Biology_1500_PYQ_Questions.csv',
  '19_biology': 'Biology_1500_PYQ_Questions.csv',

  'sub_gk': 'Static_GK_1500_PYQ_Questions.csv',
  'static_gk': 'Static_GK_1500_PYQ_Questions.csv',
  'gk': 'Static_GK_1500_PYQ_Questions.csv',
  '20_static_gk': 'Static_GK_1500_PYQ_Questions.csv',

  'sub_computer': 'Computer_1500_PYQ_Questions.csv',
  'computer': 'Computer_1500_PYQ_Questions.csv',
  '21_computer_awareness': 'Computer_1500_PYQ_Questions.csv',

  'sub_current_affairs': 'Current_Affairs_1500_PYQ_Questions.csv',
  'current_affairs': 'Current_Affairs_1500_PYQ_Questions.csv',
  'ca': 'Current_Affairs_1500_PYQ_Questions.csv',
  '22_current_affairs': 'Current_Affairs_1500_PYQ_Questions.csv',

  'sub_hindi': 'Hindi_1500_PYQ_Questions.csv',
  'hindi': 'Hindi_1500_PYQ_Questions.csv',
  '23_hindi_grammar': 'Hindi_1500_PYQ_Questions.csv',

  'sub_english': 'English_1500_PYQ_Questions.csv',
  'english': 'English_1500_PYQ_Questions.csv',
  '24_english_grammar': 'English_1500_PYQ_Questions.csv',

  'sub_math': 'Maths_1500_PYQ_Questions.csv',
  'maths': 'Maths_1500_PYQ_Questions.csv',
  'math': 'Maths_1500_PYQ_Questions.csv',
  'aptitude': 'Maths_1500_PYQ_Questions.csv',
  '25_maths_aptitude': 'Maths_1500_PYQ_Questions.csv',

  'sub_reasoning': 'Reasoning_1500_PYQ_Questions.csv',
  'reasoning': 'Reasoning_1500_PYQ_Questions.csv',
  '26_reasoning': 'Reasoning_1500_PYQ_Questions.csv',

  // World Categories (Dedicated 1500 Unique Questions Each)
  'world': 'World_Geography_1500_Questions.csv',
  'world_geography': 'World_Geography_1500_Questions.csv',
  'world_history': 'World_History_1500_Questions.csv',
  'world_space': 'World_Space_Astronomy_1500_Questions.csv',
  'world_facts': 'World_Facts_Wonders_1500_Questions.csv',
  'world_psychology': 'World_Psychology_Mind_1500_Questions.csv',
  'world_philosophy': 'World_Philosophy_Ideas_1500_Questions.csv',
  'world_international': 'World_International_Affairs_1500_Questions.csv',
  'sub_psychology': 'World_Psychology_Mind_1500_Questions.csv',
  'sub_facts': 'World_Facts_Wonders_1500_Questions.csv',
  'sub_space': 'World_Space_Astronomy_1500_Questions.csv',
  'sub_philosophy': 'World_Philosophy_Ideas_1500_Questions.csv',
  'sub_world_geography': 'World_Geography_1500_Questions.csv',
  'sub_world_history': 'World_History_1500_Questions.csv',
  'sub_international': 'World_International_Affairs_1500_Questions.csv',

  // General Categories
  'subjects': 'Biology_1500_PYQ_Questions.csv',
  'mix': 'Static_GK_1500_PYQ_Questions.csv',
  'daily': 'Static_GK_1500_PYQ_Questions.csv',

  // State Special Question Banks
  'up': 'UP_Special_1500_PYQ_Questions.csv',
  'state_up': 'UP_Special_1500_PYQ_Questions.csv',
  'up_special': 'UP_Special_1500_PYQ_Questions.csv',
  'up_police': 'UP_Special_1500_PYQ_Questions.csv',
  'up_uppsc': 'UP_Special_1500_PYQ_Questions.csv',
  'up_pet': 'UP_Special_1500_PYQ_Questions.csv',
  'up_lekhpal': 'UP_Special_1500_PYQ_Questions.csv',
  'up_ro_aro': 'UP_Special_1500_PYQ_Questions.csv',
  'up_tet': 'UP_Special_1500_PYQ_Questions.csv',

  'bihar': 'Bihar_Special_1500_PYQ_Questions.csv',
  'state_bihar': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bihar_special': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bpsc': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bihar_bpsc': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bihar_police': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bihar_police_si': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bssc': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bihar_bssc_cgl': 'Bihar_Special_1500_PYQ_Questions.csv',
  'bihar_tre': 'Bihar_Special_1500_PYQ_Questions.csv',

  'rajasthan': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'state_rajasthan': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'rajasthan_special': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'ras': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'raj_ras': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'raj_cet': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'raj_police': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'raj_patwari': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'rpsc': 'Rajasthan_Special_1500_PYQ_Questions.csv',
  'rsmssb': 'Rajasthan_Special_1500_PYQ_Questions.csv',

  'mp': 'MP_Special_1500_PYQ_Questions.csv',
  'state_mp': 'MP_Special_1500_PYQ_Questions.csv',
  'mp_special': 'MP_Special_1500_PYQ_Questions.csv',
  'mppsc': 'MP_Special_1500_PYQ_Questions.csv',
  'mp_mppsc': 'MP_Special_1500_PYQ_Questions.csv',
  'mp_police': 'MP_Special_1500_PYQ_Questions.csv',
  'mp_patwari': 'MP_Special_1500_PYQ_Questions.csv',
  'vyapam': 'MP_Special_1500_PYQ_Questions.csv',

  // Haryana & Delhi
  'haryana': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'delhi': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'hssc': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'dsssb': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'delhi_dsssb': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'delhi_police': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'hpsc': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'har_hpsc': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'har_cet': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'har_police': 'Haryana_Delhi_1500_PYQ_Questions.csv',
  'state_haryana_delhi': 'Haryana_Delhi_1500_PYQ_Questions.csv',

  // Uttarakhand
  'uttarakhand': 'Uttarakhand_1500_PYQ_Questions.csv',
  'uk': 'Uttarakhand_1500_PYQ_Questions.csv',
  'ukpsc': 'Uttarakhand_1500_PYQ_Questions.csv',
  'uk_ukpsc': 'Uttarakhand_1500_PYQ_Questions.csv',
  'uksssc': 'Uttarakhand_1500_PYQ_Questions.csv',
  'uk_uksssc': 'Uttarakhand_1500_PYQ_Questions.csv',
  'state_uttarakhand': 'Uttarakhand_1500_PYQ_Questions.csv',

  // Jharkhand
  'jharkhand': 'Jharkhand_1500_PYQ_Questions.csv',
  'jpsc': 'Jharkhand_1500_PYQ_Questions.csv',
  'jhk_jpsc': 'Jharkhand_1500_PYQ_Questions.csv',
  'jssc': 'Jharkhand_1500_PYQ_Questions.csv',
  'jhk_jssc_cgl': 'Jharkhand_1500_PYQ_Questions.csv',
  'state_jharkhand': 'Jharkhand_1500_PYQ_Questions.csv',

  // Chhattisgarh
  'chhattisgarh': 'Chhattisgarh_1500_PYQ_Questions.csv',
  'cg': 'Chhattisgarh_1500_PYQ_Questions.csv',
  'cgpsc': 'Chhattisgarh_1500_PYQ_Questions.csv',
  'cg_vyapam': 'Chhattisgarh_1500_PYQ_Questions.csv',
  'state_chhattisgarh': 'Chhattisgarh_1500_PYQ_Questions.csv',

  // Defence & Armed Forces
  'defence': 'Defence_1500_PYQ_Questions.csv',
  'nda': 'Defence_1500_PYQ_Questions.csv',
  'cds': 'Defence_1500_PYQ_Questions.csv',
  'afcat': 'Defence_1500_PYQ_Questions.csv',
  'agniveer': 'Defence_1500_PYQ_Questions.csv',
  'exam_defence': 'Defence_1500_PYQ_Questions.csv',

  // Teaching Exams
  'teaching': 'Teaching_1500_PYQ_Questions.csv',
  'ctet': 'Teaching_1500_PYQ_Questions.csv',
  'tet': 'Teaching_1500_PYQ_Questions.csv',
  'kvs': 'Teaching_1500_PYQ_Questions.csv',
  'exam_teaching': 'Teaching_1500_PYQ_Questions.csv',

  // Environment & Ecology
  'environment': 'Environment_1500_PYQ_Questions.csv',
  'sub_environment': 'Environment_1500_PYQ_Questions.csv',
  'ecology': 'Environment_1500_PYQ_Questions.csv',

  // Art & Culture
  'art_culture': 'Art_Culture_1500_PYQ_Questions.csv',
  'sub_art_culture': 'Art_Culture_1500_PYQ_Questions.csv',
  'culture': 'Art_Culture_1500_PYQ_Questions.csv',

  // Maharashtra
  'maharashtra': 'Maharashtra_1500_PYQ_Questions.csv',
  'state_maharashtra': 'Maharashtra_1500_PYQ_Questions.csv',
  'mpsc': 'Maharashtra_1500_PYQ_Questions.csv',
  'maha_mpsc': 'Maharashtra_1500_PYQ_Questions.csv',
  'maha_police': 'Maharashtra_1500_PYQ_Questions.csv',
  'maha_talathi': 'Maharashtra_1500_PYQ_Questions.csv',

  // Punjab
  'punjab': 'Punjab_1500_PYQ_Questions.csv',
  'state_punjab': 'Punjab_1500_PYQ_Questions.csv',
  'ppsc': 'Punjab_1500_PYQ_Questions.csv',
  'pun_ppsc': 'Punjab_1500_PYQ_Questions.csv',
  'pun_police': 'Punjab_1500_PYQ_Questions.csv',

  // West Bengal
  'west_bengal': 'West_Bengal_1500_PYQ_Questions.csv',
  'bengal': 'West_Bengal_1500_PYQ_Questions.csv',
  'state_west_bengal': 'West_Bengal_1500_PYQ_Questions.csv',
  'wbcs': 'West_Bengal_1500_PYQ_Questions.csv',
  'wb_wbcs': 'West_Bengal_1500_PYQ_Questions.csv',
  'wb_police': 'West_Bengal_1500_PYQ_Questions.csv',

  // Gujarat
  'gujarat': 'Gujarat_1500_PYQ_Questions.csv',
  'state_gujarat': 'Gujarat_1500_PYQ_Questions.csv',
  'gpsc': 'Gujarat_1500_PYQ_Questions.csv',
  'guj_gpsc': 'Gujarat_1500_PYQ_Questions.csv',
  'guj_police': 'Gujarat_1500_PYQ_Questions.csv',

  // Himachal Pradesh
  'himachal': 'Himachal_1500_PYQ_Questions.csv',
  'state_himachal': 'Himachal_1500_PYQ_Questions.csv',
  'hp': 'Himachal_1500_PYQ_Questions.csv',
  'hpas': 'Himachal_1500_PYQ_Questions.csv',
  'hp_hpas': 'Himachal_1500_PYQ_Questions.csv',

  // Odisha
  'odisha': 'Odisha_1500_PYQ_Questions.csv',
  'state_odisha': 'Odisha_1500_PYQ_Questions.csv',
  'opsc': 'Odisha_1500_PYQ_Questions.csv',
  'od_opsc': 'Odisha_1500_PYQ_Questions.csv',

  // Assam & North East
  'assam': 'Assam_NorthEast_1500_PYQ_Questions.csv',
  'state_assam': 'Assam_NorthEast_1500_PYQ_Questions.csv',
  'apsc': 'Assam_NorthEast_1500_PYQ_Questions.csv',
  'as_apsc': 'Assam_NorthEast_1500_PYQ_Questions.csv',
  'northeast': 'Assam_NorthEast_1500_PYQ_Questions.csv',

  // South Indian States
  'south_states': 'South_States_1500_PYQ_Questions.csv',
  'state_south_states': 'South_States_1500_PYQ_Questions.csv',
  'south': 'South_States_1500_PYQ_Questions.csv',
  'ts_ap_psc': 'South_States_1500_PYQ_Questions.csv',
  'tn_kerala_psc': 'South_States_1500_PYQ_Questions.csv',
  'kpsc': 'South_States_1500_PYQ_Questions.csv',
  'tnpsc': 'South_States_1500_PYQ_Questions.csv',
  'tspsc': 'South_States_1500_PYQ_Questions.csv',
  'appsc': 'South_States_1500_PYQ_Questions.csv',
};


/**
 * Resolves the Google Sheet URL configured in .env for a specific category.
 * If developer updates .env and rebuilds APK, the newly compiled URL takes precedence!
 */
export function getEnvSheetUrlForCategory(category?: string): string {
  const envObj = import.meta.env as Record<string, string | undefined>;
  if (!category) {
    return envObj.VITE_SHEET_URL_1_SSC_CGL?.trim() || DEFAULT_SHEET_TEMPLATE_URL;
  }

  const cat = category.toLowerCase().trim();

  // 1. Direct key match in CATEGORY_SHEET_ENV_MAP
  if (CATEGORY_SHEET_ENV_MAP[cat]) {
    const val = envObj[CATEGORY_SHEET_ENV_MAP[cat].envKey]?.trim();
    if (val) return val;
  }

  // 2. Direct match with or without 'sub_' prefix
  const altKey = cat.startsWith('sub_') ? cat.substring(4) : `sub_${cat}`;
  if (CATEGORY_SHEET_ENV_MAP[altKey]) {
    const val = envObj[CATEGORY_SHEET_ENV_MAP[altKey].envKey]?.trim();
    if (val) return val;
  }

  // 3. Match by exact tabName
  for (const [, meta] of Object.entries(CATEGORY_SHEET_ENV_MAP)) {
    if (cat === meta.tabName.toLowerCase()) {
      const val = envObj[meta.envKey]?.trim();
      if (val) return val;
    }
  }

  // 4. Fallback by env key name e.g. VITE_SHEET_URL_24_ENGLISH_GRAMMAR
  for (const [, meta] of Object.entries(CATEGORY_SHEET_ENV_MAP)) {
    if (meta.envKey.toLowerCase().includes(cat)) {
      const val = envObj[meta.envKey]?.trim();
      if (val) return val;
    }
  }

  // 5. Direct uppercase fallback e.g. VITE_SHEET_URL_SSC_CGL
  const directKey = `VITE_SHEET_URL_${category.toUpperCase()}`;
  if (envObj[directKey]?.trim()) {
    return envObj[directKey]!.trim();
  }

  return envObj.VITE_SHEET_URL_1_SSC_CGL?.trim() || DEFAULT_SHEET_TEMPLATE_URL;
}

/**
 * Robust CSV Line & Cell Parser that respects quotes, inner commas, and line breaks.
 */
export function parseCsvText(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Transforms parsed CSV rows into QuizQuestion array with intelligent header matching.
 */
export function parseSheetRowsToQuestions(rows: string[][], fallbackCategory?: string): QuizQuestion[] {
  if (rows.length < 2) return [];

  // Header indexing
  const rawHeaders = rows[0].map(h => (h || '').trim().replace(/^\uFEFF/, ''));
  const cleanHeaders = rawHeaders.map(h => h.toLowerCase().replace(/[\s_-]+/g, ''));

  const findCol = (...aliases: string[]): number => {
    return cleanHeaders.findIndex(h => aliases.some(alias => h.includes(alias.toLowerCase().replace(/[\s_-]+/g, ''))));
  };

  const colCategory = findCol('category', 'विषय', 'topic', 'cat');
  const colLang = findCol('lang', 'language', 'भाषा');

  // Hindi or default question fields
  const colQuestionHi = findCol('questionhi', 'texthi', 'सवाल_हिंदी', 'प्रश्न_हिंदी', 'question_hi', 'texthi');
  const colQuestion = colQuestionHi !== -1 ? colQuestionHi : findCol('question', 'सवाल', 'प्रश्न', 'text', 'ques');

  // English question fields
  const colQuestionEn = findCol('questionen', 'texten', 'question_en', 'text_en', 'englishquestion', 'quesen');

  // Options Hindi or default
  const colOptAHi = findCol('optionahi', 'opta_hi', 'opt1_hi', 'विकल्पa_हिंदी');
  const colOptA = colOptAHi !== -1 ? colOptAHi : findCol('optiona', 'opt1', 'विकल्पa', 'opta', 'a');

  const colOptBHi = findCol('optionbhi', 'optb_hi', 'opt2_hi', 'विकल्पb_हिंदी');
  const colOptB = colOptBHi !== -1 ? colOptBHi : findCol('optionb', 'opt2', 'विकल्पb', 'optb', 'b');

  const colOptCHi = findCol('optionchi', 'optc_hi', 'opt3_hi', 'विकल्पc_हिंदी');
  const colOptC = colOptCHi !== -1 ? colOptCHi : findCol('optionc', 'opt3', 'विकल्पc', 'optc', 'c');

  const colOptDHi = findCol('optiondhi', 'optd_hi', 'opt4_hi', 'विकल्पd_हिंदी');
  const colOptD = colOptDHi !== -1 ? colOptDHi : findCol('optiond', 'opt4', 'विकल्पd', 'optd', 'd');

  // Options English
  const colOptAEn = findCol('optionaen', 'opta_en', 'opt1_en', 'optiona_en');
  const colOptBEn = findCol('optionben', 'optb_en', 'opt2_en', 'optionb_en');
  const colOptCEn = findCol('optioncen', 'optc_en', 'opt3_en', 'optionc_en');
  const colOptDEn = findCol('optionden', 'optd_en', 'opt4_en', 'optiond_en');

  // Answers
  const colAnswerHi = findCol('answerhi', 'answer_hi', 'सहीउत्तर_हिंदी');
  const colAnswer = colAnswerHi !== -1 ? colAnswerHi : findCol('answer', 'सहीउत्तर', 'ans', 'correct', 'उत्तर');
  const colAnswerEn = findCol('answeren', 'answer_en', 'correct_en');

  // Explanations
  const colExplanationHi = findCol('explanationhi', 'explanation_hi', 'व्याख्या_हिंदी');
  const colExplanation = colExplanationHi !== -1 ? colExplanationHi : findCol('explanation', 'व्याख्या', 'विवरण', 'fact', 'exp');
  const colExplanationEn = findCol('explanationen', 'explanation_en', 'exp_en');

  const colExamTag = findCol('examtag', 'exam', 'परीक्षा', 'tag', 'pyq');

  const questions: QuizQuestion[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length < 3) continue;

    const questionText = colQuestion !== -1 ? row[colQuestion]?.trim() : row[1]?.trim();
    if (!questionText) continue;

    const optA = (colOptA !== -1 ? row[colOptA] : row[2])?.trim() || '';
    const optB = (colOptB !== -1 ? row[colOptB] : row[3])?.trim() || '';
    const optC = (colOptC !== -1 ? row[colOptC] : row[4])?.trim() || '';
    const optD = (colOptD !== -1 ? row[colOptD] : row[5])?.trim() || '';

    if (!optA || !optB) continue;

    const rawOptions = [optA, optB, optC, optD].filter(Boolean);
    if (rawOptions.length < 2) continue;

    let rawAnswer = (colAnswer !== -1 ? row[colAnswer] : row[6])?.trim() || '';

    // Support letter based answers like "A", "B", "C", "D" or "1", "2", "3", "4"
    const ansLower = rawAnswer.toLowerCase();
    if (ansLower === 'a' || ansLower === '1' || ansLower === 'option a') rawAnswer = optA;
    else if (ansLower === 'b' || ansLower === '2' || ansLower === 'option b') rawAnswer = optB;
    else if (ansLower === 'c' || ansLower === '3' || ansLower === 'option c') rawAnswer = optC || optA;
    else if (ansLower === 'd' || ansLower === '4' || ansLower === 'option d') rawAnswer = optD || optB;

    if (!rawOptions.includes(rawAnswer)) {
      const match = rawOptions.find(o => o.toLowerCase() === rawAnswer.toLowerCase());
      rawAnswer = match || optA;
    }

    // English parsed items (if present)
    const questionTextEn = colQuestionEn !== -1 ? row[colQuestionEn]?.trim() : '';
    const optAEn = colOptAEn !== -1 ? row[colOptAEn]?.trim() : '';
    const optBEn = colOptBEn !== -1 ? row[colOptBEn]?.trim() : '';
    const optCEn = colOptCEn !== -1 ? row[colOptCEn]?.trim() : '';
    const optDEn = colOptDEn !== -1 ? row[colOptDEn]?.trim() : '';
    const rawOptionsEn = [optAEn, optBEn, optCEn, optDEn].filter(Boolean);

    let rawAnswerEn = colAnswerEn !== -1 ? row[colAnswerEn]?.trim() : '';
    if (rawAnswerEn) {
      const aLower = rawAnswerEn.toLowerCase();
      if (aLower === 'a' || aLower === '1' || aLower === 'option a') rawAnswerEn = optAEn;
      else if (aLower === 'b' || aLower === '2' || aLower === 'option b') rawAnswerEn = optBEn;
      else if (aLower === 'c' || aLower === '3' || aLower === 'option c') rawAnswerEn = optCEn || optAEn;
      else if (aLower === 'd' || aLower === '4' || aLower === 'option d') rawAnswerEn = optDEn || optBEn;
    }

    const explanationEn = colExplanationEn !== -1 ? row[colExplanationEn]?.trim() : '';
    const parsedCat = colCategory !== -1 ? row[colCategory]?.trim() : '';
    const category = parsedCat || fallbackCategory || 'mix';
    const explanation = (colExplanation !== -1 ? row[colExplanation] : '')?.trim() || '';
    const examTag = (colExamTag !== -1 ? row[colExamTag] : '')?.trim() || 'Google Sheet PYQ';

    // Synchronously shuffle options for Hindi and English so the correct answer is never stuck in slot A
    const optIndices = rawOptions.map((_, i) => i);
    for (let i = optIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optIndices[i], optIndices[j]] = [optIndices[j], optIndices[i]];
    }
    const shuffledOptions = optIndices.map(i => rawOptions[i]);
    const shuffledOptionsEn = rawOptionsEn.length === rawOptions.length
      ? optIndices.map(i => rawOptionsEn[i])
      : rawOptionsEn;

    // Explicit row language (if given)
    let rowLang: 'hi' | 'en' | undefined;
    if (colLang !== -1 && row[colLang]) {
      const l = row[colLang].trim().toLowerCase();
      if (l.includes('en') || l.includes('ang') || l.includes('eng')) rowLang = 'en';
      else if (l.includes('hi') || l.includes('hin')) rowLang = 'hi';
    }

    questions.push({
      id: `sheet-${Date.now()}-${r}`,
      text: questionText,
      options: shuffledOptions,
      answer: rawAnswer,
      explanation,
      category: category.toLowerCase().replace(/[\s-]+/g, '_'),
      source: 'offline',
      examTag,
      lang: rowLang,
      textHi: questionText,
      optionsHi: shuffledOptions,
      answerHi: rawAnswer,
      explanationHi: explanation,
      textEn: questionTextEn || undefined,
      optionsEn: shuffledOptionsEn.length >= 2 ? shuffledOptionsEn : undefined,
      answerEn: rawAnswerEn || undefined,
      explanationEn: explanationEn || undefined,
    });
  }

  return questions;
}

/**
 * Normalizes any standard Google Sheets URL into its raw export CSV endpoint.
 */
export function getExportCsvUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a direct export CSV or pub?output=csv
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed;
  }

  // Handle standard /edit link: https://docs.google.com/spreadsheets/d/{ID}/edit...
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    // Extract gid if present
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '&gid=0';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
  }

  return trimmed;
}

/**
 * Fast 64-bit string hash (Murmur-inspired) for instant change detection.
 */
export function computeCsvHash(text: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export interface SheetSyncResult {
  success: boolean;
  count: number;
  message: string;
  unchanged?: boolean;
  updated?: number;
  added?: number;
}

/**
 * Intelligent In-Place Delta Sync:
 * 1. Checks content hash: if sheet hasn't changed, returns instantly with 0 overhead.
 * 2. If edited: fits modified questions directly in their exact position, and appends new rows.
 */
export async function syncQuestionsFromSheet(
  customUrl?: string, 
  categoryHint?: string, 
  forceRefresh: boolean = false
): Promise<SheetSyncResult> {
  try {
    const targetUrl = customUrl ? customUrl.trim() : getSheetSyncUrl(categoryHint);
    if (!targetUrl) {
      return { success: false, count: 0, message: 'Google Sheet URL not configured' };
    }

    const csvUrl = getExportCsvUrl(targetUrl);
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/csv, text/plain, */*' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} (${response.statusText})`);
    }

    const csvData = await response.text();
    const catKey = (categoryHint || 'default').toLowerCase().trim();
    const hashKey = `gkoo_hash_${catKey}`;
    const previousHash = localStorage.getItem(hashKey);
    const currentHash = computeCsvHash(csvData);

    // 1. FAST DELTA CHECK: If content hasn't changed at all and we already have questions in memory/cache:
    const existingQuestions = inMemoryCategoryQuestions.get(catKey) || [];
    if (!forceRefresh && previousHash && previousHash === currentHash && existingQuestions.length > 0) {
      return {
        success: true,
        count: existingQuestions.length,
        unchanged: true,
        updated: 0,
        added: 0,
        message: 'शीट में कोई बदलाव नहीं हुआ है (पहले से अपडेटेड है)।'
      };
    }

    const rows = parseCsvText(csvData);
    const parsedQuestions = parseSheetRowsToQuestions(rows, categoryHint);

    if (parsedQuestions.length === 0) {
      return { success: false, count: 0, message: 'No valid questions found in this sheet. Please check column headers.' };
    }

    // 2. IN-PLACE DELTA MERGE:
    // Update modified rows directly at their exact place, and append new rows!
    let updatedCount = 0;
    let addedCount = 0;
    let hasChanges = false;
    let mergedList: QuizQuestion[] = [];

    if (existingQuestions.length === 0) {
      mergedList = parsedQuestions;
      addedCount = parsedQuestions.length;
      hasChanges = true;
    } else {
      // Row-by-row precision alignment
      for (let i = 0; i < parsedQuestions.length; i++) {
        const newQ = parsedQuestions[i];
        const oldQ = existingQuestions[i];

        if (oldQ) {
          // Check if any property was modified in Google Sheets
          const isModified =
            oldQ.text !== newQ.text ||
            oldQ.answer !== newQ.answer ||
            oldQ.explanation !== newQ.explanation ||
            (oldQ.options || []).join('|') !== (newQ.options || []).join('|') ||
            oldQ.textEn !== newQ.textEn ||
            oldQ.answerEn !== newQ.answerEn;

          if (isModified) {
            // Update question in place while preserving question identity
            mergedList.push({
              ...newQ,
              id: oldQ.id || newQ.id
            });
            updatedCount++;
            hasChanges = true;
          } else {
            mergedList.push(oldQ);
          }
        } else {
          // Newly appended row in sheet
          mergedList.push(newQ);
          addedCount++;
          hasChanges = true;
        }
      }
    }

    // If questions were removed from sheet
    if (existingQuestions.length > parsedQuestions.length) {
      hasChanges = true;
    }

    // Save in High-Speed In-Memory Cache
    inMemoryCategoryQuestions.set(catKey, mergedList);
    const altCat = catKey.startsWith('sub_') ? catKey.substring(4) : `sub_${catKey}`;
    inMemoryCategoryQuestions.set(altCat, mergedList);

    // Index individual exam subcategories if present (e.g. mp_police within state_mp)
    const byRowCat = new Map<string, QuizQuestion[]>();
    for (const q of mergedList) {
      const rc = (q.category || '').toLowerCase().trim();
      if (rc && rc !== catKey) {
        if (!byRowCat.has(rc)) byRowCat.set(rc, []);
        byRowCat.get(rc)!.push(q);
      }
    }
    for (const [rc, qList] of byRowCat.entries()) {
      inMemoryCategoryQuestions.set(rc, qList);
    }

    // Persist hash & slice in localStorage
    try {
      localStorage.setItem(hashKey, currentHash);
      localStorage.setItem(`gkoo_cat_${catKey}`, JSON.stringify(mergedList.slice(0, 100)));
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, Date.now().toString());
      if (customUrl && !categoryHint) {
        localStorage.setItem(STORAGE_KEY_URL, customUrl.trim());
      } else if (categoryHint && customUrl) {
        localStorage.setItem(`gkoo_env_url_${catKey}`, customUrl.trim());
      }

      // If existing questions were updated, clear corrupted level caches for this category
      // so the modified questions reflect instantly in the levels!
      if (updatedCount > 0) {
        for (let l = 1; l <= 150; l++) {
          localStorage.removeItem(`gkoo_level_q_${catKey}_${l}`);
          localStorage.removeItem(`gkoo_level_q_${catKey}_${l}_hi`);
          localStorage.removeItem(`gkoo_level_q_${catKey}_${l}_en`);
          localStorage.removeItem(`gkoo_level_q_${altCat}_${l}`);
          localStorage.removeItem(`gkoo_level_q_${altCat}_${l}_hi`);
          localStorage.removeItem(`gkoo_level_q_${altCat}_${l}_en`);
        }
      }
    } catch (e) {
      // Ignore quota: in-memory cache holds all questions
    }

    window.dispatchEvent(new Event('gkoo_sheet_synced'));

    let message = '';
    if (updatedCount > 0 || addedCount > 0) {
      message = `सिंक पूरा: ${updatedCount} प्रश्न अपडेट हुए, ${addedCount} नए प्रश्न जोड़े गए!`;
    } else {
      message = `सफलतापूर्वक ${mergedList.length} प्रश्न लोड किए गए!`;
    }

    return {
      success: true,
      count: mergedList.length,
      unchanged: !hasChanges,
      updated: updatedCount,
      added: addedCount,
      message
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: err?.message || 'Google Sheet से कनेक्ट नहीं हो सका। कृपया सुनिश्चित करें कि शीट "Anyone with link" पर शेयर है।'
    };
  }
}

/**
 * Manually import questions from pasted raw CSV text.
 */
export function importQuestionsFromCsvText(csvText: string): { success: boolean; count: number; error?: string } {
  try {
    const rows = parseCsvText(csvText);
    const newQuestions = parseSheetRowsToQuestions(rows);

    if (newQuestions.length === 0) {
      return { success: false, count: 0, error: 'कोई मान्य सवाल नहीं मिला। कृपया कॉलम जांचें।' };
    }

    // Merge with existing
    const existing = getAllSyncedQuestions();
    const existingTexts = new Set(existing.map(q => q.text.trim().toLowerCase()));

    const uniqueNew = newQuestions.filter(q => !existingTexts.has(q.text.trim().toLowerCase()));
    const merged = [...uniqueNew, ...existing];

    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEY_LAST_SYNC, Date.now().toString());
    window.dispatchEvent(new Event('gkoo_sheet_synced'));

    return { success: true, count: newQuestions.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || 'CSV पार्सिंग विफल रही' };
  }
}

/**
 * Get all currently saved questions from Google Sheets.
 */
/**
 * Global In-Memory Category Questions Cache
 * Bypasses browser 5MB localStorage limits to hold all 39,000 questions in memory with instant access!
 */
const inMemoryCategoryQuestions = new Map<string, QuizQuestion[]>();

/**
 * Strips bracketed English translations from Hindi questions and options
 * e.g., "1905 में बंगाल का विभाजन (Partition of Bengal) किस..." -> "1905 में बंगाल का विभाजन किस..."
 * e.g., "लॉर्ड कर्जन (Lord Curzon)" -> "लॉर्ड कर्जन"
 * e.g., "रुडोल्फ विरचो (Rudolf Virchow)" -> "रुडोल्फ विरचो"
 */
export function cleanHindiText(text: string): string {
  if (!text) return '';
  const cleaned = text
    // Remove (English text) or [English text] containing Latin letters
    .replace(/\s*[\(\[](?:(?=[^\)\]]*[A-Za-z])[A-Za-z0-9\s.,'’"\\/_-]+)[\)\]]/g, '')
    // Clean up double spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : text;
}

/**
 * Strips bracketed hints, years, and extra details from quiz options and answers
 * so students cannot guess the correct option from bracket clues!
 * e.g., "नीलगिरि बायोस्फीयर रिजर्व (1986)" -> "नीलगिरि बायोस्फीयर रिजर्व"
 * e.g., "लॉर्ड कर्जन (Lord Curzon)" -> "लॉर्ड कर्जन"
 * e.g., "काजीरंगा राष्ट्रीय उद्यान [1974]" -> "काजीरंगा राष्ट्रीय उद्यान"
 */
export function cleanOptionText(text: string): string {
  if (!text) return '';
  const cleaned = text
    // Remove any round or square bracketed content e.g. (1986), [1986], (Lord Curzon)
    .replace(/\s*[\(\[][^\)\]]+[\)\]]/g, '')
    // Clean up extra spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : text.trim();
}

/**
 * Filter questions by user preferred language (Hindi or English).
 */
export function filterQuestionsByLanguage(questions: QuizQuestion[], lang: 'hi' | 'en' = 'hi'): QuizQuestion[] {
  if (!questions || questions.length === 0) return [];
  return questions
    .filter(q => {
      if (q.lang && q.lang !== lang && !q.textEn && !q.textHi) {
        return false;
      }
      return true;
    })
    .map(q => {
      if (lang === 'en' && q.textEn) {
        const rawOptionsEn = (q.optionsEn && q.optionsEn.length >= 2) ? q.optionsEn : q.options;
        const rawAnswerEn = q.answerEn || q.answer;

        const cleanedOptionsEn = rawOptionsEn.map(opt => cleanOptionText(opt));
        const hasDupes = new Set(cleanedOptionsEn).size < rawOptionsEn.length;
        const finalOptionsEn = hasDupes ? rawOptionsEn : cleanedOptionsEn;
        const finalAnswerEn = hasDupes ? rawAnswerEn : cleanOptionText(rawAnswerEn);

        return {
          ...q,
          text: q.textEn,
          options: finalOptionsEn,
          answer: finalAnswerEn,
          explanation: q.explanationEn || q.explanation,
        };
      } else if (lang === 'hi') {
        const rawText = q.textHi || q.text;
        const rawOptions = (q.optionsHi && q.optionsHi.length >= 2) ? q.optionsHi : q.options;
        const rawAnswer = q.answerHi || q.answer;
        const rawExplanation = q.explanationHi || q.explanation;

        const cleanedOptions = rawOptions.map(opt => cleanOptionText(opt));
        const hasDupes = new Set(cleanedOptions).size < rawOptions.length;
        const finalOptions = hasDupes ? rawOptions : cleanedOptions;
        const finalAnswer = hasDupes ? rawAnswer : cleanOptionText(rawAnswer);

        return {
          ...q,
          text: cleanHindiText(rawText),
          options: finalOptions,
          answer: finalAnswer,
          explanation: rawExplanation ? cleanHindiText(rawExplanation) : rawExplanation,
        };
      }
      return q;
    });
}

/**
 * Get all currently saved questions from Google Sheets and In-Memory Cache.
 */
export function getAllSyncedQuestions(): QuizQuestion[] {
  const all: QuizQuestion[] = [];
  for (const qList of inMemoryCategoryQuestions.values()) {
    all.push(...qList);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        all.push(...parsed);
      }
    }
  } catch {
    // quota notice
  }

  return all;
}

/**
 * Fetches and parses questions directly from the bundled 1500 PYQ CSV files in /public.
 */
export async function fetchCategoryFromLocalCsv(category: string, lang: 'hi' | 'en' = 'hi'): Promise<QuizQuestion[]> {
  const catKey = (category || '').toLowerCase().trim();
  let csvFileName = CATEGORY_LOCAL_CSV_MAP[catKey];
  if (!csvFileName) {
    for (const [k, v] of Object.entries(CATEGORY_LOCAL_CSV_MAP)) {
      if (catKey === k || catKey.includes(k) || k.includes(catKey)) {
        csvFileName = v;
        break;
      }
    }
  }
  if (!csvFileName) {
    csvFileName = 'SSC_CGL_1500_PYQ_Questions.csv';
  }

  try {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanFile = csvFileName.startsWith('/') ? csvFileName.slice(1) : csvFileName;

    // Multi-candidate URLs: Handles root domain, nested route paths (/quiz/level-xxx), and Capacitor Android!
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const candidateUrls = [
      `${cleanBase}${cleanFile}`,
      `/${cleanFile}`,
      origin ? `${origin}/${cleanFile}` : `/${cleanFile}`,
      cleanFile,
    ];

    let csvData = '';
    for (const testUrl of candidateUrls) {
      try {
        const res = await fetch(testUrl, { cache: 'no-store' });
        if (res.ok) {
          const text = await res.text();
          // Ensure response is real CSV and not Vite's HTML index.html fallback
          if (text && !text.trim().toLowerCase().startsWith('<!doctype html') && !text.trim().toLowerCase().startsWith('<html')) {
            csvData = text;
            break;
          }
        }
      } catch {
        // try next candidate
      }
    }

    if (!csvData) {
      console.warn(`[SheetSync] Could not read local CSV file: ${csvFileName}`);
      return [];
    }

    const rows = parseCsvText(csvData);
    const parsedQuestions = parseSheetRowsToQuestions(rows, category);

    if (parsedQuestions.length > 0) {
      // 1. Group questions by their individual row category (e.g. mp_police, mp_mppsc, mp_patwari)
      const byRowCat = new Map<string, QuizQuestion[]>();
      for (const q of parsedQuestions) {
        const rc = (q.category || '').toLowerCase().trim();
        if (rc) {
          if (!byRowCat.has(rc)) byRowCat.set(rc, []);
          byRowCat.get(rc)!.push(q);
        }
      }

      // 2. Index each individual exam category into in-memory cache
      for (const [rc, qList] of byRowCat.entries()) {
        inMemoryCategoryQuestions.set(rc, qList);
      }

      // Also save full list under file/state key
      inMemoryCategoryQuestions.set(catKey, parsedQuestions);
      inMemoryCategoryQuestions.set((category || '').toLowerCase().trim(), parsedQuestions);

      // 3. Cache small per-category slice in localStorage
      try {
        localStorage.setItem(`gkoo_cat_${catKey}`, JSON.stringify(parsedQuestions.slice(0, 100)));
        localStorage.setItem(STORAGE_KEY_LAST_SYNC, Date.now().toString());
      } catch (e) {
        // Safe to ignore: in-memory cache holds all 1,500 questions
      }

      window.dispatchEvent(new Event('gkoo_sheet_synced'));

      // If requested category matches one of the distinct exam categories in this file, return ONLY that exam's questions!
      const targeted = byRowCat.get(catKey) || byRowCat.get((category || '').toLowerCase().trim());
      if (targeted && targeted.length > 0) {
        return filterQuestionsByLanguage(targeted, lang);
      }

      return filterQuestionsByLanguage(parsedQuestions, lang);
    }
  } catch (err) {
    console.error(`[SheetSync] Error reading local CSV ${csvFileName}:`, err);
  }
  return [];
}

/**
 * Fetches and syncs questions for a specific category from its configured Google Sheet (priority) or local CSV (offline backup).
 */
export async function syncCategoryQuestions(category: string, lang: 'hi' | 'en' = 'hi'): Promise<QuizQuestion[]> {
  const catLower = (category || '').toLowerCase().trim();

  // 1. Instant check in memory
  if (inMemoryCategoryQuestions.has(catLower) && inMemoryCategoryQuestions.get(catLower)!.length > 0) {
    return filterQuestionsByLanguage(inMemoryCategoryQuestions.get(catLower)!, lang);
  }

  // Check if questions matching catLower exist inside any already-cached parent pool
  for (const list of inMemoryCategoryQuestions.values()) {
    const subset = list.filter(q => (q.category || '').toLowerCase().trim() === catLower);
    if (subset.length > 0) {
      inMemoryCategoryQuestions.set(catLower, subset);
      return filterQuestionsByLanguage(subset, lang);
    }
  }

  // 2. PRIORITY 1: When online, fetch directly from Google Sheet so edits reflect LIVE!
  const isOnline = typeof navigator === 'undefined' || navigator.onLine;
  if (isOnline) {
    try {
      const sheetUrl = getSheetSyncUrl(category);
      if (sheetUrl) {
        const res = await syncQuestionsFromSheet(sheetUrl, category);
        if (res.success && inMemoryCategoryQuestions.has(catLower) && inMemoryCategoryQuestions.get(catLower)!.length > 0) {
          return filterQuestionsByLanguage(inMemoryCategoryQuestions.get(catLower)!, lang);
        }
      }
    } catch (e) {
      console.warn(`[SheetSync] Live sheet sync failed for ${category}, falling back to local CSV:`, e);
    }
  }

  try {
    // 3. PRIORITY 2: Local bundled CSV (Offline safety backup)
    const local = await fetchCategoryFromLocalCsv(category, lang);
    if (local && local.length > 0) {
      return local;
    }
  } catch (err) {
    console.error(`[SheetSync] Error reading fallback local CSV for ${category}:`, err);
  }

  return [];
}

/**
 * Filter synced questions by category and resolve user preferred language (Hindi or English).
 */
export function getSyncedQuestionsByCategory(category: string, lang: 'hi' | 'en' = 'hi'): QuizQuestion[] {
  const catLower = (category || '').toLowerCase().trim();

  // 1. Exact match in in-memory category cache first (fastest, guaranteed)
  if (inMemoryCategoryQuestions.has(catLower)) {
    const list = inMemoryCategoryQuestions.get(catLower)!;
    if (list && list.length > 0) {
      return filterQuestionsByLanguage(list, lang);
    }
  }

  // 2. Exact match inside any cached category question pool (e.g. mp_police within state_mp)
  for (const list of inMemoryCategoryQuestions.values()) {
    const subset = list.filter(q => (q.category || '').toLowerCase().trim() === catLower);
    if (subset.length > 0) {
      inMemoryCategoryQuestions.set(catLower, subset);
      return filterQuestionsByLanguage(subset, lang);
    }
  }

  // 3. Check clean aliases in in-memory cache
  const altKey = catLower.startsWith('sub_') ? catLower.substring(4) : `sub_${catLower}`;
  if (inMemoryCategoryQuestions.has(altKey)) {
    const list = inMemoryCategoryQuestions.get(altKey)!;
    if (list && list.length > 0) {
      return filterQuestionsByLanguage(list, lang);
    }
  }

  // 4. Check per-category localStorage
  try {
    const catRaw = localStorage.getItem(`gkoo_cat_${catLower}`);
    if (catRaw) {
      const parsed = JSON.parse(catRaw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryCategoryQuestions.set(catLower, parsed);
        return filterQuestionsByLanguage(parsed, lang);
      }
    }
  } catch { }

  // 5. Check legacy full questions in localStorage
  const all = getAllSyncedQuestions();
  if (all.length === 0) return [];

  const isSsc = catLower === 'ssc_cgl' || catLower === 'ssc' || catLower.includes('cgl') || catLower === '1_ssc_cgl' || catLower === 'india';

  const matched = (!catLower || catLower === 'mix' || catLower === 'daily')
    ? all
    : all.filter(q => {
      const qCat = (q.category || '').toLowerCase().trim();
      if (isSsc && (qCat.includes('ssc') || qCat === 'ssc_cgl' || qCat === 'india' || !qCat)) {
        return true;
      }
      return qCat === catLower;
    });

  return filterQuestionsByLanguage(matched, lang);
}

/**
 * Get sync metadata statistics with category breakdown.
 */
export function getSheetSyncStats(): {
  totalCount: number;
  lastSyncTime: number | null;
  sheetUrl: string | null;
  categories: Record<string, number>;
} {
  try {
    const questions = getAllSyncedQuestions();
    const lastSyncRaw = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    const sheetUrl = localStorage.getItem(STORAGE_KEY_URL);

    const categories: Record<string, number> = {};
    for (const q of questions) {
      const cat = (q.category || 'General').trim();
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return {
      totalCount: questions.length,
      lastSyncTime: lastSyncRaw ? parseInt(lastSyncRaw, 10) : null,
      sheetUrl: sheetUrl || DEFAULT_SHEET_TEMPLATE_URL,
      categories
    };
  } catch {
    return { totalCount: 0, lastSyncTime: null, sheetUrl: null, categories: {} };
  }
}

export function getSheetSyncUrl(category?: string): string {
  try {
    if (category) {
      const catKey = category.toLowerCase().trim();
      const customCatUrl = localStorage.getItem(`gkoo_custom_sheet_url_${catKey}`);
      if (customCatUrl && customCatUrl.trim()) {
        return customCatUrl.trim();
      }
      return getEnvSheetUrlForCategory(category);
    }

    const customUserUrl = localStorage.getItem(STORAGE_KEY_URL);
    return customUserUrl || getEnvSheetUrlForCategory('ssc_cgl');
  } catch {
    return getEnvSheetUrlForCategory(category);
  }
}

export function setSheetSyncUrl(url: string, category?: string): void {
  try {
    if (category) {
      const catKey = category.toLowerCase().trim();
      localStorage.setItem(`gkoo_custom_sheet_url_${catKey}`, url.trim());
    } else {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
    }
  } catch {
    // ignore
  }
}

export function clearSyncedQuestions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_QUESTIONS);
    localStorage.removeItem(STORAGE_KEY_LAST_SYNC);
    window.dispatchEvent(new Event('gkoo_sheet_synced'));
  } catch {
    // ignore
  }
}

/**
 * Automatically checks and syncs configured Google Sheets on app launch:
 * 1. Checks all 45 configured category URLs in .env.
 * 2. If developer updated any URL in .env and built a new APK, it automatically re-syncs that category!
 * 3. Also ensures the primary active sheet (1_SSC_CGL) is synced at least once.
 */
export async function autoSyncInitialSheetIfEmpty(): Promise<void> {
  try {
    const envObj = import.meta.env as Record<string, string | undefined>;

    // Check all categories in .env for any new or updated sheet link
    for (const [catKey, meta] of Object.entries(CATEGORY_SHEET_ENV_MAP)) {
      const configuredUrl = envObj[meta.envKey]?.trim();
      if (!configuredUrl) continue;

      const cacheKey = `gkoo_env_url_${catKey}`;
      const lastSyncedUrl = localStorage.getItem(cacheKey);

      // If developer changed the link in .env and built a new APK, or first time sync:
      if (configuredUrl !== lastSyncedUrl) {
        console.log(`[SheetSync] Detected updated .env URL for ${meta.tabName}, auto-syncing...`);
        const res = await syncQuestionsFromSheet(configuredUrl, catKey);
        if (res.success) {
          localStorage.setItem(cacheKey, configuredUrl);
        }
      }
    }

    // Ensure baseline sync for primary sheet if never synced before
    const lastSync = localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    if (!lastSync) {
      const defaultUrl = getSheetSyncUrl('ssc_cgl');
      if (defaultUrl) {
        await syncQuestionsFromSheet(defaultUrl, 'ssc_cgl');
      }
    }
  } catch (e) {
    console.warn('[SheetSync] Initial background auto-sync skipped:', e);
  }
}

let isSyncingAllInProgress = false;

export function getIsSyncingAll(): boolean {
  return isSyncingAllInProgress;
}

/**
 * Syncs all 26 Exam & Subject categories from Google Sheets in the background.
 * Uses hash-based delta checking: unchanged sheets skip instantly with 0 parsing overhead!
 */
export async function syncAllCategoriesFromSheets(
  onProgress?: (synced: number, total: number) => void
): Promise<{ success: boolean; totalQuestions: number; syncedCategories: number; updatedRows: number; addedRows: number }> {
  if (isSyncingAllInProgress) {
    return { success: true, totalQuestions: getAllSyncedQuestions().length, syncedCategories: 0, updatedRows: 0, addedRows: 0 };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, totalQuestions: 0, syncedCategories: 0, updatedRows: 0, addedRows: 0 };
  }

  isSyncingAllInProgress = true;
  let totalQuestions = 0;
  let syncedCategories = 0;
  let totalUpdated = 0;
  let totalAdded = 0;

  try {
    const entries = Object.entries(CATEGORY_SHEET_ENV_MAP);
    const total = entries.length;

    // Prioritize primary category (SSC CGL) first
    const sortedEntries = [...entries].sort(([keyA], [keyB]) => {
      if (keyA === 'ssc_cgl') return -1;
      if (keyB === 'ssc_cgl') return 1;
      return 0;
    });

    // Process in gentle batches of 2 with 60ms delay
    const BATCH_SIZE = 2;
    for (let i = 0; i < sortedEntries.length; i += BATCH_SIZE) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) break;

      const batch = sortedEntries.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async ([catKey]) => {
          try {
            const url = getEnvSheetUrlForCategory(catKey);
            if (!url) return;
            const res = await syncQuestionsFromSheet(url, catKey);
            if (res.success && res.count > 0) {
              totalQuestions += res.count;
              syncedCategories++;
              totalUpdated += res.updated || 0;
              totalAdded += res.added || 0;
            }
          } catch {
            // continue next category
          }
        })
      );

      if (onProgress) {
        onProgress(Math.min(i + BATCH_SIZE, total), total);
      }

      // Small yield to keep main thread smooth and responsive
      await new Promise(resolve => setTimeout(resolve, 60));
    }

    try {
      localStorage.setItem('gkoo_last_full_sync_time', Date.now().toString());
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, Date.now().toString());
    } catch { }

    window.dispatchEvent(new Event('gkoo_sheet_synced'));

    return {
      success: syncedCategories > 0,
      totalQuestions,
      syncedCategories,
      updatedRows: totalUpdated,
      addedRows: totalAdded
    };
  } finally {
    isSyncingAllInProgress = false;
  }
}

/**
 * Smart Lightweight Auto-Sync:
 * 1. On App Open: Checks ONLY the user's currently active category.
 *    If no changes occurred in Google Sheets, it exits in 2ms without heavy load!
 * 2. If any rows were edited in Google Sheets, it updates them directly at their exact place.
 * 3. 2x Daily (every 12 hours): Runs an ultra-gentle background delta check across other sheets.
 */
export async function triggerSmartAutoSync(isAppOpenEvent: boolean = false): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    const lastSyncRaw = localStorage.getItem('gkoo_last_full_sync_time') || localStorage.getItem(STORAGE_KEY_LAST_SYNC);
    const lastSyncTime = lastSyncRaw ? parseInt(lastSyncRaw, 10) : 0;
    const now = Date.now();
    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 2 times a day schedule
    const isTwelveHoursElapsed = !lastSyncTime || (now - lastSyncTime >= TWELVE_HOURS_MS);

    if (isAppOpenEvent) {
      // 1. App-Open: Ultra-lightweight delta sync for ACTIVE CATEGORY ONLY (Zero heavy load!)
      const activeCat = (() => {
        try {
          const resume = localStorage.getItem('gkoo_resume_quiz_session');
          if (resume) {
            const p = JSON.parse(resume);
            if (p.levelCategory) return p.levelCategory;
          }
          const savedRegion = localStorage.getItem('gkoo_dashboard_region_mode');
          if (savedRegion === 'world') return 'sub_geography';
        } catch { }
        return 'ssc_cgl';
      })();

      console.log(`[SheetSync] App open: Checking delta changes for active category "${activeCat}"...`);
      const url = getEnvSheetUrlForCategory(activeCat);
      if (url) {
        await syncQuestionsFromSheet(url, activeCat);
      }
    } else {
      // 2. 2x Daily Schedule (every 12 hours): Background delta check with instant hash bypass
      if (isTwelveHoursElapsed) {
        console.log('[SheetSync] 12 hours elapsed (2x daily schedule), running gentle delta sync...');
        await syncAllCategoriesFromSheets();
      }
    }
  } catch (err) {
    console.warn('[SheetSync] Auto-sync skipped or interrupted:', err);
  }
}



