---
name: Home Communities tab is one admin-driven section list
description: The home page Communities tab renders a single config-driven ordered list of community sections, fully managed from the admin dashboard.
---

# Home Communities tab = ONE admin-driven ordered section list

The home page "Communities" tab (`client/src/pages/myseniorvalet-home.tsx`,
`HomeSectionRenderer`) renders ONE ordered list sourced from
`home_section_configs` (public read: `GET /api/home-sections/active`, admin CRUD:
`/api/admin/home-sections`). There is NO hardcoded section block on home anymore.

- **Section types** live in `SECTION_TYPES` in `shared/schema.ts`. Data-source types
  (recently_discovered, hud, featured, trending, highest_rated, most_reviewed,
  coastal, location, care_type, brand) flow through `<DynamicCommunitySection>`
  which calls `GET /api/communities/section-data?sectionId=…`. The server reads the
  stored config (the `sectionId` is authoritative — brand/country are NOT query
  params from the client).
- **Widget types** (`red_tag_deals`, `care_spectrum`) render their own rich
  component in `HomeSectionRenderer` (RedTagDeals hideHeader / CareSpectrumSlider),
  not the generic card slider. They have no data-source config — admins can only
  reorder/rename/show-hide them. Admin UI gates this via `WIDGET_SECTION_TYPES`.
- **location** config supports `city`, `state`, AND `country`. Country uses
  `countryAliases()` in `server/routes/communityRoutes.ts` to expand a pick into the
  messy stored variants (Canada→CA/Canada/CAN, Mexico→Mexico/MX/México, Peru→PE/…,
  Cuba→CU/Cuba). DB `country` column is dirty — never match on a single value.
- **brand** config matches `communities.name ILIKE '%brand%'`.

## Additive seeding (never clobber)
`ensureHomeSections()` in `server/routes/adminRoutes.ts` seeds `DEFAULT_HOME_SECTIONS`
idempotently using a `default_key` column (added via idempotent ALTER; also in the
Drizzle schema as `defaultKey`). For each default it: skips if the key already exists;
else CLAIMS a pre-existing unkeyed row matching `section_type` + config "core"
(city/state/country/careType/brand via `configCoreMatches`, ignoring
selectionMode/communityIds/excludeIds); else INSERTS appended at MAX(position)+1.

**Why:** Production already had hand-customized rows (e.g. Featured curated with a
pinned communityIds list, HUD disabled, reordered positions). Claim-by-signature
preserves those edits while still adding the new defaults (brands, FL/PR, countries,
red_tag/care_spectrum). NEVER reseed by row count or DELETE — it would wipe an admin's
curation.

**How to apply:** To add a new default section, append to `DEFAULT_HOME_SECTIONS` with
a NEW stable `key`. To add a new section type: add to `SECTION_TYPES` (schema),
add a runAutoQuery branch (or a widget branch in `HomeSectionRenderer`), and add it to
`SECTION_TYPE_LABELS`/`SECTION_TYPE_DESCRIPTIONS` (+ `WIDGET_SECTION_TYPES` if it's a
widget) in `admin-mega-dashboard.tsx`.

## Search bar + section styling (user-requested)
The home Communities tab keeps a self-contained `CommunitiesSearchBar` (in
`myseniorvalet-home.tsx`) at the top — a directory-style search + quick-filter chips
— and renders each section as a polished rounded gradient panel with a left-aligned
icon+title header (`DynamicCommunitySection` + `WidgetHeader`).

**Why:** removing the rich CommunityDirectorySections from home made the tab look
plainer and dropped its search bar; the user wanted the polish + search back WITHOUT
reintroducing the duplicate hardcoded sections. So home stays admin-controlled, just
prettier — do NOT re-add CommunityDirectorySections to home to "fix" appearance.

## Map-defaults card
The admin "Map Search Page — Default Starting View" card (`MapDefaultCard`) controls
ONLY the `/map-search` page's opening center/zoom — it is unrelated to the home section
list. Relabeled to avoid confusion.
