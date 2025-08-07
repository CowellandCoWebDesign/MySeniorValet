import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, ExternalLink, Shield, Heart, Users, 
  Building2, GraduationCap, UserCheck, Phone,
  Briefcase, Home, AlertCircle, HandHeart
} from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: number;
    title?: string;
    name?: string;
    type?: string;
    category?: string;
    description?: string;
    url?: string;
    logoUrl?: string;
    isFeatured?: boolean;
    tags?: string[];
  };
  onClick?: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  // Get the appropriate icon based on resource type/category
  const getResourceIcon = () => {
    const type = (resource.type || resource.category || '').toLowerCase();
    if (type.includes('government') || type.includes('social security')) return <Building2 className="w-5 h-5" />;
    if (type.includes('support') || type.includes('group')) return <Users className="w-5 h-5" />;
    if (type.includes('safety') || type.includes('protection')) return <Shield className="w-5 h-5" />;
    if (type.includes('health') || type.includes('cancer') || type.includes('medical')) return <Heart className="w-5 h-5" />;
    if (type.includes('education') || type.includes('training')) return <GraduationCap className="w-5 h-5" />;
    if (type.includes('veteran')) return <UserCheck className="w-5 h-5" />;
    if (type.includes('insurance')) return <Briefcase className="w-5 h-5" />;
    if (type.includes('emergency')) return <AlertCircle className="w-5 h-5" />;
    if (type.includes('community') || type.includes('center')) return <Home className="w-5 h-5" />;
    if (type.includes('communication')) return <Phone className="w-5 h-5" />;
    if (type.includes('assistance') || type.includes('help')) return <HandHeart className="w-5 h-5" />;
    return <BookOpen className="w-5 h-5" />;
  };

  // Get category-specific colors
  const getCategoryColors = () => {
    const type = (resource.type || resource.category || '').toLowerCase();
    if (type.includes('government')) return 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
    if (type.includes('support')) return 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20';
    if (type.includes('safety') || type.includes('protection')) return 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20';
    if (type.includes('health') || type.includes('medical')) return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
    if (type.includes('education') || type.includes('training')) return 'border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20';
    if (type.includes('veteran')) return 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20';
    if (type.includes('insurance')) return 'border-teal-500 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20';
    if (type.includes('emergency')) return 'border-rose-500 bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20';
    return 'border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20';
  };

  const getBadgeColor = () => {
    const type = (resource.type || resource.category || '').toLowerCase();
    if (type.includes('government')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    if (type.includes('support')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
    if (type.includes('safety')) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    if (type.includes('health')) return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (type.includes('education')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    if (type.includes('veteran')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
    if (type.includes('insurance')) return 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';
    if (type.includes('emergency')) return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';
    return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
  };

  const displayName = resource.title || resource.name || 'Resource';

  return (
    <Card 
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${getCategoryColors()} hover:scale-[1.02] transform`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${getBadgeColor()}`}>
                {getResourceIcon()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                  {displayName}
                </h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {resource.isFeatured && (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs">
                      Featured
                    </Badge>
                  )}
                  {resource.type && (
                    <Badge variant="secondary" className={`${getBadgeColor()} text-xs`}>
                      {resource.type}
                    </Badge>
                  )}
                  {resource.category && resource.category !== resource.type && (
                    <Badge variant="outline" className="text-gray-600 dark:text-gray-300 text-xs">
                      {resource.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          {resource.url && (
            <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Visit</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs py-0.5 px-2 border-gray-300 dark:border-gray-600"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}