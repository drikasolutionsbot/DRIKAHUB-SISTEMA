import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DISCORD_API = "https://discord.com/api/v10";
const MAX_MEMBERS_PER_TENANT = 1000;
const MAX_JOINS_PROCESSED_PER_TENANT = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const tenantFilter = body?.tenant_id as string | undefined;

    let query = supabase
      .from("welcome_configs")
      .select("tenant_id, auto_role_enabled, auto_role_id")
      .eq("auto_role_enabled", true)
      .not("auto_role_id", "is", null);

    if (tenantFilter) query = query.eq("tenant_id", tenantFilter);

    const { data: configs, error: configError } = await query;
    if (configError) throw configError;

    if (!configs || configs.length === 0) {
      return json({ success: true, processed_tenants: 0, processed_members: 0, message: "No active auto-role configs" });
    }

    const summary: Array<Record<string, unknown>> = [];
    let totalMembersProcessed = 0;

    for (const config of configs) {
      const tenantId = config.tenant_id;
      const autoRoleId = config.auto_role_id;
      if (!tenantId || !autoRoleId) continue;

      const tenantResult: Record<string, unknown> = {
        tenant_id: tenantId,
        scanned: 0,
        candidates: 0,
        processed: 0,
        errors: [] as string[],
      };

      try {
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .select("discord_guild_id, bot_token_encrypted")
          .eq("id", tenantId)
          .single();

        if (tenantError) throw tenantError;
        if (!tenant?.discord_guild_id) {
          (tenantResult.errors as string[]).push("tenant without discord_guild_id");
          summary.push(tenantResult);
          continue;
        }

        const botToken = tenant.bot_token_encrypted || Deno.env.get("DISCORD_BOT_TOKEN");
        if (!botToken) {
          (tenantResult.errors as string[]).push("no bot token");
          summary.push(tenantResult);
          continue;
        }

        const guildId = tenant.discord_guild_id;
        const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members?limit=${MAX_MEMBERS_PER_TENANT}`, {
          headers: { Authorization: `Bot ${botToken}` },
        });

        if (!res.ok) {
          const err = await res.text();
          (tenantResult.errors as string[]).push(`list members failed (${res.status}): ${err}`);
          summary.push(tenantResult);
          continue;
        }

        const members = await res.json();
        if (!Array.isArray(members)) {
          (tenantResult.errors as string[]).push("invalid members payload");
          summary.push(tenantResult);
          continue;
        }

        tenantResult.scanned = members.length;

        const candidates = members
          .filter((m: any) => !m?.user?.bot)
          .filter((m: any) => Array.isArray(m.roles) && !m.roles.includes(autoRoleId))
          .slice(0, MAX_JOINS_PROCESSED_PER_TENANT);

        tenantResult.candidates = candidates.length;

        for (const member of candidates) {
          try {
            const runRes = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/handle-member-join`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tenant_id: tenantId,
                  event: "GUILD_MEMBER_ADD",
                  member,
                }),
              }
            );

            const runJson = await runRes.json().catch(() => ({}));
            if (!runRes.ok) {
              (tenantResult.errors as string[]).push(`handle-member-join failed (${runRes.status}): ${JSON.stringify(runJson)}`);
              continue;
            }

            tenantResult.processed = Number(tenantResult.processed) + 1;
            totalMembersProcessed += 1;
          } catch (err: any) {
            (tenantResult.errors as string[]).push(`member process error: ${err?.message || "unknown"}`);
          }
        }
      } catch (err: any) {
        (tenantResult.errors as string[]).push(err?.message || "unknown tenant error");
      }

      summary.push(tenantResult);
    }

    return json({
      success: true,
      processed_tenants: summary.length,
      processed_members: totalMembersProcessed,
      summary,
    });
  } catch (err: any) {
    console.error("sync-welcome-members error:", err);
    return new Response(JSON.stringify({ error: err?.message || "unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
