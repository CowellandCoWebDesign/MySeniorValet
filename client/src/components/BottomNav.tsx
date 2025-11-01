import { Search, Heart, Calendar, GitCompare, MessageSquare } from 'lucide-react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  savedCount?: number;
  messagesCount?: number;
  className?: string;
}

export function BottomNav({ savedCount = 0, messagesCount = 0, className }: BottomNavProps) {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/map-search',
      badge: null,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Heart,
      path: '/family-dashboard',
      badge: savedCount > 0 ? savedCount : null,
    },
    {
      id: 'tourmate',
      label: 'Tours',
      icon: Calendar,
      path: '/tours',
      badge: null,
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: GitCompare,
      path: '/ai-search-comparison',
      badge: null,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      badge: messagesCount > 0 ? messagesCount : null,
    },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg',
        'md:hidden', // Only show on mobile
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg',
                isActive && 'text-blue-600 dark:text-blue-400'
              )}
              data-testid={`bottom-nav-${item.id}`}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                {item.badge !== null && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span
                className={cn(
                  'text-xs mt-1 font-medium transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
