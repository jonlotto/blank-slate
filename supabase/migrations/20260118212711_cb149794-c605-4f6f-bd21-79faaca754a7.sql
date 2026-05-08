-- Add global background image field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS global_background_image text;