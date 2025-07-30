import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useJournal } from '../context/JournalContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getChatCompletion } from '../api/openai';
import { buildSystemPrompt } from '../utils/prompts';
import SavedPhraseSheet from '../components/SavedPhraseSheet';
import { useAuth } from '../context/AuthContext';
// import { getChatCompletion } from '../api/openai'; // Uncomment and implement this import for real OpenAI integration

const PROMPT_BUBBLES = {
  fr: 'Bonjour ! Prêt(e) à écrire en français ? 😊\nComment tu te sens aujourd’hui ?',
  en: 'Hello! Ready to write in English? 😊\nHow are you feeling today?',
  es: '¡Hola! ¿Listo(a) para escribir en español? 😊\n¿Cómo te sientes hoy?',
};

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

const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { language, messages, setMessages } = useJournal();
  const initialPrompt = PROMPT_BUBBLES[language as keyof typeof PROMPT_BUBBLES] || PROMPT_BUBBLES['fr'];
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputHeight, setInputHeight] = useState(80);
  const [hasHandledJournalEntry, setHasHandledJournalEntry] = useState(false);
  const [showPhraseSheet, setShowPhraseSheet] = useState(false);
  const [phraseData, setPhraseData] = useState({ phrase: '', translation: '' });
  const { user } = useAuth();

  // On mount, if journalEntry param is present, add as first user message and trigger AI response
  // Remove useEffect that adds journalEntry param as a user message

  // Word count logic
  const wordCount = messages.filter(m => m.sender === 'user').map(m => m.text).join(' ').split(/\s+/).filter(Boolean).length + input.split(/\s+/).filter(Boolean).length;
  const wordLimit = 1000;
  const progress = Math.min(wordCount / wordLimit, 1);

  // Date/time for the first message
  const now = new Date();
  const dateString = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages((prev: { sender: string; text: string }[]) => [...prev, { sender: 'user', text: input }]);
    setInput('');
    setLoading(true);
    
    try {
      const systemPrompt = buildSystemPrompt(language);
      const aiText = await getChatCompletion(input, systemPrompt);
      setMessages((prev: { sender: string; text: string }[]) => [...prev, { sender: 'ai', text: aiText }]);
    } catch (err) {
      console.error('ChatGPT API error:', err);
      setMessages((prev: { sender: string; text: string }[]) => [...prev, { sender: 'ai', text: 'Sorry, there was an error contacting Lexi. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePhraseClick = (phrase: string, translation: string = '') => {
    setPhraseData({ phrase, translation });
    setShowPhraseSheet(true);
  };

  const handlePhraseAdded = (result: any) => {
    console.log('Phrase added:', result);
    // You could show a success message here
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={["#FAF4F4", "#E9E3F5", "#F5F1FD"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        <View className="flex-1 min-h-full px-0 pt-0 pb-0">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-6 pb-2 bg-transparent z-10 mt-[48px]">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#181818" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Text className="text-xs text-gray-500 mb-1">{wordCount} words / {wordLimit} words</Text>
              <View className="w-32 h-1.5 bg-violet-100 rounded-full overflow-hidden">
                <View className="h-1.5 bg-violet-500 rounded-full" style={{ width: `${progress * 100}%` }} />
              </View>
            </View>
            <View style={{ width: 24 }} />
          </View>
          {/* Date/Time */}
          <View className="items-center mb-2 mt-1 z-10">
            <Text className="text-xs text-gray-400">{dateString}, {timeString}</Text>
          </View>
          {/* Chat Area */}
          <ScrollView
            className="flex-1 px-4 py-2"
            contentContainerStyle={{ paddingBottom: 160, paddingTop: 0 }}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {/* Prompt bubble at top */}
            <View className="border border-violet-300 rounded-xl p-4 mb-4 mt-2 bg-[#F5F1FD]">
              <Text className="text-violet-600 text-base font-medium text-left whitespace-pre-line">{initialPrompt}</Text>
            </View>
            {/* Render all chat bubbles from messages context */}
            {messages.map((msg, idx) => {
              if (msg.sender === 'user') {
                return (
                  <View key={idx} className="mb-3 items-end">
                    <View className="rounded-xl px-4 py-3 max-w-[80%] bg-violet-600">
                      <Text className="text-white">{msg.text}</Text>
                    </View>
                  </View>
                );
              } else if (typeof msg.text === 'string') {
                // Parse AI response sections like the web app
                const sections = parseAISections(msg.text);
                const hasSections = Object.values(sections).some(Boolean);
                
                if (!hasSections) {
                  // Simple AI response without structured sections
                  return (
                    <View key={idx} className="mb-3 items-start">
                      <View className="rounded-xl px-4 py-3 max-w-[80%] bg-violet-100">
                        <Text className="text-violet-700">{msg.text}</Text>
                      </View>
                    </View>
                  );
                }
                
                // Structured AI response with gradient border (like web app)
                return (
                  <View key={idx} className="mb-3 items-start">
                    <View 
                      style={{
                        borderRadius: 24,
                        padding: 2,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderColor: '#7A54FF',
                        shadowColor: '#7A54FF',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                        elevation: 4,
                      }}
                    >
                      <View 
                        style={{
                          backgroundColor: '#fff',
                          borderRadius: 22,
                          padding: 18,
                          minWidth: 60,
                          maxWidth: 340,
                        }}
                      >
                        {/* Follow-up question at the top (if present) */}
                        {sections.followup && (
                          <Text 
                            style={{
                              marginBottom: 14,
                              fontStyle: 'italic',
                              color: '#009688',
                              fontWeight: '500',
                              fontSize: 17,
                              textDecorationLine: 'underline',
                              textDecorationStyle: 'dotted',
                              textDecorationColor: '#009688',
                            }}
                          >
                            {sections.followup}
                          </Text>
                        )}
                        
                        {/* Corrected Entry */}
                        {sections.corrected && (
                          <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: '700', color: '#7A54FF', marginBottom: 4 }}>
                              Corrected Entry:
                            </Text>
                            <Text style={{ color: '#444', fontSize: 15 }}>
                              {sections.corrected}
                            </Text>
                          </View>
                        )}
                        
                        {/* Key Corrections */}
                        {sections.corrections && (
                          <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: '700', color: '#7A54FF', marginBottom: 4 }}>
                              Key Corrections:
                            </Text>
                            <View style={{ marginLeft: 18 }}>
                              {sections.corrections.split(/\n|\r/).filter(Boolean).map((line, i) => (
                                <Text key={i} style={{ color: '#444', fontSize: 15, marginBottom: 2 }}>
                                  • {line}
                                </Text>
                              ))}
                            </View>
                          </View>
                        )}
                        
                        {/* Phrase to Remember */}
                        {sections.phrase && (
                          <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: '700', color: '#7A54FF', marginBottom: 4 }}>
                              Phrase to Remember:
                            </Text>
                            <View style={{ marginLeft: 18 }}>
                              {sections.phrase.split(/\n|\r|^[-•]\s+/m).filter(p => p.trim()).map((p, i) => (
                                <TouchableOpacity 
                                  key={i} 
                                  style={{ marginBottom: 4 }}
                                  onPress={() => handlePhraseClick(p.trim())}
                                >
                                  <Text 
                                    style={{
                                      backgroundColor: '#ffe066',
                                      paddingHorizontal: 4,
                                      paddingVertical: 2,
                                      borderRadius: 3,
                                      fontWeight: '600',
                                      color: '#7A54FF',
                                      fontSize: 14,
                                    }}
                                  >
                                    {p.trim()}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                        
                        {/* Vocabulary Enhancer */}
                        {sections.vocab && (
                          <View style={{ marginBottom: 10 }}>
                            <Text style={{ fontWeight: '700', color: '#7A54FF', marginBottom: 4 }}>
                              Vocabulary Enhancer:
                            </Text>
                            <View style={{ marginLeft: 18 }}>
                              {sections.vocab.split(/\n|\r|^[-•]\s+/m).filter(v => v.trim()).map((v, i) => (
                                <TouchableOpacity 
                                  key={i} 
                                  style={{ marginBottom: 4 }}
                                  onPress={() => handlePhraseClick(v.trim())}
                                >
                                  <Text 
                                    style={{
                                      backgroundColor: '#e0e7ff',
                                      paddingHorizontal: 4,
                                      paddingVertical: 2,
                                      borderRadius: 3,
                                      fontWeight: '600',
                                      color: '#7A54FF',
                                      fontSize: 14,
                                    }}
                                  >
                                    {v.trim()}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        )}
                        
                        {/* Follow-up Translation */}
                        {sections.followupTranslation && (
                          <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
                            <Text style={{ fontWeight: '700', color: '#7A54FF', marginBottom: 4 }}>
                              Follow-up Translation:
                            </Text>
                            <Text style={{ color: '#666', fontSize: 14, fontStyle: 'italic' }}>
                              {sections.followupTranslation}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }
              return null;
            })}
            {loading && (
              <View className="items-start mb-3">
                <View className="rounded-xl px-4 py-3 bg-violet-100 max-w-[80%]">
                  <Text className="text-violet-700">Lexi is typing…</Text>
                </View>
              </View>
            )}
            {/* Input box under chat prompts */}
            <View className="mt-4">
              <TextInput
                className="bg-white rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="Keep journaling..."
                value={input}
                onChangeText={setInput}
                multiline
                style={{ minHeight: 80, height: inputHeight }}
                onContentSizeChange={e => setInputHeight(Math.max(80, e.nativeEvent.contentSize.height))}
              />
            </View>
          </ScrollView>
          {/* Action Buttons Row at the bottom */}
          <View className="flex-row items-center justify-between px-8 pb-8 pt-2 bg-transparent" style={{ position: 'absolute', left: 0, right: 0, bottom: 20 }}>
            <TouchableOpacity className="items-center justify-center flex-1" style={{ marginHorizontal: 8 }}>
              <Ionicons name="mic-outline" size={28} color="#181818" />
              <Text className="text-gray-900 text-xs mt-1 font-normal">Speak</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-violet-600 rounded-full w-20 h-20 items-center justify-center mx-4 shadow-lg"
              onPress={handleSend}
              disabled={loading}
            >
              <Ionicons name="arrow-up" size={32} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center flex-1" style={{ marginHorizontal: 8 }}>
              <Ionicons name="image-outline" size={28} color="#181818" />
              <Text className="text-gray-900 text-xs mt-1 font-normal">Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      <SavedPhraseSheet
        visible={showPhraseSheet}
        onClose={() => setShowPhraseSheet(false)}
        phraseData={phraseData}
        onPhraseAdded={handlePhraseAdded}
        userId={user?.id || 'default-user'}
      />
    </KeyboardAvoidingView>
  );
};

export default ChatScreen; 