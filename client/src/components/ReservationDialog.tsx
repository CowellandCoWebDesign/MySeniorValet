import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Check, Loader } from 'lucide-react';

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: {
    id: number;
    name: string;
  };
}

export function ReservationDialog({ open, onOpenChange, community }: ReservationDialogProps) {
  const [reservationForm, setReservationForm] = useState({
    unitType: '',
    moveInDate: '',
    lengthOfStay: '',
    careNeeds: '',
    budget: '',
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reservations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include credentials for authentication
        body: JSON.stringify({
          communityId: community.id,
          communityName: community.name,
          ...reservationForm
        })
      });
      
      // Check if response is ok before trying to parse JSON
      if (response.status === 401) {
        // User is not authenticated
        const confirmed = confirm('You need to sign in to place a reservation. Would you like to sign in now?');
        if (confirmed) {
          window.location.href = '/api/login';
        }
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || 'Failed to submit reservation');
      } else {
        alert(`Success! Your reservation at ${community.name} has been submitted. The community will contact you within 24-48 hours.`);
        onOpenChange(false);
        setReservationForm({
          unitType: '',
          moveInDate: '',
          lengthOfStay: '',
          careNeeds: '',
          budget: '',
          additionalNotes: ''
        });
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('Failed to submit reservation. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            <span>Reserve at {community.name}</span>
          </DialogTitle>
          <DialogDescription>
            Secure your spot with a $500 deposit - Pay at arrival, no upfront payment required!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Reservation Benefits */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">✅ Why Reserve Now?</h4>
            <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
              <li>• Priority access to available units</li>
              <li>• Lock in current pricing</li>
              <li>• No payment until move-in</li>
              <li>• Fully refundable if plans change</li>
            </ul>
          </div>
          
          {/* Reservation Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="unitType">Preferred Unit Type</Label>
              <Select value={reservationForm.unitType} onValueChange={(value) => setReservationForm({...reservationForm, unitType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="1bedroom">1 Bedroom</SelectItem>
                  <SelectItem value="2bedroom">2 Bedroom</SelectItem>
                  <SelectItem value="any">Any Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="moveInDate">Desired Move-In Date</Label>
              <Input 
                type="date" 
                id="moveInDate"
                value={reservationForm.moveInDate}
                onChange={(e) => setReservationForm({...reservationForm, moveInDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <Label htmlFor="lengthOfStay">Length of Stay</Label>
              <Select value={reservationForm.lengthOfStay} onValueChange={(value) => setReservationForm({...reservationForm, lengthOfStay: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select length of stay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-weeks">2 Week Trial</SelectItem>
                  <SelectItem value="1-month">1 Month Trial</SelectItem>
                  <SelectItem value="3-months">3 Months (Standard)</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="permanent">Permanent Residency</SelectItem>
                  <SelectItem value="flexible">Flexible/To Be Discussed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="careNeeds">Care Needs</Label>
              <Select value={reservationForm.careNeeds} onValueChange={(value) => setReservationForm({...reservationForm, careNeeds: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select care level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="independent">Independent Living</SelectItem>
                  <SelectItem value="assisted">Assisted Living</SelectItem>
                  <SelectItem value="memory">Memory Care</SelectItem>
                  <SelectItem value="skilled">Skilled Nursing</SelectItem>
                  <SelectItem value="unsure">Not Sure Yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="budget">Budget Range (per month)</Label>
              <Select value={reservationForm.budget} onValueChange={(value) => setReservationForm({...reservationForm, budget: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-3000">Under $3,000</SelectItem>
                  <SelectItem value="3000-4000">$3,000 - $4,000</SelectItem>
                  <SelectItem value="4000-5000">$4,000 - $5,000</SelectItem>
                  <SelectItem value="5000-6000">$5,000 - $6,000</SelectItem>
                  <SelectItem value="6000-plus">Over $6,000</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
              <Textarea 
                id="additionalNotes"
                placeholder="Any special requirements or questions..."
                value={reservationForm.additionalNotes}
                onChange={(e) => setReservationForm({...reservationForm, additionalNotes: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          {/* Payment Terms */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">💳 Payment Terms</h4>
            <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <div className="flex justify-between">
                <span>Deposit Amount:</span>
                <span className="font-bold">$500</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Due:</span>
                <span className="font-bold">At move-in only</span>
              </div>
              <div className="flex justify-between">
                <span>Refund Policy:</span>
                <span className="font-bold">100% refundable</span>
              </div>
            </div>
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
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting || !reservationForm.unitType || !reservationForm.moveInDate || !reservationForm.lengthOfStay || !reservationForm.budget}
            title={!reservationForm.unitType || !reservationForm.moveInDate || !reservationForm.lengthOfStay || !reservationForm.budget ? 'Please fill in all required fields' : ''}
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirm Reservation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}