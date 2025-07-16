import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openaiTTS, transcribeWithWhisper, getChatCompletion } from '../openai';

// TopHeader component (reusable)
function TopHeader({ onBack, onSettings, wordCount = 0, wordLimit = 1000, dateTime }) {
  return (
    <div style={{
      maxWidth: 375,
      margin: '0 auto',
      padding: '24px 0 0 0',
      background: '#fff',
      position: 'relative',
      zIndex: 2,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>&larr;</button>
        <div style={{ color: '#888', fontSize: 18 }}>{wordCount} words / {wordLimit} words</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span role="img" aria-label="book">📖</span>
          </button>
          <button onClick={onSettings} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span role="img" aria-label="settings">🛠️</span>
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#888', fontSize: 18, marginTop: 16 }}>{dateTime}</div>
      <div style={{ height: 8 }} />
      <div style={{ width: '90%', margin: '0 auto', height: 12, background: '#eee', borderRadius: 6 }}>
        <div style={{ width: `${Math.min(100, (wordCount / wordLimit) * 100)}%`, height: '100%', background: '#8854ff', borderRadius: 6 }} />
      </div>
    </div>
  );
}

// Animated dots
function SpeakingDots({ animate = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 10, margin: '16px 0' }}>
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#8854ff',
            opacity: 0.7,
            animation: animate ? `dotFade 1.2s infinite ${i * 0.15}s` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes dotFade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Fade-in sentence component
function FadeInSentence({ text, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <span style={{
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.6s',
      display: 'block',
      marginBottom: 4,
    }}>{text}</span>
  );
}

// Main VoiceJournal page
export default function VoiceJournal() {
  const navigate = useNavigate();
  const [promptText, setPromptText] = useState('Bonjour ! Prêt(e) à écrire en français ? 😊 Comment tu te sens aujourd’hui ?');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [entry, setEntry] = useState('');
  const [aiReplies, setAiReplies] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [indicatorText, setIndicatorText] = useState('Lexi is speaking…');
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Split prompt into sentences for fade-in
  const sentences = promptText.match(/[^.!?]+[.!?\u2026]?/g) || [promptText];

  // Extract follow-up section for display and TTS
  function getFollowup(text) {
    const match = text.match(/\*\*Follow-up:\*\*[\s\n]*([\s\S]*)/i);
    return match ? match[1].trim() : text;
  }

  // Play TTS prompt (only speak Follow-up section)
  const playPrompt = async (text = promptText) => {
    if (isMuted) return;
    setIsSpeaking(true);
    setIndicatorText('Lexi is speaking…');
    try {
      // Only speak the follow-up section
      const toSpeak = getFollowup(text);
      const audioUrl = await openaiTTS(toSpeak, 'nova'); // Use a female voice
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioRef.current = new window.Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        setIndicatorText('Start speaking');
        startListening();
      };
      audioRef.current.play();
    } catch (e) {
      setIsSpeaking(false);
      setIndicatorText('Start speaking');
      startListening();
    }
  };

  // Start listening for user voice
  const startListening = async () => {
    setIsListening(true);
    setIndicatorText('Listening…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        setIsListening(false);
        setIndicatorText('Processing…');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        try {
          const transcription = await transcribeWithWhisper(audioBlob, 'fr'); // TODO: use dynamic language
          setEntry(transcription);
          if (transcription.trim()) {
            const aiReply = await getChatCompletion(transcription);
            setAiReplies(replies => [...replies, { user: transcription, ai: aiReply }]);
            setPromptText(aiReply);
            setTimeout(() => playPrompt(aiReply), 500); // Play Lexi's reply
          } else {
            setIndicatorText('No speech detected. Tap to try again.');
          }
        } catch (err) {
          setIndicatorText('Transcription failed. Tap to try again.');
        }
      };
      mediaRecorderRef.current.start();
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 10000);
    } catch (err) {
      setIsListening(false);
      setIndicatorText('Microphone error. Tap to try again.');
    }
  };

  // On mount or prompt change, play prompt
  useEffect(() => {
    if (!showKeyboard) playPrompt();
    // eslint-disable-next-line
  }, [promptText, showKeyboard]);

  // Mute toggle
  const handleMute = () => {
    setIsMuted(m => !m);
    if (audioRef.current) audioRef.current.pause();
    setIsSpeaking(false);
    setIsListening(false);
    setIndicatorText('Muted');
  };

  // Keyboard toggle
  const handleKeyboard = () => {
    setShowKeyboard(true);
    if (audioRef.current) audioRef.current.pause();
    setIsSpeaking(false);
    setIsListening(false);
    setIndicatorText('Keyboard mode');
  };

  // Send entry in keyboard mode
  const handleSend = async () => {
    if (!entry.trim()) return;
    const aiReply = await getChatCompletion(entry);
    setAiReplies(replies => [...replies, { user: entry, ai: aiReply }]);
    setEntry('');
    setPromptText(aiReply);
    setTimeout(() => playPrompt(aiReply), 500);
  };

  // Navigation handlers
  const onBack = () => navigate(-1);
  const onSettings = () => setShowSettings(true);

  // Next prompt stub
  const nextPrompt = () => {
    setPromptText('Super ! Peux-tu me raconter ta journée en quelques phrases ?');
  };

  // Date/time for header
  const dateTime = new Date().toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ maxWidth: 375, margin: '0 auto', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <TopHeader onBack={onBack} onSettings={onSettings} wordCount={185} wordLimit={1000} dateTime={dateTime} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 16px', position: 'relative' }}>
        {!showKeyboard ? (
          <>
            <div
              style={{
                border: '1.5px solid #b9aaff',
                borderRadius: 12,
                padding: '28px 18px',
                margin: '32px 0 0 0',
                minWidth: 260,
                maxWidth: 320,
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 2px 8px rgba(136,84,255,0.04)',
                fontFamily: 'Albert Sans, sans-serif',
                fontSize: 24,
                color: '#7c4dff',
                textAlign: 'center',
                cursor: isListening ? 'default' : 'pointer',
                transition: 'box-shadow 0.2s',
                opacity: isListening ? 0.7 : 1
              }}
              onClick={() => {
                if (!isSpeaking && !isListening) playPrompt();
              }}
            >
              {/* Only display the follow-up text, no heading */}
              {getFollowup(promptText).split(/(?<=[.!?])\s+/).map((sentence, i) => (
                <FadeInSentence key={i} text={sentence.trim()} delay={i * 800} />
              ))}
            </div>
            <div style={{ marginTop: 40, textAlign: 'center', width: '100%' }}>
              <div style={{ color: '#888', fontSize: 18, marginBottom: 8 }}>{indicatorText}</div>
              <SpeakingDots animate={isSpeaking || isListening} />
            </div>
          </>
        ) : (
          <div style={{ width: '100%', marginTop: 40 }}>
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Type your journal entry…"
              style={{
                width: '100%',
                minHeight: 80,
                border: '1.5px solid #b9aaff',
                borderRadius: 12,
                padding: 16,
                fontSize: 18,
                fontFamily: 'Albert Sans, sans-serif',
                resize: 'vertical',
                marginBottom: 12,
              }}
            />
            <button
              onClick={handleSend}
              style={{
                width: '100%',
                background: '#8854ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px 0',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Albert Sans, sans-serif',
              }}
            >Send</button>
            <div style={{ marginTop: 24 }}>
              {aiReplies.map((r, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ color: '#333', fontWeight: 500, marginBottom: 4 }}>You:</div>
                  <div style={{ color: '#7c4dff', marginBottom: 8 }}>{r.user}</div>
                  <div style={{ color: '#333', fontWeight: 500, marginBottom: 4 }}>Lexi:</div>
                  <div style={{ color: '#8854ff' }}>{r.ai}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Bottom control bar */}
      <div style={{
        position: 'fixed',
        left: '50%',
        bottom: 0,
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 375,
        background: '#fff',
        boxShadow: '0 -2px 12px rgba(136,84,255,0.06)',
        padding: '16px 0 24px 0',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={handleMute}
          style={{
            background: isMuted ? '#eee' : '#f6f3ff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#333',
            cursor: 'pointer',
            marginLeft: 16,
          }}
        >
          {isMuted ? <span role="img" aria-label="muted">🔇</span> : <span role="img" aria-label="mic">🎤</span>}
        </button>
        <SpeakingDots animate={isSpeaking || isListening} />
        <button
          onClick={handleKeyboard}
          style={{
            background: '#f6f3ff',
            border: 'none',
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            color: '#333',
            cursor: 'pointer',
            marginRight: 16,
          }}
        >
          <span role="img" aria-label="keyboard">⌨️</span>
        </button>
      </div>
      {/* Settings modal stub */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setShowSettings(false)}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 220, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Settings</div>
            <div style={{ color: '#888', fontSize: 16 }}>Settings modal (stub)</div>
            <button style={{ marginTop: 24, background: '#8854ff', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 16, cursor: 'pointer' }} onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 