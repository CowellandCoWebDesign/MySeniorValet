import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoFactorSetup } from "@/components/auth/TwoFactorSetup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, AlertCircle, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export default function SecuritySettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({
        title: "Password not strong enough",
        description: "Please meet all password requirements",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Password updated",
          description: "Your password has been changed successfully",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast({
          title: "Failed to change password",
          description: data.message || "Please check your current password",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isAdminAccount = user?.email === "admin@myseniorvalet.com" || 
                         user?.email === "William.cowell01@gmail.com";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="Security Settings" 
        subtitle="Manage your account security and authentication"
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back to Dashboard Link */}
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Admin Security Alert */}
        {isAdminAccount && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Admin Account Security Notice:</strong> As an administrator, you are required to enable two-factor authentication to comply with Google Security Advisor recommendations.
            </AlertDescription>
          </Alert>
        )}

        {/* Two-Factor Authentication Section */}
        <TwoFactorSetup />

        {/* Password Change Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to maintain account security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                  className="mt-1"
                />
                <PasswordStrengthMeter 
                  password={newPassword}
                  onChange={setIsPasswordValid}
                  showRequirements={true}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isChangingPassword}
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5"></div>
                <p>Use a unique password that you don't use on other websites</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5"></div>
                <p>Enable two-factor authentication for maximum security</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5"></div>
                <p>Update your password regularly (every 3-6 months)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5"></div>
                <p>Never share your password or backup codes with anyone</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5"></div>
                <p>Use a password manager to generate and store secure passwords</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}