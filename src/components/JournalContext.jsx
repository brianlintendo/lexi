import React, { createContext, useContext, useState } from 'react';

const JournalContext = createContext();

export function JournalProvider({ children }) {
  const [journalInput, setJournalInput] = useState('');
  return (
    <JournalContext.Provider value={{ journalInput, setJournalInput }}>
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  return useContext(JournalContext);
} 