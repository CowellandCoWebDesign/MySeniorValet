import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Truck, 
  Home, 
  Heart, 
  Phone, 
  MapPin, 
  Package,
  Zap,
  Droplets,
  Wifi,
  ShoppingCart,
  Calendar,
  CheckCircle2,
  Circle,
  Star,
  Clock,
  DollarSign,
  Users,
  Building2,
  Stethoscope,
  Pill,
  Activity,
  Brain,
  Eye,
  Ear,
  Car,
  Shield,
  FileText,
  ArrowRight,
  ChevronRight,
  PhoneCall,
  Mail,
  Globe
} from "lucide-react";
import { NavigationHeader } from "@/components/NavigationHeader";
import { motion } from "framer-motion";

interface Service {
  id: string;
  name: string;
  category: string;
  type: 'care' | 'vendor';
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  rating?: number;
  priceRange?: string;
  availability?: string;
  features?: string[];
  icon: React.ComponentType<any>;
}

interface ChecklistItem {
  id: string;
  category: string;
  task: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  notes?: string;
  relatedService?: string;
}

export default function MoveInCoordination() {
  const { toast } = useToast();
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [moveDate, setMoveDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  // Care services from existing Care directory
  const careServices: Service[] = [
    {
      id: 'hospital-1',
      name: 'Regional Medical Center',
      category: 'Hospital',
      type: 'care',
      description: 'Full-service hospital with 24/7 emergency care',
      phone: '555-0100',
      address: '123 Medical Plaza',
      rating: 4.5,
      features: ['Emergency Room', '24/7 Care', 'Specialized Units'],
      icon: Building2
    },
    {
      id: 'therapy-1',
      name: 'Wellness Physical Therapy',
      category: 'Physical Therapy',
      type: 'care',
      description: 'Specialized senior physical therapy and rehabilitation',
      phone: '555-0101',
      rating: 4.8,
      features: ['Senior Specialists', 'In-Home Visits', 'Medicare Accepted'],
      icon: Activity
    },
    {
      id: 'pharmacy-1',
      name: 'CarePlus Pharmacy',
      category: 'Pharmacy',
      type: 'care',
      description: 'Local pharmacy with medication management services',
      phone: '555-0102',
      rating: 4.7,
      features: ['Delivery Service', 'Medication Sync', 'Auto-Refill'],
      icon: Pill
    },
    {
      id: 'doctor-1',
      name: 'Senior Care Medical Group',
      category: 'Primary Care',
      type: 'care',
      description: 'Geriatric specialists and primary care physicians',
      phone: '555-0103',
      rating: 4.6,
      features: ['Geriatric Specialists', 'Same-Day Appointments', 'Telehealth'],
      icon: Stethoscope
    },
    {
      id: 'neuro-1',
      name: 'Memory Care Specialists',
      category: 'Neurology',
      type: 'care',
      description: 'Specialized care for memory and cognitive conditions',
      phone: '555-0104',
      rating: 4.9,
      features: ['Memory Assessment', 'Support Groups', 'Care Planning'],
      icon: Brain
    },
    {
      id: 'vision-1',
      name: 'ClearView Eye Center',
      category: 'Vision Care',
      type: 'care',
      description: 'Comprehensive eye care for seniors',
      phone: '555-0105',
      rating: 4.5,
      features: ['Cataract Surgery', 'Glaucoma Treatment', 'Low Vision Services'],
      icon: Eye
    },
    {
      id: 'hearing-1',
      name: 'Better Hearing Center',
      category: 'Hearing Care',
      type: 'care',
      description: 'Hearing tests and hearing aid services',
      phone: '555-0106',
      rating: 4.6,
      features: ['Free Hearing Tests', 'Hearing Aid Fitting', 'Repair Services'],
      icon: Ear
    }
  ];

  // Vendor services for moving and utilities
  const vendorServices: Service[] = [
    {
      id: 'moving-1',
      name: 'Senior Move Managers',
      category: 'Moving Services',
      type: 'vendor',
      description: 'Specialized moving services for seniors with downsizing assistance',
      phone: '555-0200',
      website: 'www.seniormovemanagers.com',
      rating: 4.8,
      priceRange: '$$$',
      features: ['Packing/Unpacking', 'Downsizing Help', 'Estate Sales', 'Storage Solutions'],
      icon: Truck
    },
    {
      id: 'utility-electric',
      name: 'City Electric Company',
      category: 'Utilities',
      type: 'vendor',
      description: 'Electric service provider - setup and transfer',
      phone: '555-0201',
      website: 'www.cityelectric.com',
      priceRange: '$$',
      features: ['Online Setup', 'Budget Billing', 'Senior Discounts'],
      icon: Zap
    },
    {
      id: 'utility-water',
      name: 'Municipal Water Services',
      category: 'Utilities',
      type: 'vendor',
      description: 'Water and sewer services',
      phone: '555-0202',
      priceRange: '$',
      features: ['Auto-Pay', 'Leak Detection', 'Conservation Programs'],
      icon: Droplets
    },
    {
      id: 'internet-1',
      name: 'ConnectFast Internet',
      category: 'Internet & Cable',
      type: 'vendor',
      description: 'High-speed internet and cable TV services',
      phone: '555-0203',
      rating: 4.2,
      priceRange: '$$',
      features: ['Senior Plans', 'No Contract Options', 'Tech Support'],
      icon: Wifi
    },
    {
      id: 'walmart-1',
      name: 'Walmart Supercenter',
      category: 'Shopping',
      type: 'vendor',
      description: 'One-stop shopping for household essentials',
      phone: '555-0204',
      website: 'www.walmart.com',
      rating: 4.0,
      priceRange: '$',
      features: ['Grocery Pickup', 'Home Delivery', 'Pharmacy', 'Senior Hours'],
      icon: ShoppingCart
    },
    {
      id: 'transport-1',
      name: 'Senior Transit Services',
      category: 'Transportation',
      type: 'vendor',
      description: 'Door-to-door transportation for medical appointments and errands',
      phone: '555-0205',
      rating: 4.7,
      priceRange: '$$',
      features: ['Medical Transport', 'Wheelchair Accessible', 'Scheduled Rides'],
      icon: Car
    },
    {
      id: 'insurance-1',
      name: 'SecureLife Insurance',
      category: 'Insurance',
      type: 'vendor',
      description: 'Medicare supplements and long-term care insurance',
      phone: '555-0206',
      rating: 4.5,
      features: ['Medicare Plans', 'Long-Term Care', 'Free Consultation'],
      icon: Shield
    },
    {
      id: 'legal-1',
      name: 'Elder Law Associates',
      category: 'Legal Services',
      type: 'vendor',
      description: 'Estate planning and elder law services',
      phone: '555-0207',
      rating: 4.9,
      priceRange: '$$$$',
      features: ['Estate Planning', 'Power of Attorney', 'Medicaid Planning'],
      icon: FileText
    }
  ];

  // Default checklist items
  const defaultChecklist: ChecklistItem[] = [
    // Pre-Move Tasks
    { id: '1', category: 'Pre-Move', task: 'Schedule moving company', completed: false, priority: 'high', relatedService: 'moving-1' },
    { id: '2', category: 'Pre-Move', task: 'Begin downsizing and decluttering', completed: false, priority: 'high' },
    { id: '3', category: 'Pre-Move', task: 'Order packing supplies', completed: false, priority: 'medium' },
    { id: '4', category: 'Pre-Move', task: 'Create inventory of belongings', completed: false, priority: 'medium' },
    { id: '5', category: 'Pre-Move', task: 'Take photos of valuable items', completed: false, priority: 'low' },
    
    // Healthcare Setup
    { id: '6', category: 'Healthcare', task: 'Transfer medical records', completed: false, priority: 'high', relatedService: 'doctor-1' },
    { id: '7', category: 'Healthcare', task: 'Find new primary care doctor', completed: false, priority: 'high', relatedService: 'doctor-1' },
    { id: '8', category: 'Healthcare', task: 'Transfer prescriptions to new pharmacy', completed: false, priority: 'high', relatedService: 'pharmacy-1' },
    { id: '9', category: 'Healthcare', task: 'Schedule initial doctor appointment', completed: false, priority: 'medium' },
    { id: '10', category: 'Healthcare', task: 'Update Medicare information', completed: false, priority: 'high' },
    
    // Utilities Setup
    { id: '11', category: 'Utilities', task: 'Set up electricity service', completed: false, priority: 'high', relatedService: 'utility-electric' },
    { id: '12', category: 'Utilities', task: 'Set up water service', completed: false, priority: 'high', relatedService: 'utility-water' },
    { id: '13', category: 'Utilities', task: 'Schedule internet installation', completed: false, priority: 'medium', relatedService: 'internet-1' },
    { id: '14', category: 'Utilities', task: 'Cancel utilities at old residence', completed: false, priority: 'high' },
    
    // Administrative
    { id: '15', category: 'Administrative', task: 'Change address with USPS', completed: false, priority: 'high' },
    { id: '16', category: 'Administrative', task: 'Update driver\'s license', completed: false, priority: 'medium' },
    { id: '17', category: 'Administrative', task: 'Update voter registration', completed: false, priority: 'low' },
    { id: '18', category: 'Administrative', task: 'Notify bank of address change', completed: false, priority: 'high' },
    { id: '19', category: 'Administrative', task: 'Update insurance policies', completed: false, priority: 'high', relatedService: 'insurance-1' },
    
    // Post-Move
    { id: '20', category: 'Post-Move', task: 'Unpack essentials', completed: false, priority: 'high' },
    { id: '21', category: 'Post-Move', task: 'Set up emergency contacts', completed: false, priority: 'high' },
    { id: '22', category: 'Post-Move', task: 'Explore community amenities', completed: false, priority: 'low' },
    { id: '23', category: 'Post-Move', task: 'Meet neighbors', completed: false, priority: 'low' },
    { id: '24', category: 'Post-Move', task: 'Register for community activities', completed: false, priority: 'medium' }
  ];

  useEffect(() => {
    // Load saved checklist from localStorage
    const savedChecklist = localStorage.getItem('moveInChecklist');
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    } else {
      setChecklist(defaultChecklist);
    }
  }, []);

  const toggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    localStorage.setItem('moveInChecklist', JSON.stringify(updatedChecklist));
  };

  const allServices = [...careServices, ...vendorServices];
  
  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                            service.category === selectedCategory ||
                            (selectedCategory === 'care' && service.type === 'care') ||
                            (selectedCategory === 'vendor' && service.type === 'vendor');
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'care', 'vendor', ...new Set(allServices.map(s => s.category))];

  const getChecklistProgress = () => {
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getChecklistByCategory = (category: string) => {
    return checklist.filter(item => item.category === category);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const saveService = (service: Service) => {
    const savedServices = JSON.parse(localStorage.getItem('savedMoveInServices') || '[]');
    if (!savedServices.find((s: Service) => s.id === service.id)) {
      savedServices.push(service);
      localStorage.setItem('savedMoveInServices', JSON.stringify(savedServices));
      toast({
        title: "Service Saved",
        description: `${service.name} has been added to your move-in plan`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavigationHeader />
      
      <main className="container mx-auto px-4 py-8 mt-16">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Move-In Coordination Center
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need for a smooth transition - from healthcare setup to utility connections
          </p>
        </motion.div>

        {/* Quick Setup */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Move-In Details</CardTitle>
            <CardDescription>Let's personalize your move-in experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="community">Moving To</Label>
                <Input 
                  id="community"
                  placeholder="Enter community name"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date">Move Date</Label>
                <Input 
                  id="date"
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="checklist" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklist">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="care">
              <Heart className="h-4 w-4 mr-2" />
              Care Services
            </TabsTrigger>
            <TabsTrigger value="vendor">
              <Package className="h-4 w-4 mr-2" />
              Vendor Services
            </TabsTrigger>
          </TabsList>

          {/* Checklist Tab */}
          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Move-In Checklist</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Progress: {getChecklistProgress()}%
                    </span>
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${getChecklistProgress()}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {['Pre-Move', 'Healthcare', 'Utilities', 'Administrative', 'Post-Move'].map(category => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-3">{category}</h3>
                      <div className="space-y-2">
                        {getChecklistByCategory(category).map(item => (
                          <motion.div 
                            key={item.id}
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => toggleChecklistItem(item.id)}
                              />
                              <span className={item.completed ? 'line-through text-gray-400' : ''}>
                                {item.task}
                              </span>
                              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            </div>
                            {item.relatedService && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const service = allServices.find(s => s.id === item.relatedService);
                                  if (service) saveService(service);
                                }}
                              >
                                View Service
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Services Tab */}
          <TabsContent value="care" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Healthcare & Care Services</CardTitle>
                <CardDescription>Essential medical and care providers in your new area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {careServices.map(service => {
                    const Icon = service.icon;
                    return (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Icon className="h-8 w-8 text-primary" />
                          {service.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{service.rating}</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{service.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.category}
                        </p>
                        <p className="text-sm mb-3">{service.description}</p>
                        {service.features && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {service.features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {service.phone && (
                            <Button size="sm" variant="outline" className="flex-1">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                          <Button size="sm" onClick={() => saveService(service)} className="flex-1">
                            Save
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Services Tab */}
          <TabsContent value="vendor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor & Relocation Services</CardTitle>
                <CardDescription>Moving assistance, utilities, shopping, and more</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendorServices.map(service => {
                    const Icon = service.icon;
                    return (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Icon className="h-8 w-8 text-primary" />
                          {service.priceRange && (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {service.priceRange}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{service.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {service.category}
                        </p>
                        <p className="text-sm mb-3">{service.description}</p>
                        {service.features && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {service.features.slice(0, 2).map((feature, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          {service.phone && (
                            <Button size="sm" variant="outline" className="flex-1">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                          {service.website && (
                            <Button size="sm" variant="outline" className="flex-1">
                              <Globe className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                          )}
                          <Button size="sm" onClick={() => saveService(service)} className="flex-1">
                            Save
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Our move-in specialists are here to assist you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button>
                <PhoneCall className="h-4 w-4 mr-2" />
                Call Move-In Support
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Your Checklist
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Move-In Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}