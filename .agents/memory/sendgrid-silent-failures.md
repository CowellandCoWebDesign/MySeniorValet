---
name: SendGrid silent email failures
description: Why notification emails can silently fail to send, and the delivery-flag pattern that makes it observable.
---

# SendGrid silent email failures

Notification flows (contact, reveal/referral-view, tour scheduling) used to
`try { await send } catch { console.error }` then return `success: true`. A
saved record with a failed email looked identical to full success from the
client. Always thread a per-recipient `emailDelivered` boolean back in the JSON
response (e.g. `emailDelivered`, `adminNotified`, `familyEmailDelivered`) so a
saved-but-not-emailed record is observable instead of a false success.

**Why:** a real outage was invisible — the lead saved, the UI said "success",
no email arrived, and nothing logged the cause.

**How to apply:**
- On any `sgMail.send` failure, log `err.response.body` (JSON.stringify), not
  just `err.message` — the body carries the actionable SendGrid reason.
- SendGrid rejects an email (HTTP 400) if the SAME address appears more than
  once across to/cc/bcc in a personalization block ("Each email address ...
  should be unique"). Deduplicate recipient arrays before sending.
- A DB check-constraint violation (Postgres 23514) before the send aborts the
  whole handler as an opaque 500 and no email is attempted. Validate enum-style
  fields (e.g. contact `subject`) against the DB constraint and return 400.
