import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  TrendingUp, TrendingDown, Calendar, DollarSign, Info, Shield, 
  History, CheckCircle, AlertCircle, ChevronRight, Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PricingHistoryDisplayProps {
  communityId: number;
  communityName: string;
  isVerified?: boolean;
}

export function PricingHistoryDisplay({ communityId, communityName, isVerified }: PricingHistoryDisplayProps) {
  const [selectedPriceType, setSelectedPriceType] = useState<string>('base');
  const [showAlertSignup, setShowAlertSignup] = useState(false);

  // Fetch pricing history
  const { data: pricingHistory, isLoading: historyLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/pricing-history`],
    enabled: !!communityId,
  });

  // Fetch pricing trends
  const { data: pricingTrends, isLoading: trendsLoading } = useQuery({
    queryKey: [`/api/communities/${communityId}/pricing-trends`, selectedPriceType],
    enabled: !!communityId,
  });

  // Fetch recent price changes
  const { data: recentChanges } = useQuery({
    queryKey: [`/api/pricing/recent-changes`, { days: 30 }],
    enabled: !!communityId,
  });

  // Subscribe to price alerts
  const handleSubscribeToAlerts = async () => {
    try {
      await apiRequest('POST', '/api/pricing/alerts/subscribe', {
        communityId,
        userId: 'current-user' // TODO: Get from auth context
      });
      setShowAlertSignup(false);
    } catch (error) {
      console.error('Failed to subscribe to alerts:', error);
    }
  };

  const formatPrice = (price: string | number | null) => {
    if (!price) return 'Contact for pricing';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const getLatestPrice = () => {
    if (!pricingHistory?.data || pricingHistory.data.length === 0) {
      return null;
    }
    
    const currentPrices = pricingHistory.data.filter((p: any) => !p.endDate);
    if (currentPrices.length === 0) return null;
    
    const basePrice = currentPrices.find((p: any) => p.priceType === 'base');
    return basePrice || currentPrices[0];
  };

  const latestPrice = getLatestPrice();

  if (historyLoading || trendsLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Pricing Card */}
      <Card className={isVerified ? 'border-green-500 border-2' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Pricing Transparency
              </CardTitle>
              <CardDescription>
                {isVerified ? 'Verified community pricing' : 'Market-based pricing estimates'}
              </CardDescription>
            </div>
            {isVerified && (
              <Badge className="bg-green-600 text-white">
                <Shield className="w-4 h-4 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {latestPrice ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Monthly Rate</p>
                  <p className="text-3xl font-bold">
                    {latestPrice.priceAmount 
                      ? formatPrice(latestPrice.priceAmount)
                      : `${formatPrice(latestPrice.priceMin)} - ${formatPrice(latestPrice.priceMax)}`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Effective from {format(new Date(latestPrice.effectiveDate), 'MMM d, yyyy')}
                  </p>
                </div>
                
                {/* Price Change Indicator */}
                {pricingHistory?.data?.length > 1 && (
                  <div className="text-right">
                    {(() => {
                      const previousPrice = pricingHistory.data[1];
                      const currentAmount = latestPrice.priceAmount || latestPrice.priceMin;
                      const previousAmount = previousPrice.priceAmount || previousPrice.priceMin;
                      const change = currentAmount - previousAmount;
                      const percentChange = (change / previousAmount) * 100;
                      
                      return (
                        <div className={`flex items-center gap-1 ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          <span className="font-medium">{Math.abs(percentChange).toFixed(1)}%</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Price Alert Signup */}
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertTitle>Get Price Change Alerts</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>Be notified when pricing changes for this community</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAlertSignup(true)}
                  >
                    Subscribe
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Pricing Information</AlertTitle>
              <AlertDescription>
                Contact the community directly for current pricing information.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pricing History Tabs */}
      {pricingHistory?.data && pricingHistory.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-5 h-5" />
              Pricing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="chart">Trend Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="space-y-3 mt-4">
                {pricingHistory.data.map((record: any, index: number) => (
                  <div 
                    key={record.id} 
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {record.priceType.replace('_', ' ').charAt(0).toUpperCase() + 
                             record.priceType.replace('_', ' ').slice(1)}
                          </p>
                          <p className="text-lg font-bold">
                            {record.priceAmount 
                              ? formatPrice(record.priceAmount)
                              : `${formatPrice(record.priceMin)} - ${formatPrice(record.priceMax)}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.effectiveDate), 'MMM d, yyyy')}
                          </p>
                          {record.verificationStatus === 'verified' && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="chart" className="mt-4">
                {pricingTrends?.data?.trends && pricingTrends.data.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={pricingTrends.data.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="effectiveDate" 
                        tickFormatter={(date) => format(new Date(date), 'MMM yyyy')}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: any) => formatPrice(value)}
                        labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="priceAmount" 
                        stroke="#8884d8" 
                        name="Monthly Rate"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Not enough data to display trends</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Recent Market Changes */}
      {recentChanges?.data && recentChanges.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Market Changes
            </CardTitle>
            <CardDescription>
              Price changes in similar communities nearby
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentChanges.data.slice(0, 3).map((change: any) => (
                <div key={change.alert.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                  <div>
                    <p className="font-medium text-sm">{change.community.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {change.community.city}, {change.community.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      change.alert.alertType === 'price_increase' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {change.alert.alertType === 'price_increase' ? '+' : '-'}
                      {Math.abs(parseFloat(change.alert.changePercentage))}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(change.alert.createdAt), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}