import React, { createContext, useContext, useState, ReactNode } from 'react';

interface JournalContextType {
  language: string;
  setLanguage: (lang: string) => void;
  journalInput: string;
  setJournalInput: (input: string) => void;
  messages: { sender: string; text: string }[];
  setMessages: React.Dispatch<React.SetStateAction<{ sender: string; text: string }[]>>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('fr');
  const [journalInput, setJournalInput] = useState('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  return (
    <JournalContext.Provider value={{ language, setLanguage, journalInput, setJournalInput, messages, setMessages }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) throw new Error('useJournal must be used within a JournalProvider');
  return context;
}; 