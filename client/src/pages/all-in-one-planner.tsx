import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Sofa, 
  Pill, 
  Stethoscope, 
  ShoppingCart, 
  Phone, 
  Car,
  ArrowLeft,
  Home,
  CheckCircle,
  ExternalLink,
  Mail,
  Printer,
  Share2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "wouter";

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  partner: string;
  affiliateUrl: string;
  selected: boolean;
}

interface ServiceCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  services: ServiceOption[];
}

export default function AllInOnePlanner() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const serviceCategories: ServiceCategory[] = [
    {
      id: "moving",
      title: "Moving Services",
      icon: <Truck className="w-6 h-6" />,
      description: "Trusted moving and setup support for a stress-free transition.",
      services: [
        {
          id: "moveadvisor",
          name: "MoveAdvisor",
          description: "Professional moving company matching service",
          partner: "MoveAdvisor",
          affiliateUrl: "https://moveadvisor.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "taskrabbit",
          name: "TaskRabbit",
          description: "Packing, unpacking, and furniture assembly",
          partner: "TaskRabbit",
          affiliateUrl: "https://taskrabbit.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "bellhop",
          name: "Bellhop",
          description: "Local moving and labor services",
          partner: "Bellhop",
          affiliateUrl: "https://bellhop.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    },
    {
      id: "furniture",
      title: "Furniture & Home Setup",
      icon: <Sofa className="w-6 h-6" />,
      description: "Order move-in furniture and essentials with delivery + assembly.",
      services: [
        {
          id: "wayfair",
          name: "Wayfair",
          description: "Complete furniture and home decor selection",
          partner: "Wayfair",
          affiliateUrl: "https://wayfair.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "amazon-home",
          name: "Amazon Home",
          description: "Home essentials with fast delivery",
          partner: "Amazon",
          affiliateUrl: "https://amazon.com/home?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "handy",
          name: "Handy Assembly",
          description: "Professional furniture assembly and setup",
          partner: "Handy",
          affiliateUrl: "https://handy.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    },
    {
      id: "prescription",
      title: "Prescription Delivery",
      icon: <Pill className="w-6 h-6" />,
      description: "Have medications delivered directly to your new address.",
      services: [
        {
          id: "nurx",
          name: "Nurx",
          description: "Online prescription delivery service",
          partner: "Nurx",
          affiliateUrl: "https://nurx.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "go-md-usa",
          name: "GO MD USA",
          description: "Telehealth consultations and prescription management",
          partner: "GO MD USA",
          affiliateUrl: "https://gomdusa.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "medzoomer",
          name: "Medzoomer",
          description: "Same-day prescription delivery",
          partner: "Medzoomer",
          affiliateUrl: "https://medzoomer.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    },
    {
      id: "healthcare",
      title: "Doctors & Insurance",
      icon: <Stethoscope className="w-6 h-6" />,
      description: "Find new in-network doctors or insurance options near your new community.",
      services: [
        {
          id: "access-doctor",
          name: "AccessADoctor",
          description: "Find in-network doctors in your area",
          partner: "AccessADoctor",
          affiliateUrl: "https://accessadoctor.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "april-insurance",
          name: "APRIL Insurance",
          description: "Health insurance marketplace",
          partner: "APRIL",
          affiliateUrl: "https://april.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "smart-simple",
          name: "Smart & Simple Insurance",
          description: "Simplified insurance comparison and enrollment",
          partner: "Smart & Simple",
          affiliateUrl: "https://smartandsimple.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    },
    {
      id: "groceries",
      title: "Groceries & Meals",
      icon: <ShoppingCart className="w-6 h-6" />,
      description: "Stock your fridge or have ready-to-eat meals delivered.",
      services: [
        {
          id: "instacart",
          name: "Instacart",
          description: "Grocery delivery from local stores",
          partner: "Instacart",
          affiliateUrl: "https://instacart.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "silver-cuisine",
          name: "Silver Cuisine",
          description: "Senior-focused meal delivery service",
          partner: "Silver Cuisine",
          affiliateUrl: "https://silvercuisine.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "thrive-market",
          name: "Thrive Market",
          description: "Organic and healthy grocery delivery",
          partner: "Thrive Market",
          affiliateUrl: "https://thrivemarket.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "hellofresh",
          name: "HelloFresh",
          description: "Meal kit delivery with easy recipes",
          partner: "HelloFresh",
          affiliateUrl: "https://hellofresh.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    },
    {
      id: "phone",
      title: "Phone Access",
      icon: <Phone className="w-6 h-6" />,
      description: "Apply for free or discounted phones and service under Lifeline.",
      services: [
        {
          id: "assurance-wireless",
          name: "Assurance Wireless",
          description: "Free phone service for eligible seniors",
          partner: "Assurance Wireless",
          affiliateUrl: "https://assurancewireless.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    },
    {
      id: "transportation",
      title: "Transportation",
      icon: <Car className="w-6 h-6" />,
      description: "Schedule safe rides to appointments or errands.",
      services: [
        {
          id: "uber",
          name: "Uber",
          description: "Reliable ride service for appointments",
          partner: "Uber",
          affiliateUrl: "https://uber.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        },
        {
          id: "lyft",
          name: "Lyft",
          description: "Safe transportation with senior-friendly drivers",
          partner: "Lyft",
          affiliateUrl: "https://lyft.com?utm_source=myseniorvalet&utm_medium=referral&utm_campaign=concierge",
          selected: false
        }
      ]
    }
  ];

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleServiceClick = async (service: ServiceOption) => {
    try {
      // Track affiliate click via API
      const response = await fetch('/api/affiliate/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: service.name,
          partner: service.partner,
          category: serviceCategories.find(cat => cat.services.some(s => s.id === service.id))?.title || 'Unknown',
          affiliateUrl: service.affiliateUrl,
          metadata: {
            serviceId: service.id,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Affiliate click tracked: ${service.partner} - Click ID: ${result.clickId}`);
      }
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
    
    // Open affiliate link in new tab
    window.open(service.affiliateUrl, '_blank');
  };

  const getSelectedServicesDetails = () => {
    const selected: ServiceOption[] = [];
    serviceCategories.forEach(category => {
      category.services.forEach(service => {
        if (selectedServices.includes(service.id)) {
          selected.push(service);
        }
      });
    });
    return selected;
  };

  const handleEmailSummary = () => {
    const selectedDetails = getSelectedServicesDetails();
    const emailBody = `My Senior Valet Concierge Planner Summary:\n\n${selectedDetails.map(service => `• ${service.name} - ${service.description}`).join('\n')}\n\nGenerated by MySeniorValet.com`;
    window.open(`mailto:?subject=My Senior Valet Concierge Plan&body=${encodeURIComponent(emailBody)}`);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleShareSummary = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Senior Valet Concierge Plan',
        text: `I've selected ${selectedServices.length} services for my move-in`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <div className="h-5 w-px bg-gray-200" />
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 font-semibold px-3 py-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>MySeniorValet</span>
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Senior Valet Concierge</h1>
              <p className="text-xs text-gray-600">All-in-One Move Planning Portal</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <span className="text-xs font-medium text-blue-700">
                  {selectedServices.length} services selected
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Section */}
            <div className="text-center mb-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Senior Valet Concierge Planner
                  </h2>
                  <p className="text-xl text-gray-600 mb-4 leading-relaxed">
                    Simplify Your Move-In with Our Professional Senior Valet Concierge
                  </p>
                  <p className="text-lg text-gray-500 mb-6">
                    From movers to meal delivery, choose only what you need. Save time. Start services now with trusted partners.
                  </p>
                  <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Trusted Partners</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>No Referral Fees</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span>Professional Service</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Categories */}
            <div className="space-y-8">
              {serviceCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden border-0 shadow-lg bg-white rounded-2xl">
                  <CardHeader
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 p-6"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl text-white shadow-lg">
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 mb-2">{category.title}</CardTitle>
                          <p className="text-gray-600 leading-relaxed">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                          <span className="text-sm font-medium text-blue-700">
                            {category.services.filter(s => selectedServices.includes(s.id)).length} selected
                          </span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full">
                          {expandedCategory === category.id ? 
                            <ChevronUp className="w-5 h-5 text-gray-600" /> : 
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          }
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {expandedCategory === category.id && (
                    <CardContent className="pt-0 px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {category.services.map((service) => (
                          <div
                            key={service.id}
                            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
                          >
                            <div className="flex items-start space-x-4">
                              <Checkbox
                                checked={selectedServices.includes(service.id)}
                                onCheckedChange={() => toggleService(service.id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                                <Button
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                                  onClick={() => handleServiceClick(service)}
                                >
                                  Visit Partner <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Services Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <Card className="border-0 shadow-xl bg-white rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl p-6">
                  <CardTitle className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-lg font-bold">Your Valet Setup Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedServices.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 p-6 rounded-xl mb-4">
                        <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">Select services to see your summary</p>
                        <p className="text-gray-400 text-xs mt-2">Choose from the categories above to build your personalized plan</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                        <div className="flex items-center mb-4">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-semibold text-green-800">
                            {selectedServices.length} Services Selected
                          </span>
                        </div>
                        <div className="space-y-2">
                          {getSelectedServicesDetails().map((service) => (
                            <div key={service.id} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-medium">{service.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-medium py-3 rounded-xl"
                          onClick={handleEmailSummary}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-medium py-3 rounded-xl"
                          onClick={handlePrintSummary}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 font-medium py-3 rounded-xl"
                          onClick={handleShareSummary}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Summary
                        </Button>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        Finalize My Setup
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}