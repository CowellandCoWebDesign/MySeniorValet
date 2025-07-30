import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900">
      <NavigationHeader 
        title="Page Not Found" 
        subtitle="The page you're looking for doesn't exist"
      />
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">404 Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Did you forget to add the page to the router?
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
