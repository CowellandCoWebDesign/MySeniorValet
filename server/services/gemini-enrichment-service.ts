/**
 * Gemini 2.0 Flash Web-Search Enrichment Service
 * ================================================
 * Uses Google Gemini 2.0 Flash with Search Grounding to enrich community detail
 * pages with live web data. Free tier: 1,500 req/day, 15 req/min.
 *
 * Requires GEMINI_API_KEY (free from https://aistudio.google.com/app/apikey).
 * Falls back gracefully (returns sourceType: "none") when key is absent or
 * quota/rate-limits are hit.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    tools: [{ googleSearch: {} } as any],
  });

  const prompt = `Find current factual information about this senior living community:

Community: ${params.name}
Location: ${params.city}, ${params.state}

Provide a JSON response with these fields (use null for anything not found):
{
  "about": "2-4 sentence description of the community from their own sources",
  "website": "official website URL",
  "phone": "phone number",
  "careTypes": ["array of care types offered, e.g. Assisted Living, Memory Care"],
  "amenities": ["up to 5 key amenities"],
  "pricing": "monthly pricing range if publicly available, otherwise null"
}

Only include verified information from official or reputable sources. Return ONLY the JSON object.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log(`⚠️ Gemini returned no JSON for "${params.name}"`);
      return { sourceType: "none" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const enriched: GeminiEnrichmentResult = {
      about: parsed.about || undefined,
      website: parsed.website || undefined,
      phone: parsed.phone || undefined,
      careTypes: Array.isArray(parsed.careTypes) ? parsed.careTypes : undefined,
      amenities: Array.isArray(parsed.amenities) ? parsed.amenities : undefined,
      pricing: parsed.pricing || undefined,
      sourceType: "gemini_search",
    };

    console.log(
      `🤖 Gemini enrichment: ${enriched.about?.length ?? 0} chars for "${params.name}"` +
        (enriched.website ? `, website: ${enriched.website}` : "") +
        (enriched.phone ? `, phone: ${enriched.phone}` : ""),
    );

    return enriched;
  } catch (err: any) {
    // Detect rate-limit (429) and quota errors — fall through silently
    const status: number | undefined =
      err?.status ?? err?.statusCode ?? err?.response?.status;
    const message: string = String(err?.message ?? "");

    if (status === 429 || /quota|rate.?limit|resource.?exhausted/i.test(message)) {
      console.warn(`⚠️ Gemini rate limited — using DuckDuckGo fallback for "${params.name}"`);
    } else {
      console.error(`❌ Gemini enrichment failed for "${params.name}":`, err);
    }

    return { sourceType: "none" };
  }
}
