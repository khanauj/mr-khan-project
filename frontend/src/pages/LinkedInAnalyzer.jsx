import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Brain, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import api from '../services/api';

const LinkedInAnalyzer = () => {
  const [profileText, setProfileText] = useState('');
  const [targetRole, setTargetRole] = useState('Data Analyst');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roleOptions = [
    'Data Analyst', 'Software Engineer', 'Frontend Developer', 
    'Backend Developer', 'ML Engineer', 'Product Manager'
  ];

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!profileText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/linkedin-analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_text: profileText,
          target_role: targetRole
        })
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Error communicating with analyzer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <Brain className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            LinkedIn Profile Analyzer
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Paste your LinkedIn "About" or experience section to see how well it fits your target role.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 md:p-8"
          >
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile Text</label>
                <textarea
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  placeholder="Paste your LinkedIn summary, experience, and skills here..."
                  className="w-full h-64 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !profileText.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Analyze Profile <ChevronRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                {error}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {results ? (
              <div className="space-y-6">
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 text-center">
                  <h3 className="text-xl font-medium text-gray-300 mb-2">Career Fit Score</h3>
                  <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    {Math.round(results.fit_score)}%
                  </div>
                  <div className="mt-4 w-full bg-gray-800 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${results.fit_score}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    />
                  </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Key Strengths Found
                  </h3>
                  {results.strengths?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.strengths.map((str, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full text-sm">
                          {str}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No specific keyword strengths detected for this role.</p>
                  )}
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" /> Missing Keywords (Gap Analysis)
                  </h3>
                  {results.gap_analysis?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.gap_analysis.map((gap, idx) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-full text-sm">
                          {gap}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Your profile covers all the major keywords perfectly!</p>
                  )}
                  <p className="mt-4 text-sm text-gray-500">
                    Wait, tip: Adding these keywords to your "About" or "Experience" sections can improve your chances to be noticed!
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 text-center border-dashed">
                <Briefcase className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-400">Awaiting Profile Details</h3>
                <p className="text-gray-500 mt-2">Paste your LinkedIn info on the left to see your personalized analysis.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInAnalyzer;
