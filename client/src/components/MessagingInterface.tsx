import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  MessageSquare, 
  X, 
  Paperclip, 
  Search,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  senderType: "user" | "community";
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
  readAt?: string;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    profileImageUrl?: string;
    photos?: any[];
  };
}

interface Conversation {
  id: number;
  type: string;
  title: string;
  communityId?: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  participants: any[];
  community?: {
    id: number;
    name: string;
    city: string;
    state: string;
    photos?: any[];
  };
}

interface MessagingInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  communityId?: number;
  communityName?: string;
  userId?: string;
}

export function MessagingInterface({ 
  isOpen, 
  onClose, 
  communityId, 
  communityName,
  userId = "1"
}: MessagingInterfaceProps) {
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ["/api/messaging/conversations", userId],
    queryFn: async () => {
      const response = await fetch(`/api/messaging/conversations?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    enabled: isOpen
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["/api/messaging/conversations", selectedConversation?.id, "messages"],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await fetch(`/api/messaging/conversations/${selectedConversation.id}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!selectedConversation
  });

  // Create or get conversation with community
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/messaging/conversations/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          communityId,
          message: null
        })
      });
      if (!response.ok) throw new Error("Failed to create conversation");
      return response.json();
    },
    onSuccess: (conversation) => {
      setSelectedConversation(conversation);
      queryClient.invalidateQueries({ queryKey: ["/api/messaging/conversations"] });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      
      const response = await fetch(`/api/messaging/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: userId,
          senderType: "user",
          content,
          messageType: "text"
        })
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessageContent("");
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ["/api/messaging/conversations"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize conversation with community if provided
  useEffect(() => {
    if (isOpen && communityId && !selectedConversation) {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv: Conversation) => conv.communityId === communityId
      );
      
      if (existingConversation) {
        setSelectedConversation(existingConversation);
      } else {
        createConversationMutation.mutate();
      }
    }
  }, [isOpen, communityId, conversations, selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen && userId) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/messaging`;
      
      try {
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          // Authenticate
          wsRef.current?.send(JSON.stringify({
            type: "auth",
            payload: { userId }
          }));
        };

        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === "message" && data.payload.conversationId === selectedConversation?.id) {
            refetchMessages();
          }
          
          if (data.type === "typing") {
            setIsTyping(data.payload.isTyping);
            setTimeout(() => setIsTyping(false), 3000);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
      } catch (error) {
        console.error("Failed to establish WebSocket connection:", error);
      }
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isOpen, userId, selectedConversation]);

  const handleSendMessage = () => {
    if (messageContent.trim() && selectedConversation) {
      sendMessageMutation.mutate(messageContent.trim());
    }
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    
    if (isToday(messageDate)) {
      return format(messageDate, "h:mm a");
    } else if (isYesterday(messageDate)) {
      return "Yesterday " + format(messageDate, "h:mm a");
    } else {
      return format(messageDate, "MMM d, h:mm a");
    }
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.community?.photos?.[0]) {
      return conversation.community.photos[0].image_url || conversation.community.photos[0];
    }
    return null;
  };

  const getConversationInitials = (conversation: Conversation) => {
    if (conversation.community?.name) {
      return conversation.community.name.substring(0, 2).toUpperCase();
    }
    return "CM";
  };

  const filteredConversations = conversations.filter((conv: Conversation) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return conv.title?.toLowerCase().includes(searchLower) ||
           conv.community?.name?.toLowerCase().includes(searchLower) ||
           conv.lastMessagePreview?.toLowerCase().includes(searchLower);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] p-0">
        <div className="flex h-full">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-lg mb-3">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              {loadingConversations ? (
                <div className="p-4 text-center text-gray-500">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </div>
              ) : (
                <div>
                  {filteredConversations.map((conversation: Conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left ${
                        selectedConversation?.id === conversation.id ? "bg-gray-100 dark:bg-gray-800" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={getConversationAvatar(conversation)} />
                          <AvatarFallback>{getConversationInitials(conversation)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">{conversation.title}</h3>
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-gray-500">
                                {formatMessageTime(conversation.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessagePreview && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {conversation.lastMessagePreview}
                            </p>
                          )}
                          {conversation.community && (
                            <p className="text-xs text-gray-500 mt-1">
                              {conversation.community.city}, {conversation.community.state}
                            </p>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getConversationAvatar(selectedConversation)} />
                      <AvatarFallback>{getConversationInitials(selectedConversation)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.title}</h3>
                      {selectedConversation.community && (
                        <p className="text-sm text-gray-500">
                          {selectedConversation.community.city}, {selectedConversation.community.state}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Archive Conversation</DropdownMenuItem>
                        <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Delete Conversation</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {loadingMessages ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.slice().reverse().map((message: Message) => {
                        const isOwnMessage = message.senderId === userId;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                              {!isOwnMessage && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={message.sender?.profileImageUrl || message.sender?.photos?.[0]?.image_url} />
                                  <AvatarFallback>
                                    {message.sender?.name?.substring(0, 2).toUpperCase() || "CM"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                {!isOwnMessage && message.sender?.name && (
                                  <p className="text-xs text-gray-500 mb-1">{message.sender.name}</p>
                                )}
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    isOwnMessage
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {formatMessageTime(message.createdAt)}
                                  </span>
                                  {isOwnMessage && (
                                    message.readAt ? (
                                      <CheckCheck className="w-3 h-3 text-blue-500" />
                                    ) : (
                                      <Check className="w-3 h-3 text-gray-400" />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {isTyping && (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>CM</AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Textarea
                      placeholder="Type a message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                      rows={1}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Select a conversation to start messaging</p>
                  <p className="text-sm mt-2">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}