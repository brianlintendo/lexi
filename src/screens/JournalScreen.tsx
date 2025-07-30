import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const sampleEntries = [
  { id: '1', date: '2024-07-23', text: 'Aujourd\'hui, j\'ai appris le français.' },
  { id: '2', date: '2024-07-22', text: 'J\'ai mangé une baguette.' },
];

export const JournalScreen: React.FC = () => {
  const [entry, setEntry] = useState('');
  const [entries, setEntries] = useState(sampleEntries);

  const handleAddEntry = () => {
    if (!entry.trim()) return;
    setEntries([{ id: Date.now().toString(), date: new Date().toISOString().slice(0, 10), text: entry }, ...entries]);
    setEntry('');
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-violet-100 via-purple-100 to-white">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-3xl font-bold text-violet-800 mb-2">Journal</Text>
        <Text className="text-base text-gray-500 mb-4">Write about your day in your target language.</Text>
        <TextInput
          className="bg-white rounded-xl p-4 text-base text-gray-900 border border-gray-200 mb-2"
          placeholder="Start journaling..."
          value={entry}
          onChangeText={setEntry}
          multiline
          numberOfLines={3}
          accessibilityLabel="Journal entry input"
        />
        <TouchableOpacity
          className={`bg-violet-600 rounded-xl py-3 ${!entry.trim() ? 'opacity-50' : ''}`}
          onPress={handleAddEntry}
          disabled={!entry.trim()}
          accessibilityRole="button"
        >
          <Text className="text-white text-center font-bold text-lg">Add Entry</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-xs text-gray-400 mb-1">{item.date}</Text>
            <Text className="text-base text-gray-900">{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-8">No entries yet. Start journaling!</Text>
        }
      />
    </SafeAreaView>
  );
};

export default JournalScreen; 