/**
 * Resume-Job Matching Page
 * Match resume with job description using AI
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import { matchResume } from '../services/api';

const ResumeMatch = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please enter both resume text and job description');
      return;
    }

    setError('');
    setLoading(true);
    setMatchResult(null);

    try {
      const response = await matchResume({
        resume_text: resumeText,
        job_description: jobDescription,
      });
      setMatchResult(response);
    } catch (err) {
      setError(err.detail || 'Failed to match resume. Please try again.');
      console.error('Match error:', err);
    } finally {
      setLoading(false);
    }
  };

  const matchPercentage = matchResult?.match_percentage || 0;

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
            <Search className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Resume-Job Matching
          </h1>
          <p className="text-gray-400 text-lg">
            Find out how well your resume matches a job description
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Resume Text Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-white">Your Resume</h2>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here...&#10;&#10;Example:&#10;Education: BCA&#10;Skills: Python, SQL, Excel&#10;Experience: 2 years as Data Analyst..."
              className="input-field min-h-[300px] resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              {resumeText.length} characters
            </p>
          </motion.div>

          {/* Job Description Text Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary-400" />
              <h2 className="text-xl font-bold text-white">Job Description</h2>
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here...&#10;&#10;Example:&#10;Looking for Data Analyst with Python, SQL, Statistics skills. Experience in data analysis and visualization with Power BI."
              className="input-field min-h-[300px] resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              {jobDescription.length} characters
            </p>
          </motion.div>
        </div>

        {/* Match Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <AnimatedButton
            size="lg"
            onClick={handleMatch}
            loading={loading}
            disabled={loading}
            className="px-12"
          >
            <Search className="inline-block mr-2 w-5 h-5" />
            Check Match
          </AnimatedButton>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Match Result */}
        {matchResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Match Percentage Card */}
            <div className="glass-card-hover p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Match Score</h2>
              
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - matchPercentage / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  >
                    <span className="text-4xl font-bold gradient-text">{matchPercentage.toFixed(1)}%</span>
                  </motion.div>
                </div>
              </div>

              <p className="text-gray-400">
                {matchPercentage >= 80 ? 'Excellent Match!' :
                 matchPercentage >= 60 ? 'Good Match' :
                 matchPercentage >= 40 ? 'Fair Match' :
                 'Poor Match - Consider improving your resume'}
              </p>
            </div>

            {/* Missing Keywords */}
            {matchResult.missing_keywords && matchResult.missing_keywords.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">
                    Missing Keywords ({matchResult.missing_keywords.length})
                  </h3>
                </div>
                <p className="text-gray-400 mb-4 text-sm">
                  These keywords are important in the job description but not found in your resume:
                </p>
                <div className="flex flex-wrap gap-3">
                  {matchResult.missing_keywords.map((keyword, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 font-medium"
                    >
                      {keyword}
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  💡 Tip: Consider adding these keywords naturally to your resume to improve match score
                </p>
              </motion.div>
            )}

            {/* Match Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">Match Insights</h3>
              </div>
              <ul className="space-y-2 text-gray-300">
                {matchPercentage >= 80 && (
                  <li>✓ Your resume is highly aligned with the job requirements</li>
                )}
                {matchPercentage >= 60 && matchPercentage < 80 && (
                  <li>✓ Your resume matches most requirements. Consider highlighting specific skills more prominently</li>
                )}
                {matchPercentage >= 40 && matchPercentage < 60 && (
                  <li>✓ Your resume partially matches. Focus on adding the missing skills and keywords</li>
                )}
                {matchPercentage < 40 && (
                  <li>✓ Significant skill gap detected. Consider gaining experience in required areas or targeting different roles</li>
                )}
              </ul>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!matchResult && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto glass-card p-12 text-center"
          >
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Enter your resume and job description above, then click "Check Match" to see compatibility
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeMatch;
