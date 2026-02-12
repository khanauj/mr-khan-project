/**
 * Career Prediction Dashboard
 * Displays predicted career with confidence and recommendations
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle2, ArrowRight, Target, Sparkles } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';

const Dashboard = () => {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedPrediction = localStorage.getItem('careerPrediction');
    const savedProfile = localStorage.getItem('userProfile');

    if (savedPrediction) {
      setPrediction(JSON.parse(savedPrediction));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    // Redirect to profile if no prediction exists
    if (!savedPrediction) {
      navigate('/profile');
    }
  }, [navigate]);

  if (!prediction) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const confidence = Math.round(prediction.confidence * 100);
  const careerName = prediction.predicted_career;

  // Career insights based on prediction
  const careerInsights = {
    'Data Analyst': {
      why: 'Your combination of data skills and analytical interest makes you a perfect fit for data analysis roles.',
      nextSteps: ['Learn advanced SQL queries', 'Master data visualization tools', 'Practice with real datasets'],
    },
    'Business Analyst': {
      why: 'Your business acumen and analytical skills align perfectly with business analyst requirements.',
      nextSteps: ['Develop stakeholder management skills', 'Learn business intelligence tools', 'Understand business processes'],
    },
    'Frontend Developer': {
      why: 'Your interest in web technologies and frontend skills indicate a strong fit for frontend development.',
      nextSteps: ['Master React/Angular/Vue', 'Learn UI/UX principles', 'Build portfolio projects'],
    },
    'Backend Developer': {
      why: 'Your technical skills and problem-solving ability suit backend development perfectly.',
      nextSteps: ['Master server-side frameworks', 'Learn database design', 'Understand API development'],
    },
    'ML Engineer': {
      why: 'Your AI interest and technical skills position you well for machine learning engineering.',
      nextSteps: ['Deep dive into ML algorithms', 'Practice with ML frameworks', 'Work on ML projects'],
    },
    'QA Tester': {
      why: 'Your attention to detail and technical skills make you well-suited for quality assurance.',
      nextSteps: ['Learn automated testing tools', 'Understand testing methodologies', 'Practice test case writing'],
    },
    'Product Manager': {
      why: 'Your combination of business and technical skills aligns with product management roles.',
      nextSteps: ['Learn product management frameworks', 'Develop communication skills', 'Understand user research'],
    },
  };

  const insight = careerInsights[careerName] || {
    why: 'Your profile shows strong potential for this career path.',
    nextSteps: ['Continue developing relevant skills', 'Build a portfolio', 'Network with professionals'],
  };

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
            <Target className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Career Prediction
          </h1>
          <p className="text-gray-400 text-lg">Based on your profile analysis</p>
        </motion.div>

        {/* Main Prediction Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card-hover p-8 md:p-12 mb-8"
        >
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl font-bold gradient-text mb-4"
            >
              {careerName}
            </motion.h2>

            {/* Confidence Score with Animated Progress Bar */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Confidence Score</span>
                <span className="text-primary-400 font-bold text-xl">{confidence}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${confidence}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Why This Career Fits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 rounded-xl p-6 mb-6"
          >
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-primary-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Why This Career Fits You</h3>
                <p className="text-gray-300 leading-relaxed">{insight.why}</p>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <span>Recommended Next Steps</span>
            </h3>
            <div className="space-y-3">
              {insight.nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center space-x-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{step}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <AnimatedButton
            variant="secondary"
            fullWidth
            onClick={() => navigate('/skill-gap')}
          >
            Analyze Skill Gap
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </AnimatedButton>
          <AnimatedButton
            variant="primary"
            fullWidth
            onClick={() => navigate('/career-switch')}
          >
            View Career Roadmap
            <ArrowRight className="inline-block ml-2 w-5 h-5" />
          </AnimatedButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
