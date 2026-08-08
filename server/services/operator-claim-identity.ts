export interface OperatorClaimRequestIdentity {
  user?: {
    id?: unknown;
    claims?: { sub?: unknown };
  };
  session?: {
    userId?: unknown;
    user?: { id?: unknown };
  };
}

/**
 * Resolve the authenticated account ID across the app's custom session auth
 * and legacy OIDC-shaped requests. Custom session identity is authoritative.
 */
export function getAuthenticatedOperatorUserId(
  request: OperatorClaimRequestIdentity,
): number | null {
  const candidate =
    request.session?.userId ??
    request.session?.user?.id ??
    request.user?.id ??
    request.user?.claims?.sub;
  const id = Number(candidate);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function requireAuthenticatedOperatorUserId(
  request: OperatorClaimRequestIdentity,
): number {
  const id = getAuthenticatedOperatorUserId(request);
  if (!id) throw new Error("Authenticated operator account required");
  return id;
}