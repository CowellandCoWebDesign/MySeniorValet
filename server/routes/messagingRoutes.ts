import { Router } from 'express';
import { db } from '../db';
import { vendorConversations, vendorConversationParticipants, vendorMessages, users, vendorRegistrations, communities } from '../../shared/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import { NotificationService } from '../notification-service';

const router = Router();

// Get conversations for a user or vendor
router.get('/conversations', async (req, res) => {
  try {
    const { userId, vendorId, type } = req.query;
    
    // Get conversations where user/vendor is a participant
    let participantConditions = [];
    if (userId) {
      participantConditions.push(eq(vendorConversationParticipants.userId, parseInt(userId as string)));
    }
    if (vendorId) {
      participantConditions.push(eq(vendorConversationParticipants.vendorId, parseInt(vendorId as string)));
    }
    
    const conversations = await db
      .select({
        conversation: vendorConversations,
        participants: sql`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${vendorConversationParticipants.id},
                'userId', ${vendorConversationParticipants.userId},
                'vendorId', ${vendorConversationParticipants.vendorId},
                'role', ${vendorConversationParticipants.role},
                'lastReadAt', ${vendorConversationParticipants.lastReadAt}
              )
            ) FILTER (WHERE ${vendorConversationParticipants.id} IS NOT NULL),
            '[]'::json
          )`
      })
      .from(vendorConversations)
      .leftJoin(
        vendorConversationParticipants,
        eq(vendorConversations.id, vendorConversationParticipants.conversationId)
      )
      .where(
        and(
          type ? eq(vendorConversations.type, type as any) : undefined,
          participantConditions.length > 0 ? or(...participantConditions) : undefined
        )
      )
      .groupBy(vendorConversations.id)
      .orderBy(desc(vendorConversations.lastMessageAt));
    
    // Map the results to include conversation data at the top level
    const formattedConversations = conversations.map(item => ({
      ...item.conversation,
      participants: item.participants
    }));
    
    res.json(formattedConversations);
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create a new conversation
router.post('/conversations', async (req, res) => {
  try {
    const { type, subject, priority, metadata, participants } = req.body;
    
    // Create conversation
    const [conversation] = await db.insert(vendorConversations).values({
      type,
      subject,
      priority,
      metadata
    }).returning();
    
    // Add participants
    const participantData = participants.map((p: any) => ({
      conversationId: conversation.id,
      userId: p.userId || null,
      vendorId: p.vendorId || null,
      role: p.role
    }));
    
    await db.insert(vendorConversationParticipants).values(participantData);
    
    res.json({ conversation, participants: participantData });
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await db
      .select({
        message: vendorMessages,
        senderUser: users,
        senderVendor: vendorRegistrations
      })
      .from(vendorMessages)
      .leftJoin(users, eq(vendorMessages.senderId, users.id))
      .leftJoin(vendorRegistrations, eq(vendorMessages.senderVendorId, vendorRegistrations.id))
      .where(eq(vendorMessages.conversationId, parseInt(conversationId)))
      .orderBy(desc(vendorMessages.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json(messages);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { senderId, senderVendorId, senderType, content, attachments } = req.body;
    
    // Create message
    const [message] = await db.insert(vendorMessages).values({
      conversationId: parseInt(conversationId),
      senderId: senderId || null,
      senderVendorId: senderVendorId || null,
      senderType,
      content,
      attachments: attachments || []
    }).returning();
    
    // Update conversation last message time
    await db.update(vendorConversations)
      .set({ 
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(vendorConversations.id, parseInt(conversationId)));
    
    // Get sender details
    let sender = null;
    if (senderId) {
      [sender] = await db.select().from(users).where(eq(users.id, senderId));
    } else if (senderVendorId) {
      [sender] = await db.select().from(vendorRegistrations).where(eq(vendorRegistrations.id, senderVendorId));
    }
    
    // Get conversation details to determine recipients and send notifications
    const [conversation] = await db
      .select()
      .from(vendorConversations)
      .where(eq(vendorConversations.id, parseInt(conversationId)));
    
    if (conversation) {
      // Get all participants except the sender
      const participants = await db
        .select()
        .from(vendorConversationParticipants)
        .where(
          and(
            eq(vendorConversationParticipants.conversationId, parseInt(conversationId)),
            senderId ? 
              or(
                vendorConversationParticipants.userId.isNot(senderId),
                vendorConversationParticipants.vendorId.isNotNull()
              ) :
              vendorConversationParticipants.userId.isNotNull()
          )
        );
      
      // Create notifications for recipients
      for (const participant of participants) {
        if (participant.userId && participant.userId !== senderId) {
          // Notification for user recipient
          await NotificationService.createNotification({
            userId: participant.userId,
            type: 'message',
            title: 'New Message',
            message: `You have a new message from ${sender?.name || 'a community'}`,
            category: 'messages',
            priority: 'normal',
            actionUrl: `/messaging`,
            iconType: 'message-square',
            metadata: {
              conversationId: conversation.id,
              messageId: message.id,
              senderName: sender?.name || 'Community'
            }
          });
        } else if (participant.vendorId) {
          // For vendor/community recipients, we need to notify the community manager
          // This would typically be handled by the vendor's notification system
          // For now, we'll log it
          console.log(`New message for vendor ${participant.vendorId} in conversation ${conversationId}`);
        }
      }
      
      // If conversation type is 'community', check if we need to notify community managers
      if (conversation.type === 'community' && conversation.metadata?.communityId) {
        const [community] = await db
          .select()
          .from(communities)
          .where(eq(communities.id, conversation.metadata.communityId));
        
        if (community && community.claimedBy) {
          // Get the user who claimed the community
          const [communityManager] = await db
            .select()
            .from(users)
            .where(eq(users.id, community.claimedBy));
          
          if (communityManager && communityManager.id !== senderId) {
            await NotificationService.createNotification({
              userId: communityManager.id,
              type: 'message',
              title: 'New Community Message',
              message: `New message for ${community.name} from ${sender?.name || 'a user'}`,
              category: 'messages',
              priority: 'normal',
              actionUrl: `/messaging`,
              iconType: 'message-square',
              communityId: community.id,
              metadata: {
                conversationId: conversation.id,
                messageId: message.id,
                communityName: community.name,
                senderName: sender?.name || 'User'
              }
            });
          }
        }
      }
    }
    
    res.json({ message, sender });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.post('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, vendorId } = req.body;
    
    // Update participant's last read time
    await db.update(vendorConversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(vendorConversationParticipants.conversationId, parseInt(conversationId)),
          userId ? eq(vendorConversationParticipants.userId, userId) : 
                   eq(vendorConversationParticipants.vendorId, vendorId)
        )
      );
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Update conversation status
router.patch('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, priority } = req.body;
    
    const updates: any = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    
    const [updated] = await db.update(vendorConversations)
      .set(updates)
      .where(eq(vendorConversations.id, parseInt(conversationId)))
      .returning();
    
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const { userId, vendorId } = req.query;
    
    const result = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${vendorMessages.id})`
      })
      .from(vendorMessages)
      .innerJoin(
        vendorConversationParticipants,
        eq(vendorMessages.conversationId, vendorConversationParticipants.conversationId)
      )
      .where(
        and(
          userId ? eq(vendorConversationParticipants.userId, parseInt(userId as string)) :
                   eq(vendorConversationParticipants.vendorId, parseInt(vendorId as string)),
          or(
            sql`${vendorMessages.createdAt} > ${vendorConversationParticipants.lastReadAt}`,
            sql`${vendorConversationParticipants.lastReadAt} IS NULL`
          )
        )
      );
    
    res.json({ unreadCount: result[0]?.count || 0 });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

export default router;