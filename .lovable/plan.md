

# Página de Sorteios — Proposta de Funcionalidades

O backend (Edge Function `manage-giveaways`) já está 100% pronto com suporte a: criar, listar, editar, deletar, sortear, re-sortear, cancelar e gerenciar participantes. O banco de dados (`giveaways` + `giveaway_entries`) também já existe. Falta apenas construir a UI.

---

## Estrutura da Página

A página terá **3 abas**:

### 1. Sorteios Ativos
- Lista de cards com os sorteios em andamento (`status = 'active'`)
- Cada card mostra: título, prêmio, número de participantes, tempo restante (countdown), canal do Discord
- Botões de ação: **Sortear agora**, **Cancelar**, **Editar**
- Badge colorido com status (Ativo / Encerrado / Cancelado)

### 2. Histórico
- Tabela com sorteios encerrados e cancelados
- Mostra vencedores (com avatar Discord), data, total de participantes
- Botão de **Re-sortear** para escolher novos vencedores

### 3. Criar Sorteio
- Formulário com campos:
  - **Título** do sorteio
  - **Prêmio** (texto livre)
  - **Descrição** (opcional)
  - **Quantidade de vencedores** (número, default 1)
  - **Data/hora de encerramento** (date picker)
  - **Canal do Discord** (select com canais do servidor — anuncia automaticamente)
  - **Cargo obrigatório** (opcional — só quem tem o cargo pode participar)
- Ao criar, a Edge Function já envia o embed no Discord com reação 🎉

---

## Funcionalidades Visuais

- **Countdown ao vivo** nos cards ativos (dias, horas, minutos)
- **Confetti animation** ao sortear vencedores
- **Modal de confirmação** antes de sortear/cancelar
- **Modal de vencedores** mostrando avatares Discord dos ganhadores
- **Empty state** bonito quando não há sorteios

---

## Fluxo Discord Integrado

O sistema já faz tudo automaticamente via Edge Function:
1. Criar sorteio → embed enviado no canal com reação 🎉
2. Sortear → mensagem de vencedores enviada no canal
3. Participantes entram via reação no Discord (gerenciado pelo bot)

---

## Implementação Técnica

- **1 arquivo principal**: `src/pages/GiveawaysPage.tsx` (substituir o loader atual)
- **2-3 componentes auxiliares**: `GiveawayCard`, `CreateGiveawayModal`, `WinnersModal`
- Todas as chamadas via `supabase.functions.invoke('manage-giveaways', { body: { action, tenant_id, ... } })`
- Usa o `TenantContext` existente para `tenant_id` e `discordGuildId`
- Busca canais via `discord-channels` Edge Function (mesmo padrão de outras páginas)

