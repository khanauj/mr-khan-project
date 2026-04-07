import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const guestStats = [
  { label: 'AI Career Prediction', desc: 'Enter your profile and see a data-backed career forecast without creating an account.' },
  { label: 'Local Storage', desc: 'All progress lives in your browser until you decide to sign up or sync to Supabase.' },
  { label: 'Hyperspeed Preview', desc: 'Enjoy the neon tunnel hero and feel the premium motion flow before you commit.' },
];

const GuestExperience = () => {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  useEffect(() => {
    enterGuestMode();
  }, [enterGuestMode]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase tracking-[0.4em] text-gray-300">Guest Mode</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Explore the AI career lab without signing in.
          </h1>
          <p className="text-gray-400 text-lg">
            Try every tool, collect insights, and keep your profile safe in your browser. When you are ready, upgrade for cloud backup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all"
            >
              Build my profile
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/guest-experience')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-white/10 text-gray-100 hover:border-white/20 transition-all"
            >
              Stay in guest mode
            </button>
          </div>
        </motion.div>
      </div>

      <div className="bg-[#08080d] border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-12 grid gap-6 md:grid-cols-2">
          {guestStats.map((stat) => (
            <div key={stat.label} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 glass-card">
              <div className="flex items-center gap-3 mb-3 text-sm uppercase tracking-[0.3em] text-gray-500">
                <Sparkles className="w-4 h-4 text-cyan-400" /> {stat.label}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black/80 border-t border-white/5 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">
              Admin-only features (Admin Dashboard, infrastructure controls, activity logs) still require the secret password on the <strong className="text-white">Admin</strong> route.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500 text-indigo-300 hover:text-white hover:border-indigo-300 transition-all"
          >
            Go to admin (password required)
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestExperience;
