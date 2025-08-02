import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId?: number;
  userId?: number;
  role: 'vendor' | 'customer';
}

export function NewConversationDialog({ open, onOpenChange, vendorId, userId, role }: NewConversationDialogProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<string>(role === 'vendor' ? 'vendor_support' : 'customer_vendor');
  const [priority, setPriority] = useState('medium');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createConversationMutation = useMutation({
    mutationFn: async (data: any) => {
      // Create conversation
      const conversationResponse = await apiRequest('POST', '/api/messaging/conversations', {
        type,
        subject,
        priority,
        metadata: {},
        participants: [
          vendorId ? { vendorId, role: 'vendor' } : { userId, role: 'customer' },
          type === 'vendor_support' ? { userId: 1, role: 'support' } : {} // Admin user ID 1 for support
        ].filter(p => p.role)
      });

      // Send first message
      if (content.trim()) {
        await apiRequest('POST', `/api/messaging/conversations/${conversationResponse.conversation.id}/messages`, {
          senderVendorId: vendorId || null,
          senderId: userId || null,
          senderType: role,
          content: content.trim()
        });
      }

      return conversationResponse;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Conversation created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/messaging/conversations'] });
      onOpenChange(false);
      // Reset form
      setSubject('');
      setContent('');
      setType(role === 'vendor' ? 'vendor_support' : 'customer_vendor');
      setPriority('medium');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {role === 'vendor' ? (
                  <>
                    <SelectItem value="vendor_support">Support Request</SelectItem>
                    <SelectItem value="customer_vendor">Customer Message</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="customer_vendor">Contact Vendor</SelectItem>
                    <SelectItem value="admin_support">Platform Support</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your inquiry"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your request in detail..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => createConversationMutation.mutate({})}
            disabled={!subject.trim() || createConversationMutation.isPending}
          >
            {createConversationMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Start Conversation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}