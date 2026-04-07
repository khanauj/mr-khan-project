import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, AlertCircle, Clock, Star, ExternalLink, ChevronRight } from 'lucide-react';
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
  ],
  // Fallbacks for other generic missing skills
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
      setCurrentSkills(['Python', 'SQL', 'Data Analysis']);
    }

    const savedPrediction = localStorage.getItem('careerPrediction');
    if (savedPrediction) {
      try {
        const prediction = JSON.parse(savedPrediction);
        setTargetRole(prediction.career || prediction.predicted_career || 'Senior Product Designer');
      } catch { /* ignore */ }
    } else {
      setTargetRole('Senior Product Designer');
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
      // Mock Data if backend falls back
      setAnalysis({
        missing_skills: ['Data Visualization', 'React Fundamentals', 'A/B Testing', 'Business Strategy'],
        readiness_level: 'Intermediate',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock Analysis if none available
  const missingSkills = analysis?.missing_skills || ['Data Visualization', 'React Fundamentals', 'A/B Testing', 'Business Strategy'];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-[#050505] text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Analyze your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Career Orbit</span>
          </h1>
          <p className="text-gray-400 text-lg lg:text-xl">
            Map your current skill set against industry demands to find your path to mastery.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleAnalyze} className="relative mb-14 drop-shadow-[0_0_30px_rgba(34,211,238,0.1)]">
          <div className="absolute inset-x-0 -top-4 bottom-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-2xl -z-10 rounded-full" />
          <div className="bg-[#0e1116] border border-white/10 rounded-2xl flex items-center p-2 transition-colors focus-within:border-cyan-500/50">
            <Search className="w-6 h-6 text-gray-500 ml-4 mr-2 hidden sm:block" />
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Enter target job role (e.g. Senior Product Designer)"
              className="flex-1 bg-transparent border-none focus:outline-none text-lg text-white px-4 placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="ml-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyse'}
            </button>
          </div>
          {error && <p className="text-red-400 text-sm mt-3 px-4">{error}</p>}
        </form>

        {/* Skills Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Your Skills */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold">Your Skills</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {currentSkills.map(skill => (
                <span key={skill} className="px-4 py-2 bg-[#0a1922] border border-cyan-900/50 text-cyan-400 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold">Missing Skills</h2>
            </div>
            {analysis || !analysis ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-3">
                {missingSkills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-[#1a0a19] border border-fuchsia-900/50 text-fuchsia-400 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </motion.div>
            ) : null}
          </div>
        </div>

        {/* Path to Mastery */}
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-bold">Path to Mastery</h2>
          <button className="text-cyan-400 text-sm font-bold hover:text-cyan-300 transition-colors flex items-center gap-1">
            View all courses <ChevronRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(missingSkills.map(s => COURSES[s]?.[0] || false).filter(Boolean).length > 0 
            ? missingSkills.map(s => COURSES[s]?.[0] || defaultCourses[0]).slice(0, 3) 
            : defaultCourses
          ).map((course, i) => (
            <motion.a
              key={i}
              href={course.url}
              target="_blank"
              rel="noreferrer"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group block bg-[#0e1116] border border-white/5 hover:border-cyan-500/30 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]"
            >
              <div className="aspect-video overflow-hidden relative border-b border-white/5">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold tracking-widest text-[#d87bff] uppercase mb-2">
                  {course.level}
                </p>
                <h3 className="text-lg font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 text-gray-500 text-sm font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {course.time}</span>
                  <span className="flex items-center gap-1.5"><Star className="w-4 h-4" /> {course.rating}</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </div>
  );
};

export default SkillGap;
