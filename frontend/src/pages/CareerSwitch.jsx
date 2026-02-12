/**
 * Career Switch Roadmap Page
 * Timeline-style roadmap for career transition
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BookOpen, Users, Briefcase, Target, CheckCircle2, Search, Loader2, AlertCircle } from 'lucide-react';
import { searchRoadmap } from '../services/api';
import AnimatedButton from '../components/AnimatedButton';

const CareerSwitch = () => {
  const [prediction, setPrediction] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);

  useEffect(() => {
    const savedPrediction = localStorage.getItem('careerPrediction');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedPrediction) {
      setPrediction(JSON.parse(savedPrediction));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const targetCareer = prediction?.predicted_career || generatedRoadmap?.roadmap?.title || 'Target Career';
  const currentSkills = profile?.skills || [];

  // Handle roadmap search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError('');
    setLoading(true);
    setGeneratedRoadmap(null);

    try {
      const response = await searchRoadmap({
        query: searchQuery,
        current_role: profile?.target_role || null,
        target_role: prediction?.predicted_career || null,
        current_skills: currentSkills
      });
      setGeneratedRoadmap(response);
    } catch (err) {
      setError(err.detail || 'Failed to generate roadmap. Please check if Gemini API key is configured.');
      console.error('Roadmap search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const getIcon = (iconName) => {
    const icons = {
      target: Target,
      book: BookOpen,
      briefcase: Briefcase,
      users: Users,
      'map-pin': MapPin,
      'mapPin': MapPin,
      mapPin: MapPin,
    };
    const IconComponent = icons[iconName?.toLowerCase()] || Target;
    return <IconComponent className="w-6 h-6" />;
  };

  // Color gradient mapping for generated roadmaps
  const getColorGradient = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
    ];
    return colors[index % colors.length];
  };

  // Use generated roadmap if available, otherwise use default
  const roadmapSteps = generatedRoadmap?.steps || [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Assess Current Skills',
      description: 'Evaluate your existing skills and identify transferable abilities',
      duration: 'Week 1',
      color: 'from-blue-500 to-blue-600',
      tasks: [
        'Complete skill assessment',
        'List all current skills',
        'Identify strengths and weaknesses',
      ],
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Learn Required Skills',
      description: 'Focus on acquiring the essential skills for your target role',
      duration: 'Weeks 2-8',
      color: 'from-purple-500 to-purple-600',
      tasks: [
        'Enroll in relevant courses',
        'Practice hands-on projects',
        'Join online learning communities',
      ],
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Build Portfolio',
      description: 'Create projects showcasing your new skills and expertise',
      duration: 'Weeks 9-12',
      color: 'from-green-500 to-green-600',
      tasks: [
        'Complete 3-5 portfolio projects',
        'Document your work process',
        'Create a professional portfolio website',
      ],
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Network & Connect',
      description: 'Build professional connections in your target industry',
      duration: 'Weeks 13-16',
      color: 'from-orange-500 to-orange-600',
      tasks: [
        'Attend industry events and meetups',
        'Connect with professionals on LinkedIn',
        'Join relevant professional groups',
      ],
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Apply & Interview',
      description: 'Start applying to positions and prepare for interviews',
      duration: 'Weeks 17+',
      color: 'from-red-500 to-red-600',
      tasks: [
        'Tailor resume for each application',
        'Practice interview questions',
        'Prepare for technical assessments',
      ],
    },
  ];

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-400 mb-4"
          >
            <MapPin className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Career Switch Roadmap
          </h1>
          {generatedRoadmap?.roadmap?.description ? (
            <>
              <p className="text-gray-400 text-lg mb-2">{generatedRoadmap.roadmap.description}</p>
              <p className="text-2xl font-bold gradient-text">{generatedRoadmap.roadmap.title}</p>
              {generatedRoadmap.timeline && (
                <p className="text-sm text-gray-400 mt-2">Timeline: {generatedRoadmap.timeline}</p>
              )}
            </>
          ) : (
            <>
              <p className="text-gray-400 text-lg mb-2">
                Your personalized path to transition to
              </p>
              <p className="text-2xl font-bold gradient-text">{targetCareer}</p>
            </>
          )}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-12"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Search className="w-5 h-5 text-primary-400" />
            <span>Search for Career Roadmap</span>
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Enter a career transition query (e.g., "How to become a Data Scientist?", "Transition from Sales to Product Manager")
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., How to become a Machine Learning Engineer?"
              className="flex-1 input-field"
              disabled={loading}
            />
            <AnimatedButton
              onClick={handleSearch}
              loading={loading}
              disabled={loading || !searchQuery.trim()}
            >
              {loading ? 'Generating...' : 'Generate Roadmap'}
            </AnimatedButton>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 flex items-start space-x-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
          {generatedRoadmap && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400"
            >
              ✓ Roadmap generated successfully! Scroll down to view.
            </motion.div>
          )}
        </motion.div>

        {/* Current Skills Summary */}
        {currentSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-12"
          >
            <h2 className="text-xl font-bold text-white mb-4">Your Current Skills</h2>
            <div className="flex flex-wrap gap-3">
              {currentSkills.map((skill, index) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 font-medium"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Roadmap Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-primary-400 to-primary-500 opacity-30" />

          <div className="space-y-12">
            {roadmapSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.2, duration: 0.6 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.2, type: 'spring', stiffness: 200 }}
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color || getColorGradient(index)} flex items-center justify-center text-white shadow-lg border-4 border-dark-900`}
                  >
                    {typeof step.icon === 'object' ? step.icon : getIcon(step.icon_name || step.icon || 'target')}
                  </motion.div>
                </div>

                {/* Content Card */}
                <div className={`ml-24 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:mr-6' : 'md:ml-auto md:ml-6'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="glass-card-hover p-6"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-4">{step.description}</p>
                    
                    {/* Tasks List */}
                    <div className="space-y-2">
                      {(step.tasks || []).map((task, taskIndex) => (
                        <motion.div
                          key={taskIndex}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + index * 0.2 + taskIndex * 0.1 }}
                          className="flex items-center space-x-2 text-gray-300 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{typeof task === 'string' ? task : task}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Skills needed (if from generated roadmap) */}
                    {step.skills && step.skills.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-xs text-gray-400 mb-2">Skills needed:</p>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-primary-500/20 border border-primary-500/50 rounded text-xs text-primary-400"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-center"
        >
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <Target className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-400 mb-6">
              Follow this roadmap step-by-step to successfully transition to your target career.
              Remember, every expert was once a beginner. Stay consistent and keep learning!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/skill-gap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
              >
                Analyze Skill Gap
              </motion.a>
              <motion.a
                href="/resume-match"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-colors"
              >
                Check Resume Match
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CareerSwitch;
