import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardData {
  activeUsers: number;
  realtimeRevenue: number;
  apiCallsPerMinute: number;
  errorRate: number;
  newCommunities: number;
  activeSubscriptions: number;
  lastUpdate: Date;
}

export function useAdminWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [liveData, setLiveData] = useState<AdminDashboardData | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/admin-ws`;
      
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          console.log('✅ Admin WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'initial' || message.type === 'update') {
              setLiveData(message.data);
            }
            
            // Show important alerts
            if (message.type === 'alert') {
              toast({
                title: message.data.title || 'System Alert',
                description: message.data.description,
                variant: message.data.severity === 'high' ? 'destructive' : 'default',
              });
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          console.log('Admin WebSocket disconnected');
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        setIsConnected(false);
      }
    }

    // Initial connection
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [toast]);

  return {
    isConnected,
    liveData,
    // Method to send messages to server if needed
    sendMessage: (type: string, data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type, data }));
      }
    }
  };
}