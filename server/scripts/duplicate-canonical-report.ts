/**
 * Duplicate-community report + SAFE canonical interim.
 *
 * REPORT-FIRST (default): starts from the existing DuplicateDetectionService
 * candidate groups (same city/state, ≥85% normalized-name similarity or ≥90%
 * address similarity), then applies STRICTER verification before a pair is
 * accepted — the service's normalizer strips most senior-living words, so
 * unrelated facilities can reduce to empty strings and compare as 100%
 * similar. Verified rules (per secondary vs chosen primary):
 *   • exact raw-name match (lowercased, punctuation-insensitive, ALL words kept), OR
 *   • normalized names BOTH ≥4 chars with ≥88% similarity AND ≥1 piece of
 *     corroborating evidence: address ≥80% similar, same phone digits, or
 *     same website domain.
 * Anything else is dropped (conservative — this feeds a destructive action).
 * Writes reports/duplicate-groups.json. NO data is changed.
 *
 * --apply: writes a `duplicate_of:<primaryId>` entry into data_quality_flags
 * on each VERIFIED secondary. Every SEO surface then emits rel=canonical →
 * primary + noindex,follow and drops secondaries from sitemaps
 * (shared/community-indexability.ts). Fully reversible (array_remove); no
 * merging, no deleting.
 *
 * Usage:
 *   npx tsx server/scripts/duplicate-canonical-report.ts            # report only
 *   npx tsx server/scripts/duplicate-canonical-report.ts --apply    # flag secondaries
 */
import { db } from '../db';
import { communities } from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import { DuplicateDetectionService } from '../services/duplicate-detection-service';
import { DUPLICATE_OF_FLAG_PREFIX } from '@shared/community-indexability';
import * as fs from 'fs/promises';
import * as path from 'path';

const APPLY = process.argv.includes('--apply');

// ── Local matchers (stricter than the service normalizer) ──────────────────
const rawKey = (name: string) =>
  (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const serviceNormalize = (name: string) =>
  (name || '')
    .toLowerCase()
    .replace(/\b(the|a|an)\b/g, '')
    .replace(/\b(senior|living|care|center|centre|home|homes|facility|community|residence|manor|place|court|house|village|estates?|gardens?|heights?|park|plaza|towers?)\b/gi, '')
    .replace(/\b(assisted|memory|skilled|nursing|independent|retirement)\b/gi, '')
    .replace(/[^a-z0-9]/g, '');

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}
const similarity = (a: string, b: string) => {
  if (!a || !b) return 0;
  const max = Math.max(a.length, b.length);
  return max === 0 ? 0 : ((max - levenshtein(a, b)) / max) * 100;
};
const phoneDigits = (p?: string | null) => (p || '').replace(/\D/g, '').slice(-10);
const domainOf = (w?: string | null) => {
  try { return w ? new URL(w.startsWith('http') ? w : `https://${w}`).hostname.replace(/^www\./, '') : ''; }
  catch { return ''; }
};
const addrKey = (a?: string | null) => (a || '').toLowerCase().replace(/[^a-z0-9]/g, '');

interface Row {
  id: number; name: string; address: string | null; phone: string | null;
  website: string | null; isActive: boolean | null; isHidden: boolean | null;
  dataQualityFlags: string[] | null;
}

function verifiedDuplicate(a: Row, b: Row): { verified: boolean; evidence: string[] } {
  const evidence: string[] = [];
  if (rawKey(a.name) && rawKey(a.name) === rawKey(b.name)) {
    return { verified: true, evidence: ['exact_name'] };
  }
  const n1 = serviceNormalize(a.name);
  const n2 = serviceNormalize(b.name);
  const nameOk = n1.length >= 4 && n2.length >= 4 && similarity(n1, n2) >= 88;
  if (!nameOk) return { verified: false, evidence };
  const aSim = similarity(addrKey(a.address), addrKey(b.address));
  if (a.address && b.address && aSim >= 80) evidence.push(`address:${aSim.toFixed(0)}%`);
  const p1 = phoneDigits(a.phone), p2 = phoneDigits(b.phone);
  if (p1 && p1.length === 10 && p1 === p2) evidence.push('phone');
  const d1 = domainOf(a.website), d2 = domainOf(b.website);
  if (d1 && d1 === d2) evidence.push('website');
  return { verified: evidence.length > 0, evidence: ['name≥88%', ...evidence] };
}

