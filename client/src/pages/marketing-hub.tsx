import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Megaphone, 
  FileText, 
  Mail, 
  Share2, 
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  Youtube,
  Copy,
  Download,
  Send,
  Calendar,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pressReleaseContent = `FOR IMMEDIATE RELEASE

MySeniorValet Launches Revolutionary Senior Living Transparency Platform with AI-Powered Search and Verified Pricing

Platform Features 34,180+ Communities Across North America with HUD-Verified Pricing and Multi-AI Intelligence

[CITY, STATE] – August 7, 2025 – MySeniorValet, the trusted platform for authentic senior living community information, today announced the official launch of its comprehensive senior living transparency platform. The platform revolutionizes how families discover and evaluate senior living options by providing verified pricing data, AI-powered matching, and complete transparency across over 34,000 communities in the United States and Canada.

"We're bringing unprecedented transparency to the senior living market," said [CEO Name], CEO of MySeniorValet. "Families deserve accurate, verified information when making one of life's most important decisions. Our platform eliminates the guesswork by providing authentic pricing, comprehensive community profiles, and intelligent matching powered by multiple AI systems."

Key Platform Features:
• Complete Care Spectrum Coverage: From HUD-sponsored housing to skilled nursing facilities
• Verified Pricing: Authentic HUD pricing data for 5,241 communities with transparent pricing
• Multi-AI Intelligence: Claude, Gemini, ChatGPT, and Grok working together for accuracy
• 34,180 Communities: Comprehensive coverage across all 50 states and Canadian provinces
• Family Collaboration Tools: Secure messaging, tour tracking, and decision support
• Healthcare Integration: 6,806 hospitals with CMS ratings and service information
• Senior Vendor Marketplace: Connecting families with trusted service providers

The platform addresses critical challenges in senior living research:
- 87% of families struggle to find accurate pricing information
- Average families contact 15+ communities before finding the right fit
- Lack of transparency leads to unexpected costs and poor matches

MySeniorValet's tiered subscription model serves both families and communities:
• Families: Free access to search, compare, and connect with communities
• Communities: Verified Listing (Free), Standard ($149/mo), Featured ($249/mo), Platinum ($349/mo)
• Vendors: Basic ($99/mo), Featured ($249/mo), National Partner ($499/mo)

"Our mission is simple: Help families make informed decisions with verified data and transparent pricing," added [CEO Name]. "We're not just another directory – we're a complete decision support platform that brings clarity to the senior living journey."

The platform launches with several industry-first features:
- Live availability updates from communities
- Tour Track™ review system for authentic feedback
- In-app messaging between families and communities
- AI-powered Perfect Match recommendations
- Bilingual support (English/French) for North American coverage

About MySeniorValet:
MySeniorValet is the trusted platform for authentic senior living community information. With comprehensive coverage of traditional assisted living, 55+ active adult communities, mobile home parks, and manufactured home communities, the platform serves as the single source of truth for senior living decisions. The company's mission is helping families make informed decisions with verified data and transparent pricing.

For more information, visit www.myseniorvalet.com

Media Contact:
[Name]
Director of Communications
MySeniorValet
press@myseniorvalet.com
[Phone Number]

###`;

