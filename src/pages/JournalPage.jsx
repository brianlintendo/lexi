import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import micIcon from '../assets/icons/mic.svg';
import sendIcon from '../assets/icons/send.svg';
import imageIcon from '../assets/icons/image.svg';
import savedIcon from '../assets/icons/saved.svg';
import accountIcon from '../assets/icons/account.svg';
import { useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import BottomSheet from '../components/BottomSheet';
import ChatActionsRow from '../components/ChatActionsRow';
import 'flag-icons/css/flag-icons.min.css';
import { useJournal } from '../components/JournalContext';
import LanguageSheet from '../components/LanguageSheet';
import bookSavedIcon from '../assets/icons/book-saved.svg';
import { useUser } from '../hooks/useAuth';
import { fetchSavedPhrases, addSavedPhrase, removeSavedPhrase, checkPhraseExists } from '../api/savedPhrases';
// Lucide placeholders for missing icons
const JournalIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>
);

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  // Make Monday the first day of the week
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
}

function getWeekDates(date) {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDateHeading(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

const STORAGE_KEY = 'lexi-journal-entries';

export default function JournalPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [journalEntries, setJournalEntries] = useState({}); // { 'YYYY-MM-DD': 'entry text' }
  const [lang, setLang] = useState('fr');
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const { journalInput, setJournalInput, language, setLanguage } = useJournal();
  const [showLangSheet, setShowLangSheet] = useState(false);
  const { user } = useUser();

  // Conversation preview logic
  const [chatPreview, setChatPreview] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem('lexi-chat-messages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Find last AI and user messages
        const lastAi = [...parsed].reverse().find(m => m.sender === 'ai');
        const lastUser = [...parsed].reverse().find(m => m.sender === 'user');
        if (lastAi && lastUser) {
          setChatPreview({ ai: lastAi, user: lastUser });
        } else {
          setChatPreview(null);
        }
      } catch {
        setChatPreview(null);
      }
    } else {
      setChatPreview(null);
    }
  }, []);

  const handleResume = () => navigate('/chat');
  const handleEnd = () => {
    localStorage.removeItem('lexi-chat-messages');
    setChatPreview(null);
  };

  const weekDates = getWeekDates(selectedDate);
  const selectedKey = getDateKey(selectedDate);
  const todayKey = getDateKey(today);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setJournalEntries(parsed);
        // If current selected date has an entry, load it
        if (parsed[selectedKey]) setText(parsed[selectedKey]);
      } catch {}
    }
    // eslint-disable-next-line
  }, []);

  // Save to localStorage whenever journalEntries changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Save entry for selected date
  const handleTextChange = (e) => {
    setText(e.target.value);
    setJournalInput(e.target.value); // <-- update context
    setJournalEntries((prev) => ({ ...prev, [selectedKey]: e.target.value }));
  };

  // When clicking a date, set as selected and load its entry
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const key = getDateKey(date);
    setText(journalEntries[key] || '');
  };

  const PROMPT_BUBBLES = {
    en: "Hello! Ready to write in English? How are you feeling today?",
    es: "¡Hola! ¿Listo(a) para escribir en español? ¿Cómo te sientes hoy?",
    fr: "Bonjour ! Prêt(e) à écrire en français ? Comment tu te sens aujourd'hui ?",
    zh: "你好！准备好用中文写作了吗？你今天感觉怎么样？",
    pt: "Olá! Pronto(a) para escrever em português? Como você está se sentindo hoje?",
    it: "Ciao! Pronto(a) a scrivere in italiano? Come ti senti oggi?",
  };
  const PLACEHOLDERS = {
    en: "I feel...",
    es: "Me siento...",
    fr: "Je me sens...",
    zh: "我觉得...",
    pt: "Eu me sinto...",
    it: "Mi sento...",
  };

  // Saved Words Feature
  const [savedWords, setSavedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSavedPhrases = async () => {
    if (!user?.id) {
      setSavedWords([]);
      setLoading(false);
      return;
    }

    try {
      const phrases = await fetchSavedPhrases(user.id);
      setSavedWords(phrases);
    } catch (error) {
      console.error('Error loading saved phrases:', error);
      setSavedWords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedPhrases();
  }, [user?.id]);

  // Reload when page gains focus
  useEffect(() => {
    const handleFocus = () => loadSavedPhrases();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  const addWord = async () => {
    if (!newWord.trim() || !user?.id) return;

    try {
      // Check if phrase already exists
      const exists = await checkPhraseExists(user.id, newWord.trim());
      if (exists) {
        setNewWord('');
        return;
      }

      // Add the phrase
      const result = await addSavedPhrase(user.id, newWord.trim(), '');
      if (result) {
        setSavedWords(prev => [result, ...prev]);
        setNewWord('');
      } else {
        alert('Failed to save phrase. Please try again.');
      }
    } catch (error) {
      console.error('Error adding phrase:', error);
      alert('Failed to save phrase. Please try again.');
    }
  };

  const removeWord = async (phraseId) => {
    if (!user?.id) return;

    try {
      const success = await removeSavedPhrase(user.id, phraseId);
      if (success) {
        setSavedWords(prev => prev.filter(item => item.id !== phraseId));
      } else {
        alert('Failed to remove phrase. Please try again.');
      }
    } catch (error) {
      console.error('Error removing phrase:', error);
      alert('Failed to remove phrase. Please try again.');
    }
  };

  return (
    <div className="journal-bg">
      {/* Top Section */}
      <div className="journal-header-flex">
        <div className="weekdays-row-centered" style={{ display: 'flex', justifyContent: 'flex-start', gap: 20 }}>
          {weekDates.map((date, i) => {
            const key = getDateKey(date);
            const isActive = key === getDateKey(selectedDate);
            const isToday = key === todayKey;
            const hasEntry = !!journalEntries[key];
            return (
              <div
                className={`weekday${isActive ? ' selected' : ''}${isToday ? ' today' : ''}`}
                key={key}
                onClick={() => handleDateClick(date)}
                style={{ position: 'relative' }}
              >
                <div className="weekday-label">{weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                <div className="weekday-date">{date.getDate()}</div>
                {hasEntry && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 2,
                      top: 2,
                      fontSize: 14,
                      color: isActive ? '#fff' : '#7A54FF',
                      background: isActive ? '#7A54FF' : 'transparent',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Has entry"
                  >
                    ✓
                  </span>
                )}
                {isToday && !isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: -6,
                      transform: 'translateX(-50%)',
                      width: 6,
                      height: 6,
                      background: '#00C853',
                      borderRadius: '50%',
                      display: 'block',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <span
          className={`fi fi-${language === 'en' ? 'us' : language === 'es' ? 'es' : language === 'fr' ? 'fr' : language === 'zh' ? 'cn' : language === 'pt' ? 'br' : language === 'it' ? 'it' : 'fr'}`}
          style={{ fontSize: 24, marginLeft: 16, cursor: 'pointer' }}
          aria-label="Language Flag"
          onClick={() => setShowLangSheet(true)}
        />
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for notes"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Main Content */}
      <div className="journal-main">
        <div className="date-heading">{formatDateHeading(selectedDate)}</div>
        {/* Show chat bubbles below date if chatPreview exists */}
        {chatPreview ? (
          <>
            <div style={{ width: '100%', margin: '24px 0 0 0' }}>
              <ChatBubble sender="ai" text={chatPreview.ai.text} />
              <ChatBubble sender="user" text={chatPreview.user.text} />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
              <button
                style={{
                  width: '100%',
                  background: '#7A54FF',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 20,
                  border: 'none',
                  borderRadius: 14,
                  padding: '1.1rem 0',
                  marginBottom: 0,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px 0 rgba(122,84,255,0.10)'
                }}
                onClick={handleResume}
              >Resume</button>
              <button
                style={{
                  width: '100%',
                  background: '#D1D1D1',
                  color: '#212121',
                  fontWeight: 700,
                  fontSize: 20,
                  border: 'none',
                  borderRadius: 14,
                  padding: '1.1rem 0',
                  cursor: 'pointer',
                  marginBottom: 0
                }}
                onClick={handleEnd}
              >End</button>
            </div>
          </>
        ) : (
          <>
            <div className="prompt-bubble">
              {PROMPT_BUBBLES[language] || PROMPT_BUBBLES['fr']}
            </div>
            <textarea
              className="journal-textarea"
              placeholder={PLACEHOLDERS[language] || PLACEHOLDERS['fr']}
              value={text}
              onChange={handleTextChange}
            />
          </>
        )}
      </div>

      {/* Bottom Actions: only show if no chat in progress */}
      {!chatPreview && (
        <div style={{ marginBottom: 96 }}>
          <ChatActionsRow
            onSpeak={() => {}}
            onSend={() => navigate('/chat')}
            onImage={() => {}}
            sendDisabled={false}
          />
          {/* Render saved words list for testing */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontWeight: 700, color: '#7A54FF', marginBottom: 8 }}>Saved Words (Test)</h3>
            {!user?.id ? (
              <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>Please sign in to view saved phrases.</div>
            ) : loading ? (
              <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>Loading...</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {savedWords.map((item) => (
                  <li key={item.id} style={{ background: '#f3f0ff', borderRadius: 8, padding: '8px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600 }}>{item.phrase}</span>
                    {item.translation && <span style={{ color: '#888', marginLeft: 8, fontSize: 14 }}>{item.translation}</span>}
                    <button onClick={() => removeWord(item.id)} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#D32F2F', fontWeight: 700, cursor: 'pointer' }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Tab Bar (bottom nav) - always present, rounded top corners */}
      <div className="tab-bar" style={{
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        boxShadow: '0 -2px 16px 0 rgba(122,84,255,0.06)',
        background: '#fff',
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99,
        maxWidth: 480,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 72,
      }}>
        <button onClick={() => navigate('/journal')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={bookSavedIcon} alt="Journal" style={{ width: 28, height: 28 }} />
        </button>
        <button onClick={() => navigate('/saved')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={savedIcon} alt="Saved Words" style={{ width: 28, height: 28 }} />
        </button>
        <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <img src={accountIcon} alt="Account" style={{ width: 28, height: 28 }} />
        </button>
      </div>
      <LanguageSheet
        open={showLangSheet}
        onClose={() => setShowLangSheet(false)}
        selected={language}
        onSelect={code => { setLanguage(code); setShowLangSheet(false); }}
      />
    </div>
  );
} 