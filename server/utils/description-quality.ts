/**
 * Description quality helpers — decide when an enrichment candidate description
 * should REPLACE the stored one. Golden Data Rule: never downgrade a rich,
 * verified description to a generic template on a background (non-forced) run.
 */

/**
 * Generic auto-generated template descriptions look like
 * "X is a(n) <care type> community located in <city>, <state>." and carry no
 * real information. They are short and follow the fixed sentence shape.
 */
export function isGenericTemplateDescription(desc: string | null | undefined): boolean {
  if (!desc) return false;
  const trimmed = desc.trim();
  if (trimmed.length === 0 || trimmed.length > 350) return false;
  return /\bis\s+an?\s+[a-z0-9\s,\/&-]{0,80}\b(community|facility|residence|home)\s+(located|situated)\s+in\b/i.test(
    trimmed,
  );
}

/**
 * A legacy import bug truncated descriptions to EXACTLY 1000 characters,
 * usually mid-sentence. Detect that fingerprint.
 */
export function isLegacyTruncatedDescription(desc: string | null | undefined): boolean {
  return !!desc && desc.length === 1000;
}

/**
 * Should `candidate` replace `existing`?
 *  - forceRefresh (explicit user/admin action) always overwrites — preserved behavior.
 *  - Missing/short existing descriptions are always upgradable.
 *  - Otherwise upgrade ONLY when the stored description is poor (template pattern
 *    or legacy 1000-char truncation) or the candidate is substantially richer —
 *    and the candidate itself must be meaningful (not a template, not shorter junk).
 */
export function shouldUpgradeDescription(
  existing: string | null | undefined,
  candidate: string | null | undefined,
  forceRefresh: boolean,
): boolean {
  const cand = (candidate || "").trim();
  if (!cand || cand.length <= 50) return false;
  const existingTrimmed = (existing || "").trim();
  if (cand === existingTrimmed) return false;

  // Explicit refresh (admin/logged-in user) keeps overwriting as before.
  if (forceRefresh) return true;

  // Nothing meaningful stored — fill the gap.
  if (existingTrimmed.length < 50) return true;

  // Non-forced runs must never write a template over real content.
  if (isGenericTemplateDescription(cand)) return false;

  const existingIsPoor =
    isGenericTemplateDescription(existingTrimmed) ||
    isLegacyTruncatedDescription(existing || "");

  if (existingIsPoor) {
    // Candidate must be real prose, meaningfully informative.
    return cand.length >= 200;
  }

  // Existing looks like real content — only replace with a SUBSTANTIALLY richer
  // candidate (never downgrade on background runs).
  return cand.length >= 300 && cand.length >= existingTrimmed.length * 1.5;
}
