import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
  color: string;
  likes: number;
}

interface PremiumImageProps {
  type: 'hero' | 'random' | 'community';
  query?: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  communityId?: number;
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
  fallback?: string;
}

export function PremiumImage({ 
  type, 
  query = 'senior living',
  orientation = 'landscape',
  communityId,
  className = "",
  width = 1200,
  height = 600,
  alt = "Premium senior living community",
  fallback = '/hero-senior-community.svg'
}: PremiumImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { data: images, isLoading, isError } = useQuery({
    queryKey: [`/api/images/${type}`, query, orientation, communityId],
    enabled: !imageError,
    retry: 1,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  const selectedImage = images && Array.isArray(images) ? images[0] : images;
  const imageUrl = selectedImage?.urls?.regular || selectedImage?.urls?.full;

  // Optimize image URL for specific dimensions
  const optimizedUrl = imageUrl ? 
    `${imageUrl}&w=${width}&h=${height}&fit=crop&crop=center&auto=format&q=80` : 
    fallback;

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = optimizedUrl;
    }
  }, [imageUrl, optimizedUrl]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-100 to-purple-100 ${className}`}
        style={{ width, height }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading premium image...</div>
        </div>
      </div>
    );
  }

  if (isError || imageError || !imageUrl) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        style={{ width, height }}
        onLoad={() => setImageLoaded(true)}
      />
    );
  }

  return (
    <div className="relative">
      <img
        src={optimizedUrl}
        alt={selectedImage?.alt_description || alt}
        className={`${className} ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={{ width, height }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 ${className}`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        </div>
      )}
      
      {/* Attribution for Unsplash */}
      {selectedImage && imageLoaded && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Photo by{' '}
          <a 
            href={`https://unsplash.com/@${selectedImage.user.username}?utm_source=TrueView&utm_medium=referral`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {selectedImage.user.name}
          </a>
          {' '}on{' '}
          <a 
            href="https://unsplash.com/?utm_source=TrueView&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}