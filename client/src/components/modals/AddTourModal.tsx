import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Video, Globe, Eye, Settings2 } from "lucide-react";

const tourFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  platform: z.enum(["matterport", "youvisit", "eyespy360", "kuula", "google_street_view", "custom_360"]),
  tourType: z.enum(["full_community", "model_unit", "common_areas", "amenities", "virtual_staging"]),
  embedUrl: z.string().url("Invalid URL").min(1, "Embed URL is required"),
  isPrimary: z.boolean().default(false),
  isActive: z.boolean().default(true),
  rooms: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  metadata: z.object({
    duration: z.string().optional(),
    resolution: z.string().optional(),
    captureDate: z.string().optional(),
  }).optional(),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

interface AddTourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
}

const platformOptions = [
  { value: "matterport", label: "Matterport", icon: "🎥" },
  { value: "youvisit", label: "YouVisit", icon: "🌐" },
  { value: "eyespy360", label: "EyeSpy360", icon: "👁️" },
  { value: "kuula", label: "Kuula", icon: "🔄" },
  { value: "google_street_view", label: "Google Street View", icon: "📍" },
  { value: "custom_360", label: "Custom 360", icon: "📸" },
];

const tourTypeOptions = [
  { value: "full_community", label: "Full Community Tour" },
  { value: "model_unit", label: "Model Unit" },
  { value: "common_areas", label: "Common Areas" },
  { value: "amenities", label: "Amenities" },
  { value: "virtual_staging", label: "Virtual Staging" },
];

const commonRooms = [
  "Living Room",
  "Kitchen",
  "Bedroom",
  "Bathroom",
  "Dining Room",
  "Lobby",
  "Activity Room",
  "Library",
  "Fitness Center",
  "Garden",
  "Courtyard",
  "Chapel",
];

export default function AddTourModal({ 
  open, 
  onOpenChange, 
  communityId 
}: AddTourModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: "matterport",
      tourType: "full_community",
      embedUrl: "",
      isPrimary: false,
      isActive: true,
      rooms: [],
      features: [],
      metadata: {
        duration: "",
        resolution: "4K",
        captureDate: new Date().toISOString().split('T')[0],
      },
    },
  });

  const addTourMutation = useMutation({
    mutationFn: async (values: TourFormValues) => {
      return apiRequest(`/api/communities/${communityId}/tours`, 'POST', {
        ...values,
        rooms: selectedRooms,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/tours`] });
      toast({
        title: "Virtual Tour Added",
        description: "The virtual tour has been successfully added to your community.",
      });
      form.reset();
      setSelectedRooms([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add virtual tour. Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: TourFormValues) {
    setIsSubmitting(true);
    try {
      await addTourMutation.mutateAsync({ ...values, rooms: selectedRooms });
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleRoom = (room: string) => {
    setSelectedRooms(prev =>
      prev.includes(room) 
        ? prev.filter(r => r !== room)
        : [...prev, room]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Add Virtual Tour
          </DialogTitle>
          <DialogDescription>
            Add a 3D virtual tour to showcase your community. Supports all major tour platforms.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tour Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Full Community Walkthrough" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what's featured in this tour..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {platformOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              {option.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tourType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tour Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tour type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tourTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="embedUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed URL *</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://my.matterport.com/show/?m=..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The embed URL from your virtual tour platform
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Featured Rooms</Label>
              <div className="flex flex-wrap gap-2">
                {commonRooms.map(room => (
                  <Badge
                    key={room}
                    variant={selectedRooms.includes(room) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleRoom(room)}
                  >
                    {room}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Click to select rooms featured in this tour
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Primary Tour
                      </FormLabel>
                      <FormDescription>
                        Set as the main tour for your community
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active
                      </FormLabel>
                      <FormDescription>
                        Make tour visible to visitors
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Settings2 className="h-4 w-4" />
                Advanced Settings (Optional)
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="metadata.duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5 mins" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.resolution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resolution</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HD">HD (720p)</SelectItem>
                          <SelectItem value="Full HD">Full HD (1080p)</SelectItem>
                          <SelectItem value="4K">4K</SelectItem>
                          <SelectItem value="8K">8K</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metadata.captureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capture Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Virtual Tour"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}