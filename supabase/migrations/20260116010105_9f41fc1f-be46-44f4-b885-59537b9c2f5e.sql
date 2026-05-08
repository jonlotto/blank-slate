-- Add banner position column to profiles
ALTER TABLE public.profiles 
ADD COLUMN banner_position TEXT DEFAULT 'center';