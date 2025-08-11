import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  familyGroups,
  messages,
  conversations
} from '@shared/schema';
import { eq, and, or, desc, sql, lt } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Generate a unique invite code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Get user's family groups
router.get('/groups', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get groups where user is owner or a member
    const userGroups = await db
      .select()
      .from(familyGroups)
      .where(
        or(
          eq(familyGroups.ownerId, userId),
          sql`${familyGroups.members}::text LIKE ${`%"userId":"${userId}"%`}`
        )
      );

    res.json(userGroups);
  } catch (error) {
    console.error('Error fetching family groups:', error);
    res.status(500).json({ message: 'Failed to fetch family groups' });
  }
});

// Create a new family group
router.post('/groups', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const inviteCode = generateInviteCode();
    const inviteCodeExpiry = new Date();
    inviteCodeExpiry.setDate(inviteCodeExpiry.getDate() + 7); // 7 days validity

    const [newGroup] = await db
      .insert(familyGroups)
      .values({
        name,
        ownerId: userId,
        members: [{
          userId,
          role: 'owner' as const,
          permissions: {
            canMessage: true,
            canInvite: true,
            canRemove: true,
            canViewAll: true,
            canEditNotes: true,
          },
          joinedAt: new Date().toISOString(),
        }],
        inviteCode,
        inviteCodeExpiry,
        settings: {
          allowJoinRequests: true,
          requireApproval: false,
          shareLocation: true,
          shareCalendar: true,
          notifyOnActivity: true,
        },
      })
      .returning();

    res.json(newGroup);
  } catch (error) {
    console.error('Error creating family group:', error);
    res.status(500).json({ message: 'Failed to create family group' });
  }
});

// Join a family group with invite code
router.post('/groups/join', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name || 'Family Member';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ message: 'Invite code is required' });
    }

    // Find the group with the invite code
    const [group] = await db
      .select()
      .from(familyGroups)
      .where(
        and(
          eq(familyGroups.inviteCode, inviteCode),
          sql`${familyGroups.inviteCodeExpiry} > NOW()`
        )
      );

    if (!group) {
      return res.status(404).json({ message: 'Invalid or expired invite code' });
    }

    // Check if user is already a member
    const members = group.members || [];
    if (members.some((m: any) => m.userId === userId)) {
      return res.status(400).json({ message: 'Already a member of this group' });
    }

    // Add user to the group
    const updatedMembers = [
      ...members,
      {
        userId,
        role: 'member' as const,
        permissions: {
          canMessage: true,
          canInvite: false,
          canRemove: false,
          canViewAll: true,
          canEditNotes: true,
        },
        joinedAt: new Date().toISOString(),
        invitedBy: group.ownerId,
      }
    ];

    const [updatedGroup] = await db
      .update(familyGroups)
      .set({ 
        members: updatedMembers,
        updatedAt: new Date() 
      })
      .where(eq(familyGroups.id, group.id))
      .returning();

    res.json(updatedGroup);
  } catch (error) {
    console.error('Error joining family group:', error);
    res.status(500).json({ message: 'Failed to join family group' });
  }
});

// Get family group conversations
router.get('/groups/:groupId/conversations', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId || !groupId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the family group conversation
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.familyGroupId, groupId),
          eq(conversations.type, 'family_group')
        )
      );

    res.json(conversation || null);
  } catch (error) {
    console.error('Error fetching family conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Send a message in family group
router.post('/groups/:groupId/messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    const { content, attachments } = req.body;
    
    if (!userId || !groupId || !content) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // First, get or create a conversation for this family group
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.familyGroupId, groupId),
          eq(conversations.type, 'family_group')
        )
      );

    if (!conversation) {
      // Create a new conversation for the family group
      const [group] = await db
        .select()
        .from(familyGroups)
        .where(eq(familyGroups.id, groupId));

      if (!group) {
        return res.status(404).json({ message: 'Family group not found' });
      }

      const participants = (group.members || []).map((member: any) => ({
        userId: member.userId,
        role: member.role === 'owner' ? 'admin' : 'member',
        joinedAt: member.joinedAt,
        notifications: true,
      }));

      [conversation] = await db
        .insert(conversations)
        .values({
          type: 'family_group',
          title: `${group.name} - Family Chat`,
          familyGroupId: groupId,
          participants,
          status: 'active',
        })
        .returning();
    }

    // Insert the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId: conversation.id,
        senderId: userId,
        senderType: 'user',
        content,
        attachments: attachments || [],
        messageType: 'text',
      })
      .returning();

    // Update conversation's last message info
    await db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversation.id));

    res.json(newMessage);
  } catch (error) {
    console.error('Error sending family message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get family group messages
router.get('/groups/:groupId/messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!userId || !groupId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get the conversation for this family group
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.familyGroupId, groupId),
          eq(conversations.type, 'family_group')
        )
      );

    if (!conversation) {
      return res.json([]);
    }

    // Get messages for the conversation
    const groupMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversation.id))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(groupMessages);
  } catch (error) {
    console.error('Error fetching family messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Add a shared note to family group
router.post('/groups/:groupId/notes', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    const { content, communityId, tags } = req.body;
    
    if (!userId || !groupId || !content) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Get the family group
    const [group] = await db
      .select()
      .from(familyGroups)
      .where(eq(familyGroups.id, groupId));

    if (!group) {
      return res.status(404).json({ message: 'Family group not found' });
    }

    // Check if user is a member
    const members = group.members || [];
    const member = members.find((m: any) => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: 'Not a member of this group' });
    }

    // Add the note to shared notes
    const newNote = {
      id: crypto.randomUUID(),
      authorId: userId,
      content,
      communityId,
      createdAt: new Date().toISOString(),
      tags: tags || [],
    };

    const sharedNotes = group.sharedNotes || [];
    sharedNotes.push(newNote);

    // Update the group
    await db
      .update(familyGroups)
      .set({ 
        sharedNotes,
        updatedAt: new Date() 
      })
      .where(eq(familyGroups.id, groupId));

    res.json(newNote);
  } catch (error) {
    console.error('Error adding family note:', error);
    res.status(500).json({ message: 'Failed to add note' });
  }
});

// Remove member from family group (owner only)
router.delete('/groups/:groupId/members/:memberId', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    const memberIdToRemove = req.params.memberId;
    
    if (!userId || !groupId || !memberIdToRemove) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Get the family group
    const [group] = await db
      .select()
      .from(familyGroups)
      .where(eq(familyGroups.id, groupId));

    if (!group) {
      return res.status(404).json({ message: 'Family group not found' });
    }

    // Check if user is the owner
    if (group.ownerId !== userId) {
      return res.status(403).json({ message: 'Only group owner can remove members' });
    }

    // Remove the member
    const members = group.members || [];
    const updatedMembers = members.filter((m: any) => m.userId !== memberIdToRemove);

    if (members.length === updatedMembers.length) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Update the group
    await db
      .update(familyGroups)
      .set({ 
        members: updatedMembers,
        updatedAt: new Date() 
      })
      .where(eq(familyGroups.id, groupId));

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

export default router;