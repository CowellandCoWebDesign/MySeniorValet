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
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group" aria-label="TrueView Home - Senior Living Community Search">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200" aria-hidden="true">
                <Home className="text-white h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-bold text-gray-900 group-hover:text-primary transition-colors">TrueView</span>
                <span className="text-xs text-gray-500 font-medium -mt-1 group-hover:text-gray-600 transition-colors">Senior Living Search</span>
              </div>
            </Link>
            <nav className="hidden lg:flex space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      location === item.href
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-gray-700 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/claim" className="hidden lg:block">
              <Button variant="ghost" className="text-gray-700 hover:text-primary hover:bg-gray-50 font-medium">
                <Building2 className="h-4 w-4 mr-2" />
                Claim Your Community
              </Button>
            </Link>
            <Link to="/login">
              <Button className="shadow-sm hover:shadow-md transition-shadow" aria-label="Sign in to TrueView">
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
                      <span className="text-lg font-display font-bold text-gray-900">TrueView</span>
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
                    <Link to="/claim">
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="h-4 w-4 mr-2" />
                        Claim Your Community
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
