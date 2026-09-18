import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send, CheckCircle2 } from 'lucide-react';
import { GkooBirdAvatar } from '../components/Mascot';
import { triggerHaptic, playSound } from '../lib/audio';
import { useAppContext } from '../useAppContext';

export default function ContactUs() {
  const navigate = useNavigate();
  const { lang } = useAppContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    triggerHaptic('success');
    playSound('complete');
    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(false);
    }, 3500);
  };

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
          <Mail className="w-6 h-6 text-[#FF5F6D]" />
          <h1 className="text-xl sm:text-2xl font-black">
            {lang === 'hi' ? 'संपर्क करें (Contact & Support)' : 'Contact & Support'}
          </h1>
        </div>
      </div>

      {/* Mascot Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-500/10 via-rose-500/10 to-blue-500/10 dark:from-emerald-950/40 dark:to-blue-950/40 border border-emerald-200/50 dark:border-emerald-900/40 rounded-3xl p-5 mb-6 flex items-center space-x-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 p-1 shrink-0 shadow-md flex items-center justify-center">
          <GkooBirdAvatar size="sm" mood={submitted ? 'celebrate' : 'happy'} />
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white">
            {lang === 'hi' ? 'हम आपकी मदद के लिए यहाँ हैं!' : 'We are always here to help!'}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-0.5">
            {lang === 'hi'
              ? 'सुझाव, फीडबैक या किसी भी सहायता के लिए हमें कभी भी मैसेज करें।'
              : 'Feel free to send us feedback, feature requests, or queries.'}
          </p>
        </div>
      </motion.div>

      {/* Contact Form Card */}
      <div className="bg-white dark:bg-gray-800/90 rounded-3xl p-6 border border-gray-200 dark:border-gray-700/80 shadow-sm">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-3xl mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              {lang === 'hi' ? 'मैसेज सफलता पूर्वक भेजा गया! 🎉' : 'Message Sent Successfully! 🎉'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lang === 'hi'
                ? 'हमारी टीम जल्द ही आपसे संपर्क करेगी।'
                : 'Thank you! Our support team will get back to you shortly.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                {lang === 'hi' ? 'आपका नाम (Name)' : 'Your Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5F6D]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                {lang === 'hi' ? 'ईमेल पता (Email) *' : 'Your Email *'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5F6D]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                {lang === 'hi' ? 'संदेश / फीडबैक (Message) *' : 'Message / Feedback *'}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={lang === 'hi' ? 'यहाँ अपना मैसेज लिखें...' : 'Type your message or query here...'}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5F6D] resize-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.96, y: 2 }}
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5F6D] to-[#E64553] text-white font-black text-sm shadow-[0_4px_0_0_#D93848] active:translate-y-1 active:shadow-none flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'hi' ? 'संदेश भेजें' : 'Send Message'}</span>
            </motion.button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          Direct Email: <span className="font-bold text-[#FF5F6D]">support@gkoo.app</span>
        </div>
      </div>
    </div>
  );
}
