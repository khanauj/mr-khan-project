/**
 * Navigation Bar Component
 * Modern, responsive navbar with smooth animations
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LogIn, ChevronDown, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import RocketIcon from './RocketIcon';

const Navbar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);



  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/profile', label: 'Profile' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/skill-gap', label: 'Skill Gap' },
    { path: '/resume-match', label: 'Resume' },
    { path: '/career-switch', label: 'Transition' },
    { path: '/compare-careers', label: 'Compare' },
    { path: '/linkedin-analyzer', label: 'LinkedIn' },
    { path: '/goals', label: 'Goals' },
    { path: '/admin', label: 'Admin' },
    { path: '/chatbot', label: 'AI Chat' },
    { path: '/interview', label: 'Interview' },
    { path: '/about', label: 'About' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-xl shadow-black/20"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ y: -3, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              className="text-primary"
            >
              <RocketIcon className="w-8 h-8" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[22px] font-geist font-extrabold tracking-tighter text-on-surface group-hover:text-primary transition-colors">
                Skillence
              </span>
              <span className="text-[10px] font-mono tracking-widest text-on-surface-variant uppercase">
                AI Career Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-mono text-[12px] uppercase tracking-wider transition-all duration-300 py-1.5 px-2 relative ${
                  isActive(link.path)
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* User actions / Toggle theme / Upgrade */}
          <div className="flex items-center gap-4">
            <button className="hidden sm:block font-mono text-[12px] text-primary hover:underline transition-all">
              UPGRADE PRO
            </button>

            {/* Toggle Theme */}
            <button
              onClick={() => {
                if (document.body.classList.contains('light-theme')) {
                  document.body.classList.remove('light-theme');
                } else {
                  document.body.classList.add('light-theme');
                }
              }}
              className="p-2 rounded-full hover:bg-white/5 text-on-surface transition-colors"
              title="Toggle Light/Dark Mode"
            >
              <span className="material-symbols-outlined text-[20px]">
                dark_mode
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-white/5 text-on-surface transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <motion.div
          initial={false}
          animate={{
            height: mobileMenuOpen ? 'auto' : 0,
            opacity: mobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2 border-t border-white/5">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: mobileMenuOpen ? 1 : 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 font-mono text-[13px] uppercase tracking-wider rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-primary bg-primary/10 border-l-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
    </>
  );
};

export default Navbar;
