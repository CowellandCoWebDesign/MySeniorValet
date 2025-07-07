/**
 * Emotional Support Resource Management
 * Provides curated content to help families navigate senior living decisions
 */

import { db } from "./db";
import { 
  supportResources, 
  supportResourceCategories, 
  userSupportResourceInteractions,
  type SupportResource,
  type SupportResourceCategory,
  type InsertSupportResource,
  type InsertSupportResourceCategory,
  type InsertUserSupportResourceInteraction
} from "@shared/schema";
import { eq, desc, asc, and, ilike, inArray, sql } from "drizzle-orm";

export class SupportResourceService {
  /**
   * Get all active resource categories with resource counts
   */
  async getCategories(): Promise<(SupportResourceCategory & { resourceCount: number })[]> {
    const result = await db
      .select({
        id: supportResourceCategories.id,
        name: supportResourceCategories.name,
        description: supportResourceCategories.description,
        icon: supportResourceCategories.icon,
        colorScheme: supportResourceCategories.colorScheme,
        displayOrder: supportResourceCategories.displayOrder,
        isActive: supportResourceCategories.isActive,
        createdAt: supportResourceCategories.createdAt,
        updatedAt: supportResourceCategories.updatedAt,
        resourceCount: sql<number>`count(${supportResources.id})::int`,
      })
      .from(supportResourceCategories)
      .leftJoin(supportResources, eq(supportResourceCategories.id, supportResources.categoryId))
      .where(eq(supportResourceCategories.isActive, true))
      .groupBy(supportResourceCategories.id)
      .orderBy(asc(supportResourceCategories.displayOrder), asc(supportResourceCategories.name));

    return result;
  }

