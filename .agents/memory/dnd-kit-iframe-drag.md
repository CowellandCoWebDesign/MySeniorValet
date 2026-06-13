---
name: dnd-kit drag unreliable in Replit preview iframe
description: Why dnd-kit pointer drag "appears broken" in the admin and the fallback pattern to use.
---

# dnd-kit pointer drag is unreliable inside the Replit preview/Canvas iframe

dnd-kit's PointerSensor relies on pointer events / setPointerCapture, which behave
unreliably inside the nested Replit workspace preview iframe (and Canvas embeds).
A correct dnd-kit sortable setup can look "broken" there because the drag never
initiates — yet the same code works in a standalone browser tab.

**Rule:** for any admin reorder UI, always provide explicit move-up / move-down
buttons as the primary, iframe-safe control. Keep dnd-kit drag as a bonus, not the
only path. This matches the community picker (which already used up/down arrows).

**Why:** users administer the app through the embedded preview, where drag silently
fails; an arrow-button path guarantees reordering works everywhere (preview, touch,
real tab).

**How to apply:** centralize the persist logic (optimistic local order -> PATCH
positions -> invalidate -> refetch -> clear) into one helper shared by both the
drag handler and the button handler, and gate it with an in-flight guard
(`isReordering`) so rapid clicks/drag can't fire overlapping position writes that
race and clobber the final order. Disable the buttons while a reorder is pending.
