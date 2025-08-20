import { 
  vendors, 
  vendorServices, 
  vendorServiceCategories,
  vendorSubscriptionPlans,
  vendorLeads,
  vendorReviews,
  vendorAnalytics,
  type Vendor,
  type VendorService,
  type VendorServiceCategory,
  type VendorSubscriptionPlan,
  type VendorLead,
  type VendorReview,
  type VendorAnalytics,
  type InsertVendor,
  type InsertVendorService,
  type InsertVendorLead,
  type InsertVendorReview
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, gte, lte } from "drizzle-orm";

export interface IVendorStorage {
  // Vendor operations
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendorById(id: number): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined>;
  
  // Service categories
  getAllServiceCategories(): Promise<VendorServiceCategory[]>;
  getServiceCategoryBySlug(slug: string): Promise<VendorServiceCategory | undefined>;
  
  // Vendor services
  createVendorService(service: InsertVendorService): Promise<VendorService>;
  getVendorServices(vendorId: number): Promise<VendorService[]>;
  updateVendorService(id: number, updates: Partial<InsertVendorService>): Promise<VendorService | undefined>;
  deleteVendorService(id: number): Promise<boolean>;
  
  // Subscription plans
  getAllSubscriptionPlans(): Promise<VendorSubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<VendorSubscriptionPlan | undefined>;
  
  // Leads
  createLead(lead: InsertVendorLead): Promise<VendorLead>;
  getVendorLeads(vendorId: number, filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<VendorLead[]>;
  updateLead(id: number, updates: Partial<InsertVendorLead>): Promise<VendorLead | undefined>;
  
  // Reviews
  getVendorReviews(vendorId: number): Promise<VendorReview[]>;
  createReview(review: InsertVendorReview): Promise<VendorReview>;
  
  // Analytics
  getVendorAnalytics(vendorId: number, startDate: Date, endDate: Date): Promise<VendorAnalytics[]>;
  updateVendorMetrics(vendorId: number): Promise<void>;
}

export class VendorDatabaseStorage implements IVendorStorage {
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getVendorById(id: number): Promise<Vendor | undefined> {
    // Use raw SQL to avoid Drizzle ORM query builder issues
    const result = await db.execute(sql`
      SELECT * FROM vendors WHERE id = ${id} LIMIT 1
    `);
    return result.rows[0] as Vendor | undefined;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    // Use raw SQL to avoid Drizzle ORM query builder issues
    const result = await db.execute(sql`
      SELECT * FROM vendors WHERE user_id = ${userId} LIMIT 1
    `);
    return result.rows[0] as Vendor | undefined;
  }

  async updateVendor(id: number, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updated] = await db
      .update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updated;
  }

  async getAllServiceCategories(): Promise<VendorServiceCategory[]> {
    return await db
      .select()
      .from(vendorServiceCategories)
      .where(eq(vendorServiceCategories.isActive, true))
      .orderBy(vendorServiceCategories.displayOrder);
  }

  async getServiceCategoryBySlug(slug: string): Promise<VendorServiceCategory | undefined> {
    const [category] = await db
      .select()
      .from(vendorServiceCategories)
      .where(eq(vendorServiceCategories.slug, slug));
    return category;
  }

  async createVendorService(service: InsertVendorService): Promise<VendorService> {
    const [newService] = await db.insert(vendorServices).values(service).returning();
    return newService;
  }

