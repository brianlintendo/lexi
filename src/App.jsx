import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import NameEntryPage from './pages/NameEntryPage';
import LanguageSelectPage from './pages/LanguageSelectPage';
import ProficiencyPage from './pages/ProficiencyPage';
import JournalPage from './pages/JournalPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import SavedPage from './pages/SavedPage';
import ChatPage from './pages/ChatPage';
import PromptsPage from './pages/PromptsPage';
import VoiceJournal from './pages/VoiceJournal';
import OnboardMotivationPage from './pages/OnboardMotivationPage';
import SplashPage from './pages/SplashPage';
import { supabase } from './supabaseClient';
import { useUser } from './hooks/useAuth';
import { useProfile } from './components/JournalContext';

function PromptsPageWithNav() {
  const navigate = useNavigate();
  return <PromptsPage onSave={theme => navigate('/chat', { state: { selectedTheme: theme } })} />;
}

function AppRoutes() {
  const { user } = useUser();
  const { profile, profileLoading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash.includes('access_token')) {
      supabase.auth.exchangeCodeForSession().then(({ data, error }) => {
        if (data?.session) {
          window.location.hash = '';
          // Don't redirect here - let the profile check handle it
        }
        if (error) {
          console.error('Supabase OAuth error:', error);
        }
      });
    }
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    if (!profileLoading && user) {
      if (profile && profile.name && profile.language && profile.proficiency && profile.motivation) {
        // User has completed onboarding, redirect to journal
        if (window.location.pathname === '/' || window.location.pathname.startsWith('/onboard')) {
          navigate('/journal', { replace: true });
        }
      } else if (user && !profile && window.location.pathname === '/') {
        // User is signed in but hasn't completed onboarding, redirect to onboarding
        navigate('/onboard/name', { replace: true });
      }
    }
  }, [user, profile, profileLoading, navigate]);

  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/onboard/name" element={<NameEntryPage />} />
      <Route path="/onboard/language" element={<LanguageSelectPage />} />
      <Route path="/onboard/motivation" element={<OnboardMotivationPage />} />
      <Route path="/onboard/proficiency" element={<ProficiencyPage />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/prompts" element={<PromptsPageWithNav />} />
      <Route path="/voice-journal" element={<VoiceJournal />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
