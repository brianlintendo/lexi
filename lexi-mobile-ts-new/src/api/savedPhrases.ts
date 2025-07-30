// For now, we'll use localStorage for saved phrases since Supabase isn't set up
// This can be replaced with actual API calls later

interface SavedPhrase {
  id: string;
  phrase: string;
  translation: string;
  created_at: string;
  user_id: string;
}

const STORAGE_KEY = 'lexi-saved-phrases';

// Get all saved phrases for a user
export const fetchSavedPhrases = async (userId: string): Promise<SavedPhrase[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const phrases = JSON.parse(stored);
      return phrases.filter((p: SavedPhrase) => p.user_id === userId) || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching saved phrases:', error);
    return [];
  }
};

// Add a new saved phrase
export const addSavedPhrase = async (userId: string, phrase: string, translation: string = ''): Promise<SavedPhrase | null> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const phrases = stored ? JSON.parse(stored) : [];
    
    const newPhrase: SavedPhrase = {
      id: Date.now().toString(),
      phrase,
      translation,
      created_at: new Date().toISOString(),
      user_id: userId
    };
    
    phrases.push(newPhrase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
    
    return newPhrase;
  } catch (error) {
    console.error('Error adding saved phrase:', error);
    return null;
  }
};

// Remove a saved phrase
export const removeSavedPhrase = async (userId: string, phraseId: string): Promise<boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const phrases = JSON.parse(stored);
    const filteredPhrases = phrases.filter((p: SavedPhrase) => !(p.id === phraseId && p.user_id === userId));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPhrases));
    return true;
  } catch (error) {
    console.error('Error removing saved phrase:', error);
    return false;
  }
};

// Check if a phrase already exists for a user
export const checkPhraseExists = async (userId: string, phrase: string): Promise<boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    
    const phrases = JSON.parse(stored);
    return phrases.some((p: SavedPhrase) => p.user_id === userId && p.phrase === phrase);
  } catch (error) {
    console.error('Error checking phrase existence:', error);
    return false;
  }
}; 