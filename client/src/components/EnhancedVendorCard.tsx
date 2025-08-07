import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Pill, Car, Stethoscope, Phone, Home, DollarSign, ExternalLink, CheckCircle, Shield, Truck, Building, Users } from 'lucide-react';

interface EnhancedVendorCardProps {
  vendor: any;
  onClick?: () => void;
}

const iconMap: Record<string, any> = {
  ShoppingCart,
  Pill,
  Car,
  Stethoscope,
  Phone,
  Home,
  DollarSign,
  Truck,
  Building,
  Users
};

export default function EnhancedVendorCard({ vendor, onClick }: EnhancedVendorCardProps) {
  // Define vendor-specific styling matching home page
  const vendorThemes: Record<string, any> = {
    'walmart': {
      borderColor: vendor.tier === 'featured' ? 'border-blue-400 dark:border-blue-500' : 'border-blue-300 dark:border-blue-600',
      bgGradient: vendor.tier === 'featured' ? 'from-blue-100 to-sky-100 dark:from-blue-900/30 dark:to-sky-900/30' : 'from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-300',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      badge: 'Everyday Low Prices',
      badgeBg: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      liveBadgeBg: 'bg-blue-500'
    },
    'featured': {
      borderColor: 'border-purple-400 dark:border-purple-500',
      bgGradient: 'from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30',
      iconBg: 'bg-purple-100 dark:bg-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-300',
      buttonBg: 'bg-purple-600 hover:bg-purple-700',
      badge: 'Featured Partner',
      badgeBg: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      liveBadgeBg: 'bg-purple-500'
    },
    'national': {
      borderColor: 'border-orange-400 dark:border-orange-500',
      bgGradient: 'from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30',
      iconBg: 'bg-orange-100 dark:bg-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-300',
      buttonBg: 'bg-orange-600 hover:bg-orange-700',
      badge: 'National Partner',
      badgeBg: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      liveBadgeBg: 'bg-orange-500'
    },
    'default': {
      borderColor: 'border-gray-300 dark:border-gray-600',
      bgGradient: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-300',
      buttonBg: 'bg-gray-600 hover:bg-gray-700',
      badge: 'Service Partner',
      badgeBg: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
      liveBadgeBg: 'bg-gray-500'
    }
  };

  // Determine theme based on vendor name or tier
  let theme = vendorThemes.default;
  if (vendor.name?.toLowerCase().includes('walmart') || vendor.businessName?.toLowerCase().includes('walmart')) {
    theme = vendorThemes.walmart;
  } else if (vendor.tier === 'national') {
    theme = vendorThemes.national;
  } else if (vendor.tier === 'featured') {
    theme = vendorThemes.featured;
  }

  // Get appropriate icon
  const Icon = vendor.categoryIcon ? iconMap[vendor.categoryIcon] : ShoppingCart;

  return (
    <div 
      onClick={onClick}
      className="w-full cursor-pointer hover:shadow-lg transition-all duration-200"
    >
      <Card className={`border-2 ${theme.borderColor} bg-gradient-to-r ${theme.bgGradient} hover:shadow-xl transition-all duration-300`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Logo with brand colors - matching home page */}
            <div className={`w-full sm:w-24 h-24 ${theme.iconBg} rounded-lg p-2 shadow-sm overflow-hidden flex-shrink-0 border border-white/50 dark:border-gray-700/50 mx-auto sm:mx-0`}>
              {vendor.logoUrl ? (
                <img 
                  src={vendor.logoUrl} 
                  alt={vendor.name || vendor.businessName} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${theme.iconColor}`}>
                  <Icon className="w-12 h-12" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">
                      {vendor.name || vendor.businessName}
                    </h4>

                    {(vendor.tier === 'featured' || vendor.tier === 'national' || vendor.isNew) && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2 py-1 font-medium shadow-sm">
                        ⭐ Featured
                      </Badge>
                    )}

                    <Badge className={`${theme.badgeBg} text-xs px-2 py-1 font-medium`}>
                      {theme.badge}
                    </Badge>

                    {vendor.specialOffer && (
                      <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-medium animate-pulse">
                        {vendor.specialOffer}
                      </Badge>
                    )}

                  </div>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
                    {vendor.description || vendor.businessType || 'Premium senior services provider offering nationwide support and assistance'}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
                    <span className={`flex items-center gap-1 ${theme.iconColor} font-medium`}>
                      <Icon className="w-4 h-4" />
                      {vendor.category || vendor.businessType || 'Senior Services'}
                    </span>
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Available Service
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                      <Shield className="w-4 h-4" />
                      Senior Specialists
                    </span>
                  </div>
                </div>
                
                {/* Action button with brand colors - matching home page */}
                <Button 
                  className={`w-full sm:w-auto px-6 py-3 ${theme.buttonBg} text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                >
                  Shop Now
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}