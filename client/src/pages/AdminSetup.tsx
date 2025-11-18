import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

// Validation schema for admin setup
const adminSetupSchema = z.object({
  setupSecret: z.string().min(1, 'Setup secret is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type AdminSetupForm = z.infer<typeof adminSetupSchema>;

export default function AdminSetup() {
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const form = useForm<AdminSetupForm>({
    resolver: zodResolver(adminSetupSchema),
    defaultValues: {
      setupSecret: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    }
  });

  // Check if admin setup is needed
  const checkSetupStatus = async (secret: string) => {
    try {
      const response = await fetch('/api/setup/status', {
        method: 'GET',
        headers: {
          'X-Setup-Secret': secret,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.status === 404) {
        setNeedsSetup(false);
        setError('Admin setup is not available. An administrator account may already exist.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to check setup status');
      }

      const data = await response.json();
      setNeedsSetup(data.needsSetup);
      setCsrfToken(data.csrfToken);
    } catch (err: any) {
      setError(err.message || 'Failed to check setup status');
    } finally {
      setIsChecking(false);
    }
  };

  const onSubmit = async (data: AdminSetupForm) => {
    if (!csrfToken) {
      // First, get the CSRF token
      await checkSetupStatus(data.setupSecret);
      if (!csrfToken) return;
    }

    try {
      const response = await fetch('/api/setup/create-admin', {
        method: 'POST',
        headers: {
          'X-Setup-Secret': data.setupSecret,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          csrfToken: csrfToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Setup failed');
      }

      const result = await response.json();
      setSuccess(true);
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        window.location.href = result.redirect || '/';
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create administrator account');
    }
  };

  useEffect(() => {
    // Check if the page is accessible without secret (to show proper message)
    fetch('/api/setup/status', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    })
      .then(res => {
        if (res.status === 404) {
          setNeedsSetup(false);
          setError('Admin setup is not available. An administrator account already exists.');
        } else {
          setNeedsSetup(true);
        }
      })
      .catch(() => {
        setNeedsSetup(true);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">Checking setup status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Administrator account created successfully. Redirecting...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!needsSetup && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Setup Not Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Administrator Setup
          </CardTitle>
          <CardDescription>
            Create the first administrator account for your application.
            You'll need the setup secret that was provided during deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="setupSecret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Secret</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Paste the setup secret here"
                        data-testid="input-setup-secret"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the setup secret provided in the deployment logs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Account Details</h3>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="admin@example.com"
                          data-testid="input-email"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John"
                          data-testid="input-first-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doe"
                          data-testid="input-last-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter a strong password"
                          data-testid="input-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        At least 8 characters with uppercase, lowercase, and numbers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm your password"
                          data-testid="input-confirm-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={form.formState.isSubmitting}
                data-testid="button-create-admin"
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create Administrator Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            This setup page will become unavailable after the first administrator account is created.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}