import React, { createContext, useContext, useState } from 'react';

const JournalContext = createContext();

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