import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { redisCache } from './redis-cache';

interface WebSocketClient extends WebSocket {
  id: string;
  userId?: number;
  familyId?: string;
  communityId?: number;
  role: 'family' | 'community_manager' | 'admin';
  isAlive: boolean;
  lastActivity: Date;
}

interface Message {
  id: string;
  type: 'family_chat' | 'tour_update' | 'availability_change' | 'notification' | 'typing' | 'heartbeat';
  from: {
    userId: number;
    name: string;
    role: string;
  };
  to?: {
    familyId?: string;
    communityId?: number;
    userId?: number;
  };
  content: any;
  timestamp: Date;
  metadata?: any;
}

class RealTimeCommunication {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WebSocketClient>();
  private familyRooms = new Map<string, Set<string>>(); // familyId -> Set of client IDs
  private communityRooms = new Map<number, Set<string>>(); // communityId -> Set of client IDs

  initialize(server: any): void {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Heartbeat interval to detect dead connections
    setInterval(this.heartbeat.bind(this), 30000); // 30 seconds
    
    console.log('✅ Real-time communication server initialized');
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // Add authentication verification here
    // For now, allow all connections
    return true;
  }

  private handleConnection(ws: WebSocketClient, req: IncomingMessage): void {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    ws.id = clientId;
    ws.isAlive = true;
    ws.lastActivity = new Date();
    ws.role = 'family'; // Default role
    
    this.clients.set(clientId, ws);

    console.log(`🔗 WebSocket client connected: ${clientId}`);

    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch (error) {
        console.error('Invalid WebSocket message format:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    // Handle connection close
    ws.on('close', () => {
      this.handleDisconnection(ws);
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });

    // Handle pong responses
    ws.on('pong', () => {
      ws.isAlive = true;
      ws.lastActivity = new Date();
    });

    // Send welcome message
    this.sendMessage(ws, {
      type: 'connection',
      content: {
        clientId,
        status: 'connected',
        timestamp: new Date()
      }
    });
  }

  private handleMessage(client: WebSocketClient, rawMessage: any): void {
    client.lastActivity = new Date();

    // Validate message structure
    if (!rawMessage.type) {
      return this.sendError(client, 'Message type is required');
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: rawMessage.type,
      from: rawMessage.from || {
        userId: client.userId || 0,
        name: 'Anonymous',
        role: client.role
      },
      to: rawMessage.to,
      content: rawMessage.content,
      timestamp: new Date(),
      metadata: rawMessage.metadata
    };

    // Handle different message types
    switch (message.type) {
      case 'join_family':
        this.handleJoinFamily(client, rawMessage.familyId);
        break;
      
      case 'join_community':
        this.handleJoinCommunity(client, rawMessage.communityId);
        break;
      
      case 'family_chat':
        this.handleFamilyChat(client, message);
        break;
      
      case 'tour_update':
        this.handleTourUpdate(client, message);
        break;
      
      case 'availability_change':
        this.handleAvailabilityChange(client, message);
        break;
      
      case 'typing':
        this.handleTyping(client, message);
        break;
      
      case 'heartbeat':
        this.sendMessage(client, { type: 'heartbeat_ack', content: { timestamp: new Date() } });
        break;
      
      default:
        this.sendError(client, `Unknown message type: ${message.type}`);
    }

    // Store message in cache for history
    this.storeMessage(message);
  }

  private handleJoinFamily(client: WebSocketClient, familyId: string): void {
    if (!familyId) {
      return this.sendError(client, 'Family ID is required');
    }

    // Leave previous family room if any
    if (client.familyId) {
      this.leaveFamily(client, client.familyId);
    }

    // Join new family room
    client.familyId = familyId;
    
    if (!this.familyRooms.has(familyId)) {
      this.familyRooms.set(familyId, new Set());
    }
    
    this.familyRooms.get(familyId)!.add(client.id);

    // Notify family members
    this.broadcastToFamily(familyId, {
      type: 'family_member_joined',
      content: {
        userId: client.userId,
        name: client.from?.name || 'Family Member',
        timestamp: new Date()
      }
    }, client.id);

    this.sendMessage(client, {
      type: 'family_joined',
      content: {
        familyId,
        memberCount: this.familyRooms.get(familyId)?.size || 0
      }
    });
  }

  private handleJoinCommunity(client: WebSocketClient, communityId: number): void {
    if (!communityId) {
      return this.sendError(client, 'Community ID is required');
    }

    // Leave previous community room if any
    if (client.communityId) {
      this.leaveCommunity(client, client.communityId);
    }

    // Join new community room
    client.communityId = communityId;
    
    if (!this.communityRooms.has(communityId)) {
      this.communityRooms.set(communityId, new Set());
    }
    
    this.communityRooms.get(communityId)!.add(client.id);

    this.sendMessage(client, {
      type: 'community_joined',
      content: {
        communityId,
        connectedUsers: this.communityRooms.get(communityId)?.size || 0
      }
    });
  }

  private handleFamilyChat(client: WebSocketClient, message: Message): void {
    if (!client.familyId) {
      return this.sendError(client, 'Not connected to a family room');
    }

    // Broadcast to all family members
    this.broadcastToFamily(client.familyId, message, client.id);
  }

  private handleTourUpdate(client: WebSocketClient, message: Message): void {
    // Notify both family and community
    if (client.familyId) {
      this.broadcastToFamily(client.familyId, message, client.id);
    }
    
    if (message.to?.communityId) {
      this.broadcastToCommunity(message.to.communityId, message, client.id);
    }
  }

  private handleAvailabilityChange(client: WebSocketClient, message: Message): void {
    // Only community managers can send availability updates
    if (client.role !== 'community_manager' && client.role !== 'admin') {
      return this.sendError(client, 'Insufficient permissions');
    }

    if (client.communityId) {
      // Broadcast to all users interested in this community
      this.broadcastToCommunity(client.communityId, message, client.id);
    }
  }

  private handleTyping(client: WebSocketClient, message: Message): void {
    if (!client.familyId) {
      return this.sendError(client, 'Not connected to a family room');
    }

    // Broadcast typing indicator to family (excluding sender)
    this.broadcastToFamily(client.familyId, message, client.id);
  }

  private handleDisconnection(client: WebSocketClient): void {
    console.log(`🔌 WebSocket client disconnected: ${client.id}`);

    // Remove from family room
    if (client.familyId) {
      this.leaveFamily(client, client.familyId);
    }

    // Remove from community room
    if (client.communityId) {
      this.leaveCommunity(client, client.communityId);
    }

    // Remove from clients map
    this.clients.delete(client.id);
  }

  private leaveFamily(client: WebSocketClient, familyId: string): void {
    const familyRoom = this.familyRooms.get(familyId);
    if (familyRoom) {
      familyRoom.delete(client.id);
      
      // Notify remaining family members
      this.broadcastToFamily(familyId, {
        type: 'family_member_left',
        content: {
          userId: client.userId,
          timestamp: new Date()
        }
      }, client.id);

      // Clean up empty room
      if (familyRoom.size === 0) {
        this.familyRooms.delete(familyId);
      }
    }
  }

  private leaveCommunity(client: WebSocketClient, communityId: number): void {
    const communityRoom = this.communityRooms.get(communityId);
    if (communityRoom) {
      communityRoom.delete(client.id);
      
      // Clean up empty room
      if (communityRoom.size === 0) {
        this.communityRooms.delete(communityId);
      }
    }
  }

  private broadcastToFamily(familyId: string, message: any, excludeClientId?: string): void {
    const familyRoom = this.familyRooms.get(familyId);
    if (!familyRoom) return;

    familyRoom.forEach(clientId => {
      if (clientId !== excludeClientId) {
        const client = this.clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
          this.sendMessage(client, message);
        }
      }
    });
  }

  private broadcastToCommunity(communityId: number, message: any, excludeClientId?: string): void {
    const communityRoom = this.communityRooms.get(communityId);
    if (!communityRoom) return;

    communityRoom.forEach(clientId => {
      if (clientId !== excludeClientId) {
        const client = this.clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
          this.sendMessage(client, message);
        }
      }
    });
  }

