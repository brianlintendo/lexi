-- =====================================================
-- Migration 007: Add submitted field to journal_entries
-- Adds submitted field to track completion status
-- =====================================================

-- Add submitted column to journal_entries table
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS submitted BOOLEAN DEFAULT FALSE;

-- Update existing entries to set submitted = true if they have ai_reply
UPDATE journal_entries 
SET submitted = TRUE 
WHERE ai_reply IS NOT NULL AND ai_reply != '';

-- Create index for submitted field for better query performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_submitted ON journal_entries(submitted); 