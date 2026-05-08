-- Add thumbnail_url column to links table for custom button images
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS thumbnail_url text;