import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Eye, TrendingUp, Shield, BookOpen, Calculator } from 'lucide-react';

/*
COMPREHENSIVE MULTI-AI INTELLIGENCE SHOWCASE
Highlights the unprecedented combination of Anthropic Claude + Google Gemini
for senior living decision-making intelligence
*/

interface AICapability {
  id: string;
  name: string;
  ai: 'Claude' | 'Gemini' | 'Multi-AI';
  icon: any;
  description: string;
  capabilities: string[];
  confidence: number;
  color: string;
}

const aiCapabilities: AICapability[] = [
  {
    id: 'comprehensive-analysis',
    name: 'Comprehensive Community Analysis',
    ai: 'Multi-AI',
    icon: Brain,
    description: 'Combined Claude reasoning + Gemini intelligence for complete community evaluation',
    capabilities: [
      'Deep care level appropriateness analysis',
      'Long-term suitability assessment',
      'Budget sustainability over 5-10 years',
      'Family involvement opportunities',
      'Quality of life factor analysis',
      'Risk assessment and mitigation'
    ],
    confidence: 95,
    color: 'from-purple-500 to-blue-600'
  },
  {
    id: 'visual-intelligence',
    name: 'Visual Intelligence & Photo Analysis',
    ai: 'Gemini',
    icon: Eye,
    description: 'Advanced visual analysis of community photos and facilities',
    capabilities: [
      'Facility quality and maintenance assessment',
      'Accessibility features identification',
      'Safety features evaluation',
      'Atmosphere and ambiance analysis',
      'Amenities visibility assessment',
      'Cleanliness and upkeep standards'
    ],
    confidence: 88,
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 'market-intelligence',
    name: 'Real-Time Market Intelligence',
    ai: 'Gemini',
    icon: TrendingUp,
    description: 'Live market data and trends for informed decision-making',
    capabilities: [
      'Current pricing trends analysis',
      'Occupancy rates and availability',
      'New developments tracking',
      'Quality improvement trends',
      'Technology adoption patterns',
      'Investment market stability'
    ],
    confidence: 85,
    color: 'from-orange-500 to-red-600'
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
  }
];

export default function AIIntelligenceShowcase() {
  const [selectedCapability, setSelectedCapability] = useState<string>(aiCapabilities[0].id);

  const getAIBadgeColor = (ai: string) => {
    switch (ai) {
      case 'Claude': return 'bg-blue-500 text-white';
      case 'Gemini': return 'bg-green-500 text-white';
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
            Unprecedented senior living intelligence combining <strong>Anthropic Claude</strong> + <strong>Google Gemini</strong> 
            for comprehensive decision-making support
          </p>
          
          {/* AI Service Badges */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-blue-500 text-white px-4 py-2 text-sm">
              Claude 4.0 Sonnet • Complex Reasoning
            </Badge>
            <Badge className="bg-green-500 text-white px-4 py-2 text-sm">
              Gemini 2.5 Flash • Visual Intelligence
            </Badge>
            <Badge className="bg-purple-500 text-white px-4 py-2 text-sm">
              Multi-AI Orchestration
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
                    <Badge className={getAIBadgeColor(capability.ai)}>
                      {capability.ai}
                    </Badge>
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