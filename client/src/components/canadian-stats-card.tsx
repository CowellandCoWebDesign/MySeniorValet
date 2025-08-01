import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Languages, Flag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CanadianStatsCardProps {
  totalCommunities: number;
  bilingualCount: number;
  provinceCount: number;
}

export function CanadianStatsCard({ 
  totalCommunities, 
  bilingualCount, 
  provinceCount 
}: CanadianStatsCardProps) {
  const { t, language } = useLanguage();
  
  const bilingualPercentage = Math.round((bilingualCount / totalCommunities) * 100);
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-white dark:from-red-950 dark:to-gray-900 border-red-200 dark:border-red-800">
      <div className="absolute top-2 right-2">
        <Flag className="h-8 w-8 text-red-600 opacity-20" />
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {language === 'en' ? 'Canadian Coverage' : 'Couverture canadienne'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Total Communities */}
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalCommunities}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('stats.canadianCommunities')}
            </div>
          </div>
          
          {/* Provinces/Territories */}
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {provinceCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('stats.provinces')}
            </div>
          </div>
        </div>
        
        {/* Bilingual Stats */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-950 dark:to-red-950 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('stats.bilingualCommunities')}
              </span>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {bilingualPercentage}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {bilingualCount}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'en' ? 'offering French & English services' : 'offrant des services en français et anglais'}
            </span>
          </div>
        </div>
        
        {/* Coverage Badge */}
        <div className="flex items-center justify-center">
          <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-1.5">
            {language === 'en' ? '🇨🇦 All 13 Provinces & Territories' : '🇨🇦 Les 13 provinces et territoires'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}