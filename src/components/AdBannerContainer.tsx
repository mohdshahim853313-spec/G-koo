import React from 'react';
import { useAppContext } from '../useAppContext';
import { ADMOB_CONFIG } from '../services/admobService';
import { isAndroidApp } from '../utils/platform';
import { ExternalLink } from 'lucide-react';

interface AdBannerContainerProps {
  className?: string;
}

export const AdBannerContainer: React.FC<AdBannerContainerProps> = ({ 
  className = ''
}) => {
  const { lang } = useAppContext();

  // STRICT RULE: Only show inside Android APK, never on Web!
  if (!isAndroidApp()) {
    return null;
  }

  return (
    <div className={`w-full overflow-hidden select-none my-3.5 px-0.5 ${className}`}>
      <div className="w-full rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 dark:from-amber-500/5 dark:via-rose-500/5 dark:to-indigo-500/5 border-2 border-dashed border-amber-300/70 dark:border-amber-700/60 p-3 shadow-xs text-left relative overflow-hidden group">
        
        {/* Top Tag: AD / विज्ञापन + AdMob info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-gray-950 shadow-2xs">
              {lang === 'hi' ? 'विज्ञापन • AD' : 'AD'}
            </span>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
              Google AdMob Banner Slot
            </span>
          </div>

          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 flex items-center space-x-0.5">
            <span>{ADMOB_CONFIG.isTesting ? '(Test Ad ID Active)' : '(Production Ad)'}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </span>
        </div>

        {/* Ad Body Content */}
        <div className="flex items-center justify-between gap-3 bg-white/80 dark:bg-[#141B29]/90 border border-gray-200/80 dark:border-gray-800 rounded-xl p-2.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-lg font-black shadow-xs shrink-0">
            🎯
          </div>

          <div className="min-w-0 flex-1">
            <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">
              {lang === 'hi' ? 'Google AdMob टेस्ट विज्ञापन' : 'Google AdMob Test Sponsored'}
            </h5>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
              ID: {ADMOB_CONFIG.bannerId.slice(0, 24)}...
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-[11px] shadow-xs shrink-0">
            {lang === 'hi' ? 'देखें' : 'Visit'}
          </div>
        </div>

      </div>
    </div>
  );
};

