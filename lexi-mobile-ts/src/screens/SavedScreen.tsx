import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../BottomNav';

// Dummy data for demonstration
const dummyPhrases = [
  { id: '1', phrase: 'Bonjour', translation: 'Hello', lang: 'fr' },
  { id: '2', phrase: 'Merci beaucoup', translation: 'Thank you very much', lang: 'fr' },
  { id: '3', phrase: 'How are you?', translation: 'Comment ça va ?', lang: 'en' },
];

const NAV_HEIGHT = 88;
const HEADER_HEIGHT = 64;

// Defensive text wrapper
const SafeText: React.FC<{children: any, style?: any}> = ({ children, style }) => {
  if (typeof children !== 'string') return null;
  return <Text style={style}>{children}</Text>;
};

const SavedScreen: React.FC = () => {
  const [saved, setSaved] = useState(dummyPhrases);
  const [loading, setLoading] = useState(false);

  const handleRemovePhrase = (id: string) => {
    setSaved(prev => prev.filter(item => item.id !== id));
  };

  const playAudio = (phrase: string, lang: string) => {
    // TODO: Integrate TTS
    alert(`Play audio for: ${phrase} (${lang})`);
  };

  return (
    <View style={[styles.container, { minHeight: '100%' }]}> {/* Full height background */}
      {/* Consistent header */}
      <View style={[styles.headerBox, { minHeight: HEADER_HEIGHT, paddingTop: 32 }]}> {/* Match Account page header */}
        <Text style={styles.headerTitle}>Saved Phrases</Text>
      </View>
      <View style={[styles.content, { paddingBottom: NAV_HEIGHT + 24 }]}> {/* Add bottom padding */}
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : saved.length === 0 ? (
          <Text style={styles.emptyText}>No saved phrases yet.</Text>
        ) : (
          <FlatList
            data={saved}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <TouchableOpacity onPress={() => playAudio(item.phrase, item.lang)}>
                    <Ionicons name="volume-high-outline" size={22} color="#7A54FF" style={{ marginRight: 8 }} />
                  </TouchableOpacity>
                  <SafeText style={styles.phraseText}>{item.phrase}</SafeText>
                  <Text style={[styles.langTag, { backgroundColor: item.lang === 'fr' ? '#7A54FF' : '#00C853' }]}>{item.lang}</Text>
                  <TouchableOpacity onPress={() => handleRemovePhrase(item.id)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
                {item.translation && <SafeText style={styles.translation}>{item.translation}</SafeText>}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 0 }}
          />
        )}
      </View>
      <BottomNav />
    </View>
  );
};

export default SavedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafaff',
    paddingHorizontal: 0,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: '#181818',
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
    padding: 18,
    gap: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phraseText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#4F2DD9',
    backgroundColor: '#f3f0ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontFamily: 'AlbertSans_700Bold',
  },
  langTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 6,
    letterSpacing: 1,
    fontFamily: 'AlbertSans_700Bold',
  },
  removeBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeText: {
    color: '#D32F2F',
    fontWeight: '700',
    fontSize: 12,
    fontFamily: 'AlbertSans_700Bold',
  },
  translation: {
    fontSize: 15,
    color: '#888',
    marginLeft: 2,
    marginTop: 2,
    fontFamily: 'AlbertSans_400Regular',
  },
  headerBox: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '700', fontFamily: 'AlbertSans_700Bold', color: '#181818', marginTop: 24, marginBottom: 8, textAlign: 'center' },
}); 