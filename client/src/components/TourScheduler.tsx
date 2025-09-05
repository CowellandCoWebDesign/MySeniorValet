import { useState } from "react";
import { Calendar, Clock, Users, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

interface TourSchedulerProps {
  communityId: number;
  communityName: string;
  communityAddress?: string;
  communityPhone?: string;
  buttonText?: string;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
  onSuccess?: () => void;
  hasEmail?: boolean;
}

export function TourScheduler({
  communityId,
  communityName,
  communityAddress,
  communityPhone,
  buttonText = "Schedule Tour",
  buttonVariant = "default",
  onSuccess,
  hasEmail = true
}: TourSchedulerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const scheduleTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      const response = await fetch('/api/tours/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tourData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to schedule tour');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setConfirmationCode(data.confirmationCode);
      setDialogOpen(false);
      
      if (!isAuthenticated) {
        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Tour Scheduled!",
          description: "Check your email for confirmation. Visit Tour Tracker to manage your tours.",
        });
      }
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Scheduling Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Convert 24-hour time to 12-hour format with AM/PM
  const convertTo12HourFormat = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const tourTime = formData.get('tourTime') as string;
    const formattedTime = tourTime ? convertTo12HourFormat(tourTime) : '10:00 AM';
    
    scheduleTourMutation.mutate({
      communityId,
      preferredDate: formData.get('tourDate'),
      preferredTime: formattedTime,
      tourType: formData.get('tourType') || 'in-person',
      partySize: parseInt(formData.get('attendeeCount') as string) || 1,
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      specialRequests: formData.get('specialRequests'),
    });
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <>
      <Button 
        variant={buttonVariant}
        onClick={() => setDialogOpen(true)}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        {buttonText}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule a Tour</DialogTitle>
            <DialogDescription>
              {communityName}
              {communityAddress && (
                <span className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {communityAddress}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {!hasEmail && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900">Platform-Facilitated Tour</AlertTitle>
              <AlertDescription className="text-blue-800 mt-2">
                <p className="text-sm">
                  This community hasn't claimed their listing yet, but don't worry! 
                  MySeniorValet will facilitate your tour request and ensure the community receives your information.
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tourDate">Date</Label>
                  <Input
                    id="tourDate"
                    name="tourDate"
                    type="date"
                    required
                    min={minDate}
                  />
                </div>
                <div>
                  <Label htmlFor="tourTime">Time</Label>
                  <Input
                    id="tourTime"
                    name="tourTime"
                    type="time"
                    required
                    defaultValue="10:00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tourType">Tour Type</Label>
                <Select name="tourType" defaultValue="in_person">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="group">Group Tour</SelectItem>
                    <SelectItem value="private">Private Tour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="attendeeCount">Number of Attendees</Label>
                <Input
                  id="attendeeCount"
                  name="attendeeCount"
                  type="number"
                  min="1"
                  max="10"
                  defaultValue="1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactName">Your Name *</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  required
                  defaultValue={(user as any)?.name || (user as any)?.firstName || ''}
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  defaultValue={(user as any)?.email || ''}
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="(555) 555-5555"
                />
              </div>

              <div>
                <Label htmlFor="contactPreference">Preferred Contact Method</Label>
                <Select name="contactPreference" defaultValue="email">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Textarea
                  id="specialRequests"
                  name="specialRequests"
                  placeholder="Any specific areas you'd like to see or questions you have..."
                  rows={3}
                />
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-sm mb-2">What to Expect:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tour of facilities and available rooms</li>
                    <li>• Meet with community staff</li>
                    <li>• Learn about services and amenities</li>
                    <li>• Discuss pricing and availability</li>
                  </ul>
                  {!isAuthenticated && (
                    <p className="text-xs text-gray-500 mt-3 border-t pt-2">
                      💡 Tip: Create a free account after scheduling to track all your tours!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleTourMutation.isPending}>
                {scheduleTourMutation.isPending ? 'Scheduling...' : 'Schedule Tour'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog for Non-Authenticated Users */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">✅ Tour Successfully Scheduled!</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <strong>Confirmation Code:</strong> {confirmationCode}
                  </p>
                  <p className="text-sm text-green-800 mt-2">
                    We've sent confirmation details to your email.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🎯 Want to Track Your Tours?</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Create a free account to:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 mb-4">
                    <li>• Track all your scheduled tours in one place</li>
                    <li>• Get reminders before your visits</li>
                    <li>• Take notes and photos during tours</li>
                    <li>• Compare communities side-by-side</li>
                    <li>• Share insights with family members</li>
                    <li>• Access our Family Collaboration Center</li>
                  </ul>
                  
                  <div className="flex gap-2">
                    <Link href="/api/login">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Sign Up Free
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSuccessDialog(false)}
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}