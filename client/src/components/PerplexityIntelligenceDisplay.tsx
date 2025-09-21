import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Globe, Clock, ExternalLink, FileText, Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PerplexityIntelligenceDisplayProps {
  rawResponse?: string | null;
  sources?: string[];
  timestamp?: string | null;
  communityName?: string;
  location?: string;
}

export const PerplexityIntelligenceDisplay = ({ 
  rawResponse, 
  sources, 
  timestamp, 
  communityName,
  location 
}: PerplexityIntelligenceDisplayProps) => {
  if (!rawResponse) {
    return null;
  }

  // Format the timestamp
  const formattedTime = timestamp ? new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Recently';

  // Parse the response into sections for better display
  const formatResponse = (text: string) => {
    // Split by numbered points or major sections
    const sections = text.split(/(?=\d+\.\s)|(?=CONTACT:|(?=PRICING:|(?=CARE SERVICES:|(?=AMENITIES:|(?=FACILITY DETAILS:|(?=MARKET ANALYSIS:))))))/g);
    
    return sections.map((section, idx) => {
      // Check if this is a header section
      const isHeader = /^(CONTACT:|PRICING:|CARE SERVICES:|AMENITIES:|FACILITY DETAILS:|MARKET ANALYSIS:)/i.test(section);
      const isNumberedItem = /^\d+\.\s/.test(section);
      
      if (isHeader) {
        const [header, ...content] = section.split(':');
        return (
          <div key={idx} className="mb-6">
            <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-2">
              {header.trim()}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {content.join(':').trim()}
            </p>
          </div>
        );
      } else if (isNumberedItem) {
        return (
          <div key={idx} className="mb-3">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed pl-4">
              {section.trim()}
            </p>
          </div>
        );
      } else if (section.trim()) {
        return (
          <p key={idx} className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
            {section.trim()}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <Card className="border-purple-200 dark:border-purple-800 shadow-lg bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 text-transparent bg-clip-text">
                Perplexity AI Market Intelligence
              </span>
            </CardTitle>
            {communityName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-medium">{communityName}</span>
                {location && <span className="text-gray-500"> • {location}</span>}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Live AI Analysis
            </Badge>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 mr-1" />
              {formattedTime}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Intelligence Content */}
        <div className="bg-white dark:bg-gray-900/50 rounded-lg p-4 border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Full Market Analysis & Research
            </h3>
          </div>
          
          <div className="max-h-[800px] overflow-y-auto pr-4">
            <div className="space-y-2">
              {/* Show the raw response in a preformatted block for debugging */}
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <strong>Full Response ({rawResponse.length} characters):</strong>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {rawResponse}
              </pre>
            </div>
          </div>
        </div>

        {/* Sources Section */}
        {sources && sources.length > 0 && (
          <>
            <Separator className="bg-purple-100 dark:bg-purple-900/30" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Verified Sources ({sources.length})
                </h3>
              </div>
              
              <div className="grid gap-2">
                {sources.map((source, idx) => {
                  // Extract domain from URL for display
                  let displayName = source;
                  let domain = '';
                  try {
                    const url = new URL(source);
                    domain = url.hostname.replace('www.', '');
                    displayName = domain;
                  } catch {
                    // If not a valid URL, use as-is
                    displayName = source;
                  }
                  
                  return (
                    <a
                      key={idx}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {idx + 1}.
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {displayName}
                        </span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Intelligence Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong className="text-purple-600 dark:text-purple-400">Note:</strong> This is the complete, unfiltered response from Perplexity AI's market analysis. 
            The information is sourced from real-time web data and may include pricing estimates, market comparisons, and community insights. 
            Always verify critical information directly with the community.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};