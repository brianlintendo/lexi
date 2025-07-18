import { supabase } from '../supabaseClient';

export async function saveProfile({ id, name, language, proficiency, motivation }) {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert([{ id, name, language, proficiency, motivation }]);
    if (error) throw error;
  } catch (error) {
    console.error('Error saving profile:', error);
    // If table doesn't exist, this is expected during development
    if (error.message.includes('relation "profiles" does not exist')) {
      console.warn('Profiles table does not exist yet. Please run the migration.');
      // For now, store in localStorage as fallback
      localStorage.setItem('lexi-profile', JSON.stringify({ id, name, language, proficiency, motivation }));
    } else {
      throw error;
    }
  }
}

export async function getProfile(id) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, language, proficiency, motivation')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    // If table doesn't exist, try localStorage as fallback
    if (error.message.includes('relation "profiles" does not exist')) {
      console.warn('Profiles table does not exist yet. Checking localStorage...');
      const stored = localStorage.getItem('lexi-profile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          if (profile.id === id) {
            return {
              name: profile.name,
              language: profile.language,
              proficiency: profile.proficiency,
              motivation: profile.motivation
            };
          }
        } catch (e) {
          console.error('Error parsing stored profile:', e);
        }
      }
      return null;
    } else {
      throw error;
    }
  }
} 