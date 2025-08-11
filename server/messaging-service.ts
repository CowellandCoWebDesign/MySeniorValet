import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { db } from "./db";
import { 
  messages, 
  conversations, 
  familyGroups, 
  messageTemplates,
  messagingNotifications,
  users,
  communities,
  type Message,
  type Conversation,
  type FamilyGroup,
  type InsertMessage,
  type InsertConversation
} from "@shared/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { sendMessageNotification } from "./sendgrid-service";

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  conversationIds?: number[];
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: "auth" | "message" | "typing" | "read" | "presence" | "conversation_update" | "family_update";
  payload: any;
}

export class MessagingService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<AuthenticatedWebSocket>> = new Map();
  private typingStates: Map<number, Set<string>> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws/messaging' });

    this.wss.on('connection', (ws: AuthenticatedWebSocket) => {
      console.log('New WebSocket connection established');
      
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('message', async (data) => {
        try {
          const message: WebSocketMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ type: 'error', payload: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Request authentication
      ws.send(JSON.stringify({ type: 'auth_required', payload: {} }));
    });

    // Keep-alive mechanism
    const interval = setInterval(() => {
      if (this.wss) {
        this.wss.clients.forEach((ws: AuthenticatedWebSocket) => {
          if (ws.isAlive === false) {
            ws.terminate();
            return;
          }
          ws.isAlive = false;
          ws.ping();
        });
      }
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  private async handleMessage(ws: AuthenticatedWebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'auth':
        await this.handleAuth(ws, message.payload);
        break;
      case 'message':
        if (ws.userId) {
          await this.handleNewMessage(ws, message.payload);
        }
        break;
      case 'typing':
        if (ws.userId) {
          await this.handleTyping(ws, message.payload);
        }
        break;
      case 'read':
        if (ws.userId) {
          await this.handleMessageRead(ws, message.payload);
        }
        break;
      case 'presence':
        if (ws.userId) {
          await this.handlePresence(ws, message.payload);
        }
        break;
    }
  }

  private async handleAuth(ws: AuthenticatedWebSocket, payload: { userId: string }) {
    const { userId } = payload;
    
    // Verify user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      ws.send(JSON.stringify({ type: 'auth_failed', payload: 'Invalid user' }));
      ws.close();
      return;
    }

    ws.userId = userId;

    // Get user's conversations
    const userConversations = await db.select()
      .from(conversations)
      .where(sql`${conversations.participants}::jsonb @> ${JSON.stringify([{ userId }])}`)
      .orderBy(desc(conversations.lastMessageAt));

    ws.conversationIds = userConversations.map(c => c.id);

    // Add to clients map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);

    // Send auth success with conversations
    ws.send(JSON.stringify({
      type: 'auth_success',
      payload: { userId, conversations: userConversations }
    }));

    // Notify presence
    this.broadcastPresence(userId, true);
  }

  private async handleNewMessage(ws: AuthenticatedWebSocket, payload: {
    conversationId: number;
    content: string;
    messageType?: string;
    attachments?: any[];
    metadata?: any;
  }) {
    const { conversationId, content, messageType = 'text', attachments = [], metadata = {} } = payload;

    // Verify user is participant
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      ws.send(JSON.stringify({ type: 'error', payload: 'Conversation not found' }));
      return;
    }

    const participants = conversation.participants as any[];
    const isParticipant = participants.some(p => p.userId === ws.userId);

    if (!isParticipant) {
      ws.send(JSON.stringify({ type: 'error', payload: 'Not a participant' }));
      return;
    }

    // Create message
    const [newMessage] = await db.insert(messages).values({
      conversationId,
      senderId: ws.userId!,
      senderType: 'user',
      content,
      messageType,
      attachments,
      metadata
    }).returning();

    // Update conversation
    await db.update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId));

    // Get sender info
    const [sender] = await db.select()
      .from(users)
      .where(eq(users.id, ws.userId!));

    const messageWithSender = {
      ...newMessage,
      sender: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        profileImageUrl: sender.profileImageUrl
      }
    };

    // Broadcast to all participants
    participants.forEach(participant => {
      const participantSockets = this.clients.get(participant.userId);
      if (participantSockets) {
        participantSockets.forEach(socket => {
          socket.send(JSON.stringify({
            type: 'new_message',
            payload: messageWithSender
          }));
        });
      }
    });

    // Send email notifications to offline participants
    participants.forEach(async (participant) => {
      // Don't send notification to the sender
      if (participant.userId === ws.userId) return;
      
      // Check if user is online (has active socket connections)
      const isOnline = this.clients.has(participant.userId);
      
      if (!isOnline || participant.notifications) {
        // Determine recipient type
        const recipientType = participant.userId.startsWith('community_') ? 'community' : 'user';
        const recipientId = recipientType === 'community' 
          ? participant.userId.replace('community_', '') 
          : participant.userId;
        
        // Send email notification
        await sendMessageNotification({
          recipientId,
          recipientType,
          conversationId,
          messageContent: content,
          senderName: `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User'
        });
      }
    });

    // Clear typing state
    const typingSet = this.typingStates.get(conversationId);
    if (typingSet) {
      typingSet.delete(ws.userId!);
      this.broadcastTyping(conversationId);
    }
  }

  private async handleTyping(ws: AuthenticatedWebSocket, payload: {
    conversationId: number;
    isTyping: boolean;
  }) {
    const { conversationId, isTyping } = payload;

    if (!this.typingStates.has(conversationId)) {
      this.typingStates.set(conversationId, new Set());
    }

    const typingSet = this.typingStates.get(conversationId)!;

    if (isTyping) {
      typingSet.add(ws.userId!);
    } else {
      typingSet.delete(ws.userId!);
    }

    this.broadcastTyping(conversationId);
  }

  private async handleMessageRead(ws: AuthenticatedWebSocket, payload: {
    messageId: number;
    conversationId: number;
  }) {
    const { messageId, conversationId } = payload;

    // Update message read status
    const [message] = await db.select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (message) {
      const readBy = (message.readBy || []) as any[];
      const alreadyRead = readBy.some(r => r.userId === ws.userId);

      if (!alreadyRead) {
        readBy.push({
          userId: ws.userId,
          readAt: new Date().toISOString()
        });

        await db.update(messages)
          .set({ readBy })
          .where(eq(messages.id, messageId));

        // Broadcast read status
        this.broadcastToConversation(conversationId, {
          type: 'message_read',
          payload: { messageId, userId: ws.userId }
        });
      }
    }
  }

  private async handlePresence(ws: AuthenticatedWebSocket, payload: {
    status: 'online' | 'away' | 'offline';
  }) {
    const { status } = payload;
    this.broadcastPresence(ws.userId!, status === 'online');
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    if (ws.userId) {
      const userSockets = this.clients.get(ws.userId);
      if (userSockets) {
        userSockets.delete(ws);
        if (userSockets.size === 0) {
          this.clients.delete(ws.userId);
          this.broadcastPresence(ws.userId, false);
        }
      }

      // Clear typing states
      this.typingStates.forEach((typingSet, conversationId) => {
        if (typingSet.has(ws.userId!)) {
          typingSet.delete(ws.userId!);
          this.broadcastTyping(conversationId);
        }
      });
    }
  }

  private broadcastToConversation(conversationId: number, message: any) {
    this.wss?.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.conversationIds?.includes(conversationId) && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  private broadcastTyping(conversationId: number) {
    const typingUsers = Array.from(this.typingStates.get(conversationId) || []);
    this.broadcastToConversation(conversationId, {
      type: 'typing_update',
      payload: { conversationId, typingUsers }
    });
  }

  private broadcastPresence(userId: string, isOnline: boolean) {
    this.wss?.clients.forEach((client: AuthenticatedWebSocket) => {
      if (client.readyState === WebSocket.OPEN && client.userId !== userId) {
        client.send(JSON.stringify({
          type: 'presence_update',
          payload: { userId, isOnline }
        }));
      }
    });
  }

  // API methods for HTTP endpoints
  async createConversation(data: {
    type: 'user_to_community' | 'user_to_user' | 'family_group';
    title?: string;
    participants: any[];
    communityId?: number;
    familyGroupId?: number;
    metadata?: any;
  }): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({
      type: data.type,
      title: data.title,
      participants: data.participants,
      communityId: data.communityId,
      familyGroupId: data.familyGroupId,
      metadata: data.metadata || {}
    }).returning();

    return conversation;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const userConversations = await db.select()
      .from(conversations)
      .where(sql`${conversations.participants}::jsonb @> ${JSON.stringify([{ userId }])}`)
      .orderBy(desc(conversations.lastMessageAt));

    return userConversations;
  }

  async getMessages(conversationId: number, limit = 50, offset = 0): Promise<Message[]> {
    const conversationMessages = await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return conversationMessages.reverse();
  }

  async createFamilyGroup(data: {
    name: string;
    ownerId: string;
    members: any[];
    settings?: any;
  }): Promise<FamilyGroup> {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const inviteCodeExpiry = new Date();
    inviteCodeExpiry.setDate(inviteCodeExpiry.getDate() + 7); // 7 days expiry

    const [familyGroup] = await db.insert(familyGroups).values({
      name: data.name,
      ownerId: data.ownerId,
      members: data.members,
      settings: data.settings || {},
      inviteCode,
      inviteCodeExpiry
    }).returning();

    return familyGroup;
  }

  async joinFamilyGroup(userId: string, inviteCode: string): Promise<FamilyGroup | null> {
    const [familyGroup] = await db.select()
      .from(familyGroups)
      .where(and(
        eq(familyGroups.inviteCode, inviteCode),
        sql`${familyGroups.inviteCodeExpiry} > NOW()`
      ));

    if (!familyGroup) {
      return null;
    }

    const members = familyGroup.members as any[];
    const isMember = members.some(m => m.userId === userId);

    if (!isMember) {
      members.push({
        userId,
        role: 'member',
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
        .set({ members, updatedAt: new Date() })
        .where(eq(familyGroups.id, familyGroup.id));
    }

    return familyGroup;
  }

  // Send message via REST API (includes email notifications)
  async sendMessage(data: {
    conversationId: number;
    senderId: string;
    senderType: 'user' | 'community';
    content: string;
    messageType?: 'text' | 'image' | 'document';
    attachments?: any[];
    metadata?: any;
  }): Promise<Message> {
    const { conversationId, senderId, senderType, content, messageType = 'text', attachments, metadata } = data;

    // Get conversation details
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Create message
    const [newMessage] = await db.insert(messages).values({
      conversationId,
      senderId,
      senderType,
      content,
      messageType,
      attachments,
      metadata
    }).returning();

    // Update conversation
    await db.update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: content.substring(0, 100),
        updatedAt: new Date()
      })
      .where(eq(conversations.id, conversationId));

    // Get sender info
    let senderName = 'User';
    if (senderType === 'user') {
      const [sender] = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      })
        .from(users)
        .where(eq(users.id, parseInt(senderId)));
      if (sender) {
        senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'User';
      }
    } else if (senderType === 'community') {
      const [community] = await db.select({
        id: communities.id,
        name: communities.name
      })
        .from(communities)
        .where(eq(communities.id, senderId));
      if (community) {
        senderName = community.name || 'Community';
      }
    }

    // Send email notifications to all participants except sender
    const participants = (conversation.participants as any[]) || [];
    for (const participant of participants) {
      // Skip sender
      if (participant.userId === senderId || 
          (senderType === 'community' && participant.userId === `community_${senderId}`)) {
        continue;
      }

      // Check if participant has notifications enabled
      if (participant.notifications !== false) {
        // Determine recipient type
        const recipientType = participant.userId.startsWith('community_') ? 'community' : 'user';
        const recipientId = recipientType === 'community' 
          ? participant.userId.replace('community_', '') 
          : participant.userId;
        
        // Send email notification asynchronously
        sendMessageNotification({
          recipientId,
          recipientType,
          conversationId,
          messageContent: content,
          senderName
        }).catch(error => {
          console.error('Failed to send email notification:', error);
        });
      }
    }

    // Broadcast to WebSocket clients if available
    if (this.wss) {
      participants.forEach(participant => {
        const participantSockets = this.clients.get(participant.userId);
        if (participantSockets) {
          participantSockets.forEach(socket => {
            socket.send(JSON.stringify({
              type: 'new_message',
              payload: newMessage
            }));
          });
        }
      });
    }

    return newMessage;
  }
}

export const messagingService = new MessagingService();