import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface DashboardClient {
  userId: number;
  ws: WebSocket;
  lastActivity: Date;
}

class DashboardWebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, DashboardClient> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/dashboard'
    });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    // Ping clients every 30 seconds to keep connections alive
    this.pingInterval = setInterval(() => {
      this.pingClients();
    }, 30000);

    console.log('✅ Dashboard WebSocket service initialized on /ws/dashboard');
  }

  private async handleConnection(ws: WebSocket, req: IncomingMessage) {
    try {
      // Extract user ID from URL path or query parameters
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const pathMatch = url.pathname.match(/\/ws\/dashboard\/(\d+)/);
      const userId = pathMatch ? parseInt(pathMatch[1]) : null;

      if (!userId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid user ID' }));
        ws.close();
        return;
      }

      // Store client connection
      const clientId = `user-${userId}-${Date.now()}`;
      this.clients.set(clientId, {
        userId,
        ws,
        lastActivity: new Date()
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Dashboard WebSocket connected',
        userId,
        timestamp: new Date()
      }));

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      // Handle pong responses for keepalive
      ws.on('pong', () => {
        const client = this.clients.get(clientId);
        if (client) {
          client.lastActivity = new Date();
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`Dashboard WebSocket disconnected: ${clientId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`Dashboard WebSocket error for ${clientId}:`, error);
        this.clients.delete(clientId);
      });

    } catch (error) {
      console.error('Error handling Dashboard WebSocket connection:', error);
      ws.close();
    }
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date();

    switch (message.type) {
      case 'ping':
        client.ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
        break;
        
      case 'subscribe':
        // Handle subscription to specific data streams
        console.log(`Client ${clientId} subscribing to:`, message.channels);
        break;
        
      case 'activity':
        // Broadcast activity to other dashboard instances for the same user
        this.broadcastToUser(client.userId, {
          type: 'activity_update',
          activity: message.activity,
          timestamp: new Date()
        }, clientId);
        break;
        
      default:
        console.log(`Unknown message type from ${clientId}:`, message.type);
    }
  }

  private pingClients() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds timeout

    this.clients.forEach((client, clientId) => {
      if (now - client.lastActivity.getTime() > timeout) {
        // Connection is stale, close it
        client.ws.close();
        this.clients.delete(clientId);
      } else {
        // Send ping to check if client is alive
        client.ws.ping();
      }
    });
  }

  // Send update to specific user's dashboard(s)
  public sendToUser(userId: number, data: any) {
    this.clients.forEach(client => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify({
          ...data,
          timestamp: new Date()
        }));
      }
    });
  }

  // Broadcast to all instances of a user's dashboard except the sender
  private broadcastToUser(userId: number, data: any, excludeClientId?: string) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && 
          clientId !== excludeClientId && 
          client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }

  // Send dashboard update notification
  public notifyDashboardUpdate(userId: number, updateType: string, data?: any) {
    this.sendToUser(userId, {
      type: 'dashboard_update',
      updateType,
      data,
      timestamp: new Date()
    });
  }

  // Send real-time activity notification
  public notifyActivity(userId: number, activity: any) {
    this.sendToUser(userId, {
      type: 'activity',
      activity,
      timestamp: new Date()
    });
  }

  // Send recommendation update
  public notifyRecommendations(userId: number, recommendations: any[]) {
    this.sendToUser(userId, {
      type: 'recommendations_update',
      recommendations,
      timestamp: new Date()
    });
  }

  // Get connection status for a user
  public isUserConnected(userId: number): boolean {
    return Array.from(this.clients.values()).some(
      client => client.userId === userId && client.ws.readyState === WebSocket.OPEN
    );
  }

  // Get all connected users
  public getConnectedUsers(): number[] {
    const users = new Set<number>();
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        users.add(client.userId);
      }
    });
    return Array.from(users);
  }

  // Cleanup on shutdown
  public shutdown() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.clients.forEach(client => {
      client.ws.close();
    });
    
    this.clients.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Export singleton instance
export const dashboardWebSocketService = new DashboardWebSocketService();