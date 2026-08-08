/**
 * Self-heal enrichment backoff policy (pure, dependency-free so it is unit
 * testable in isolation).
 *
 * The public self-heal endpoint re-bills an enrichment run every time a
 * community detail page loads without content. Communities that genuinely have
 * no discoverable data online would otherwise retry forever. This policy widens
 * the retry cooldown after each consecutive run that persisted NO new content,
 * and eventually marks the community terminal ("no_data") so it goes quiet until
 * an admin forces a retry.
 */

/**
 * Consecutive no-content self-heal runs after which a community is marked
 * terminal ("no_data") and stops auto-retrying until an admin forces it.
 */
export const SELF_HEAL_TERMINAL_ATTEMPTS = 4;

/**
 * Required cooldown (hours) before the next self-heal, given the number of
 * consecutive runs that found no new content. Escalates 24h → 7d → 30d so we
 * stop re-billing communities that genuinely have nothing online, while still
 * allowing periodic retries. attempts<=1 (fresh / just-succeeded / first
 * failure) keeps the original 24h floor.
 */
export function selfHealCooldownHours(consecutiveNoDataAttempts: number): number {
  if (consecutiveNoDataAttempts <= 1) return 24; // first failure → 24h
  if (consecutiveNoDataAttempts === 2) return 24 * 7; // second → 7d
  return 24 * 30; // third and beyond → 30d (until terminal)
}
