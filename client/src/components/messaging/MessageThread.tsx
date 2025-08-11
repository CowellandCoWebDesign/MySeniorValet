import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  User, 
  Building2,
  Clock,
  Check,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  senderType: 'user' | 'community';
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    url: string;
    name: string;
    type: string;
    size: number;
  }>;
  readBy?: Array<{
    userId: string;
    readAt: string;
  }>;
  editedAt?: string;
  createdAt: string;
}

interface MessageThreadProps {
  conversationId: number;
  currentUserId: string;
  conversationTitle?: string;
  conversationType?: string;
}

export function MessageThread({ 
  conversationId, 
  currentUserId,
  conversationTitle,
  conversationType 
}: MessageThreadProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages', conversationId],
    queryFn: () => apiRequest('GET', `/api/messages/${conversationId}`).then(res => res.json()),
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', `/api/messages/${conversationId}`, {
        content,
        messageType: 'text',
      }).then(res => res.json());
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      // Scroll to bottom after sending
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: 'Please try again later',
        variant: 'destructive',
      });
      console.error('Send message error:', error);
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: number[]) => {
      return apiRequest('POST', `/api/messages/mark-read`, {
        messageIds,
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Mark messages as read when viewed
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessages = messages.filter((msg: Message) => 
        msg.senderType === 'community' && 
        !msg.readBy?.some(r => r.userId === currentUserId)
      );
      
      if (unreadMessages.length > 0) {
        markAsReadMutation.mutate(unreadMessages.map((msg: Message) => msg.id));
      }
    }
  }, [messages, currentUserId]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 168) { // 7 days
      return format(date, 'EEEE h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getMessageStatus = (msg: Message) => {
    if (msg.senderType === 'community') return null;
    if (msg.senderId !== currentUserId) return null;
    
    const isRead = msg.readBy && msg.readBy.length > 1; // More than just the sender
    
    if (isRead) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    } else {
      return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {conversationType === 'community_broadcast' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{conversationTitle || 'Conversation'}</h3>
            <p className="text-sm text-muted-foreground">
              {conversationType === 'community_broadcast' ? 'Community' : 'Direct Message'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg: Message) => {
              const isOwnMessage = msg.senderId === currentUserId;
              const isCommunityMessage = msg.senderType === 'community';
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-start gap-2">
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {isCommunityMessage ? (
                              <Building2 className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="space-y-1">
                        <div
                          className={`rounded-lg px-3 py-2 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {msg.messageType === 'system' ? (
                            <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span className="italic">{msg.content}</span>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}
                          
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {attachment.name}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs text-muted-foreground">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                          {msg.editedAt && (
                            <span className="text-xs text-muted-foreground italic">
                              (edited)
                            </span>
                          )}
                          {getMessageStatus(msg)}
                        </div>
                      </div>
                      
                      {isOwnMessage && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}