  async getVendorServices(vendorId: number): Promise<VendorService[]> {
    return await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, vendorId))
      .orderBy(desc(vendorServices.createdAt));
  }

  async updateVendorService(id: number, updates: Partial<InsertVendorService>): Promise<VendorService | undefined> {
    const [updated] = await db
      .update(vendorServices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendorServices.id, id))
      .returning();
    return updated;
  }

  async deleteVendorService(id: number): Promise<boolean> {
    const result = await db.delete(vendorServices).where(eq(vendorServices.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllSubscriptionPlans(): Promise<VendorSubscriptionPlan[]> {
    return await db
      .select()
      .from(vendorSubscriptionPlans)
      .where(eq(vendorSubscriptionPlans.isActive, true))
      .orderBy(vendorSubscriptionPlans.displayOrder);
  }

  async getSubscriptionPlanById(id: number): Promise<VendorSubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(vendorSubscriptionPlans)
      .where(eq(vendorSubscriptionPlans.id, id));
    return plan;
  }

  async createLead(lead: InsertVendorLead): Promise<VendorLead> {
    const [newLead] = await db.insert(vendorLeads).values(lead).returning();
    
    // Update vendor metrics
    await this.updateVendorMetrics(lead.vendorId);
    
    return newLead;
  }

  async getVendorLeads(vendorId: number, filters?: { status?: string; startDate?: Date; endDate?: Date }): Promise<VendorLead[]> {
    const conditions = [eq(vendorLeads.vendorId, vendorId)];
    
    if (filters?.status) {
      conditions.push(eq(vendorLeads.status, filters.status));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(vendorLeads.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(vendorLeads.createdAt, filters.endDate));
    }
    
    return await db
      .select()
      .from(vendorLeads)
      .where(and(...conditions))
      .orderBy(desc(vendorLeads.createdAt));
  }

  async updateLead(id: number, updates: Partial<InsertVendorLead>): Promise<VendorLead | undefined> {
    const [updated] = await db
      .update(vendorLeads)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendorLeads.id, id))
      .returning();
    
    if (updated) {
      await this.updateVendorMetrics(updated.vendorId);
    }
    
    return updated;
  }

  async getVendorReviews(vendorId: number): Promise<VendorReview[]> {
    return await db
      .select()
      .from(vendorReviews)
      .where(and(
        eq(vendorReviews.vendorId, vendorId),
        eq(vendorReviews.status, 'approved')
      ))
      .orderBy(desc(vendorReviews.createdAt));
  }

  async createReview(review: InsertVendorReview): Promise<VendorReview> {
    const [newReview] = await db.insert(vendorReviews).values(review).returning();
    
    // Update vendor metrics
    await this.updateVendorMetrics(review.vendorId);
    
    return newReview;
  }

  async getVendorAnalytics(vendorId: number, startDate: Date, endDate: Date): Promise<VendorAnalytics[]> {
    return await db
      .select()
      .from(vendorAnalytics)
      .where(and(
        eq(vendorAnalytics.vendorId, vendorId),
        sql`${vendorAnalytics.date} >= ${startDate.toISOString().split('T')[0]}`,
        sql`${vendorAnalytics.date} <= ${endDate.toISOString().split('T')[0]}`
      ))
      .orderBy(desc(vendorAnalytics.date));
  }

  async updateVendorMetrics(vendorId: number): Promise<void> {
    // Update total leads count
    const [leadStats] = await db
      .select({
        totalLeads: sql<number>`count(*)`,
        totalConversions: sql<number>`count(*) filter (where converted = true)`,
        lifetimeRevenue: sql<number>`sum(conversion_value) filter (where converted = true)`
      })
      .from(vendorLeads)
      .where(eq(vendorLeads.vendorId, vendorId));

    // Update review stats
    const [reviewStats] = await db
      .select({
        totalReviews: sql<number>`count(*)`,
        averageRating: sql<number>`avg(rating)`
      })
      .from(vendorReviews)
      .where(and(
        eq(vendorReviews.vendorId, vendorId),
        eq(vendorReviews.status, 'approved')
      ));

    await db
      .update(vendors)
      .set({
        totalLeads: leadStats?.totalLeads || 0,
        totalConversions: leadStats?.totalConversions || 0,
        lifetimeRevenue: String(leadStats?.lifetimeRevenue || 0),
        totalReviews: reviewStats?.totalReviews || 0,
        averageRating: reviewStats?.averageRating ? String(reviewStats.averageRating) : null,
        updatedAt: new Date()
      })
      .where(eq(vendors.id, vendorId));
  }
}

export const vendorStorage = new VendorDatabaseStorage();