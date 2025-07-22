import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import BottomNav from '../BottomNav';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useJournal } from '../context/JournalContext';
import { useUser } from '../hooks/useAuth';
import { saveProfile } from '../api/profile';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { getChatCompletion } from '../api/openai';

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  // Add more as needed
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
  fr: 'Salut ! Qu’as-tu fait aujourd’hui ?',
  en: 'Hi! What did you do today?',
  es: '¡Hola! ¿Qué hiciste hoy?',
};
const PLACEHOLDER = 'Je me sens…';

const NAV_HEIGHT = 88;
const HEADER_HEIGHT = 64;

// Defensive text wrapper
const SafeText: React.FC<{children: any, style?: any}> = ({ children, style }) => {
  if (typeof children !== 'string') return null;
  return <Text style={style}>{children}</Text>;
};

const JournalScreen: React.FC = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [showReturning, setShowReturning] = useState(false); // Toggle for returning conversation state
  const { language, setLanguage } = useJournal();
  const { user } = useUser();
  const [promptBubble, setPromptBubble] = useState(DEFAULT_PROMPTS[language]);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    let isMounted = true;
    async function fetchPrompt() {
      const langLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';
      const systemPrompt = `You are a friendly, casual language tutor. Write a short, natural greeting prompt for a journal app, similar to 'Hi! What did you do today?' in the target language (${langLabel}). Keep it casual and inviting, and do not use English.`;
      try {
        const result = await getChatCompletion('', systemPrompt);
        if (isMounted) setPromptBubble(result.trim());
      } catch {
        if (isMounted) setPromptBubble(DEFAULT_PROMPTS[language] || DEFAULT_PROMPTS['en']);
      }
    }
    fetchPrompt();
    return () => { isMounted = false; };
  }, [language]);

  const weekDates = getWeekDates(selectedDate);
  const isReturning = showReturning && text.length > 0;

  return (
    <LinearGradient
      colors={['#F6F2FF', '#E9E3FF']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.container, { minHeight: '100%' }]}> {/* Removed backgroundColor: 'transparent' */}
          {/* Weekday Selector */}
          <View style={styles.weekRow}>
            {weekDates.map((date, i) => {
              const isActive = date.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.weekday, isActive && styles.activeWeekday]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[styles.weekdayLabel, isActive && styles.activeWeekdayLabel]}>{weekdays[i]}</Text>
                  <Text style={[styles.weekdayDate, isActive && styles.activeWeekdayDate]}>{date.getDate()}</Text>
                </TouchableOpacity>
              );
            })}
            {/* Language flag icon placeholder */}
            <TouchableOpacity onPress={() => setShowLangSheet(true)} style={styles.flagButton}>
              <Text style={styles.flagText}>{LANGUAGES.find(l => l.code === language)?.flag || '🇺🇸'}</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#B0B0B0" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for notes"
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#B0B0B0"
            />
          </View>

          {/* Date Heading */}
          <View style={styles.dateHeadingRow}>
            <Text style={styles.dateHeading}>{formatDateHeading(selectedDate)}</Text>
            {isReturning && (
              <View style={styles.inProgressBadge}>
                <Text style={styles.inProgressText}>IN PROGRESS</Text>
              </View>
            )}
          </View>

          {/* Main Content */}
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {isReturning ? (
              <>
                <SafeText style={styles.returningText}>{text}</SafeText>
                <View style={styles.promptBubbleReturning}>
                  <Text style={styles.promptText}>{promptBubble}</Text>
                </View>
                <TouchableOpacity style={styles.resumeButton}>
                  <Text style={styles.resumeButtonText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.endButton}>
                  <Text style={styles.endButtonText}>End</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.promptBubble}>
                  <Text style={styles.promptText}>{promptBubble}</Text>
                </View>
                <TextInput
                  style={styles.journalInput}
                  placeholder={PLACEHOLDER}
                  value={text}
                  onChangeText={setText}
                  placeholderTextColor="#B0B0B0"
                  multiline
                />
              </>
            )}
          </ScrollView>

          {/* Bottom Actions (only if not returning) */}
          {!isReturning && (
            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="mic-outline" size={24} color="#7A54FF" />
                <Text style={styles.actionLabel}>Speak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendButton}
                onPress={() => {
                  if (text.trim()) {
                    navigation.navigate('Chat', { journalEntry: text, language });
                  }
                }}
              >
                <Ionicons name="arrow-up" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="image-outline" size={24} color="#7A54FF" />
                <Text style={styles.actionLabel}>Image</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: NAV_HEIGHT }} /> {/* Spacer for BottomNav */}
          <BottomNav />

          <Modal
            visible={showLangSheet}
            animationType="slide"
            transparent
            onRequestClose={() => setShowLangSheet(false)}
          >
            <TouchableOpacity style={styles.sheetOverlay} onPress={() => setShowLangSheet(false)} />
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Select Language</Text>
              <FlatList
                data={LANGUAGES}
                keyExtractor={item => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.langOption}
                    onPress={async () => {
                      setLanguage(item.code);
                      setShowLangSheet(false);
                      if (user?.id) {
                        await saveProfile({ id: user.id, language: item.code });
                      }
                    }}
                  >
                    <Text style={styles.flagText}>{item.flag}</Text>
                    <Text style={styles.langLabel}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default JournalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F6F2FF', // Remove this line to avoid interfering with gradient
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  header: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', fontFamily: 'AlbertSans_700Bold', color: '#181818', marginTop: 24, marginBottom: 8, textAlign: 'center' },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
    justifyContent: 'flex-start',
    gap: 8,
  },
  weekday: {
    alignItems: 'center',
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: 8,
    minWidth: 28,
  },
  activeWeekday: {
    backgroundColor: '#ECE6FF',
  },
  weekdayLabel: {
    fontSize: 13,
    color: '#B0B0B0',
    fontWeight: '400',
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 2,
  },
  activeWeekdayLabel: {
    color: '#7A54FF',
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
  },
  weekdayDate: {
    fontSize: 15,
    color: '#181818',
    fontWeight: '400',
    fontFamily: 'AlbertSans_400Regular',
  },
  activeWeekdayDate: {
    color: '#7A54FF',
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    marginBottom: 18,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#181818',
    fontFamily: 'AlbertSans_400Regular',
  },
  dateHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  dateHeading: {
    fontSize: 19,
    fontWeight: '700',
    color: '#181818',
    flex: 1,
    fontFamily: 'AlbertSans_700Bold',
  },
  inProgressBadge: {
    backgroundColor: '#ECE6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginLeft: 8,
  },
  inProgressText: {
    color: '#7A54FF',
    fontWeight: '700',
    fontSize: 13,
    fontFamily: 'AlbertSans_700Bold',
  },
  promptBubble: {
    backgroundColor: '#F6F2FF',
    borderColor: '#7A54FF',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    marginTop: 8,
  },
  promptBubbleReturning: {
    backgroundColor: '#F6F2FF',
    borderColor: '#7A54FF',
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    marginTop: 18,
  },
  promptText: {
    color: '#7A54FF',
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'AlbertSans_400Regular',
    textAlign: 'left',
  },
  journalInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 17,
    color: '#181818',
    minHeight: 40,
    marginBottom: 18,
    padding: 0,
    fontFamily: 'AlbertSans_400Regular',
  },
  returningText: {
    color: '#181818',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 14,
    lineHeight: 24,
  },
  resumeButton: {
    backgroundColor: '#7A54FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 10,
  },
  resumeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'AlbertSans_700Bold',
  },
  endButton: {
    backgroundColor: '#D1D1D1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 28,
  },
  endButtonText: {
    color: '#212121',
    fontWeight: '700',
    fontSize: 18,
    fontFamily: 'AlbertSans_700Bold',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 64,
  },
  sendButton: {
    backgroundColor: '#7A54FF',
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionLabel: {
    color: '#181818',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '400',
    fontFamily: 'AlbertSans_400Regular',
    opacity: 0.7,
  },
  flagButton: {
    marginLeft: 16,
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  flagText: {
    fontSize: 28,
    textAlign: 'center',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  langLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
}); 