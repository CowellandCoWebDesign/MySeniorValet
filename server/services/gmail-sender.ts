// Gmail transport (Replit Gmail connector: google-mail)
// ---------------------------------------------------------------------------
// The platform previously sent all mail through SendGrid. SendGrid's free tier
// is no longer available, and its single-sender setup had poor deliverability
// (only the personal Gmail BCC ever arrived; domain mail was dropped/quarantined).
//
// This module sends through the connected Google Workspace account
// (hello@myseniorvalet.com) via the Gmail API. Google authenticates the mail
// (DKIM/SPF) automatically, so it actually lands in inboxes — no DNS work.
//
// `installGmailTransport()` monkeypatches the shared @sendgrid/mail singleton's
// `.send` so every existing caller (sgMail.send / EmailService / sendEmail)
// routes through Gmail without rewriting ~20 call sites. sendViaGmail returns a
// SendGrid-shaped `[{ statusCode, headers }]` so existing destructuring works,
// and throws a SendGrid-shaped error (`err.response.body`) so existing logging
// keeps working.
import sgMail from '@sendgrid/mail';
import { ReplitConnectors } from '@replit/connectors-sdk';

const connectors = new ReplitConnectors();
const GMAIL_CONNECTOR = 'google-mail';
const DEFAULT_FROM_NAME = 'MySeniorValet';
const DEFAULT_REPLY_TO = 'hello@myseniorvalet.com';

let cachedSender: string | null = null;

async function getSenderAddress(): Promise<string> {
  if (cachedSender) return cachedSender;
  const r = await connectors.proxy(GMAIL_CONNECTOR, '/gmail/v1/users/me/profile', { method: 'GET' });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw makeSendError(`Gmail profile lookup failed (HTTP ${r.status})`, { status: r.status, body });
  }
  const j: any = await r.json();
  cachedSender = j.emailAddress;
  return cachedSender!;
}

// Build a SendGrid-style error so existing `catch (e) { e.response.body }` works.
function makeSendError(message: string, body: any): any {
  const err: any = new Error(message);
  err.code = 502;
  err.response = { body };
  return err;
}

// Normalize a SendGrid recipient field (string | string[] | {email,name} | mix)
// into an RFC 5322 address-list header string.
function toAddressHeader(field: any): string {
  if (!field) return '';
  const list = Array.isArray(field) ? field : [field];
  return list
    .map((item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item.email) {
        return item.name ? `${item.name} <${item.email}>` : item.email;
      }
      return '';
    })
    .filter(Boolean)
    .join(', ');
}

function extractEmail(field: any): string | undefined {
  if (!field) return undefined;
  const first = Array.isArray(field) ? field[0] : field;
  if (typeof first === 'string') {
    const m = first.match(/<([^>]+)>/);
    return (m ? m[1] : first).trim();
  }
  if (typeof first === 'object' && first.email) return first.email;
  return undefined;
}

// MIME encoded-word for non-ASCII subjects.
function encodeHeaderValue(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
}

