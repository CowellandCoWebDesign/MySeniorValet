import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Crown, Diamond, Star } from 'lucide-react';

interface PricingTransparencyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface PricingTransparencyBadgeProps {
  badge: PricingTransparencyBadge;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const BadgeIcon = ({ iconName, size = 'sm' }: { iconName: string; size: string }) => {
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
  
  switch (iconName) {
    case 'star': return <Star className={iconSize} />;
    case 'shield-check': return <Shield className={iconSize} />;
    case 'award': return <Award className={iconSize} />;
    case 'crown': return <Crown className={iconSize} />;
    case 'diamond': return <Diamond className={iconSize} />;
    default: return <Star className={iconSize} />;
  }
};

const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    case 'uncommon':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    case 'rare':
      return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
    case 'epic':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
    case 'legendary':
      return 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 border-purple-200 hover:from-pink-200 hover:to-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
  }
};

export const PricingTransparencyBadge: React.FC<PricingTransparencyBadgeProps> = ({
  badge,
  size = 'sm',
  showTooltip = true
}) => {
  const badgeStyles = getRarityStyles(badge.rarity);
  
  return (
    <div className="relative group">
      <Badge 
        className={`${badgeStyles} border transition-all duration-200 cursor-help flex items-center gap-1`}
        variant="secondary"
      >
        <BadgeIcon iconName={badge.icon} size={size} />
        <span className="text-xs font-medium">{badge.name}</span>
      </Badge>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
          <div className="font-medium">{badge.name}</div>
          <div className="text-gray-300">{badge.description}</div>
          <div className="text-yellow-400">+{badge.points} points</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

interface PricingTransparencyBadgeListProps {
  badges: PricingTransparencyBadge[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PricingTransparencyBadgeList: React.FC<PricingTransparencyBadgeListProps> = ({
  badges,
  maxDisplay = 3,
  size = 'sm'
}) => {
  if (!badges || badges.length === 0) return null;
  
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;
  
  return (
    <div className="flex flex-wrap gap-1">
      {displayBadges.map((badge) => (
        <PricingTransparencyBadge
          key={badge.id}
          badge={badge}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <Badge 
          variant="outline" 
          className="text-xs text-gray-600 border-gray-300 cursor-help"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

interface TransparencyScoreProps {
  score: number;
  badges: PricingTransparencyBadge[];
}

export const TransparencyScore: React.FC<TransparencyScoreProps> = ({ score, badges }) => {
  const getScoreColor = (score: number) => {
    if (score >= 200) return 'text-purple-600';
    if (score >= 100) return 'text-yellow-600';
    if (score >= 50) return 'text-green-600';
    if (score >= 25) return 'text-blue-600';
    return 'text-gray-600';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 200) return 'Legendary';
    if (score >= 100) return 'Epic';
    if (score >= 50) return 'Rare';
    if (score >= 25) return 'Good';
    return 'Basic';
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium text-gray-700">
        Transparency Score:
      </div>
      <div className={`font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="text-xs text-gray-500">
        ({getScoreLabel(score)})
      </div>
    </div>
  );
};