import { Search, Heart, Calendar, GitCompare, MessageSquare } from 'lucide-react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  savedCount?: number;
  messagesCount?: number;
  className?: string;
  onPanelChange?: (panel: 'messages' | 'tours' | 'compare' | 'none') => void;
  activePanel?: 'messages' | 'tours' | 'compare' | 'none';
}

export function BottomNav({ savedCount = 0, messagesCount = 0, className, onPanelChange, activePanel = 'none' }: BottomNavProps) {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/map-search',
      badge: null,
      isPanel: false,
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: Heart,
      path: '/family-dashboard',
      badge: savedCount > 0 ? savedCount : null,
      isPanel: false,
    },
    {
      id: 'tourmate',
      label: 'Tours',
      icon: Calendar,
      path: '/tours',
      badge: null,
      isPanel: true,
      panelName: 'tours' as const,
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: GitCompare,
      path: '/ai-search-comparison',
      badge: null,
      isPanel: true,
      panelName: 'compare' as const,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      path: '/messages',
      badge: messagesCount > 0 ? messagesCount : null,
      isPanel: true,
      panelName: 'messages' as const,
    },
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    // If on map-search page and item is a panel, trigger panel instead of routing
    if (location === '/map-search' && item.isPanel && onPanelChange && item.panelName) {
      // Toggle panel - close if already open, open if closed
      onPanelChange(activePanel === item.panelName ? 'none' : item.panelName);
    } else if (!item.isPanel) {
      // For non-panel items, route normally
      setLocation(item.path);
    } else {
      // If not on map-search, route to the page
      setLocation(item.path);
    }
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-[60] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.isPanel && item.panelName === activePanel);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
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
                  'text-xs mt-1 font-medium transition-all duration-200 md:text-sm',
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
