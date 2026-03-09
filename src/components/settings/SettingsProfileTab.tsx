import { useState } from "react";
import { User, Mail, Phone, Calendar, ShoppingBag, CreditCard, Clock, Package, ChevronDown, CheckCircle2, XCircle, AlertCircle, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  tenant: any;
  tenantId: string | null;
}

const statusMap: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  paid: { label: "Pago", icon: CheckCircle2, className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  pending: { label: "Pendente", icon: Clock, className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  error: { label: "Erro", icon: XCircle, className: "text-destructive bg-destructive/10 border-destructive/20" },
  expired: { label: "Expirado", icon: AlertCircle, className: "text-muted-foreground bg-muted/50 border-border" },
};

const orderStatusMap: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Aguardando", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  paid: { label: "Pago", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  delivered: { label: "Entregue", className: "bg-primary/10 text-primary border-primary/20" },
  cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive border-destructive/20" },
  refunded: { label: "Reembolsado", className: "bg-muted/50 text-muted-foreground border-border" },
};

const SettingsProfileTab = ({ tenant, tenantId }: Props) => {
  const [showAllSubs, setShowAllSubs] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Fetch subscription payments
  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["profile-subscriptions", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
    enabled: !!tenantId,
  });

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["profile-orders", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
    enabled: !!tenantId,
  });

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd MMM yyyy, HH:mm", { locale: ptBR });
    } catch {
      return date;
    }
  };

  const formatCurrency = (cents: number) => {
    return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
  };

  const visibleSubs = showAllSubs ? subscriptions : subscriptions.slice(0, 5);
  const visibleOrders = showAllOrders ? orders : orders.slice(0, 10);

  // Stats
  const totalPaidSubs = subscriptions.filter(s => s.status === "paid").length;
  const totalRevenue = orders.filter(o => o.status === "paid" || o.status === "delivered").reduce((sum, o) => sum + (o.total_cents || 0), 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="wallet-section">
        <div className="wallet-section-header mb-5">
          <div className="wallet-section-icon">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-foreground font-display font-semibold text-sm">Dados do Perfil</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Informações da sua conta e loja</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome da Loja</p>
              <p className="text-sm font-medium text-foreground truncate">{tenant.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{tenant.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">WhatsApp</p>
              <p className="text-sm font-medium text-foreground truncate">{tenant.whatsapp || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Membro desde</p>
              <p className="text-sm font-medium text-foreground">
                {tenant.created_at ? format(new Date(tenant.created_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalPaidSubs}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Assinaturas</p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{totalOrders}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Pedidos</p>
          </div>
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Receita</p>
          </div>
        </div>
      </div>

      {/* Subscription History */}
      <div className="wallet-section">
        <div className="wallet-section-header mb-4">
          <div className="wallet-section-icon">
            <CreditCard className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-display font-semibold text-sm">Histórico de Assinaturas</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pagamentos do plano Pro</p>
          </div>
          {subscriptions.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{subscriptions.length}</Badge>
          )}
        </div>

        {subsLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : subscriptions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhuma assinatura encontrada</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleSubs.map((sub) => {
              const st = statusMap[sub.status] || statusMap.pending;
              const StatusIcon = st.icon;
              return (
                <div key={sub.id} className="flex items-center gap-3 rounded-xl bg-muted/30 border border-border px-4 py-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 ${st.className}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground capitalize">{sub.plan}</p>
                      <Badge variant="outline" className="text-[10px] h-5">{sub.payment_provider}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(sub.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(sub.amount_cents)}</p>
                    <p className={`text-[10px] font-medium ${sub.status === "paid" ? "text-emerald-400" : sub.status === "pending" ? "text-amber-400" : "text-muted-foreground"}`}>
                      {st.label}
                    </p>
                  </div>
                </div>
              );
            })}
            {subscriptions.length > 5 && (
              <button
                onClick={() => setShowAllSubs(!showAllSubs)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllSubs ? "rotate-180" : ""}`} />
                {showAllSubs ? "Mostrar menos" : `Ver todas (${subscriptions.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Orders History */}
      <div className="wallet-section">
        <div className="wallet-section-header mb-4">
          <div className="wallet-section-icon">
            <ShoppingBag className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground font-display font-semibold text-sm">Histórico de Pedidos</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Vendas realizadas na sua loja</p>
          </div>
          {orders.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{orders.length}</Badge>
          )}
        </div>

        {ordersLoading ? (
          <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleOrders.map((order) => {
              const st = orderStatusMap[order.status] || orderStatusMap.pending_payment;
              return (
                <div key={order.id} className="flex items-center gap-3 rounded-xl bg-muted/30 border border-border px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted border border-border shrink-0">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{order.product_name}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">#{order.order_number}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-xs text-muted-foreground">{order.discord_username || order.discord_user_id}</p>
                      <span className="text-muted-foreground/30">•</span>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(order.total_cents)}</p>
                    <Badge variant="outline" className={`text-[10px] h-5 border ${st.className}`}>
                      {st.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
            {orders.length > 10 && (
              <button
                onClick={() => setShowAllOrders(!showAllOrders)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllOrders ? "rotate-180" : ""}`} />
                {showAllOrders ? "Mostrar menos" : `Ver todos (${orders.length})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsProfileTab;
