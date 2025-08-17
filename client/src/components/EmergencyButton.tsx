import { useState, useEffect } from "react";
import { Phone, AlertTriangle, Heart, Hospital, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";

interface EmergencyContact {
  id: number;
  name: string;
  relationship?: string;
  phone: string;
  isPrimary: boolean;
  contactType: string;
}

interface QuickDialData {
  emergency: {
    number: string;
    label: string;
    type: string;
  };
  primaryContact: EmergencyContact | null;
  otherContacts: EmergencyContact[];
  poison: {
    number: string;
    label: string;
    type: string;
  };
  suicide: {
    number: string;
    label: string;
    type: string;
  };
}

export function EmergencyButton({ userId }: { userId?: string }) {
  const [showDialog, setShowDialog] = useState(false);
  const [quickDialData, setQuickDialData] = useState<QuickDialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(true);
  const { toast } = useToast();
  const { preferences } = useAccessibilityPreferences();

  // Stop pulsing animation after first interaction (moved here to keep all hooks together)
  useEffect(() => {
    const timer = setTimeout(() => {
      setPulseAnimation(false);
    }, 10000); // Stop pulsing after 10 seconds
    return () => clearTimeout(timer);
  }, []);
  
  // Don't render if emergency button is disabled in accessibility preferences
  // This must come AFTER all hooks are defined
  if (!preferences.emergencyButton) {
    return null;
  }

  const fetchQuickDialData = async () => {
    // Allow opening even without userId to show emergency numbers
    if (!userId) {
      // Set default emergency data when no user
      setQuickDialData({
        emergency: { number: "911", label: "Emergency Services", type: "emergency" },
        primaryContact: null,
        otherContacts: [],
        poison: { number: "1-800-222-1222", label: "Poison Control", type: "crisis" },
        suicide: { number: "988", label: "Suicide & Crisis Lifeline", type: "crisis" }
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiRequest("GET", `/api/emergency/quick-dial/${userId}`);
      setQuickDialData(response);
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      toast({
        title: "Error",
        description: "Failed to load emergency contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyClick = async () => {
    setPulseAnimation(false); // Stop pulsing when clicked
    setShowDialog(true);
    fetchQuickDialData();
    
    // Send notification to admin when emergency button is pressed
    try {
      const response = await fetch("/api/emergency/button-pressed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId || "anonymous",
          userEmail: "test-user@example.com", // In production, this would come from user context
          userName: "Test User", // In production, this would come from user context
          location: window.location.pathname
        }),
      });
      
      if (response.ok) {
        console.log("✅ Admin notified of emergency button press");
      }
    } catch (error) {
      console.error("Failed to notify admin:", error);
    }
  };

  const makeCall = (number: string, label: string) => {
    // Format the phone number for tel: link
    const formattedNumber = number.replace(/\D/g, '');
    window.location.href = `tel:${formattedNumber}`;
    
    toast({
      title: "Calling",
      description: `Initiating call to ${label}`,
    });
  };

  return (
    <>
      {/* Floating Emergency Button - Enhanced visibility */}
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Pulsing background effect */}
        {pulseAnimation && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
        )}
        
        {/* Main button */}
        <Button
          onClick={handleEmergencyClick}
          size="lg"
          className="relative h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl transition-all hover:scale-110"
          aria-label="Emergency Contacts - Press for quick access"
        >
          <Phone className="h-8 w-8" />
        </Button>
        
        {/* Tooltip on hover */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Emergency Contacts
          </div>
        </div>
      </div>

      {/* Emergency Contacts Dialog - Enhanced */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
          <DialogHeader className="bg-red-50 dark:bg-red-950 -m-6 mb-4 p-6 rounded-t-lg">
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 animate-pulse" />
              <span className="text-xl font-bold">Emergency Contacts</span>
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Tap any contact to call immediately
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* 911 Emergency - PRIMARY */}
            <Card 
              className="border-2 border-red-500 bg-red-50 dark:bg-red-950 cursor-pointer hover:shadow-xl transition-all transform hover:scale-[1.02]"
              onClick={() => makeCall("911", "Emergency Services")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <AlertTriangle className="h-7 w-7 text-white animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-xl">Emergency Services</p>
                      <p className="text-3xl font-mono text-red-600 dark:text-red-400 font-bold">911</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold animate-pulse">Tap to call immediately</p>
                    </div>
                  </div>
                  <Phone className="h-8 w-8 text-red-600 animate-bounce" />
                </div>
              </CardContent>
            </Card>

            {/* Primary Contact */}
            {quickDialData?.primaryContact && (
              <Card 
                className="border-blue-500 bg-blue-50 dark:bg-blue-950 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => makeCall(
                  quickDialData.primaryContact!.phone, 
                  quickDialData.primaryContact!.name
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {quickDialData.primaryContact.name}
                        </p>
                        {quickDialData.primaryContact.relationship && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {quickDialData.primaryContact.relationship}
                          </p>
                        )}
                        <p className="text-lg font-mono text-blue-600">
                          {quickDialData.primaryContact.phone}
                        </p>
                      </div>
                    </div>
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Other Emergency Contacts */}
            {quickDialData?.otherContacts && quickDialData.otherContacts.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                  Other Contacts
                </h3>
                {quickDialData.otherContacts.map((contact) => (
                  <Card 
                    key={contact.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => makeCall(contact.phone, contact.name)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          {contact.relationship && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {contact.relationship}
                            </p>
                          )}
                          <p className="text-sm font-mono">{contact.phone}</p>
                        </div>
                        <Phone className="h-5 w-5 text-gray-600" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Crisis Hotlines */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400">
                Crisis Hotlines
              </h3>
              
              {/* Poison Control */}
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => makeCall("1-800-222-1222", "Poison Control")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hospital className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">Poison Control</p>
                        <p className="text-sm font-mono">1-800-222-1222</p>
                      </div>
                    </div>
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                </CardContent>
              </Card>

              {/* Suicide Prevention */}
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => makeCall("988", "Suicide & Crisis Lifeline")}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-semibold">Suicide & Crisis Lifeline</p>
                        <p className="text-sm font-mono">988</p>
                      </div>
                    </div>
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* No Contacts Message */}
            {!quickDialData?.primaryContact && (!quickDialData?.otherContacts || quickDialData.otherContacts.length === 0) && (
              <Card className="bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="p-4">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    No personal emergency contacts added yet.
                    <br />
                    Add contacts in your profile settings.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}