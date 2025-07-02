import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  description: text("description"),
  careTypes: text("care_types").array().notNull(), // ['Independent Living', 'Assisted Living', 'Memory Care', 'Skilled Nursing']
  amenities: text("amenities").array().default([]),
  priceRange: json("price_range").$type<{ min: number; max: number }>(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  imageUrl: text("image_url"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  licenseNumber: text("license_number"),
  licenseStatus: text("license_status"), // 'Licensed', 'Under Review', 'Expired'
  lastInspection: timestamp("last_inspection"),
  violations: integer("violations").default(0),
  isVerified: boolean("is_verified").default(false),
  isClaimed: boolean("is_claimed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  inspectionDate: timestamp("inspection_date").notNull(),
  inspectionType: text("inspection_type").notNull(),
  violations: json("violations").$type<Array<{
    type: string;
    description: string;
    severity: 'Minor' | 'Major' | 'Critical';
    status: 'Active' | 'Resolved';
  }>>().default([]),
  overallScore: integer("overall_score"),
  reportUrl: text("report_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const communitiesRelations = relations(communities, ({ many }) => ({
  inspections: many(inspections),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  community: one(communities, {
    fields: [inspections.communityId],
    references: [communities.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCommunitySchema = createInsertSchema(communities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
});

export const searchCommunitySchema = z.object({
  location: z.string().optional(),
  careType: z.string().optional(),
  budget: z.string().optional(),
  distance: z.number().optional(),
  amenities: z.array(z.string()).optional(),
  minRating: z.number().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCommunity = z.infer<typeof insertCommunitySchema>;
export type Community = typeof communities.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type SearchCommunity = z.infer<typeof searchCommunitySchema>;
