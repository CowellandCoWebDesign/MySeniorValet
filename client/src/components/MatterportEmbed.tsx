import { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Eye,
  ExternalLink,
  Share,
  Clock,
  Home
} from "lucide-react";

interface MatterportEmbedProps {
  tourId: string;
  tourUrl: string;
  previewImage?: string;
  metadata?: {
    duration?: number;
    roomCount?: number;
    tourDescription?: string;
    features?: string[];
    roomLabels?: string[];
  };
  showControls?: boolean;
  autoplay?: boolean;
  communityName?: string;
}

export function MatterportEmbed({ 
  tourId, 
  tourUrl, 
  previewImage,
  metadata,
  showControls = true,
  autoplay = false,
  communityName = "Community"
}: MatterportEmbedProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Track tour view when component mounts
  useEffect(() => {
    if (tourId) {
      // Track the view
      trackTourView(tourId);
    }
  }, [tourId]);

  const trackTourView = async (id: string) => {
    try {
      await fetch(`/api/tours/${id}/view`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to track tour view:', error);
    }
  };

  const handlePlay = () => {
    // Instead of playing inline, open the tour in a new tab
    window.open(tourUrl, '_blank', 'noopener,noreferrer');
    
    // Track the view
    if (tourId) {
      trackTourView(tourId);
    }
  };


  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Virtual Tour - ${communityName}`,
          text: `Take a virtual tour of ${communityName}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Tour link has been copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleExternalOpen = () => {
    window.open(tourUrl, '_blank', 'noopener,noreferrer');
  };


  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="relative bg-black aspect-video"
        >
          {/* Tour Preview - Always show this, clicking opens in new tab */}
          <div className="relative w-full h-full">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt={`Virtual tour of ${communityName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <Home className="w-16 h-16 mx-auto mb-4 opacity-80" />
                  <h3 className="text-xl font-semibold mb-2">Virtual Tour</h3>
                  <p className="opacity-90">Experience {communityName} in 3D</p>
                </div>
              </div>
            )}
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button
                size="lg"
                onClick={handlePlay}
                className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm px-8 py-6 text-lg group"
              >
                <Play className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform" />
                Start Virtual Tour
              </Button>
            </div>

            {/* Tour Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{communityName} - Virtual Tour</h4>
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    3D Tour
                  </Badge>
                </div>
                
                {metadata && (
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    {metadata.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {metadata.duration} min tour
                      </div>
                    )}
                    {metadata.roomCount && (
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {metadata.roomCount} spaces
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Interactive
                    </div>
                  </div>
                )}
                
                {/* Additional controls */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleShare}
                    className="bg-white/10 hover:bg-white/20 text-white border-0 h-8"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleExternalOpen}
                    className="bg-white/10 hover:bg-white/20 text-white border-0 h-8"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tour Description */}
        {metadata?.tourDescription && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              {metadata.tourDescription}
            </p>
            
            {metadata.features && metadata.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metadata.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Room Labels */}
        {metadata?.roomLabels && metadata.roomLabels.length > 0 && (
          <div className="px-4 pb-4">
            <h5 className="text-sm font-semibold mb-2">Tour Highlights</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {metadata.roomLabels.map((room, index) => (
                <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full" />
                  {room}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for community cards
export function MatterportTourPreview({ 
  tourUrl, 
  previewImage, 
  communityName,
  tourId 
}: { 
  tourUrl: string; 
  previewImage?: string; 
  communityName: string;
  tourId: string;
}) {
  const handleClick = () => {
    // Open tour in new tab
    window.open(tourUrl, '_blank', 'noopener,noreferrer');
    
    // Track the view
    if (tourId) {
      fetch(`/api/tours/${tourId}/view`, { method: 'POST' }).catch(console.error);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={handleClick}>
      {previewImage ? (
        <img 
          src={previewImage} 
          alt={`Virtual tour preview`}
          className="w-full aspect-video object-cover rounded-lg"
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Home className="w-8 h-8 text-white opacity-80" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 rounded-lg flex items-center justify-center">
        <div className="transform scale-0 group-hover:scale-100 transition-transform duration-200">
          <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white">
            <Play className="w-4 h-4 mr-2" />
            View 3D Tour
          </Button>
        </div>
      </div>
      
      <Badge 
        className="absolute top-2 right-2 bg-purple-600 text-white"
      >
        3D Tour
      </Badge>
    </div>
  );
}