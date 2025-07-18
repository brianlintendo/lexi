-- =====================================================
-- Migration 004: Saved Phrases
-- Creates saved_phrases table for vocabulary learning functionality
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

-- Create trigger to automatically update updated_at for saved_phrases
CREATE TRIGGER update_saved_phrases_updated_at 
  BEFORE UPDATE ON saved_phrases 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 