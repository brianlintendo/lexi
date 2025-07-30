import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import TopNavHeader from '../components/TopNavHeader';
import AccountSection from '../components/AccountSection';
import AppSettingsSection from '../components/AppSettingsSection';
import PreferencesSection from '../components/PreferencesSection';

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <TopNavHeader title="Account" onBack={() => navigate(-1)} />
      <div className="settings-content">
        <div className="settings-container">
          <AccountSection />
          <AppSettingsSection />
          <PreferencesSection />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

export default SettingsPage; 