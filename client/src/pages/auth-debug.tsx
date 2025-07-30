import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<string>("");

  const testLogin = async () => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        email: "demo@myseniorvalet.com",
        password: "demo123"
      });
      const result = await response.json();
      setTestResult(`Login Success: ${JSON.stringify(result)}`);
      toast({ title: "Login Test", description: "Login successful" });
      
      // Force refresh auth state
      window.location.reload();
    } catch (error: any) {
      setTestResult(`Login Error: ${error.message}`);
      toast({ 
        title: "Login Test Failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  };

  const testAuthEndpoint = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include"
      });
      if (response.ok) {
        const result = await response.json();
        setTestResult(`Auth Endpoint Success: ${JSON.stringify(result)}`);
      } else {
        setTestResult(`Auth Endpoint Error: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      setTestResult(`Auth Endpoint Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Auth Debug" 
        subtitle="Authentication testing and debugging"
      />
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">useAuth Hook State:</h3>
                <div className="text-sm">
                  <p>Is Loading: {String(isLoading)}</p>
                  <p>Is Authenticated: {String(isAuthenticated)}</p>
                  <p>User: {user ? JSON.stringify(user) : "null"}</p>
                  <p>Error: {error ? String(error) : "none"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">Test Actions:</h3>
                <div className="space-y-2">
                  <Button onClick={testLogin} className="w-full">
                    Test Login
                  </Button>
                  <Button onClick={testAuthEndpoint} variant="outline" className="w-full">
                    Test Auth Endpoint
                  </Button>
                </div>
              </div>
            </div>
            
            {testResult && (
              <div>
                <h3 className="font-semibold">Test Result:</h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto">
                  {testResult}
                </pre>
              </div>
            )}
            
            <div>
              <h3 className="font-semibold">Browser Info:</h3>
              <div className="text-sm">
                <p>Cookies: {document.cookie || "none"}</p>
                <p>Current URL: {window.location.href}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}