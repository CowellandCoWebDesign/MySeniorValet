import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Crown,
  Settings
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionStatusCardProps {
  communityId: number;
  showFullDetails?: boolean;
}

export function SubscriptionStatusCard({ communityId, showFullDetails = false }: SubscriptionStatusCardProps) {
  // Fetch community's current subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: [`/api/communities/${communityId}/subscription-status`],
  });

  if (!subscriptionStatus) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">Free Basic Listing</p>
              <p className="text-xs text-amber-600">Upgrade to unlock premium features</p>
            </div>
            <Link to="/community-portal">
              <Button size="sm" variant="outline" className="ml-auto">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isActive = subscriptionStatus.status === 'active';
  const isPastDue = subscriptionStatus.status === 'past_due';
  const isCanceled = subscriptionStatus.status === 'canceled';

  const statusColor = isActive ? 'green' : isPastDue ? 'amber' : 'red';
  const statusIcon = isActive ? CheckCircle : AlertCircle;

  return (
    <Card className={`border-${statusColor}-200 bg-${statusColor}-50`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className={`w-5 h-5 text-${statusColor}-600`} />
            {subscriptionStatus.planName}
          </CardTitle>
          <Badge 
            className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}
          >
            {subscriptionStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {showFullDetails && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Monthly Cost</p>
                <p className="font-semibold">${subscriptionStatus.monthlyAmount}</p>
              </div>
              <div>
                <p className="text-gray-600">Next Billing</p>
                <p className="font-semibold">
                  {new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <h4 className="font-medium mb-2">Active Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {subscriptionStatus.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="flex gap-2 mt-4">
          <Link to="/subscriptions">
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manage Plan
            </Button>
          </Link>
          {!isActive && (
            <Link to="/community-portal">
              <Button size="sm" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Reactivate
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}