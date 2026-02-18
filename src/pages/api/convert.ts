
import type { APIRoute } from 'astro';
// @ts-ignore
import _Kuroshiro from 'kuroshiro';
// @ts-ignore
import _KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

// Handle CJS/ESM interop
const Kuroshiro = _Kuroshiro.default || _Kuroshiro;
const KuromojiAnalyzer = _KuromojiAnalyzer.default || _KuromojiAnalyzer;

console.log('[API] Kuroshiro import:', typeof Kuroshiro, Kuroshiro);
console.log('[API] KuromojiAnalyzer import:', typeof KuromojiAnalyzer, KuromojiAnalyzer);

let kuroshiro: any = null;

async function getKuroshiro() {
    if (kuroshiro) return kuroshiro;

    const k = new Kuroshiro();
    console.log('[API] Initializing Kuroshiro with KuromojiAnalyzer');
    
    // Initialize with KuromojiAnalyzer
    // KuromojiAnalyzer defaults to loading dict from node_modules/kuromoji/dict
    // We might need to specify dictPath if it fails later, but let's fix the constructor first.
    await k.init(new KuromojiAnalyzer());
    kuroshiro = k;
    return k;
}

export const GET: APIRoute = async ({ request, url }) => {
    // Debug log
    const queryText = url.searchParams.get('text');
    console.log(`[API] convert request. URL: ${url.toString()}, text param: ${queryText}`);

    const text = queryText;

    if (!text) {
        console.error('[API] No text provided');
        return new Response(JSON.stringify({ error: 'No text provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const k = await getKuroshiro();
        let result = await k.convert(text, { to: 'hiragana' });
        
        // Post-process with kanaToHiragana to ensure Katakana is converted
        // Kuroshiro.Util might be available on the instance or class
        // Note: Logs showed 'kanaToHiragna' (typo in lib?) so we check both.
        const util = Kuroshiro.Util;
        if (util) {
            const converter = util.kanaToHiragana || util.kanaToHiragna;
            if (converter) {
                // Check if we have katakana
                if ((util.isKatakana && util.isKatakana(result)) || (util.hasKatakana && util.hasKatakana(result))) {
                    console.log('[API] Post-processing Katakana with', converter.name);
                    result = converter(result);
                }
            }
        }

        return new Response(JSON.stringify({ converted: result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('[API] Conversion error:', error);
        return new Response(JSON.stringify({ error: 'Conversion failed', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
