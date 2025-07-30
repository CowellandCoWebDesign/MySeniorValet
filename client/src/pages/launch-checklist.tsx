import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Rocket,
  CreditCard,
  Brain,
  Database,
  FileText,
  MessageSquare,
  Search,
  Star,
  Shield,
  Terminal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { NavigationHeader } from '@/components/NavigationHeader';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  description: string;
  status: 'complete' | 'partial' | 'pending' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignedTo?: string;
  dueDate?: string;
  notes?: string;
  dependencies?: string[];
}

const categories = [
  { 
    id: 'core',
    name: 'Core Platform & Functionality',
    icon: Rocket,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  { 
    id: 'stripe',
    name: 'Stripe Billing & Plans',
    icon: CreditCard,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  { 
    id: 'ai',
    name: 'AI Orchestration System',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  { 
    id: 'data',
    name: 'Data Ingestion & Listings',
    icon: Database,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  { 
    id: 'documents',
    name: 'Documents & Vault Features',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  { 
    id: 'messaging',
    name: 'Messaging & Communication',
    icon: MessageSquare,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  { 
    id: 'search',
    name: 'Search, Filters & UI',
    icon: Search,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50'
  },
  { 
    id: 'reviews',
    name: 'Reviews & Tour Tools',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  { 
    id: 'compliance',
    name: 'Compliance & Legal',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  { 
    id: 'dev',
    name: 'Dev Backdoor Utilities',
    icon: Terminal,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  { 
    id: 'launch',
    name: 'Launch Operations',
    icon: Rocket,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  }
];

const initialChecklist: ChecklistItem[] = [
  // Core Platform
  { id: 'core-1', category: 'core', item: 'Frontend UI renders correctly', description: 'Leaflet map, filters, listings, dashboards', status: 'complete', priority: 'critical' },
  { id: 'core-2', category: 'core', item: 'Community listing cards display', description: 'Name, address, care level, pricing, tags', status: 'complete', priority: 'critical' },
  { id: 'core-3', category: 'core', item: 'Claim Listing flow', description: 'Stripe plan attached, dashboard unlocked', status: 'complete', priority: 'high' },
  { id: 'core-4', category: 'core', item: 'User onboarding flow', description: 'Email/anon access, state selector, plan filters', status: 'complete', priority: 'high' },
  { id: 'core-5', category: 'core', item: 'Family dashboard', description: 'Saved communities, notes, uploads', status: 'partial', priority: 'medium' },

  // Stripe Billing
  { id: 'stripe-1', category: 'stripe', item: 'All 4 product tiers active', description: 'Basic, Verified Standard, Enhanced Showcase, Platinum Spotlight', status: 'complete', priority: 'critical' },
  { id: 'stripe-2', category: 'stripe', item: 'Add-ons display', description: 'Messaging, AI tour assist, bill pay', status: 'pending', priority: 'medium', notes: 'Coming Q2 2025' },
  { id: 'stripe-3', category: 'stripe', item: 'Webhook handling', description: 'Subscription created, updated, cancelled', status: 'complete', priority: 'critical' },
  { id: 'stripe-4', category: 'stripe', item: 'Admin dashboard sync', description: 'Stripe product + user match', status: 'complete', priority: 'high' },
  { id: 'stripe-5', category: 'stripe', item: 'Plan tier upgrades', description: 'Community listing upgrades reflect instantly', status: 'complete', priority: 'high' },

  // AI Orchestration
  { id: 'ai-1', category: 'ai', item: 'Perplexity API', description: 'Live data scraping integration', status: 'complete', priority: 'high' },
  { id: 'ai-2', category: 'ai', item: 'DeepSeek integration', description: 'Long-memory reasoning', status: 'blocked', priority: 'low', notes: 'Payment issues - removed' },
  { id: 'ai-3', category: 'ai', item: 'Claude integration', description: 'Longform policy/empathy use', status: 'complete', priority: 'high' },
  { id: 'ai-4', category: 'ai', item: 'ChatGPT orchestrator', description: 'Formatter/stylist/orchestrator', status: 'complete', priority: 'high' },
  { id: 'ai-5', category: 'ai', item: 'Ghostrider routing', description: 'Routing logic working correctly', status: 'pending', priority: 'medium' },
  { id: 'ai-6', category: 'ai', item: 'Prompt classification', description: 'Topics labeled + routed automatically', status: 'partial', priority: 'medium' },
  { id: 'ai-7', category: 'ai', item: 'AI Tour Assistant', description: 'Available or gated as Coming Soon', status: 'pending', priority: 'low', notes: 'Gated for Q2 2025' },

  // Data Ingestion
  { id: 'data-1', category: 'data', item: 'Database seeded', description: '26,306 verified communities', status: 'complete', priority: 'critical' },
  { id: 'data-2', category: 'data', item: 'Public data pipeline', description: 'Perplexity/scraper/gov feed', status: 'complete', priority: 'critical' },
  { id: 'data-3', category: 'data', item: 'Claimed vs unclaimed', description: 'Listing logic working', status: 'complete', priority: 'high' },
  { id: 'data-4', category: 'data', item: 'Pricing estimates', description: 'Public-sourced pricing flagged as Estimated', status: 'complete', priority: 'high' },
  { id: 'data-5', category: 'data', item: 'Media uploads', description: 'Tour photos, video, uploads allowed', status: 'complete', priority: 'medium' },
  { id: 'data-6', category: 'data', item: 'AI summaries', description: 'Photos and descriptions processed', status: 'partial', priority: 'low' },

  // Documents & Vault
  { id: 'documents-1', category: 'documents', item: 'Family file uploads', description: 'Lease or invoice files', status: 'partial', priority: 'medium' },
  { id: 'documents-2', category: 'documents', item: 'Community uploads', description: 'PDFs or pricing sheets', status: 'complete', priority: 'high' },
  { id: 'documents-3', category: 'documents', item: 'Stripe receipts', description: 'Invoice receipt view', status: 'complete', priority: 'medium' },
  { id: 'documents-4', category: 'documents', item: 'Rent payment system', description: 'Future rent + fee payments', status: 'pending', priority: 'low', notes: 'Coming Q3 2025' },
  { id: 'documents-5', category: 'documents', item: 'Document download', description: 'Downloadable doc support', status: 'complete', priority: 'medium' },
  { id: 'documents-6', category: 'documents', item: 'Shared vault access', description: 'Family invite system', status: 'pending', priority: 'low' },

  // Messaging
  { id: 'messaging-1', category: 'messaging', item: 'In-app messaging', description: 'Community → family messaging', status: 'partial', priority: 'high' },
  { id: 'messaging-2', category: 'messaging', item: 'AI-suggested replies', description: 'Optional for communities', status: 'pending', priority: 'low' },
  { id: 'messaging-3', category: 'messaging', item: 'Follow-up reminders', description: 'Family checklist active', status: 'pending', priority: 'medium' },
  { id: 'messaging-4', category: 'messaging', item: 'Tour log uploads', description: 'Photo tagging allowed', status: 'partial', priority: 'medium' },
  { id: 'messaging-5', category: 'messaging', item: 'Group chat system', description: 'Shared note system', status: 'pending', priority: 'low' },

  // Search & UI
  { id: 'search-1', category: 'search', item: 'Leaflet map rendering', description: 'Marker clustering working', status: 'complete', priority: 'critical' },
  { id: 'search-2', category: 'search', item: 'Filter system', description: 'Care level, price, pets, availability', status: 'complete', priority: 'critical' },
  { id: 'search-3', category: 'search', item: 'Smart filters', description: 'User profile activated', status: 'pending', priority: 'low', notes: 'Coming Q2 2025' },
  { id: 'search-4', category: 'search', item: 'Search autocomplete', description: 'Suggestion logic working', status: 'complete', priority: 'high' },
  { id: 'search-5', category: 'search', item: 'Tour CTAs', description: 'Buttons visible and routed', status: 'complete', priority: 'high' },

  // Reviews & Tours
  { id: 'reviews-1', category: 'reviews', item: 'Tour feedback submission', description: 'Private feedback system', status: 'partial', priority: 'medium' },
  { id: 'reviews-2', category: 'reviews', item: 'Visit-based reviews', description: 'Real review system active', status: 'partial', priority: 'medium' },
  { id: 'reviews-3', category: 'reviews', item: 'Community replies', description: 'Review reply system', status: 'pending', priority: 'low' },
  { id: 'reviews-4', category: 'reviews', item: 'Tour comparison', description: 'Ranking logic activated', status: 'pending', priority: 'low' },
  { id: 'reviews-5', category: 'reviews', item: 'AI tour summary', description: 'Claude or GPT enabled', status: 'pending', priority: 'low' },

  // Compliance
  { id: 'compliance-1', category: 'compliance', item: 'Terms & Privacy', description: 'TOS and Privacy Policy live', status: 'complete', priority: 'critical' },
  { id: 'compliance-2', category: 'compliance', item: 'Data disclaimers', description: 'AI estimates disclaimer', status: 'complete', priority: 'critical' },
  { id: 'compliance-3', category: 'compliance', item: 'Legal compliance', description: 'HIPAA, CPRA, ADA language', status: 'partial', priority: 'high' },
  { id: 'compliance-4', category: 'compliance', item: 'Referral transparency', description: 'No referral fee statement', status: 'complete', priority: 'high' },
  { id: 'compliance-5', category: 'compliance', item: 'Opt-out system', description: 'Community removal enabled', status: 'complete', priority: 'high' },

  // Dev Utilities
  { id: 'dev-1', category: 'dev', item: 'Admin override tools', description: 'Listing edit capabilities', status: 'complete', priority: 'high' },
  { id: 'dev-2', category: 'dev', item: 'Stripe dashboard', description: 'Manual trigger/verify', status: 'complete', priority: 'high' },
  { id: 'dev-3', category: 'dev', item: 'API status logs', description: 'Call logs display', status: 'complete', priority: 'medium' },
  { id: 'dev-4', category: 'dev', item: 'AI routing logs', description: 'Ghostrider log viewer', status: 'partial', priority: 'medium' },
  { id: 'dev-5', category: 'dev', item: 'Feature toggles', description: 'Tour Assist, AI messaging, Bill Pay', status: 'partial', priority: 'medium' },
  { id: 'dev-6', category: 'dev', item: 'AI override switch', description: 'Force Claude, etc.', status: 'pending', priority: 'low' },

  // Launch Ops
  { id: 'launch-1', category: 'launch', item: 'Email templates', description: 'Onboarding emails live', status: 'complete', priority: 'high' },
  { id: 'launch-2', category: 'launch', item: 'Claim promo', description: 'Community claim promotion', status: 'partial', priority: 'medium' },
  { id: 'launch-3', category: 'launch', item: 'Ad tracking', description: 'Facebook/Google tracking', status: 'pending', priority: 'low' },
  { id: 'launch-4', category: 'launch', item: 'Family CTA page', description: 'Launch day call-to-action', status: 'complete', priority: 'high' },
  { id: 'launch-5', category: 'launch', item: 'Meta tags & SEO', description: 'Social sharing, tracking scripts', status: 'complete', priority: 'high' }
];

export function LaunchChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('launch-checklist');
    return saved ? JSON.parse(saved) : initialChecklist;
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Save checklist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('launch-checklist', JSON.stringify(checklist));
  }, [checklist]);

  // Calculate statistics
  const stats = {
    total: checklist.length,
    complete: checklist.filter(item => item.status === 'complete').length,
    partial: checklist.filter(item => item.status === 'partial').length,
    pending: checklist.filter(item => item.status === 'pending').length,
    blocked: checklist.filter(item => item.status === 'blocked').length,
    critical: checklist.filter(item => item.priority === 'critical').length,
    criticalComplete: checklist.filter(item => item.priority === 'critical' && item.status === 'complete').length,
  };

  const overallProgress = Math.round((stats.complete / stats.total) * 100);
  const criticalProgress = Math.round((stats.criticalComplete / stats.critical) * 100);

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus = item.status === 'complete' ? 'pending' : 'complete';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const filteredChecklist = selectedCategory === 'all' 
    ? checklist 
    : checklist.filter(item => item.category === selectedCategory);

  const categoryStats = categories.map(cat => ({
    ...cat,
    total: checklist.filter(item => item.category === cat.id).length,
    complete: checklist.filter(item => item.category === cat.id && item.status === 'complete').length,
    progress: Math.round((checklist.filter(item => item.category === cat.id && item.status === 'complete').length / checklist.filter(item => item.category === cat.id).length) * 100) || 0
  }));

  const exportChecklist = () => {
    const data = JSON.stringify(checklist, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myseniorvalet-launch-checklist-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <NavigationHeader />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Rocket className="h-10 w-10 text-purple-600" />
                Launch Readiness Checklist
              </h1>
              <p className="text-gray-600 mt-2">
                Ultimate pre-launch verification for MySeniorValet
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={exportChecklist}
              >
                Export JSON
              </Button>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </Button>
              <div className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/dev'}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Launch Status Alert */}
        <Alert className={`mb-6 ${overallProgress === 100 ? 'border-green-200' : overallProgress > 70 ? 'border-amber-200' : 'border-red-200'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>Launch Status: {overallProgress}% Complete</strong>
              <span className="ml-4 text-sm text-gray-600">
                {stats.complete}/{stats.total} items complete | 
                Critical items: {stats.criticalComplete}/{stats.critical} ({criticalProgress}%)
              </span>
            </div>
            <Badge variant={overallProgress === 100 ? "default" : overallProgress > 70 ? "secondary" : "destructive"}>
              {overallProgress === 100 ? 'READY TO LAUNCH' : overallProgress > 70 ? 'NEARLY READY' : 'NOT READY'}
            </Badge>
          </AlertDescription>
        </Alert>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.complete}</div>
              <Progress value={(stats.complete / stats.total) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Partial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.partial}</div>
              <Progress value={(stats.partial / stats.total) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <Progress value={(stats.pending / stats.total) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Blocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
              <Progress value={(stats.blocked / stats.total) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-12 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs">
                <cat.icon className="h-3 w-3 mr-1" />
                {cat.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Category Progress Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categoryStats.map(cat => (
              <Card key={cat.id} className={cat.bgColor}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                      {cat.name.split('&')[0]}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {cat.complete}/{cat.total}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={cat.progress} className="h-2" />
                  <p className="text-xs text-gray-600 mt-1">{cat.progress}% complete</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checklist Items */}
          <TabsContent value={selectedCategory} className="space-y-4">
            {filteredChecklist.map(item => {
              const category = categories.find(cat => cat.id === item.category);
              const Icon = category?.icon || Rocket;
              
              return (
                <Card key={item.id} className={`border-l-4 ${
                  item.status === 'complete' ? 'border-l-green-500' :
                  item.status === 'partial' ? 'border-l-amber-500' :
                  item.status === 'blocked' ? 'border-l-red-500' :
                  'border-l-gray-300'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={item.status === 'complete'}
                        onCheckedChange={() => toggleItem(item.id)}
                        disabled={item.status === 'blocked'}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <Icon className={`h-4 w-4 ${category?.color}`} />
                          <h3 className="font-semibold text-gray-900">{item.item}</h3>
                          <Badge variant={
                            item.priority === 'critical' ? 'destructive' :
                            item.priority === 'high' ? 'default' :
                            item.priority === 'medium' ? 'secondary' :
                            'outline'
                          } className="text-xs">
                            {item.priority}
                          </Badge>
                          <Badge variant={
                            item.status === 'complete' ? 'default' :
                            item.status === 'partial' ? 'secondary' :
                            item.status === 'blocked' ? 'destructive' :
                            'outline'
                          } className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">Note: {item.notes}</p>
                        )}
                        {item.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">Due: {item.dueDate}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Export/Import Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This checklist is saved locally. Export to JSON for backup or sharing.
          </p>
        </div>
      </div>
    </div>
  );
}