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
    const testUserId = 41; // Using actual test user from database
    
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
    const testUserId = 41; // Using actual test user from database
    
    // Check if user already voted using raw SQL
    const existingVote = await db.execute(sql`
      SELECT * FROM family_poll_votes 
      WHERE poll_id = ${parseInt(pollId)} 
      AND user_id = ${testUserId}
    `);
    
    if (existingVote.rows && existingVote.rows.length > 0) {
      // Update existing vote using raw SQL
      await db.execute(sql`
        UPDATE family_poll_votes 
        SET option_ids = ${JSON.stringify(optionIds)}::json,
            vote_reason = ${comment || null},
            voted_at = NOW()
        WHERE poll_id = ${parseInt(pollId)} 
        AND user_id = ${testUserId}
      `);
    } else {
      // Create new vote using raw SQL
      await db.execute(sql`
        INSERT INTO family_poll_votes (poll_id, user_id, option_ids, vote_reason, vote_weight, voted_at)
        VALUES (${parseInt(pollId)}, ${testUserId}, ${JSON.stringify(optionIds)}::json, ${comment || null}, 1, NOW())
      `);
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
    
    // For development, use a test user ID
    const testUserId = 41;
    
    // Use raw SQL to insert decision with correct column names
    const result = await db.execute(sql`
      INSERT INTO family_decisions (
        family_group_id, decision_type, decision_value, 
        consensus_level, decided_by, poll_id, 
        community_id, tour_id, notes, decision_date, created_at
      ) VALUES (
        ${familyGroupId || 5}, 
        ${decisionType || 'community_selected'}, 
        ${JSON.stringify({
          title: title || '',
          description: description || '',
          decision: decision || '',
          rationale: rationale || ''
        })}::json,
        ${consensus ? 'unanimous' : 'majority'},
        ${testUserId},
        ${pollId || null},
        ${communityIds && communityIds[0] ? communityIds[0] : null},
        ${tourIds && tourIds[0] ? tourIds[0] : null},
        ${rationale || ''},
        NOW(),
        NOW()
      ) RETURNING *
    `);
    
    const newDecision = result.rows[0];
    
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
    
    // Use raw SQL to get decisions with correct column names
    const result = await db.execute(sql`
      SELECT 
        id,
        family_group_id as "familyGroupId",
        poll_id as "pollId",
        tour_id as "tourId",
        community_id as "communityId",
        decision_type as "decisionType",
        decision_value as "decisionValue",
        consensus_level as "consensusLevel",
        decided_by as "decidedBy",
        decision_date as "decisionDate",
        is_final as "isFinal",
        execution_date as "executionDate",
        notes,
        created_at as "createdAt"
      FROM family_decisions
      WHERE family_group_id = ${parseInt(groupId)}
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
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
    const testUserId = 41; // Using actual test user from database
    
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

// Family sharing endpoint - proper JSON response
router.post("/share", async (req: Request, res: Response) => {
  try {
    const { 
      communityId, 
      shareMode = 'email',
      recipients = [],
      personalMessage = '',
      communityDetails = {}
    } = req.body;
    
    // Validate inputs
    if (!communityId) {
      return res.status(400).json({ 
        error: "Community ID is required",
        success: false 
      });
    }
    
    if (shareMode === 'email' && (!recipients || recipients.length === 0)) {
      return res.status(400).json({ 
        error: "Recipients are required for email sharing",
        success: false 
      });
    }
    
    // Get community details for sharing
    const [community] = await db.select()
      .from(communities)
      .where(eq(communities.id, parseInt(communityId)))
      .limit(1);
    
    if (!community) {
      return res.status(404).json({ 
        error: "Community not found",
        success: false 
      });
    }
    
    // Generate shareable data
    const shareableData = {
      community: {
        id: community.id,
        name: community.name,
        address: `${community.address}, ${community.city}, ${community.state}`,
        phone: community.phone,
        careTypes: community.careTypes,
        pricing: community.pricing || {},
        description: community.description
      },
      sharedAt: new Date().toISOString(),
      sharedBy: "MySeniorValet User", // In production, use authenticated user
      personalMessage,
      shareLink: `https://myseniorvalet.com/communities/${communityId}`
    };
    
    // Simulate successful sharing (in production, send actual emails/notifications)
    console.log(`📧 Family sharing request processed:`, {
      communityId,
      communityName: community.name,
      shareMode,
      recipientCount: recipients.length,
      hasPersonalMessage: !!personalMessage
    });
    
    // Return proper JSON success response
    res.json({
      success: true,
      message: `Community "${community.name}" shared successfully with ${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`,
      data: {
        communityId: community.id,
        communityName: community.name,
        shareMode,
        recipients: recipients.length,
        shareableData,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("Error in family sharing:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to process family sharing request",
      timestamp: new Date().toISOString()
    });
  }
});

export default router;