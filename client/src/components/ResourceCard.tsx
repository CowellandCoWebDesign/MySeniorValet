import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, FileText } from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: number;
    title: string;
    type?: string;
    category?: string;
    description?: string;
    url?: string;
  };
  onClick?: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-orange-500"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-500" />
              {resource.title}
            </h3>
            <div className="flex gap-2 mt-1">
              {resource.type && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  {resource.type}
                </Badge>
              )}
              {resource.category && (
                <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                  {resource.category}
                </Badge>
              )}
            </div>
          </div>
          {resource.url && (
            <ExternalLink className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {resource.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {resource.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}