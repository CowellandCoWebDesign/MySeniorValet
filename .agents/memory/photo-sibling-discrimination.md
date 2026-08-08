---
name: Photo sibling-community discrimination
description: Rules the "this photo belongs to a DIFFERENT community" filter must follow so it doesn't assign a sibling community's photos.
---

# Sibling-community photo discrimination

The filter that rejects a photo whose filename embeds a different facility's name
must obey three rules. They exist because real DB rows showed cross-assigned
photos: "Quartz Hill Post Acute" carried "Willow-Springs-…" images and "Hilltop
Springs" carried "Hilltop-Estates-…" images.

**Rule 1 — discrimination needs its OWN tokenizer.** The generic
community-name tokenizer treats type/suffix words (estates, manor, gardens,
springs, lodge, court, villas, residences, commons, village, place, heights…) as
stopwords, so "Hilltop Estates" and "Hilltop Springs" both collapse to
["hilltop"] — indistinguishable. The mismatch filter must KEEP those suffix words
and drop only truly-generic care words (senior, living, care, assisted, memory,
nursing, retirement, the/of/at…). The suffix word is what tells siblings apart.

**Rule 2 — short names must match ALL tokens.** Accepting ≥50% token overlap lets
a 2-token sibling steal a photo on a single shared core token. Require: names
with ≤2 distinctive tokens match ALL of them; longer names may keep the ≥50%/≥2
rule.

**Rule 3 — a city-name coincidence must NOT rescue a sibling.** "Filename
contains this community's city → keep" defeats discrimination when siblings share
a city (or the city equals the shared core token). Instead, only rescue a photo
if it introduces NO distinctive token outside (community name tokens ∪ city
tokens).

**Rule 4 — the own-domain HOST rescue must also be sibling-aware.** Directory
CDNs name the facility in the SUBDOMAIN (e.g. `hilltopestatessl.seniorlivingnearme.com`).
A naive "host contains one of this community's tokens → keep" rescue is wrong: that
host contains "hilltop" yet is Hilltop *Estates*. Before rescuing on a host token,
first check whether the host embeds any FOREIGN distinctive token (the leftover
tokens from Rule 3); if it does, the photo is on a different facility's subdomain —
do NOT rescue. Also sanitize the stored website (DB holds markdown junk like
`**www.foo.com**`) before parsing its host.

**Cross-community duplicate rule (separate, global pass).** Many mismatches have
NO name signal (opaque CDN hashes, og-images, base64/svg stubs, shared chain
banners). The per-photo filter cannot catch these — only a DB-wide pass can: a
URL appearing on ≥3 DISTINCT communities cannot authentically represent that many
facilities → remove. This lives in the cleanup script, not the per-community
filter (which has no global view).

**How to apply:** keep conservative guards (facility marker required, ≥2
distinctive foreign tokens, own-domain/official-website keep). Photos are 7-day
cached and write+read paths share the filter, so after a change force-refresh or
run the cleanup script to scrub persisted rows. Removing all wrong photos can
leave a community with 0 photos → it shows "Contact for details"; that's correct
per the Golden Data Rule: reject, never invent.
