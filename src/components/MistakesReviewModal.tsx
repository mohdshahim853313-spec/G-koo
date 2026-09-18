import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../useAppContext';
import { triggerHaptic, playSound } from '../lib/audio';
import { X, CheckCircle2, XCircle, RotateCcw, Star } from 'lucide-react';
import type { QuizQuestion } from '../lib/gemini';

export interface MistakeRecord {
  question: QuizQuestion;
  userAnswer: string;
}

interface MistakesReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: MistakeRecord[];
  onRetest: () => void;
}

export const MistakesReviewModal: React.FC<MistakesReviewModalProps> = ({
  isOpen,
  onClose,
  mistakes,
  onRetest,
}) => {
  const { lang, t, toggleBookmark, isBookmarked, soundEnabled, hapticsEnabled } = useAppContext();

  if (!isOpen) return null;

  const handleRetestClick = () => {
    triggerHaptic('click', hapticsEnabled);
    playSound('combo', soundEnabled);
    onRetest();
  };

  const handleBookmarkToggle = (e: React.MouseEvent, q: QuizQuestion) => {
    e.stopPropagation();
    triggerHaptic('success', hapticsEnabled);
    toggleBookmark(q);
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
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800/80 flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-amber-500/10 shrink-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5F6D] to-rose-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                📝
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white leading-tight truncate">
                  {t('mistakesNotebook')}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5 truncate">
                  {lang === 'hi' 
                    ? `${mistakes.length} गलत उत्तरों का विश्लेषण एवं स्पष्टीकरण` 
                    : `${mistakes.length} Incorrect Questions & Explanations`}
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

          {/* Mistakes Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
            {mistakes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-3xl mb-3">
                  🎉
                </div>
                <h4 className="text-base font-black text-gray-900 dark:text-white mb-1">
                  {t('flawlessNoMistakes')}
                </h4>
              </div>
            ) : (
              mistakes.map((m, idx) => {
                const bookmarked = isBookmarked(m.question.text);
                return (
                  <motion.div
                    key={m.question.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-[#1A2234] border border-gray-200/90 dark:border-gray-700/70 p-4 rounded-2xl relative shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="inline-block text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
                          {lang === 'hi' ? `सवाल #${idx + 1}` : `Question #${idx + 1}`}
                        </span>
                        <h4 className="text-sm font-black text-gray-900 dark:text-white leading-snug">
                          {m.question.text}
                        </h4>
                      </div>

                      {/* Bookmark toggle button */}
                      <button
                        onClick={(e) => handleBookmarkToggle(e, m.question)}
                        className={`p-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                          bookmarked
                            ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 text-amber-600'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-amber-500'
                        }`}
                        title={bookmarked ? t('removeBookmark') : t('bookmarkQuestion')}
                      >
                        <Star className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Options Breakdown: Wrong vs Right */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <div className="flex items-start space-x-2 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-2.5 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-300">
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-rose-600 block">{t('yourAnswer')}:</span>
                          <span>{m.userAnswer || (lang === 'hi' ? 'कोई विकल्प नहीं चुना' : 'Skipped / Timeout')}</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-2.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] uppercase font-black text-emerald-600 block">{t('correctAnswer')}:</span>
                          <span>{m.question.answer}</span>
                        </div>
                      </div>
                    </div>

                    {/* Educational Fact / Explanation */}
                    {m.question.explanation && (
                      <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 mt-2.5 bg-white/80 dark:bg-gray-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 leading-relaxed">
                        💡 <span className="font-bold">{t('explanation')}:</span> {m.question.explanation}
                      </p>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#151B28] flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-xs cursor-pointer"
            >
              {t('close')}
            </button>

            {mistakes.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.96, y: 1 }}
                onClick={handleRetestClick}
                className="flex-2 bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white font-black py-3 rounded-2xl text-xs shadow-[0_3px_0_0_#991B1B] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>{t('retestMistakes')} ({mistakes.length})</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
