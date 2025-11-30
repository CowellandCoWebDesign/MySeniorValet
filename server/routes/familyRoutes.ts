import { Router, Request, Response } from "express";
import { db } from "../db";
import { 
  familyGroups, 
  familyPolls, 
  familyPollVotes, 
  familyDecisions,
  tourConversations,
  tours,
  communities,
  users,
  messages,
  conversations,
  favorites
} from "@shared/schema";
import { eq, and, desc, asc, or, inArray, sql } from "drizzle-orm";
import { randomBytes } from 'crypto';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid if API key is available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const router = Router();

// Helper to get user ID from request
const getUserId = (req: Request): number | null => {
  const sessionUserId = (req as any).session?.user?.id || (req as any).session?.userId;
  const authUserId = (req as any).user?.id || (req as any).user?.claims?.sub;
  
  const userId = sessionUserId || authUserId;
  
  // Return null if no valid user ID found (unauthenticated)
  return userId ? parseInt(userId) : null;
};

// Generate a unique invite code with collision check
async function generateUniqueInviteCode(): Promise<string> {
  const maxAttempts = 10;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate 8-character alphanumeric code
    const code = randomBytes(4).toString('hex').toUpperCase();
    
    // Check if code already exists
    const existing = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.inviteCode, code))
      .limit(1);
    
    if (existing.length === 0) {
      return code;
    }
  }
  
  // Fallback: use timestamp + random for guaranteed uniqueness
  return `${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString('hex').toUpperCase()}`.substring(0, 8);
}

// Create a new family group
router.post("/groups", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }
    
    // Generate unique invite code with collision check
    const inviteCode = await generateUniqueInviteCode();
    
    const [newGroup] = await db.insert(familyGroups).values({
      name,
      ownerId: String(userId),
      inviteCode,
      members: [{
        userId: String(userId),
        role: "owner" as const,
        relationship: "Owner",
        permissions: {
          canMessage: true,
          canInvite: true,
          canRemove: true,
          canViewAll: true,
          canEditNotes: true
        },
        joinedAt: new Date().toISOString()
      }],
      settings: {
        allowJoinRequests: true,
        requireApproval: false,
        notifyOnActivity: true
      }
    }).returning();
    
    res.json(newGroup);
  } catch (error) {
    console.error("Error creating family group:", error);
    res.status(500).json({ error: "Failed to create family group" });
  }
});

// Get all family groups for the current user
router.get("/groups", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    
    // Get all groups first, then filter in JavaScript to avoid SQL JSON issues
    const allGroups = await db.select()
      .from(familyGroups);
    
    // Filter groups where user is owner or member
    const userGroups = allGroups.filter(group => {
      // Check if user is owner (handle both string and number comparison)
      if (group.ownerId == userId) return true;
      
      // Check if user is in members array
      if (group.members && Array.isArray(group.members)) {
        return group.members.some((m: any) => m.userId == userId || m.userId == String(userId));
      }
      
      return false;
    });
    
    // Format groups with member counts
    const groupsWithMembers = userGroups.map(group => ({
      ...group,
      memberCount: group.members ? group.members.length : 1
    }));
    
    res.json(groupsWithMembers);
  } catch (error) {
    console.error("Error fetching family groups:", error);
    res.status(500).json({ error: "Failed to fetch family groups" });
  }
});

// Get details of a specific family group
router.get("/groups/:groupId", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req);
    
    // Get group details
    const groups = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    const group = groups[0];
    
    // Check if user is a member
    const isMember = group.ownerId === String(userId) || 
      (group.members && group.members.some((m: any) => m.userId === String(userId)));
    
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }
    
    // Return group with formatted members
    res.json({
      ...group,
      memberCount: group.members ? group.members.length : 1
    });
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
});

