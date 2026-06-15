---
name: Vite 8 CJS default export interop
description: Vite 8 rolldown dep optimizer wraps CJS modules differently — default imports may get the whole module.exports object instead of the component.
---

## The Rule
When upgrading to Vite 8, any package whose dep bundle ends with `export default require_lib()` will break default imports. The variable gets the entire `module.exports` object (e.g. `{default: Component, __esModule: true}`) instead of the component itself.

## Fix Pattern
```typescript
import _Import from 'problem-package';
const ActualComponent = (_Import as any)?.default ?? _Import;
```

## Why
Vite 8 uses rolldown internally. Its CJS-to-ESM interop wraps packages differently from Vite 6/7's rollup. A package exporting `exports.default = X` with `__esModule: true` used to resolve correctly via Babel-style interop. Rolldown's output `export default require_lib()` exports the whole `module.exports` shell object, so a default import gets the wrapper instead of `X`.

## How to Apply
- The symptom is React's "Element type is invalid: expected string or class/function but got: object" from a component that uses that package.
- Check `.vite/deps/<package>.js` — if the last line is `export default require_lib()` (not `export { something as default }`), the package needs the unwrap pattern above.
- react-leaflet-cluster was the first known case after upgrading to Vite 8 + @vitejs/plugin-react v6.
- Already-applied fix lives in `client/src/components/Map.tsx` line 9-12.
