import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { AppProvider } from './AppContext';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { triggerSmartAutoSync } from './lib/sheetSync';
import { triggerHaptic } from './lib/audio';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GkooSplashScreen } from './components/GkooSplashScreen';
import { initializeAdMob, hideBannerAd, resumeBannerAd } from './services/admobService';
import { isAndroidApp } from './utils/platform';

// Lazy load non-tab secondary pages only
const Subjects = lazy(() => import('./pages/Subjects'));
const Quiz = lazy(() => import('./pages/Quiz'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));

const RouteFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh]">
    <div className="w-7 h-7 rounded-full border-3 border-[#FF5F6D] border-t-transparent animate-spin" />
  </div>
);

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

const MAIN_TABS = ['/', '/subjects', '/leaderboard', '/profile'];

const getTabIndex = (path: string): number => {
  if (path === '/') return 0;
  if (path === '/subjects') return 1;
  if (path === '/leaderboard' || path === '/report' || path === '/analytics') return 2;
  if (path === '/profile') return 3;
  return -1;
};

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const isQuiz = pathname.startsWith('/quiz');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const showExitConfirmRef = useRef(showExitConfirm);
  showExitConfirmRef.current = showExitConfirm;
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // AdMob Banner & SDK Lifecycle Management (APK ONLY, NEVER on Web)
  useEffect(() => {
    if (isAndroidApp() && Capacitor.isNativePlatform()) {
      initializeAdMob();
    }
  }, []);

  useEffect(() => {
    if (!isAndroidApp() || !Capacitor.isNativePlatform()) return;

    // STRICT USER DIRECTIVE: Home screen ('/') and Quiz ('/quiz') must NEVER show ads!
    if (pathname === '/' || isQuiz) {
      hideBannerAd();
    } else {
      resumeBannerAd();
    }
  }, [pathname, isQuiz]);

  const currentTabIdx = getTabIndex(pathname);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isQuiz || currentTabIdx === -1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isQuiz || currentTabIdx === -1) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Check if target is an interactive horizontal scroll or input
    const target = e.target as HTMLElement | null;
    if (target && target.closest('input, textarea, select, [role="slider"], [role="dialog"], .overflow-x-auto, .scrollbar-none')) {
      return;
    }

    // Swipe criteria: fast enough (<480ms), distance >= 55px, and horizontal dominant
    if (dt < 480 && Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && currentTabIdx < MAIN_TABS.length - 1) {
        // Swipe Left (finger goes right to left) -> Next tab
        triggerHaptic('click');
        navigate(MAIN_TABS[currentTabIdx + 1]);
      } else if (dx > 0 && currentTabIdx > 0) {
        // Swipe Right (finger goes left to right) -> Previous tab
        triggerHaptic('click');
        navigate(MAIN_TABS[currentTabIdx - 1]);
      }
    }
  };

  // Handle Capacitor Native Android Back Button & Leaving Confirmation
  useEffect(() => {
    let backButtonHandle: any = null;

    const setupBackButton = async () => {
      try {
        if (!Capacitor.isNativePlatform()) return;
        backButtonHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
          // If Exit Modal is currently showing and back is pressed again, close modal
          if (showExitConfirmRef.current) {
            setShowExitConfirm(false);
            return;
          }

          const currentPath = pathnameRef.current;

          // If on Root Home page ('/'), intercept back button and show exit confirmation
          if (currentPath === '/') {
            setShowExitConfirm(true);
            return;
          }

          // If on other pages, navigate back or show confirmation if at root of history
          if (canGoBack) {
            navigate(-1);
          } else {
            setShowExitConfirm(true);
          }
        });
      } catch {
        // Not in Capacitor runtime or plugin not supported, ignore
      }
    };

    setupBackButton();

    return () => {
      if (backButtonHandle && typeof backButtonHandle.remove === 'function') {
        backButtonHandle.remove();
      }
    };
  }, [navigate]);

  // Handle web/PWA popstate on root to confirm exit
  useEffect(() => {
    const handlePopState = () => {
      if (pathnameRef.current === '/') {
        if (!showExitConfirmRef.current) {
          window.history.pushState(null, '', window.location.pathname);
          setShowExitConfirm(true);
        }
      }
    };

    if (pathname === '/') {
      window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  const handleConfirmExit = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await CapApp.exitApp();
      } else {
        window.close();
      }
    } catch {
      window.close();
    }
  };

  // Google Sheets Auto-Sync Engine
  useEffect(() => {
    const initTimer = setTimeout(() => {
      triggerSmartAutoSync(true).catch(() => {});
    }, 1200);

    const handleOnline = () => {
      triggerSmartAutoSync(true).catch(() => {});
    };
    window.addEventListener('online', handleOnline);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSmartAutoSync(true).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let appStateHandle: any = null;
    if (Capacitor.isNativePlatform()) {
      try {
        CapApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            triggerSmartAutoSync(true).catch(() => {});
          }
        }).then(handle => {
          appStateHandle = handle;
        }).catch(() => {});
      } catch {
        // not in capacitor runtime
      }
    }

    const periodicTimer = setInterval(() => {
      triggerSmartAutoSync(false).catch(() => {});
    }, 20 * 60 * 1000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(periodicTimer);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (appStateHandle && typeof appStateHandle.remove === 'function') {
        appStateHandle.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FCF9F7] dark:bg-[#0F121E] flex font-sans">
      <GkooSplashScreen />
      <ScrollToTop />

      {/* Pinned Slim Mobile Status Bar Header */}
      <div 
        className="fixed top-0 left-0 right-0 z-[60] h-[max(env(safe-area-inset-top,0px),28px)] bg-[#FCF9F7] dark:bg-[#0F121E] md:hidden pointer-events-none" 
        aria-hidden="true"
      />

      {/* Desktop & Tablet Sidebar */}
      {!isQuiz && <Sidebar />}

      {/* Main Content Area */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full flex-1 relative flex flex-col min-h-screen ${!isQuiz ? 'md:pl-64' : ''}`}
      >
        <ErrorBoundary fallbackTitle="पेज लोड करने में समस्या आई">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/map" element={<Dashboard initialView="path" />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz/:categoryId" element={<Quiz />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/analytics" element={<Leaderboard />} />
              <Route path="/report" element={<Leaderboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        {!isQuiz && <BottomNav />}
        <ExitConfirmModal
          isOpen={showExitConfirm}
          onStay={() => setShowExitConfirm(false)}
          onConfirmExit={handleConfirmExit}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackTitle="G-koo लोड करने में समस्या आई">
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}
