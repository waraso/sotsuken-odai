import type { APIRoute } from "astro";
// @ts-ignore
import Kuroshiro from "kuroshiro";
// @ts-ignore
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
    let result = await k.convert(text, { to: "hiragana" });

    // Post-process with kanaToHiragana to ensure Katakana is converted
    const util = (Kuroshiro as any).Util;
    if (util) {
      const converter = util.kanaToHiragana || util.kanaToHiragna;
      if (converter) {
        if (
          (util.isKatakana && util.isKatakana(result)) ||
          (util.hasKatakana && util.hasKatakana(result))
        ) {
          result = converter(result);
        }
      }
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API] Conversion failed:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Conversion failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
