import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openaiTTS, transcribeWithWhisper, getChatCompletion } from '../openai';
import ChatHeader from '../components/ChatHeader';
import micIcon from '../assets/icons/mic.svg';
import micMuteIcon from '../assets/icons/microphone-mute.svg';
import keyboardIcon from '../assets/icons/keyboard.svg';
import { useProfile, useJournal } from '../components/JournalContext';

// Animated dots
function SpeakingDots({ animate = true }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '0' }}>
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#7A54FF',
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

// Helper to parse AI response into sections
function parseAISections(text) {
  if (!text) return {};
  const correctedMatch = text.match(/\*\*Corrected Entry:\*\*[\s\n]*([\s\S]*?)(?=\*\*Key Corrections:|$)/i);
  const correctionsMatch = text.match(/\*\*Key Corrections:\*\*[\s\n]*([\s\S]*?)(?=\*\*Phrase to Remember:|$)/i);
  const followupMatch = text.match(/\*\*Follow-up:\*\*[\s\n]*([\s\S]*)/i);
  return {
    corrected: correctedMatch ? correctedMatch[1].trim() : null,
    corrections: correctionsMatch ? correctionsMatch[1].trim() : null,
    followup: followupMatch ? followupMatch[1].trim() : null,
  };
}

// Main VoiceJournal page
export default function VoiceJournal() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { language } = useJournal();
  
  // Get language-specific initial prompts
  const getInitialPrompt = (lang) => {
    const prompts = {
      en: "Hello! Ready to write in English? 😊 What did you do today?",
      es: "¡Hola! ¿Listo(a) para escribir en español? 😊 ¿Qué hiciste hoy?",
      fr: "Bonjour ! Prêt(e) à écrire en français ? 😊 Qu'as-tu fait aujourd'hui ?",
      zh: "你好！准备好用中文写作了吗？😊 你今天做了什么？",
      pt: "Olá! Pronto(a) para escrever em português? 😊 O que você fez hoje?",
      it: "Ciao! Pronto(a) a scrivere in italiano? 😊 Cosa hai fatto oggi?",
      de: "Hallo! Bereit, auf Deutsch zu schreiben? 😊 Was hast du heute gemacht?",
      ja: "こんにちは！日本語で書く準備はできましたか？😊 今日は何をしましたか？",
      ko: "안녕하세요! 한국어로 글쓰기 준비가 되셨나요? 😊 오늘 무엇을 하셨나요?",
      ru: "Привет! Готов писать на русском? 😊 Что ты делал сегодня?",
      ar: "مرحباً! مستعد للكتابة بالعربية؟😊 ماذا فعلت اليوم؟",
      hi: "नमस्ते! हिंदी में लिखने के लिए तैयार हैं? 😊 आज आपने क्या किया?",
      nl: "Hallo! Klaar om in het Nederlands te schrijven? 😊 Wat heb je vandaag gedaan?",
      sv: "Hej! Redo att skriva på svenska? 😊 Vad gjorde du idag?",
      no: "Hei! Klar til å skrive på norsk? 😊 Hva gjorde du i dag?",
      da: "Hej! Klar til at skrive på dansk? 😊 Hvad gjorde du i dag?",
      fi: "Hei! Valmis kirjoittamaan suomeksi? 😊 Mitä sinä teit tänään?",
      pl: "Cześć! Gotowy do pisania po polsku? 😊 Co robiłeś dzisiaj?",
      tr: "Merhaba! Türkçe yazmaya hazır mısın? 😊 Bugün ne yaptın?",
      he: "שלום! מוכן לכתוב בעברית? 😊 מה עשית היום?",
      th: "สวัสดี! พร้อมเขียนภาษาไทยแล้วหรือยัง? 😊 วันนี้คุณทำอะไรบ้าง?",
      vi: "Xin chào! Sẵn sàng viết bằng tiếng Việt chưa? 😊 Hôm nay bạn đã làm gì?",
      id: "Halo! Siap menulis dalam bahasa Indonesia? 😊 Apa yang kamu lakukan hari ini?",
      ms: "Hai! Sedia menulis dalam bahasa Melayu? 😊 Apa yang anda lakukan hari ini?"
    };
    return prompts[lang] || prompts['en'];
  };
  
  const [promptText, setPromptText] = useState(getInitialPrompt(language));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [entry, setEntry] = useState('');
  const [aiReplies, setAiReplies] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [indicatorText, setIndicatorText] = useState('Speak now');
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // Track if user has interacted
  const [hasInteracted, setHasInteracted] = useState(false);
  const [readyToSubmit, setReadyToSubmit] = useState(false);

  // Update initial prompt when language changes (only if no conversation has started)
  useEffect(() => {
    if (!hasInteracted && aiReplies.length === 0) {
      setPromptText(getInitialPrompt(language));
    }
  }, [language, hasInteracted, aiReplies.length]);

  // Load preserved conversation state from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem('lexi-chat-messages');
    const storedVoiceState = localStorage.getItem('lexi-voice-state');
    
    if (storedMessages && storedVoiceState) {
      try {
        const messages = JSON.parse(storedMessages);
        const voiceState = JSON.parse(storedVoiceState);
        
        // Convert messages back to aiReplies format
        const replies = [];
        for (let i = 0; i < messages.length; i += 2) {
          if (messages[i] && messages[i + 1] && 
              messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
            replies.push({
              user: messages[i].text,
              ai: messages[i + 1].text
            });
          }
        }
        
        if (replies.length > 0) {
          setAiReplies(replies);
          setHasInteracted(true);
          
          // Set the current prompt and AI sections
          if (voiceState.currentPrompt) {
            setPromptText(voiceState.currentPrompt);
          }
          if (voiceState.aiSections) {
            setAiSections(voiceState.aiSections);
          }
        }
      } catch (error) {
        console.error('Error loading preserved conversation state:', error);
      }
    }
  }, []);

  // Split prompt into sentences for fade-in
  const sentences = promptText.match(/[^.!?]+[.!?\u2026]?/g) || [promptText];

  // Instead of just promptText, keep parsed sections for the latest AI reply
  const [aiSections, setAiSections] = useState(parseAISections(promptText));

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
    const { followup } = parseAISections(text);
    try {
      // Only speak the follow-up section
      const toSpeak = followup || text;
      const audioUrl = await openaiTTS(toSpeak, 'nova'); // Use a female voice
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioRef.current = new window.Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        setIndicatorText('Speak now');
      };
      audioRef.current.play();
    } catch (e) {
      setIsSpeaking(false);
      setIndicatorText('Speak now');
    }
  };

  // Start listening for user voice
  const startListening = async () => {
    setIsListening(true);
    setIndicatorText('Listening…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000, // Lower sample rate for faster processing
          channelCount: 1,   // Mono instead of stereo
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Try to use more efficient audio format
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mediaRecorderRef.current = new window.MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000 // Lower bitrate for faster upload
      });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        setIsListening(false);
        setIndicatorText('Processing…');
        // Use the detected MIME type for the blob
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Log blob size for debugging
        console.log(`Audio blob size: ${(audioBlob.size / 1024).toFixed(2)} KB`);
        try {
          const startTime = performance.now();
          const transcription = await transcribeWithWhisper(audioBlob, language);
          const endTime = performance.now();
          console.log(`Transcription completed in ${(endTime - startTime).toFixed(2)}ms`);
          
          setEntry(transcription);
          if (transcription.trim()) {
            setReadyToSubmit(true);
            setIndicatorText('Tap to submit');
          } else {
            setIndicatorText('No speech detected. Tap to try again.');
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setIndicatorText('Transcription failed. Tap to try again.');
        }
      };
      mediaRecorderRef.current.start();
      // Auto-stop after 8 seconds (reduced from 10 for faster processing)
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 8000);
    } catch (err) {
      setIsListening(false);
      setIndicatorText('Microphone error. Tap to try again.');
    }
  };

  // On mount or prompt change, play prompt
  // useEffect(() => {
  //   if (!showKeyboard && aiReplies.length === 0) {
  //     // Only play initial prompt, don't auto-start listening
  //     playPrompt();
  //   }
  // }, []);

  // Modified prompt bubble click handler
  const handlePromptClick = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      playPrompt();
      return;
    }
    if (readyToSubmit) {
      // Submit the transcription to AI
      setReadyToSubmit(false);
      setIndicatorText('Lexi is speaking…');
      (async () => {
        let systemPrompt;
        if (profile?.proficiency) {
          systemPrompt = getProficiencyPrompt(profile.proficiency, language);
        } else {
          // Use default system prompt with language specification
          const languageNames = {
            'en': 'English', 'es': 'Spanish', 'fr': 'French', 'zh': 'Chinese', 'pt': 'Portuguese',
            'it': 'Italian', 'de': 'German', 'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian',
            'ar': 'Arabic', 'hi': 'Hindi', 'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian',
            'da': 'Danish', 'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'he': 'Hebrew',
            'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay'
          };
          const targetLanguageName = languageNames[language] || language;
          systemPrompt = `You are Lexi, a friendly language tutor. The user's target language is ${targetLanguageName} (${language}). You MUST ALWAYS respond in ${targetLanguageName}. When the user submits text, respond in this format: **Corrected Entry:** (if needed), **Key Corrections:** (if needed), **Phrase to Remember:** (if needed), **Vocabulary Enhancer:** (always), **Follow-up:** (in ${targetLanguageName}), **Follow-up Translation:** (English). CRITICAL: Respond in ${targetLanguageName} only.`;
        }
        const aiReply = await getChatCompletion(entry, systemPrompt);
        handleAIReply(entry, aiReply);
        setEntry('');
      })();
      return;
    }
    if (indicatorText === 'Speak now' && !isSpeaking && !isListening && !isMuted) {
      startListening();
    }
  };

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
    // Save current conversation state to localStorage
    const conversationState = {
      messages: aiReplies.map(reply => [
        { sender: 'user', text: reply.user, timestamp: new Date() },
        { sender: 'ai', text: reply.ai, timestamp: new Date() }
      ]).flat(),
      currentPrompt: promptText,
      aiSections: aiSections
    };
    
    // Save to localStorage
    localStorage.setItem('lexi-chat-messages', JSON.stringify(conversationState.messages));
    localStorage.setItem('lexi-voice-state', JSON.stringify({
      currentPrompt: conversationState.currentPrompt,
      aiSections: conversationState.aiSections
    }));
    
    // Navigate to ChatPage
    navigate('/chat');
  };

  // Send entry in keyboard mode
  const handleSend = async () => {
    if (!entry.trim()) return;
    let systemPrompt;
    console.log('VoiceJournal - Profile proficiency:', profile?.proficiency);
    console.log('VoiceJournal - Current language:', language);
    if (profile?.proficiency) {
      systemPrompt = getProficiencyPrompt(profile.proficiency, language);
      console.log('VoiceJournal - Using proficiency-adjusted system prompt for level:', profile.proficiency, 'and language:', language);
    } else {
      // Use default system prompt with language specification
      const languageNames = {
        'en': 'English', 'es': 'Spanish', 'fr': 'French', 'zh': 'Chinese', 'pt': 'Portuguese',
        'it': 'Italian', 'de': 'German', 'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian',
        'ar': 'Arabic', 'hi': 'Hindi', 'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian',
        'da': 'Danish', 'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'he': 'Hebrew',
        'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay'
      };
      const targetLanguageName = languageNames[language] || language;
      systemPrompt = `You are Lexi, a friendly language tutor. The user's target language is ${targetLanguageName} (${language}). You MUST ALWAYS respond in ${targetLanguageName}. When the user submits text, respond in this format: **Corrected Entry:** (if needed), **Key Corrections:** (if needed), **Phrase to Remember:** (if needed), **Vocabulary Enhancer:** (always), **Follow-up:** (in ${targetLanguageName}), **Follow-up Translation:** (English). CRITICAL: Respond in ${targetLanguageName} only.`;
      console.log('VoiceJournal - Using default system prompt with language:', language);
    }
    const aiReply = await getChatCompletion(entry, systemPrompt);
    handleAIReply(entry, aiReply);
    setEntry('');
  };

  // When AI replies, update both promptText and aiSections
  const handleAIReply = (userText, aiReply) => {
    setAiReplies(replies => [...replies, { user: userText, ai: aiReply }]);
    setPromptText(aiReply);
    setAiSections(parseAISections(aiReply));
    if (hasInteracted) {
      setTimeout(() => playPrompt(aiReply), 400);
    }
  };

  // Navigation handlers
  const onBack = () => navigate(-1);
  const onSettings = () => setShowSettings(true);

  // Next prompt stub
  const nextPrompt = () => {
    setPromptText('Super ! Peux-tu me raconter ta journée en quelques phrases ?');
  };

  // Calculate word count
  const wordCount = aiReplies.reduce((count, reply) => {
    return count + (reply.user ? reply.user.split(/\s+/).length : 0);
  }, 0);
  const wordLimit = 1000;

  // Render logic
  return (
    <div style={{ maxWidth: 375, margin: '0 auto', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ChatHeader wordCount={wordCount} wordLimit={wordLimit} onBack={onBack} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '24px 16px 0 16px', position: 'relative' }}>
        {/* AI Prompt (Follow-up) at the top */}
        <div 
          onClick={handlePromptClick}
          style={{
            border: '1.5px solid #b9aaff',
            borderRadius: 12,
            padding: '24px 20px',
            margin: '0 0 24px 0',
            minWidth: 260,
            // maxWidth: 320, // removed for full width
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 2px 8px rgba(136,84,255,0.04)',
            fontFamily: 'Albert Sans, sans-serif',
            fontSize: 20,
            color: '#7c4dff',
            textAlign: 'center',
            cursor: (!hasInteracted || readyToSubmit || (indicatorText === 'Speak now' && !isSpeaking && !isListening && !isMuted)) ? 'pointer' : 'default',
            transition: 'box-shadow 0.2s',
            opacity: (!hasInteracted || readyToSubmit || (indicatorText === 'Speak now' && !isSpeaking && !isListening && !isMuted)) ? 1 : 0.9,
            position: 'relative',
            width: '100%',
          }}
        >
          {aiSections.followup ? aiSections.followup.split(/(?<=[.!?])\s+/).map((sentence, i) => (
            <FadeInSentence key={i} text={sentence.trim()} delay={i * 800} />
          )) : (
            <FadeInSentence text={promptText} delay={0} />
          )}
          {(!hasInteracted) && (
            <div style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#7A54FF',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(122,84,255,0.2)',
            }}>
              Tap to start
            </div>
          )}
          {(hasInteracted && readyToSubmit) && (
            <div style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#7A54FF',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(122,84,255,0.2)',
            }}>
              Tap to submit
            </div>
          )}
          {(hasInteracted && !readyToSubmit && indicatorText === 'Speak now' && !isSpeaking && !isListening && !isMuted) && (
            <div style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#7A54FF',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(122,84,255,0.2)',
            }}>
              Tap to speak
            </div>
          )}
        </div>
        {/* User's response (last entry) */}
        {aiReplies.length > 0 && (
          <div style={{
            width: '100%',
            // maxWidth: 320,
            margin: '0 auto 16px auto',
            background: '#f7f7fa',
            borderRadius: 10,
            padding: '18px 20px',
            fontSize: 18,
            color: '#222',
            fontFamily: 'Albert Sans, sans-serif',
            boxShadow: '0 1px 4px rgba(136,84,255,0.04)',
            border: '1px solid #ece6ff',
            width: '100%',
          }}>
            {aiReplies[aiReplies.length-1].user}
          </div>
        )}
        {/* Correction box UI */}
        {(aiSections.corrected || aiSections.corrections) && (
          <div style={{
            width: '100%',
            // maxWidth: 320,
            margin: '0 auto 24px auto',
            background: '#fff',
            border: '2px solid #e0e0f7',
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(136,84,255,0.06)',
            padding: '20px 20px 16px 20px',
            fontFamily: 'Albert Sans, sans-serif',
            width: '100%',
          }}>
            {aiSections.corrected && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 700, color: '#7A54FF' }}>Corrected Entry:</span><br />
                <span dangerouslySetInnerHTML={{ __html: aiSections.corrected.replace(/&lt;/g, '<').replace(/&gt;/g, '>') }} />
              </div>
            )}
            {aiSections.corrections && (
              <div>
                <span style={{ fontWeight: 700, color: '#7A54FF' }}>Key Corrections:</span>
                <ul style={{ margin: '8px 0 0 20px', padding: 0, color: '#444', fontWeight: 400, fontSize: 15 }}>
                  {aiSections.corrections.split(/\n|\r/).filter(Boolean).map((line, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: line.replace(/&lt;/g, '<').replace(/&gt;/g, '>') }} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {/* Indicator and dots */}
        <div style={{ marginTop: 32, textAlign: 'center', width: '100%' }}>
          <div 
            style={{ 
              color: '#888', 
              fontSize: 16, 
              marginBottom: 16, 
              fontWeight: 500,
              cursor: indicatorText === 'Speak now' && !isSpeaking && !isListening ? 'pointer' : 'default',
              opacity: indicatorText === 'Speak now' && !isSpeaking && !isListening ? 1 : 0.7,
              transition: 'opacity 0.2s'
            }}
            onClick={() => {
              if (indicatorText === 'Speak now' && !isSpeaking && !isListening && !isMuted) {
                startListening();
              }
            }}
          >
            {indicatorText}
          </div>
        </div>
        {/* Keyboard mode */}
        {showKeyboard && (
          <div style={{ width: '100%', marginTop: 32 }}>
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
                background: 'linear-gradient(353deg, #5F46B4 26.75%, #7860CC 79.09%)',
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
        padding: '20px 0 32px 0',
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
            padding: 0,
            cursor: 'pointer',
            marginLeft: 16,
          }}
        >
          <img src={isMuted ? micMuteIcon : micIcon} alt={isMuted ? "Muted" : "Microphone"} style={{ width: 24, height: 24 }} />
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
            padding: 0,
            cursor: 'pointer',
            marginRight: 16,
          }}
        >
          <img src={keyboardIcon} alt="Keyboard" style={{ width: 24, height: 24 }} />
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

// Helper to generate system prompt based on proficiency (same as in ChatPage)
function getProficiencyPrompt(proficiency, targetLanguage) {
  let levelInstructions = '';
  switch (proficiency) {
    case 'A1':
    case 'A1 (Beginner)':
      levelInstructions = `The user is a BEGINNER (A1). Use only simple, basic vocabulary and grammar. Do NOT suggest advanced words or idioms in the Vocabulary Enhancer. Keep follow-up questions very simple and short.`;
      break;
    case 'A2':
    case 'A2 (Elementary)':
      levelInstructions = `The user is ELEMENTARY (A2). Use simple vocabulary and grammar. Avoid advanced or nuanced words. Follow-up questions should be straightforward.`;
      break;
    case 'B1':
    case 'B1 (Intermediate)':
      levelInstructions = `The user is INTERMEDIATE (B1). You can introduce some intermediate vocabulary and slightly more complex follow-ups, but avoid very advanced or idiomatic language.`;
      break;
    case 'B2':
    case 'B2 (Upper-Intermediate)':
      levelInstructions = `The user is UPPER-INTERMEDIATE (B2). You can use more complex vocabulary and idioms, but avoid the most advanced or rare words. Follow-ups can be more nuanced.`;
      break;
    case 'C1':
    case 'C1 (Advanced)':
      levelInstructions = `The user is ADVANCED (C1). Use advanced, nuanced vocabulary and idioms in the Vocabulary Enhancer. Follow-up questions can be sophisticated and detailed.`;
      break;
    default:
      levelInstructions = '';
  }
  
  // Get language name for better context
  const languageNames = {
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'zh': 'Chinese', 'pt': 'Portuguese',
    'it': 'Italian', 'de': 'German', 'ja': 'Japanese', 'ko': 'Korean', 'ru': 'Russian',
    'ar': 'Arabic', 'hi': 'Hindi', 'nl': 'Dutch', 'sv': 'Swedish', 'no': 'Norwegian',
    'da': 'Danish', 'fi': 'Finnish', 'pl': 'Polish', 'tr': 'Turkish', 'he': 'Hebrew',
    'th': 'Thai', 'vi': 'Vietnamese', 'id': 'Indonesian', 'ms': 'Malay'
  };
  
  const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
  
  return `You are Lexi, a friendly, lightly humorous language tutor and conversation partner. The user's target language is ${targetLanguageName} (${targetLanguage}). You MUST ALWAYS respond in ${targetLanguageName}. ${levelInstructions}\n\n` +
    `When the user submits a sentence or short text in any language, you MUST reply in this exact format and ALWAYS in ${targetLanguageName}:\n\n` +
    `**Corrected Entry:**  \n<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed, show the full corrected sentence with corrections bolded using <b>...</b> HTML tags>\n\n` +
    `**Key Corrections:**  \n<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:\n- For each correction, show the entire corrected sentence for context, with the correction bolded using <b>...</b> HTML tags (not **...**). Briefly explain the change after the sentence.\n- Example: Je <b>suis allé</b> au marché. ("suis allé" is the correct past tense for "I went")\n- Do this for each important correction.>\n\n` +
    `**Phrase to Remember:**  \n<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:\n- Provide 3-5 short phrases or collocations from the correction, each as a bullet, in quotes, with a simple translation if helpful. If fewer than 3 are relevant, just include those.>\n\n` +
    `**Vocabulary Enhancer:**  \n- Suggest 1-3 advanced, topic-relevant vocabulary words, idioms, or phrases (with translation or explanation) that would elevate the user's writing, based on the theme of their entry. Each should be a bullet, and always keep it relevant to the topic. For example, if the entry is about a picnic, suggest a phrase or idiom about picnics or food; if about a job, suggest something relevant to work or career. Example: Instead of 'la nourriture était très bien', suggest 'un festin pour les papilles' (a feast for the taste buds); instead of 'j'ai faim', suggest 'avoir un petit creux' (to feel a bit peckish).\n\n` +
    `**Follow-up:**  \n<A natural follow-up question in ${targetLanguageName}, related to what the user wrote. Make it lighthearted, playful, and banter-y, encouraging a friendly and fun conversation.>\n\n` +
    `IMPORTANT: Only include the "Corrected Entry", "Key Corrections", and "Phrase to Remember" sections if there are actual corrections to make. If the user's text is perfect, skip these three sections entirely and go straight to "Vocabulary Enhancer".\n\n` +
    `CRITICAL: You MUST respond in ${targetLanguageName} only. Do not respond in any other language unless specifically asked. You are a gentle, female-voiced language tutor who speaks like a calm, caring friend: use light, tasteful humor rather than over-the-top jokes, offer meditative, thoughtful encouragement, and gently nudge the learner with kind corrections and supportive follow-up questions.`;
} 