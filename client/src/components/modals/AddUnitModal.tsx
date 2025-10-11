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
import { Home, Bed, Bath, Square } from "lucide-react";

const unitFormSchema = z.object({
  unitNumber: z.string().min(1, "Unit number is required"),
  unitType: z.enum(["studio", "one_bedroom", "two_bedroom", "three_bedroom", "suite", "penthouse"]),
  floor: z.coerce.number().min(0, "Floor must be 0 or higher"),
  squareFootage: z.coerce.number().min(1, "Square footage is required"),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0.5).step(0.5),
  baseRent: z.coerce.number().min(0, "Base rent must be positive"),
  marketRent: z.coerce.number().min(0, "Market rent must be positive"),
  status: z.enum(["available", "occupied", "reserved", "maintenance", "renovation"]),
  isAvailable: z.boolean(),
  availableDate: z.string().optional(),
  features: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface AddUnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
}

const unitFeatures = [
  "Balcony/Patio",
  "Walk-in Closet",
  "Kitchenette",
  "Full Kitchen",
  "Washer/Dryer",
  "Emergency Call System",
  "Wheelchair Accessible",
  "Corner Unit",
  "Garden View",
  "City View",
  "Recently Renovated",
  "Pet Friendly",
];

export default function AddUnitModal({ 
  open, 
  onOpenChange, 
  communityId 
}: AddUnitModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      unitNumber: "",
      unitType: "one_bedroom",
      floor: 1,
      squareFootage: 0,
      bedrooms: 1,
      bathrooms: 1,
      baseRent: 0,
      marketRent: 0,
      status: "available",
      isAvailable: true,
      availableDate: new Date().toISOString().split('T')[0],
      features: [],
      notes: "",
    },
  });

  const addUnitMutation = useMutation({
    mutationFn: async (values: UnitFormValues) => {
      return apiRequest(`/api/communities/${communityId}/units`, 'POST', {
        ...values,
        features: selectedFeatures,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/units`] });
      toast({
        title: "Unit Added",
        description: "The new unit has been successfully added to your inventory.",
      });
      form.reset();
      setSelectedFeatures([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add unit. Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: UnitFormValues) {
    setIsSubmitting(true);
    try {
      await addUnitMutation.mutateAsync({ ...values, features: selectedFeatures });
    } finally {
      setIsSubmitting(false);
    }
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  // Auto-set bedrooms and bathrooms based on unit type
  const handleUnitTypeChange = (value: string) => {
    form.setValue('unitType', value as any);
    
    switch(value) {
      case 'studio':
        form.setValue('bedrooms', 0);
        form.setValue('bathrooms', 1);
        break;
      case 'one_bedroom':
        form.setValue('bedrooms', 1);
        form.setValue('bathrooms', 1);
        break;
      case 'two_bedroom':
        form.setValue('bedrooms', 2);
        form.setValue('bathrooms', 2);
        break;
      case 'three_bedroom':
        form.setValue('bedrooms', 3);
        form.setValue('bathrooms', 2);
        break;
      case 'suite':
      case 'penthouse':
        form.setValue('bedrooms', 2);
        form.setValue('bathrooms', 2.5);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Add New Unit
          </DialogTitle>
          <DialogDescription>
            Add a new unit to your community inventory. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unitNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 204, A12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Type *</FormLabel>
                    <Select 
                      onValueChange={handleUnitTypeChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="one_bedroom">One Bedroom</SelectItem>
                        <SelectItem value="two_bedroom">Two Bedroom</SelectItem>
                        <SelectItem value="three_bedroom">Three Bedroom</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor *</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="squareFootage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Square Footage *
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="750" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Bedrooms *
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Bath className="h-4 w-4" />
                      Bathrooms *
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min="0.5" step="0.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="baseRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Rent (Monthly) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3500" {...field} />
                    </FormControl>
                    <FormDescription>
                      Starting monthly rent for this unit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketRent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Rent (Monthly) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="3800" {...field} />
                    </FormControl>
                    <FormDescription>
                      Current market rate for comparison
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        <SelectItem value="renovation">Under Renovation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <Label>Unit Features</Label>
              <div className="flex flex-wrap gap-2">
                {unitFeatures.map(feature => (
                  <Badge
                    key={feature}
                    variant={selectedFeatures.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFeature(feature)}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Click to select features for this unit
              </p>
            </div>

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Mark as Available
                    </FormLabel>
                    <FormDescription>
                      Show this unit as available for reservation
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special notes about this unit..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any additional information about the unit
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
                {isSubmitting ? "Adding..." : "Add Unit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}