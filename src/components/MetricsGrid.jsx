import React from 'react';
import fireIcon from '../assets/icons/fire.svg';
import penIcon from '../assets/icons/pen.svg';
import bookmarkIcon from '../assets/icons/bookmark.svg';

export default function MetricsGrid({ 
  currentStreak, 
  longestStreak, 
  wordsWritten, 
  savedWords 
}) {
  const metrics = [
    {
      title: 'CURRENT STREAK',
      value: currentStreak,
      icon: fireIcon
    },
    {
      title: 'LONGEST STREAK',
      value: longestStreak,
      icon: fireIcon
    },
    {
      title: 'WORDS WRITTEN',
      value: wordsWritten,
      icon: penIcon
    },
    {
      title: 'SAVED WORDS',
      value: savedWords,
      icon: bookmarkIcon
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px'
    }}>
      {metrics.map((metric, index) => (
        <div
          key={index}
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(122,84,255,0.08)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {/* Title */}
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#6B6B6B',
            fontFamily: 'Albert Sans, sans-serif',
            marginBottom: '8px',
            letterSpacing: '0.5px'
          }}>
            {metric.title}
          </div>
          
          {/* Value - Center aligned */}
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#181818',
            fontFamily: 'Albert Sans, sans-serif',
            marginBottom: '8px'
          }}>
            {metric.value}
          </div>
          
          {/* Icon - Absolutely positioned bottom right */}
          <img
            src={metric.icon}
            alt={metric.title}
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '40px',
              height: '40px',
              color: '#EBE5F6',
              filter: 'brightness(0) saturate(100%) invert(92%) sepia(8%) saturate(103%) hue-rotate(240deg) brightness(96%) contrast(94%)'
            }}
          />
        </div>
      ))}
    </div>
  );
} 