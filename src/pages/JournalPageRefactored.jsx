import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';
import 'flag-icons/css/flag-icons.min.css';

// Custom hooks for separated concerns
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { useChatPreview } from '../hooks/useChatPreview';

// Components
import JournalCalendar from '../components/JournalCalendar';
import JournalEntryDisplay from '../components/JournalEntryDisplay';
import ChatBubble from '../components/ChatBubble';
import ChatActionsRow from '../components/ChatActionsRow';
import BottomNav from '../components/BottomNav';
import LanguageSheet from '../components/LanguageSheet';

// Context and utilities
import { useJournal, useProfile } from '../components/JournalContext';
import { getChatCompletion } from '../openai';
import { 
  getFlagCode, 
  isPromptText, 
  PROMPT_BUBBLES, 
  PLACEHOLDERS 
} from '../utils/journalHelpers';

export default function JournalPageRefactored() {
  const navigate = useNavigate();
  const { journalInput, setJournalInput, language, setLanguage } = useJournal();
  const { profile } = useProfile();
  
  // Custom hooks for separated concerns
  const {
    entries: journalEntries,
    loading,
    error,
    saveEntry,
    deleteEntryByDate,
    markAsSubmitted,
    hasSubmittedEntry
  } = useJournalEntries();
  
  const {
    selectedDate,
    selectedKey,
    todayKey,
    weekDates,
    weekdays,
    selectDate,
    formatDateHeading
  } = useDateNavigation();
  
  const { chatPreview, clearChatPreview } = useChatPreview();

  // Local UI state
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [showCompletedEntry, setShowCompletedEntry] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPromptLoading, setAiPromptLoading] = useState(false);

  // Load text when selected date changes
  useEffect(() => {
    const entry = journalEntries[selectedKey];
    if (entry) {
      const entryText = typeof entry === 'object' ? entry.text : entry;
      if (!isPromptText(entryText)) {
        setText(entryText);
      } else {
        setText('');
      }
      setShowCompletedEntry(hasSubmittedEntry(selectedKey));
    } else {
      setText('');
      setShowCompletedEntry(false);
    }
  }, [selectedKey, journalEntries, isEditing, hasSubmittedEntry]);

  // Generate AI prompt
  useEffect(() => {
    const allKeys = Object.keys(journalEntries).sort();
    const prevKeys = allKeys.filter(k => k < selectedKey).slice(-5);
    const prevEntries = prevKeys.map(k => `Entry for ${k}: ${journalEntries[k]}`).join('\n');
    
    if (prevEntries) {
      setAiPromptLoading(true);
      getChatCompletion(
        `You are a friendly language learning coach. ONLY reply with a single, short, motivating prompt for the user's next journal entry, in ${language}. Do NOT include corrections, vocabulary, or any other sections. Here are my last few journal entries:\n${prevEntries}\nWrite the prompt in ${language}.`
      )
        .then(res => setAiPrompt(res.trim()))
        .catch(() => setAiPrompt(''))
        .finally(() => setAiPromptLoading(false));
    } else {
      setAiPrompt('');
    }
  }, [selectedKey, language, journalEntries]);

  // Event handlers
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setJournalInput(newText);
    saveEntry(selectedKey, newText, false);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  const handleDateClick = (date) => {
    selectDate(date);
    setIsEditing(false);
    setShowDialog(false);
  };

  const handleEdit = () => {
    const entry = journalEntries[selectedKey];
    if (entry) {
      const entryText = typeof entry === 'object' ? entry.text : entry;
      setText(entryText);
      setIsEditing(true);
      setShowCompletedEntry(false);
      setShowDialog(false);
    }
  };

  const handleSend = () => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 10) {
      setIsEditing(false);
      navigate('/chat', { state: { journalEntry: text } });
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  const handleDelete = () => {
    deleteEntryByDate(selectedKey);
    setText('');
    setShowCompletedEntry(false);
    setShowDialog(false);
  };

  const handleResume = () => navigate('/chat');

  const handleEnd = () => {
    const stored = localStorage.getItem('lexi-chat-messages');
    if (stored) {
      try {
        const messages = JSON.parse(stored);
        const correctedEntries = messages
          .filter(msg => msg.sender === 'ai')
          .map(msg => {
            const correctedMatch = msg.text.match(/\*\*Corrected Entry:\*\*[\s\n]*([\s\S]*?)(?=\*\*Key Corrections:|$)/i);
            if (correctedMatch) {
              return correctedMatch[1].trim()
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");
            }
            return null;
          })
          .filter(entry => entry !== null);
        
        let journalEntry = correctedEntries.join('\n\n');
        
        if (!journalEntry.trim() || journalEntry.toLowerCase().includes('no corrections needed')) {
          const userMessages = messages.filter(msg => msg.sender === 'user').map(msg => msg.text);
          journalEntry = userMessages.join('\n\n');
        }
        
        if (journalEntry.trim()) {
          saveEntry(selectedKey, journalEntry, true);
          markAsSubmitted(selectedKey);
          setText(journalEntry);
          setShowCompletedEntry(true);
        }
      } catch (error) {
        console.error('Error processing chat messages:', error);
      }
    } else if (text.trim() && !isPromptText(text)) {
      saveEntry(selectedKey, text, true);
      markAsSubmitted(selectedKey);
      setShowCompletedEntry(true);
    }
    
    clearChatPreview();
    setIsEditing(false);
  };

  // Calculate word count for validation
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const hasMinimumWords = wordCount >= 10;

  return (
    <div className="journal-bg">
      {/* Calendar Header */}
      <JournalCalendar
        weekDates={weekDates}
        weekdays={weekdays}
        selectedDate={selectedDate}
        todayKey={todayKey}
        journalEntries={journalEntries}
        onDateClick={handleDateClick}
        language={language}
        onLanguageClick={() => setShowLangSheet(true)}
      />

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
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            color: '#7A54FF',
            fontSize: '16px'
          }}>
            Loading journal entries...
          </div>
        )}

        {/* Date Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
          position: 'relative'
        }}>
          <div className="date-heading">{formatDateHeading(selectedDate)}</div>
          {chatPreview && (
            <div style={{
              background: '#f0f0f0',
              color: '#666',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              IN PROGRESS
            </div>
          )}
          {error && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#ffebee',
              color: '#c62828',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              marginTop: '8px',
              border: '1px solid #ffcdd2'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Content Display */}
        {showCompletedEntry && text ? (
          <JournalEntryDisplay
            text={text}
            showDialog={showDialog}
            onToggleDialog={() => setShowDialog(!showDialog)}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : chatPreview ? (
          <>
            <div style={{ width: '100%', margin: '24px 0 0 0' }}>
              <ChatBubble sender="ai" text={chatPreview.ai.text} userText={chatPreview.user.text} />
              <ChatBubble sender="user" text={chatPreview.user.text} />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32, marginBottom: 120 }}>
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
              >
                Resume
              </button>
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
              >
                End
              </button>
            </div>
          </>
        ) : !hasSubmittedEntry(selectedKey) ? (
          <>
            <div className="prompt-bubble">
              {aiPromptLoading
                ? 'Lexi is thinking of a prompt...'
                : aiPrompt || PROMPT_BUBBLES[language] || PROMPT_BUBBLES['en']}
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                className="journal-textarea"
                placeholder={PLACEHOLDERS[language] || PLACEHOLDERS['en']}
                value={text}
                onChange={handleTextChange}
                style={{ height: 'auto', minHeight: '40px' }}
              />
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Actions */}
      {!chatPreview && (
        <div style={{ marginBottom: 120, position: 'relative' }}>
          {showTooltip && (
            <div style={{
              position: 'absolute',
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              color: '#333',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              zIndex: 1000,
              border: '2px solid',
              borderImage: 'linear-gradient(180deg, #FDB3B3 0%, #72648C 48.08%, #6F7BD8 100%) 1',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              width: 'fit-content',
              minWidth: 'max-content'
            }}>
              Type more than 10 words for your first entry
            </div>
          )}
          <ChatActionsRow
            onSpeak={() => navigate('/voice-journal')}
            onSend={handleSend}
            onImage={() => {}}
            sendDisabled={false}
          />
        </div>
      )}

      {/* Navigation */}
      <BottomNav />
      <LanguageSheet
        open={showLangSheet}
        onClose={() => setShowLangSheet(false)}
        selected={language}
        onSelect={code => { setLanguage(code); setShowLangSheet(false); }}
      />
    </div>
  );
} 