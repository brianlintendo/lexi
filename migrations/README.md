# Lexi Database Migrations

This directory contains the database migrations for the Lexi language learning app. Each migration is designed to be run in sequence to build up the complete database schema.

## Migration Structure

### 001_initial_schema.sql
- Creates the `profiles` table for user onboarding data
- Sets up Row Level Security (RLS) policies
- Creates the `update_updated_at_column()` function and trigger

### 002_languages.sql
- Creates the `languages` table for supported languages
- Populates with 25+ default languages with emojis
- Uses `ON CONFLICT DO NOTHING` to handle re-runs safely

### 003_journal_entries.sql
- Creates the `journal_entries` table for user journaling
- Sets up indexes for performance
- Configures RLS policies for data security

### 004_saved_phrases.sql
- Creates the `saved_phrases` table for vocabulary learning
- Sets up indexes and RLS policies
- Handles phrase translations

### 005_permissions.sql
- Grants necessary permissions to authenticated users
- Creates optional user signup handler function
- Finalizes the schema setup

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order (001 → 002 → 003 → 004 → 005)
4. Each migration is idempotent and can be safely re-run

### Option 2: Supabase CLI (Advanced)
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

## Migration Benefits

### ✅ **Modularity**
- Each migration focuses on one feature area
- Easy to understand and maintain
- Can be run independently if needed

### ✅ **Version Control**
- Track database changes over time
- Easy rollback if needed
- Clear history of schema evolution

### ✅ **Team Collaboration**
- Multiple developers can work on different features
- Clear separation of concerns
- Reduced merge conflicts

### ✅ **Production Safety**
- Each migration is idempotent
- Safe to re-run if interrupted
- Clear rollback paths

## Schema Overview

```
profiles (user onboarding)
├── id (UUID, PK)
├── name (TEXT)
├── language (TEXT)
├── proficiency (TEXT)
├── motivation (TEXT)
└── timestamps

languages (supported languages)
├── code (VARCHAR(10), PK)
├── label (TEXT)
├── emoji (TEXT)
├── enabled (BOOLEAN)
└── timestamps

journal_entries (user journaling)
├── id (UUID, PK)
├── user_id (UUID, FK)
├── entry_text (TEXT)
├── ai_reply (TEXT)
├── entry_date (DATE)
└── timestamps

saved_phrases (vocabulary)
├── id (UUID, PK)
├── user_id (UUID, FK)
├── phrase (TEXT)
├── translation (TEXT)
└── timestamps
```

## Security Features

- **Row Level Security (RLS)** enabled on all user tables
- **User isolation** - users can only access their own data
- **Cascade deletes** - user data is cleaned up when accounts are deleted
- **Proper indexing** for performance
- **Automatic timestamps** for audit trails

## Next Steps

After running these migrations:
1. Test the onboarding flow
2. Verify user data persistence
3. Check that returning users skip onboarding
4. Test journal entry creation and retrieval
5. Verify saved phrases functionality 