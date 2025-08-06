import React from 'react';

export default function MonthPicker({ 
  year, 
  month, 
  entriesByDate, 
  onPrevMonth, 
  onNextMonth, 
  onDateClick 
}) {
  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  
  // Get the first day of the month and the number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  // Adjust to make Monday = 0
  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  // Get the last day of the previous month
  const lastDayPrevMonth = new Date(year, month, 0);
  const daysInPrevMonth = lastDayPrevMonth.getDate();
  
  // Get today's date for comparison
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();
  
  // Generate calendar grid
  const calendarDays = [];
  
  // Add days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      hasEntry: false
    });
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().slice(0, 10);
    calendarDays.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isCurrentMonth && day === todayDate,
      hasEntry: entriesByDate.has(dateKey)
    });
  }
  
  // Add days from next month to fill the grid (6 rows * 7 columns = 42 total)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    calendarDays.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: false,
      hasEntry: false
    });
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      {/* Header with month/year and navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: '#181818',
          fontFamily: 'Albert Sans, sans-serif'
        }}>
          {monthNames[month]} {year}
        </h2>
        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          <button
            onClick={onPrevMonth}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#181818',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ‹
          </button>
          <button
            onClick={onNextMonth}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#181818',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Day of week headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        {weekdays.map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              color: '#6B6B6B',
              fontFamily: 'Albert Sans, sans-serif',
              padding: '8px 0'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px'
      }}>
        {calendarDays.map((dayData, index) => {
          const { date, day, isCurrentMonth, isToday, hasEntry } = dayData;
          
          // Debug logging for entries
          if (hasEntry) {
            console.log(`📅 MonthPicker: Date ${date.toISOString().slice(0, 10)} has entry`);
          }
          
          let backgroundColor = 'transparent';
          let borderColor = 'transparent';
          let borderWidth = '2px';
          let textColor = '#6B6B6B';
          let fontWeight = '400';
          
          if (hasEntry) {
            backgroundColor = '#7A54FF';
            textColor = '#fff';
            fontWeight = '600';
          } else if (isToday) {
            borderColor = '#7A54FF';
            textColor = '#181818';
            fontWeight = '600';
          } else if (isCurrentMonth) {
            borderColor = '#E4DDFF';
            textColor = '#181818';
          }
          
          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              style={{
                background: backgroundColor,
                border: `${borderWidth} solid ${borderColor}`,
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: fontWeight,
                color: textColor,
                fontFamily: 'Albert Sans, sans-serif',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!hasEntry && isCurrentMonth) {
                  e.target.style.backgroundColor = '#F5F3FF';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasEntry) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
} 