const launchEmailTemplate = `Subject: 🎉 Introducing MySeniorValet - Your Trusted Guide to Senior Living

Dear [Name],

We're thrilled to announce the launch of MySeniorValet, the trusted platform for authentic senior living community information!

Finding the right senior living community shouldn't be a mystery. That's why we've built a platform that brings complete transparency to your search with:

✅ **34,180+ Communities** - Complete coverage across the US and Canada
✅ **Verified Pricing** - Including 5,241 HUD-verified communities
✅ **AI-Powered Matching** - Find your perfect community match
✅ **Family Collaboration** - Make decisions together with secure tools
✅ **Healthcare Integration** - 6,806 hospitals with ratings and services

**Why MySeniorValet?**

🎯 **Complete Transparency**: No hidden fees, no surprises
💡 **Intelligent Search**: Multi-AI system for accurate matches  
👨‍👩‍👧‍👦 **Family-Focused**: Tools designed for collaborative decisions
🏆 **Verified Data**: Every listing authenticated and verified
💬 **Direct Communication**: Message communities directly in-app

**Special Launch Offers:**

For Communities:
• 50% off first month for new community partners
• Free verified listing upgrade for early adopters
• Complimentary onboarding support

For Families:
• Always free to search and compare
• Priority support during launch month
• Access to exclusive senior resources

**Get Started Today:**
[Visit MySeniorValet] → www.myseniorvalet.com

**Join Our Community:**
Follow us for tips, updates, and senior living insights:
• Facebook: @MySeniorValet
• Twitter: @MySeniorValet
• LinkedIn: MySeniorValet
• Instagram: @MySeniorValet

**Our Mission:**
"The trusted platform for authentic senior living community information. Helping families make informed decisions with verified data and transparent pricing."

Questions? We're here to help!
• Email: hello@myseniorvalet.com
• Call: 1-800-XXX-XXXX
• Live Chat: Available on our website

Thank you for trusting MySeniorValet with your senior living journey.

Warm regards,

The MySeniorValet Team

P.S. Forward this email to anyone who might benefit from transparent senior living information. Together, we're bringing clarity to senior care decisions!

---
This email was sent to [email]. 
Unsubscribe | Update Preferences | Privacy Policy`;

const socialMediaPosts = {
  twitter: `🎉 Introducing MySeniorValet! 

The trusted platform for authentic senior living information. Search 34,180+ communities with verified pricing and AI-powered matching.

✅ Complete transparency
✅ Family collaboration tools  
✅ Healthcare integration
✅ Free for families

Start your search: myseniorvalet.com

#SeniorLiving #ElderCare #FamilyCare #Transparency`,

  facebook: `🏡 Big News! MySeniorValet is now live!

We're on a mission to bring complete transparency to senior living decisions. Our platform features:

• 34,180+ verified communities across US & Canada
• Real HUD-verified pricing (no hidden fees!)
• AI-powered matching to find your perfect fit
• Family collaboration tools for decisions together
• Direct messaging with communities
• 6,806 hospitals with ratings & services

Whether you're looking for assisted living, 55+ communities, or skilled nursing, we've got you covered with authentic, verified information.

👉 Start your search today at www.myseniorvalet.com

#MySeniorValet #SeniorLiving #FamilyFirst #Transparency #ElderCare`,

  linkedin: `🚀 Exciting Launch: MySeniorValet - Bringing Transparency to Senior Living

I'm thrilled to announce the launch of MySeniorValet, a comprehensive platform revolutionizing how families discover and evaluate senior living options.

The Challenge:
• 87% of families struggle to find accurate pricing
• Average families contact 15+ communities 
• Lack of transparency leads to poor matches

Our Solution:
• 34,180+ verified communities
• HUD-verified transparent pricing
• Multi-AI intelligence (Claude, Gemini, ChatGPT, Grok)
• Complete care spectrum coverage
• Family collaboration tools
• Healthcare provider integration

We're not just another directory – we're a complete decision support platform bringing clarity to one of life's most important decisions.

For Communities: Tiered subscriptions from free verified listings to platinum partnerships
For Families: Always free to search, compare, and connect

Join us in our mission: "Helping families make informed decisions with verified data and transparent pricing."

Learn more at www.myseniorvalet.com

#SeniorLiving #HealthTech #Innovation #Transparency #StartupLaunch`,

  instagram: `✨ MySeniorValet is LIVE! ✨

Finding the perfect senior living community just got easier! 

🏡 34,180+ Communities
💰 Verified Pricing  
🤖 AI-Powered Matching
👨‍👩‍👧‍👦 Family Tools
🏥 Healthcare Info
📱 All in One App

No more endless calls. No more hidden fees. Just transparent, verified information to help you make the best decision for your loved ones.

Link in bio to start your search! 

#MySeniorValet #SeniorLiving #Family #Transparency #ElderCare #AssistedLiving #55Plus #Launch #TechForGood`
};

