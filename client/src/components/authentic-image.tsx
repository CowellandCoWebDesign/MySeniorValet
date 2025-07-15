import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getComingSoonImage } from "@/lib/comingSoonPhotos";

interface AuthenticPhoto {
  photoReference: string;
  attributions?: string[];
  width: number;
  height: number;
}

interface CommunityImages {
  communityId: string;
  communityName: string;
  photos: AuthenticPhoto[];
  photoCount: number;
  source: 'google_places_authentic';
}

interface AuthenticImageProps {
  communityId: number;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  fallback?: string;
  photoIndex?: number; // Which photo from the community's collection to show
}

export function AuthenticImage({ 
  communityId,
  className = "",
  width = 1200,
  height = 600,
  alt = "Senior living community",
  fallback = '/hero-senior-community.svg',
  photoIndex = 0
}: AuthenticImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { data: communityImages, isLoading, isError } = useQuery<CommunityImages>({
    queryKey: [`/api/images/community/${communityId}`],
    enabled: !imageError,
    retry: 1,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  // Select the photo at the specified index, or first photo if index out of bounds
  const selectedPhoto = communityImages?.photos?.[photoIndex] || communityImages?.photos?.[0];
  
  // Use Google Places photo reference URL if available
  const imageUrl = selectedPhoto?.photoReference;

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = imageUrl;
    }
  }, [imageUrl]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-50 to-blue-100 animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading authentic photos...</div>
        </div>
      </div>
    );
  }

  if (isError || imageError || !imageUrl) {
    return (
      <div className="relative">
        <img
          src={getComingSoonImage(communityId)}
          alt={`${alt} - Coming Soon`}
          className={`${className} object-cover`}
          style={{ width, height }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 text-white flex items-center justify-center text-xl">
                  📸
                </div>
              </div>
              <p className="text-lg font-bold mb-2 tracking-wide">PHOTOS COMING SOON</p>
              <p className="text-sm text-gray-200">We're working to add more photos</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={`${communityImages?.communityName || alt} - Authentic photo`}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 object-cover`}
        style={{ width, height }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 animate-pulse ${className}`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      )}
      
      {/* Attribution for Google Places (if attributions available) */}
      {selectedPhoto?.attributions && selectedPhoto.attributions.length > 0 && imageLoaded && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {selectedPhoto.attributions[0]}
        </div>
      )}

      {/* Photo counter if multiple photos available */}
      {communityImages && communityImages.photoCount > 1 && imageLoaded && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {photoIndex + 1} of {communityImages.photoCount}
        </div>
      )}
    </div>
  );
}

// Component for displaying a photo carousel for communities
interface AuthenticPhotoCarouselProps {
  communityId: number;
  className?: string;
  height?: number;
}

export function AuthenticPhotoCarousel({ 
  communityId, 
  className = "",
  height = 400
}: AuthenticPhotoCarouselProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const { data: communityImages, isLoading } = useQuery<CommunityImages>({
    queryKey: [`/api/images/community/${communityId}`],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  if (isLoading || !communityImages?.photos?.length) {
    return (
      <AuthenticImage 
        communityId={communityId}
        className={className}
        height={height}
        photoIndex={0}
      />
    );
  }

  const totalPhotos = communityImages.photos.length;

  return (
    <div className="relative">
      <AuthenticImage 
        communityId={communityId}
        className={className}
        height={height}
        photoIndex={currentPhotoIndex}
      />
      
      {/* Navigation arrows for multiple photos */}
      {totalPhotos > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={() => setCurrentPhotoIndex((prev) => prev === 0 ? totalPhotos - 1 : prev - 1)}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Previous photo"
          >
            ←
          </button>
          
          {/* Next button */}
          <button
            onClick={() => setCurrentPhotoIndex((prev) => (prev + 1) % totalPhotos)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Next photo"
          >
            →
          </button>
          
          {/* Photo indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {Array.from({ length: totalPhotos }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}