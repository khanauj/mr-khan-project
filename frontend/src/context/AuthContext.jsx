import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, fetchProfile, upsertProfile, logActivity } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from Supabase into localStorage
  const syncProfile = async (userId) => {
    try {
      const profile = await fetchProfile(userId);
      if (profile) {
        const { id, career_prediction, updated_at, ...profileData } = profile;
        localStorage.setItem('userProfile', JSON.stringify({
          ...profileData,
          skills: profileData.skills || [],
        }));
        if (career_prediction) {
          localStorage.setItem('careerPrediction', JSON.stringify(career_prediction));
        }
      }
    } catch (err) {
      console.warn('[Auth] Could not sync profile:', err.message);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) syncProfile(session.user.id);
      })
      .catch((err) => console.warn('[Auth] getSession failed:', err.message))
      .finally(() => setLoading(false));

    // Listen for auth changes
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) await syncProfile(session.user.id);
        }
      );
      subscription = data.subscription;
    } catch (err) {
      console.warn('[Auth] onAuthStateChange failed:', err.message);
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      logActivity(data.user.id, email, 'login', '/auth', { method: 'email' });
    }
    return data;
  };

  const signOut = () => {
    if (user) {
      logActivity(user.id, user.email, 'logout', window.location.pathname, {});
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('userProfile');
    localStorage.removeItem('careerPrediction');
    supabase.auth.signOut().catch(() => {});
  };

  /**
   * Call this after a successful career prediction to persist both
   * the profile form data AND the ML result to Supabase.
   */
  const saveProfileToCloud = async (profileData, careerPrediction = null) => {
    if (!user) return; // not logged in — localStorage only
    try {
      await upsertProfile(user.id, profileData, careerPrediction);
    } catch (err) {
      console.warn('[Auth] Cloud save failed (localStorage still updated):', err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, saveProfileToCloud }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
