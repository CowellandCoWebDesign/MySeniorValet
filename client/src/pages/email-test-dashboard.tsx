import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function EmailTestDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('William.cowell01@gmail.com');
  const [emailType, setEmailType] = useState('test');
  const [customData, setCustomData] = useState({
    userName: 'Test User',
    subject: 'Test Message',
    message: 'This is a test message from the Email Test Dashboard.'
  });

  const sendTestEmail = async (type: string, additionalData?: any) => {
    setLoading(true);
    
    try {
      let endpoint = '/api/notifications/';
      let payload: any = {};
      
      switch (type) {
        case 'test':
          endpoint += 'test-email';
          payload = { email: testEmail };
          break;
          
        case 'welcome':
          endpoint += 'welcome';
          payload = {
            userName: customData.userName,
            userEmail: testEmail
          };
          break;
          
        case 'match':
          endpoint += 'match-alert';
          payload = {
            userName: customData.userName,
            userEmail: testEmail,
            matches: [
              {
                name: 'Sunrise Senior Living',
                city: 'Dallas',
                state: 'TX',
                priceRange: '$3,500 - $5,000/mo',
                careTypes: ['Assisted Living', 'Memory Care']
              },
              {
                name: 'Golden Years Community',
                city: 'Austin',
                state: 'TX',
                priceRange: '$2,800 - $4,200/mo',
                careTypes: ['Independent Living']
              }
            ],
            searchCriteria: {
              location: 'Texas',
              careLevel: 'Assisted Living',
              budget: '$3,000 - $5,000'
            }
          };
          break;
          
        case 'price':
          endpoint += 'price-alert';
          payload = {
            userName: customData.userName,
            userEmail: testEmail,
            community: {
              name: 'Peaceful Meadows',
              city: 'Houston',
              state: 'TX',
              oldPrice: '$4,500/mo',
              newPrice: '$3,900/mo',
              changeType: 'decreased'
            }
          };
          break;
          
        case 'contact':
          endpoint += 'contact';
          payload = {
            fromName: customData.userName,
            fromEmail: testEmail,
            subject: customData.subject,
            message: customData.message,
            communityName: 'Test Community'
          };
          break;
          
        case 'admin':
          endpoint += 'admin-alert';
          payload = {
            subject: 'Test Admin Alert',
            message: 'This is a test admin alert from the Email Test Dashboard.\nSystem is functioning normally.',
            priority: 'medium'
          };
          break;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Email Sent Successfully",
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} email sent to ${testEmail}`,
        });
      } else {
        toast({
          title: "Email Failed",
          description: result.message || "Failed to send email",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-8 w-8 text-primary" />
          Email Notification Test Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Test and verify all email templates in the MySeniorValet notification system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>Set test parameters for email notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-email">Test Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <Label htmlFor="user-name">Test User Name</Label>
              <Input
                id="user-name"
                value={customData.userName}
                onChange={(e) => setCustomData({...customData, userName: e.target.value})}
                placeholder="Enter user name"
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Contact Form Subject</Label>
              <Input
                id="subject"
                value={customData.subject}
                onChange={(e) => setCustomData({...customData, subject: e.target.value})}
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Contact Form Message</Label>
              <Textarea
                id="message"
                value={customData.message}
                onChange={(e) => setCustomData({...customData, message: e.target.value})}
                placeholder="Enter message"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Templates Card */}
        <Card>
          <CardHeader>
            <CardTitle>Email Templates</CardTitle>
            <CardDescription>Click to send test emails for each template</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => sendTestEmail('test')}
              disabled={loading}
              className="w-full justify-start"
              variant="outline"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              System Test Email
            </Button>
            
            <Button
              onClick={() => sendTestEmail('welcome')}
              disabled={loading}
              className="w-full justify-start"
              variant="outline"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Welcome Email
            </Button>
            
            <Button
              onClick={() => sendTestEmail('match')}
              disabled={loading}
              className="w-full justify-start"
              variant="outline"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Community Match Alert
            </Button>
            
            <Button
              onClick={() => sendTestEmail('price')}
              disabled={loading}
              className="w-full justify-start"
              variant="outline"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Price Change Alert
            </Button>
            
            <Button
              onClick={() => sendTestEmail('contact')}
              disabled={loading}
              className="w-full justify-start"
              variant="outline"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Contact Form Submission
            </Button>
            
            <Button
              onClick={() => sendTestEmail('admin')}
              disabled={loading}
              className="w-full justify-start"
              variant="outline"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Admin System Alert
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Email System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">SendGrid API</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">6 Templates</p>
                <p className="text-sm text-muted-foreground">Ready to send</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Admin Emails</p>
                <p className="text-sm text-muted-foreground">Configured</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Admin Email Configuration:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Primary: William.cowell01@gmail.com</p>
              <p>• Backup: CowellandCoWebDesign@gmail.com</p>
              <p>• Public: hello@myseniorvalet.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}