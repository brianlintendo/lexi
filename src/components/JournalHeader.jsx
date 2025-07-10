import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function JournalHeader({ selectedDate, onDateChange, selectedLanguage, onLanguageChange, onSearch }) {
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowDatePicker(false);
        setShowLanguagePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate dates for the last 7 days
  const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="journal-header" ref={headerRef}>
      {/* Top Row - Back, Date, Settings */}
      <div className="header-top">
        <span className="header-icon" onClick={() => navigate('/')}>←</span>
        
        <div className="date-selector" onClick={() => setShowDatePicker(!showDatePicker)}>
          <span className="header-title">
            {formatDate(selectedDate)}
            {isToday(selectedDate) && <span className="today-indicator">Today</span>}
          </span>
          <span className="date-arrow">▼</span>
        </div>
        
        <span className="header-icon" onClick={() => navigate('/settings')}>⚙️</span>
      </div>

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <div className="date-picker">
          <div className="date-grid">
            {weekDates.map((date) => (
              <div
                key={date.toISOString()}
                className={`date-option ${date.toDateString() === selectedDate.toDateString() ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
                onClick={() => {
                  onDateChange(date);
                  setShowDatePicker(false);
                }}
              >
                <span className="date-day">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="date-number">{date.getDate()}</span>
                {isToday(date) && <span className="today-dot"></span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row - Language, Search */}
      <div className="header-bottom">
        <div className="language-selector" onClick={() => setShowLanguagePicker(!showLanguagePicker)}>
          <span className="language-flag">
            {languages.find(lang => lang.code === selectedLanguage)?.flag || '🇺🇸'}
          </span>
          <span className="language-text">
            {languages.find(lang => lang.code === selectedLanguage)?.name || 'English'}
          </span>
          <span className="language-arrow">▼</span>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="search-button" onClick={handleSearch}>
            🔍
          </button>
        </div>
      </div>

      {/* Language Picker Dropdown */}
      {showLanguagePicker && (
        <div className="language-picker">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`language-option ${language.code === selectedLanguage ? 'selected' : ''}`}
              onClick={() => {
                onLanguageChange(language.code);
                setShowLanguagePicker(false);
              }}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-name">{language.name}</span>
              {language.code === selectedLanguage && <span className="check-mark">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JournalHeader; 