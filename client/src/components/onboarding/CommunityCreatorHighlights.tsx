import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  DollarSign,
  Users,
  Star,
  Gift,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface HighlightFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const highlights: HighlightFeature[] = [
  {
    icon: CheckCircle2,
    title: 'Live Availability',
    description: 'Show families exactly what rooms are available right now',
    badge: 'REAL-TIME',
    badgeColor: 'bg-green-100 text-green-800'
  },
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Display your rates openly - families appreciate honesty',
    badge: 'TRUSTED',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    icon: Star,
    title: 'Tour Track™ Reviews',
    description: 'Let families review their tour experience before move-in',
    badge: 'NEW',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    icon: MessageSquare,
    title: 'In-App Messaging',
    description: 'Chat with families instantly, no phone tag needed',
    badge: 'INSTANT',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  {
    icon: Gift,
    title: 'Highlight Specials',
    description: 'Promote move-in incentives and limited-time offers',
    badge: 'CONVERT',
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  {
    icon: Users,
    title: 'Review Responses',
    description: 'Respond to reviews publicly and build community trust',
    badge: 'ENGAGE',
    badgeColor: 'bg-pink-100 text-pink-800'
  }
];

export function CommunityCreatorHighlights() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Why Communities Love MySeniorValet
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Transform how families discover and connect with your community
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{feature.title}</h4>
                    {feature.badge && (
                      <Badge className={`text-xs ${feature.badgeColor}`}>
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Communities See 3x More Inquiries
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            When they show live availability and transparent pricing
          </p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Faster conversions</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Higher trust scores</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>More tours booked</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}