import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, DollarSign, Home, Users, Phone, Mail, CheckCircle, CreditCard, Shield, Info } from 'lucide-react';
import { AdvancedReservationFlow } from './AdvancedReservationFlow';
import { StripePaymentModal } from './StripePaymentModal';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ReservationSectionProps {
  community: any;
}

export function ReservationSection({ community }: ReservationSectionProps) {
  const [showReservation, setShowReservation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{ type: string; id: string } | null>(null);
  const [activeTab, setActiveTab] = useState('quick-reserve');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check availability mutation
  const checkAvailabilityMutation = useMutation({
    mutationFn: async (unitType: string) => {
      return apiRequest('POST', '/api/reservations/check-availability', {
        communityId: community.id,
        unitType
      });
    },
    onSuccess: (data: any) => {
      if (data.available) {
        toast({
          title: "Unit Available!",
          description: `${data.availableUnits} ${selectedUnit?.type} units available`,
        });
      } else {
        toast({
          title: "Limited Availability",
          description: "Join the waitlist to be notified when units become available",
          variant: "destructive"
        });
      }
    }
  });

  // Quick reservation mutation
  const quickReserveMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/reservations/quick-reserve', data);
    },
    onSuccess: () => {
      toast({
        title: "Reservation Submitted!",
        description: "You'll receive confirmation within 24 hours",
      });
      setShowReservation(false);
      queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
    }
  });

  const unitTypes = [
    {
      type: 'Studio',
      id: 'studio',
      price: community.communitySubtype === 'hud_senior_housing' ? '$0-500' : '$2,500-3,500',
      sqft: '400-500',
      features: ['Kitchenette', 'Private bathroom', 'Emergency call system'],
      availability: 'Limited',
      color: 'purple'
    },
    {
      type: 'One Bedroom',
      id: 'one-bed',
      price: community.communitySubtype === 'hud_senior_housing' ? '$100-600' : '$3,000-4,500',
      sqft: '550-700',
      features: ['Full kitchen', 'Separate bedroom', 'Living room', 'Patio/balcony'],
      availability: 'Available',
      color: 'blue'
    },
    {
      type: 'Two Bedroom',
      id: 'two-bed',
      price: community.communitySubtype === 'hud_senior_housing' ? '$200-800' : '$4,000-6,000',
      sqft: '800-1000',
      features: ['Full kitchen', 'Two bedrooms', 'Living room', 'Patio/balcony', 'Storage'],
      availability: 'Waitlist',
      color: 'green'
    }
  ];

  return (
    <>
      {/* Main Reservation Card */}
      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-green-800 dark:text-green-200">
            <Home className="w-5 h-5 mr-2" />
            Reserve Your Home
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Secure your spot at {community.name} with our streamlined reservation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quick-reserve">Quick Reserve</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
            </TabsList>

            {/* Quick Reserve Tab */}
            <TabsContent value="quick-reserve" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {unitTypes.map((unit) => (
                  <div
                    key={unit.id}
                    className={`border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer ${
                      selectedUnit?.id === unit.id ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'
                    }`}
                    onClick={() => setSelectedUnit({ type: unit.type, id: unit.id })}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{unit.type}</h4>
                      <Badge 
                        variant={unit.availability === 'Available' ? 'default' : unit.availability === 'Limited' ? 'secondary' : 'outline'}
                        className={
                          unit.availability === 'Available' ? 'bg-green-100 text-green-700' :
                          unit.availability === 'Limited' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      >
                        {unit.availability}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium">{unit.price}/mo</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Home className="w-4 h-4 mr-1" />
                        <span>{unit.sqft} sq ft</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <ul className="space-y-1">
                        {unit.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!selectedUnit}
                  onClick={() => {
                    if (selectedUnit) {
                      setShowPaymentModal(true);
                    }
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Reserve with $500 Deposit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                  disabled={!selectedUnit}
                  onClick={() => {
                    if (selectedUnit) {
                      checkAvailabilityMutation.mutate(selectedUnit.type);
                    }
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Check Availability
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`tel:${community.phone}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Community
                </Button>
              </div>

              {/* Reservation Benefits */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Reservation Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <Shield className="w-4 h-4 mr-2" />
                    100% Refundable deposit
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <Clock className="w-4 h-4 mr-2" />
                    Priority move-in scheduling
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <Users className="w-4 h-4 mr-2" />
                    Dedicated move-in coordinator
                  </div>
                  <div className="flex items-center text-blue-700 dark:text-blue-300">
                    <Home className="w-4 h-4 mr-2" />
                    Unit choice guarantee
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Options Tab */}
            <TabsContent value="advanced">
              <AdvancedReservationFlow
                community={community}
                selectedUnit={selectedUnit || undefined}
                onClose={() => {
                  setShowReservation(false);
                  toast({
                    title: "Advanced Reservation Complete!",
                    description: "Your detailed reservation has been submitted successfully",
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Reservation Dialog */}
      <Dialog open={showReservation} onOpenChange={setShowReservation}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Reservation</DialogTitle>
            <DialogDescription>
              Reserve your {selectedUnit?.type} at {community.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Unit Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Selected Unit</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <span className="font-medium">{selectedUnit?.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Est. Monthly:</span>
                  <span className="font-medium">
                    {unitTypes.find(u => u.id === selectedUnit?.id)?.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Deposit Required:</span>
                  <span className="font-medium text-green-600">$500 (Refundable)</span>
                </div>
              </div>
            </div>

            {/* Full Reservation Flow */}
            <AdvancedReservationFlow
              community={community}
              selectedUnit={selectedUnit || undefined}
              onClose={() => {
                setShowReservation(false);
                toast({
                  title: "Reservation Complete!",
                  description: "You'll receive confirmation within 24 hours",
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={500}
        description="Reservation deposit for senior living community"
        communityName={community.name}
        communityId={community.id}
        unitType={selectedUnit?.type}
        onSuccess={(paymentIntent) => {
          // Handle successful payment
          toast({
            title: "Reservation Confirmed!",
            description: "Your deposit has been processed. A move-in coordinator will contact you within 24 hours.",
          });
          
          // Create reservation record
          quickReserveMutation.mutate({
            communityId: community.id,
            unitType: selectedUnit?.type,
            paymentIntentId: paymentIntent.id,
            depositAmount: 500,
            status: 'confirmed'
          });
          
          // Close modals
          setShowPaymentModal(false);
          setSelectedUnit(null);
          
          // Refresh data
          queryClient.invalidateQueries({ queryKey: ['/api/reservations'] });
        }}
        metadata={{
          unitType: selectedUnit?.type,
          communityAddress: `${community.address}, ${community.city}, ${community.state}`,
          userAgent: navigator.userAgent
        }}
      />
    </>
  );
}