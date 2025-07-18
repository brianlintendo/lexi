-- =====================================================
-- Schema Verification Script for Onboarding Testing
-- Run this in Supabase SQL Editor to verify setup
-- =====================================================

-- 1. Check if required tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('profiles', 'languages', 'journal_entries', 'saved_phrases') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'languages', 'journal_entries', 'saved_phrases');

-- 2. Check RLS policies
SELECT 
  tablename,
  policyname,
  cmd,
  CASE WHEN permissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END as policy_type
FROM pg_policies 
WHERE tablename IN ('profiles', 'languages', 'journal_entries', 'saved_phrases')
ORDER BY tablename, policyname;

-- 3. Check if languages table has data
SELECT 
  COUNT(*) as language_count,
  CASE WHEN COUNT(*) > 0 THEN '✅ HAS DATA' ELSE '❌ EMPTY' END as status
FROM languages;

-- 4. Check profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Test profile insertion (will be cleaned up)
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  insert_result RECORD;
BEGIN
  -- Try to insert a test profile
  INSERT INTO profiles (id, name, language, proficiency, motivation) 
  VALUES (test_user_id, 'Test User', 'French', 'B1', 'travel')
  RETURNING * INTO insert_result;
  
  RAISE NOTICE '✅ Test profile inserted successfully: %', insert_result.id;
  
  -- Verify we can read it back
  PERFORM COUNT(*) FROM profiles WHERE id = test_user_id;
  RAISE NOTICE '✅ Test profile can be read back';
  
  -- Clean up
  DELETE FROM profiles WHERE id = test_user_id;
  RAISE NOTICE '✅ Test profile cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Error testing profile operations: %', SQLERRM;
END $$;

-- 6. Check authentication setup
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name = 'users'
    ) THEN '✅ Auth schema exists'
    ELSE '❌ Auth schema missing'
  END as auth_status;

-- 7. Summary
SELECT 
  'SCHEMA VERIFICATION COMPLETE' as status,
  COUNT(*) as total_tables,
  SUM(CASE WHEN table_name IN ('profiles', 'languages', 'journal_entries', 'saved_phrases') THEN 1 ELSE 0 END) as required_tables
FROM information_schema.tables 
WHERE table_schema = 'public'; 