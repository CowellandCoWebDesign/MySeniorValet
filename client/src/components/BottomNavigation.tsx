import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  Heart, 
  Calendar, 
  Mail,
  Home,
  MoreHorizontal 
} from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  updateCount?: number;
}

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  updateCount = 350 
}: BottomNavigationProps) {
  const tabs = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'rentals', label: 'Rentals', icon: Home },
    { id: 'updates', label: 'Updates', icon: Bell, badge: updateCount },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'tours', label: 'Tours', icon: Calendar },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                console.log('Bottom nav button clicked:', tab.id);
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center space-y-1 px-1 py-2 transition-all duration-200 ease-in-out hover:bg-gray-50 active:bg-gray-100 active:scale-95 transform ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'fill-current scale-110' : 'hover:scale-105'
                }`} />
                {tab.badge && tab.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs leading-tight text-center max-w-full truncate ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}