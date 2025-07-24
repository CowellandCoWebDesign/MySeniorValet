import { Server } from 'http';

interface SimpleWebSocketCommunication {
  initialize(server: Server): void;
  getConnectedUsers(): any;
}

class SimpleWebSocketCommunication implements SimpleWebSocketCommunication {
  private initialized = false;
  private connectedUsers = 0;

  initialize(server: Server): void {
    if (this.initialized) return;
    
    console.log('✅ Simple WebSocket communication initialized (mock)');
    this.initialized = true;
    this.connectedUsers = 0;
  }

  getConnectedUsers() {
    return {
      total: this.connectedUsers,
      families: Math.floor(this.connectedUsers * 0.7),
      communities: Math.floor(this.connectedUsers * 0.3),
      active: this.connectedUsers
    };
  }

  // Mock methods for compatibility
  broadcastToFamily() { return true; }
  sendToUser() { return true; }
  notifyFamilyMembers() { return true; }
}

export const simpleWebSocket = new SimpleWebSocketCommunication();