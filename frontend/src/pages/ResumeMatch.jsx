import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] left-[-100px]"></div>
        <div className="bg-glow-blob w-[600px] h-[600px] bg-tertiary/10 bottom-[-100px] right-[-100px]" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">ATS Audit Active</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
          Resume Intelligence
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Benchmark your resume profile against target job descriptions. Extract delta keywords to unlock high-yield interview calls.
        </p>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Resume Text Input */}
        <div className="glass-card rounded-[28px] p-6 relative flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">description</span>
              <h3 className="text-base font-semibold text-on-surface">Your Resume</h3>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">{resumeText.length} Chars</span>
          </div>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw resume coordinates here...&#10;&#10;e.g. Education: BCA, Skills: Python, SQL, Javascript, Communication, Experience: 1 Year..."
            className="w-full h-72 bg-surface-container/30 border border-white/10 rounded-xl p-4 font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>

        {/* Job Description Input */}
        <div className="glass-card rounded-[28px] p-6 relative flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">work</span>
              <h3 className="text-base font-semibold text-on-surface">Job Description</h3>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">{jobDescription.length} Chars</span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job specification details here...&#10;&#10;e.g. Seeking Data Analyst with experience in SQL, Python, Excel, Power BI, and Statistics..."
            className="w-full h-72 bg-surface-container/30 border border-white/10 rounded-xl p-4 font-mono text-[13px] text-on-surface placeholder:text-on-surface-variant/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
          />
        </div>

      </div>

      {/* Submit Button */}
      <div className="flex justify-center mt-2">
        <button
          onClick={handleMatch}
          disabled={loading}
          className="ai-glow px-12 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Analyzing Resumes...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Compare Profiles
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="max-w-xl mx-auto w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-sans text-center">
          {error}
        </div>
      )}

      {/* Results Workspace */}
      <AnimatePresence>
        {matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="max-w-3xl mx-auto w-full flex flex-col gap-8 mt-6"
          >
            {/* Score Summary */}
            <div className="glass-card rounded-[28px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
              
              <h3 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-6">Alignment Rating</h3>

              <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                  <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${matchPercentage}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
                <span className="absolute text-[32px] font-mono text-primary font-bold">{matchPercentage.toFixed(0)}%</span>
              </div>

              <p className="text-on-surface-variant font-sans text-sm max-w-xs leading-relaxed">
                {matchPercentage >= 80 ? 'Excellent alignment! Your coordinates are highly compatible with this target profile.' :
                 matchPercentage >= 60 ? 'Strong baseline profile match. Minor refinements will yield optimal results.' :
                 matchPercentage >= 40 ? 'Moderate compatibility. Add missing vector credentials to improve matching metrics.' :
                 'Weak alignment detected. Focus on upskilling in core areas prior to deployment.'}
              </p>
            </div>

            {/* Keyword gaps */}
            {matchResult.missing_keywords && matchResult.missing_keywords.length > 0 && (
              <div className="glass-card rounded-[28px] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-yellow-400">warning</span>
                  <h3 className="text-base font-semibold text-on-surface">Missing Coordinates ({matchResult.missing_keywords.length})</h3>
                </div>
                <p className="text-on-surface-variant text-xs mb-4">
                  These target terms are absent from your submitted profile DNA. Consider integrating them:
                </p>
                <div className="flex flex-wrap gap-2">
                  {matchResult.missing_keywords.map((term, idx) => (
                    <span 
                      key={idx}
                      className="px-3.5 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 font-mono text-[12px]"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Insights list */}
            <div className="glass-card rounded-[28px] p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <h3 className="text-base font-semibold text-on-surface">Optimization Coordinates</h3>
              </div>
              <ul className="space-y-3 font-sans text-sm text-on-surface-variant">
                {matchPercentage >= 80 && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>
                    Your professional coordinate matrix matches market specifications with high precision.
                  </li>
                )}
                {matchPercentage >= 60 && matchPercentage < 80 && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                    Most criteria are met. Optimize wording on project descriptions to maximize recruiter matching.
                  </li>
                )}
                {matchPercentage >= 40 && matchPercentage < 60 && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-yellow-500 text-[18px]">error</span>
                    Partial alignment. Introduce project references utilizing the missing terms.
                  </li>
                )}
                {matchPercentage < 40 && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-red-500 text-[18px]">cancel</span>
                    Substantial skill deficit. Prioritize upskilling tasks before targeting this vector.
                  </li>
                )}
              </ul>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!matchResult && !loading && (
        <div className="max-w-2xl mx-auto w-full rounded-[28px] border border-dashed border-white/10 p-12 text-center bg-surface-container/20">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-[56px] mb-4">compare_arrows</span>
          <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface font-bold">Compare Profiles</p>
          <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto leading-relaxed">
            Provide your resume text and target job specifications above, then click compare to audit alignment score.
          </p>
        </div>
      )}

    </div>
  );
};

export default ResumeMatch;
