/**
 * Configuração centralizada dos planos do SaaS Drika Hub.
 * Single source of truth — usar SEMPRE este helper em vez de comparar strings soltas.
 */

export type PlanKey = "free" | "pro" | "master" | "expired";

export interface PlanInfo {
  value: PlanKey;
  label: string;
  shortLabel: string;
  /** Tailwind classes p/ badge */
  color: string;
  /** Mensalidade default em centavos (admin pode sobrescrever) */
  defaultPriceCents: number;
}

export const PLANS: PlanInfo[] = [
  {
    value: "free",
    label: "Drika Solutions Free",
    shortLabel: "Free",
    color: "text-muted-foreground bg-muted/50 border-border",
    defaultPriceCents: 0,
  },
  {
    value: "pro",
    label: "Drika Solutions Pro",
    shortLabel: "Pro",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500",
    defaultPriceCents: 900,
  },
  {
    value: "master",
    label: "Drika Solutions Master",
    shortLabel: "Master",
    color: "text-primary bg-primary/10 border-primary",
    defaultPriceCents: 3090,
  },
];

export function getPlanInfo(plan?: string | null): PlanInfo {
  return PLANS.find((p) => p.value === plan) || PLANS[0];
}

export function isMaster(plan?: string | null): boolean {
  return plan === "master";
}

export function isPaidPlan(plan?: string | null): boolean {
  return plan === "pro" || plan === "master";
}

/** Recursos exclusivos do Master */
export const MASTER_FEATURES = {
  /** Capa pessoal do bot por loja */
  customBotBanner: true,
  /** Limite diário de créditos IA removido */
  unlimitedAiCredits: true,
} as const;
