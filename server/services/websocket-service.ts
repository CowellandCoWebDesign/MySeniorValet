import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { db } from '../db';
import { wsConnections, messages, notifications } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import crypto from 'crypto';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  socketId?: string;
  isAlive?: boolean;
}

interface WebSocketMessage {
  type: 'message' | 'notification' | 'typing' | 'presence' | 'heartbeat';
  data: any;
  timestamp?: Date;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, AuthenticatedWebSocket> = new Map();
  private userSockets: Map<number, Set<string>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize WebSocket server
   */
  initialize(server: Server) {
    // TEMPORARILY DISABLED: WebSocket server causing Vite instability
    // The WebSocket on /ws path conflicts with Vite's HMR WebSocket
    // Uncomment this block when ready to use WebSocket features
    /*
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      perMessageDeflate: false
    });
    
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Start heartbeat monitoring
    this.startHeartbeat();
    */
    
    console.log('⚠️ WebSocket server disabled to fix Vite stability');
  }
  
  /**
   * Handle new WebSocket connection
   */
  private async handleConnection(ws: AuthenticatedWebSocket, request: any) {
    const socketId = crypto.randomBytes(16).toString('hex');
    ws.socketId = socketId;
    ws.isAlive = true;
    
    // Store connection
    this.clients.set(socketId, ws);
    
    // Send connection acknowledgment
    this.sendToClient(ws, {
      type: 'connection',
      data: { socketId, status: 'connected' }
    });
    
    // Set up event handlers
    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('pong', () => { ws.isAlive = true; });
    ws.on('close', () => this.handleDisconnection(ws));
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(ws);
    });
  }
  
  /**
   * Handle incoming WebSocket message
   */
  private async handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'auth':
          await this.handleAuth(ws, message.data);
          break;
          
        case 'message':
          await this.handleChatMessage(ws, message.data);
          break;
          
        case 'typing':
          await this.handleTypingIndicator(ws, message.data);
          break;
          
        case 'presence':
          await this.handlePresenceUpdate(ws, message.data);
          break;
          
        case 'heartbeat':
          ws.isAlive = true;
          this.sendToClient(ws, { type: 'heartbeat', data: { status: 'alive' } });
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Invalid message format' }
      });
    }
  }
  
  /**
   * Handle authentication
   */
  private async handleAuth(ws: AuthenticatedWebSocket, data: any) {
    const { userId } = data;
    
    if (!userId) {
      this.sendToClient(ws, {
        type: 'auth',
        data: { success: false, message: 'User ID required' }
      });
      return;
    }
    
    ws.userId = userId;
    
    // Track user socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(ws.socketId!);
    
    // Store connection in database
    try {
      await db.insert(wsConnections).values({
        userId,
        socketId: ws.socketId!,
        status: 'active',
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        connectedAt: new Date()
      });
    } catch (error) {
      console.error('Error storing connection:', error);
    }
    
    this.sendToClient(ws, {
      type: 'auth',
      data: { success: true, userId }
    });
    
    // Send any pending notifications
    await this.sendPendingNotifications(userId);
  }
  
  /**
   * Handle chat message
   */
  private async handleChatMessage(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) {
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Not authenticated' }
      });
      return;
    }
    
    const { recipientId, content, metadata } = data;
    
    try {
      // Save message to database
      const [message] = await db.insert(messages).values({
        fromUserId: ws.userId,
        toUserId: recipientId,
        conversationId: `${ws.userId}-${recipientId}`,
        content,
        metadata,
        createdAt: new Date()
      }).returning();
      
      // Send to recipient if online
      this.sendToUser(recipientId, {
        type: 'message',
        data: {
          id: message.id,
          senderId: ws.userId,
          content,
          metadata,
          timestamp: message.createdAt
        }
      });
      
      // Send delivery confirmation to sender
      this.sendToClient(ws, {
        type: 'message_status',
        data: {
          messageId: message.id,
          status: 'delivered'
        }
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      this.sendToClient(ws, {
        type: 'error',
        data: { message: 'Failed to send message' }
      });
    }
  }
  
  /**
   * Handle typing indicator
   */
  private async handleTypingIndicator(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) return;
    
    const { recipientId, isTyping } = data;
    
    this.sendToUser(recipientId, {
      type: 'typing',
      data: {
        userId: ws.userId,
        isTyping
      }
    });
  }
  
  /**
   * Handle presence update
   */
  private async handlePresenceUpdate(ws: AuthenticatedWebSocket, data: any) {
    if (!ws.userId) return;
    
    const { status, lastSeen } = data;
    
    // Broadcast presence to connected users
    this.broadcast({
      type: 'presence',
      data: {
        userId: ws.userId,
        status,
        lastSeen
      }
    }, ws.userId);
  }
  
  /**
   * Handle disconnection
   */
  private async handleDisconnection(ws: AuthenticatedWebSocket) {
    if (!ws.socketId) return;
    
    // Remove from clients map
    this.clients.delete(ws.socketId);
    
    // Remove from user sockets
    if (ws.userId) {
      const userSockets = this.userSockets.get(ws.userId);
      if (userSockets) {
        userSockets.delete(ws.socketId);
        if (userSockets.size === 0) {
          this.userSockets.delete(ws.userId);
        }
      }
      
      // Update database
      try {
        await db.update(wsConnections)
          .set({
            status: 'disconnected',
            disconnectedAt: new Date()
          })
          .where(eq(wsConnections.socketId, ws.socketId));
      } catch (error) {
        console.error('Error updating connection status:', error);
      }
      
      // Notify other users of disconnection
      this.broadcast({
        type: 'presence',
        data: {
          userId: ws.userId,
          status: 'offline',
          lastSeen: new Date()
        }
      }, ws.userId);
    }
  }
  
  /**
   * Send pending notifications
   */
  private async sendPendingNotifications(userId: number) {
    try {
      const pendingNotifications = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId.toString()),
          eq(notifications.isRead, false)
        ));
      
      for (const notification of pendingNotifications) {
        this.sendToUser(userId, {
          type: 'notification',
          data: notification
        });
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }
  
  /**
   * Send message to specific client
   */
  private sendToClient(ws: AuthenticatedWebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  
  /**
   * Send message to specific user (all their connections)
   */
  public sendToUser(userId: number, message: any) {
    const userSockets = this.userSockets.get(userId);
    if (!userSockets) return;
    
    for (const socketId of userSockets) {
      const client = this.clients.get(socketId);
      if (client) {
        this.sendToClient(client, message);
      }
    }
  }
  
  /**
   * Broadcast message to all connected users except sender
   */
  public broadcast(message: any, excludeUserId?: number) {
    this.clients.forEach((client) => {
      if (client.userId !== excludeUserId) {
        this.sendToClient(client, message);
      }
    });
  }
  
  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          ws.terminate();
          return;
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }
  
  /**
   * Stop WebSocket service
   */
  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.wss) {
      this.wss.close();
    }
    
    this.clients.clear();
    this.userSockets.clear();
  }
}

export const websocketService = new WebSocketService();