import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { AppProvider } from './AppContext';
import { GkooSplashScreen } from './components/GkooSplashScreen';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { triggerSmartAutoSync } from './lib/sheetSync';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { ErrorBoundary } from './components/ErrorBoundary';

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

  // Google Sheets Auto-Sync Engine:
  // 1. Full auto-sync whenever user opens or switches to the app (if internet is available).
  // 2. Guaranteed 2x a day sync (every 12 hours) in background.
  // 3. Auto-syncs as soon as device reconnects to internet.
  useEffect(() => {
    // A. Initial launch sync (1.2s delay for instant zero-wait UI render)
    const initTimer = setTimeout(() => {
      triggerSmartAutoSync(true).catch(() => {});
    }, 1200);

    // B. Reconnection to internet event
    const handleOnline = () => {
      triggerSmartAutoSync(true).catch(() => {});
    };
    window.addEventListener('online', handleOnline);

    // C. Visibility change (when user returns/switches back to app tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerSmartAutoSync(true).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // D. Capacitor Native Android App Resume listener
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

    // E. Periodic background timer check for 2x daily schedule (every 20 minutes)
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
      <ScrollToTop />

      {/* Pinned Slim Mobile Status Bar Header */}
      <div 
        className="fixed top-0 left-0 right-0 z-[60] h-[max(env(safe-area-inset-top,0px),28px)] bg-[#FCF9F7] dark:bg-[#0F121E] md:hidden pointer-events-none" 
        aria-hidden="true"
      />

      {/* Desktop & Tablet Sidebar */}
      {!isQuiz && <Sidebar />}

      {/* Main Content Area */}
      <div className={`w-full flex-1 relative flex flex-col min-h-screen ${!isQuiz ? 'md:pl-64' : ''}`}>
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
        <GkooSplashScreen />
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