const completeness = (r: Row) =>
  (r.address ? 2 : 0) + (r.phone ? 1 : 0) + (r.website ? 1 : 0) + (r.name?.length || 0) / 1000;

async function main() {
  const service = new DuplicateDetectionService();
  const candidateGroups = await service.findDuplicates(85);

  const allIds = candidateGroups.flatMap((g) => [g.primaryId, ...g.duplicates.map((d) => d.id)]);
  const rows: Row[] = allIds.length
    ? await db
        .select({
          id: communities.id, name: communities.name, address: communities.address,
          phone: communities.phone, website: communities.website,
          isActive: communities.isActive, isHidden: communities.isHidden,
          dataQualityFlags: communities.dataQualityFlags,
        })
        .from(communities)
        .where(inArray(communities.id, allIds))
    : [];
  const rowById = new Map(rows.map((r) => [r.id, r]));
  const isPublic = (id: number) => {
    const r = rowById.get(id);
    return !!r && r.isHidden !== true && r.isActive !== false;
  };

  const report: any[] = [];
  let secondariesTotal = 0;
  let droppedPairs = 0;
  for (const g of candidateGroups) {
    const members = [g.primaryId, ...g.duplicates.map((d) => d.id)]
      .filter(isPublic)
      .map((id) => rowById.get(id)!)
      .filter(Boolean);
    if (members.length < 2) continue;
    // Primary = most complete row
    const primary = [...members].sort((a, b) => completeness(b) - completeness(a))[0];
    const secondaries: any[] = [];
    for (const m of members) {
      if (m.id === primary.id) continue;
      const v = verifiedDuplicate(primary, m);
      if (v.verified) secondaries.push({ id: m.id, name: m.name, evidence: v.evidence });
      else droppedPairs++;
    }
    if (!secondaries.length) continue;
    secondariesTotal += secondaries.length;
    report.push({
      location: g.primaryLocation,
      primary: { id: primary.id, name: primary.name },
      secondaries,
    });
  }

  const outDir = path.join(process.cwd(), 'reports');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, 'duplicate-groups.json');
  await fs.writeFile(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), verification: 'exact-name OR (normalized-name≥4chars ≥88% + address/phone/website evidence)', groups: report }, null, 2));

  console.log(`════════ DUPLICATE REPORT (verified) ════════`);
  console.log(`Candidate groups from service:      ${candidateGroups.length}`);
  console.log(`VERIFIED groups (public, ≥1 dup):   ${report.length}`);
  console.log(`Verified secondary rows:            ${secondariesTotal}`);
  console.log(`Candidate pairs REJECTED:           ${droppedPairs}`);
  console.log(`Report written to:                  ${outPath}`);

  if (!APPLY) {
    console.log('\nReport-only run. Re-run with --apply to flag verified secondaries with');
    console.log(`${DUPLICATE_OF_FLAG_PREFIX}<primaryId> (canonical interim — no merge/delete).`);
    process.exit(0);
  }

  let applied = 0;
  for (const g of report) {
    for (const s of g.secondaries) {
      const flag = `${DUPLICATE_OF_FLAG_PREFIX}${g.primary.id}`;
      const existing = (rowById.get(s.id)?.dataQualityFlags || []) as string[];
      const withoutOld = existing.filter((f) => !f.startsWith(DUPLICATE_OF_FLAG_PREFIX));
      await db
        .update(communities)
        .set({ dataQualityFlags: [...withoutOld, flag], updatedAt: new Date() })
        .where(eq(communities.id, s.id));
      applied++;
    }
  }
  console.log(`\n✅ Applied ${DUPLICATE_OF_FLAG_PREFIX} flags to ${applied} verified secondary rows.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Duplicate report failed:', err);
  process.exit(1);
});
