import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, RefreshCw, Globe, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface PerplexityInsightsProps {
  communityName: string;
  location?: string;
  intelligence?: any;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: string;
}

export function PerplexityInsights({ 
  communityName, 
  location,
  intelligence,
  onRefresh,
  isLoading = false,
  lastUpdated
}: PerplexityInsightsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Extract the raw response
  const rawResponse = intelligence?.rawPerplexityResponse || intelligence?.perplexityResponse || '';
  const sources = intelligence?.sources || [];
  
  // Check if we have meaningful content
  const hasContent = rawResponse && rawResponse.length > 0;
  const isNotFound = rawResponse?.toLowerCase().includes('could not be found') || 
                      rawResponse?.toLowerCase().includes('not found');

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                Perplexity AI Market Intelligence
                <Badge variant="secondary" className="text-xs">
                  Live AI Analysis
                </Badge>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {communityName} • {location || 'Location not specified'}
              </p>
              {lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Analyzing...' : 'Refresh'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content */}
      {isExpanded && (
        <Card className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-pulse mx-auto" />
                <p className="text-gray-600 dark:text-gray-400">Analyzing market intelligence...</p>
              </div>
            </div>
          ) : hasContent ? (
            <div className="space-y-6">
              {/* Status Banner if Community Not Found */}
              {isNotFound && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Limited Information Available
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        This community may be new, private, or operate without a significant online presence. 
                        The analysis below includes general market information for the area.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Market Intelligence Content */}
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">{children}</h3>,
                    p: ({children}) => <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                    li: ({children}) => <li className="text-gray-600 dark:text-gray-400">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-800 dark:text-gray-200">{children}</strong>,
                    hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-50 dark:bg-purple-950/20">
                        {children}
                      </blockquote>
                    ),
                    code: ({children}) => (
                      <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded text-sm">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {rawResponse}
                </ReactMarkdown>
              </div>

              {/* Sources Section */}
              {sources.length > 0 && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Information Sources ({sources.length})
                  </h4>
                  <div className="space-y-2">
                    {sources.map((source: any, index: number) => (
                      <a
                        key={index}
                        href={source.url || source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-400 mt-0.5 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {source.title || source.url || source}
                          </p>
                          {source.snippet && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                              {source.snippet}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3 max-w-sm">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400">
                  No market intelligence available yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Click refresh to analyze this community with AI
                </p>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}