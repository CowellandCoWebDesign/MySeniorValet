import React, { useState } from 'react';
import { Share2, Copy, Mail, MessageSquare, Users, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Community {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  priceRange?: { min: number; max: number };
  careTypes: string[];
  rating?: string;
  photos?: string[];
  phone?: string;
  website?: string;
}

interface FamilyShareButtonProps {
  community: Community;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

export function FamilyShareButton({ 
  community, 
  className = '', 
  variant = 'default',
  size = 'default'
}: FamilyShareButtonProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [emailAddresses, setEmailAddresses] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [shareMode, setShareMode] = useState<'email' | 'link' | 'text'>('link');
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate shareable link with community details
  const generateShareableLink = () => {
    const baseUrl = window.location.origin;
    const communityUrl = `${baseUrl}/community/${community.id}`;
    const shareParams = new URLSearchParams({
      name: community.name,
      city: community.city,
      state: community.state,
      shared: 'true'
    });
    return `${communityUrl}?${shareParams.toString()}`;
  };

  // Generate formatted share text
  const generateShareText = () => {
    const pricing = community.priceRange 
      ? `$${community.priceRange.min.toLocaleString()} - $${community.priceRange.max.toLocaleString()}/month`
      : 'Contact for pricing';
    
    const careTypes = community.careTypes.join(', ');
    const rating = community.rating ? `${community.rating}/5 stars` : 'See reviews';
    
    return `🏡 Found this senior living community for you:

${community.name}
📍 ${community.address}, ${community.city}, ${community.state}
💰 ${pricing}
🏥 Care Types: ${careTypes}
⭐ Rating: ${rating}

${personalMessage ? `Personal note: ${personalMessage}\n\n` : ''}View full details: ${generateShareableLink()}

Shared via TrueView - Clarity in Senior Living`;
  };

  // Handle copying to clipboard
  const handleCopyLink = async () => {
    try {
      const shareText = shareMode === 'link' ? generateShareableLink() : generateShareText();
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({
        title: 'Copied to clipboard!',
        description: shareMode === 'link' ? 'Share link copied' : 'Community details copied',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please try selecting and copying the text manually',
        variant: 'destructive',
      });
    }
  };

  // Handle email sharing
  const handleEmailShare = async () => {
    if (!emailAddresses.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter at least one email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    
    try {
      const emails = emailAddresses.split(',').map(email => email.trim()).filter(Boolean);
      const shareText = generateShareText();
      
      // In a real implementation, this would call your email service
      // For now, we'll simulate the email send and create a mailto link
      const subject = encodeURIComponent(`Senior Living Community: ${community.name}`);
      const body = encodeURIComponent(shareText);
      const mailtoLink = `mailto:${emails.join(',')}?subject=${subject}&body=${body}`;
      
      window.location.href = mailtoLink;
      
      toast({
        title: 'Email ready to send!',
        description: `Community details prepared for ${emails.length} recipient${emails.length > 1 ? 's' : ''}`,
      });
      
      setIsShareDialogOpen(false);
      setEmailAddresses('');
      setPersonalMessage('');
    } catch (error) {
      toast({
        title: 'Email failed',
        description: 'Please try again or copy the link manually',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle native sharing (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Senior Living: ${community.name}`,
          text: generateShareText(),
          url: generateShareableLink(),
        });
      } catch (error) {
        // User cancelled or sharing failed
        console.log('Native share cancelled');
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <>
      {/* Quick Share Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Share2 className="h-4 w-4 mr-2" />
            Share with Family
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium">Share with Family</h4>
            </div>
            
            <div className="text-sm text-gray-600">
              Quick share options for {community.name}
            </div>
            
            <div className="space-y-2">
              {/* Native Share (Mobile) */}
              {navigator.share && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start" 
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via Mobile Apps
                </Button>
              )}
              
              {/* Copy Link */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              
              {/* Email Share */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start" 
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send via Email
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Detailed Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Share Community with Family</span>
            </DialogTitle>
            <DialogDescription>
              Send detailed information about {community.name} to your family members
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Community Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                {community.photos && community.photos[0] && (
                  <img 
                    src={community.photos[0]} 
                    alt={community.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{community.name}</h4>
                  <p className="text-sm text-gray-600">{community.city}, {community.state}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {community.priceRange && (
                      <Badge variant="secondary" className="text-xs">
                        ${community.priceRange.min.toLocaleString()}+/month
                      </Badge>
                    )}
                    {community.rating && (
                      <Badge variant="outline" className="text-xs">
                        ⭐ {community.rating}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Share Mode Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setShareMode('email')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  shareMode === 'email' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mail className="h-4 w-4 mr-1 inline" />
                Email
              </button>
              <button
                onClick={() => setShareMode('link')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  shareMode === 'link' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Copy className="h-4 w-4 mr-1 inline" />
                Copy Link
              </button>
              <button
                onClick={() => setShareMode('text')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  shareMode === 'text' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-1 inline" />
                Copy Text
              </button>
            </div>

            {/* Email Mode */}
            {shareMode === 'email' && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email-addresses">Email Addresses</Label>
                  <Input
                    id="email-addresses"
                    type="email"
                    placeholder="family@example.com, sibling@example.com"
                    value={emailAddresses}
                    onChange={(e) => setEmailAddresses(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple emails with commas
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="personal-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="personal-message"
                    placeholder="Hi everyone, I found this community and thought it might be a good fit for Mom..."
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Link/Text Mode Preview */}
            {(shareMode === 'link' || shareMode === 'text') && (
              <div className="space-y-3">
                <Label>Preview</Label>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {shareMode === 'link' ? generateShareableLink() : generateShareText()}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Cancel
            </Button>
            {shareMode === 'email' ? (
              <Button onClick={handleEmailShare} disabled={isSending}>
                {isSending ? 'Preparing...' : 'Send Email'}
              </Button>
            ) : (
              <Button onClick={handleCopyLink}>
                {copied ? 'Copied!' : `Copy ${shareMode === 'link' ? 'Link' : 'Text'}`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}