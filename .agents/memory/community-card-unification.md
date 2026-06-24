---
name: Canonical community card
description: One CommunityCard component unifies display card surfaces; which specialized cards were intentionally left alone and why.
---

# Canonical community card

`client/src/components/CommunityCard.tsx` is the ONE canonical community card. Props: `{ community, variant: "grid"|"compact"|"list", language?, onSelect? }`. It owns price resolution ("Contact for pricing" unless verified), honest badge resolution (Government-Verified / Operator-Verified / Featured — NEVER from `is_verified`), rating, care chips, SEO link via `getCommunityUrl()`, bilingual nameFr/addressFr, dark mode + reduced-motion, and a Building2 placeholder (no emoji mascot).

Rolled out across the display surfaces (home sections, directory, map panels, geographic/HUD/dynamic/highest-rated/verified/featured sections, ai-search-intelligence) replacing the legacy `FeaturedExcellenceCard` / `EnhancedCommunityCard` / `PrioritizedCommunityCard`.

**Intentionally NOT migrated** (leave as-is): `chatkit/CommunityCard.tsx`, the inline `ChatCommunityCard` in `MySeniorValetChatKit.tsx`, and `bilingual-community-card.tsx` (used by `canada.tsx`).

**Why:** these carry interactive functionality the canonical card does not replicate — consent-gated contact reveal (`useContactReveal` phone/website), virtual-tour/availability actions. Replacing them would DELETE that functionality, which violates the repo's CRITICAL REMOVAL AUTHORIZATION RULE (no removing features without explicit user approval).

**How to apply:** if asked to extend card unification to chat/bilingual surfaces, first either add the missing interactive features to the canonical card or get explicit user sign-off before dropping them. `SimplifiedCommunityCard.tsx` is dead code (imported nowhere) — safe to ignore or delete.
