import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  MessageCircle, 
  Send, 
  Phone,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3,
  Globe,
  Shield,
  Bot,
  Heart,
  Calendar,
  DollarSign,
  Image,
  Paperclip,
  Smile,
  Settings,
  QrCode,
  ChevronRight,
  Star,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppBusinessProps {
  communityId: string;
  tierLevel?: 'starter' | 'growth' | 'professional' | 'premium' | 'enterprise';
}

export function WhatsAppBusiness({ communityId, tierLevel = 'professional' }: WhatsAppBusinessProps) {
  const { toast } = useToast();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

  // Demo conversations
  const conversations = [
    {
      id: '1',
      name: 'Sarah Johnson',
      lastMessage: 'Is there availability for my mother?',
      time: '2 min ago',
      unread: 2,
      phone: '+1 555-0123',
      status: 'active',
      avatar: 'SJ'
    },
    {
      id: '2',
      name: 'Michael Chen',
      lastMessage: 'Thank you for the tour information',
      time: '1 hour ago',
      unread: 0,
      phone: '+1 555-0124',
      status: 'responded',
      avatar: 'MC'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      lastMessage: 'What are the monthly costs?',
      time: '3 hours ago',
      unread: 1,
      phone: '+1 555-0125',
      status: 'pending',
      avatar: 'ER'
    }
  ];

  // Message templates
  const messageTemplates = [
    {
      id: '1',
      name: 'Welcome Message',
      content: 'Hello! Thank you for your interest in our community. How can we help you today?',
      category: 'greeting'
    },
    {
      id: '2',
      name: 'Tour Scheduling',
      content: 'We\'d love to schedule a tour for you! Our available times are Mon-Fri 9AM-5PM and Sat 10AM-3PM. What works best for you?',
      category: 'scheduling'
    },
    {
      id: '3',
      name: 'Pricing Information',
      content: 'Our monthly rates start at $X,XXX and include meals, housekeeping, and activities. Would you like detailed pricing information?',
      category: 'pricing'
    }
  ];

  // Analytics data
  const analytics = {
    totalMessages: 1247,
    responseRate: 98,
    avgResponseTime: '5 min',
    satisfaction: 4.8,
    activeChats: 12,
    completedToday: 34
  };

  const sendMessage = () => {
    if (!messageText.trim()) return;

    toast({
      title: "Message Sent",
      description: "Your WhatsApp message has been delivered",
    });

    setMessageText('');
  };

  const sendBroadcast = () => {
    if (!broadcastMessage.trim()) return;

    toast({
      title: "Broadcast Sent",
      description: "Message sent to all opted-in contacts",
    });

    setBroadcastMessage('');
  };

  const useTemplate = (template: any) => {
    setMessageText(template.content);
    
    toast({
      title: "Template Applied",
      description: `Using ${template.name} template`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-green-500/20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">WhatsApp Business Messaging</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with families on their preferred messaging platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">
                <Phone className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                View QR Code
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.totalMessages}</p>
              <p className="text-xs text-muted-foreground">Total Messages</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{analytics.responseRate}%</p>
              <p className="text-xs text-muted-foreground">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{analytics.avgResponseTime}</p>
              <p className="text-xs text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{analytics.satisfaction}</p>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-rose-600">{analytics.activeChats}</p>
              <p className="text-xs text-muted-foreground">Active Chats</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{analytics.completedToday}</p>
              <p className="text-xs text-muted-foreground">Completed Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="conversations">
            <MessageCircle className="w-4 h-4 mr-2" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="broadcast">
            <Users className="w-4 h-4 mr-2" />
            Broadcast
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Bot className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Conversation List */}
            <Card className="md:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Active Chats</CardTitle>
                  <Badge>{conversations.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        activeConversation === conv.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setActiveConversation(conv.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{conv.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conv.name}</p>
                            <span className="text-xs text-muted-foreground">{conv.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                        </div>
                        {conv.unread > 0 && (
                          <Badge className="bg-green-500 text-white">{conv.unread}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Chat Window */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {activeConversation ? conversations.find(c => c.id === activeConversation)?.avatar : 'WA'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {activeConversation ? conversations.find(c => c.id === activeConversation)?.name : 'Select a conversation'}
                      </CardTitle>
                      {activeConversation && (
                        <p className="text-xs text-muted-foreground">
                          {conversations.find(c => c.id === activeConversation)?.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeConversation && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {activeConversation ? (
                  <>
                    <ScrollArea className="h-[300px] mb-4 p-4 border rounded-lg bg-muted/20">
                      <div className="space-y-4">
                        <div className="flex justify-start">
                          <div className="max-w-[70%] p-3 rounded-lg bg-white dark:bg-gray-800">
                            <p className="text-sm">Hello! I'm interested in learning more about your senior living community.</p>
                            <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="max-w-[70%] p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <p className="text-sm">Thank you for reaching out! We'd be happy to help. Are you looking for yourself or a loved one?</p>
                            <p className="text-xs text-muted-foreground mt-1">10:32 AM</p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[70%] p-3 rounded-lg bg-white dark:bg-gray-800">
                            <p className="text-sm">For my mother. Is there availability for memory care?</p>
                            <p className="text-xs text-muted-foreground mt-1">10:35 AM</p>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <div className="flex-1 flex gap-2">
                        <Button variant="outline" size="icon">
                          <Paperclip className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Image className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Smile className="w-4 h-4" />
                        </Button>
                        <Input 
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage();
                            }
                          }}
                        />
                        <Button onClick={sendMessage}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Broadcast Tab */}
        <TabsContent value="broadcast">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Message</CardTitle>
              <CardDescription>
                Send messages to multiple contacts at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Recipient Groups</Label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contacts (247)</SelectItem>
                        <SelectItem value="leads">Active Leads (89)</SelectItem>
                        <SelectItem value="tours">Scheduled Tours (12)</SelectItem>
                        <SelectItem value="residents">Current Residents (45)</SelectItem>
                        <SelectItem value="families">Family Members (156)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Message Type</Label>
                    <Select defaultValue="promotional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="informational">Informational</SelectItem>
                        <SelectItem value="transactional">Transactional</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Schedule</Label>
                    <Select defaultValue="now">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="now">Send Now</SelectItem>
                        <SelectItem value="later">Schedule for Later</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Message Content</Label>
                    <Textarea 
                      placeholder="Type your broadcast message..."
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {broadcastMessage.length}/1600 characters
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Add Media
                    </Button>
                    <Button variant="outline">
                      <Bot className="w-4 h-4 mr-2" />
                      Use Template
                    </Button>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={sendBroadcast}
                    disabled={!broadcastMessage.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Broadcast
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      WhatsApp Business Policy
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Only send messages to users who have opted in. Respect user preferences and follow WhatsApp's business messaging guidelines.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Message Templates</CardTitle>
                  <CardDescription>
                    Pre-approved templates for quick responses
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {messageTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{template.name}</h4>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.content}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => useTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {tierLevel === 'enterprise' && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-900 dark:text-purple-100">
                        Enterprise Feature: AI Templates
                      </p>
                      <p className="text-purple-700 dark:text-purple-300">
                        Your templates are automatically optimized by AI for better engagement rates
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Messaging Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Messages Sent Today</span>
                  <Badge className="bg-green-500 text-white">156</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Messages Received</span>
                  <Badge className="bg-blue-500 text-white">189</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Response Time</span>
                  <Badge variant="outline">5 min</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Read Rate</span>
                  <Badge variant="outline">94%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Click-through Rate</span>
                  <Badge variant="outline">67%</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-yellow-500">4.8/5.0</p>
                  <p className="text-sm text-muted-foreground mt-1">Based on 234 conversations</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Quick Response</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= 5 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Helpful Information</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Professional Service</span>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className={`w-4 h-4 ${i <= 5 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                Automation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-Reply</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond to common questions
                  </p>
                </div>
                <Switch checked={autoReplyEnabled} onCheckedChange={setAutoReplyEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Business Hours Response</p>
                  <p className="text-sm text-muted-foreground">
                    Different messages for after-hours inquiries
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Lead Qualification Bot</p>
                  <p className="text-sm text-muted-foreground">
                    AI-powered bot to qualify leads automatically
                  </p>
                </div>
                <Switch defaultChecked={tierLevel === 'enterprise'} disabled={tierLevel !== 'enterprise'} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Missing import
import { Plus } from 'lucide-react';