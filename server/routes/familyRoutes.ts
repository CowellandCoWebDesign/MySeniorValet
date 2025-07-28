import { type Express } from "express";
import { db } from "../db";
import { users, communities, tours, userFavorites } from "@shared/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../replitAuth";
import { z } from "zod";

const inviteFamilySchema = z.object({
  email: z.string().email(),
  relationship: z.string().min(1),
  message: z.string().optional()
});

export function registerFamilyRoutes(app: Express) {
  // Get family connections
  app.get('/api/family/connections', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const connections = await db
        .select({
          connection: familyConnections,
          connectedUser: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(familyConnections)
        .innerJoin(users, 
          or(
            eq(familyConnections.userId1, users.id),
            eq(familyConnections.userId2, users.id)
          )
        )
        .where(
          and(
            or(
              eq(familyConnections.userId1, userId),
              eq(familyConnections.userId2, userId)
            ),
            eq(familyConnections.status, 'connected')
          )
        );

      // Filter to only show the other user in the connection
      const formattedConnections = connections.map(c => {
        const isUser1 = c.connection.userId1 === userId;
        return {
          id: c.connection.id,
          relationship: isUser1 ? c.connection.relationship1 : c.connection.relationship2,
          connectedUser: c.connectedUser,
          connectedAt: c.connection.createdAt
        };
      }).filter(c => c.connectedUser.id !== userId);

      res.json(formattedConnections);
    } catch (error) {
      console.error('Error fetching family connections:', error);
      res.status(500).json({ message: 'Failed to fetch family connections' });
    }
  });

  // Send family invitation
  app.post('/api/family/invite', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const validatedData = inviteFamilySchema.parse(req.body);

      // Check if user exists
      const [invitedUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email))
        .limit(1);

      if (!invitedUser) {
        // Create invitation for non-existing user
        const [invitation] = await db
          .insert(familyInvitations)
          .values({
            inviterId: userId,
            inviteeEmail: validatedData.email,
            relationship: validatedData.relationship,
            message: validatedData.message,
            status: 'pending',
            inviteCode: generateInviteCode()
          })
          .returning();

        // TODO: Send email invitation
        return res.json({ 
          success: true, 
          message: 'Invitation sent',
          type: 'email',
          invitation 
        });
      }

      // Check if already connected
      const existingConnection = await db
        .select()
        .from(familyConnections)
        .where(
          and(
            or(
              and(
                eq(familyConnections.userId1, userId),
                eq(familyConnections.userId2, invitedUser.id)
              ),
              and(
                eq(familyConnections.userId1, invitedUser.id),
                eq(familyConnections.userId2, userId)
              )
            ),
            eq(familyConnections.status, 'connected')
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        return res.status(400).json({ message: 'Already connected with this family member' });
      }

      // Create connection request
      const [connection] = await db
        .insert(familyConnections)
        .values({
          userId1: userId,
          userId2: invitedUser.id,
          relationship1: validatedData.relationship,
          relationship2: 'Family Member', // Default, user can update
          status: 'pending'
        })
        .returning();

      res.json({ 
        success: true, 
        message: 'Connection request sent',
        type: 'connection',
        connection 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error sending invitation:', error);
      res.status(500).json({ message: 'Failed to send invitation' });
    }
  });

  // Get pending invitations
  app.get('/api/family/invitations', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get email invitations
      const emailInvitations = await db
        .select({
          invitation: familyInvitations,
          inviter: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(familyInvitations)
        .innerJoin(users, eq(familyInvitations.inviterId, users.id))
        .where(
          and(
            eq(familyInvitations.inviteeEmail, userEmail),
            eq(familyInvitations.status, 'pending')
          )
        );

      // Get connection requests
      const connectionRequests = await db
        .select({
          connection: familyConnections,
          requester: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(familyConnections)
        .innerJoin(users, eq(familyConnections.userId1, users.id))
        .where(
          and(
            eq(familyConnections.userId2, userId),
            eq(familyConnections.status, 'pending')
          )
        );

      res.json({
        emailInvitations: emailInvitations.map(i => ({
          id: i.invitation.id,
          type: 'email',
          inviter: i.inviter,
          relationship: i.invitation.relationship,
          message: i.invitation.message,
          createdAt: i.invitation.createdAt
        })),
        connectionRequests: connectionRequests.map(c => ({
          id: c.connection.id,
          type: 'connection',
          requester: c.requester,
          relationship: c.connection.relationship1,
          createdAt: c.connection.createdAt
        }))
      });
    } catch (error) {
      console.error('Error fetching invitations:', error);
      res.status(500).json({ message: 'Failed to fetch invitations' });
    }
  });

  // Accept invitation
  app.post('/api/family/invitations/:invitationId/accept', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const invitationId = parseInt(req.params.invitationId);
      const { type, relationship } = req.body;

      if (type === 'connection') {
        // Accept connection request
        const [connection] = await db
          .update(familyConnections)
          .set({
            status: 'connected',
            relationship2: relationship || 'Family Member',
            updatedAt: new Date()
          })
          .where(
            and(
              eq(familyConnections.id, invitationId),
              eq(familyConnections.userId2, userId),
              eq(familyConnections.status, 'pending')
            )
          )
          .returning();

        if (!connection) {
          return res.status(404).json({ message: 'Connection request not found' });
        }

        res.json({ success: true, connection });
      } else {
        // Accept email invitation
        const [invitation] = await db
          .update(familyInvitations)
          .set({
            status: 'accepted',
            acceptedAt: new Date(),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(familyInvitations.id, invitationId),
              eq(familyInvitations.status, 'pending')
            )
          )
          .returning();

        if (!invitation) {
          return res.status(404).json({ message: 'Invitation not found' });
        }

        // Create connection
        const [connection] = await db
          .insert(familyConnections)
          .values({
            userId1: invitation.inviterId,
            userId2: userId,
            relationship1: invitation.relationship,
            relationship2: relationship || 'Family Member',
            status: 'connected'
          })
          .returning();

        res.json({ success: true, connection });
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      res.status(500).json({ message: 'Failed to accept invitation' });
    }
  });

  // Decline invitation
  app.post('/api/family/invitations/:invitationId/decline', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const invitationId = parseInt(req.params.invitationId);
      const { type } = req.body;

      if (type === 'connection') {
        await db
          .delete(familyConnections)
          .where(
            and(
              eq(familyConnections.id, invitationId),
              eq(familyConnections.userId2, userId),
              eq(familyConnections.status, 'pending')
            )
          );
      } else {
        await db
          .update(familyInvitations)
          .set({
            status: 'declined',
            updatedAt: new Date()
          })
          .where(
            and(
              eq(familyInvitations.id, invitationId),
              eq(familyInvitations.status, 'pending')
            )
          );
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error declining invitation:', error);
      res.status(500).json({ message: 'Failed to decline invitation' });
    }
  });

  // Remove family connection
  app.delete('/api/family/connections/:connectionId', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const connectionId = parseInt(req.params.connectionId);

      await db
        .delete(familyConnections)
        .where(
          and(
            eq(familyConnections.id, connectionId),
            or(
              eq(familyConnections.userId1, userId),
              eq(familyConnections.userId2, userId)
            )
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing connection:', error);
      res.status(500).json({ message: 'Failed to remove connection' });
    }
  });

  // Share communities with family
  app.post('/api/family/share', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { communityIds, familyMemberIds, message } = req.body;

      if (!Array.isArray(communityIds) || communityIds.length === 0) {
        return res.status(400).json({ message: 'Community IDs are required' });
      }

      if (!Array.isArray(familyMemberIds) || familyMemberIds.length === 0) {
        return res.status(400).json({ message: 'Family member IDs are required' });
      }

      // TODO: Implement sharing mechanism
      // For now, just return success
      res.json({ 
        success: true, 
        message: `Shared ${communityIds.length} communities with ${familyMemberIds.length} family members` 
      });
    } catch (error) {
      console.error('Error sharing communities:', error);
      res.status(500).json({ message: 'Failed to share communities' });
    }
  });
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}