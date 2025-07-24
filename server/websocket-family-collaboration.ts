import { WebSocket } from 'ws';
import { db } from './db';
import { users, communities } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface FamilyCollaborationEvent {
  type: 'tour_update' | 'availability_change' | 'family_message' | 'decision_update' | 'note_added';
  userId: string;
  communityId?: number;
  data: any;
  timestamp: Date;
}

export interface FamilyMember {
  userId: string;
  name: string;
  email: string;
  relationship: string;
  permissions: ('view' | 'comment' | 'schedule' | 'decide')[];
  isOnline: boolean;
}

export interface CollaborationRoom {
  roomId: string;
  communityId: number;
  primaryUserId: string;
  familyMembers: FamilyMember[];
  activeConnections: Map<string, WebSocket>;
  recentActivity: FamilyCollaborationEvent[];
}

export class WebSocketFamilyCollaboration {
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userConnections: Map<string, WebSocket> = new Map();

  async createCollaborationRoom(
    communityId: number,
    primaryUserId: string,
    familyMembers: Array<{
      name: string;
      email: string;
      relationship: string;
      permissions: string[];
    }>
  ): Promise<{
    roomId: string;
    inviteLinks: Array<{
      email: string;
      inviteLink: string;
    }>;
  }> {
    try {
      const roomId = `collab_${communityId}_${primaryUserId}_${Date.now()}`;
      
      const familyMembersList: FamilyMember[] = familyMembers.map(member => ({
        userId: `guest_${member.email.replace('@', '_at_')}`, // Temporary ID for guests
        name: member.name,
        email: member.email,
        relationship: member.relationship,
        permissions: member.permissions as any,
        isOnline: false
      }));

      const room: CollaborationRoom = {
        roomId,
        communityId,
        primaryUserId,
        familyMembers: familyMembersList,
        activeConnections: new Map(),
        recentActivity: []
      };

      this.rooms.set(roomId, room);

      // Generate invite links for family members
      const inviteLinks = familyMembers.map(member => ({
        email: member.email,
        inviteLink: `${process.env.BASE_URL}/family-collaboration/${roomId}?invite=${encodeURIComponent(member.email)}`
      }));

      return { roomId, inviteLinks };

    } catch (error) {
      console.error('Collaboration room creation error:', error);
      throw error;
    }
  }

