import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../useAppContext';
import { triggerHaptic, playSound } from '../lib/audio';
import { X, Search, Trash2, Play, CheckCircle2 } from 'lucide-react';

interface SavedQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedQuestionsModal: React.FC<SavedQuestionsModalProps> = ({ isOpen, onClose }) => {
  const { lang, t, bookmarks, removeBookmark, clearAllBookmarks, soundEnabled, hapticsEnabled } = useAppContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredBookmarks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return bookmarks;
    return bookmarks.filter(b => 
      b.text.toLowerCase().includes(q) ||
      b.answer.toLowerCase().includes(q) ||
      (b.explanation && b.explanation.toLowerCase().includes(q)) ||
      (b.category && b.category.toLowerCase().includes(q))
    );
  }, [bookmarks, searchQuery]);

  if (!isOpen) return null;

  const handleStartPractice = () => {
    if (bookmarks.length === 0) return;
    triggerHaptic('success', hapticsEnabled);
    playSound('combo', soundEnabled);
    onClose();
    // Navigate to saved questions practice quiz mode
    navigate('/quiz/saved');
  };

  const handleRemoveSingle = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    triggerHaptic('click', hapticsEnabled);
    removeBookmark(id);
  };

  const handleClearAll = () => {
    triggerHaptic('error', hapticsEnabled);
    clearAllBookmarks();
    setShowClearConfirm(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="bg-white dark:bg-[#151B28] rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border-2 border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 shrink-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                ⭐
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight truncate">
                  {t('savedQuestionsTitle')}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                  {t('totalSaved', { count: bookmarks.length })}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('click');
                onClose();
              }}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="p-3.5 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30 flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'hi' ? 'सहेजे गए सवालों में खोजें...' : 'Search in saved questions...'}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A2234] border border-gray-200 dark:border-gray-700/80 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {bookmarks.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1 cursor-pointer"
                title={t('clearAllSaved')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">{lang === 'hi' ? 'सब हटाएं' : 'Clear'}</span>
              </button>
            )}
          </div>

          {/* Clear Confirmation Banner */}
          {showClearConfirm && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-200 shrink-0">
              <span>{t('clearSavedConfirm')}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[11px] cursor-pointer"
                >
                  {lang === 'hi' ? 'हाँ, हटाएं' : 'Yes, Clear'}
                </button>
              </div>
            </div>
          )}

          {/* Bookmarks List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3">
            {filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-3xl mb-3">
                  ⭐
                </div>
                <h4 className="text-base font-black text-gray-900 dark:text-white mb-1">
                  {lang === 'hi' ? 'कोई सहेजा गया सवाल नहीं मिला' : 'No Saved Questions Found'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs font-medium leading-relaxed">
                  {searchQuery
                    ? (lang === 'hi' ? 'आपकी खोज से मेल खाता कोई सवाल नहीं मिला।' : 'No questions match your search query.')
                    : t('noSavedQuestions')}
                </p>
              </div>
            ) : (
              filteredBookmarks.map((q, idx) => (
                <motion.div
                  key={q.id || idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-[#1A2234] border border-gray-200/90 dark:border-gray-700/70 p-4 rounded-2xl relative shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {q.category && (
                        <span className="inline-block text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                          {q.category}
                        </span>
                      )}
                      <h4 className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                        {q.text}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => handleRemoveSingle(e, q.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 cursor-pointer"
                      title={t('removeBookmark')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Correct Answer Pill */}
                  <div className="mt-2.5 flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-xl text-xs font-black text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{t('correctAnswer')}: {q.answer}</span>
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 mt-2 bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 leading-relaxed">
                      💡 <span className="font-bold">{t('explanation')}:</span> {q.explanation}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Footer Action Button */}
          {bookmarks.length > 0 && (
            <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#151B28] flex items-center gap-3 shrink-0">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs cursor-pointer"
              >
                {t('close')}
              </button>

              <motion.button
                whileTap={{ scale: 0.96, y: 1 }}
                onClick={handleStartPractice}
                className="flex-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-3 rounded-2xl text-xs shadow-[0_3px_0_0_#D97706] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{t('practiceSavedQuestions')} ({bookmarks.length})</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
