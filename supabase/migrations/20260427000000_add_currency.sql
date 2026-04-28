ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL','USD','EUR'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency text;
COMMENT ON COLUMN public.products.currency IS 'Moeda do produto (BRL, USD, EUR). NULL = usa a moeda do tenant.';