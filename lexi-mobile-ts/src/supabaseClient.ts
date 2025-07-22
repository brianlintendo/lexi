import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pjdpfogtmtdnejjxnboe.supabase.co/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqZHBmb2d0bXRkbmVqanhuYm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk4NzEsImV4cCI6MjA2NzkwNTg3MX0.Fqp8eEdOtcv7kLDykE9YsoS5mEijrR28LsINSSaYdmM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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