import React, { useState, useRef, useEffect } from 'react';
import '../styles/global.css';
import { getChatCompletion, transcribeWithWhisper, elevenLabsTTS } from '../openai';
import ChatBubble from '../components/ChatBubble';
import ChatActionsRow from '../components/ChatActionsRow';
import ChatHeader from '../components/ChatHeader';
import { useJournal } from '../components/JournalContext';

const initialMessages = [
  { sender: 'ai', text: 'Bonjour ! Je suis Lexi. Pose-moi une question ou commence à discuter en français !', timestamp: new Date() }
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const { journalInput } = useJournal();
  const [input, setInput] = useState(journalInput || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  // Voice recording state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('lexi-chat-messages', JSON.stringify(messages));
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
      // ElevenLabs TTS integration
      try {
        const audioUrl = await elevenLabsTTS(aiText, "EXAVITQu4vr4xnSDxMaL", "fr");
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (ttsErr) {
        console.error('TTS error:', ttsErr);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Lexi. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!recording) {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecording(false);
        // Transcribe with Whisper
        const transcription = await transcribeWithWhisper(audioBlob, 'fr');
        setInput(transcription);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } else {
      // Stop recording
      mediaRecorderRef.current.stop();
    }
  };

  // Calculate word count from all user messages and current input
  const wordLimit = 200;
  const userWords = messages.filter(m => m.sender === 'user').map(m => m.text).join(' ') + ' ' + input;
  const wordCount = userWords.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="chat-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ChatHeader wordCount={wordCount} wordLimit={wordLimit} />
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fafaff' }}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <ChatBubble sender="ai" loading />}
        {!loading && (
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) handleSend(e);
              }
            }}
            placeholder="Type your message..."
            autoFocus
            style={{
              marginTop: 24,
              width: '100%',
              fontSize: 16,
              fontFamily: 'Albert Sans, sans-serif',
              color: '#212121',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: 0,
              boxShadow: 'none',
              lineHeight: '28px',
              minHeight: '180px',
              height: '100%',
              flex: 1,
              overflow: 'auto',
              display: 'block',
            }}
            disabled={loading}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatActionsRow
        onSpeak={handleSpeak}
        onSend={handleSend}
        onImage={() => {}}
        sendDisabled={!input.trim() || loading}
      />
    </div>
  );
} 