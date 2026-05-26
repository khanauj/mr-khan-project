import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { predictCareer } from '../services/api';

const loadSavedProfile = () => {
  try {
    const saved = localStorage.getItem('userProfile');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return { education: '', skills: [], interest: '', experience_years: 0 };
};

const educations = ['BCA', 'BBA', 'BA', 'BSc', 'BCom', 'MBA', 'BTech', 'MTech', 'PhD'];
const allSkills = [
  'Python', 'SQL', 'Excel', 'Power BI', 'JavaScript', 
  'HTML', 'CSS', 'React', 'Node.js', 'Cloud Architecture', 'UX Design', 'Communication', 'Statistics', 'ML'
];

const Profile = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(loadSavedProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState(null);
  
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);

  useEffect(() => {
    try {
      const savedPred = localStorage.getItem('careerPrediction');
      if (savedPred) setPrediction(JSON.parse(savedPred));
    } catch { /* ignore */ }
  }, []);

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
    setSkillDropdownOpen(false);
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.education || !formData.interest || formData.skills.length === 0) {
      setError('Please fill in all required fields (Education, Skills, Interest)');
      setLoading(false);
      return;
    }

    try {
      const response = await predictCareer(formData);
      localStorage.setItem('careerPrediction', JSON.stringify(response));
      localStorage.setItem('userProfile', JSON.stringify(formData));
      setPrediction(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err?.detail || err?.message || 'Failed to analyze career. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const marketAlign = 94;
  const skillProfic = formData.experience_years > 2 ? 82 : 45;
  const futureGrowth = 88;

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[700px] h-[700px] bg-primary/10 top-[20%] right-[-100px]"></div>
        <div className="bg-glow-blob w-[500px] h-[500px] bg-secondary/10 bottom-[10%] left-[-200px]" style={{ animationDelay: '-3s' }}></div>
      </div>

      <div className="flex flex-col items-center text-center gap-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Neural Mapper v2.0</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-3xl">
          Construct Your Profile DNA
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Provide your academic coordinates and core competencies to let our machine learning systems synthesize your optimal trajectory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Profile Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-card rounded-[28px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-semibold text-on-surface">Career Coordinates</h2>
                <p className="font-sans text-sm text-on-surface-variant mt-1">Specify parameters to define your horizon</p>
              </div>
              <span className="material-symbols-outlined text-primary text-[32px]">psychology</span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Academic Level */}
              <div className="space-y-2">
                <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Academic Orbit</label>
                <div className="relative">
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Education Level</option>
                    {educations.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              {/* Skills DNA */}
              <div className="space-y-2">
                <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Competency Matrix</label>
                <div className="min-h-[56px] bg-surface-container/50 border border-white/10 rounded-lg p-3 flex flex-wrap gap-2 relative">
                  {formData.skills.map(skill => (
                    <span 
                      key={skill} 
                      className="px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 font-mono text-[13px] text-primary flex items-center gap-1.5 cursor-pointer hover:bg-primary/20 transition-colors"
                    >
                      {skill}
                      <span onClick={() => removeSkill(skill)} className="material-symbols-outlined text-[14px] hover:text-white transition-colors">close</span>
                    </span>
                  ))}
                  
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setSkillDropdownOpen(o => !o)}
                      className="px-3 py-1.5 rounded-md bg-white/5 border border-dashed border-white/20 font-mono text-[13px] text-on-surface-variant hover:text-on-surface hover:border-white/40 transition-colors flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span> Add Skill
                    </button>
                    
                    <AnimatePresence>
                      {skillDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setSkillDropdownOpen(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-surface-container border border-white/10 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto"
                          >
                            {allSkills.filter(s => !formData.skills.includes(s)).map(skill => (
                              <button
                                key={skill} type="button"
                                onClick={() => handleSkillToggle(skill)}
                                className="w-full text-left px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors font-sans"
                              >
                                {skill}
                              </button>
                            ))}
                            {allSkills.filter(s => !formData.skills.includes(s)).length === 0 && (
                              <div className="px-4 py-2 text-sm text-on-surface-variant/50">All skills added</div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Years Experience Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider">Time in Orbit (Experience)</label>
                  <div className="font-sans text-sm font-semibold text-primary">
                    <span className="text-2xl font-black">{formData.experience_years}</span> Years
                  </div>
                </div>
                <div className="pt-2">
                  <input
                    type="range" min="0" max="15"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                    className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary transition-all custom-slider"
                  />
                  <style jsx="true">{`
                    .custom-slider::-webkit-slider-thumb {
                      appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #c0c1ff; cursor: pointer; box-shadow: 0 0 10px rgba(192, 193, 255, 0.5);
                    }
                  `}</style>
                  <div className="flex justify-between mt-3 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/50">
                    <span>Junior Orbit</span>
                    <span>Mid Orbit</span>
                    <span>Principal Orbit</span>
                  </div>
                </div>
              </div>

              {/* Interest */}
              <div className="space-y-2">
                <label className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider block">Core Interest Vector</label>
                <input
                  type="text"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  placeholder="e.g. Data, Web, AI, Business, Sales, Teaching"
                  className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="ai-glow w-full py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Synthesizing Pathway...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      Synthesize Trajectory
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Prediction results */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">insights</span>
            <h2 className="text-lg font-semibold text-on-surface">Intelligence Report</h2>
          </div>

          {!prediction ? (
            <div className="h-[460px] rounded-[28px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 bg-surface-container/20">
               <span className="material-symbols-outlined text-primary/20 text-[56px] mb-4">radar</span>
               <p className="font-mono text-[11px] uppercase tracking-widest text-on-surface font-bold">Awaiting Vector Parameters</p>
               <p className="text-on-surface-variant text-sm mt-2 max-w-xs leading-relaxed">
                 Configure your academic coordinates and competency matrix to run the prediction pipeline.
               </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Primary Prediction */}
              <div className="glass-card rounded-[28px] p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant mb-4">Primary Vector Fit</h3>
                
                <div className="text-2xl font-bold gradient-text inline-block mb-3">
                  {prediction.predicted_career || prediction.career || "AI Systems Architect"}
                </div>
                <p className="text-on-surface-variant text-[14px] leading-relaxed">
                  Based on your academic orbit of {formData.education || "BCA"}, custom skill dna ({formData.skills.slice(0, 3).join(', ')}...), and {formData.experience_years} years of time in orbit, you align with high confidence.
                </p>
              </div>

              {/* Confidence bars */}
              <div className="glass-card rounded-[28px] p-6 space-y-5">
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-on-surface-variant">Probability Horizon</h3>
                
                <div className="space-y-4 font-sans">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                       <span className="text-on-surface">Market Alignment</span>
                       <span className="text-primary font-bold">{marketAlign}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${marketAlign}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-primary" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                       <span className="text-on-surface">Skill Proficiency</span>
                       <span className="text-secondary font-bold">{skillProfic}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${skillProfic}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-secondary" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                       <span className="text-on-surface">Future Expansion</span>
                       <span className="text-tertiary font-bold">{futureGrowth}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${futureGrowth}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-tertiary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizon Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-primary flex-1 py-3 font-mono text-[12px] uppercase tracking-wider"
                >
                  Enter Dashboard
                </button>
                <button
                  onClick={() => navigate('/skill-gap')}
                  className="btn-glass flex-1 py-3 font-mono text-[12px] uppercase tracking-wider"
                >
                  Analyze Gaps
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
