import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavigationHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export function NavigationHeader({ 
  title, 
  subtitle, 
  showBackButton = true, 
  onBackClick 
}: NavigationHeaderProps) {
  const [location, setLocation] = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBackButton && location !== "/" && (
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleBackClick}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </Button>
            )}
            
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MySeniorValet
                </h1>
                {(title || subtitle) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {title || subtitle}
                  </p>
                )}
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}