import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Calendar, MessageCircle, Heart, MapPin, Clock, Star, DollarSign,
  Users, Send, Home, Plus, Edit, Trash2, CalendarCheck, FileText,
  BarChart3, Share2, Download, CheckCircle, Target, Shield, TrendingUp,
  Lightbulb, UserPlus, Vote, MessageSquare, CheckSquare, AlertCircle,
  ThumbsUp, ThumbsDown, ChevronRight, Eye, EyeOff
} from 'lucide-react';

interface FamilyGroup {
  id: number;
  name: string;
  createdBy: number;
  inviteCode: string;
  settings: any;
  members?: FamilyMember[];
}

interface FamilyMember {
  id: number;
  userId: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface FamilyPoll {
  id: number;
  title: string;
  description: string;
  options: any;
  createdBy: number;
  createdAt: string;
  expiresAt?: string;
  status: 'active' | 'closed';
  votes?: number;
  hasVoted?: boolean;
}

interface FamilyMessage {
  id: number;
  senderId: number;
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: any[];
}

interface SharedFavorite {
  id: number;
  communityId: number;
  communityName: string;
  location: string;
  price: string;
  rating: number;
  notes?: string;
  addedBy: string;
  addedAt: string;
}

export default function FamilyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  
  // Poll creation state
  const [pollTitle, setPollTitle] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollAnonymous, setPollAnonymous] = useState(false);

  // Fetch family groups
  const { data: familyGroups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['/api/family/groups'],
    enabled: isAuthenticated
  });

  // Set default selected group
  useEffect(() => {
    if (familyGroups.length > 0 && !selectedGroup) {
      setSelectedGroup(familyGroups[0].id);
    }
  }, [familyGroups, selectedGroup]);

  // Fetch polls for selected group
  const { data: polls = [] } = useQuery({
    queryKey: [`/api/family/groups/${selectedGroup}/polls`],
    enabled: !!selectedGroup
  });

  // Fetch messages for selected group
  const { data: messages = [] } = useQuery({
    queryKey: [`/api/family/groups/${selectedGroup}/messages`],
    enabled: !!selectedGroup,
    refetchInterval: 5000 // Poll for new messages every 5 seconds
  });

  // Fetch shared favorites
  const { data: favorites = [] } = useQuery({
    queryKey: [`/api/family/groups/${selectedGroup}/favorites`],
    enabled: !!selectedGroup
  });

  // Fetch tour schedule
  const { data: tours = [] } = useQuery({
    queryKey: [`/api/family/groups/${selectedGroup}/tours`],
    enabled: !!selectedGroup
  });

  // Create family group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('/api/family/groups', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/groups'] });
      setShowCreateGroup(false);
      setNewGroupName('');
      toast({
        title: "Success!",
        description: "Family group created successfully."
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest(`/api/family/groups/${selectedGroup}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/family/groups/${selectedGroup}/messages`] });
      setNewMessage('');
    }
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (pollData: any) => {
      return apiRequest(`/api/family/groups/${selectedGroup}/polls`, {
        method: 'POST',
        body: JSON.stringify(pollData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/family/groups/${selectedGroup}/polls`] });
      setShowCreatePoll(false);
      setPollTitle('');
      setPollDescription('');
      setPollOptions(['', '']);
      toast({
        title: "Poll Created!",
        description: "Your family poll has been created successfully."
      });
    }
  });

  // Vote on poll mutation
  const votePollMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: number, optionId: string }) => {
      return apiRequest(`/api/family/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionIds: [optionId] })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/family/groups/${selectedGroup}/polls`] });
      toast({
        title: "Vote Submitted!",
        description: "Your vote has been recorded."
      });
    }
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest(`/api/family/groups/${selectedGroup}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    onSuccess: () => {
      setShowInviteDialog(false);
      setInviteEmail('');
      toast({
        title: "Invitation Sent!",
        description: "An invitation has been sent to join your family group."
      });
    }
  });

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createGroupMutation.mutate(newGroupName);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedGroup) {
      sendMessageMutation.mutate(newMessage);
    }
  };

  const handleCreatePoll = () => {
    if (pollTitle.trim() && pollOptions.filter(o => o.trim()).length >= 2) {
      createPollMutation.mutate({
        familyGroupId: selectedGroup,
        title: pollTitle,
        description: pollDescription,
        options: pollOptions.filter(o => o.trim()).map((opt, idx) => ({
          id: String(idx),
          text: opt
        })),
        anonymousVoting: pollAnonymous,
        showResultsRealtime: true
      });
    }
  };

  const handleVote = (pollId: number, optionId: string) => {
    votePollMutation.mutate({ pollId, optionId });
  };

  const handleInviteMember = () => {
    if (inviteEmail.trim() && selectedGroup) {
      inviteMemberMutation.mutate(inviteEmail);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <NavigationHeader title="Family Collaboration" />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                Please sign in to access your family collaboration dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader title="Family Collaboration Dashboard" />
      
      <div className="container mx-auto px-4 py-6">
        {/* Group Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Label>Family Group:</Label>
            {loadingGroups ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : familyGroups.length > 0 ? (
              <select
                value={selectedGroup || ''}
                onChange={(e) => setSelectedGroup(Number(e.target.value))}
                className="px-3 py-1 rounded-md border"
              >
                {familyGroups.map((group: FamilyGroup) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-sm text-muted-foreground">No groups yet</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Family Group</DialogTitle>
                  <DialogDescription>
                    Create a new family group to collaborate on senior living decisions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Group Name</Label>
                    <Input
                      placeholder="e.g., Smith Family"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGroup}>Create Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {selectedGroup && (
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Family Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your family group.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="family.member@email.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleInviteMember}>Send Invitation</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Main Content Tabs */}
        {selectedGroup ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="polls">Polls & Voting</TabsTrigger>
              <TabsTrigger value="tours">Tours</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Group Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Members</span>
                        <Badge>{familyGroups.find((g: FamilyGroup) => g.id === selectedGroup)?.members?.length || 1}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Polls</span>
                        <Badge>{polls.filter((p: FamilyPoll) => p.status === 'active').length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Scheduled Tours</span>
                        <Badge>{tours.length}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Saved Favorites</span>
                        <Badge>{favorites.length}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Recent Messages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {messages.slice(0, 3).map((msg: FamilyMessage) => (
                        <div key={msg.id} className="text-sm">
                          <span className="font-medium">{msg.senderName}:</span> {msg.message.substring(0, 50)}...
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="h-5 w-5" />
                      Active Decisions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {polls.filter((p: FamilyPoll) => p.status === 'active').slice(0, 3).map((poll: FamilyPoll) => (
                        <div key={poll.id} className="text-sm">
                          <p className="font-medium">{poll.title}</p>
                          {poll.hasVoted && <Badge variant="secondary" className="text-xs">Voted</Badge>}
                        </div>
                      ))}
                      {polls.filter((p: FamilyPoll) => p.status === 'active').length === 0 && (
                        <p className="text-sm text-muted-foreground">No active polls</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Family Discussion</CardTitle>
                  <CardDescription>
                    Private messaging for your family group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.map((msg: FamilyMessage) => (
                        <div key={msg.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{msg.senderName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
                      )}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Polls Tab */}
            <TabsContent value="polls" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Family Polls & Decisions</h3>
                <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-1" />
                      Create Poll
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Family Poll</DialogTitle>
                      <DialogDescription>
                        Create a poll to help your family make decisions together
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Poll Title</Label>
                        <Input
                          placeholder="e.g., Which community should we tour first?"
                          value={pollTitle}
                          onChange={(e) => setPollTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Description (Optional)</Label>
                        <Textarea
                          placeholder="Add more context about this decision..."
                          value={pollDescription}
                          onChange={(e) => setPollDescription(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {pollOptions.map((option, idx) => (
                            <Input
                              key={idx}
                              placeholder={`Option ${idx + 1}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...pollOptions];
                                newOptions[idx] = e.target.value;
                                setPollOptions(newOptions);
                              }}
                            />
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => setPollOptions([...pollOptions, ''])}
                        >
                          Add Option
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={pollAnonymous}
                          onChange={(e) => setPollAnonymous(e.target.checked)}
                        />
                        <Label htmlFor="anonymous">Anonymous voting</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreatePoll}>Create Poll</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {polls.map((poll: FamilyPoll) => (
                  <Card key={poll.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{poll.title}</CardTitle>
                          {poll.description && (
                            <CardDescription className="mt-1">
                              {poll.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                          {poll.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {poll.options?.map((option: any) => (
                          <div key={option.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant={poll.hasVoted ? 'ghost' : 'outline'}
                                size="sm"
                                disabled={poll.hasVoted || poll.status !== 'active'}
                                onClick={() => handleVote(poll.id, option.id)}
                              >
                                {poll.hasVoted ? <CheckSquare className="h-4 w-4" /> : <Vote className="h-4 w-4" />}
                              </Button>
                              <span className="text-sm">{option.text}</span>
                            </div>
                            {poll.votes && (
                              <span className="text-sm text-muted-foreground">
                                {option.votes || 0} votes
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {polls.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">No polls yet. Create one to start making decisions together!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tours Tab */}
            <TabsContent value="tours" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Tours</CardTitle>
                  <CardDescription>
                    Keep track of your family's community tours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tours.map((tour: any) => (
                      <div key={tour.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CalendarCheck className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{tour.communityName}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(tour.tourDate).toLocaleDateString()} at {tour.tourTime}
                            </p>
                          </div>
                        </div>
                        <Badge>{tour.status}</Badge>
                      </div>
                    ))}
                    
                    {tours.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No tours scheduled yet. Visit communities to schedule tours!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Shared Favorites</CardTitle>
                  <CardDescription>
                    Communities your family is considering
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {favorites.map((fav: SharedFavorite) => (
                      <div key={fav.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{fav.communityName}</p>
                            <p className="text-sm text-muted-foreground">
                              {fav.location} • {fav.price}
                            </p>
                            {fav.notes && (
                              <p className="text-sm mt-1">{fav.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{fav.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Added by {fav.addedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {favorites.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No favorites yet. Start exploring communities and save your favorites!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Welcome to Family Collaboration</CardTitle>
              <CardDescription>
                Create or join a family group to start collaborating on senior living decisions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Benefits of Family Collaboration:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Share research and discoveries
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Make decisions together
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Track tours and visits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Compare communities side-by-side
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <Button 
                    size="lg"
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Group
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}