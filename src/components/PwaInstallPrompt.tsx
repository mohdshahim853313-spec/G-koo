import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useAppContext } from '../useAppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const { t } = useAppContext();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for iOS or non-prompting browsers
      alert(
        "To install Gkoo:\n\n• On iOS (Safari): Tap the Share button & choose 'Add to Home Screen'\n• On Android (Chrome): Tap the 3-dot menu & choose 'Install App'"
      );
    }
  };

  if (isInstalled || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#FF5F6D] to-[#FF8E53] text-white p-3 rounded-2xl shadow-md flex items-center justify-between space-x-3 mb-4 animate-in fade-in">
      <div className="flex items-center space-x-2.5">
        <div className="bg-white/20 p-2 rounded-xl">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div className="text-xs">
          <p className="font-black text-[13px]">Install Gkoo App</p>
          <p className="opacity-90 text-[11px] leading-tight">{t('installAppBanner')}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1 shrink-0">
        <button
          onClick={handleInstall}
          className="bg-white text-[#E64553] font-extrabold text-xs px-3 py-1.5 rounded-xl shadow-sm hover:bg-rose-50 active:scale-95 transition-all flex items-center space-x-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('installNow')}</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
