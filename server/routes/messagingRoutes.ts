import { Router } from "express";
import { messagingService } from "../messaging-service";
import { db } from "../db";
import { runMessagingTests } from "../test-messaging-system";
import { 
  messages, 
  conversations, 
  familyGroups,
  messageTemplates,
  messagingNotifications,
  users,
  communities
} from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

const router = Router();

// Get user's conversations
router.get("/conversations", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const conversations = await messagingService.getConversations(userId);
    
    // Enrich conversations with participant details
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const participants = (conv.participants as any[]) || [];
        
        // Get user details for participants
        const participantDetails = await Promise.all(
          participants.map(async (p) => {
            const [user] = await db.select({
              id: users.id,
              firstName: users.firstName,
              lastName: users.lastName,
              profileImageUrl: users.profileImageUrl
            })
            .from(users)
            .where(eq(users.id, p.userId));
            
            return {
              ...p,
              user
            };
          })
        );

        // Get community details if applicable
        let community = null;
        if (conv.communityId) {
          [community] = await db.select({
            id: communities.id,
            name: communities.name,
            city: communities.city,
            state: communities.state,
            photos: communities.photos
          })
          .from(communities)
          .where(eq(communities.id, conv.communityId));
        }

        return {
          ...conv,
          participants: participantDetails,
          community
        };
      })
    );

    res.json(enrichedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const conversationMessages = await messagingService.getMessages(conversationId, limit, offset);

    // Enrich messages with sender details
    const enrichedMessages = await Promise.all(
      conversationMessages.map(async (msg) => {
        const [sender] = await db.select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl
        })
        .from(users)
        .where(eq(users.id, msg.senderId));

        return {
          ...msg,
          sender
        };
      })
    );

    res.json(enrichedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to a conversation
router.post("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const { senderId, senderType, content, messageType, attachments, metadata } = req.body;

    if (!senderId || !senderType || !content) {
      return res.status(400).json({ error: "Sender ID, sender type, and content are required" });
    }

    // Use the messaging service sendMessage function which includes email notifications
    const message = await messagingService.sendMessage({
      conversationId,
      senderId,
      senderType,
      content,
      messageType,
      attachments,
      metadata
    });

    // Enrich message with sender details
    let sender = null;
    if (senderType === 'user') {
      [sender] = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl
      })
      .from(users)
      .where(eq(users.id, senderId));
    } else if (senderType === 'community') {
      [sender] = await db.select({
        id: communities.id,
        name: communities.name,
        photos: communities.photos
      })
      .from(communities)
      .where(eq(communities.id, senderId));
    }

    res.json({
      ...message,
      sender
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Create a new conversation
router.post("/conversations", async (req, res) => {
  try {
    const { type, title, participants, communityId, familyGroupId, metadata } = req.body;

    if (!type || !participants || participants.length === 0) {
      return res.status(400).json({ error: "Type and participants required" });
    }

    const conversation = await messagingService.createConversation({
      type,
      title,
      participants,
      communityId,
      familyGroupId,
      metadata
    });

    res.json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// Start conversation with community
router.post("/conversations/community", async (req, res) => {
  try {
    const { userId, communityId, message } = req.body;

    if (!userId || !communityId) {
      return res.status(400).json({ error: "User ID and Community ID required" });
    }

    // Check if conversation already exists
    const existingConversations = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.communityId, communityId),
        sql`${conversations.participants}::jsonb @> ${JSON.stringify([{ userId }])}`
      ));

    let conversation;
    if (existingConversations.length > 0) {
      conversation = existingConversations[0];
    } else {
      // Get community details
      const [community] = await db.select()
        .from(communities)
        .where(eq(communities.id, communityId));

      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }

      // Create new conversation
      conversation = await messagingService.createConversation({
        type: 'user_to_community',
        title: `Chat with ${community.name}`,
        participants: [
          { userId, role: 'member', joinedAt: new Date().toISOString(), notifications: true },
          { userId: `community_${communityId}`, role: 'community_rep', joinedAt: new Date().toISOString(), notifications: true }
        ],
        communityId,
        metadata: {
          communityName: community.name,
          communityContact: community.email || community.phone
        }
      });
    }

    // Send initial message if provided
    if (message) {
      await db.insert(messages).values({
        conversationId: conversation.id,
        senderId: userId,
        senderType: 'user',
        content: message,
        messageType: 'text'
      });

      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessagePreview: message.substring(0, 100)
        })
        .where(eq(conversations.id, conversation.id));
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error starting community conversation:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
});

// Create or get family group
router.post("/family-groups", async (req, res) => {
  try {
    const { name, ownerId, members, settings } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ error: "Name and owner ID required" });
    }

    const familyGroup = await messagingService.createFamilyGroup({
      name,
      ownerId,
      members: members || [
        {
          userId: ownerId,
          role: 'owner',
          permissions: {
            canMessage: true,
            canInvite: true,
            canRemove: true,
            canViewAll: true,
            canEditNotes: true
          },
          joinedAt: new Date().toISOString()
        }
      ],
      settings
    });

    res.json(familyGroup);
  } catch (error) {
    console.error("Error creating family group:", error);
    res.status(500).json({ error: "Failed to create family group" });
  }
});

