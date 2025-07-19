import React, { useState, useRef, useEffect } from 'react';
import '../styles/global.css';
import { getChatCompletion, transcribeWithWhisper, openaiTTS } from '../openai';
import ChatBubble from '../components/ChatBubble';
import ChatActionsRow from '../components/ChatActionsRow';
import ChatHeader from '../components/ChatHeader';
import { useJournal } from '../components/JournalContext';
import { useNavigate } from 'react-router-dom';
import themesIcon from '../assets/icons/themes.svg';
import PromptsPage from './PromptsPage';
import { useLocation } from 'react-router-dom';
import { useProfile } from '../components/JournalContext';

const PROMPTS = {
  en: `Hello! I'm Lexi. Ready to write in English? How are you feeling today?`,
  es: `¡Hola! Soy Lexi. ¿Listo(a) para escribir en español? ¿Cómo te sientes hoy?`,
  fr: `Bonjour ! Je suis Lexi. Prêt(e) à écrire en français ? Comment tu te sens aujourd'hui ?`,
  zh: `你好！我是 Lexi。准备好用中文写作了吗？你今天感觉怎么样？`,
  pt: `Olá! Eu sou a Lexi. Pronto(a) para escrever em português? Como você está se sentindo hoje?`,
  it: `Ciao! Sono Lexi. Pronto(a) a scrivere in italiano? Come ti senti oggi?`,
};
const SYSTEM_PROMPTS = {
  en: `You are a friendly, lightly humorous language tutor and conversation partner. When the user submits a sentence or short text in any language, you will: 1. Repeat back their original text (in quotes). 2. Offer a playful, kind correction: point out mistakes in grammar or word choice, rewrite their sentence correctly, and include a light joke or friendly quip. 3. Briefly explain the main correction in simple terms (one or two sentences). 4. Ask a natural follow-up question about their text to keep the conversation going, related to what they wrote. Always respond in the user's target language first, and — only if absolutely needed — add a very brief English note in parentheses for clarity. Keep your tone upbeat, encouraging, and fun.`,
  es: `Eres un tutor de idiomas amigable y con un toque de humor. Cuando el usuario escriba una frase o texto corto en cualquier idioma: 1. Repite su texto original (entre comillas). 2. Haz una corrección amable y divertida: señala errores de gramática o vocabulario, reescribe la frase correctamente e incluye una broma ligera. 3. Explica brevemente la corrección en términos simples. 4. Haz una pregunta de seguimiento relacionada. Responde siempre primero en el idioma objetivo del usuario y solo añade una nota en inglés si es absolutamente necesario. Sé animado, alentador y divertido.`,
  fr: `Tu es un tuteur de langue sympathique et légèrement humoristique. Lorsque l'utilisateur soumet une phrase ou un court texte dans n'importe quelle langue : 1. Répète son texte original (entre guillemets). 2. Propose une correction amicale et ludique : signale les erreurs de grammaire ou de vocabulaire, réécris la phrase correctement et ajoute une petite blague. 3. Explique brièvement la correction en termes simples. 4. Pose une question de suivi naturelle. Réponds toujours d'abord dans la langue cible de l'utilisateur et ajoute une note en anglais uniquement si c'est absolument nécessaire. Garde un ton positif, encourageant et amusant.`,
  zh: `你是一位友好且带有幽默感的语言导师和对话伙伴。当用户提交一句话或一小段文字时：1. 用引号重复他们的原文。2. 友善地指出语法或用词错误，正确地重写句子，并加上一句轻松的玩笑。3. 用简单的话简要解释主要修改。4. 针对他们写的内容提出一个自然的后续问题。始终优先用用户的目标语言回复，只有在绝对必要时才用括号加一句简短的英文说明。保持积极、鼓励和有趣的语气。`,
  pt: `Você é um tutor de idiomas amigável e levemente bem-humorado. Quando o usuário enviar uma frase ou texto curto em qualquer idioma: 1. Repita o texto original (entre aspas). 2. Ofereça uma correção gentil e divertida: aponte erros de gramática ou vocabulário, reescreva a frase corretamente e inclua uma piada leve. 3. Explique brevemente a principal correção em termos simples. 4. Faça uma pergunta de acompanhamento relacionada ao texto. Sempre responda primeiro no idioma alvo do usuário e só adicione uma breve nota em inglês se for absolutamente necessário. Mantenha um tom animado, encorajador e divertido.`,
  it: `Sei un tutor di lingua amichevole e leggermente spiritoso. Quando l'utente invia una frase o un breve testo in qualsiasi lingua: 1. Ripeti il testo originale (tra virgolette). 2. Offri una correzione gentile e giocosa: segnala errori di grammatica o lessico, riscrivi la frase correttamente e aggiungi una battuta simpatica. 3. Spiega brevemente la correzione principale in termini semplici. 4. Fai una domanda di follow-up naturale. Rispondi sempre prima nella lingua di destinazione dell'utente e aggiungi una breve nota in inglese solo se strettamente necessario. Mantieni un tono allegro, incoraggiante e divertente.`
};

