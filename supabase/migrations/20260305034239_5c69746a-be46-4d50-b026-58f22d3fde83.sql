ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS verify_channel_id text,
  ADD COLUMN IF NOT EXISTS verify_title text DEFAULT '👑 Verificação',
  ADD COLUMN IF NOT EXISTS verify_description text DEFAULT 'Clique no botão abaixo para se verificar em nosso servidor.',
  ADD COLUMN IF NOT EXISTS verify_button_label text DEFAULT 'Verificar',
  ADD COLUMN IF NOT EXISTS verify_embed_color text DEFAULT '#5865F2',
  ADD COLUMN IF NOT EXISTS verify_image_url text;