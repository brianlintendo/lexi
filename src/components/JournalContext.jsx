import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuth';
import { getProfile, saveProfile } from '../api/profile';

const JournalContext = createContext();
const ProfileContext = createContext();

export function JournalProvider({ children }) {
  const [journalInput, setJournalInput] = useState('');
  const [language, setLanguage] = useState('fr'); // default to French
  return (
    <JournalContext.Provider value={{ journalInput, setJournalInput, language, setLanguage }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  return useContext(JournalContext);
}

export function ProfileProvider({ children }) {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load profile on user change
  useEffect(() => {
    if (user?.id) {
      setProfileLoading(true);
      getProfile(user.id)
        .then(setProfile)
        .catch(err => setProfileError(err.message))
        .finally(() => setProfileLoading(false));
    } else {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  }, [user?.id]);

  // Save profile helper with error handling
  const saveProfileWithError = async (data) => {
    try {
      await saveProfile({ id: user.id, ...data });
      setProfile(data);
      setProfileError(null);
    } catch (err) {
      setProfileError(err.message);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, profileError, profileLoading, saveProfile: saveProfileWithError }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
} 