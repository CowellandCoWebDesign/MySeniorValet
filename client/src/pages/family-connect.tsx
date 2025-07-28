import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  MessageCircle, 
  FileText, 
  CheckSquare, 
  Plus, 
  Send,
  Copy,
  UserPlus,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface FamilyGroup {
  id: number;
  name: string;
  primaryUserId: number;
  inviteCode: string;
  createdAt: string;
  members?: FamilyMember[];
}

interface FamilyMember {
  id: number;
  groupId: number;
  userId: number;
  email: string;
  name: string;
  role: string;
  status: string;
  invitedAt: string;
  joinedAt: string | null;
}

interface FamilyMessage {
  id: number;
  message: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  attachments?: any[];
}

interface FamilyNote {
  id: number;
  title: string;
  content: string;
  tags: string[];
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

interface FamilyTask {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedTo?: number;
  dueDate?: string;
  createdAt: string;
}

export default function FamilyConnect() {
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [messageText, setMessageText] = useState('');
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's family groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery<FamilyGroup[]>({
    queryKey: ['/api/family-connect/groups'],
    enabled: true,
  });

  // Fetch selected group details with members
  const { data: groupDetails } = useQuery<FamilyGroup>({
    queryKey: ['/api/family-connect/groups', selectedGroup?.id],
    enabled: !!selectedGroup?.id,
  });

  // Fetch messages for selected group
  const { data: messages = [] } = useQuery<FamilyMessage[]>({
    queryKey: ['/api/family-connect/groups', selectedGroup?.id, 'messages'],
    enabled: !!selectedGroup?.id,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch notes for selected group
  const { data: notes = [] } = useQuery<FamilyNote[]>({
    queryKey: ['/api/family-connect/groups', selectedGroup?.id, 'notes'],
    enabled: !!selectedGroup?.id,
  });

  // Fetch tasks for selected group
  const { data: tasks = [] } = useQuery<FamilyTask[]>({
    queryKey: ['/api/family-connect/groups', selectedGroup?.id, 'tasks'],
    enabled: !!selectedGroup?.id,
  });

  // Create family group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('/api/family-connect/groups', 'POST', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-connect/groups'] });
      setShowCreateGroup(false);
      setNewGroupName('');
      toast({
        title: 'Family group created',
        description: 'Your new family group has been created successfully.',
      });
    },
  });

  // Join family group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      return apiRequest('/api/family-connect/join', 'POST', { inviteCode });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-connect/groups'] });
      setShowJoinGroup(false);
      setJoinCode('');
      toast({
        title: 'Joined family group',
        description: 'You have successfully joined the family group.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to join group',
        description: error.message || 'Invalid invite code or already a member.',
        variant: 'destructive',
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest(`/api/family-connect/groups/${selectedGroup?.id}/messages`, 'POST', { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/family-connect/groups', selectedGroup?.id, 'messages'] 
      });
      setMessageText('');
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, name }: { email: string; name: string }) => {
      return apiRequest(`/api/family-connect/groups/${selectedGroup?.id}/invite`, 'POST', { email, name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/family-connect/groups', selectedGroup?.id] 
      });
      setShowInviteMember(false);
      setInviteEmail('');
      setInviteName('');
      toast({
        title: 'Invitation sent',
        description: 'Family member has been invited to join the group.',
      });
    },
  });

  // Select first group by default
  useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroup) {
      setSelectedGroup(groups[0]);
    }
  }, [groups, selectedGroup]);

  const copyInviteCode = () => {
    if (selectedGroup?.inviteCode) {
      navigator.clipboard.writeText(selectedGroup.inviteCode);
      toast({
        title: 'Invite code copied',
        description: 'The invite code has been copied to your clipboard.',
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText);
    }
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail && inviteName) {
      inviteMemberMutation.mutate({ email: inviteEmail, name: inviteName });
    }
  };

  if (groupsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading family groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Family Connect
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay connected and coordinate senior care with your family
        </p>
      </div>

      {/* No groups state */}
      {(!groups || groups.length === 0) && (
        <Card className="text-center p-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No family groups yet</h3>
          <p className="text-gray-600 mb-4">Create or join a family group to get started</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setShowCreateGroup(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            <Button variant="outline" onClick={() => setShowJoinGroup(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Join Group
            </Button>
          </div>
        </Card>
      )}

      {/* Groups layout */}
      {groups && groups.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Family Groups</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowCreateGroup(true)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowJoinGroup(true)}>
                    <UserPlus className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {groups.map((group: FamilyGroup) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedGroup?.id === group.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-gray-500">
                        {groupDetails?.id === group.id && groupDetails?.members
                          ? `${groupDetails.members.filter((m) => m.status === 'active').length} members`
                          : 'Loading...'}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {selectedGroup && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <CardDescription>
                        Invite Code: {selectedGroup.inviteCode}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyInviteCode}
                          className="ml-2"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </CardDescription>
                    </div>
                    <Button onClick={() => setShowInviteMember(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="messages" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="messages">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Messages
                      </TabsTrigger>
                      <TabsTrigger value="notes">
                        <FileText className="w-4 h-4 mr-2" />
                        Notes
                      </TabsTrigger>
                      <TabsTrigger value="tasks">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Tasks
                      </TabsTrigger>
                      <TabsTrigger value="members">
                        <Users className="w-4 h-4 mr-2" />
                        Members
                      </TabsTrigger>
                    </TabsList>

                    {/* Messages Tab */}
                    <TabsContent value="messages" className="mt-4">
                      <div className="space-y-4">
                        <ScrollArea className="h-[400px] rounded-lg border p-4">
                          {messages && messages.length > 0 ? (
                            <div className="space-y-4">
                              {messages.map((message: FamilyMessage) => (
                                <div key={message.id} className="flex items-start gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>
                                      {message.senderName?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">
                                        {message.senderName}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {new Date(message.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="text-sm">{message.message}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>No messages yet. Start the conversation!</p>
                            </div>
                          )}
                        </ScrollArea>
                        
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <Input
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                          />
                          <Button type="submit" disabled={!messageText.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                      </div>
                    </TabsContent>

                    {/* Notes Tab */}
                    <TabsContent value="notes" className="mt-4">
                      <div className="space-y-4">
                        <Button className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Note
                        </Button>
                        
                        {notes && notes.length > 0 ? (
                          <div className="grid gap-4">
                            {notes.map((note: FamilyNote) => (
                              <Card key={note.id}>
                                <CardHeader>
                                  <CardTitle className="text-lg">{note.title}</CardTitle>
                                  <CardDescription>
                                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm">{note.content}</p>
                                  {note.tags && note.tags.length > 0 && (
                                    <div className="flex gap-2 mt-3">
                                      {note.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No notes yet. Create one to keep track of important information!</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks" className="mt-4">
                      <div className="space-y-4">
                        <Button className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Task
                        </Button>
                        
                        {tasks && tasks.length > 0 ? (
                          <div className="space-y-3">
                            {tasks.map((task: FamilyTask) => (
                              <Card key={task.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium">{task.title}</h4>
                                      {task.description && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2">
                                        <Badge variant={
                                          task.status === 'completed' ? 'default' :
                                          task.status === 'in_progress' ? 'secondary' :
                                          'outline'
                                        }>
                                          {task.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant={
                                          task.priority === 'high' ? 'destructive' :
                                          task.priority === 'medium' ? 'secondary' :
                                          'outline'
                                        }>
                                          {task.priority} priority
                                        </Badge>
                                        {task.dueDate && (
                                          <span className="text-sm text-gray-500 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No tasks yet. Create tasks to coordinate care activities!</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="mt-4">
                      <div className="space-y-4">
                        {groupDetails?.members && groupDetails.members.length > 0 ? (
                          <div className="space-y-3">
                            {groupDetails.members.map((member: FamilyMember) => (
                              <Card key={member.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarFallback>
                                          {member.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">{member.name}</div>
                                        <div className="text-sm text-gray-500">{member.email}</div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                        {member.role}
                                      </Badge>
                                      <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                                        {member.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No members yet</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Create Group Dialog */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Family Group</CardTitle>
              <CardDescription>
                Create a new family group to coordinate care together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (newGroupName) {
                  createGroupMutation.mutate(newGroupName);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="groupName">Group Name</Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g., Smith Family Care Team"
                      required
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowCreateGroup(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!newGroupName}>
                      Create Group
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Join Group Dialog */}
      {showJoinGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Join Family Group</CardTitle>
              <CardDescription>
                Enter the invite code shared by your family member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (joinCode) {
                  joinGroupMutation.mutate(joinCode);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="joinCode">Invite Code</Label>
                    <Input
                      id="joinCode"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="e.g., A1B2C3D4"
                      required
                      maxLength={8}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowJoinGroup(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!joinCode}>
                      Join Group
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Member Dialog */}
      {showInviteMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite Family Member</CardTitle>
              <CardDescription>
                Send an invitation to join your family group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteMember}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteName">Name</Label>
                    <Input
                      id="inviteName"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Family member's name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="inviteEmail">Email</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="family.member@example.com"
                      required
                    />
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>They can also join using code: <strong>{selectedGroup?.inviteCode}</strong></span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowInviteMember(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!inviteEmail || !inviteName}>
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}