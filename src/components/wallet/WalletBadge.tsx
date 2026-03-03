import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Wallet, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const WalletBadge = () => {
  const { tenantId } = useTenant();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!tenantId) return;

    const fetchBalance = async () => {
      const { data } = await supabase
        .from("wallets" as any)
        .select("balance_cents")
        .eq("tenant_id", tenantId)
        .maybeSingle();
      setBalance((data as any)?.balance_cents ?? 0);
    };

    fetchBalance();

    // Realtime updates
    const channel = supabase
      .channel(`wallet-${tenantId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload: any) => {
          if (payload.new?.balance_cents !== undefined) {
            setBalance(payload.new.balance_cents);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const formatted = balance !== null
    ? (balance / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "—";

  return (
    <button
      onClick={() => navigate("/settings?tab=wallet")}
      className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-1.5 hover:bg-muted transition-colors group"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
        <Wallet className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] leading-tight text-muted-foreground">Saldo</span>
        <span className="text-sm font-bold leading-tight">{formatted}</span>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
