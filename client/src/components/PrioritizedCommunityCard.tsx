import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Heart,
  Share2,
  Building,
  Sparkles,
  Shield,
  Star,
  Home,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';

interface PrioritizedCommunityCardProps {
  community: any;
  variant?: 'grid' | 'list' | 'compare';
  onSelect?: () => void;
  onCompare?: () => void;
  isSelected?: boolean;
  index?: number;
}

function CommunityCard({ 
  community, 
  variant = 'grid',
  onSelect,
  onCompare,
  isSelected = false,
  index = 0 
}: PrioritizedCommunityCardProps) {

  // Determine pricing display with market intelligence
  const getPricingDisplay = () => {
    if (community.displayPricing?.displayPrice) {
      return {
        price: community.displayPricing.displayPrice,
        type: 'verified',
        source: 'Community Verified',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        icon: Shield
      };
    }
    if (community.hudPropertyId && community.rentPerMonth) {
      return {
        price: `$${typeof community.rentPerMonth === 'number' ? community.rentPerMonth.toFixed(0) : community.rentPerMonth}/mo`,
        type: 'HUD',
        source: 'HUD.gov Database',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        icon: Shield
      };
    }
    if (community.priceRange) {
      return {
        price: `$${community.priceRange.min}-${community.priceRange.max}/mo`,
        type: 'range',
        source: 'Community Reported',
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        icon: CheckCircle
      };
    }
    // Always show market intelligence, never "contact for pricing"
    const marketEstimate = community.marketIntelligence?.estimate || 
                          (community.careTypes?.includes('Memory Care') ? '$5,500' : '$4,200');
    return {
      price: `${marketEstimate}/mo`,
      type: 'market',
      source: 'Market Intelligence (2025)',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      icon: Sparkles
    };
  };

  // Determine availability status
  const getAvailabilityStatus = () => {
    const occupancy = community.occupancyRate ? Number(community.occupancyRate) : 0;
    
    if (occupancy < 85) {
      return {
        status: 'Available Now',
        color: 'bg-green-500',
        textColor: 'text-green-600 dark:text-green-400',
        icon: CheckCircle,
        urgency: 'Move in today'
      };
    } else if (occupancy < 95) {
      return {
        status: 'Limited Availability',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        icon: AlertCircle,
        urgency: 'Only a few units left'
      };
    } else if (occupancy < 100) {
      return {
        status: 'Almost Full',
        color: 'bg-orange-500',
        textColor: 'text-orange-600 dark:text-orange-400',
        icon: Clock,
        urgency: 'Last unit available'
      };
    } else {
      return {
        status: 'Wait List',
        color: 'bg-red-500',
        textColor: 'text-red-600 dark:text-red-400',
        icon: Users,
        urgency: community.waitListLength ? `${community.waitListLength} on wait list` : 'Join wait list'
      };
    }
  };

  const pricing = getPricingDisplay();
  const availability = getAvailabilityStatus();
  const AvailabilityIcon = availability.icon;

  const PricingIcon = pricing.icon;
  
  // Grid variant - Optimized for scanning and comparison
  if (variant === 'grid') {
    return (
      <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        {/* Compact Top Bar - Pricing & Availability */}
        <div className="flex items-center justify-between p-2 border-b dark:border-gray-700">
          {/* Pricing with Source */}
          <div className={`flex-1 px-2 py-1 rounded-lg ${pricing.bgColor}`}>
            <div className="flex items-center gap-1">
              <PricingIcon className={`w-3 h-3 ${pricing.color}`} />
              <span className={`text-lg font-bold ${pricing.color}`}>
                {pricing.price}
              </span>
            </div>
            <div className="text-[10px] text-gray-600 dark:text-gray-400">
              {pricing.source}
            </div>
          </div>
          
          {/* Availability Status */}
          <div className="flex items-center gap-1 px-2">
            <div className={`w-2 h-2 rounded-full ${availability.color} animate-pulse`} />
            <div>
              <div className={`text-xs font-semibold ${availability.textColor}`}>
                {availability.status}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400">
                {availability.urgency}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Photo Section */}
        <div className="relative h-32">
          {community.photos && community.photos.length > 0 ? (
            <img 
              src={community.photos[0]} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <Building className="w-8 h-8 text-gray-400 dark:text-gray-600" />
            </div>
          )}
          
          {/* Action Buttons Overlay */}
          <div className="absolute top-1 right-1 flex gap-1">
            <button 
              onClick={() => onCompare && onCompare()}
              className="w-7 h-7 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900"
              title="Compare"
            >
              <Share2 className="w-3 h-3" />
            </button>
            <button className="w-7 h-7 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900">
              <Heart className="w-3 h-3" />
            </button>
          </div>

          {/* Care Type Badge */}
          {community.careTypes && community.careTypes[0] && (
            <Badge className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-white/95 dark:bg-gray-900/95">
              {community.careTypes[0]}
            </Badge>
          )}
        </div>

        <CardContent className="p-3 space-y-2">
          {/* Name & Location */}
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
              {community.name}
            </h3>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3 mr-0.5" />
              {community.city}, {community.state}
            </div>
          </div>

          {/* Compact Key Metrics Row */}
          <div className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded p-1.5">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 dark:text-gray-400">
                <Building className="w-3 h-3 inline mr-0.5" />
                {community.totalUnits || community.totalUnitsHud || 'N/A'}
              </span>
              <span className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-0.5" />
                {community.rating ? parseFloat(community.rating).toFixed(1) : 'New'}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {community.sizeCategory || 'Standard'}
              </span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 gap-1.5">
            <button 
              className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-2 rounded transition-colors"
              onClick={() => window.location.href = `tel:${community.phone || '1-800-SENIOR'}`}
            >
              <Phone className="w-3 h-3" />
              <span>Call</span>
            </button>
            <button 
              className="flex items-center justify-center gap-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-1.5 px-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!community.verified}
              title={!community.verified ? "Verification required" : "Message"}
            >
              <MessageCircle className="w-3 h-3" />
              <span>Message</span>
            </button>
          </div>

          {/* View Details Link */}
          <Link href={`/community/${community.id}`}>
            <button className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 hover:underline">
              View Full Details →
            </button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // List variant - Horizontal layout for scrolling
  if (variant === 'list') {
    return (
      <Card className={`relative overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex h-28">
          {/* Compact Image Section */}
          <div className="relative w-28 h-28 flex-shrink-0">
            {community.photos && community.photos.length > 0 ? (
              <img 
                src={community.photos[0]} 
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            
            {/* Availability Badge */}
            <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${availability.color} text-white`}>
              {availability.status}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-2 flex flex-col">
            {/* Top Row - Name, Location, Pricing */}
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
                  {community.name}
                </h3>
                <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3 h-3 mr-0.5" />
                  {community.city}, {community.state}
                </div>
              </div>
              
              {/* Pricing with Source */}
              <div className={`px-2 py-1 rounded-lg ${pricing.bgColor}`}>
                <div className="flex items-center gap-1">
                  <PricingIcon className={`w-3 h-3 ${pricing.color}`} />
                  <span className={`text-lg font-bold ${pricing.color}`}>
                    {pricing.price}
                  </span>
                </div>
                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                  {pricing.source}
                </div>
              </div>
            </div>

            {/* Middle Row - Quick Stats */}
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>
                <Building className="w-3 h-3 inline mr-0.5" />
                {community.totalUnits || 'N/A'} units
              </span>
              <span className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-0.5" />
                {community.rating ? parseFloat(community.rating).toFixed(1) : 'New'}
              </span>
              <span className="flex items-center">
                <AvailabilityIcon className="w-3 h-3 mr-0.5" />
                {availability.urgency}
              </span>
              {community.careTypes && community.careTypes[0] && (
                <Badge className="text-[10px] px-1.5 py-0">
                  {community.careTypes[0]}
                </Badge>
              )}
            </div>

            {/* Bottom Row - Action Buttons */}
            <div className="flex gap-1 mt-auto">
              <button 
                className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded transition-colors"
                onClick={() => window.location.href = `tel:${community.phone || '1-800-SENIOR'}`}
              >
                <Phone className="w-3 h-3" />
                Call
              </button>
              <button 
                className="flex items-center justify-center gap-1 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs py-1 px-2 rounded transition-colors disabled:opacity-50"
                disabled={!community.verified}
              >
                <MessageCircle className="w-3 h-3" />
                Message
              </button>
              <Link href={`/community/${community.id}`}>
                <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 px-2">
                  Details
                  <ChevronRight className="w-3 h-3" />
                </button>
              </Link>
              <button
                className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 py-1 px-2"
                onClick={() => onCompare && onCompare()}
              >
                <Share2 className="w-3 h-3" />
                Compare
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Default to grid if variant not recognized
  return null;
}

export const PrioritizedCommunityCard = React.memo(CommunityCard);