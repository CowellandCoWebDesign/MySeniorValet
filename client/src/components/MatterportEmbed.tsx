import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  Pause,
  Maximize,
  Eye,
  ExternalLink,
  Share,
  Clock,
  Home,
  AlertCircle,
  Loader2,
  Volume2,
  VolumeX
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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
    setIsPlaying(true);
    setIsLoaded(true);
  };

  const handleFullscreen = async () => {
    if (!document.fullscreenElement && containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
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

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const embedUrl = tourUrl.includes('my.matterport.com') 
    ? tourUrl.replace('/show/', '/embed/') + '&play=1&qs=1&applicationKey=your-key'
    : tourUrl;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className={`relative bg-black ${isFullscreen ? 'h-screen' : 'aspect-video'}`}
        >
          {!isPlaying ? (
            /* Tour Preview */
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
                  className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm px-8 py-6 text-lg"
                >
                  <Play className="w-8 h-8 mr-3" />
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
                </div>
              </div>
            </div>
          ) : (
            /* Active Tour Embed */
            <div className="relative w-full h-full">
              {!isLoaded && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
                    <p>Loading virtual tour...</p>
                  </div>
                </div>
              )}

              {loadError ? (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <Alert className="max-w-md">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      Unable to load the virtual tour. 
                      <Button 
                        variant="link" 
                        onClick={handleExternalOpen}
                        className="ml-2"
                      >
                        View in new tab
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  onLoad={() => setIsLoaded(true)}
                  onError={() => setLoadError(true)}
                  title={`Virtual tour of ${communityName}`}
                />
              )}

              {/* Tour Controls */}
              {showControls && isLoaded && !loadError && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-black/60 text-white border-0 backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShare}
                    className="bg-black/60 text-white border-0 backdrop-blur-sm"
                  >
                    <Share className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleExternalOpen}
                    className="bg-black/60 text-white border-0 backdrop-blur-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleFullscreen}
                    className="bg-black/60 text-white border-0 backdrop-blur-sm"
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
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
  const [showEmbed, setShowEmbed] = useState(false);

  if (showEmbed) {
    return (
      <div className="relative">
        <MatterportEmbed
          tourId={tourId}
          tourUrl={tourUrl}
          previewImage={previewImage}
          communityName={communityName}
          showControls={true}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowEmbed(false)}
          className="absolute top-2 left-2"
        >
          Close Tour
        </Button>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer" onClick={() => setShowEmbed(true)}>
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
        size="sm"
      >
        3D Tour
      </Badge>
    </div>
  );
}