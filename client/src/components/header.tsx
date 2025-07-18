import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Menu, Search, MapPin, Building2, Shield, HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Explore", href: "/explore", icon: MapPin },
    { name: "About", href: "/about", icon: HelpCircle },
    { name: "Privacy", href: "/privacy", icon: Shield },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-50 relative overflow-hidden">
      {/* Subtle animated background - contained within header */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-purple-50/30 to-cyan-50/30 opacity-60"></div>
      <div className="absolute top-0 left-1/4 w-32 h-16 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-0 right-1/4 w-24 h-16 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group" aria-label="MySeniorValet Home - Senior Living Community Search">
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 overflow-hidden" aria-hidden="true">
                <Home className="text-white h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-105 transform transition-all duration-300">MySeniorValet</span>
                <span className="text-xs text-gray-500 font-medium -mt-1 group-hover:text-gray-600 transition-colors duration-300">Your Personal Senior Living Concierge</span>
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
                        : "text-gray-700 hover:text-primary hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
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
            <Link to="/community-portal" className="hidden lg:block">
              <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium">
                <Building2 className="h-4 w-4 mr-2" />
                Community Portal
              </Button>
            </Link>
            <Link to="/login">
              <Button className="shadow-sm hover:shadow-md transition-shadow" aria-label="Sign in to MySeniorValet">
                Sign In
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-gray-50" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <div className="flex flex-col space-y-6 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Home className="text-white h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-display font-bold text-gray-900">MySeniorValet</span>
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
                              : "text-gray-700 hover:text-primary hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Link to="/community-portal">
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="h-4 w-4 mr-2" />
                        Community Portal
                      </Button>
                    </Link>
                    <Link to="/login">
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
    </header>
  );
}
