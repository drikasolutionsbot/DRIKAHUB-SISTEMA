
CREATE TABLE public.landing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_servers integer NOT NULL DEFAULT 120,
  stat_servers_label text NOT NULL DEFAULT 'Servidores ativos',
  stat_sales integer NOT NULL DEFAULT 500,
  stat_sales_label text NOT NULL DEFAULT 'Vendas processadas',
  stat_products integer NOT NULL DEFAULT 1200,
  stat_products_label text NOT NULL DEFAULT 'Produtos entregues',
  video_url text,
  video_type text NOT NULL DEFAULT 'url',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.landing_config (id) VALUES (gen_random_uuid());

-- RLS
ALTER TABLE public.landing_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public landing page)
CREATE POLICY "Anyone can view landing config"
  ON public.landing_config FOR SELECT
  USING (true);

-- Only super admins can manage
CREATE POLICY "Super admins can manage landing config"
  ON public.landing_config FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));
