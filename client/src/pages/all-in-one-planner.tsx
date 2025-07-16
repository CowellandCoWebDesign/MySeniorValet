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
  Share2
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  <Home className="w-4 h-4" />
                  <span>MySeniorValet</span>
                </Button>
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              {selectedServices.length} services selected
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Senior Valet Concierge Planner
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Simplify Your Move-In with Our Senior Valet Concierge
              </p>
              <p className="text-gray-500">
                From movers to meal delivery, choose only what you need. Save time. Start services now with trusted partners.
              </p>
            </div>

            {/* Service Categories */}
            <div className="space-y-6">
              {serviceCategories.map((category) => (
                <Card key={category.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {category.services.filter(s => selectedServices.includes(s.id)).length} selected
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  {expandedCategory === category.id && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.services.map((service) => (
                          <div
                            key={service.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start space-x-3">
                              <Checkbox
                                checked={selectedServices.includes(service.id)}
                                onCheckedChange={() => toggleService(service.id)}
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{service.name}</h4>
                                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                                <Button
                                  size="sm"
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                  onClick={() => handleServiceClick(service)}
                                >
                                  Visit Partner <ExternalLink className="w-3 h-3 ml-1" />
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Your Valet Setup Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedServices.length === 0 ? (
                    <p className="text-gray-500 text-sm">Select services to see your summary</p>
                  ) : (
                    <div className="space-y-3">
                      {getSelectedServicesDetails().map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm">{service.name}</span>
                        </div>
                      ))}
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleEmailSummary}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handlePrintSummary}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Summary
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={handleShareSummary}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Summary
                        </Button>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
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