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

const router = Router();

// Helper to get user ID from request
const getUserId = (req: Request): number => {
  return (req as any).user?.id || 1; // Default to 1 for development
};

// Create a new family group
router.post("/groups", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }
    
    // Generate unique invite code
    const inviteCode = randomBytes(4).toString('hex').toUpperCase();
    
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
    
    // Find the user's family group
    const allGroups = await db.select()
      .from(familyGroups);
    
    const userGroups = allGroups.filter(g => g.ownerId == userId);
    
    if (userGroups.length === 0) {
      return res.json({ 
        messages: [], 
        currentUserId: userId,
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
    
    // Find the user's family group - simplified query
    const userGroups = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.ownerId, String(userId)))
      .limit(1);
    
    if (userGroups.length === 0) {
      return res.status(400).json({ error: "You must join a family group first" });
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
    const { email } = req.body;
    const userId = getUserId(req);
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Check if group exists and user is owner
    const group = await db.select()
      .from(familyGroups)
      .where(eq(familyGroups.id, parseInt(groupId)))
      .limit(1);
    
    if (group.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }
    
    if (group[0].ownerId !== String(userId)) {
      return res.status(403).json({ error: "Only group owner can invite members" });
    }
    
    // TODO: Send actual email invitation
    // For now, just return success
    res.json({
      success: true,
      message: "Invitation sent successfully",
      inviteCode: group[0].inviteCode
    });
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
      
      await db.update(familyGroups)
        .set({ members: currentMembers })
        .where(eq(familyGroups.id, group[0].id));
    }
    
    res.json({
      success: true,
      group: group[0]
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: "Failed to join group" });
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

export default router;