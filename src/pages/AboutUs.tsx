import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart, Trophy, Code } from 'lucide-react';
import { GkooBirdAvatar } from '../components/Mascot';
import { useAppContext } from '../useAppContext';

export default function AboutUs() {
  const navigate = useNavigate();
  const { lang } = useAppContext();

  return (
    <div className="min-h-screen bg-[#FCF9F7] dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 font-sans px-4 pt-[max(env(safe-area-inset-top,0px),24px)] pb-24 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-[#FF5F6D]" />
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'hi' ? 'Gkoo के बारे में (About Us)' : 'About Gkoo'}
          </h1>
        </div>
      </div>

      {/* Hero Mascot Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-tr from-[#FF5F6D]/20 via-[#FF7B7B]/15 to-amber-300/20 dark:from-rose-950/50 dark:to-amber-950/30 border-2 border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 mb-6 text-center relative overflow-hidden"
      >
        <div className="w-24 h-24 mx-auto mb-3 relative">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="w-full h-full drop-shadow-xl"
          >
            <GkooBirdAvatar size="lg" mood="celebrate" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Gkoo</h2>
        <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-1 uppercase tracking-wider">
          ज्ञान का नया अंदाज़ • Gamified AI Learning Adventure
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-300 max-w-md mx-auto mt-2 leading-relaxed">
          {lang === 'hi'
            ? 'हमारा मिशन सामान्य ज्ञान और पढ़ाई को एक रोमांचक, मजेदार और रिवार्डिंग गेम बनाना है!'
            : 'Our mission is to turn daily general knowledge practice into an addictive, rewarding, and fun learning game!'}
        </p>
      </motion.div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-[#FF5F6D]" />
          </div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">
            {lang === 'hi' ? 'इंटरैक्टिव गेमिफिकेशन' : 'Interactive Gamification'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            {lang === 'hi'
              ? 'स्ट्रीक्स, हार्ट्स, कॉम्बो बूस्ट और एक्सपी (XP) प्रोग्रेशन से आपकी निरंतरता बनी रहती है।'
              : 'Streaks, hearts, XP rankings, and level maps motivate learners to stay consistent every day.'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">
            {lang === 'hi' ? 'स्मार्ट AI क्विज़ इंजन' : 'Smart AI Quiz Engine'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
            {lang === 'hi'
              ? 'Google Gemini AI द्वारा संचालित असीमित ताज़ा प्रश्न और तथ्य स्पष्टीकरण।'
              : 'Powered by advanced AI for limitless real-time questions, difficulty scaling, and rich explanations.'}
          </p>
        </div>
      </div>

      {/* Creator Info & Team */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
            <Code className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white">
              Developed with ❤️ by Global Score Analytics
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Founder & Lead Creator: Mohd Shahim
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-2 text-xs font-bold text-gray-500">
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full">React 19</span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full">TypeScript</span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full">Tailwind CSS</span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-900 rounded-full">Capacitor Android &amp; Windows PWA</span>
        </div>
      </div>

      {/* Official Government Disclaimer & Sources */}
      <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/40 dark:border-amber-800/40 rounded-3xl p-5 shadow-sm text-xs leading-relaxed space-y-2.5">
        <h3 className="font-black text-amber-900 dark:text-amber-200 text-sm">
          ⚖️ {lang === 'hi' ? 'सरकारी संस्था अस्वीकरण (Disclaimer)' : 'Government Entity Disclaimer'}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          {lang === 'hi'
            ? 'Gkoo एक स्वतंत्र शैक्षणिक क्विज़ और लर्निंग ऐप है। Gkoo किसी भी सरकारी संस्था, मंत्रालय या परीक्षा बोर्ड (जैसे UPSC, SSC, IBPS, Railways) से संबद्ध या अधिकृत नहीं है।'
            : 'Gkoo is an independent educational quiz platform and is NOT affiliated with, endorsed by, or representing any government entity or exam conducting board.'}
        </p>
        <p className="font-bold text-gray-800 dark:text-gray-200 pt-1">
          {lang === 'hi' ? 'आधिकारिक सरकारी परीक्षा पोर्टल:' : 'Official Exam Portals & Sources:'}
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
          <li>UPSC: <a href="https://upsc.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">https://upsc.gov.in</a></li>
          <li>SSC: <a href="https://ssc.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">https://ssc.gov.in</a></li>
          <li>Indian Railways: <a href="https://indianrailways.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">https://indianrailways.gov.in</a></li>
          <li>IBPS: <a href="https://www.ibps.in" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">https://www.ibps.in</a></li>
        </ul>
      </div>
    </div>
  );
}
