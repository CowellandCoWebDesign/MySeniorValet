import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Send, 
  Users, 
  Building2, 
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

interface Message {
  id: string;
  content: string;
  fromUserId: string;
  toUserId: string;
  conversationId?: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    name: string;
    avatar?: string;
    role?: string;
  };
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    isOnline?: boolean;
  }>;
  lastMessage?: Message;
  unreadCount: number;
  type: 'family' | 'community' | 'support';
  communityName?: string;
  createdAt: string;
}

interface RealTimeChatProps {
  userId: string;
  userRole?: string;
  communityId?: number;
  className?: string;
}

export function RealTimeChat({ userId, userRole, communityId, className }: RealTimeChatProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus('connected');
      // Authenticate the WebSocket connection
      ws.send(JSON.stringify({
        type: 'auth',
        userId,
        userRole
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'message':
          // Add new message to the conversation
          queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
          
          // Show notification for new message
          if (data.fromUserId !== userId) {
            toast({
              title: "New message",
              description: `${data.senderName}: ${data.content.substring(0, 50)}...`,
            });
          }
          break;
          
        case 'typing':
          if (data.conversationId === selectedConversation?.id && data.userId !== userId) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 3000);
          }
          break;
          
        case 'read':
          // Update message read status
          queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
          break;
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus('disconnected');
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus('disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        setConnectionStatus('connecting');
      }, 3000);
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [userId, userRole, selectedConversation?.id, queryClient, toast]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations', userId],
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/messages?conversationId=${selectedConversation.id}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          fromUserId: userId,
          toUserId: selectedConversation?.participants.find(p => p.id !== userId)?.id,
          conversationId: selectedConversation?.id,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Send via WebSocket for real-time update
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'message',
          content: messageInput,
          conversationId: selectedConversation?.id,
          fromUserId: userId,
        }));
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      await fetch(`/api/messages/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId }),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Notify via WebSocket
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'read',
          conversationId,
          userId,
        }));
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, [socket, userId, queryClient]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN && selectedConversation) {
      socket.send(JSON.stringify({
        type: 'typing',
        conversationId: selectedConversation.id,
        userId,
      }));
    }
  }, [socket, selectedConversation, userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation?.id) {
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation?.id, markAsRead]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const participantNames = conv.participants.map(p => p.name.toLowerCase()).join(' ');
    const communityName = conv.communityName?.toLowerCase() || '';
    return participantNames.includes(searchQuery.toLowerCase()) || 
           communityName.includes(searchQuery.toLowerCase());
  });

  return (
    <Card className={`flex h-[600px] ${className}`}>
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Messages</h3>
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
              {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
            </Badge>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        
        <ScrollArea className="h-[calc(100%-120px)]">
          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {conversation.type === 'community' ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate">
                        {conversation.type === 'community' ? conversation.communityName : 
                         conversation.participants.map(p => p.name).join(', ')}
                      </p>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {conversation.type === 'family' ? 'Family' : 
                         conversation.type === 'community' ? 'Community' : 'Support'}
                      </Badge>
                      {conversation.unreadCount > 0 && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {selectedConversation.type === 'community' ? <Building2 className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <p className="font-semibold">
                      {selectedConversation.type === 'community' ? selectedConversation.communityName : 
                       selectedConversation.participants.map(p => p.name).join(', ')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {selectedConversation.participants[0]?.isOnline ? (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Active now
                        </span>
                      ) : (
                        <span>Offline</span>
                      )}
                      {isTyping && (
                        <span className="text-blue-600 italic">typing...</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
              ) : (
                <div className="space-y-4">
                  {messages.map(message => {
                    const isOwnMessage = message.fromUserId === userId;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          {!isOwnMessage && message.sender && (
                            <p className="text-xs text-gray-500 mb-1 px-3">
                              {message.sender.name}
                            </p>
                          )}
                          
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwnMessage 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1 px-3">
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwnMessage && (
                              <span className="text-gray-500">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-blue-600" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (messageInput.trim()) {
                        sendMessageMutation.mutate(messageInput.trim());
                      }
                    }
                  }}
                  className="flex-1"
                />
                
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                
                <Button
                  onClick={() => {
                    if (messageInput.trim()) {
                      sendMessageMutation.mutate(messageInput.trim());
                    }
                  }}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              
              {connectionStatus === 'disconnected' && (
                <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>Connection lost. Messages will be sent when reconnected.</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}