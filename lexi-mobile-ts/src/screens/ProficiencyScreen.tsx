import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

const LEVELS = [
  { key: 'A1', title: 'A1 (Beginner)', desc: 'You know a few basic phrases and can introduce yourself.' },
  { key: 'A2', title: 'A2 (Elementary)', desc: 'You can handle simple everyday tasks and ask/answer basic questions.' },
  { key: 'B1', title: 'B1 (Intermediate)', desc: 'You can discuss familiar topics and understand straightforward texts.' },
  { key: 'B2', title: 'B2 (Upper-Intermediate)', desc: 'You can hold conversations on a wide range of subjects and read longer articles.' },
  { key: 'C1', title: 'C1 (Advanced)', desc: 'You can express ideas fluently, understand implicit meaning, and write clear, detailed texts.' },
];

const schema = z.object({ proficiency: z.string().min(1, 'Select your level') });
type FormData = z.infer<typeof schema>;

export const ProficiencyScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const name = (route.params as any)?.name || '';
  const language = (route.params as any)?.language || '';
  const { control, handleSubmit, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });
  const selected = watch('proficiency');

  const onSubmit = (data: FormData) => {
    navigation.navigate('Motivation', { name, language, proficiency: data.proficiency });
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#FAF4F4] via-[#E9E3F5] to-[#F5F1FD] items-center">
      <View className="w-full max-w-[550px] flex-1 flex-col items-center px-6">
        <Text className="text-[28px] font-bold text-[#181818] mt-16 mb-4 w-full text-left">What’s your current level in {language}?</Text>
        <Text className="text-[#757575] mb-8 text-[16px] font-medium w-full text-left">Choose the option that best describes your skills</Text>
        <Controller
          control={control}
          name="proficiency"
          render={({ field: { onChange, value } }) => (
            <View className="w-full">
              {LEVELS.map(level => (
                <TouchableOpacity
                  key={level.key}
                  className={`w-full py-4 mb-4 rounded-xl border ${value === level.key ? 'border-[#2D7FF9] bg-[#F4F8FF]' : 'border-[#E0E0E0] bg-white'}`}
                  onPress={() => onChange(level.key)}
                  accessibilityRole="button"
                >
                  <Text className="font-bold text-[18px] mb-1 text-[#181818]">{level.title}</Text>
                  <Text className="text-[16px] text-[#222] opacity-95">{level.desc}</Text>
                  {value === level.key && (
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
          disabled={!selected}
          accessibilityRole="button"
        >
          <Text className="text-white text-lg font-bold text-center">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProficiencyScreen; 