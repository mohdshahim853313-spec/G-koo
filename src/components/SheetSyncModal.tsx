import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Copy, Check, FileSpreadsheet, Upload, Trash2, HelpCircle, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { 
  syncQuestionsFromSheet, 
  syncAllCategoriesFromSheets,
  importQuestionsFromCsvText, 
  getAllSyncedQuestions, 
  getSheetSyncStats, 
  getSheetSyncUrl, 
  setSheetSyncUrl, 
  clearSyncedQuestions,
  DEFAULT_SHEET_TEMPLATE_URL 
} from '../lib/sheetSync';
import { triggerHaptic } from '../lib/audio';
import type { QuizQuestion } from '../lib/gemini';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'hi' | 'en';
}

export function SheetSyncModal({ isOpen, onClose, lang = 'hi' }: SheetSyncModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'preview'>('url');
  const [sheetUrlInput, setSheetUrlInput] = useState<string>(() => getSheetSyncUrl());
  const [pastedCsv, setPastedCsv] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [syncedList, setSyncedList] = useState<QuizQuestion[]>(() => getAllSyncedQuestions());
  const [syncStats, setSyncStats] = useState(() => getSheetSyncStats());

  useEffect(() => {
    if (isOpen) {
      setSheetUrlInput(getSheetSyncUrl());
      setSyncedList(getAllSyncedQuestions());
      setSyncStats(getSheetSyncStats());
      setStatusMessage(null);
    }
  }, [isOpen]);

  const handleSyncFromUrl = async () => {
    if (!sheetUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: lang === 'hi' ? 'कृपया एक वैध Google Sheet लिंक दर्ज करें' : 'Please enter a valid Google Sheet link' });
      return;
    }

    triggerHaptic('click');
    setIsLoading(true);
    setStatusMessage(null);

    const result = await syncQuestionsFromSheet(sheetUrlInput.trim());
    setIsLoading(false);

    if (result.success) {
      triggerHaptic('success');
      setStatusMessage({ type: 'success', text: result.message });
      setSyncedList(getAllSyncedQuestions());
      setSyncStats(getSheetSyncStats());
      setActiveTab('preview');
    } else {
      triggerHaptic('error');
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const [syncProgress, setSyncProgress] = useState<string | null>(null);

  const handleSyncAll = async () => {
    triggerHaptic('click');
    setIsLoading(true);
    setStatusMessage(null);
    setSyncProgress(lang === 'hi' ? 'सभी 26 विषयों से कनेक्ट हो रहा है...' : 'Connecting all 26 sheets...');

    const result = await syncAllCategoriesFromSheets((synced, total) => {
      setSyncProgress(lang === 'hi' ? `सिंक जारी: ${synced} / ${total} विषय...` : `Syncing: ${synced} / ${total} subjects...`);
    });

    setIsLoading(false);
    setSyncProgress(null);

    if (result.success) {
      triggerHaptic('success');
      let msg = '';
      if (result.updatedRows > 0 || result.addedRows > 0) {
        msg = lang === 'hi'
          ? `शानदार! ${result.updatedRows} प्रश्न सही स्थान पर अपडेट हुए, ${result.addedRows} नए प्रश्न जोड़े गए!`
          : `Success! ${result.updatedRows} questions updated in-place, ${result.addedRows} new questions added!`;
      } else {
        msg = lang === 'hi'
          ? `सभी ${result.syncedCategories} विषय पहले से पूरी तरह अप-टू-डेट हैं (कोई बदलाव नहीं था)!`
          : `All ${result.syncedCategories} subjects are already 100% up-to-date!`;
      }

      setStatusMessage({ 
        type: 'success', 
        text: msg
      });
      setSyncedList(getAllSyncedQuestions());
      setSyncStats(getSheetSyncStats());
      setActiveTab('preview');
    } else {
      triggerHaptic('error');
      setStatusMessage({ 
        type: 'error', 
        text: lang === 'hi' 
          ? 'सिंक नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें।' 
          : 'Sync failed. Please check internet connection.' 
      });
    }
  };

  const handleImportPasted = () => {
    if (!pastedCsv.trim()) {
      setStatusMessage({ type: 'error', text: lang === 'hi' ? 'कृपया CSV डेटा पेस्ट करें' : 'Please paste CSV content' });
      return;
    }

    triggerHaptic('click');
    const result = importQuestionsFromCsvText(pastedCsv.trim());

    if (result.success) {
      triggerHaptic('success');
      setStatusMessage({ 
        type: 'success', 
        text: lang === 'hi' ? `सफलतापूर्वक ${result.count} प्रश्न इंपोर्ट किए गए!` : `Successfully imported ${result.count} questions!` 
      });
      setPastedCsv('');
      setSyncedList(getAllSyncedQuestions());
      setSyncStats(getSheetSyncStats());
    } else {
      triggerHaptic('error');
      setStatusMessage({ type: 'error', text: result.error || 'इंपोर्ट विफल रहा' });
    }
  };

  const handleCopyTemplate = () => {
    triggerHaptic('click');
    navigator.clipboard.writeText(DEFAULT_SHEET_TEMPLATE_URL);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleClear = () => {
    triggerHaptic('click');
    if (confirm(lang === 'hi' ? 'क्या आप सभी सिंक किए गए प्रश्न हटाना चाहते हैं?' : 'Clear all synced questions?')) {
      clearSyncedQuestions();
      setSyncedList([]);
      setSyncStats(getSheetSyncStats());
      setStatusMessage({ type: 'success', text: lang === 'hi' ? 'प्रश्न साफ कर दिए गए' : 'Cleared synced questions' });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#1A1A24] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
                  {lang === 'hi' ? 'Google Sheets लाइव प्रश्न सिंक' : 'Google Sheets Live Question Sync'}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {lang === 'hi' ? 'बिना ऐप अपडेट के नए सवाल तुरंत जोड़ें' : 'Add new questions instantly without app updates'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-1.5 gap-1 shrink-0 text-xs font-black">
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span>🔗 Google Sheet Link</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span>✍️ Paste / Upload CSV</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <span>📑 Saved ({syncedList.length})</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-left">
            {/* Status Alert Banner */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-2xl text-xs font-bold flex items-start space-x-2 border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="flex-1">{statusMessage.text}</span>
              </motion.div>
            )}

            {/* TAB 1: GOOGLE SHEET LINK AUTO-SYNC */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                {/* Step-by-Step Instructions */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'hi' ? '3 आसान स्टेप्स में Google Sheet जोड़ें:' : 'How it works in 3 easy steps:'}</span>
                  </div>
                  <ol className="text-[11px] text-gray-700 dark:text-gray-300 font-medium space-y-1 list-decimal list-inside pl-1">
                    <li>
                      {lang === 'hi' 
                        ? 'हमारा रेडीमेड टेम्पलेट कॉपी करें या अपनी शीट में कॉलम (Category, Question, Option A, Option B, Option C, Option D, Answer, Explanation, Exam Tag) बनाएं।'
                        : 'Make a copy of our template or create columns: Category, Question, Options, Answer.'}
                    </li>
                    <li>
                      {lang === 'hi'
                        ? 'Google Sheet में File ➔ Share ➔ "Publish to Web" (or Anyone with link) करें।'
                        : 'In Google Sheet, click File ➔ Share ➔ "Publish to Web".'}
                    </li>
                    <li>
                      {lang === 'hi' ? 'उसका लिंक नीचे पेस्ट करके "सिंक करें" पर क्लिक करें।' : 'Paste link below and click Sync Now.'}
                    </li>
                  </ol>

                  {/* Copy Template Button */}
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={handleCopyTemplate}
                      className="w-full bg-white dark:bg-gray-800 hover:bg-emerald-100 dark:hover:bg-gray-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>
                        {copiedTemplate 
                          ? (lang === 'hi' ? 'टेम्पलेट लिंक कॉपी हो गया!' : 'Template Link Copied!') 
                          : (lang === 'hi' ? '📋 रेडीमेड Google Sheet टेम्पलेट लिंक कॉपी करें' : '📋 Copy Ready-made Template Link')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <label className="text-xs font-black text-gray-700 dark:text-gray-300 block mb-1.5">
                    {lang === 'hi' ? 'आपकी Google Sheet का लिंक (URL):' : 'Your Google Sheet URL:'}
                  </label>
                  <input
                    type="url"
                    value={sheetUrlInput}
                    onChange={(e) => {
                      setSheetUrlInput(e.target.value);
                      setSheetSyncUrl(e.target.value);
                    }}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                {/* Sync Action Button */}
                <button
                  type="button"
                  disabled={isLoading || !sheetUrlInput.trim()}
                  onClick={handleSyncFromUrl}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
                    isLoading || !sheetUrlInput.trim()
                      ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:translate-y-0.5 shadow-[0_4px_0_0_#065F46] cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {isLoading && !syncProgress
                      ? (lang === 'hi' ? 'Google Sheet से सिंक हो रहा है...' : 'Syncing from Google Sheet...') 
                      : (lang === 'hi' ? '🔄 यह शीट सिंक करें' : '🔄 Sync This Sheet')}
                  </span>
                </button>

                {/* Sync All 26 Categories Button */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleSyncAll}
                  className={`w-full py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 border transition-all ${
                    isLoading
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60 shadow-xs cursor-pointer active:scale-98'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncProgress ? 'animate-spin' : ''}`} />
                  <span>
                    {syncProgress || (lang === 'hi' ? '⚡ सभी 26 विषय एक साथ सिंक करें (Sync All)' : '⚡ Sync All 26 Subjects')}
                  </span>
                </button>

                {/* Auto Sync Info Banner */}
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-200 font-semibold leading-relaxed flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {lang === 'hi' 
                      ? '⚡ ऑटो-सिंक सक्रिय है: जब भी आप ऐप खोलेंगे और दिन में 2 बार (हर 12 घंटे), बैकग्राउंड में सभी सवाल अपने आप Google Sheet से सिंक हो जाएंगे!'
                      : '⚡ Auto-Sync Active: All questions automatically sync from Google Sheets on app open and twice daily (every 12 hours) in background!'}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: DIRECT CSV PASTE */}
            {activeTab === 'paste' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {lang === 'hi'
                    ? 'अगर आप लिंक नहीं डालना चाहते, तो अपनी Excel या Google Sheet से पंक्तियों (rows) को कॉपी करके सीधे यहाँ पेस्ट कर सकते हैं:'
                    : 'Paste CSV rows directly from Excel or Google Sheets:'}
                </p>

                <textarea
                  rows={7}
                  value={pastedCsv}
                  onChange={(e) => setPastedCsv(e.target.value)}
                  placeholder="Category, Question, Option A, Option B, Option C, Option D, Answer, Explanation, Exam Tag&#10;ssc_cgl, भारत का पहला गवर्नर जनरल कौन था?, लॉर्ड कैनिंग, लॉर्ड मेयो, लॉर्ड कर्जन, लॉर्ड माउंटबेटन, लॉर्ड कैनिंग, 1858 में नियुक्त हुए, SSC CGL 2023"
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <button
                  type="button"
                  disabled={!pastedCsv.trim()}
                  onClick={handleImportPasted}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center space-x-2 shadow-md transition-all ${
                    !pastedCsv.trim()
                      ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'hi' ? '📥 पेस्ट किए गए प्रश्न सेव करें' : '📥 Save Pasted Questions'}</span>
                </button>
              </div>
            )}

            {/* TAB 3: SAVED QUESTIONS PREVIEW */}
            {activeTab === 'preview' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                    {lang === 'hi' ? `कुल सिंक किए गए प्रश्न (${syncedList.length}):` : `Synced Questions (${syncedList.length}):`}
                  </span>
                  {syncedList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
                    </button>
                  )}
                </div>

                {syncedList.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('success');
                      const targetCategory = syncedList[0]?.category || 'sub_geography';
                      navigate(`/quiz/${targetCategory}`);
                      onClose();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-[0_3px_0_0_#065F46] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{lang === 'hi' ? '🎯 सिंक किए गए सवालों का क्विज खेलें' : '🎯 Play Synced Quiz Now'}</span>
                  </motion.button>
                )}

                {syncedList.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-xs font-medium bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>{lang === 'hi' ? 'अभी तक कोई प्रश्न सिंक नहीं हुआ है।' : 'No questions synced yet.'}</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {syncedList.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {q.category}
                          </span>
                          {q.examTag && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              🏛️ {q.examTag}
                            </span>
                          )}
                        </div>
                        <p className="font-black text-gray-800 dark:text-white leading-snug">
                          {idx + 1}. {q.text}
                        </p>
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>उत्तर: {q.answer}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-500 font-bold shrink-0">
            <div>
              {syncStats.lastSyncTime ? (
                <span>
                  {lang === 'hi' ? 'अंतिम सिंक: ' : 'Last Sync: '}
                  {new Date(syncStats.lastSyncTime).toLocaleDateString()} {new Date(syncStats.lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              ) : (
                <span>{lang === 'hi' ? 'ऑटो-सिंक उपलब्ध' : 'Ready to Sync'}</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-black text-xs hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {lang === 'hi' ? 'पूर्ण (Close)' : 'Done'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
