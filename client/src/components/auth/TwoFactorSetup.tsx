import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Shield, 
  Smartphone, 
  Key, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Download,
  QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TwoFactorSetup() {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [disablePassword, setDisablePassword] = useState('');
  const { toast } = useToast();

  // Check 2FA status
  const { data: status, isLoading } = useQuery({
    queryKey: ['/api/auth/2fa/status']
  });

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to setup 2FA');
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCode);
      setManualKey(data.secret);
      setBackupCodes(data.backupCodes);
      setStep('verify');
    },
    onError: () => {
      toast({
        title: 'Setup Failed',
        description: 'Failed to initialize 2FA setup',
        variant: 'destructive'
      });
    }
  });

  // Verify 2FA mutation
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, backupCodes })
      });
      if (!response.ok) throw new Error('Invalid verification code');
      return response.json();
    },
    onSuccess: () => {
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/2fa/status'] });
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been successfully enabled',
      });
    },
    onError: () => {
      toast({
        title: 'Verification Failed',
        description: 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!response.ok) throw new Error('Failed to disable 2FA');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/2fa/status'] });
      setDisablePassword('');
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled',
      });
    },
    onError: () => {
      toast({
        title: 'Failed',
        description: 'Invalid password or failed to disable 2FA',
        variant: 'destructive'
      });
    }
  });

  const handleSetupStart = () => {
    setIsSetupOpen(true);
    setupMutation.mutate();
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }
    verifyMutation.mutate(verificationCode);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  const downloadBackupCodes = () => {
    const content = `MySeniorValet 2FA Backup Codes
Generated: ${new Date().toLocaleString()}

IMPORTANT: Store these codes in a safe place. Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

If you lose access to your authenticator app, you can use these codes to log in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myseniorvalet-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.required && !status?.enabled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required:</strong> Your account requires two-factor authentication for enhanced security.
              </AlertDescription>
            </Alert>
          )}

          {status?.enabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">2FA is enabled</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disable-password">
                  Enter your password to disable 2FA
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="disable-password"
                    type="password"
                    placeholder="Enter password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    onClick={() => disableMutation.mutate(disablePassword)}
                    disabled={!disablePassword || disableMutation.isPending}
                  >
                    Disable 2FA
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Two-factor authentication adds an extra layer of security by requiring a verification 
                code from your authenticator app when signing in.
              </p>
              
              <Button onClick={handleSetupStart} className="w-full">
                <Smartphone className="w-4 h-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'setup' && 'Setting up 2FA...'}
              {step === 'verify' && 'Scan QR Code'}
              {step === 'complete' && '2FA Enabled Successfully'}
            </DialogTitle>
            <DialogDescription>
              {step === 'setup' && 'Generating your secure authentication codes...'}
              {step === 'verify' && 'Scan this QR code with your authenticator app'}
              {step === 'complete' && 'Your account is now protected with 2FA'}
            </DialogDescription>
          </DialogHeader>

          {step === 'verify' && (
            <div className="space-y-4">
              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm">Can't scan? Enter this key manually:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs break-all">
                    {manualKey}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(manualKey, 'Secret key')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  Enter verification code from your app
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                className="w-full"
              >
                Verify and Enable 2FA
              </Button>
            </div>
          )}

          {step === 'complete' && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  <strong>Save your backup codes!</strong> You'll need these if you lose access to your authenticator app.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Backup Codes (save these securely):</Label>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="font-mono text-sm">
                      {i + 1}. {code}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadBackupCodes}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Backup Codes
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            {step === 'complete' && (
              <Button onClick={() => setIsSetupOpen(false)}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}