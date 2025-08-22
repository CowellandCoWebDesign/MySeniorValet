import { PhotoQualityDashboard } from "@/components/PhotoQualityDashboard";
// Simple header component since NavigationHeader doesn't exist
import { useAuth } from "@/hooks/useAuth";

export default function PhotoQualityAdmin() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Restricted</h1>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access photo quality management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Photo Quality Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and maintain photo quality across all communities</p>
        </div>
      </div>
      
      <div className="max-w-full mx-auto">
        <PhotoQualityDashboard />
      </div>
    </div>
  );
}