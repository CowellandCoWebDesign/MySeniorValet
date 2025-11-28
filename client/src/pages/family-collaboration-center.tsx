import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/footer';
import { NavigationHeader } from '@/components/NavigationHeader';
import { FamilyVideoCall } from '@/components/integrations/FamilyVideoCall';
import { FamilyHealthRecords } from '@/components/integrations/FamilyHealthRecords';
import { FamilyMedicareManager } from '@/components/family/FamilyMedicareManager';
import DualSidedCostCalculator from '@/components/billing/DualSidedCostCalculator';
import CareCoordinationManager from '@/components/care/CareCoordinationManager';
import DailyLifeManager from '@/components/daily/DailyLifeManager';
import { 
  Calendar, 
  MessageCircle, 
  Heart,
  Activity, 
  MapPin, 
  Clock, 
  Star, 
  DollarSign,
  Users,
  Send,
  ChevronLeft,
  ChevronRight,
  Home,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  CalendarCheck,
  FileText,
  BarChart3,
  Share2,
  Download,
  Filter,
  Search,
  CheckCircle,
  Target,
  Shield,
  TrendingUp,
  Lightbulb,
  UserPlus,
  Video,
  Receipt,
  Calculator,
  Briefcase,
  Zap,
  Building2,
  AlertCircle,
  Phone,
  Vote,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

// Type definitions
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  messageType?: string;
  metadata?: any;
}

interface MessagesResponse {
  messages: Message[];
  currentUserId: string;
  groupName?: string | null;
}

interface Tour {
  id: string;
  communityName: string;
  community?: string;
  date: string;
  time: string;
  contactPerson: string;
  contact?: string;
  phone: string;
  status?: string;
  address?: string;
  notes?: string;
}

interface Visit {
  id: string;
  community: string;
  date: string;
  rating: number;
  familyMember: string;
  impressions: string;
  notes?: string;
  pros: string[];
  cons: string[];
  wouldRecommend?: boolean;
}

interface SharedFavorite {
  id: string | number;
  name: string;
  address: string;
  city: string;
  state: string;
  priceRange: string;
  price?: string;
  location?: string;
  careType: string;
  rating: number;
  familyRating?: number;
  notes?: string;
  addedBy?: string;
}

interface FamilyGroup {
  id: number;
  name: string;
  ownerId: string;
  inviteCode?: string;
  memberCount: number;
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    relationship?: string;
    joinedAt: string;
  }[];
}

interface FamilyPoll {
  id: number;
  title: string;
  description?: string;
  pollType: string;
  options: { id: string; text: string; votes?: number }[];
  hasVoted: boolean;
  status: string;
  expiresAt?: string;
  createdAt: string;
}

interface FamilyNote {
  id: string;
  content: string;
  authorId: string;
  authorName?: string;
  communityId?: number;
  communityName?: string;
  createdAt: string;
  tags?: string[];
}

interface FamilyTask {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'normal' | 'high';
  createdAt: string;
}

