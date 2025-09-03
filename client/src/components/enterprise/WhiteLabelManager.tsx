import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import {
  Palette, Upload, Globe, Mail, Shield, Smartphone,
  Building, Eye, Save, RotateCcw, CheckCircle, XCircle,
  AlertCircle, Download, Copy, Link2, Image, Type,
  Layout, Sparkles, Zap, Crown, PaintBucket, Layers
} from 'lucide-react';

interface WhiteLabelManagerProps {
  corporateId: string;
  viewMode: 'admin' | 'preview';
}

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
  tagline: string;
  customDomain: string;
  emailFooter: string;
  supportEmail: string;
  supportPhone: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  features: {
    hideMySeniorValetBranding: boolean;
    customLoginPage: boolean;
    customEmailTemplates: boolean;
    customReports: boolean;
    apiWhiteLabel: boolean;
  };
}

export default function WhiteLabelManager({ corporateId, viewMode = 'admin' }: WhiteLabelManagerProps) {
  const [brandingConfig, setBrandingConfig] = useState<BrandingConfig>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    logoUrl: '',
    faviconUrl: '',
    companyName: '',
    tagline: '',
    customDomain: '',
    emailFooter: '',
    supportEmail: '',
    supportPhone: '',
    socialLinks: {},
    features: {
      hideMySeniorValetBranding: false,
      customLoginPage: false,
      customEmailTemplates: false,
      customReports: false,
      apiWhiteLabel: false
    }
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  // Fetch current branding configuration
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: [`/api/enterprise/${corporateId}/white-label`],
    enabled: !!corporateId
  });

  // Save branding configuration
  const saveBranding = useMutation({
    mutationFn: async (config: BrandingConfig) => {
      const response = await fetch(`/api/enterprise/${corporateId}/white-label`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!response.ok) throw new Error('Failed to save branding');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enterprise/${corporateId}/white-label`] });
      toast({
        title: 'Branding Updated',
        description: 'Your white-label configuration has been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save branding configuration. Please try again.',
        variant: 'destructive'
      });
    }
  });

  useEffect(() => {
    if (currentConfig) {
      setBrandingConfig(currentConfig);
    }
  }, [currentConfig]);

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    setBrandingConfig(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In production, this would upload to storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setBrandingConfig(prev => ({
        ...prev,
        logoUrl: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveBranding.mutate(brandingConfig);
  };

  const handleReset = () => {
    if (currentConfig) {
      setBrandingConfig(currentConfig);
    }
  };

  // Generate CSS variables for preview
  const generateCSSVariables = () => {
    return `
      :root {
        --primary: ${brandingConfig.primaryColor};
        --secondary: ${brandingConfig.secondaryColor};
        --accent: ${brandingConfig.accentColor};
      }
    `;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading branding configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">White-Label Branding</h2>
          <p className="text-gray-600">
            Customize the platform appearance and branding for your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveBranding.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveBranding.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Enterprise Badge */}
      <Alert className="border-purple-200 bg-purple-50">
        <Crown className="h-4 w-4 text-purple-600" />
        <AlertDescription>
          <strong>Enterprise Feature:</strong> White-labeling allows you to present the platform as your own branded solution. 
          Changes apply across all properties in your portfolio.
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="colors">
            <PaintBucket className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="w-4 h-4 mr-2" />
            Domain
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Mail className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="features">
            <Sparkles className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>Configure your organization's branding elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {brandingConfig.logoUrl ? (
                    <div className="w-32 h-32 border rounded-lg p-2 bg-white">
                      <img 
                        src={brandingConfig.logoUrl} 
                        alt="Company Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-600">
                      Recommended: 512x512px PNG with transparent background
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={brandingConfig.companyName}
                  onChange={(e) => setBrandingConfig(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Your Company Name"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={brandingConfig.tagline}
                  onChange={(e) => setBrandingConfig(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Your company tagline or motto"
                />
              </div>

              {/* Support Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={brandingConfig.supportEmail}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="support@yourcompany.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    type="tel"
                    value={brandingConfig.supportPhone}
                    onChange={(e) => setBrandingConfig(prev => ({ ...prev, supportPhone: e.target.value }))}
                    placeholder="1-800-XXX-XXXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize the platform colors to match your brand</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={brandingConfig.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={brandingConfig.primaryColor}
                      onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Used for buttons and primary actions</p>
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={brandingConfig.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={brandingConfig.secondaryColor}
                      onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                      placeholder="#10B981"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Used for success states and secondary elements</p>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={brandingConfig.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={brandingConfig.accentColor}
                      onChange={(e) => handleColorChange('accentColor', e.target.value)}
                      placeholder="#F59E0B"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-600">Used for highlights and emphasis</p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="border rounded-lg p-6 bg-gray-50">
                <h4 className="font-semibold mb-4">Color Preview</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      style={{ backgroundColor: brandingConfig.primaryColor }}
                      className="text-white"
                    >
                      Primary Button
                    </Button>
                    <Button 
                      style={{ backgroundColor: brandingConfig.secondaryColor }}
                      className="text-white"
                    >
                      Secondary Button
                    </Button>
                    <Button 
                      style={{ backgroundColor: brandingConfig.accentColor }}
                      className="text-white"
                    >
                      Accent Button
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <Badge style={{ backgroundColor: brandingConfig.primaryColor }} className="text-white">
                      Primary Badge
                    </Badge>
                    <Badge style={{ backgroundColor: brandingConfig.secondaryColor }} className="text-white">
                      Secondary Badge
                    </Badge>
                    <Badge style={{ backgroundColor: brandingConfig.accentColor }} className="text-white">
                      Accent Badge
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Tab */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>Use your own domain for the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  value={brandingConfig.customDomain}
                  onChange={(e) => setBrandingConfig(prev => ({ ...prev, customDomain: e.target.value }))}
                  placeholder="portal.yourcompany.com"
                />
                <p className="text-sm text-gray-600">
                  Point your domain's CNAME record to: app.myseniorvalet.com
                </p>
              </div>

              {/* SSL Certificate Status */}
              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <strong>SSL Certificate:</strong> Automatic SSL certificates are provisioned for all custom domains.
                </AlertDescription>
              </Alert>

              {/* DNS Configuration */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm">DNS Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between p-2 bg-white rounded">
                      <span>Type: CNAME</span>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('CNAME')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded">
                      <span>Name: {brandingConfig.customDomain || 'portal'}</span>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(brandingConfig.customDomain || 'portal')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between p-2 bg-white rounded">
                      <span>Value: app.myseniorvalet.com</span>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText('app.myseniorvalet.com')}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize email communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Footer */}
              <div className="space-y-2">
                <Label htmlFor="emailFooter">Email Footer</Label>
                <Textarea
                  id="emailFooter"
                  value={brandingConfig.emailFooter}
                  onChange={(e) => setBrandingConfig(prev => ({ ...prev, emailFooter: e.target.value }))}
                  placeholder="© 2025 Your Company Name. All rights reserved."
                  rows={3}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label>Social Media Links</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Facebook URL"
                    value={brandingConfig.socialLinks.facebook || ''}
                    onChange={(e) => setBrandingConfig(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Twitter URL"
                    value={brandingConfig.socialLinks.twitter || ''}
                    onChange={(e) => setBrandingConfig(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="LinkedIn URL"
                    value={brandingConfig.socialLinks.linkedin || ''}
                    onChange={(e) => setBrandingConfig(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Instagram URL"
                    value={brandingConfig.socialLinks.instagram || ''}
                    onChange={(e) => setBrandingConfig(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Template Preview */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-sm">Email Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-6 border">
                    <div className="border-b pb-4 mb-4">
                      {brandingConfig.logoUrl && (
                        <img src={brandingConfig.logoUrl} alt="Logo" className="h-12 mb-4" />
                      )}
                      <h3 className="text-lg font-semibold">Welcome to {brandingConfig.companyName || 'Your Platform'}</h3>
                    </div>
                    <div className="text-gray-600 mb-4">
                      <p>This is a sample email to demonstrate your branding.</p>
                    </div>
                    <div className="border-t pt-4 text-sm text-gray-500">
                      <p>{brandingConfig.emailFooter || '© 2025 Your Company. All rights reserved.'}</p>
                      {brandingConfig.supportEmail && (
                        <p>Support: {brandingConfig.supportEmail}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>White-Label Features</CardTitle>
              <CardDescription>Enable advanced branding features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Hide MySeniorValet Branding */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Hide MySeniorValet Branding</p>
                      <p className="text-sm text-gray-600">Remove all references to MySeniorValet</p>
                    </div>
                  </div>
                  <Switch
                    checked={brandingConfig.features.hideMySeniorValetBranding}
                    onCheckedChange={(checked) => setBrandingConfig(prev => ({
                      ...prev,
                      features: { ...prev.features, hideMySeniorValetBranding: checked }
                    }))}
                  />
                </div>

                {/* Custom Login Page */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Layout className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Custom Login Page</p>
                      <p className="text-sm text-gray-600">Use your own login page design</p>
                    </div>
                  </div>
                  <Switch
                    checked={brandingConfig.features.customLoginPage}
                    onCheckedChange={(checked) => setBrandingConfig(prev => ({
                      ...prev,
                      features: { ...prev.features, customLoginPage: checked }
                    }))}
                  />
                </div>

                {/* Custom Email Templates */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Custom Email Templates</p>
                      <p className="text-sm text-gray-600">Fully customize all system emails</p>
                    </div>
                  </div>
                  <Switch
                    checked={brandingConfig.features.customEmailTemplates}
                    onCheckedChange={(checked) => setBrandingConfig(prev => ({
                      ...prev,
                      features: { ...prev.features, customEmailTemplates: checked }
                    }))}
                  />
                </div>

                {/* Custom Reports */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">Branded Reports</p>
                      <p className="text-sm text-gray-600">Reports with your logo and branding</p>
                    </div>
                  </div>
                  <Switch
                    checked={brandingConfig.features.customReports}
                    onCheckedChange={(checked) => setBrandingConfig(prev => ({
                      ...prev,
                      features: { ...prev.features, customReports: checked }
                    }))}
                  />
                </div>

                {/* API White Label */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium">API White-Labeling</p>
                      <p className="text-sm text-gray-600">Custom API endpoints and documentation</p>
                    </div>
                  </div>
                  <Switch
                    checked={brandingConfig.features.apiWhiteLabel}
                    onCheckedChange={(checked) => setBrandingConfig(prev => ({
                      ...prev,
                      features: { ...prev.features, apiWhiteLabel: checked }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Implementation Status</CardTitle>
              <CardDescription>White-label feature activation status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Brand Colors</span>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom Logo</span>
                  {brandingConfig.logoUrl ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Custom Domain</span>
                  {brandingConfig.customDomain ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Set
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Mode Overlay */}
      {previewMode && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Brand Preview</h3>
              <Button onClick={() => setPreviewMode(false)}>
                <XCircle className="w-4 h-4 mr-2" />
                Close Preview
              </Button>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: generateCSSVariables() }} />
            
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="border-b pb-4">
                <div className="flex items-center gap-4">
                  {brandingConfig.logoUrl && (
                    <img src={brandingConfig.logoUrl} alt="Logo" className="h-12" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: brandingConfig.primaryColor }}>
                      {brandingConfig.companyName || 'Your Company Name'}
                    </h1>
                    <p className="text-gray-600">{brandingConfig.tagline || 'Your tagline here'}</p>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: brandingConfig.primaryColor }}>Sample Card</CardTitle>
                    <CardDescription>This shows how your branding appears</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button style={{ backgroundColor: brandingConfig.primaryColor }} className="w-full text-white">
                      Primary Action
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: brandingConfig.secondaryColor }}>Another Card</CardTitle>
                    <CardDescription>Secondary elements use your colors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button style={{ backgroundColor: brandingConfig.secondaryColor }} className="w-full text-white">
                      Secondary Action
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Footer */}
              <div className="border-t pt-4 text-center text-sm text-gray-600">
                <p>{brandingConfig.emailFooter || '© 2025 Your Company. All rights reserved.'}</p>
                {brandingConfig.supportEmail && (
                  <p>Support: {brandingConfig.supportEmail} | {brandingConfig.supportPhone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}