/**
 * Gemini 2.5 Flash Enrichment Service
 * =====================================
 * Uses Google Gemini 2.5 Flash via the v1 REST API (free tier).
 * The @google/generative-ai library uses v1beta which doesn't expose
 * the same model set, so we call the REST API directly with fetch().
 *
 * Free tier limits: 1,500 req/day, 15 req/min (gemini-2.5-flash).
 * Requires GEMINI_API_KEY (free from https://aistudio.google.com/app/apikey).
 * Falls back gracefully (sourceType: "none") when key is absent or quota is hit.
 */

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1/models";

export interface GeminiEnrichmentResult {
  about?: string;
  website?: string;
  phone?: string;
  careTypes?: string[];
  amenities?: string[];
  pricing?: string;
  sourceType: "gemini_search" | "none";
}

export async function enrichCommunityWithGemini(params: {
  name: string;
  city: string;
  state: string;
}): Promise<GeminiEnrichmentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { sourceType: "none" };
  }

  const prompt = `Return a JSON object for this senior living community. Output ONLY valid JSON — no explanation, no corrections, no markdown.

Community name: ${params.name}
State: ${params.state}

Required JSON (use null for unknown fields, keep "about" to 1 sentence):
{"about":"one sentence description","website":null,"phone":null,"careTypes":["e.g. Assisted Living"],"amenities":["e.g. Dining"],"pricing":null}

Output ONLY the JSON. No other text.`;

  try {
    const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });

    if (!ok(res)) {
      const errBody = await res.json().catch(() => ({})) as any;
      const status = res.status;
      const message = errBody?.error?.message ?? res.statusText;

      if (status === 429 || /quota|rate.?limit|resource.?exhausted/i.test(message)) {
        console.warn(`⚠️ Gemini quota/rate-limit [${status}] for "${params.name}" — falling back to DuckDuckGo`);
      } else {
        console.error(`❌ Gemini API error [${status}] for "${params.name}": ${message}`);
      }
      return { sourceType: "none" };
    }

    const data = await res.json() as any;
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!text) {
      console.log(`⚠️ Gemini returned empty text for "${params.name}"`);
      return { sourceType: "none" };
    }

    // responseMimeType: "application/json" guarantees clean JSON — try direct parse first
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed: any;
    try {
      // Try direct parse (works when responseMimeType=application/json)
      parsed = JSON.parse(cleaned);
    } catch {
      // Fall back to regex extraction
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`⚠️ Gemini returned no parseable JSON for "${params.name}" — raw: ${text.slice(0, 300)}`);
        return { sourceType: "none" };
      }
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        console.warn(`⚠️ Gemini JSON parse failed for "${params.name}" — raw: ${text.slice(0, 300)}`);
        return { sourceType: "none" };
      }
    }

    const enriched: GeminiEnrichmentResult = {
      about: parsed.about && parsed.about !== "null" ? String(parsed.about) : undefined,
      website: parsed.website && parsed.website !== "null" ? String(parsed.website) : undefined,
      phone: parsed.phone && parsed.phone !== "null" ? String(parsed.phone) : undefined,
      careTypes: Array.isArray(parsed.careTypes) && parsed.careTypes.length ? parsed.careTypes : undefined,
      amenities: Array.isArray(parsed.amenities) && parsed.amenities.length ? parsed.amenities : undefined,
      pricing: parsed.pricing && parsed.pricing !== "null" ? String(parsed.pricing) : undefined,
      sourceType: "gemini_search",
    };

    if (!enriched.about && !enriched.careTypes && !enriched.website) {
      console.log(`⚠️ Gemini returned all-null data for "${params.name}"`);
      return { sourceType: "none" };
    }

    console.log(
      `🤖 Gemini enriched "${params.name}": ${enriched.about?.length ?? 0} chars` +
        (enriched.website ? `, site: ${enriched.website}` : "") +
        (enriched.careTypes?.length ? `, care: ${enriched.careTypes.join(", ")}` : ""),
    );

    return enriched;
  } catch (err: any) {
    const message = String(err?.message ?? err ?? "");
    if (/timeout|abort/i.test(message)) {
      console.warn(`⏱️ Gemini timeout for "${params.name}"`);
    } else {
      console.error(`❌ Gemini fetch error for "${params.name}":`, message.slice(0, 200));
    }
    return { sourceType: "none" };
  }
}

function ok(res: Response): boolean {
  return res.status >= 200 && res.status < 300;
}
