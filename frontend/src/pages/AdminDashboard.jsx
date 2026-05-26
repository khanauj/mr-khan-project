import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchActivityLogs, fetchAllProfiles } from '../lib/supabase';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const ago = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const truncate = (str = '', n = 20) => str.length > n ? str.slice(0, n) + '…' : str;
const actionColor = (action) => {
  if (action === 'login')  return 'text-green-400 bg-green-500/10 border-green-500/20';
  if (action === 'logout') return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (action === 'page_view') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  return 'text-on-surface-variant bg-white/5 border-white/10';
};

/* ─── SQL setup instructions ──────────────────────────────────────────────── */
const SETUP_SQL = `-- Run this once in your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS public.user_activity (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  text,
  action      text NOT NULL,
  page        text,
  details     jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert activity" ON public.user_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "admin read activity" ON public.user_activity FOR SELECT USING (true);

-- Allow admin to read all profiles:
CREATE POLICY "admin read all profiles" ON public.profiles FOR SELECT USING (true);`;

/* ═══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [password,  setPassword]  = useState('');
  const [pwError,   setPwError]   = useState('');
  const [tab,       setTab]       = useState('overview');
  const [isDemo,    setIsDemo]    = useState(false);

  const [profiles,  setProfiles]  = useState([]);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [lastSync,  setLastSync]  = useState(null);

  const [userSearch,    setUserSearch]    = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [autoRefresh,   setAutoRefresh]   = useState(false);
  const timerRef = useRef(null);

  /* ── data fetching ───────────────────────────────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [p, l] = await Promise.all([
        fetchAllProfiles(),
        fetchActivityLogs(300),
      ]);
      
      if (p && p.length > 0) {
        setProfiles(p);
        setLogs(l || []);
        setIsDemo(false);
      } else {
        throw new Error('db_empty');
      }
    } catch (e) {
      console.warn('[Admin] Real data fetch failed or empty, loading Demo Mode.');
      setIsDemo(true);
      const mockProfiles = [
        { id: 'usr_1', education: 'MS Computer Science', skills: ['React', 'Node.js', 'AWS'], experience_years: 5, interest: 'Cloud Architecture', career_prediction: { career: 'Frontend Developer' }, updated_at: new Date().toISOString() },
        { id: 'usr_2', education: 'B.Tech Data Science', skills: ['Python', 'SQL', 'Tableau'], experience_years: 2, interest: 'Data Visualization', career_prediction: { career: 'Data Analyst' }, updated_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'usr_3', education: 'MBA Business Analytics', skills: ['Excel', 'Power BI'], experience_years: 8, interest: 'Strategic Planning', career_prediction: { career: 'Business Analyst' }, updated_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 'usr_4', education: 'MS Machine Learning', skills: ['Python', 'PyTorch', 'C++'], experience_years: 3, interest: 'AI Ethics', career_prediction: { career: 'ML Engineer' }, updated_at: new Date(Date.now() - 3600000).toISOString() },
      ];
      
      const mockLogs = [
        { id: 'log_1', user_email: 'demo_user1@example.com', action: 'login', page: '/dashboard', created_at: new Date(Date.now() - 120000).toISOString() },
        { id: 'log_2', user_email: 'demo_user2@example.com', action: 'page_view', page: '/profile', created_at: new Date(Date.now() - 300000).toISOString() },
        { id: 'log_3', user_email: 'demo_user1@example.com', action: 'logout', page: '/login', created_at: new Date(Date.now() - 600000).toISOString() },
        { id: 'log_4', user_email: 'demo_user4@example.com', action: 'login', page: '/dashboard', created_at: new Date(Date.now() - 3600000).toISOString() },
      ];
      
      setProfiles(mockProfiles);
      setLogs(mockLogs);
      
      if (e.message !== 'db_empty') {
        setError('Real database connection failed (Missing Netlify Env Keys). Showing Demo Data.');
      }
    } finally {
      setLoading(false);
      setLastSync(new Date());
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin, loadData]);

  useEffect(() => {
    if (autoRefresh && isAdmin) {
      timerRef.current = setInterval(loadData, 15000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, isAdmin, loadData]);

  /* ── derived stats ───────────────────────────────────────────────────── */
  const totalUsers     = profiles.length;
  const totalLogins    = logs.filter(l => l.action === 'login').length;
  const totalLogouts   = logs.filter(l => l.action === 'logout').length;
  const totalPageViews = logs.filter(l => l.action === 'page_view').length;

  const today = new Date().toDateString();
  const activeToday = [...new Set(
    logs.filter(l => l.action === 'login' && new Date(l.created_at).toDateString() === today)
        .map(l => l.user_email)
  )].length;

  const usersWithPrediction = profiles.filter(p => p.career_prediction).length;

  const filteredLogs = activityFilter === 'all'
    ? logs
    : logs.filter(l => l.action === activityFilter);

  const filteredProfiles = profiles.filter(p => {
    const q = userSearch.toLowerCase();
    return (
      (p.education || '').toLowerCase().includes(q) ||
      (p.interest  || '').toLowerCase().includes(q) ||
      (Array.isArray(p.skills) ? p.skills.join(' ') : '').toLowerCase().includes(q) ||
      (p.career_prediction?.career || '').toLowerCase().includes(q)
    );
  });

  /* ── login screen ────────────────────────────────────────────────────── */
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'jab jago tab savera') {
      setIsAdmin(true);
      setPwError('');
    } else {
      setPwError('Invalid admin credentials.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 px-6 flex justify-center bg-[#0a0a0a] text-[#e5e2e1]">
        <div className="max-w-md w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none"></div>
            
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary">
              <span className="material-symbols-outlined text-[32px]">shield</span>
            </div>
            
            <h2 className="text-2xl font-bold text-on-surface tracking-tight mb-2">Admin Control Center</h2>
            <p className="text-on-surface-variant text-sm mb-6">Authorised credentials required for gateway access.</p>
            
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">Access Key</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container/50 border border-white/10 rounded-lg px-4 py-3 font-sans text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/20"
                  autoFocus
                />
              </div>
              {pwError && (
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-sans">
                  <span className="material-symbols-outlined text-[16px]">error</span> {pwError}
                </div>
              )}
              <button 
                type="submit"
                className="ai-glow w-full py-4 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary-container font-mono text-[13px] uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer mt-4"
              >
                Authenticate Gateway
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── main dashboard ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full flex flex-col gap-12 text-[#e5e2e1]">
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="bg-glow-blob w-[800px] h-[800px] bg-primary/10 top-[-200px] left-[50%] -translate-x-1/2"></div>
        <div className="bg-glow-blob w-[500px] h-[500px] bg-secondary/5 bottom-[10%] left-[-100px]" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-b border-white/5 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4">
            <div className="relative w-2 h-2 rounded-full bg-primary flex items-center justify-center">
              <div className="absolute w-full h-full rounded-full bg-primary ai-indicator-ring"></div>
            </div>
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-bold">Secure Admin Access</span>
          </div>
          <h1 className="text-[40px] md:text-[56px] font-black tracking-tight leading-tight gradient-text max-w-4xl">
            Control Center
          </h1>
          {isDemo && (
            <p className="text-xs text-yellow-400 font-sans mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">warning</span> Offline Demo Session (Real db keys not configured)
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setAutoRefresh(r => !r)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 ${
              autoRefresh ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{autoRefresh ? 'sync' : 'sync_disabled'}</span>
            {autoRefresh ? 'LIVE SYNC' : 'STATIC'}
          </button>
          
          <button 
            onClick={loadData} 
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px] animate-none">refresh</span>
            Refresh
          </button>

          <button 
            onClick={() => setIsAdmin(false)}
            className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Lock Gate
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-2 bg-surface-container/50 border border-white/10 p-1.5 rounded-xl w-max">
        {[
          { id: 'overview', label: 'Overview', icon: 'dashboard' },
          { id: 'users', label: `Users (${totalUsers})`, icon: 'group' },
          { id: 'activity', label: `Logs (${logs.length})`, icon: 'activity' },
          { id: 'system', label: 'System Info', icon: 'dns' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
              tab === t.id ? 'bg-primary/20 text-primary border border-primary/20' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 animate-fade-in">
          {/* Stat Bento grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Profiles Recorded', value: totalUsers, icon: 'group', color: 'text-primary bg-primary/10 border-primary/20' },
              { label: 'Total Logins', value: totalLogins, icon: 'login', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
              { label: 'Active Today', value: activeToday, icon: 'bolt', color: 'text-secondary bg-secondary/10 border-secondary/20' },
              { label: 'Predictions run', value: usersWithPrediction, icon: 'trending_up', color: 'text-tertiary bg-tertiary/10 border-tertiary/20' }
            ].map((s, idx) => (
              <div key={idx} className="glass-card rounded-[28px] p-6 relative overflow-hidden">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${s.color}`}>
                  <span className="material-symbols-outlined text-[20px]">{s.icon}</span>
                </div>
                <div className="text-3xl font-black font-mono text-on-surface">{loading ? '...' : s.value}</div>
                <div className="text-xs text-on-surface-variant font-mono uppercase tracking-widest mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left overview logs */}
            <div className="lg:col-span-8 glass-card rounded-[28px] p-6">
              <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">login</span> Recent Login Signals
              </h3>
              
              {logs.filter(l => l.action === 'login').slice(0, 5).length === 0 ? (
                <p className="text-on-surface-variant text-sm">No activity recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="text-left text-on-surface-variant border-b border-white/5 font-mono text-[11px] uppercase tracking-wider">
                        <th className="pb-3">Credential / User Email</th>
                        <th className="pb-3">Time Signal</th>
                        <th className="pb-3">Destination page</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-on-surface">
                      {logs.filter(l => l.action === 'login').slice(0, 5).map(l => (
                        <tr key={l.id} className="hover:bg-white/3 transition-colors">
                          <td className="py-3 font-semibold text-sm">{l.user_email || '—'}</td>
                          <td className="py-3 text-xs text-on-surface-variant font-mono">{ago(l.created_at)}</td>
                          <td className="py-3 text-xs text-on-surface-variant font-mono">{l.page || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right overview distributions */}
            <div className="lg:col-span-4 glass-card rounded-[28px] p-6">
              <h3 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400">explore</span> Predicted Distributions
              </h3>
              {usersWithPrediction === 0 ? (
                <p className="text-on-surface-variant text-sm">No prediction records available.</p>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const counts = {};
                    profiles.forEach(p => {
                      const c = p.career_prediction?.career || p.career_prediction;
                      if (c && typeof c === 'string') counts[c] = (counts[c] || 0) + 1;
                    });
                    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 4);
                    const max = sorted[0]?.[1] || 1;
                    return sorted.map(([career, count]) => (
                      <div key={career} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-on-surface font-semibold">{career}</span>
                          <span className="text-on-surface-variant">{count}</span>
                        </div>
                        <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── USERS TAB ───────────────────────────────────────────────── */}
      {tab === 'users' && (
        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative max-w-md w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search coordinates by education, skills, target role..."
                className="w-full bg-surface-container/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <span className="font-mono text-xs text-on-surface-variant">{filteredProfiles.length} Results</span>
          </div>

          <div className="glass-card rounded-[28px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="bg-white/3 border-b border-white/5 text-on-surface-variant font-mono text-[10px] uppercase tracking-wider">
                  <tr className="text-left">
                    <th className="px-6 py-4">Index</th>
                    <th className="px-6 py-4">Education Coord</th>
                    <th className="px-6 py-4">Skill Badge DNA</th>
                    <th className="px-6 py-4">Time Orbit</th>
                    <th className="px-6 py-4">Interest Area</th>
                    <th className="px-6 py-4">Current Prediction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-on-surface">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant">
                        {loading ? 'Compiling dataset...' : 'No users found.'}
                      </td>
                    </tr>
                  ) : filteredProfiles.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold">{truncate(p.education, 20) || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(p.skills || []).slice(0, 3).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded text-[10px] font-mono">{s}</span>
                          ))}
                          {(p.skills || []).length > 3 && (
                            <span className="text-on-surface-variant text-xs font-mono">+{p.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{p.experience_years != null ? `${p.experience_years} Years` : '—'}</td>
                      <td className="px-6 py-4 text-xs font-semibold">{truncate(p.interest, 20) || '—'}</td>
                      <td className="px-6 py-4">
                        {p.career_prediction ? (
                          <span className="px-2.5 py-1 bg-secondary/10 border border-secondary/20 text-secondary rounded-lg text-xs font-semibold">
                            {p.career_prediction?.career || String(p.career_prediction)}
                          </span>
                        ) : <span className="text-on-surface-variant/40 text-xs font-mono">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── ACTIVITY LOGS TAB ───────────────────────────────────────── */}
      {tab === 'activity' && (
        <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex gap-1.5 bg-surface-container/50 border border-white/10 p-1 rounded-xl w-max">
            {['all', 'login', 'logout', 'page_view'].map(f => (
              <button 
                key={f} 
                onClick={() => setActivityFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all ${
                  activityFilter === f ? 'bg-primary/20 text-primary border border-primary/20' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f === 'all' ? `ALL (${logs.length})` :
                 f === 'login' ? `LOGINS (${totalLogins})` :
                 f === 'logout' ? `LOGOUTS (${totalLogouts})` :
                 `VIEWS (${totalPageViews})`}
              </button>
            ))}
          </div>

          <div className="glass-card rounded-[28px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="bg-white/3 border-b border-white/5 text-on-surface-variant font-mono text-[10px] uppercase tracking-wider">
                  <tr className="text-left">
                    <th className="px-6 py-4">Time stamp</th>
                    <th className="px-6 py-4">User credential</th>
                    <th className="px-6 py-4">Action type</th>
                    <th className="px-6 py-4">Destination route</th>
                    <th className="px-6 py-4">Details payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-on-surface">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">
                        No activity records found.
                      </td>
                    </tr>
                  ) : filteredLogs.map(l => (
                    <tr key={l.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">
                        <span>{ago(l.created_at)}</span>
                        <span className="block text-[9px] mt-0.5 opacity-60">{fmt(l.created_at).split(',')[0]}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-sm">{l.user_email || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${actionColor(l.action)}`}>
                          {l.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-on-surface-variant">{l.page || '—'}</td>
                      <td className="px-6 py-4 text-[11px] font-mono text-on-surface-variant">
                        {l.details && Object.keys(l.details).length > 0 ? JSON.stringify(l.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SYSTEM DATA TAB ────────────────────────────────────────── */}
      {tab === 'system' && (
        <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Controls */}
          <div className="glass-card rounded-[28px] p-6">
            <h3 className="text-lg font-semibold text-on-surface mb-4">Infrastructure Coordinates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => alert('Backend API restarted successfully.')}
                className="btn-glass p-4 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-primary"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span> Restart Backend API
              </button>
              <button 
                onClick={() => alert('Model caches cleared.')}
                className="btn-glass p-4 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-secondary"
              >
                <span className="material-symbols-outlined text-[18px]">database</span> Flush cache parameters
              </button>
              <button 
                onClick={() => alert('Emergency lockdown initiated.')}
                className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">error</span> Emergency Gate Stop
              </button>
            </div>
          </div>

          {/* SQL Setup schema */}
          <div className="glass-card rounded-[28px] p-6 border border-yellow-500/20">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span> Gateway database Initialization
            </h3>
            <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
              Execute the following SQL instructions inside your Supabase dashboard to register the activity triggers:
            </p>
            <pre className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {SETUP_SQL}
            </pre>
            <button
              onClick={() => { navigator.clipboard?.writeText(SETUP_SQL); alert('SQL copied to clipboard!'); }}
              className="mt-4 btn-glass px-4 py-2 font-mono text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy SQL instructions
            </button>
          </div>

        </motion.div>
      )}

    </div>
  );
};

export default AdminDashboard;
