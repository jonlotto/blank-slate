-- Add global button style and border radius columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS global_button_style text DEFAULT 'filled',
ADD COLUMN IF NOT EXISTS global_button_border_radius text DEFAULT 'rounded-xl';