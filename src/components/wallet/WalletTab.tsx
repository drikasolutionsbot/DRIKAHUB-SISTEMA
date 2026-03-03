import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WalletData {
  balance_cents: number;
  total_earned_cents: number;
  total_withdrawn_cents: number;
}

interface Transaction {
  id: string;
  type: string;
  amount_cents: number;
  description: string | null;
  status: string;
  pix_key: string | null;
  created_at: string;
}

export const WalletTab = () => {
  const { tenantId, tenant } = useTenant();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawPix, setWithdrawPix] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    fetchData();
  }, [tenantId]);

  const fetchData = async () => {
    setLoading(true);
    const [walletRes, txRes] = await Promise.all([
      supabase
        .from("wallets" as any)
        .select("balance_cents, total_earned_cents, total_withdrawn_cents")
        .eq("tenant_id", tenantId!)
        .maybeSingle(),
      supabase
        .from("wallet_transactions" as any)
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    setWallet((walletRes.data as any) ?? { balance_cents: 0, total_earned_cents: 0, total_withdrawn_cents: 0 });
    setTransactions(((txRes.data as any) ?? []) as Transaction[]);
    setLoading(false);
  };

  const handleWithdraw = async () => {
    const amountCents = Math.round(parseFloat(withdrawAmount.replace(",", ".")) * 100);
    if (!amountCents || amountCents <= 0) {
      toast({ title: "Valor inválido", variant: "destructive" });
      return;
    }
    if (!withdrawPix.trim()) {
      toast({ title: "Informe a chave PIX", variant: "destructive" });
      return;
    }
    if (wallet && amountCents > wallet.balance_cents) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("wallet_transactions" as any)
        .insert({
          tenant_id: tenantId,
          type: "withdrawal",
          amount_cents: amountCents,
          description: "Saque via PIX",
          status: "pending",
          pix_key: withdrawPix.trim(),
        } as any);

      if (error) throw error;

      toast({ title: "Saque solicitado!", description: "Aguardando aprovação do administrador." });
      setWithdrawAmount("");
      setWithdrawPix("");
      fetchData();
    } catch (err: any) {
      toast({ title: "Erro ao solicitar saque", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Saldo Disponível</span>
          </div>
          <p className="text-2xl font-bold">{fmt(wallet?.balance_cents ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Recebido</span>
          </div>
          <p className="text-2xl font-bold">{fmt(wallet?.total_earned_cents ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <span className="text-sm text-muted-foreground">Total Sacado</span>
          </div>
          <p className="text-2xl font-bold">{fmt(wallet?.total_withdrawn_cents ?? 0)}</p>
        </div>
      </div>

      {/* Withdraw Form */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="font-display font-semibold flex items-center gap-2">
          <ArrowUpRight className="h-5 w-5 text-primary" />
          Solicitar Saque
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              placeholder="0,00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-muted border-none font-mono text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Chave PIX para receber</Label>
            <Input
              placeholder="CPF, email, telefone ou chave aleatória"
              value={withdrawPix}
              onChange={(e) => setWithdrawPix(e.target.value)}
              className="bg-muted border-none font-mono"
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Saques são processados pelo administrador em até 24h.
          </p>
          <Button onClick={handleWithdraw} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            Sacar
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="font-display font-semibold">Histórico de Transações</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Nenhuma transação ainda
          </p>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    tx.type === "deposit" ? "bg-emerald-500/10" : "bg-orange-500/10"
                  }`}>
                    {tx.type === "deposit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {tx.type === "deposit" ? "Depósito" : "Saque"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.description || "—"} · {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${tx.type === "deposit" ? "text-emerald-500" : "text-orange-500"}`}>
                    {tx.type === "deposit" ? "+" : "−"}{fmt(tx.amount_cents)}
                  </span>
                  <Badge
                    variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}
                    className="text-[10px]"
                  >
                    {tx.status === "completed" ? "Concluído" : tx.status === "pending" ? "Pendente" : "Rejeitado"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
