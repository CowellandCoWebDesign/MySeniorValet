import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronLeft,
  Stethoscope,
  Building,
  Clock,
  ExternalLink,
  Award,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  Bed,
  Ambulance
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
  website: string | null;
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
  latitude: number | null;
  longitude: number | null;
  teachingHospital: boolean;
  magnet: boolean;
  jointCommission: boolean;
}

export default function HospitalDetails() {
  const [, params] = useRoute("/hospital/:slug");
  const slug = params?.slug;

  const { data: hospital, isLoading, error } = useQuery({
    queryKey: ["/api/hospitals/by-slug", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No hospital slug provided");
      const response = await fetch(`/api/hospitals/by-slug/${slug}`);
      if (!response.ok) {
        throw new Error("Hospital not found");
      }
      return response.json();
    },
    enabled: !!slug
  });

  const getHospitalIcon = (type: string) => {
    switch (type) {
      case "Children's Hospital":
        return <Baby className="w-8 h-8 text-pink-600" />;
      case "Veterans Affairs":
        return <Shield className="w-8 h-8 text-blue-600" />;
      case "Teaching Hospital":
        return <Users className="w-8 h-8 text-purple-600" />;
      default:
        return <Hospital className="w-8 h-8 text-blue-600" />;
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

  const getOwnershipBadge = (ownership: string) => {
    if (ownership.includes("Government")) {
      return <Badge className="bg-blue-600 text-white">Government</Badge>;
    }
    if (ownership.includes("Non-profit")) {
      return <Badge className="bg-green-600 text-white">Non-Profit</Badge>;
    }
    return <Badge className="bg-gray-600 text-white">Private</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Hospital Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The hospital you're looking for doesn't exist or may have been moved.
            </p>
            <Link href="/hospitals">
              <Button>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Hospital Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Home
          </Link>
          <span>/</span>
          <Link href="/hospitals" className="hover:text-blue-600 dark:hover:text-blue-400">
            Hospital Directory
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{hospital.name}</span>
        </div>

        {/* Hospital Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  {getHospitalIcon(hospital.hospitalType)}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{hospital.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">
                      {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {hospital.hospitalType}
                    </Badge>
                    {getOwnershipBadge(hospital.ownership)}
                    {hospital.traumaLevel && (
                      <Badge className="bg-red-600 text-white">
                        {hospital.traumaLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {hospital.cmsRating && (
                <div className="text-center">
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{hospital.cmsRating}/5</span>
                  </div>
                  <span className="text-sm opacity-90">CMS Overall Rating</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Hospital Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services & Specialties</TabsTrigger>
            <TabsTrigger value="quality">Quality & Safety</TabsTrigger>
            <TabsTrigger value="contact">Contact & Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Key Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hospital.bedCount && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Total Beds</span>
                      </div>
                      <span className="font-bold">{hospital.bedCount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ambulance className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Emergency Services</span>
                    </div>
                    <span className={`font-bold ${hospital.emergencyServices ? 'text-green-600' : 'text-red-600'}`}>
                      {hospital.emergencyServices ? 'Available' : 'Not Available'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Teaching Hospital</span>
                    </div>
                    <span className={`font-bold ${hospital.teachingHospital ? 'text-green-600' : 'text-gray-500'}`}>
                      {hospital.teachingHospital ? 'Yes' : 'No'}
                    </span>
                  </div>

                  {hospital.magnet && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">Magnet Recognition</span>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hospital Type & Ownership */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    Hospital Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Type</span>
                    <p className="font-medium">{hospital.hospitalType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Ownership</span>
                    <p className="font-medium">{hospital.ownership}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">County</span>
                    <p className="font-medium">{hospital.county}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {hospital.phone && (
                    <Button className="w-full" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Main Number
                    </Button>
                  )}
                  
                  {hospital.emergencyPhone && (
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                      <Ambulance className="w-4 h-4 mr-2" />
                      Emergency Line
                    </Button>
                  )}
                  
                  {hospital.website && (
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {hospital.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {hospital.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {hospital.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    Medical Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hospital.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-600" />
                    Specialties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hospital.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hospital.mortalityRating && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(hospital.mortalityRating)}`}>
                      {hospital.mortalityRating}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Mortality Rating</p>
                  </CardContent>
                </Card>
              )}

              {hospital.safetyRating && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(hospital.safetyRating)}`}>
                      {hospital.safetyRating}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Safety Rating</p>
                  </CardContent>
                </Card>
              )}

              {hospital.readmissionRating && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(hospital.readmissionRating)}`}>
                      {hospital.readmissionRating}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Readmission Rating</p>
                  </CardContent>
                </Card>
              )}

              {hospital.experienceRating && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(hospital.experienceRating)}`}>
                      {hospital.experienceRating}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Patient Experience</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Certifications & Awards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Certifications & Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hospital.jointCommission && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Joint Commission Accredited</span>
                    </div>
                  )}
                  {hospital.magnet && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Magnet Recognition Program</span>
                    </div>
                  )}
                  {hospital.teachingHospital && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Teaching Hospital Status</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Address</span>
                    <p className="font-medium">
                      {hospital.address}<br />
                      {hospital.city}, {hospital.state} {hospital.zipCode}
                    </p>
                  </div>
                  
                  {hospital.phone && (
                    <div>
                      <span className="text-sm text-gray-500">Main Phone</span>
                      <p className="font-medium">{hospital.phone}</p>
                    </div>
                  )}
                  
                  {hospital.emergencyPhone && (
                    <div>
                      <span className="text-sm text-gray-500">Emergency</span>
                      <p className="font-medium text-red-600">{hospital.emergencyPhone}</p>
                    </div>
                  )}
                  
                  {hospital.website && (
                    <div>
                      <span className="text-sm text-gray-500">Website</span>
                      <a href={hospital.website} target="_blank" rel="noopener noreferrer" 
                         className="block font-medium text-blue-600 hover:text-blue-800">
                        Visit Hospital Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="w-12 h-12 mx-auto mb-2" />
                      <p>Interactive map coming soon</p>
                      <p className="text-sm">{hospital.city}, {hospital.state}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Directory */}
        <div className="mt-8 text-center">
          <Link href="/hospitals">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Hospital Directory
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}