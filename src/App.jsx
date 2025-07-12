import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JournalPage from './pages/JournalPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import { JournalProvider } from './components/JournalContext';

function App() {
  return (
    <JournalProvider>
      <div className="bg-default" style={{ minHeight: '100vh' }}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Router>
      </div>
    </JournalProvider>
  );
}

export default App;
