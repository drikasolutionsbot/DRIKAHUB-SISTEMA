import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown,
  ArrowUpRight, Users, Clock,
} from "lucide-react";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, ResponsiveContainer,
} from "recharts";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Order {
  id: string;
  order_number: number;
  discord_user_id: string;
  discord_username: string | null;
  product_name: string;
  total_cents: number;
  status: string;
  created_at: string;
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const statusColors: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  delivered: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  pending_payment: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  canceled: "bg-destructive/15 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  paid: "Pago",
  delivered: "Entregue",
  delivering: "Entregando",
  pending_payment: "Pendente",
  canceled: "Cancelado",
  refunded: "Reembolsado",
};

export const DashboardOverview = () => {
  const { tenantId } = useTenant();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, discord_user_id, discord_username, product_name, total_cents, status, created_at")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(500);
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    };
    fetch();
  }, [tenantId]);

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const current = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
    const previous = orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    const paidStatuses = ["paid", "delivered", "delivering"];
    const currentPaid = current.filter(o => paidStatuses.includes(o.status));
    const previousPaid = previous.filter(o => paidStatuses.includes(o.status));

    const revenue = currentPaid.reduce((s, o) => s + o.total_cents, 0);
    const prevRevenue = previousPaid.reduce((s, o) => s + o.total_cents, 0);
    const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    const ordersCount = currentPaid.length;
    const prevOrdersCount = previousPaid.length;
    const ordersChange = prevOrdersCount > 0 ? ((ordersCount - prevOrdersCount) / prevOrdersCount) * 100 : 0;

    const avgTicket = ordersCount > 0 ? revenue / ordersCount : 0;
    const prevAvgTicket = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;
    const avgChange = prevAvgTicket > 0 ? ((avgTicket - prevAvgTicket) / prevAvgTicket) * 100 : 0;

    return { revenue, revenueChange, ordersCount, ordersChange, avgTicket, avgChange };
  }, [orders]);

  // Revenue chart data (last 14 days)
  const revenueChartData = useMemo(() => {
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = orders.filter(o => {
        if (!["paid", "delivered", "delivering"].includes(o.status)) return false;
        return format(parseISO(o.created_at), "yyyy-MM-dd") === dayStr;
      });
      days.push({
        date: format(day, "dd/MM", { locale: ptBR }),
        revenue: dayOrders.reduce((s, o) => s + o.total_cents, 0) / 100,
        orders: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  // Top clients
  const topClients = useMemo(() => {
    const map = new Map<string, { username: string; total: number; count: number }>();
    orders
      .filter(o => ["paid", "delivered", "delivering"].includes(o.status))
      .forEach(o => {
        const key = o.discord_user_id;
        const existing = map.get(key);
        if (existing) {
          existing.total += o.total_cents;
          existing.count++;
        } else {
          map.set(key, { username: o.discord_username || o.discord_user_id, total: o.total_cents, count: 1 });
        }
      });
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [orders]);

  // Recent sales
  const recentSales = useMemo(() => orders.slice(0, 6), [orders]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[320px] rounded-xl lg:col-span-2" />
          <Skeleton className="h-[320px] rounded-xl" />
        </div>
      </div>
    );
  }

  const chartConfig = {
    revenue: { label: "Receita", color: "hsl(var(--primary))" },
    orders: { label: "Pedidos", color: "hsl(var(--secondary))" },
  };

  const statCards = [
    {
      title: "Receita (30d)",
      value: formatCurrency(stats.revenue),
      change: stats.revenueChange,
      icon: DollarSign,
      gradient: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/15 text-primary",
    },
    {
      title: "Pedidos (30d)",
      value: stats.ordersCount.toString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      gradient: "from-secondary/20 to-secondary/5",
      iconBg: "bg-secondary/15 text-secondary",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(stats.avgTicket),
      change: stats.avgChange,
      icon: TrendingUp,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/15 text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${card.gradient} p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold font-display tracking-tight">{card.value}</p>
                {card.change !== 0 && (
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold ${card.change > 0 ? "text-emerald-400" : "text-destructive"}`}>
                    {card.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {card.change > 0 ? "+" : ""}{card.change.toFixed(1)}% vs mês anterior
                  </div>
                )}
              </div>
              <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/5 blur-xl" />
          </div>
        ))}
      </div>

      {/* Charts + Top Clients */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-border bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Receita — Últimos 14 dias</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Valores em R$</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Receita
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-secondary" /> Pedidos
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <AreaChart data={revenueChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={v => `R$${v}`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Clientes com maior volume de compras</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado ainda</p>
            ) : (
              topClients.map((client, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
                        {client.username[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {i < 3 && (
                      <span className={`absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        i === 0 ? "bg-amber-400 text-amber-900" : i === 1 ? "bg-slate-300 text-slate-700" : "bg-orange-400 text-orange-900"
                      }`}>
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{client.username}</p>
                    <p className="text-xs text-muted-foreground">{client.count} pedido{client.count > 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums">{formatCurrency(client.total)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales + Orders Bar Chart */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Vendas Recentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda encontrada</p>
            ) : (
              recentSales.map(sale => (
                <div key={sale.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/60">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">#{sale.order_number}</span>
                      <span className="text-sm font-medium truncate">{sale.product_name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {sale.discord_username || sale.discord_user_id} · {format(parseISO(sale.created_at), "dd/MM HH:mm")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] border ${statusColors[sale.status] || "bg-muted text-muted-foreground"}`}>
                      {statusLabels[sale.status] || sale.status}
                    </Badge>
                    <span className="text-sm font-bold tabular-nums min-w-[72px] text-right">{formatCurrency(sale.total_cents)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Orders Bar Chart */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Volume de Pedidos — 14 dias</CardTitle>
            <p className="text-xs text-muted-foreground">Quantidade de pedidos por dia</p>
          </CardHeader>
          <CardContent className="pt-0 pb-2">
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart data={revenueChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
