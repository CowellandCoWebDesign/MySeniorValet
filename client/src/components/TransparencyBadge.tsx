import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Star, 
  ShieldCheck, 
  Award, 
  Crown, 
  Trophy, 
  Activity, 
  Clock, 
  CheckCircle, 
  Diamond 
} from "lucide-react";

interface TransparencyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: 'pricing' | 'availability';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface TransparencyBadgeProps {
  badge: TransparencyBadge;
  showPoints?: boolean;
}

const iconMap = {
  'star': Star,
  'shield-check': ShieldCheck,
  'award': Award,
  'crown': Crown,
  'trophy': Trophy,
  'activity': Activity,
  'clock': Clock,
  'check-circle': CheckCircle,
  'diamond': Diamond
};

export function TransparencyBadge({ badge, showPoints = false }: TransparencyBadgeProps) {
  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Star;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`${badge.color} text-white border-0 text-xs px-2 py-1 flex items-center gap-1 cursor-help`}
          >
            <IconComponent className="h-3 w-3" />
            {badge.name}
            {showPoints && (
              <span className="text-xs opacity-75">
                +{badge.points}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="capitalize">{badge.type} • {badge.rarity}</span>
              <span className="font-medium">{badge.points} points</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TransparencyBadgeListProps {
  badges: TransparencyBadge[];
  transparencyScore?: number;
  showScore?: boolean;
  maxBadges?: number;
}

export function TransparencyBadgeList({ 
  badges, 
  transparencyScore, 
  showScore = false, 
  maxBadges = 3 
}: TransparencyBadgeListProps) {
  const displayBadges = badges.slice(0, maxBadges);
  const remainingCount = badges.length - maxBadges;
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayBadges.map((badge) => (
        <TransparencyBadge key={badge.id} badge={badge} />
      ))}
      
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
      
      {showScore && transparencyScore !== undefined && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Trophy className="h-3 w-3" />
          <span className="font-medium">{transparencyScore}</span>
        </div>
      )}
    </div>
  );
}