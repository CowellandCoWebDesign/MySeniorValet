import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Menu, Search, MapPin, Building2, Shield, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { cn } from "@/lib/utils";

interface UniversalHeaderProps {
  isHeroPage?: boolean;
  heroHeight?: number;
}

export function UniversalHeader({ isHeroPage = false, heroHeight = 600 }: UniversalHeaderProps) {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      // If on hero page, check if scrolled past hero section
      // Otherwise, navbar becomes solid immediately after any scroll
      const scrollThreshold = isHeroPage ? heroHeight - 100 : 50;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHeroPage, heroHeight]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigation = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Explore", href: "/explore", icon: MapPin },
    { name: "About", href: "/about", icon: HelpCircle },
    { name: "Privacy", href: "/privacy", icon: Shield },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Sticky Search Bar - Always at top */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search 34,000+ Senior Living Communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Navigation Bar - Transparent/Solid based on scroll */}
      <nav 
        className={cn(
          "transition-all duration-300 border-b",
          isHeroPage && !isScrolled
            ? "bg-transparent border-transparent"
            : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-gray-200 dark:border-gray-700"
        )}
      >
        {/* Subtle animated background - only when solid */}
        {(!isHeroPage || isScrolled) && (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-cyan-50/30 opacity-60"></div>
            <div className="absolute top-0 left-1/4 w-32 h-16 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-24 h-16 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </>
        )}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3 group" aria-label="MySeniorValet Home">
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 overflow-hidden">
                  <Home className="text-white h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-xl font-display font-bold bg-gradient-to-r bg-clip-text text-transparent group-hover:scale-105 transform transition-all duration-300",
                    isHeroPage && !isScrolled
                      ? "from-white to-gray-200"
                      : "from-blue-600 to-purple-600"
                  )}>
                    MySeniorValet
                  </span>
                  <span className={cn(
                    "text-xs font-medium -mt-1 transition-colors duration-300",
                    isHeroPage && !isScrolled
                      ? "text-gray-300 group-hover:text-white"
                      : "text-gray-500 group-hover:text-gray-600 dark:text-gray-400"
                  )}>
                    Your Personal Senior Living Concierge
                  </span>
                </div>
              </Link>
              
              <nav className="hidden lg:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "relative flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 group",
                        location === item.href
                          ? isHeroPage && !isScrolled
                            ? "text-white bg-white/20 shadow-sm"
                            : "text-primary bg-primary/10 shadow-sm"
                          : isHeroPage && !isScrolled
                            ? "text-gray-200 hover:text-white hover:bg-white/10"
                            : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                      )}
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      <span>{item.name}</span>
                      {(!isHeroPage || isScrolled) && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <NotificationCenter />
              <Link href="/community-portal" className="hidden lg:block">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "font-medium transition-all duration-300",
                    isHeroPage && !isScrolled
                      ? "text-gray-200 hover:text-white hover:bg-white/10"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Community Portal
                </Button>
              </Link>
              <Link href="/login">
                <Button 
                  className={cn(
                    "shadow-sm hover:shadow-md transition-all duration-300",
                    isHeroPage && !isScrolled
                      ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                      : ""
                  )} 
                  aria-label="Sign in to MySeniorValet"
                >
                  Sign In
                </Button>
              </Link>
              
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "lg:hidden",
                      isHeroPage && !isScrolled
                        ? "text-white hover:bg-white/10"
                        : "hover:bg-gray-50"
                    )} 
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-80">
                  <div className="flex flex-col space-y-6 mt-8">
                    <div className="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Home className="text-white h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-display font-bold text-gray-900 dark:text-white">MySeniorValet</span>
                        <span className="text-sm text-gray-500 font-medium -mt-1">Senior Living Search</span>
                      </div>
                    </div>
                    <nav className="flex flex-col space-y-2">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                              location === item.href
                                ? "text-primary bg-primary/10 shadow-sm"
                                : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                        <ThemeToggle />
                      </div>
                      <Link href="/community-portal">
                        <Button variant="outline" className="w-full justify-start">
                          <Building2 className="h-4 w-4 mr-2" />
                          Community Portal
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button className="w-full shadow-sm">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}