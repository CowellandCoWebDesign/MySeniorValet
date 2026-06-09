import { type Express } from "express";
import { leadTrackingService } from "../services/lead-tracking.service";
import { db } from "../db";
import { communities, communityDashboardStats, users } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { sendEmail } from "../sendgrid-service";

/**
 * Best-effort increment of community_dashboard_stats for a profile-view referral.
 * Uses a select-then-update/insert pattern (no unique constraint on communityId+date).
 */
async function incrementProfileViewStats(communityId: number, revealedField?: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const isPhone = revealedField === "phone";
    const [existing] = await db
      .select()
      .from(communityDashboardStats)
      .where(
        and(
          eq(communityDashboardStats.communityId, communityId),
          eq(communityDashboardStats.date, today)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(communityDashboardStats)
        .set({
          profileViews: (existing.profileViews || 0) + 1,
          phoneCallClicks: (existing.phoneCallClicks || 0) + (isPhone ? 1 : 0),
        })
        .where(eq(communityDashboardStats.id, existing.id));
    } else {
      await db.insert(communityDashboardStats).values({
        communityId,
        date: today,
        profileViews: 1,
        phoneCallClicks: isPhone ? 1 : 0,
      });
    }
  } catch (error) {
    console.error("Failed to increment profile-view stats:", error);
  }
}

/**
 * Best-effort "this person just viewed your profile" email to the community.
 * Golden Data Rule: only send to a REAL, verified community email. Never fabricate.
 */
async function notifyCommunityOfProfileView(
  communityId: number,
  family: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    allowPhoneContact: boolean;
    revealedField?: string;
  }
) {
  try {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId))
      .limit(1);

    // Only contact a verified community with a real email on file
    if (!community || !community.email || !community.isVerified) {
      return;
    }

    const familyName = `${family.firstName} ${family.lastName}`.trim() || "A family";
    const phoneLine =
      family.allowPhoneContact && family.phone
        ? `<p style="margin:4px 0;">📞 Phone: <strong>${family.phone}</strong></p>`
        : `<p style="margin:4px 0;color:#92400e;">📵 This family prefers email/text contact only — please do not call.</p>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#4f46e5;">${familyName} just viewed your profile!</h2>
        <p>A family is researching senior living on <strong>MySeniorValet</strong> and just viewed
        <strong>${community.name}</strong>${community.city ? ` in ${community.city}, ${community.state}` : ""}.</p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;">👤 Name: <strong>${familyName}</strong></p>
          <p style="margin:4px 0;">✉️ Email: <strong>${family.email}</strong></p>
          ${phoneLine}
        </div>
        <p style="color:#475569;font-size:13px;">The trusted platform for authentic senior living community information.
        Helping families make informed decisions with verified data and transparent pricing.</p>
      </div>
    `;

    await sendEmail({
      to: community.email,
      from: "hello@myseniorvalet.com",
      replyTo: family.email || undefined,
      subject: `${familyName} just viewed your profile on MySeniorValet`,
      html,
    });
  } catch (error) {
    console.error("Failed to send profile-view notification email:", error);
  }
}

