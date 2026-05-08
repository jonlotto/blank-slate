-- Add columns to store original banner and crop offset
ALTER TABLE public.profiles 
ADD COLUMN banner_original_url TEXT DEFAULT NULL,
ADD COLUMN banner_crop_offset_y NUMERIC DEFAULT 0;