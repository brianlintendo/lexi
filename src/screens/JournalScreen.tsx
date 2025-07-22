import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';

// Placeholder for flag icon
const flagIcon = 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg';

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const weekDates = [7, 8, 9, 10, 11, 12, 13, 14]; // Example week

const JournalScreen: React.FC = () => {
  return (
    <LinearGradient colors={["#F8F5FF", "#ECE6FF"]} style={styles.gradient}>
      <View style={styles.container}>
        {/* Week Header */}
        <View style={styles.weekHeader}>
          {weekdays.map((day, i) => (
            <View key={day} style={styles.weekdayCol}>
              <Text style={[styles.weekday, i === 1 && styles.activeWeekday]}>{day}</Text>
              <Text style={[styles.dateNum, i === 1 && styles.activeDateNum]}> {weekDates[i+1] || ''} </Text>
            </View>
          ))}
          <Image source={{ uri: flagIcon }} style={styles.flag} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#B0AFC6" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for notes"
            placeholderTextColor="#B0AFC6"
          />
        </View>

        {/* Date Heading */}
        <Text style={styles.dateHeading}>Tuesday, July 8</Text>

        {/* Prompt Bubble */}
        <View style={styles.promptBubble}>
          <Text style={styles.promptText}>
            Bonjour ! Prêt(e) à écrire en français ? 😊{"\n"}
            Comment tu te sens aujourd’hui ?
          </Text>
        </View>

        {/* Journal Input */}
        <Text style={styles.journalInputPlaceholder}>Je me sens…</Text>

        {/* Bottom Nav */}
        <View style={styles.bottomNavWrapper}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
              <Feather name="mic" size={28} color="#7A54FF" />
              <Text style={styles.navLabel}>Speak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton}>
              <Ionicons name="arrow-up" size={32} color="#fff" />
              <Text style={styles.sendLabel}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Feather name="image" size={28} color="#7A54FF" />
              <Text style={styles.navLabel}>Image</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem}>
              <Feather name="edit-3" size={22} color="#7A54FF" />
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>Journal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Feather name="star" size={22} color="#B0AFC6" />
              <Text style={styles.tabLabel}>Saved</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tabItem}>
              <Feather name="user" size={22} color="#B0AFC6" />
              <Text style={styles.tabLabel}>Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default JournalScreen;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 36,
    paddingHorizontal: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekdayCol: {
    alignItems: 'center',
    marginRight: 12,
  },
  weekday: {
    fontSize: 14,
    color: '#B0AFC6',
    fontFamily: 'Albert Sans',
  },
  activeWeekday: {
    color: '#7A54FF',
    fontWeight: 'bold',
  },
  dateNum: {
    fontSize: 16,
    color: '#B0AFC6',
    fontWeight: 'bold',
  },
  activeDateNum: {
    color: '#7A54FF',
  },
  flag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 'auto',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 44,
    marginBottom: 18,
    shadowColor: '#B0AFC6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    fontFamily: 'Albert Sans',
  },
  dateHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    fontFamily: 'Albert Sans',
  },
  promptBubble: {
    borderWidth: 1,
    borderColor: '#7A54FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  promptText: {
    fontSize: 18,
    color: '#7A54FF',
    fontFamily: 'Albert Sans',
  },
  journalInputPlaceholder: {
    fontSize: 18,
    color: '#B0AFC6',
    marginBottom: 24,
    fontFamily: 'Albert Sans',
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 16,
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: 14,
    color: '#7A54FF',
    marginTop: 4,
    fontFamily: 'Albert Sans',
  },
  sendButton: {
    backgroundColor: '#7A54FF',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    shadowColor: '#7A54FF',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  sendLabel: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Albert Sans',
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 8,
    width: '92%',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#B0AFC6',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 14,
    color: '#B0AFC6',
    marginTop: 2,
    fontFamily: 'Albert Sans',
  },
  tabLabelActive: {
    color: '#7A54FF',
    fontWeight: 'bold',
  },
}); 