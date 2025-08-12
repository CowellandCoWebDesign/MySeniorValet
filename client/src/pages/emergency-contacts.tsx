import { useState, useEffect } from "react";
import { EmergencyContactsManager } from "@/components/EmergencyContactsManager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, AlertTriangle, Heart } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function EmergencyContacts() {
  const [userId, setUserId] = useState<string>("test-user-123");

  // In production, get the actual user ID from authentication
  const { data: userData } = useQuery({
    queryKey: ["/api/auth/quick-user"],
    enabled: false, // Disabled for now, using test user
  });

  useEffect(() => {
    // In production, set actual user ID
    if (userData?.user?.id) {
      setUserId(userData.user.id);
    }
  }, [userData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Emergency Contacts</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your emergency contacts for quick access in critical situations
              </p>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-600" />
                Why Emergency Contacts?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Quick access to emergency contacts can be life-saving. The One-Touch Emergency 
                button provides instant access to your most important contacts when every second counts.
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                The emergency button appears on every page. One tap opens your emergency contacts 
                with quick-dial buttons for immediate calling. Add up to 5 personal contacts.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contacts Manager */}
        <EmergencyContactsManager userId={userId} />

        {/* Emergency Services Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Important Emergency Numbers</CardTitle>
            <CardDescription>
              These numbers are always available through the emergency button
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div>
                  <p className="font-semibold">Emergency Services</p>
                  <p className="text-2xl font-mono text-red-600">911</p>
                </div>
                <Phone className="h-5 w-5 text-red-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="font-semibold">Poison Control</p>
                  <p className="text-lg font-mono text-green-600">1-800-222-1222</p>
                </div>
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div>
                  <p className="font-semibold">Suicide & Crisis Lifeline</p>
                  <p className="text-2xl font-mono text-purple-600">988</p>
                </div>
                <Phone className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader>
            <CardTitle>Tips for Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Set your primary contact to the person most likely to be available in emergencies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Include your doctor or healthcare provider in your contacts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Add notes about medical conditions or medications for quick reference</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Keep phone numbers updated and verify them regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Consider adding your facility's emergency contact if you live in senior housing</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}