  private sendMessage(client: WebSocketClient, message: any): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  private sendError(client: WebSocketClient, error: string): void {
    this.sendMessage(client, {
      type: 'error',
      content: { error, timestamp: new Date() }
    });
  }

  private async storeMessage(message: Message): Promise<void> {
    try {
      // Store in Redis for message history
      const key = `messages:${message.to?.familyId || message.to?.communityId || 'global'}`;
      const messages = await redisCache.get<Message[]>(key) || [];
      messages.unshift(message);
      
      // Keep only last 100 messages
      if (messages.length > 100) {
        messages.splice(100);
      }
      
      await redisCache.set(key, messages, 86400); // 24 hours
    } catch (error) {
      console.error('Failed to store message:', error);
    }
  }

  private heartbeat(): void {
    this.clients.forEach((client, clientId) => {
      if (!client.isAlive) {
        console.log(`🔌 Terminating dead connection: ${clientId}`);
        client.terminate();
        this.handleDisconnection(client);
        return;
      }

      client.isAlive = false;
      client.ping();
    });
  }

  // Public methods for external use
  async getMessageHistory(familyId?: string, communityId?: number): Promise<Message[]> {
    const key = `messages:${familyId || communityId || 'global'}`;
    return await redisCache.get<Message[]>(key) || [];
  }

  getConnectedUsers(): {
    total: number;
    families: number;
    communities: number;
    byRole: Record<string, number>;
  } {
    const byRole: Record<string, number> = {};
    
    this.clients.forEach(client => {
      byRole[client.role] = (byRole[client.role] || 0) + 1;
    });

    return {
      total: this.clients.size,
      families: this.familyRooms.size,
      communities: this.communityRooms.size,
      byRole
    };
  }

  // Send notification to specific user
  sendToUser(userId: number, message: any): boolean {
    const client = Array.from(this.clients.values()).find(c => c.userId === userId);
    if (client) {
      this.sendMessage(client, message);
      return true;
    }
    return false;
  }

  // Send notification to family
  sendToFamily(familyId: string, message: any): void {
    this.broadcastToFamily(familyId, message);
  }

  // Send notification to community
  sendToCommunity(communityId: number, message: any): void {
    this.broadcastToCommunity(communityId, message);
  }
}

export const realTimeCommunication = new RealTimeCommunication();