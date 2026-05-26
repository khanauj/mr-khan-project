import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JobMarketTrends from '../components/JobMarketTrends';

const Dashboard = () => {
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedPrediction = localStorage.getItem('careerPrediction');
    const savedProfile = localStorage.getItem('userProfile');

    if (savedPrediction) {
      setPrediction(JSON.parse(savedPrediction));
    }
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    if (!savedPrediction) {
      navigate('/profile');
    }
  }, [navigate]);

  if (!prediction) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center text-[#e5e2e1]">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary mb-2">progress_activity</span>
          <p className="text-on-surface-variant font-mono text-[12px] uppercase">Mapping Neural Pathways...</p>
        </div>
      </div>
    );
  }

  const confidence = Math.round(prediction.confidence * 100);
  const careerName = prediction.predicted_career;

  const careerInsights = {
    'Data Analyst': {
      why: 'Your combination of data skills and analytical interest makes you a perfect fit for data analysis roles.',
      nextSteps: [
        { title: 'Advanced Distributed Training', desc: 'Fills gap in MLOps/Data scaling for target role', tag: 'High Impact', type: 'school' },
        { title: 'Master Data Visualization', desc: 'Acquire dashboard design parameters (Power BI/Tableau)', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Sarah J.', desc: 'Staff ML Engineer at DeepMind • 94% Path Match', tag: 'Networking', type: 'handshake' }
      ]
    },
    'Business Analyst': {
      why: 'Your business acumen and analytical skills align perfectly with business analyst requirements.',
      nextSteps: [
        { title: 'Stakeholder Management Seminar', desc: 'Master executive communications and parameters', tag: 'High Impact', type: 'school' },
        { title: 'Learn Advanced BI Tools', desc: 'Fills gap in Power BI analytics pipeline', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Marcus K.', desc: 'Lead Business Analyst at Stripe • 88% Match', tag: 'Networking', type: 'handshake' }
      ]
    },
    'Frontend Developer': {
      why: 'Your interest in web technologies and frontend skills indicate a strong fit for frontend development.',
      nextSteps: [
        { title: 'Master React & Next.js Frameworks', desc: 'Construct responsive layouts and state mechanisms', tag: 'High Impact', type: 'school' },
        { title: 'Advanced Tailwind CSS & Animation', desc: 'Learn micro-animations and custom theme tokens', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Leo V.', desc: 'Senior Frontend Architect at Vercel • 91% Match', tag: 'Networking', type: 'handshake' }
      ]
    },
    'Backend Developer': {
      why: 'Your technical skills and problem-solving ability suit backend development perfectly.',
      nextSteps: [
        { title: 'Distributed Systems Architecture', desc: 'Understand API scaling and clustering parameters', tag: 'High Impact', type: 'school' },
        { title: 'Database Optimization Pipeline', desc: 'Master advanced SQL indexes and queries', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Elena R.', desc: 'Staff Backend Engineer at Supabase • 95% Match', tag: 'Networking', type: 'handshake' }
      ]
    },
    'ML Engineer': {
      why: 'Your AI interest and technical skills position you well for machine learning engineering.',
      nextSteps: [
        { title: 'Advanced Distributed Training', desc: 'Fills gap in MLOps/PyTorch model deployment', tag: 'High Impact', type: 'school' },
        { title: 'Transformers and LLM Tuning', desc: 'Learn parameter-efficient fine-tuning coordinates', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Sarah J.', desc: 'Staff ML Engineer at DeepMind • 94% Path Match', tag: 'Networking', type: 'handshake' }
      ]
    },
    'QA Tester': {
      why: 'Your attention to detail and technical skills make you well-suited for quality assurance.',
      nextSteps: [
        { title: 'Automated Testing Architectures', desc: 'Build testing runners using Playwright/Selenium', tag: 'High Impact', type: 'school' },
        { title: 'Load & Performance Analysis', desc: 'Master load testing parameters and benchmarking', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Arthur D.', desc: 'Principal QA Engineer at Gitlab • 89% Match', tag: 'Networking', type: 'handshake' }
      ]
    },
    'Product Manager': {
      why: 'Your combination of business and technical skills aligns with product management roles.',
      nextSteps: [
        { title: 'Product Architecture Frameworks', desc: 'Synthesize roadmaps and stakeholder alignment', tag: 'High Impact', type: 'school' },
        { title: 'User Research & Sentiment Analysis', desc: 'Analyze user analytics feedback data points', tag: 'Skill Delta', type: 'explore' },
        { title: 'Connect with Liam N.', desc: 'Director of Product at OpenAI • 92% Match', tag: 'Networking', type: 'handshake' }
      ]
    }
  };

  const insight = careerInsights[careerName] || {
    why: 'Your profile shows strong potential for this career path.',
    nextSteps: [
      { title: 'Professional Upskilling course', desc: 'Acquire core skills needed for this path', tag: 'High Impact', type: 'school' },
      { title: 'Portfolio Projects Synthesis', desc: 'Construct practical models demonstrating capability', tag: 'Skill Delta', type: 'explore' },
      { title: 'Connect with Professional Mentors', desc: 'Align coordinates with existing sector experts', tag: 'Networking', type: 'handshake' }
    ]
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Background radial glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-100px] left-[50%] -translate-x-1/2"></div>
        <div className="bg-glow-blob w-[500px] h-[500px] bg-tertiary/10 bottom-[20%] right-[-100px]" style={{ animationDelay: '-4s' }}></div>
      </div>

      {/* Hero section */}
      <section className="flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
            <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Neural Mapping Active</span>
        </div>
        <h1 className="text-[40px] md:text-[68px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
          Your Career Blueprint
        </h1>
        <p className="font-sans text-[16px] text-on-surface-variant max-w-xl leading-relaxed">
          Detailed metrics, expansion priorities, and recommended coordinates to transition into your predicted vector.
        </p>
      </section>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Details & Recommendations */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Main info card */}
          <div className="glass-card rounded-[28px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-mono text-[11px] text-primary uppercase tracking-widest">Predicted Horizon</p>
                <h2 className="text-[28px] md:text-[34px] font-bold text-on-surface tracking-tight mt-1">{careerName}</h2>
              </div>
              <span className="material-symbols-outlined text-primary text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>

            {/* Why fits detail */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
              <span className="material-symbols-outlined text-primary text-[24px] mt-0.5">auto_awesome</span>
              <div>
                <h4 className="text-on-surface font-semibold text-sm">Synthesized Fit Justification</h4>
                <p className="text-on-surface-variant text-sm mt-1.5 leading-relaxed">{insight.why}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/5">
              <button
                onClick={() => navigate('/skill-gap')}
                className="btn-primary px-6 py-3 font-mono text-[12px] uppercase tracking-wider flex items-center gap-2"
              >
                Analyze Skill Gaps
                <span className="material-symbols-outlined text-[16px]">radar</span>
              </button>
              <button
                onClick={() => navigate('/career-switch')}
                className="btn-glass px-6 py-3 font-mono text-[12px] uppercase tracking-wider flex items-center gap-2"
              >
                Generate Switched Roadmap
                <span className="material-symbols-outlined text-[16px]">alt_route</span>
              </button>
            </div>
          </div>

          {/* Active recommendations bento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">explore</span> Active Recommendations
            </h3>
            
            <div className="flex flex-col gap-4">
              {insight.nextSteps.map((step, idx) => (
                <div 
                  key={idx}
                  className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between cursor-pointer"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-white/5 shrink-0">
                      <span className="material-symbols-outlined text-primary text-[22px]">{step.type}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-on-surface text-base">{step.title}</h4>
                      <p className="text-on-surface-variant text-xs mt-1">{step.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-none border-white/5 pt-4 md:pt-0 shrink-0">
                    <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded">
                      {step.tag}
                    </span>
                    <button className="text-primary font-mono text-[11px] uppercase tracking-wider flex items-center hover:underline">
                      VIEW <span className="material-symbols-outlined text-[14px] ml-1">arrow_forward</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Stats & Trends */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Intelligence Report Card */}
          <div className="glass-card rounded-[28px] p-6 flex flex-col gap-6">
            <h3 className="text-[18px] font-semibold text-on-surface border-b border-white/10 pb-4">Intelligence Report</h3>
            
            {/* Role Fit Score circular progress */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-on-surface font-semibold">Role Fit Score</h4>
                <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">Based on custom parameters</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                  <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${confidence}, 100`} strokeLinecap="round" strokeWidth="2.5"></path>
                </svg>
                <span className="absolute font-mono text-[13px] text-primary font-bold">{confidence}%</span>
              </div>
            </div>

            {/* Market Velocity slider */}
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-end mb-2">
                <h4 className="text-sm text-on-surface font-semibold">Market Velocity</h4>
                <span className="font-mono text-[11px] text-tertiary flex items-center">
                  <span className="material-symbols-outlined text-[13px] mr-1">trending_up</span> +14% YoY
                </span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-tertiary w-[84%] rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Predicted Horizons mini list */}
          <div className="space-y-4">
            <h3 className="text-[18px] font-semibold text-on-surface">Alternative Horizons</h3>
            
            <div 
              onClick={() => navigate('/compare-careers')}
              className="glass-card glass-card-hover rounded-2xl p-4 border-l-4 border-l-primary cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Full-Stack AI Specialist</h4>
                  <p className="font-mono text-[10px] text-on-surface-variant mt-1">92% Match • High Expansion</p>
                </div>
                <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
              </div>
            </div>

            <div 
              onClick={() => navigate('/compare-careers')}
              className="glass-card glass-card-hover rounded-2xl p-4 border-l-4 border-l-secondary cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-on-surface text-sm">Technical Product Lead</h4>
                  <p className="font-mono text-[10px] text-on-surface-variant mt-1">78% Match • Leadership Horizon</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px]">architecture</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Market trends component */}
      <div className="border-t border-white/5 pt-12">
        <JobMarketTrends highlightCareer={careerName} />
      </div>

    </div>
  );
};

export default Dashboard;