// Get messages for current user's family group (simplified endpoint)
router.get("/messages", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const isAuthenticated = userId !== null;
    
    // Return empty state for unauthenticated users (no demo data per Golden Data Rule)
    if (!isAuthenticated) {
      return res.json({
        messages: [],
        currentUserId: null,
        groupName: null
      });
    }
    
    // For authenticated users, find their real family group (as owner or member)
    const allGroups = await db.select()
      .from(familyGroups);
    
    // Check if user is owner or member of any group
    const userGroups = allGroups.filter(g => 
      g.ownerId === String(userId) || 
      (g.members && g.members.some((m: any) => m.userId === String(userId)))
    );
    
    if (userGroups.length === 0) {
      return res.json({ 
        messages: [], 
        currentUserId: String(userId),
        groupName: null 
      });
    }
    
    const groupId = userGroups[0].id;
    
    // Get or create conversation for this group
    let conversation = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.type, 'family_group'),
        eq(conversations.familyGroupId, groupId)
      ))
      .limit(1);
    
    if (conversation.length === 0) {
      const conversationData: any = {
        type: 'family_group' as const,
        familyGroupId: groupId,
        participants: [{
          userId: String(userId),
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
          notifications: true
        }],
        lastMessageAt: new Date(),
        unreadCounts: {},
        settings: {},
        metadata: {}
      };
      
      const [newConversation] = await db.insert(conversations).values(conversationData).returning();
      conversation = [newConversation];
    }
    
    // Get messages - simplified without JOIN to avoid type issues
    const allMessages = await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversation[0].id))
      .orderBy(asc(messages.createdAt))
      .limit(100);
    
    // Get user info for senders
    const messageWithSenders = await Promise.all(allMessages.map(async (msg) => {
      let senderName = "Unknown User";
      let senderEmail = "";
      
      if (msg.senderId) {
        const sender = await db.select()
          .from(users)
          .where(eq(users.id, parseInt(msg.senderId)))
          .limit(1);
        
        if (sender.length > 0) {
          senderName = sender[0].username || sender[0].firstName || "User";
          senderEmail = sender[0].email || "";
        }
      }
      
      return {
        ...msg,
        senderName,
        senderEmail
      };
    }));
    
    res.json({ 
      messages: messageWithSenders,
      currentUserId: String(userId),
      groupName: userGroups[0].name 
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to current user's family group (simplified endpoint)
router.post("/messages", async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = getUserId(req);
    
    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }
    
    // Find the user's family group (as owner or member)
    const allGroups = await db.select()
      .from(familyGroups);
    
    const userGroups = allGroups.filter(g => 
      g.ownerId === String(userId) || 
      (g.members && g.members.some((m: any) => m.userId === String(userId)))
    );
    
    if (userGroups.length === 0) {
      return res.status(400).json({ error: "You must join or create a family group first" });
    }
    
    const groupId = userGroups[0].id;
    
    // Get or create conversation
    let conversation = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.type, 'family_group'),
        eq(conversations.familyGroupId, groupId)
      ))
      .limit(1);
    
    if (conversation.length === 0) {
      const conversationData: any = {
        type: 'family_group' as const,
        familyGroupId: groupId,
        participants: [{
          userId: String(userId),
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
          notifications: true
        }],
        lastMessageAt: new Date(),
        unreadCounts: {},
        settings: {},
        metadata: {}
      };
      
      const [newConversation] = await db.insert(conversations).values(conversationData).returning();
      conversation = [newConversation];
    }
    
    // Create the message
    const [newMessage] = await db.insert(messages).values({
      conversationId: conversation[0].id,
      senderId: String(userId),
      senderType: 'user' as const,
      content,
      messageType: 'text'
    }).returning();
    
    // Update conversation last message time
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation[0].id));
    
    // Get sender info for response
    const [sender] = await db.select()
      .from(users)
      .where(eq(users.id, userId));
    
    res.json({
      ...newMessage,
      senderName: sender?.name || 'Unknown',
      senderEmail: sender?.email
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get messages for a family group
router.get("/groups/:groupId/messages", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req);
    
    // Create a conversation for this group if it doesn't exist
    let conversation = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.type, 'family_group'),
        eq(conversations.familyGroupId, parseInt(groupId))
      ))
      .limit(1);
    
    if (conversation.length === 0) {
      const conversationData: any = {
        type: 'family_group' as const,
        familyGroupId: parseInt(groupId),
        participants: [{
          userId: String(userId),
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
          notifications: true
        }],
        lastMessageAt: new Date(),
        unreadCounts: {},
        settings: {},
        metadata: {}
      };
      
      const [newConv] = await db.insert(conversations).values(conversationData).returning();
      conversation = [newConv];
    }
    
    // Get messages for this conversation
    const groupMessages = await db.execute(sql`
      SELECT 
        m.*,
        u.name as senderName,
        u.email as senderEmail
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversation[0].id}
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    
    const formattedMessages = groupMessages.rows.map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.senderName || 'Unknown User',
      message: msg.content,
      timestamp: msg.created_at,
      attachments: msg.attachments
    }));
    
    res.json(formattedMessages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message to family group
router.post("/groups/:groupId/messages", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    const userId = getUserId(req);
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // Get or create conversation
    let conversation = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.type, 'family_group'),
        eq(conversations.familyGroupId, parseInt(groupId))
      ))
      .limit(1);
    
    if (conversation.length === 0) {
      const conversationData: any = {
        type: 'family_group' as const,
        familyGroupId: parseInt(groupId),
        participants: [{
          userId: String(userId),
          role: 'member' as const,
          joinedAt: new Date().toISOString(),
          notifications: true
        }],
        lastMessageAt: new Date(),
        unreadCounts: {},
        settings: {},
        metadata: {}
      };
      
      const [newConv] = await db.insert(conversations).values(conversationData).returning();
      conversation = [newConv];
    }
    
    // Insert message - only include fields that exist in database
    const messageData: any = {
      conversationId: conversation[0].id,
      senderId: String(userId),
      senderType: 'user' as const,
      content: message,
      messageType: 'text',
      attachments: [],
      readBy: [],
      metadata: {}
    };
    
    const [newMessage] = await db.insert(messages).values(messageData).returning();
    
    // Update conversation last message time
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, conversation[0].id));
    
    res.json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get direct messages with a specific family member
router.get("/groups/:groupId/dm/:memberId", async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // SECURITY: Verify both users are members of this family group
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Family group not found" });
    }
    
    const members = group[0].members || [];
    const requesterIsMember = members.some((m: any) => m.userId === String(userId));
    const targetIsMember = members.some((m: any) => m.userId === String(memberId));
    
    if (!requesterIsMember) {
      return res.status(403).json({ error: "You are not a member of this family group" });
    }
    
    if (!targetIsMember) {
      return res.status(403).json({ error: "Target user is not a member of this family group" });
    }
    
    // Find DM conversation between these two users in this group
    const dmConversations = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.type, 'family_group'),
        eq(conversations.familyGroupId, parseInt(groupId))
      ));
    
    // Find a conversation that is a DM between these two users
    let dmConversation = dmConversations.find((conv: any) => {
      const meta = conv.metadata as any;
      if (meta?.isDM && meta?.dmParticipants) {
        const participants = meta.dmParticipants as string[];
        return participants.includes(String(userId)) && participants.includes(String(memberId));
      }
      return false;
    });
    
    if (!dmConversation) {
      // Return empty messages if no DM exists yet
      return res.json({
        messages: [],
        currentUserId: String(userId),
        otherUserId: memberId
      });
    }
    
    // Fetch messages
    const dmMessages = await db.execute(sql`
      SELECT 
        m.*,
        u.name as senderName,
        u.email as senderEmail
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${dmConversation.id}
      ORDER BY m.created_at DESC
      LIMIT 50
    `);
    
    const formattedMessages = dmMessages.rows.map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.senderName || msg.senderEmail?.split('@')[0] || 'User',
      content: msg.content,
      createdAt: msg.created_at,
      messageType: msg.message_type
    }));
    
    res.json({
      messages: formattedMessages.reverse(),
      currentUserId: String(userId),
      otherUserId: memberId
    });
  } catch (error) {
    console.error("Error fetching DM:", error);
    res.status(500).json({ error: "Failed to fetch direct messages" });
  }
});

// Send a direct message to a family member
router.post("/groups/:groupId/dm/:memberId", async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    const { message } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    // SECURITY: Verify both users are members of this family group
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Family group not found" });
    }
    
    const members = group[0].members || [];
    const requesterIsMember = members.some((m: any) => m.userId === String(userId));
    const targetIsMember = members.some((m: any) => m.userId === String(memberId));
    
    if (!requesterIsMember) {
      return res.status(403).json({ error: "You are not a member of this family group" });
    }
    
    if (!targetIsMember) {
      return res.status(403).json({ error: "Target user is not a member of this family group" });
    }
    
    // Find or create a DM conversation
    const existingConversations = await db.select()
      .from(conversations)
      .where(and(
        eq(conversations.type, 'family_group'),
        eq(conversations.familyGroupId, parseInt(groupId))
      ));
    
    let dmConversation = existingConversations.find((conv: any) => {
      const meta = conv.metadata as any;
      if (meta?.isDM && meta?.dmParticipants) {
        const participants = meta.dmParticipants as string[];
        return participants.includes(String(userId)) && participants.includes(String(memberId));
      }
      return false;
    });
    
    if (!dmConversation) {
      // Create new DM conversation
      const conversationData: any = {
        type: 'family_group' as const,
        familyGroupId: parseInt(groupId),
        participants: [
          { userId: String(userId), role: 'member' as const, joinedAt: new Date().toISOString(), notifications: true },
          { userId: String(memberId), role: 'member' as const, joinedAt: new Date().toISOString(), notifications: true }
        ],
        lastMessageAt: new Date(),
        unreadCounts: {},
        settings: {},
        metadata: {
          isDM: true,
          dmParticipants: [String(userId), String(memberId)]
        }
      };
      
      const [newConv] = await db.insert(conversations).values(conversationData).returning();
      dmConversation = newConv;
    }
    
    // Insert message
    const messageData: any = {
      conversationId: dmConversation.id,
      senderId: String(userId),
      senderType: 'user' as const,
      content: message,
      messageType: 'text',
      attachments: [],
      readBy: [],
      metadata: {}
    };
    
    const [newMessage] = await db.insert(messages).values(messageData).returning();
    
    // Update conversation last message time
    await db.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, dmConversation.id));
    
    res.json({
      success: true,
      message: {
        id: newMessage.id,
        senderId: newMessage.senderId,
        content: newMessage.content,
        createdAt: newMessage.createdAt,
        messageType: newMessage.messageType
      }
    });
  } catch (error) {
    console.error("Error sending DM:", error);
    res.status(500).json({ error: "Failed to send direct message" });
  }
});

// Get polls for a family group
router.get("/groups/:groupId/polls", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req);
    
    const polls = await db.select()
      .from(familyPolls)
      .where(eq(familyPolls.familyGroupId, parseInt(groupId)))
      .orderBy(desc(familyPolls.createdAt));
    
    // Check if user has voted on each poll
    const pollsWithVoteStatus = await Promise.all(polls.map(async (poll) => {
      const userVote = await db.select()
        .from(familyPollVotes)
        .where(and(
          eq(familyPollVotes.pollId, poll.id),
          eq(familyPollVotes.userId, userId)
        ))
        .limit(1);
      
      // Get vote counts for each option
      const voteCounts = await db.execute(sql`
        SELECT 
          json_array_elements(selected_options) as option_id,
          COUNT(*) as vote_count
        FROM family_poll_votes
        WHERE poll_id = ${poll.id}
        GROUP BY json_array_elements(selected_options)
      `);
      
      const optionsWithVotes = poll.options?.map((opt: any) => ({
        ...opt,
        votes: voteCounts.rows.find((v: any) => v.option_id === `"${opt.id}"`)?.vote_count || 0
      }));
      
      return {
        ...poll,
        hasVoted: userVote.length > 0,
        options: optionsWithVotes,
        votes: voteCounts.rows.length
      };
    }));
    
    res.json(pollsWithVoteStatus);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// Create a new poll
router.post("/groups/:groupId/polls", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req);
    const {
      title,
      description,
      options,
      anonymousVoting,
      showResultsRealtime,
      expiresAt
    } = req.body;
    
    if (!title || !options || options.length < 2) {
      return res.status(400).json({ 
        error: "Title and at least 2 options are required" 
      });
    }
    
    const [newPoll] = await db.insert(familyPolls).values({
      familyGroupId: parseInt(groupId),
      createdBy: userId,
      title,
      description,
      pollType: 'general',
      options,
      allowMultipleChoices: false,
      anonymousVoting: anonymousVoting || false,
      requireAllVotes: false,
      showResultsRealtime: showResultsRealtime !== false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      status: 'active'
    }).returning();
    
    res.json({
      success: true,
      poll: newPoll
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

// Submit a vote
router.post("/polls/:pollId/vote", async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const { optionIds } = req.body;
    const userId = getUserId(req);
    
    if (!optionIds || optionIds.length === 0) {
      return res.status(400).json({ error: "Option selection is required" });
    }
    
    // Check if user already voted
    const existingVote = await db.select()
      .from(familyPollVotes)
      .where(and(
        eq(familyPollVotes.pollId, parseInt(pollId)),
        eq(familyPollVotes.userId, userId)
      ))
      .limit(1);
    
    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(familyPollVotes)
        .set({
          selectedOptions: optionIds,
          votedAt: new Date()
        })
        .where(and(
          eq(familyPollVotes.pollId, parseInt(pollId)),
          eq(familyPollVotes.userId, userId)
        ));
    } else {
      // Create new vote
      await db.insert(familyPollVotes).values({
        pollId: parseInt(pollId),
        userId,
        selectedOptions: optionIds,
        voteWeight: 1,
        votedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      message: "Vote submitted successfully"
    });
  } catch (error) {
    console.error("Error submitting vote:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
});

// Get shared favorites for a family group
router.get("/groups/:groupId/favorites", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    // Get group members
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Get favorites from group creator (simplified for now)
    const sharedFavorites = await db.execute(sql`
      SELECT 
        f.id,
        f.community_id as communityId,
        c.name as communityName,
        c.city || ', ' || c.state as location,
        CASE 
          WHEN c.pricing->>'min' IS NOT NULL 
          THEN '$' || c.pricing->>'min' || '/month'
          ELSE 'Contact for pricing'
        END as price,
        COALESCE(c.average_rating, 0) as rating,
        f.notes,
        u.name as addedBy,
        f.created_at as addedAt
      FROM favorites f
      JOIN communities c ON f.community_id = c.id
      JOIN users u ON f.user_id = u.id
      WHERE f.user_id = ${group[0].createdBy}
      ORDER BY f.created_at DESC
      LIMIT 20
    `);
    
    res.json(sharedFavorites.rows);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Get tours for a family group
router.get("/groups/:groupId/tours", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    // Get group members
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Get tours for group creator (simplified for now)
    const groupTours = await db.execute(sql`
      SELECT 
        t.id,
        t.community_id as communityId,
        c.name as communityName,
        t.tour_date as tourDate,
        t.tour_time as tourTime,
        t.status,
        t.notes,
        u.name as scheduledBy
      FROM tours t
      JOIN communities c ON t.community_id = c.id
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ${group[0].createdBy}
      AND t.tour_date >= CURRENT_DATE
      ORDER BY t.tour_date ASC, t.tour_time ASC
      LIMIT 20
    `);
    
    res.json(groupTours.rows);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

// Get notes for a family group
router.get("/groups/:groupId/notes", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    // For now, return empty array (notes feature to be implemented)
    res.json([]);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Get tasks for a family group
router.get("/groups/:groupId/tasks", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    // For now, return empty array (tasks feature to be implemented)
    res.json([]);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Invite member to group
router.post("/groups/:groupId/invite", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { email, senderName } = req.body;
    const userId = getUserId(req);
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Check if group exists and user is owner or admin
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user has permission to invite
    const members = group[0].members || [];
    const requester = members.find((m: any) => m.userId === String(userId));
    const isOwner = group[0].ownerId === String(userId);
    const canInvite = isOwner || (requester?.role === 'admin') || (requester?.permissions?.canInvite);
    
    if (!canInvite) {
      return res.status(403).json({ error: "You don't have permission to invite members" });
    }
    
    const inviteCode = group[0].inviteCode;
    const groupName = group[0].name;
    const inviterName = senderName || 'A family member';
    
    // Get the base URL for the invitation link
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : process.env.BASE_URL || 'https://myseniorvalet.com';
    
    const inviteLink = `${baseUrl}/family-collaboration?join=${inviteCode}`;
    
    // Send actual email if SendGrid is configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const emailContent = {
          to: email,
          from: {
            email: 'hello@myseniorvalet.com',
            name: 'MySeniorValet'
          },
          subject: `${inviterName} invited you to join "${groupName}" on MySeniorValet`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #6b46c1; margin: 0;">MySeniorValet</h1>
                <p style="color: #718096; margin: 5px 0;">Family Collaboration Center</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                <h2 style="margin: 0 0 10px 0;">You're Invited!</h2>
                <p style="margin: 0; font-size: 18px;">${inviterName} has invited you to join the family group:</p>
                <p style="font-size: 24px; font-weight: bold; margin: 15px 0;">"${groupName}"</p>
              </div>
              
              <div style="background: #f7fafc; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center;">
                <p style="color: #4a5568; margin: 0 0 15px 0;">Your invite code:</p>
                <div style="background: white; border: 2px dashed #6b46c1; padding: 15px 25px; border-radius: 8px; display: inline-block;">
                  <code style="font-size: 28px; font-weight: bold; color: #6b46c1; letter-spacing: 3px;">${inviteCode}</code>
                </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                  Join Family Group
                </a>
              </div>
              
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
                <h3 style="color: #2d3748; margin: 0 0 15px 0;">What you can do together:</h3>
                <ul style="color: #4a5568; line-height: 1.8;">
                  <li>Share and save favorite senior living communities</li>
                  <li>Coordinate care research as a family</li>
                  <li>Vote on decisions together with polls</li>
                  <li>Message privately or as a group</li>
                  <li>Track tours and visits</li>
                </ul>
              </div>
              
              <div style="text-align: center; color: #718096; font-size: 12px; margin-top: 30px;">
                <p>MySeniorValet - The trusted platform for authentic senior living community information.</p>
                <p>Helping families make informed decisions with verified data and transparent pricing.</p>
              </div>
            </div>
          `,
          text: `
${inviterName} invited you to join "${groupName}" on MySeniorValet!

Your invite code: ${inviteCode}

Click here to join: ${inviteLink}

Or visit MySeniorValet's Family Collaboration Center and enter the code manually.

What you can do together:
- Share and save favorite senior living communities
- Coordinate care research as a family
- Vote on decisions together with polls
- Message privately or as a group
- Track tours and visits

MySeniorValet - The trusted platform for authentic senior living community information.
          `
        };
        
        await sgMail.send(emailContent);
        console.log(`✉️ Family invite email sent to ${email} for group "${groupName}"`);
        
        res.json({
          success: true,
          message: "Invitation email sent successfully",
          inviteCode: inviteCode,
          emailSent: true
        });
      } catch (emailError: any) {
        console.error("SendGrid error:", emailError?.response?.body || emailError);
        // Return success with invite code even if email fails
        res.json({
          success: true,
          message: "Could not send email, but here's the invite code to share manually",
          inviteCode: inviteCode,
          emailSent: false,
          emailError: "Email service temporarily unavailable"
        });
      }
    } else {
      // SendGrid not configured - return invite code for manual sharing
      console.log(`⚠️ SendGrid not configured - returning invite code for manual sharing`);
      res.json({
        success: true,
        message: "Email service not configured. Share this code with your family member:",
        inviteCode: inviteCode,
        inviteLink: inviteLink,
        emailSent: false
      });
    }
  } catch (error) {
    console.error("Error inviting member:", error);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

// Join group with invite code
router.post("/groups/join", async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.body;
    const userId = getUserId(req);
    
    if (!inviteCode) {
      return res.status(400).json({ error: "Invite code is required" });
    }
    
    // Find group by invite code
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.inviteCode, inviteCode.toUpperCase()))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Invalid invite code" });
    }
    
    // Update family group members list to include this user
    const currentMembers = group[0].members || [];
    const userAlreadyMember = currentMembers.some((m: any) => m.userId === String(userId));
    
    let updatedGroup = group[0];
    
    if (!userAlreadyMember) {
      currentMembers.push({
        userId: String(userId),
        role: 'member' as const,
        relationship: 'Family Member',
        permissions: {
          canMessage: true,
          canInvite: false,
          canRemove: false,
          canViewAll: true,
          canEditNotes: false
        },
        joinedAt: new Date().toISOString()
      });
      
      const [updated] = await db.update(familyGroups)
        .set({ members: currentMembers })
        .where(eq(familyGroups.id, group[0].id))
        .returning();
      
      updatedGroup = updated;
    }
    
    res.json({
      success: true,
      group: updatedGroup,
      message: userAlreadyMember ? 'You are already a member of this group' : 'Successfully joined the family group'
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
});

