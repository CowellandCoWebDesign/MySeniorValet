import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Star, Music, Utensils, Activity } from "lucide-react";

interface CommunityActivity {
  id: number;
  activityName: string;
  activityType: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  capacity?: number;
  currentAttendees: number;
  activityLevel: "low" | "medium" | "high";
  leadStaff?: string;
  cost: number;
  requiresRegistration: boolean;
}

interface ActivitiesCalendarProps {
  communityId: number;
  onTourTimeSelected?: (date: string, time: string, activityLevel: string, suggestedExperience: string) => void;
}

// Mock data for demonstration - in production this would come from the API
// GOLDEN DATA RULE: Fetch real activities from API
// No mock data allowed - only authentic community activities

const getActivityIcon = (type: string) => {
  switch (type) {
    case "meal": return <Utensils className="w-4 h-4" />;
    case "entertainment": return <Music className="w-4 h-4" />;
    case "games": return <Activity className="w-4 h-4" />;
    case "social": return <Users className="w-4 h-4" />;
    default: return <Calendar className="w-4 h-4" />;
  }
};

const getActivityLevelColor = (level: string) => {
  switch (level) {
    case "high": return "bg-red-100 text-red-800";
    case "medium": return "bg-yellow-100 text-yellow-800";
    case "low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getSuggestedTourExperience = (activity: CommunityActivity) => {
  if (activity.activityType === "meal") return "meal_tour";
  if (activity.activityType === "entertainment" || activity.activityType === "games") return "event_tour";
  if (activity.activityLevel === "low") return "unit_focused";
  return "standard";
};

export default function ActivitiesCalendar({ communityId, onTourTimeSelected }: ActivitiesCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  
  // GOLDEN DATA RULE: Fetch real activities from API
  const { data: activities = [] } = useQuery<CommunityActivity[]>({
    queryKey: [`/api/communities/${communityId}/activities`],
    enabled: !!communityId,
  });
  
  // Group activities by date
  const activitiesByDate = activities.reduce((acc: Record<string, CommunityActivity[]>, activity: CommunityActivity) => {
    const date = activity.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, CommunityActivity[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleScheduleTour = (activity: CommunityActivity) => {
    const suggestedExperience = getSuggestedTourExperience(activity);
    onTourTimeSelected?.(activity.date, activity.startTime, activity.activityLevel, suggestedExperience);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Live Activities Calendar
        </CardTitle>
        <p className="text-sm text-gray-600">
          See what's happening and choose the perfect time for your tour
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(activitiesByDate).map(([date, activities]) => (
          <div key={date} className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900">
              {formatDate(date)}
            </h3>
            
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActivityIcon(activity.activityType)}
                        <h4 className="font-medium text-gray-900">{activity.activityName}</h4>
                        <Badge className={getActivityLevelColor(activity.activityLevel)}>
                          {activity.activityLevel} activity
                        </Badge>
                        {activity.cost > 0 && (
                          <Badge variant="outline">${activity.cost}</Badge>
                        )}
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {activity.startTime} - {activity.endTime}
                        </div>
                        
                        {activity.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {activity.location}
                          </div>
                        )}
                        
                        {activity.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {activity.currentAttendees}/{activity.capacity}
                          </div>
                        )}
                      </div>
                      
                      {activity.leadStaff && (
                        <p className="text-sm text-gray-500 mt-1">
                          Led by: {activity.leadStaff}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleScheduleTour(activity)}
                        className="whitespace-nowrap"
                      >
                        Tour During This
                      </Button>
                      
                      <div className="text-xs text-center text-gray-500">
                        {activity.activityLevel === "high" && "Lively atmosphere"}
                        {activity.activityLevel === "medium" && "Moderate activity"}
                        {activity.activityLevel === "low" && "Quiet time"}
                      </div>
                    </div>
                  </div>
                  
                  {activity.requiresRegistration && (
                    <div className="mt-2 text-sm text-orange-600">
                      ⚠️ This activity requires registration
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Tour Timing Recommendations</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span><strong>Quiet Times:</strong> Perfect for unit-focused tours and detailed discussions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span><strong>Moderate Activity:</strong> Great for standard tours with some community atmosphere</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span><strong>High Activity:</strong> Experience the community's vibrant social life</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}