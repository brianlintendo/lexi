import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openaiTTS, transcribeWithWhisper, getChatCompletion, debugEnvironment } from '../openai';
import ChatHeader from '../components/ChatHeader';
import ChatBubble from '../components/ChatBubble';
import BottomNav from '../components/BottomNav';
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
      en: "Hey there! 👋 Ready to spill the beans about your day? What's the scoop? 😄",
      es: "¡Hola! 👋 ¿Listo(a) para contarme qué tal te fue hoy? ¡Vamos a ver qué pasó! 😄",
      fr: "Salut ! 👋 Prêt(e) à me raconter ta journée ? Allez, dis-moi tout ! 😄",
      zh: "嘿！👋 准备好分享今天的故事了吗？有什么新鲜事？😄",
      pt: "Oi! 👋 Pronto(a) para me contar como foi seu dia? Vamos lá, fala aí! 😄",
      it: "Ciao! 👋 Pronto(a) a raccontarmi com'è andata oggi? Dai, dimmi tutto! 😄",
      de: "Hey! 👋 Bereit, mir von deinem Tag zu erzählen? Los, erzähl mal! 😄",
      ja: "やあ！👋 今日の出来事を教えてくれる？何かあった？😄",
      ko: "안녕! 👋 오늘 하루 어땠는지 이야기해줄 준비됐어? 뭐 재미있는 일 있었어? 😄",
      ru: "Привет! 👋 Готов рассказать, как прошёл твой день? Ну что, как дела? 😄",
      ar: "أهلاً! 👋 مستعد تحكيلي عن يومك؟ شو صار معك اليوم؟😄",
      hi: "अरे! 👋 आज का दिन कैसा रहा, बताने के लिए तैयार हो? क्या हुआ आज? 😄",
      nl: "Hé! 👋 Klaar om me te vertellen hoe je dag was? Kom op, vertel eens! 😄",
      sv: "Hej! 👋 Redo att berätta om din dag? Kom igen, berätta! 😄",
      no: "Hei! 👋 Klar til å fortelle meg om dagen din? Kom igjen, fortell! 😄",
      da: "Hej! 👋 Klar til at fortælle mig om din dag? Kom nu, fortæl! 😄",
      fi: "Hei! 👋 Valmis kertomaan miten päiväsi meni? Kerro nyt! 😄",
      pl: "Cześć! 👋 Gotowy opowiedzieć mi o swoim dniu? No dalej, gadaj! 😄",
      tr: "Selam! 👋 Bugünün nasıl geçtiğini anlatmaya hazır mısın? Hadi bakalım! 😄",
      he: "היי! 👋 מוכן לספר לי איך היה היום שלך? בוא, תספר! 😄",
      th: "เฮ้! 👋 พร้อมเล่าเรื่องวันนี้แล้วหรือยัง? มีอะไรสนุกๆ บ้าง? 😄",
      vi: "Chào! 👋 Sẵn sàng kể cho tôi nghe về ngày hôm nay chưa? Nào, kể đi! 😄",
      id: "Hai! 👋 Siap ceritain gimana hari kamu? Ayo, cerita dong! 😄",
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
  const [indicatorText, setIndicatorText] = useState('');
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // Track if user has interacted
  const [hasInteracted, setHasInteracted] = useState(false);

  // Update initial prompt when language changes (only if no conversation has started)
  useEffect(() => {
    if (!hasInteracted && aiReplies.length === 0) {
      setPromptText(getInitialPrompt(language));
    }
  }, [language, hasInteracted, aiReplies.length]);

  // Debug environment variables on component mount
  useEffect(() => {
    debugEnvironment();
  }, []);

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
          
          // Set the current prompt to the last AI message (follow-up prompt)
          const lastAIMessage = messages[messages.length - 1];
          if (lastAIMessage && lastAIMessage.sender === 'ai') {
            setPromptText(lastAIMessage.text);
            setAiSections(parseAISections(lastAIMessage.text));
          } else if (voiceState.currentPrompt) {
            setPromptText(voiceState.currentPrompt);
            setAiSections(voiceState.aiSections || parseAISections(voiceState.currentPrompt));
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

  // Play TTS prompt (only speak follow-up conversation topic, exclude English translation)
  const playPrompt = async (text = promptText) => {
    if (isMuted) return;
    setIsSpeaking(true);
    setIndicatorText('Lexi is speaking…');
    const { followup } = parseAISections(text);
    try {
      // Only speak the follow-up conversation topic, excluding English translation
      let toSpeak = followup || text;
      
      // Remove English translation part (usually in parentheses or after "Translation:")
      if (toSpeak) {
        // Remove text in parentheses (English translations)
        toSpeak = toSpeak.replace(/\([^)]*\)/g, '').trim();
        // Remove "Translation:" and everything after it
        toSpeak = toSpeak.replace(/Translation:.*$/i, '').trim();
        // Remove any remaining English text patterns
        toSpeak = toSpeak.replace(/\(English:.*?\)/gi, '').trim();
        toSpeak = toSpeak.replace(/English:.*$/i, '').trim();
      }
      
      const audioUrl = await openaiTTS(toSpeak, 'nova'); // Use a female voice
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioRef.current = new window.Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        setIndicatorText('');
      };
      audioRef.current.play();
    } catch (e) {
      setIsSpeaking(false);
      setIndicatorText('');
    }
  };

  // Start listening for user voice
  const startListening = async () => {
    setIsListening(true);
    setIndicatorText('Speak now');
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
        setIndicatorText('Lexi is processing…');
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
            // Automatically submit the transcription to AI
            setIndicatorText('Lexi is speaking…');
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
            const aiReply = await getChatCompletion(transcription, systemPrompt);
            handleAIReply(transcription, aiReply);
            setEntry('');
          } else {
            setIndicatorText('No speech detected. Tap to try again.');
          }
        } catch (err) {
          console.error('Transcription error:', err);
          setIndicatorText('Transcription failed. Tap to try again.');
        }
      };
      mediaRecorderRef.current.start();
      // Recording will continue until user clicks submit - no auto-stop
    } catch (err) {
      setIsListening(false);
      setIndicatorText('Microphone error. Tap to try again.');
    }
  };

  // Debug environment variables on component mount
  useEffect(() => {
    debugEnvironment();
  }, []);

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
    if (!isSpeaking && !isListening && !isMuted) {
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
    setPromptText('Awesome! Can you tell me about your day in a few sentences? 😊');
  };

  // Calculate word count
  const wordCount = aiReplies.reduce((count, reply) => {
    return count + (reply.user ? reply.user.split(/\s+/).length : 0);
  }, 0);
  const wordLimit = 1000;

  // Render logic
  return (
    <div style={{ width: '100%', margin: '0 auto', minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ChatHeader 
        onBack={onBack} 
        onSettings={onSettings}
        onThemesClick={() => navigate('/prompts')}
        showBookButton={true}
      />
      <div style={{ flex: 1, padding: '24px 18px 0 18px', maxWidth: 600, margin: '0 auto', width: '100%', paddingBottom: '200px' }}>
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
            cursor: (!hasInteracted || (!isSpeaking && !isListening && !isMuted)) ? 'pointer' : 'default',
            transition: 'box-shadow 0.2s',
            opacity: (!hasInteracted || (!isSpeaking && !isListening && !isMuted)) ? 1 : 0.9,
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

        </div>
        {/* Chat messages using ChatBubble component */}
        <div style={{ width: '100%', marginBottom: 16 }}>
          {aiReplies.length > 0 && (
            <ChatBubble 
              sender="user" 
              text={aiReplies[aiReplies.length-1].user} 
            />
          )}
          {aiReplies.length > 0 && (
            <ChatBubble 
              sender="ai" 
              text={aiReplies[aiReplies.length-1].ai}
              userText={aiReplies[aiReplies.length-1].user}
            />
          )}
        </div>
        {/* Indicator and dots */}
        <div style={{ marginTop: 32, textAlign: 'center', width: '100%' }}>
          {/* Tap to speak button - appears when ready to record */}
          {(hasInteracted && !isSpeaking && !isListening && !isMuted && indicatorText !== 'Lexi is processing…' && indicatorText !== 'Lexi is speaking…') && (
            <button
              onClick={() => {
                if (!isSpeaking && !isListening && !isMuted) {
                  startListening();
                }
              }}
              style={{
                background: '#7A54FF',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(122,84,255,0.3)',
                transition: 'all 0.2s ease',
                marginBottom: 16
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6A44EF';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(122,84,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#7A54FF';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(122,84,255,0.3)';
              }}
            >
              Tap to Speak
            </button>
          )}
          
          <div 
            style={{ 
              color: '#888', 
              fontSize: 16, 
              marginBottom: 16, 
              fontWeight: 500,
              opacity: indicatorText ? 1 : 0.7,
              transition: 'opacity 0.2s'
            }}
          >
            {indicatorText}
          </div>
          
          {/* Submit button - appears when recording */}
          {isListening && (
            <button
              onClick={() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.stop();
                  // The onstop handler will automatically process the recording
                }
              }}
              style={{
                background: '#7A54FF',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(122,84,255,0.3)',
                transition: 'all 0.2s ease',
                marginTop: 16,
                marginBottom: '32px' // Add extra bottom margin to ensure visibility
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6A44EF';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(122,84,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#7A54FF';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(122,84,255,0.3)';
              }}
            >
              Submit Recording
            </button>
          )}
        </div>
        {/* Keyboard mode */}
        {showKeyboard && (
          <div style={{ width: '100%', marginTop: 32 }}>
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder="Type your journal entry…"
              style={{
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
        zIndex: 100,
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
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
} 

// Helper to generate system prompt based on proficiency (same as in ChatPage)
function getProficiencyPrompt(proficiency, targetLanguage) {
  let levelInstructions = '';
  let playfulnessLevel = '';
  
  switch (proficiency) {
    case 'A1':
    case 'A1 (Beginner)':
      levelInstructions = `The user is a BEGINNER (A1). Use only simple, basic vocabulary and grammar. Do NOT suggest advanced words or idioms in the Vocabulary Enhancer. Keep follow-up questions very simple and short.`;
      playfulnessLevel = `Keep your playfulness very simple and clear. Use basic emojis like 😊 and simple expressions. Be encouraging but use straightforward language that a beginner can easily understand.`;
      break;
    case 'A2':
    case 'A2 (Elementary)':
      levelInstructions = `The user is ELEMENTARY (A2). Use simple vocabulary and grammar. Avoid advanced or nuanced words. Follow-up questions should be straightforward.`;
      playfulnessLevel = `Be playful but keep it simple. Use basic emojis like 😊 😄 and simple friendly expressions. Avoid complex slang or idioms, but you can be warm and encouraging.`;
      break;
    case 'B1':
    case 'B1 (Intermediate)':
      levelInstructions = `The user is INTERMEDIATE (B1). You can introduce some intermediate vocabulary and slightly more complex follow-ups, but avoid very advanced or idiomatic language.`;
      playfulnessLevel = `You can be quite playful! Use emojis like 😊 😄 🎉 and some casual expressions. You can introduce simple slang and friendly banter, but keep it appropriate for intermediate level.`;
      break;
    case 'B2':
    case 'B2 (Upper-Intermediate)':
      levelInstructions = `The user is UPPER-INTERMEDIATE (B2). You can use more complex vocabulary and idioms, but avoid the most advanced or rare words. Follow-ups can be more nuanced.`;
      playfulnessLevel = `Be very playful and engaging! Use lots of emojis 😊 😄 🎉 🚀 and casual language. You can use more sophisticated humor, slang, and friendly banter. Feel free to be creative and witty!`;
      break;
    case 'C1':
    case 'C1 (Advanced)':
      levelInstructions = `The user is ADVANCED (C1). Use advanced, nuanced vocabulary and idioms in the Vocabulary Enhancer. Follow-up questions can be sophisticated and detailed.`;
      playfulnessLevel = `Go all out with playfulness! Use emojis freely 😊 😄 🎉 🚀 💫 and sophisticated humor. You can use advanced slang, cultural references, and complex banter. Be creative, witty, and genuinely entertaining!`;
      break;
    default:
      levelInstructions = '';
      playfulnessLevel = `Be moderately playful with simple emojis 😊 and friendly language.`;
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
  
  return `You are Lexi, a super friendly and playful language buddy! 🎉 You're like that awesome friend who's always excited to chat and makes learning fun. The user's target language is ${targetLanguageName} (${targetLanguage}). You MUST ALWAYS respond in ${targetLanguageName}. ${levelInstructions}\n\n` +
    `${playfulnessLevel}\n\n` +
    `When the user submits a sentence or short text in any language, you MUST reply in this exact format and ALWAYS in ${targetLanguageName}:\n\n` +
    `**Corrected Entry:**  \n<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed, show the full corrected sentence with corrections bolded using <b>...</b> HTML tags>\n\n` +
    `**Key Corrections:**  \n<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:\n- For each correction, show the entire corrected sentence for context, with the correction bolded using <b>...</b> HTML tags (not **...**). Briefly explain the change after the sentence.\n- Example: Je <b>suis allé</b> au marché. ("suis allé" is the correct past tense for "I went")\n- Do this for each important correction.>\n\n` +
    `**Phrase to Remember:**  \n<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:\n- Provide 3-5 short phrases or collocations from the correction, each as a bullet, in quotes, with a simple translation if helpful. If fewer than 3 are relevant, just include those.>\n\n` +
    `**Vocabulary Enhancer:**  \n- Suggest 1-3 awesome, topic-relevant vocabulary words, idioms, or phrases (with translation or explanation) that would make the user's writing pop! 🌟 Each should be a bullet, and always keep it relevant to the topic. For example, if the entry is about a picnic, suggest a phrase or idiom about picnics or food; if about a job, suggest something relevant to work or career. Example: Instead of 'la nourriture était très bien', suggest 'un festin pour les papilles' (a feast for the taste buds); instead of 'j'ai faim', suggest 'avoir un petit creux' (to feel a bit peckish).\n\n` +
    `**Follow-up:**  \n<A follow-up question in ${targetLanguageName}, related to what the user wrote. Adjust your playfulness based on the user's level - beginners get simple, clear questions with basic emojis; advanced users get sophisticated banter and complex humor. Always be encouraging and make them want to keep talking!>\n\n` +
    `IMPORTANT: Only include the "Corrected Entry", "Key Corrections", and "Phrase to Remember" sections if there are actual corrections to make. If the user's text is perfect, skip these three sections entirely and go straight to "Vocabulary Enhancer".\n\n` +
    `CRITICAL: You MUST respond in ${targetLanguageName} only. Do not respond in any other language unless specifically asked. You are Lexi - the most enthusiastic and supportive language learning buddy ever! 🚀 Adjust your enthusiasm and playfulness to match the user's proficiency level while always being encouraging and making learning feel like fun, not homework!`;
} 