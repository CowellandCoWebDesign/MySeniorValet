import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Eye, TrendingUp, Shield, BookOpen, Calculator, Rocket } from 'lucide-react';

/*
COMPREHENSIVE MULTI-AI INTELLIGENCE SHOWCASE
World-changing transparency through 3-AI collaboration:
Claude (Complex Reasoning) + Gemini (Visual Intelligence) + ChatGPT (Financial Transparency)
Truth in Senior Living - NOT a placement agency
*/

interface AICapability {
  id: string;
  name: string;
  ai: 'Claude' | 'Gemini' | 'ChatGPT' | 'Grok' | 'Multi-AI';
  icon: any;
  description: string;
  capabilities: string[];
  confidence: number;
  color: string;
  status?: 'active' | 'coming_soon';
}

const aiCapabilities: AICapability[] = [
  {
    id: 'three-ai-cross-verification',
    name: '3-AI Cross-Verification System',
    ai: 'Multi-AI',
    icon: Brain,
    description: 'Claude, Gemini & ChatGPT work together, cross-checking each other for absolute accuracy',
    capabilities: [
      'Triple AI consensus for critical decisions',
      'Cross-verification of all findings',
      'Exposing hidden information through AI collaboration',
      'World-changing transparency in senior living',
      'Eliminating decades of industry opacity',
      'Truth in Senior Living - NOT placement services'
    ],
    confidence: 98,
    color: 'from-purple-600 to-pink-600'
  },
  {
    id: 'financial-transparency',
    name: 'Financial Transparency Analysis',
    ai: 'ChatGPT',
    icon: Calculator,
    description: 'ChatGPT-4o exposes hidden costs and financial manipulation in senior living',
    capabilities: [
      'Hidden fee detection and exposure',
      'Annual escalation clause analysis',
      'Move-out penalty identification',
      'Long-term cost projections with inflation',
      'Financial assistance qualification analysis',
      'Contract red flag detection'
    ],
    confidence: 94,
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'visual-intelligence',
    name: 'Visual Intelligence & Photo Analysis',
    ai: 'Gemini',
    icon: Eye,
    description: 'Gemini 2.5 Flash analyzes photos to reveal facility reality vs marketing',
    capabilities: [
      'Facility quality and maintenance assessment',
      'Accessibility features identification',
      'Safety features evaluation',
      'Atmosphere and ambiance analysis',
      'Amenities visibility assessment',
      'Cleanliness and upkeep standards'
    ],
    confidence: 88,
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'care-planning',
    name: 'Complex Care Progression Planning',
    ai: 'Claude',
    icon: BookOpen,
    description: 'Advanced reasoning for long-term care planning and transitions',
    capabilities: [
      '10-year care progression modeling',
      'Community type transition planning',
      'Budget planning with inflation',
      'Family preparation strategies',
      'Geographic consideration analysis',
      'Healthcare integration planning'
    ],
    confidence: 92,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'contract-analysis',
    name: 'Contract Risk Assessment',
    ai: 'Claude',
    icon: Shield,
    description: 'Expert-level contract analysis for senior living agreements',
    capabilities: [
      'Financial risk identification',
      'Care level limitation analysis',
      'Refund policy evaluation',
      'Hidden fee detection',
      'Family rights assessment',
      'Dispute resolution analysis'
    ],
    confidence: 90,
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'cost-analysis',
    name: 'Intelligent Cost Projection',
    ai: 'Multi-AI',
    icon: Calculator,
    description: 'Comprehensive financial planning with multi-AI intelligence',
    capabilities: [
      'Current vs. future cost analysis',
      'Insurance coverage optimization',
      'Long-term care insurance planning',
      'Asset protection strategies',
      'Family financial coordination',
      'Emergency fund planning'
    ],
    confidence: 87,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'grok-real-time',
    name: 'Real-Time Fact Checking (Coming Soon)',
    ai: 'Grok',
    icon: Rocket,
    description: 'Grok/XAI will provide real-time verification and fact-checking as the 4th AI layer',
    capabilities: [
      'Real-time information verification',
      'Current events and market data',
      'Cross-checking other AI findings',
      'Regulatory compliance verification',
      'Live pricing validation',
      'Industry news and updates'
    ],
    confidence: 95,
    color: 'from-red-500 to-orange-600',
    status: 'coming_soon'
  }
];

export default function AIIntelligenceShowcase() {
  const [selectedCapability, setSelectedCapability] = useState<string>(aiCapabilities[0].id);

  const getAIBadgeColor = (ai: string) => {
    switch (ai) {
      case 'Claude': return 'bg-orange-500 text-white';
      case 'Gemini': return 'bg-blue-500 text-white';
      case 'ChatGPT': return 'bg-green-500 text-white';
      case 'Grok': return 'bg-red-500 text-white';
      case 'Multi-AI': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-600">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Multi-AI Intelligence System
            </h2>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            World-changing transparency through <strong>4-AI collaboration</strong>: Claude + Gemini + ChatGPT + <span className="text-red-600">Grok (Coming Soon)</span>
          </p>
          
          {/* AI Service Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Badge className="bg-orange-500 text-white px-4 py-2 text-sm">
              Claude 4.0 • Complex Care Planning
            </Badge>
            <Badge className="bg-blue-500 text-white px-4 py-2 text-sm">
              Gemini 2.5 • Visual Intelligence
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
              ChatGPT-4o • Financial Transparency
            </Badge>
            <Badge className="bg-red-500 text-white px-4 py-2 text-sm relative">
              Grok/XAI • Real-Time Facts
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                Soon
              </span>
            </Badge>
          </div>
        </div>

        {/* Capability Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {aiCapabilities.map((capability) => {
            const Icon = capability.icon;
            const isSelected = selectedCapability === capability.id;
            
            return (
              <Card 
                key={capability.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
                }`}
                onClick={() => setSelectedCapability(capability.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${capability.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getAIBadgeColor(capability.ai)}>
                        {capability.ai}
                      </Badge>
                      {capability.status === 'coming_soon' && (
                        <Badge className="bg-yellow-500 text-black text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{capability.name}</CardTitle>
                  <CardDescription>{capability.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        AI Confidence
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {capability.confidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${capability.color}`}
                        style={{ width: `${capability.confidence}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Show capabilities for selected card */}
                  {isSelected && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                        Key Capabilities:
                      </h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {capability.capabilities.slice(0, 3).map((cap, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Experience Multi-AI Intelligence
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Get comprehensive analysis combining the reasoning power of Claude with the visual 
              intelligence of Gemini for unprecedented senior living decision support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
              >
                Try Multi-AI Analysis
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3"
              >
                View AI Capabilities
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}