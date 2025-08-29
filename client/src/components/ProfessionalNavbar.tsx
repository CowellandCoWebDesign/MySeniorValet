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

  // Navigation items organized by category - using actual existing routes with emojis
  const navigationItems = {
    main: [
      { label: "Home", icon: Home, href: "/", emoji: "🏠" },
      { label: "Search", icon: Search, href: "/simplified-search", emoji: "🔍" },
      { label: "Map View", icon: MapPin, href: "/map-search", emoji: "🗺️" },
      { label: "Communities", icon: Building2, href: "/community-directory", emoji: "🏘️" },
    ],
    resources: [
      { label: "Learn Mode", icon: Brain, href: "/care-guide", emoji: "🧠" },
      { label: "Healthcare", icon: Heart, href: "/hospitals", emoji: "🏥" },
      { label: "Services", icon: Users, href: "/services", emoji: "👥" },
      { label: "Resources", icon: BookOpen, href: "/senior-resources", emoji: "📚" },
      { label: "Pricing Guide", icon: DollarSign, href: "/pricing", emoji: "💰" },
    ],
    tools: [
      { label: "Tour Scheduler", icon: Calendar, href: "/tours", emoji: "📅" },
      { label: "Cost Calculator", icon: BarChart3, href: "/costs", emoji: "🧮" },
      { label: "AI Assistant", icon: Brain, href: "/ai-support", emoji: "🤖" },
      { label: "Family Hub", icon: Heart, href: "/family-collaboration", emoji: "👨‍👩‍👧‍👦" },
    ],
    support: [
      { label: "Help Center", icon: HelpCircle, href: "/help", emoji: "❓" },
      { label: "Contact Us", icon: Phone, href: "/contact", emoji: "📞" },
      { label: "About", icon: Info, href: "/about", emoji: "ℹ️" },
      { label: "Privacy", icon: Shield, href: "/privacy", emoji: "🔒" },
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
        ? "bg-transparent backdrop-blur-sm" 
        : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/20 dark:border-gray-800/20",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section: Logo and Desktop Nav */}
          <div className="flex items-center space-x-8">
            {/* Mobile Menu Button - Clean Design */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <button
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  aria-label="Open menu"
                >
                  <span className="text-2xl">📋</span>
                  <span className="text-sm font-bold uppercase tracking-wide">Menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 bg-white dark:bg-gray-900">
                <SheetHeader className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-md">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white">MySeniorValet</SheetTitle>
                  </div>
                </SheetHeader>
                <div className="py-4">
                  {/* Mobile Navigation - Enhanced Professional */}
                  <div className="space-y-1 px-4">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-3">
                      Main Navigation
                    </p>
                    {navigationItems.main.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all duration-200 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                          <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{item.label}</span>
                      </Link>
                    ))}
                    
                    <Separator className="my-4 mx-3" />
                    
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-3">
                      Resources
                    </p>
                    {navigationItems.resources.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all duration-200 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                          <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{item.label}</span>
                      </Link>
                    ))}
                    
                    <Separator className="my-4 mx-3" />
                    
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 py-3">
                      Tools & Features
                    </p>
                    {navigationItems.tools.map((item) => (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-gray-800 transition-all duration-200 group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                          <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo - Game-Changing Rich Design */}
            <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <div className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="absolute -top-1 -right-1 text-sm">✨</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌟</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    MySeniorValet
                  </span>
                  <span className="text-lg">💎</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1">🏆 Clarity in Senior Living 🌈</span>
              </div>
            </Link>

            {/* Desktop Navigation - Rich with Emojis */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.main.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                    location === item.href 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-sm"
                  )}
                >
                  <span className="text-base">{item.emoji}</span>
                  {item.label}
                </Link>
              ))}
              
              {/* Resources Dropdown - Enhanced */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="space-x-2 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2.5 rounded-xl">
                    <span>Resources</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {navigationItems.resources.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center space-x-2 w-full cursor-pointer">
                        <span className="text-base">{item.emoji}</span>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tools Dropdown - Enhanced */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="space-x-2 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2.5 rounded-xl">
                    <span>Tools</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {navigationItems.tools.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center space-x-2 w-full cursor-pointer">
                        <span className="text-base">{item.emoji}</span>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Section: Accessibility, Language, Theme, User */}
          <div className="flex items-center space-x-2">
            {/* Accessibility Button - Traditional Blue Symbol */}
            <Link href="/accessibility">
              <Button
                variant="outline"
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700 w-11 h-11 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg group"
                aria-label="Accessibility Options"
              >
                <Accessibility className="h-6 w-6" />
              </Button>
            </Link>
            {/* Language Selector - Clean Flag Only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="text-3xl hover:scale-110 transition-transform duration-200 cursor-pointer focus:outline-none"
                  aria-label="Select language"
                >
                  {currentLanguage.flag}
                </button>
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

            {/* Theme Toggle - Professional */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 w-10 h-10 rounded-xl transition-all duration-200"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative text-gray-700 dark:text-gray-300">
                <Bell className="h-5 w-5" />
                {unreadCount && Number(unreadCount) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                    {String(Number(unreadCount))}
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
              <div className="flex items-center space-x-3">
                <Link href="/api/login">
                  <Button 
                    variant="outline" 
                    size="default" 
                    className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2.5 rounded-xl transition-all duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/api/login">
                  <Button 
                    size="default" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg px-5 py-2.5 rounded-xl transition-all duration-200"
                  >
                    Get Started
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