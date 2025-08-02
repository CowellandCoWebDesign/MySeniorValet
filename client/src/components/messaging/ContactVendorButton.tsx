import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ContactVendorButtonProps {
  vendorId: number;
  vendorName: string;
  communityId?: number;
  communityName?: string;
}

export function ContactVendorButton({ vendorId, vendorName, communityId, communityName }: ContactVendorButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      // Create conversation
      const conversationResponse = await apiRequest('POST', '/api/messaging/conversations', {
        type: 'customer_vendor',
        subject: subject || `Inquiry about ${communityName || vendorName}`,
        priority: 'medium',
        metadata: {
          vendorId,
          customerId: user?.id,
          communityId
        },
        participants: [
          { vendorId, role: 'vendor' },
          { userId: user?.id, role: 'customer' }
        ]
      });

      // Send first message
      if (message.trim()) {
        await apiRequest('POST', `/api/messaging/conversations/${conversationResponse.conversation.id}/messages`, {
          senderId: user?.id,
          senderType: 'user',
          content: message.trim()
        });
      }

      return conversationResponse;
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent',
        description: `Your message has been sent to ${vendorName}. They will respond soon.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
      setShowDialog(false);
      // Reset form
      setSubject('');
      setMessage('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSend = () => {
    if (!user?.id) {
      toast({
        title: 'Sign In Required',
        description: 'Please sign in to contact vendors.',
        variant: 'destructive',
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: 'Message Required',
        description: 'Please enter a message before sending.',
        variant: 'destructive',
      });
      return;
    }

    createConversationMutation.mutate();
  };

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant="outline"
        className="gap-2"
      >
        <MessageSquare className="h-4 w-4" />
        Contact Vendor
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Contact {vendorName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`Inquiry about ${communityName || vendorName}`}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello, I'm interested in learning more about your services..."
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || createConversationMutation.isPending}
            >
              {createConversationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}