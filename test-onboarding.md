# 🧪 Onboarding Flow Testing Guide

## Prerequisites
- ✅ Supabase project configured
- ✅ Environment variables set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- ✅ Database migrations run
- ✅ Development server running (`npm run dev`)

## Test 1: New User Sign-up Flow

### Step 1: Clear Browser Data
```bash
# Open browser dev tools (F12)
# Go to Application tab → Storage → Clear storage
# Or manually clear:
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Start Fresh
1. Navigate to `http://localhost:5173`
2. Verify SplashPage loads correctly
3. Check that "Continue with Google" button is visible

### Step 3: Google OAuth
1. Click "Continue with Google"
2. Complete Google sign-in with a **new account** (not used before)
3. Verify redirect to `/onboard/name`

### Step 4: Complete Onboarding
1. **Name Entry** (`/onboard/name`)
   - Enter name: "Test User"
   - Click "Continue"
   - Verify state passed to next step

2. **Language Selection** (`/onboard/language`)
   - Select a language (e.g., "French 🇫🇷")
   - Click "Continue"
   - Verify state includes: `{name: "Test User", language: "French"}`

3. **Proficiency Level** (`/onboard/proficiency`)
   - Select proficiency: "B1 (Intermediate)"
   - Click "Continue"
   - Verify state includes: `{name: "Test User", language: "French", proficiency: "B1"}`

4. **Motivation** (`/onboard/motivation`)
   - Select motivation: "Travel"
   - Click "Complete"
   - Verify loading state during save

### Step 5: Verify Database Creation
1. Check Supabase Dashboard → Table Editor → `profiles`
2. Verify new record created with:
   ```json
   {
     "id": "user-uuid",
     "name": "Test User",
     "language": "French",
     "proficiency": "B1",
     "motivation": "travel",
     "created_at": "2024-01-XX...",
     "updated_at": "2024-01-XX..."
   }
   ```

### Step 6: Verify Redirect
1. Should redirect to `/journal`
2. Verify JournalPage loads correctly
3. Check that user is authenticated

## Test 2: Returning User Flow

### Step 1: Sign Out
1. Go to Settings page
2. Click "Sign Out"
3. Verify redirect to SplashPage

### Step 2: Sign In Again
1. Click "Continue with Google"
2. Use the same Google account
3. Verify **skip onboarding** (direct to `/journal`)

### Step 3: Verify Profile Persistence
1. Check that profile data is loaded correctly
2. Verify language preference is applied
3. Check Settings page shows correct data

## Test 3: Database Schema Validation

### Step 1: Verify Tables Exist
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'languages', 'journal_entries', 'saved_phrases');
```

### Step 2: Verify RLS Policies
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'languages', 'journal_entries', 'saved_phrases');

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('profiles', 'languages', 'journal_entries', 'saved_phrases');
```

### Step 3: Test Data Operations
```sql
-- Test profile insertion (replace with actual user ID)
INSERT INTO profiles (id, name, language, proficiency, motivation) 
VALUES ('test-user-id', 'Test User', 'French', 'B1', 'travel');

-- Test profile retrieval
SELECT * FROM profiles WHERE id = 'test-user-id';

-- Test profile update
UPDATE profiles 
SET language = 'Spanish' 
WHERE id = 'test-user-id';

-- Clean up test data
DELETE FROM profiles WHERE id = 'test-user-id';
```

## Test 4: Error Handling

### Step 1: Test Missing Database Tables
1. Temporarily rename `profiles` table
2. Try onboarding flow
3. Verify localStorage fallback works
4. Restore table name

### Step 2: Test Network Errors
1. Disconnect internet
2. Try to save profile
3. Verify error handling
4. Reconnect and retry

## Expected Results

### ✅ Success Criteria
- [ ] New users complete onboarding successfully
- [ ] Profile data saved to Supabase
- [ ] Returning users skip onboarding
- [ ] RLS policies prevent unauthorized access
- [ ] Error handling works gracefully
- [ ] localStorage fallback works when needed

### ❌ Common Issues to Watch For
- [ ] OAuth redirect loops
- [ ] Missing environment variables
- [ ] Database permission errors
- [ ] State loss between onboarding steps
- [ ] Incorrect redirect logic

## Debugging Tips

### Check Browser Console
```javascript
// Check authentication state
console.log('User:', window.supabase?.auth?.user());

// Check profile data
console.log('Profile:', localStorage.getItem('lexi-profile'));

// Check Supabase connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

### Check Network Tab
- Monitor OAuth redirects
- Check API calls to Supabase
- Verify request/response data

### Check Supabase Logs
- Go to Supabase Dashboard → Logs
- Check for authentication events
- Monitor database operations

## Manual Testing Checklist

- [ ] **SplashPage**: Loads correctly, Google button works
- [ ] **OAuth Flow**: Redirects properly, handles errors
- [ ] **Name Entry**: Validates input, passes state
- [ ] **Language Selection**: Loads languages, selection works
- [ ] **Proficiency**: All levels selectable, state preserved
- [ ] **Motivation**: All options work, saves to database
- [ ] **Profile Creation**: Data saved correctly in Supabase
- [ ] **Redirect Logic**: New users → onboarding, returning → journal
- [ ] **Error Handling**: Graceful fallbacks, user feedback
- [ ] **Data Persistence**: Profile survives sign out/in

## Performance Notes

- Onboarding should complete within 30 seconds
- Database operations should be < 2 seconds
- OAuth flow should be < 10 seconds
- Page transitions should be smooth (< 500ms)

---

**Ready to test? Start with Test 1 and work through each scenario systematically!** 🚀 