const THEME_OPTIONS = [
  'Travel',
  'Family',
  'Language Learning',
  'Health & Mental',
  'What if...?',
  'Something crazy',
  'Technology & Gadgets',
  'Challenges & Goals',
];

const initialMessages = [
  { sender: 'ai', text: 'Bonjour ! Je suis Lexi. Pose-moi une question ou commence à discuter en français !', timestamp: new Date() }
];

export default function ChatPage() {
  const { journalInput, language } = useJournal();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem('lexi-chat-messages');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [
          { sender: 'ai', text: PROMPTS[language] || PROMPTS['fr'], timestamp: new Date() }
        ];
      }
    }
    return [
      { sender: 'ai', text: PROMPTS[language] || PROMPTS['fr'], timestamp: new Date() }
    ];
  });
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  // Voice recording state
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Track previous language for confirmation
  const prevLanguageRef = useRef(language);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-reply if last message is from user and not yet answered by AI
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      const last = messages[messages.length - 1];
      // If last message is from user, always trigger AI response
      if (last.sender === 'user') {
        (async () => {
          setLoading(true);
          try {
            let systemPrompt;
            if (profile?.proficiency) {
              // Adjust system prompt based on proficiency
              systemPrompt = getProficiencyPrompt(profile.proficiency);
            }
            const aiText = await getChatCompletion(last.text, systemPrompt);
            setMessages(prev => [...prev, { sender: 'ai', text: aiText, timestamp: new Date() }]);
            // OpenAI TTS integration
            try {
              const followupMatch = aiText.match(/\*\*Follow-up:\*\*[\s\n]*([\s\S]*?)(?=\*\*Follow-up Translation:|$)/i);
              const followupText = followupMatch ? followupMatch[1].trim() : '';
              if (followupText) {
                const audioUrl = await openaiTTS(followupText, 'fable');
                const audio = new Audio(audioUrl);
                audio.play();
              }
            } catch (ttsErr) {
              console.error('TTS error:', ttsErr);
            }
          } catch (err) {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Lexi. Please try again.', timestamp: new Date() }]);
          } finally {
            setLoading(false);
          }
        })();
      }
    }
    // eslint-disable-next-line
  }, [messages, profile]);

  useEffect(() => {
    localStorage.setItem('lexi-chat-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      if (window.confirm('Changing language will reset your current conversation. Continue?')) {
        setMessages([
          { sender: 'ai', text: PROMPTS[language] || PROMPTS['fr'], timestamp: new Date() }
        ]);
        setInput('');
        localStorage.removeItem('lexi-chat-messages');
      } // else: do not change messages, keep old conversation
      prevLanguageRef.current = language;
    }
    // eslint-disable-next-line
  }, [language]);

  // If coming back from PromptsPage with a selected theme
  useEffect(() => {
    if (location.state && location.state.selectedTheme) {
      const selectedTheme = location.state.selectedTheme;
      // Clear the state so it doesn't trigger again
      navigate(location.pathname, { replace: true, state: {} });
      // Generate a prompt for the selected theme (same as handleThemeSave)
      (async () => {
        const prompt = `Theme: ${selectedTheme}\nLanguage: ${language}`;
        const systemPrompt = `You are a friendly language tutor. ONLY reply with a single, short, motivating question or prompt about the given theme for the user to journal or chat about, in the target language. Do NOT include corrections, vocabulary, or any other sections. Example: What is your favorite travel memory?`;
        let aiText = '';
        try {
          aiText = await getChatCompletion(prompt, systemPrompt);
        } catch (err) {
          console.error('AI error:', err);
        }
        if (!aiText || !aiText.trim()) {
          aiText = `Let's talk about ${selectedTheme.toLowerCase()}! What's something interesting you can share?`;
        }
        setMessages(prev => [...prev, { sender: 'ai', text: aiText.trim(), timestamp: new Date() }]);
      })();
    }
  }, [location.state, language, navigate, location.pathname]);

  // Handle incoming journal entry from JournalPage
  useEffect(() => {
    if (location.state && location.state.journalEntry && location.state.journalEntry.trim()) {
      const journalEntry = location.state.journalEntry;
      // Clear the state so it doesn't trigger again
      navigate(location.pathname, { replace: true, state: {} });
      // Add the journal entry as a user message, which will trigger the auto-reply effect
      setMessages(prev => [...prev, { sender: 'user', text: journalEntry, timestamp: new Date() }]);
    }
  }, [location.state, navigate, location.pathname]);

  const handleNewConversation = () => {
    if (window.confirm('Start a new conversation? This will clear your current chat history.')) {
      setMessages([
        { sender: 'ai', text: PROMPTS[language] || PROMPTS['fr'], timestamp: new Date() }
      ]);
      setInput('');
      localStorage.removeItem('lexi-chat-messages');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Remove AI response logic from here; useEffect will handle it
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
        const transcription = await transcribeWithWhisper(audioBlob, language);
        setInput(transcription);
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } else {
      // Stop recording
      mediaRecorderRef.current.stop();
    }
  };

  // Handle theme save
  const handleThemeSave = async () => {
    if (!selectedTheme) return;
    setShowThemeModal(false);
    setSelectedTheme(null);
    // Generate a prompt for the selected theme
    const prompt = `Theme: ${selectedTheme}\nLanguage: ${language}`;
    const systemPrompt = `You are a friendly language tutor. ONLY reply with a single, short, motivating question or prompt about the given theme for the user to journal or chat about, in the target language. Do NOT include corrections, vocabulary, or any other sections. Example: What is your favorite travel memory?`;
    // Debug: log the prompt and systemPrompt
    console.log('Theme prompt:', prompt);
    console.log('Theme systemPrompt:', systemPrompt);
    let aiText = '';
    try {
      aiText = await getChatCompletion(prompt, systemPrompt);
      console.log('Theme AI prompt response:', aiText);
    } catch (err) {
      console.error('AI error:', err);
    }
    if (!aiText || !aiText.trim()) {
      aiText = `Let's talk about ${selectedTheme.toLowerCase()}! What's something interesting you can share?`;
      console.warn('AI returned empty, using fallback:', aiText);
    }
    setMessages(prev => {
      const newMessages = [...prev, { sender: 'ai', text: aiText.trim(), timestamp: new Date() }];
      console.log('Messages after theme prompt:', newMessages);
      return newMessages;
    });
  };

  // Calculate word count from all user messages and current input
  const wordLimit = 200;
  const userWords = messages.filter(m => m.sender === 'user').map(m => m.text).join(' ') + ' ' + input;
  const wordCount = userWords.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="chat-bg" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <ChatHeader wordCount={wordCount} wordLimit={wordLimit} onThemesClick={() => navigate('/prompts')} />
      {/* Theme Modal removed, now handled by PromptsPage route */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fafaff' }}>
        <button
          onClick={handleNewConversation}
          style={{
            marginBottom: 16,
            background: '#f5f5f5',
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: '0.5rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#7A54FF',
            float: 'right',
            fontSize: 14
          }}
        >
          New Conversation
        </button>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} sender={msg.sender} text={msg.text} />
        ))}
        {loading && <ChatBubble sender="ai" loading />}
        {!loading && (
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) handleSend(e);
              }
            }}
            placeholder={!input.trim() ? "Keep journaling..." : ""}
            style={{
              marginTop: 24,
              width: '100%',
              fontSize: 20,
              fontFamily: 'Albert Sans, sans-serif',
              color: '#212121',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              padding: 0,
              boxShadow: 'none',
              lineHeight: '32px',
              minHeight: '180px',
              height: '100%',
              flex: 1,
              overflow: 'auto',
              display: 'block',
              caretColor: '#7A54FF',
            }}
            disabled={loading}
          />
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatActionsRow
        onSpeak={() => navigate('/voice-journal')}
        onSend={handleSend}
        onImage={() => {}}
        sendDisabled={!input.trim() || loading}
      />
    </div>
  );
}

