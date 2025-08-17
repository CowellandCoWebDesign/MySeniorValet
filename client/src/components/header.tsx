import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Menu, Search, MapPin, Building2, Shield, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AccessibilityOptions } from "@/components/AccessibilityOptions";

export function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Explore", href: "/explore", icon: MapPin },
    { name: "About", href: "/about", icon: HelpCircle },
    { name: "Privacy", href: "/privacy", icon: Shield },
  ];

  return (
    <header className="bg-white dark:bg-gray-800/95 backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700/60 sticky top-0 z-50 relative overflow-hidden">
      {/* Subtle animated background - contained within header */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-cyan-50/30 opacity-60"></div>
      <div className="absolute top-0 left-1/4 w-32 h-16 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-24 h-16 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group" aria-label="MySeniorValet Home - Senior Living Community Search">
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 overflow-hidden" aria-hidden="true">
                <Home className="text-white h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transform transition-all duration-300">MySeniorValet</span>
                <span className="text-xs text-gray-500 font-medium -mt-1 group-hover:text-gray-600 dark:text-gray-400 transition-colors duration-300">Your Personal Senior Living Concierge</span>
              </div>
            </Link>
            <nav className="hidden lg:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 group ${
                      location === item.href
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    }`}
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    <span>{item.name}</span>
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <NotificationCenter />
            <Link href="/community-portal" className="hidden lg:block">
              <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                <Building2 className="h-4 w-4 mr-2" />
                Community Portal
              </Button>
            </Link>
            <Link href="/login">
              <Button className="shadow-sm hover:shadow-md transition-shadow" aria-label="Sign in to MySeniorValet">
                Sign In
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="default" 
                  className="lg:hidden px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 shadow-md hover:shadow-lg transition-all" 
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300 mr-2" aria-hidden="true" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu</span>
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
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                            location === item.href
                              ? "text-primary bg-primary/10 shadow-sm"
                              : "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50"
                          }`}
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
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <AccessibilityOptions />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
