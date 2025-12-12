import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const rssUrl = "https://www.healthnews.today/feed/";

    const rssXML = await fetch(rssUrl).then(r => r.text());

    const items = [...rssXML.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 3)
      .map(entry => {
        const raw = entry[1];
        return {
          title: raw.match(/<title>(.*?)<\/title>/)?.[1] ?? "",
          link: raw.match(/<link>(.*?)<\/link>/)?.[1] ?? "",
          date: raw.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "",
          description: raw.match(/<description>(.*?)<\/description>/)?.[1] ?? "",
        };
      });

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('GEMINI_API_KEY not configured, returning raw items');
      return new Response(JSON.stringify(items), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    const translated = [];
    for (const item of items) {
      const body = {
        contents: [{
          parts: [{
            text: `Traduza para português do Brasil, mantendo sentido jornalístico:\n\nTítulo: "${item.title}"\nDescrição: "${item.description}"`
          }]
        }]
      };

      const result = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
          GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const json = await result.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      const [tTitle, tDescription] = text.split("\n").map((s: string) => s.trim());

      translated.push({
        title: tTitle.replace("Título traduzido:", "").trim(),
        description: tDescription.replace("Descrição traduzida:", "").trim(),
        link: item.link,
        date: item.date
      });
    }

    return new Response(JSON.stringify(translated), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    console.error("Error fetching health news:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});