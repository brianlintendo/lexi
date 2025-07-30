import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchSavedPhrases, removeSavedPhrase } from '../api/savedPhrases';
import { useAuth } from '../context/AuthContext';

interface SavedPhrase {
  id: string;
  phrase: string;
  translation: string;
  created_at: string;
  user_id: string;
}

const NAV_HEIGHT = 88;

const SavedScreen: React.FC = () => {
  const [saved, setSaved] = useState<SavedPhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadSavedPhrases();
  }, [user]);

  const loadSavedPhrases = async () => {
    setLoading(true);
    try {
      const phrases = await fetchSavedPhrases(user?.id || 'default-user');
      setSaved(phrases);
    } catch (error) {
      console.error('Error loading saved phrases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhrase = async (id: string) => {
    try {
      const success = await removeSavedPhrase(user?.id || 'default-user', id);
      if (success) {
        setSaved(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error removing phrase:', error);
    }
  };

  const playAudio = (phrase: string, lang: string) => {
    // TODO: Integrate TTS
    alert(`Play audio for: ${phrase} (${lang})`);
  };

  return (
    <LinearGradient
      colors={["#FAF4F4", "#E9E3F5", "#F5F1FD"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-transparent min-h-full">
        <Header title="Saved Phrases" className="pt-[54px]" titleClassName="text-[20px]" />
        <View className="flex-1 px-5 pt-2 pb-0" style={{ paddingBottom: NAV_HEIGHT + 40 }}>
          {loading ? (
            <Text className="text-center text-gray-400 mt-10 italic text-base">Loading...</Text>
          ) : saved.length === 0 ? (
            <Text className="text-center text-gray-400 mt-10 italic text-base">No saved phrases yet.</Text>
          ) : (
            <FlatList
              data={saved}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View className="bg-white rounded-xl shadow p-4 mb-4 flex-col gap-1">
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => playAudio(item.phrase, 'en')}>
                      <Ionicons name="volume-high-outline" size={22} color="#7A54FF" className="mr-2" />
                    </TouchableOpacity>
                    <Text className="font-bold text-lg text-violet-700 bg-violet-50 rounded px-2 py-0.5">{item.phrase}</Text>
                    <TouchableOpacity onPress={() => handleRemovePhrase(item.id)} className="ml-auto px-2 py-1 rounded">
                      <Text className="text-red-600 font-bold text-xs">Remove</Text>
                    </TouchableOpacity>
                  </View>
                  {item.translation && <Text className="text-sm text-gray-500 ml-1 mt-1">{item.translation}</Text>}
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 0 }}
            />
          )}
        </View>
        <BottomNav />
      </View>
    </LinearGradient>
  );
};

export default SavedScreen; 