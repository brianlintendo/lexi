-- =====================================================
-- Migration 005: Permissions & Cleanup
-- Grants necessary permissions and finalizes the schema
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create function to handle new user signup (optional)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to set up default data for new users
  -- For now, we'll just return the new user
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user signup (optional - uncomment if needed)
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Migration Complete
-- ===================================================== 