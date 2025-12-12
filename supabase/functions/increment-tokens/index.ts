import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.87.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DAILY_LIMIT = 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface IncrementTokensRequest {
  user_id: string;
  tokens: number;
  category?: string;
  question_preview?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { user_id, tokens, category = "general", question_preview }: IncrementTokensRequest = await req.json();

    if (!user_id || typeof tokens !== "number" || tokens < 0) {
      return new Response(
        JSON.stringify({ error: "invalid_payload", message: "user_id and tokens are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const isBulario = category === "bulario";
    const tokensToCharge = isBulario ? 0 : tokens;

    await supabaseClient
      .from("token_usage_logs")
      .insert({
        user_id,
        tokens_consumed: tokensToCharge,
        category,
        question_preview: question_preview?.substring(0, 100),
      });

    if (isBulario) {
      const { data: currentUsage } = await supabaseClient
        .from("usage_tokens")
        .select("tokens_used")
        .eq("user_id", user_id)
        .eq("date", new Date().toISOString().split("T")[0])
        .maybeSingle();

      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: DAILY_LIMIT - (currentUsage?.tokens_used || 0),
          used: currentUsage?.tokens_used || 0,
          limit: DAILY_LIMIT,
          category: "bulario",
          free: true,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error: selectError } = await supabaseClient
      .from("usage_tokens")
      .select("*")
      .eq("user_id", user_id)
      .eq("date", today)
      .maybeSingle();

    if (selectError) {
      console.error("Error selecting usage_tokens:", selectError);
      return new Response(
        JSON.stringify({ error: "database_error", message: selectError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!data) {
      if (tokens > DAILY_LIMIT) {
        return new Response(
          JSON.stringify({
            allowed: false,
            remaining: 0,
            used: 0,
            limit: DAILY_LIMIT,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const { error: insertError } = await supabaseClient
        .from("usage_tokens")
        .insert({
          user_id,
          date: today,
          tokens_used: tokensToCharge,
        });

      if (insertError) {
        console.error("Error inserting usage_tokens:", insertError);
        return new Response(
          JSON.stringify({ error: "database_error", message: insertError.message }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          allowed: true,
          remaining: DAILY_LIMIT - tokensToCharge,
          used: tokensToCharge,
          limit: DAILY_LIMIT,
          category,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const newTotal = data.tokens_used + tokensToCharge;

    if (newTotal > DAILY_LIMIT) {
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          used: data.tokens_used,
          limit: DAILY_LIMIT,
          category,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { error: updateError } = await supabaseClient
      .from("usage_tokens")
      .update({ tokens_used: newTotal })
      .eq("id", data.id);

    if (updateError) {
      console.error("Error updating usage_tokens:", updateError);
      return new Response(
        JSON.stringify({ error: "database_error", message: updateError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: DAILY_LIMIT - newTotal,
        used: newTotal,
        limit: DAILY_LIMIT,
        category,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "server_error", message: err.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
