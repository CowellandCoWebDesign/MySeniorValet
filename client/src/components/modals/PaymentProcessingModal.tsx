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
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Building2, 
  DollarSign, 
  Calculator,
  Info,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const paymentFormSchema = z.object({
  residentId: z.string().min(1, "Resident is required"),
  paymentType: z.enum(["rent", "deposit", "fee", "other"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["card", "ach", "check", "cash", "wire"]),
  description: z.string().optional(),
  sendReceipt: z.boolean().default(true),
  applyConvenienceFee: z.boolean().default(true),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentProcessingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId: number;
}

// Mock resident data - would come from API
const mockResidents = [
  { id: "1", name: "John Doe", unit: "204", balance: 3500 },
  { id: "2", name: "Jane Smith", unit: "105", balance: 4200 },
  { id: "3", name: "Robert Johnson", unit: "312", balance: 3800 },
];

const paymentMethodDetails = {
  card: {
    fee: 2.9, // percentage
    label: "Credit/Debit Card",
    icon: "💳",
    description: "2.9% processing fee",
  },
  ach: {
    fee: 0.8, // percentage  
    label: "ACH Bank Transfer",
    icon: "🏦",
    description: "0.8% processing fee (71% savings)",
  },
  check: {
    fee: 0,
    label: "Paper Check",
    icon: "📝",
    description: "No processing fee",
  },
  cash: {
    fee: 0,
    label: "Cash",
    icon: "💵",
    description: "No processing fee",
  },
  wire: {
    fee: 15, // flat fee
    label: "Wire Transfer",
    icon: "🔄",
    description: "$15 flat fee",
  },
};

export default function PaymentProcessingModal({ 
  open, 
  onOpenChange, 
  communityId 
}: PaymentProcessingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResident, setSelectedResident] = useState<typeof mockResidents[0] | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      residentId: "",
      paymentType: "rent",
      amount: 0,
      paymentMethod: "card",
      description: "",
      sendReceipt: true,
      applyConvenienceFee: true,
      notes: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const amount = form.watch("amount");
  const applyConvenienceFee = form.watch("applyConvenienceFee");

  // Calculate fees
  const calculateFee = () => {
    if (!applyConvenienceFee || !amount) return 0;
    
    const method = paymentMethodDetails[paymentMethod];
    if (method.fee === 0) return 0;
    
    if (paymentMethod === "wire") {
      return method.fee; // Flat fee
    }
    
    return (amount * method.fee) / 100; // Percentage fee
  };

  const convenienceFee = calculateFee();
  const totalAmount = amount + convenienceFee;

  const processPaymentMutation = useMutation({
    mutationFn: async (values: PaymentFormValues) => {
      const payload = {
        ...values,
        convenienceFee,
        totalAmount,
        communityId,
      };
      
      return apiRequest(`/api/communities/${communityId}/payments`, 'POST', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/communities/${communityId}/payments`] });
      toast({
        title: "Payment Processed",
        description: `Payment of $${totalAmount.toFixed(2)} has been successfully processed.`,
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: PaymentFormValues) {
    setIsSubmitting(true);
    try {
      await processPaymentMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Process Payment
          </DialogTitle>
          <DialogDescription>
            Process a payment from a resident. Supports multiple payment methods with automatic fee calculation.
          </DialogDescription>
        </DialogHeader>

        {paymentMethod === "ach" && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>71% Savings with ACH!</strong> Your residents save significantly with ACH payments compared to credit cards.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="residentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Resident *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      const resident = mockResidents.find(r => r.id === value);
                      setSelectedResident(resident || null);
                      if (resident) {
                        form.setValue('amount', resident.balance);
                      }
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a resident" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockResidents.map(resident => (
                        <SelectItem key={resident.id} value={resident.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{resident.name} - Unit {resident.unit}</span>
                            <Badge variant="outline" className="ml-2">
                              Balance: ${resident.balance.toLocaleString()}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="rent">Monthly Rent</SelectItem>
                        <SelectItem value="deposit">Security Deposit</SelectItem>
                        <SelectItem value="fee">Community Fee</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="number" 
                          step="0.01"
                          className="pl-10"
                          placeholder="0.00" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      {Object.entries(paymentMethodDetails).map(([value, details]) => (
                        <div key={value} className="flex items-center space-x-2">
                          <RadioGroupItem value={value} id={value} />
                          <Label 
                            htmlFor={value} 
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <span>{details.icon}</span>
                            <div>
                              <div className="font-medium">{details.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {details.description}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
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
                    <Input placeholder="e.g., March 2024 Rent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fee Summary */}
            <div className="rounded-lg border p-4 bg-muted/50 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calculator className="h-4 w-4" />
                Payment Summary
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                
                {convenienceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>${convenienceFee.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span className="text-lg">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {paymentMethod === "ach" && (
                <Alert className="border-0 bg-green-100/50 dark:bg-green-900/20">
                  <Info className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs">
                    Resident saves ${((amount * 2.9 / 100) - convenienceFee).toFixed(2)} by using ACH instead of card
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sendReceipt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Receipt
                      </FormLabel>
                      <FormDescription>
                        Send receipt to resident
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="applyConvenienceFee"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Apply Fee
                      </FormLabel>
                      <FormDescription>
                        Add processing fee
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any internal notes about this payment..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These notes will not be visible to the resident
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
              <Button 
                type="submit" 
                disabled={isSubmitting || !amount}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Process ${totalAmount.toFixed(2)}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}