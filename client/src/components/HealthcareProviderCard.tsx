import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, CheckCircle, Globe, Shield } from "lucide-react";

interface ProviderCardProps {
  provider: {
    id: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    services?: string[];
    tags?: string[];
    verified?: boolean;
    licensed?: boolean;
    icon?: string;
    color?: string;
    category?: string;
  };
  onContact?: () => void;
  onVisitWebsite?: () => void;
}

export function HealthcareProviderCard({ provider, onContact, onVisitWebsite }: ProviderCardProps) {
  const getIconColor = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'home care':
        return 'bg-green-500';
      case 'therapy services':
        return 'bg-purple-500';
      case 'adult day care':
        return 'bg-cyan-500';
      case 'personal care':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card className="w-[300px] flex-shrink-0 bg-slate-800/50 border-slate-700 text-white">
      <CardContent className="p-4">
        {/* Header with Icon and Category Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${provider.color || getIconColor(provider.category)}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-xs bg-slate-700/50 px-2 py-1 rounded">
              {provider.category || 'Care Provider'}
            </div>
          </div>
        </div>

        {/* Provider Name */}
        <h3 className="font-semibold text-lg mb-1">{provider.name}</h3>
        
        {/* Address */}
        {provider.address && (
          <p className="text-sm text-gray-400 mb-3">{provider.address}</p>
        )}

        {/* Tags/Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {provider.verified && (
            <Badge className="bg-cyan-600 text-white text-xs">
              Government Verified
            </Badge>
          )}
          {provider.licensed && (
            <Badge className="bg-blue-600 text-white text-xs">
              State Licensed
            </Badge>
          )}
          {provider.tags?.includes('Website Verified') && (
            <Badge className="bg-green-600 text-white text-xs">
              Website Verified
            </Badge>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {provider.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Phone className="h-4 w-4" />
              <span>{provider.phone}</span>
            </div>
          )}
        </div>

        {/* Services Offered */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Services offered:</p>
          <div className="flex flex-wrap gap-2">
            {provider.services?.map((service, idx) => (
              <span key={idx} className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <Shield className="h-3 w-3" />
          <span>Licensed</span>
          <CheckCircle className="h-3 w-3 ml-2" />
          <span>Verified</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={onContact}
          >
            Contact Provider
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-300 hover:bg-slate-700"
            onClick={onVisitWebsite}
          >
            <Globe className="h-4 w-4 mr-2" />
            Visit Website
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}