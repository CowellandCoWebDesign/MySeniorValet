import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VendorVerificationModal } from "./vendor-verification-modal";
import type { Community } from "@shared/schema";

interface MessageCommunityButtonProps {
  community: Community;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

// Define major vendors that require special verification
const MAJOR_VENDORS = [
  'Walmart', 'Target', 'Amazon', 'Google', 'Microsoft', 'Apple',
  'Brookdale', 'Sunrise Senior Living', 'Holiday Retirement',
  'Five Star Senior Living', 'Atria Senior Living', 'Silverado',
  'Enlivant', 'Discovery Senior Living', 'Capital Senior Living',
  'The Arbor Company', 'Senior Lifestyle', 'Integral Senior Living'
];

export function MessageCommunityButton({ 
  community, 
  variant = "outline",
  size = "default",
  className 
}: MessageCommunityButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check if this is a major vendor
  const isMajorVendor = MAJOR_VENDORS.some(vendor => 
    community.name.toLowerCase().includes(vendor.toLowerCase())
  );

  // Check if community has been claimed and verified
  const isVerified = community.claimedBy || community.vendorClaimed;
  const hasContactInfo = community.phone || community.email;

  // Get user info
  const { data: user } = useQuery<{ id: string; email: string; name?: string }>({
    queryKey: ["/api/auth/user"],
  });

  // Create conversation and send first message
  const startConversationMutation = useMutation({
    mutationFn: async (content: string) => {
      // First create the conversation
      const conversationResponse = await fetch("/api/messaging/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "community",
          subject: `Inquiry about ${community.name}`,
          communityId: community.id,
          metadata: { communityName: community.name },
        }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Failed to create conversation");
      }

      const conversation = await conversationResponse.json();

      // Then send the first message
      const messageResponse = await fetch(`/api/messaging/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!messageResponse.ok) {
        throw new Error("Failed to send message");
      }

      return conversation;
    },
    onSuccess: (conversation) => {
      toast({
        title: "Message sent!",
        description: "Your message has been sent to the community.",
      });
      setShowDialog(false);
      setMessageContent("");
      // Navigate to the messaging page
      navigate("/messaging");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    startConversationMutation.mutate(messageContent.trim());
  };

  const handleClaimCommunity = () => {
    if (isMajorVendor) {
      // For major vendors, show verification modal
      setShowVerificationModal(true);
    } else {
      // For regular communities, navigate to claim page
      navigate(`/claim-community/${community.id}`);
    }
  };

  // If community is not verified, show claim button
  if (!isVerified) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={handleClaimCommunity}
          className={className || "bg-yellow-50 hover:bg-yellow-100 border-yellow-300 text-yellow-700 font-semibold"}
        >
          <Shield className="h-5 w-5 mr-2" />
          {isMajorVendor ? "Verify & Claim Listing" : "Claim & Verify Contact Info"}
        </Button>

        {/* Vendor Verification Modal for Major Vendors */}
        {isMajorVendor && (
          <VendorVerificationModal
            isOpen={showVerificationModal}
            onClose={() => setShowVerificationModal(false)}
            vendorName={community.name}
            communityId={community.id}
            isMajorVendor={true}
          />
        )}
      </>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          toast({
            title: "Sign in required",
            description: "Please sign in to message this community.",
          });
          navigate("/api/login");
        }}
        className={className || "bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 font-semibold"}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Send Message
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant={variant}
        size={size}
        onClick={() => setShowDialog(true)}
        className={className || "bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700 font-semibold"}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Send Message
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Message {community.name}</DialogTitle>
            <DialogDescription>
              Send a message to inquire about availability, schedule a tour, or ask questions.
            </DialogDescription>
          </DialogHeader>

          {!hasContactInfo && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                This community hasn't claimed their listing yet. Your message will be stored and delivered once they verify their contact information.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Hello, I'm interested in learning more about your community. I'd like to know about availability, pricing, and care services..."
              className="min-h-[150px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || startConversationMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {startConversationMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}