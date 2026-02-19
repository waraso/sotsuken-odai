import type { APIRoute } from "astro";

const KUROSHIRO_API_ENDPOINT =
  "https://kurishiro-api-worker.waraso.workers.dev/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function katakanaToHiragana(str: string) {
  return str.replace(/[\u30A1-\u30F6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60),
  );
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = (await request.json()) as { text: string };

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "text parameter is required" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const response = await fetch(KUROSHIRO_API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text, to: "hiragana" }),
    });

    if (!response.ok) {
      throw new Error(`Kuroshiro API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Ensure response has the expected format
    const rawResult = data.result || data.hiragana || data.converted || data;
    const result = katakanaToHiragana(String(rawResult));

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("[API] Conversion failed:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
