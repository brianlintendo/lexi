import { supabase } from '../supabaseClient';

export interface JournalEntry {
  user_id: string;
  entry_text: string;
  ai_reply?: string | null;
  entry_date?: string;
}

export const insertEntry = async (
  userId: string,
  entry: string,
  reply: string | null,
  entryDate: string | null = null
): Promise<any> =>
  supabase.from('journal_entries').insert<JournalEntry>({
    user_id: userId,
    entry_text: entry,
    ai_reply: reply,
    entry_date: entryDate || new Date().toISOString().slice(0, 10)
  });

export const upsertEntry = async (
  userId: string,
  entry: string,
  reply: string | null,
  entryDate: string
): Promise<any> =>
  supabase.from('journal_entries').upsert<JournalEntry>({
    user_id: userId,
    entry_text: entry,
    ai_reply: reply,
    entry_date: entryDate
  }, {
    onConflict: 'user_id,entry_date',
    ignoreDuplicates: false
  });

export const fetchEntries = async (userId: string): Promise<any> =>
  supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false });

export const deleteEntry = async (userId: string, entryDate: string): Promise<any> =>
  supabase.from('journal_entries').delete().eq('user_id', userId).eq('entry_date', entryDate); 