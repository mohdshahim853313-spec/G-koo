import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin } from 'lucide-react';
import { triggerHaptic } from '../lib/audio';

interface UnpinConfirmModalProps {
  isOpen: boolean;
  title: string;
  lang?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const UnpinConfirmModal: React.FC<UnpinConfirmModalProps> = ({
  isOpen,
  title,
  lang = 'hi',
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#151928] border-2 border-amber-400/40 dark:border-amber-500/30 rounded-3xl p-5 max-w-xs sm:max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Pin Icon Badge */}
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center text-amber-500 dark:text-amber-400 mb-3 shadow-inner">
            <Pin className="w-6 h-6 rotate-45 fill-current" />
          </div>

          {/* Heading */}
          <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-1.5">
            {lang === 'hi' ? 'होम से अनपिन करें?' : 'Unpin from Home?'}
          </h3>

          {/* Description */}
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed mb-5 px-1">
            {lang === 'hi' ? (
              <>
                क्या आप <strong className="text-gray-900 dark:text-white font-black">"{title}"</strong> को होम स्क्रीन से हटाना चाहते हैं?
              </>
            ) : (
              <>
                Remove <strong className="text-gray-900 dark:text-white font-black">"{title}"</strong> from your Home screen?
              </>
            )}
          </p>

          {/* Buttons: Cancel & Confirm */}
          <div className="flex items-center gap-2.5">
            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                triggerHaptic('click');
                onCancel();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition-colors cursor-pointer"
            >
              {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => {
                triggerHaptic('success');
                onConfirm();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              {lang === 'hi' ? 'हाँ, हटाएं' : 'Yes, Unpin'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

