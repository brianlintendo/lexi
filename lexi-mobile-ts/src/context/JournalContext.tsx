import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '../hooks/useAuth';
import { getProfile, saveProfile, ProfileData } from '../api/profile';

export type LanguageType = {
  code: string;
  label: string;
  flag: string;
};

interface JournalContextType {
  journalInput: string;
  setJournalInput: (input: string) => void;
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);
const ProfileContext = createContext<any>(undefined);

const mapLanguageToCode = (language: string) => {
  if (!language) return 'en';
  if ([
    'en', 'es', 'fr', 'zh', 'pt', 'it', 'de', 'ja', 'ko', 'ru', 'ar', 'hi', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'tr', 'he', 'th', 'vi', 'id', 'ms'
  ].includes(language)) {
    return language;
  }
  const languageMap: Record<string, string> = {
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
  return languageMap[language] || 'en';
};

const DEFAULT_LANGUAGE: LanguageType = { code: 'en', label: 'English', flag: '🇺🇸' };
export function JournalProvider({ children }: { children: ReactNode }) {
  const [journalInput, setJournalInput] = useState('');
  const [language, setLanguage] = useState<LanguageType>(DEFAULT_LANGUAGE);
  return (
    <JournalContext.Provider value={{ journalInput, setJournalInput, language, setLanguage }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within a JournalProvider');
  return context;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setProfileLoading(true);
      getProfile(user.id)
        .then(profileData => {
          setProfile(profileData);
        })
        .catch(err => {
          setProfileError(err.message);
        })
        .finally(() => setProfileLoading(false));
    } else {
      setProfile(null);
      setProfileError(null);
      setProfileLoading(false);
    }
  }, [user?.id]);

  const saveProfileWithError = async (data: ProfileData) => {
    try {
      const profileToSave = { ...data, id: user.id };
      await saveProfile(profileToSave);
      setProfile(profileToSave);
      setProfileError(null);
    } catch (err: any) {
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
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [journalInput, setJournalInput] = useState('');
  const [language, setLanguage] = useState<LanguageType>(DEFAULT_LANGUAGE);
  const { user } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

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

  useEffect(() => {
    if (profile?.language) {
      // Map profile.language code to a full LanguageType object
      const LANGUAGES: LanguageType[] = [
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'en', label: 'English', flag: '🇺🇸' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
      ];
      const found = LANGUAGES.find(l => l.code === profile.language);
      setLanguage(found || DEFAULT_LANGUAGE);
    }
  }, [profile?.language]);

  const saveProfileWithError = async (data: ProfileData) => {
    try {
      const profileToSave = { ...data };
      if (!profileToSave.id) profileToSave.id = user.id;
      await saveProfile(profileToSave);
      setProfile(profileToSave);
      setProfileError(null);
    } catch (err: any) {
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