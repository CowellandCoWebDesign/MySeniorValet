import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare,
  Send,
  Paperclip,
  Image,
  Video,
  Mic,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Clock,
  CheckCheck,
  Check,
  AlertCircle,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreVertical,
  Users,
  User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FamilyCommunicationPortalProps {
  communityId: number;
}

export function FamilyCommunicationPortal({ communityId }: FamilyCommunicationPortalProps) {
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'normal'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: [`/api/resident-family/messages`, communityId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/resident-family/messages?communityId=${communityId}`);
      return response.json();
    },
    enabled: !!communityId
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest('POST', '/api/resident-family/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been delivered",
      });
      setNewMessage('');
      setComposeOpen(false);
      setComposeData({ recipient: '', subject: '', content: '', priority: 'normal' });
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/messages`] });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('PUT', `/api/resident-family/messages/${messageId}/read`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/resident-family/messages`] });
    }
  });

  // Group messages by thread
  const threads = messages.reduce((acc: any, message: any) => {
    const threadId = message.threadId || message.id;
    if (!acc[threadId]) {
      acc[threadId] = {
        threadId,
        messages: [],
        lastMessage: message,
        unread: 0,
        participants: new Set()
      };
    }
    acc[threadId].messages.push(message);
    if (message.status === 'sent') acc[threadId].unread++;
    acc[threadId].participants.add(message.senderId);
    acc[threadId].participants.add(message.recipientId);
    
    // Update last message if this is more recent
    if (new Date(message.createdAt) > new Date(acc[threadId].lastMessage.createdAt)) {
      acc[threadId].lastMessage = message;
    }
    
    return acc;
  }, {});

  const threadList = Object.values(threads);
  const unreadCount = messages.filter((m: any) => m.status === 'sent').length;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;
    
    sendMessageMutation.mutate({
      communityId,
      senderId: 'current-user', // Would come from auth context
      recipientId: selectedThread.lastMessage.senderId,
      content: newMessage,
      threadId: selectedThread.threadId,
      messageType: 'text'
    });
  };

  const handleComposeSubmit = () => {
    if (!composeData.content.trim()) return;
    
    sendMessageMutation.mutate({
      communityId,
      senderId: 'current-user',
      recipientId: composeData.recipient,
      subject: composeData.subject,
      content: composeData.content,
      priority: composeData.priority,
      messageType: 'text'
    });
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[calc(100vh-250px)] flex gap-4">
      {/* Message List */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{unreadCount} unread</Badge>
              <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Compose
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogDescription>
                      Send a message to a resident or family member
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">To</Label>
                      <Input
                        id="recipient"
                        placeholder="Select recipient..."
                        value={composeData.recipient}
                        onChange={(e) => setComposeData({ ...composeData, recipient: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="Message subject..."
                        value={composeData.subject}
                        onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Message</Label>
                      <Textarea
                        id="content"
                        placeholder="Type your message..."
                        className="min-h-[150px]"
                        value={composeData.content}
                        onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setComposeOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleComposeSubmit}>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100%-60px)]">
            <div className="px-4 space-y-2">
              {threadList.map((thread: any) => (
                <div
                  key={thread.threadId}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedThread?.threadId === thread.threadId
                      ? 'bg-primary/10'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setSelectedThread(thread);
                    if (thread.unread > 0) {
                      thread.messages.forEach((msg: any) => {
                        if (msg.status === 'sent') {
                          markAsReadMutation.mutate(msg.id);
                        }
                      });
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {thread.participants.size > 2 ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {thread.lastMessage.subject || 'No subject'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {thread.lastMessage.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {thread.unread > 0 && (
                          <Badge variant="default" className="h-5 px-1.5">
                            {thread.unread}
                          </Badge>
                        )}
                        {thread.lastMessage.priority === 'urgent' && (
                          <Badge variant="destructive" className="h-5 px-1.5">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                        {thread.lastMessage.attachments?.length > 0 && (
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <Card className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedThread.lastMessage.subject || 'Conversation'}
                  </CardTitle>
                  <CardDescription>
                    {selectedThread.participants.size} participants
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Star className="mr-2 h-4 w-4" />
                        Star Thread
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Thread
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="flex-1 p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedThread.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === 'current-user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderId === 'current-user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.attachments?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-xs opacity-80">
                                <Paperclip className="h-3 w-3" />
                                {attachment.filename}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs opacity-70">
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </span>
                          {getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a message thread to view the conversation</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}