import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSkillGap } from '../services/api';

const COURSES = {
  'Data Visualization': [
    { title: 'Data Vis for Designers', level: 'ADVANCED LEVEL', time: '12h', rating: '4.9', url: 'https://coursera.org', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600' }
  ],
  'React Fundamentals': [
    { title: 'React for UI Specialists', level: 'INTERMEDIATE LEVEL', time: '8h', rating: '4.7', url: 'https://udemy.com', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600' }
  ],
  'Business Strategy': [
    { title: 'Business of UX Design', level: 'PROFESSIONAL LEVEL', time: '15h', rating: '5.0', url: 'https://youtube.com', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600' }
  ]
};

const defaultCourses = [
  { title: 'Advanced Technical Architecture', level: 'ADVANCED LEVEL', time: '12h', rating: '4.9', url: '#', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600' },
  { title: 'Modern Framework Fundamentals', level: 'INTERMEDIATE LEVEL', time: '8h', rating: '4.7', url: '#', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600' },
  { title: 'Strategic Business Principles', level: 'PROFESSIONAL LEVEL', time: '15h', rating: '5.0', url: '#', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600' }
];

const SkillGap = () => {
  const [currentSkills, setCurrentSkills] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setCurrentSkills(profile.skills || ['User Experience Design', 'Figma Mastery', 'Rapid Prototyping', 'Design Systems', 'Agile Methodology', 'Stakeholder Management']);
    } else {
      setCurrentSkills(['Python', 'SQL', 'Excel', 'Communication']);
    }

    const savedPrediction = localStorage.getItem('careerPrediction');
    if (savedPrediction) {
      try {
        const prediction = JSON.parse(savedPrediction);
        setTargetRole(prediction.career || prediction.predicted_career || 'Senior Product Designer');
      } catch { /* ignore */ }
    } else {
      setTargetRole('Data Analyst');
    }
  }, []);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!targetRole) {
      setError('Please enter a target role.');
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
      setAnalysis({
        missing_skills: ['Statistics', 'ML', 'Power BI'],
        readiness_level: 'Intermediate',
      });
    } finally {
      setLoading(false);
    }
  };

  const missingSkills = analysis?.missing_skills || ['Statistics', 'ML', 'Power BI', 'Python'];
  const readiness = analysis?.readiness_level || 'Intermediate';

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Background radial glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-secondary/15 top-[-100px] right-[-100px]"></div>
        <div className="bg-glow-blob w-[600px] h-[600px] bg-primary/10 bottom-[10%] left-[-100px]" style={{ animationDelay: '-6s' }}></div>
      </div>

      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Delta Mapping Active</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
          Skill Delta Analysis
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Reverse-engineer job market requirements. Identify immediate gaps between your profile DNA and target specifications.
        </p>
      </div>

      {/* Target input container */}
      <form onSubmit={handleAnalyze} className="glass-card rounded-[28px] p-6 max-w-3xl mx-auto w-full relative">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">search</span>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Specify Target Position (e.g. Senior Machine Learning Engineer)"
              className="w-full bg-surface-container-low/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ai-glow w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
          >
            {loading ? 'Synthesizing...' : 'Calculate Delta'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-3 font-sans px-2">{error}</p>}
      </form>

      {/* Comparison Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Your Profile DNA vs Missing Skills */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Current Skills Badge Container */}
          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Your Skill Matrix</h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {currentSkills.map(skill => (
                <span 
                  key={skill} 
                  className="px-3.5 py-2 rounded-lg bg-white/5 border border-white/5 font-sans text-[13px] text-on-surface hover:border-white/20 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills Badge Container */}
          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">error</span>
              </div>
              <h3 className="text-lg font-semibold text-on-surface">Target Skill Gaps</h3>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {missingSkills.map(skill => (
                <span 
                  key={skill} 
                  className="px-3.5 py-2 rounded-lg bg-secondary/10 border border-secondary/20 font-sans text-[13px] text-secondary hover:bg-secondary/20 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Readiness and Analysis metrics */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-card rounded-[28px] p-6 flex flex-col gap-6">
            <h3 className="text-base font-semibold text-on-surface border-b border-white/10 pb-4">Readiness Intelligence</h3>
            
            {/* Circular readiness score */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-on-surface">Readiness Index</h4>
                <p className="font-mono text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wider">{readiness}</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                  <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${readiness === 'Advanced' ? 85 : readiness === 'Intermediate' ? 60 : 35}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
                <span className="absolute font-mono text-[12px] text-secondary font-bold">
                  {readiness === 'Advanced' ? '85%' : readiness === 'Intermediate' ? '60%' : '35%'}
                </span>
              </div>
            </div>

            <div className="text-xs text-on-surface-variant leading-relaxed pt-2 border-t border-white/5">
              Our analysis calculations indicate you require roughly {missingSkills.length} upskilling vectors to meet recruitment benchmarks.
            </div>
          </div>
        </div>

      </div>

      {/* Path to Mastery: Courses */}
      <div className="space-y-6 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Path to Mastery</h2>
          <button className="text-primary font-mono text-[11px] uppercase tracking-widest flex items-center gap-1 hover:underline">
            VIEW ALL VECTORS <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(missingSkills.map(s => COURSES[s]?.[0] || false).filter(Boolean).length > 0 
            ? missingSkills.map(s => COURSES[s]?.[0] || defaultCourses[0]).slice(0, 3) 
            : defaultCourses
          ).map((course, idx) => (
            <a
              key={idx}
              href={course.url}
              target="_blank"
              rel="noreferrer"
              className="glass-card glass-card-hover block group overflow-hidden"
            >
              <div className="aspect-video relative overflow-hidden border-b border-white/5 bg-black/40">
                <img 
                  src={course.image} 
                  alt={course.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-5 flex flex-col gap-3">
                <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded w-max">
                  {course.level}
                </span>
                <h4 className="font-semibold text-on-surface text-base group-hover:text-primary transition-colors leading-snug">
                  {course.title}
                </h4>
                <div className="flex items-center gap-4 text-on-surface-variant font-mono text-[11px] mt-2 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> {course.time}</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-yellow-400">star</span> {course.rating}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SkillGap;
