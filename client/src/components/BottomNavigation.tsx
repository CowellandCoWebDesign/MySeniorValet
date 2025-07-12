import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Bell, 
  Heart, 
  Calendar, 
  Mail,
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
    { id: 'updates', label: 'Updates', icon: Bell, badge: updateCount },
    { id: 'saved', label: 'Saved Communities', icon: Heart },
    { id: 'tours', label: 'Tours', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: Mail },
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
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                {tab.badge && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}