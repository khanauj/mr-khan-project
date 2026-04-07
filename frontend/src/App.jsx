/**
 * Main App Component
 * Sets up routing and layout structure
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingChatbot from './components/Chatbot';
import { AuthProvider, useAuth } from './context/AuthContext';

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

// Redirect to /auth if not logged in
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

// Redirect to /dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const showChatbot = location.pathname !== '/chatbot';

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/skill-gap" element={<ProtectedRoute><SkillGap /></ProtectedRoute>} />
          <Route path="/resume-match" element={<ProtectedRoute><ResumeMatch /></ProtectedRoute>} />
          <Route path="/career-switch" element={<ProtectedRoute><CareerSwitch /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          <Route path="/compare-careers" element={<ProtectedRoute><CompareCareers /></ProtectedRoute>} />
          <Route path="/linkedin-analyzer" element={<ProtectedRoute><LinkedInAnalyzer /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalSetting /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
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
