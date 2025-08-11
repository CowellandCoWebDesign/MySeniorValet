import { db } from '../db';
import { familyInvitations, users } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export class FamilyInvitationService {
  private readonly INVITATION_EXPIRY_DAYS = 7;
  private readonly MAX_REMINDERS = 3;
  private readonly ADMIN_EMAIL = 'william.cowell01@gmail.com';
  private readonly PLATFORM_NAME = 'MySeniorValet';
  
  /**
   * Send a family invitation email
   */
  async sendFamilyInvitation({
    inviterId,
    inviteeEmail,
    inviteeName,
    inviteePhone,
    relationship,
    message,
    sharePreferences
  }: {
    inviterId: number;
    inviteeEmail: string;
    inviteeName?: string;
    inviteePhone?: string;
    relationship?: string;
    message?: string;
    sharePreferences?: {
      communities: boolean;
      notes: boolean;
      documents: boolean;
      tours: boolean;
      messages: boolean;
    };
  }) {
    try {
      // Get inviter details
      const [inviter] = await db.select().from(users).where(eq(users.id, inviterId));
      if (!inviter) {
        throw new Error('Inviter not found');
      }
      
      // Generate unique invitation token
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + this.INVITATION_EXPIRY_DAYS);
      
      // Create invitation record
      const [invitation] = await db.insert(familyInvitations).values({
        inviterId,
        inviteeEmail,
        inviteeName,
        inviteePhone,
        relationship,
        message,
        invitationToken,
        sharePreferences: sharePreferences || {
          communities: true,
          notes: true,
          documents: false,
          tours: true,
          messages: true
        },
        expiresAt,
        sentVia: 'email'
      }).returning();
      
      // Prepare email content
      const inviterName = inviter.firstName && inviter.lastName 
        ? `${inviter.firstName} ${inviter.lastName}`
        : inviter.username || inviter.email;
      
      const acceptUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://myseniorvalet.com'}/accept-invitation?token=${invitationToken}`;
      
      const emailContent = {
        to: inviteeEmail,
        from: 'hello@myseniorvalet.com',
        cc: this.ADMIN_EMAIL,
        subject: `${inviterName} invited you to collaborate on ${this.PLATFORM_NAME}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .permissions { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .permission-item { padding: 8px 0; }
              .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>You're Invited to ${this.PLATFORM_NAME}!</h1>
              </div>
              <div class="content">
                <p>Hi ${inviteeName || 'there'},</p>
                
                <p><strong>${inviterName}</strong> has invited you to join ${this.PLATFORM_NAME} as their <strong>${relationship || 'family member'}</strong> to collaborate on finding the perfect senior living community.</p>
                
                ${message ? `
                  <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                    <p><strong>Personal message from ${inviterName}:</strong></p>
                    <p>${message}</p>
                  </div>
                ` : ''}
                
                <div class="permissions">
                  <h3>What you'll be able to do together:</h3>
                  ${sharePreferences?.communities !== false ? '<div class="permission-item">✅ View and compare senior living communities</div>' : ''}
                  ${sharePreferences?.notes !== false ? '<div class="permission-item">✅ Share notes and observations</div>' : ''}
                  ${sharePreferences?.tours !== false ? '<div class="permission-item">✅ Schedule and coordinate tours</div>' : ''}
                  ${sharePreferences?.messages !== false ? '<div class="permission-item">✅ Message each other in real-time</div>' : ''}
                  ${sharePreferences?.documents !== false ? '<div class="permission-item">✅ Share important documents</div>' : ''}
                </div>
                
                <div style="text-align: center;">
                  <a href="${acceptUrl}" class="button">Accept Invitation</a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px;">
                  This invitation expires in ${this.INVITATION_EXPIRY_DAYS} days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
              <div class="footer">
                <p>${this.PLATFORM_NAME} - The trusted platform for authentic senior living community information</p>
                <p>Helping families make informed decisions with verified data and transparent pricing</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
      await sgMail.send(emailContent);
      
      console.log(`✅ Family invitation sent to ${inviteeEmail} from ${inviterName}`);
      return invitation;
      
    } catch (error) {
      console.error('Error sending family invitation:', error);
      throw error;
    }
  }
  
  /**
   * Accept a family invitation
   */
  async acceptInvitation(token: string, userId?: number) {
    try {
      // Find the invitation
      const [invitation] = await db.select()
        .from(familyInvitations)
        .where(and(
          eq(familyInvitations.invitationToken, token),
          eq(familyInvitations.status, 'pending')
        ));
      
      if (!invitation) {
        throw new Error('Invalid or expired invitation');
      }
      
      // Check if invitation has expired
      if (new Date() > new Date(invitation.expiresAt)) {
        await db.update(familyInvitations)
          .set({ status: 'expired' })
          .where(eq(familyInvitations.id, invitation.id));
        throw new Error('This invitation has expired');
      }
      
      // Update invitation status
      await db.update(familyInvitations)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
          inviteeId: userId,
          updatedAt: new Date()
        })
        .where(eq(familyInvitations.id, invitation.id));
      
      // Send notification email to inviter
      const [inviter] = await db.select().from(users).where(eq(users.id, invitation.inviterId));
      if (inviter?.email) {
        await this.sendAcceptanceNotification(inviter.email, invitation.inviteeName || invitation.inviteeEmail);
      }
      
      return invitation;
      
    } catch (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }
  }
  
  /**
   * Send reminder for pending invitations
   */
  async sendReminders() {
    try {
      // Find pending invitations that haven't exceeded max reminders
      const pendingInvitations = await db.select()
        .from(familyInvitations)
        .where(and(
          eq(familyInvitations.status, 'pending'),
          lt(familyInvitations.reminderCount, this.MAX_REMINDERS)
        ));
      
      for (const invitation of pendingInvitations) {
        // Check if enough time has passed since last reminder (2 days)
        const lastReminderTime = invitation.lastReminderAt ? new Date(invitation.lastReminderAt) : new Date(invitation.createdAt);
        const daysSinceLastReminder = (Date.now() - lastReminderTime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastReminder >= 2) {
          await this.sendReminderEmail(invitation);
          
          // Update reminder count
          await db.update(familyInvitations)
            .set({
              reminderCount: invitation.reminderCount + 1,
              lastReminderAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(familyInvitations.id, invitation.id));
        }
      }
      
    } catch (error) {
      console.error('Error sending reminders:', error);
    }
  }
  
  /**
   * Send reminder email
   */
  private async sendReminderEmail(invitation: any) {
    const acceptUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://myseniorvalet.com'}/accept-invitation?token=${invitation.invitationToken}`;
    
    const emailContent = {
      to: invitation.inviteeEmail,
      from: 'hello@myseniorvalet.com',
      subject: `Reminder: You have a pending invitation on ${this.PLATFORM_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Don't forget about your invitation!</h2>
              <p>Hi ${invitation.inviteeName || 'there'},</p>
              <p>This is a friendly reminder that you have a pending invitation to join ${this.PLATFORM_NAME}.</p>
              <p>Your invitation will expire soon, so don't miss out on the opportunity to collaborate with your family member on finding the perfect senior living community.</p>
              <div style="text-align: center;">
                <a href="${acceptUrl}" class="button">Accept Invitation Now</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await sgMail.send(emailContent);
  }
  
  /**
   * Send acceptance notification to inviter
   */
  private async sendAcceptanceNotification(inviterEmail: string, inviteeName: string) {
    const emailContent = {
      to: inviterEmail,
      from: 'hello@myseniorvalet.com',
      subject: `${inviteeName} accepted your invitation on ${this.PLATFORM_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Great news!</h2>
              <p><strong>${inviteeName}</strong> has accepted your invitation to join ${this.PLATFORM_NAME}.</p>
              <p>You can now collaborate together on finding the perfect senior living community.</p>
              <p>Visit your dashboard to start sharing communities, notes, and scheduling tours together!</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await sgMail.send(emailContent);
  }
}

export const familyInvitationService = new FamilyInvitationService();