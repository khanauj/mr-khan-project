/**
 * Main App Component
 * Sets up routing and layout structure
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChatbot from './components/Chatbot';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import SkillGap from './pages/SkillGap';
import ResumeMatch from './pages/ResumeMatch';
import CareerSwitch from './pages/CareerSwitch';
import ChatbotPage from './pages/Chatbot';
import Interview from './pages/Interview';
import About from './pages/About';
import Auth from './pages/Auth';
import CompareCareers from './pages/CompareCareers';
import LinkedInAnalyzer from './pages/LinkedInAnalyzer';
import GoalSetting from './pages/GoalSetting';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const location = useLocation();
  const showChatbot = location.pathname !== '/chatbot';

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/resume-match" element={<ResumeMatch />} />
          <Route path="/career-switch" element={<CareerSwitch />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/compare-careers" element={<CompareCareers />} />
          <Route path="/linkedin-analyzer" element={<LinkedInAnalyzer />} />
          <Route path="/goals" element={<GoalSetting />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </AnimatePresence>

      <Footer />
      
      {/* Floating Chatbot - Hide on chatbot page */}
      {showChatbot && <FloatingChatbot />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