export function registerLeadTrackingRoutes(app: Express) {
  const leadService = leadTrackingService;

  // Get leads for a specific community
  app.get("/api/communities/:id/leads", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const leads = await leadService.getLeads(communityId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Get lead analytics for a specific community
  app.get("/api/communities/:id/leads/analytics", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const analytics = await leadService.getAnalytics(communityId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching lead analytics:", error);
      res.status(500).json({ error: "Failed to fetch lead analytics" });
    }
  });

  // Create a new lead
  app.post("/api/communities/:id/leads", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const leadData = {
        ...req.body,
        communityId
      };

      const newLead = await leadService.createLead(leadData);
      res.status(201).json(newLead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Profile-view referral: logged when a family reveals a gated phone/website/pricing/overview field.
  // Creates a "just viewed your profile" referral lead, increments dashboard stats, and (best-effort)
  // emails a verified community. Reveal on the client does NOT depend on this succeeding.
  app.post("/api/communities/:id/referral-view", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const { revealedField, contact, consent } = req.body || {};

      let firstName = "";
      let lastName = "";
      let email = "";
      let phone: string | undefined;
      let allowDirectContact = false;
      let allowPhoneContact = false;

      // Authenticated family: pull identity from their account; signup consent applies.
      const sessionUser = (req as any).user;
      if (sessionUser?.id) {
        try {
          const [u] = await db
            .select()
            .from(users)
            .where(eq(users.id, sessionUser.id))
            .limit(1);
          if (u) {
            firstName = u.firstName || u.username || "MySeniorValet";
            lastName = u.lastName || "Member";
            email = u.email || "";
            phone = u.phone || undefined;
            allowDirectContact = true;
            allowPhoneContact = true;
          }
        } catch (e) {
          console.error("referral-view: failed to load user", e);
        }
      }

      // Logged-out family: use the consent dialog's contact + consent choice.
      if (!email) {
        const name = (contact?.name || "").trim();
        const parts = name.split(/\s+/).filter(Boolean);
        firstName = parts[0] || "MySeniorValet";
        lastName = parts.slice(1).join(" ") || "Visitor";
        email = (contact?.email || "").trim();
        phone = (contact?.phone || "").trim() || undefined;
        allowDirectContact = consent?.allowDirectContact ?? true;
        allowPhoneContact = consent?.allowPhoneContact ?? false;
      }

      // Create the referral lead (reuses the lead-tracking service). Requires a valid email.
      if (email) {
        try {
          await leadService.createLead({
            communityId,
            firstName,
            lastName,
            email,
            phone: allowPhoneContact ? phone : undefined,
            source: "referral",
            status: "new",
            tags: ["profile_view", revealedField ? `revealed_${revealedField}` : ""].filter(Boolean),
            notes: "This family just viewed your profile via MySeniorValet",
            metadata: {
              allowDirectContact,
              allowPhoneContact,
              revealedField,
              preferredContactMethod: allowPhoneContact ? "phone" : "email",
            },
          } as any);
        } catch (e) {
          console.error("referral-view: failed to create lead", e);
        }
      }

      // Best-effort side effects (never block the response).
      await incrementProfileViewStats(communityId, revealedField);
      if (email) {
        await notifyCommunityOfProfileView(communityId, {
          firstName,
          lastName,
          email,
          phone,
          allowPhoneContact,
          revealedField,
        });
      }

      res.json({ ok: true });
    } catch (error) {
      console.error("Error recording referral view:", error);
      res.status(500).json({ error: "Failed to record referral view" });
    }
  });

  // Update a lead
  app.put("/api/leads/:leadId", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      const updatedLead = await leadService.updateLead(leadId, req.body);
      
      if (!updatedLead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Delete a lead - Not implemented yet
  app.delete("/api/leads/:leadId", async (req, res) => {
    // TODO: Implement lead deletion in service
    res.status(501).json({ error: "Lead deletion not yet implemented" });
  });

  // Track lead activity
  app.post("/api/leads/:leadId/activity", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      await leadService.trackActivity(leadId, req.body);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error tracking lead activity:", error);
      res.status(500).json({ error: "Failed to track activity" });
    }
  });

  // Get lead activities
  app.get("/api/leads/:leadId/activities", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }

      const activities = await leadService.getActivities(leadId);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Configure CRM integration
  app.post("/api/communities/:id/leads/crm-integration", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      const integration = await leadService.setupCRMIntegration(communityId, req.body);
      res.json(integration);
    } catch (error) {
      console.error("Error configuring CRM integration:", error);
      res.status(500).json({ error: "Failed to configure CRM integration" });
    }
  });

  // Get CRM integration status
  app.get("/api/communities/:id/leads/crm-integration", async (req, res) => {
    try {
      const communityId = parseInt(req.params.id);
      
      if (isNaN(communityId)) {
        return res.status(400).json({ error: "Invalid community ID" });
      }

      // TODO: Implement getCRMIntegration method in service
      // For now, return default status
      res.json({ enabled: false, provider: null });
    } catch (error) {
      console.error("Error fetching CRM integration:", error);
      res.status(500).json({ error: "Failed to fetch CRM integration" });
    }
  });

  console.log("✅ Lead tracking routes registered");
}