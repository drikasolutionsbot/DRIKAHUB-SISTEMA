ALTER TABLE public.landing_config
  ADD COLUMN IF NOT EXISTS abacatepay_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS abacatepay_api_key text,
  ADD COLUMN IF NOT EXISTS abacatepay_webhook_secret text;