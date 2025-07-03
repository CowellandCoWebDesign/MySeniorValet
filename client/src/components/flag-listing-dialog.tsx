import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flag, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const flagSchema = z.object({
  flagType: z.enum([
    "Inappropriate Content",
    "Incorrect Information", 
    "Spam/Duplicate",
    "Closed/No Longer Operating",
    "Safety Concerns",
    "Pricing Issues",
    "Other"
  ]),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
  details: z.string().optional(),
  reporterEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  reporterName: z.string().optional(),
});

type FlagFormData = z.infer<typeof flagSchema>;

interface FlagListingDialogProps {
  communityId: number;
  communityName: string;
  userId?: number;
}

export function FlagListingDialog({ communityId, communityName, userId }: FlagListingDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema),
    defaultValues: {
      flagType: undefined,
      reason: "",
      details: "",
      reporterEmail: "",
      reporterName: "",
    },
  });

  const flagMutation = useMutation({
    mutationFn: async (data: FlagFormData) => {
      return await apiRequest(`/api/communities/${communityId}/flag`, {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userId,
          reporterEmail: data.reporterEmail || null,
          reporterName: data.reporterName || null,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Flag Submitted",
        description: "Thank you for your report. Our team will review this listing.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit flag. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FlagFormData) => {
    flagMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Flag className="h-4 w-4" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report Issue with {communityName}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="flagType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of issue" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                      <SelectItem value="Incorrect Information">Incorrect Information</SelectItem>
                      <SelectItem value="Spam/Duplicate">Spam/Duplicate Listing</SelectItem>
                      <SelectItem value="Closed/No Longer Operating">Closed/No Longer Operating</SelectItem>
                      <SelectItem value="Safety Concerns">Safety Concerns</SelectItem>
                      <SelectItem value="Pricing Issues">Pricing Issues</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional context or supporting information..."
                      className="min-h-[80px]"
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
                name="reporterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reporterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Privacy Notice:</strong> Your report will be reviewed by our moderation team. 
                Providing contact information helps us follow up if needed but is not required.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={flagMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={flagMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {flagMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}