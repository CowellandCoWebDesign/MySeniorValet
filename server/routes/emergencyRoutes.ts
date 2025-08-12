import { Router, Request, Response } from "express";
import { db } from "../db";
import { emergencyContacts } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import sgMail from "@sendgrid/mail";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const router = Router();

// Get all emergency contacts for a user
router.get("/contacts/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Use raw SQL to handle snake_case column names
    const result = await db.execute(sql`
      SELECT 
        id,
        user_id as "userId",
        name,
        relationship,
        phone,
        is_primary as "isPrimary",
        contact_type as "contactType",
        notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM emergency_contacts
      WHERE user_id = ${parseInt(userId)}
      ORDER BY is_primary DESC, created_at ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    res.status(500).json({ error: "Failed to fetch emergency contacts" });
  }
});

// Get primary emergency contact
router.get("/primary/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const result = await db.execute(sql`
      SELECT 
        id,
        user_id as "userId",
        name,
        relationship,
        phone,
        is_primary as "isPrimary",
        contact_type as "contactType",
        notes
      FROM emergency_contacts
      WHERE user_id = ${parseInt(userId)} AND is_primary = true
      LIMIT 1
    `);
    
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Error fetching primary contact:", error);
    res.status(500).json({ error: "Failed to fetch primary contact" });
  }
});

// Add new emergency contact
router.post("/contacts", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      name,
      relationship,
      phone,
      isPrimary,
      contactType,
      notes
    } = req.body;
    
    // If setting as primary, unset other primary contacts first
    if (isPrimary) {
      await db.execute(sql`
        UPDATE emergency_contacts 
        SET is_primary = false 
        WHERE user_id = ${userId}
      `);
    }
    
    const result = await db.execute(sql`
      INSERT INTO emergency_contacts (
        user_id,
        name,
        relationship,
        phone,
        is_primary,
        contact_type,
        notes
      ) VALUES (
        ${userId},
        ${name},
        ${relationship || null},
        ${phone},
        ${isPrimary || false},
        ${contactType || 'personal'},
        ${notes || null}
      ) RETURNING 
        id,
        user_id as "userId",
        name,
        relationship,
        phone,
        is_primary as "isPrimary",
        contact_type as "contactType",
        notes
    `);
    
    res.json({
      success: true,
      contact: result.rows[0]
    });
  } catch (error) {
    console.error("Error adding emergency contact:", error);
    res.status(500).json({ error: "Failed to add emergency contact" });
  }
});

// Update emergency contact
router.put("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      relationship,
      phone,
      isPrimary,
      contactType,
      notes
    } = req.body;
    
    // Get userId for this contact
    const contactResult = await db.execute(sql`
      SELECT user_id FROM emergency_contacts WHERE id = ${parseInt(id)}
    `);
    
    if (contactResult.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    
    const userId = contactResult.rows[0].user_id;
    
    // If setting as primary, unset other primary contacts first
    if (isPrimary) {
      await db.execute(sql`
        UPDATE emergency_contacts 
        SET is_primary = false 
        WHERE user_id = ${userId} AND id != ${parseInt(id)}
      `);
    }
    
    const result = await db.execute(sql`
      UPDATE emergency_contacts 
      SET 
        name = ${name},
        relationship = ${relationship || null},
        phone = ${phone},
        is_primary = ${isPrimary || false},
        contact_type = ${contactType || 'personal'},
        notes = ${notes || null},
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING 
        id,
        user_id as "userId",
        name,
        relationship,
        phone,
        is_primary as "isPrimary",
        contact_type as "contactType",
        notes
    `);
    
    res.json({
      success: true,
      contact: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    res.status(500).json({ error: "Failed to update emergency contact" });
  }
});

// Delete emergency contact
router.delete("/contacts/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await db.execute(sql`
      DELETE FROM emergency_contacts 
      WHERE id = ${parseInt(id)}
    `);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    res.status(500).json({ error: "Failed to delete emergency contact" });
  }
});

// Quick emergency dial endpoint - returns all important numbers
router.get("/quick-dial/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Get user's emergency contacts
    const contactsResult = await db.execute(sql`
      SELECT 
        name,
        relationship,
        phone,
        is_primary as "isPrimary",
        contact_type as "contactType"
      FROM emergency_contacts
      WHERE user_id = ${parseInt(userId)}
      ORDER BY is_primary DESC, created_at ASC
      LIMIT 5
    `);
    
    // Return emergency numbers including 911
    res.json({
      emergency: {
        number: "911",
        label: "Emergency Services",
        type: "emergency"
      },
      primaryContact: contactsResult.rows.find((c: any) => c.isPrimary) || null,
      otherContacts: contactsResult.rows.filter((c: any) => !c.isPrimary),
      poison: {
        number: "1-800-222-1222",
        label: "Poison Control",
        type: "medical"
      },
      suicide: {
        number: "988",
        label: "Suicide & Crisis Lifeline",
        type: "crisis"
      }
    });
  } catch (error) {
    console.error("Error fetching quick dial numbers:", error);
    res.status(500).json({ error: "Failed to fetch emergency numbers" });
  }
});

// Log emergency button press and notify admin
router.post("/button-pressed", async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, userName, location } = req.body;
    
    console.log("🚨 EMERGENCY BUTTON PRESSED:", {
      userId,
      userEmail,
      userName,
      location,
      timestamp: new Date().toISOString()
    });
    
    // Send email notification to admin
    if (process.env.SENDGRID_API_KEY) {
      const adminEmail = "William.cowell01@gmail.com";
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "full",
        timeStyle: "long"
      });
      
      const msg = {
        to: adminEmail,
        from: "hello@myseniorvalet.com",
        subject: "🚨 URGENT: Emergency Button Pressed on MySeniorValet",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="background: #dc2626; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0;">⚠️ EMERGENCY BUTTON ACTIVATED</h2>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <h3 style="color: #1f2937; margin-top: 0;">User Information:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li><strong>User ID:</strong> ${userId || "Unknown"}</li>
                <li><strong>Email:</strong> ${userEmail || "Not logged in"}</li>
                <li><strong>Name:</strong> ${userName || "Anonymous"}</li>
                <li><strong>Location:</strong> ${location || "Not specified"}</li>
                <li><strong>Time:</strong> ${timestamp}</li>
              </ul>
              
              <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="color: #991b1b; margin: 0;">
                  <strong>Action Required:</strong> This user may be experiencing an emergency situation. 
                  Consider reaching out if contact information is available.
                </p>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 8px; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                This is an automated alert from MySeniorValet Emergency System<br>
                <strong>The trusted platform for authentic senior living community information</strong>
              </p>
            </div>
          </div>
        `
      };
      
      try {
        await sgMail.send(msg);
        console.log("✅ Admin notification email sent successfully");
      } catch (emailError) {
        console.error("Failed to send admin notification email:", emailError);
      }
    }
    
    res.json({ 
      success: true,
      message: "Emergency button press logged successfully"
    });
  } catch (error) {
    console.error("Error logging emergency button press:", error);
    res.status(500).json({ 
      error: "Failed to log emergency button press" 
    });
  }
});

export default router;