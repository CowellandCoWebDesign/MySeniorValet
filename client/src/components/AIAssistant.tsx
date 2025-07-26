import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, FileText, Camera, Globe, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  onRecommendation?: (recommendations: any[]) => void;
  onAnalysis?: (analysis: any) => void;
}

export function AIAssistant({ onRecommendation, onAnalysis }: AIAssistantProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeService, setActiveService] = useState<'anthropic' | 'gemini'>('anthropic');
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/comprehensive-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query,
          service: activeService,
          preferences: {} 
        })
      });
      
      const data = await response.json();
      setResults(data);
      
      if (onAnalysis) onAnalysis(data);
      if (onRecommendation && data.recommendations) {
        onRecommendation(data.recommendations);
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64,
          type: 'community_photo'
        })
      });
      
      const analysis = await response.json();
      setResults({ imageAnalysis: analysis });
    } catch (error) {
      console.error('Image Analysis Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              AI Assistant
            </h3>
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              Powered by Claude & Gemini
            </Badge>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant={activeService === 'anthropic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveService('anthropic')}
              className="flex items-center space-x-1"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Claude</span>
            </Button>
            <Button
              variant={activeService === 'gemini' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveService('gemini')}
              className="flex items-center space-x-1"
            >
              <Sparkles className="w-4 h-4" />
              <span>Gemini</span>
            </Button>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Smart Matching</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-green-800 dark:text-green-200">Care Planning</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Camera className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Image Analysis</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Globe className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Multi-Language</div>
          </div>
        </div>

        {/* Query Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe what you're looking for:
            </label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Example: Find memory care near San Francisco for my mom who loves gardening and needs 24/7 nursing support. Budget around $6000/month."
              rows={4}
              className="w-full"
            />
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !query.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? 'Analyzing...' : 'Get AI Recommendations'}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button variant="outline" disabled={isLoading}>
                <Camera className="w-4 h-4 mr-2" />
                Analyze Photo
              </Button>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              AI Analysis Results:
            </h4>
            
            {results.searchAnalysis && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Search Understanding:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {results.searchAnalysis.careLevel && (
                    <Badge variant="secondary">
                      Care: {results.searchAnalysis.careLevel}
                    </Badge>
                  )}
                  {results.searchAnalysis.location && (
                    <Badge variant="secondary">
                      Location: {results.searchAnalysis.location}
                    </Badge>
                  )}
                  {results.searchAnalysis.budgetRange && (
                    <Badge variant="secondary">
                      Budget: ${results.searchAnalysis.budgetRange.min}-${results.searchAnalysis.budgetRange.max}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {results.recommendations && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Top Recommendations:
                </h5>
                <div className="space-y-2">
                  {results.recommendations.slice(0, 3).map((rec: any, index: number) => (
                    <div key={index} className="p-3 bg-white dark:bg-gray-700 rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">Community #{rec.communityId}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {rec.matchScore}% match
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Why it's a good fit:</strong> {rec.reasons.join(', ')}
                      </div>
                      {rec.concerns.length > 0 && (
                        <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                          <strong>Consider:</strong> {rec.concerns.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.imageAnalysis && (
              <div>
                <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Image Analysis:
                </h5>
                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {results.imageAnalysis}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}