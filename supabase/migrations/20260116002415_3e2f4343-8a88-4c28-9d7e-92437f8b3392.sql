-- Adicionar coluna template_slug na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS template_slug text DEFAULT 'starter';

-- Adicionar colunas extras na tabela links para tipo e estilo
ALTER TABLE public.links 
ADD COLUMN IF NOT EXISTS link_type text DEFAULT 'button',
ADD COLUMN IF NOT EXISTS style text DEFAULT 'filled';

-- Criar bucket para avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket de avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);