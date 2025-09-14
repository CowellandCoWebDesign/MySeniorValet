import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Globe, Search, Cpu, Star, AlertCircle, TrendingUp, Shield, Info } from "lucide-react";

// AI Service configuration with colors and icons
export const AI_SERVICES = {
  perplexity: {
    name: "Perplexity",
    icon: Globe,
    color: "bg-blue-500 dark:bg-blue-600",
    textColor: "text-blue-700 dark:text-blue-300",
    bgLight: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "Real-time web search"
  },
  claude: {
    name: "Claude",
    icon: Brain,
    color: "bg-purple-500 dark:bg-purple-600",
    textColor: "text-purple-700 dark:text-purple-300",
    bgLight: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "Advanced analysis"
  },
  grok: {
    name: "Grok",
    icon: Sparkles,
    color: "bg-orange-500 dark:bg-orange-600",
    textColor: "text-orange-700 dark:text-orange-300",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    description: "X.com real-time data"
  },
  gemini: {
    name: "Gemini",
    icon: Star,
    color: "bg-green-500 dark:bg-green-600",
    textColor: "text-green-700 dark:text-green-300",
    bgLight: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    description: "Google's AI insights"
  },
  deepseek: {
    name: "DeepSeek",
    icon: Search,
    color: "bg-indigo-600 dark:bg-indigo-700",
    textColor: "text-indigo-700 dark:text-indigo-300",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    description: "Deep analysis"
  }
} as const;

interface AIServiceBadgeProps {
  service: keyof typeof AI_SERVICES;
  active?: boolean;
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function AIServiceBadge({ 
  service, 
  active = true, 
  animated = false,
  size = "md",
  showDescription = false 
}: AIServiceBadgeProps) {
  const config = AI_SERVICES[service];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const badge = (
    <Badge
      className={`
        ${sizeClasses[size]}
        ${active ? config.color : 'bg-gray-300 dark:bg-gray-700'}
        text-white font-medium
        border ${active ? config.borderColor : 'border-gray-400 dark:border-gray-600'}
        ${animated && active ? 'animate-pulse' : ''}
        transition-all duration-300 hover:scale-105
      `}
    >
      <Icon className={`${iconSizes[size]} mr-1`} />
      {config.name}
      {showDescription && (
        <span className="ml-1 opacity-80 text-xs">• {config.description}</span>
      )}
    </Badge>
  );

  if (animated && active) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

interface AISourcesDisplayProps {
  sources?: {
    perplexity?: boolean;
    claude?: boolean;
    grok?: boolean;
    gemini?: boolean;
    deepseek?: boolean;
    total: number;
  };
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AISourcesDisplay({ sources, animated = false, size = "sm" }: AISourcesDisplayProps) {
  if (!sources || sources.total === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
        AI Sources ({sources.total}):
      </span>
      {Object.entries(sources).map(([key, value]) => {
        if (key === 'total' || !value) return null;
        return (
          <AIServiceBadge
            key={key}
            service={key as keyof typeof AI_SERVICES}
            active={true}
            animated={animated}
            size={size}
          />
        );
      })}
    </div>
  );
}

interface PricingConsensusProps {
  pricing?: {
    average: number;
    median: number;
    range: { min: number; max: number };
    confidence: number;
    sources: Array<{ source: string; price: number; context: string }>;
  };
}

export function PricingConsensus({ pricing }: PricingConsensusProps) {
  if (!pricing) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          AI Pricing Consensus
        </h4>
        <Badge className={`${getConfidenceColor(pricing.confidence)} bg-transparent border-0`}>
          {pricing.confidence}% Confidence
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/70 dark:bg-gray-800/50 rounded-md p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(pricing.average)}
          </p>
        </div>
        <div className="bg-white/70 dark:bg-gray-800/50 rounded-md p-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">Range</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatPrice(pricing.range.min)} - {formatPrice(pricing.range.max)}
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Confidence Level</span>
          <span className={`text-xs font-medium ${getConfidenceColor(pricing.confidence)}`}>
            {pricing.confidence}%
          </span>
        </div>
        <Progress value={pricing.confidence} className="h-2" />
      </div>

      {pricing.sources && pricing.sources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sources:</p>
          <div className="space-y-1">
            {pricing.sources.slice(0, 3).map((source, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">{source.source}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatPrice(source.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

interface AIConsensusDisplayProps {
  consensus?: {
    pricing?: any;
    insights: string[];
    recommendations: string[];
    warnings: string[];
  };
  compact?: boolean;
}

export function AIConsensusDisplay({ consensus, compact = false }: AIConsensusDisplayProps) {
  if (!consensus) return null;

  return (
    <div className="space-y-4">
      {consensus.pricing && <PricingConsensus pricing={consensus.pricing} />}
      
      {consensus.insights && consensus.insights.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            AI Insights
          </h5>
          <ul className="space-y-1">
            {consensus.insights.slice(0, compact ? 2 : undefined).map((insight, idx) => (
              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                <span className="text-blue-500 mt-0.5">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {consensus.recommendations && consensus.recommendations.length > 0 && (
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200/50 dark:border-green-800/50">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            Recommendations
          </h5>
          <ul className="space-y-1">
            {consensus.recommendations.slice(0, compact ? 2 : undefined).map((rec, idx) => (
              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                <span className="text-green-500 mt-0.5">✓</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {consensus.warnings && consensus.warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200/50 dark:border-amber-800/50">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Important Considerations
          </h5>
          <ul className="space-y-1">
            {consensus.warnings.map((warning, idx) => (
              <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                <span className="text-amber-500 mt-0.5">!</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface DiscoveryModeIndicatorProps {
  message?: string;
  services?: string[];
  loading?: boolean;
}

export function DiscoveryModeIndicator({ message, services = [], loading = false }: DiscoveryModeIndicatorProps) {
  if (!message && !loading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Cpu className="w-5 h-5 animate-pulse" />
            AI Discovery Mode Active
          </h3>
          {loading && (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {message && (
          <p className="text-sm text-white/90 mb-3">{message}</p>
        )}

        {services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {services.map(service => (
              <AIServiceBadge
                key={service}
                service={service as keyof typeof AI_SERVICES}
                active={true}
                animated={loading}
                size="sm"
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export function AIEnhancedBadge({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
      <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} mr-1`} />
      AI Enhanced
    </Badge>
  );
}