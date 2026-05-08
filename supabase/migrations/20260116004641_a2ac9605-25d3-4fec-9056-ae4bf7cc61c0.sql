-- Add button customization columns to links table
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS button_bg_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS button_text_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS button_border_radius TEXT DEFAULT 'rounded-xl';