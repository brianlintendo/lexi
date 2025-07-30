import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheetPicker from '../components/BottomSheetPicker';
import { GOOGLE_OAUTH_CONFIG } from '../config/oauth';

const PROFICIENCY_LEVELS = [
  { value: 'A1 (Beginner)', label: 'A1 (Beginner)' },
  { value: 'A2 (Elementary)', label: 'A2 (Elementary)' },
  { value: 'B1 (Intermediate)', label: 'B1 (Intermediate)' },
  { value: 'B2 (Upper-Intermediate)', label: 'B2 (Upper-Intermediate)' },
  { value: 'C1 (Advanced)', label: 'C1 (Advanced)' },
];

const LANGUAGES = [
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
];

const NAV_HEIGHT = 88;

const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLangSheet, setShowLangSheet] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { language, setLanguage } = useJournal();
  const [showProfModal, setShowProfModal] = useState(false);
  const [proficiency, setProficiency] = useState(PROFICIENCY_LEVELS[0].value);
  const [saving, setSaving] = useState(false);
  const { user, signInWithGoogle, signInGuest, signOut, loading } = useAuth();

  const isGoogleOAuthConfigured = GOOGLE_OAUTH_CONFIG.clientId !== 'your-google-client-id.apps.googleusercontent.com';

  const handleSignInWithGoogle = async () => {
    try {
      if (!isGoogleOAuthConfigured) {
        Alert.alert(
          'Google Sign-In Not Configured', 
          'Google OAuth is not configured yet. You can still use guest mode or configure Google OAuth in the settings.',
          [
            { text: 'Use Guest Mode', onPress: handleSignInGuest },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      setIsSigningIn(true);
      // Start the Google OAuth flow - don't show success alert here
      // The auth state change will handle the success
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        'Sign In Error', 
        'Failed to sign in with Google. Would you like to try guest mode instead?',
        [
          { text: 'Try Guest Mode', onPress: handleSignInGuest },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignInGuest = async () => {
    try {
      await signInGuest();
      Alert.alert('Sign In', 'Signed in successfully as guest!');
    } catch (error) {
      Alert.alert('Sign In Error', 'Failed to sign in as guest. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={["#FAF4F4", "#E9E3F5", "#F5F1FD"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-transparent min-h-full">
        <Header title="Account" className="pt-[54px]" titleClassName="text-[20px]" />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: NAV_HEIGHT + 40 }}>
          {/* Account Section */}
          <View className="bg-gray-50 rounded-xl px-5 py-6 mx-5 mb-5 shadow">
            <Text className="text-lg font-bold text-violet-600 mb-3">Account</Text>
            {loading ? (
              <Text className="text-gray-500 text-base">Loading...</Text>
            ) : user ? (
              <View>
                <View className="flex-row items-center mb-3">
                  <Ionicons name="person-circle" size={24} color="#7A54FF" />
                  <Text className="text-base font-semibold ml-2 text-gray-900">
                    {user.email}
                  </Text>
                </View>
                {user.user_metadata?.is_guest && (
                  <Text className="text-sm text-gray-500 mb-3">Guest Account</Text>
                )}
                <TouchableOpacity 
                  className="bg-red-500 rounded-lg px-4 py-3 mt-2"
                  onPress={handleSignOut}
                >
                  <Text className="text-white font-bold text-center">Sign Out</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-gray-500 text-base mb-4">Sign in to sync your data across devices</Text>
                <TouchableOpacity 
                  className={`rounded-lg px-4 py-3 mb-3 flex-row items-center justify-center ${
                    isGoogleOAuthConfigured ? 'bg-blue-500' : 'bg-gray-400'
                  }`}
                  onPress={handleSignInWithGoogle}
                  disabled={!isGoogleOAuthConfigured || isSigningIn}
                >
                  {isSigningIn ? (
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  ) : (
                    <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
                  )}
                  <Text className="text-white font-bold">
                    {isSigningIn ? 'Signing in...' : (isGoogleOAuthConfigured ? 'Sign in with Google' : 'Google Sign-in (Not Configured)')}
                  </Text>
                </TouchableOpacity>
                {!isGoogleOAuthConfigured && (
                  <Text className="text-xs text-gray-500 mb-3 text-center">
                    Configure Google OAuth in src/config/oauth.ts to enable Google sign-in
                  </Text>
                )}
                <TouchableOpacity 
                  className="bg-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-center"
                  onPress={handleSignInGuest}
                >
                  <Ionicons name="person" size={20} color="#333" style={{ marginRight: 8 }} />
                  <Text className="text-gray-700 font-bold">Continue as Guest</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* App Settings Section */}
          <View className="bg-gray-50 rounded-xl px-5 py-6 mx-5 mb-5 shadow">
            <Text className="text-lg font-bold text-violet-600 mb-3">App Settings</Text>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="font-semibold text-base">Notifications</Text>
              <Switch value={notifications} onValueChange={setNotifications} />
            </View>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="font-semibold text-base">Dark Mode</Text>
              <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="font-semibold text-base">Version</Text>
              <Text className="text-gray-500 text-base">1.0.0</Text>
            </View>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="font-semibold text-base">Clear Conversation</Text>
              <TouchableOpacity className="bg-red-500 rounded px-3 py-1" onPress={() => {}}>
                <Text className="text-white font-bold">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences Section */}
          <View className="bg-gray-50 rounded-xl px-5 py-6 mx-5 mb-5 shadow">
            <Text className="text-lg font-bold text-violet-600 mb-3">Preferences</Text>
            <Text className="font-semibold text-base mt-2 mb-1">Preferred Language</Text>
            <TouchableOpacity className="bg-white rounded border border-gray-200 py-3 px-4 mb-3 flex-row items-center justify-between" onPress={() => setShowLangSheet(true)}>
              <Text className="text-base text-gray-900">{LANGUAGES.find(l => l.code === language)?.label || 'Select language…'}</Text>
              <Ionicons name="chevron-down" size={20} color="#888" />
            </TouchableOpacity>
            <Text className="font-semibold text-base mt-2 mb-1">Proficiency</Text>
            <TouchableOpacity className="bg-white rounded border border-gray-200 py-3 px-4 mb-3 flex-row items-center justify-between" onPress={() => setShowProfModal(true)}>
              <Text className="text-base text-gray-900">{PROFICIENCY_LEVELS.find(l => l.value === proficiency)?.label || 'Select proficiency…'}</Text>
              <Ionicons name="chevron-down" size={20} color="#888" />
            </TouchableOpacity>
            {saving && <Text className="text-violet-600 font-bold mt-2">Saving…</Text>}
          </View>
        </ScrollView>
        <BottomSheetPicker
          visible={showLangSheet}
          onClose={() => setShowLangSheet(false)}
          options={LANGUAGES.map(l => ({ label: l.label, value: l.code, icon: <Text className="text-2xl text-center">{l.flag}</Text> }))}
          onSelect={code => {
            setLanguage(code);
            setShowLangSheet(false);
          }}
          title="Select Language"
        />
        <BottomSheetPicker
          visible={showProfModal}
          onClose={() => setShowProfModal(false)}
          options={PROFICIENCY_LEVELS.map(l => ({ label: l.label, value: l.value }))}
          onSelect={value => {
            setProficiency(value);
            setShowProfModal(false);
          }}
          title="Select Proficiency"
        />
        <BottomNav />
      </View>
    </LinearGradient>
  );
};

export default SettingsScreen; 