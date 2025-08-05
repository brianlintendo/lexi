import React from 'react';
import tickIcon from '../assets/icons/tick.svg';
import { getFlagCode } from '../utils/journalHelpers';

export default function JournalCalendar({ 
  weekDates, 
  weekdays, 
  selectedDate, 
  todayKey, 
  journalEntries, 
  onDateClick, 
  language, 
  onLanguageClick 
}) {
  const selectedKey = selectedDate.toISOString().slice(0, 10);
  
  return (
    <div className="journal-header-flex">
      <div className="weekdays-row-centered" style={{ display: 'flex', justifyContent: 'flex-start', gap: 20 }}>
        {weekDates.map((date, i) => {
          const key = date.toISOString().slice(0, 10);
          const isActive = key === selectedKey;
          const isToday = key === todayKey;
          const hasEntry = !!journalEntries[key];
          const hasSubmittedEntry = !!journalEntries[key] && (
            (typeof journalEntries[key] === 'object' && (journalEntries[key].ai_reply || journalEntries[key].submitted)) ||
            (typeof journalEntries[key] === 'string' && localStorage.getItem(`submitted-${key}`))
          );
          
          return (
            <div
              className={`weekday${isActive ? ' selected' : ''}${isToday ? ' today' : ''}`}
              key={key}
              onClick={() => onDateClick(date)}
              style={{ position: 'relative' }}
            >
              <div className="weekday-label">{weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
              <div className="weekday-date">
                {hasSubmittedEntry ? (
                  <img 
                    src={tickIcon} 
                    alt="Entry completed" 
                    style={{
                      width: '14px',
                      height: '14px',
                      filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(246deg) brightness(104%) contrast(97%)'
                    }}
                  />
                ) : (
                  date.getDate()
                )}
              </div>
              {isToday && !isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: -6,
                    transform: 'translateX(-50%)',
                    width: 6,
                    height: 6,
                    background: '#7A54FF',
                    borderRadius: '50%',
                    display: 'block',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <span
        className={`fi fi-${getFlagCode(language)}`}
        style={{ fontSize: 24, marginLeft: 16, cursor: 'pointer' }}
        aria-label="Language Flag"
        onClick={onLanguageClick}
      />
    </div>
  );
} 