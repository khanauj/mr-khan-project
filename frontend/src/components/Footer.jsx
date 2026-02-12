/**
 * Footer Component
 * Clean, minimal footer with links and credits
 */

import { motion } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import RocketIcon from './RocketIcon';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-black/80 backdrop-blur-xl border-t border-white/10 mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RocketIcon className="w-8 h-8" />
              <h3 className="text-xl font-bold skillence-gradient">Skillence</h3>
            </div>
            <div className="flex items-center space-x-1">
              <RocketIcon className="w-3 h-3" showFlame={false} showStars={false} />
              <p className="text-gray-400 text-xs">AI-Powered Career & Skills Advisor</p>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering your career journey with AI-powered insights and personalized guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/profile" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Profile
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/skill-gap" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Skill Gap Analysis
                </a>
              </li>
              <li>
                <a href="/resume-match" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                  Resume Matching
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </motion.a>
              <motion.a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </motion.a>
              <motion.a
                href="mailto:contact@careeradvisor.com"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </motion.a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>© {currentYear} Skillence - AI-Powered Career & Skills Advisor. Built with React, FastAPI, and Machine Learning.</p>
          <p className="mt-2">For academic and portfolio purposes.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
