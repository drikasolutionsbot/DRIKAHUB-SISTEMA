import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  ShoppingCart, Shield, Users, TrendingUp, Ticket, Bot,
  ArrowRight, Zap, Package, BarChart3, Settings, Crown,
  Check, ChevronRight, Sparkles, Lock, Globe,
} from "lucide-react";
import drikaLogo from "@/assets/DRIKA_HUB_SEM_FUNDO.png";
import previewDashboard from "@/assets/preview-dashboard.jpg";
import previewStore from "@/assets/preview-store.jpg";
import previewTickets from "@/assets/preview-tickets.jpg";

/* ── Scroll Reveal ── */
function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("scroll-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const ScrollReveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`scroll-hidden ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  );
};

/* ── Browser Frame ── */
const BrowserFrame = ({ image, title }: { image: string; title: string }) => (
  <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/50">
    {/* Title bar */}
    <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
      <div className="flex gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500/80" />
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <span className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="px-4 py-1 rounded-lg bg-white/5 text-[11px] text-white/30 font-mono">
          www.drikahub.com/{title}
        </div>
      </div>
    </div>
    {/* Content */}
    <img
      src={image}
      alt={`Preview ${title}`}
      className="w-full h-auto"
      loading="lazy"
      width={1920}
      height={1080}
    />
  </div>
);

/* ── Feature Section ── */
const features = [
  {
    icon: ShoppingCart,
    title: "Loja Completa",
    desc: "Gerencie produtos, estoque, preços e categorias. Entrega automática de produtos digitais direto no Discord.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Finanças",
    desc: "Acompanhe receita, pedidos, conversão e ticket médio em tempo real com gráficos interativos.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Ticket,
    title: "Sistema de Tickets",
    desc: "Atendimento profissional com tickets, categorias, staff roles e transcrições automáticas.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Shield,
    title: "Proteção Avançada",
    desc: "Anti-raid, anti-spam, anti-link e verificação de membros para manter seu servidor seguro.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Bot,
    title: "Bot White-Label",
    desc: "Seu bot com nome e avatar personalizados. Seus membros veem sua marca, não a nossa.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Zap,
    title: "Automações",
    desc: "Crie fluxos automáticos: role ao comprar, mensagem pós-venda, notificações e muito mais.",
    color: "from-cyan-500 to-sky-500",
  },
];

const highlights = [
  { icon: Package, label: "Entrega Automática" },
  { icon: Lock, label: "Pagamento PIX Seguro" },
  { icon: Globe, label: "Painel Web Completo" },
  { icon: Users, label: "Multi-Tenant" },
  { icon: Crown, label: "Plano Pro" },
  { icon: Settings, label: "Personalização Total" },
];

const PreviewPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08080a] text-white overflow-x-hidden">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#08080a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-transparent border-none cursor-pointer">
            <img src={drikaLogo} alt="Drika Hub" className="h-8 w-8" />
            <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              DRIKA HUB
            </span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white bg-transparent border-none cursor-pointer transition-colors"
            >
              Início
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white border-none cursor-pointer transition-all shadow-lg shadow-pink-500/20"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-20 pb-16 px-6">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Conheça o sistema por dentro
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Tudo que você precisa para{" "}
              <span className="bg-gradient-to-r from-pink-400 via-pink-500 to-rose-500 bg-clip-text text-transparent">
                vender no Discord
              </span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10">
              Painel completo de gestão, bot inteligente e automações avançadas. Veja como o Drika Hub funciona na prática.
            </p>
          </ScrollReveal>

          {/* Highlight pills */}
          <ScrollReveal delay={0.3}>
            <div className="flex flex-wrap justify-center gap-3 mb-16">
              {highlights.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/60 text-xs font-medium"
                >
                  <h.icon className="h-3.5 w-3.5 text-pink-400" />
                  {h.label}
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="mb-8 text-center">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Dashboard</span>
              <h2 className="text-3xl font-bold mt-2">Visão Geral em Tempo Real</h2>
              <p className="text-white/40 mt-2 max-w-xl mx-auto text-sm">
                Receita, pedidos, taxa de conversão e métricas — tudo atualizado automaticamente.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <BrowserFrame image={previewDashboard} title="dashboard" />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Funcionalidades</span>
              <h2 className="text-3xl font-bold mt-2">Tudo em um só lugar</h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-all duration-300 h-full">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Store Preview ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Loja</span>
                <h2 className="text-3xl font-bold mt-2 mb-4">Gerencie seus Produtos</h2>
                <p className="text-white/40 text-sm mb-6 leading-relaxed">
                  Cadastre produtos, controle estoque, defina preços e configure embeds personalizados. Tudo sincronizado automaticamente com o Discord.
                </p>
                <ul className="space-y-3">
                  {["Estoque automático", "Embeds personalizáveis", "Variações e campos", "Cupons de desconto", "Entrega automática"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <BrowserFrame image={previewStore} title="store" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── Tickets Preview ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal delay={0.15} className="order-2 lg:order-1">
              <BrowserFrame image={previewTickets} title="tickets" />
            </ScrollReveal>
            <ScrollReveal className="order-1 lg:order-2">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Tickets</span>
                <h2 className="text-3xl font-bold mt-2 mb-4">Suporte Profissional</h2>
                <p className="text-white/40 text-sm mb-6 leading-relaxed">
                  Sistema de tickets completo com categorias, equipe de staff, embed personalizado e transcrições automáticas.
                </p>
                <ul className="space-y-3">
                  {["Categorias personalizadas", "Equipe de staff", "Transcrições automáticas", "Embed configurável", "Logs de atendimento"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                      <div className="h-5 w-5 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-blue-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── More Features ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-pink-400 uppercase tracking-widest">E muito mais</span>
              <h2 className="text-3xl font-bold mt-2">Recursos adicionais</h2>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Sorteios automáticos", icon: "🎁" },
              { label: "Verificação de membros", icon: "✅" },
              { label: "Boas-vindas personalizadas", icon: "👋" },
              { label: "Proteção anti-raid", icon: "🛡️" },
              { label: "Gerador IA de textos", icon: "🤖" },
              { label: "Sistema de afiliados", icon: "🤝" },
              { label: "Cargos automáticos", icon: "👑" },
              { label: "Backup na nuvem (eCloud)", icon: "☁️" },
              { label: "Marketplace integrado", icon: "🏪" },
              { label: "Logs de auditoria", icon: "📋" },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 0.04}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-white/70">{item.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div className="relative rounded-3xl overflow-hidden p-10 text-center">
              {/* BG */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-purple-500/10 border border-white/[0.06] rounded-3xl" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-pink-500/15 rounded-full blur-[80px]" />

              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Pronto para começar?
                </h2>
                <p className="text-white/40 text-sm mb-8 max-w-md mx-auto">
                  Monte sua loja no Discord em minutos. Sem complicação, sem código.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-400 hover:to-pink-500 text-white border-none cursor-pointer transition-all shadow-xl shadow-pink-500/25"
                >
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={drikaLogo} alt="Drika Hub" className="h-6 w-6 opacity-50" />
            <span className="text-xs text-white/30">© 2026 Drika Hub. Todos os direitos reservados.</span>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-white/30 hover:text-white/60 bg-transparent border-none cursor-pointer transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PreviewPage;
