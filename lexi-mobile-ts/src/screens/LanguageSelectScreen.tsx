import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import { useJournal } from '../context/JournalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export const LanguageSelectScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { setLanguage } = useJournal();
  const name = (route.params as any)?.name || '';

  const { data: languages, isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const { data, error } = await supabase.from('languages').select('code, label, emoji, enabled').eq('enabled', true).order('label', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const [selected, setSelected] = React.useState<any>(null);

  const handleContinue = () => {
    setLanguage(selected);
    navigation.navigate('Proficiency', { name, language: selected.code });
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#FAF4F4] via-[#E9E3F5] to-[#F5F1FD] items-center">
      <View className="w-full max-w-[550px] flex-1 flex-col items-center px-6">
        <Text className="text-[26px] font-bold text-[#212121] mt-16 mb-6 w-full text-left">What language do you want to learn?</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#7A54FF" />
        ) : (
          <FlatList
            data={languages}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                className={`w-full flex-row items-center py-4 mb-4 rounded-xl border ${selected?.code === item.code ? 'border-[#2D7FF9] bg-[#F4F8FF]' : 'border-[#E0E0E0] bg-white'}`}
                onPress={() => setSelected(item)}
                accessibilityRole="button"
              >
                <Text className="text-[26px] mr-4">{item.emoji}</Text>
                <Text className="text-[20px] font-semibold text-[#212121]">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        )}
        <TouchableOpacity
          className={`w-full bg-[#7A54FF] rounded-xl py-4 mt-4 ${!selected ? 'opacity-50' : ''}`}
          onPress={handleContinue}
          disabled={!selected}
          accessibilityRole="button"
        >
          <Text className="text-white text-lg font-bold text-center">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LanguageSelectScreen; 