export default function MarketingHub() {
  const { toast } = useToast();
  const [emailRecipients, setEmailRecipients] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    twitter: true,
    facebook: true,
    linkedin: true,
    instagram: true,
    youtube: false
  });
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: `${type} has been copied to your clipboard.`,
    });
  };

  const downloadContent = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `${filename} has been downloaded.`,
    });
  };

  const sendTestEmail = () => {
    if (!emailRecipients) {
      toast({
        title: "Error",
        description: "Please enter at least one email recipient.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Test email sent",
      description: `Launch announcement sent to ${emailRecipients}`,
    });
  };

  const schedulePost = () => {
    const platforms = Object.entries(selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);
    
    if (platforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform.",
        variant: "destructive"
      });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Error", 
        description: "Please select date and time for scheduling.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Posts scheduled",
      description: `Content scheduled for ${platforms.join(', ')} on ${scheduledDate} at ${scheduledTime}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
            <Megaphone className="h-5 w-5" />
            <span className="font-medium">Marketing Launch Center</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            MySeniorValet Launch Marketing Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to announce MySeniorValet to the world
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Communities</p>
                  <p className="text-2xl font-bold">34,180</p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">HUD Verified</p>
                  <p className="text-2xl font-bold">5,241</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Hospitals</p>
                  <p className="text-2xl font-bold">6,806</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">AI Systems</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="press-release" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="press-release" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Press Release
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Launch Email
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Social Media
            </TabsTrigger>
          </TabsList>

          {/* Press Release Tab */}
          <TabsContent value="press-release">
            <Card>
              <CardHeader>
                <CardTitle>Press Release Draft</CardTitle>
                <CardDescription>
                  Ready-to-send press release for media distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Distribution Ready</AlertTitle>
                  <AlertDescription>
                    This press release has been optimized for major wire services and media outlets
                  </AlertDescription>
                </Alert>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {pressReleaseContent}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => copyToClipboard(pressReleaseContent, "Press release")}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>
                  <Button 
                    onClick={() => downloadContent(pressReleaseContent, "mysenirvalet-press-release.txt")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-semibold mb-2">Distribution Channels</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        PR Newswire
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Business Wire
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Local Media Outlets
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Industry Publications
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Key Messages</h4>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        34,180+ Communities
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Verified Pricing
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        AI-Powered Search
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        Family Collaboration
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Launch Announcement Email</CardTitle>
                <CardDescription>
                  Email template for announcing MySeniorValet to your network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipients">Test Recipients (comma-separated)</Label>
                  <Input
                    id="recipients"
                    placeholder="email1@example.com, email2@example.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                  />
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {launchEmailTemplate}
                  </pre>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={sendTestEmail}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Test Email
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(launchEmailTemplate, "Email template")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Template
                  </Button>
                  <Button 
                    onClick={() => downloadContent(launchEmailTemplate, "launch-email.txt")}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertTitle>Email Lists Ready</AlertTitle>
                  <AlertDescription>
                    Your email can be sent to: Newsletter subscribers, Community partners, Vendor network, Media contacts
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Posts</CardTitle>
                <CardDescription>
                  Optimized content for each social platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>Select Platforms to Post</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(selectedPlatforms).map(([platform, selected]) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Switch
                          id={platform}
                          checked={selected}
                          onCheckedChange={(checked) => 
                            setSelectedPlatforms(prev => ({...prev, [platform]: checked}))
                          }
                        />
                        <Label htmlFor={platform} className="capitalize">
                          {platform}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Schedule Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Schedule Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Social Posts */}
                <div className="space-y-4">
                  {Object.entries(socialMediaPosts).map(([platform, content]) => (
                    <Card key={platform}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {platform === 'twitter' && <Twitter className="h-5 w-5" />}
                            {platform === 'facebook' && <Facebook className="h-5 w-5" />}
                            {platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                            {platform === 'instagram' && <Instagram className="h-5 w-5" />}
                            <CardTitle className="capitalize">{platform}</CardTitle>
                          </div>
                          {selectedPlatforms[platform as keyof typeof selectedPlatforms] && (
                            <Badge variant="default">Selected</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 mb-4">
                          <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(content, `${platform} post`)}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Post
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={schedulePost}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule Posts
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Post Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Marketing Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Launch Campaign Metrics</CardTitle>
            <CardDescription>Track your marketing campaign performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Press Coverage</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-400">Articles published</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email Opens</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-400">0% open rate</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Social Reach</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-400">Total impressions</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Website Visits</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-gray-400">From campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}