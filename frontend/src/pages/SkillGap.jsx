/**
 * Skill Gap Analysis Page
 * Shows current skills, missing skills, and readiness level
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import SkillCard from '../components/SkillCard';
import { analyzeSkillGap } from '../services/api';

const SkillGap = () => {
  const [currentSkills, setCurrentSkills] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const allSkills = [
    'Python', 'SQL', 'Excel', 'Power BI', 'JavaScript',
    'HTML', 'CSS', 'Communication', 'Statistics', 'ML'
  ];

  const roles = [
    'Data Analyst', 'Business Analyst', 'Frontend Developer',
    'Backend Developer', 'ML Engineer', 'QA Tester', 'Product Manager'
  ];

  useEffect(() => {
    // Load user profile if available
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setCurrentSkills(profile.skills || []);
    }

    const savedPrediction = localStorage.getItem('careerPrediction');
    if (savedPrediction) {
      const prediction = JSON.parse(savedPrediction);
      setTargetRole(prediction.predicted_career || '');
    }
  }, []);

  const handleSkillToggle = (skill) => {
    setCurrentSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAnalyze = async () => {
    if (!targetRole || currentSkills.length === 0) {
      setError('Please select a target role and at least one current skill');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await analyzeSkillGap({
        current_skills: currentSkills,
        target_role: targetRole,
      });
      setAnalysis(response);
    } catch (err) {
      setError(err.detail || 'Failed to analyze skill gap. Please try again.');
      console.error('Skill gap error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'advanced': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'beginner': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
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
            <TrendingUp className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Skill Gap Analysis
          </h1>
          <p className="text-gray-400 text-lg">
            Identify skills you need to develop for your target role
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Profile</h2>

            {/* Target Role */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 text-white font-semibold mb-3">
                <Target className="w-5 h-5 text-primary-400" />
                <span>Target Role *</span>
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select target role</option>
                {roles.map(role => (
                  <option key={role} value={role} className="bg-black">{role}</option>
                ))}
              </select>
            </div>

            {/* Current Skills */}
            <div className="mb-6">
              <label className="text-white font-semibold mb-3 block">
                Current Skills (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-3">
                {allSkills.map((skill, index) => (
                  <motion.button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`skill-badge border ${
                      currentSkills.includes(skill)
                        ? 'bg-primary-500 text-white border-primary-400'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {skill}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 mb-4"
              >
                {error}
              </motion.div>
            )}

            <AnimatedButton
              fullWidth
              size="lg"
              onClick={handleAnalyze}
              loading={loading}
              disabled={loading}
            >
              Analyze Skill Gap
            </AnimatedButton>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {analysis ? (
              <>
                {/* Readiness Level */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card-hover p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
                    <AlertCircle className="w-6 h-6 text-primary-400" />
                    <span>Readiness Level</span>
                  </h2>
                  <div className={`p-6 rounded-xl border ${getReadinessColor(analysis.readiness_level)}`}>
                    <div className="text-4xl font-bold mb-2">{analysis.readiness_level}</div>
                    <p className="text-sm opacity-80">
                      You're {analysis.readiness_level.toLowerCase()} level ready for this role
                    </p>
                  </div>
                </motion.div>

                {/* Current Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Current Skills ({currentSkills.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {currentSkills.map((skill, index) => (
                      <SkillCard key={skill} skill={skill} status="current" index={index} />
                    ))}
                  </div>
                </motion.div>

                {/* Missing Skills */}
                {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span>Missing Skills ({analysis.missing_skills.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {analysis.missing_skills.map((skill, index) => (
                        <SkillCard key={skill} skill={skill} status="missing" index={index} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-12 text-center"
              >
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Fill in your profile and click "Analyze Skill Gap" to see your skill readiness assessment
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SkillGap;
