import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import NameEntryPage from './pages/NameEntryPage';
import LanguageSelectPage from './pages/LanguageSelectPage';
import ProficiencyPage from './pages/ProficiencyPage';
import JournalPage from './pages/JournalPage';
import SettingsPage from './pages/SettingsPage';
import SavedPage from './pages/SavedPage';
import ChatPage from './pages/ChatPage';
import PromptsPage from './pages/PromptsPage';
import VoiceJournal from './pages/VoiceJournal';
import { supabase } from './supabaseClient';

function PromptsPageWithNav() {
  const navigate = useNavigate();
  return <PromptsPage onSave={theme => navigate('/chat', { state: { selectedTheme: theme } })} />;
}

export default function App() {
  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      supabase.auth.getSessionFromUrl().then(({ data, error }) => {
        if (data?.session) {
          window.location.hash = '';
          window.location.replace('/journal#'); // Redirect to journal after sign-in
        }
        if (error) {
          // Optionally: handle error
          console.error('Supabase OAuth error:', error);
        }
      });
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboard/name" element={<NameEntryPage />} />
        <Route path="/onboard/language" element={<LanguageSelectPage />} />
        <Route path="/onboard/proficiency" element={<ProficiencyPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/prompts" element={<PromptsPageWithNav />} />
        <Route path="/voice-journal" element={<VoiceJournal />} />
      </Routes>
    </BrowserRouter>
  );
}
