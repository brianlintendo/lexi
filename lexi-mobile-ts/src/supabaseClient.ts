import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

function getSupabaseConfig() {
  const config = Constants.expoConfig;
  if (!config || !config.extra || !config.extra.SUPABASE_URL || !config.extra.SUPABASE_ANON_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY is not set in app config');
  }
  return {
    url: config.extra.SUPABASE_URL,
    anonKey: config.extra.SUPABASE_ANON_KEY,
  };
}
const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function to verify Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful! Sample data:', data);
    }
  } catch (err) {
    console.error('Supabase test error:', err);
  }
} 