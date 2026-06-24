---
name: Deploy nix layer integrity failure
description: Why publish fails with "corrupt nix store paths" and the only working fix (user edits .replit)
---

# Publish fails: "nix layer integrity verification failed / corrupt nix store paths"

Symptom: deploy aborts at "verifying nix store path integrity before caching layer" with
`corrupt nix store paths: /nix/store/<hash>-nodejs-20.12.2: expected sha256-A, got sha256-B`.

## What it means
The deployer pushes the CLOSURE of the env defined by `.replit` (modules + `[nix] packages`).
One store path in that closure has on-disk content whose hash differs from the canonical
(substituter) hash, so the deployer refuses to cache it. `nix-store --verify-path` passes
LOCALLY (local DB recorded the modified hash), which is why it looks fine in the workspace.

## Root cause seen here
The corrupt path was `nodejs-20.12.2`, pulled into the deploy closure ONLY by the
`playwright` + `playwright-driver` Nix packages (e2e test tooling) in `.replit [nix] packages`.
Confirm the vector with: `nix-store --query --roots <corrupt-path>` (roots = the top-level
packages that pull it). The app itself runs on a different node (20.20.0) and does NOT need it.

## Why the agent CANNOT fix it directly (all three blocked)
1. Direct `.replit` edit → platform-blocked ("Direct edits to .replit not allowed").
2. `uninstallSystemDependencies({packages:[...]})` → returns `success:true` but is a NO-OP:
   `.replit` is byte-identical before/after (verified with fs read in code_execution).
3. `nix-store --repair-path` → blocked: a read-only DIRECTORY occupies `<path>.lock`
   (`opening lock file ...: Is a directory`); `rm -rf` it → `Permission denied` because it
   lives in a read-only base layer (`/nix/store` overlay is `ro`; entries are squashfs/base,
   dated `Jan 1 1970`). The corrupt node + the stray `.lock` are baked into Replit base layers.

## The fix (only the USER can do it)
Remove whatever `.replit [nix] packages` entry pulls the corrupt path into the closure.
Here: delete `"playwright"` and `"playwright-driver"` from the packages array (editor text edit,
or the System Dependencies pane), then republish. This drops the corrupt node from the deploy
closure so the integrity check never touches it. Reversible (re-add to run e2e tests).
Only disables browser/e2e testing — not the live app.

**Why:** the corruption is in a Replit-managed read-only layer the agent can't write; the
only lever the agent's tools can't pull but the user can is the `.replit` packages list.
**How to apply:** when a publish fails with this exact error, identify the closure root via
`nix-store --query --roots`, then have the USER remove that package from `.replit` — do not
burn time trying to repair the store path or calling the uninstall tool.
