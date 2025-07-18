-- =====================================================
-- Lexi Language Learning App - Supabase Migration
-- =====================================================

-- Create saved_phrases table
CREATE TABLE IF NOT EXISTS saved_phrases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phrase TEXT NOT NULL,
  translation TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_phrases_user_id ON saved_phrases(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_phrases_created_at ON saved_phrases(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_phrases ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own saved phrases
CREATE POLICY "Users can view their own saved phrases" ON saved_phrases
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own saved phrases
CREATE POLICY "Users can insert their own saved phrases" ON saved_phrases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own saved phrases
CREATE POLICY "Users can update their own saved phrases" ON saved_phrases
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own saved phrases
CREATE POLICY "Users can delete their own saved phrases" ON saved_phrases
  FOR DELETE USING (auth.uid() = user_id);

-- Create profiles table for user onboarding data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL,
  motivation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Enable Row Level Security (RLS) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_text TEXT NOT NULL,
  ai_reply TEXT,
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for journal_entries table
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);

-- Enable Row Level Security (RLS) for journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own journal entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own journal entries
CREATE POLICY "Users can insert their own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own journal entries
CREATE POLICY "Users can update their own journal entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own journal entries
CREATE POLICY "Users can delete their own journal entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

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

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at for saved_phrases
CREATE TRIGGER update_saved_phrases_updated_at 
  BEFORE UPDATE ON saved_phrases 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for journal_entries
CREATE TRIGGER update_journal_entries_updated_at 
  BEFORE UPDATE ON journal_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to set up default data for new users
  -- For now, we'll just return the new user
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user signup (optional)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- Migration Complete
-- ===================================================== 