// Remove member from group
router.delete("/groups/:groupId/members/:memberId", async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = getUserId(req);
    
    // Check if group exists
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Check if user is owner or admin
    const currentMembers = group[0].members || [];
    const requester = currentMembers.find((m: any) => m.userId === String(userId));
    
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      return res.status(403).json({ error: "Only owner or admin can remove members" });
    }
    
    // Cannot remove owner
    if (group[0].ownerId === memberId) {
      return res.status(400).json({ error: "Cannot remove the group owner" });
    }
    
    // Remove member from list
    const updatedMembers = currentMembers.filter((m: any) => m.userId !== memberId);
    
    await db.update(familyGroups)
      .set({ members: updatedMembers })
      .where(eq(familyGroups.id, parseInt(groupId)));
    
    res.json({ success: true, message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Update member role
router.patch("/groups/:groupId/members/:memberId/role", async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;
    const { role } = req.body;
    const userId = getUserId(req);
    
    if (!role || !['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: "Valid role is required (admin, member, or viewer)" });
    }
    
    // Check if group exists
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    // Only owner can change roles
    if (group[0].ownerId !== String(userId)) {
      return res.status(403).json({ error: "Only group owner can change roles" });
    }
    
    // Cannot change owner's role
    if (group[0].ownerId === memberId) {
      return res.status(400).json({ error: "Cannot change the owner's role" });
    }
    
    // Update member role
    const currentMembers = group[0].members || [];
    const updatedMembers = currentMembers.map((m: any) => {
      if (m.userId === memberId) {
        return { ...m, role };
      }
      return m;
    });
    
    await db.update(familyGroups)
      .set({ members: updatedMembers })
      .where(eq(familyGroups.id, parseInt(groupId)));
    
    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Regenerate invite code
router.post("/groups/:groupId/regenerate-code", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const userId = getUserId(req);
    
    // Check if group exists and user is owner
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    if (group[0].ownerId !== String(userId)) {
      return res.status(403).json({ error: "Only group owner can regenerate invite code" });
    }
    
    // Generate new unique invite code with collision check
    const newCode = await generateUniqueInviteCode();
    
    await db.update(familyGroups)
      .set({ inviteCode: newCode })
      .where(eq(familyGroups.id, parseInt(groupId)));
    
    res.json({ success: true, inviteCode: newCode });
  } catch (error) {
    console.error("Error regenerating code:", error);
    res.status(500).json({ error: "Failed to regenerate invite code" });
  }
});

// Get poll results
router.get("/polls/:pollId/results", async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    
    const poll = await db.select()
      .from(familyPolls)
      .where(eq(familyPolls.id, parseInt(pollId)))
      .limit(1);
    
    if (poll.length === 0) {
      return res.status(404).json({ error: "Poll not found" });
    }
    
    const votes = await db.select()
      .from(familyPollVotes)
      .where(eq(familyPollVotes.pollId, parseInt(pollId)));
    
    res.json({
      poll: poll[0],
      votes,
      totalVotes: votes.length
    });
  } catch (error) {
    console.error("Error fetching poll results:", error);
    res.status(500).json({ error: "Failed to fetch poll results" });
  }
});

