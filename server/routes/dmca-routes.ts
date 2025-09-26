import { Express } from "express";
import { db } from "../db";
import { communities, vendors, dmcaTakedowns } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { z } from "zod";

// DMCA takedown request schema
const dmcaTakedownSchema = z.object({
  communityId: z.number().optional(),
  serviceId: z.number().optional(),
  contentType: z.enum(['photo', 'description', 'logo']),
  contentUrl: z.string().optional(),
  claimantName: z.string().min(1),
  claimantEmail: z.string().email(),
  claimantPhone: z.string().optional(),
  claimDescription: z.string().min(50), // Require detailed description
  copyrightInfo: z.string().optional(),
  signature: z.string().min(1), // Electronic signature required
});

export function registerDmcaRoutes(app: Express) {
  // DMCA notice submission endpoint
  app.post("/api/dmca/submit", async (req, res) => {
    try {
      const parsed = dmcaTakedownSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid DMCA takedown request", 
          details: parsed.error.errors 
        });
      }
      
      const { communityId, serviceId, ...takedownData } = parsed.data;
      
      // Create the takedown record
      const [takedown] = await db.insert(dmcaTakedowns)
        .values({
          communityId,
          serviceId,
          ...takedownData,
          actionTaken: 'pending',
          isValid: true,
        })
        .returning();
      
      // Immediately remove the content to comply with DMCA safe harbor
      if (communityId) {
        // Clear photos from community
        if (takedownData.contentType === 'photo') {
          await db.update(communities)
            .set({ 
              photos: [],
              lastPhotoUpdate: new Date(),
            })
            .where(eq(communities.id, communityId));
        }
      }
      
      if (serviceId) {
        // Clear photos from vendor/service
        if (takedownData.contentType === 'photo') {
          await db.update(vendors)
            .set({ 
              photos: [],
            })
            .where(eq(vendors.id, serviceId));
        }
      }
      
      // Update takedown status
      await db.update(dmcaTakedowns)
        .set({
          actionTaken: 'removed',
          actionDate: new Date(),
        })
        .where(eq(dmcaTakedowns.id, takedown.id));
      
      res.json({
        success: true,
        message: "DMCA takedown notice received. Content has been removed pending review.",
        referenceNumber: `DMCA-${takedown.id}`,
      });
      
    } catch (error) {
      console.error("Error processing DMCA takedown:", error);
      res.status(500).json({ error: "Failed to process DMCA takedown request" });
    }
  });
  
  // Get DMCA takedown status
  app.get("/api/dmca/status/:referenceNumber", async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const id = parseInt(referenceNumber.replace('DMCA-', ''));
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid reference number" });
      }
      
      const [takedown] = await db.select()
        .from(dmcaTakedowns)
        .where(eq(dmcaTakedowns.id, id));
      
      if (!takedown) {
        return res.status(404).json({ error: "Takedown notice not found" });
      }
      
      res.json({
        referenceNumber: `DMCA-${takedown.id}`,
        status: takedown.actionTaken,
        submittedAt: takedown.receivedAt,
        actionDate: takedown.actionDate,
        contentType: takedown.contentType,
      });
      
    } catch (error) {
      console.error("Error fetching DMCA status:", error);
      res.status(500).json({ error: "Failed to fetch DMCA status" });
    }
  });
  
  // DMCA policy page data
  app.get("/api/dmca/policy", async (req, res) => {
    res.json({
      agentName: "MySeniorValet Legal Department",
      agentEmail: "admin@myseniorvalet.com",
      agentAddress: "MySeniorValet, Legal Department, [Address]",
      policy: {
        cachePolicy: {
          photos: "24 hours (DMCA 512(b) safe harbor)",
          descriptions: "7 days",
          pricing: "7 days",
          contactInfo: "30 days (factual data)",
        },
        takedownProcess: [
          "Submit a valid DMCA notice with all required information",
          "Content will be removed immediately upon receipt",
          "We will notify the content provider if applicable",
          "Counter-notices may be submitted within 14 days",
          "Content may be restored after 10-14 business days if no legal action is taken",
        ],
        requiredInfo: [
          "Your name and contact information",
          "Identification of the copyrighted work",
          "URL or description of the infringing content",
          "Statement of good faith belief",
          "Statement of accuracy under penalty of perjury",
          "Electronic or physical signature",
        ],
      }
    });
  });
  
  console.log("✅ DMCA compliance routes registered");
}