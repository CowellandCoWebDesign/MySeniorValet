import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MessageSquare, 
  Building2, 
  User,
  Circle,
  Filter,
  Plus,
  Bell,
  BellOff
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: number;
  type: 'direct' | 'family_group' | 'community_broadcast';
  title: string;
  participants: Array<{
    userId: string;
    role: string;
    joinedAt: string;
    notifications: boolean;
  }>;
  communityId?: number;
  familyGroupId?: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  status: 'active' | 'archived' | 'muted';
  createdAt: string;
  updatedAt: string;
}

interface ConversationListProps {
  userId: string;
  onConversationSelect?: (conversationId: number, title: string, type: string) => void;
  selectedConversationId?: number | null;
}

export function ConversationList({ 
  userId, 
  onConversationSelect,
  selectedConversationId 
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'community' | 'family'>('all');

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['/api/conversations'],
    queryFn: () => apiRequest('GET', '/api/conversations').then(res => res.json()),
    refetchInterval: 10000, // Poll every 10 seconds for updates
  });

  // Filter conversations based on search and filter type
  const filteredConversations = conversations.filter((conv: Conversation) => {
    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'direct' && conv.type !== 'direct') return false;
      if (filterType === 'community' && conv.type !== 'community_broadcast') return false;
      if (filterType === 'family' && conv.type !== 'family_group') return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.title.toLowerCase().includes(query) ||
        conv.lastMessagePreview?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'community_broadcast':
        return <Building2 className="h-4 w-4" />;
      case 'family_group':
        return <User className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getConversationBadgeColor = (type: string) => {
    switch (type) {
      case 'community_broadcast':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'family_group':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleConversationClick = (conv: Conversation) => {
    if (onConversationSelect) {
      onConversationSelect(conv.id, conv.title, conv.type);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Conversations</h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={filterType === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilterType('all')}
            className="flex-1"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterType === 'community' ? 'default' : 'ghost'}
            onClick={() => setFilterType('community')}
            className="flex-1"
          >
            Communities
          </Button>
          <Button
            size="sm"
            variant={filterType === 'family' ? 'default' : 'ghost'}
            onClick={() => setFilterType('family')}
            className="flex-1"
          >
            Family
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a conversation with a community or family member
              </p>
            </div>
          ) : (
            filteredConversations.map((conv: Conversation) => (
              <Button
                key={conv.id}
                variant={selectedConversationId === conv.id ? 'secondary' : 'ghost'}
                className="w-full justify-start p-3 h-auto"
                onClick={() => handleConversationClick(conv)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {getConversationIcon(conv.type)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {conv.title}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConversationBadgeColor(conv.type)}`}
                        >
                          {conv.type === 'community_broadcast' ? 'Community' : 
                           conv.type === 'family_group' ? 'Family' : 'Direct'}
                        </Badge>
                      </div>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>

                    {conv.lastMessagePreview && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessagePreview}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <Badge className="h-5 px-2 bg-primary text-primary-foreground">
                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                          </Badge>
                        )}
                        {conv.status === 'muted' && (
                          <BellOff className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <Circle 
                        className={`h-2 w-2 ${
                          conv.status === 'active' ? 'fill-green-500 text-green-500' : 
                          'fill-gray-400 text-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}