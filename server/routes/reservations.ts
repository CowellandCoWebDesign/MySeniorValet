import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { reservations, communities } from "@shared/schema";
import { eq, and, gt, sql } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import sgMail from "@sendgrid/mail";

const router = Router();

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Reservation request schema
const createReservationSchema = z.object({
  communityId: z.number(),
  unitType: z.string().optional(),
  moveInDate: z.string().optional(),
  notes: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

// Generate unique reservation ID
function generateReservationId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `RES-${timestamp}-${randomStr}`.toUpperCase();
}

// Create a new reservation
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const body = createReservationSchema.parse(req.body);
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if community exists and has availability
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, body.communityId));

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check for existing active reservations for this user and community
    const existingReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.communityId, body.communityId),
          eq(reservations.status, "active"),
          gt(reservations.expiresAt, new Date())
        )
      );

    if (existingReservations.length > 0) {
      return res.status(400).json({ 
        message: "You already have an active reservation for this community",
        reservationId: existingReservations[0].reservationId
      });
    }

    // Create the reservation
    const reservationId = generateReservationId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiration

    const [reservation] = await db
      .insert(reservations)
      .values({
        reservationId,
        userId,
        communityId: body.communityId,
        communityName: community.name,
        unitType: body.unitType || "Standard",
        status: "active",
        createdAt: new Date(),
        expiresAt,
        moveInDate: body.moveInDate ? new Date(body.moveInDate) : null,
        notes: body.notes,
        contactName: body.contactName || req.user?.claims?.first_name || "Guest",
        contactEmail: body.contactEmail || req.user?.claims?.email,
        contactPhone: body.contactPhone,
      })
      .returning();

    // Send confirmation email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY && reservation.contactEmail) {
      try {
        await sgMail.send({
          to: reservation.contactEmail,
          from: "reservations@myseniorvalet.com", // Update with your verified sender
          subject: `Reservation Confirmed: ${community.name} - ${reservationId}`,
          html: `
            <h2>Your Senior Living Reservation is Confirmed!</h2>
            <p>Thank you for reserving a unit at <strong>${community.name}</strong>.</p>
            <h3>Reservation Details:</h3>
            <ul>
              <li><strong>Reservation ID:</strong> ${reservationId}</li>
              <li><strong>Community:</strong> ${community.name}</li>
              <li><strong>Unit Type:</strong> ${body.unitType || "Standard"}</li>
              <li><strong>Valid Until:</strong> ${expiresAt.toLocaleString()}</li>
              ${body.moveInDate ? `<li><strong>Preferred Move-in Date:</strong> ${new Date(body.moveInDate).toLocaleDateString()}</li>` : ""}
            </ul>
            <p>This reservation will be held for 48 hours. A community representative will contact you within 24 hours to discuss next steps.</p>
            <p>If you have any questions, please contact the community directly at ${community.phone || "the number provided on our website"}.</p>
            <hr>
            <p><small>MySeniorValet - Your trusted partner in senior living decisions</small></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send reservation email:", emailError);
        // Don't fail the reservation if email fails
      }
    }

    res.json({
      success: true,
      reservation: {
        id: reservation.id,
        reservationId: reservation.reservationId,
        communityName: reservation.communityName,
        unitType: reservation.unitType,
        status: reservation.status,
        expiresAt: reservation.expiresAt,
        createdAt: reservation.createdAt,
      },
      message: `Reservation ${reservationId} confirmed! Valid for 48 hours.`,
    });
  } catch (error) {
    console.error("Reservation creation error:", error);
    res.status(500).json({ message: "Failed to create reservation" });
  }
});

// Get user's reservations
router.get("/my-reservations", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userReservations = await db
      .select()
      .from(reservations)
      .where(eq(reservations.userId, userId))
      .orderBy(sql`${reservations.createdAt} DESC`);

    // Update expired reservations
    const now = new Date();
    const updatedReservations = userReservations.map(reservation => {
      if (reservation.status === "active" && reservation.expiresAt < now) {
        return { ...reservation, status: "expired" };
      }
      return reservation;
    });

    res.json(updatedReservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
});

// Get reservation by ID
router.get("/:reservationId", isAuthenticated, async (req: any, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const [reservation] = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.reservationId, reservationId),
          eq(reservations.userId, userId)
        )
      );

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if expired
    if (reservation.status === "active" && reservation.expiresAt < new Date()) {
      reservation.status = "expired";
    }

    res.json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    res.status(500).json({ message: "Failed to fetch reservation" });
  }
});

// Cancel reservation
router.post("/:reservationId/cancel", isAuthenticated, async (req: any, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const [reservation] = await db
      .update(reservations)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(reservations.reservationId, reservationId),
          eq(reservations.userId, userId),
          eq(reservations.status, "active")
        )
      )
      .returning();

    if (!reservation) {
      return res.status(404).json({ message: "Active reservation not found" });
    }

    res.json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ message: "Failed to cancel reservation" });
  }
});

// Check community availability (public endpoint)
router.get("/availability/:communityId", async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    
    // Count active reservations for this community
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(
        and(
          eq(reservations.communityId, communityId),
          eq(reservations.status, "active"),
          gt(reservations.expiresAt, new Date())
        )
      );

    const activeReservations = result?.count || 0;
    
    // Get community details
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Simple availability logic (can be enhanced)
    const maxReservations = 10; // Configure per community
    const availableSlots = Math.max(0, maxReservations - activeReservations);
    
    res.json({
      communityId,
      communityName: community.name,
      activeReservations,
      availableSlots,
      acceptingReservations: availableSlots > 0,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ message: "Failed to check availability" });
  }
});

export default router;