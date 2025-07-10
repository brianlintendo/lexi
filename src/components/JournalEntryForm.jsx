import React from 'react';

function JournalEntryForm({ entry, setEntry, onSend, loading }) {
  return (
    <div style={{
      marginBottom: '2rem'
    }}>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write your journal entry here... Share your thoughts, practice your language, or ask Lexi anything!"
        rows={6}
        style={{
          width: '100%',
          padding: '1rem',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          fontSize: '1rem',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '120px'
        }}
      />
      <button 
        onClick={onSend} 
        disabled={loading || !entry.trim()} 
        style={{
          marginTop: '1rem',
          padding: '0.75rem 2rem',
          backgroundColor: loading || !entry.trim() ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: loading || !entry.trim() ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        {loading ? 'Sending to Lexi...' : 'Send to Lexi'}
      </button>
    </div>
  );
}

export default JournalEntryForm; 