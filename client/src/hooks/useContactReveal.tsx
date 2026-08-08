import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ContactConsentDialog } from "@/components/ContactConsentDialog";

export type RevealField = "phone" | "website" | "pricing" | "overview" | string;

function storageKey(communityId: number | string) {
  return `reveal_${communityId}`;
}

function loadRevealed(communityId: number | string): Set<string> {
  try {
    const raw = sessionStorage.getItem(storageKey(communityId));
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* sessionStorage unavailable */
  }
  return new Set();
}

/**
 * Manages click-to-reveal gating for a community's contact/pricing fields.
 *
 * - Logged-in families: reveal instantly and silently fire a profile-view referral.
 * - Logged-out families: open the ContactConsentDialog; reveal happens on submit.
 *
 * Render `consentDialog` once in the consuming component.
 */
export function useContactReveal(communityId: number | string, communityName?: string) {
  const { isAuthenticated } = useAuth();
  const [revealed, setRevealed] = useState<Set<string>>(() => loadRevealed(communityId));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingField, setPendingField] = useState<RevealField | undefined>(undefined);

  // Re-load persisted reveals when the community id resolves/changes (e.g. async detail page load).
  useEffect(() => {
    setRevealed(loadRevealed(communityId));
  }, [communityId]);

  const persist = useCallback(
    (next: Set<string>) => {
      try {
        sessionStorage.setItem(storageKey(communityId), JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
    },
    [communityId]
  );

  const markRevealed = useCallback(
    (field: RevealField) => {
      setRevealed((prev) => {
        const next = new Set(prev);
        next.add(field);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const fireReferral = useCallback(
    (field: RevealField) => {
      // Fire-and-forget; reveal never depends on this succeeding.
      apiRequest("POST", `/api/communities/${communityId}/referral-view`, {
        revealedField: field,
      }).catch(() => {});
    },
    [communityId]
  );

  const isRevealed = useCallback(
    (field: RevealField) => isAuthenticated || revealed.has(field),
    [isAuthenticated, revealed]
  );

  const reveal = useCallback(
    (field: RevealField) => {
      if (revealed.has(field)) return;
      if (isAuthenticated) {
        markRevealed(field);
        fireReferral(field);
      } else {
        setPendingField(field);
        setDialogOpen(true);
      }
    },
    [revealed, isAuthenticated, markRevealed, fireReferral]
  );

  const handleConsentRevealed = useCallback(() => {
    if (pendingField) {
      markRevealed(pendingField);
    }
  }, [pendingField, markRevealed]);

  const consentDialog = useMemo(
    () => (
      <ContactConsentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        communityId={Number(communityId)}
        communityName={communityName}
        revealedField={pendingField}
        onRevealed={handleConsentRevealed}
      />
    ),
    [dialogOpen, communityId, communityName, pendingField, handleConsentRevealed]
  );

  return { isRevealed, reveal, consentDialog };
}
