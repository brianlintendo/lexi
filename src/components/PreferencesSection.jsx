import React, { useState, useEffect } from 'react';
import { useProfile } from '../components/JournalContext';
import { supabase } from '../supabaseClient';

const PROFICIENCY_LEVELS = [
  { value: 'A1 (Beginner)', label: 'A1 (Beginner)' },
  { value: 'A2 (Elementary)', label: 'A2 (Elementary)' },
  { value: 'B1 (Intermediate)', label: 'B1 (Intermediate)' },
  { value: 'B2 (Upper-Intermediate)', label: 'B2 (Upper-Intermediate)' },
  { value: 'C1 (Advanced)', label: 'C1 (Advanced)' },
];

const PreferencesSection = () => {
  const { profile, saveProfile, profileLoading } = useProfile();
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
    <div className="preferences-section">
      <h3 className="section-title">Preferences</h3>
      
      <div className="preference-row">
        <label className="preference-label">Preferred Language</label>
        <div className="dropdown-container">
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            disabled={saving || profileLoading}
            className="preference-dropdown"
          >
            <option value="" disabled>Select language…</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.label}>
                {lang.emoji ? `${lang.emoji} ` : ''}{lang.label}
              </option>
            ))}
          </select>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      <div className="preference-row">
        <label className="preference-label">Proficiency</label>
        <div className="dropdown-container">
          <select
            value={selectedProficiency}
            onChange={handleProficiencyChange}
            disabled={saving || profileLoading}
            className="preference-dropdown"
          >
            <option value="" disabled>Select proficiency…</option>
            {PROFICIENCY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      {saving && <div className="saving-indicator">Saving…</div>}
    </div>
  );
};

export default PreferencesSection; 