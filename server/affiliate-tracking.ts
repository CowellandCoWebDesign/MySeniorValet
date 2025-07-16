import { db } from "./db";
import { pgTable, serial, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

// Affiliate click tracking table
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  service: text("service").notNull(),
  partner: text("partner").notNull(),
  category: text("category").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  clickedAt: timestamp("clicked_at").defaultNow(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  sessionId: text("session_id"),
  metadata: jsonb("metadata"),
});

export interface AffiliateClickData {
  userId?: string;
  service: string;
  partner: string;
  category: string;
  affiliateUrl: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
  metadata?: any;
}

export class AffiliateTracker {
  async trackClick(data: AffiliateClickData) {
    try {
      const [click] = await db.insert(affiliateClicks).values({
        userId: data.userId,
        service: data.service,
        partner: data.partner,
        category: data.category,
        affiliateUrl: data.affiliateUrl,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        sessionId: data.sessionId,
        metadata: data.metadata,
      }).returning();

      console.log(`Affiliate click tracked: ${data.partner} - ${data.service}`);
      return click;
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
      throw error;
    }
  }

  async getClicksByCategory(category: string, limit: number = 100) {
    try {
      const clicks = await db.select()
        .from(affiliateClicks)
        .where(db.sql`category = ${category}`)
        .orderBy(db.sql`clicked_at DESC`)
        .limit(limit);

      return clicks;
    } catch (error) {
      console.error("Error fetching clicks by category:", error);
      throw error;
    }
  }

  async getClicksByPartner(partner: string, limit: number = 100) {
    try {
      const clicks = await db.select()
        .from(affiliateClicks)
        .where(db.sql`partner = ${partner}`)
        .orderBy(db.sql`clicked_at DESC`)
        .limit(limit);

      return clicks;
    } catch (error) {
      console.error("Error fetching clicks by partner:", error);
      throw error;
    }
  }

  async getClickStats() {
    try {
      const stats = await db.select({
        category: affiliateClicks.category,
        partner: affiliateClicks.partner,
        count: db.sql`COUNT(*)`,
        latest: db.sql`MAX(clicked_at)`,
      })
      .from(affiliateClicks)
      .groupBy(affiliateClicks.category, affiliateClicks.partner)
      .orderBy(db.sql`COUNT(*) DESC`);

      return stats;
    } catch (error) {
      console.error("Error fetching click stats:", error);
      throw error;
    }
  }

  async getUserSelectedServices(userId: string) {
    try {
      const services = await db.select()
        .from(affiliateClicks)
        .where(db.sql`user_id = ${userId}`)
        .orderBy(db.sql`clicked_at DESC`);

      return services;
    } catch (error) {
      console.error("Error fetching user selected services:", error);
      throw error;
    }
  }
}

export const affiliateTracker = new AffiliateTracker();