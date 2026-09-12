import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALL_SUBJECTS_LIST } from '../data/subjectsData';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { X, Search, Play, Pin } from 'lucide-react';
import { 
  getPinnedSubjectIds, 
  togglePinSubject, 
  getSubjectPinRank,
  PINNED_SUBJECTS_EVENT 
} from '../utils/pinnedSubjects';

interface SubjectDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (catId: string) => void;
}

export const SubjectDirectoryModal: React.FC<SubjectDirectoryModalProps> = ({ isOpen, onClose, onSelectCategory }) => {
  const { lang, setActiveCategory, getCategoryMaxUnlocked } = useAppContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [, setPinnedIds] = useState<string[]>(() => getPinnedSubjectIds());

  useEffect(() => {
    const syncPinned = () => {
      setPinnedIds(getPinnedSubjectIds());
    };
    syncPinned();
    window.addEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    return () => {
      window.removeEventListener(PINNED_SUBJECTS_EVENT, syncPinned);
    };
  }, []);

  const categories = useMemo(() => {
    return [
      { id: 'all', labelEn: 'All Subjects', labelHi: 'सभी विषय' },
      { id: 'Science', labelEn: 'Science', labelHi: 'विज्ञान' },
      { id: 'Social Studies', labelEn: 'Social Studies', labelHi: 'सामाजिक विज्ञान' },
      { id: 'Language', labelEn: 'Languages', labelHi: 'भाषाएँ' },
      { id: 'Polity', labelEn: 'Polity & Civics', labelHi: 'संविधान व राजनीति' },
      { id: 'Quantitative', labelEn: 'Maths & Reasoning', labelHi: 'गणित व रीजनिंग' },
    ];
  }, []);

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_SUBJECTS_LIST.filter(sub => {
      const matchesSearch = !q || 
        sub.nameEn.toLowerCase().includes(q) || 
        sub.nameHi.toLowerCase().includes(q) || 
        sub.shortName.toLowerCase().includes(q) ||
        sub.descEn.toLowerCase().includes(q) ||
        sub.descHi.toLowerCase().includes(q);

      const matchesCat = selectedCategory === 'all' || 
        sub.category === selectedCategory || 
        (selectedCategory === 'Quantitative' && (sub.category === 'Quantitative' || sub.category === 'Aptitude'));

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleTogglePin = (e: React.MouseEvent, subId: string) => {
    e.stopPropagation();
    triggerHaptic('success');
    togglePinSubject(subId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white dark:bg-[#151B28] rounded-3xl max-w-3xl w-full max-h-[92vh] shadow-2xl border-2 border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 shrink-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                📚
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight truncate">
                  {lang === 'hi' ? '📖 सभी विषय एवं लाइव टेस्ट (All Subjects)' : '📖 All Academic & GK Subjects Directory'}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                  {lang === 'hi' 
                    ? 'पिन (📌) बटन दबाएं और विषय अपने आप 1st, 2nd, 3rd, 4th बॉक्स में सेट हो जाएगा' 
                    : 'Tap Pin (📌) on any subject to auto-assign as 1st, 2nd, 3rd or 4th Home box'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors ml-2 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="p-3 sm:px-5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/70 dark:bg-gray-900/40 space-y-2.5 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'hi' ? 'विषय खोजें (उदा. Physics, English, Math, Hindi, History)...' : 'Search subject (e.g. Physics, English, Maths, Civics, Biology)...'}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    triggerHaptic('click');
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-black whitespace-nowrap transition-all select-none cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {lang === 'hi' ? cat.labelHi : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 scrollbar-none space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {filteredSubjects.map((sub) => {
                const rank = getSubjectPinRank(sub.id);
                const isPinned = rank > 0;

                return (
                  <motion.div
                    key={sub.id}
                    whileHover={{ scale: 1.02 }}
                    className={`perf-card bg-gradient-to-br ${sub.gradient} text-white rounded-3xl p-4 shadow-md ${sub.border3d} flex flex-col justify-between group relative overflow-hidden text-left`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-1">
                        <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform shrink-0">
                          {sub.icon}
                        </div>
                        
                        <div className="flex items-center space-x-1.5">
                          {isPinned && (
                            <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1 shrink-0 animate-pulse">
                              <Pin className="w-2.5 h-2.5 fill-amber-950 stroke-none inline" />
                              <span>{rank === 1 ? '1st Pin' : rank === 2 ? '2nd Pin' : rank === 3 ? '3rd Pin' : '4th Pin'}</span>
                            </span>
                          )}
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${sub.badgeBg} shadow-xs whitespace-nowrap shrink-0`}>
                            {sub.badge}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-white leading-tight mb-1 drop-shadow-md">
                        {lang === 'hi' ? sub.nameHi : sub.nameEn}
                      </h4>
                      <p className="text-[11px] text-white/90 font-medium leading-snug line-clamp-2 drop-shadow-xs">
                        {lang === 'hi' ? sub.descHi : sub.descEn}
                      </p>
                    </div>

                    {/* Action Row: Pin Button + Start Level Button */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/20 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleTogglePin(e, sub.id)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs ${
                          isPinned
                            ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-200 hover:bg-amber-300'
                            : 'bg-black/30 hover:bg-white hover:text-gray-900 text-white border border-white/25'
                        }`}
                        title={isPinned ? (lang === 'hi' ? 'अनपिन करने के लिए क्लिक करें' : 'Click to unpin') : (lang === 'hi' ? 'होम स्क्रीन पर पिन करें' : 'Pin to Home Screen')}
                      >
                        <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-950 stroke-none' : 'stroke-[2.5]'}`} />
                        <span>{isPinned ? (rank === 1 ? '1st Pin ✓' : rank === 2 ? '2nd Pin ✓' : rank === 3 ? '3rd Pin ✓' : '4th Pin ✓') : (lang === 'hi' ? 'पिन करें' : 'Pin')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('click');
                          onClose();
                          if (onSelectCategory) {
                            onSelectCategory(sub.id);
                          } else {
                            setActiveCategory(sub.id);
                            const maxLvl = getCategoryMaxUnlocked(sub.id);
                            navigate(`/quiz/level-${sub.id}-${maxLvl}`);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white text-gray-900 font-black text-xs shadow-xs hover:bg-yellow-300 transition-colors flex items-center space-x-1 shrink-0 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-gray-900" />
                        <span>{lang === 'hi' ? `Lvl ${getCategoryMaxUnlocked(sub.id)} खेलें` : `Play Lvl ${getCategoryMaxUnlocked(sub.id)}`}</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {filteredSubjects.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p className="text-3xl mb-2">🔍</p>
                  <p className="text-xs font-black text-gray-600 dark:text-gray-300">
                    {lang === 'hi' ? 'कोई विषय नहीं मिला' : 'No subject matched your search'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {lang === 'hi' ? 'कृपया कोई दूसरा विषय खोजें' : 'Try searching with a different subject keyword'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 text-center text-[10px] font-bold text-gray-400 shrink-0">
            {lang === 'hi' 
              ? '✨ आप अधिकतम 4 विषय पिन कर सकते हैं जो होम स्क्रीन के 4 मुख्य बॉक्स को स्वतः बदल देंगे' 
              : '✨ You can pin up to 4 subjects which will automatically replace the 4 Home Screen boxes'}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
