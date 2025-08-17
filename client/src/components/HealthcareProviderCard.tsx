import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock } from "lucide-react";

interface ProviderCardProps {
  provider: {
    id: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    services?: string[];
    badge?: string; // HUD-VASH, etc.
    hours?: string; // 24/7 Emergency, etc.
    category?: string;
  };
  onCallNow?: () => void;
  onVisitWebsite?: () => void;
  onScheduleAppointment?: () => void;
}

export function HealthcareProviderCard({ provider, onCallNow, onVisitWebsite, onScheduleAppointment }: ProviderCardProps) {
  return (
    <Card className="w-[360px] flex-shrink-0 bg-slate-800/90 border-slate-700 text-white">
      <CardContent className="p-4">
        {/* Header with Name and Badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-base">{provider.name}</h3>
          {provider.badge && (
            <Badge className="bg-teal-600/80 text-white text-xs px-2 py-0.5 rounded">
              {provider.badge}
            </Badge>
          )}
        </div>
        
        {/* Address */}
        {provider.address && (
          <div className="flex items-start gap-2 text-sm text-gray-300 mb-2">
            <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
            <div>
              <p>{provider.address}</p>
              {provider.city && provider.state && (
                <p className="text-xs text-gray-400">{provider.city}, {provider.state}</p>
              )}
            </div>
          </div>
        )}

        {/* Phone */}
        {provider.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{provider.phone}</span>
          </div>
        )}

        {/* Hours */}
        {provider.hours && (
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-orange-400">{provider.hours}</span>
          </div>
        )}

        {/* Services */}
        {provider.services && provider.services.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Services:</p>
            <div className="flex flex-wrap gap-2">
              {provider.services.map((service, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  {service}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onVisitWebsite && (
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              onClick={onVisitWebsite}
            >
              Visit Website
            </Button>
          )}
          {onCallNow && (
            <Button 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm h-9"
              onClick={onCallNow}
            >
              Call Now
            </Button>
          )}
          {onScheduleAppointment && (
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm h-9"
              onClick={onScheduleAppointment}
            >
              Schedule Appointment
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}