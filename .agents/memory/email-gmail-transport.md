---
name: Email delivery via Gmail connector (not SendGrid)
description: All outbound mail goes through the Replit google-mail connector, not SendGrid; why and how the monkeypatch transport works.
---

# Email is sent through the Gmail connector, not SendGrid

All outbound email routes through the Replit `google-mail` connector, authenticated
as the primary Workspace account (the admin "from" address configured in
`replit.md`). SendGrid is no longer used for delivery even though `@sendgrid/mail`
is still imported everywhere.

**Why:** SendGrid's free tier became unavailable, and its setup had broken
deliverability — the key was a send-only single-sender (not domain-authenticated),
so only the personal Gmail BCC ever arrived; domain-addressed mail was dropped or
quarantined (Workspace spoofing when from==to on the same domain).
Gmail authenticates mail (DKIM/SPF) automatically, so it actually lands — no DNS work.

**How it works:** `server/services/gmail-sender.ts` exposes `sendViaGmail(msg)` which
builds an RFC5322 MIME message (base64 bodies for UTF-8/trilingual content,
encoded-word subjects, custom headers like List-Unsubscribe) and POSTs it to
`/gmail/v1/users/me/messages/send` via `connectors.proxy("google-mail", ...)`. It
returns a SendGrid-shaped `[{statusCode:202, headers:{'x-message-id'}}]` and throws
SendGrid-shaped errors (`err.response.body`) so existing callers and catch/log code
work unchanged. `installGmailTransport()` monkeypatches the shared `@sendgrid/mail`
singleton's `.send`/`.sendMultiple` so all ~20 call sites (including dynamic
`import('@sendgrid/mail')`) route through Gmail without edits, and no-ops `setApiKey`.

**How to apply / gotchas:**
- The module self-installs at evaluation time and is imported FIRST in
  `server/index.ts`. This matters: several modules snapshot
  `const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY` at module scope
  (e.g. `server/services/email.ts`) and gate sends on it. The transport sets a dummy
  `SENDGRID_API_KEY` if missing so those guards stay satisfied even if the real key
  is removed — but only because it runs before those modules load.
- Gmail can only send AS the authenticated account. `From` always uses the
  connector's Workspace account; a caller's differing `from` is preserved as `Reply-To`.
- SendGrid dynamic templates (`templateId` with no html/text) are NOT supported —
  `sendViaGmail` fails fast rather than sending empty mail. SendGrid-only extras
  (categories, customArgs, sendAt, trackingSettings) are silently ignored by Gmail.
