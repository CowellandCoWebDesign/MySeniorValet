import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Archive, 
  Settings,
  Bell,
  Star,
  Users,
  Building2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { MessagingInterface } from "@/components/MessagingInterface";

export default function MessagingDashboard() {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<number | null>(null);
  const [selectedCommunityName, setSelectedCommunityName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "archived">("all");
  
  // Get current user ID (in real app, this would come from auth context)
  const userId = "1";
  
  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/messaging/conversations", userId],
    queryFn: async () => {
      const response = await fetch(`/api/messaging/conversations?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    }
  });
  
  // Calculate statistics
  const stats = {
    total: conversations.length,
    unread: conversations.filter((c: any) => c.unreadCount > 0).length,
    communities: new Set(conversations.map((c: any) => c.communityId)).size,
    lastWeek: conversations.filter((c: any) => {
      if (!c.lastMessageAt) return false;
      const lastMessage = new Date(c.lastMessageAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return lastMessage > weekAgo;
    }).length
  };
  
  // Filter conversations
  const filteredConversations = conversations.filter((conversation: any) => {
    // Apply filter
    if (filter === "unread" && conversation.unreadCount === 0) return false;
    if (filter === "starred" && !conversation.isStarred) return false;
    if (filter === "archived" && conversation.status !== "archived") return false;
    
    // Apply search
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        conversation.title?.toLowerCase().includes(search) ||
        conversation.community?.name?.toLowerCase().includes(search) ||
        conversation.lastMessagePreview?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });
  
  const openConversation = (communityId: number, communityName: string) => {
    setSelectedCommunityId(communityId);
    setSelectedCommunityName(communityName);
    setIsMessagingOpen(true);
  };
  
  const getConversationAvatar = (conversation: any) => {
    if (conversation.community?.photos?.[0]) {
      return conversation.community.photos[0].image_url || conversation.community.photos[0];
    }
    return null;
  };
  
  const getConversationInitials = (conversation: any) => {
    if (conversation.community?.name) {
      return conversation.community.name.substring(0, 2).toUpperCase();
    }
    return "CM";
  };
  
  const formatMessageTime = (date: string) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(messageDate, { addSuffix: true });
    }
    return format(messageDate, "MMM d, yyyy");
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-muted-foreground mt-2">
            Communicate directly with senior living communities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
              <Badge className="bg-red-500 text-white">New</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Communities</p>
                <p className="text-2xl font-bold">{stats.communities}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active This Week</p>
                <p className="text-2xl font-bold">{stats.lastWeek}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                onClick={() => setFilter("unread")}
                size="sm"
              >
                Unread
              </Button>
              <Button
                variant={filter === "starred" ? "default" : "outline"}
                onClick={() => setFilter("starred")}
                size="sm"
              >
                <Star className="h-4 w-4 mr-1" />
                Starred
              </Button>
              <Button
                variant={filter === "archived" ? "default" : "outline"}
                onClick={() => setFilter("archived")}
                size="sm"
              >
                <Archive className="h-4 w-4 mr-1" />
                Archived
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start a conversation with a community to get started
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConversations.map((conversation: any) => (
                  <button
                    key={conversation.id}
                    onClick={() => openConversation(conversation.communityId, conversation.community?.name || conversation.title)}
                    className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={getConversationAvatar(conversation)} />
                        <AvatarFallback>{getConversationInitials(conversation)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h3 className="font-semibold truncate">
                              {conversation.title}
                            </h3>
                            {conversation.community && (
                              <p className="text-xs text-muted-foreground">
                                {conversation.community.city}, {conversation.community.state}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(conversation.lastMessageAt)}
                              </span>
                            )}
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-green-500 text-white">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {conversation.lastMessagePreview && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessagePreview}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Messaging Interface Modal */}
      {isMessagingOpen && (
        <MessagingInterface
          isOpen={isMessagingOpen}
          onClose={() => {
            setIsMessagingOpen(false);
            setSelectedCommunityId(null);
            setSelectedCommunityName("");
          }}
          communityId={selectedCommunityId || undefined}
          communityName={selectedCommunityName}
          userId={userId}
        />
      )}
    </div>
  );
}