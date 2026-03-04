import { useNavigate } from "react-router-dom";
import { Crown, Zap, Check, ArrowRight, ShoppingCart, Shield, Lock } from "lucide-react";
import drikaLogo from "@/assets/drika_logo_crown.png";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] opacity-20 gradient-pink" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[120px] opacity-10 gradient-gold" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <img
            src={drikaLogo}
            alt="Drika Solutions"
            className="h-28 md:h-36 w-auto mx-auto mb-6 drop-shadow-[0_0_40px_hsl(330_100%_71%/0.4)] animate-fade-in"
          />

          <h1 className="text-4xl md:text-6xl font-extrabold font-display mb-4 leading-tight animate-fade-in">
            Seu servidor Discord
            <br />
            <span className="text-gradient-pink">no próximo nível</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Vendas, moderação e segurança — tudo em um único bot.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => navigate("/signup")}
              className="group px-7 py-3.5 rounded-xl border border-border bg-card hover:bg-surface-hover text-foreground font-semibold transition-all cursor-pointer"
            >
              <span className="flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Testar Grátis — 4 dias
              </span>
            </button>
            <button
              onClick={() => navigate("/signup?plan=pro")}
              className="group px-7 py-3.5 rounded-xl gradient-pink text-primary-foreground font-semibold transition-all cursor-pointer border-none glow-pink animate-pulse-glow"
            >
              <span className="flex items-center justify-center gap-2">
                <Crown className="h-4 w-4" />
                Assinar Pro — R$ 26,90/mês
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Features - compact */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-5">
          {[
            { icon: ShoppingCart, title: "Vendas", desc: "Checkout PIX automático com entrega instantânea e gestão de estoque." },
            { icon: Shield, title: "Moderação", desc: "Tickets, automações e controle total de cargos e permissões." },
            { icon: Lock, title: "Segurança", desc: "Anti-raid, anti-spam e verificação de membros 24/7." },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:glow-pink transition-all duration-300"
            >
              <div className="h-11 w-11 rounded-xl gradient-pink flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold font-display mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing - compact */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto grid md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">Free</h3>
            <div className="text-3xl font-extrabold font-display mb-1">R$ 0</div>
            <p className="text-xs text-muted-foreground mb-5">4 dias grátis</p>
            <ul className="space-y-2 mb-6 flex-1">
              {["Painel completo", "1 servidor", "Loja com PIX", "Suporte via ticket"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup")}
              className="w-full py-2.5 rounded-xl border border-border bg-card hover:bg-surface-hover text-foreground font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              Começar <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 flex flex-col relative glow-pink">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Crown className="h-3 w-3" /> Popular
              </span>
            </div>
            <h3 className="text-sm font-semibold text-primary mb-1">Pro</h3>
            <div className="text-3xl font-extrabold font-display mb-1">R$ 26,90</div>
            <p className="text-xs text-muted-foreground mb-5">por mês</p>
            <ul className="space-y-2 mb-6 flex-1">
              {["Tudo do Free", "Sem limite de tempo", "Segurança avançada", "Suporte prioritário"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup?plan=pro")}
              className="w-full py-2.5 rounded-xl gradient-pink text-primary-foreground font-semibold transition-all cursor-pointer border-none flex items-center justify-center gap-2 text-sm"
            >
              Assinar Pro <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={drikaLogo} alt="Drika" className="h-6 w-auto" />
            <span className="text-xs text-muted-foreground">© 2026 Drika Solutions</span>
          </div>
          <button
            onClick={() => navigate("/termos")}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
          >
            Termos
          </button>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
