import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  UtensilsCrossed, 
  Calendar, 
  Clock, 
  Star, 
  Heart,
  Info,
  AlertCircle,
  Apple,
  Leaf,
  Wheat,
  Fish,
  Cookie,
  Coffee,
  Download,
  Printer,
  ChefHat,
  ThumbsUp,
  MessageSquare,
  Filter
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function DiningMenuViewer() {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
  const [dietaryFilter, setDietaryFilter] = useState<string[]>([]);
  const [mealRequest, setMealRequest] = useState('');
  const { toast } = useToast();

  // Fetch menu data
  const { data: menuData, isLoading } = useQuery({
    queryKey: ['/api/operations/menus', selectedWeek],
    queryFn: async () => {
      // Mock data for demo - would connect to real API
      return {
        weekOf: '2025-09-02',
        communityName: 'Sunrise Senior Living',
        chefName: 'Chef Michael Rodriguez',
        weeklySpecials: [
          { day: 'Tuesday', special: 'Prime Rib Night', time: 'Dinner' },
          { day: 'Friday', special: 'Seafood Buffet', time: 'Dinner' },
          { day: 'Sunday', special: 'Brunch Spectacular', time: 'Brunch' }
        ],
        menus: {
          monday: {
            breakfast: {
              items: ['Scrambled eggs', 'Turkey bacon', 'Whole wheat toast', 'Fresh fruit salad', 'Oatmeal bar'],
              beverages: ['Coffee', 'Tea', 'Orange juice', 'Milk'],
              specialDiets: { vegetarian: true, glutenFree: true, diabetic: true }
            },
            lunch: {
              items: ['Grilled chicken Caesar salad', 'Tomato basil soup', 'Garlic breadsticks', 'Mixed green salad'],
              dessert: 'Chocolate chip cookies',
              beverages: ['Iced tea', 'Lemonade', 'Water'],
              specialDiets: { vegetarian: false, glutenFree: false, diabetic: true }
            },
            dinner: {
              items: ['Herb-roasted salmon', 'Wild rice pilaf', 'Steamed asparagus', 'Dinner rolls'],
              dessert: 'New York cheesecake',
              beverages: ['Wine selection', 'Sparkling water', 'Coffee'],
              specialDiets: { vegetarian: false, glutenFree: true, diabetic: false }
            }
          },
          tuesday: {
            breakfast: {
              items: ['Belgian waffles', 'Maple syrup', 'Fresh berries', 'Greek yogurt parfait'],
              beverages: ['Coffee', 'Tea', 'Apple juice', 'Milk'],
              specialDiets: { vegetarian: true, glutenFree: false, diabetic: false }
            },
            lunch: {
              items: ['Turkey club sandwich', 'Sweet potato fries', 'Coleslaw', 'Pickle spear'],
              dessert: 'Apple pie',
              beverages: ['Soft drinks', 'Iced tea', 'Water'],
              specialDiets: { vegetarian: false, glutenFree: false, diabetic: true }
            },
            dinner: {
              items: ['Prime rib special', 'Baked potato', 'Caesar salad', 'Yorkshire pudding'],
              dessert: 'Tiramisu',
              beverages: ['Wine selection', 'Beer', 'Coffee'],
              specialDiets: { vegetarian: false, glutenFree: false, diabetic: false }
            }
          },
          wednesday: {
            breakfast: {
              items: ['Eggs Benedict', 'Hash browns', 'Fresh fruit', 'English muffins'],
              beverages: ['Coffee', 'Tea', 'Cranberry juice', 'Milk'],
              specialDiets: { vegetarian: false, glutenFree: false, diabetic: true }
            },
            lunch: {
              items: ['Chicken noodle soup', 'Garden salad', 'Grilled cheese sandwich', 'Fruit cup'],
              dessert: 'Jello parfait',
              beverages: ['Hot tea', 'Lemonade', 'Water'],
              specialDiets: { vegetarian: false, glutenFree: false, diabetic: true }
            },
            dinner: {
              items: ['Beef stroganoff', 'Egg noodles', 'Green beans', 'Sourdough bread'],
              dessert: 'Chocolate mousse',
              beverages: ['Wine', 'Sparkling cider', 'Coffee'],
              specialDiets: { vegetarian: false, glutenFree: false, diabetic: false }
            }
          }
        },
        nutritionInfo: {
          averageCalories: { breakfast: 450, lunch: 650, dinner: 750 },
          sodiumRestricted: 'Low-sodium options available upon request',
          allergenInfo: 'Please inform staff of any food allergies'
        }
      };
    }
  });

  // Submit meal request
  const submitMealRequestMutation = useMutation({
    mutationFn: async (request: string) => {
      return apiRequest('POST', '/api/operations/meal-requests', { request });
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your meal request has been sent to the kitchen",
      });
      setMealRequest('');
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: Leaf },
    { value: 'glutenFree', label: 'Gluten-Free', icon: Wheat },
    { value: 'diabetic', label: 'Diabetic', icon: Apple },
    { value: 'lowSodium', label: 'Low Sodium', icon: Heart }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">Loading delicious menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Dining Menu & Meal Services
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {menuData?.communityName} • Week of {new Date(menuData?.weekOf).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Menu
              </Button>
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Specials Banner */}
        <Card className="mb-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Star className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-xl font-bold text-orange-800 dark:text-orange-200">This Week's Specials</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menuData?.weeklySpecials.map((special, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <Badge className="mb-2" variant="secondary">{special.day}</Badge>
                  <p className="font-semibold">{special.special}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{special.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dietary Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Dietary Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {dietaryOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = dietaryFilter.includes(option.value);
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (isSelected) {
                        setDietaryFilter(dietaryFilter.filter(f => f !== option.value));
                      } else {
                        setDietaryFilter([...dietaryFilter, option.value]);
                      }
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Menus */}
        <Tabs defaultValue="monday" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            {days.map((day) => (
              <TabsTrigger key={day} value={day.toLowerCase()}>
                {day.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(menuData?.menus || {}).map(([day, meals]) => (
            <TabsContent key={day} value={day} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breakfast */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                    <CardTitle className="flex items-center">
                      <Coffee className="mr-2 h-5 w-5" />
                      Breakfast
                    </CardTitle>
                    <CardDescription>7:00 AM - 9:00 AM</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Main Items</h4>
                        <ul className="space-y-1">
                          {meals.breakfast.items.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Beverages</h4>
                        <div className="flex flex-wrap gap-2">
                          {meals.breakfast.beverages.map((bev, idx) => (
                            <Badge key={idx} variant="secondary">{bev}</Badge>
                          ))}
                        </div>
                      </div>
                      {meals.breakfast.specialDiets && (
                        <div className="pt-3 border-t">
                          <div className="flex flex-wrap gap-2">
                            {meals.breakfast.specialDiets.vegetarian && (
                              <Badge className="bg-green-100 text-green-700">
                                <Leaf className="mr-1 h-3 w-3" />
                                Vegetarian
                              </Badge>
                            )}
                            {meals.breakfast.specialDiets.glutenFree && (
                              <Badge className="bg-amber-100 text-amber-700">
                                <Wheat className="mr-1 h-3 w-3" />
                                GF Options
                              </Badge>
                            )}
                            {meals.breakfast.specialDiets.diabetic && (
                              <Badge className="bg-blue-100 text-blue-700">
                                <Apple className="mr-1 h-3 w-3" />
                                Diabetic
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Lunch */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                    <CardTitle className="flex items-center">
                      <UtensilsCrossed className="mr-2 h-5 w-5" />
                      Lunch
                    </CardTitle>
                    <CardDescription>12:00 PM - 2:00 PM</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Main Items</h4>
                        <ul className="space-y-1">
                          {meals.lunch.items.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {meals.lunch.dessert && (
                        <div>
                          <h4 className="font-semibold mb-2">Dessert</h4>
                          <p className="text-sm flex items-center">
                            <Cookie className="mr-2 h-4 w-4 text-yellow-600" />
                            {meals.lunch.dessert}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold mb-2">Beverages</h4>
                        <div className="flex flex-wrap gap-2">
                          {meals.lunch.beverages.map((bev, idx) => (
                            <Badge key={idx} variant="secondary">{bev}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Dinner */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardTitle className="flex items-center">
                      <ChefHat className="mr-2 h-5 w-5" />
                      Dinner
                    </CardTitle>
                    <CardDescription>5:00 PM - 7:00 PM</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Main Items</h4>
                        <ul className="space-y-1">
                          {meals.dinner.items.map((item, idx) => (
                            <li key={idx} className="flex items-center text-sm">
                              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {meals.dinner.dessert && (
                        <div>
                          <h4 className="font-semibold mb-2">Dessert</h4>
                          <p className="text-sm flex items-center">
                            <Cookie className="mr-2 h-4 w-4 text-yellow-600" />
                            {meals.dinner.dessert}
                          </p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold mb-2">Beverages</h4>
                        <div className="flex flex-wrap gap-2">
                          {meals.dinner.beverages.map((bev, idx) => (
                            <Badge key={idx} variant="secondary">{bev}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Special Requests Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Special Meal Requests
            </CardTitle>
            <CardDescription>
              Let our kitchen know about your dietary needs or special requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="request">Your Request</Label>
                <Textarea
                  id="request"
                  placeholder="Example: I need low-sodium meals, or I'd like my coffee with almond milk..."
                  value={mealRequest}
                  onChange={(e) => setMealRequest(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={() => submitMealRequestMutation.mutate(mealRequest)}
                disabled={!mealRequest}
              >
                <ChefHat className="mr-2 h-4 w-4" />
                Submit Request to Kitchen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Nutrition Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-1">Average Calories</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Breakfast: {menuData?.nutritionInfo.averageCalories.breakfast} cal
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Lunch: {menuData?.nutritionInfo.averageCalories.lunch} cal
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Dinner: {menuData?.nutritionInfo.averageCalories.dinner} cal
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-1">Sodium Information</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {menuData?.nutritionInfo.sodiumRestricted}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-1">Allergen Notice</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {menuData?.nutritionInfo.allergenInfo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chef's Corner */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full">
                <ChefHat className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">From the Kitchen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  "We're committed to providing nutritious, delicious meals tailored to your needs. 
                  Don't hesitate to let us know how we can make your dining experience better!"
                </p>
                <p className="text-sm font-medium mt-2">- {menuData?.chefName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}