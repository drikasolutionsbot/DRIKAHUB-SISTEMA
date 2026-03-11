import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DISCORD_API = "https://discord.com/api/v10";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant_id, ticket_id, action, closed_by, discord_channel_id, new_name } = await req.json();

    if (!tenant_id) {
      return new Response(JSON.stringify({ error: "tenant_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get bot token
    const { data: tenant } = await supabase
      .from("tenants")
      .select("bot_token_encrypted, name")
      .eq("id", tenant_id)
      .single();

    const botToken = tenant?.bot_token_encrypted || Deno.env.get("DISCORD_BOT_TOKEN");
    if (!botToken) {
      return new Response(JSON.stringify({ error: "Bot token not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── RENAME ACTION ──────────────────────────────────────
    if (action === "rename" && discord_channel_id && new_name) {
      const renameRes = await fetch(`${DISCORD_API}/channels/${discord_channel_id}`, {
        method: "PATCH",
        headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: new_name.substring(0, 100) }),
      });

      if (!renameRes.ok) {
        const errText = await renameRes.text();
        return new Response(JSON.stringify({ error: "Failed to rename", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── CLOSE/DELETE ACTION ────────────────────────────────
    if (!ticket_id) {
      return new Response(JSON.stringify({ error: "ticket_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get ticket details
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    if (!ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get logs channel
    const { data: sc } = await supabase
      .from("store_configs")
      .select("ticket_logs_channel_id")
      .eq("tenant_id", tenant_id)
      .single();

    const channelToProcess = discord_channel_id || ticket.discord_channel_id;

    // Generate transcript
    let transcript = "";
    if (channelToProcess && sc?.ticket_logs_channel_id) {
      try {
        const msgsRes = await fetch(`${DISCORD_API}/channels/${channelToProcess}/messages?limit=100`, {
          headers: { Authorization: `Bot ${botToken}` },
        });
        if (msgsRes.ok) {
          const msgs = await msgsRes.json();
          const sorted = msgs.reverse();
          transcript = sorted.map((m: any) => {
            const ts = new Date(m.timestamp).toLocaleString("pt-BR");
            const author = m.author?.username || "Desconhecido";
            const content = m.content || (m.embeds?.length ? "[embed]" : "[sem conteúdo]");
            return `[${ts}] ${author}: ${content}`;
          }).join("\n");
        }
      } catch (e) { console.error("Transcript fetch error:", e); }
    }

    // Send detailed log embed
    if (sc?.ticket_logs_channel_id && action === "closed") {
      const createdAt = new Date(ticket.created_at);
      const closedAt = new Date();
      const diffMs = closedAt.getTime() - createdAt.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      const diffH = Math.floor(diffMin / 60);
      const remainMin = diffMin % 60;
      const totalTime = diffH > 0 ? `${diffH}h ${remainMin}m` : `${diffMin}m`;

      const logEmbed: any = {
        title: "⚙️ Sistema de Logs",
        color: 0x2B2D31,
        fields: [
          { name: "➡️ Usuário que abriu:", value: `> <@${ticket.discord_user_id}>`, inline: false },
          { name: "➡️ Usuário que fechou:", value: `> ${closed_by || "Painel"}`, inline: false },
          { name: "➡️ Quem assumiu:", value: "> Ninguém Assumiu", inline: false },
          { name: "📋 Código do Ticket:", value: `> ${ticket.discord_channel_id || ticket.id.slice(0, 20)}`, inline: false },
          { name: "😊 Horário de abertura:", value: `> <t:${Math.floor(createdAt.getTime() / 1000)}:f> <t:${Math.floor(createdAt.getTime() / 1000)}:R>`, inline: false },
          { name: "😔 Horário do fechamento:", value: `> <t:${Math.floor(closedAt.getTime() / 1000)}:f> (<t:${Math.floor(closedAt.getTime() / 1000)}:R>)`, inline: false },
          { name: "➡️ Tempo total de atendimento:", value: `> ${totalTime}`, inline: false },
        ],
        timestamp: closedAt.toISOString(),
      };

      if (ticket.product_name) {
        logEmbed.fields.splice(3, 0, { name: "📦 Produto:", value: `> ${ticket.product_name}`, inline: false });
      }

      await fetch(`${DISCORD_API}/channels/${sc.ticket_logs_channel_id}/messages`, {
        method: "POST",
        headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [logEmbed] }),
      });

      // Send transcript as file
      if (transcript) {
        const formData = new FormData();
        const blob = new Blob([transcript], { type: "text/plain" });
        formData.append("files[0]", blob, `transcript-${ticket.discord_username || ticket.discord_user_id}-${ticket.id.slice(0, 8)}.txt`);
        formData.append("payload_json", JSON.stringify({
          content: `📜 **Transcript do Ticket** — ${ticket.discord_username || ticket.discord_user_id}`,
        }));

        await fetch(`${DISCORD_API}/channels/${sc.ticket_logs_channel_id}/messages`, {
          method: "POST",
          headers: { Authorization: `Bot ${botToken}` },
          body: formData,
        });
      }
    }

    // Archive and lock the thread if it exists
    if (channelToProcess && action === "closed") {
      try {
        // Send closing message
        await fetch(`${DISCORD_API}/channels/${channelToProcess}/messages`, {
          method: "POST",
          headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [{
              title: "🔒 Ticket Fechado",
              description: `Este ticket foi fechado pelo painel.\nO tópico será arquivado.`,
              color: 0xED4245,
            }],
          }),
        });

        // Archive and lock the thread
        await fetch(`${DISCORD_API}/channels/${channelToProcess}`, {
          method: "PATCH",
          headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            archived: true,
            locked: true,
          }),
        });
      } catch (e) {
        console.error("Failed to archive ticket thread:", e);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});