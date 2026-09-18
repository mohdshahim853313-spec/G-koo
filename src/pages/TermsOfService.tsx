import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, ShieldAlert, Scale } from 'lucide-react';
import { GkooBirdAvatar } from '../components/Mascot';
import { useAppContext } from '../useAppContext';

export default function TermsOfService() {
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
          <FileText className="w-6 h-6 text-[#FF5F6D]" />
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'hi' ? 'सेवा की शर्तें (Terms of Service)' : 'Terms of Service'}
          </h1>
        </div>
      </div>

      {/* Mascot Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 dark:from-amber-950/40 dark:to-indigo-950/40 border border-amber-200/50 dark:border-amber-900/40 rounded-3xl p-5 mb-6 flex items-center space-x-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 p-1 shrink-0 shadow-md flex items-center justify-center">
          <GkooBirdAvatar size="sm" mood="thinking" />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">
            {lang === 'hi' ? 'निष्पक्ष और सुरक्षित लर्निंग प्लेटफॉर्म' : 'Fair and Educational Platform Terms'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-0.5">
            {lang === 'hi'
              ? 'G-koo का उपयोग करके आप हमारी नियमों और शर्तों से सहमत होते हैं।'
              : 'By using G-koo, you agree to these standard educational terms and guidelines.'}
          </p>
        </div>
      </motion.div>

      {/* Main Content Sections */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/80 shadow-sm space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        <section>
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              1. Acceptance of Terms (शर्तों की स्वीकृति)
            </h2>
          </div>
          <p>
            By downloading, accessing, or using the G-koo application across Web, Android, or Windows platforms, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <Scale className="w-4 h-4 text-[#FF5F6D]" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              2. Educational Purpose & AI Generation (शैक्षणिक उद्देश्य)
            </h2>
          </div>
          <p>
            G-koo is created solely for educational trivia, learning enhancement, and general knowledge practice. While our AI engine and question curations strive for high accuracy, educational facts should always be cross-referenced for official government examinations.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              3. User Conduct & Fair Play (उचित उपयोग)
            </h2>
          </div>
          <p>
            Users agree not to exploit glitches, use unauthorized automation scripts/bots to manipulate leaderboards or XP, or attempt to reverse-engineer proprietary mascot assets.
          </p>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">
              4. Intellectual Property (बौद्धिक संपदा)
            </h2>
          </div>
          <p>
            All original illustrations, G-koo mascot designs, animations, sound presets, and UI layouts are the intellectual property of Global Score Analytics / G-koo Team.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-center">
          © 2026 G-koo Platform • All Rights Reserved
        </div>
      </div>
    </div>
  );
}
