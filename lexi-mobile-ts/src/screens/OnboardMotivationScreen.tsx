import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import { useUser } from '../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { saveProfile } from '../api/profile';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOTIVATIONS = [
  { key: 'work', emoji: '💼', title: 'Work', desc: (lang: string) => `I want to work in ${lang}-speaking countries` },
  { key: 'travel', emoji: '✈️', title: 'Travel', desc: (lang: string) => `I want to explore ${lang}-speaking regions` },
  { key: 'culture', emoji: '🎬', title: 'Culture', desc: (lang: string) => `I want to enjoy ${lang} movies, music & books` },
  { key: 'connections', emoji: '💬', title: 'Connections', desc: (lang: string) => `I want to chat with family, friends & colleagues` },
  { key: 'career', emoji: '📈', title: 'Career Growth', desc: (lang: string) => `I want to boost my resume and open new job opportunities` },
  { key: 'personal', emoji: '🌱', title: 'Personal Growth', desc: (lang: string) => `I want to challenge myself and build confidence` },
];

const schema = z.object({ motivation: z.string().min(1, 'Select your motivation') });
type FormData = z.infer<typeof schema>;

export const OnboardMotivationScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user } = useUser();
  const name = (route.params as any)?.name || '';
  const language = (route.params as any)?.language || '';
  const proficiency = (route.params as any)?.proficiency || '';
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  const selected = watch('motivation');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error('No user');
      await saveProfile({ id: user.id, name, language, proficiency, motivation: data.motivation });
    },
    onSuccess: () => {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#FAF4F4] via-[#E9E3F5] to-[#F5F1FD] items-center">
      <View className="w-full max-w-[550px] flex-1 flex-col items-center px-6">
        <Text className="text-[28px] font-bold text-[#181818] mt-16 mb-4 w-full text-left">What's your main motivation to learn {language}?</Text>
        <Text className="text-[#757575] mb-8 text-[16px] font-medium w-full text-left">Learners with clear motivation are more likely to stay on track</Text>
        <Controller
          control={control}
          name="motivation"
          render={({ field: { onChange, value } }) => (
            <View className="w-full">
              {MOTIVATIONS.map(motivation => (
                <TouchableOpacity
                  key={motivation.key}
                  className={`w-full py-4 mb-4 rounded-xl border ${value === motivation.key ? 'border-[#2D7FF9] bg-[#F4F8FF]' : 'border-[#E0E0E0] bg-white'}`}
                  onPress={() => onChange(motivation.key)}
                  accessibilityRole="button"
                >
                  <View className="flex-row items-center">
                    <Text className="text-[28px] mr-4">{motivation.emoji}</Text>
                    <View>
                      <Text className="font-bold text-[18px] mb-1 text-[#181818]">{motivation.title}</Text>
                      <Text className="text-[16px] text-[#222] opacity-95">{motivation.desc(language)}</Text>
                    </View>
                  </View>
                  {value === motivation.key && (
                    <Text className="absolute right-6 top-6 text-[#2D7FF9] text-[22px] font-bold">✔️</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
        <TouchableOpacity
          className={`w-full bg-[#7A54FF] rounded-xl py-4 mt-4 ${!selected ? 'opacity-50' : ''}`}
          onPress={handleSubmit(onSubmit)}
          disabled={!selected || mutation.isLoading}
          accessibilityRole="button"
        >
          <Text className="text-white text-lg font-bold text-center">{mutation.isLoading ? 'Saving...' : 'Continue'}</Text>
        </TouchableOpacity>
        {mutation.isError && <Text className="text-red-500 mt-2">Failed to save. Please try again.</Text>}
      </View>
    </SafeAreaView>
  );
};

export default OnboardMotivationScreen; 