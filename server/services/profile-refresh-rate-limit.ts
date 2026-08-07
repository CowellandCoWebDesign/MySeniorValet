import crypto from "crypto";
import { sql } from "drizzle-orm";
import { db } from "../db";

export const PROFILE_REFRESH_REQUESTS_PER_HOUR = 5;

export interface ProfileRefreshRateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Shared, durable cost guard for anonymous family refreshes.
 *
 * Only a salted one-way caller fingerprint is stored. The atomic upsert makes
 * the hourly quota consistent across processes and deployment instances.
 */
export async function consumeProfileRefreshRateLimit(
  callerAddress: string,
): Promise<ProfileRefreshRateLimitResult> {
  const salt = process.env.SESSION_SECRET || "myseniorvalet-profile-refresh";
  const callerHash = crypto
    .createHash("sha256")
    .update(`${salt}\0${callerAddress}`)
    .digest("hex");

  const result = await db.execute(sql`
    INSERT INTO profile_refresh_rate_limits (
      caller_hash,
      window_started_at,
      request_count,
      updated_at
    )
    VALUES (
      ${callerHash},
      date_trunc('hour', NOW()),
      1,
      NOW()
    )
    ON CONFLICT (caller_hash, window_started_at)
    DO UPDATE SET
      request_count = profile_refresh_rate_limits.request_count + 1,
      updated_at = NOW()
    WHERE profile_refresh_rate_limits.request_count < ${PROFILE_REFRESH_REQUESTS_PER_HOUR}
    RETURNING request_count, window_started_at
  `);

  const row = (result as any).rows?.[0] as
    | { request_count: number | string; window_started_at: Date | string }
    | undefined;
  if (!row) {
    const secondsIntoHour = Math.floor(Date.now() / 1000) % 3600;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, 3600 - secondsIntoHour),
    };
  }

  const requestCount = Number(row.request_count);
  return {
    allowed: true,
    remaining: Math.max(0, PROFILE_REFRESH_REQUESTS_PER_HOUR - requestCount),
    retryAfterSeconds: 0,
  };
}