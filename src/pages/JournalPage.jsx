import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatCompletion } from '../openai';
import JournalHeader from '../components/JournalHeader';

// CSS styles
const styles = {
  container: {
    maxWidth: '375px',
    margin: '0 auto',
    height: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    flexShrink: 0
  },
  headerLeft: {
    fontSize: '20px',
    cursor: 'pointer',
    color: '#333'
  },
  headerCenter: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  headerRight: {
    fontSize: '20px',
    cursor: 'pointer',
    color: '#333'
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  messageBubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    maxWidth: '80%',
    wordWrap: 'break-word',
    fontSize: '14px',
    lineHeight: '1.4',
    animation: 'slideIn 0.3s ease-out',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  userBubble: {
    backgroundColor: '#1e3a8a',
    color: '#fff',
    alignSelf: 'flex-end',
    marginLeft: 'auto'
  },
  aiBubble: {
    backgroundColor: '#f3f4f6',
    color: '#333',
    alignSelf: 'flex-start',
    marginRight: 'auto'
  },
  loadingBubble: {
    backgroundColor: '#f3f4f6',
    color: '#666',
    alignSelf: 'flex-start',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  loadingDots: {
    display: 'flex',
    gap: '4px'
  },
  loadingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#666',
    animation: 'pulse 1.4s ease-in-out infinite both'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e0e0e0',
    flexShrink: 0
  },
  microphoneIcon: {
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    marginRight: '12px',
    flexShrink: 0
  },
  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    resize: 'none',
    fontSize: '14px',
    lineHeight: '1.4',
    maxHeight: '100px',
    minHeight: '20px',
    fontFamily: 'inherit'
  },
  sendIcon: {
    fontSize: '18px',
    cursor: 'pointer',
    color: '#1e3a8a',
    marginLeft: '12px',
    flexShrink: 0,
    transform: 'rotate(90deg)'
  },
  sendIconDisabled: {
    fontSize: '18px',
    cursor: 'not-allowed',
    color: '#ccc',
    marginLeft: '12px',
    flexShrink: 0,
    transform: 'rotate(90deg)'
  }
};

function JournalPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('lexi-messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('lexi-messages', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (draft.trim() && !loading) {
      const userMessage = { sender: 'user', text: draft };
      setMessages(prev => [...prev, userMessage]);
      setDraft('');
      setLoading(true);

      try {
        // Update the system message to include language preference
        const systemMessage = selectedLanguage === 'en' 
          ? "You are a warm, supportive language learning buddy who responds like a caring friend."
          : `You are a warm, supportive language learning buddy who responds like a caring friend. Please respond in ${getLanguageName(selectedLanguage)}.`;

        const aiResponse = await getChatCompletion(userMessage.text, systemMessage);
        setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      } catch (error) {
        console.error('OpenAI API Error:', error);
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: 'Sorry, I encountered an error. Please try again.' 
        }]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Here you could load messages for the specific date
    // For now, we'll just update the selected date
  };

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleSearch = (query) => {
    // Filter messages based on search query
    const filteredMessages = messages.filter(message => 
      message.text.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredMessages.length > 0) {
      // Highlight or scroll to matching messages
      console.log('Found messages:', filteredMessages);
      // You could implement highlighting or scrolling here
    } else {
      alert('No messages found matching your search.');
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };
    return languages[code] || 'English';
  };

  return (
    <div className="container">
      {/* Enhanced Header */}
      <JournalHeader
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onSearch={handleSearch}
      />

      {/* Chat Area */}
      <div className="chat-area">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message-bubble ${message.sender}`}
          >
            {message.text}
          </div>
        ))}
        {loading && (
          <div className="message-bubble ai">
            <span>Lexi is typing</span>
            <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-text-secondary)',
                animation: 'pulse 1.4s ease-in-out infinite both',
                animationDelay: '0s'
              }}></div>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-text-secondary)',
                animation: 'pulse 1.4s ease-in-out infinite both',
                animationDelay: '0.2s'
              }}></div>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-text-secondary)',
                animation: 'pulse 1.4s ease-in-out infinite both',
                animationDelay: '0.4s'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Input */}
      <div className="footer">
        <span style={{ fontSize: '20px', cursor: 'pointer', color: 'var(--color-text-secondary)', marginRight: 'var(--spacing-md)' }}>🎤</span>
        <textarea
          className="input-area"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your journal..."
          rows={1}
          disabled={loading}
        />
        <span 
          className={`send-icon ${loading || !draft.trim() ? 'disabled' : ''}`}
          onClick={handleSend}
        >
          ➤
        </span>
      </div>
    </div>
  );
}

export default JournalPage; 