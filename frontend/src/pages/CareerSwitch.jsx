import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { searchRoadmap } from '../services/api';

const CareerSwitch = () => {
  const [prediction, setPrediction] = useState(null);
  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedRoadmap, setGeneratedRoadmap] = useState(null);

  useEffect(() => {
    const savedPrediction = localStorage.getItem('careerPrediction');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedPrediction) {
      setPrediction(JSON.parse(savedPrediction));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const targetCareer = prediction?.predicted_career || generatedRoadmap?.roadmap?.title || 'Target Career';
  const currentSkills = profile?.skills || [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError('');
    setLoading(true);
    setGeneratedRoadmap(null);

    try {
      const response = await searchRoadmap({
        query: searchQuery,
        current_role: profile?.target_role || null,
        target_role: prediction?.predicted_career || null,
        current_skills: currentSkills
      });
      setGeneratedRoadmap(response);
    } catch (err) {
      setError(err.detail || 'Failed to generate roadmap. Please check if Gemini API key is configured.');
      console.error('Roadmap search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconName = (index) => {
    const icons = ['target', 'school', 'explore', 'handshake', 'mic', 'rocket'];
    return icons[index % icons.length];
  };

  const getStepColorClass = (index) => {
    const colors = ['text-primary bg-primary/10 border-primary/20', 'text-secondary bg-secondary/10 border-secondary/20', 'text-tertiary bg-tertiary/10 border-tertiary/20'];
    return colors[index % colors.length];
  };

  const roadmapSteps = generatedRoadmap?.steps || [
    {
      title: 'Assess Current Skills',
      description: 'Evaluate your existing skills and identify transferable abilities',
      duration: 'Week 1',
      tasks: [
        'Complete skill assessment profile',
        'List all current competencies',
        'Identify strengths and delta coordinates'
      ],
      skills: ['Self-Assessment', 'Profiling']
    },
    {
      title: 'Learn Required Skills',
      description: 'Focus on acquiring the essential skills for your target role',
      duration: 'Weeks 2-8',
      tasks: [
        'Enroll in relevant coursework vectors',
        'Complete hands-on development projects',
        'Join learning circles and forums'
      ],
      skills: ['Target Technologies', 'Theory Principles']
    },
    {
      title: 'Build Portfolio',
      description: 'Create projects showcasing your new skills and expertise',
      duration: 'Weeks 9-12',
      tasks: [
        'Synthesize 3-5 functional models',
        'Document implementation coordinates',
        'Publish portfolio profile repository'
      ],
      skills: ['Documentation', 'Git Pipeline']
    },
    {
      title: 'Network & Connect',
      description: 'Build professional connections in your target industry',
      duration: 'Weeks 13-16',
      tasks: [
        'Participate in developer circles',
        'Connect with industry experts',
        'Engage in peer-group code reviews'
      ],
      skills: ['Social Audits', 'Communications']
    },
    {
      title: 'Apply & Interview',
      description: 'Start applying to positions and prepare for interviews',
      duration: 'Weeks 17+',
      tasks: [
        'Tune resume matching coordinates',
        'Simulate voice AI interview sessions',
        'Deploy application records'
      ],
      skills: ['Interview Readiness', 'Salary Negotiation']
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] left-[50%] -translate-x-1/2"></div>
        <div className="bg-glow-blob w-[600px] h-[600px] bg-secondary/5 bottom-[10%] left-[-100px]" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Route Compiler Active</span>
        </div>
        <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
          Transition Intelligence
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Compile custom pathways. View step-by-step coordinates to transition your skillset from your current baseline.
        </p>
      </div>

      {/* Query Search Panel */}
      <div className="glass-card rounded-[28px] p-6 max-w-3xl mx-auto w-full">
        <h3 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">Request Custom Route</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px]">alt_route</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Transition from Sales to Product Manager"
              className="w-full bg-surface-container-low/50 border border-white/10 rounded-xl pl-12 pr-4 py-4 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/30"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="ai-glow w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {loading ? 'Compiling...' : 'Compile Route'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-sans flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Current profile context indicator */}
      {currentSkills.length > 0 && (
        <div className="glass-card rounded-[28px] p-6 max-w-3xl mx-auto w-full">
          <h4 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">Baseline Skill coordinates</h4>
          <div className="flex flex-wrap gap-2">
            {currentSkills.map(skill => (
              <span key={skill} className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 font-sans text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Steps layout */}
      <div className="relative max-w-3xl mx-auto w-full mt-6">
        <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-white/10" />

        <div className="flex flex-col gap-12">
          {roadmapSteps.map((step, idx) => (
            <div key={idx} className="relative pl-20 flex flex-col gap-3">
              {/* Timeline Indicator icon */}
              <div className={`absolute left-4 -translate-x-1/2 w-9 h-9 rounded-full border flex items-center justify-center text-sm font-mono font-bold ${getStepColorClass(idx)}`}>
                <span className="material-symbols-outlined text-[18px]">{getIconName(idx)}</span>
              </div>

              {/* Step Title Header */}
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <span className="font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider mr-3">
                    {step.duration}
                  </span>
                  <h3 className="text-xl font-bold text-on-surface inline-block">{step.title}</h3>
                </div>
              </div>

              {/* Card info */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
                <p className="text-on-surface-variant text-[14px] leading-relaxed">{step.description}</p>
                
                {/* Action steps checklist */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  {(step.tasks || []).map((task, tidx) => (
                    <div key={tidx} className="flex items-start gap-2.5 text-on-surface-variant text-sm font-sans">
                      <span className="material-symbols-outlined text-green-400 text-[18px] shrink-0 mt-0.5">check_circle</span>
                      <span>{task}</span>
                    </div>
                  ))}
                </div>

                {/* Skill targets */}
                {step.skills && step.skills.length > 0 && (
                  <div className="flex items-center gap-3 mt-2 pt-4 border-t border-white/5 font-mono text-[10px]">
                    <span className="text-on-surface-variant uppercase">TARGET CREDENTIALS:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {step.skills.map((skill, sidx) => (
                        <span key={sidx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-on-surface">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default CareerSwitch;
