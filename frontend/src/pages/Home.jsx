import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, Zap, Sparkles, MessageSquare, Headphones, Share2, Rocket } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: <Target className="w-5 h-5 text-cyan-400" />,
      title: 'Career Prediction',
      desc: 'Our neural networks analyze your personality and market trends to predict high-growth paths optimized for your DNA.',
    },
    {
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      title: 'Skill Gap Analysis',
      desc: "Instantly identify the specific technical and soft skills you're missing to reach the next tier in your industry.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
      title: 'Resume Match',
      desc: 'Upload your CV to see how it benchmarks against top-tier roles. Get AI-powered phrasing and formatting suggestions.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-pink-400" />,
      title: 'AI Chatbot',
      desc: '24/7 access to your personal career advisor. Ask anything from salary negotiation tips to learning roadmaps.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-green-400" />,
      title: 'Interview Practice',
      desc: 'Simulate high-pressure interviews with role-specific technical questions and real-time sentiment analysis.',
    },
    {
      icon: <Share2 className="w-5 h-5 text-orange-400" />,
      title: 'LinkedIn Analyzer',
      desc: 'Optimize your professional social presence to attract recruiters. See who in your network can open doors.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-gradient-to-b from-cyan-500/20 to-purple-500/5 flex items-center justify-center border border-cyan-500/20 mb-8"
        >
          <Rocket className="w-6 h-6 text-cyan-400" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          Discover Your <br /> Perfect <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">Career Path</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed"
        >
          Leverage AI-driven intelligence to map your future, bridge your skill gaps, and land your dream role in the evolving job market.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={() => navigate('/profile')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
          <button className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 w-full max-w-4xl pt-8 border-t border-white/5"
        >
          <div>
            <h3 className="text-4xl font-bold mb-2">10,000+</h3>
            <p className="text-xs tracking-[0.2em] text-gray-500 font-semibold uppercase">Careers Analyzed</p>
          </div>
          <div className="md:border-x border-white/5 px-8">
            <h3 className="text-4xl font-bold text-cyan-400 mb-2">95%</h3>
            <p className="text-xs tracking-[0.2em] text-gray-500 font-semibold uppercase">Accuracy</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold mb-2">50+</h3>
            <p className="text-xs tracking-[0.2em] text-gray-500 font-semibold uppercase">Skills Tracked</p>
          </div>
        </motion.div>
      </section>

      {/* Intelligence Tools Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Intelligence Tools</h2>
          <div className="h-1 w-16 bg-cyan-400 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.div 
              key={tool.title}
              initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-[#0a0a0c] border border-white/5 hover:border-white/15 transition-colors group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{tool.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{tool.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Masterpiece Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Your Career is a <br />
              <span className="text-gray-500 italic font-mono font-medium tracking-tight">Masterpiece</span> in <br />
              Progress
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Skillence doesn't just show you jobs; it maps the constellation of your potential. By layering deep data insights with human ambition, we create a path that feels uniquely yours.
            </p>

            <div className="space-y-8">
              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1 before:h-full before:bg-gradient-to-b before:from-cyan-400 before:to-transparent">
                <h4 className="text-white font-bold mb-1">Dynamic Roadmaps</h4>
                <p className="text-sm text-gray-400">Paths that adapt as you learn and the market shifts.</p>
              </div>
              <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1 before:h-full before:bg-gradient-to-b before:from-purple-400 before:to-transparent">
                <h4 className="text-white font-bold mb-1">Verified Milestones</h4>
                <p className="text-sm text-gray-400">Concrete evidence of your growth and readiness.</p>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-cyan-900/20 to-purple-900/20 border border-white/10 overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
               <div className="relative z-10 glass-card p-4 rounded-xl flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl translate-y-12">
                 <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                   <Target className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <p className="text-xs text-blue-300 font-bold tracking-wider uppercase mb-0.5">AI Recommendation</p>
                   <p className="text-sm text-white font-medium">Transition to Cloud Architecture, 88% Match</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-20">
        <div>
          <h2 className="text-xl font-bold text-cyan-400 mb-1">Skillence</h2>
          <p className="text-xs text-gray-600">© 2024 Skillence Intelligence Systems. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Career Network</a>
        </div>
      </footer>

    </div>
  );
};

export default Home;
