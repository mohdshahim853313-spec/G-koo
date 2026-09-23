import { motion, AnimatePresence } from 'framer-motion';
import { Share2, CheckCircle, X } from 'lucide-react';
import { useAppContext } from '../useAppContext';
import { GkooBirdAvatar } from './Mascot';
import { triggerHaptic } from '../lib/audio';

export function AchievementCertificateModal({
  isOpen,
  onClose,
  title,
  categoryName,
  stars,
  accuracy,
  score,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  categoryName: string;
  stars: number;
  accuracy: number;
  score: number;
}) {
  const { profile, currentUser, isGuest, lang } = useAppContext();

  const userName = (!isGuest && currentUser?.name)
    ? currentUser.name
    : (profile.name && profile.name !== 'Guest Scholar' ? profile.name : (lang === 'hi' ? 'प्रतिभाशाली शिक्षार्थी' : 'Gkoo Scholar'));

  const handleShareWhatsApp = () => {
    triggerHaptic('click');
    const shareText = lang === 'hi'
      ? `🎓 मैंने Gkoo App पर "${title}" (${categoryName}) में शानदार प्रदर्शन किया!\n⭐ अर्जित सितारे: ${'⭐'.repeat(stars || 3)}\n🎯 सटीकता: ${accuracy}%\n🏆 कुल स्कोर: ${score} अंक\n\nआप भी भारत का सबसे लोकप्रिय क्विज ऐप खेलें 👉 https://gkoo.app`
      : `🎓 I achieved an outstanding score in "${title}" (${categoryName}) on Gkoo!\n⭐ Stars Earned: ${'⭐'.repeat(stars || 3)}\n🎯 Accuracy: ${accuracy}%\n🏆 Total Score: ${score} pts\n\nJoin the smartest learning quiz app 👉 https://gkoo.app`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Gkoo Achievement Certificate',
        text: shareText,
        url: 'https://gkoo.app'
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            className="w-full max-w-md bg-white dark:bg-[#151D2A] rounded-3xl border-4 border-amber-400 dark:border-amber-600 shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Card Content */}
            <div className="relative border-2 border-dashed border-amber-400/80 rounded-2xl p-5 bg-gradient-to-b from-amber-50/50 via-white to-orange-50/40 dark:from-gray-900/80 dark:to-gray-900/80 text-center">
              {/* Mascot Stamp */}
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-1 shadow-md">
                  <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <GkooBirdAvatar size="sm" />
                  </div>
                </div>
              </div>

              {/* Certificate Header */}
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">
                GKOO SCHOLAR ACADEMY
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
                {lang === 'hi' ? 'प्रशस्ति प्रमाण-पत्र' : 'Certificate of Excellence'}
              </h2>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {lang === 'hi' ? 'यह प्रमाणित किया जाता है कि' : 'This is proudly presented to'}
              </p>
              
              <div className="text-lg font-black text-orange-600 dark:text-orange-400 border-b-2 border-orange-300 dark:border-orange-700 pb-1 mx-4 mb-3">
                {userName}
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 px-2">
                {lang === 'hi'
                  ? `ने "${title}" (${categoryName}) में अपनी उत्कृष्ट योग्यता सिद्ध करते हुए यह मुकाम हासिल किया है।`
                  : `has demonstrated outstanding knowledge and mastery in "${title}" (${categoryName}).`}
              </p>

              {/* Metrics Badge Row */}
              <div className="grid grid-cols-3 gap-2 bg-amber-100/60 dark:bg-gray-800/80 rounded-xl p-2.5 mb-2">
                <div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    {lang === 'hi' ? 'सितारे' : 'Stars'}
                  </div>
                  <div className="text-sm font-black text-amber-600 flex items-center justify-center">
                    {'⭐'.repeat(stars || 1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    {lang === 'hi' ? 'सटीकता' : 'Accuracy'}
                  </div>
                  <div className="text-sm font-black text-emerald-600">
                    {accuracy}%
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    {lang === 'hi' ? 'स्कोर' : 'Score'}
                  </div>
                  <div className="text-sm font-black text-blue-600">
                    {score} XP
                  </div>
                </div>
              </div>

              {/* Verified Stamp */}
              <div className="flex items-center justify-center space-x-1 text-[10px] font-black text-amber-700 dark:text-amber-400 mt-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>OFFICIALLY VERIFIED BY GKOO</span>
              </div>
            </div>

            {/* Share CTA Button */}
            <div className="mt-4 space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShareWhatsApp}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-[0_4px_0_0_#065F46] border-b-2 border-emerald-900 flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>
                  {lang === 'hi'
                    ? 'व्हाट्सएप स्टेटस / दोस्तों से शेयर करें'
                    : 'Share Certificate on WhatsApp'}
                </span>
              </motion.button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
