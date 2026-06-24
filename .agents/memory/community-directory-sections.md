---
name: Community directory rich sections are shared
description: Both the directory page and the home Communities tab render ONE component for all rich directory sections.
---

# Community directory rich sections live in one shared component

`client/src/components/CommunityDirectorySections.tsx` owns ALL the rich directory
content (search section + trust/quick-filter badges + verified-only toggle + pinned
"Recommended" grid + admin-sorted grid + recently-discovered carousel + RedTagDeals +
HeroMascotPanel + CareSpectrumSlider + every brand slider + every regional/global
section + benefits bar) plus all the queries/state/refs/helpers that feed them. It
takes a single `showHero` prop (default false) that gates the blue "Community
Directory" hero+stats block.

- `client/src/pages/community-directory.tsx` is now a thin wrapper: Helmet (SEO) +
  NavigationHeader + promo banner + `<main><CommunityDirectorySections showHero /></main>`.
- `client/src/pages/myseniorvalet-home.tsx` Communities tab renders
  `<CommunityDirectorySections />` (no hero) where the embedded `SimplifiedMapPanel`
  used to be.

**Why:** The home Communities tab needed to mirror the full directory richness
without forking ~3000 lines of JSX. One source prevents the two surfaces from
drifting.

**How to apply:** To add/change ANY directory section (new region, new brand slider,
search-bar tweak, filter badge), edit ONLY `CommunityDirectorySections.tsx` — the
change shows up on both `/community-directory` and the home Communities tab
automatically. Do not re-add directory sections directly into either page. The
duplicated react-query queryKeys dedupe network calls, so rendering the component on
both pages does not double-fetch.
