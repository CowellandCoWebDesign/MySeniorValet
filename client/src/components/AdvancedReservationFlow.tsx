import React, { useState, useEffect } from 'react';
import { Calendar, CreditCard, CheckCircle, Home, Users, Clock, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdvancedReservationFlowProps {
  community: any;
  selectedUnit?: { type: string; id: string };
  onClose: () => void;
}

export function AdvancedReservationFlow({ community, selectedUnit, onClose }: AdvancedReservationFlowProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedUnitType, setSelectedUnitType] = useState(selectedUnit?.type || '');
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    moveInUrgency: 'flexible',
    careNeeds: '',
    budget: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('deposit');
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate available dates (next 30 days)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Generate time slots
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  // Unit types with availability
  const unitTypes = [
    { type: 'Studio', available: 3, price: '$2,500', features: ['450 sq ft', 'Kitchenette', 'Walk-in Shower'] },
    { type: '1 Bedroom', available: 2, price: '$3,200', features: ['650 sq ft', 'Full Kitchen', 'Balcony'] },
    { type: '2 Bedroom', available: 1, price: '$4,100', features: ['850 sq ft', 'Full Kitchen', 'Patio'] },
    { type: 'Memory Care', available: 5, price: '$5,500', features: ['Secure Unit', '24/7 Care', 'Specialized Programs'] }
  ];

  const handleNextStep = () => {
    if (currentStep === 1 && (!selectedDate || !selectedTime)) {
      toast({
        title: "Please select date and time",
        description: "Choose your preferred move-in date and tour time",
        variant: "destructive"
      });
      return;
    }
    if (currentStep === 2 && !selectedUnitType) {
      toast({
        title: "Please select a unit type",
        description: "Choose the unit that best fits your needs",
        variant: "destructive"
      });
      return;
    }
    if (currentStep === 3 && (!guestInfo.name || !guestInfo.email || !guestInfo.phone)) {
      toast({
        title: "Please complete all required fields",
        description: "We need your contact information to proceed",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleReservation = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch('/api/reservations/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          communityId: community.id,
          unitType: selectedUnitType,
          contactName: guestInfo.name,
          email: guestInfo.email,
          phone: guestInfo.phone,
          moveInDate: selectedDate?.toISOString(),
          tourTime: selectedTime,
          careNeeds: guestInfo.careNeeds,
          budget: guestInfo.budget,
          paymentMethod: paymentMethod,
          depositAmount: paymentMethod === 'deposit' ? 500 : 0
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCurrentStep(5); // Success step
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Reservation Failed",
        description: "Please try again or contact the community directly.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{community.name}</h2>
              <p className="text-blue-100">{community.city}, {community.state}</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                  currentStep >= step ? "bg-white text-blue-600" : "bg-blue-500 text-blue-200"
                )}>
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={cn(
                    "w-24 h-1 mx-2",
                    currentStep > step ? "bg-white" : "bg-blue-500"
                  )} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-sm mt-2">
            <span>Select Date</span>
            <span>Choose Unit</span>
            <span>Your Info</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Step 1: Date & Time Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Select Your Move-In Date
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.slice(0, 28).map((date, index) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "p-3 rounded-lg border text-center transition-all",
                          isSelected 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800",
                          isWeekend && !isSelected && "bg-gray-50 dark:bg-gray-800"
                        )}
                      >
                        <div className="text-xs font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {date.getDate()}
                        </div>
                        <div className="text-xs">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Preferred Tour Time
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        selectedTime === time
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Unit Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Select Your Unit Type
              </h3>
              
              <RadioGroup value={selectedUnitType} onValueChange={setSelectedUnitType}>
                {unitTypes.map((unit) => (
                  <Card 
                    key={unit.type} 
                    className={cn(
                      "cursor-pointer transition-all",
                      selectedUnitType === unit.type && "ring-2 ring-blue-600"
                    )}
                  >
                    <CardContent className="p-4">
                      <label 
                        htmlFor={unit.type} 
                        className="flex items-start space-x-4 cursor-pointer"
                      >
                        <RadioGroupItem value={unit.type} id={unit.type} />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-lg">{unit.type}</h4>
                              <Badge variant="secondary" className="mt-1">
                                {unit.available} Available
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                {unit.price}
                              </div>
                              <div className="text-sm text-gray-500">per month</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {unit.features.map((feature, index) => (
                              <Badge key={index} variant="outline">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </label>
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Guest Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Tell Us About Yourself
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={guestInfo.name}
                    onChange={(e) => setGuestInfo({...guestInfo, name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={guestInfo.phone}
                    onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                    placeholder="john.doe@example.com"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label>Move-in Timeline</Label>
                  <RadioGroup 
                    value={guestInfo.moveInUrgency} 
                    onValueChange={(value) => setGuestInfo({...guestInfo, moveInUrgency: value})}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="immediate" id="immediate" />
                      <Label htmlFor="immediate">Immediate (Within 30 days)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="soon" id="soon" />
                      <Label htmlFor="soon">Soon (1-3 months)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="flexible" id="flexible" />
                      <Label htmlFor="flexible">Flexible (3+ months)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="careNeeds">Care Needs (Optional)</Label>
                  <textarea
                    id="careNeeds"
                    className="w-full p-3 border rounded-md"
                    rows={3}
                    value={guestInfo.careNeeds}
                    onChange={(e) => setGuestInfo({...guestInfo, careNeeds: e.target.value})}
                    placeholder="Please describe any specific care requirements..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment & Confirmation */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Secure Your Reservation
              </h3>
              
              {/* Reservation Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Reservation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Community:</span>
                    <span className="font-medium">{community.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Type:</span>
                    <span className="font-medium">{selectedUnitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Move-in Date:</span>
                    <span className="font-medium">
                      {selectedDate?.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tour Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Monthly Rate:</span>
                    <span className="text-blue-600">
                      {unitTypes.find(u => u.type === selectedUnitType)?.price || '$0'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <div>
                <h4 className="font-medium mb-3">Reservation Options</h4>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <Card className={cn(
                    "cursor-pointer transition-all mb-3",
                    paymentMethod === 'deposit' && "ring-2 ring-blue-600"
                  )}>
                    <CardContent className="p-4">
                      <label htmlFor="deposit" className="flex items-start space-x-3 cursor-pointer">
                        <RadioGroupItem value="deposit" id="deposit" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Hold with Deposit ($500)
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Secure your unit with a refundable deposit. Fully refundable if you cancel within 48 hours.
                          </p>
                        </div>
                      </label>
                    </CardContent>
                  </Card>
                  
                  <Card className={cn(
                    "cursor-pointer transition-all",
                    paymentMethod === 'hold' && "ring-2 ring-blue-600"
                  )}>
                    <CardContent className="p-4">
                      <label htmlFor="hold" className="flex items-start space-x-3 cursor-pointer">
                        <RadioGroupItem value="hold" id="hold" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            48-Hour Hold (No Deposit)
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Reserve your spot for 48 hours without payment. The community will contact you to finalize.
                          </p>
                        </div>
                      </label>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>

              {paymentMethod === 'deposit' && (
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Secure Payment via Stripe
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                      Your payment information is encrypted and secure. We never store credit card details.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">Reservation Confirmed!</h3>
              
              <div className="max-w-md mx-auto space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="font-medium mb-2">Reservation ID</div>
                    <div className="text-2xl font-mono font-bold text-blue-600">
                      #MSV-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </div>
                  </CardContent>
                </Card>
                
                <p className="text-gray-600">
                  We've sent a confirmation email to <strong>{guestInfo.email}</strong> with all the details.
                </p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">What happens next?</h4>
                  <ul className="text-sm text-left space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>The community will contact you within 24 hours</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Your tour is scheduled for {selectedDate?.toLocaleDateString()} at {selectedTime}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                      <span>Your unit is reserved for the next 48 hours</span>
                    </li>
                  </ul>
                </div>
                
                <Button 
                  onClick={onClose}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {currentStep < 5 && (
          <div className="border-t p-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose}
                disabled={isProcessing}
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </Button>
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleReservation}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      {paymentMethod === 'deposit' ? 'Pay & Reserve' : 'Complete Reservation'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}