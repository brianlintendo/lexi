import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Navigation';
import { useJournal } from '../context/JournalContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const schema = z.object({ name: z.string().min(1, 'Name is required') });

type FormData = z.infer<typeof schema>;

export const NameEntryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setJournalInput } = useJournal();
  const { control, handleSubmit, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = (data: FormData) => {
    setJournalInput(data.name);
    navigation.navigate('LanguageSelect', { name: data.name });
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#FAF4F4] via-[#E9E3F5] to-[#F5F1FD] items-center">
      <View className="w-full max-w-[550px] flex-1 flex-col items-center px-6">
        <Text className="text-[28px] font-bold text-[#181818] mt-16 mb-10 text-left w-full">What's your name?</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="text-[20px] font-bold text-[#181818] bg-transparent border-b border-[#B0B0B0] w-full mb-8"
              placeholder="Name"
              value={value}
              onChangeText={onChange}
              autoFocus
              accessibilityLabel="Name"
              returnKeyType="done"
            />
          )}
        />
        {errors.name && <Text className="text-red-500 mb-2">{errors.name.message}</Text>}
        <TouchableOpacity
          className={`w-full bg-[#7A54FF] rounded-xl py-4 mt-4 ${!isValid ? 'opacity-50' : ''}`}
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
          accessibilityRole="button"
        >
          <Text className="text-white text-lg font-bold text-center">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NameEntryScreen; 