import React, { useEffect } from 'react';
import Navigation from './src/Navigation';
import { useFonts, AlbertSans_400Regular, AlbertSans_700Bold } from '@expo-google-fonts/albert-sans';
import AppLoading from 'expo-app-loading';
import { Text as RNText, TextProps, SafeAreaView } from 'react-native';
import { testSupabaseConnection } from './src/supabaseClient';
import { AuthProvider } from './src/hooks/useAuth';
import { AppProviders } from './src/context/JournalContext';
import Toast from 'react-native-toast-message';

// Global Text override for Albert Sans
const Text: React.FC<TextProps> = (props) => (
  <RNText {...props} style={[{ fontFamily: 'AlbertSans_400Regular' }, props.style]} />
);

export default function App() {
  const [fontsLoaded] = useFonts({
    AlbertSans_400Regular,
    AlbertSans_700Bold,
  });

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  // @ts-ignore: Override global Text
  global.Text = Text;

  return (
    <AuthProvider>
      <AppProviders>
        <SafeAreaView style={{ flex: 1, paddingTop: 24, backgroundColor: '#fafaff' }}>
          <Navigation />
          <Toast />
        </SafeAreaView>
      </AppProviders>
    </AuthProvider>
  );
}
