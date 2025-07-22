import { supabase } from '../supabaseClient';

export interface SavedPhrase {
  id?: string;
  user_id: string;
  phrase: string;
  translation?: string;
  created_at?: string;
}

export const fetchSavedPhrases = async (userId: string): Promise<SavedPhrase[]> => {
  const { data, error } = await supabase
    .from('saved_phrases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching saved phrases:', error);
    return [];
  }
  return data || [];
};

export const addSavedPhrase = async (userId: string, phrase: string, translation = ''): Promise<SavedPhrase | null> => {
  const { data, error } = await supabase
    .from('saved_phrases')
    .insert([{ user_id: userId, phrase, translation }])
    .select();
  if (error) {
    console.error('Error adding saved phrase:', error);
    return null;
  }
  return data?.[0] || null;
};

export const removeSavedPhrase = async (userId: string, phraseId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('saved_phrases')
    .delete()
    .eq('id', phraseId)
    .eq('user_id', userId);
  if (error) {
    console.error('Error removing saved phrase:', error);
    return false;
  }
  return true;
};

export const checkPhraseExists = async (userId: string, phrase: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('saved_phrases')
    .select('id')
    .eq('user_id', userId)
    .eq('phrase', phrase)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking phrase existence:', error);
    return false;
  }
  return !!data;
}; 