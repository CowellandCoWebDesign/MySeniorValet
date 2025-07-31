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
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MessageCommunityButtonProps {
  communityId: number;
  communityName: string;
}

export function MessageCommunityButton({ communityId, communityName }: MessageCommunityButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

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
          subject: `Inquiry about ${communityName}`,
          communityId,
          metadata: { communityName },
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

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Sign in required",
            description: "Please sign in to message this community.",
          });
          navigate("/login");
        }}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setShowDialog(true)}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {communityName}</DialogTitle>
            <DialogDescription>
              Send a message to inquire about availability, schedule a tour, or ask questions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Hello, I'm interested in learning more about your community..."
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