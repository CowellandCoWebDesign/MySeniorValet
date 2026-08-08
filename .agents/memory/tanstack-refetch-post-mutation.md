---
name: TanStack Query refetch after mutation
description: invalidateQueries alone won't re-fetch queries that have a long staleTime; the correct pattern for instant UI updates after a write is setQueryData + refetchQueries.
---

## The rule
After a backend write (enrichment, save, etc.) that should refresh a long-lived cached query:
1. Call `queryClient.setQueryData(key, old => ({...old, ...newFields}))` immediately — the UI updates in the same render cycle.
2. Call `queryClient.refetchQueries({ queryKey: key })` — forces a real network fetch so all other fields (not just the ones you patched) stay in sync.
Do NOT rely on `invalidateQueries` alone when `staleTime` is > a few seconds.

**Why:** `invalidateQueries` marks the query stale but only triggers a re-fetch on the next mount or focus event. With `staleTime: 30 * 60 * 1000` (30 min) the component is still mounted and considers data fresh, so the refetch is silently skipped. The carousel shows the old (empty) photos forever even though the DB was updated.

**How to apply:** Any time a mutation writes data that a mounted component should reflect immediately, use the setQueryData + refetchQueries pair. Applies to community enrichment, admin photo updates, and any other write that feeds a community-detail query.