// Join family group with invite code
router.post("/family-groups/join", async (req, res) => {
  try {
    const { userId, inviteCode } = req.body;

    if (!userId || !inviteCode) {
      return res.status(400).json({ error: "User ID and invite code required" });
    }

    const familyGroup = await messagingService.joinFamilyGroup(userId, inviteCode);

    if (!familyGroup) {
      return res.status(404).json({ error: "Invalid or expired invite code" });
    }

    res.json(familyGroup);
  } catch (error) {
    console.error("Error joining family group:", error);
    res.status(500).json({ error: "Failed to join family group" });
  }
});

// Get user's family groups
router.get("/family-groups", async (req, res) => {
  try {
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const userFamilyGroups = await db.select()
      .from(familyGroups)
      .where(or(
        eq(familyGroups.ownerId, userId),
        sql`${familyGroups.members}::jsonb @> ${JSON.stringify([{ userId }])}`
      ));

    res.json(userFamilyGroups);
  } catch (error) {
    console.error("Error fetching family groups:", error);
    res.status(500).json({ error: "Failed to fetch family groups" });
  }
});

// Get or create message templates for community
router.get("/communities/:communityId/templates", async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);

    const templates = await db.select()
      .from(messageTemplates)
      .where(and(
        eq(messageTemplates.communityId, communityId),
        eq(messageTemplates.isActive, true)
      ))
      .orderBy(messageTemplates.category, messageTemplates.name);

    res.json(templates);
  } catch (error) {
    console.error("Error fetching message templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

// Create message template
router.post("/communities/:communityId/templates", async (req, res) => {
  try {
    const communityId = parseInt(req.params.communityId);
    const { name, category, subject, content, variables, createdBy } = req.body;

    if (!name || !category || !content) {
      return res.status(400).json({ error: "Name, category, and content required" });
    }

    const [template] = await db.insert(messageTemplates).values({
      communityId,
      name,
      category,
      subject,
      content,
      variables: variables || [],
      createdBy
    }).returning();

    res.json(template);
  } catch (error) {
    console.error("Error creating message template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// Update messaging notification preferences
router.put("/notifications/preferences", async (req, res) => {
  try {
    const { userId, conversationId, preferences } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Check if preferences exist
    const existing = await db.select()
      .from(messagingNotifications)
      .where(and(
        eq(messagingNotifications.userId, userId),
        conversationId ? eq(messagingNotifications.conversationId, conversationId) : sql`${messagingNotifications.conversationId} IS NULL`
      ));

    if (existing.length > 0) {
      // Update existing preferences
      await db.update(messagingNotifications)
        .set({
          ...preferences,
          updatedAt: new Date()
        })
        .where(eq(messagingNotifications.id, existing[0].id));
    } else {
      // Create new preferences
      await db.insert(messagingNotifications).values({
        userId,
        conversationId,
        notificationType: 'email',
        ...preferences
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

// Test endpoint for comprehensive messaging system testing
router.get("/test", async (req, res) => {
  try {
    console.log("🚀 Starting comprehensive messaging system tests...");
    const testResults = await runMessagingTests();
    
    // Format results for response
    const summary = {
      totalTests: testResults.length,
      passed: testResults.filter(r => r.status === 'PASS').length,
      failed: testResults.filter(r => r.status === 'FAIL').length,
      passRate: ((testResults.filter(r => r.status === 'PASS').length / testResults.length) * 100).toFixed(1) + '%',
      results: testResults
    };
    
    res.json(summary);
  } catch (error) {
    console.error("Error running messaging tests:", error);
    res.status(500).json({ 
      error: "Failed to run messaging tests", 
      details: error.message 
    });
  }
});

export default router;