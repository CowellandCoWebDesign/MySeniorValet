import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, X, Home, Search, MapPin, Users, Phone, Heart, 
  LogIn, UserPlus, Settings, HelpCircle, Globe, ChevronDown,
  Building2, Brain, Calendar, MessageSquare, FileText, Shield,
  DollarSign, BarChart3, BookOpen, Info, Accessibility,
  Bell, User, LogOut, ChevronRight, Languages, Sun, Moon
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";

interface NavbarProps {
  transparent?: boolean;
  className?: string;
}

export function ProfessionalNavbar({ transparent = false, className }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check for unread notifications
  const { data: unreadCount } = useQuery({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!isAuthenticated,
  });

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items organized by category - using actual existing routes
  const navigationItems = {
    main: [
      { label: "Home", icon: Home, href: "/" },
      { label: "Search", icon: Search, href: "/simplified-search" },
      { label: "Map View", icon: MapPin, href: "/map-search" },
      { label: "Communities", icon: Building2, href: "/community-directory" },
    ],
    resources: [
      { label: "Learn Mode", icon: Brain, href: "/care-guide" },
      { label: "Healthcare", icon: Heart, href: "/hospitals" },
      { label: "Services", icon: Users, href: "/services" },
      { label: "Resources", icon: BookOpen, href: "/senior-resources" },
      { label: "Pricing Guide", icon: DollarSign, href: "/pricing" },
    ],
    tools: [
      { label: "Tour Scheduler", icon: Calendar, href: "/tours" },
      { label: "Cost Calculator", icon: BarChart3, href: "/costs" },
      { label: "AI Assistant", icon: Brain, href: "/ai-support" },
      { label: "Family Hub", icon: Heart, href: "/family-collaboration" },
    ],
    support: [
      { label: "Help Center", icon: HelpCircle, href: "/help" },
      { label: "Contact Us", icon: Phone, href: "/contact" },
      { label: "About", icon: Info, href: "/about" },
      { label: "Privacy", icon: Shield, href: "/privacy" },
    ]
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      transparent && !isScrolled 
        ? "bg-transparent" 
        : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo and Desktop Nav */}
          <div className="flex items-center space-x-8">
            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-left">MySeniorValet</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {/* Mobile Navigation */}
                  <div className="space-y-1 px-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      Main
                    </p>
                    {navigationItems.main.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                    
                    <Separator className="my-2" />
                    
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      Resources
                    </p>
                    {navigationItems.resources.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                    
                    <Separator className="my-2" />
                    
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
                      Tools
                    </p>
                    {navigationItems.tools.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <Home className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                MySeniorValet
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.main.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href 
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Resources Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="space-x-1">
                    <span>Resources</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {navigationItems.resources.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center space-x-2 w-full cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="space-x-1">
                    <span>Tools</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {navigationItems.tools.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center space-x-2 w-full cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Section: Language, Theme, User */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-2">
                  <span className="text-lg">{currentLanguage.flag}</span>
                  <span className="hidden md:inline">{currentLanguage.label}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={cn(
                      "flex items-center space-x-2",
                      language === lang.code && "bg-purple-100 dark:bg-purple-900/30"
                    )}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount && Number(unreadCount) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                    {Number(unreadCount)}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu / Auth Buttons */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2 w-full cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/notification-preferences" className="flex items-center space-x-2 w-full cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/accessibility" className="flex items-center space-x-2 w-full cursor-pointer">
                      <Accessibility className="h-4 w-4" />
                      <span>Accessibility</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center space-x-2 w-full text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/api/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/api/login">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}