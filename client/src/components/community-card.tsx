import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Shield, AlertTriangle, DollarSign, MapPin, Heart, Share, Users, Calendar, CheckCircle, ExternalLink, Clock, Home, Wifi, Car, Utensils, Activity, Phone, Camera, Video, UserCheck, Stethoscope, Bed, ShowerHead, ChevronDown, ChevronUp, ImageIcon, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Community } from "@shared/schema";
import { PhotoCarousel } from "@/components/photo-carousel";

interface CommunityCardProps {
  community: Community;
}

export function CommunityCard({ community }: CommunityCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  // Get all photos from various sources
  const getAllPhotos = () => {
    const allPhotos: string[] = [];
    
    // Add photos from different sources
    if (community.photos && Array.isArray(community.photos) && community.photos.length > 0) {
      allPhotos.push(...community.photos);
    }
    if (community.yelpPhotos && Array.isArray(community.yelpPhotos) && community.yelpPhotos.length > 0) {
      allPhotos.push(...community.yelpPhotos);
    }
    if (community.imageGallery && Array.isArray(community.imageGallery) && community.imageGallery.length > 0) {
      allPhotos.push(...community.imageGallery);
    }
    
    // Remove duplicates and return
    return Array.from(new Set(allPhotos));
  };

  const allPhotos = getAllPhotos();
  const hasPhotos = allPhotos.length > 0;

  const [, setLocation] = useLocation();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    setLocation(`/community/${community.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white border border-gray-200"
      onClick={handleCardClick}
    >
      {/* Hero Image Section */}
      <div className="relative">
        {hasPhotos ? (
          <div className="relative h-64 overflow-hidden">
            <img
              src={allPhotos[0]}
              alt={`${community.name} exterior`}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
            
            {/* Heart Overlay */}
            <div className="absolute top-3 left-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFavorited(!isFavorited);
                }}
                className="p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md transition-all duration-200"
                aria-label="Add to favorites"
              >
                <Heart className={`h-4 w-4 transition-all duration-200 ${
                  isFavorited 
                    ? 'text-red-500 fill-red-500' 
                    : 'text-gray-600 hover:text-red-500'
                }`} />
              </button>
            </div>

            {/* Photo Count Badge */}
            {allPhotos.length > 1 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
                  <Camera className="h-3 w-3 mr-1" />
                  {allPhotos.length}
                </Badge>
              </div>
            )}

            {/* Availability Badge */}
            {community.hasAvailability && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-green-600 text-white border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available Now
                </Badge>
              </div>
            )}

            {/* Verified Badge */}
            {community.verified && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-blue-600 text-white border-0">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">Photos coming soon</p>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{community.name}</h3>
            
            {/* Rating */}
            {community.googleRating && (
              <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-gray-900">
                  {parseFloat(community.googleRating).toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({community.googleReviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {community.city}, {community.state} {community.zipCode}
            </span>
          </div>

          {/* Care Types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {community.careTypes?.slice(0, 3).map((type, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                {type}
              </Badge>
            ))}
            {community.careTypes && community.careTypes.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                +{community.careTypes.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing */}
        {community.pricing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-900">Starting at</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {typeof community.pricing === 'string' 
                ? community.pricing 
                : `$${community.pricing.min?.toLocaleString() || 'Call'}/month`
              }
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Availability */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              community.hasAvailability ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className="text-sm font-medium text-gray-700">
              {community.hasAvailability ? 'Available' : 'Call for Info'}
            </span>
          </div>

          {/* Phone */}
          {community.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">
                {community.phone}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link href={`/community/${community.id}`} className="flex-1">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              View Details
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Share functionality
            }}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>

        {/* Reviews Preview */}
        {(community.googleRating || community.yelpRating) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Reviews</span>
              <div className="flex space-x-4">
                {community.googleRating && (
                  <div className="text-xs text-gray-500">
                    Google: {parseFloat(community.googleRating).toFixed(1)}/5
                  </div>
                )}
                {community.yelpRating && (
                  <div className="text-xs text-gray-500">
                    Yelp: {parseFloat(community.yelpRating).toFixed(1)}/5
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {community.lastUpdated && (
          <div className="mt-2 text-xs text-gray-400">
            Updated {new Date(community.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CommunityCard;