import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Info, Check, Loader, Phone, Mail, User, Calendar, HelpCircle, MessageSquare, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface RequestInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: {
    id: number;
    name: string;
    city?: string;
    state?: string;
  };
}

export function RequestInfoDialog({ open, onOpenChange, community }: RequestInfoDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [requestDetails, setRequestDetails] = useState({
    interestedParty: 'self',
    timeframe: '',
    specificQuestions: '',
    requestTypes: {
      pricing: true,
      availability: true,
      tourScheduling: false,
      careServices: false,
      amenities: false,
      virtualTour: false,
      brochure: false,
      insurance: false
    }
  });
  
  // Initialize contact info from user data when dialog opens
  useEffect(() => {
    if (open && user) {
      setContactInfo({
        name: user?.firstName && user?.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user?.email?.split('@')[0] || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    }
  }, [open, user]);

  const handleSubmit = async () => {
    // Validate contact information
    if (!contactInfo.name || !contactInfo.email || !contactInfo.phone) {
      alert('Please provide all contact information (name, email, and phone)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/communities/request-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          communityId: community.id,
          communityName: community.name,
          communityLocation: community.city && community.state ? `${community.city}, ${community.state}` : '',
          ...contactInfo,
          ...requestDetails,
          requestedInfo: Object.entries(requestDetails.requestTypes)
            .filter(([_, value]) => value)
            .map(([key]) => key)
        })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        if (response.ok) {
          alert(`Thank you! Your information request for ${community.name} has been submitted. The community will contact you within 24-48 hours.`);
          onOpenChange(false);
          resetForm();
        } else {
          alert('Failed to submit request. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }
      
      if (response.ok && data.success) {
        alert(data.message || `Thank you! Your information request for ${community.name} has been submitted. The community will contact you within 24-48 hours.`);
        onOpenChange(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to submit request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting information request:', error);
      alert('Failed to submit request. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setRequestDetails({
      interestedParty: 'self',
      timeframe: '',
      specificQuestions: '',
      requestTypes: {
        pricing: true,
        availability: true,
        tourScheduling: false,
        careServices: false,
        amenities: false,
        virtualTour: false,
        brochure: false,
        insurance: false
      }
    });
    setContactInfo({
      name: '',
      email: '',
      phone: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center space-x-2">
            <Info className="h-6 w-6 text-blue-600" />
            <span>Request Information - {community.name}</span>
          </DialogTitle>
          <DialogDescription>
            Get detailed information about this community. We'll connect you directly with the community within 24-48 hours.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Your Contact Information
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="contactName">Full Name <span className="text-red-500">*</span></Label>
                <Input
                  id="contactName"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Information Request Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              What information would you like? (select all that apply)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries({
                pricing: 'Current Pricing & Fees',
                availability: 'Unit Availability',
                tourScheduling: 'Schedule a Tour',
                careServices: 'Care Services Offered',
                amenities: 'Amenities & Activities',
                virtualTour: 'Virtual Tour',
                brochure: 'Community Brochure',
                insurance: 'Insurance Accepted'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={requestDetails.requestTypes[key as keyof typeof requestDetails.requestTypes]}
                    onCheckedChange={(checked) => 
                      setRequestDetails({
                        ...requestDetails,
                        requestTypes: {
                          ...requestDetails.requestTypes,
                          [key]: checked as boolean
                        }
                      })
                    }
                  />
                  <Label 
                    htmlFor={key} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="interestedParty">Who is this information for?</Label>
              <Select 
                value={requestDetails.interestedParty} 
                onValueChange={(value) => setRequestDetails({...requestDetails, interestedParty: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interested party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">Myself</SelectItem>
                  <SelectItem value="parent">My Parent</SelectItem>
                  <SelectItem value="spouse">My Spouse</SelectItem>
                  <SelectItem value="relative">Other Family Member</SelectItem>
                  <SelectItem value="client">My Client (Professional)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timeframe">
                <Calendar className="h-4 w-4 inline mr-1" />
                When are you looking to move?
              </Label>
              <Select 
                value={requestDetails.timeframe} 
                onValueChange={(value) => setRequestDetails({...requestDetails, timeframe: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediately</SelectItem>
                  <SelectItem value="1-month">Within 1 month</SelectItem>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="6-months">Within 6 months</SelectItem>
                  <SelectItem value="1-year">Within 1 year</SelectItem>
                  <SelectItem value="exploring">Just exploring options</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="specificQuestions">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Specific Questions or Needs (Optional)
              </Label>
              <Textarea 
                id="specificQuestions"
                placeholder="Please share any specific questions, care needs, or preferences..."
                value={requestDetails.specificQuestions}
                onChange={(e) => setRequestDetails({...requestDetails, specificQuestions: e.target.value})}
                rows={4}
              />
            </div>
          </div>
          
          {/* What Happens Next */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
              <FileText className="h-5 w-5 inline mr-2" />
              What Happens Next?
            </h4>
            <ol className="text-sm text-green-800 dark:text-green-300 space-y-1 list-decimal list-inside">
              <li>Your request will be sent directly to {community.name}</li>
              <li>A community representative will contact you within 24-48 hours</li>
              <li>They'll provide all requested information and answer your questions</li>
              <li>You can schedule a tour if interested</li>
              <li>No obligation or commitment required</li>
            </ol>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !contactInfo.name || !contactInfo.email || !contactInfo.phone}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Send Information Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}