import { supabase } from '../supabaseClient';

export const insertEntry = (userId, entry, reply) =>
  supabase.from('journal_entries').insert([{ user_id: userId, entry_text: entry, ai_reply: reply }]);

export const fetchEntries = userId =>
  supabase.from('journal_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false }); 