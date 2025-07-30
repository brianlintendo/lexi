import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useJournal } from '../context/JournalContext';
import BottomNav from '../components/BottomNav';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheetPicker from '../components/BottomSheetPicker';
import { getChatCompletion } from '../api/openai';
import { buildSystemPrompt } from '../utils/prompts';
import SavedPhraseSheet from '../components/SavedPhraseSheet';
import { useAuth } from '../context/AuthContext';

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
}

function getWeekDates(date: Date) {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDateHeading(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const DEFAULT_PROMPTS: Record<string, string> = {
  fr: 'Bonjour ! Prêt(e) à écrire en français ? 😊\nComment tu te sens aujourd’hui ?',
  en: 'Hello! Ready to write in English? 😊\nHow are you feeling today?',
  es: '¡Hola! ¿Listo(a) para escribir en español? 😊\n¿Cómo te sientes hoy?',
};
const PLACEHOLDER = 'Je me sens…';

const NAV_HEIGHT = 88;

// Helper function to parse AI response sections
const parseAISections = (text: string) => {
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
};

const JournalScreen: React.FC = () => {
  const today = new Date();
  const [journalEntries, setJournalEntries] = useState<{ [date: string]: { text: string; inProgress: boolean; ended: boolean } }>({});
  const [selectedDate, setSelectedDate] = useState(today);
  const dateKey = selectedDate.toISOString().slice(0, 10);
  const entry = journalEntries[dateKey] || { text: '', inProgress: false, ended: false };
  const [text, setText] = useState(entry.text);
  const [showReturning, setShowReturning] = useState(entry.inProgress);
  const [isEnded, setIsEnded] = useState(entry.ended);
  const { language, setLanguage, messages, setMessages } = useJournal();
  const [promptBubble, setPromptBubble] = useState(DEFAULT_PROMPTS[language]);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const navigation = useNavigation();
  const [showSheet, setShowSheet] = useState(false);
  const [sheetText, setSheetText] = useState('');
  const [search, setSearch] = useState('');
  const mainInputRef = useRef<TextInput>(null);
  const [showPhraseSheet, setShowPhraseSheet] = useState(false);
  const [phraseData, setPhraseData] = useState({ phrase: '', translation: '' });
  const { user } = useAuth();

  // On date change, update state to reflect entry for that date
  useEffect(() => {
    const entry = journalEntries[dateKey] || { text: '', inProgress: false, ended: false };
    setText(entry.text);
    setShowReturning(entry.inProgress);
    setIsEnded(entry.ended);
  }, [dateKey, journalEntries]);

  // On text, inProgress, or ended change, update journalEntries
  useEffect(() => {
    setJournalEntries(prev => ({
      ...prev,
      [dateKey]: { text, inProgress: showReturning, ended: isEnded },
    }));
  }, [text, showReturning, isEnded, dateKey]);

  // Language picker fix
  const handleLanguageSelect = useCallback((code: string) => {
    setLanguage(code);
    setShowLangSheet(false);
    setPromptBubble(DEFAULT_PROMPTS[code] || DEFAULT_PROMPTS['en']);
  }, [setLanguage]);

  useEffect(() => {
    let isMounted = true;
    async function fetchPrompt() {
      setPromptBubble(DEFAULT_PROMPTS[language] || DEFAULT_PROMPTS['en']);
    }
    fetchPrompt();
    return () => { isMounted = false; };
  }, [language]);

  // Ensure bottom sheet is closed when returning to JournalPage
  useFocusEffect(
    React.useCallback(() => {
      setShowSheet(false);
    }, [])
  );

  // Only allow sheet to open if not returning and not ended
  const handleInputFocus = () => {
    if (!showReturning && !isEnded) {
      setSheetText(text);
      setShowSheet(true);
    }
  };

  // When closing the sheet, blur the main input so it doesn't re-trigger
  const handleCloseSheet = () => {
    setShowSheet(false);
    if (mainInputRef.current) {
      mainInputRef.current.blur();
    }
  };

  const handleSheetSubmit = async () => {
    if (sheetText.trim()) {
      // Only add if not already present as last user message
      const lastUserMsg = messages.filter(m => m.sender === 'user').slice(-1)[0];
      if (!lastUserMsg || lastUserMsg.text !== sheetText) {
        setMessages([...messages, { sender: 'user', text: sheetText }]);
        
        // Get AI response for the journal entry
        try {
          const systemPrompt = buildSystemPrompt(language);
          const aiResponse = await getChatCompletion(sheetText, systemPrompt);
          setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
          console.error('Error getting AI response:', error);
          // Still navigate even if AI response fails
        }
      }
      
      (navigation as any).navigate('Chat');
      setShowSheet(false);
      setShowReturning(true);
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

  const weekDates = getWeekDates(selectedDate);
  const isReturning = showReturning && text.length > 0;

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <LinearGradient
          colors={["#FAF4F4", "#E9E3F5", "#F5F1FD"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        >
          <View className="flex-1 px-5 pt-0 pb-0">
            {/* Weekday Selector */}
            <View className="flex-row items-center mt-2 mb-4 gap-2">
              {weekDates.map((date, i) => {
                const isActive = date.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={i}
                    className={`items-center px-1 py-1 rounded-lg min-w-[28px] ${isActive ? 'bg-violet-100' : ''}`}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text className={`text-xs mb-0.5 font-normal ${isActive ? 'text-violet-600 font-bold' : 'text-gray-400'}`}>{weekdays[i]}</Text>
                    <Text className={`text-sm font-normal ${isActive ? 'text-violet-600 font-bold' : 'text-gray-900'}`}>{date.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity onPress={() => setShowLangSheet(true)} className="ml-4 p-1 rounded-xl bg-white shadow-sm self-center">
                <Text className="text-2xl text-center">{LANGUAGES.find(l => l.code === language)?.flag || '🇺🇸'}</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white rounded-2xl px-4 h-11 mb-4 shadow-sm">
              <Ionicons name="search-outline" size={20} color="#B0B0B0" style={{ marginRight: 8 }} />
              <TextInput
                className="flex-1 text-base text-gray-900"
                placeholder="Search for notes"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#B0B0B0"
              />
            </View>

            {/* Date Heading */}
            <View className="flex-row items-center mb-2 mt-0.5">
              <Text className="text-lg font-bold text-gray-900 flex-1">{formatDateHeading(selectedDate)}</Text>
              {showReturning && !isEnded && (
                <View className="border border-gray-400 rounded-full px-4 py-1 ml-2">
                  <Text className="text-xs text-gray-700 font-bold">IN PROGRESS</Text>
                </View>
              )}
            </View>

            {/* Main Content */}
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }} keyboardShouldPersistTaps="handled">
              {showReturning && !isEnded ? (
                <>
                  <Text className="text-base text-gray-900 mb-3 leading-6">{text}</Text>
                  <View className="border border-violet-300 rounded-xl p-4 mb-4 mt-2 bg-[#F5F1FD]">
                    <Text className="text-violet-600 text-base font-medium text-left whitespace-pre-line">
                      {promptBubble}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  {messages && messages.length > 0 && messages.filter(m => m.sender === 'user').length > 0 && (
                    <View className="border border-violet-200 rounded-xl p-4 mb-4 bg-white">
                      <Text className="text-gray-900 text-base font-medium">Your last journal entry:</Text>
                      <Text className="text-gray-700 text-base mt-2">{messages.filter(m => m.sender === 'user').slice(-1)[0].text}</Text>
                    </View>
                  )}
                  <View className="border border-violet-300 rounded-xl p-4 mb-4 mt-2 bg-[#F5F1FD]">
                    <Text className="text-violet-600 text-base font-medium text-left whitespace-pre-line">
                      {promptBubble}
                    </Text>
                  </View>
                  <TextInput
                    ref={mainInputRef}
                    className="bg-transparent border-0 text-base text-gray-400 min-h-[40px] mb-4 p-0"
                    placeholder={PLACEHOLDER}
                    value={text}
                    onChangeText={setText}
                    placeholderTextColor="#B0B0B0"
                    multiline
                    onFocus={handleInputFocus}
                    editable={!showReturning && !isEnded}
                  />
                  {/* BottomSheet Modal for typing */}
                  <Modal
                    visible={showSheet}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={handleCloseSheet}
                  >
                    <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' }} onPress={handleCloseSheet}>
                      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <KeyboardAvoidingView
                          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                          style={{ width: '100%' }}
                          keyboardVerticalOffset={32} // adjust if you have a header/nav
                        >
                          <Pressable style={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: '60%', width: '100%' }} onPress={e => e.stopPropagation()}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Write your journal entry</Text>
                            <ScrollView
                              contentContainerStyle={{ flexGrow: 1 }}
                              keyboardShouldPersistTaps="handled"
                              style={{ marginBottom: 16 }}
                            >
                              <TextInput
                                style={{ width: '100%', minHeight: 120, fontSize: 18, borderColor: '#b9aaff', borderWidth: 1.5, borderRadius: 12, padding: 16, marginBottom: 16, fontFamily: 'System', color: '#181818' }}
                                value={sheetText}
                                onChangeText={setSheetText}
                                placeholder={PLACEHOLDER}
                                autoFocus
                                multiline
                              />
                            </ScrollView>
                            <TouchableOpacity
                              style={{ width: '100%', backgroundColor: '#7A54FF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 }}
                              onPress={handleSheetSubmit}
                            >
                              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 18 }}>Submit</Text>
                            </TouchableOpacity>
                          </Pressable>
                        </KeyboardAvoidingView>
                      </View>
                    </Pressable>
                  </Modal>
                </>
              )}
            </ScrollView>
            {/* Resume/End or Send Row */}
            {showReturning && !isEnded ? (
              <View style={{ position: 'absolute', left: 0, right: 0, bottom: 100, paddingHorizontal: 20 }}>
                <TouchableOpacity
                  className="bg-violet-600 rounded-xl py-4 items-center mb-3 mt-2"
                  onPress={() => {
                    // @ts-ignore
                    navigation.navigate('Chat', { journalEntry: text, language });
                  }}
                >
                  <Text className="text-white font-bold text-lg">Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-gray-300 rounded-xl py-4 items-center mb-7"
                  onPress={() => setIsEnded(true)}
                >
                  <Text className="text-gray-900 font-bold text-lg">End</Text>
                </TouchableOpacity>
              </View>
            ) : !isEnded && (
              <View className="flex-row items-center justify-between mb-6 mt-2 px-2" style={{ position: 'absolute', left: 0, right: 0, bottom: 100 }}>
                <TouchableOpacity className="items-center justify-center flex-1" style={{ marginHorizontal: 8 }}>
                  <Ionicons name="mic-outline" size={28} color="#181818" />
                  <Text className="text-gray-900 text-xs mt-1 font-normal">Speak</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-violet-600 rounded-full w-20 h-20 items-center justify-center mx-4 shadow-lg"
                  onPress={() => {
                    if (text.trim()) {
                      // @ts-ignore
                      navigation.navigate('Chat', { journalEntry: text, language });
                      setShowReturning(true);
                    }
                  }}
                >
                  <Ionicons name="arrow-up" size={32} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity className="items-center justify-center flex-1" style={{ marginHorizontal: 8 }}>
                  <Ionicons name="image-outline" size={28} color="#181818" />
                  <Text className="text-gray-900 text-xs mt-1 font-normal">Image</Text>
                </TouchableOpacity>
              </View>
            )}
            <BottomSheetPicker
              visible={showLangSheet}
              onClose={() => setShowLangSheet(false)}
              options={LANGUAGES.map(l => ({ label: l.label, value: l.code, icon: <Text className="text-2xl text-center">{l.flag}</Text> }))}
              onSelect={handleLanguageSelect}
              title="Select Language"
            />
            <BottomNav />
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
    </SafeAreaView>
  );
};

export default JournalScreen; 