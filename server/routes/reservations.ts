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

    // Send confirmation emails if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      // Send confirmation to guest
      if (reservation.contactEmail) {
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
          console.error("Failed to send guest reservation email:", emailError);
        }
      }

      // Send notification to community
      try {
        // Generate community email based on name (or use a default)
        const communityEmail = (community as any).email || 
                             `admissions@${community.name.toLowerCase().replace(/\s+/g, '')}.com`;
        
        await sgMail.send({
          to: communityEmail,
          from: "reservations@myseniorvalet.com",
          subject: `New Reservation Alert: ${reservationId} - ${reservation.contactName}`,
          html: `
            <h2>🎉 New Unit Reservation Received!</h2>
            <p>A prospective resident has reserved a unit at your community through MySeniorValet.</p>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Reservation Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Reservation ID:</strong></td>
                  <td>${reservationId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Guest Name:</strong></td>
                  <td>${reservation.contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td><a href="mailto:${reservation.contactEmail}">${reservation.contactEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                  <td><a href="tel:${reservation.contactPhone}">${reservation.contactPhone || 'Not provided'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Unit Type Requested:</strong></td>
                  <td>${reservation.unitType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Desired Move-in Date:</strong></td>
                  <td>${reservation.moveInDate ? new Date(reservation.moveInDate).toLocaleDateString() : 'Flexible'}</td>
                </tr>
                ${reservation.notes ? `
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;"><strong>Special Notes:</strong></td>
                  <td>${reservation.notes}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0;">⏰ Action Required:</h4>
              <p style="margin: 5px 0;">• Contact the guest within 24 hours</p>
              <p style="margin: 5px 0;">• This reservation expires in 48 hours</p>
              <p style="margin: 5px 0;">• Expiration: ${expiresAt.toLocaleString()}</p>
            </div>
            
            <hr>
            <p><small>This reservation was made through MySeniorValet - Your partner in senior living placement</small></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send community notification email:", emailError);
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

// Create reservation from advanced flow (no auth required for demo)
router.post("/reserve", async (req, res) => {
  try {
    const body = req.body;
    
    // Check if community exists
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, body.communityId));

    if (!community) {
      return res.status(404).json({ success: false, error: "Community not found" });
    }

    // Create the reservation
    const reservationId = generateReservationId();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiration

    const [reservation] = await db
      .insert(reservations)
      .values({
        reservationId,
        userId: "guest-" + Date.now(), // Guest user ID for unauthenticated reservations
        communityId: body.communityId,
        communityName: community.name,
        unitType: body.unitType || "Standard",
        status: "active",
        createdAt: new Date(),
        expiresAt,
        moveInDate: body.moveInDate ? new Date(body.moveInDate) : null,
        notes: body.careNeeds || body.message,
        contactName: body.contactName,
        contactEmail: body.email,
        contactPhone: body.phone,
      })
      .returning();

    // Send confirmation emails if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      // Send confirmation to guest
      if (body.email) {
        try {
          await sgMail.send({
            to: body.email,
            from: "reservations@myseniorvalet.com",
            subject: `Reservation Confirmed: ${community.name} - ${reservationId}`,
            html: `
              <h2>Your Senior Living Reservation is Confirmed!</h2>
              <p>Thank you for reserving a unit at <strong>${community.name}</strong>.</p>
              <h3>Reservation Details:</h3>
              <ul>
                <li><strong>Reservation ID:</strong> ${reservationId}</li>
                <li><strong>Community:</strong> ${community.name}</li>
                <li><strong>Unit Type:</strong> ${body.unitType || "Standard"}</li>
                <li><strong>Tour Time:</strong> ${body.tourTime || "To be scheduled"}</li>
                <li><strong>Move-in Date:</strong> ${body.moveInDate ? new Date(body.moveInDate).toLocaleDateString() : "Flexible"}</li>
                <li><strong>Valid Until:</strong> ${expiresAt.toLocaleString()}</li>
              </ul>
              <p>This reservation will be held for 48 hours. A community representative will contact you within 24 hours.</p>
              <hr>
              <p><small>MySeniorValet - Your trusted partner in senior living decisions</small></p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send guest email:", emailError);
        }
      }

      // Send notification to community
      try {
        const communityEmail = (community as any).email || 
                             `admissions@${community.name.toLowerCase().replace(/\s+/g, '')}.com`;
        
        await sgMail.send({
          to: communityEmail,
          from: "reservations@myseniorvalet.com",
          subject: `🎉 New Reservation: ${reservationId} - ${body.contactName}`,
          html: `
            <h2>🎉 New Unit Reservation via MySeniorValet!</h2>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Guest Information:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Name:</strong></td>
                  <td>${body.contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td><a href="mailto:${body.email}">${body.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                  <td><a href="tel:${body.phone}">${body.phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Unit Type:</strong></td>
                  <td>${body.unitType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Tour Time:</strong></td>
                  <td>${body.tourTime || "To be scheduled"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Move-in Date:</strong></td>
                  <td>${body.moveInDate ? new Date(body.moveInDate).toLocaleDateString() : "Flexible"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Budget:</strong></td>
                  <td>${body.budget || "Not specified"}</td>
                </tr>
                ${body.careNeeds ? `
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;"><strong>Care Needs:</strong></td>
                  <td>${body.careNeeds}</td>
                </tr>
                ` : ''}
                ${body.depositAmount ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Deposit:</strong></td>
                  <td>$${body.depositAmount} ${body.paymentMethod === 'deposit' ? '(Ready to pay)' : '(Hold only)'}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0;">⏰ Action Required:</h4>
              <p>• Contact guest within 24 hours</p>
              <p>• Reservation expires: ${expiresAt.toLocaleString()}</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send community email:", emailError);
      }
    }

    res.json({
      success: true,
      reservationId: reservationId,
      message: "Reservation confirmed! The community will contact you within 24 hours."
    });
  } catch (error) {
    console.error("Reservation error:", error);
    res.status(500).json({ success: false, error: "Failed to create reservation" });
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