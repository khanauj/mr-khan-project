import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeLinkedIn } from '../services/api';

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
      const data = await analyzeLinkedIn(profileText, targetRole);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Error communicating with analyzer');
    } finally {
      setLoading(false);
    }
  };

  const fitScore = results?.fit_score || 0;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] right-[-100px]"></div>
        <div className="bg-glow-blob w-[600px] h-[600px] bg-tertiary/10 bottom-[-100px] left-[-100px]" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Social Audit Active</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
          LinkedIn Optimizer
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Audit your LinkedIn profile parameters. Align your headline, about, and experience data with key recruiter queries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="glass-card rounded-[28px] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            
            <form onSubmit={handleAnalyze} className="space-y-6 relative z-10">
              
              {/* Target Position */}
              <div className="space-y-2">
                <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Target Vector Position</label>
                <div className="relative">
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                  >
                    {roleOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              {/* Profile Text */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">LinkedIn Profile Content</label>
                  <span className="font-mono text-[10px] text-on-surface-variant">{profileText.length} Chars</span>
                </div>
                <textarea
                  value={profileText}
                  onChange={(e) => setProfileText(e.target.value)}
                  placeholder="Paste your LinkedIn headline, summary description, and experience text here..."
                  className="w-full h-64 bg-surface-container/30 border border-white/10 rounded-xl p-4 font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !profileText.trim()}
                className="ai-glow w-full py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Auditing Profile...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Synthesize Profile Audit
                  </>
                )}
              </button>

            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-sans text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h2 className="text-lg font-semibold text-on-surface">Audit Output</h2>
          </div>

          <AnimatePresence>
            {results ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Score Dial */}
                <div className="glass-card rounded-[28px] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
                  
                  <h3 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-6">Profile Fit score</h3>

                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                      <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${fitScore}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                    </svg>
                    <span className="absolute font-mono text-[24px] text-primary font-bold">{fitScore.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Strengths */}
                <div className="glass-card rounded-[28px] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-green-400">check_circle</span>
                    <h3 className="text-base font-semibold text-on-surface">Profile Strengths</h3>
                  </div>
                  {results.strengths?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.strengths.map((str, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-sans text-xs">
                          {str}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-on-surface-variant text-sm">No significant keyword strengths detected for this role.</p>
                  )}
                </div>

                {/* Missing Keywords / Gaps */}
                <div className="glass-card rounded-[28px] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-yellow-400">warning</span>
                    <h3 className="text-base font-semibold text-on-surface">Target Skill Gaps</h3>
                  </div>
                  {results.gap_analysis?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.gap_analysis.map((gap, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono text-[12px]">
                          {gap}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-on-surface-variant text-sm">Your profile covers all the major keywords perfectly!</p>
                  )}
                  <p className="mt-4 text-[11px] text-on-surface-variant/70 leading-relaxed font-sans">
                    💡 Tip: Integrate these missing credentials naturally inside your LinkedIn About/Bio section to trigger matching indexing systems.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] rounded-[28px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 bg-surface-container/20">
                <span className="material-symbols-outlined text-on-surface-variant/20 text-[56px] mb-4">account_circle</span>
                <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface font-bold">Awaiting Input Data</p>
                <p className="text-on-surface-variant text-sm mt-2 max-w-xs leading-relaxed">
                  Provide your target vector role and paste profile sections on the left to review optimization outputs.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default LinkedInAnalyzer;
