import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuth';
import { getProfile, saveProfile } from '../api/profile';

const JournalContext = createContext();
const ProfileContext = createContext();

// Language mapping function to handle both codes and names
const mapLanguageToCode = (language) => {
  if (!language) return 'fr'; // default fallback
  
  // If it's already a code, return it
  if (['en', 'es', 'fr', 'zh', 'pt', 'it', 'de', 'ja', 'ko', 'ru', 'ar', 'hi', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'tr', 'he', 'th', 'vi', 'id', 'ms'].includes(language)) {
    return language;
  }
  
  // Map language names to codes
  const languageMap = {
    'English': 'en',
    'Spanish': 'es', 
    'French': 'fr',
    'Chinese': 'zh',
    'Portuguese': 'pt',
    'Italian': 'it',
    'German': 'de',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Russian': 'ru',
    'Arabic': 'ar',
    'Hindi': 'hi',
    'Dutch': 'nl',
    'Swedish': 'sv',
    'Norwegian': 'no',
    'Danish': 'da',
    'Finnish': 'fi',
    'Polish': 'pl',
    'Turkish': 'tr',
    'Hebrew': 'he',
    'Thai': 'th',
    'Vietnamese': 'vi',
    'Indonesian': 'id',
    'Malay': 'ms'
  };
  
  return languageMap[language] || 'fr'; // fallback to French
};

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

// Combined provider that handles profile-to-journal language sync
export function AppProviders({ children }) {
  const [journalInput, setJournalInput] = useState('');
  const [language, setLanguage] = useState('fr'); // default to French
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

  // Update journal language when profile loads - with proper mapping
  useEffect(() => {
    if (profile?.language) {
      const mappedLanguage = mapLanguageToCode(profile.language);
      console.log('Mapping profile language:', profile.language, 'to code:', mappedLanguage);
      setLanguage(mappedLanguage);
    }
  }, [profile?.language]);

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
    <JournalContext.Provider value={{ journalInput, setJournalInput, language, setLanguage }}>
      <ProfileContext.Provider value={{ profile, setProfile, profileError, profileLoading, saveProfile: saveProfileWithError }}>
        {children}
      </ProfileContext.Provider>
    </JournalContext.Provider>
  );
} 