// Close a poll
router.post("/polls/:pollId/close", async (req: Request, res: Response) => {
  try {
    const { pollId } = req.params;
    const { winningOptionId, finalDecision, decisionNotes } = req.body;
    const userId = getUserId(req);
    
    // Check if user is poll creator
    const poll = await db.select()
      .from(familyPolls)
      .where(eq(familyPolls.id, parseInt(pollId)))
      .limit(1);
    
    if (poll.length === 0) {
      return res.status(404).json({ error: "Poll not found" });
    }
    
    if (poll[0].createdBy !== userId) {
      return res.status(403).json({ error: "Only poll creator can close the poll" });
    }
    
    await db.update(familyPolls)
      .set({
        status: "closed",
        winningOptionId,
        finalDecision,
        decisionNotes,
        updatedAt: new Date()
      })
      .where(eq(familyPolls.id, parseInt(pollId)));
    
    res.json({
      success: true,
      message: "Poll closed successfully"
    });
  } catch (error) {
    console.error("Error closing poll:", error);
    res.status(500).json({ error: "Failed to close poll" });
  }
});

// Create family decision record
router.post("/decisions", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const {
      familyGroupId,
      communityId,
      decisionType,
      decision,
      reasoning,
      consensusReached,
      dissenting
    } = req.body;
    
    const [newDecision] = await db.insert(familyDecisions).values({
      familyGroupId,
      communityIds: communityId ? [communityId] : [],
      decisionType: decisionType || 'other',
      title: decisionType || 'Family Decision',
      decision,
      rationale: reasoning,
      consensus: consensusReached || false,
      participants: [{
        userId: String(userId),
        agreed: true,
        notes: reasoning
      }],
      decisionMade: new Date()
    }).returning();
    
    res.json({
      success: true,
      decision: newDecision
    });
  } catch (error) {
    console.error("Error creating decision:", error);
    res.status(500).json({ error: "Failed to create decision" });
  }
});

