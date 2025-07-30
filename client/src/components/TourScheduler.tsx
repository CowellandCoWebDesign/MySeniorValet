import { useState } from "react";
import { Calendar, Clock, Users, MapPin } from "lucide-react";
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

interface TourSchedulerProps {
  communityId: number;
  communityName: string;
  communityAddress?: string;
  buttonText?: string;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
  onSuccess?: () => void;
}

export function TourScheduler({
  communityId,
  communityName,
  communityAddress,
  buttonText = "Schedule Tour",
  buttonVariant = "default",
  onSuccess
}: TourSchedulerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
      toast({
        title: "Tour Scheduled!",
        description: "You'll receive a confirmation email shortly.",
      });
      setDialogOpen(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    scheduleTourMutation.mutate({
      communityId,
      tourDate: formData.get('tourDate'),
      tourTime: formData.get('tourTime'),
      tourType: formData.get('tourType'),
      attendeeCount: parseInt(formData.get('attendeeCount') as string),
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      contactPreference: formData.get('contactPreference'),
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
    </>
  );
}