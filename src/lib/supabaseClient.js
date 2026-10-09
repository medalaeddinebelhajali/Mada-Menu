import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis dans .env');
}

export const supabase = createClient(
  supabaseUrl ?? 'https://missing-env.supabase.co',
  supabaseKey ?? 'missing-key'
);