// Get family decisions
router.get("/decisions/:groupId", async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    
    const decisions = await db.select()
      .from(familyDecisions)
      .where(eq(familyDecisions.familyGroupId, parseInt(groupId)))
      .orderBy(desc(familyDecisions.decisionMade));
    
    res.json(decisions);
  } catch (error) {
    console.error("Error fetching decisions:", error);
    res.status(500).json({ error: "Failed to fetch decisions" });
  }
});

// Get visit history for family members
router.get("/visit-history", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const isAuthenticated = userId !== null;
    
    // For unauthenticated users, show demo data
    if (!isAuthenticated) {
      return res.json([
        {
          id: '1',
          community: 'Belmont Village Senior Living',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4,
          familyMember: 'John',
          impressions: 'Beautiful facility with excellent staff',
          notes: 'Great memory care program, spacious rooms',
          pros: ['Excellent staff', 'Beautiful gardens', 'Good location'],
          cons: ['Higher pricing', 'Limited parking'],
          wouldRecommend: true
        },
        {
          id: '2',
          community: 'Atria Senior Living',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 3,
          familyMember: 'Sarah',
          impressions: 'Nice but felt understaffed',
          notes: 'Modern facilities but concerns about staffing',
          pros: ['Modern amenities', 'Good activities'],
          cons: ['Seemed understaffed', 'Food quality concerns'],
          wouldRecommend: false
        }
      ]);
    }
    
    // Get completed tours for the user
    const completedTours = await db.select({
      id: tours.id,
      date: tours.preferredDate,
      status: tours.status,
      notes: tours.tourFeedback,
      communityId: tours.communityId,
      communityName: communities.name,
      communityAddress: communities.address,
      communityCity: communities.city,
      communityState: communities.state
    })
      .from(tours)
      .leftJoin(communities, eq(tours.communityId, communities.id))
      .where(and(
        eq(tours.userId, String(userId)),
        eq(tours.status, 'completed')
      ))
      .orderBy(desc(tours.preferredDate))
      .limit(20);
    
    res.json(completedTours);
  } catch (error) {
    console.error("Error fetching visit history:", error);
    res.status(500).json({ error: "Failed to fetch visit history" });
  }
});

