import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';
import TopNavHeader from '../components/TopNavHeader';
import { useProfile } from '../components/JournalContext';
import { supabase } from '../supabaseClient';

const PROFICIENCY_LEVELS = [
  { value: 'A1 (Beginner)', label: 'A1 (Beginner)' },
  { value: 'A2 (Elementary)', label: 'A2 (Elementary)' },
  { value: 'B1 (Intermediate)', label: 'B1 (Intermediate)' },
  { value: 'B2 (Upper-Intermediate)', label: 'B2 (Upper-Intermediate)' },
  { value: 'C1 (Advanced)', label: 'C1 (Advanced)' },
];

function SettingsPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInGuest, signOut } = useUser();
  const { profile, saveProfile, profileLoading } = useProfile();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(profile?.language || '');
  const [selectedProficiency, setSelectedProficiency] = useState(profile?.proficiency || '');

  useEffect(() => {
    async function fetchLanguages() {
      const { data, error } = await supabase
        .from('languages')
        .select('code, label, emoji, enabled')
        .eq('enabled', true)
        .order('label', { ascending: true });
      if (!error && data) setLanguages(data);
    }
    fetchLanguages();
  }, []);

  useEffect(() => {
    setSelectedLanguage(profile?.language || '');
    setSelectedProficiency(profile?.proficiency || '');
  }, [profile]);

  const handleSave = async (field, value) => {
    setSaving(true);
    try {
      await saveProfile({
        ...profile,
        [field]: value,
      });
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
    handleSave('language', e.target.value);
  };
  const handleProficiencyChange = (e) => {
    setSelectedProficiency(e.target.value);
    handleSave('proficiency', e.target.value);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <TopNavHeader title="Settings" onBack={() => navigate(-1)} />
      <div style={{ flex: 1, padding: '32px 24px 120px 24px', maxWidth: 500, margin: '0 auto' }}>
        {/* Authentication Section */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Account</h3>
          {user ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600 }}>{user.email || 'Guest User'}</div>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>{user.email ? 'Signed in' : 'Guest account'}</div>
              <button onClick={signOut} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Sign Out</button>
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Sign in to sync your saved phrases across devices</div>
              <button onClick={signInWithGoogle} style={{ background: '#7A54FF', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, marginRight: 8, cursor: 'pointer' }}>Sign in with Google</button>
              <button onClick={signInGuest} style={{ background: '#f3f0ff', color: '#7A54FF', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Continue as Guest</button>
            </div>
          )}
        </div>
        {/* App Settings Section */}
        <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>App Settings</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600 }}>Notifications</span>
          <div onClick={() => setNotifications(!notifications)} style={{ width: 50, height: 30, background: notifications ? '#7A54FF' : '#ececec', borderRadius: 15, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ width: 26, height: 26, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: notifications ? 22 : 2, transition: 'left 0.2s' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600 }}>Dark Mode</span>
          <div onClick={() => setDarkMode(!darkMode)} style={{ width: 50, height: 30, background: darkMode ? '#7A54FF' : '#ececec', borderRadius: 15, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
            <div style={{ width: 26, height: 26, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: darkMode ? 22 : 2, transition: 'left 0.2s' }}></div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600 }}>Version</span>
          <span style={{ color: '#888' }}>1.0.0</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <span style={{ fontWeight: 600 }}>Clear Conversation</span>
          <button onClick={() => { if (window.confirm('Are you sure you want to clear all conversations?')) { localStorage.removeItem('lexi-chat-messages'); alert('Conversation cleared!'); } }} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        </div>
        {/* Preferences Dropdowns at the bottom */}
        <div style={{ borderTop: '1px solid #ececec', paddingTop: 32, marginTop: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Preferences</h2>
          <div style={{ marginBottom: 32 }}>
            <label htmlFor="language-select" style={{ fontWeight: 600, fontSize: 16, display: 'block', marginBottom: 8 }}>Preferred Language</label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              disabled={saving || profileLoading}
              style={{ width: '100%', padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid #ececec', fontFamily: 'Albert Sans, sans-serif' }}
            >
              <option value="" disabled>Select language…</option>
              {languages.map(lang => (
                <option key={lang.code} value={lang.label}>
                  {lang.emoji ? `${lang.emoji} ` : ''}{lang.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 32 }}>
            <label htmlFor="proficiency-select" style={{ fontWeight: 600, fontSize: 16, display: 'block', marginBottom: 8 }}>Proficiency</label>
            <select
              id="proficiency-select"
              value={selectedProficiency}
              onChange={handleProficiencyChange}
              disabled={saving || profileLoading}
              style={{ width: '100%', padding: '12px', fontSize: 16, borderRadius: 8, border: '1px solid #ececec', fontFamily: 'Albert Sans, sans-serif' }}
            >
              <option value="" disabled>Select proficiency…</option>
              {PROFICIENCY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
          {saving && <div style={{ color: '#7A54FF', fontWeight: 600 }}>Saving…</div>}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default SettingsPage; 