import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Hyperspeed from '../components/Hyperspeed/Hyperspeed';
import { hyperspeedPresets } from '../components/Hyperspeed/HyperSpeedPresets';
import LaptopScene from '../components/LaptopScene';
import ScrollOrbitExperience from '../components/ScrollOrbitExperience';
import SoftAurora from '../components/SoftAurora';

const homeHyperspeedOptions = {
  ...hyperspeedPresets.one,
  speedUp: 3,
  fov: 96,
  fovSpeedUp: 170,
  lightPairsPerRoadWay: 55,
  totalSideLightSticks: 34,
  movingAwaySpeed: [80, 110],
  movingCloserSpeed: [-170, -230],
  carLightsLength: [18, 95],
  carLightsRadius: [0.04, 0.16],
  colors: {
    ...hyperspeedPresets.one.colors,
    roadColor: 0x050507,
    islandColor: 0x06060a,
    background: 0x02020a,
    leftCars: [0xff4fd8, 0x9b5cff, 0x7c3cff],
    rightCars: [0x00e5ff, 0x1b8dff, 0x00ffd5],
    sticks: 0x00e5ff
  }
};

// Animated Stat Counter helper component
const StatCounter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / target));
    
    const timer = setInterval(() => {
      start += Math.ceil(target / 100);
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, Math.max(stepTime, 20));

    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-[#e5e2e1] overflow-x-hidden pt-20">
      {/* Ambient background glowing blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/20 top-[-200px] right-[-200px]"></div>
        <div className="bg-glow-blob w-[600px] h-[600px] bg-tertiary/10 bottom-[-100px] left-[-100px]" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative isolate min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Hyperspeed Background */}
        <div className="absolute inset-0 z-0 bg-black pointer-events-none" aria-hidden="true">
          <Hyperspeed effectOptions={homeHyperspeedOptions} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(192,193,255,0.08),transparent_40%),linear-gradient(180deg,rgba(10,10,10,0.1)_0%,rgba(10,10,10,0.7)_70%,#0a0a0a_100%)]" />
        </div>

        <div className="absolute inset-0 z-[1] opacity-70 mix-blend-screen" aria-hidden="true">
          <SoftAurora
            speed={0.48}
            scale={1.65}
            brightness={0.92}
            color1="#89ceff"
            color2="#ddb7ff"
            noiseFrequency={2.2}
            noiseAmplitude={0.88}
            bandHeight={0.38}
            bandSpread={1.18}
            octaveDecay={0.16}
            layerOffset={0.42}
            colorSpeed={0.82}
            enableMouseInteraction={true}
            mouseInfluence={0.18}
          />
        </div>

        <div className="absolute inset-0 z-[2] pointer-events-none bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(10,10,10,0.16)_45%,rgba(10,10,10,0.74)_100%)]" />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel"
          >
            <div className="w-2 h-2 rounded-full bg-primary relative ai-pulse"></div>
            <span className="font-mono text-[12px] uppercase tracking-widest text-primary">
              AI Intelligence Engine v2.0 Active
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[42px] md:text-[68px] lg:text-[80px] font-black tracking-tight leading-tight gradient-text max-w-3xl"
          >
            Your Career,<br />Engineered by Data
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-[16px] md:text-[18px] text-on-surface-variant max-w-xl leading-relaxed mt-2"
          >
            AI-powered career intelligence to predict your ideal role, close skill gaps, optimize resumes, and simulate interviews with absolute precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-6"
          >
            <button
              onClick={() => navigate('/profile')}
              className="btn-primary px-8 py-4 rounded-full font-mono text-[13px] uppercase tracking-wider flex items-center gap-2"
            >
              Start Career Analysis
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate('/chatbot')}
              className="btn-glass px-8 py-4 rounded-full font-mono text-[13px] uppercase tracking-wider flex items-center gap-2"
            >
              Try AI Career Coach
            </button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 border-y border-white/5 bg-surface-container-lowest/40 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            <div className="text-center px-4">
              <div className="text-[36px] md:text-[44px] text-primary font-light mb-1 tracking-wide">
                <StatCounter target={10000} suffix="+" />
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Careers Analyzed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-[36px] md:text-[44px] text-primary font-light mb-1 tracking-wide">
                <StatCounter target={95} suffix="%" />
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Prediction Accuracy</div>
            </div>
            <div className="text-center px-4">
              <div className="text-[36px] md:text-[44px] text-primary font-light mb-1 tracking-wide">
                <StatCounter target={50} suffix="+" />
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Skills Tracked</div>
            </div>
            <div className="text-center px-4">
              <div className="text-[36px] md:text-[44px] text-primary font-light mb-1 tracking-wide">
                <StatCounter target={87} suffix="%" />
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">Interview Success</div>
            </div>
          </div>
        </div>
      </section>

      <ScrollOrbitExperience />

      {/* Laptop Showcase Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-[11px] tracking-[0.2em] font-bold text-primary uppercase mb-3">
              INTELLIGENT INSIGHTS
            </p>
            <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
              Reverse-Engineer Your Success
            </h2>
            <p className="text-on-surface-variant max-w-lg mx-auto text-[14px]">
              Our platform continuously maps shifting job market demands to build a customized, bulletproof roadmap for you.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10"
          >
            <LaptopScene />
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Tools Section */}
      <section className="py-20 px-6 relative max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-3">
            Precision Intelligence Capabilities
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto text-[14px]">
            Comprehensive toolsets designed to accelerate your career growth and optimize professional touchpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Main Bento item (Career Prediction) */}
          <div 
            onClick={() => navigate('/profile')}
            className="glass-card glass-card-hover md:col-span-2 md:row-span-2 p-8 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                <span className="material-symbols-outlined">timeline</span>
              </div>
              <span className="font-mono text-[11px] px-3 py-1 bg-white/5 rounded-full border border-white/10 text-on-surface-variant">Core Engine</span>
            </div>
            <div>
              <h3 className="font-geist text-2xl font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors">
                Career Prediction
              </h3>
              <p className="text-on-surface-variant text-[14px] leading-relaxed max-w-md">
                Proprietary machine learning models analyze your background, education, and interest parameters to predict high-accuracy career trajectories with probability indices.
              </p>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/15 transition-all duration-500"></div>
          </div>

          {/* Resume Matching */}
          <div 
            onClick={() => navigate('/resume-match')}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/20 text-tertiary">
              <span className="material-symbols-outlined">document_scanner</span>
            </div>
            <div>
              <h3 className="font-geist text-lg font-semibold text-on-surface mb-1 group-hover:text-tertiary transition-colors">
                Resume Intelligence
              </h3>
              <p className="text-on-surface-variant text-[13px] leading-relaxed">
                Algorithmic scoring against target job descriptions to identify missing keywords and boost ATS visibility.
              </p>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div 
            onClick={() => navigate('/skill-gap')}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 text-secondary">
              <span className="material-symbols-outlined">radar</span>
            </div>
            <div>
              <h3 className="font-geist text-lg font-semibold text-on-surface mb-1 group-hover:text-secondary transition-colors">
                Skill Gap Analysis
              </h3>
              <p className="text-on-surface-variant text-[13px] leading-relaxed">
                Real-time delta computation to extract gaps in your tech stack and map targeted upskilling objectives.
              </p>
            </div>
          </div>

          {/* AI Interview Coach */}
          <div 
            onClick={() => navigate('/interview')}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center border border-red-400/20 text-red-300">
              <span className="material-symbols-outlined">mic</span>
            </div>
            <div>
              <h3 className="font-geist text-lg font-semibold text-on-surface mb-1 group-hover:text-red-300 transition-colors">
                AI Interview Practice
              </h3>
              <p className="text-on-surface-variant text-[13px] leading-relaxed">
                Interactive simulator featuring real-time conversational queries, behavioral feedback, and scoring metrics.
              </p>
            </div>
          </div>

          {/* Career Switching */}
          <div 
            onClick={() => navigate('/career-switch')}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <span className="material-symbols-outlined">alt_route</span>
            </div>
            <div>
              <h3 className="font-geist text-lg font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                Career Transitions
              </h3>
              <p className="text-on-surface-variant text-[13px] leading-relaxed">
                Generate high-efficiency roadmaps indicating immediate adjacencies that require minimal pivot efforts.
              </p>
            </div>
          </div>

          {/* LinkedIn Optimization */}
          <div 
            onClick={() => navigate('/linkedin-analyzer')}
            className="glass-card glass-card-hover p-6 flex flex-col justify-between group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/20 text-tertiary">
              <span className="material-symbols-outlined">hub</span>
            </div>
            <div>
              <h3 className="font-geist text-lg font-semibold text-on-surface mb-1 group-hover:text-tertiary transition-colors">
                LinkedIn Optimization
              </h3>
              <p className="text-on-surface-variant text-[13px] leading-relaxed">
                Structural suggestions for profiles to build high inbound recruiter velocity and network growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Masterpiece Showcase Section */}
      <section className="py-24 px-6 max-w-[1200px] mx-auto border-t border-white/5">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface leading-tight">
              Your Career is a <br />
              <span className="text-on-surface-variant italic font-mono font-medium tracking-tight">Masterpiece</span> in Progress
            </h2>
            <p className="text-on-surface-variant text-[15px] leading-relaxed">
              Skillence goes beyond static job postings; it diagrams the constellation of your potential. By combining ML algorithms with actual human career paths, we craft transitions that are uniquely yours.
            </p>

            <div className="space-y-6 mt-4">
              <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1 before:h-full before:bg-gradient-to-b before:from-cyan-400 before:to-transparent">
                <h4 className="text-on-surface font-semibold">Dynamic Roadmaps</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Adaptable vectors that recalibrate as you complete learning targets and market demands shift.</p>
              </div>
              <div className="relative pl-6 before:absolute before:left-0 before:top-1.5 before:w-1 before:h-full before:bg-gradient-to-b before:from-purple-400 before:to-transparent">
                <h4 className="text-on-surface font-semibold">Verified Milestones</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">Definitive benchmarks that validate your competence indicators directly to recruiter networks.</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative aspect-video rounded-3xl bg-gradient-to-tr from-cyan-900/10 to-purple-900/10 border border-white/10 overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
              <div className="glass-card p-5 rounded-2xl flex items-center gap-4 bg-black/60 border border-white/10 shadow-2xl translate-y-6 max-w-sm">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[20px]">target</span>
                </div>
                <div>
                  <p className="text-[10px] text-primary font-mono tracking-wider uppercase font-bold">AI PATH RECOMMENDATION</p>
                  <p className="text-sm text-on-surface font-medium mt-0.5">Transition to Cloud Architecture, 88% Match</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
