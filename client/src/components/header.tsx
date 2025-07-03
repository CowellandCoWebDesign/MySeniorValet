import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "Search", href: "/search" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Resources", href: "#resources" },
    { name: "About", href: "#about" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2" aria-label="TrueView Home - A Resource for Seniors">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
                <Home className="text-white text-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-display font-semibold text-gray-900">TrueView</span>
                <span className="text-xs text-gray-500 -mt-1">A Resource for Seniors</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors ${
                    location === item.href
                      ? "text-primary"
                      : "text-gray-700 hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/claim" className="hidden md:block">
              <Button variant="ghost" className="text-gray-700 hover:text-primary">
                Claim Your Community
              </Button>
            </Link>
            <Link to="/login">
              <Button aria-label="Sign in to TrueView">Sign In</Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation menu">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link to="/claim">
                    <Button variant="outline" className="w-full">
                      Claim Your Community
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
