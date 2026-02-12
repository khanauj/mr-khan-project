/**
 * User Profile Page
 * Form for collecting user information for career prediction
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Heart, Briefcase } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import { predictCareer } from '../services/api';

const educations = ['BCA', 'BBA', 'BA', 'BSc', 'BCom', 'MBA'];
const interests = ['Data', 'Web', 'Business', 'AI', 'Teaching', 'Sales'];
const allSkills = [
  'Python', 'SQL', 'Excel', 'Power BI', 'JavaScript', 
  'HTML', 'CSS', 'Communication', 'Statistics', 'ML'
];

const Profile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    education: '',
    skills: [],
    interest: '',
    experience_years: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.education || !formData.interest || formData.skills.length === 0) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await predictCareer(formData);
      // Store result and navigate to dashboard
      localStorage.setItem('careerPrediction', JSON.stringify(response));
      localStorage.setItem('userProfile', JSON.stringify(formData));
      navigate('/dashboard');
    } catch (err) {
      console.error('Prediction error:', err);
      let errorMessage = 'Failed to analyze career. Please try again.';
      
      if (err?.detail) {
        errorMessage = err.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-400 mb-4"
            >
              <User className="w-8 h-8" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Your Profile
            </h1>
            <p className="text-gray-400">
              Tell us about yourself to get personalized career recommendations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Education */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="flex items-center space-x-2 text-white font-semibold mb-3">
                <GraduationCap className="w-5 h-5 text-primary-400" />
                <span>Education *</span>
              </label>
              <select
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select your education</option>
                {educations.map(edu => (
                  <option key={edu} value={edu} className="bg-black">{edu}</option>
                ))}
              </select>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="flex items-center space-x-2 text-white font-semibold mb-3">
                <Briefcase className="w-5 h-5 text-primary-400" />
                <span>Skills * (Select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {allSkills.map((skill, index) => (
                  <motion.button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`skill-badge ${
                      formData.skills.includes(skill)
                        ? 'bg-primary-500 text-white border-primary-400'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    } border`}
                  >
                    {skill}
                    {formData.skills.includes(skill) && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2"
                      >
                        ✓
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Interest */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center space-x-2 text-white font-semibold mb-3">
                <Heart className="w-5 h-5 text-primary-400" />
                <span>Interest / Domain *</span>
              </label>
              <select
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select your interest</option>
                {interests.map(interest => (
                  <option key={interest} value={interest} className="bg-black">{interest}</option>
                ))}
              </select>
            </motion.div>

            {/* Experience Years */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="text-white font-semibold mb-3 block">
                Experience Years: {formData.experience_years}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>0</span>
                <span>5</span>
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <AnimatedButton
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={loading}
              >
                Analyze Career
              </AnimatedButton>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
