import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, X, ZoomIn, Share2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PhotoCarouselProps {
  photos: string[];
  communityId?: number;
  communityName: string;
  className?: string;
  showValidation?: boolean;
  showSourceIndicator?: boolean;
}

interface PhotoValidationResult {
  url: string;
  isValid: boolean;
  error?: string;
  status?: number;
  fileSize?: number;
  dimensions?: { width: number; height: number };
  lastChecked: Date;
}

export function EnhancedPhotoCarousel({ 
  photos, 
  communityId,
  communityName, 
  className = "", 
  showValidation = false,
  showSourceIndicator = true 
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [photoValidation, setPhotoValidation] = useState<Record<string, PhotoValidationResult>>({});
  const [showValidationReport, setShowValidationReport] = useState(false);

  // Get photo validation report if validation is enabled and community ID is provided
  const { data: validationReport, isLoading: validationLoading } = useQuery<{
    success: boolean;
    report: {
      communityId: number;
      communityName: string;
      totalPhotos: number;
      validPhotos: number;
      invalidPhotos: number;
      issues: string[];
      recommendations: string[];
    };
  }>({
    queryKey: [`/api/communities/${communityId}/photos/validate`],
    enabled: showValidation && !!communityId,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showFullscreen) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevPhoto();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextPhoto();
          break;
        case 'Escape':
          event.preventDefault();
          setShowFullscreen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFullscreen, photos.length]);

  // Validate individual photos on load for quality checking
  useEffect(() => {
    if (showValidation && photos.length > 0) {
      const validatePhotos = async () => {
        for (const photo of photos.slice(0, 3)) { // Validate first 3 photos for performance
          if (!photoValidation[photo]) {
            try {
              const response = await fetch(photo, { method: 'HEAD' });
              setPhotoValidation(prev => ({
                ...prev,
                [photo]: {
                  url: photo,
                  isValid: response.ok,
                  status: response.status,
                  lastChecked: new Date()
                }
              }));
            } catch (error) {
              setPhotoValidation(prev => ({
                ...prev,
                [photo]: {
                  url: photo,
                  isValid: false,
                  error: 'Network error',
                  lastChecked: new Date()
                }
              }));
            }
          }
        }
      };

      validatePhotos();
    }
  }, [photos, showValidation]);

  if (!photos || photos.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ZoomIn className="w-8 h-8" />
          </div>
          <p className="text-sm">No photos available</p>
          {showValidation && (
            <p className="text-xs text-gray-400 mt-2">
              Consider adding authentic photos from verified sources
            </p>
          )}
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

  const currentPhoto = photos[currentIndex];
  const currentPhotoValidation = photoValidation[currentPhoto];

  // Check if current photo has validation issues
  const hasValidationIssue = showValidation && currentPhotoValidation && !currentPhotoValidation.isValid;

  // Get validation summary
  const validationSummary = validationReport?.report ? {
    totalPhotos: validationReport.report.totalPhotos,
    validPhotos: validationReport.report.validPhotos,
    invalidPhotos: validationReport.report.invalidPhotos,
    healthPercentage: Math.round((validationReport.report.validPhotos / validationReport.report.totalPhotos) * 100)
  } : null;

  return (
    <>
      <div className={`relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${className}`}>
        {/* Validation Alert */}
        {showValidation && validationSummary && validationSummary.invalidPhotos > 0 && (
          <Alert className="mb-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              Photo Quality Issue: {validationSummary.invalidPhotos} of {validationSummary.totalPhotos} photos may have issues.
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto text-orange-600 underline ml-2"
                onClick={() => setShowValidationReport(true)}
              >
                View Details
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Photo */}
        <div className="relative aspect-video">
          <img
            src={currentPhoto}
            alt={`${communityName} - Photo ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setShowFullscreen(true)}
            onError={(e) => {
              // Handle broken images gracefully
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              if (showValidation) {
                setPhotoValidation(prev => ({
                  ...prev,
                  [currentPhoto]: {
                    url: currentPhoto,
                    isValid: false,
                    error: 'Failed to load image',
                    lastChecked: new Date()
                  }
                }));
              }
            }}
          />

          {/* Photo Count Badge */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} of {photos.length}
          </div>

          {/* Photo Quality Badge */}
          {showValidation && currentPhotoValidation && (
            <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              currentPhotoValidation.isValid 
                ? 'bg-green-600/80 text-white'
                : 'bg-red-600/80 text-white'
            }`}>
              {currentPhotoValidation.isValid ? (
                <CheckCircle className="w-3 h-3 inline mr-1" />
              ) : (
                <AlertTriangle className="w-3 h-3 inline mr-1" />
              )}
              {currentPhotoValidation.isValid ? 'Verified' : 'Issue'}
            </div>
          )}

          {/* Enhanced Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-0 w-10 h-10 shadow-lg z-20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevPhoto();
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white border-0 w-10 h-10 shadow-lg z-20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextPhoto();
                }}
              >
                <ChevronRight className="w-6 h-6" />
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

          {/* Photo Issue Indicator */}
          {hasValidationIssue && (
            <div className="absolute bottom-4 left-4 bg-red-600/90 text-white px-3 py-1 rounded-full text-xs">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Photo may be unavailable
            </div>
          )}
        </div>

        {/* Enhanced Thumbnail Strip with Validation Indicators */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-4 right-16 flex space-x-2 overflow-x-auto">
            {photos.map((photo, index) => {
              const validation = photoValidation[photo];
              return (
                <button
                  key={index}
                  onClick={() => goToPhoto(index)}
                  className={`relative flex-shrink-0 w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? "border-white shadow-lg" 
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.filter = 'brightness(0.5)';
                    }}
                  />
                  {/* Validation indicator on thumbnail */}
                  {showValidation && validation && !validation.isValid && (
                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Overall Photo Health Indicator */}
        {showValidation && validationSummary && (
          <div className="absolute top-14 right-4">
            <Badge 
              variant={validationSummary.healthPercentage >= 80 ? "default" : 
                      validationSummary.healthPercentage >= 60 ? "secondary" : "destructive"}
              className="text-xs"
            >
              {validationSummary.healthPercentage}% Healthy
            </Badge>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-full max-h-full p-0 bg-black/95">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <img
              src={currentPhoto}
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
              {showValidation && currentPhotoValidation && (
                <p className={`text-xs mt-1 ${currentPhotoValidation.isValid ? 'text-green-300' : 'text-red-300'}`}>
                  {currentPhotoValidation.isValid ? 'Photo verified' : `Issue: ${currentPhotoValidation.error}`}
                </p>
              )}
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

      {/* Validation Report Modal */}
      {showValidation && (
        <Dialog open={showValidationReport} onOpenChange={setShowValidationReport}>
          <DialogContent className="max-w-md">
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Photo Quality Report</h3>
              
              {validationLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                  <span>Analyzing photos...</span>
                </div>
              ) : validationSummary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{validationSummary.totalPhotos}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{validationSummary.validPhotos}</p>
                      <p className="text-xs text-gray-600">Valid</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{validationSummary.invalidPhotos}</p>
                      <p className="text-xs text-gray-600">Issues</p>
                    </div>
                  </div>

                  {validationReport?.report.issues && validationReport.report.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Issues Found:</h4>
                      <ul className="space-y-1 max-h-32 overflow-y-auto">
                        {validationReport.report.issues.slice(0, 5).map((issue, index) => (
                          <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                        {validationReport.report.issues.length > 5 && (
                          <li className="text-xs text-gray-500">
                            ... and {validationReport.report.issues.length - 5} more issues
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button size="sm" onClick={() => setShowValidationReport(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No validation data available
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}