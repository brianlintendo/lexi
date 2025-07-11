import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import micIcon from '../assets/icons/mic.svg';
import sendIcon from '../assets/icons/send.svg';
import imageIcon from '../assets/icons/image.svg';
import savedIcon from '../assets/icons/saved.svg';
import accountIcon from '../assets/icons/account.svg';
import { useNavigate } from 'react-router-dom';
// Lucide placeholders for missing icons
const JournalIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>
);
const FranceFlag = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...props}><rect width="24" height="24" rx="4" fill="#fff"/><rect x="0" y="0" width="8" height="24" fill="#0055A4"/><rect x="16" y="0" width="8" height="24" fill="#EF4135"/></svg>
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
    setJournalEntries((prev) => ({ ...prev, [selectedKey]: e.target.value }));
  };

  // When clicking a date, set as selected and load its entry
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const key = getDateKey(date);
    setText(journalEntries[key] || '');
  };

  return (
    <div className="journal-bg">
      {/* Top Section */}
      <div className="journal-header-flex">
        <div className="weekdays-row-centered">
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
        <button className="lang-btn" aria-label="Change language">
          <FranceFlag style={{ width: 24, height: 24 }} />
        </button>
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
        <div className="prompt-bubble">
          Bonjour ! Prêt(e) à écrire en français ?<br />
          Comment tu te sens aujourd'hui ?
        </div>
        <textarea
          className="journal-textarea"
          placeholder="Je me sens..."
          value={text}
          onChange={handleTextChange}
        />
      </div>

      {/* Bottom Actions */}
      <div className="journal-actions">
        <button className="action-btn action-btn-icon" style={{ width: 52, height: 52 }}>
          <img src={micIcon} alt="Mic" style={{ width: 28, height: 28 }} />
          <div>Speak</div>
        </button>
        <button className="action-btn send-btn" style={{ width: 80, height: 80 }} onClick={() => navigate('/chat')}>
          <img src={sendIcon} alt="Send" style={{ width: 36, height: 36 }} />
          <div>Send</div>
        </button>
        <button className="action-btn action-btn-icon" style={{ width: 52, height: 52 }}>
          <img src={imageIcon} alt="Image" style={{ width: 28, height: 28 }} />
          <div>Image</div>
        </button>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar">
        <div className="tab active">
          <JournalIcon style={{ width: 24, height: 24 }} />
          <div>Journal</div>
        </div>
        <div className="tab">
          <img src={savedIcon} alt="Saved" style={{ width: 24, height: 24 }} />
          <div>Saved</div>
        </div>
        <div className="tab">
          <img src={accountIcon} alt="Account" style={{ width: 24, height: 24 }} />
          <div>Account</div>
        </div>
      </div>
    </div>
  );
} 