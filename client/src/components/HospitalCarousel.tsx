import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Hospital, 
  Star, 
  MapPin, 
  Phone, 
  Shield, 
  Heart, 
  Baby, 
  Users,
  ChevronRight,
  Stethoscope
} from "lucide-react";

interface HospitalType {
  id: number;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  phone: string | null;
  hospitalType: string;
  ownership: string;
  services: string[];
  specialties: string[];
  traumaLevel: string | null;
  emergencyServices: boolean;
  bedCount: number | null;
  cmsRating: number | null;
  mortalityRating: string | null;
  safetyRating: string | null;
  readmissionRating: string | null;
  experienceRating: string | null;
  tags: string[];
  emergencyPhone: string | null;
  dataSourceNote?: string | null;
}

const HospitalCard = ({ hospital }: { hospital: HospitalType }) => {
  const getHospitalIcon = (type: string) => {
    switch (type) {
      case "Children's Hospital":
        return <Baby className="w-6 h-6 text-pink-600" />;
      case "Veterans Affairs":
        return <Shield className="w-6 h-6 text-blue-600" />;
      case "Teaching Hospital":
        return <Users className="w-6 h-6 text-purple-600" />;
      default:
        return <Hospital className="w-6 h-6 text-blue-600" />;
    }
  };

  const getRatingColor = (rating: string | null) => {
    if (!rating) return "bg-gray-100 text-gray-600";
    switch (rating.toLowerCase()) {
      case "above":
        return "bg-green-100 text-green-800";
      case "same":
        return "bg-yellow-100 text-yellow-800";
      case "below":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getOwnershipBadge = (ownership: string | null) => {
    if (!ownership) {
      return <Badge className="bg-gray-600 text-white text-xs">N/A</Badge>;
    }
    if (ownership.includes("Government")) {
      return <Badge className="bg-blue-600 text-white text-xs">Government</Badge>;
    }
    if (ownership.includes("Non-profit")) {
      return <Badge className="bg-green-600 text-white text-xs">Non-Profit</Badge>;
    }
    return <Badge className="bg-gray-600 text-white text-xs">Private</Badge>;
  };

  return (
    <Card className="flex-shrink-0 w-80 min-h-[40rem] border-2 border-blue-100 dark:border-blue-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/20 dark:from-gray-800 dark:via-gray-900 dark:to-blue-900/20 backdrop-blur-sm relative overflow-visible group">
      
      {/* Demo Data Notation Banner */}
      {hospital.dataSourceNote && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 text-center z-20">
          ⚠️ {hospital.dataSourceNote}
        </div>
      )}
      
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                {getHospitalIcon(hospital.hospitalType)}
              </div>
              <Badge className="bg-white/25 hover:bg-white/35 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                {hospital.hospitalType}
              </Badge>
            </div>
            {hospital.cmsRating && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-bold">{hospital.cmsRating}/5</span>
              </div>
            )}
          </div>
          
          <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-sm">
            {hospital.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm opacity-95">
            <MapPin className="w-4 h-4" />
            <span className="truncate font-medium">{hospital.city}, {hospital.state}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 relative z-10">
        {/* Premium Hospital Details */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {getOwnershipBadge(hospital.ownership)}
            {hospital.traumaLevel && (
              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                {hospital.traumaLevel}
              </Badge>
            )}
            {hospital.emergencyServices && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                24/7 Emergency
              </Badge>
            )}
          </div>

          {/* Enhanced Services */}
          <div className="mb-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50">
            <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Key Services
            </h4>
            <div className="space-y-2">
              {hospital.services.slice(0, 5).map((service, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex-shrink-0 shadow-sm"></div>
                  <span className="text-gray-700 dark:text-gray-300 truncate font-medium">{service}</span>
                </div>
              ))}
              {hospital.services.length > 5 && (
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold pl-5">
                  +{hospital.services.length - 5} more specialties
                </div>
              )}
            </div>
          </div>

          {/* Premium Hospital Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {hospital.bedCount && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-600">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {hospital.bedCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Licensed Beds</div>
              </div>
            )}
            {hospital.cmsRating && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-3 text-center border border-yellow-200 dark:border-yellow-700">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {hospital.cmsRating}/5
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">CMS Rating</div>
              </div>
            )}
          </div>

          {/* Quality Ratings */}
          {(hospital.mortalityRating || hospital.safetyRating || hospital.readmissionRating || hospital.experienceRating) && (
            <div className="mb-4 space-y-2">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quality Ratings</h4>
              <div className="flex flex-wrap gap-2">
                {hospital.mortalityRating && (
                  <Badge className={`text-xs ${getRatingColor(hospital.mortalityRating)}`}>
                    Mortality: {hospital.mortalityRating}
                  </Badge>
                )}
                {hospital.safetyRating && (
                  <Badge className={`text-xs ${getRatingColor(hospital.safetyRating)}`}>
                    Safety: {hospital.safetyRating}
                  </Badge>
                )}
                {hospital.readmissionRating && (
                  <Badge className={`text-xs ${getRatingColor(hospital.readmissionRating)}`}>
                    Readmission: {hospital.readmissionRating}
                  </Badge>
                )}
                {hospital.experienceRating && (
                  <Badge className={`text-xs ${getRatingColor(hospital.experienceRating)}`}>
                    Experience: {hospital.experienceRating}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Premium Contact Section */}
        <div className="border-t-2 border-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800 pt-3 mt-auto">
          {hospital.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
              <Phone className="w-4 h-4 text-blue-500" />
              <span className="truncate font-medium">{hospital.phone}</span>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white text-sm py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            onClick={() => {
              window.location.href = `/hospital/${hospital.slug}`;
            }}
          >
            View Hospital Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HospitalCarousel() {
  const { data: hospitals, isLoading, error } = useQuery({
    queryKey: ["/api/hospitals/featured"],
    queryFn: async () => {
      const response = await fetch("/api/hospitals/featured?limit=12");
      if (!response.ok) {
        throw new Error("Failed to fetch hospitals");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10,   // Keep in cache for 10 minutes
  });

  if (error) {
    return (
      <Card className="flex-shrink-0 w-80 h-[36rem] border border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="p-6 text-center">
          <Stethoscope className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">
            Hospital Data Unavailable
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Unable to load hospital information. Please try again later.
          </p>
          <Button variant="outline" className="w-full">
            Retry Loading
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="flex-shrink-0 w-80 h-[36rem] border border-gray-200 animate-pulse">
            <div className="bg-gradient-to-r from-blue-200 to-cyan-200 dark:bg-gray-700 h-20"></div>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    );
  }

  if (!hospitals || hospitals.length === 0) {
    return (
      <Card className="flex-shrink-0 w-80 h-[32rem] border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-6 text-center">
          <Hospital className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2">
            Hospital Directory
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
            Hospital data is being collected. Check back soon for comprehensive hospital information.
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Learn More
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {hospitals.map((hospital: HospitalType) => (
        <HospitalCard key={hospital.id} hospital={hospital} />
      ))}
      
      {/* View All Hospitals Card */}
      <Link href="/hospitals">
        <Card className="flex-shrink-0 w-80 h-[32rem] border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 hover:shadow-2xl transition-all cursor-pointer group">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white text-center">
            <Hospital className="w-16 h-16 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-2">View All Hospitals</h3>
            <p className="text-lg">Directory</p>
          </div>
          
          <CardContent className="p-4 text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              6,000+
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              US Hospitals & Medical Centers
            </p>
            
            <div className="space-y-2 text-left mb-4">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">Teaching hospitals</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">Trauma centers</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">Children's hospitals</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">VA medical centers</span>
              </div>
            </div>
            
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                CMS verified quality ratings and emergency services data
              </p>
            </div>
            
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform"
            >
              Explore Hospital Directory
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}