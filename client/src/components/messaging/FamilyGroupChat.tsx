import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Copy, 
  MessageSquare, 
  StickyNote,
  UserPlus,
  Settings,
  Shield,
  Clock,
  Check,
  X,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface FamilyMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  relationship?: string;
  permissions: {
    canMessage: boolean;
    canInvite: boolean;
    canRemove: boolean;
    canViewAll: boolean;
    canEditNotes: boolean;
  };
  joinedAt: string;
  invitedBy?: string;
}

interface FamilyGroup {
  id: number;
  name: string;
  ownerId: string;
  members: FamilyMember[];
  sharedCommunities?: number[];
  sharedNotes?: Array<{
    id: string;
    authorId: string;
    content: string;
    communityId?: number;
    createdAt: string;
    updatedAt?: string;
    tags?: string[];
  }>;
  inviteCode?: string;
  inviteCodeExpiry?: string;
  settings?: {
    allowJoinRequests?: boolean;
    requireApproval?: boolean;
    shareLocation?: boolean;
    shareCalendar?: boolean;
    notifyOnActivity?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface FamilyGroupChatProps {
  userId: string;
}

export function FamilyGroupChat({ userId }: FamilyGroupChatProps) {
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's family groups
  const { data: familyGroups = [], isLoading } = useQuery({
    queryKey: ['/api/family/groups'],
    queryFn: () => apiRequest('GET', '/api/family/groups').then(res => res.json()),
  });

  // Create family group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest('POST', '/api/family/groups', { name }).then(res => res.json());
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/groups'] });
      setShowCreateDialog(false);
      setNewGroupName('');
      setSelectedGroup(newGroup);
      toast({
        title: 'Family group created!',
        description: `Invite code: ${newGroup.inviteCode}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create group',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Join family group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      return apiRequest('POST', '/api/family/groups/join', { inviteCode }).then(res => res.json());
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/groups'] });
      setShowJoinDialog(false);
      setJoinCode('');
      setSelectedGroup(group);
      toast({
        title: 'Joined family group!',
        description: `You are now part of ${group.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to join group',
        description: 'Invalid or expired invite code',
        variant: 'destructive',
      });
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ groupId, content }: { groupId: number; content: string }) => {
      return apiRequest('POST', `/api/family/groups/${groupId}/notes`, { content }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family/groups'] });
      setNewNote('');
      toast({
        title: 'Note added',
        description: 'Your note has been shared with the family',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add note',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleCopyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Invite code copied!',
      description: 'Share this code with family members',
    });
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createGroupMutation.mutate(newGroupName.trim());
    }
  };

  const handleJoinGroup = () => {
    if (joinCode.trim()) {
      joinGroupMutation.mutate(joinCode.trim());
    }
  };

  const handleAddNote = () => {
    if (selectedGroup && newNote.trim()) {
      addNoteMutation.mutate({ 
        groupId: selectedGroup.id, 
        content: newNote.trim() 
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Family Connect
        </h2>
        <div className="flex gap-2">
          <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Join Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Family Group</DialogTitle>
                <DialogDescription>
                  Enter the invite code shared by your family member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <Button 
                  onClick={handleJoinGroup}
                  disabled={!joinCode.trim() || joinGroupMutation.isPending}
                  className="w-full"
                >
                  {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Family Group</DialogTitle>
                <DialogDescription>
                  Start a family group to collaborate on senior care decisions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Group name (e.g., 'Smith Family Care')"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Button 
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || createGroupMutation.isPending}
                  className="w-full"
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Group List */}
      {familyGroups.length === 0 ? (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No Family Groups Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create or join a family group to collaborate on senior care decisions
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
              Join Existing Group
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create New Group
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Group List Sidebar */}
          <Card className="md:col-span-1">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Your Groups</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-2">
                {familyGroups.map((group: FamilyGroup) => (
                  <Button
                    key={group.id}
                    variant={selectedGroup?.id === group.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    <span className="truncate">{group.name}</span>
                    {group.ownerId === userId && (
                      <Shield className="h-3 w-3 ml-auto" />
                    )}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Group Details */}
          {selectedGroup ? (
            <Card className="md:col-span-2">
              <Tabs defaultValue="members" className="h-full">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedGroup.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedGroup.members.length} members
                      </p>
                    </div>
                    {selectedGroup.inviteCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyInviteCode(selectedGroup.inviteCode!)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        {selectedGroup.inviteCode}
                      </Button>
                    )}
                  </div>
                </div>

                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="p-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {selectedGroup.members.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {member.userId === userId ? 'You' : 'Family Member'}
                                </span>
                                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                                  {member.role}
                                </Badge>
                              </div>
                              {member.relationship && (
                                <p className="text-sm text-muted-foreground">
                                  {member.relationship}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Joined {format(new Date(member.joinedAt), 'MMM d')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="notes" className="p-4">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Add a note for the family..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1"
                        rows={3}
                      />
                      <Button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || addNoteMutation.isPending}
                      >
                        <StickyNote className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    <ScrollArea className="h-[250px]">
                      <div className="space-y-3">
                        {selectedGroup.sharedNotes && selectedGroup.sharedNotes.length > 0 ? (
                          selectedGroup.sharedNotes.map((note) => (
                            <Card key={note.id} className="p-3">
                              <p className="text-sm">{note.content}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                                {note.tags && note.tags.length > 0 && (
                                  <>
                                    <span>•</span>
                                    {note.tags.map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </>
                                )}
                              </div>
                            </Card>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground py-8">
                            No notes yet. Add one to share with your family!
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="p-4">
                  {selectedGroup.ownerId === userId ? (
                    <div className="space-y-4">
                      <h4 className="font-medium">Group Settings</h4>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Allow join requests</span>
                          <Check className="h-4 w-4 text-green-500" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Share location</span>
                          <Check className="h-4 w-4 text-green-500" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Share calendar</span>
                          <Check className="h-4 w-4 text-green-500" />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-sm">Notify on activity</span>
                          <Check className="h-4 w-4 text-green-500" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Only the group owner can manage settings
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="md:col-span-2 flex items-center justify-center h-[500px]">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a group to view details
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}