// Create a new visit report
router.post("/visit-reports", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { community, date, rating, notes, pros, cons, wouldRecommend } = req.body;
    
    if (!community) {
      return res.status(400).json({ error: "Community name is required" });
    }
    
    // Get user info for the family member name
    const [user] = await db.select({ 
      firstName: users.firstName, 
      lastName: users.lastName, 
      email: users.email 
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    const familyMemberName = user?.firstName || user?.email?.split('@')[0] || 'Family Member';
    
    // Create a tour record with feedback (simulating a completed visit)
    const [newTour] = await db.insert(tours).values({
      userId: String(userId),
      communityId: null, // May not match an existing community
      preferredDate: new Date(date),
      status: 'completed',
      tourFeedback: JSON.stringify({
        community,
        rating,
        notes,
        pros: pros || [],
        cons: cons || [],
        wouldRecommend: wouldRecommend ?? true,
        familyMember: familyMemberName,
        createdAt: new Date().toISOString()
      })
    }).returning();
    
    res.json({
      success: true,
      report: {
        id: newTour.id,
        community,
        date,
        rating,
        notes,
        pros,
        cons,
        wouldRecommend,
        familyMember: familyMemberName
      }
    });
  } catch (error) {
    console.error("Error creating visit report:", error);
    res.status(500).json({ error: "Failed to create visit report" });
  }
});

