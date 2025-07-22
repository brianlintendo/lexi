import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Switch, ScrollView, Modal, FlatList } from 'react-native';
import { useUser } from '../hooks/useAuth';
import { getProfile, saveProfile, ProfileData } from '../api/profile';
import BottomNav from '../BottomNav';
import { useJournal } from '../context/JournalContext';

const PROFICIENCY_LEVELS = [
  { value: 'A1 (Beginner)', label: 'A1 (Beginner)' },
  { value: 'A2 (Elementary)', label: 'A2 (Elementary)' },
  { value: 'B1 (Intermediate)', label: 'B1 (Intermediate)' },
  { value: 'B2 (Upper-Intermediate)', label: 'B2 (Upper-Intermediate)' },
  { value: 'C1 (Advanced)', label: 'C1 (Advanced)' },
];

const LANGUAGES = [
  { code: 'fr', label: 'French' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  // Add more as needed
];

const NAV_HEIGHT = 88;

// Defensive text wrapper
const SafeText: React.FC<{children: any, style?: any}> = ({ children, style }) => {
  if (typeof children !== 'string') return null;
  return <Text style={style}>{children}</Text>;
};

const SettingsScreen: React.FC = () => {
  const { user, signInWithGoogle, signInGuest, signOut } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const { language, setLanguage } = useJournal();
  const [showProfModal, setShowProfModal] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        setLoading(true);
        const prof = await getProfile(user.id);
        setProfile(prof);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user?.id]);

  const handleSave = async (field: keyof ProfileData, value: string) => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = { ...profile, [field]: value };
      await saveProfile(updated);
      setProfile(updated);
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { minHeight: '100%' }]} contentContainerStyle={{ paddingBottom: NAV_HEIGHT + 24 }}>
      <Text style={styles.header}>Account</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication</Text>
        {user ? (
          <View style={{ marginBottom: 16 }}>
            <SafeText style={styles.userEmail}>{user.email || 'Guest User'}</SafeText>
            <SafeText style={styles.userStatus}>{user.email ? 'Signed in' : 'Guest account'}</SafeText>
            <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginBottom: 16 }}>
            <SafeText style={styles.userStatus}>{'Sign in to sync your saved phrases across devices'}</SafeText>
            <TouchableOpacity style={styles.signInBtn} onPress={signInWithGoogle}>
              <Text style={styles.signInText}>Sign in with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.guestBtn} onPress={signInGuest}>
              <Text style={styles.guestText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Clear Conversation</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={() => {}}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        {loading ? (
          <ActivityIndicator color="#7A54FF" />
        ) : profile ? (
          <>
            <Text style={styles.prefLabel}>Preferred Language</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowLangModal(true)}>
              <SafeText style={styles.dropdownText}>{LANGUAGES.find(l => l.code === language)?.label || 'Select language…'}</SafeText>
            </TouchableOpacity>
            <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
              <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowLangModal(false)} />
              <View style={styles.modalSheet}>
                <FlatList
                  data={LANGUAGES}
                  keyExtractor={item => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={async () => {
                        setLanguage(item.code);
                        setShowLangModal(false);
                        if (profile && profile.id) {
                          await handleSave('language', item.code);
                        }
                      }}
                    >
                      <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Modal>
            <Text style={styles.prefLabel}>Proficiency</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => setShowProfModal(true)}>
              <SafeText style={styles.dropdownText}>{PROFICIENCY_LEVELS.find(l => l.value === profile.proficiency)?.label || 'Select proficiency…'}</SafeText>
            </TouchableOpacity>
            <Modal visible={showProfModal} transparent animationType="slide" onRequestClose={() => setShowProfModal(false)}>
              <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowProfModal(false)} />
              <View style={styles.modalSheet}>
                <FlatList
                  data={PROFICIENCY_LEVELS}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => { handleSave('proficiency', item.value); setShowProfModal(false); }}
                    >
                      <Text style={styles.modalOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </Modal>
            {saving && <Text style={styles.savingText}>Saving…</Text>}
          </>
        ) : (
          <Text style={styles.userStatus}>Sign in to set preferences.</Text>
        )}
      </View>
      <BottomNav />
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: '#181818',
  },
  section: {
    backgroundColor: '#fafaff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: '#7A54FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 12,
    color: '#7A54FF',
  },
  userEmail: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'AlbertSans_700Bold',
    marginBottom: 2,
  },
  userStatus: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'AlbertSans_400Regular',
  },
  signOutBtn: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'AlbertSans_700Bold',
  },
  signInBtn: {
    backgroundColor: '#7A54FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  signInText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'AlbertSans_700Bold',
  },
  guestBtn: {
    backgroundColor: '#f3f0ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  guestText: {
    color: '#7A54FF',
    fontWeight: '600',
    fontFamily: 'AlbertSans_700Bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'AlbertSans_700Bold',
  },
  settingValue: {
    color: '#888',
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
  },
  clearBtn: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  clearText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'AlbertSans_700Bold',
  },
  prefLabel: {
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'AlbertSans_700Bold',
    marginTop: 18,
    marginBottom: 6,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'AlbertSans_400Regular',
    marginBottom: 8,
  },
  savingText: {
    color: '#7A54FF',
    fontWeight: '600',
    fontFamily: 'AlbertSans_700Bold',
    marginTop: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ececec',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: '#181818',
    fontFamily: 'AlbertSans_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  modalSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#181818',
    fontFamily: 'AlbertSans_400Regular',
  },
}); 