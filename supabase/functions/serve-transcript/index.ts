import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let tenantId = url.searchParams.get("tenant_id");
    let ticketId = url.searchParams.get("ticket_id");
    const channelId = url.searchParams.get("channel_id");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If channel_id provided, look up tenant_id and ticket_id from tickets table
    if (channelId && (!tenantId || !ticketId)) {
      const { data: ticket, error: ticketErr } = await supabase
        .from("tickets")
        .select("id, tenant_id")
        .eq("discord_channel_id", channelId)
        .single();

      if (ticketErr || !ticket) {
        return new Response("Transcript não encontrado.", {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
        });
      }

      tenantId = ticket.tenant_id;
      ticketId = ticket.id;
    }

    if (!tenantId || !ticketId) {
      return new Response("Link do transcript inválido.", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const filePath = `transcripts/${tenantId}/${ticketId}.html`;

    const { data, error } = await supabase.storage
      .from("tenant-assets")
      .download(filePath);

    if (error || !data) {
      return new Response("Transcript não encontrado.", {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const html = await data.text();

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return new Response(message, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  }
});
