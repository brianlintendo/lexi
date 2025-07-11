import React, { useState, useRef, useEffect } from 'react';
import '../styles/global.css';
import { getChatCompletion } from '../openai';
import ChatBubble from '../components/ChatBubble';

const initialMessages = [
  { sender: 'ai', text: 'Bonjour ! Je suis Lexi. Pose-moi une question ou commence à discuter en français !', timestamp: new Date() }
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const aiText = await getChatCompletion(input);
      setMessages(prev => [...prev, { sender: 'ai', text: aiText, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Lexi. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="chat-header" style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'center', fontWeight: 'bold' }}>
        Lexi Chat
      </header>
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fafaff' }}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <ChatBubble sender="ai" loading />}
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
          disabled={loading}
        />
        <button type="submit" className="chat-send-btn" style={{ marginLeft: 12, background: '#7A54FF', color: '#fff', border: 'none', borderRadius: 8, padding: '0 20px', fontSize: 16, fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 