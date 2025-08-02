import React from 'react';
import { Camera, X, Upload, MessageSquare, Shield, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MissingPhotosPanelProps {
  communityId: number;
  communityName: string;
  size?: 'small' | 'large';
}

export const MissingPhotosPanel: React.FC<MissingPhotosPanelProps> = ({ 
  communityId, 
  communityName,
  size = 'large' 
}) => {
  const handleTourTrackerClick = () => {
    window.location.href = `/tour-tracker?communityId=${communityId}`;
  };

  const handleUploadInfoClick = () => {
    window.location.href = `/community/${communityId}/contribute`;
  };

  if (size === 'small') {
    return (
      <div className="h-full bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {/* Blurred placeholder background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 opacity-50" />
        
        {/* Badge overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-amber-600 text-white border-0 backdrop-blur-sm shadow-lg">
            <Camera className="h-3 w-3 mr-1" />
            Photos Pending — Not Verified
          </Badge>
        </div>

        {/* Center content */}
        <div className="relative h-full flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Camera className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              No photos available
            </p>
            <Button 
              onClick={handleTourTrackerClick}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-1" />
              Add Photos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main placeholder image with overlay */}
      <div className="relative h-96 bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-lg">
        {/* Blurred/neutral background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 opacity-50" />
        
        {/* Pattern overlay for visual interest */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.05) 35px, rgba(0,0,0,.05) 70px)`,
          }} />
        </div>

        {/* Badge overlay */}
        <div className="absolute top-6 left-6 z-10">
          <Badge className="bg-amber-600 text-white border-0 backdrop-blur-sm shadow-lg px-4 py-2 text-sm">
            <Camera className="h-4 w-4 mr-2" />
            Photos Pending — Not Verified
          </Badge>
        </div>

        {/* Center placeholder icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center shadow-inner">
            <Camera className="w-16 h-16 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {/* Hover text */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm inline-block px-4 py-2 rounded-lg">
            We're still waiting on real tour photos or an official community claim
          </p>
        </div>
      </div>

      {/* Status message */}
      <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <div className="p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                🏗️ This Community Hasn't Been Verified Yet
              </h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>You're seeing a placeholder because:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>The community hasn't claimed their page to upload official photos and details, or</li>
                  <li>No family has toured and reviewed it using our Tour Tracker.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Missing data panel */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            🔍 Here's what we're missing until someone steps in:
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">Verified tour photos</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">Real pricing & availability</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">Any move-in incentives or discounts</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-gray-700 dark:text-gray-300">Community response to inquiries</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              🔐 Transparency only happens when real people share real experiences.
            </p>
          </div>
        </div>
      </Card>

      {/* Call to action panel */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <div className="p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            🚀 You can unlock this listing.
          </h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Be the first to leave a Tour Tracker review and help others see what this place is really like.
          </p>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              🙋‍♀️ Want to help? Be the first to:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-green-600 dark:text-green-400" />
                Upload photos
              </li>
              <li className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
                Share pricing or move-in details
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
                Leave a Tour Tracker review
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleTourTrackerClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Submit Tour Tracker Review
            </Button>
            <Button 
              onClick={handleUploadInfoClick}
              variant="outline"
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 font-semibold py-3"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Info
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};