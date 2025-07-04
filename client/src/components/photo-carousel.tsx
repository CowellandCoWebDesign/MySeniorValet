import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Share2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PhotoCarouselProps {
  photos: string[];
  communityName: string;
  className?: string;
}

export function PhotoCarousel({ photos, communityName, className = "" }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <ZoomIn className="w-8 h-8" />
          </div>
          <p className="text-sm">No photos available</p>
        </div>
      </div>
    );
  }

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className={`relative rounded-lg overflow-hidden bg-gray-100 ${className}`}>
        {/* Main Photo */}
        <div className="relative aspect-video">
          <img
            src={photos[currentIndex]}
            alt={`${communityName} - Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setShowFullscreen(true)}
          />
          
          {/* Photo Count Badge */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} of {photos.length}
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={prevPhoto}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={nextPhoto}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0"
            onClick={() => setShowFullscreen(true)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-4 right-16 flex space-x-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => goToPhoto(index)}
                className={`flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? "border-white shadow-lg" 
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={photo}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-full max-h-full p-0 bg-black/95">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <img
              src={photos[currentIndex]}
              alt={`${communityName} - Photo ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Photo Info */}
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="text-lg font-medium">{communityName}</h3>
              <p className="text-sm text-gray-300">Photo {currentIndex + 1} of {photos.length}</p>
            </div>

            {/* Navigation in Fullscreen */}
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => navigator.share?.({ 
                  title: `${communityName} Photos`,
                  url: window.location.href 
                })}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}