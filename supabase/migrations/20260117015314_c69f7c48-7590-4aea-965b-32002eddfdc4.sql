-- Add typography customization columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS title_font TEXT DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS title_color TEXT,
ADD COLUMN IF NOT EXISTS title_size TEXT DEFAULT 'large';