import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vinqhhpezbkndwgdpize.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_W16rD_lcbp9TrsOYSSdrdA_nhuXmho1';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variables Supabase non définies dans l\'environnement, utilisation des valeurs par défaut.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
