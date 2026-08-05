---
name: Dark-mode global override hazards
description: How the global .dark !important stylesheet strips component styling and how to write override-proof component styles
---

# Dark-mode global override hazards

**Rule:** Never write `.dark` overrides that target buttons/links by Tailwind utility class (e.g. `.dark button.lg\:hidden { background: transparent !important }`). Scope them to an explicit hook like `[data-mobile-menu]`. For critical CTAs that must never lose their background (hero buttons over photos), assert background + color at the component level with dedicated classes using `!important` (see `.hero-cta-primary` / `.hero-cta-secondary` in `client/src/index.css`).

**Why:** `client/src/index.css` contains a large `@layer base` block of `.dark ... !important` rules. `!important` beats utility classes AND inline styles, so a selector keyed on a utility class silently repaints every element that happens to carry that utility — this is what rendered the home hero "Start Your Search" button fully transparent on phones in dark mode.

**Update (Aug 2026):** The entire `@layer base` `.dark` block in `client/src/index.css` was de-weaponized — all broad `!important`s removed. Legacy remaps (`.dark .bg-white`, `.dark input`, `.dark [role=dialog]`, gray text remaps…) now rely on specificity only, so component `dark:` utilities (compiled later at equal specificity) always win. Remaining `.dark ... !important` is only allowed on explicit hooks: `.hero-cta-*`, `.tab-*`, `[data-*]`, and Leaflet control DOM. Enforced repo-wide by `tests/dark-mode-no-broad-important-overrides.test.ts` — new violations fail CI.

**How to apply:**
- When adding a dark-mode fix, target a data attribute or a dedicated class, never a utility class.
- `.dark a:not(.btn):not(.button)` recolors ALL anchors (specificity 0-3-1); anchor-based CTAs need their own `color: ... !important` or they turn blue-400 in dark mode.
- Hero brand palette = blue-600 → violet-600 gradient (matches header logo `from-blue-600 via-purple-600 to-cyan-600`); secondary CTA dark treatment = slate-800 bg + blue-200 text. Green (NorCal style) was deliberately removed from the hero — don't reintroduce it.
