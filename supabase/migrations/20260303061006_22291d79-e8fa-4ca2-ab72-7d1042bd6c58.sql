
-- Wallet for each tenant
CREATE TABLE public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  balance_cents integer NOT NULL DEFAULT 0,
  total_earned_cents integer NOT NULL DEFAULT 0,
  total_withdrawn_cents integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view wallet"
ON public.wallets FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Service role can manage wallets"
ON public.wallets FOR ALL
USING (true)
WITH CHECK (true);

-- Wallet transactions (deposits from sales, withdrawals)
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount_cents integer NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  pix_key text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view transactions"
ON public.wallet_transactions FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id));

CREATE POLICY "Owners can create withdrawals"
ON public.wallet_transactions FOR INSERT
WITH CHECK (
  has_role(auth.uid(), tenant_id, 'owner'::app_role)
  AND type = 'withdrawal'
);

CREATE POLICY "Service role can manage transactions"
ON public.wallet_transactions FOR ALL
USING (true)
WITH CHECK (true);

CREATE INDEX idx_wallet_transactions_tenant ON public.wallet_transactions(tenant_id, created_at DESC);
