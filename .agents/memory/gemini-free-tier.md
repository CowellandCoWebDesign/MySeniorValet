---
name: Gemini free-tier integration
description: How to use Gemini AI correctly on free AI Studio tier — model names, API version, working patterns.
---

# Gemini Free-Tier Integration

## The rule
Use **native `fetch()`** to the **v1 REST API** with model **`gemini-2.5-flash`**.
Do NOT use `@google/generative-ai` library — it uses `v1beta` which has a different model set.

## Why the library fails
- `@google/generative-ai` v0.24.1 hits `https://generativelanguage.googleapis.com/v1beta/models/...`
- Free-tier model names like `gemini-1.5-flash`, `gemini-1.5-flash-8b`, `gemini-2.0-flash-exp` do NOT exist on v1beta → 404
- `gemini-2.0-flash` exists on v1beta but has `limit: 0` on free tier → 429 immediately

## Working model
`gemini-2.5-flash` on `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`
- Free tier confirmed working
- Occasional 503 (transient load spike) — retry-safe

## generationConfig gotchas
- `responseMimeType` (camelCase) → 400 "Cannot find field"
- `response_mime_type` (snake_case) → 400 "Cannot find field"  
- Neither is supported on this API version; just strip them
- Safe fields: `temperature`, `maxOutputTokens`
- Use `maxOutputTokens: 2048` for JSON responses — 1024 is too low if Gemini adds verbose text

## Prompt patterns that cause failures
- Including city name in prompt → Gemini writes "correction" tangents when DB city is wrong
  (e.g. "Pearland, TX" for a community actually in "Denton, TX") → bloats about field → truncated JSON
- Long verbose prompts → Gemini exceeds token limit before closing `}`

## Working prompt pattern
```
Return a JSON object for this senior living community. Output ONLY valid JSON — no explanation, no corrections, no markdown.

Community name: {name}
State: {state}    ← state only, NOT city

Required JSON (use null for unknown fields, keep "about" to 1 sentence):
{"about":"one sentence description","website":null,"phone":null,"careTypes":[],"amenities":[],"pricing":null}

Output ONLY the JSON. No other text.
```

## JSON parsing
With no `responseMimeType` support, Gemini returns text. Parse strategy:
1. Strip markdown fences
2. Try `JSON.parse(cleaned)` directly
3. Fall back to regex `\{[\s\S]*\}` extraction
4. Fall back to regex then parse again

## How to apply
See `server/services/gemini-enrichment-service.ts` for the full implementation.
