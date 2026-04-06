/**
 * Skill Gap Analysis Page
 * Shows current skills, missing skills, and readiness level
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertCircle, CheckCircle2, BookOpen, Clock, ExternalLink, CheckSquare, Square } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import SkillCard from '../components/SkillCard';
import { analyzeSkillGap } from '../services/api';

// Course recommendations per skill
const COURSES = {
  'Python': [
    { title: 'Python for Everybody',       platform: 'Coursera', url: 'https://www.coursera.org/specializations/python',                    weeks: 8 },
    { title: 'Complete Python Bootcamp',   platform: 'Udemy',    url: 'https://www.udemy.com/course/complete-python-bootcamp/',              weeks: 4 },
    { title: 'Python Tutorial – Full',     platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',                         weeks: 1 },
  ],
  'SQL': [
    { title: 'SQL for Data Science',       platform: 'Coursera', url: 'https://www.coursera.org/learn/sql-for-data-science',                 weeks: 4 },
    { title: 'The Complete SQL Bootcamp',  platform: 'Udemy',    url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',              weeks: 3 },
    { title: 'SQL Tutorial – Full',        platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',                         weeks: 1 },
  ],
  'Excel': [
    { title: 'Excel Skills for Business',  platform: 'Coursera', url: 'https://www.coursera.org/specializations/excel',                      weeks: 6 },
    { title: 'Microsoft Excel – Beginner', platform: 'Udemy',    url: 'https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/', weeks: 3 },
  ],
  'Power BI': [
    { title: 'Microsoft Power BI Bootcamp',platform: 'Udemy',    url: 'https://www.udemy.com/course/microsoft-power-bi-bootcamp/',            weeks: 4 },
    { title: 'Power BI Tutorial',          platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=AGrl-H87pRU',                         weeks: 1 },
  ],
  'JavaScript': [
    { title: 'JavaScript Algorithms',      platform: 'Coursera', url: 'https://www.coursera.org/learn/javascript-algorithms-data-structures', weeks: 6 },
    { title: 'The Complete JS Course',     platform: 'Udemy',    url: 'https://www.udemy.com/course/the-complete-javascript-course/',          weeks: 5 },
    { title: 'JS Crash Course',            platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',                          weeks: 1 },
  ],
  'HTML': [
    { title: 'HTML & CSS Full Course',     platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=mU6anWqZJcc',                          weeks: 1 },
    { title: 'Web Design for Beginners',   platform: 'Udemy',    url: 'https://www.udemy.com/course/web-design-for-beginners-real-world-coding-in-html-css/', weeks: 3 },
  ],
  'CSS': [
    { title: 'CSS Full Course',            platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=OXGznpKZ_sA',                          weeks: 1 },
    { title: 'Advanced CSS & Sass',        platform: 'Udemy',    url: 'https://www.udemy.com/course/advanced-css-and-sass/',                   weeks: 4 },
  ],
  'Statistics': [
    { title: 'Statistics with Python',     platform: 'Coursera', url: 'https://www.coursera.org/specializations/statistics-with-python',      weeks: 8 },
    { title: 'Statistics for Data Science',platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=xxpc-HPKN28',                          weeks: 2 },
  ],
  'ML': [
    { title: 'Machine Learning Specialization', platform: 'Coursera', url: 'https://www.coursera.org/specializations/machine-learning-introduction', weeks: 10 },
    { title: 'ML A-Z',                     platform: 'Udemy',    url: 'https://www.udemy.com/course/machinelearning/',                         weeks: 6 },
    { title: 'ML Course – fast.ai',        platform: 'YouTube',  url: 'https://www.youtube.com/watch?v=8SF_h3xF3cE',                          weeks: 4 },
  ],
  'Communication': [
    { title: 'Effective Communication',    platform: 'Coursera', url: 'https://www.coursera.org/learn/wharton-communication-skills',           weeks: 4 },
    { title: 'Business English Communication', platform: 'Coursera', url: 'https://www.coursera.org/specializations/business-english',        weeks: 6 },
  ],
};

const platformColors = {
  Coursera: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  Udemy:    'bg-purple-500/20 text-purple-300 border-purple-500/40',
  YouTube:  'bg-red-500/20 text-red-300 border-red-500/40',
};

const PROGRESS_KEY = 'skillLearningProgress';

const SkillGap = () => {
  const [currentSkills, setCurrentSkills] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillProgress, setSkillProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; } catch { return {}; }
  });

  const setSkillStatus = (skill, status) => {
    setSkillProgress(prev => {
      const next = { ...prev, [skill]: prev[skill] === status ? null : status };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      return next;
    });
  };

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

                {/* Learning Path Recommender */}
                {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-cyan-400" />
                      <span>Learning Path Recommender</span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-5">
                      Curated courses to close your skill gaps. Track your progress below.
                    </p>

                    {/* Progress summary */}
                    {(() => {
                      const total = analysis.missing_skills.length;
                      const learned  = analysis.missing_skills.filter(s => skillProgress[s] === 'learned').length;
                      const learning = analysis.missing_skills.filter(s => skillProgress[s] === 'learning').length;
                      return (
                        <div className="flex items-center space-x-4 mb-5 p-3 bg-white/5 rounded-xl">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{total}</div>
                            <div className="text-xs text-gray-400">Total</div>
                          </div>
                          <div className="h-8 w-px bg-white/10" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">{learning}</div>
                            <div className="text-xs text-gray-400">Learning</div>
                          </div>
                          <div className="h-8 w-px bg-white/10" />
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">{learned}</div>
                            <div className="text-xs text-gray-400">Learned</div>
                          </div>
                          <div className="flex-1">
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${total > 0 ? Math.round(((learning * 0.5 + learned) / total) * 100) : 0}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {total > 0 ? Math.round(((learning * 0.5 + learned) / total) * 100) : 0}% progress
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-4">
                      {analysis.missing_skills.map((skill, idx) => {
                        const courses = COURSES[skill] || [];
                        const status  = skillProgress[skill];
                        const totalWeeks = courses.length > 0 ? Math.min(...courses.map(c => c.weeks)) : null;

                        return (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="p-4 bg-white/5 rounded-xl border border-white/10"
                          >
                            {/* Skill header + tracker */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-semibold">{skill}</span>
                                  {totalWeeks && (
                                    <span className="flex items-center space-x-1 text-xs text-gray-400">
                                      <Clock className="w-3 h-3" />
                                      <span>~{totalWeeks}w min</span>
                                    </span>
                                  )}
                                </div>
                                {courses.length === 0 && (
                                  <p className="text-xs text-gray-500 mt-1">Search Coursera or Udemy for "{skill}" courses</p>
                                )}
                              </div>
                              {/* Progress toggle buttons */}
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSkillStatus(skill, 'learning')}
                                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg border transition-all ${
                                    status === 'learning'
                                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                      : 'border-white/10 text-gray-400 hover:border-yellow-500/30 hover:text-yellow-400'
                                  }`}
                                >
                                  {status === 'learning' ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                  <span>Learning</span>
                                </button>
                                <button
                                  onClick={() => setSkillStatus(skill, 'learned')}
                                  className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-lg border transition-all ${
                                    status === 'learned'
                                      ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                      : 'border-white/10 text-gray-400 hover:border-green-500/30 hover:text-green-400'
                                  }`}
                                >
                                  {status === 'learned' ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                  <span>Learned</span>
                                </button>
                              </div>
                            </div>

                            {/* Course cards */}
                            {courses.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {courses.map((course) => (
                                  <a
                                    key={course.title}
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:scale-105 hover:shadow-lg ${platformColors[course.platform]}`}
                                  >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="font-medium">{course.platform}</span>
                                    <span className="text-opacity-70 truncate max-w-[140px]">· {course.title}</span>
                                    <span className="opacity-60">({course.weeks}w)</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
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
