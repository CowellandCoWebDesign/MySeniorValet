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
- `client/src/pages/myseniorvalet-home.tsx` Communities tab NO LONGER renders
  `<CommunityDirectorySections />` (removed Task #289). The home tab is now ONE
  admin-driven ordered list (see `home-admin-section-list.md`). `CommunityDirectorySections`
  is now used ONLY by `/community-directory`.

**Why:** The home Communities tab needed to mirror the full directory richness
without forking ~3000 lines of JSX. One source prevents the two surfaces from
drifting.

**How to apply:** To add/change ANY directory section on `/community-directory` (new
region, new brand slider, search-bar tweak, filter badge), edit
`CommunityDirectorySections.tsx`. This NO LONGER affects the home Communities tab —
home is the admin-driven list (`home-admin-section-list.md`), with its own
`CommunitiesSearchBar` + `DynamicCommunitySection`. Do not re-add
`CommunityDirectorySections` to home to change its look; restyle the home components
instead.
