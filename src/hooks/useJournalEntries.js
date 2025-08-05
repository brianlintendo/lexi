import { useState, useEffect } from 'react';
import { useUser } from './useAuth';
import { insertEntry, fetchEntries, deleteEntry, updateEntrySubmitted } from '../api/journal';

const STORAGE_KEY = 'lexi-journal-entries';

export function useJournalEntries() {
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  // Load entries from Supabase or localStorage
  useEffect(() => {
    if (user?.id) {
      loadFromSupabase();
    } else {
      loadFromLocalStorage();
    }
  }, [user?.id]);

  const loadFromSupabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await fetchEntries(user.id);
      if (error) throw error;
      
      const formattedEntries = {};
      data?.forEach(entry => {
        const dateKey = entry.entry_date || new Date(entry.created_at).toISOString().slice(0, 10);
        formattedEntries[dateKey] = {
          text: entry.entry_text,
          ai_reply: entry.ai_reply,
          submitted: entry.submitted || !!entry.ai_reply
        };
      });
      
      setEntries(formattedEntries);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedEntries));
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load journal entries');
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing stored entries:', error);
      }
    }
  };

  const saveEntry = async (dateKey, text, submitted = false) => {
    const newEntries = {
      ...entries,
      [dateKey]: { text, submitted }
    };
    
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    
    if (user?.id && text.trim()) {
      try {
        await insertEntry(user.id, text, null, dateKey, submitted);
      } catch (err) {
        console.error('Error saving to Supabase:', err);
        setError('Failed to save entry to cloud');
      }
    }
  };

  const deleteEntryByDate = async (dateKey) => {
    const newEntries = { ...entries };
    delete newEntries[dateKey];
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    
    if (user?.id) {
      try {
        await deleteEntry(user.id, dateKey);
      } catch (err) {
        console.error('Error deleting from Supabase:', err);
        setError('Failed to delete entry from cloud');
      }
    }
  };

  const markAsSubmitted = async (dateKey) => {
    const entry = entries[dateKey];
    if (!entry) return;
    
    const updatedEntry = { ...entry, submitted: true };
    const newEntries = { ...entries, [dateKey]: updatedEntry };
    setEntries(newEntries);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    
    if (user?.id) {
      try {
        await updateEntrySubmitted(user.id, dateKey, true);
      } catch (err) {
        console.error('Error updating submission status:', err);
      }
    }
  };

  const getEntry = (dateKey) => entries[dateKey] || null;
  const hasEntry = (dateKey) => !!entries[dateKey];
  const hasSubmittedEntry = (dateKey) => {
    const entry = entries[dateKey];
    return !!entry && (
      (typeof entry === 'object' && (entry.ai_reply || entry.submitted)) ||
      (typeof entry === 'string' && localStorage.getItem(`submitted-${dateKey}`))
    );
  };

  return {
    entries,
    loading,
    error,
    saveEntry,
    deleteEntryByDate,
    markAsSubmitted,
    getEntry,
    hasEntry,
    hasSubmittedEntry
  };
} 