  /**
   * Get resources by category with optional filtering
   */
  async getResourcesByCategory(
    categoryId: number,
    options: {
      careStage?: string;
      emotionalThemes?: string[];
      targetAudience?: string[];
      difficulty?: string;
      featured?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SupportResource[]> {
    let query = db
      .select()
      .from(supportResources)
      .where(eq(supportResources.categoryId, categoryId));

    // Apply filters
    const conditions = [eq(supportResources.categoryId, categoryId)];

    if (options.careStage) {
      conditions.push(eq(supportResources.careStage, options.careStage as any));
    }

    if (options.emotionalThemes && options.emotionalThemes.length > 0) {
      // Check if any of the themes match
      conditions.push(
        sql`${supportResources.emotionalThemes} && ${options.emotionalThemes}`
      );
    }

    if (options.targetAudience && options.targetAudience.length > 0) {
      conditions.push(
        sql`${supportResources.targetAudience} && ${options.targetAudience}`
      );
    }

    if (options.difficulty) {
      conditions.push(eq(supportResources.difficulty, options.difficulty as any));
    }

    if (options.featured) {
      conditions.push(eq(supportResources.isFeatured, true));
    }

    query = query.where(and(...conditions));

    // Order by featured first, then by helpful count and view count
    query = query.orderBy(
      desc(supportResources.isFeatured),
      desc(supportResources.helpfulCount),
      desc(supportResources.viewCount),
      desc(supportResources.publishedAt)
    );

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  /**
   * Get featured resources across all categories
   */
  async getFeaturedResources(limit: number = 6): Promise<SupportResource[]> {
    return await db
      .select()
      .from(supportResources)
      .where(eq(supportResources.isFeatured, true))
      .orderBy(desc(supportResources.helpfulCount), desc(supportResources.viewCount))
      .limit(limit);
  }

  /**
   * Search resources by keywords
   */
  async searchResources(
    query: string,
    options: {
      careStage?: string;
      emotionalThemes?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<SupportResource[]> {
    const searchConditions = [
      sql`(
        ${supportResources.title} ILIKE ${'%' + query + '%'} OR
        ${supportResources.description} ILIKE ${'%' + query + '%'} OR
        ${supportResources.content} ILIKE ${'%' + query + '%'} OR
        array_to_string(${supportResources.tags}, ',') ILIKE ${'%' + query + '%'}
      )`
    ];

    if (options.careStage) {
      searchConditions.push(eq(supportResources.careStage, options.careStage as any));
    }

    if (options.emotionalThemes && options.emotionalThemes.length > 0) {
      searchConditions.push(
        sql`${supportResources.emotionalThemes} && ${options.emotionalThemes}`
      );
    }

    let searchQuery = db
      .select()
      .from(supportResources)
      .where(and(...searchConditions))
      .orderBy(desc(supportResources.helpfulCount), desc(supportResources.viewCount));

    if (options.limit) {
      searchQuery = searchQuery.limit(options.limit);
    }

    if (options.offset) {
      searchQuery = searchQuery.offset(options.offset);
    }

    return await searchQuery;
  }

  /**
   * Get a single resource by ID and increment view count
   */
  async getResourceById(id: number, userId?: number): Promise<SupportResource | null> {
    const [resource] = await db
      .select()
      .from(supportResources)
      .where(eq(supportResources.id, id))
      .limit(1);

    if (!resource) return null;

    // Increment view count
    await db
      .update(supportResources)
      .set({ viewCount: sql`${supportResources.viewCount} + 1` })
      .where(eq(supportResources.id, id));

    // Track user interaction if user is logged in
    if (userId) {
      await this.trackUserInteraction({
        userId,
        resourceId: id,
        interactionType: "viewed"
      });
    }

    return resource;
  }

  /**
   * Track user interactions with resources
   */
  async trackUserInteraction(interaction: InsertUserSupportResourceInteraction): Promise<void> {
    // Check if interaction already exists for this user and resource
    const existing = await db
      .select()
      .from(userSupportResourceInteractions)
      .where(
        and(
          eq(userSupportResourceInteractions.userId, interaction.userId!),
          eq(userSupportResourceInteractions.resourceId, interaction.resourceId!),
          eq(userSupportResourceInteractions.interactionType, interaction.interactionType)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userSupportResourceInteractions).values(interaction);

      // Update helpful count if it's a helpful interaction
      if (interaction.interactionType === "helpful") {
        await db
          .update(supportResources)
          .set({ helpfulCount: sql`${supportResources.helpfulCount} + 1` })
          .where(eq(supportResources.id, interaction.resourceId!));
      }
    }
  }

  /**
   * Get user's bookmarked resources
   */
  async getUserBookmarks(userId: number): Promise<SupportResource[]> {
    const bookmarkedIds = await db
      .select({ resourceId: userSupportResourceInteractions.resourceId })
      .from(userSupportResourceInteractions)
      .where(
        and(
          eq(userSupportResourceInteractions.userId, userId),
          eq(userSupportResourceInteractions.interactionType, "bookmarked")
        )
      );

    if (bookmarkedIds.length === 0) return [];

    const ids = bookmarkedIds.map(b => b.resourceId!);
    return await db
      .select()
      .from(supportResources)
      .where(inArray(supportResources.id, ids))
      .orderBy(desc(supportResources.publishedAt));
  }

  /**
   * Get personalized resource recommendations based on user profile
   */
  async getPersonalizedRecommendations(
    userProfile: {
      relationshipToCare?: string;
      careNeeds?: string[];
      currentStage?: string;
    },
    limit: number = 5
  ): Promise<SupportResource[]> {
    // Simple recommendation logic based on user profile
    const conditions = [];

    // Match target audience based on relationship to care
    if (userProfile.relationshipToCare) {
      const audienceMap = {
        "Seeking for Self": ["seniors"],
        "Seeking for Parent": ["family_members"],
        "Seeking for Spouse": ["family_members"],
        "Seeking for Other Family": ["family_members"],
        "Healthcare Professional": ["professionals"]
      };
      
      const targetAudience = audienceMap[userProfile.relationshipToCare as keyof typeof audienceMap];
      if (targetAudience) {
        conditions.push(
          sql`${supportResources.targetAudience} && ${targetAudience}`
        );
      }
    }

    // Match care stage if provided
    if (userProfile.currentStage) {
      conditions.push(eq(supportResources.careStage, userProfile.currentStage as any));
    }

    let query = db.select().from(supportResources);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query
      .orderBy(
        desc(supportResources.isFeatured),
        desc(supportResources.helpfulCount),
        desc(supportResources.viewCount)
      )
      .limit(limit);
  }

  /**
   * Seed initial resource categories and content
   */
  async seedInitialContent(): Promise<void> {
    // Check if categories already exist
    const existingCategories = await db.select().from(supportResourceCategories).limit(1);
    if (existingCategories.length > 0) return;

    // Create initial categories
    const categories = [
      {
        name: "Getting Started",
        description: "Essential guides for beginning your senior living journey",
        icon: "BookOpen",
        colorScheme: "blue",
        displayOrder: 1,
        isActive: true
      },
      {
        name: "Emotional Support",
        description: "Resources to help navigate the emotional aspects of senior care decisions",
        icon: "Heart",
        colorScheme: "pink",
        displayOrder: 2,
        isActive: true
      },
      {
        name: "Financial Planning",
        description: "Understanding costs, insurance, and payment options",
        icon: "DollarSign",
        colorScheme: "green",
        displayOrder: 3,
        isActive: true
      },
      {
        name: "Family Communication",
        description: "Tools for difficult conversations and family decision-making",
        icon: "Users",
        colorScheme: "purple",
        displayOrder: 4,
        isActive: true
      },
      {
        name: "Transition Support",
        description: "Guides for making the move and adjusting to senior living",
        icon: "ArrowRight",
        colorScheme: "orange",
        displayOrder: 5,
        isActive: true
      }
    ];

    await db.insert(supportResourceCategories).values(categories);
    console.log("✅ Seeded support resource categories");
  }
}

export const supportResourceService = new SupportResourceService();