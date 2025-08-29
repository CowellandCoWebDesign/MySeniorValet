import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Brain, DollarSign, Camera, Star, Heart, Calendar, Filter } from 'lucide-react';

interface GracefulFallbackMessageProps {
  message: string;
  originalResultCount: number;
  totalFallbackResults: number;
  searchQuery: string;
  location?: string;
  careTypes?: string[];
  onExploreAll?: () => void;
}

export function GracefulFallbackMessage({ 
  message, 
  originalResultCount, 
  totalFallbackResults, 
  searchQuery,
  location,
  careTypes,
  onExploreAll 
}: GracefulFallbackMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-8 border border-purple-200 dark:border-purple-700/50 mx-4 my-6"
    >
      <div className="flex items-start gap-6">
        {/* The Thinker Statue - Like on loading page */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center shadow-lg">
              {/* The Thinker silhouette */}
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 100 100" 
                className="text-white opacity-90"
                fill="currentColor"
              >
                {/* Simplified thinker pose */}
                <circle cx="50" cy="25" r="8" /> {/* Head */}
                <rect x="45" y="33" width="10" height="20" rx="2" /> {/* Torso */}
                <rect x="40" y="35" width="8" height="3" rx="1" /> {/* Left arm */}
                <rect x="35" y="30" width="6" height="3" rx="1" transform="rotate(-45 38 31.5)" /> {/* Hand to chin */}
                <rect x="43" y="50" width="6" height="15" rx="2" /> {/* Left leg */}
                <rect x="51" y="50" width="6" height="15" rx="2" /> {/* Right leg */}
                <rect x="40" y="62" width="8" height="4" rx="1" /> {/* Left elbow rest */}
              </svg>
            </div>
            {/* Cosmic background sparkles */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Graceful Fallback Applied
            </h3>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
            {message}
          </p>

          {/* Filter Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter Results
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Exact matches:</span>
                <span className="ml-2 font-medium text-red-600 dark:text-red-400">
                  {originalResultCount} communities
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Location matches:</span>
                <span className="ml-2 font-medium text-green-600 dark:text-green-400">
                  {totalFallbackResults} communities
                </span>
              </div>
            </div>
          </div>

          {/* Enrichment Info */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700/50">
            <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" />
              On-Demand Enrichment Available
            </h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">
              Most detailed information becomes available when you click on a community:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Live Pricing</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Camera className="w-4 h-4" />
                <span className="text-xs">Photo Gallery</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Star className="w-4 h-4" />
                <span className="text-xs">Reviews</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Availability</span>
              </div>
            </div>
          </div>

          {/* Location indicator */}
          {location && (
            <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                Showing all results for <strong className="text-gray-900 dark:text-white">{location}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default GracefulFallbackMessage;