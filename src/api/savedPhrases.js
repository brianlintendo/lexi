import { supabase } from '../supabaseClient';

// Get all saved phrases for a user
export const fetchSavedPhrases = async (userId) => {
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

// Add a new saved phrase
export const addSavedPhrase = async (userId, phrase, translation = '') => {
  const { data, error } = await supabase
    .from('saved_phrases')
    .insert([{ 
      user_id: userId, 
      phrase: phrase, 
      translation: translation 
    }])
    .select();
  
  if (error) {
    console.error('Error adding saved phrase:', error);
    return null;
  }
  
  return data?.[0];
};

// Remove a saved phrase
export const removeSavedPhrase = async (userId, phraseId) => {
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

// Check if a phrase already exists for a user
export const checkPhraseExists = async (userId, phrase) => {
  const { data, error } = await supabase
    .from('saved_phrases')
    .select('id')
    .eq('user_id', userId)
    .eq('phrase', phrase)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    console.error('Error checking phrase existence:', error);
    return false;
  }
  
  return !!data;
}; 