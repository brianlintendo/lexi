-- =====================================================
-- Migration 006: Journal Entries Unique Constraint
-- Adds unique constraint for user_id and entry_date to support upsert operations
-- =====================================================

-- Add unique constraint for user_id and entry_date
-- This ensures one entry per user per date, enabling upsert operations
ALTER TABLE journal_entries 
ADD CONSTRAINT unique_user_entry_date 
UNIQUE (user_id, entry_date);

-- Create index for the unique constraint (if not already exists)
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date_unique 
ON journal_entries(user_id, entry_date); 