// Helper to generate system prompt based on proficiency
function getProficiencyPrompt(proficiency) {
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
  return `You are Lexi, a friendly, lightly humorous language tutor and conversation partner. ${levelInstructions}\n\n` +
    `When the user submits a sentence or short text in any language, you MUST reply in this exact format, with all five sections, every time:\n\n` +
    `**Corrected Entry:**  \n<full corrected sentence, with any corrections bolded using <b>...</b> HTML tags>\n\n` +
    `**Key Corrections:**  \n- For each correction, show the entire corrected sentence for context, with the correction bolded using <b>...</b> HTML tags (not **...**). Briefly explain the change after the sentence.\n- Example: Je <b>suis allé</b> au marché. ("suis allé" is the correct past tense for "I went")\n- Do this for each important correction.\n\n` +
    `**Phrase to Remember:**  \n- Provide 3-5 short phrases or collocations from the correction, each as a bullet, in quotes, with a simple translation if helpful. If fewer than 3 are relevant, just include those.\n\n` +
    `**Vocabulary Enhancer:**  \n- Suggest 1-3 advanced, topic-relevant vocabulary words, idioms, or phrases (with translation or explanation) that would elevate the user's writing, based on the theme of their entry. Each should be a bullet, and always keep it relevant to the topic. For example, if the entry is about a picnic, suggest a phrase or idiom about picnics or food; if about a job, suggest something relevant to work or career. Example: Instead of 'la nourriture était très bien', suggest 'un festin pour les papilles' (a feast for the taste buds); instead of 'j'ai faim', suggest 'avoir un petit creux' (to feel a bit peckish).\n\n` +
    `**Follow-up:**  \n<A natural follow-up question in the target language, related to what the user wrote. Make it lighthearted, playful, and banter-y, encouraging a friendly and fun conversation.>\n\n` +
    `**Follow-up Translation:**  \n<The English translation of the follow-up question above>\n\n` +
    `You must always include all six sections, even if the user's sentence is perfect or only needs encouragement.\n\n` +
    `Always respond in the user's target language first, and — only if absolutely needed — add a very brief English note in parentheses for clarity. You are a gentle, female-voiced language tutor who speaks like a calm, caring friend: use light, tasteful humor rather than over-the-top jokes, offer meditative, thoughtful encouragement, and gently nudge the learner with kind corrections and supportive follow-up questions.`;
} 