import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import micIcon from '../assets/icons/mic.svg';
import sendIcon from '../assets/icons/send.svg';
import imageIcon from '../assets/icons/image.svg';
import savedIcon from '../assets/icons/saved.svg';
import accountIcon from '../assets/icons/account.svg';
import moreIcon from '../assets/icons/more.svg';
import { useNavigate } from 'react-router-dom';
import ChatBubble from '../components/ChatBubble';
import BottomSheet from '../components/BottomSheet';
import ChatActionsRow from '../components/ChatActionsRow';
import 'flag-icons/css/flag-icons.min.css';
import { useJournal } from '../components/JournalContext';
import LanguageSheet from '../components/LanguageSheet';
import bookSavedIcon from '../assets/icons/book-saved.svg';
import tickIcon from '../assets/icons/tick.svg';
import { useUser } from '../hooks/useAuth';
import BottomNav from '../components/BottomNav';
import { getChatCompletion } from '../openai';
import { insertEntry, fetchEntries, upsertEntry, deleteEntry } from '../api/journal';

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

// Function to map language codes to flag codes
function getFlagCode(language) {
  const flagMap = {
    'en': 'us',
    'es': 'es', 
    'fr': 'fr',
    'zh': 'cn',
    'pt': 'br',
    'it': 'it',
    'de': 'de',
    'ja': 'jp',
    'ko': 'kr',
    'ru': 'ru',
    'ar': 'sa',
    'hi': 'in',
    'nl': 'nl',
    'sv': 'se',
    'no': 'no',
    'da': 'dk',
    'fi': 'fi',
    'pl': 'pl',
    'tr': 'tr',
    'he': 'il',
    'th': 'th',
    'vi': 'vn',
    'id': 'id',
    'ms': 'my'
  };
  return flagMap[language] || 'us';
}

function getDynamicPrompt(selectedDate, journalEntries, language) {
  const todayKey = getDateKey(selectedDate);
  const yesterday = new Date(selectedDate);
  yesterday.setDate(selectedDate.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);
  const entryToday = journalEntries[todayKey];
  const entryYesterday = journalEntries[yesterdayKey];
  if (entryYesterday && !entryToday) {
    return `Yesterday you wrote: "${entryYesterday.slice(0, 60)}..." How are you feeling today?`;
  } else if (!entryYesterday && !entryToday) {
    return `It's a new day! What would you like to write about today?`;
  } else if (entryToday) {
    return `Great job writing today! Want to add more or reflect on something else?`;
  }
  return PROMPT_BUBBLES[language] || PROMPT_BUBBLES['en'];
}

