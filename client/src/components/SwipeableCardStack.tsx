import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface Community {
  id: number;
  name: string;
  address?: string;
  city: string;
  state?: string;
  monthlyRent?: number;
  claimed?: boolean;
  careTypes?: string[];
  googleRating?: number;
}

interface SwipeableCardStackProps {
  communities: Community[];
}

export function SwipeableCardStack({ communities }: SwipeableCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX - startX);
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (currentX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentX < -threshold && currentIndex < communities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
    setCurrentX(0);
  };
  
  const handleMouseStart = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX - startX);
  };
  
  const handleMouseEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (currentX > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (currentX < -threshold && currentIndex < communities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    
    setCurrentX(0);
  };
  
  const nextCard = () => {
    if (currentIndex < communities.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  if (!communities || communities.length === 0) {
    return <div className="text-center text-gray-500 py-8">No communities found</div>;
  }
  
  return (
    <div className="relative">
      {/* Card Counter */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-600">
          {currentIndex + 1} of {communities.length} communities
        </span>
      </div>
      
      {/* Stack Container - Exact homepage slider size */}
      <div className="relative h-[30rem] mx-auto" style={{ width: '224px' }}>
        {communities.map((community, index) => {
          const isActive = index === currentIndex;
          const isNext = index === currentIndex + 1;
          const isPrev = index === currentIndex - 1;
          
          if (index < currentIndex - 1 || index > currentIndex + 2) {
            return null; // Don't render cards too far away
          }
          
          return (
            <div
              key={community.id}
              className={`absolute top-0 left-0 w-full transition-all duration-300 ease-in-out ${
                isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
              style={{
                transform: `translateX(${isActive ? currentX : isNext ? '6px' : isPrev ? '-6px' : '0px'}) translateY(${
                  isActive ? '0px' : isNext ? '6px' : isPrev ? '6px' : '12px'
                }) scale(${
                  isActive ? '1' : isNext ? '0.96' : isPrev ? '0.96' : '0.92'
                })`,
                zIndex: isActive ? 20 : isNext || isPrev ? 10 : 0,
                opacity: Math.abs(index - currentIndex) > 2 ? 0 : 1
              }}
              onTouchStart={isActive ? handleTouchStart : undefined}
              onTouchMove={isActive ? handleTouchMove : undefined}
              onTouchEnd={isActive ? handleTouchEnd : undefined}
              onMouseDown={isActive ? handleMouseStart : undefined}
              onMouseMove={isActive ? handleMouseMove : undefined}
              onMouseUp={isActive ? handleMouseEnd : undefined}
              onMouseLeave={isActive ? handleMouseEnd : undefined}
            >
              <Link href={`/community/${community.id}`}>
                <Card className="overflow-hidden flex-shrink-0 w-56 h-[30rem] animate-float coastal-card border border-gray-200 shadow-lg">
                  <div className="relative">
                    <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Heart Icon - Same as homepage */}
                    <div className="absolute top-2 right-2 z-10">
                      <div className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </div>
                    </div>
                    
                    {/* Vacancy Status Badge - Top Left - Same as homepage */}
                    <Badge className={`absolute top-2 left-2 text-white text-xs px-2 py-1 font-medium z-10 ${
                      index % 3 === 0 ? 'bg-green-600 animate-pulse' : 
                      index % 3 === 1 ? 'bg-orange-600' : 
                      'bg-blue-600'
                    }`}>
                      {index % 3 === 0 ? '🟢 Available Now' : 
                       index % 3 === 1 ? '🟡 Waitlist Open' : 
                       '📋 Call for Availability'}
                    </Badge>
                    
                    {/* Price Badge - Bottom Left - Same as homepage */}
                    <Badge className="absolute bottom-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 font-medium z-10">
                      {community.monthlyRent ? `$${(community.monthlyRent / 1000).toFixed(1)}K+` : '$4K+'}
                      {!community.claimed && (
                        <span className="text-xs text-gray-300 ml-1 font-normal">est.</span>
                      )}
                    </Badge>
                    
                    {/* Achievement Badge - Bottom Right - Same as homepage */}
                    <Badge className={`absolute bottom-2 right-2 text-white text-xs px-2 py-1 font-medium z-10 ${
                      index % 5 === 0 ? 'bg-purple-600' :
                      index % 5 === 1 ? 'bg-blue-600' :
                      index % 5 === 2 ? 'bg-cyan-600' :
                      index % 5 === 3 ? 'bg-green-600' :
                      'bg-indigo-600'
                    }`}>
                      {index % 5 === 0 ? '🏆 Featured' :
                       index % 5 === 1 ? '⭐ Top Rated' :
                       index % 5 === 2 ? '🌊 Ocean' :
                       index % 5 === 3 ? '💎 Premium' :
                       '🎯 Popular'}
                    </Badge>
                  </div>
                  
                  <CardContent className="p-3">
                    {/* Availability Status - Above Price - Same as homepage */}
                    {index % 3 === 0 && (
                      <div className="flex items-center text-xs text-green-600 font-medium mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        Available
                      </div>
                    )}
                    
                    {/* Price - Same as homepage */}
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {community.monthlyRent ? `$${community.monthlyRent.toLocaleString()}` : '$3,800'}
                      {!community.claimed && (
                        <span className="text-xs text-gray-500 ml-1 font-normal">est.</span>
                      )}
                    </div>
                    
                    {/* Care Type - Same as homepage */}
                    <div className="text-sm text-gray-700 mb-1">
                      {community.careTypes?.length > 0 ? 
                        `${community.careTypes[0]} • Premium Care` : 
                        'Assisted Living • Premium Care'
                      }
                    </div>
                    
                    {/* Community Name - Same as homepage */}
                    <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                      {community.name}
                    </div>
                    
                    {/* Address - Same as homepage */}
                    <div className="text-xs text-gray-600 line-clamp-1 mb-2">
                      {community.address || 'Premium Community'}, {community.city}, {community.state || 'CA'}
                    </div>
                    
                    {/* Premium Regional Badges - Same as homepage */}
                    <div className="mb-3">
                      <Badge className={`text-white text-xs px-2 py-1 font-medium ${
                        index % 4 === 0 ? 'bg-blue-600/90' :
                        index % 4 === 1 ? 'bg-cyan-600/90' :
                        index % 4 === 2 ? 'bg-teal-600/90' :
                        'bg-indigo-600/90'
                      }`}>
                        {index % 4 === 0 ? 'Premium' :
                         index % 4 === 1 ? 'Featured' :
                         index % 4 === 2 ? 'Top Rated' :
                         'Exclusive'}
                      </Badge>
                    </div>
                    
                    {/* Enhanced Features Row - Same as homepage */}
                    <div className="flex items-center justify-between text-xs mt-1">
                      <div className="flex items-center text-gray-500">
                        <span>🏆 Premium Care</span>
                      </div>
                      <div className={`font-medium ${
                        index % 4 === 0 ? 'text-purple-600' :
                        index % 4 === 1 ? 'text-blue-600' :
                        index % 4 === 2 ? 'text-cyan-600' :
                        'text-indigo-600'
                      }`}>
                        {index % 4 === 0 ? '🏆 Featured' :
                         index % 4 === 1 ? '⭐ Top Rated' :
                         index % 4 === 2 ? '🌊 Premium' :
                         '💎 Exclusive'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
      
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mt-6 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {communities.length} communities
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextCard}
          disabled={currentIndex === communities.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Button>
      </div>
      
      {/* Dot Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {communities.slice(0, Math.min(10, communities.length)).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
      
      {/* Swipe Instruction */}
      <div className="text-center mt-4 text-xs text-gray-500">
        Swipe left or right to browse communities
      </div>
    </div>
  );
}