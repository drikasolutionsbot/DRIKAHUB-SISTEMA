
CREATE TABLE public.affiliate_payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliate payouts"
  ON public.affiliate_payouts
  FOR ALL
  TO public
  USING (
    has_role(auth.uid(), tenant_id, 'owner'::app_role)
    OR has_role(auth.uid(), tenant_id, 'admin'::app_role)
  );

CREATE POLICY "Members can view affiliate payouts"
  ON public.affiliate_payouts
  FOR SELECT
  TO public
  USING (is_tenant_member(auth.uid(), tenant_id));
