import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, UserCheck, HelpCircle } from 'lucide-react';
import { GkooBirdAvatar } from '../components/Mascot';
import { useAppContext } from '../useAppContext';

export default function PrivacyPolicy() {
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
          <ShieldCheck className="w-6 h-6 text-[#FF5F6D]" />
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
          </h1>
        </div>
      </div>

      {/* Mascot Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-emerald-500/10 dark:from-rose-950/40 dark:to-emerald-950/40 border border-rose-200/50 dark:border-rose-900/40 rounded-3xl p-5 mb-6 flex items-center space-x-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 p-1 shrink-0 shadow-md flex items-center justify-center">
          <GkooBirdAvatar size="sm" mood="happy" />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">
            {lang === 'hi' ? 'आपकी प्राइवेसी हमारी प्राथमिकता है' : 'Your Privacy is 100% Protected'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-0.5">
            {lang === 'hi'
              ? 'G-koo में आपका डेटा सुरक्षित है। हम कोई भी संवेदनशील डेटा तीसरे पक्ष को नहीं बेचते।'
              : 'G-koo is safe, transparent, and educational. We never sell your personal data.'}
          </p>
        </div>
      </motion.div>

      {/* Main Content Sections */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <section>
          <div className="flex items-center space-x-2 mb-2">
            <UserCheck className="w-4 h-4 text-[#FF5F6D]" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              1. Information We Collect (डेटा संग्रह)
            </h2>
          </div>
          <p>
            • <strong>Guest Mode:</strong> You can use G-koo entirely as a guest without creating an account. In this mode, all quiz streaks, progress, XP, and gems are stored locally on your device storage (LocalStorage/IndexedDB).
          </p>
          <p className="mt-2">
            • <strong>Signed-in Accounts:</strong> If you choose to sign in via Google Sign-In or email, we only access your basic public profile (name, email address, and avatar) to sync your progress, streak, and leaderboard rankings across devices.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              2. How We Use Information (डेटा का उपयोग)
            </h2>
          </div>
          <p>
            We use your data solely for educational and gamified purposes:
          </p>
          <ul className="list-disc pl-5 mt-1.5 space-x-0 space-y-1">
            <li>To display your current learning level, streak, and quiz scores.</li>
            <li>To generate dynamic and customized AI quiz questions matching your chosen category.</li>
            <li>To manage global leaderboard scores and streak rewards.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <EyeOff className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              3. Data Sharing & Security (सुरक्षा एवं गोपनीयता)
            </h2>
          </div>
          <p>
            • <strong>Zero Data Selling:</strong> We do NOT sell, lease, or monetize your personal information to third-party advertisers or data brokers.
          </p>
          <p className="mt-1.5">
            • <strong>Secure HTTPS Encryption:</strong> All network requests are encrypted using industry-standard SSL/TLS (HTTPS) protocols.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              4. Children's Privacy (बच्चों की सुरक्षा)
            </h2>
          </div>
          <p>
            G-koo is an educational trivia and general knowledge platform designed for learners of all ages. We comply with COPPA and Google Play Families guidelines, and do not track or collect personal information from underage users without consent.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              5. Contact Us (संपर्क करें)
            </h2>
          </div>
          <p>
            If you have questions regarding this Privacy Policy or wish to delete your account data, please reach out to:
          </p>
          <div className="mt-2 p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl font-mono text-xs text-[#FF5F6D] font-bold">
            gkoosupport@gmail.com • Global Score Analytics
          </div>
        </section>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-center">
          Last Updated: September 2026 • G-koo Learning Platform
        </div>
      </div>
    </div>
  );
}
