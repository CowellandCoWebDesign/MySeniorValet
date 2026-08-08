import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, DollarSign, Languages, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { getCommunityUrl } from "@/lib/community-url";
import { useContactReveal } from "@/hooks/useContactReveal";

interface BilingualCommunityCardProps {
  id: number;
  name: string;
  nameEn?: string;
  nameFr?: string;
  address: string;
  addressEn?: string;
  addressFr?: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  rentPerMonth?: number;
  bilingual: boolean;
  verified?: boolean;
  latitude?: number;
  longitude?: number;
}

export function BilingualCommunityCard({ 
  id,
  name,
  nameEn,
  nameFr,
  address,
  addressEn,
  addressFr,
  city,
  state,
  phone,
  website,
  rentPerMonth,
  bilingual,
  verified,
  latitude,
  longitude
}: BilingualCommunityCardProps) {
  const { language, t } = useLanguage();
  const { isRevealed, reveal, consentDialog } = useContactReveal(id, name);
  
  // Select appropriate language content
  const displayName = language === 'fr' && nameFr ? nameFr : (nameEn || name);
  const displayAddress = language === 'fr' && addressFr ? addressFr : (addressEn || address);
  
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-blue-500 relative overflow-hidden">
      {bilingual && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-blue-500 to-red-500 text-white border-0">
            <Languages className="w-3 h-3 mr-1" />
            {language === 'en' ? 'Bilingual' : 'Bilingue'}
          </Badge>
        </div>
      )}
      
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 pr-20">
          {displayName}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p>{displayAddress}</p>
              <p>{city}, {state}</p>
            </div>
          </div>
          
          {phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              {isRevealed('phone') ? (
                <a href={`tel:${phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                  {phone}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('phone'); }}
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                  data-testid={`button-reveal-phone-${id}`}
                >
                  <Lock className="w-3 h-3" /> {t('community.callNow')}
                </button>
              )}
            </div>
          )}
          
          {website && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="w-4 h-4" />
              {isRevealed('website') ? (
                <a 
                  href={website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 truncate"
                >
                  {t('community.website')}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); reveal('website'); }}
                  className="flex items-center gap-1 text-blue-500 hover:underline"
                  data-testid={`button-reveal-website-${id}`}
                >
                  <Lock className="w-3 h-3" /> {t('community.website')}
                </button>
              )}
            </div>
          )}
        </div>
        
        {rentPerMonth !== undefined && rentPerMonth > 0 ? (
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              ${rentPerMonth}{t('community.monthlyRent')}
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('community.contactForPricing')}
          </div>
        )}
        
        <div className="flex gap-2">
          <Link href={getCommunityUrl({ id, name, city, state })} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              {t('community.viewDetails')}
            </Button>
          </Link>
          
          {phone && (
            <Button 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (isRevealed('phone')) {
                  window.location.href = `tel:${phone}`;
                } else {
                  reveal('phone');
                }
              }}
              data-testid={`button-call-${id}`}
            >
              {!isRevealed('phone') && <Lock className="w-3 h-3 mr-1" />}
              {t('community.callNow')}
            </Button>
          )}
        </div>
        
        {verified && (
          <div className="mt-3 text-xs text-center text-green-600 dark:text-green-400">
            ✓ {language === 'en' ? 'Government Verified' : 'Vérifié par le gouvernement'}
          </div>
        )}
      </CardContent>
      {consentDialog}
    </Card>
  );
}