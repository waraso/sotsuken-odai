import type { APIRoute } from "astro";
import Kuroshiro from "kuroshiro";
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

let kuroshiro: any = null;

async function initKuroshiro(): Promise<any> {
  if (kuroshiro) return kuroshiro;

  const k = new Kuroshiro();

  await k.init(new KuromojiAnalyzer());

  kuroshiro = k;
  return k;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { text } = (await request.json()) as { text: string };

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "text parameter is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const k = await initKuroshiro();
    const result = await k.convert(text, { to: "hiragana" });

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API] Conversion failed:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
