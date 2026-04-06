import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.\n' +
    'Create frontend/.env and add both keys. Auth features will be disabled.'
  );
}

export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder',
);

// ─── DB helpers ──────────────────────────────────────────────────────────────

/** Load profile row for the current user */
export const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = row not found
  return data || null;
};

/** Upsert profile + optional career prediction */
export const upsertProfile = async (userId, profileData, careerPrediction = null) => {
  const row = {
    id: userId,
    education: profileData.education,
    skills: profileData.skills,
    interest: profileData.interest,
    experience_years: profileData.experience_years,
    updated_at: new Date().toISOString(),
  };
  if (careerPrediction !== null) row.career_prediction = careerPrediction;

  const { error } = await supabase.from('profiles').upsert(row);
  if (error) throw error;
};

/*
──────────────────────────────────────────────────────────────────────────────
  SUPABASE TABLE SETUP  (run once in your Supabase SQL editor)
──────────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id               uuid references auth.users(id) on delete cascade primary key,
  education        text,
  skills           text[],
  interest         text,
  experience_years int  default 0,
  career_prediction jsonb,
  updated_at       timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "select own profile"
  on public.profiles for select  using (auth.uid() = id);
create policy "insert own profile"
  on public.profiles for insert  with check (auth.uid() = id);
create policy "update own profile"
  on public.profiles for update  using (auth.uid() = id);

──────────────────────────────────────────────────────────────────────────────
*/
