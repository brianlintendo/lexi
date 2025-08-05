import { useState } from 'react';

const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  // Make Monday the first day of the week
  const diff = d.getDate() - ((day + 6) % 7);
  return new Date(d.setDate(diff));
}

function getWeekDates(date) {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDateHeading(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function useDateNavigation() {
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    // Try to restore the last selected date from localStorage
    const storedDate = localStorage.getItem('lexi-selected-date');
    if (storedDate) {
      try {
        const parsedDate = new Date(storedDate);
        // Only use stored date if it's valid and not too far in the past/future
        const now = new Date();
        const diffDays = Math.abs((parsedDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 365) { // Within a year
          return parsedDate;
        }
      } catch (error) {
        console.error('Error parsing stored date:', error);
      }
    }
    return today;
  });

  const weekDates = getWeekDates(selectedDate);
  const selectedKey = getDateKey(selectedDate);
  const todayKey = getDateKey(today);

  const selectDate = (date) => {
    setSelectedDate(date);
    localStorage.setItem('lexi-selected-date', date.toISOString());
  };

  return {
    today,
    selectedDate,
    selectedKey,
    todayKey,
    weekDates,
    weekdays,
    selectDate,
    formatDateHeading,
    getDateKey
  };
} 