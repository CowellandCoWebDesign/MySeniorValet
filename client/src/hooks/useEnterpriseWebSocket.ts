import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketMessage {
  type: string;
  action?: string;
  data?: any;
  timestamp: Date;
  communityId?: number;
}

interface SubscriptionOptions {
  channel: 'analytics' | 'financial' | 'compliance' | 'metrics';
  communityId?: number;
}

export function useEnterpriseWebSocket(options: WebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<Set<string>>(new Set());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Map<string, (message: WebSocketMessage) => void>>(new Map());
  
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    setIsConnecting(true);

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/enterprise-ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connected to Enterprise WebSocket');
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;

        // Re-subscribe to previous channels
        subscriptions.forEach(subscription => {
          const [channel, communityId] = subscription.split(':');
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel,
            communityId: communityId ? parseInt(communityId) : undefined
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Update state
          setLastMessage(message);
          setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
          
          // Call registered handlers
          const handlers = messageHandlersRef.current.get(message.type);
          if (handlers) {
            handlers(message);
          }
          
          // Handle connection status messages
          if (message.type === 'connection' && message.action === 'connected') {
            console.log('🔗 WebSocket connection confirmed');
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;

        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          toast({
            title: 'Connection Lost',
            description: 'Unable to reconnect to real-time updates. Please refresh the page.',
            variant: 'destructive'
          });
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
    }
  }, [isConnecting, reconnectInterval, maxReconnectAttempts, subscriptions, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const subscribe = useCallback((options: SubscriptionOptions) => {
    const { channel, communityId } = options;
    const subscriptionKey = communityId ? `${channel}:${communityId}` : channel;
    
    setSubscriptions(prev => new Set([...prev, subscriptionKey]));
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        channel,
        communityId
      }));
    }
  }, []);

  const unsubscribe = useCallback((options: SubscriptionOptions) => {
    const { channel, communityId } = options;
    const subscriptionKey = communityId ? `${channel}:${communityId}` : channel;
    
    setSubscriptions(prev => {
      const newSet = new Set(prev);
      newSet.delete(subscriptionKey);
      return newSet;
    });
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        channel,
        communityId
      }));
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const onMessage = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    messageHandlersRef.current.set(type, handler);
    
    // Return cleanup function
    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]); // Don't include connect/disconnect in deps to avoid loops

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    isConnecting,
    lastMessage,
    messages,
    subscriptions: Array.from(subscriptions),
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendMessage,
    onMessage,
    clearMessages
  };
}

// Hook for real-time analytics data
export function useRealtimeAnalytics(communityId?: number) {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const ws = useEnterpriseWebSocket();

  useEffect(() => {
    if (!ws.isConnected) return;

    // Subscribe to analytics channel
    ws.subscribe({ channel: 'analytics', communityId });

    // Handle analytics messages
    const cleanup = ws.onMessage('analytics', (message) => {
      if (message.action === 'snapshot' || message.action === 'update') {
        setAnalyticsData(message.data);
      }
    });

    return () => {
      ws.unsubscribe({ channel: 'analytics', communityId });
      cleanup();
    };
  }, [ws.isConnected, communityId]);

  return { analyticsData, isConnected: ws.isConnected };
}

// Hook for real-time financial data
export function useRealtimeFinancial(communityId?: number) {
  const [financialData, setFinancialData] = useState<any>(null);
  const ws = useEnterpriseWebSocket();

  useEffect(() => {
    if (!ws.isConnected) return;

    // Subscribe to financial channel
    ws.subscribe({ channel: 'financial', communityId });

    // Handle financial messages
    const cleanup = ws.onMessage('financial', (message) => {
      if (message.action === 'snapshot' || message.action === 'update') {
        setFinancialData(message.data);
      }
    });

    return () => {
      ws.unsubscribe({ channel: 'financial', communityId });
      cleanup();
    };
  }, [ws.isConnected, communityId]);

  return { financialData, isConnected: ws.isConnected };
}

// Hook for real-time compliance data
export function useRealtimeCompliance(communityId?: number) {
  const [complianceData, setComplianceData] = useState<any>(null);
  const ws = useEnterpriseWebSocket();

  useEffect(() => {
    if (!ws.isConnected) return;

    // Subscribe to compliance channel
    ws.subscribe({ channel: 'compliance', communityId });

    // Handle compliance messages
    const cleanup = ws.onMessage('compliance', (message) => {
      if (message.action === 'snapshot' || message.action === 'update') {
        setComplianceData(message.data);
      }
    });

    return () => {
      ws.unsubscribe({ channel: 'compliance', communityId });
      cleanup();
    };
  }, [ws.isConnected, communityId]);

  return { complianceData, isConnected: ws.isConnected };
}

// Hook for real-time metrics data
export function useRealtimeMetrics(communityId?: number) {
  const [metricsData, setMetricsData] = useState<any>(null);
  const ws = useEnterpriseWebSocket();

  useEffect(() => {
    if (!ws.isConnected) return;

    // Subscribe to metrics channel
    ws.subscribe({ channel: 'metrics', communityId });

    // Handle metrics messages
    const cleanup = ws.onMessage('metrics', (message) => {
      if (message.action === 'snapshot' || message.action === 'update') {
        setMetricsData(message.data);
      }
    });

    return () => {
      ws.unsubscribe({ channel: 'metrics', communityId });
      cleanup();
    };
  }, [ws.isConnected, communityId]);

  return { metricsData, isConnected: ws.isConnected };
}