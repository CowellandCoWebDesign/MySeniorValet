import { NavigationHeader } from "@/components/NavigationHeader";
import { FeaturedCommunitiesManager } from "@/components/admin/FeaturedCommunitiesManager";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFeaturedCommunitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader 
        title="Featured Communities Manager" 
        subtitle="Manage Featured Excellence Communities"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
        
        <FeaturedCommunitiesManager />
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Help</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Featured communities appear on the homepage between Community Directory and Research Platform</li>
            <li>• These are premium advertisement slots for communities with excellence subscriptions</li>
            <li>• Use drag handles to reorder how they appear on the homepage</li>
            <li>• Toggle visibility without removing communities from the system</li>
            <li>• Changes are reflected immediately on the public website</li>
          </ul>
        </div>
      </div>
    </div>
  );
}