import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JournalProvider } from './src/context/JournalContext';
import { AuthProvider } from './src/context/AuthContext';
import JournalScreen from './src/screens/JournalScreen';
import ChatScreen from './src/screens/ChatScreen';
import SavedScreen from './src/screens/SavedScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <JournalProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Journal" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Journal" component={JournalScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Saved" component={SavedScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </JournalProvider>
    </AuthProvider>
  );
}
