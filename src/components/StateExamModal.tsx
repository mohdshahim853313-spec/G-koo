import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALL_INDIA_STATES, type StateData, type StateExamItem } from '../data/stateExamsData';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';
import { 
  getPinnedStateIds, 
  getPinnedExamIds, 
  togglePinState, 
  togglePinExam, 
  PIN_EVENT_NAME 
} from '../utils/pinnedExams';
import { 
  X, 
  Search, 
  ChevronRight, 
  ArrowLeft, 
  Play, 
  Pin
} from 'lucide-react';

interface StateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStateId?: string | null;
}

export const StateExamModal: React.FC<StateExamModalProps> = ({ 
  isOpen, 
  onClose,
  initialStateId = null 
}) => {
  const { lang } = useAppContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [pinnedStates, setPinnedStates] = useState<string[]>([]);
  const [pinnedExams, setPinnedExams] = useState<string[]>([]);

  // Sync pinned list on mount & when changed
  useEffect(() => {
    const syncPinned = () => {
      setPinnedStates(getPinnedStateIds());
      setPinnedExams(getPinnedExamIds());
    };
    syncPinned();
    window.addEventListener(PIN_EVENT_NAME, syncPinned);
    return () => window.removeEventListener(PIN_EVENT_NAME, syncPinned);
  }, []);

  // Handle initial state if passed
  useEffect(() => {
    if (isOpen && initialStateId) {
      const st = ALL_INDIA_STATES.find(s => s.id === initialStateId);
      if (st) setSelectedState(st);
    } else if (!isOpen) {
      setSelectedState(null);
      setSearchQuery('');
    }
  }, [isOpen, initialStateId]);

  // Filter states by search query
  const filteredStates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return ALL_INDIA_STATES;
    return ALL_INDIA_STATES.filter(st => {
      const nameMatch = st.nameEn.toLowerCase().includes(q) || st.nameHi.toLowerCase().includes(q);
      const examMatch = st.exams.some(e => 
        e.nameEn.toLowerCase().includes(q) || 
        e.nameHi.toLowerCase().includes(q) || 
        e.shortName.toLowerCase().includes(q)
      );
      return nameMatch || examMatch;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleToggleStatePin = (e: React.MouseEvent, stateId: string) => {
    e.stopPropagation();
    triggerHaptic('click');
    togglePinState(stateId);
  };

  const handleToggleExamPin = (e: React.MouseEvent, examId: string) => {
    e.stopPropagation();
    triggerHaptic('click');
    togglePinExam(examId);
  };

  const handleStartExamQuiz = (exam: StateExamItem, state: StateData) => {
    triggerHaptic('click');
    onClose();

    const topicParam = lang === 'hi' ? exam.syllabusTopicHi : exam.syllabusTopicEn;
    const promptParam = `Focus on authentic examination questions for ${exam.nameEn} (${state.nameEn}). Include state special GK, past year pattern questions, constitutional and factual topics.`;

    navigate(`/quiz/${exam.id}?topic=${encodeURIComponent(topicParam)}&prompt=${encodeURIComponent(promptParam)}&diff=${exam.difficulty}&count=15`);
  };

  const handleBackToStates = () => {
    triggerHaptic('click');
    setSelectedState(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white dark:bg-[#151B28] rounded-3xl max-w-2xl w-full max-h-[92vh] shadow-2xl border-2 border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 shrink-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {selectedState ? (
                <button
                  onClick={handleBackToStates}
                  className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-50 active:scale-95 transition-all shrink-0 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                  🏛️
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight truncate">
                    {selectedState
                      ? (lang === 'hi' ? `${selectedState.nameHi} प्रतियोगी परीक्षाएं` : `${selectedState.nameEn} Competitive Exams`)
                      : (lang === 'hi' ? '🇮🇳 सभी राज्य प्रतियोगी परीक्षाएं (All States)' : '🇮🇳 All India State Competitive Exams')}
                  </h3>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                  {selectedState
                    ? (lang === 'hi' ? `राजधानी: ${selectedState.capitalHi} • ${selectedState.exams.length} परीक्षाएं उपलब्ध • पिन करके होम पर लाएं` : `Capital: ${selectedState.capitalEn} • ${selectedState.exams.length} Exams • Pin to Home`)
                    : (lang === 'hi' ? 'राज्य चुनें या पिन 📌 करें ताकि यह सीधे आपके होम स्क्रीन पर दिखे' : 'Select or pin 📌 any state to display it directly on your Home screen')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors ml-2 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar (Only shown on States list view) */}
          {!selectedState && (
            <div className="p-3 sm:px-5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/70 dark:bg-gray-900/40 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'hi' ? 'राज्य या परीक्षा का नाम खोजें (उदा. UP Police, BPSC, RAS, MPPSC)...' : 'Search state or exam (e.g. UP Police, BPSC, RAS, MPPSC)...'}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-rose-500 transition-colors"
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
            </div>
          )}

          {/* Content Area */}
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 scrollbar-none space-y-3">
            {!selectedState ? (
              /* VIEW 1: STATES LIST / GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredStates.map((st) => {
                  const isPinned = pinnedStates.includes(st.id);

                  return (
                    <motion.div
                      key={st.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        triggerHaptic('click');
                        setSelectedState(st);
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 text-left group relative ${
                        isPinned
                          ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/30 dark:bg-amber-950/20 shadow-sm'
                          : 'border-gray-100 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-800/60 bg-white dark:bg-[#1A2232] shadow-xs hover:shadow-md'
                      }`}
                    >
                      {/* Left: Icon & Names */}
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-11 h-11 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                          {st.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <h4 className="font-black text-xs sm:text-sm text-gray-900 dark:text-white leading-tight">
                              {lang === 'hi' ? st.nameHi : st.nameEn}
                            </h4>
                            {isPinned && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-gray-950 shadow-2xs">
                                📌 {lang === 'hi' ? 'पिन' : 'Pinned'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate">
                            {st.exams.length} {lang === 'hi' ? 'परीक्षाएं' : 'Exams'} • {lang === 'hi' ? st.capitalHi : st.capitalEn}
                          </p>
                        </div>
                      </div>

                      {/* Right: Pin Toggle & Arrow */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {/* Pin Button */}
                        <button
                          type="button"
                          title={isPinned ? 'Unpin from Home' : 'Pin to Home'}
                          onClick={(e) => handleToggleStatePin(e, st.id)}
                          className={`p-2 rounded-xl transition-all active:scale-90 ${
                            isPinned
                              ? 'bg-amber-400 text-gray-950 shadow-xs ring-2 ring-amber-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          }`}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-gray-950 rotate-45' : ''}`} />
                        </button>

                        <div className="w-7 h-7 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredStates.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-3xl mb-2">🔍</p>
                    <p className="text-xs font-black text-gray-600 dark:text-gray-300">
                      {lang === 'hi' ? 'कोई राज्य या परीक्षा नहीं मिली' : 'No state or exam matched your search'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {lang === 'hi' ? 'कृपया कोई दूसरा शब्द खोजें' : 'Try searching with a different state name'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* VIEW 2: SELECTED STATE'S COMPETITIVE EXAMS */
              <div className="space-y-3">
                {/* State Overview Banner with State-level Pin toggle */}
                {(() => {
                  const isStatePinned = pinnedStates.includes(selectedState.id);

                  return (
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${selectedState.gradient} text-white shadow-md flex items-center justify-between gap-3 relative overflow-hidden`}>
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <span className="text-3xl bg-white/20 p-2 rounded-2xl shadow-inner shrink-0">
                          {selectedState.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-base font-black leading-tight drop-shadow-xs truncate">
                            {lang === 'hi' ? selectedState.nameHi : selectedState.nameEn}
                          </h4>
                          <p className="text-[11px] text-white/90 font-medium mt-0.5 truncate">
                            {lang === 'hi' ? `राजधानी: ${selectedState.capitalHi}` : `Capital: ${selectedState.capitalEn}`} • {selectedState.exams.length} State Exams
                          </p>
                        </div>
                      </div>

                      {/* State Pin Toggle */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatePin(e, selectedState.id)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all shrink-0 ${
                          isStatePinned
                            ? 'bg-amber-400 text-gray-950 border-2 border-yellow-200'
                            : 'bg-white/25 hover:bg-white/35 text-white border border-white/30'
                        }`}
                      >
                        <Pin className={`w-3.5 h-3.5 ${isStatePinned ? 'fill-gray-950 rotate-45' : ''}`} />
                        <span>{isStatePinned ? (lang === 'hi' ? 'पिन है 📌' : 'Pinned 📌') : (lang === 'hi' ? 'होम पर पिन करें' : 'Pin State')}</span>
                      </button>
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  {selectedState.exams.map((exam) => {
                    const isExamPinned = pinnedExams.includes(exam.id);

                    return (
                      <motion.div
                        key={exam.id}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-2xl border-2 transition-all bg-white dark:bg-[#1A2232] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${
                          isExamPinned
                            ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-400/40'
                            : 'border-gray-100 dark:border-gray-800 hover:border-amber-400 dark:hover:border-amber-600/60'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              {exam.badge}
                            </span>
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                              {exam.category}
                            </span>
                            {isExamPinned && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-gray-950 shadow-2xs">
                                📌 {lang === 'hi' ? 'होम पर पिन है' : 'Pinned to Home'}
                              </span>
                            )}
                          </div>

                          <h5 className="font-black text-sm text-gray-900 dark:text-white leading-tight">
                            {lang === 'hi' ? exam.nameHi : exam.nameEn}
                          </h5>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-snug line-clamp-2">
                            {lang === 'hi' ? exam.descHi : exam.descEn}
                          </p>
                        </div>

                        {/* Action buttons (Pin + Start Test) */}
                        <div className="flex items-center space-x-2 shrink-0 pt-1 sm:pt-0">
                          <button
                            type="button"
                            title={isExamPinned ? 'Unpin Exam' : 'Pin Exam to Home'}
                            onClick={(e) => handleToggleExamPin(e, exam.id)}
                            className={`p-2.5 rounded-xl font-bold text-xs flex items-center justify-center transition-all active:scale-90 ${
                              isExamPinned
                                ? 'bg-amber-400 text-gray-950 shadow-xs ring-2 ring-amber-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <Pin className={`w-4 h-4 ${isExamPinned ? 'fill-gray-950 rotate-45' : ''}`} />
                          </button>

                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleStartExamQuiz(exam, selectedState)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5F6D] to-rose-600 hover:from-rose-500 hover:to-rose-700 text-white font-black text-xs shadow-md border-b-2 border-rose-900 flex items-center justify-center space-x-1.5 shrink-0 active:scale-95 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{lang === 'hi' ? 'टेस्ट शुरू करें (15 Qs)' : 'Start Test (15 Qs)'}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/80 text-center text-[10px] font-bold text-gray-400 shrink-0">
            {lang === 'hi' 
              ? '💡 टिप: किसी भी राज्य या परीक्षा को 📌 पिन करें ताकि वह सीधे आपके होम स्क्रीन पर उपलब्ध रहे' 
              : '💡 Tip: Pin 📌 any state or exam to display it prominently on your Home screen'}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
