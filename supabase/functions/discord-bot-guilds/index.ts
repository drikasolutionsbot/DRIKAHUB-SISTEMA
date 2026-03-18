import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("DISCORD_BOT_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!botToken) throw new Error("Bot token not configured");

    let tenantIdFromBody: string | null = null;
    let accessToken: string | null = null;

    try {
      const body = await req.json();
      tenantIdFromBody = body?.tenant_id || null;
      accessToken = body?.token || null;
    } catch {
      // body opcional
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    let resolvedTenantId: string | null = null;

    // 1) Token de acesso (sessão por token) tem prioridade e resolve tenant no backend
    if (accessToken) {
      const { data: tokenRecord, error: tokenError } = await admin
        .from("access_tokens")
        .select("tenant_id, expires_at")
        .eq("token", accessToken)
        .eq("revoked", false)
        .single();

      if (tokenError || !tokenRecord) {
        return new Response(JSON.stringify({ error: "Token inválido" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Token expirado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (tenantIdFromBody && tokenRecord.tenant_id !== tenantIdFromBody) {
        return new Response(JSON.stringify({ error: "Token não pertence ao tenant informado" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      resolvedTenantId = tokenRecord.tenant_id;
    }

    // 2) Usuário autenticado via Supabase Auth + tenant_id informado
    if (!resolvedTenantId && tenantIdFromBody) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const {
        data: { user },
        error: userError,
      } = await userClient.auth.getUser();

      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Não autorizado" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: membership } = await admin
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("tenant_id", tenantIdFromBody)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        return new Response(JSON.stringify({ error: "Acesso negado para este tenant" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      resolvedTenantId = tenantIdFromBody;
    }

    // Busca guilds atuais do bot no Discord
    const discordResponse = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bot ${botToken}` },
    });

    if (!discordResponse.ok) {
      const text = await discordResponse.text();
      throw new Error(`Discord API error [${discordResponse.status}]: ${text}`);
    }

    const guilds = await discordResponse.json();
    const mapped = guilds.map((g: any) => ({
      id: g.id,
      name: g.name,
      icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
    }));

    // Busca servidores já vinculados a qualquer tenant
    const { data: claimedRows } = await admin
      .from("tenants")
      .select("id, discord_guild_id")
      .not("discord_guild_id", "is", null);

    if (resolvedTenantId) {
      const { data: currentTenant, error: currentTenantError } = await admin
        .from("tenants")
        .select("id, name, discord_guild_id, created_at")
        .eq("id", resolvedTenantId)
        .single();

      if (currentTenantError || !currentTenant) {
        return new Response(JSON.stringify({ error: "Tenant não encontrado" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (currentTenant.discord_guild_id) {
        // Tenant já tem servidor: mostra somente ele
        const result = mapped.filter((g: any) => g.id === currentTenant.discord_guild_id);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Tenant sem servidor: nunca retorna lista completa para evitar vazamento
      const claimedByOthers = new Set(
        (claimedRows || [])
          .filter((r: any) => r.id !== resolvedTenantId)
          .map((r: any) => r.discord_guild_id)
          .filter(Boolean)
      );
      const available = mapped.filter((g: any) => !claimedByOthers.has(g.id));

      const normalize = (value: string | null | undefined) =>
        (value || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "");

      const normalizedTenantName = normalize(currentTenant.name);
      let autoMatch = available.find((g: any) => normalize(g.name) === normalizedTenantName) ?? null;

      if (!autoMatch && available.length === 1) {
        autoMatch = available[0];
      }

      const tenantCreatedAtMs = new Date(currentTenant.created_at).getTime();
      const tenantIsRecent =
        Number.isFinite(tenantCreatedAtMs) && Date.now() - tenantCreatedAtMs <= 12 * 60 * 60 * 1000;

      if (!autoMatch && tenantIsRecent && available.length > 0) {
        autoMatch = [...available].sort((a: any, b: any) => {
          try {
            const aId = BigInt(a.id);
            const bId = BigInt(b.id);
            if (aId === bId) return 0;
            return aId > bId ? -1 : 1;
          } catch {
            return 0;
          }
        })[0];
      }

      if (autoMatch) {
        const { error: updateError } = await admin
          .from("tenants")
          .update({
            discord_guild_id: autoMatch.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resolvedTenantId)
          .is("discord_guild_id", null);

        if (updateError) {
          throw new Error("Falha ao vincular servidor automaticamente");
        }

        return new Response(JSON.stringify([autoMatch]), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Sem match seguro: não retorna servidores para evitar exposição de dados cross-tenant
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Onboarding (sem tenant): servidores não reclamados por ninguém
    const claimedIds = new Set((claimedRows || []).map((row: any) => row.discord_guild_id).filter(Boolean));
    const unclaimed = mapped.filter((g: any) => !claimedIds.has(g.id));

    return new Response(JSON.stringify(unclaimed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
