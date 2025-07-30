import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../BottomNav';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../Navigation';
import { useJournal } from '../context/JournalContext';
import { getChatCompletion } from '../api/openai';
import { Modal as RNModal } from 'react-native';
import { useUser } from '../hooks/useAuth';
import { addSavedPhrase } from '../api/savedPhrases';
import { Audio } from 'expo-av';
import { openaiTTS } from '../api/openai';
import { Asset } from 'expo-asset';
import Toast from 'react-native-toast-message';
import { checkPhraseExists } from '../api/savedPhrases';
import SavedPhraseSheet from '../components/SavedPhraseSheet';

const PROMPT_BUBBLES: Record<string, string> = {
  fr: 'Bonjour ! Prêt(e) à écrire en français ? 😊\nComment tu te sens aujourd’hui ?',
  en: 'Hello! Ready to write in English? 😊\nHow are you feeling today?',
  es: '¡Hola! ¿Listo(a) para escribir en español? 😊\n¿Cómo te sientes hoy?',
};

// Dynamically build the system prompt to always use the selected language
function buildSystemPrompt(languageLabel: string, languageCode: string) {
  return `
You are Lexi, a friendly, lightly humorous language tutor and conversation partner.

The user wants to practice ${languageLabel} (${languageCode}). All main responses, corrections, and follow-up questions should be in ${languageLabel} unless otherwise specified. You may include brief English addenda for explanations or translations, but the main content and all follow-up questions must be in ${languageLabel}.

When the user submits a sentence or short text in any language, you MUST reply in this exact format:

**Corrected Entry:**  
<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed, show the full corrected sentence with corrections bolded using <b>...</b> HTML tags>

**Key Corrections:**  
<ONLY include this section if there are actual corrections to make. If the user's text is perfect, skip this entire section. If corrections are needed:
- For each correction, show the entire corrected sentence for context, with the correction bolded using <b>...</b> HTML tags (not **...**). Briefly explain the change after the sentence.
- Example: Je <b>suis allé</b> au marché. ("suis allé" is the correct past tense for "I went")
- Do this for each important correction.>

**Phrase to Remember:**  
<Highlight a useful phrase or idiom from the user's text or your correction. Show the phrase and a short translation or explanation.>

**Vocabulary Enhancer:**  
<Suggest 1-3 additional helpful words or phrases related to the user's text or your correction. These should be new, useful vocabulary for the user to learn (not just repeats). For each, provide a short translation or explanation.>

**Follow-up:**  
<Ask a natural, friendly follow-up question related to the user's text, in ${languageLabel}.>

**Follow-up Translation:**  
<Provide a short English translation of the follow-up question.>
`;
}

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

const NAV_HEIGHT = 88;

// Helper to parse AI response sections
function parseAISections(text: string) {
  if (!text) return {};
  const correctedMatch = text.match(/\*\*Corrected Entry:\*\*[\s\n]*([\s\S]*?)(?=\*\*Key Corrections:|$)/i);
  const correctionsMatch = text.match(/\*\*Key Corrections:\*\*[\s\n]*([\s\S]*?)(?=\*\*Phrase to Remember:|$)/i);
  const phraseMatch = text.match(/\*\*Phrase to Remember:\*\*[\s\n]*([\s\S]*?)(?=\*\*Vocabulary Enhancer:|\*\*Follow-up:|$)/i);
  const vocabMatch = text.match(/\*\*Vocabulary Enhancer:\*\*[\s\n]*([\s\S]*?)(?=\*\*Follow-up:|$)/i);
  const followupMatch = text.match(/\*\*Follow-up:\*\*[\s\n]*([\s\S]*?)(?=\*\*Follow-up Translation:|$)/i);
  const followupTranslationMatch = text.match(/\*\*Follow-up Translation:\*\*[\s\n]*([\s\S]*)/i);
  return {
    corrected: correctedMatch ? correctedMatch[1].trim() : null,
    corrections: correctionsMatch ? correctionsMatch[1].trim() : null,
    phrase: phraseMatch ? phraseMatch[1].trim() : null,
    vocab: vocabMatch ? vocabMatch[1].trim() : null,
    followup: followupMatch ? followupMatch[1].trim() : null,
    followupTranslation: followupTranslationMatch ? followupTranslationMatch[1].trim() : null,
  };
}

