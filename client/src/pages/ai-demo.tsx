import React, { useState } from 'react';
import { AIAssistant } from '@/components/AIAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, MessageSquare, Camera, Globe, FileText, Users, Shield } from 'lucide-react';

interface DemoFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
}

export default function AIDemoPage() {
  const [selectedFeature, setSelectedFeature] = useState<string>('smart-matching');
  const [demoQuery, setDemoQuery] = useState('');

  const features: DemoFeature[] = [
    {
      id: 'smart-matching',
      title: 'Smart Community Matching',
      description: 'AI analyzes your needs and preferences to recommend the perfect senior living communities',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-blue-500',
      examples: [
        'Find memory care near Sacramento for my mom who loves gardening',
        'Assisted living under $4000 with pet-friendly policies',
        'Independent living close to my daughter in San Francisco with fitness center'
      ]
    },
    {
      id: 'care-planning',
      title: 'AI Care Planning',
      description: 'Get personalized care assessments and timeline recommendations based on health profiles',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-green-500',
      examples: [
        'My father has early dementia and mobility issues',
        'Mom is independent but needs medication management',
        'Dad needs physical therapy after hip replacement'
      ]
    },
    {
      id: 'image-analysis',
      title: 'Visual Community Analysis',
      description: 'Upload photos to get detailed insights about facility quality, safety, and amenities',
      icon: <Camera className="w-6 h-6" />,
      color: 'bg-purple-500',
      examples: [
        'Analyze dining room for cleanliness and atmosphere',
        'Evaluate accessibility features in common areas',
        'Assess outdoor spaces for safety and appeal'
      ]
    },
    {
      id: 'family-reports',
      title: 'Family Communication Assistant',
      description: 'Generate comprehensive reports to share with family members about community visits',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-orange-500',
      examples: [
        'Tour summary for out-of-state siblings',
        'Pricing comparison between 3 communities',
        'Care services breakdown for family meeting'
      ]
    },
    {
      id: 'multi-language',
      title: 'Multi-Language Support',
      description: 'Translate community information and communications into multiple languages',
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-teal-500',
      examples: [
        'Translate care descriptions to Spanish',
        'Convert pricing information to Mandarin',
        'Provide community details in Korean'
      ]
    },
    {
      id: 'review-analysis',
      title: 'Review Intelligence',
      description: 'AI analyzes reviews to identify key themes, red flags, and community strengths',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-red-500',
      examples: [
        'Analyze 50+ Google reviews for sentiment',
        'Identify care quality patterns in feedback',
        'Highlight common concerns and praise themes'
      ]
    }
  ];

  const handleExampleClick = (example: string) => {
    setDemoQuery(example);
  };

  const selectedFeatureData = features.find(f => f.id === selectedFeature);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavigationHeader 
        title="AI-Powered Senior Living Intelligence" 
        subtitle="Experience the future with Claude and Gemini AI"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-blue-600" />
              <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Senior Living Intelligence
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Experience the future of senior living discovery with Claude and Gemini AI working together 
            to provide personalized recommendations, care planning, and family communication assistance.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
              Powered by Anthropic Claude
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2">
              Enhanced by Google Gemini
            </Badge>
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2">
              100% Authentic Data
            </Badge>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Feature Selection */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Capabilities</h2>
            <div className="space-y-3">
              {features.map((feature) => (
                <Card 
                  key={feature.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedFeature === feature.id 
                      ? 'ring-2 ring-blue-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Feature Details & Examples */}
          <div className="lg:col-span-2">
            {selectedFeatureData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${selectedFeatureData.color} text-white`}>
                      {selectedFeatureData.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white">
                        {selectedFeatureData.title}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300">
                        {selectedFeatureData.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Try these examples:
                    </h4>
                    <div className="space-y-2">
                      {selectedFeatureData.examples.map((example, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full text-left justify-start h-auto p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => handleExampleClick(example)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm">{example}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Interactive AI Assistant */}
        <div className="mb-12">
          <AIAssistant 
            onRecommendation={(recommendations) => {
              console.log('Received recommendations:', recommendations);
            }}
            onAnalysis={(analysis) => {
              console.log('Received analysis:', analysis);
            }}
          />
        </div>

        {/* Technology Stack */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center">
              <Shield className="w-6 h-6 mr-2" />
              Powered by Leading AI Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Anthropic Claude</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Advanced language understanding for complex reasoning and recommendations
                    </p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 ml-15 space-y-1">
                  <li>• Intelligent community matching</li>
                  <li>• Care needs assessment</li>
                  <li>• Family communication assistance</li>
                  <li>• Review sentiment analysis</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Google Gemini</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Multimodal AI for image analysis and enhanced search capabilities
                    </p>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-300 ml-15 space-y-1">
                  <li>• Community photo analysis</li>
                  <li>• Smart search enhancement</li>
                  <li>• Multi-language translation</li>
                  <li>• Visual accessibility assessment</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Integrity Promise</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Our AI systems only work with authentic, verified data from government sources, 
                community-provided information, and user reports. We never generate fake pricing 
                or synthetic community data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full">
            <Brain className="w-5 h-5" />
            <span className="font-medium">AI-Enhanced MySeniorValet Platform</span>
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            Ready to experience the future of senior living discovery? Start by asking our AI assistant 
            about your specific needs and watch as it provides personalized, intelligent recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}