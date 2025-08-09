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

  // Determine pricing display
  const getPricingDisplay = () => {
    if (community.displayPricing?.displayPrice) {
      return {
        price: community.displayPricing.displayPrice,
        type: 'verified',
        color: 'text-green-600 dark:text-green-400'
      };
    }
    if (community.hudPropertyId && community.rentPerMonth) {
      return {
        price: `$${typeof community.rentPerMonth === 'number' ? community.rentPerMonth.toFixed(0) : community.rentPerMonth}/mo`,
        type: 'HUD',
        color: 'text-green-600 dark:text-green-400'
      };
    }
    if (community.priceRange) {
      return {
        price: `$${community.priceRange.min}-${community.priceRange.max}/mo`,
        type: 'range',
        color: 'text-blue-600 dark:text-blue-400'
      };
    }
    return {
      price: 'Contact for pricing',
      type: 'contact',
      color: 'text-gray-600 dark:text-gray-400'
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

  // Grid variant - Optimized for scanning and comparison
  if (variant === 'grid') {
    return (
      <Card className={`relative overflow-hidden hover:shadow-xl transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        {/* Top Priority Bar - Pricing & Availability */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-3 border-b">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className={`text-2xl font-bold ${pricing.color}`}>
                {pricing.price}
              </div>
              {pricing.type === 'HUD' && (
                <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Shield className="w-3 h-3 mr-1" />
                  HUD Verified
                </Badge>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${availability.color} animate-pulse`} />
                <span className={`font-semibold ${availability.textColor}`}>
                  {availability.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {availability.urgency}
              </div>
            </div>
          </div>
        </div>

        {/* Photo & Basic Info */}
        <div className="relative h-48">
          {community.photos && community.photos.length > 0 ? (
            <img 
              src={community.photos[0]} 
              alt={community.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <div className="text-center">
                <Building className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Photos coming soon</span>
              </div>
            </div>
          )}
          
          {/* Quick Actions Overlay */}
          <div className="absolute top-2 right-2 flex gap-2">
            <button 
              onClick={() => onCompare && onCompare()}
              className="w-8 h-8 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors"
              title="Add to compare"
            >
              <Share2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="w-8 h-8 bg-white/90 dark:bg-gray-900/90 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-gray-900 transition-colors">
              <Heart className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Care Type Badge */}
          {community.careTypes && community.careTypes[0] && (
            <Badge className="absolute bottom-2 left-2 bg-white/95 dark:bg-gray-900/95 text-gray-700 dark:text-gray-300">
              {community.careTypes[0]}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Name & Location */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
              {community.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              {community.city}, {community.state} {community.zipCode}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y dark:border-gray-700">
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">Units</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {community.totalUnits || community.totalUnitsHud || 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">Rating</div>
              <div className="font-semibold text-gray-900 dark:text-white flex items-center justify-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                {community.rating ? parseFloat(community.rating).toFixed(1) : 'New'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400">Size</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {community.sizeCategory || 'Standard'}
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => window.location.href = `tel:${community.phone || '1-800-SENIOR'}`}
            >
              <Phone className="w-4 h-4 mr-1" />
              Call Now
            </Button>
            <Button 
              variant="outline"
              className="flex-1"
              disabled={!community.verified}
              title={!community.verified ? "Direct messaging available after community verification" : "Send direct message"}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
          </div>

          {/* View Details Link */}
          <Link href={`/community/${community.id}`}>
            <Button variant="ghost" className="w-full justify-between group">
              <span>View Full Details</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // List variant - Horizontal layout for scrolling
  if (variant === 'list') {
    return (
      <Card className={`relative overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-48 h-48 flex-shrink-0">
            {community.photos && community.photos.length > 0 ? (
              <img 
                src={community.photos[0]} 
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                <Building className="w-12 h-12 text-gray-400 dark:text-gray-600" />
              </div>
            )}
            
            {/* Availability Badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded-full ${availability.color} text-white text-xs font-semibold`}>
              {availability.status}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {community.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {community.city}, {community.state} {community.zipCode}
                </div>
              </div>
              
              {/* Pricing */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${pricing.color}`}>
                  {pricing.price}
                </div>
                {pricing.type === 'HUD' && (
                  <Badge className="mt-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    HUD Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 mb-3 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Building className="w-4 h-4 mr-1" />
                {community.totalUnits || 'N/A'} units
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                {community.rating ? parseFloat(community.rating).toFixed(1) : 'New'}
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 mr-1" />
                {availability.urgency}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = `tel:${community.phone || '1-800-SENIOR'}`}
              >
                <Phone className="w-3 h-3 mr-1" />
                Call Now
              </Button>
              <Button 
                size="sm"
                variant="outline"
                disabled={!community.verified}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                Message
              </Button>
              <Link href={`/community/${community.id}`}>
                <Button size="sm" variant="ghost">
                  View Details
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCompare && onCompare()}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Compare
              </Button>
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