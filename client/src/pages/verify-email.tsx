import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("no-token");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await apiRequest("POST", "/api/auth/verify-email", { token });
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("An error occurred while verifying your email.");
      }
    };

    verifyEmail();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <Card className="w-full max-w-md" data-testid="card-verify-email">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold" data-testid="text-verify-title">
            Email Verification
          </CardTitle>
          <CardDescription data-testid="text-verify-description">
            MySeniorValet Account Verification
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-muted-foreground" data-testid="text-verifying">
                Verifying your email...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center text-lg font-medium" data-testid="text-success-message">
                {message}
              </p>
              <p className="text-center text-muted-foreground">
                You can now access all features of MySeniorValet.
              </p>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full"
                data-testid="button-go-login"
              >
                Go to Login
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-lg font-medium text-red-600" data-testid="text-error-message">
                {message}
              </p>
              <p className="text-center text-muted-foreground">
                The verification link may have expired or already been used.
              </p>
              <div className="flex flex-col gap-2 w-full">
                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full"
                  data-testid="button-try-login"
                >
                  Try Logging In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/resend-verification")}
                  className="w-full"
                  data-testid="button-resend-verification"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </Button>
              </div>
            </>
          )}

          {status === "no-token" && (
            <>
              <XCircle className="h-16 w-16 text-yellow-500" />
              <p className="text-center text-lg font-medium" data-testid="text-no-token-message">
                {message}
              </p>
              <p className="text-center text-muted-foreground">
                Please check your email for the verification link.
              </p>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full"
                data-testid="button-back-login"
              >
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
