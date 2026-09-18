import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Leaderboard from './pages/Leaderboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { AppProvider } from './AppContext';
import { AuthModal } from './components/AuthModal';
import { GkooSplashScreen } from './components/GkooSplashScreen';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll window, document, and all container divs to top instantly on route change
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isQuiz = location.pathname.startsWith('/quiz');

  return (
    <div className="min-h-screen w-full bg-[#FCF9F7] dark:bg-[#121217] flex font-sans">
      <ScrollToTop />
      {/* Desktop & Tablet Sidebar */}
      {!isQuiz && <Sidebar />}

      {/* Main Content Area */}
      <div className={`w-full flex-1 relative flex flex-col min-h-screen overflow-x-hidden ${!isQuiz ? 'md:pl-64' : ''}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz/:categoryId" element={<Quiz />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
        </Routes>
        {!isQuiz && <BottomNav />}
        <AuthModal />
        <GkooSplashScreen />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}


