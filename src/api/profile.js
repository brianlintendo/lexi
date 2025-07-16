import { supabase } from '../supabaseClient';

export async function saveProfile({ id, name, language, proficiency }) {
  const { error } = await supabase
    .from('profiles')
    .upsert([{ id, name, language, proficiency }]);
  if (error) throw error;
}

export async function getProfile(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, language, proficiency')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
} 