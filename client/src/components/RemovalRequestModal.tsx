import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RemovalRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType?: 'vendor' | 'community' | 'service';
  entityId?: number;
  entityName?: string;
}

export function RemovalRequestModal({
  open,
  onOpenChange,
  entityType = 'vendor',
  entityId,
  entityName
}: RemovalRequestModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    requestType: entityType,
    entityId: entityId || 0,
    entityName: entityName || '',
    requestorName: '',
    requestorEmail: '',
    requestorPhone: '',
    requestorRole: 'owner',
    reason: '',
    legalBasis: '',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/removal-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast({
          title: "Request Submitted",
          description: data.message,
          duration: 5000,
        });
        
        // Reset form after a delay
        setTimeout(() => {
          onOpenChange(false);
          setSubmitted(false);
          setFormData({
            ...formData,
            requestorName: '',
            requestorEmail: '',
            requestorPhone: '',
            requestorRole: 'owner',
            reason: '',
            legalBasis: '',
            additionalNotes: ''
          });
        }, 3000);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit removal request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting removal request:', error);
      toast({
        title: "Error",
        description: "Failed to submit removal request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Submitted Successfully</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We've received your removal request and will review it within 24-48 hours.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Platform Removal Request</DialogTitle>
          <DialogDescription>
            Submit a request to remove your listing from MySeniorValet. We respect the rights of all service providers and will review your request promptly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Entity Information (if provided) */}
          {entityName && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <Label className="text-sm text-gray-600 dark:text-gray-400">Requesting removal for:</Label>
              <p className="font-semibold">{entityName}</p>
            </div>
          )}

          {/* Request Type */}
          {!entityType && (
            <div className="space-y-2">
              <Label htmlFor="requestType">What would you like to remove?</Label>
              <Select
                value={formData.requestType}
                onValueChange={(value) => setFormData({ ...formData, requestType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor">Vendor/Service Listing</SelectItem>
                  <SelectItem value="community">Community Listing</SelectItem>
                  <SelectItem value="service">Care Service Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Entity Name (if not provided) */}
          {!entityName && (
            <div className="space-y-2">
              <Label htmlFor="entityName">Name of listing to remove</Label>
              <Input
                id="entityName"
                required
                value={formData.entityName}
                onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                placeholder="Enter the exact name of the listing"
              />
            </div>
          )}

          {/* Requestor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestorName">Your Name</Label>
              <Input
                id="requestorName"
                required
                value={formData.requestorName}
                onChange={(e) => setFormData({ ...formData, requestorName: e.target.value })}
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestorEmail">Email Address</Label>
              <Input
                id="requestorEmail"
                type="email"
                required
                value={formData.requestorEmail}
                onChange={(e) => setFormData({ ...formData, requestorEmail: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestorPhone">Phone Number (Optional)</Label>
              <Input
                id="requestorPhone"
                type="tel"
                value={formData.requestorPhone}
                onChange={(e) => setFormData({ ...formData, requestorPhone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestorRole">Your Role</Label>
              <Select
                value={formData.requestorRole}
                onValueChange={(value) => setFormData({ ...formData, requestorRole: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Business Owner</SelectItem>
                  <SelectItem value="authorized_representative">Authorized Representative</SelectItem>
                  <SelectItem value="legal_counsel">Legal Counsel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason for Removal */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Removal Request</Label>
            <Textarea
              id="reason"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please explain why you want this listing removed..."
              rows={4}
            />
          </div>

          {/* Legal Basis */}
          <div className="space-y-2">
            <Label htmlFor="legalBasis">Legal Basis (Optional)</Label>
            <Select
              value={formData.legalBasis}
              onValueChange={(value) => setFormData({ ...formData, legalBasis: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select if applicable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="copyright">Copyright Infringement</SelectItem>
                <SelectItem value="trademark">Trademark Violation</SelectItem>
                <SelectItem value="privacy">Privacy Concerns</SelectItem>
                <SelectItem value="accuracy">Inaccurate Information</SelectItem>
                <SelectItem value="other">Other Legal Reason</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional Information (Optional)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Any additional details or documentation references..."
              rows={3}
            />
          </div>

          {/* Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">Important Notice</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>We will review your request within 24-48 hours</li>
                  <li>You will receive email confirmation of your submission</li>
                  <li>Additional verification may be required</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Removal Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}