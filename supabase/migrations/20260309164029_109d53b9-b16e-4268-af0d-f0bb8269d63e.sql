ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS discord_channel_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS closed_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone DEFAULT NULL;