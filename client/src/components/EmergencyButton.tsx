import { useState, useEffect } from "react";
import { Phone, AlertTriangle, Heart, Hospital, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  const { toast } = useToast();

  const fetchQuickDialData = async () => {
    if (!userId) return;
    
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

  const handleEmergencyClick = () => {
    setShowDialog(true);
    fetchQuickDialData();
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
      {/* Floating Emergency Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleEmergencyClick}
          size="lg"
          className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl animate-pulse"
          aria-label="Emergency Contacts"
        >
          <Phone className="h-8 w-8" />
        </Button>
      </div>

      {/* Emergency Contacts Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Emergency Contacts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* 911 Emergency */}
            <Card 
              className="border-red-500 bg-red-50 dark:bg-red-950 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => makeCall("911", "Emergency Services")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Emergency Services</p>
                      <p className="text-2xl font-mono text-red-600">911</p>
                    </div>
                  </div>
                  <Phone className="h-6 w-6 text-red-600" />
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