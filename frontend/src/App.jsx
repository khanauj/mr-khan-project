/**
 * Main App Component
 * Sets up routing and layout structure
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import SkillGap from './pages/SkillGap';
import ResumeMatch from './pages/ResumeMatch';
import CareerSwitch from './pages/CareerSwitch';
import ChatbotPage from './pages/Chatbot';
import About from './pages/About';

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
          <Route path="/about" element={<About />} />
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
      <AppContent />
    </Router>
  );
}

export default App;
