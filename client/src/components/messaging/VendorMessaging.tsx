import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Filter,
  User,
  Building,
  AlertCircle,
  Check,
  Clock,
  X,
  Plus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { NewConversationDialog } from './NewConversationDialog';

interface Message {
  id: number;
  conversationId: number;
  senderType: 'user' | 'vendor' | 'admin' | 'system';
  content: string;
  createdAt: string;
  senderUser?: any;
  senderVendor?: any;
}

interface Conversation {
  id: number;
  type: 'vendor_support' | 'customer_vendor' | 'admin_support';
  subject: string;
  status: 'active' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessageAt: string;
  participants: any[];
  metadata?: any;
}

export function VendorMessaging({ vendorId }: { vendorId: number }) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/messaging/conversations', vendorId],
    queryFn: () => apiRequest('GET', `/api/messaging/conversations?vendorId=${vendorId}`),
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery<any[]>({
    queryKey: ['/api/messaging/conversations', selectedConversation?.id, 'messages'],
    queryFn: () => apiRequest('GET', `/api/messaging/conversations/${selectedConversation?.id}/messages`),
    enabled: !!selectedConversation,
  });

  // Get unread count
  const { data: unreadData } = useQuery<{ unreadCount: number }>({
    queryKey: ['/api/messaging/unread-count', vendorId],
    queryFn: () => apiRequest('GET', `/api/messaging/unread-count?vendorId=${vendorId}`),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string }) => 
      apiRequest('POST', `/api/messaging/conversations/${selectedConversation?.id}/messages`, {
        senderVendorId: vendorId,
        senderType: 'vendor',
        content: data.content,
      }),
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations', selectedConversation?.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations', vendorId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: number) =>
      apiRequest('POST', `/api/messaging/conversations/${conversationId}/read`, {
        vendorId: vendorId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/unread-count', vendorId] });
    },
  });

  // Update conversation status
  const updateStatusMutation = useMutation({
    mutationFn: ({ conversationId, status }: { conversationId: number; status: string }) =>
      apiRequest('PATCH', `/api/messaging/conversations/${conversationId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations', vendorId] });
      toast({
        title: "Success",
        description: "Conversation status updated",
      });
    },
  });

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  // Filter conversations
  const filteredConversations = (conversations || []).filter((conv: Conversation) => {
    const matchesSearch = conv.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || conv.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'resolved': return <Check className="h-4 w-4" />;
      default: return <X className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Messages</span>
            <div className="flex items-center gap-2">
              {unreadData?.unreadCount > 0 && (
                <Badge variant="destructive">{unreadData.unreadCount} new</Badge>
              )}
              <Button
                size="sm"
                onClick={() => setShowNewConversation(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </CardTitle>
          <div className="space-y-2 mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conversations</SelectItem>
                <SelectItem value="customer_vendor">Customer Messages</SelectItem>
                <SelectItem value="vendor_support">Support Tickets</SelectItem>
                <SelectItem value="admin_support">Admin Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {loadingConversations ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No conversations found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation: Conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm line-clamp-1">{conversation.subject}</h4>
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(conversation.priority)} text-white border-0`}
                      >
                        {conversation.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {conversation.type === 'customer_vendor' && <User className="h-3 w-3" />}
                        {conversation.type === 'vendor_support' && <AlertCircle className="h-3 w-3" />}
                        {conversation.type === 'admin_support' && <Building className="h-3 w-3" />}
                        {conversation.type.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(conversation.status)}
                        {format(new Date(conversation.lastMessageAt), 'MMM d')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="md:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedConversation.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedConversation.type.replace('_', ' ')} • 
                    Started {format(new Date(selectedConversation.lastMessageAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConversation.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({
                        conversationId: selectedConversation.id,
                        status: 'resolved',
                      })}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedConversation.status === 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({
                        conversationId: selectedConversation.id,
                        status: 'active',
                      })}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px] p-4">
                {loadingMessages ? (
                  <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: any) => {
                      const isVendor = message.message.senderType === 'vendor';
                      return (
                        <div
                          key={message.message.id}
                          className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isVendor
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(message.message.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
              <div className="border-t p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (messageContent.trim()) {
                      sendMessageMutation.mutate({ content: messageContent });
                    }
                  }}
                  className="flex gap-2"
                >
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[60px] resize-none"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>Select a conversation to view messages</p>
            </div>
          </CardContent>
        )}
      </Card>
      
      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        vendorId={vendorId}
        role="vendor"
      />
    </div>
  );
}