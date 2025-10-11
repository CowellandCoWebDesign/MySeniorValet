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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const leadFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  leadSource: z.enum(["website", "phone", "walkin", "referral", "social_media", "advertising", "other"]),
  status: z.enum(["new", "contacted", "qualified", "tour_scheduled", "tour_completed", "application_submitted", "closed_won", "closed_lost"]),
  careNeeded: z.enum(["independent", "assisted_living", "memory_care", "skilled_nursing", "respite", "unknown"]),
  budget: z.enum(["under_3000", "3000_4000", "4000_5000", "5000_6000", "over_6000", "unknown"]),
  moveInTimeframe: z.enum(["immediate", "1_month", "3_months", "6_months", "12_months", "unknown"]),
  relationship: z.enum(["self", "spouse", "parent", "grandparent", "sibling", "friend", "other"]),
  notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface AddLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
}

export default function AddLeadModal({ 
  open, 
  onOpenChange, 
  communityId 
}: AddLeadModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      leadSource: "website",
      status: "new",
      careNeeded: "unknown",
      budget: "unknown",
      moveInTimeframe: "unknown",
      relationship: "self",
      notes: "",
    },
  });

  const addLeadMutation = useMutation({
    mutationFn: async (values: LeadFormValues) => {
      return apiRequest(`/api/communities/${communityId}/leads`, 'POST', {
        ...values,
        score: calculateLeadScore(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/leads`] });
      toast({
        title: "Lead Added",
        description: "The new lead has been successfully captured.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  function calculateLeadScore(values: LeadFormValues): number {
    let score = 50; // Base score
    
    // Timeline scoring
    if (values.moveInTimeframe === "immediate") score += 30;
    else if (values.moveInTimeframe === "1_month") score += 20;
    else if (values.moveInTimeframe === "3_months") score += 10;
    
    // Budget scoring
    if (values.budget === "over_6000") score += 15;
    else if (values.budget === "5000_6000") score += 10;
    else if (values.budget === "4000_5000") score += 5;
    
    // Status scoring
    if (values.status === "tour_scheduled") score += 10;
    else if (values.status === "qualified") score += 5;
    
    return Math.min(score, 100);
  }

  async function onSubmit(values: LeadFormValues) {
    setIsSubmitting(true);
    try {
      await addLeadMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Capture information about a prospective resident. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jane.smith@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="leadSource"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Source *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="walkin">Walk-in</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="advertising">Advertising</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="tour_scheduled">Tour Scheduled</SelectItem>
                        <SelectItem value="tour_completed">Tour Completed</SelectItem>
                        <SelectItem value="application_submitted">Application Submitted</SelectItem>
                        <SelectItem value="closed_won">Closed Won</SelectItem>
                        <SelectItem value="closed_lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="relationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Who is looking for care? *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="self" />
                        <Label htmlFor="self">Myself</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="spouse" id="spouse" />
                        <Label htmlFor="spouse">Spouse/Partner</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="parent" id="parent" />
                        <Label htmlFor="parent">Parent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="grandparent" id="grandparent" />
                        <Label htmlFor="grandparent">Grandparent</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sibling" id="sibling" />
                        <Label htmlFor="sibling">Sibling</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="friend" id="friend" />
                        <Label htmlFor="friend">Friend</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="careNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Care Level Needed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select care level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="independent">Independent Living</SelectItem>
                        <SelectItem value="assisted_living">Assisted Living</SelectItem>
                        <SelectItem value="memory_care">Memory Care</SelectItem>
                        <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
                        <SelectItem value="respite">Respite Care</SelectItem>
                        <SelectItem value="unknown">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Budget *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under_3000">Under $3,000</SelectItem>
                        <SelectItem value="3000_4000">$3,000 - $4,000</SelectItem>
                        <SelectItem value="4000_5000">$4,000 - $5,000</SelectItem>
                        <SelectItem value="5000_6000">$5,000 - $6,000</SelectItem>
                        <SelectItem value="over_6000">Over $6,000</SelectItem>
                        <SelectItem value="unknown">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moveInTimeframe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Move-in Timeline *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="1_month">Within 1 month</SelectItem>
                        <SelectItem value="3_months">1-3 months</SelectItem>
                        <SelectItem value="6_months">3-6 months</SelectItem>
                        <SelectItem value="12_months">6-12 months</SelectItem>
                        <SelectItem value="unknown">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requirements, preferences, or additional information..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any additional information about the lead
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Adding..." : "Add Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}