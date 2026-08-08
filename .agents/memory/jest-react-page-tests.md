---
name: Jest React page/component tests
description: How to write jest+ts-jest tests for React pages/components in this repo without import crashes
---

# Jest React page/component tests

Reference pattern: `client/src/pages/map-search.test.tsx`. Apply the same shape to any page/component test.

## Config facts (jest.config.cjs)
- **Asset/style extension mappers MUST come before path-alias mappers** in `moduleNameMapper`. Otherwise `@assets/...png` resolves to the real binary via `^@assets/(.*)$` and jest tries to parse the PNG → "Invalid or unexpected token".
- **ts-jest uses `jsx: 'react-jsx'` (automatic runtime)**, matching the Vite build. Source files (e.g. `myseniorvalet-home.tsx`) import only named hooks from react, no default `React`, so classic `jsx: 'react'` crashes them with "React is not defined". `React.CSSProperties`/`React.MouseEvent` etc. are type-only and erased — not a runtime concern.

## Per-test rules
- The custom `QueryClient` in a test wrapper has **no default queryFn** → pages using the default react-query fetcher will error ("Missing queryFn") instead of fetching. Import and reuse the real `queryClient` from `@/lib/queryClient`, and call `queryClient.clear()` in `beforeEach`.
- ESM-only modules that crash at import under ts-jest: **`wouter`**, **`react-markdown`** — always `jest.mock` them.
- Context hooks throw without providers — mock them: `useResponsive`, `useLanguage`, `useTheme`/theme-provider, `useAccessibilityPreferences`, `useAuth`, `useSEO`.
- For huge pages, mock all heavy child components. A `mockNullModule()` **function declaration** (hoisted, `mock`-prefixed so jest's mock-factory hoist rule allows it) returning a `Proxy` works for any default-or-named export: `get` returns `true` for `__esModule`, `{}` for known object exports (commonBadges/organizationSchema/...), else `() => null`. Do NOT use a `const` arrow helper — `jest.mock` is hoisted above it → TDZ "Cannot access before initialization".

## Pre-existing broken suites (NOT jest-config issues — out of scope)
- `tests/integration/search-flow.test.tsx` — imports `@/App`, fails on `import.meta`.
- `client/src/__tests__/admin-mega-dashboard.test.tsx` — written for `vitest`, not installed.
- `tests/photo-handling.test.tsx` — imports `react-router-dom`, not installed.
