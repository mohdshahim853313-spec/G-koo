import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Play, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';
import { useAppContext } from '../useAppContext';
import { triggerHaptic } from '../lib/audio';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onStay: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onStay,
  onConfirmExit,
}) => {
  const { lang, streak } = useAppContext();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="bg-white dark:bg-[#151928] border-2 border-rose-400/30 dark:border-rose-900/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Sad G-koo Mascot */}
          <div className="flex justify-center mb-2 relative">
            <Mascot size="md" mood="sad" interactive={false} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1.5 flex items-center justify-center space-x-1.5">
            <span>{lang === 'hi' ? 'G-koo छोड़ रहे हैं?' : 'Leaving G-koo?'}</span>
            <span className="text-xl">🥺</span>
          </h3>

          {/* Streak warning / encouragement message */}
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-relaxed mb-6 px-2">
            {lang === 'hi' ? (
              <>
                अपनी <strong>{streak} दिन की स्ट्रीक</strong> और नए ज्ञान को न छोड़ें! क्या आप वाकई बाहर जाना चाहते हैं?
              </>
            ) : (
              <>
                Don't break your <strong>{streak}-day learning streak</strong>! Are you sure you want to leave?
              </>
            )}
          </p>

          {/* Action Buttons */}
          <div className="space-y-2.5 w-full">
            {/* Primary Button: Keep Playing / Stay */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                triggerHaptic('success');
                onStay();
              }}
              className="w-full bg-gradient-to-r from-[#FF5F6D] via-[#FF7B7B] to-[#FF9F1A] text-white font-black py-3.5 px-4 rounded-2xl shadow-[0_4px_0_0_#D93848] active:translate-y-0.5 active:shadow-none transition-all text-xs flex items-center justify-center space-x-2 cursor-pointer border-b-2 border-[#D93848]"
            >
              <Play className="w-4 h-4 fill-white stroke-none" />
              <span className="whitespace-nowrap">
                {lang === 'hi' ? 'सीखते रहें (Stay in G-koo)' : 'Keep Learning (Stay)'}
              </span>
              <Sparkles className="w-4 h-4 text-amber-200" />
            </motion.button>

            {/* Secondary Button: Confirm Exit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                triggerHaptic('click');
                onConfirmExit();
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">
                {lang === 'hi' ? 'हाँ, ऐप से बाहर जाएं' : 'Yes, Exit App'}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
