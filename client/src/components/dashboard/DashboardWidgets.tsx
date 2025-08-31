import { useState, useCallback, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart, MapPin, Calendar, Settings, Bell, Search, Star, Clock,
  TrendingUp, Activity, BarChart3, PieChart, Target, Zap,
  MoreVertical, X, Plus, GripVertical, Maximize2, Minimize2,
  RefreshCw, Download, Share2, Eye, EyeOff, Filter, ChevronRight
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Widget types
export type WidgetType = 
  | 'statistics'
  | 'activity-feed'
  | 'saved-communities'
  | 'recommendations'
  | 'search-trends'
  | 'budget-analysis'
  | 'care-types'
  | 'weekly-activity'
  | 'quick-actions'
  | 'notifications'
  | 'performance'
  | 'ai-insights';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  visible: boolean;
  customSettings?: any;
  refreshInterval?: number;
}

interface WidgetProps {
  config: WidgetConfig;
  data?: any;
  onUpdate?: (config: WidgetConfig) => void;
  onRemove?: (id: string) => void;
  onRefresh?: (id: string) => void;
  isDragging?: boolean;
}

// Base Widget Component with common functionality
const BaseWidget = memo(({ 
  config, 
  children, 
  onUpdate, 
  onRemove, 
  onRefresh,
  isDragging 
}: WidgetProps & { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: config.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await onRefresh?.(config.id);
    setTimeout(() => setIsLoading(false), 500);
  }, [config.id, onRefresh]);
  
  const widgetClass = useMemo(() => {
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3',
      full: 'col-span-4'
    };
    return `${sizeClasses[config.size]} ${isExpanded ? 'row-span-2' : ''}`;
  }, [config.size, isExpanded]);
  
  return (
    <div ref={setNodeRef} style={style} className={widgetClass}>
      <Card className="h-full relative overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="cursor-grab hover:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </button>
              <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowSettings(true)}>
                    <Settings className="h-3 w-3 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdate?.({ ...config, visible: false })}>
                    <EyeOff className="h-3 w-3 mr-2" />
                    Hide
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRemove?.(config.id)}>
                    <X className="h-3 w-3 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3">
          {children}
        </CardContent>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        )}
      </Card>
      
      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Size</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={config.size}
                onChange={(e) => onUpdate?.({ ...config, size: e.target.value as any })}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="full">Full Width</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Refresh Interval (seconds)</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded"
                value={config.refreshInterval || 60}
                onChange={(e) => onUpdate?.({ 
                  ...config, 
                  refreshInterval: parseInt(e.target.value) 
                })}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

// Statistics Widget
export const StatisticsWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const stats = useMemo(() => data?.stats || {
    totalFavorites: 0,
    totalTours: 0,
    totalSearches: 0,
    profileCompletion: 0
  }, [data]);
  
  return (
    <BaseWidget config={config} {...props}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500">Saved</p>
          <p className="text-xl font-bold">{stats.totalFavorites}</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">+12%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tours</p>
          <p className="text-xl font-bold">{stats.totalTours}</p>
          <Badge variant="outline" className="text-xs mt-1">Next: Tomorrow</Badge>
        </div>
        <div>
          <p className="text-xs text-gray-500">Searches</p>
          <p className="text-xl font-bold">{stats.totalSearches}</p>
          <span className="text-xs text-gray-400">5 today</span>
        </div>
        <div>
          <p className="text-xs text-gray-500">Profile</p>
          <p className="text-xl font-bold">{stats.profileCompletion}%</p>
          <Progress value={stats.profileCompletion} className="mt-1 h-1" />
        </div>
      </div>
    </BaseWidget>
  );
});

// Activity Feed Widget
export const ActivityFeedWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const activities = useMemo(() => data?.recentActivity || [], [data]);
  
  return (
    <BaseWidget config={config} {...props}>
      <ScrollArea className="h-[200px]">
        {activities.slice(0, 10).map((activity: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2 mb-3 pb-3 border-b last:border-0">
            <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Activity className="h-3 w-3 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{activity.action}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </ScrollArea>
    </BaseWidget>
  );
});

// Weekly Activity Chart Widget
export const WeeklyActivityWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const chartData = useMemo(() => data?.weeklyActivity || [
    { day: 'Mon', searches: 5, views: 10, saves: 2 },
    { day: 'Tue', searches: 7, views: 15, saves: 3 },
    { day: 'Wed', searches: 10, views: 20, saves: 5 },
    { day: 'Thu', searches: 8, views: 18, saves: 4 },
    { day: 'Fri', searches: 12, views: 25, saves: 6 },
    { day: 'Sat', searches: 6, views: 12, saves: 2 },
    { day: 'Sun', searches: 4, views: 8, saves: 1 }
  ], [data]);
  
  return (
    <BaseWidget config={config} {...props}>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Area type="monotone" dataKey="searches" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
          <Area type="monotone" dataKey="views" stackId="1" stroke="#10b981" fill="#10b981" />
          <Area type="monotone" dataKey="saves" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
        </AreaChart>
      </ResponsiveContainer>
    </BaseWidget>
  );
});

