import type { APIRoute } from "astro";

let kuroshiro: any = null;

async function initKuroshiro(): Promise<any> {
  if (kuroshiro) return kuroshiro;

  try {
    // Use dynamic import for better compatibility with serverless environments
    const kuroshiroModule = await import("kuroshiro");
    const KuromojiAnalyzerModule = await import("kuroshiro-analyzer-kuromoji");

    // Get the class - might be default export or direct export
    const Kuroshiro = kuroshiroModule.default || kuroshiroModule;
    const KuromojiAnalyzer =
      KuromojiAnalyzerModule.default || KuromojiAnalyzerModule;

    const k = new Kuroshiro();
    await k.init(new KuromojiAnalyzer());
    kuroshiro = k;
    return k;
  } catch (error) {
    console.error(
      "[API] Failed to initialize Kuroshiro:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
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
    const util = (k.constructor as any).Util;
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    return new Response(
      JSON.stringify({
        error: errorMessage,
        stack: errorStack,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
