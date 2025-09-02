import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Car, 
  Bus, 
  Calendar as CalendarIcon,
  Clock, 
  MapPin, 
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Plus,
  Navigation,
  Briefcase,
  Heart,
  ShoppingCart,
  Users,
  Activity,
  X,
  Edit2,
  Info
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function TransportationScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tripType, setTripType] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [wheelchairNeeded, setWheelchairNeeded] = useState(false);
  const { toast } = useToast();

  // Fetch transportation data
  const { data: transportData, isLoading } = useQuery({
    queryKey: ['/api/operations/transportation', selectedDate],
    queryFn: async () => {
      // Mock data for demo - would connect to real API
      return {
        scheduledTrips: [
          {
            id: 1,
            date: '2025-09-03',
            time: '9:00 AM',
            type: 'Medical',
            destination: 'Dr. Smith - Cardiology',
            address: '123 Medical Center Dr',
            driver: 'John D.',
            vehicle: 'Van #2',
            status: 'confirmed',
            returnTime: '11:00 AM',
            wheelchairAccessible: true
          },
          {
            id: 2,
            date: '2025-09-03',
            time: '2:00 PM',
            type: 'Shopping',
            destination: 'Walmart',
            address: '456 Commerce St',
            driver: 'Sarah M.',
            vehicle: 'Bus #1',
            status: 'confirmed',
            returnTime: '4:00 PM',
            wheelchairAccessible: true,
            groupTrip: true,
            seatsAvailable: 3
          },
          {
            id: 3,
            date: '2025-09-04',
            time: '10:30 AM',
            type: 'Personal',
            destination: 'Hair Salon',
            address: '789 Main St',
            driver: 'Mike R.',
            vehicle: 'Car #3',
            status: 'pending',
            returnTime: '12:00 PM'
          }
        ],
        regularSchedule: {
          monday: [
            { time: '10:00 AM', destination: 'Grocery Shopping', type: 'group' },
            { time: '2:00 PM', destination: 'Medical Appointments', type: 'individual' }
          ],
          wednesday: [
            { time: '9:00 AM', destination: 'Walmart/Target', type: 'group' },
            { time: '1:00 PM', destination: 'Banking/Errands', type: 'individual' }
          ],
          friday: [
            { time: '10:00 AM', destination: 'Mall Trip', type: 'group' },
            { time: '3:00 PM', destination: 'Medical/Personal', type: 'individual' }
          ]
        },
        vehicles: [
          { id: 1, name: 'Bus #1', capacity: 15, wheelchairSpots: 2, available: true },
          { id: 2, name: 'Van #2', capacity: 6, wheelchairSpots: 1, available: true },
          { id: 3, name: 'Car #3', capacity: 3, wheelchairSpots: 0, available: false }
        ],
        drivers: [
          { id: 1, name: 'John D.', phone: '555-0101', available: true },
          { id: 2, name: 'Sarah M.', phone: '555-0102', available: true },
          { id: 3, name: 'Mike R.', phone: '555-0103', available: false }
        ]
      };
    }
  });

  // Book trip mutation
  const bookTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      return apiRequest('POST', '/api/operations/trips', tripData);
    },
    onSuccess: () => {
      toast({
        title: "Trip Booked Successfully",
        description: "Your transportation has been scheduled. You'll receive a confirmation call.",
      });
      // Reset form
      setTripType('');
      setDestination('');
      setPickupTime('');
      setReturnTime('');
      queryClient.invalidateQueries({ queryKey: ['/api/operations/transportation'] });
    }
  });

  const handleBookTrip = () => {
    if (tripType && destination && pickupTime) {
      bookTripMutation.mutate({
        date: selectedDate,
        type: tripType,
        destination,
        pickupTime,
        returnTime,
        wheelchairNeeded
      });
    }
  };

  const tripTypeIcons = {
    Medical: Heart,
    Shopping: ShoppingCart,
    Personal: User,
    Group: Users,
    Recreation: Activity
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading transportation schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Transportation Services
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Schedule rides for medical appointments, shopping, and personal errands
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Today's Trips</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Car className="h-8 w-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Vehicles</p>
                  <p className="text-2xl font-bold">2/3</p>
                </div>
                <Bus className="h-8 w-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next Trip</p>
                  <p className="text-lg font-semibold">9:00 AM</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Group Trip Today</p>
                  <p className="text-lg font-semibold">2:00 PM</p>
                </div>
                <Users className="h-8 w-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Schedule Trip</TabsTrigger>
            <TabsTrigger value="my-trips">My Trips</TabsTrigger>
            <TabsTrigger value="regular">Regular Schedule</TabsTrigger>
            <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          </TabsList>

          {/* Schedule Trip Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Book a Trip</CardTitle>
                  <CardDescription>Schedule your transportation in advance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="trip-type">Trip Type</Label>
                    <Select value={tripType} onValueChange={setTripType}>
                      <SelectTrigger id="trip-type">
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical Appointment</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="personal">Personal Errand</SelectItem>
                        <SelectItem value="recreation">Recreation/Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Enter destination or address"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickup">Pickup Time</Label>
                      <Input
                        id="pickup"
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="return">Return Time</Label>
                      <Input
                        id="return"
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="wheelchair"
                      checked={wheelchairNeeded}
                      onChange={(e) => setWheelchairNeeded(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="wheelchair">Wheelchair accessible vehicle needed</Label>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleBookTrip}
                    disabled={!tripType || !destination || !pickupTime}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Book Transportation
                  </Button>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="mr-2 h-5 w-5" />
                      Transportation Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Advance Booking</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please book medical trips at least 48 hours in advance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Group Shopping Trips</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Join scheduled group trips on Mon/Wed/Fri for shopping
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Cancellation Policy</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Cancel at least 2 hours before scheduled pickup
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Medical Priority</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Medical appointments receive scheduling priority
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Phone className="h-4 w-4" />
                  <AlertDescription>
                    For urgent transportation needs, call the front desk at (555) 123-4567
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </TabsContent>

          {/* My Trips Tab */}
          <TabsContent value="my-trips">
            <Card>
              <CardHeader>
                <CardTitle>Your Scheduled Trips</CardTitle>
                <CardDescription>Upcoming and past transportation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transportData?.scheduledTrips.map((trip) => {
                    const Icon = tripTypeIcons[trip.type as keyof typeof tripTypeIcons] || Car;
                    return (
                      <div key={trip.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-4">
                            <div className={`p-3 rounded-lg ${
                              trip.status === 'confirmed' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30'
                            }`}>
                              <Icon className={`h-6 w-6 ${
                                trip.status === 'confirmed'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-yellow-600 dark:text-yellow-400'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{trip.destination}</h4>
                                <Badge variant={trip.status === 'confirmed' ? 'default' : 'secondary'}>
                                  {trip.status}
                                </Badge>
                                {trip.wheelchairAccessible && (
                                  <Badge variant="outline" className="text-blue-600">
                                    ♿ Accessible
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="inline h-3 w-3 mr-1" />
                                {trip.address}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span className="flex items-center">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  {new Date(trip.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {trip.time} - {trip.returnTime}
                                </span>
                              </div>
                              <div className="flex gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                <span>Driver: {trip.driver}</span>
                                <span>Vehicle: {trip.vehicle}</span>
                              </div>
                              {trip.groupTrip && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                                  Group trip - {trip.seatsAvailable} seats available
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Regular Schedule Tab */}
          <TabsContent value="regular">
            <Card>
              <CardHeader>
                <CardTitle>Regular Transportation Schedule</CardTitle>
                <CardDescription>Weekly scheduled group trips and available slots</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(transportData?.regularSchedule || {}).map(([day, trips]) => (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="font-semibold capitalize mb-3">{day}</h3>
                      <div className="space-y-3">
                        {trips.map((trip, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                            <p className="font-medium text-sm">{trip.time}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {trip.destination}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {trip.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fleet Status Tab */}
          <TabsContent value="fleet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicles */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transportData?.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bus className={`h-5 w-5 ${vehicle.available ? 'text-green-600' : 'text-red-600'}`} />
                          <div>
                            <p className="font-medium">{vehicle.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Capacity: {vehicle.capacity} | Wheelchair: {vehicle.wheelchairSpots}
                            </p>
                          </div>
                        </div>
                        <Badge variant={vehicle.available ? 'default' : 'secondary'}>
                          {vehicle.available ? 'Available' : 'In Use'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Drivers */}
              <Card>
                <CardHeader>
                  <CardTitle>Driver Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transportData?.drivers.map((driver) => (
                      <div key={driver.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className={`h-5 w-5 ${driver.available ? 'text-green-600' : 'text-red-600'}`} />
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="inline h-3 w-3 mr-1" />
                              {driver.phone}
                            </p>
                          </div>
                        </div>
                        <Badge variant={driver.available ? 'default' : 'secondary'}>
                          {driver.available ? 'On Duty' : 'Off Duty'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}