import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";
import { Send, ArrowLeft, MessageSquare, User, Building2 } from "lucide-react";
import { Link } from "wouter";
import type { ChatConversation, ChatMessage } from "@shared/schema";

interface ConversationWithExtras extends ChatConversation {
  unreadCount: number;
  lastMessage?: ChatMessage;
}

export function Messaging() {
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithExtras | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const queryClient = useQueryClient();

  // Get user info
  const { data: user } = useQuery<{ id: string; email: string; name?: string }>({
    queryKey: ["/api/auth/user"],
  });

  // Get conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationWithExtras[]>({
    queryKey: ["/api/messaging/conversations"],
    enabled: !!user,
  });

  // Get messages for selected conversation
  const { data: messages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/messaging/conversations/${selectedConversation?.id}/messages`],
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const response = await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      setMessageContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/messaging/conversations/${selectedConversation?.id}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messaging/conversations"] });
    },
  });

  // Get unread count
  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ["/api/messaging/unread-count"],
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const handleSendMessage = () => {
    if (!selectedConversation || !messageContent.trim()) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageContent.trim(),
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view messages</h2>
            <p className="text-muted-foreground mb-4">Access your conversations with communities and other users</p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Messages</h1>
        {unreadData?.unreadCount > 0 && (
          <Badge variant="destructive">{unreadData.unreadCount} unread</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {conversationsLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
              ) : conversations?.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start a conversation by messaging a community</p>
                </div>
              ) : (
                conversations?.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 hover:bg-muted cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id ? "bg-muted" : ""
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {conversation.type === "community" ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">
                            {conversation.subject || "Conversation"}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {conversation.lastMessage.createdAt && formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader>
                <CardTitle>{selectedConversation.subject || "Conversation"}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px] p-4">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground">Loading messages...</div>
                  ) : messages?.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Start the conversation by sending a message</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages?.map((message) => {
                        const isCurrentUser = message.senderId === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {message.createdAt && format(new Date(message.createdAt), "MMM d, h:mm a")}
                                {message.editedAt && " (edited)"}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
                <Separator />
                <div className="p-4">
                  <div className="flex gap-2">
                    <Textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      className="min-h-[60px] max-h-[200px]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <p>Select a conversation to view messages</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}