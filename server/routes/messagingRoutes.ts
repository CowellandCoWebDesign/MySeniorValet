import { Router } from "express";
import { db } from "../db";
import { chatConversations, chatParticipants, chatMessages } from "@shared/schema";
import { eq, and, or, desc, sql, isNull } from "drizzle-orm";
import type { ChatConversation, ChatParticipant, ChatMessage } from "@shared/schema";



const router = Router();

// Helper function to get user ID from multiple auth methods
function getUserId(req: any): string | null {
  // Check quick auth session first
  const sessionId = req.cookies?.sessionId;
  if (sessionId && global.activeSessions?.[sessionId]) {
    return String(global.activeSessions[sessionId].userId);
  }
  
  // Check Replit auth
  const replitUserId = req.headers['x-replit-user-id'] as string;
  if (replitUserId) {
    return replitUserId;
  }
  
  // Check standard auth user
  if (req.user?.id) {
    return String(req.user.id);
  }
  
  return null;
}

// Get all conversations for a user
router.get("/conversations", async (req, res) => {
  try {
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get conversations with participant info and last message
    const conversations = await db
      .select({
        conversation: chatConversations,
        participant: chatParticipants,
        unreadCount: chatParticipants.unreadCount,
      })
      .from(chatConversations)
      .innerJoin(
        chatParticipants,
        and(
          eq(chatParticipants.conversationId, chatConversations.id),
          eq(chatParticipants.userId, userId),
          isNull(chatParticipants.leftAt)
        )
      )
      .orderBy(desc(chatConversations.lastMessageAt));

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async ({ conversation, participant, unreadCount }) => {
        const [lastMessage] = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.conversationId, conversation.id))
          .orderBy(desc(chatMessages.createdAt))
          .limit(1);

        return {
          ...conversation,
          unreadCount: unreadCount || 0,
          lastMessage
        };
      })
    );

    res.json(conversationsWithLastMessage);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

// Get messages in a conversation
router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const userId = getUserId(req);
    const conversationId = parseInt(req.params.conversationId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user is a participant
    const [participant] = await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          eq(chatParticipants.userId, userId),
          isNull(chatParticipants.leftAt)
        )
      );

    if (!participant) {
      return res.status(403).json({ message: "Not a participant in this conversation" });
    }

    // Get messages
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);

    // Mark messages as read
    await db
      .update(chatParticipants)
      .set({
        unreadCount: 0,
        lastReadAt: new Date()
      })
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          eq(chatParticipants.userId, userId)
        )
      );

    res.json(messages.reverse()); // Reverse to show oldest first
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Create a new conversation
router.post("/conversations", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, subject, communityId, participantIds, metadata, message } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create conversation
    const [conversation] = await db
      .insert(chatConversations)
      .values({
        type: type || 'direct',
        subject,
        communityId,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastMessageAt: new Date()
      })
      .returning();

    // Add participants (including creator)
    const allParticipants = [...new Set([userId, ...(participantIds || [])])];
    
    await db
      .insert(chatParticipants)
      .values(
        allParticipants.map(participantId => ({
          conversationId: conversation.id,
          userId: participantId,
          role: participantId === userId ? 'owner' : 'member',
          unreadCount: 0,
          joinedAt: new Date()
        }))
      );

    // If initial message provided, send it
    if (message) {
      const [firstMessage] = await db
        .insert(chatMessages)
        .values({
          conversationId: conversation.id,
          senderId: userId,
          content: message,
          type: 'text',
          createdAt: new Date()
        })
        .returning();

      res.json({ 
        ...conversation,
        conversationId: conversation.id,
        message: firstMessage 
      });
    } else {
      res.json({ 
        ...conversation,
        conversationId: conversation.id 
      });
    }
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
});

// Send a message
router.post("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const userId = getUserId(req);
    const conversationId = parseInt(req.params.conversationId);
    const { content, type = 'text', metadata } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user is a participant
    const [participant] = await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          eq(chatParticipants.userId, userId),
          isNull(chatParticipants.leftAt)
        )
      );

    if (!participant) {
      return res.status(403).json({ message: "Not a participant in this conversation" });
    }

    // Create message
    const [message] = await db
      .insert(chatMessages)
      .values({
        conversationId,
        senderId: userId,
        content,
        type,
        metadata,
        createdAt: new Date()
      })
      .returning();

    // Update conversation's last message time
    await db
      .update(chatConversations)
      .set({
        lastMessageAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(chatConversations.id, conversationId));

    // Update unread count for other participants
    await db
      .update(chatParticipants)
      .set({
        unreadCount: sql`${chatParticipants.unreadCount} + 1`
      })
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          sql`${chatParticipants.userId} != ${userId}`,
          isNull(chatParticipants.leftAt)
        )
      );

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Delete a message
router.delete("/messages/:messageId", async (req, res) => {
  try {
    const userId = getUserId(req);
    const messageId = parseInt(req.params.messageId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user is the sender
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.id, messageId),
          eq(chatMessages.senderId, userId)
        )
      );

    if (!message) {
      return res.status(404).json({ message: "Message not found or unauthorized" });
    }

    // Soft delete the message
    await db
      .update(chatMessages)
      .set({ deletedAt: new Date() })
      .where(eq(chatMessages.id, messageId));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

// Edit a message
router.put("/messages/:messageId", async (req, res) => {
  try {
    const userId = getUserId(req);
    const messageId = parseInt(req.params.messageId);
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify user is the sender
    const [message] = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.id, messageId),
          eq(chatMessages.senderId, userId),
          isNull(chatMessages.deletedAt)
        )
      );

    if (!message) {
      return res.status(404).json({ message: "Message not found or unauthorized" });
    }

    // Update the message
    const [updatedMessage] = await db
      .update(chatMessages)
      .set({ 
        content,
        editedAt: new Date()
      })
      .where(eq(chatMessages.id, messageId))
      .returning();

    res.json(updatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ message: "Failed to edit message" });
  }
});

// Get unread count
router.get("/unread-count", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await db
      .select({
        totalUnread: sql<number>`COALESCE(SUM(${chatParticipants.unreadCount}), 0)`
      })
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId),
          isNull(chatParticipants.leftAt)
        )
      );

    res.json({ unreadCount: result[0]?.totalUnread || 0 });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
});

// Alias for unread count (for client compatibility)
router.get("/unread", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await db
      .select({
        totalUnread: sql<number>`COALESCE(SUM(${chatParticipants.unreadCount}), 0)`
      })
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.userId, userId),
          isNull(chatParticipants.leftAt)
        )
      );

    res.json({ unreadCount: result[0]?.totalUnread || 0 });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Failed to get unread count" });
  }
});

// Leave a conversation
router.post("/conversations/:conversationId/leave", async (req, res) => {
  try {
    const userId = getUserId(req);
    const conversationId = parseInt(req.params.conversationId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await db
      .update(chatParticipants)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(chatParticipants.conversationId, conversationId),
          eq(chatParticipants.userId, userId)
        )
      );

    res.json({ success: true });
  } catch (error) {
    console.error("Error leaving conversation:", error);
    res.status(500).json({ message: "Failed to leave conversation" });
  }
});

export default router;