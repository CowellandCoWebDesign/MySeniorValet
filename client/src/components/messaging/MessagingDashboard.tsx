import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Users, 
  Building2,
  Inbox,
  Bell
} from 'lucide-react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { FamilyGroupChat } from './FamilyGroupChat';

interface MessagingDashboardProps {
  userId: string;
}

export function MessagingDashboard({ userId }: MessagingDashboardProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [selectedConversationTitle, setSelectedConversationTitle] = useState<string>('');
  const [selectedConversationType, setSelectedConversationType] = useState<string>('');
  const [activeTab, setActiveTab] = useState('conversations');

  const handleConversationSelect = (
    conversationId: number, 
    title: string, 
    type: string
  ) => {
    setSelectedConversationId(conversationId);
    setSelectedConversationTitle(title);
    setSelectedConversationType(type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Messages & Family Connect</h1>
          <p className="text-muted-foreground mt-1">
            Communicate with communities and collaborate with family members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="py-1">
            <Bell className="h-3 w-3 mr-1" />
            Real-time messaging enabled
          </Badge>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="family" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            All Activity
          </TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="lg:col-span-1">
              <ConversationList 
                userId={userId}
                onConversationSelect={handleConversationSelect}
                selectedConversationId={selectedConversationId}
              />
            </div>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {selectedConversationId ? (
                <MessageThread
                  conversationId={selectedConversationId}
                  currentUserId={userId}
                  conversationTitle={selectedConversationTitle}
                  conversationType={selectedConversationType}
                />
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family" className="space-y-4">
          <FamilyGroupChat userId={userId} />
        </TabsContent>

        {/* All Activity Tab */}
        <TabsContent value="inbox" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Inbox className="h-5 w-5" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {/* Sample activity items - replace with real data */}
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New message from Sunrise Manor</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Family member joined your group</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tour confirmation from Oak Grove</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  All your messaging activity in one place
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}