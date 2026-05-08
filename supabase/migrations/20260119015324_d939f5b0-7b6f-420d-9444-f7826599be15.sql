-- Add handle column for display @ (separate from username used in URL)
ALTER TABLE profiles ADD COLUMN handle text;

-- Backfill existing usernames as handles
UPDATE profiles SET handle = username;