// Encode a body part as base64 (safe for arbitrary UTF-8, e.g. FR/ES content).
function base64Part(contentType: string, content: string): string {
  const b64 = Buffer.from(content, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
  return [
    `Content-Type: ${contentType}; charset="UTF-8"`,
    'Content-Transfer-Encoding: base64',
    '',
    b64,
  ].join('\r\n');
}

function buildMimeMessage(opts: {
  fromHeader: string;
  to: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  extraHeaders?: Record<string, string>;
}): string {
  const headers: string[] = [];
  headers.push(`From: ${opts.fromHeader}`);
  headers.push(`To: ${opts.to}`);
  if (opts.cc) headers.push(`Cc: ${opts.cc}`);
  if (opts.bcc) headers.push(`Bcc: ${opts.bcc}`);
  if (opts.replyTo) headers.push(`Reply-To: ${opts.replyTo}`);
  headers.push(`Subject: ${encodeHeaderValue(opts.subject || '')}`);
  // Custom headers passed by callers (e.g. List-Unsubscribe for marketing mail).
  if (opts.extraHeaders) {
    for (const [name, value] of Object.entries(opts.extraHeaders)) {
      if (name && value != null) {
        headers.push(`${name}: ${encodeHeaderValue(String(value))}`);
      }
    }
  }
  headers.push('MIME-Version: 1.0');

  const html = opts.html;
  const text = opts.text || (html ? html.replace(/<[^>]*>/g, '') : '');

  if (html && text) {
    const boundary = 'msv_' + Math.random().toString(36).slice(2);
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    const body = [
      `--${boundary}`,
      base64Part('text/plain', text),
      `--${boundary}`,
      base64Part('text/html', html),
      `--${boundary}--`,
      '',
    ].join('\r\n');
    return headers.join('\r\n') + '\r\n\r\n' + body;
  }

  if (html) {
    return headers.join('\r\n') + '\r\n\r\n' + base64Part('text/html', html);
  }
  return headers.join('\r\n') + '\r\n\r\n' + base64Part('text/plain', text || ' ');
}

function toBase64Url(raw: string): string {
  return Buffer.from(raw, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Accepts a single SendGrid-style message (or an array; first is used) and
// sends it through Gmail. Returns SendGrid-shaped [{ statusCode, headers }].
export async function sendViaGmail(data: any): Promise<Array<{ statusCode: number; headers: Record<string, string> }>> {
  const msg = Array.isArray(data) ? data[0] : data;
  if (!msg) throw makeSendError('sendViaGmail: empty message', { errors: [{ message: 'empty message' }] });

  // SendGrid dynamic templates are rendered by SendGrid's servers and cannot be
  // reproduced via Gmail. Fail loudly instead of sending an empty message.
  if (msg.templateId && !msg.html && !msg.text) {
    throw makeSendError(
      'sendViaGmail: SendGrid templateId is not supported by the Gmail transport (provide html/text instead)',
      { errors: [{ message: 'templateId unsupported on Gmail transport' }] },
    );
  }

  const senderEmail = await getSenderAddress();

  // Gmail can only send as the authenticated account (or a configured send-as
  // alias). The connected account is the business address, so From stays
  // on-brand. If a caller's intended "from" differs, preserve it as Reply-To.
  const fromName =
    msg.from && typeof msg.from === 'object' && msg.from.name ? msg.from.name : DEFAULT_FROM_NAME;
  const fromHeader = `${fromName} <${senderEmail}>`;

  const intendedFromEmail = extractEmail(msg.from);
  const replyToEmail =
    extractEmail(msg.replyTo) ||
    (intendedFromEmail && intendedFromEmail.toLowerCase() !== senderEmail.toLowerCase()
      ? intendedFromEmail
      : undefined) ||
    DEFAULT_REPLY_TO;

  const to = toAddressHeader(msg.to);
  if (!to) throw makeSendError('sendViaGmail: no recipient', { errors: [{ message: 'no "to" recipient' }] });

  const raw = buildMimeMessage({
    fromHeader,
    to,
    cc: toAddressHeader(msg.cc) || undefined,
    bcc: toAddressHeader(msg.bcc) || undefined,
    replyTo: replyToEmail,
    subject: msg.subject || '',
    html: msg.html,
    text: msg.text,
    extraHeaders: msg.headers && typeof msg.headers === 'object' ? msg.headers : undefined,
  });

  const resp = await connectors.proxy(GMAIL_CONNECTOR, '/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: toBase64Url(raw) }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw makeSendError(`Gmail send failed (HTTP ${resp.status})`, { status: resp.status, body });
  }

  const result: any = await resp.json().catch(() => ({}));
  console.log(`📧 Gmail: sent to ${to} (id ${result.id || 'unknown'})`);
  return [{ statusCode: 202, headers: { 'x-message-id': result.id || '' } }];
}

let installed = false;

// Replace the shared @sendgrid/mail singleton's transport with Gmail. Call once
// at server startup before any mail is sent.
export function installGmailTransport(): void {
  if (installed) return;
  installed = true;

  // Keep the SendGrid key-presence guards (`if (process.env.SENDGRID_API_KEY)`)
  // satisfied even if the user removes the now-unused key, so flows still send.
  if (!process.env.SENDGRID_API_KEY) {
    process.env.SENDGRID_API_KEY = 'gmail-transport';
  }

  const anyMail = sgMail as any;
  anyMail.setApiKey = () => {}; // dummy key must never reach SendGrid
  anyMail.send = (data: any) => sendViaGmail(data);
  anyMail.sendMultiple = (data: any) => sendViaGmail(data);

  console.log('📨 Email transport: Gmail (Replit connector) active — SendGrid disabled');
}

// Install at module-evaluation time. Because this module is imported before any
// mail-sending modules in server/index.ts, the dummy-key fallback runs before
// modules like server/services/email.ts snapshot process.env.SENDGRID_API_KEY,
// keeping their key-presence guards satisfied even if the real key is removed.
installGmailTransport();
