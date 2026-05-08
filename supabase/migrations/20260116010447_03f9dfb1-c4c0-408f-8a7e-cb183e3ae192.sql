-- Remove banner_position column as we're implementing crop instead
ALTER TABLE public.profiles DROP COLUMN IF EXISTS banner_position;