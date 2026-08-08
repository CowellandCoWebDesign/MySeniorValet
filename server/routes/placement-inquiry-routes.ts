import { type Express } from "express";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { placementInquiries } from "@shared/schema";
import { sendEmail } from "../sendgrid-service";
import { RateLimitManager } from "../services/rate-limit-manager";
import { isAuthenticated, isAdmin } from "../replitAuth";

/**
 * Guided "Start Your Search" placement intake (5-step wizard on /start-your-search).
 *
 * POST /api/placement-inquiries — public, rate-limited. Persists the inquiry FIRST,
 * then sends (best-effort) an owner notification + a family confirmation via the
 * Gmail transport (@sendgrid/mail is monkeypatched at boot). Email failures never
 * fail the request once the lead is saved — delivery flags are returned + stored
 * so a saved-but-not-emailed lead is observable, never silent.
 */

const RELATIONSHIP_LABELS: Record<string, string> = {
  myself: "Myself",
  parent: "A parent",
  spouse_partner: "A spouse or partner",
  someone_else: "Someone else",
};

const CARE_TYPE_LABELS: Record<string, string> = {
  assisted_living: "Assisted Living",
  memory_care: "Memory Care",
  independent_living: "Independent Living",
  not_sure: "Not sure yet",
};

const URGENCY_LABELS: Record<string, string> = {
  immediately: "Immediately",
  within_30_days: "Within 30 days",
  one_to_three_months: "1–3 months",
  just_researching: "Just researching",
};

const PLACEMENT_PHONE_DISPLAY = "(530) 776-4220";
const PLACEMENT_PHONE_TEL = "+15307764220";
const SITE_INBOX = "hello@myseniorvalet.com";

const submissionSchema = z
  .object({
    relationship: z.enum(["myself", "parent", "spouse_partner", "someone_else"]),
    careType: z.enum(["assisted_living", "memory_care", "independent_living", "not_sure"]),
    urgency: z.enum(["immediately", "within_30_days", "one_to_three_months", "just_researching"]),
    location: z.string().trim().min(2, "Please tell us your city or ZIP code.").max(120),
    name: z.string().trim().min(1, "Please tell us your name.").max(120),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .default("")
      .refine((v) => v === "" || /[\d]{7,}/.test(v.replace(/[^\d]/g, "")), {
        message: "That phone number doesn't look right.",
      }),
    email: z
      .string()
      .trim()
      .max(160)
      .optional()
      .default("")
      .refine((v) => v === "" || z.string().email().safeParse(v).success, {
        message: "That email doesn't look right.",
      }),
  })
  .refine((d) => d.phone !== "" || d.email !== "", {
    message: "Please share a phone number or an email so we can reach you.",
    path: ["phone"],
  });

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendOwnerNotification(inquiry: {
  id: number;
  relationship: string;
  careType: string;
  urgency: string;
  location: string;
  name: string;
  phone: string;
  email: string;
}): Promise<boolean> {
  const name = escapeHtml(inquiry.name);
  const location = escapeHtml(inquiry.location);
  const urgencyLabel = URGENCY_LABELS[inquiry.urgency] || inquiry.urgency;
  const isUrgent = inquiry.urgency === "immediately";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#3d5a1e;">New Placement Inquiry — ${name}</h2>
      ${isUrgent ? `<p style="background:#fef2f2;border:1px solid #ef4444;border-radius:6px;padding:10px 14px;font-size:13px;color:#991b1b;">🔥 <strong>This family needs help immediately.</strong> Call back as soon as possible.</p>` : ""}
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0;">
        <p style="margin:4px 0;">👤 Who needs care: <strong>${RELATIONSHIP_LABELS[inquiry.relationship] || escapeHtml(inquiry.relationship)}</strong></p>
        <p style="margin:4px 0;">🏠 Type of care: <strong>${CARE_TYPE_LABELS[inquiry.careType] || escapeHtml(inquiry.careType)}</strong></p>
        <p style="margin:4px 0;">⏱️ How soon: <strong>${escapeHtml(urgencyLabel)}</strong></p>
        <p style="margin:4px 0;">📍 Location: <strong>${location}</strong></p>
      </div>
      <h3 style="color:#1e3a5f;">Contact</h3>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:8px 0;">
        <p style="margin:4px 0;">Name: <strong>${name}</strong></p>
        ${inquiry.phone ? `<p style="margin:4px 0;">📞 Phone: <strong>${escapeHtml(inquiry.phone)}</strong></p>` : ""}
        ${inquiry.email ? `<p style="margin:4px 0;">✉️ Email: <strong>${escapeHtml(inquiry.email)}</strong></p>` : ""}
        ${!inquiry.email ? `<p style="margin:4px 0;color:#92400e;">This family provided a phone number only — please call.</p>` : ""}
      </div>
      <p style="color:#64748b;font-size:12px;">Inquiry #${inquiry.id} — submitted via the guided "Start Your Search" intake. Manage it in the admin dashboard's Contact Inbox tab.</p>
    </div>
  `;

  return sendEmail({
    to: SITE_INBOX,
    from: SITE_INBOX,
    replyTo: inquiry.email || undefined,
    subject: `[Placement Inquiry] ${inquiry.name} — ${CARE_TYPE_LABELS[inquiry.careType] || inquiry.careType} in ${inquiry.location}${isUrgent ? " (IMMEDIATE)" : ""}`,
    html,
  });
}

async function sendFamilyConfirmation(inquiry: {
  name: string;
  email: string;
  careType: string;
  location: string;
}): Promise<boolean> {
  const firstName = escapeHtml(inquiry.name.split(/\s+/)[0] || "there");
  const careLabel = CARE_TYPE_LABELS[inquiry.careType] || "senior living";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="color:#3d5a1e;">We received your request — we'll be in touch soon!</h2>
      <p>Hi ${firstName},</p>
      <p>
        Thank you for reaching out. Our senior placement team has your request for
        <strong>${escapeHtml(careLabel)}</strong> guidance near <strong>${escapeHtml(inquiry.location)}</strong>,
        and a real person will follow up with you shortly — usually within one business day.
      </p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>What happens next</strong></p>
        <p style="margin:4px 0;">1. A placement advisor reviews your answers.</p>
        <p style="margin:4px 0;">2. We call or email you to learn a little more.</p>
        <p style="margin:4px 0;">3. We suggest communities that fit — touring help included, always free for families.</p>
      </div>
      <p>
        Prefer to talk now? Call us any time at
        <a href="tel:${PLACEMENT_PHONE_TEL}" style="color:#3d5a1e;font-weight:bold;">${PLACEMENT_PHONE_DISPLAY}</a>.
      </p>
      <p style="color:#475569;font-size:13px;">MySeniorValet is always free for families. We never sell your data.</p>
      <p style="color:#475569;font-size:12px;margin-top:20px;">
        MySeniorValet — Personal guidance from our senior placement team.
      </p>
    </div>
  `;

  return sendEmail({
    to: inquiry.email,
    from: SITE_INBOX,
    subject: "We received your request — MySeniorValet Placement Team",
    html,
  });
}

