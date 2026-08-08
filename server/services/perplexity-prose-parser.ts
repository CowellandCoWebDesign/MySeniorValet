/**
 * Perplexity prose parser — converts the natural-language enrichment summary
 * (perplexityData.searchContent) into structured facts.
 *
 * The old label-based parsers ("CURRENT PRICING: ...") extracted nothing from
 * natural prose like:
 *   "Monthly rates range from $3,000–$5,000/month for assisted living;
 *    semi-private memory care starts at $3,200. The community is licensed
 *    for 80 residents and currently has a waitlist."
 * This parser works on real sentences: it finds dollar amounts with their
 * surrounding care-level / room-type context, capacity statements, unit
 * types, phone numbers, websites, and availability status.
 *
 * Golden Data Rule: every field is null/empty unless the prose actually
 * contains it — nothing is fabricated or defaulted.
 */

export interface ParsedPricingEntry {
  /** Human label, e.g. "Memory Care (semi-private)" or "Assisted Living". */
  label: string;
  min: number;
  max?: number;
  /** The sentence fragment the entry was extracted from (for transparency). */
  raw: string;
}

export interface ParsedProseFacts {
  pricingEntries: ParsedPricingEntry[];
  /** Overall min/max across all extracted amounts (sanity-bounded). */
  priceRange: { min: number; max: number } | null;
  /** Distinct unit/room types mentioned, e.g. ["Studio", "One Bedroom"]. */
  unitTypes: string[];
  /** Licensed capacity / bed count, when stated. */
  capacity: number | null;
  phone: string | null;
  website: string | null;
  availability: "Available" | "Waitlist" | "Full" | null;
}

// Senior-living pricing sanity bounds (monthly USD).
const MIN_PLAUSIBLE = 500;
const MAX_PLAUSIBLE = 30000;

const CARE_LEVELS: Array<{ re: RegExp; label: string }> = [
  { re: /memory\s*care/i, label: "Memory Care" },
  { re: /assisted\s*living/i, label: "Assisted Living" },
  { re: /independent\s*living/i, label: "Independent Living" },
  { re: /skilled\s*nursing|nursing\s*home/i, label: "Skilled Nursing" },
  { re: /respite/i, label: "Respite Care" },
];

const ROOM_TYPES: Array<{ re: RegExp; label: string }> = [
  { re: /semi[-\s]?private/i, label: "Semi-Private" },
  { re: /private\s+(?:room|suite)/i, label: "Private Room" },
  { re: /companion/i, label: "Companion Suite" },
  { re: /shared\s+(?:room|suite)/i, label: "Shared Room" },
  { re: /\bstudio/i, label: "Studio" },
  { re: /\b(?:one|1)[-\s]?bed(?:room)?/i, label: "One Bedroom" },
  { re: /\b(?:two|2)[-\s]?bed(?:room)?/i, label: "Two Bedroom" },
];

/** Strip citation artifacts like [1], [2][3] that break sentence parsing. */
function stripCitations(text: string): string {
  return text.replace(/\[\d+\]/g, " ");
}

function parseMoney(raw: string): number | null {
  const n = parseInt(raw.replace(/[$,\s]/g, ""), 10);
  if (!Number.isFinite(n)) return null;
  if (n < MIN_PLAUSIBLE || n > MAX_PLAUSIBLE) return null;
  return n;
}

/**
 * Split prose into segments that each carry local pricing context.
 * Sentences and semicolon clauses are natural boundaries ("...; semi-private
 * memory care $3,200" must not inherit the previous clause's care level).
 */
