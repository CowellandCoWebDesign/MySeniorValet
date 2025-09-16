import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, X, ZoomIn, Share2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PhotoCarouselProps {
  photos?: any[];
  communityId?: number;
  communityName: string;
  community?: any;
  verificationReport?: any;
  isVerifying?: boolean;
  className?: string;
  showValidation?: boolean;
  showSourceIndicator?: boolean;
  isLoading?: boolean;
  currentPhotoIndex?: number;
  onPhotoIndexChange?: (index: number) => void;
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
  photos = [], 
  communityId,
  communityName,
  community,
  verificationReport,
  isVerifying = false, 
  className = "", 
  showValidation = false,
  showSourceIndicator = true,
  isLoading = false,
  currentPhotoIndex,
  onPhotoIndexChange
}: PhotoCarouselProps) {
  // Use controlled or uncontrolled mode
  const isControlled = currentPhotoIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = isControlled ? currentPhotoIndex : internalIndex;
  
  const setCurrentIndex = (index: number) => {
    if (isControlled && onPhotoIndexChange) {
      onPhotoIndexChange(index);
    } else {
      setInternalIndex(index);
    }
  };
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [photoValidation, setPhotoValidation] = useState<Record<string, PhotoValidationResult>>({});
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showValidationReport, setShowValidationReport] = useState(false);
  const [photoUpdateKey, setPhotoUpdateKey] = useState(0);
  
  // Get all photos from database and web intelligence  
  const getAllPhotos = () => {
    const allPhotos = [];
    
    // Add database photos first  
    if (community?.photos && community.photos.length > 0) {
      allPhotos.push(...community.photos.map((p: any) => ({
        url: typeof p === 'string' ? p : (p.image_url || p.url || p),
        source: 'database'
      })));
    }
    
    // Add passed photos prop
    if (photos && photos.length > 0) {
      allPhotos.push(...photos.map((p: any) => ({
        url: typeof p === 'string' ? p : (p.image_url || p.url || p),
        source: 'prop'
      })));
    }
    
    // Add web intelligence photos
    let webImages = null;
    if (verificationReport?.webIntelligence?.images) {
      webImages = verificationReport.webIntelligence.images;
    } else if (verificationReport?.verificationResults?.webIntelligence?.images) {
      webImages = verificationReport.verificationResults.webIntelligence.images;
    }
    
    if (webImages && webImages.length > 0) {
      const webPhotos = webImages
        .filter((img: any) => {
          const url = typeof img === 'string' ? img : (img.image_url || img.url || img);
          
          // Skip logos and icons
          if (url.includes('logo') || url.includes('icon') || 
              url.includes('placeholder') || url.includes('default')) {
            return false;
          }
          
          return true;
        })
        .map((img: any) => {
          if (typeof img === 'string') {
            return { url: img, source: 'web' };
          }
          return {
            url: img.image_url || img.url || img,
            source: 'web',
            isAuthentic: img.isAuthentic
          };
        });
      allPhotos.push(...webPhotos);
    }
    
    // Remove duplicates
    const uniquePhotos = Array.from(new Map(allPhotos.map(p => [p.url, p])).values());
    return uniquePhotos;
  };
  
  const processedPhotos = getAllPhotos();

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

  // Watch for verification report changes and force re-render
  useEffect(() => {
    const webImages = verificationReport?.webIntelligence?.images || 
                     verificationReport?.verificationResults?.webIntelligence?.images;
    if (webImages && webImages.length > 0) {
      console.log('🎉 Forcing carousel update with new web photos:', webImages.length);
      setPhotoUpdateKey(prev => prev + 1);
    }
  }, [verificationReport]);
  
  // Validate individual photos on load for quality checking
  useEffect(() => {
    if (showValidation && processedPhotos.length > 0) {
      const validatePhotos = async () => {
        for (const photo of processedPhotos.slice(0, 3)) { // Validate first 3 photos for performance
          const photoUrl = photo.url;
          if (!photoValidation[photoUrl]) {
            try {
              const response = await fetch(photoUrl, { method: 'HEAD' });
              setPhotoValidation(prev => ({
                ...prev,
                [photoUrl]: {
                  url: photoUrl,
                  isValid: response.ok,
                  status: response.status,
                  lastChecked: new Date()
                }
              }));
            } catch (error) {
              setPhotoValidation(prev => ({
                ...prev,
                [photoUrl]: {
                  url: photoUrl,
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
  }, [processedPhotos, showValidation]);

  // Filter out broken images
  const safePhotos = processedPhotos.filter(photo => !imageErrors.has(photo.url));
  
  // Show loading state with web intelligence check
  const isLoadingWebPhotos = isVerifying || isLoading;
  const hasNoRealPhotos = safePhotos.length === 0;
  
  // Detect if this community likely needs enrichment
  const needsEnrichment = hasNoRealPhotos && (
    !community?.enrichment_data || 
    !community?.last_enrichment_date ||
    (community?.enrichment_data && (!community.enrichment_data.photos || community.enrichment_data.photos.length === 0))
  );
  
  // Show loading state if actively loading OR if needs enrichment (auto-loading in background)
  if (hasNoRealPhotos && (isLoadingWebPhotos || needsEnrichment)) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 dark:border-gray-600 border-t-primary"></div>
          </div>
          <p className="text-sm font-medium">Searching for authentic photos...</p>
          <p className="text-xs text-gray-400 mt-2">
            Checking directory sites and official sources
          </p>
        </div>
      </div>
    );
  }

  // Check if we have any photos to display
  if (!safePhotos || safePhotos.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ZoomIn className="w-8 h-8" />
          </div>
          <p className="text-sm">No photos available</p>
          {photos.length > 0 && imageErrors.size > 0 && (
            <p className="text-xs text-orange-500 mt-2">
              {imageErrors.size} photo{imageErrors.size > 1 ? 's' : ''} could not be loaded
            </p>
          )}
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
    const newIndex = (currentIndex + 1) % safePhotos.length;
    setCurrentIndex(newIndex);
  };

  const prevPhoto = () => {
    const newIndex = (currentIndex - 1 + safePhotos.length) % safePhotos.length;
    setCurrentIndex(newIndex);
  };

  const goToPhoto = (index: number) => {
    setCurrentIndex(index);
  };

  const currentPhoto = safePhotos[Math.min(currentIndex, safePhotos.length - 1)];
  const currentPhotoValidation = photoValidation[currentPhoto?.url];

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
        <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
          {/* Loading indicator for individual image */}
          {currentPhoto && !loadedImages.has(currentPhoto.url) && !imageErrors.has(currentPhoto.url) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-600 border-t-primary mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading photo...</p>
              </div>
            </div>
          )}
          
          {/* Error state for broken image */}
          {currentPhoto && imageErrors.has(currentPhoto.url) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-orange-500" />
                <p className="text-sm">Photo unavailable</p>
                <p className="text-xs text-gray-400 mt-1">The image could not be loaded</p>
              </div>
            </div>
          )}
          
          {currentPhoto && (
            <img
              src={currentPhoto.url}
              alt={`${communityName} - Photo ${currentIndex + 1}`}
              className={`w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity ${
                loadedImages.has(currentPhoto.url) ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setShowFullscreen(true)}
              onLoad={(e) => {
                setLoadedImages(prev => new Set([...prev, currentPhoto.url]));
              }}
              onError={(e) => {
                // Handle broken images gracefully
                setImageErrors(prev => new Set([...prev, currentPhoto.url]));
                console.log(`Failed to load image: ${currentPhoto.url}`);
                
                if (showValidation) {
                  setPhotoValidation(prev => ({
                    ...prev,
                    [currentPhoto.url]: {
                      url: currentPhoto.url,
                      isValid: false,
                      error: 'Failed to load image',
                      lastChecked: new Date()
                    }
                  }));
                }
                
                // Try to move to next photo if available
                if (safePhotos.length > 1) {
                  setTimeout(nextPhoto, 500);
                }
              }}
            />
          )}

          {/* Photo Count Badge */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm z-20">
            {Math.min(currentIndex + 1, safePhotos.length)} of {safePhotos.length}
            {imageErrors.size > 0 && (
              <span className="text-xs text-orange-300 ml-1">
                ({imageErrors.size} failed)
              </span>
            )}
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
            {currentPhoto && (
              <img
                src={currentPhoto.url}
                alt={`${communityName} - Photo ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

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