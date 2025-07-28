import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { 
  familyGroups, 
  familyMembers, 
  familyMessages, 
  familyNotes, 
  familyTasks,
  insertFamilyGroupSchema,
  insertFamilyMemberSchema,
  insertFamilyMessageSchema,
  insertFamilyNoteSchema,
  insertFamilyTaskSchema,
} from '@shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';
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

    // Get groups where user is primary or a member
    const memberGroups = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      );

    const groupIds = memberGroups.map(m => m.groupId);
    
    const userGroups = await db
      .select()
      .from(familyGroups)
      .where(
        or(
          eq(familyGroups.primaryUserId, userId),
          ...(groupIds.length > 0 ? groupIds.map(id => eq(familyGroups.id, id)) : [])
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

    const validatedData = insertFamilyGroupSchema.parse(req.body);
    
    const newGroup = await db
      .insert(familyGroups)
      .values({
        ...validatedData,
        primaryUserId: userId,
        inviteCode: generateInviteCode(),
      })
      .returning();

    // Add the creator as an active admin member
    await db
      .insert(familyMembers)
      .values({
        groupId: newGroup[0].id,
        userId: userId,
        email: req.user?.email || '',
        name: req.user?.name || 'Family Admin',
        role: 'admin',
        status: 'active',
        joinedAt: new Date(),
      });

    res.json(newGroup[0]);
  } catch (error) {
    console.error('Error creating family group:', error);
    res.status(500).json({ message: 'Failed to create family group' });
  }
});

// Get family group details with members
router.get('/groups/:groupId', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const group = await db
      .select()
      .from(familyGroups)
      .where(eq(familyGroups.id, groupId))
      .limit(1);

    if (!group.length) {
      return res.status(404).json({ message: 'Family group not found' });
    }

    const members = await db
      .select()
      .from(familyMembers)
      .where(eq(familyMembers.groupId, groupId));

    const isMember = group[0].primaryUserId === userId || 
      members.some(m => m.userId === userId && m.status === 'active');

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      ...group[0],
      members,
    });
  } catch (error) {
    console.error('Error fetching family group:', error);
    res.status(500).json({ message: 'Failed to fetch family group' });
  }
});

// Invite a family member
router.post('/groups/:groupId/invite', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    const { email, name } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user is admin of this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.role, 'admin'),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Only group admins can invite members' });
    }

    // Check if already invited
    const existing = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.email, email)
        )
      )
      .limit(1);

    if (existing.length) {
      return res.status(400).json({ message: 'This person is already in the group' });
    }

    const newMember = await db
      .insert(familyMembers)
      .values({
        groupId,
        email,
        name,
        role: 'member',
        status: 'pending',
      })
      .returning();

    // TODO: Send invitation email with invite code

    res.json(newMember[0]);
  } catch (error) {
    console.error('Error inviting family member:', error);
    res.status(500).json({ message: 'Failed to invite family member' });
  }
});

// Join a family group using invite code
router.post('/join', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { inviteCode } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find group by invite code
    const group = await db
      .select()
      .from(familyGroups)
      .where(eq(familyGroups.inviteCode, inviteCode))
      .limit(1);

    if (!group.length) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, group[0].id),
          eq(familyMembers.userId, userId)
        )
      )
      .limit(1);

    if (existing.length && existing[0].status === 'active') {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    if (existing.length) {
      // Update existing pending invitation
      await db
        .update(familyMembers)
        .set({
          status: 'active',
          userId: userId,
          joinedAt: new Date(),
        })
        .where(eq(familyMembers.id, existing[0].id));
    } else {
      // Create new member
      await db
        .insert(familyMembers)
        .values({
          groupId: group[0].id,
          userId: userId,
          email: req.user?.email || '',
          name: req.user?.name || 'Family Member',
          role: 'member',
          status: 'active',
          joinedAt: new Date(),
        });
    }

    res.json({ message: 'Successfully joined family group', group: group[0] });
  } catch (error) {
    console.error('Error joining family group:', error);
    res.status(500).json({ message: 'Failed to join family group' });
  }
});

// Get messages for a family group
router.get('/groups/:groupId/messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await db
      .select({
        id: familyMessages.id,
        message: familyMessages.message,
        attachments: familyMessages.attachments,
        createdAt: familyMessages.createdAt,
        editedAt: familyMessages.editedAt,
        senderId: familyMessages.senderId,
        senderName: familyMembers.name,
      })
      .from(familyMessages)
      .leftJoin(familyMembers, eq(familyMessages.senderId, familyMembers.userId))
      .where(eq(familyMessages.groupId, groupId))
      .orderBy(desc(familyMessages.createdAt))
      .limit(limit)
      .offset(offset);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a message to family group
router.post('/groups/:groupId/messages', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validatedData = insertFamilyMessageSchema.parse({
      ...req.body,
      groupId,
      senderId: userId,
    });

    const newMessage = await db
      .insert(familyMessages)
      .values(validatedData)
      .returning();

    res.json(newMessage[0]);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get notes for a family group
router.get('/groups/:groupId/notes', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notes = await db
      .select()
      .from(familyNotes)
      .where(eq(familyNotes.groupId, groupId))
      .orderBy(desc(familyNotes.updatedAt));

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

// Create a note
router.post('/groups/:groupId/notes', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validatedData = insertFamilyNoteSchema.parse({
      ...req.body,
      groupId,
      authorId: userId,
    });

    const newNote = await db
      .insert(familyNotes)
      .values(validatedData)
      .returning();

    res.json(newNote[0]);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// Get tasks for a family group
router.get('/groups/:groupId/tasks', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await db
      .select()
      .from(familyTasks)
      .where(eq(familyTasks.groupId, groupId))
      .orderBy(desc(familyTasks.createdAt));

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Create a task
router.post('/groups/:groupId/tasks', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const groupId = parseInt(req.params.groupId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const validatedData = insertFamilyTaskSchema.parse({
      ...req.body,
      groupId,
      createdBy: userId,
    });

    const newTask = await db
      .insert(familyTasks)
      .values(validatedData)
      .returning();

    res.json(newTask[0]);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// Update task status
router.patch('/tasks/:taskId', async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.taskId);
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get task to verify access
    const task = await db
      .select()
      .from(familyTasks)
      .where(eq(familyTasks.id, taskId))
      .limit(1);

    if (!task.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access to this group
    const member = await db
      .select()
      .from(familyMembers)
      .where(
        and(
          eq(familyMembers.groupId, task[0].groupId),
          eq(familyMembers.userId, userId),
          eq(familyMembers.status, 'active')
        )
      )
      .limit(1);

    if (!member.length) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData: any = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const updatedTask = await db
      .update(familyTasks)
      .set(updateData)
      .where(eq(familyTasks.id, taskId))
      .returning();

    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
});

export default router;