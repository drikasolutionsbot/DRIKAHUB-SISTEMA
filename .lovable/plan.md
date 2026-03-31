

## Plano: Restaurar seletor de membros no ticket (apenas para staff)

### Problema
O seletor de membros (`UserSelectMenuBuilder`) foi removido do ticket na última alteração. O usuário quer que ele volte, mas restrito apenas a staff e cargos com permissão.

### Alterações

**Arquivo: `bot-externo/handlers/tickets.js`**

1. **Restaurar o `row2`** com o `UserSelectMenuBuilder` na mensagem de boas-vindas do ticket (linha ~146):
   - Criar `row2` com `UserSelectMenuBuilder` usando customId `ticket_assign_{ticketId}`
   - Incluir `row2` nos `components` da mensagem: `[row1, row2]`

2. **Adicionar verificação de permissão no `handleAssignTicket`** (linha ~293):
   - Antes de adicionar o membro, chamar `checkStaffPermission(tenant, interaction)`
   - Se não for staff, responder com mensagem efêmera: "❌ Apenas membros da equipe podem adicionar pessoas ao ticket."
   - Se for staff, prosseguir normalmente

### Resultado
O seletor aparece para todos visualmente, mas apenas staff consegue efetivamente usar para adicionar membros. Usuários comuns recebem uma mensagem de erro ao tentar.

