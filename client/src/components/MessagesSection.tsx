import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Conversation {
  id: number;
  type: string;
  subject: string;
  lastMessageAt: string;
  metadata: any;
  participants: Array<{
    id: number;
    userId: number;
    vendorId: number;
    role: string;
    lastReadAt: string | null;
  }>;
  lastMessage?: {
    content: string;
    senderName: string;
  };
  unreadCount?: number;
  communityName?: string;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: 'user' | 'vendor';
  content: string;
  metadata: any;
  createdAt: string;
  senderName?: string;
}

export function MessagesSection() {
  const { user } = useAuth() as { user: any };
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Connect to WebSocket for real-time messaging
  useEffect(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connected for messaging");
      setConnectionStatus('connected');
      // Authenticate the WebSocket connection
      ws.send(JSON.stringify({
        type: 'auth',
        data: { userId: user.id }
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'message':
            // Refresh messages and conversations when new message received
            queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation?.id] });
            queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
            
            // Show toast notification for new message
            if (message.data?.fromUserId !== user.id) {
              toast({
                title: "New message",
                description: message.data?.content?.substring(0, 50) + "...",
              });
            }
            break;
            
          case 'typing':
            // Handle typing indicator if needed
            break;
            
          case 'connection':
            console.log('WebSocket connection established:', message.data);
            break;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus('disconnected');
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setConnectionStatus('disconnected');
    };
    
    setSocket(ws);
    
    return () => {
      ws.close();
    };
  }, [user?.id, selectedConversation?.id, toast]);

  // Fetch conversations
  const { data: conversationsResponse, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/messages/conversations', user?.id],
    queryFn: () => apiRequest('GET', `/api/messages/conversations?userId=${user?.id}`),
    enabled: !!user?.id,
  });
  const conversations = Array.isArray(conversationsResponse) ? conversationsResponse : [];

  // Fetch messages for selected conversation
  const { data: messagesResponse, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', selectedConversation?.id],
    queryFn: () => apiRequest('GET', `/api/messages/messages/${selectedConversation?.id}`),
    enabled: !!selectedConversation?.id,
  });
  const messages = Array.isArray(messagesResponse) ? messagesResponse : [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation || !user?.id) return;
      
      return apiRequest('POST', '/api/messages/messages', {
        conversationId: selectedConversation.id,
        senderId: user.id,
        senderType: 'user',
        content,
        metadata: {}
      });
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mark conversation as read
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      if (!user?.id) return;
      
      const participant = conversations.find((c: Conversation) => c.id === conversationId)?.participants
        .find((p: any) => p.userId === user.id);
        
      if (!participant) return;
      
      return apiRequest('PATCH', `/api/messages/participants/${participant.id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread-count'] });
    }
  });

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation?.id) {
      markAsReadMutation.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.communityName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessageMutation.mutate(messageInput.trim());
    }
  };

  return (
    <Card className="shadow-xl rounded-3xl overflow-hidden border-0 bg-white dark:bg-gray-800 h-[700px]">
      <CardHeader className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6" />
            <span>Messages</span>
          </div>
          <Badge className="bg-white/20 text-white text-lg px-3 py-1">
            {conversations.length} conversations
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-88px)]">
        <div className="h-full flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r dark:border-gray-700 h-full flex flex-col">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search conversations..." 
                  className="pl-10 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="px-4 pb-4 space-y-2">
                {conversationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation: Conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {conversation.communityName?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {conversation.communityName || conversation.subject}
                          </h4>
                          {conversation.lastMessage && (
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                          {conversation.lastMessageAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {format(new Date(conversation.lastMessageAt), 'MMM d, h:mm a')}
                            </p>
                          )}
                        </div>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start a conversation with a community!</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Message Thread */}
          <div className="flex-1 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="border-b dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-lg">
                    {selectedConversation.communityName || selectedConversation.subject}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.type === 'community_inquiry' 
                      ? 'Community Inquiry' 
                      : 'Direct Message'}
                  </p>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((message: Message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.senderId === user?.id ? 'justify-end' : ''
                          }`}
                        >
                          {message.senderId !== user?.id && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {message.senderName?.charAt(0) || 'C'}
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 max-w-[70%] ${
                              message.senderId === user?.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id
                                ? 'text-blue-100'
                                : 'text-gray-400'
                            }`}>
                              {format(new Date(message.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Type a message..." 
                      className="flex-1 rounded-xl"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button 
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6"
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    >
                      {sendMessageMutation.isPending ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}