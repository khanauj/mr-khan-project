import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Activity, Settings, Database, Server, RefreshCw,
  LogIn, LogOut, Eye, Search, Shield, BarChart2,
  Clock, TrendingUp, AlertCircle, CheckCircle2, ChevronDown,
  Download, Filter, Zap, User, BookOpen, Briefcase,
} from 'lucide-react';
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
  if (action === 'login')  return 'text-green-400 bg-green-500/10';
  if (action === 'logout') return 'text-red-400 bg-red-500/10';
  if (action === 'page_view') return 'text-blue-400 bg-blue-500/10';
  return 'text-gray-400 bg-white/5';
};
const actionIcon = (action) => {
  if (action === 'login')  return <LogIn  className="w-3 h-3" />;
  if (action === 'logout') return <LogOut className="w-3 h-3" />;
  if (action === 'page_view') return <Eye className="w-3 h-3" />;
  return <Activity className="w-3 h-3" />;
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
        fetchAllProfiles().catch(() => []),
        fetchActivityLogs(300).catch(() => []),
      ]);
      
      // Fallback to Demo Data if database is empty/unreachable
      if (p.length === 0) {
        console.warn('[Admin] No users found in database, loading Demo Mode data.');
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
      } else {
        setProfiles(p);
        setLogs(l);
      }
      
      setLastSync(new Date());
    } catch (e) {
      setError(e.message || 'Failed to load data.');
    } finally {
      setLoading(false);
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
      <div className="min-h-screen pt-24 px-4 flex justify-center bg-black">
        <div className="max-w-md w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
            <p className="text-gray-400 text-sm mb-6">Restricted area — authorised personnel only</p>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  autoFocus
                />
              </div>
              {pwError && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" /> {pwError}
                </div>
              )}
              <button type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl font-bold text-white hover:opacity-90 transition-all">
                Access Dashboard
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ── tabs config ─────────────────────────────────────────────────────── */
  const tabs = [
    { id: 'overview',  label: 'Overview',     icon: BarChart2 },
    { id: 'users',     label: `Users (${totalUsers})`, icon: Users },
    { id: 'activity',  label: `Activity (${logs.length})`, icon: Activity },
    { id: 'system',    label: 'System',       icon: Server },
  ];

  /* ── main dashboard ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-400">
              Admin Dashboard
            </h1>
            {lastSync && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Last synced {ago(lastSync)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(r => !r)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                autoRefresh ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Zap className="w-3 h-3" />
              {autoRefresh ? 'Live' : 'Auto-refresh'}
            </button>
            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white text-sm transition-all disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm transition-all">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="text-xs text-red-400/70 mt-1">Make sure you have run the setup SQL below (System tab).</p>
            </div>
          </div>
        )}

        {/* Tab nav */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-primary-500/30 text-primary-300' : 'text-gray-400 hover:text-white'
              }`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Registered Users',     value: totalUsers,          icon: Users,      color: 'from-blue-500 to-blue-700',   sub: 'in profiles table' },
                { label: 'Total Logins',          value: totalLogins,         icon: LogIn,       color: 'from-green-500 to-green-700', sub: 'all time' },
                { label: 'Active Today',          value: activeToday,         icon: Activity,    color: 'from-purple-500 to-purple-700', sub: 'unique users' },
                { label: 'Career Predictions',    value: usersWithPrediction, icon: TrendingUp,  color: 'from-orange-500 to-orange-700', sub: 'users with results' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-5 border border-white/5 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{loading ? '…' : s.value}</p>
                  <p className="text-sm font-medium text-gray-300 mt-1">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent logins */}
            <div className="glass-card p-6 border border-white/5 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-green-400" /> Recent Logins
              </h2>
              {logs.filter(l => l.action === 'login').slice(0, 10).length === 0 ? (
                <p className="text-gray-500 text-sm">No login events yet. Make sure the setup SQL has been run.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-white/5">
                        <th className="pb-2 font-medium">User</th>
                        <th className="pb-2 font-medium">Time</th>
                        <th className="pb-2 font-medium">Page</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.filter(l => l.action === 'login').slice(0, 10).map(l => (
                        <tr key={l.id} className="hover:bg-white/3 transition-colors">
                          <td className="py-2.5 text-gray-200">{l.user_email || '—'}</td>
                          <td className="py-2.5 text-gray-400">{ago(l.created_at)}</td>
                          <td className="py-2.5 text-gray-500">{l.page || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Top careers */}
            {usersWithPrediction > 0 && (
              <div className="glass-card p-6 border border-white/5 rounded-2xl">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" /> Top Predicted Careers
                </h2>
                <div className="space-y-3">
                  {(() => {
                    const counts = {};
                    profiles.forEach(p => {
                      const c = p.career_prediction?.career || p.career_prediction;
                      if (c && typeof c === 'string') counts[c] = (counts[c] || 0) + 1;
                    });
                    const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,6);
                    const max = sorted[0]?.[1] || 1;
                    return sorted.map(([career, count]) => (
                      <div key={career}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{career}</span>
                          <span className="text-gray-500">{count} user{count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── USERS TAB ───────────────────────────────────────────────── */}
        {tab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Search by education, skills, career…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <span className="text-gray-500 text-sm">{filteredProfiles.length} result{filteredProfiles.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/3 border-b border-white/5">
                    <tr className="text-left text-gray-400">
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">User ID</th>
                      <th className="px-4 py-3 font-medium">Education</th>
                      <th className="px-4 py-3 font-medium">Skills</th>
                      <th className="px-4 py-3 font-medium">Experience</th>
                      <th className="px-4 py-3 font-medium">Interest</th>
                      <th className="px-4 py-3 font-medium">Career Prediction</th>
                      <th className="px-4 py-3 font-medium">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProfiles.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          {loading ? 'Loading…' : 'No profiles found. Users will appear here after they complete their profile.'}
                        </td>
                      </tr>
                    ) : filteredProfiles.map((p, i) => (
                      <tr key={p.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.id?.slice(0, 12)}…</td>
                        <td className="px-4 py-3 text-gray-200">{truncate(p.education, 18) || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(p.skills || []).slice(0, 3).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-primary-500/10 text-primary-300 rounded text-xs">{s}</span>
                            ))}
                            {(p.skills || []).length > 3 && (
                              <span className="text-gray-500 text-xs">+{p.skills.length - 3}</span>
                            )}
                            {(!p.skills || p.skills.length === 0) && <span className="text-gray-500">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">{p.experience_years != null ? `${p.experience_years} yr${p.experience_years !== 1 ? 's' : ''}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-300">{truncate(p.interest, 18) || '—'}</td>
                        <td className="px-4 py-3">
                          {p.career_prediction ? (
                            <span className="px-2 py-1 bg-purple-500/15 text-purple-300 rounded-lg text-xs font-medium">
                              {truncate(p.career_prediction?.career || String(p.career_prediction), 22)}
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{ago(p.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ACTIVITY TAB ────────────────────────────────────────────── */}
        {tab === 'activity' && (
          <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                {['all', 'login', 'logout', 'page_view'].map(f => (
                  <button key={f} onClick={() => setActivityFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                      activityFilter === f ? 'bg-primary-500/30 text-primary-300' : 'text-gray-400 hover:text-white'
                    }`}>
                    {f === 'all' ? `All (${logs.length})` :
                     f === 'login' ? `Logins (${totalLogins})` :
                     f === 'logout' ? `Logouts (${totalLogouts})` :
                     `Page Views (${totalPageViews})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/3 border-b border-white/5">
                    <tr className="text-left text-gray-400">
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">User</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Page</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          {loading ? 'Loading…' : 'No activity recorded yet. Run the setup SQL to start tracking.'}
                        </td>
                      </tr>
                    ) : filteredLogs.map(l => (
                      <tr key={l.id} className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          <span title={fmt(l.created_at)}>{ago(l.created_at)}</span>
                          <span className="block text-xs text-gray-600">{fmt(l.created_at).split(',')[0]}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-200">{l.user_email || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${actionColor(l.action)}`}>
                            {actionIcon(l.action)} {l.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{l.page || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                          {l.details && Object.keys(l.details).length > 0
                            ? JSON.stringify(l.details)
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SYSTEM TAB ──────────────────────────────────────────────── */}
        {tab === 'system' && (
          <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Server controls */}
            <div className="glass-card p-6 border border-white/5 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-gray-400" /> Infrastructure Controls
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Restart Backend API',  icon: RefreshCw, color: 'text-blue-400',   bg: 'hover:bg-blue-500/10' },
                  { label: 'Flush Cache',           icon: Database,  color: 'text-purple-400', bg: 'hover:bg-purple-500/10' },
                  { label: 'Force Emergency Stop',  icon: Zap,       color: 'text-red-400',    bg: 'bg-red-500/5 hover:bg-red-500/15 border-red-500/20' },
                ].map(c => (
                  <button key={c.label}
                    onClick={() => alert(`${c.label} — connect your backend API to wire this up.`)}
                    className={`flex items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl transition-all ${c.bg} ${c.color}`}>
                    <c.icon className="w-4 h-4" /> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Database stats */}
            <div className="glass-card p-6 border border-white/5 rounded-2xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-400" /> Database Stats
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Profiles',       value: profiles.length },
                  { label: 'Activity Rows',  value: logs.length },
                  { label: 'Login Events',   value: totalLogins },
                  { label: 'With Prediction',value: usersWithPrediction },
                ].map(s => (
                  <div key={s.label} className="p-4 bg-white/3 rounded-xl border border-white/5 text-center">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Setup SQL */}
            <div className="glass-card p-6 border border-amber-500/20 rounded-2xl">
              <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-5 h-5" /> One-time Supabase Setup
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                If the Users or Activity tabs show no data, run this SQL once in your{' '}
                <span className="text-primary-400">Supabase → SQL Editor</span>:
              </p>
              <pre className="bg-black/60 border border-white/10 rounded-xl p-4 text-xs text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {SETUP_SQL}
              </pre>
              <button
                onClick={() => { navigator.clipboard?.writeText(SETUP_SQL); alert('SQL copied to clipboard!'); }}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
                <Download className="w-4 h-4" /> Copy SQL
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