export function registerPlacementInquiryRoutes(app: Express) {
  // Public submission endpoint (rate-limited like other public forms)
  app.post("/api/placement-inquiries", async (req, res) => {
    try {
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      const limit = await RateLimitManager.checkLimit("/api/placement-inquiries", ip);
      if (!limit.allowed) {
        return res.status(429).json({
          error: "Too many requests. Please try again in a few minutes, or call us directly.",
        });
      }

      const parsed = submissionSchema.safeParse(req.body || {});
      if (!parsed.success) {
        const first = parsed.error.errors[0];
        return res.status(400).json({
          error: first?.message || "Please check your answers and try again.",
          field: first?.path?.[0],
        });
      }
      const data = parsed.data;

      // 1) Persist FIRST — the lead must never depend on email delivery.
      const [saved] = await db
        .insert(placementInquiries)
        .values({
          relationship: data.relationship,
          careType: data.careType,
          urgency: data.urgency,
          location: data.location,
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          ipAddress: ip,
          userAgent: req.headers["user-agent"] || null,
        })
        .returning();

      // 2) Owner notification (best-effort; failure logged + flagged, not fatal).
      let ownerEmailDelivered = false;
      try {
        ownerEmailDelivered = await sendOwnerNotification({
          id: saved.id,
          relationship: data.relationship,
          careType: data.careType,
          urgency: data.urgency,
          location: data.location,
          name: data.name,
          phone: data.phone,
          email: data.email,
        });
      } catch (e: any) {
        console.error("placement-inquiry: owner notification failed:", e?.message || e);
        if (e?.response?.body) {
          console.error("placement-inquiry: email error details:", JSON.stringify(e.response.body));
        }
      }
      if (!ownerEmailDelivered) {
        console.error(`placement-inquiry: owner notification NOT delivered for inquiry #${saved.id} — lead is saved, review in admin dashboard`);
      }

      // 3) Family confirmation — only when they gave an email; best-effort, never fatal.
      let familyEmailDelivered = false;
      if (data.email) {
        try {
          familyEmailDelivered = await sendFamilyConfirmation({
            name: data.name,
            email: data.email,
            careType: data.careType,
            location: data.location,
          });
        } catch (e: any) {
          console.error("placement-inquiry: family confirmation failed:", e?.message || e);
        }
      }

      // Record delivery flags (best-effort)
      try {
        await db
          .update(placementInquiries)
          .set({ ownerEmailDelivered, familyEmailDelivered, updatedAt: new Date() })
          .where(eq(placementInquiries.id, saved.id));
      } catch (e) {
        console.error("placement-inquiry: failed to record email delivery flags:", e);
      }

      res.status(201).json({
        success: true,
        inquiryId: saved.id,
        emailDelivered: ownerEmailDelivered,
        familyEmailDelivered,
      });
    } catch (error) {
      console.error("Error processing placement inquiry:", error);
      res.status(500).json({
        error: "We couldn't submit your request. Please try again or call us directly.",
      });
    }
  });

  // Admin: list inquiries (newest first, optional status filter)
  app.get("/api/admin/placement-inquiries", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status, limit } = req.query as { status?: string; limit?: string };
      let query = db.select().from(placementInquiries).$dynamic();
      if (status && status !== "all") {
        query = query.where(eq(placementInquiries.status, status));
      }
      const rows = await query
        .orderBy(desc(placementInquiries.createdAt))
        .limit(Math.min(parseInt(limit || "200", 10) || 200, 500));
      res.json(rows);
    } catch (error) {
      console.error("Error fetching placement inquiries:", error);
      res.status(500).json({ error: "Failed to fetch placement inquiries" });
    }
  });

  // Admin: update triage status
  app.patch("/api/admin/placement-inquiries/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid inquiry ID" });

      const ALLOWED = ["new", "contacted", "closed"];
      const { status } = req.body || {};
      if (!ALLOWED.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${ALLOWED.join(", ")}.` });
      }

      const [updated] = await db
        .update(placementInquiries)
        .set({ status, updatedAt: new Date() })
        .where(eq(placementInquiries.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: "Inquiry not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error updating placement inquiry status:", error);
      res.status(500).json({ error: "Failed to update inquiry status" });
    }
  });

  console.log("✅ Placement inquiry routes registered");
}
