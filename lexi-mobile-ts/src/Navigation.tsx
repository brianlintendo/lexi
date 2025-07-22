import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import JournalScreen from './screens/JournalScreen';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import NameEntryScreen from './screens/NameEntryScreen';
import OnboardMotivationScreen from './screens/OnboardMotivationScreen';
import ProficiencyScreen from './screens/ProficiencyScreen';
import PromptsScreen from './screens/PromptsScreen';
import SavedScreen from './screens/SavedScreen';
import SettingsScreen from './screens/SettingsScreen';
import VoiceJournalScreen from './screens/VoiceJournalScreen';

export type LanguageType = {
  code: string;
  label: string;
  flag: string;
};

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Chat: { journalEntry?: string; language?: LanguageType } | undefined;
  Journal: undefined;
  LanguageSelect: undefined;
  NameEntry: undefined;
  OnboardMotivation: undefined;
  Proficiency: undefined;
  Prompts: undefined;
  Saved: undefined;
  Settings: undefined;
  VoiceJournal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Journal" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Journal" component={JournalScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="NameEntry" component={NameEntryScreen} />
        <Stack.Screen name="OnboardMotivation" component={OnboardMotivationScreen} />
        <Stack.Screen name="Proficiency" component={ProficiencyScreen} />
        <Stack.Screen name="Prompts" component={PromptsScreen} />
        <Stack.Screen name="Saved" component={SavedScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="VoiceJournal" component={VoiceJournalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 