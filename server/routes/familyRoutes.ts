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
  users
} from "@shared/schema";
import { eq, and, desc, asc, or, inArray, sql } from "drizzle-orm";

const router = Router();

// Get all family groups for the current user
router.get("/groups", async (req: Request, res: Response) => {
  try {
    // For development, return mock data since we don't have full auth yet
    const mockGroups = [
      {
        id: 1,
        name: "Smith Family",
        members: [
          { id: 1, name: "John Smith", role: "primary" },
          { id: 2, name: "Jane Smith", role: "member" },
          { id: 3, name: "Bob Smith", role: "member" }
        ],
        settings: {
          allowVoting: true,
          requireConsensus: false
        }
      },
      {
        id: 2,
        name: "Johnson Family Group",
        members: [
          { id: 4, name: "Mike Johnson", role: "primary" },
          { id: 5, name: "Sarah Johnson", role: "member" }
        ],
        settings: {
          allowVoting: true,
          requireConsensus: true
        }
      }
    ];
    
    res.json(mockGroups);
  } catch (error) {
    console.error("Error fetching family groups:", error);
    res.status(500).json({ error: "Failed to fetch family groups" });
  }
});

// Get polls for a family group
router.get("/polls/:groupId?", async (req: Request, res: Response) => {
  try {
    const groupId = req.params.groupId || req.query.groupId;
    
    if (!groupId) {
      // Return all polls for now (development)
      const allPolls = await db.select()
        .from(familyPolls)
        .orderBy(desc(familyPolls.createdAt))
        .limit(10);
      
      return res.json(allPolls);
    }
    
    const polls = await db.select()
      .from(familyPolls)
      .where(eq(familyPolls.familyGroupId, parseInt(groupId as string)))
      .orderBy(desc(familyPolls.createdAt));
    
    res.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// Create a new poll
router.post("/polls", async (req: Request, res: Response) => {
  try {
    const {
      familyGroupId,
      title,
      description,
      pollType,
      options,
      allowMultipleChoices,
      anonymousVoting,
      requireAllVotes,
      showResultsRealtime,
      expiresAt,
      tourId,
      communityId
    } = req.body;
    
    // For development, use a test user ID
    const testUserId = 1;
    
    // Use raw SQL to avoid schema mismatches
    const result = await db.execute(sql`
      INSERT INTO family_polls (
        family_group_id, created_by, title, description, poll_type, options,
        allow_multiple_choices, anonymous_voting, require_all_votes, show_results_realtime,
        expires_at, tour_id, community_id, status, created_at, updated_at
      ) VALUES (
        ${familyGroupId || 1}, ${testUserId}, ${title}, ${description}, ${pollType || "general"},
        ${JSON.stringify(options)}::json, ${allowMultipleChoices || false}, ${anonymousVoting || false},
        ${requireAllVotes || false}, ${showResultsRealtime !== false},
        ${expiresAt ? new Date(expiresAt) : null}, ${tourId || null}, ${communityId || null},
        'active', NOW(), NOW()
      ) RETURNING *
    `);
    
    const newPoll = result.rows[0];
    
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
    const { optionIds, comment } = req.body;
    
    // For development, use a test user ID
    const testUserId = 1;
    
    // Check if user already voted
    const existingVote = await db.select()
      .from(familyPollVotes)
      .where(
        and(
          eq(familyPollVotes.pollId, parseInt(pollId)),
          eq(familyPollVotes.userId, testUserId)
        )
      );
    
    if (existingVote.length > 0) {
      // Update existing vote
      await db.update(familyPollVotes)
        .set({
          selectedOptions: JSON.stringify(optionIds),
          comment: comment || null,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(familyPollVotes.pollId, parseInt(pollId)),
            eq(familyPollVotes.userId, testUserId)
          )
        );
    } else {
      // Create new vote
      await db.insert(familyPollVotes)
        .values({
          pollId: parseInt(pollId),
          userId: testUserId,
          selectedOptions: JSON.stringify(optionIds),
          comment: comment || null,
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

// Create a family decision record
router.post("/decisions", async (req: Request, res: Response) => {
  try {
    const {
      familyGroupId,
      decisionType,
      title,
      description,
      decision,
      rationale,
      consensus,
      participants,
      communityIds,
      tourIds,
      pollId
    } = req.body;
    
    const [newDecision] = await db.insert(familyDecisions)
      .values({
        familyGroupId: familyGroupId || 1,
        decisionType,
        title,
        description,
        decision,
        rationale,
        consensus: consensus || false,
        participants: JSON.stringify(participants),
        communityIds: communityIds || [],
        tourIds: tourIds || [],
        pollId: pollId || null,
        discussionStarted: new Date(),
        decisionMade: new Date(),
        status: "decided",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
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

// Link a tour with a conversation
router.post("/tour-conversations", async (req: Request, res: Response) => {
  try {
    const {
      tourId,
      conversationId,
      familyGroupId,
      linkType
    } = req.body;
    
    // For development, use a test user ID
    const testUserId = 1;
    
    const [link] = await db.insert(tourConversations)
      .values({
        tourId,
        conversationId,
        familyGroupId: familyGroupId || null,
        linkType: linkType || "discussion",
        linkedBy: testUserId,
        linkedAt: new Date()
      })
      .returning();
    
    res.json({
      success: true,
      link
    });
  } catch (error) {
    console.error("Error linking tour conversation:", error);
    res.status(500).json({ error: "Failed to link tour conversation" });
  }
});

// Get conversations for a tour
router.get("/tour-conversations/:tourId", async (req: Request, res: Response) => {
  try {
    const { tourId } = req.params;
    
    const conversations = await db.select()
      .from(tourConversations)
      .where(eq(tourConversations.tourId, parseInt(tourId)));
    
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching tour conversations:", error);
    res.status(500).json({ error: "Failed to fetch tour conversations" });
  }
});

export default router;