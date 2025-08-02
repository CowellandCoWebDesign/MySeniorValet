import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  Camera, 
  DollarSign, 
  Home, 
  Star, 
  Trophy, 
  AlertCircle,
  CheckCircle,
  Settings,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: number;
  type: string;
  category: string;
  priority: string;
  title: string;
  message: string;
  actionUrl?: string;
  iconType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  community?: {
    id: number;
    name: string;
  };
}

const iconMap: Record<string, React.ComponentType<any>> = {
  bell: Bell,
  camera: Camera,
  'dollar-sign': DollarSign,
  home: Home,
  star: Star,
  trophy: Trophy,
  alert: AlertCircle,
  check: CheckCircle
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const bellRef = useRef<HTMLButtonElement>(null);
  
  // Fetch notifications
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isOpen,
    refetchInterval: isOpen ? 30000 : false, // Refetch every 30 seconds when open
  });
  
  // Fetch unread count
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 60000, // Refetch every minute
  });
  
  const unreadCount = unreadCountData?.count || 0;
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => 
      apiRequest('POST', `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "All notifications marked as read",
        description: "Your notification inbox is now clear"
      });
    }
  });
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.actionUrl) {
      setIsOpen(false);
      // Navigate to action URL
      window.location.href = notification.actionUrl;
    }
  };
  
  const getIcon = (iconType?: string) => {
    const Icon = iconType ? iconMap[iconType] : Bell;
    return Icon || Bell;
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-500';
      case 'normal': return 'text-blue-600';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };
  
  const getCategoryBadge = (category: string) => {
    const badgeColors: Record<string, string> = {
      updates: 'bg-blue-100 text-blue-800',
      milestones: 'bg-green-100 text-green-800',
      reviews: 'bg-purple-100 text-purple-800',
      pricing: 'bg-yellow-100 text-yellow-800',
      media: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={`${badgeColors[category] || badgeColors.general} text-xs`}>
        {category}
      </Badge>
    );
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={bellRef}
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                Mark all read
              </Button>
            )}
            <Link href="/dashboard/notification-preferences">
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm mt-1">We'll notify you when something important happens</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification: Notification) => {
                const Icon = getIcon(notification.iconType);
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-1 ${getPriorityColor(notification.priority)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(notification.category)}
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {notification.community && (
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              {notification.community.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" className="w-full" size="sm">
                View all notifications
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}