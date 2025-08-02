import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TourFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: number;
  tourDetails: {
    communityName: string;
    tourDate: string;
    userName?: string;
  };
}

export function TourFeedbackModal({ isOpen, onClose, tourId, tourDetails }: TourFeedbackModalProps) {
  const { toast } = useToast();
  const [overallRating, setOverallRating] = useState<number>(0);
  const [overallImpression, setOverallImpression] = useState("");
  const [tourNotes, setTourNotes] = useState("");
  const [pricingInfo, setPricingInfo] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [likelihood, setLikelihood] = useState("");
  const [shareContactInfo, setShareContactInfo] = useState(true);
  const [shareNotes, setShareNotes] = useState(false);
  // Removed sharePricing - will always share automatically

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/tours/${tourId}/feedback`, data);
    },
    onSuccess: (data) => {
      toast({
        title: "Feedback Submitted Successfully",
        description: "Thank you for completing the tour feedback. All parties have been notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tours'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Submit Feedback",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide an overall rating for the tour",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate({
      overallImpression,
      tourNotes,
      pricingInfo,
      overallRating,
      wouldRecommend,
      likelihood,
      shareContactInfo,
      shareNotes,
      sharePricing: true, // Always share pricing info automatically
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tour Feedback - {tourDetails.communityName}</DialogTitle>
          <DialogDescription>
            Please provide feedback for the tour on {new Date(tourDetails.tourDate).toLocaleDateString()}.
            Your feedback helps improve the experience for everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Overall Rating*</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Star
                  key={rating}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    rating <= overallRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                  onClick={() => setOverallRating(rating)}
                />
              ))}
            </div>
          </div>

          {/* Overall Impression */}
          <div className="space-y-2">
            <Label>Overall Impression</Label>
            <Textarea
              placeholder="Share your overall thoughts about the tour and community..."
              value={overallImpression}
              onChange={(e) => setOverallImpression(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tour Notes */}
          <div className="space-y-2">
            <Label>Tour Notes</Label>
            <Textarea
              placeholder="Any specific observations or details from the tour..."
              value={tourNotes}
              onChange={(e) => setTourNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pricing Information */}
          <div className="space-y-2">
            <Label>Pricing Discussion</Label>
            <Textarea
              placeholder="Any pricing information discussed during the tour..."
              value={pricingInfo}
              onChange={(e) => setPricingInfo(e.target.value)}
              rows={2}
            />
          </div>

          {/* Would Recommend */}
          <div className="space-y-2">
            <Label>Would you recommend this community?</Label>
            <RadioGroup
              value={wouldRecommend === null ? "" : wouldRecommend.toString()}
              onValueChange={(value) => setWouldRecommend(value === "true")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="recommend-yes" />
                <Label htmlFor="recommend-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="recommend-no" />
                <Label htmlFor="recommend-no">No</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Likelihood to Move In */}
          <div className="space-y-2">
            <Label>Likelihood to Move In</Label>
            <Select value={likelihood} onValueChange={setLikelihood}>
              <SelectTrigger>
                <SelectValue placeholder="Select likelihood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_likely">Very Likely</SelectItem>
                <SelectItem value="likely">Likely</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="unlikely">Unlikely</SelectItem>
                <SelectItem value="very_unlikely">Very Unlikely</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sharing Preferences */}
          <div className="space-y-3">
            <Label>Information Sharing</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-contact"
                  checked={shareContactInfo}
                  onCheckedChange={(checked) => setShareContactInfo(!!checked)}
                />
                <Label htmlFor="share-contact" className="text-sm">
                  Share my contact information with the community
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share-notes"
                  checked={shareNotes}
                  onCheckedChange={(checked) => setShareNotes(!!checked)}
                />
                <Label htmlFor="share-notes" className="text-sm">
                  Share my tour notes with the community
                </Label>
              </div>
              <div className="text-sm text-gray-600 italic">
                * Pricing discussions are automatically shared to ensure transparency
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-1">Privacy Promise</p>
            <p className="text-blue-700">
              MySeniorValet will never sell your information. We only connect you directly with communities, 
              cutting out the middle confusion. All shared information goes directly to the community and MySeniorValet 
              for quality assurance purposes.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={submitFeedbackMutation.isPending}
          >
            {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}