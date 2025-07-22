import { supabase } from '../supabaseClient';

export interface ProfileData {
  id: string;
  name: string;
  language: string;
  proficiency: string;
  motivation: string;
}

export async function saveProfile(profile: ProfileData): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert([profile]);
    if (error) throw error;
  } catch (error: any) {
    console.error('Error saving profile:', error);
    if (error.message.includes('relation "profiles" does not exist')) {
      console.warn('Profiles table does not exist yet. Please run the migration.');
      // For now, store in localStorage as fallback
      localStorage.setItem('lexi-profile', JSON.stringify(profile));
    } else {
      throw error;
    }
  }
}

export async function getProfile(id: string): Promise<ProfileData | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, language, proficiency, motivation')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { id, ...data };
  } catch (error: any) {
    console.error('Error getting profile:', error);
    if (error.message.includes('relation "profiles" does not exist')) {
      console.warn('Profiles table does not exist yet. Checking localStorage...');
      const stored = localStorage.getItem('lexi-profile');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          if (profile.id === id) {
            return profile;
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