// Budget Analysis Widget
export const BudgetAnalysisWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const budgetData = useMemo(() => data?.budgetData || [
    { name: 'Under Budget', value: 45, color: '#10b981' },
    { name: 'At Budget', value: 30, color: '#3b82f6' },
    { name: 'Over Budget', value: 25, color: '#ef4444' }
  ], [data]);
  
  return (
    <BaseWidget config={config} {...props}>
      <div className="flex items-center justify-between">
        <ResponsiveContainer width="50%" height={120}>
          <RePieChart>
            <Pie
              data={budgetData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              dataKey="value"
            >
              {budgetData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
        
        <div className="space-y-2">
          {budgetData.map((item: any) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs">{item.name}</span>
              <span className="text-xs font-bold ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
});

// AI Insights Widget
export const AIInsightsWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const insights = useMemo(() => data?.insights || [
    { type: 'tip', message: 'Communities in Austin have lower average costs' },
    { type: 'alert', message: '3 new communities match your preferences' },
    { type: 'trend', message: 'Memory care costs trending down this month' }
  ], [data]);
  
  return (
    <BaseWidget config={config} {...props}>
      <div className="space-y-2">
        {insights.map((insight: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            <Zap className={`h-4 w-4 flex-shrink-0 ${
              insight.type === 'alert' ? 'text-yellow-500' :
              insight.type === 'tip' ? 'text-blue-500' :
              'text-green-500'
            }`} />
            <p className="text-xs">{insight.message}</p>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
});

// Quick Actions Widget
export const QuickActionsWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const actions = [
    { icon: Search, label: "Search", color: "blue" },
    { icon: Calendar, label: "Schedule", color: "green" },
    { icon: Heart, label: "Favorites", color: "red" },
    { icon: Download, label: "Export", color: "purple" }
  ];
  
  return (
    <BaseWidget config={config} {...props}>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            className="flex flex-col items-center gap-1 py-3"
          >
            <action.icon className={`h-4 w-4 text-${action.color}-600`} />
            <span className="text-xs">{action.label}</span>
          </Button>
        ))}
      </div>
    </BaseWidget>
  );
});

// Recommendations Widget
export const RecommendationsWidget = memo(({ config, data, ...props }: WidgetProps) => {
  const recommendations = useMemo(() => data?.recommendations || [], [data]);
  
  return (
    <BaseWidget config={config} {...props}>
      <ScrollArea className="h-[200px]">
        {recommendations.slice(0, 5).map((rec: any) => (
          <div key={rec.id} className="mb-3 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{rec.name}</p>
                <p className="text-xs text-gray-500">{rec.city}, {rec.state}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{rec.priceRange}</Badge>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs">{rec.rating}</span>
                  </div>
                </div>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
    </BaseWidget>
  );
});

// Widget Registry
export const widgetRegistry: Record<WidgetType, React.ComponentType<WidgetProps>> = {
  'statistics': StatisticsWidget,
  'activity-feed': ActivityFeedWidget,
  'weekly-activity': WeeklyActivityWidget,
  'budget-analysis': BudgetAnalysisWidget,
  'ai-insights': AIInsightsWidget,
  'quick-actions': QuickActionsWidget,
  'recommendations': RecommendationsWidget,
  'saved-communities': RecommendationsWidget, // Reusing for now
  'search-trends': ActivityFeedWidget, // Reusing for now
  'care-types': BudgetAnalysisWidget, // Reusing for now
  'notifications': ActivityFeedWidget, // Reusing for now
  'performance': StatisticsWidget, // Reusing for now
};

// Default widget configurations
export const defaultWidgets: WidgetConfig[] = [
  {
    id: 'stats-1',
    type: 'statistics',
    title: 'Dashboard Overview',
    size: 'medium',
    position: { x: 0, y: 0 },
    visible: true,
    refreshInterval: 60
  },
  {
    id: 'activity-1',
    type: 'activity-feed',
    title: 'Recent Activity',
    size: 'medium',
    position: { x: 2, y: 0 },
    visible: true,
    refreshInterval: 30
  },
  {
    id: 'weekly-1',
    type: 'weekly-activity',
    title: 'Weekly Trends',
    size: 'large',
    position: { x: 0, y: 1 },
    visible: true,
    refreshInterval: 300
  },
  {
    id: 'budget-1',
    type: 'budget-analysis',
    title: 'Budget Analysis',
    size: 'medium',
    position: { x: 3, y: 1 },
    visible: true,
    refreshInterval: 120
  },
  {
    id: 'ai-1',
    type: 'ai-insights',
    title: 'AI Insights',
    size: 'medium',
    position: { x: 0, y: 2 },
    visible: true,
    refreshInterval: 180
  },
  {
    id: 'actions-1',
    type: 'quick-actions',
    title: 'Quick Actions',
    size: 'small',
    position: { x: 2, y: 2 },
    visible: true
  },
  {
    id: 'recs-1',
    type: 'recommendations',
    title: 'Recommended Communities',
    size: 'medium',
    position: { x: 3, y: 2 },
    visible: true,
    refreshInterval: 600
  }
];