export default function FamilyCollaborationCenter() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newMessage, setNewMessage] = useState('');
  const { user, isLoading: authLoading } = useAuth();
  const queryClientHook = useQueryClient();
  const [proText, setProText] = useState('');
  const [conText, setConText] = useState('');
  
  // Family group state
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Poll creation state
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDescription, setNewPollDescription] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '']);

  // Fetch family groups
  const { data: familyGroups = [], isLoading: groupsLoading } = useQuery<FamilyGroup[]>({
    queryKey: ['/api/family/groups'],
    enabled: !!user,
    retry: 2,
  });

  // Auto-select first group if none selected
  useEffect(() => {
    if (familyGroups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(familyGroups[0].id);
    }
  }, [familyGroups, selectedGroupId]);

  // Create family group mutation
  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/family/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to create group');
      return response.json();
    },
    onSuccess: (data) => {
      queryClientHook.invalidateQueries({ queryKey: ['/api/family/groups'] });
      setSelectedGroupId(data.id);
      setShowCreateGroup(false);
      setNewGroupName('');
    },
  });

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      const response = await fetch('/api/family/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      if (!response.ok) throw new Error('Invalid invite code');
      return response.json();
    },
    onSuccess: (data) => {
      queryClientHook.invalidateQueries({ queryKey: ['/api/family/groups'] });
      setSelectedGroupId(data.group?.id);
      setShowJoinGroup(false);
      setJoinCode('');
    },
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/family/groups/${selectedGroupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send invite');
      return response.json();
    },
    onSuccess: () => {
      setShowInviteDialog(false);
      setInviteEmail('');
    },
  });

  // Fetch polls for selected group
  const { data: pollsData, isLoading: pollsLoading } = useQuery<FamilyPoll[]>({
    queryKey: [`/api/family/groups/${selectedGroupId}/polls`],
    enabled: !!user && !!selectedGroupId,
    retry: 2,
  });
  const polls = pollsData || [];

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (pollData: { title: string; description: string; options: { id: string; text: string }[] }) => {
      const response = await fetch(`/api/family/groups/${selectedGroupId}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pollData),
      });
      if (!response.ok) throw new Error('Failed to create poll');
      return response.json();
    },
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: [`/api/family/groups/${selectedGroupId}/polls`] });
      setShowCreatePoll(false);
      setNewPollTitle('');
      setNewPollDescription('');
      setNewPollOptions(['', '']);
    },
  });

  // Vote on poll mutation
  const votePollMutation = useMutation({
    mutationFn: async ({ pollId, optionIds }: { pollId: number; optionIds: string[] }) => {
      const response = await fetch(`/api/family/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ optionIds }),
      });
      if (!response.ok) throw new Error('Failed to submit vote');
      return response.json();
    },
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: [`/api/family/groups/${selectedGroupId}/polls`] });
    },
  });

  // Only fetch data if user is authenticated
  const { data: messagesData, isLoading: messagesLoading, error: messagesError } = useQuery<MessagesResponse>({
    queryKey: ['/api/family/messages'],
    refetchInterval: 5000, // Poll for updates every 5 seconds
    enabled: !!user, // Only run query if user is authenticated
    retry: 2, // Reduce retries to fail faster
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/family/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClientHook.invalidateQueries({ queryKey: ['/api/family/messages'] });
      setNewMessage('');
    },
  });

  // Fetch upcoming tours from the API
  const { data: upcomingTours = [], isLoading: toursLoading, error: toursError } = useQuery<Tour[]>({
    queryKey: ['/api/tours'],
    enabled: !!user, // Only run query if user is authenticated
    retry: 2, // Reduce retries to fail faster
  });

  // Fetch visit history from the API
  const { data: visitHistory = [], isLoading: historyLoading, error: historyError } = useQuery<Visit[]>({
    queryKey: ['/api/family/visit-history'],
    enabled: !!user, // Only run query if user is authenticated
    retry: 2, // Reduce retries to fail faster
  });

  // Format messages from API data
  const familyMessages = messagesData?.messages?.map((msg) => ({
    id: msg.id,
    sender: msg.senderName || user?.name || user?.email?.split('@')[0] || 'You',
    avatar: msg.senderName?.substring(0, 2).toUpperCase() || user?.name?.substring(0, 2).toUpperCase() || 'ME',
    message: msg.content,
    timestamp: new Date(msg.createdAt).toLocaleString(),
    isCurrentUser: msg.senderId === messagesData?.currentUserId
  })) || [];

  // Fetch shared favorites from the API
  const { data: sharedFavorites = [], isLoading: favoritesLoading, error: favoritesError } = useQuery<SharedFavorite[]>({
    queryKey: ['/api/family/shared-favorites'],
    enabled: !!user, // Only run query if user is authenticated
    retry: 2, // Reduce retries to fail faster
  });

  // Get current group details
  const currentGroup = familyGroups.find(g => g.id === selectedGroupId);

  // Show loading state while checking authentication or fetching initial data
  const isInitialLoading = authLoading || (user && (messagesLoading || toursLoading || historyLoading || favoritesLoading));
  const hasAnyError = !!(messagesError || toursError || historyError || favoritesError);
  
  if (isInitialLoading && !hasAnyError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <NavigationHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading your family collaboration tools...</p>
          </div>
        </div>
      </div>
    );
  }

  // Demo data for unauthenticated users
  const demoSearches = [
    { id: '1', query: 'Memory care in San Francisco', date: 'Today, 10:30 AM', results: 47 },
    { id: '2', query: 'Assisted living near Los Angeles under $5000', date: 'Yesterday, 3:45 PM', results: 23 },
    { id: '3', query: 'HUD senior housing California', date: '2 days ago', results: 156 },
    { id: '4', query: 'Pet-friendly communities in Sacramento', date: '3 days ago', results: 18 }
  ];

  const demoSavedCommunities = [
    {
      id: '1',
      name: 'Sunrise Senior Living of San Francisco',
      address: '1234 Market St',
      city: 'San Francisco',
      state: 'CA',
      priceRange: '$4,500 - $7,000',
      careType: 'Assisted Living & Memory Care',
      rating: 4.5,
      familyRating: 4,
      notes: 'Beautiful facility, great memory care program',
      addedBy: 'Sarah Johnson'
    },
    {
      id: '2',
      name: 'Golden Years Community',
      address: '5678 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      priceRange: '$3,800 - $5,500',
      careType: 'Independent Living',
      rating: 4.2,
      familyRating: 5,
      notes: 'Mom loved the activities program!',
      addedBy: 'Michael Johnson'
    },
    {
      id: '3',
      name: 'Harmony Senior Care',
      address: '910 Pine St',
      city: 'Sacramento',
      state: 'CA',
      priceRange: '$3,200 - $4,800',
      careType: 'Assisted Living',
      rating: 4.7,
      familyRating: 4,
      notes: 'Very clean, excellent staff-to-resident ratio',
      addedBy: 'Emily Johnson'
    }
  ];

  const demoTours = [
    {
      id: '1',
      communityName: 'Sunrise Senior Living',
      date: 'Tomorrow',
      time: '2:00 PM',
      contactPerson: 'Jennifer Smith',
      phone: '(415) 555-0123',
      status: 'confirmed',
      address: '1234 Market St, San Francisco, CA',
      notes: 'Bring Mom\'s medication list and questions about memory care'
    },
    {
      id: '2',
      communityName: 'Golden Years Community',
      date: 'Friday, Dec 15',
      time: '10:00 AM',
      contactPerson: 'Robert Chen',
      phone: '(310) 555-0456',
      status: 'pending',
      address: '5678 Oak Ave, Los Angeles, CA',
      notes: 'Virtual tour option available if needed'
    }
  ];

  const demoVisitHistory = [
    {
      id: '1',
      community: 'Belmont Village Senior Living',
      date: 'Last Monday',
      rating: 4,
      familyMember: 'Sarah & Mom',
      impressions: 'Very welcoming staff, beautiful dining area',
      pros: ['Excellent memory care program', 'Beautiful garden', 'Close to family'],
      cons: ['Higher price point', 'Limited parking'],
      wouldRecommend: true
    },
    {
      id: '2',
      community: 'Atria Senior Living',
      date: 'Last Thursday',
      rating: 3,
      familyMember: 'Michael',
      impressions: 'Nice facilities but felt understaffed',
      pros: ['Modern amenities', 'Good location'],
      cons: ['Staff seemed overwhelmed', 'Dining options limited'],
      wouldRecommend: false
    }
  ];

  // Show demo version if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <NavigationHeader />
        
        {/* Demo Mode Banner */}
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-b border-yellow-300 dark:border-yellow-700">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Demo Mode: Exploring with sample data - Sign in to save your real searches
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setLocation('/login')} size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
              <Button onClick={() => setLocation('/signup')} size="sm" variant="outline">
                Create Account
              </Button>
            </div>
          </div>
        </div>
        
        {/* Demo Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Family Collaboration Center</h1>
            <p className="text-lg text-muted-foreground">Experience how families work together to find the perfect senior care</p>
          </div>

          {/* Recent Searches */}
          <Card className="mb-6 border-2 border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-orange-600" />
                  Recent Searches
                </span>
                <Badge variant="secondary">DEMO DATA</Badge>
              </CardTitle>
              <CardDescription>Your recent search history helps you track your research</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {demoSearches.map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{search.query}</p>
                      <p className="text-xs text-muted-foreground">{search.date}</p>
                    </div>
                    <Badge variant="outline">{search.results} results</Badge>
                  </div>
                ))}
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Sign in to save your searches</strong> and access them from any device
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Saved Communities */}
          <Card className="mb-6 border-2 border-rose-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  Saved Communities
                </span>
                <Badge variant="secondary">DEMO DATA</Badge>
              </CardTitle>
              <CardDescription>Communities your family is considering</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {demoSavedCommunities.map((community) => (
                  <div key={community.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{community.name}</h4>
                        <p className="text-sm text-muted-foreground">{community.address}, {community.city}, {community.state}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{community.rating}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="outline">{community.careType}</Badge>
                      <Badge variant="outline" className="text-green-600">{community.priceRange}/mo</Badge>
                    </div>
                    {community.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{community.notes}"</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Added by {community.addedBy}</p>
                  </div>
                ))}
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Heart className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Sign in to save communities</strong> and share them with your family
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Scheduled Tours */}
          <Card className="mb-6 border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Scheduled Tours
                </span>
                <Badge variant="secondary">DEMO DATA</Badge>
              </CardTitle>
              <CardDescription>Upcoming community visits with TourMate™</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoTours.map((tour) => (
                  <div key={tour.id} className="p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-950/10">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{tour.communityName}</h4>
                        <p className="text-sm text-muted-foreground">{tour.address}</p>
                      </div>
                      <Badge className={tour.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {tour.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{tour.date} at {tour.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{tour.contactPerson}</span>
                      </div>
                    </div>
                    {tour.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                        📝 {tour.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Calendar className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Sign in to schedule tours</strong> with our TourMate™ scheduling system
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Visit History */}
          <Card className="mb-6 border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Visit History & Notes
                </span>
                <Badge variant="secondary">DEMO DATA</Badge>
              </CardTitle>
              <CardDescription>Track your impressions from community visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoVisitHistory.map((visit) => (
                  <div key={visit.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{visit.community}</h4>
                        <p className="text-sm text-muted-foreground">Visited {visit.date} by {visit.familyMember}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < visit.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mb-2">{visit.impressions}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-green-600 mb-1">Pros:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {visit.pros.map((pro, i) => (
                            <li key={i} className="text-gray-600 dark:text-gray-400">{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-600 mb-1">Cons:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {visit.cons.map((con, i) => (
                            <li key={i} className="text-gray-600 dark:text-gray-400">{con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <FileText className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Sign in to save visit notes</strong> and share them with your family
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          {/* Example Family Members */}
          <Card className="mb-6 border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Family Team Members
                </span>
                <Badge variant="secondary">DEMO DATA</Badge>
              </CardTitle>
              <CardDescription>Collaborate with family members in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Sarah Johnson', role: 'Daughter', location: 'New York', lastActive: 'Active now' },
                  { name: 'Michael Johnson', role: 'Son', location: 'Chicago', lastActive: '2 hours ago' },
                  { name: 'Emily Johnson', role: 'Daughter', location: 'Los Angeles', lastActive: 'Yesterday' },
                  { name: 'Robert Johnson', role: 'Son', location: 'Boston', lastActive: '3 days ago' }
                ].map((member, i) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {i === 0 && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">📍 {member.location}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{member.lastActive}</p>
                  </div>
                ))}
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Sign in to invite family members</strong> and collaborate in real-time
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          {/* Example Messages */}
          <Card className="mb-6 border-2 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  Family Discussion
                </span>
                <Badge variant="secondary">DEMO DATA</Badge>
              </CardTitle>
              <CardDescription>Private family conversations about care options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">SJ</div>
                    <span className="text-sm font-medium">Sarah</span>
                    <span className="text-xs text-muted-foreground">Today, 2:45 PM</span>
                  </div>
                  <p className="text-sm">Has anyone looked at the Sunrise Senior Living community? They have great reviews.</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">MJ</div>
                    <span className="text-sm font-medium">Michael</span>
                    <span className="text-xs text-muted-foreground">Today, 3:15 PM</span>
                  </div>
                  <p className="text-sm">Yes! I visited yesterday. The memory care unit was impressive. Staff ratio is 1:6.</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">EJ</div>
                    <span className="text-sm font-medium">Emily</span>
                    <span className="text-xs text-muted-foreground">Today, 3:30 PM</span>
                  </div>
                  <p className="text-sm">Great! Let's schedule a family video call tonight at 8 PM to discuss.</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">RJ</div>
                    <span className="text-sm font-medium">Robert</span>
                    <span className="text-xs text-muted-foreground">Today, 3:45 PM</span>
                  </div>
                  <p className="text-sm">I can join! Also found their pricing: $4,500-$7,000/month depending on care level.</p>
                </div>
              </div>
              <Alert className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm">
                  <strong>Sign in to message your family</strong> privately about care decisions
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          {/* CTA Card */}
          <Card className="border-2 border-green-500/20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Start Your Real Family Collaboration</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Everything you see here is demo data. Sign in to access your actual searches, saved communities, 
                scheduled tours, and family conversations - all in one secure place.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Secure & Private</p>
                  <p className="text-xs text-muted-foreground">Your family data is encrypted</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Real-Time Sync</p>
                  <p className="text-xs text-muted-foreground">Updates instantly for all family</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Always Free</p>
                  <p className="text-xs text-muted-foreground">No hidden fees for families</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation('/login')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  Sign In to Get Started
                </Button>
                <Button onClick={() => setLocation('/signup')} size="lg" variant="outline">
                  Create Free Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user has no data yet (first time user)
  const isNewUser = user && (!sharedFavorites || sharedFavorites.length === 0) && (!familyMessages || familyMessages.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation Bar */}
      <NavigationHeader />
      
      {/* Page Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
                className="hover:bg-muted"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Family Collaboration Center
                </h1>
                <p className="text-sm text-muted-foreground">Unite your family in finding the perfect senior care</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <Users className="w-3 h-3 mr-1" />
              FREE FOR FAMILIES ALWAYS
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">

        {/* Value Proposition Hero */}
        <Card className="mb-8 border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="inline-flex p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold">
                Why Use Family Collaboration?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Finding senior care is a family decision. Our collaboration tools help you work together, 
                share research, compare options, and make confident decisions as a united family.
              </p>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold">Tour Tracker</h3>
                <p className="text-sm text-muted-foreground">
                  Document visits with photos, ratings & detailed notes
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold">TourMate™</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule tours & sync calendars across family
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold">Private Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Discuss options privately with family members
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="font-semibold">Shared Lists</h3>
                <p className="text-sm text-muted-foreground">
                  Save favorites & compare communities side-by-side
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-center font-semibold mb-4">How It Works</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <span className="text-sm">Invite Family</span>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <span className="text-sm">Research Together</span>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <span className="text-sm">Visit & Document</span>
                </div>
                <ChevronRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    4
                  </div>
                  <span className="text-sm">Decide Together</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-[64px] z-30 bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-xl pb-6 pt-4 border-b-2 border-primary/10">
            <div className="w-full overflow-x-auto px-2">
              <TabsList className="inline-flex h-auto min-w-full lg:w-full p-2 bg-gradient-to-r from-slate-100/90 to-gray-100/90 dark:from-slate-900/90 dark:to-gray-900/90 rounded-xl shadow-lg border border-primary/10">
                <TabsTrigger 
                  value="overview" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-hover:from-amber-500/10 group-hover:to-yellow-500/10 data-[state=active]:from-amber-500/20 data-[state=active]:to-yellow-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 mr-2 flex-shrink-0 text-amber-600 dark:text-amber-400 group-data-[state=active]:text-amber-700 dark:group-data-[state=active]:text-amber-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Overview</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="tour-tracker" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <FileText className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Tour Tracker</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="tourmate" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Calendar className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">TourMate™</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 mr-2 flex-shrink-0 text-green-600 dark:text-green-400 group-data-[state=active]:text-green-700 dark:group-data-[state=active]:text-green-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Messages</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="polls" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-amber-500/0 group-hover:from-orange-500/10 group-hover:to-amber-500/10 data-[state=active]:from-orange-500/20 data-[state=active]:to-amber-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Vote className="w-5 h-5 mr-2 flex-shrink-0 text-orange-600 dark:text-orange-400 group-data-[state=active]:text-orange-700 dark:group-data-[state=active]:text-orange-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Polls & Voting</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="video-calls" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Video className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Video Calls</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="health-records" 
                  className="flex-1 min-w-[150px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Health Records</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="medicare" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-blue-500/0 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 data-[state=active]:from-indigo-500/20 data-[state=active]:to-blue-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Shield className="w-5 h-5 mr-2 flex-shrink-0 text-indigo-600 dark:text-indigo-400 group-data-[state=active]:text-indigo-700 dark:group-data-[state=active]:text-indigo-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Medicare</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="care" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 data-[state=active]:from-red-500/20 data-[state=active]:to-pink-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2 flex-shrink-0 text-red-600 dark:text-red-400 group-data-[state=active]:text-red-700 dark:group-data-[state=active]:text-red-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Care</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="daily" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-indigo-500/0 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Activity className="w-5 h-5 mr-2 flex-shrink-0 text-purple-600 dark:text-purple-400 group-data-[state=active]:text-purple-700 dark:group-data-[state=active]:text-purple-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Daily Life</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Receipt className="w-5 h-5 mr-2 flex-shrink-0 text-green-600 dark:text-green-400 group-data-[state=active]:text-green-700 dark:group-data-[state=active]:text-green-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Billing</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="calculator" 
                  className="flex-1 min-w-[140px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Calculator className="w-5 h-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-400 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Cost Calculator</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  className="flex-1 min-w-[130px] group relative overflow-hidden rounded-lg transition-all duration-300 py-3 px-5 data-[state=active]:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-rose-500/0 group-hover:from-red-500/10 group-hover:to-rose-500/10 data-[state=active]:from-red-500/20 data-[state=active]:to-rose-500/20 transition-all duration-300" />
                  <div className="relative flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2 flex-shrink-0 text-red-600 dark:text-red-400 group-data-[state=active]:text-red-700 dark:group-data-[state=active]:text-red-300" />
                    <span className="whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300 group-data-[state=active]:text-gray-900 dark:group-data-[state=active]:text-white">Favorites</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 transform scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Family Group Management */}
            <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Your Family Group
                  </CardTitle>
                  <div className="flex gap-2">
                    {familyGroups.length > 0 && (
                      <Select 
                        value={selectedGroupId?.toString() || ''} 
                        onValueChange={(val) => setSelectedGroupId(parseInt(val))}
                      >
                        <SelectTrigger className="w-[200px]" data-testid="select-family-group">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          {familyGroups.map(group => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name} ({group.memberCount} members)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {familyGroups.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 mx-auto mb-4 text-blue-400 opacity-50" />
                    <h3 className="font-semibold mb-2">No Family Group Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a family group to collaborate with your loved ones on finding senior care.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                        <DialogTrigger asChild>
                          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="button-create-group">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Family Group
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create a Family Group</DialogTitle>
                            <DialogDescription>
                              Create a group to collaborate with family members on finding senior care.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Group Name</Label>
                              <Input 
                                placeholder="e.g., Johnson Family" 
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                data-testid="input-group-name"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCreateGroup(false)}>Cancel</Button>
                            <Button 
                              onClick={() => createGroupMutation.mutate(newGroupName)}
                              disabled={!newGroupName.trim() || createGroupMutation.isPending}
                              data-testid="button-confirm-create-group"
                            >
                              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={showJoinGroup} onOpenChange={setShowJoinGroup}>
                        <DialogTrigger asChild>
                          <Button variant="outline" data-testid="button-join-group">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join with Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join a Family Group</DialogTitle>
                            <DialogDescription>
                              Enter the invite code shared by a family member to join their group.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Invite Code</Label>
                              <Input 
                                placeholder="Enter 8-character code" 
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={8}
                                className="text-center text-xl tracking-widest font-mono"
                                data-testid="input-join-code"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowJoinGroup(false)}>Cancel</Button>
                            <Button 
                              onClick={() => joinGroupMutation.mutate(joinCode)}
                              disabled={joinCode.length < 4 || joinGroupMutation.isPending}
                              data-testid="button-confirm-join"
                            >
                              {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : currentGroup && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{currentGroup.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {currentGroup.memberCount} member{currentGroup.memberCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" data-testid="button-invite-member">
                              <UserPlus className="w-4 h-4 mr-2" />
                              Invite Member
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Invite Family Member</DialogTitle>
                              <DialogDescription>
                                Share this code with family members to invite them to your group.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="text-center p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground mb-2">Invite Code</p>
                                <p className="text-3xl font-mono font-bold tracking-widest">
                                  {currentGroup.inviteCode || 'N/A'}
                                </p>
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <Label>Or send email invitation</Label>
                                <Input 
                                  type="email"
                                  placeholder="family@example.com" 
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  data-testid="input-invite-email"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Close</Button>
                              <Button 
                                onClick={() => inviteMemberMutation.mutate(inviteEmail)}
                                disabled={!inviteEmail.includes('@') || inviteMemberMutation.isPending}
                                data-testid="button-send-invite"
                              >
                                {inviteMemberMutation.isPending ? 'Sending...' : 'Send Invite'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {/* Group Members */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {currentGroup.members.map((member, idx) => (
                        <div key={member.userId} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                          <div className="relative">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                {member.relationship?.substring(0, 2).toUpperCase() || 'FM'}
                              </AvatarFallback>
                            </Avatar>
                            {idx === 0 && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{member.relationship || 'Member'}</p>
                            <Badge variant="secondary" className="text-xs">
                              {member.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    Your Family's Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Communities Viewed</span>
                    <Badge>{sharedFavorites.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tours Scheduled</span>
                    <Badge>{upcomingTours.filter((t: Tour) => t.status === 'pending' || t.status === 'confirmed').length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tours Completed</span>
                    <Badge>{visitHistory.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Family Members</span>
                    <Badge>{currentGroup?.memberCount || 1}</Badge>
                  </div>
                  <Separator className="my-4" />
                  <Button className="w-full" variant="outline" onClick={() => setShowInviteDialog(true)} disabled={!currentGroup}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Family Member
                  </Button>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Recommended Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Schedule Your First Tour</p>
                      <p className="text-xs text-muted-foreground">
                        Book visits to your top 3 communities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Complete Tour Reports</p>
                      <p className="text-xs text-muted-foreground">
                        Document each visit while details are fresh
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Compare Final Options</p>
                      <p className="text-xs text-muted-foreground">
                        Use our comparison tool to evaluate top choices
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Make Decision Together</p>
                      <p className="text-xs text-muted-foreground">
                        Vote and discuss as a family
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Recent Family Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah</span> completed a tour report for Peaceful Gardens
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Michael</span> added Harmony House to favorites
                      </p>
                      <p className="text-xs text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah</span> scheduled a tour at Golden Years
                      </p>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tour Tracker Tab */}
          <TabsContent value="tour-tracker" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Tour Visit Reports
                    </CardTitle>
                    <CardDescription>
                      Document your community visits with detailed reports your whole family can review
                    </CardDescription>
                  </div>

                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {visitHistory.map((visit: Visit) => (
                  <Card key={visit.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{visit.community}</h3>
                            <Badge variant="outline">{visit.date}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= visit.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              by {visit.familyMember}
                            </span>
                          </div>
                          <p className="text-sm">{visit.notes}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-green-600">Pros:</p>
                              <ul className="text-sm space-y-1 mt-1">
                                {visit.pros.map((pro, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <span className="text-green-500">✓</span> {pro}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-red-600">Cons:</p>
                              <ul className="text-sm space-y-1 mt-1">
                                {visit.cons.map((con, index) => (
                                  <li key={index} className="flex items-center gap-1">
                                    <span className="text-red-500">✗</span> {con}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {visit.wouldRecommend && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Would Recommend
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Visit Report
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TourMate Tab */}
          <TabsContent value="tourmate" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      TourMate™ Scheduler
                    </CardTitle>
                    <CardDescription>
                      Coordinate tour schedules with your family and never miss an appointment
                    </CardDescription>
                  </div>

                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4" />
                    Upcoming Tours
                  </h3>
                  {upcomingTours.map((tour: Tour) => (
                    <Card key={tour.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{tour.community}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {tour.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {tour.time}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              {tour.address}
                            </p>
                            <p className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              Contact: {tour.contact} - {tour.phone}
                            </p>
                            {tour.notes && (
                              <p className="italic text-muted-foreground">
                                Note: {tour.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1">
                              Add to Calendar
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1">
                              Get Directions
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold">Schedule New Tour</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Community Name</Label>
                      <Input placeholder="Enter community name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person</Label>
                      <Input placeholder="Contact name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Questions to ask, things to look for..." />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-purple-500" />
                      Family Messages
                    </CardTitle>
                    <CardDescription>
                      Your unified family thread - all care journey conversations in one place
                    </CardDescription>
                  </div>
                  {messagesLoading && <Badge variant="outline">Loading...</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4 mb-4">
                    {messagesLoading ? (
                      <div className="text-center text-muted-foreground py-8">
                        Loading messages...
                      </div>
                    ) : messagesData?.messages?.length ?? 0 > 0 ? (
                      messagesData?.messages?.map((msg: any) => {
                        const isCurrentUser = msg.senderId === messagesData?.currentUserId;
                        const isSystemMessage = msg.messageType === 'system';
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${isCurrentUser && !isSystemMessage ? 'justify-end' : ''}`}
                          >
                            {!isCurrentUser && !isSystemMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {msg.senderName?.split(' ').map((n: string) => n[0]).join('') || '??'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[70%] ${
                                isCurrentUser && !isSystemMessage ? 'order-first' : ''
                              }`}
                            >
                              {isSystemMessage ? (
                                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-yellow-300 dark:border-yellow-700">
                                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                    🎉 {msg.content}
                                  </p>
                                  {msg.metadata && (
                                    <div className="mt-2 text-xs text-yellow-800 dark:text-yellow-200">
                                      {msg.metadata.communityName && (
                                        <span>Community: {msg.metadata.communityName}</span>
                                      )}
                                      {msg.metadata.notes && (
                                        <p className="mt-1 italic">{msg.metadata.notes}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <>
                                  <div
                                    className={`rounded-lg p-3 ${
                                      isCurrentUser
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="text-sm">{msg.content}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {msg.senderName || user?.name || user?.email?.split('@')[0] || 'You'} • {new Date(msg.createdAt).toLocaleString()}
                                  </p>
                                </>
                              )}
                            </div>
                            {isCurrentUser && !isSystemMessage && (
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>ME</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No messages yet. Start your family conversation!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendMessageMutation.isPending}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                        e.preventDefault();
                        sendMessageMutation.mutate(newMessage.trim());
                      }
                    }}
                  />
                  <Button 
                    size="icon"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    onClick={() => {
                      if (newMessage.trim()) {
                        sendMessageMutation.mutate(newMessage.trim());
                      }
                    }}
                    disabled={sendMessageMutation.isPending || !newMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Polls & Voting Tab */}
          <TabsContent value="polls" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Vote className="w-5 h-5 text-orange-500" />
                      Family Polls & Voting
                    </CardTitle>
                    <CardDescription>
                      Make important decisions together as a family
                    </CardDescription>
                  </div>
                  {selectedGroupId && (
                    <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white" data-testid="button-create-poll">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Poll
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create a Family Poll</DialogTitle>
                          <DialogDescription>
                            Start a vote on an important decision
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Poll Title</Label>
                            <Input 
                              placeholder="What should we decide?" 
                              value={newPollTitle}
                              onChange={(e) => setNewPollTitle(e.target.value)}
                              data-testid="input-poll-title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea 
                              placeholder="Provide context for this decision..." 
                              value={newPollDescription}
                              onChange={(e) => setNewPollDescription(e.target.value)}
                              data-testid="input-poll-description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Options (minimum 2)</Label>
                            {newPollOptions.map((option, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const updated = [...newPollOptions];
                                    updated[index] = e.target.value;
                                    setNewPollOptions(updated);
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                  data-testid={`input-poll-option-${index}`}
                                />
                                {index > 1 && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={() => setNewPollOptions(newPollOptions.filter((_, i) => i !== index))}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setNewPollOptions([...newPollOptions, ''])}
                              className="w-full"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCreatePoll(false)}>Cancel</Button>
                          <Button 
                            onClick={() => {
                              const validOptions = newPollOptions.filter(o => o.trim());
                              if (newPollTitle.trim() && validOptions.length >= 2) {
                                createPollMutation.mutate({
                                  title: newPollTitle,
                                  description: newPollDescription,
                                  options: validOptions.map((text, i) => ({ id: `opt-${i}`, text }))
                                });
                              }
                            }}
                            disabled={!newPollTitle.trim() || newPollOptions.filter(o => o.trim()).length < 2 || createPollMutation.isPending}
                            data-testid="button-submit-poll"
                          >
                            {createPollMutation.isPending ? 'Creating...' : 'Create Poll'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedGroupId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Vote className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Create or join a family group first to start polls</p>
                    <Button variant="link" onClick={() => setActiveTab('overview')}>
                      Go to Overview
                    </Button>
                  </div>
                ) : pollsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading polls...
                  </div>
                ) : polls.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Vote className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No polls yet. Create one to start making decisions together!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {polls.map((poll: FamilyPoll) => (
                      <Card key={poll.id} className={`border-l-4 ${poll.status === 'active' ? 'border-l-orange-500' : 'border-l-gray-400'}`}>
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-lg">{poll.title}</h4>
                                {poll.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{poll.description}</p>
                                )}
                              </div>
                              <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                                {poll.status === 'active' ? 'Active' : 'Closed'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              {poll.options.map((option: { id: string; text: string; votes?: number }) => {
                                const totalVotes = poll.options.reduce((sum: number, o: { votes?: number }) => sum + (o.votes || 0), 0);
                                const percentage = totalVotes > 0 ? Math.round(((option.votes || 0) / totalVotes) * 100) : 0;
                                
                                return (
                                  <div key={option.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {poll.status === 'active' && !poll.hasVoted && (
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => votePollMutation.mutate({ pollId: poll.id, optionIds: [option.id] })}
                                            disabled={votePollMutation.isPending}
                                            data-testid={`button-vote-${poll.id}-${option.id}`}
                                          >
                                            Vote
                                          </Button>
                                        )}
                                        <span className="text-sm">{option.text}</span>
                                      </div>
                                      <span className="text-sm font-medium">{option.votes || 0} votes ({percentage}%)</span>
                                    </div>
                                    <Progress value={percentage} className="h-2" />
                                  </div>
                                );
                              })}
                            </div>
                            
                            {poll.hasVoted && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                You voted
                              </Badge>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(poll.createdAt).toLocaleDateString()}
                              {poll.expiresAt && ` • Expires ${new Date(poll.expiresAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Calls Tab */}
          <TabsContent value="video-calls" className="space-y-6">
            <FamilyVideoCall 
              familyId={user?.familyId || user?.id || 'family-' + user?.id}
              userId={user?.id}
            />
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="health-records" className="space-y-6">
            <FamilyHealthRecords 
              residentId="demo"
              communityId="demo"
              tierLevel="premium"
            />
          </TabsContent>

          {/* Medicare Tab */}
          <TabsContent value="medicare" className="space-y-6">
            <FamilyMedicareManager 
              userId={user?.id || ''}
              residentName={user?.name || 'Your Loved One'}
            />
          </TabsContent>

          {/* Shared Favorites Tab */}
          <TabsContent value="favorites" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-500" />
                      Shared Favorites
                    </CardTitle>
                    <CardDescription>
                      Communities your family is considering - compare and discuss together
                    </CardDescription>
                  </div>

                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Compare
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {sharedFavorites.map((fav: SharedFavorite) => (
                    <Card key={fav.id} className="border-l-4 border-l-rose-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{fav.name}</h4>
                              <Badge variant="outline">
                                <DollarSign className="w-3 h-3" />
                                {fav.price}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {fav.location}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm">{fav.rating} Platform</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-purple-400 fill-current" />
                                <span className="text-sm">{fav.familyRating} Family</span>
                              </div>
                            </div>
                            <p className="text-sm italic">{fav.notes}</p>
                            <p className="text-xs text-muted-foreground">Added by {fav.addedBy}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Community to Favorites
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Coordination Tab - Family View */}
          <TabsContent value="care" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      Care Coordination
                    </CardTitle>
                    <CardDescription>
                      Complete access to health records, medications, appointments, and care plans
                    </CardDescription>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    Real-Time Updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CareCoordinationManager 
                  residentId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Life Tab - Family View */}
          <TabsContent value="daily" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      Daily Life Connection
                    </CardTitle>
                    <CardDescription>
                      Stay connected with daily activities, meals, photos, and wellness updates
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Live Updates
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <DailyLifeManager 
                  residentId="family-view"
                  viewMode="family"
                />
              </CardContent>
            </Card>
          </TabsContent>



          {/* Billing Tab - Family View of Financial Transparency */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-green-500" />
                      Billing & Payments
                    </CardTitle>
                    <CardDescription>
                      View statements, make payments, and track financial information
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Full Transparency
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Balance Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Current Balance</h3>
                    <Badge variant="outline" className="bg-white dark:bg-gray-900">Due April 1</Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    $5,785.00
                  </div>
                  <p className="text-sm text-muted-foreground">Includes base rent and care services</p>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {[
                      { date: 'Mar 1, 2025', description: 'Monthly Rent', amount: '$3,500.00', type: 'charge' },
                      { date: 'Mar 1, 2025', description: 'Level 2 Care Services', amount: '$1,285.00', type: 'charge' },
                      { date: 'Mar 5, 2025', description: 'Medication Management', amount: '$350.00', type: 'charge' },
                      { date: 'Mar 15, 2025', description: 'Transportation Services', amount: '$150.00', type: 'charge' },
                      { date: 'Feb 28, 2025', description: 'Payment Received - Thank you!', amount: '-$5,785.00', type: 'payment' }
                    ].map((transaction, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.type === 'payment' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            {transaction.type === 'payment' ? 
                              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /> :
                              <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                        <span className={`font-semibold ${transaction.type === 'payment' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Options */}
                <div className="flex gap-3">
                  <Button className="flex-1" variant="default">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Make Payment
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Up AutoPay
                  </Button>
                </div>

                {/* Download Statement */}
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Monthly Statement
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Calculator Tab - Family Cost Planning */}
          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-500" />
                  Cost Calculator
                </CardTitle>
                <CardDescription>
                  Estimate monthly costs based on care needs and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DualSidedCostCalculator 
                  viewMode="family"
                  prefilledData={{
                    baseRent: 3500,
                    careLevel: 'assisted',
                    roomType: 'private'
                  }}
                />
              </CardContent>
            </Card>

            {/* Cost Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Comparison</CardTitle>
                <CardDescription>Compare costs across your favorite communities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sunrise of Beverly Hills', monthly: '$5,785', annual: '$69,420' },
                    { name: 'Atria Park of San Mateo', monthly: '$6,200', annual: '$74,400' },
                    { name: 'Brookdale Santa Monica', monthly: '$5,450', annual: '$65,400' }
                  ].map((community, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-500 transition-colors">
                      <div>
                        <h4 className="font-semibold">{community.name}</h4>
                        <p className="text-sm text-muted-foreground">Based on Level 2 care, private room</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{community.monthly}/mo</p>
                        <p className="text-sm text-muted-foreground">{community.annual}/year</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>



        </Tabs>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}