// Helper to render text with <b>...</b> as bold
function renderWithBold(text: string) {
  if (!text) return null;
  const parts = text.split(/(<b>.*?<\/b>)/g);
  return parts.map((part, i) => {
    if (part.startsWith('<b>') && part.endsWith('</b>')) {
      return <Text key={i} style={{ fontWeight: 'bold' }}>{part.slice(3, -4)}</Text>;
    }
    return <Text key={i}>{part}</Text>;
  });
}

// TTS playback hook
function useTTS() {
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const playTTS = async (text: string) => {
    setPlaying(true);
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: 0, // DO_NOT_MIX
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // DO_NOT_MIX
        playThroughEarpieceAndroid: false,
      });
      console.log('Requesting TTS from OpenAI for:', text);
      const url = await openaiTTS(text, 'fable');
      console.log('Received TTS audio URL:', url);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (!status.isLoaded || status.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch (err) {
      setPlaying(false);
      console.error('TTS playback error:', err);
    }
  };

  React.useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  return { playTTS, playing };
}

// SectionedAIBubble component for AI responses
const SectionedAIBubble = ({ text, onPhrasePress, autoSpeakFollowup }: { text: string, onPhrasePress: (phrase: string | null, translation?: string | null) => void, autoSpeakFollowup?: boolean }) => {
  const { playTTS, playing } = useTTS();
  const sections = parseAISections(text);
  const hasSections = Object.values(sections).some(Boolean);

  // Auto-speak follow-up if requested
  React.useEffect(() => {
    if (autoSpeakFollowup && sections.followup) {
      playTTS(sections.followup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpeakFollowup, sections.followup]);

  if (!hasSections) {
    return (
      <View style={[styles.bubble, styles.aiBubble]}>
        <Text style={[styles.bubbleText, styles.aiText]}>{text}</Text>
        <TouchableOpacity style={{ marginTop: 8, alignSelf: 'flex-end' }} onPress={() => playTTS(text)} disabled={playing}>
          <Ionicons name="volume-high-outline" size={22} color="#7A54FF" />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={{
      backgroundColor: '#F6F2FF',
      borderRadius: 18,
      borderWidth: 2,
      borderColor: '#4FDC8B',
      padding: 18,
      marginBottom: 12,
      shadowColor: '#7A54FF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    }}>
      {sections.followup && (
        <TouchableOpacity onPress={() => onPhrasePress(sections.followup, sections.followupTranslation)}>
          <Text style={{ color: '#009688', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline', marginBottom: 10 }}>{sections.followup}</Text>
          <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => playTTS(sections.followup!)} disabled={playing}>
            <Ionicons name="volume-high-outline" size={20} color="#7A54FF" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
      {sections.corrected && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', color: '#7A54FF', fontSize: 16, marginBottom: 2 }}>Corrected Entry:</Text>
          <Text style={{ color: '#7A54FF', fontSize: 16, fontWeight: '600' }}>{renderWithBold(sections.corrected)}</Text>
        </View>
      )}
      {sections.corrections && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', color: '#7A54FF', fontSize: 15 }}>Key Corrections:</Text>
          {sections.corrections.split(/\n|\r/).filter(Boolean).map((line, i) => (
            <Text key={i} style={{ color: '#181818', fontSize: 15, marginLeft: 8, marginBottom: 2 }}>
              <Text style={{ fontWeight: 'bold', color: '#7A54FF' }}>• </Text>{renderWithBold(line)}
            </Text>
          ))}
        </View>
      )}
      {sections.phrase && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', color: '#7A54FF', fontSize: 15 }}>Phrase to Remember:</Text>
          {sections.phrase.split(/\n|\r|^[-•]\s+/m).filter(p => p.trim()).map((p, i) => (
            <TouchableOpacity key={i} onPress={() => onPhrasePress(p.trim())}>
              <Text style={{ backgroundColor: '#ffe066', color: '#7A54FF', fontWeight: '600', fontSize: 15, marginLeft: 8, marginBottom: 2, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 }}>{p.trim()}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => playTTS(p.trim())} disabled={playing}>
                <Ionicons name="volume-high-outline" size={18} color="#7A54FF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {sections.vocab && (
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: '700', color: '#7A54FF', fontSize: 15 }}>Vocabulary Enhancer:</Text>
          {sections.vocab.split(/\n|\r|^[-•]\s+/m).filter(v => v.trim()).map((v, i) => (
            <TouchableOpacity key={i} onPress={() => onPhrasePress(v.trim())}>
              <Text style={{ backgroundColor: '#e0e7ff', color: '#7A54FF', fontWeight: '600', fontSize: 15, marginLeft: 8, marginBottom: 2, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 }}>{v.trim()}</Text>
              <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => playTTS(v.trim())} disabled={playing}>
                <Ionicons name="volume-high-outline" size={18} color="#7A54FF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// BottomSheet modal for saving phrases
const SavePhraseSheet = ({ visible, phrase, translation, onSave, onClose, isSaved }: { visible: boolean, phrase: string, translation?: string, onSave: () => void, onClose: () => void, isSaved: boolean }) => (
  <RNModal
    visible={visible}
    animationType="slide"
    transparent
    onRequestClose={onClose}
  >
    <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={onClose} />
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 180, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#7A54FF', textAlign: 'center', marginBottom: 16 }}>Save Phrase</Text>
      <Text style={{ fontSize: 16, color: '#181818', fontWeight: '600', marginBottom: 8 }}>{phrase}</Text>
      {translation ? <Text style={{ fontSize: 15, color: '#888', marginBottom: 12 }}>{translation}</Text> : null}
      <TouchableOpacity
        style={{ backgroundColor: isSaved ? '#4FDC8B' : '#7A54FF', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, opacity: isSaved ? 0.7 : 1 }}
        onPress={onSave}
        disabled={isSaved}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{isSaved ? 'Saved' : 'Save'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ alignItems: 'center', marginTop: 12 }} onPress={onClose}>
        <Text style={{ color: '#7A54FF', fontWeight: '600', fontSize: 15 }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </RNModal>
);

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { language } = useJournal();
  const initialPrompt = PROMPT_BUBBLES[language.code] || PROMPT_BUBBLES['fr'];
  const [messages, setMessages] = useState([{ sender: 'ai', text: initialPrompt }]);
  const [hasHandledJournalEntry, setHasHandledJournalEntry] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [inputHeight, setInputHeight] = useState(80);
  // State for save phrase sheet
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [rawSheetPhrase, setRawSheetPhrase] = useState('');
  const [isPhraseSaved, setIsPhraseSaved] = useState(false);
  const { user } = useUser();

  // Helper to split phrase and translation
  function splitPhraseAndTranslation(raw: string): { phrase: string; translation: string } {
    // Match: "I went" – I moved to a place.
    const match = raw.match(/^"?(.+?)"?\s*[–-]\s*(.+)$/);
    if (match) {
      return { phrase: match[1].trim(), translation: match[2].trim() };
    }
    return { phrase: raw, translation: '' };
  }

  const handleSavePhrase = async () => {
    const { phrase, translation } = splitPhraseAndTranslation(rawSheetPhrase);
    if (user && user.id && phrase) {
      const alreadySaved = await checkPhraseExists(user.id, phrase);
      if (!alreadySaved) {
        await addSavedPhrase(user.id, phrase, translation || '');
        setIsPhraseSaved(true);
        Toast.show({
          type: 'success',
          text1: 'Saved to Phrases',
          position: 'bottom',
          visibilityTime: 1800,
          bottomOffset: 80,
          text1Style: { color: '#fff', fontWeight: '700' },
        });
      } else {
        setIsPhraseSaved(true);
      }
    }
    setTimeout(() => setShowSaveSheet(false), 1000);
  };

  // When opening the save sheet, check if phrase is already saved
  React.useEffect(() => {
    const { phrase } = splitPhraseAndTranslation(rawSheetPhrase);
    if (showSaveSheet && user && user.id && phrase) {
      checkPhraseExists(user.id, phrase).then(setIsPhraseSaved);
    } else if (!showSaveSheet) {
      setIsPhraseSaved(false);
    }
  }, [showSaveSheet, user, rawSheetPhrase]);

  // On mount, if journalEntry param is present, add as first user message and trigger AI response
  React.useEffect(() => {
    const journalEntry = route.params?.journalEntry;
    if (journalEntry && !hasHandledJournalEntry) {
      setMessages(prev => {
        // Only add if not already present
        if (prev.some(m => m.sender === 'user' && m.text === journalEntry)) return prev;
        return [...prev, { sender: 'user', text: journalEntry }];
      });
      setHasHandledJournalEntry(true);
    }
  }, [route.params?.journalEntry, hasHandledJournalEntry]);

  // When a new user message is added (from journalEntry), trigger AI response
  React.useEffect(() => {
    if (hasHandledJournalEntry && messages.length === 2 && messages[1].sender === 'user') {
      (async () => {
        setLoading(true);
        try {
          const systemPrompt = buildSystemPrompt(language.label, language.code);
          const aiText = await getChatCompletion(messages[1].text, systemPrompt);
          setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
        } catch (err) {
          setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Lexi. Please try again.' }]);
        } finally {
          setLoading(false);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      })();
    }
  }, [hasHandledJournalEntry, messages, language]);

  // Word count logic
  const wordCount = messages.filter(m => m.sender === 'user').map(m => m.text).join(' ').split(/\s+/).filter(Boolean).length + input.split(/\s+/).filter(Boolean).length;
  const wordLimit = 1000;
  const progress = Math.min(wordCount / wordLimit, 1);

  // Also update handleSend to use the dynamic system prompt
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    try {
      const systemPrompt = buildSystemPrompt(language.label, language.code);
      const aiText = await getChatCompletion(input, systemPrompt);
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Lexi. Please try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleThemePrompt = async (theme: string) => {
    setShowThemeModal(false);
    setLoading(true);
    try {
      const prompt = `Theme: ${theme}`;
      const systemPrompt = `You are a friendly language tutor. ONLY reply with a single, short, motivating question or prompt about the given theme for the user to journal or chat about, in the target language. Do NOT include corrections, vocabulary, or any other sections. Example: What is your favorite travel memory?`;
      const aiText = await getChatCompletion(prompt, systemPrompt);
      setMessages(prev => [...prev, { sender: 'ai', text: aiText.trim() }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, there was an error getting a theme prompt.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Date/time for the first message
  const now = new Date();
  const dateString = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { minHeight: '100%' }]}> {/* Full height background */}
          {/* Header */}
          <View style={[styles.header, { minHeight: 64, paddingTop: 0 }]}> {/* Consistent header height */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
              <Ionicons name="arrow-back" size={24} color="#181818" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.wordCountText}>{wordCount} words / {wordLimit} words</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerIcon}>
                <Ionicons name="book-outline" size={22} color="#7A54FF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIcon} onPress={() => setShowThemeModal(true)}>
                <Ionicons name="color-wand-outline" size={22} color="#7A54FF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date/Time */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{dateString}, {timeString}</Text>
          </View>

          {/* Chat Area */}
          <ScrollView
            style={styles.chatArea}
            contentContainerStyle={{ paddingBottom: NAV_HEIGHT + 120 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Prompt bubble at top */}
            <View style={styles.promptBubble}>
              <Text style={styles.promptText}>{initialPrompt}</Text>
            </View>
            {/* Chat bubbles */}
            {messages.slice(1).map((msg, idx) => {
              if (msg.sender === 'user') {
                return (
                  <View key={idx} style={[styles.bubble, styles.userBubble]}>
                    {typeof msg.text === 'string' ? (
                      <Text style={[styles.bubbleText, styles.userText]}>{msg.text}</Text>
                    ) : null}
                  </View>
                );
              } else if (typeof msg.text === 'string') {
                // Auto-speak follow-up for the latest AI message only
                const isLatestAI = idx === messages.slice(1).length - 1;
                return (
                  <SectionedAIBubble
                    key={idx}
                    text={msg.text}
                    onPhrasePress={(phrase, translation) => {
                      setRawSheetPhrase(phrase ?? '');
                      setShowSaveSheet(true);
                    }}
                    autoSpeakFollowup={isLatestAI}
                  />
                );
              }
              return null;
            })}
            {loading && (
              <View style={[styles.bubble, styles.aiBubble]}>
                <ActivityIndicator color="#7A54FF" size="small" />
              </View>
            )}
            {/* 'Keep journaling...' input box directly under chat prompts */}
            <View style={styles.inlineInputRow}>
              <TextInput
                style={[styles.inlineInput, { minHeight: 80, height: inputHeight }]}
                placeholder="Keep journaling..."
                value={input}
                onChangeText={setInput}
                placeholderTextColor="#B0B0B0"
                multiline
                onContentSizeChange={e => setInputHeight(Math.max(80, e.nativeEvent.contentSize.height))}
              />
            </View>
          </ScrollView>
          {/* Action Buttons Row at the bottom */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="mic-outline" size={24} color="#7A54FF" />
              <Text style={styles.actionLabel}>Speak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
              <Ionicons name="arrow-up" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="image-outline" size={24} color="#7A54FF" />
              <Text style={styles.actionLabel}>Image</Text>
            </TouchableOpacity>
          </View>
          <BottomNav />
          <Modal visible={showThemeModal} transparent animationType="slide" onRequestClose={() => setShowThemeModal(false)}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setShowThemeModal(false)} />
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 220, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#7A54FF', textAlign: 'center', marginBottom: 16 }}>Choose a Theme</Text>
              <FlatList
                data={THEME_OPTIONS}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#ececec' }} onPress={() => handleThemePrompt(item)}>
                    <Text style={{ fontSize: 16, color: '#181818' }}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Modal>
          {(() => {
            const { phrase, translation } = splitPhraseAndTranslation(rawSheetPhrase);
            return (
              <SavedPhraseSheet
                visible={showSaveSheet}
                phrase={phrase}
                translation={translation}
                onSave={handleSavePhrase}
                onClose={() => setShowSaveSheet(false)}
                isSaved={isPhraseSaved}
              />
            );
          })()}
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaff',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fafaff',
    zIndex: 2,
  },
  headerIcon: {
    padding: 6,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none', // allow header icons to be clickable
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordCountText: {
    color: '#181818',
    fontWeight: '400',
    fontSize: 14,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 2,
    textAlign: 'center',
  },
  progressBarBg: {
    width: 120,
    height: 6,
    backgroundColor: '#ECE6FF',
    borderRadius: 3,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#7A54FF',
    borderRadius: 3,
  },
  dateRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontFamily: 'AlbertSans_400Regular',
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  promptBubble: {
    borderWidth: 1.5,
    borderColor: '#7A54FF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    marginTop: 8,
    backgroundColor: '#F6F2FF',
  },
  promptText: {
    color: '#7A54FF',
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'AlbertSans_400Regular',
    textAlign: 'left',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
  },
  userBubble: {
    backgroundColor: '#7A54FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ECE6FF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#7A54FF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 32,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#181818',
    fontFamily: 'AlbertSans_400Regular',
    minHeight: 36,
    maxHeight: 120,
    marginHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    backgroundColor: '#7A54FF',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  inputAction: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F2FF',
    marginHorizontal: 2,
  },
  inputRow: { position: 'absolute', left: 16, right: 16, bottom: 140, backgroundColor: '#fff', borderRadius: 18, padding: 12, shadowColor: '#7A54FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, zIndex: 10 },
  actionsRow: { position: 'absolute', left: 16, right: 16, bottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 },
  actionButton: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  actionLabel: { color: '#7A54FF', fontSize: 13, marginTop: 4, fontWeight: '500', fontFamily: 'AlbertSans_400Regular', opacity: 0.7 },
  inlineInputRow: { marginTop: 16, marginBottom: 8, paddingHorizontal: 0 },
  inlineInput: { backgroundColor: '#fff', borderRadius: 16, fontSize: 16, color: '#181818', fontFamily: 'AlbertSans_400Regular', padding: 16, minHeight: 48, shadowColor: '#7A54FF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
}); 