export default function JournalPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [journalEntries, setJournalEntries] = useState({}); // { 'YYYY-MM-DD': 'entry text' }
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const { journalInput, setJournalInput, language, setLanguage } = useJournal();
  const [showLangSheet, setShowLangSheet] = useState(false);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    // Get the full conversation before clearing it
    const stored = localStorage.getItem('lexi-chat-messages');
    if (stored) {
      try {
        const messages = JSON.parse(stored);
        
        // Extract all corrected entries from AI messages
        const correctedEntries = messages
          .filter(msg => msg.sender === 'ai')
          .map(msg => {
            // Parse the AI message to extract the corrected entry
            const correctedMatch = msg.text.match(/\*\*Corrected Entry:\*\*[\s\n]*([\s\S]*?)(?=\*\*Key Corrections:|$)/i);
            return correctedMatch ? correctedMatch[1].trim() : null;
          })
          .filter(entry => entry !== null); // Remove null entries
        
        // Join all corrected entries with newlines
        const journalEntry = correctedEntries.join('\n\n');
        
        // Save as journal entry for today
        const todayKey = getDateKey(new Date());
        setJournalEntries(prev => ({ 
          ...prev, 
          [todayKey]: {
            text: journalEntry,
            submitted: true
          }
        }));
        setText(journalEntry);
        // Mark as submitted in localStorage
        localStorage.setItem(`submitted-${todayKey}`, 'true');
        setShowCompletedEntry(true);
        
        // Save to Supabase if user is logged in
        if (user?.id && journalEntry.trim()) {
          const todayKey = getDateKey(new Date());
          insertEntry(user.id, journalEntry, null, todayKey) // Use insert for now until constraint is set up
            .then(({ error }) => {
              if (error) {
                console.error('Error saving chat entry to Supabase:', error);
                setError('Failed to save entry to cloud');
              } else {
                setError(null);
              }
            })
            .catch(err => {
              console.error('Error saving chat entry to Supabase:', err);
              setError('Failed to save entry to cloud');
            });
        }
      } catch (error) {
        console.error('Error processing chat messages:', error);
      }
          } else {
        // No chat messages, save current manual text entry
        if (user?.id && text.trim()) {
          const entryDate = selectedKey;
          // Mark as submitted in localStorage
          localStorage.setItem(`submitted-${entryDate}`, 'true');
          // Update local state to mark as submitted
          setJournalEntries(prev => ({
            ...prev,
            [entryDate]: {
              text: text,
              submitted: true
            }
          }));
          insertEntry(user.id, text, null, entryDate)
          .then(({ error }) => {
            if (error) {
              console.error('Error saving manual entry to Supabase:', error);
              setError('Failed to save entry to cloud');
            } else {
              setError(null);
              setShowCompletedEntry(true);
            }
          })
          .catch(err => {
            console.error('Error saving manual entry to Supabase:', err);
            setError('Failed to save entry to cloud');
          });
      } else {
        // No user logged in or no text, just show completed entry
        setShowCompletedEntry(true);
      }
    }
    
    localStorage.removeItem('lexi-chat-messages');
    setChatPreview(null);
  };

  const weekDates = getWeekDates(selectedDate);
  const selectedKey = getDateKey(selectedDate);
  const todayKey = getDateKey(today);

  // Load journal entries from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      setError(null);
      
      fetchEntries(user.id)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching journal entries:', error);
            setError('Failed to load journal entries');
            // Fallback to localStorage if Supabase fails
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                setJournalEntries(parsed);
                if (parsed[selectedKey]) {
                  const entryText = typeof parsed[selectedKey] === 'object' ? parsed[selectedKey].text : parsed[selectedKey];
                  setText(entryText);
                }
              } catch {}
            }
          } else {
            // Convert Supabase data to local format
            const entries = {};
            data?.forEach(entry => {
              const dateKey = entry.entry_date || getDateKey(new Date(entry.created_at));
              entries[dateKey] = {
                text: entry.entry_text,
                ai_reply: entry.ai_reply,
                submitted: !!entry.ai_reply // If there's an AI reply, it was submitted
              };
            });
            setJournalEntries(entries);
            // If current selected date has an entry, load it
            if (entries[selectedKey]) {
              const entryText = typeof entries[selectedKey] === 'object' ? entries[selectedKey].text : entries[selectedKey];
              setText(entryText);
            }
            // Also save to localStorage as cache
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
          }
        })
        .catch(err => {
          console.error('Error fetching journal entries:', err);
          setError('Failed to load journal entries');
          // Fallback to localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              setJournalEntries(parsed);
              if (parsed[selectedKey]) {
                const entryText = typeof parsed[selectedKey] === 'object' ? parsed[selectedKey].text : parsed[selectedKey];
                setText(entryText);
              }
            } catch {}
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // If no user, try localStorage as fallback
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setJournalEntries(parsed);
          if (parsed[selectedKey]) {
            const entryText = typeof parsed[selectedKey] === 'object' ? parsed[selectedKey].text : parsed[selectedKey];
            setText(entryText);
          }
        } catch {}
      }
    }
  }, [user?.id, selectedKey]);

  // Sync localStorage with Supabase when user logs in
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const localEntries = JSON.parse(stored);
          // Upload any local entries that aren't in Supabase yet
          Object.entries(localEntries).forEach(([dateKey, entryText]) => {
            if (entryText && entryText.trim()) {
              insertEntry(user.id, entryText, null, dateKey)
                .then(({ error }) => {
                  if (error) {
                    console.error('Error syncing local entry to Supabase:', error);
                  }
                })
                .catch(err => {
                  console.error('Error syncing local entry to Supabase:', err);
                });
            }
          });
        } catch (error) {
          console.error('Error parsing local entries for sync:', error);
        }
      }
    }
  }, [user?.id]);

  // Save to localStorage whenever journalEntries changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journalEntries));
  }, [journalEntries]);

  // Save entry for selected date
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setJournalInput(newText); // <-- update context
    // Save as draft (not submitted yet)
    setJournalEntries((prev) => ({ 
      ...prev, 
      [selectedKey]: {
        text: newText,
        submitted: false
      }
    }));
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  };

  // When clicking a date, set as selected and load its entry
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const key = getDateKey(date);
    const entry = journalEntries[key];
    if (entry) {
      const entryText = typeof entry === 'object' ? entry.text : entry;
      setText(entryText);
    } else {
      setText('');
    }
  };

  const PROMPT_BUBBLES = {
    en: "Hello! Ready to write in English? How are you feeling today?",
    es: "¡Hola! ¿Listo(a) para escribir en español? ¿Cómo te sientes hoy?",
    fr: "Bonjour ! Prêt(e) à écrire en français ? Comment tu te sens aujourd'hui ?",
    zh: "你好！准备好用中文写作了吗？你今天感觉怎么样？",
    pt: "Olá! Pronto(a) para escrever em português? Como você está se sentindo hoje?",
    it: "Ciao! Pronto(a) a scrivere in italiano? Come ti senti oggi?",
    de: "Hallo! Bereit, auf Deutsch zu schreiben? Wie fühlst du dich heute?",
    ja: "こんにちは！日本語で書く準備はできましたか？今日はどんな気分ですか？",
    ko: "안녕하세요! 한국어로 글쓰기 준비가 되셨나요? 오늘 기분이 어떠신가요?",
    ru: "Привет! Готов писать на русском? Как ты себя чувствуешь сегодня?",
    ar: "مرحباً! مستعد للكتابة بالعربية؟ كيف تشعر اليوم؟",
    hi: "नमस्ते! हिंदी में लिखने के लिए तैयार हैं? आज आप कैसा महसूस कर रहे हैं?",
    nl: "Hallo! Klaar om in het Nederlands te schrijven? Hoe voel je je vandaag?",
    sv: "Hej! Redo att skriva på svenska? Hur mår du idag?",
    no: "Hei! Klar til å skrive på norsk? Hvordan føler du deg i dag?",
    da: "Hej! Klar til at skrive på dansk? Hvordan føler du dig i dag?",
    fi: "Hei! Valmis kirjoittamaan suomeksi? Miten sinusta tuntuu tänään?",
    pl: "Cześć! Gotowy do pisania po polsku? Jak się dzisiaj czujesz?",
    tr: "Merhaba! Türkçe yazmaya hazır mısın? Bugün nasıl hissediyorsun?",
    he: "שלום! מוכן לכתוב בעברית? איך אתה מרגיש היום?",
    th: "สวัสดี! พร้อมเขียนภาษาไทยแล้วหรือยัง? วันนี้คุณรู้สึกอย่างไร?",
    vi: "Xin chào! Sẵn sàng viết bằng tiếng Việt chưa? Hôm nay bạn cảm thấy thế nào?",
    id: "Halo! Siap menulis dalam bahasa Indonesia? Bagaimana perasaanmu hari ini?",
    ms: "Hai! Sedia menulis dalam bahasa Melayu? Bagaimana perasaan anda hari ini?"
  };
  const PLACEHOLDERS = {
    en: "I feel...",
    es: "Me siento...",
    fr: "Je me sens...",
    zh: "我觉得...",
    pt: "Eu me sinto...",
    it: "Mi sento...",
    de: "Ich fühle mich...",
    ja: "私は...感じます",
    ko: "나는... 느낀다",
    ru: "Я чувствую...",
    ar: "أشعر...",
    hi: "मैं महसूस करता हूं...",
    nl: "Ik voel me...",
    sv: "Jag känner mig...",
    no: "Jeg føler meg...",
    da: "Jeg føler mig...",
    fi: "Tunnen itseni...",
    pl: "Czuję się...",
    tr: "Kendimi... hissediyorum",
    he: "אני מרגיש...",
    th: "ฉันรู้สึก...",
    vi: "Tôi cảm thấy...",
    id: "Saya merasa...",
    ms: "Saya berasa..."
  };

  // Saved Words Feature
  const [showCompletedEntry, setShowCompletedEntry] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleEdit = () => {
    setShowCompletedEntry(false);
    setShowDialog(false);
  };

  const handleDelete = () => {
    const todayKey = getDateKey(new Date());
    setJournalEntries(prev => {
      const updated = { ...prev };
      delete updated[todayKey];
      return updated;
    });
    setText('');
    setShowCompletedEntry(false);
    setShowDialog(false);
    
    // Delete from Supabase if user is logged in
    if (user?.id) {
      deleteEntry(user.id, todayKey)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting from Supabase:', error);
            setError('Failed to delete entry from cloud');
          } else {
            setError(null);
          }
        })
        .catch(err => {
          console.error('Error deleting from Supabase:', err);
          setError('Failed to delete entry from cloud');
        });
    }
  };

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiPromptLoading, setAiPromptLoading] = useState(false);

  useEffect(() => {
    // Get last 3-5 entries before selectedDate
    const allKeys = Object.keys(journalEntries).sort();
    const selectedKey = getDateKey(selectedDate);
    const prevKeys = allKeys.filter(k => k < selectedKey).slice(-5);
    const prevEntries = prevKeys.map(k => `Entry for ${k}: ${journalEntries[k]}`).join('\n');
    if (prevEntries) {
      setAiPromptLoading(true);
      getChatCompletion(
        `You are a friendly language learning coach. ONLY reply with a single, short, motivating prompt for the user's next journal entry, in ${language}. Do NOT include corrections, vocabulary, or any other sections. Here are my last few journal entries:\n${prevEntries}\nWrite the prompt in ${language}.`
      ).then(res => {
        setAiPrompt(res.trim());
      }).catch(() => setAiPrompt('')).finally(() => setAiPromptLoading(false));
    } else {
      setAiPrompt('');
    }
  }, [selectedDate, language]); // Removed journalEntries from dependencies

  // Track last chosen language for fallback
  const [lastLanguage, setLastLanguage] = useState(language);
  useEffect(() => {
    if (language) setLastLanguage(language);
  }, [language]);

  // Debug output
  useEffect(() => {
    console.log('Current language:', language, 'Last language:', lastLanguage, 'aiPrompt:', aiPrompt, 'aiPromptLoading:', aiPromptLoading);
  }, [language, lastLanguage, aiPrompt, aiPromptLoading]);

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
            // Check if entry has been submitted (has AI reply or was saved via "End" button)
            const hasSubmittedEntry = !!journalEntries[key] && (
              (typeof journalEntries[key] === 'object' && (journalEntries[key].ai_reply || journalEntries[key].submitted)) ||
              (typeof journalEntries[key] === 'string' && localStorage.getItem(`submitted-${key}`))
            );
            return (
              <div
                className={`weekday${isActive ? ' selected' : ''}${isToday ? ' today' : ''}`}
                key={key}
                onClick={() => handleDateClick(date)}
                style={{ position: 'relative' }}
              >
                <div className="weekday-label">{weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                <div className="weekday-date">
                  {hasSubmittedEntry ? (
                    <img 
                      src={tickIcon} 
                      alt="Entry completed" 
                      style={{
                        width: '14px',
                        height: '14px',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(104%) contrast(97%)'
                      }}
                    />
                  ) : (
                    date.getDate()
                  )}
                </div>
                {isToday && !isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: -6,
                      transform: 'translateX(-50%)',
                      width: 6,
                      height: 6,
                      background: '#7A54FF',
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
          className={`fi fi-${getFlagCode(language)}`}
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
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
          position: 'relative'
        }}>
        <div className="date-heading">{formatDateHeading(selectedDate)}</div>
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
          {showCompletedEntry && text && (
            <div style={{ position: 'relative' }}>
              <img 
                src={moreIcon} 
                alt="More options" 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  cursor: 'pointer',
                  opacity: 0.7
                }}
                onClick={() => setShowDialog(!showDialog)}
              />
              
              {/* Dialog box */}
              {showDialog && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: '1px solid #E0E0E0',
                  zIndex: 1000,
                  marginTop: '8px',
                  overflow: 'hidden',
                  minWidth: '120px'
                }}>
                  <div 
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #F0F0F0'
                    }}
                    onClick={handleEdit}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span style={{ color: '#212121', fontSize: '14px' }}>Edit</span>
                  </div>
                  <div 
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={handleDelete}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    <span style={{ color: '#D32F2F', fontSize: '14px' }}>Delete</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Show completed journal entry */}
        {showCompletedEntry && text ? (
          <div style={{ 
            color: 'var(--Text-Text-Dark, #1C1C1C)',
            fontFamily: 'Albert Sans',
            fontSize: '18px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '28px',
            whiteSpace: 'pre-wrap',
            margin: '24px 0 0 0',
            }}>
              {text.split('\n\n').map((paragraph, index) => (
                <p key={index} style={{
                  margin: index > 0 ? '16px 0 0 0' : '0 0 16px 0',
                  padding: 0
                }}
                dangerouslySetInnerHTML={{ __html: paragraph.replace(/&lt;/g, '<').replace(/&gt;/g, '>') }}
                />
              ))}
          </div>
        ) : chatPreview ? (
          <>
            <div style={{ width: '100%', margin: '24px 0 0 0' }}>
              <ChatBubble sender="ai" text={chatPreview.ai.text} />
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
              {aiPromptLoading
                ? 'Lexi is thinking of a prompt...'
                : aiPrompt || PROMPT_BUBBLES[lastLanguage] || PROMPT_BUBBLES['en']}
            </div>
            <textarea
              className="journal-textarea"
              placeholder={PLACEHOLDERS[language] || PLACEHOLDERS['en']}
              value={text}
              onChange={handleTextChange}
              style={{ height: 'auto', minHeight: '40px' }}
            />
          </>
        )}
      </div>

      {/* Bottom Actions: only show if no chat in progress */}
      {!chatPreview && (
        <div style={{ marginBottom: 120 }}>
          <ChatActionsRow
            onSpeak={() => navigate('/voice-journal')}
            onSend={() => navigate('/chat', { state: { journalEntry: text } })}
            onImage={() => {}}
            sendDisabled={false}
          />
        </div>
      )}

      {/* Tab Bar (bottom nav) - always present, rounded pill */}
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