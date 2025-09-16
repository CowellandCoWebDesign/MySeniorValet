import { Request, Response, Router } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { EmailService } from '../services/email';

const router = Router();

// Handle one-click unsubscribe (POST request from email headers)
router.post('/api/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Update user's email preferences
    const result = await db.update(users)
      .set({ 
        notifications: {
          emailNotifications: false,
          smsNotifications: false,
          newListings: false,
          priceAlerts: false,
          messageAlerts: false,
          reviewReminders: false
        }
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      // User not found, but still return success to prevent email enumeration
      console.log(`Unsubscribe attempt for non-existent email: ${email}`);
    } else {
      console.log(`Successfully unsubscribed: ${email}`);
      
      // Send confirmation email (transactional - no unsubscribe link needed)
      await EmailService.sendEmail({
        to: email,
        subject: 'You have been unsubscribed from MySeniorValet',
        isTransactional: true,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Unsubscribe Confirmed</h2>
            <p>You have been successfully unsubscribed from all MySeniorValet marketing emails.</p>
            <p>You will still receive important transactional emails about your account, tours, and reservations.</p>
            <p style="margin-top: 30px;">If you unsubscribed by mistake, you can <a href="https://myseniorvalet.com/email-preferences" style="color: #1e40af;">update your email preferences</a> anytime.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              MySeniorValet - Clarity in Senior Living<br>
              hello@myseniorvalet.com
            </p>
          </div>
        `
      });
    }

    // Return success regardless to comply with one-click unsubscribe spec
    return res.status(200).send('Unsubscribed');
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).json({ error: 'Failed to process unsubscribe request' });
  }
});

// Handle GET unsubscribe (from clicking link in email)
router.get('/api/unsubscribe', async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>Invalid Unsubscribe Link</h1>
            <p>The unsubscribe link appears to be invalid. Please contact hello@myseniorvalet.com for assistance.</p>
          </body>
        </html>
      `);
    }

    // Update user's email preferences
    const result = await db.update(users)
      .set({ 
        notifications: {
          emailNotifications: false,
          smsNotifications: false,
          newListings: false,
          priceAlerts: false,
          messageAlerts: false,
          reviewReminders: false
        }
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length > 0) {
      // Send confirmation email
      await EmailService.sendEmail({
        to: email,
        subject: 'You have been unsubscribed from MySeniorValet',
        isTransactional: true,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1e40af;">Unsubscribe Confirmed</h2>
            <p>You have been successfully unsubscribed from all MySeniorValet marketing emails.</p>
            <p>You will still receive important transactional emails about your account, tours, and reservations.</p>
            <p style="margin-top: 30px;">If you unsubscribed by mistake, you can <a href="https://myseniorvalet.com/email-preferences" style="color: #1e40af;">update your email preferences</a> anytime.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              MySeniorValet - Clarity in Senior Living<br>
              hello@myseniorvalet.com
            </p>
          </div>
        `
      });
    }

    // Return user-friendly confirmation page
    return res.send(`
      <html>
        <head>
          <title>Unsubscribed - MySeniorValet</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background-color: #f3f4f6;">
          <div style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; text-align: center;">
            <h1 style="color: #1e40af; margin-bottom: 20px;">✓ Successfully Unsubscribed</h1>
            <p style="color: #333; line-height: 1.6;">
              You have been unsubscribed from MySeniorValet marketing emails.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              You will still receive important transactional emails about your account and tours.
            </p>
            <div style="margin-top: 30px;">
              <a href="https://myseniorvalet.com" style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Return to MySeniorValet
              </a>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Changed your mind? <a href="https://myseniorvalet.com/email-preferences?email=${encodeURIComponent(email)}" style="color: #1e40af;">Update preferences</a>
            </p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Unsubscribe Error</h1>
          <p>We encountered an error processing your request. Please contact hello@myseniorvalet.com for assistance.</p>
        </body>
      </html>
    `);
  }
});

// Check if email should receive marketing emails
router.get('/api/email-status/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    const user = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (user.length === 0) {
      // New email, can receive emails
      return res.json({ canReceiveEmails: true });
    }
    
    const notifications = user[0].notifications as any;
    const canReceiveEmails = notifications?.emailNotifications !== false;
    
    return res.json({ canReceiveEmails });
  } catch (error) {
    console.error('Email status check error:', error);
    // Default to allowing emails on error
    return res.json({ canReceiveEmails: true });
  }
});

export default router;