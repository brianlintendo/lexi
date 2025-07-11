import React, { useState, useRef, useEffect } from 'react';
import '../styles/global.css';

const initialMessages = [
  { sender: 'ai', text: 'Bonjour ! Je suis Lexi. Pose-moi une question ou commence à discuter en français !', timestamp: new Date() }
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input, timestamp: new Date() }]);
    setInput('');
    // AI response will be handled in a later step
  };

  return (
    <div className="chat-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="chat-header" style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 'bold' }}>
        Lexi Chat
      </header>
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fafaff' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
            marginBottom: 12
          }}>
            <div style={{
              background: msg.sender === 'user' ? '#7A54FF' : '#fff',
              color: msg.sender === 'user' ? '#fff' : '#7A54FF',
              border: '1px solid #e0e0e0',
              borderRadius: 16,
              padding: '10px 16px',
              maxWidth: '70%',
              fontSize: 16
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-row" onSubmit={handleSend} style={{ display: 'flex', padding: '1rem', borderTop: '1px solid #eee', background: '#fff' }}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, fontSize: 16, padding: '10px 12px', borderRadius: 8, border: '1px solid #e0e0e0' }}
        />
        <button type="submit" className="chat-send-btn" style={{ marginLeft: 12, background: '#7A54FF', color: '#fff', border: 'none', borderRadius: 8, padding: '0 20px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
} 