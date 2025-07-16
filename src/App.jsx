import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JournalPage from './pages/JournalPage';
import SettingsPage from './pages/SettingsPage';
import ChatPage from './pages/ChatPage';
import SavedPage from './pages/SavedPage';
import VoiceJournal from './pages/VoiceJournal';
import { JournalProvider } from './components/JournalContext';
import { AuthProvider } from './hooks/useAuth';
// import Login from './components/Login';
import { insertEntry, fetchEntries } from './api/journal';

// function AppContent() {
//   const { user, session } = useUser();
//   const [messages, setMessages] = React.useState([]);
//
//   React.useEffect(() => {
//     if (session?.user?.id) {
//       fetchEntries(session.user.id).then(({ data }) => {
//         if (data) setMessages(data);
//       });
//     }
//   }, [session]);
//
//   if (!user) return <Login />;
//
//   // Pass setMessages and messages as needed to pages/components
//   // Example: after getChatCompletion, call insertEntry and update messages
//   // ...
//
//   return (
//     <JournalProvider>
//       <div className="bg-default" style={{ minHeight: '100vh' }}>
//         <Router>
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/journal" element={<JournalPage />} />
//             <Route path="/chat" element={<ChatPage />} />
//             <Route path="/settings" element={<SettingsPage />} />
//           </Routes>
//         </Router>
//       </div>
//     </JournalProvider>
//   );
// }

function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        {/* <AppContent /> */}
        <div className="bg-default" style={{ minHeight: '100vh' }}>
          <Router>
            <Routes>
              {/* Redirect root to journal page instead of showing landing screen */}
              <Route path="/" element={<Navigate to="/journal" replace />} />
              {/* Keep HomePage route for potential future use */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/voice-journal" element={<VoiceJournal />} />
            </Routes>
          </Router>
        </div>
      </JournalProvider>
    </AuthProvider>
  );
}

export default App;
