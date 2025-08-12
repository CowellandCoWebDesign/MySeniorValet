import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Users, MessageCircle, Vote, Calendar, CheckCircle, Clock, AlertCircle, Home, MapPin, DollarSign, Star } from "lucide-react";
import { format } from "date-fns";

interface FamilyGroup {
  id: number;
  name: string;
  members: any[];
  settings: any;
}

interface FamilyPoll {
  id: number;
  title: string;
  description: string;
  pollType: string;
  options: any[];
  status: string;
  createdAt: string;
  expiresAt?: string;
  votes?: any[];
  createdBy: number;
  tourId?: number;
  communityId?: number;
}

interface Tour {
  id: number;
  communityName: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  confirmationCode?: string;
}

export default function FamilyCollaboration() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState<number | null>(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [pollFormData, setPollFormData] = useState({
    title: "",
    description: "",
    pollType: "general",
    options: ["", ""],
    allowMultipleChoices: false,
    anonymousVoting: false,
    requireAllVotes: false,
    showResultsRealtime: true,
    expiresAt: "",
    tourId: null as number | null,
    communityId: null as number | null,
  });

  // Fetch family groups
  const { data: familyGroups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["/api/family/groups"],
    enabled: true,
  });

  // Fetch polls for selected family group
  const { data: familyPolls = [], isLoading: loadingPolls } = useQuery({
    queryKey: ["/api/family/polls", selectedFamilyGroup],
    enabled: !!selectedFamilyGroup,
  });

  // Fetch tours for the user
  const { data: tours = [], isLoading: loadingTours } = useQuery({
    queryKey: ["/api/tours/my-tours"],
  });

  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/family/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          familyGroupId: selectedFamilyGroup,
        }),
      });
      if (!response.ok) throw new Error("Failed to create poll");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Poll Created",
        description: "Your family poll has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/family/polls"] });
      setShowCreatePoll(false);
      resetPollForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create poll. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Vote on poll mutation
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIds }: { pollId: number; optionIds: string[] }) => {
      const response = await fetch(`/api/family/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds }),
      });
      if (!response.ok) throw new Error("Failed to submit vote");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/family/polls"] });
    },
  });

  const resetPollForm = () => {
    setPollFormData({
      title: "",
      description: "",
      pollType: "general",
      options: ["", ""],
      allowMultipleChoices: false,
      anonymousVoting: false,
      requireAllVotes: false,
      showResultsRealtime: true,
      expiresAt: "",
      tourId: null,
      communityId: null,
    });
  };

  const handleCreatePoll = () => {
    const validOptions = pollFormData.options
      .filter(opt => opt.trim())
      .map((text, index) => ({
        id: `option-${index}`,
        text: text.trim(),
      }));

    if (validOptions.length < 2) {
      toast({
        title: "Invalid Poll",
        description: "Please provide at least 2 options.",
        variant: "destructive",
      });
      return;
    }

    createPollMutation.mutate({
      ...pollFormData,
      options: validOptions,
    });
  };

  const getPollTypeIcon = (type: string) => {
    switch (type) {
      case "tour_decision": return <Calendar className="h-4 w-4" />;
      case "community_preference": return <Home className="h-4 w-4" />;
      case "schedule_preference": return <Clock className="h-4 w-4" />;
      case "care_level": return <Star className="h-4 w-4" />;
      case "budget_range": return <DollarSign className="h-4 w-4" />;
      default: return <Vote className="h-4 w-4" />;
    }
  };

  const getPollStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      case "decided": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Family Collaboration Hub</h1>
          <p className="text-muted-foreground mt-2">
            Coordinate with your family on senior living decisions
          </p>
        </div>
        <div className="flex gap-2">
          {selectedFamilyGroup && (
            <Button onClick={() => setShowCreatePoll(true)}>
              <Vote className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          )}
        </div>
      </div>

      {/* Family Group Selector */}
      {familyGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Family Group</CardTitle>
            <CardDescription>Choose which family group to collaborate with</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {familyGroups.map((group: FamilyGroup) => (
                <Button
                  key={group.id}
                  variant={selectedFamilyGroup === group.id ? "default" : "outline"}
                  onClick={() => setSelectedFamilyGroup(group.id)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {group.name}
                  <Badge className="ml-2" variant="secondary">
                    {group.members?.length || 0} members
                  </Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {selectedFamilyGroup && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="polls">Polls & Voting</TabsTrigger>
            <TabsTrigger value="tours">Tour Coordination</TabsTrigger>
            <TabsTrigger value="decisions">Decisions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Polls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {familyPolls.filter((p: FamilyPoll) => p.status === "active").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Awaiting votes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Tours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {tours.filter((t: Tour) => t.status === "confirmed").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Upcoming visits</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Decisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {familyPolls.filter((p: FamilyPoll) => p.status === "decided").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Made this month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Polls Tab */}
          <TabsContent value="polls" className="space-y-4">
            {showCreatePoll && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Poll</CardTitle>
                  <CardDescription>
                    Start a family vote on an important decision
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Poll Title</Label>
                    <Input
                      value={pollFormData.title}
                      onChange={(e) => setPollFormData({ ...pollFormData, title: e.target.value })}
                      placeholder="What should we decide?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={pollFormData.description}
                      onChange={(e) => setPollFormData({ ...pollFormData, description: e.target.value })}
                      placeholder="Provide context for this decision..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Poll Type</Label>
                    <RadioGroup
                      value={pollFormData.pollType}
                      onValueChange={(value) => setPollFormData({ ...pollFormData, pollType: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="general" id="general" />
                        <Label htmlFor="general">General Decision</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tour_decision" id="tour" />
                        <Label htmlFor="tour">Tour Decision</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="community_preference" id="community" />
                        <Label htmlFor="community">Community Preference</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="budget_range" id="budget" />
                        <Label htmlFor="budget">Budget Range</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Options (minimum 2)</Label>
                    {pollFormData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollFormData.options];
                            newOptions[index] = e.target.value;
                            setPollFormData({ ...pollFormData, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                        {index === pollFormData.options.length - 1 && (
                          <Button
                            variant="outline"
                            onClick={() => setPollFormData({ 
                              ...pollFormData, 
                              options: [...pollFormData.options, ""] 
                            })}
                          >
                            Add Option
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={pollFormData.allowMultipleChoices}
                        onCheckedChange={(checked) => 
                          setPollFormData({ ...pollFormData, allowMultipleChoices: !!checked })
                        }
                      />
                      <Label>Allow multiple choices</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={pollFormData.anonymousVoting}
                        onCheckedChange={(checked) => 
                          setPollFormData({ ...pollFormData, anonymousVoting: !!checked })
                        }
                      />
                      <Label>Anonymous voting</Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreatePoll} disabled={createPollMutation.isPending}>
                      Create Poll
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreatePoll(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Polls List */}
            <div className="space-y-4">
              {familyPolls.map((poll: FamilyPoll) => (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getPollTypeIcon(poll.pollType)}
                        <CardTitle>{poll.title}</CardTitle>
                      </div>
                      <Badge className={getPollStatusColor(poll.status)}>
                        {poll.status}
                      </Badge>
                    </div>
                    {poll.description && (
                      <CardDescription>{poll.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {poll.status === "active" && (
                      <div className="space-y-3">
                        {poll.options.map((option: any) => (
                          <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => voteMutation.mutate({ 
                                  pollId: poll.id, 
                                  optionIds: [option.id] 
                                })}
                              >
                                Vote
                              </Button>
                              <span>{option.text}</span>
                            </div>
                            {poll.votes && (
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={(poll.votes.filter((v: any) => 
                                    v.optionIds.includes(option.id)
                                  ).length / poll.votes.length) * 100} 
                                  className="w-20" 
                                />
                                <span className="text-sm text-muted-foreground">
                                  {poll.votes.filter((v: any) => 
                                    v.optionIds.includes(option.id)
                                  ).length} votes
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {poll.expiresAt && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Expires: {format(new Date(poll.expiresAt), "PPp")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tours Tab */}
          <TabsContent value="tours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Family Tour Schedule</CardTitle>
                <CardDescription>
                  Coordinate community visits with your family
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tours.map((tour: Tour) => (
                    <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{tour.communityName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(tour.preferredDate), "PPP")} at {tour.preferredTime}
                        </p>
                        {tour.confirmationCode && (
                          <Badge variant="outline" className="mt-1">
                            Code: {tour.confirmationCode}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          tour.status === "confirmed" ? "bg-green-100 text-green-800" :
                          tour.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }>
                          {tour.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Discuss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Family Decisions</CardTitle>
                <CardDescription>
                  Track important decisions made together
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {familyPolls
                    .filter((p: FamilyPoll) => p.status === "decided")
                    .map((poll: FamilyPoll) => (
                      <div key={poll.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{poll.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Decided on {format(new Date(poll.createdAt), "PPP")}
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Family Messages</CardTitle>
                <CardDescription>
                  Stay connected with your family throughout the decision process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mr-3" />
                  <p>Family messaging coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!loadingGroups && familyGroups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Family Groups Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create a family group to start collaborating on senior living decisions.
            </p>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Family Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}