import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Package, Truck, ShoppingCart, ChefHat, Zap, Wrench, Car,
  Plus, Search, Filter, BarChart, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Users, Calendar, DollarSign, Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LineChart, Line, BarChart as RechartsBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface OperationsManagementDashboardProps {
  communityId: number;
}

export function OperationsManagementDashboard({ communityId }: OperationsManagementDashboardProps) {
  const [selectedTab, setSelectedTab] = useState("supply-chain");
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [showNewTrip, setShowNewTrip] = useState(false);

  // Fetch supply chain data
  const { data: vendors } = useQuery({
    queryKey: ['/api/operations-mgmt/vendors', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/vendors?communityId=${communityId}`)
  });

  const { data: purchaseOrders } = useQuery({
    queryKey: ['/api/operations-mgmt/purchase-orders', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/purchase-orders?communityId=${communityId}`)
  });

  const { data: inventory } = useQuery({
    queryKey: ['/api/operations-mgmt/inventory', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/inventory?communityId=${communityId}`)
  });

  // Fetch food service data
  const { data: menus } = useQuery({
    queryKey: ['/api/operations-mgmt/menus', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/menus?communityId=${communityId}`)
  });

  const { data: mealOrders } = useQuery({
    queryKey: ['/api/operations-mgmt/meal-orders', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/meal-orders?communityId=${communityId}`)
  });

  // Fetch energy data
  const { data: utilityMeters } = useQuery({
    queryKey: ['/api/operations-mgmt/utility-meters', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/utility-meters?communityId=${communityId}`)
  });

  const { data: utilityReadings } = useQuery({
    queryKey: ['/api/operations-mgmt/utility-readings', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/utility-readings?communityId=${communityId}`)
  });

  // Fetch maintenance data
  const { data: maintenanceAssets } = useQuery({
    queryKey: ['/api/operations-mgmt/maintenance-assets', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/maintenance-assets?communityId=${communityId}`)
  });

  const { data: workOrders } = useQuery({
    queryKey: ['/api/operations-mgmt/work-orders', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/work-orders?communityId=${communityId}`)
  });

  // Fetch transportation data
  const { data: vehicles } = useQuery({
    queryKey: ['/api/operations-mgmt/vehicles', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/vehicles?communityId=${communityId}`)
  });

  const { data: trips } = useQuery({
    queryKey: ['/api/operations-mgmt/trips', communityId],
    queryFn: () => apiRequest('GET', `/api/operations-mgmt/trips?communityId=${communityId}`)
  });

  // Calculate metrics
  const activeVendors = vendors?.filter((v: any) => v.status === 'active').length || 0;
  const pendingOrders = purchaseOrders?.filter((po: any) => po.status === 'pending').length || 0;
  const lowStockItems = inventory?.filter((item: any) => 
    item.quantityOnHand <= (item.reorderPoint || 10)
  ).length || 0;
  const openWorkOrders = workOrders?.filter((wo: any) => 
    wo.status === 'pending' || wo.status === 'in_progress'
  ).length || 0;

  // Mock data for charts
  const energyTrendData = [
    { month: 'Jan', electricity: 4500, gas: 2300, water: 1200 },
    { month: 'Feb', electricity: 4200, gas: 2100, water: 1150 },
    { month: 'Mar', electricity: 4100, gas: 1900, water: 1100 },
    { month: 'Apr', electricity: 3900, gas: 1700, water: 1050 },
    { month: 'May', electricity: 3800, gas: 1500, water: 1000 },
    { month: 'Jun', electricity: 4000, gas: 1400, water: 980 }
  ];

  const maintenanceStatusData = [
    { name: 'Completed', value: 45, color: '#10b981' },
    { name: 'In Progress', value: 12, color: '#3b82f6' },
    { name: 'Pending', value: 8, color: '#f59e0b' },
    { name: 'Overdue', value: 3, color: '#ef4444' }
  ];

  const transportationUsageData = [
    { day: 'Mon', trips: 12, passengers: 45 },
    { day: 'Tue', trips: 15, passengers: 52 },
    { day: 'Wed', trips: 18, passengers: 61 },
    { day: 'Thu', trips: 14, passengers: 48 },
    { day: 'Fri', trips: 20, passengers: 72 },
    { day: 'Sat', trips: 8, passengers: 28 },
    { day: 'Sun', trips: 6, passengers: 20 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold">{activeVendors}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Work Orders</p>
                <p className="text-2xl font-bold">{openWorkOrders}</p>
              </div>
              <Wrench className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Vehicles</p>
                <p className="text-2xl font-bold">{vehicles?.length || 0}</p>
              </div>
              <Car className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
          <TabsTrigger value="food-service">Food Service</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
        </TabsList>

        {/* Supply Chain Tab */}
        <TabsContent value="supply-chain" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Supply Chain Management</h3>
            <div className="flex gap-2">
              <Button onClick={() => setShowNewVendor(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Vendor
              </Button>
              <Button onClick={() => setShowNewOrder(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Order
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendors List */}
            <Card>
              <CardHeader>
                <CardTitle>Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {vendors?.map((vendor: any) => (
                      <div key={vendor.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{vendor.vendorName}</h4>
                            <p className="text-sm text-muted-foreground">{vendor.vendorType}</p>
                            <p className="text-sm">{vendor.contactName}</p>
                          </div>
                          <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                            {vendor.status}
                          </Badge>
                        </div>
                        {vendor.rating && (
                          <div className="mt-2">
                            <Progress value={vendor.rating * 20} className="h-2" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Purchase Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {purchaseOrders?.slice(0, 10).map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{order.orderNumber}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                            </p>
                            {order.totalAmount && (
                              <p className="text-sm font-semibold mt-1">
                                ${parseFloat(order.totalAmount).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <Badge variant={
                            order.status === 'received' ? 'success' :
                            order.status === 'shipped' ? 'default' :
                            order.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Inventory Alerts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Inventory Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inventory?.filter((item: any) => 
                    item.quantityOnHand <= (item.reorderPoint || 10)
                  ).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-semibold">{item.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            Current: {item.quantityOnHand} | Reorder at: {item.reorderPoint || 10}
                          </p>
                        </div>
                      </div>
                      <Button size="sm">Reorder</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Food Service Tab */}
        <TabsContent value="food-service" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Food Service Management</h3>
            <Button onClick={() => setShowNewMenu(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Menu
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Menus */}
            <Card>
              <CardHeader>
                <CardTitle>Active Menus</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {menus?.filter((menu: any) => menu.status === 'active').map((menu: any) => (
                      <div key={menu.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{menu.menuName}</h4>
                            <Badge className="mt-1">{menu.mealType}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              {format(new Date(menu.dateServed), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <ChefHat className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Meal Orders Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Meal Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {mealOrders?.filter((o: any) => o.mealType === 'breakfast').length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Breakfast</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {mealOrders?.filter((o: any) => o.mealType === 'lunch').length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Lunch</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {mealOrders?.filter((o: any) => o.mealType === 'dinner').length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Dinner</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h5 className="font-semibold mb-2">Special Dietary Requirements</h5>
                    <div className="space-y-1">
                      {['gluten-free', 'diabetic', 'low-sodium', 'vegetarian'].map(diet => (
                        <div key={diet} className="flex justify-between">
                          <span className="text-sm capitalize">{diet}</span>
                          <Badge variant="outline">
                            {mealOrders?.filter((o: any) => 
                              o.specialRequests?.includes(diet)
                            ).length || 0}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Energy Tab */}
        <TabsContent value="energy" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Energy Management</h3>
            <Button>
              <BarChart className="h-4 w-4 mr-2" /> Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Energy Consumption Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Energy Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={energyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="electricity" stroke="#3b82f6" name="Electricity (kWh)" />
                    <Line type="monotone" dataKey="gas" stroke="#ef4444" name="Gas (therms)" />
                    <Line type="monotone" dataKey="water" stroke="#10b981" name="Water (gallons)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Utility Meters */}
            <Card>
              <CardHeader>
                <CardTitle>Utility Meters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {utilityMeters?.map((meter: any) => (
                    <div key={meter.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{meter.meterName}</h4>
                          <p className="text-sm text-muted-foreground">{meter.utilityType}</p>
                          <p className="text-xs text-muted-foreground">{meter.location}</p>
                        </div>
                        <Zap className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Energy Savings */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">vs. Last Month</span>
                      <span className="text-sm font-semibold text-green-600">-12%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">vs. Target</span>
                      <span className="text-sm font-semibold text-green-600">-8%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-2xl font-bold text-green-600">$3,420</p>
                    <p className="text-sm text-muted-foreground">Estimated Monthly Savings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Maintenance Management</h3>
            <Button onClick={() => setShowNewMaintenance(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Work Order
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Work Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Work Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={maintenanceStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {maintenanceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {maintenanceStatusData.map((status) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                        <span className="text-sm">{status.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{status.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critical Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Critical Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {maintenanceAssets?.filter((asset: any) => asset.criticalityLevel === 'high')
                      .map((asset: any) => (
                      <div key={asset.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-sm">{asset.assetName}</h4>
                            <p className="text-xs text-muted-foreground">{asset.assetType}</p>
                            <p className="text-xs mt-1">Location: {asset.location}</p>
                          </div>
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        </div>
                        {asset.nextMaintenanceDate && (
                          <div className="mt-2 text-xs">
                            Next Service: {format(new Date(asset.nextMaintenanceDate), 'MMM dd')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Work Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <div className="space-y-3">
                    {workOrders?.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-sm">{order.workOrderNumber}</h4>
                            <p className="text-xs text-muted-foreground">{order.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={
                                order.priority === 'emergency' ? 'destructive' :
                                order.priority === 'high' ? 'default' : 'secondary'
                              } className="text-xs">
                                {order.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transportation Tab */}
        <TabsContent value="transportation" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Transportation Management</h3>
            <Button onClick={() => setShowNewTrip(true)}>
              <Plus className="h-4 w-4 mr-2" /> Schedule Trip
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Fleet Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vehicles?.map((vehicle: any) => (
                    <div key={vehicle.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{vehicle.vehicleName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.make} {vehicle.model} ({vehicle.year})
                          </p>
                          <p className="text-sm">License: {vehicle.licensePlate}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={vehicle.status === 'available' ? 'success' : 'secondary'}>
                              {vehicle.status}
                            </Badge>
                            {vehicle.wheelchairAccessible && (
                              <Badge variant="outline">♿ Accessible</Badge>
                            )}
                          </div>
                        </div>
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Transportation Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={transportationUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="trips" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                    <Area type="monotone" dataKey="passengers" stackId="2" stroke="#10b981" fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Today's Trips */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Today's Scheduled Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trips?.filter((trip: any) => {
                    const today = new Date().toDateString();
                    return new Date(trip.tripDate).toDateString() === today;
                  }).map((trip: any) => (
                    <div key={trip.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Trip Type</p>
                          <p className="font-semibold">{trip.tripType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-semibold">
                            {trip.departureTime} - {trip.returnTime || 'TBD'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vehicle</p>
                          <p className="font-semibold">
                            {vehicles?.find((v: any) => v.id === trip.vehicleId)?.vehicleName || 'Unassigned'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={
                            trip.status === 'completed' ? 'success' :
                            trip.status === 'in_progress' ? 'default' : 'secondary'
                          }>
                            {trip.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}