function segmentize(text: string): string[] {
  return text
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function labelForSegment(segment: string): string {
  const care = CARE_LEVELS.find((c) => c.re.test(segment))?.label;
  const room = ROOM_TYPES.find((r) => r.re.test(segment))?.label;
  if (care && room) return `${care} (${room})`;
  if (care) return care;
  if (room) return room;
  return "Monthly Rate";
}

/**
 * Label for a specific dollar amount: use a local window around the match so
 * "assisted living starting at $7,562 and memory care starting at $10,455"
 * yields two correctly-paired entries instead of both taking the segment's
 * first care level. Falls back to the whole-segment label.
 */
function labelForAmountAt(segment: string, matchStart: number, matchEnd: number): string {
  // Prefer the NEAREST care-level/room-type mention BEFORE the amount
  // ("assisted living starting at $7,562 and memory care starting at $10,455"
  // must pair each amount with its own preceding label), then fall back to a
  // short window after it ("$3,000–$5,000/month for assisted living").
  // Distance-based: the mention CLOSEST to the amount wins, whether it comes
  // before ("assisted living starting at $7,562") or after ("$7,562 for
  // assisted living"). Both phrasings occur in real Perplexity prose.
  const nearestMention = (defs: Array<{ re: RegExp; label: string }>): string | null => {
    const before = segment.slice(Math.max(0, matchStart - 100), matchStart);
    // The after-window must not cross a conjunction/comma/next-amount boundary,
    // or "$4,100 and one-bedroom units at $5,300" would steal the NEXT
    // amount's label for the first amount.
    const after = segment
      .slice(matchEnd, Math.min(segment.length, matchEnd + 60))
      .split(/,|;|\$|\band\b|\bwhile\b|\bwhereas\b/i)[0];
    let best: { dist: number; label: string } | null = null;
    for (const d of defs) {
      const re = new RegExp(d.re.source, "gi");
      let m: RegExpExecArray | null;
      while ((m = re.exec(before)) !== null) {
        const dist = before.length - (m.index + m[0].length);
        if (!best || dist < best.dist) best = { dist, label: d.label };
      }
      const am = new RegExp(d.re.source, "i").exec(after);
      if (am && (!best || am.index < best.dist)) best = { dist: am.index, label: d.label };
    }
    return best?.label ?? null;
  };
  const care = nearestMention(CARE_LEVELS);
  const room = nearestMention(ROOM_TYPES);
  if (care && room) return `${care} (${room})`;
  if (care) return care;
  if (room) return room;
  return labelForSegment(segment);
}

// $3,000–$5,000 | $3,000 - $5,000 | $3,000 to $5,000
const RANGE_RE =
  /\$\s?([\d,]{3,7})(?:\.\d{2})?\s?(?:[–—-]|to|through)\s?\$?\s?([\d,]{3,7})(?:\.\d{2})?/gi;
const SINGLE_RE = /\$\s?([\d,]{3,7})(?:\.\d{2})?/g;

export function parsePerplexityProse(content: string): ParsedProseFacts {
  const facts: ParsedProseFacts = {
    pricingEntries: [],
    priceRange: null,
    unitTypes: [],
    capacity: null,
    phone: null,
    website: null,
    availability: null,
  };
  if (!content || typeof content !== "string") return facts;
  const text = stripCitations(content);

  // ── Pricing ────────────────────────────────────────────────────────────────
  const seenLabels = new Set<string>();
  for (const segment of segmentize(text)) {
    if (!segment.includes("$")) continue;
    // Skip clearly non-monthly amounts (deposits, one-time fees) when labeled.
    const isOneTime = /deposit|one[-\s]?time|entrance\s+fee|community\s+fee|application\s+fee/i.test(segment);
    if (isOneTime) continue;

    const consumed = new Set<number>();
    let matched = false;

    RANGE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = RANGE_RE.exec(segment)) !== null) {
      const min = parseMoney(m[1]);
      const max = parseMoney(m[2]);
      if (min == null || max == null || max < min) continue;
      consumed.add(min);
      consumed.add(max);
      const label = labelForAmountAt(segment, m.index, m.index + m[0].length);
      const key = `${label}:${min}:${max}`;
      if (!seenLabels.has(key)) {
        seenLabels.add(key);
        facts.pricingEntries.push({ label, min, max, raw: segment.slice(0, 200) });
      }
      matched = true;
    }

    if (!matched) {
      SINGLE_RE.lastIndex = 0;
      while ((m = SINGLE_RE.exec(segment)) !== null) {
        const amount = parseMoney(m[1]);
        if (amount == null || consumed.has(amount)) continue;
        const label = labelForAmountAt(segment, m.index, m.index + m[0].length);
        const key = `${label}:${amount}`;
        if (seenLabels.has(key)) continue;
        seenLabels.add(key);
        facts.pricingEntries.push({ label, min: amount, raw: segment.slice(0, 200) });
      }
    }
  }

  if (facts.pricingEntries.length > 0) {
    const mins = facts.pricingEntries.map((e) => e.min);
    const maxs = facts.pricingEntries.map((e) => e.max ?? e.min);
    facts.priceRange = { min: Math.min(...mins), max: Math.max(...maxs) };
  }

  // ── Unit types ─────────────────────────────────────────────────────────────
  for (const rt of ROOM_TYPES) {
    if (rt.re.test(text) && !facts.unitTypes.includes(rt.label)) {
      facts.unitTypes.push(rt.label);
    }
  }

  // ── Capacity ───────────────────────────────────────────────────────────────
  const capPatterns = [
    /licensed\s+(?:for|capacity\s+of)\s+(\d{1,4})/i,
    /capacity\s+(?:of|for|is)\s+(\d{1,4})/i,
    /(?:accommodates|serves|houses|home\s+to)\s+(?:up\s+to\s+)?(\d{1,4})\s+(?:residents|seniors|people)/i,
    /(\d{1,4})[-\s](?:bed|unit|apartment|resident)\s+(?:community|facility|home|building)/i,
    /(?:has|with|offers|features)\s+(\d{1,4})\s+(?:beds|units|apartments|residences)/i,
  ];
  for (const re of capPatterns) {
    const m = text.match(re);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 4 && n <= 2000) {
        facts.capacity = n;
        break;
      }
    }
  }

  // ── Phone ──────────────────────────────────────────────────────────────────
  const phoneMatch = text.match(/(?:\(\d{3}\)\s?|\b\d{3}[-.\s])\d{3}[-.\s]\d{4}\b/);
  if (phoneMatch) facts.phone = phoneMatch[0].trim();

  // ── Website (prefer non-directory hosts) ───────────────────────────────────
  const DIRECTORY_HOSTS =
    /aplaceformom|caring\.com|seniorly|seniorliving|seniorhousingnet|yelp\.|facebook\.|google\.|medicare\.gov|nursinghomes|assistedliving\.org/i;
  const urlMatches = text.match(/https?:\/\/[^\s)\]"',>]+|(?:^|\s)(www\.[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s)\]"',>]*)?)/gi) || [];
  for (const raw of urlMatches) {
    const candidate = raw.trim().replace(/[.,;:]+$/, "");
    if (DIRECTORY_HOSTS.test(candidate)) continue;
    facts.website = candidate.startsWith("http") ? candidate : `https://${candidate}`;
    break;
  }

  // ── Availability ───────────────────────────────────────────────────────────
  if (/wait[-\s]?list/i.test(text)) {
    facts.availability = "Waitlist";
  } else if (/(?:fully\s+occupied|no\s+(?:current\s+)?(?:availability|vacanc)|at\s+(?:full\s+)?capacity)/i.test(text)) {
    facts.availability = "Full";
  } else if (
    /(?:units?|apartments?|rooms?|openings?)\s+(?:are\s+)?(?:currently\s+)?available|immediate\s+(?:availability|openings?|move[-\s]?in)|accepting\s+new\s+residents|availability:\s*(?:yes|available)/i.test(
      text,
    )
  ) {
    facts.availability = "Available";
  }

  return facts;
}

/**
 * Normalize a free-text availability string (Perplexity's `availability` field
 * or parsed prose) to the communities.availability_status DB enum. Returns null
 * when it can't be mapped — the caller must then SKIP the write (the column has
 * a CHECK constraint; an unmapped value would fail with an opaque 23514).
 */
export function normalizeAvailabilityStatus(
  value: string | null | undefined,
): "Available" | "Waitlist" | "Full" | null {
  if (!value || typeof value !== "string") return null;
  const v = value.toLowerCase();
  if (/wait[-\s]?list/.test(v)) return "Waitlist";
  if (/full|no\s+(?:availability|vacanc)|occupied|capacity/.test(v)) return "Full";
  if (/available|opening|vacanc|accepting|immediate/.test(v)) return "Available";
  return null;
}
