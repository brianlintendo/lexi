import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { AuthProvider } from './hooks/useAuth';
import { ProfileProvider, JournalProvider } from './components/JournalContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <JournalProvider>
          <App />
        </JournalProvider>
      </ProfileProvider>
    </AuthProvider>
  </React.StrictMode>
);
