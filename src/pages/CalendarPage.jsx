import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useAuth';
import { fetchEntries } from '../api/journal';
import { fetchSavedPhrases } from '../api/savedPhrases';
import MonthPicker from '../components/MonthPicker';
import MetricsGrid from '../components/MetricsGrid';
import BottomNav from '../components/BottomNav';
import TopNavHeader from '../components/TopNavHeader';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [displayDate, setDisplayDate] = useState(new Date());
  const [entriesByDate, setEntriesByDate] = useState(new Set());
  const [metrics, setMetrics] = useState({
    currentStreak: 0,
    longestStreak: 0,
    wordsWritten: 0,
    savedWords: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch entries and calculate metrics
  useEffect(() => {
    console.log('🔄 CalendarPage: useEffect triggered, user?.id:', user?.id);
    
    if (user?.id) {
      setLoading(true);
      console.log('📊 CalendarPage: Starting to fetch data for user:', user.id);
      
      // Fetch both journal entries and saved phrases
      Promise.all([
        fetchEntries(user.id),
        fetchSavedPhrases(user.id)
      ])
        .then(([entriesResult, savedPhrases]) => {
          const { data: entries, error: entriesError } = entriesResult;
          
          console.log('📝 CalendarPage: Fetched entries:', entries?.length || 0);
          console.log('💾 CalendarPage: Fetched saved phrases:', savedPhrases?.length || 0);
          
          if (entriesError) {
            console.error('❌ CalendarPage: Error fetching entries:', entriesError);
            return;
          }
          
          // Process entries to get dates and calculate metrics
          const dates = new Set();
          let totalWords = 0;
          const entryDates = [];
          
          console.log('🔍 CalendarPage: Processing entries...');
          
          entries?.forEach((entry, index) => {
            const dateKey = entry.entry_date || new Date(entry.created_at).toISOString().slice(0, 10);
            const isActiveEntry = entry.submitted || entry.ai_reply;
            
            console.log(`📅 Entry ${index + 1}:`, {
              dateKey,
              submitted: entry.submitted,
              hasAiReply: !!entry.ai_reply,
              isActiveEntry,
              wordCount: entry.entry_text ? entry.entry_text.split(/\s+/).filter(Boolean).length : 0
            });
            
            if (isActiveEntry) {
              dates.add(dateKey);
              entryDates.push(dateKey);
            }
            
            // Count words in entry text (only for submitted entries)
            if (entry.entry_text && isActiveEntry) {
              const wordCount = entry.entry_text.split(/\s+/).filter(Boolean).length;
              totalWords += wordCount;
              console.log(`📊 Added ${wordCount} words from entry ${index + 1} (${dateKey})`);
            }
          });
          
          console.log('📈 CalendarPage: Final calculations:');
          console.log('- Active dates:', Array.from(dates));
          console.log('- Total words written:', totalWords);
          console.log('- Saved phrases count:', savedPhrases?.length || 0);
          
          setEntriesByDate(dates);
          
          // Calculate streaks
          const sortedDates = entryDates.sort();
          console.log('- Sorted entry dates for streak calculation:', sortedDates);
          
          const { currentStreak, longestStreak } = calculateStreaks(sortedDates);
          
          console.log('🏆 CalendarPage: Streak calculations:');
          console.log('- Current streak:', currentStreak);
          console.log('- Longest streak:', longestStreak);
          
          const finalMetrics = {
            currentStreak,
            longestStreak,
            wordsWritten: totalWords,
            savedWords: savedPhrases?.length || 0
          };
          
          console.log('📊 CalendarPage: Setting final metrics:', finalMetrics);
          setMetrics(finalMetrics);
        })
        .catch(err => {
          console.error('❌ CalendarPage: Error fetching data:', err);
        })
        .finally(() => {
          console.log('✅ CalendarPage: Data fetching completed');
          setLoading(false);
        });
    } else {
      console.log('⚠️ CalendarPage: No user ID available');
      setLoading(false);
    }
  }, [user?.id]);

  const calculateStreaks = (sortedDates) => {
    console.log('🏃‍♂️ calculateStreaks called with dates:', sortedDates);
    
    if (sortedDates.length === 0) {
      console.log('🏃‍♂️ No dates provided, returning 0 streaks');
      return { currentStreak: 0, longestStreak: 0 };
    }
    
    let longestStreak = 0;
    let tempStreak = 1;
    
    console.log('🏃‍♂️ Calculating longest streak...');
    
    // Calculate longest streak
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      console.log(`🏃‍♂️ Comparing ${sortedDates[i-1]} and ${sortedDates[i]}, diff: ${diffDays} days`);
      
      if (diffDays === 1) {
        tempStreak++;
        console.log(`🏃‍♂️ Consecutive! Temp streak now: ${tempStreak}`);
      } else {
        console.log(`🏃‍♂️ Gap found! Finalizing temp streak: ${tempStreak}, longest so far: ${longestStreak}`);
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    console.log(`🏃‍♂️ Final longest streak: ${longestStreak}`);
    
    // Calculate current streak (consecutive days from today backwards)
    let currentStreak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const todayDate = new Date();
    
    console.log(`🏃‍♂️ Calculating current streak from today: ${today}`);
    
    // Check if today has an entry
    if (sortedDates.includes(today)) {
      currentStreak = 1;
      console.log(`🏃‍♂️ Today has entry! Starting current streak at 1`);
      
      // Count backwards from yesterday
      let checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - 1);
      
      while (sortedDates.includes(checkDate.toISOString().slice(0, 10))) {
        currentStreak++;
        console.log(`🏃‍♂️ ${checkDate.toISOString().slice(0, 10)} has entry! Current streak: ${currentStreak}`);
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else {
      console.log(`🏃‍♂️ Today doesn't have entry, checking from yesterday`);
      // If today doesn't have an entry, check from yesterday
      let checkDate = new Date(todayDate);
      checkDate.setDate(checkDate.getDate() - 1);
      
      while (sortedDates.includes(checkDate.toISOString().slice(0, 10))) {
        currentStreak++;
        console.log(`🏃‍♂️ ${checkDate.toISOString().slice(0, 10)} has entry! Current streak: ${currentStreak}`);
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
    
    console.log(`🏃‍♂️ Final current streak: ${currentStreak}`);
    console.log(`🏃‍♂️ Returning streaks - current: ${currentStreak}, longest: ${longestStreak}`);
    
    return { currentStreak, longestStreak };
  };

  const handlePrevMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const handleDateClick = (date) => {
    // Navigate to JournalPage with the selected date
    navigate('/journal', { 
      state: { 
        selectedDate: date.toISOString().slice(0, 10) 
      } 
    });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafaff', display: 'flex', flexDirection: 'column' }}>
        <TopNavHeader title="Calendar" onBack={() => navigate(-1)} />
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#7A54FF',
          fontSize: '16px'
        }}>
          Loading calendar...
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#fafaff', display: 'flex', flexDirection: 'column' }}>
      <TopNavHeader title="Calendar" onBack={() => navigate(-1)} />
      
      {/* Sign-in message */}
      {!user?.id && (
        <div style={{
          background: '#f5f5f5',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6B6B6B',
          fontFamily: 'Albert Sans, sans-serif',
          fontWeight: '500'
        }}>
          Please sign in to access saved info.
        </div>
      )}
      
      {/* Main Panel */}
      <div style={{
        flex: 1,
        padding: '24px 16px 120px 16px'
      }}>
        {/* Month Picker Card */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(122,84,255,0.08)'
        }}>
          <MonthPicker
            year={displayDate.getFullYear()}
            month={displayDate.getMonth()}
            entriesByDate={entriesByDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Metrics Grid */}
        <MetricsGrid
          currentStreak={metrics.currentStreak}
          longestStreak={metrics.longestStreak}
          wordsWritten={metrics.wordsWritten}
          savedWords={metrics.savedWords}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
} 