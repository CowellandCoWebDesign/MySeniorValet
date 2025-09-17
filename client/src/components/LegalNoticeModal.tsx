import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Shield, Scale, AlertTriangle, CheckCircle2, FileText, Search } from "lucide-react";

export function LegalNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already seen and accepted the legal notice
    const hasSeenLegalNotice = localStorage.getItem("hasSeenLegalNotice");
    
    // Small delay to ensure smooth page load
    setTimeout(() => {
      if (!hasSeenLegalNotice || hasSeenLegalNotice !== "true") {
        setIsOpen(true);
      }
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleAccept = () => {
    if (acknowledged) {
      // Save to localStorage
      localStorage.setItem("hasSeenLegalNotice", "true");
      localStorage.setItem("legalNoticeAcceptedDate", new Date().toISOString());
      setIsOpen(false);
    }
  };

  // Don't render anything while checking localStorage
  if (isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Professional Legal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 border-b-4 border-amber-500">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Scale className="w-8 h-8 text-amber-400" />
              <span>Legal Notice & Platform Disclosure</span>
            </DialogTitle>
            <DialogDescription className="text-gray-200 mt-2 text-base">
              Important Information About MySeniorValet - Free Platform for Families
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[50vh] p-6">
          <div className="space-y-6">
            {/* Primary Notice */}
            <Alert className="border-2 border-blue-600 bg-blue-50 dark:bg-blue-950/30">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-base font-semibold text-gray-900 dark:text-gray-100">
                MySeniorValet is a FREE PLATFORM for families providing transparency in senior care.
              </AlertDescription>
            </Alert>

            {/* Key Disclosures */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Platform Purpose & Limitations
              </h3>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Free Tools & Transparent Information</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We aggregate and display public information from verified sources with citations. 
                      All family features are FREE: research, tour scheduling, emergency contacts, collaboration tools.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Not a Placement Agency</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      We facilitate connections between families and communities but are NOT a placement agency. 
                      We do NOT charge families any fees or commissions - all revenue comes from B2B services.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Independent Verification Required</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All information must be independently verified by users. Contact facilities directly, visit in person, 
                      and consult with appropriate professionals before making any decisions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">Transparency Commitment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When we have featured partners, paid placements, affiliate relationships, or subscription services, they will be clearly marked with badges 
                      and disclosures. We protect against false steering claims through complete transparency.
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Protection Statement */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 rounded-lg p-4">
                <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Legal Protection & Fair Housing Compliance
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  MySeniorValet operates in full compliance with Fair Housing laws and regulations. We provide equal access 
                  to information about all listed communities without discrimination. Our research platform model ensures 
                  no steering, bias, or preferential treatment in how information is presented or accessed.
                </p>
              </div>

              {/* Revenue Model Disclosure */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Revenue Model & Services
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  MySeniorValet may generate revenue through:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-5 list-disc space-y-1">
                  <li>Subscription services available for communities and vendors who choose to enhance their presence</li>
                  <li>Affiliate marketing partnerships (currently with select services like Amazon and 1-800-Flowers)</li>
                  <li>Premium features and tools for business users</li>
                </ul>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  All active paid relationships and affiliate links are transparently disclosed to maintain trust and comply with FTC guidelines.
                </p>
              </div>

              {/* Disclaimer */}
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  <strong className="text-red-700 dark:text-red-400">DISCLAIMER:</strong> MySeniorValet is not a placement agency, 
                  referral service, or care advisor. We may earn affiliate commissions from select partnerships (such as Amazon and floral services), 
                  which are clearly marked. These relationships do not influence the neutrality of our research platform. 
                  Information provided is for research purposes only and should not be considered professional advice. 
                  Always consult qualified professionals for legal, medical, financial, or care-related decisions.
                </p>
              </div>
            </div>

            {/* Acknowledgment Checkbox */}
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-700">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                  className="mt-1"
                  data-testid="checkbox-acknowledge-legal"
                />
                <Label 
                  htmlFor="acknowledge" 
                  className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer leading-relaxed"
                >
                  I understand that MySeniorValet is a research-only platform providing publicly available information 
                  with citations. I acknowledge that all information must be independently verified and that MySeniorValet 
                  does not provide recommendations or endorsements. I understand that any featured partners, paid 
                  placements, subscription services, or affiliate relationships will be clearly marked and disclosed.
                </Label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="bg-gray-50 dark:bg-gray-900 border-t px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By continuing, you agree to use this platform for research purposes only.
            </p>
            <Button
              onClick={handleAccept}
              disabled={!acknowledged}
              className="min-w-[150px]"
              data-testid="button-accept-legal"
            >
              {acknowledged ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  I Understand
                </>
              ) : (
                "Please Acknowledge"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}