-- Add global customization columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN global_button_bg_color TEXT DEFAULT NULL,
ADD COLUMN global_button_text_color TEXT DEFAULT NULL,
ADD COLUMN global_background_color TEXT DEFAULT NULL;