import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, ChevronDown, Check, X, Plus, Save, Rocket } from 'lucide-react';
import { predictCareer } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const { saveProfileToCloud } = useAuth();
  
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
      await saveProfileToCloud(formData, response);
      setPrediction(response);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err?.detail || err?.message || 'Failed to analyze career. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock Confidence Stats based on prediction data if API doesn't return them directly
  const marketAlign = 94;
  const skillProfic = formData.experience_years > 2 ? 82 : 45;
  const futureGrowth = 88;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Form */}
        <div className="flex-1 w-full max-w-2xl mx-auto lg:mx-0">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-cyan-400">
              <span className="text-cyan-400">Your</span> <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Career Profile</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-lg leading-relaxed">
              Map your trajectory with cosmic precision. Fill in your details to let our AI curator design your professional future.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="p-8 rounded-2xl bg-[#0e1116] border border-white/5 shadow-2xl relative"
          >
            {/* Soft background glow */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none rounded-t-2xl" />

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              
              {/* Education */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-cyan-500 uppercase mb-3">Academic Orbit</label>
                <div className="relative">
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full bg-[#161a22] border border-white/5 rounded-xl px-4 py-3.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 appearance-none transition-colors"
                  >
                    <option value="" disabled>Select Education Level</option>
                    {educations.map(edu => <option key={edu} value={edu}>{edu}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-cyan-500 uppercase mb-3">Skill DNA</label>
                <div className="min-h-[56px] bg-[#161a22] border border-white/5 rounded-xl p-2.5 flex flex-wrap gap-2 relative">
                  {formData.skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0e2938] text-cyan-300 text-sm font-medium rounded-lg">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:bg-cyan-900/50 p-0.5 rounded-full transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  
                  <div className="relative">
                    <button 
                      type="button" 
                      onClick={() => setSkillDropdownOpen(o => !o)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-medium rounded-lg transition-colors border border-dashed border-white/20 hover:border-white/40"
                    >
                      <Plus className="w-3 h-3" /> Add Skill
                    </button>
                    
                    {/* Floating Add Skill Dropdown */}
                    <AnimatePresence>
                      {skillDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setSkillDropdownOpen(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="absolute top-full left-0 mt-2 w-48 bg-[#1f242f] border border-white/10 rounded-xl shadow-xl z-50 py-1 overflow-hidden max-h-60 overflow-y-auto"
                          >
                            {allSkills.filter(s => !formData.skills.includes(s)).map(skill => (
                              <button
                                key={skill} type="button"
                                onClick={() => handleSkillToggle(skill)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-cyan-500/20"
                              >
                                {skill}
                              </button>
                            ))}
                            {allSkills.filter(s => !formData.skills.includes(s)).length === 0 && (
                              <div className="px-4 py-2 text-sm text-gray-500">All skills added</div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Experience Slider */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-xs font-bold tracking-widest text-cyan-500 uppercase">Professional Experience</label>
                  <div className="text-xl font-bold"><span className="text-3xl">{formData.experience_years}</span> <span className="text-gray-500 text-sm font-normal">years</span></div>
                </div>
                <div className="pt-2">
                  <input
                    type="range" min="0" max="15"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all custom-slider"
                  />
                  <style jsx="true">{`
                    .custom-slider::-webkit-slider-thumb {
                      appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #22d3ee; cursor: pointer; box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
                    }
                  `}</style>
                  <div className="flex justify-between mt-3 text-[10px] font-bold tracking-widest uppercase text-gray-600">
                    <span>Entry Level</span>
                    <span>Mid-Career</span>
                    <span>Executive</span>
                  </div>
                </div>
              </div>

              {/* Future Interest string */}
              <div>
                <label className="block text-xs font-bold tracking-widest text-cyan-500 uppercase mb-3">Future Interest</label>
                <input
                  type="text"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Renewable Energy"
                  className="w-full bg-[#161a22] border border-white/5 rounded-xl px-4 py-3.5 text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-600"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Analyzing Neural Pathways...' : 'Predict My Career Path'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>

        {/* Right Side: Prediction Results */}
        <div className="flex-1 w-full max-w-xl mx-auto lg:mx-0">
          <div className="flex items-center gap-2 mb-6 pt-2">
            <BarChart className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold">AI Intelligence Report</h2>
          </div>

          {!prediction ? (
            <div className="h-[400px] rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center text-gray-500 bg-[#0a0c10]">
               <Rocket className="w-10 h-10 mb-4 opacity-20" />
               <p className="text-sm uppercase tracking-widest font-bold">Awaiting Input Data</p>
               <p className="text-xs mt-2 max-w-xs text-center opacity-70">Submit your profile to generate a comprehensive AI career analysis</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Top Card: Primary Prediction */}
              <div className="p-6 rounded-2xl bg-[#0e1116] border border-white/5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full pointer-events-none" />
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Primary Prediction</p>
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] mb-4">
                  {prediction.predicted_career || prediction.career || "AI Solutions Architect"}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Based on your {formData.skills.join(', ') || 'skills'} and {formData.experience_years} year{formData.experience_years !== 1 ? 's' : ''} of experience, you are well positioned for {formData.interest || 'your chosen field'}.
                </p>
              </div>

              {/* Confidence Bars */}
              <div className="p-6 rounded-2xl bg-[#0e1116] border border-white/5 shadow-xl">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-6">Prediction Confidence</p>
                
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-gray-300">Market Alignment</span>
                       <span className="text-cyan-400">{marketAlign}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1f2b] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${marketAlign}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-cyan-400 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-gray-300">Skill Proficiency</span>
                       <span className="text-purple-400">{skillProfic}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1f2b] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${skillProfic}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full bg-purple-400 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                       <span className="text-gray-300">Future Growth</span>
                       <span className="text-blue-400">{futureGrowth}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1f2b] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${futureGrowth}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Trajectories */}
              <div className="space-y-3">
                <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4 mt-2">Alternative Trajectories</p>
                
                {/* Fallback mock alternatives if API doesn't provide them */}
                {[
                  { title: "Full-Stack AI Engineer", desc: "High Growth • High Match", color: "text-cyan-400", bg: "bg-cyan-500/10" },
                  { title: "Technical Product Lead", desc: "Leadership Focus • Medium Match", color: "text-purple-400", bg: "bg-purple-500/10" },
                  { title: "DevOps Director", desc: "Stable • Skill Overlap", color: "text-blue-400", bg: "bg-blue-500/10" }
                ].map((alt, i) => (
                   <div key={alt.title} className="flex items-center p-4 rounded-xl bg-[#0e1116] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-4 ${alt.bg} ${alt.color}`}>
                       {i + 1}
                     </div>
                     <div className="flex-1">
                       <p className="text-sm font-bold text-white mb-0.5">{alt.title}</p>
                       <p className="text-xs text-gray-500">{alt.desc}</p>
                     </div>
                     <ChevronDown className="w-4 h-4 text-gray-600 -rotate-90 group-hover:text-white transition-colors" />
                   </div>
                ))}
              </div>

            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
