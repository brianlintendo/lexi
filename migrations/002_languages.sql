-- =====================================================
-- Migration 002: Languages
-- Creates languages table and populates with supported languages
-- =====================================================

-- Create languages table for supported languages
CREATE TABLE IF NOT EXISTS languages (
  code VARCHAR(10) PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default languages
INSERT INTO languages (code, label, emoji, enabled) VALUES
  ('fr', 'French', '🇫🇷', true),
  ('es', 'Spanish', '🇪🇸', true),
  ('de', 'German', '🇩🇪', true),
  ('it', 'Italian', '🇮🇹', true),
  ('pt', 'Portuguese', '🇵🇹', true),
  ('ja', 'Japanese', '🇯🇵', true),
  ('ko', 'Korean', '🇰🇷', true),
  ('zh', 'Chinese', '🇨🇳', true),
  ('ru', 'Russian', '🇷🇺', true),
  ('ar', 'Arabic', '🇸🇦', true),
  ('hi', 'Hindi', '🇮🇳', true),
  ('nl', 'Dutch', '🇳🇱', true),
  ('sv', 'Swedish', '🇸🇪', true),
  ('no', 'Norwegian', '🇳🇴', true),
  ('da', 'Danish', '🇩🇰', true),
  ('fi', 'Finnish', '🇫🇮', true),
  ('pl', 'Polish', '🇵🇱', true),
  ('tr', 'Turkish', '🇹🇷', true),
  ('he', 'Hebrew', '🇮🇱', true),
  ('th', 'Thai', '🇹🇭', true),
  ('vi', 'Vietnamese', '🇻🇳', true),
  ('id', 'Indonesian', '🇮🇩', true),
  ('ms', 'Malay', '🇲🇾', true),
  ('en', 'English', '🇺🇸', true)
ON CONFLICT (code) DO NOTHING; 