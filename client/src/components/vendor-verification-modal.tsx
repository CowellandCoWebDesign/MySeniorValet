import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, Building2, CheckCircle2, Info, FileText, Briefcase, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VendorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorName: string;
  communityId: number;
  isMajorVendor: boolean;
}

const MAJOR_VENDORS = [
  'Walmart', 'Target', 'Amazon', 'Google', 'Microsoft', 'Apple',
  'Brookdale', 'Sunrise Senior Living', 'Holiday Retirement',
  'Five Star Senior Living', 'Atria Senior Living', 'Silverado',
  'Enlivant', 'Discovery Senior Living', 'Capital Senior Living',
  'The Arbor Company', 'Senior Lifestyle', 'Integral Senior Living'
];

export function VendorVerificationModal({
  isOpen,
  onClose,
  vendorName,
  communityId,
  isMajorVendor
}: VendorVerificationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [verificationData, setVerificationData] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    employeeId: '',
    department: '',
    verificationMethod: '',
    corporateEmail: '',
    linkedinProfile: '',
    additionalNotes: '',
    documentationType: '',
    documentNumber: ''
  });

  const handleSubmit = async () => {
    // Validate required fields
    if (!verificationData.fullName || !verificationData.email || !verificationData.title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // For major vendors, require additional verification
    if (isMajorVendor && !verificationData.verificationMethod) {
      toast({
        title: "Verification Required",
        description: "Major vendor claims require verification method selection",
        variant: "destructive"
      });
      return;
    }

    try {
      // Submit verification request
      const response = await fetch('/api/vendor/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          vendorName,
          ...verificationData,
          isMajorVendor,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Verification Submitted",
          description: isMajorVendor 
            ? "Your verification request has been submitted for review. We'll contact you within 24-48 hours."
            : "Your community claim has been submitted. You'll receive confirmation shortly.",
        });
        onClose();
      } else {
        throw new Error('Verification submission failed');
      }
    } catch (error) {
      toast({
        title: "Submission Error",
        description: "Unable to submit verification. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={verificationData.fullName}
            onChange={(e) => setVerificationData({...verificationData, fullName: e.target.value})}
            placeholder="John Smith"
            required
          />
        </div>
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={verificationData.title}
            onChange={(e) => setVerificationData({...verificationData, title: e.target.value})}
            placeholder="Community Manager"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Business Email *</Label>
          <Input
            id="email"
            type="email"
            value={verificationData.email}
            onChange={(e) => setVerificationData({...verificationData, email: e.target.value})}
            placeholder="john@company.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Business Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={verificationData.phone}
            onChange={(e) => setVerificationData({...verificationData, phone: e.target.value})}
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>

      {isMajorVendor && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={verificationData.employeeId}
                onChange={(e) => setVerificationData({...verificationData, employeeId: e.target.value})}
                placeholder="EMP123456"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={verificationData.department}
                onValueChange={(value) => setVerificationData({...verificationData, department: value})}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="administration">Administration</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="regional">Regional Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              As this is a major vendor ({vendorName}), additional verification will be required.
              Our team will contact you within 24-48 hours to complete the verification process.
            </AlertDescription>
          </Alert>
        </>
      )}

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={() => setStep(2)}>
          Continue to Verification
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Choose how you'd like to verify your affiliation with {vendorName}
        </AlertDescription>
      </Alert>

      <div>
        <Label htmlFor="verificationMethod">Verification Method *</Label>
        <Select
          value={verificationData.verificationMethod}
          onValueChange={(value) => setVerificationData({...verificationData, verificationMethod: value})}
        >
          <SelectTrigger id="verificationMethod">
            <SelectValue placeholder="Select verification method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corporate_email">Corporate Email Verification</SelectItem>
            <SelectItem value="employee_id">Employee ID Verification</SelectItem>
            <SelectItem value="linkedin">LinkedIn Profile Verification</SelectItem>
            <SelectItem value="documentation">Business Documentation</SelectItem>
            <SelectItem value="phone_verification">Phone Verification with Corporate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {verificationData.verificationMethod === 'corporate_email' && (
        <div>
          <Label htmlFor="corporateEmail">Corporate Email Domain</Label>
          <Input
            id="corporateEmail"
            type="email"
            value={verificationData.corporateEmail}
            onChange={(e) => setVerificationData({...verificationData, corporateEmail: e.target.value})}
            placeholder="john@brookdale.com"
          />
          <p className="text-sm text-gray-500 mt-1">
            We'll send a verification code to this email address
          </p>
        </div>
      )}

      {verificationData.verificationMethod === 'linkedin' && (
        <div>
          <Label htmlFor="linkedinProfile">LinkedIn Profile URL</Label>
          <Input
            id="linkedinProfile"
            value={verificationData.linkedinProfile}
            onChange={(e) => setVerificationData({...verificationData, linkedinProfile: e.target.value})}
            placeholder="https://linkedin.com/in/yourprofile"
          />
          <p className="text-sm text-gray-500 mt-1">
            Your LinkedIn profile must show current employment at {vendorName}
          </p>
        </div>
      )}

      {verificationData.verificationMethod === 'documentation' && (
        <div className="space-y-3">
          <div>
            <Label htmlFor="documentationType">Document Type</Label>
            <Select
              value={verificationData.documentationType}
              onValueChange={(value) => setVerificationData({...verificationData, documentationType: value})}
            >
              <SelectTrigger id="documentationType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business_license">Business License</SelectItem>
                <SelectItem value="employment_letter">Employment Verification Letter</SelectItem>
                <SelectItem value="corporate_id">Corporate ID Card</SelectItem>
                <SelectItem value="authorization_letter">Letter of Authorization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="documentNumber">Document Number (if applicable)</Label>
            <Input
              id="documentNumber"
              value={verificationData.documentNumber}
              onChange={(e) => setVerificationData({...verificationData, documentNumber: e.target.value})}
              placeholder="DOC-123456"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="additionalNotes">Additional Information</Label>
        <Textarea
          id="additionalNotes"
          value={verificationData.additionalNotes}
          onChange={(e) => setVerificationData({...verificationData, additionalNotes: e.target.value})}
          placeholder="Any additional information to support your verification..."
          rows={3}
        />
      </div>

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Once verified, you'll be able to:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Update community information and pricing</li>
            <li>Respond to resident inquiries</li>
            <li>Access analytics and insights</li>
            <li>Manage photos and virtual tours</li>
            <li>Enable direct messaging with families</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            Submit Verification Request
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Verify Your Affiliation with {vendorName}</span>
          </DialogTitle>
          <DialogDescription>
            {isMajorVendor ? (
              <>
                <span className="font-medium text-orange-600">Major Vendor Verification Required</span>
                <br />
                To claim and manage this {vendorName} community, we need to verify your official affiliation.
                This helps protect against unauthorized claims and ensures accurate information.
              </>
            ) : (
              "Please provide your information to claim and manage this community listing."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Contact Info</span>
              </div>
              
              <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              
              <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Verification</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>
      </DialogContent>
    </Dialog>
  );
}