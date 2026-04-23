ALTER TABLE public.landing_config
ADD COLUMN IF NOT EXISTS master_price_cents integer NOT NULL DEFAULT 3090;

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS bot_banner_url text;