  async handleWebSocketConnection(ws: WebSocket, userId: string, roomId?: string): Promise<void> {
    try {
      // Store user connection
      this.userConnections.set(userId, ws);

      if (roomId && this.rooms.has(roomId)) {
        const room = this.rooms.get(roomId)!;
        room.activeConnections.set(userId, ws);
        
        // Update member online status
        const member = room.familyMembers.find(m => m.userId === userId);
        if (member) {
          member.isOnline = true;
        }

        // Notify other family members of new connection
        await this.broadcastToRoom(roomId, {
          type: 'family_message',
          userId,
          data: {
            message: `${member?.name || 'Family member'} joined the collaboration`,
            messageType: 'system'
          },
          timestamp: new Date()
        });

        // Send current room state to new connection
        ws.send(JSON.stringify({
          type: 'room_state',
          data: {
            roomId,
            communityId: room.communityId,
            familyMembers: room.familyMembers,
            recentActivity: room.recentActivity.slice(-10) // Last 10 activities
          }
        }));
      }

      // Handle incoming messages
      ws.on('message', async (message: string) => {
        try {
          const event = JSON.parse(message) as FamilyCollaborationEvent;
          await this.handleCollaborationEvent(event, userId, roomId);
        } catch (error) {
          console.error('WebSocket message handling error:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(userId, roomId);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private async handleCollaborationEvent(
    event: FamilyCollaborationEvent,
    userId: string,
    roomId?: string
  ): Promise<void> {
    if (!roomId || !this.rooms.has(roomId)) return;

    const room = this.rooms.get(roomId)!;
    
    // Add event to room activity
    room.recentActivity.push({
      ...event,
      userId,
      timestamp: new Date()
    });

    // Keep only last 50 activities
    if (room.recentActivity.length > 50) {
      room.recentActivity = room.recentActivity.slice(-50);
    }

    // Handle specific event types
    switch (event.type) {
      case 'tour_update':
        await this.handleTourUpdate(room, event, userId);
        break;
      case 'availability_change':
        await this.handleAvailabilityChange(room, event, userId);
        break;
      case 'family_message':
        await this.handleFamilyMessage(room, event, userId);
        break;
      case 'decision_update':
        await this.handleDecisionUpdate(room, event, userId);
        break;
      case 'note_added':
        await this.handleNoteAdded(room, event, userId);
        break;
    }

    // Broadcast event to all room members
    await this.broadcastToRoom(roomId, event);
  }

  private async handleTourUpdate(room: CollaborationRoom, event: FamilyCollaborationEvent, userId: string): Promise<void> {
    const member = room.familyMembers.find(m => m.userId === userId);
    const memberName = member?.name || 'Family member';

    // Check if user has scheduling permissions
    if (!member?.permissions.includes('schedule')) {
      return; // Ignore if no permission
    }

    // Send notification to all family members about tour update
    const tourData = event.data;
    await this.broadcastToRoom(room.roomId, {
      type: 'family_message',
      userId: 'system',
      data: {
        message: `${memberName} updated tour schedule: ${tourData.tourDate ? new Date(tourData.tourDate).toLocaleDateString() : 'TBD'}`,
        messageType: 'tour_notification',
        tourData
      },
      timestamp: new Date()
    });
  }

  private async handleAvailabilityChange(room: CollaborationRoom, event: FamilyCollaborationEvent, userId: string): Promise<void> {
    // Real-time availability notifications
    const availabilityData = event.data;
    
    await this.broadcastToRoom(room.roomId, {
      type: 'family_message',
      userId: 'system',
      data: {
        message: `Availability update: ${availabilityData.message}`,
        messageType: 'availability_alert',
        urgency: availabilityData.urgency || 'normal'
      },
      timestamp: new Date()
    });
  }

  private async handleFamilyMessage(room: CollaborationRoom, event: FamilyCollaborationEvent, userId: string): Promise<void> {
    const member = room.familyMembers.find(m => m.userId === userId);
    
    // Add sender information to message
    const enrichedEvent = {
      ...event,
      data: {
        ...event.data,
        senderName: member?.name || 'Family member',
        senderRelationship: member?.relationship
      }
    };

    // Message is already broadcast by the main event handler
  }

  private async handleDecisionUpdate(room: CollaborationRoom, event: FamilyCollaborationEvent, userId: string): Promise<void> {
    const member = room.familyMembers.find(m => m.userId === userId);
    
    // Check if user has decision permissions
    if (!member?.permissions.includes('decide')) {
      return;
    }

    const decisionData = event.data;
    await this.broadcastToRoom(room.roomId, {
      type: 'family_message',
      userId: 'system',
      data: {
        message: `${member.name} made a decision: ${decisionData.decision}`,
        messageType: 'decision_update',
        decisionData
      },
      timestamp: new Date()
    });
  }

  private async handleNoteAdded(room: CollaborationRoom, event: FamilyCollaborationEvent, userId: string): Promise<void> {
    const member = room.familyMembers.find(m => m.userId === userId);
    const noteData = event.data;

    await this.broadcastToRoom(room.roomId, {
      type: 'family_message',
      userId: 'system',
      data: {
        message: `${member?.name || 'Family member'} added a note: "${noteData.note.substring(0, 50)}${noteData.note.length > 50 ? '...' : ''}"`,
        messageType: 'note_added',
        noteData
      },
      timestamp: new Date()
    });
  }

  private async broadcastToRoom(roomId: string, event: FamilyCollaborationEvent): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const message = JSON.stringify({
      type: 'collaboration_event',
      data: event
    });

    // Send to all active connections in the room
    for (const [userId, ws] of room.activeConnections) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        } else {
          // Remove dead connection
          room.activeConnections.delete(userId);
          const member = room.familyMembers.find(m => m.userId === userId);
          if (member) {
            member.isOnline = false;
          }
        }
      } catch (error) {
        console.error(`Error sending message to user ${userId}:`, error);
        room.activeConnections.delete(userId);
      }
    }
  }

  private handleDisconnection(userId: string, roomId?: string): void {
    // Remove user connection
    this.userConnections.delete(userId);

    if (roomId && this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)!;
      room.activeConnections.delete(userId);
      
      // Update member online status
      const member = room.familyMembers.find(m => m.userId === userId);
      if (member) {
        member.isOnline = false;
      }

      // Notify other family members of disconnection
      this.broadcastToRoom(roomId, {
        type: 'family_message',
        userId: 'system',
        data: {
          message: `${member?.name || 'Family member'} left the collaboration`,
          messageType: 'system'
        },
        timestamp: new Date()
      });
    }
  }

  async sendInstantNotification(
    userId: string,
    notification: {
      type: 'tour_reminder' | 'availability_alert' | 'family_update' | 'decision_needed';
      title: string;
      message: string;
      communityId?: number;
      actionUrl?: string;
    }
  ): Promise<void> {
    const connection = this.userConnections.get(userId);
    
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'instant_notification',
        data: notification
      }));
    }
  }

  async getLiveFamilyCollaborationData(roomId: string): Promise<{
    communityId: number;
    familyMembers: FamilyMember[];
    onlineCount: number;
    recentActivity: FamilyCollaborationEvent[];
    roomStatus: 'active' | 'inactive';
  } | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      communityId: room.communityId,
      familyMembers: room.familyMembers,
      onlineCount: room.familyMembers.filter(m => m.isOnline).length,
      recentActivity: room.recentActivity.slice(-20), // Last 20 activities
      roomStatus: room.activeConnections.size > 0 ? 'active' : 'inactive'
    };
  }

  async scheduleInstantTourUpdate(
    roomId: string,
    tourUpdate: {
      communityId: number;
      tourDate: Date;
      tourTime: string;
      attendees: string[];
      notes?: string;
    }
  ): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Send live update to all family members
    await this.broadcastToRoom(roomId, {
      type: 'tour_update',
      userId: 'system',
      communityId: tourUpdate.communityId,
      data: {
        message: 'Tour schedule updated',
        tourDate: tourUpdate.tourDate,
        tourTime: tourUpdate.tourTime,
        attendees: tourUpdate.attendees,
        notes: tourUpdate.notes
      },
      timestamp: new Date()
    });

    // Send individual notifications to family members
    for (const member of room.familyMembers) {
      await this.sendInstantNotification(member.userId, {
        type: 'tour_reminder',
        title: 'Tour Schedule Updated',
        message: `Tour scheduled for ${tourUpdate.tourDate.toLocaleDateString()} at ${tourUpdate.tourTime}`,
        communityId: tourUpdate.communityId,
        actionUrl: `/community/${tourUpdate.communityId}`
      });
    }
  }
}

export const webSocketFamilyCollaboration = new WebSocketFamilyCollaboration();