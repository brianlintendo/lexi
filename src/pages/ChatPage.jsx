import React, { useState, useRef, useEffect } from 'react';
import '../styles/global.css';
import { getChatCompletion } from '../openai';
import ChatBubble from '../components/ChatBubble';
import ChatActionsRow from '../components/ChatActionsRow';

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
        {input && !loading && <ChatBubble sender="user" text={input} />}
        <div ref={messagesEndRef} />
      </div>
      <ChatActionsRow
        onSpeak={() => {}}
        onSend={handleSend}
        onImage={() => {}}
        sendDisabled={!input.trim() || loading}
      />
    </div>
  );
} 