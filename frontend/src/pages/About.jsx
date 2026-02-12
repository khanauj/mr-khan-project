/**
 * About Developers Page
 * Showcase the team behind Skillence
 */

import { motion } from 'framer-motion';
import { Linkedin, Mail, Code, Palette, Cpu } from 'lucide-react';
import RocketIcon from '../components/RocketIcon';

const About = () => {
  const developers = [
    {
      name: 'AUJ KHAN',
      role: 'ML + Backend',
      description: 'Trains models and builds API endpoints',
      linkedin: 'https://www.linkedin.com/in/auj-khan-b423b4198/',
      email: 'khanauj60@gmail.com',
      icon: Cpu,
      gradient: 'from-primary-500 to-primary-600',
      image: '/images/auj-khan.jpg' // Profile picture path
    },
    {
      name: 'WAZID ANSARI',
      role: 'Full-Stack + Integration',
      description: 'Integrates frontend and backend, testing, deployment',
      linkedin: 'https://www.linkedin.com/in/wazid-ansari?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      email: 'wazida471@gmail.com',
      icon: Code,
      gradient: 'from-purple-500 to-purple-600',
      image: '/images/wazid-ansari.jpg' // Profile picture path
    },
    {
      name: 'SUHAIB ASHRAF',
      role: 'Frontend + Design',
      description: 'Builds UI and handles branding/design',
      linkedin: 'https://www.linkedin.com/in/suhaib-ashraf01/',
      email: 'ashrafsuhaib674@gmail.com',
      icon: Palette,
      gradient: 'from-cyan-400 to-cyan-500',
      image: '/images/suhaib-ashraf.jpg' // Profile picture path
    }
  ];

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 mb-6"
          >
            <RocketIcon className="w-12 h-12" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="skillence-gradient">About Developers</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Meet the talented team behind Skillence. We're passionate about using AI and machine learning 
            to help people navigate their career journeys.
          </p>
        </motion.div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {developers.map((dev, index) => {
            const IconComponent = dev.icon;
            return (
              <motion.div
                key={dev.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="glass-card-hover p-8 rounded-2xl"
              >
                {/* Profile Picture */}
                <div className="relative mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1, type: 'spring', stiffness: 200 }}
                    className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white/20 bg-gradient-to-br from-primary-500/20 to-purple-500/20 flex items-center justify-center relative"
                  >
                    <img
                      src={dev.image}
                      alt={dev.name}
                      className="w-full h-full object-cover absolute inset-0"
                      onError={(e) => {
                        // Hide image if it fails to load - icon will show as fallback
                        e.target.style.display = 'none';
                        // Ensure icon is visible as fallback
                        const icon = e.target.parentElement.querySelector('svg');
                        if (icon) {
                          icon.style.display = 'block';
                          icon.style.opacity = '1';
                        }
                      }}
                      onLoad={(e) => {
                        // Show image if it loads successfully
                        e.target.style.display = 'block';
                        const icon = e.target.parentElement.querySelector('svg');
                        if (icon) icon.style.display = 'none';
                      }}
                    />
                    <IconComponent className="w-16 h-16 text-primary-400 absolute" style={{ display: 'block', opacity: 1 }} />
                  </motion.div>
                  
                  {/* Role Badge */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r ${dev.gradient} rounded-full text-white text-sm font-semibold shadow-lg`}
                  >
                    {dev.role}
                  </motion.div>
                </div>

                {/* Developer Info */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{dev.name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{dev.description}</p>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center space-x-4">
                  <motion.a
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-primary-500/50 transition-all duration-300 group"
                    aria-label={`${dev.name}'s LinkedIn`}
                  >
                    <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </motion.a>
                  
                  <motion.a
                    href={`mailto:${dev.email}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-primary-500/50 transition-all duration-300 group"
                    aria-label={`Email ${dev.name}`}
                  >
                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </motion.a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
            At Skillence, we believe everyone deserves personalized career guidance powered by cutting-edge AI. 
            Our team combines expertise in machine learning, full-stack development, and design to create 
            innovative solutions that help professionals unlock their career potential.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/20 mb-4">
                <Cpu className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400 text-sm">
                Leveraging advanced ML models and AI to provide accurate career insights
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 mb-4">
                <Code className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Full-Stack</h3>
              <p className="text-gray-400 text-sm">
                Seamless integration between powerful backend APIs and intuitive frontend experiences
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-500/20 mb-4">
                <Palette className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">User-Centric</h3>
              <p className="text-gray-400 text-sm">
                Beautiful, intuitive design that makes career planning accessible to everyone
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Interested in Collaborating?</h2>
            <p className="text-gray-400 mb-6">
              We're always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {developers.map((dev) => (
                <motion.a
                  key={dev.email}
                  href={`mailto:${dev.email}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all duration-300"
                >
                  Contact {dev.name.split(' ')[0]}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
