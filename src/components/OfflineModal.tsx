import React, { useState, useEffect } from 'react';
import { WifiOff, RotateCcw, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../useAppContext';
import { Mascot } from './Mascot';
import { triggerHaptic } from '../lib/audio';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelNumber?: number;
  categoryName?: string;
  onRetrySuccess?: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({
  isOpen,
  onClose,
  levelNumber,
  categoryName,
  onRetrySuccess,
}) => {
  const { lang, isOnline, hapticsEnabled } = useAppContext();
  const [isChecking, setIsChecking] = useState(false);
  const [retryStatus, setRetryStatus] = useState<'idle' | 'still_offline' | 'connected'>('idle');

  // Reset retry status when modal opens
  useEffect(() => {
    if (isOpen) {
      setRetryStatus('idle');
      setIsChecking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckConnection = () => {
    triggerHaptic('click', hapticsEnabled);
    setIsChecking(true);
    setRetryStatus('idle');

    setTimeout(() => {
      const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : isOnline;
      setIsChecking(false);
      if (onlineNow) {
        setRetryStatus('connected');
        triggerHaptic('success', hapticsEnabled);
        setTimeout(() => {
          if (onRetrySuccess) {
            onRetrySuccess();
          } else {
            onClose();
          }
        }, 1200);
      } else {
        setRetryStatus('still_offline');
        triggerHaptic('error', hapticsEnabled);
      }
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          className="bg-white dark:bg-[#1A1A24] border-2 border-amber-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden text-left"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top Mascot / Offline Graphic */}
          <div className="flex flex-col items-center mb-3">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <WifiOff className="w-8 h-8 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-1">
              <Mascot size="sm" mood="sad" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-gray-900 dark:text-white text-center leading-tight mb-2">
            {lang === 'hi' ? 'इंटरनेट कनेक्शन नहीं है!' : "You're Offline!"}
          </h3>

          {/* Explanation */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3.5 mb-4 text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
            {levelNumber ? (
              <p>
                {lang === 'hi' ? (
                  <>
                    लेवल <strong>{levelNumber}</strong> {categoryName ? `(${categoryName})` : ''} अभी तक <span className="text-rose-500 dark:text-rose-400 font-bold">पास नहीं हुआ है</span>।
                  </>
                ) : (
                  <>
                    Level <strong>{levelNumber}</strong> {categoryName ? `(${categoryName})` : ''} has <span className="text-rose-500 dark:text-rose-400 font-bold">not been completed</span> yet.
                  </>
                )}
              </p>
            ) : null}

            <p>
              {lang === 'hi' ? (
                <>
                  📡 <strong>ऑफ़लाइन नियम:</strong> आप बिना इंटरनेट के केवल वही लेवल्स खेल सकते हैं जो आप <span className="text-emerald-600 dark:text-emerald-400 font-bold">पहले पास कर चुके हैं</span>।
                </>
              ) : (
                <>
                  📡 <strong>Offline Rule:</strong> While offline, you can only replay levels you have <span className="text-emerald-600 dark:text-emerald-400 font-bold">already completed</span>.
                </>
              )}
            </p>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {lang === 'hi'
                ? 'नया लेवल शुरू करने या पहली बार सवाल लोड करने के लिए कृपया इंटरनेट कनेक्ट करें।'
                : 'Please connect to the internet to unlock and download questions for new levels.'}
            </p>
          </div>

          {/* Dynamic Retry Feedback */}
          {retryStatus === 'still_offline' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold p-2.5 rounded-xl text-center mb-3"
            >
              {lang === 'hi' ? '⚠️ अभी भी इंटरनेट बंद है! कृपया डेटा या Wi-Fi चालू करें।' : '⚠️ Still offline! Please enable Mobile Data or Wi-Fi.'}
            </motion.div>
          )}

          {retryStatus === 'connected' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-bold p-2.5 rounded-xl text-center mb-3 flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'hi' ? '✅ इंटरनेट कनेक्ट हो गया! शुरू हो रहा है...' : '✅ Connected! Loading level...'}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Retry Button */}
            <button
              onClick={handleCheckConnection}
              disabled={isChecking}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-[0_4px_0_0_#B45309] active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-60"
            >
              <RotateCcw className={`w-4 h-4 stroke-[2.5] ${isChecking ? 'animate-spin' : ''}`} />
              <span>
                {isChecking
                  ? (lang === 'hi' ? 'जाँच हो रही है...' : 'Checking...')
                  : (lang === 'hi' ? 'इंटरनेट दोबारा जाँचें (Retry)' : 'Retry Connection')}
              </span>
            </button>

            {/* Back to Completed Levels */}
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121217] text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center justify-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-98 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? 'पास किए हुए लेवल्स खेलें' : 'Play Completed Levels'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