// Get shared favorites for family
router.get("/shared-favorites", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const isAuthenticated = userId !== null;
    
    // For unauthenticated users, show demo data
    if (!isAuthenticated) {
      return res.json([
        {
          id: 1,
          name: 'Sunrise Senior Living',
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          priceRange: '$4,500 - $7,000',
          careType: 'Assisted Living & Memory Care',
          rating: 4.5,
          familyRating: 4,
          notes: 'Great memory care program',
          addedBy: 'John'
        },
        {
          id: 2,
          name: 'Golden Years Community',
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          priceRange: '$3,800 - $5,500',
          careType: 'Independent Living',
          rating: 4.2,
          familyRating: 5,
          notes: 'Mom loved the activities!',
          addedBy: 'Sarah'
        }
      ]);
    }
    
    // Get user's favorites with community details
    const userFavorites = await db.select({
      id: favorites.id,
      communityId: favorites.communityId,
      notes: favorites.notes,
      tags: favorites.tags,
      priority: favorites.priority,
      name: communities.name,
      address: communities.address,
      city: communities.city,
      state: communities.state,
      priceRange: communities.priceRange,
      careTypes: communities.careTypes
    })
      .from(favorites)
      .leftJoin(communities, eq(favorites.communityId, communities.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .limit(20);
    
    res.json(userFavorites);
  } catch (error) {
    console.error("Error fetching shared favorites:", error);
    res.status(500).json({ error: "Failed to fetch shared favorites" });
  }
});

