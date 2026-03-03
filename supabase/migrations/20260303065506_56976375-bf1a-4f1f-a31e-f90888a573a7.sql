
-- Add optional product_id to coupons (null = applies to all products)
ALTER TABLE public.coupons
ADD COLUMN product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX idx_coupons_product_id ON public.coupons(product_id);
