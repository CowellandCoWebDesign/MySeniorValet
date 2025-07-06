import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityCardSkeleton() {
  return (
    <Card className="overflow-hidden border-l-4 border-l-gray-300">
      {/* Photo Skeleton */}
      <div className="relative h-48 bg-gray-100">
        <Skeleton className="w-full h-full" />
        
        {/* Heart Overlay Skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
        
        {/* Photo Count Skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        
        {/* Availability Overlay Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-300 px-4 py-2">
          <Skeleton className="w-32 h-4" />
        </div>
      </div>

      <CardContent className="p-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-1/2 h-4 mb-3" />
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 min-w-[100px]">
            <Skeleton className="w-12 h-5 mx-auto mb-1" />
            <Skeleton className="w-16 h-3 mx-auto mb-1" />
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Priority Sections Skeletons */}
        {/* 1. Availability */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <Skeleton className="w-40 h-5 mb-2" />
          <Skeleton className="w-32 h-6 mb-1" />
          <Skeleton className="w-48 h-4" />
        </div>

        {/* 2. Pricing */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-20 h-5 rounded-full" />
          </div>
          <Skeleton className="w-40 h-8 mb-1" />
          <Skeleton className="w-56 h-4 mb-2" />
          <div className="bg-white border border-gray-200 rounded p-2">
            <Skeleton className="w-full h-4 mb-1" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </div>

        {/* 3. Special Offers */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <Skeleton className="w-32 h-5 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded p-3">
              <Skeleton className="w-24 h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-2/3 h-4" />
            </div>
            <div className="bg-white border border-gray-200 rounded p-3">
              <Skeleton className="w-20 h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-1" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          </div>
        </div>

        {/* 4. Care Types */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <Skeleton className="w-36 h-5 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded p-3">
              <Skeleton className="w-32 h-5 mb-2" />
              <Skeleton className="w-full h-3 mb-1" />
              <Skeleton className="w-4/5 h-3" />
            </div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex space-x-3">
          <Skeleton className="flex-1 h-12 rounded" />
          <Skeleton className="w-24 h-12 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}