// ============================================================================
// FAMILY MEDICATIONS CRUD (stored in user session/memory for now)
// ============================================================================

// In-memory storage for family medications and appointments per user
const familyMedications = new Map<string, any[]>();
const familyAppointments = new Map<string, any[]>();

// Get medications for user's family
router.get("/medications", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json([]);
    }
    
    const userMeds = familyMedications.get(String(userId)) || [];
    res.json(userMeds);
  } catch (error) {
    console.error("Error fetching medications:", error);
    res.status(500).json({ error: "Failed to fetch medications" });
  }
});

// Add medication
router.post("/medications", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { name, dosage, frequency, time, prescribedBy } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Medication name is required" });
    }
    
    const userMeds = familyMedications.get(String(userId)) || [];
    const newId = userMeds.length > 0 ? Math.max(...userMeds.map(m => m.id)) + 1 : 1;
    
    const newMed = {
      id: newId,
      name,
      dosage: dosage || 'As prescribed',
      frequency: frequency || 'Once daily',
      time: time || 'Morning',
      remaining: 30,
      prescribedBy: prescribedBy || 'Doctor',
      nextRefill: 'In 30 days',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    userMeds.push(newMed);
    familyMedications.set(String(userId), userMeds);
    
    res.json(newMed);
  } catch (error) {
    console.error("Error adding medication:", error);
    res.status(500).json({ error: "Failed to add medication" });
  }
});

// Update medication
router.put("/medications/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const medId = parseInt(req.params.id);
    const userMeds = familyMedications.get(String(userId)) || [];
    const medIndex = userMeds.findIndex(m => m.id === medId);
    
    if (medIndex === -1) {
      return res.status(404).json({ error: "Medication not found" });
    }
    
    const { name, dosage, frequency, time, prescribedBy, status } = req.body;
    userMeds[medIndex] = {
      ...userMeds[medIndex],
      ...(name && { name }),
      ...(dosage && { dosage }),
      ...(frequency && { frequency }),
      ...(time && { time }),
      ...(prescribedBy && { prescribedBy }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };
    
    familyMedications.set(String(userId), userMeds);
    res.json(userMeds[medIndex]);
  } catch (error) {
    console.error("Error updating medication:", error);
    res.status(500).json({ error: "Failed to update medication" });
  }
});

// Delete medication
router.delete("/medications/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const medId = parseInt(req.params.id);
    const userMeds = familyMedications.get(String(userId)) || [];
    const filteredMeds = userMeds.filter(m => m.id !== medId);
    
    if (filteredMeds.length === userMeds.length) {
      return res.status(404).json({ error: "Medication not found" });
    }
    
    familyMedications.set(String(userId), filteredMeds);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting medication:", error);
    res.status(500).json({ error: "Failed to delete medication" });
  }
});

// ============================================================================
// FAMILY APPOINTMENTS CRUD
// ============================================================================

// Get appointments for user's family
router.get("/appointments", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.json([]);
    }
    
    const userAppts = familyAppointments.get(String(userId)) || [];
    res.json(userAppts);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Add appointment
router.post("/appointments", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const { type, doctor, date, time, location, notes } = req.body;
    
    if (!type || !date) {
      return res.status(400).json({ error: "Appointment type and date are required" });
    }
    
    const userAppts = familyAppointments.get(String(userId)) || [];
    const newId = userAppts.length > 0 ? Math.max(...userAppts.map(a => a.id)) + 1 : 1;
    
    const newAppt = {
      id: newId,
      type,
      doctor: doctor || 'TBD',
      date,
      time: time || 'TBD',
      location: location || 'TBD',
      status: 'pending',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    
    userAppts.push(newAppt);
    familyAppointments.set(String(userId), userAppts);
    
    res.json(newAppt);
  } catch (error) {
    console.error("Error adding appointment:", error);
    res.status(500).json({ error: "Failed to add appointment" });
  }
});

// Update appointment
router.put("/appointments/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const apptId = parseInt(req.params.id);
    const userAppts = familyAppointments.get(String(userId)) || [];
    const apptIndex = userAppts.findIndex(a => a.id === apptId);
    
    if (apptIndex === -1) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    const { type, doctor, date, time, location, notes, status } = req.body;
    userAppts[apptIndex] = {
      ...userAppts[apptIndex],
      ...(type && { type }),
      ...(doctor && { doctor }),
      ...(date && { date }),
      ...(time && { time }),
      ...(location && { location }),
      ...(notes !== undefined && { notes }),
      ...(status && { status }),
      updatedAt: new Date().toISOString()
    };
    
    familyAppointments.set(String(userId), userAppts);
    res.json(userAppts[apptIndex]);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Delete appointment
router.delete("/appointments/:id", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    const apptId = parseInt(req.params.id);
    const userAppts = familyAppointments.get(String(userId)) || [];
    const filteredAppts = userAppts.filter(a => a.id !== apptId);
    
    if (filteredAppts.length === userAppts.length) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    familyAppointments.set(String(userId), filteredAppts);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;