import { supabase } from '../supabaseClient';

export const insertEntry = (userId, entry, reply, entryDate = null, submitted = false) =>
  supabase.from('journal_entries').insert([{ 
    user_id: userId, 
    entry_text: entry, 
    ai_reply: reply,
    entry_date: entryDate || new Date().toISOString().slice(0, 10),
    submitted: submitted
  }]);

export const upsertEntry = (userId, entry, reply, entryDate, submitted = false) =>
  supabase.from('journal_entries').upsert([{ 
    user_id: userId, 
    entry_text: entry, 
    ai_reply: reply,
    entry_date: entryDate,
    submitted: submitted
  }], { 
    onConflict: 'user_id,entry_date',
    ignoreDuplicates: false 
  });

export const fetchEntries = userId =>
  supabase.from('journal_entries').select('*').eq('user_id', userId).order('entry_date', { ascending: false });

export const deleteEntry = (userId, entryDate) =>
  supabase.from('journal_entries').delete().eq('user_id', userId).eq('entry_date', entryDate);

export const updateEntrySubmitted = (userId, entryDate, submitted) =>
  supabase.from('journal_entries')
    .update({ submitted: submitted })
    .eq('user_id', userId)
    .eq('entry_date', entryDate); 