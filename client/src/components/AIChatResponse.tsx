import React from 'react';
import { Link } from 'wouter';
import { Brain, Sparkles, ChevronRight, Globe, MapPin, Calendar, DollarSign, Shield, Users, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface PlatformResource {
  title: string;
  url: string;
  description: string;
}

interface AIChatResponseProps {
  aiResponse?: string;
  platformResources?: PlatformResource[];
  suggestions?: string[];
  timestamp?: string;
}

export function AIChatResponse({ aiResponse, platformResources = [], suggestions = [], timestamp }: AIChatResponseProps) {
  if (!aiResponse) return null;

  // Icon mapping for different resource types
  const getResourceIcon = (url: string) => {
    if (url.includes('map')) return <MapPin className="w-4 h-4" />;
    if (url.includes('pricing') || url.includes('cost')) return <DollarSign className="w-4 h-4" />;
    if (url.includes('veteran') || url.includes('va')) return <Shield className="w-4 h-4" />;
    if (url.includes('tour') || url.includes('schedule')) return <Calendar className="w-4 h-4" />;
    if (url.includes('vendor') || url.includes('marketplace')) return <Users className="w-4 h-4" />;
    if (url.includes('message') || url.includes('contact')) return <MessageCircle className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* AI Response Card */}
      <Card className="border-purple-200 dark:border-purple-800 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>MySeniorValet AI Assistant</span>
            <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* AI Response Text */}
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {aiResponse}
            </div>
          </div>

          {/* Timestamp */}
          {timestamp && (
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Response generated at {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Resources */}
      {platformResources.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Helpful Resources in MySeniorValet</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid gap-3">
              {platformResources.map((resource, index) => (
                <Link key={index} href={resource.url}>
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getResourceIcon(resource.url)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                            {resource.title}
                            <ChevronRight className="w-4 h-4 ml-1 text-gray-400" />
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-green-200 dark:border-green-800">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardTitle className="text-lg">Related Topics You Might Explore</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-green-100 dark:hover:bg-green-800"
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Our AI Orchestra is here to assist you with any questions about senior living
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/ai-search-intelligence">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Advanced AI Search
            </Button>
          </Link>
          <Link href="/map-search">
            <Button variant="outline">
              Browse Communities
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}