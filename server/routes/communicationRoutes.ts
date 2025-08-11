import { Express } from 'express';
import { familyInvitationService } from '../services/family-invitation-service';
import { notificationService } from '../services/notification-service';
import { db } from '../db';
import { messages, familyInvitations, notifications } from '@shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

export function registerCommunicationRoutes(app: Express) {
  // ============ FAMILY INVITATION ROUTES ============
  
  // Send family invitation
  app.post('/api/family/invite', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const {
        inviteeEmail,
        inviteeName,
        inviteePhone,
        relationship,
        message,
        sharePreferences
      } = req.body;
      
      if (!inviteeEmail) {
        return res.status(400).json({ error: 'Invitee email is required' });
      }
      
      const invitation = await familyInvitationService.sendFamilyInvitation({
        inviterId: userId,
        inviteeEmail,
        inviteeName,
        inviteePhone,
        relationship,
        message,
        sharePreferences
      });
      
      res.json({ 
        success: true, 
        invitation: {
          id: invitation.id,
          inviteeEmail: invitation.inviteeEmail,
          status: invitation.status,
          expiresAt: invitation.expiresAt
        }
      });
      
    } catch (error) {
      console.error('Error sending family invitation:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  });
  
  // Accept family invitation
  app.post('/api/family/accept-invitation', async (req, res) => {
    try {
      const { token } = req.body;
      const userId = (req.user as any)?.id;
      
      if (!token) {
        return res.status(400).json({ error: 'Invitation token is required' });
      }
      
      const invitation = await familyInvitationService.acceptInvitation(token, userId);
      
      res.json({ 
        success: true, 
        message: 'Invitation accepted successfully',
        invitation
      });
      
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      res.status(400).json({ error: error.message || 'Failed to accept invitation' });
    }
  });
  
  // Get user's family invitations
  app.get('/api/family/invitations', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get sent invitations
      const sentInvitations = await db.select()
        .from(familyInvitations)
        .where(eq(familyInvitations.inviterId, userId))
        .orderBy(desc(familyInvitations.createdAt));
      
      // Get received invitations (by email)
      const userEmail = (req.user as any)?.email;
      const receivedInvitations = userEmail ? await db.select()
        .from(familyInvitations)
        .where(and(
          eq(familyInvitations.inviteeEmail, userEmail),
          eq(familyInvitations.status, 'pending')
        ))
        .orderBy(desc(familyInvitations.createdAt)) : [];
      
      res.json({
        sent: sentInvitations,
        received: receivedInvitations
      });
      
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  });
  
  // ============ MESSAGING ROUTES ============
  
  // Send message
  app.post('/api/messages/send', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const {
        toUserId,
        communityId,
        content,
        subject,
        messageType,
        attachments,
        priority
      } = req.body;
      
      if (!toUserId || !content) {
        return res.status(400).json({ error: 'Recipient and content are required' });
      }
      
      const [message] = await db.insert(messages).values({
        fromUserId: userId,
        toUserId,
        communityId,
        conversationId: `${userId}-${toUserId}${communityId ? `-${communityId}` : ''}`,
        content,
        subject,
        messageType,
        attachments,
        priority,
        createdAt: new Date()
      }).returning();
      
      // Send real-time notification
      await notificationService.createNotification({
        userId: toUserId.toString(),
        type: 'message',
        category: 'general',
        title: 'New Message',
        message: `You have a new message${subject ? `: ${subject}` : ''}`,
        actionUrl: `/messages/${message.id}`,
        metadata: {
          messageId: message.id,
          fromUserId: userId
        },
        channels: ['in_app']
      });
      
      res.json({ success: true, message });
      
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
  
  // Get messages
  app.get('/api/messages', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const { conversationId, limit = 50, offset = 0 } = req.query;
      
      let query = db.select().from(messages);
      
      if (conversationId) {
        query = query.where(eq(messages.conversationId, conversationId as string));
      } else {
        query = query.where(or(
          eq(messages.fromUserId, userId),
          eq(messages.toUserId, userId)
        ));
      }
      
      const allMessages = await query
        .orderBy(desc(messages.createdAt))
        .limit(Number(limit))
        .offset(Number(offset));
      
      res.json(allMessages);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });
  
  // Mark message as read
  app.put('/api/messages/:id/read', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const messageId = parseInt(req.params.id);
      
      if (!userId || !messageId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      
      await db.update(messages)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(
          eq(messages.id, messageId),
          eq(messages.toUserId, userId)
        ));
      
      res.json({ success: true });
      
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });
  
  // ============ NOTIFICATION ROUTES ============
  
  // Get user notifications
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userNotifications = await notificationService.getUserNotifications(userId.toString());
      const unreadCount = await notificationService.getUnreadCount(userId.toString());
      
      res.json({
        notifications: userNotifications,
        unreadCount
      });
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });
  
  // Mark notification as read
  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      const notificationId = parseInt(req.params.id);
      
      if (!userId || !notificationId) {
        return res.status(400).json({ error: 'Invalid request' });
      }
      
      await notificationService.markAsRead(notificationId, userId.toString());
      
      res.json({ success: true });
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });
  
  // Update notification preferences
  app.put('/api/notifications/preferences', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      await notificationService.updatePreferences(userId.toString(), req.body);
      
      res.json({ success: true, message: 'Preferences updated successfully' });
      
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  });
  
  // ============ ADMIN ROUTES ============
  
  // Send system announcement (admin only)
  app.post('/api/admin/announcement', isAuthenticated, async (req, res) => {
    try {
      const userEmail = (req.user as any)?.email;
      
      // Check if user is admin
      if (userEmail !== 'william.cowell01@gmail.com' && userEmail !== 'admin@myseniorvalet.com') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const { title, message, priority } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }
      
      await notificationService.sendSystemAnnouncement(title, message, priority);
      
      res.json({ success: true, message: 'Announcement sent successfully' });
      
    } catch (error) {
      console.error('Error sending announcement:', error);
      res.status(500).json({ error: 'Failed to send announcement' });
    }
  });
  
  console.log('✅ Communication routes registered');
}