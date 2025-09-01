import type { Express } from "express";
import { db } from "../db";
import { 
  communityVendors, 
  purchaseOrders, 
  inventory,
  menus,
  menuItems,
  mealOrders,
  utilityMeters,
  utilityReadings,
  energyTargets,
  maintenanceAssets,
  maintenanceWorkOrders,
  vehicles,
  transportationTrips,
  tripPassengers
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql, or } from "drizzle-orm";
import { z } from "zod";

// Supply Chain Management Schemas
const createVendorSchema = z.object({
  communityId: z.number(),
  vendorName: z.string(),
  vendorType: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  notes: z.string().optional()
});

const createPurchaseOrderSchema = z.object({
  communityId: z.number(),
  vendorId: z.number().optional(),
  orderNumber: z.string(),
  orderDate: z.string(),
  expectedDelivery: z.string().optional(),
  totalAmount: z.string().optional(),
  status: z.enum(["pending", "approved", "shipped", "received", "cancelled"]).default("pending"),
  approvedBy: z.string().optional(),
  notes: z.string().optional()
});

const createInventorySchema = z.object({
  communityId: z.number(),
  itemName: z.string(),
  category: z.string().optional(),
  sku: z.string().optional(),
  quantityOnHand: z.number().default(0),
  reorderPoint: z.number().optional(),
  reorderQuantity: z.number().optional(),
  unitCost: z.string().optional(),
  location: z.string().optional(),
  vendorId: z.number().optional(),
  expirationDate: z.string().optional()
});

// Food Service Management Schemas
const createMenuSchema = z.object({
  communityId: z.number(),
  menuName: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  menuDate: z.string().optional(),
  weekNumber: z.number().optional(),
  cycleNumber: z.number().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  approvedBy: z.string().optional()
});

const createMenuItemSchema = z.object({
  menuId: z.number(),
  itemName: z.string(),
  description: z.string().optional(),
  category: z.enum(["entree", "side", "dessert", "beverage"]).optional(),
  allergens: z.array(z.string()).optional(),
  nutritionInfo: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    sodium: z.number().optional()
  }).optional(),
  cost: z.string().optional(),
  preparationTime: z.number().optional(),
  servingSize: z.string().optional(),
  dietaryFlags: z.array(z.string()).optional()
});

const createMealOrderSchema = z.object({
  communityId: z.number(),
  residentId: z.number().optional(),
  menuItemId: z.number().optional(),
  mealDate: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  specialRequests: z.string().optional(),
  deliveryLocation: z.string().optional(),
  status: z.enum(["pending", "preparing", "delivered", "cancelled"]).default("pending")
});

// Energy & Utility Tracking Schemas
const createUtilityMeterSchema = z.object({
  communityId: z.number(),
  meterType: z.enum(["electric", "gas", "water", "sewer"]),
  meterNumber: z.string().optional(),
  location: z.string().optional(),
  provider: z.string().optional(),
  accountNumber: z.string().optional(),
  installDate: z.string().optional(),
  status: z.enum(["active", "inactive", "maintenance"]).default("active")
});

const createUtilityReadingSchema = z.object({
  meterId: z.number(),
  readingDate: z.string(),
  readingValue: z.string().optional(),
  usage: z.string().optional(),
  cost: z.string().optional(),
  billingPeriodStart: z.string().optional(),
  billingPeriodEnd: z.string().optional(),
  peakDemand: z.string().optional(),
  powerFactor: z.string().optional(),
  notes: z.string().optional()
});

const createEnergyTargetSchema = z.object({
  communityId: z.number(),
  targetYear: z.number(),
  targetMonth: z.number().optional(),
  utilityType: z.enum(["electric", "gas", "water", "sewer"]).optional(),
  targetUsage: z.string().optional(),
  targetCost: z.string().optional(),
  reductionPercentage: z.string().optional(),
  notes: z.string().optional()
});

// Maintenance Management Schemas
const createMaintenanceAssetSchema = z.object({
  communityId: z.number(),
  assetName: z.string(),
  assetType: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  installDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  location: z.string().optional(),
  criticality: z.enum(["critical", "high", "medium", "low"]).optional(),
  maintenanceFrequency: z.number().optional(),
  status: z.enum(["operational", "maintenance", "retired"]).default("operational")
});

const createWorkOrderSchema = z.object({
  communityId: z.number(),
  assetId: z.number().optional(),
  workOrderNumber: z.string(),
  workType: z.enum(["preventive", "corrective", "emergency"]).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  scheduledDate: z.string().optional(),
  laborHours: z.string().optional(),
  partsCost: z.string().optional(),
  totalCost: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  notes: z.string().optional()
});

// Transportation Management Schemas
const createVehicleSchema = z.object({
  communityId: z.number(),
  vehicleNumber: z.string(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  capacity: z.number().optional(),
  wheelchairAccessible: z.boolean().default(false),
  mileage: z.number().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDue: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  registrationExpiry: z.string().optional(),
  status: z.enum(["available", "in_use", "maintenance", "retired"]).default("available")
});

const createTripSchema = z.object({
  communityId: z.number(),
  vehicleId: z.number().optional(),
  driverId: z.string().optional(),
  tripDate: z.string(),
  departureTime: z.string().optional(),
  returnTime: z.string().optional(),
  destination: z.string().optional(),
  purpose: z.string().optional(),
  passengerCount: z.number().optional(),
  mileage: z.string().optional(),
  fuelCost: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled")
});

const createTripPassengerSchema = z.object({
  tripId: z.number(),
  residentId: z.number().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  specialNeeds: z.string().optional(),
  status: z.enum(["confirmed", "cancelled", "no_show"]).default("confirmed")
});

export function registerOperationsManagementRoutes(app: Express) {
  // ==================== Supply Chain Management ====================
  
  // Vendors CRUD
  app.get("/api/operations-mgmt/vendors", async (req, res) => {
    try {
      const { communityId } = req.query;
      
      const result = await db
        .select()
        .from(communityVendors)
        .where(communityId ? eq(communityVendors.communityId, Number(communityId)) : undefined)
        .orderBy(desc(communityVendors.createdAt));
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching communityVendors:", error);
      res.status(500).json({ error: "Failed to fetch communityVendors" });
    }
  });

  app.post("/api/operations-mgmt/vendors", async (req, res) => {
    try {
      const data = createVendorSchema.parse(req.body);
      const result = await db.insert(communityVendors).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ error: "Failed to create vendor" });
    }
  });

  app.put("/api/operations-mgmt/vendors/:id", async (req, res) => {
    try {
      const data = createVendorSchema.partial().parse(req.body);
      const result = await db
        .update(communityVendors)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(communityVendors.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Failed to update vendor" });
    }
  });

  // Purchase Orders CRUD
  app.get("/api/operations-mgmt/purchase-orders", async (req, res) => {
    try {
      const { communityId, status } = req.query;
      
      let query = db.select().from(purchaseOrders);
      
      const conditions = [];
      if (communityId) conditions.push(eq(purchaseOrders.communityId, Number(communityId)));
      if (status) conditions.push(eq(purchaseOrders.status, status as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(purchaseOrders.orderDate));
      res.json(result);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/operations-mgmt/purchase-orders", async (req, res) => {
    try {
      const data = createPurchaseOrderSchema.parse(req.body);
      const result = await db.insert(purchaseOrders).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  // Inventory Management
  app.get("/api/operations-mgmt/inventory", async (req, res) => {
    try {
      const { communityId, lowStock } = req.query;
      
      let query = db.select().from(inventory);
      
      if (communityId) {
        query = query.where(eq(inventory.communityId, Number(communityId)));
      }
      
      const result = await query.orderBy(asc(inventory.itemName));
      
      // Filter for low stock items if requested
      if (lowStock === 'true') {
        const filteredResult = result.filter(item => 
          item.reorderPoint && item.quantityOnHand < item.reorderPoint
        );
        res.json(filteredResult);
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.post("/api/operations-mgmt/inventory", async (req, res) => {
    try {
      const data = createInventorySchema.parse(req.body);
      const result = await db.insert(inventory).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Failed to create inventory item" });
    }
  });

  app.put("/api/operations-mgmt/inventory/:id", async (req, res) => {
    try {
      const data = createInventorySchema.partial().parse(req.body);
      const result = await db
        .update(inventory)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(inventory.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  // ==================== Food Service Management ====================
  
  // Menus CRUD
  app.get("/api/operations-mgmt/menus", async (req, res) => {
    try {
      const { communityId, mealType, date } = req.query;
      
      let query = db.select().from(menus);
      
      const conditions = [];
      if (communityId) conditions.push(eq(menus.communityId, Number(communityId)));
      if (mealType) conditions.push(eq(menus.mealType, mealType as string));
      if (date) conditions.push(eq(menus.menuDate, date as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(menus.menuDate));
      res.json(result);
    } catch (error) {
      console.error("Error fetching menus:", error);
      res.status(500).json({ error: "Failed to fetch menus" });
    }
  });

  app.post("/api/operations-mgmt/menus", async (req, res) => {
    try {
      const data = createMenuSchema.parse(req.body);
      const result = await db.insert(menus).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating menu:", error);
      res.status(500).json({ error: "Failed to create menu" });
    }
  });

  // Menu Items
  app.get("/api/operations-mgmt/menu-items", async (req, res) => {
    try {
      const { menuId } = req.query;
      
      let query = db.select().from(menuItems);
      
      if (menuId) {
        query = query.where(eq(menuItems.menuId, Number(menuId)));
      }
      
      const result = await query.orderBy(asc(menuItems.category));
      res.json(result);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/operations-mgmt/menu-items", async (req, res) => {
    try {
      const data = createMenuItemSchema.parse(req.body);
      const result = await db.insert(menuItems).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  // Meal Orders
  app.get("/api/operations-mgmt/meal-orders", async (req, res) => {
    try {
      const { communityId, date, status } = req.query;
      
      let query = db.select().from(mealOrders);
      
      const conditions = [];
      if (communityId) conditions.push(eq(mealOrders.communityId, Number(communityId)));
      if (date) conditions.push(eq(mealOrders.mealDate, date as string));
      if (status) conditions.push(eq(mealOrders.status, status as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(mealOrders.mealDate));
      res.json(result);
    } catch (error) {
      console.error("Error fetching meal orders:", error);
      res.status(500).json({ error: "Failed to fetch meal orders" });
    }
  });

  app.post("/api/operations-mgmt/meal-orders", async (req, res) => {
    try {
      const data = createMealOrderSchema.parse(req.body);
      const result = await db.insert(mealOrders).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating meal order:", error);
      res.status(500).json({ error: "Failed to create meal order" });
    }
  });

  // ==================== Energy & Utility Tracking ====================
  
  // Utility Meters
  app.get("/api/operations-mgmt/utility-meters", async (req, res) => {
    try {
      const { communityId, meterType } = req.query;
      
      let query = db.select().from(utilityMeters);
      
      const conditions = [];
      if (communityId) conditions.push(eq(utilityMeters.communityId, Number(communityId)));
      if (meterType) conditions.push(eq(utilityMeters.meterType, meterType as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(asc(utilityMeters.meterType));
      res.json(result);
    } catch (error) {
      console.error("Error fetching utility meters:", error);
      res.status(500).json({ error: "Failed to fetch utility meters" });
    }
  });

  app.post("/api/operations-mgmt/utility-meters", async (req, res) => {
    try {
      const data = createUtilityMeterSchema.parse(req.body);
      const result = await db.insert(utilityMeters).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating utility meter:", error);
      res.status(500).json({ error: "Failed to create utility meter" });
    }
  });

  // Utility Readings
  app.get("/api/operations-mgmt/utility-readings", async (req, res) => {
    try {
      const { meterId, startDate, endDate } = req.query;
      
      let query = db.select().from(utilityReadings);
      
      const conditions = [];
      if (meterId) conditions.push(eq(utilityReadings.meterId, Number(meterId)));
      if (startDate && endDate) {
        conditions.push(
          and(
            gte(utilityReadings.readingDate, new Date(startDate as string)),
            lte(utilityReadings.readingDate, new Date(endDate as string))
          )
        );
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(utilityReadings.readingDate));
      res.json(result);
    } catch (error) {
      console.error("Error fetching utility readings:", error);
      res.status(500).json({ error: "Failed to fetch utility readings" });
    }
  });

  app.post("/api/operations-mgmt/utility-readings", async (req, res) => {
    try {
      const data = createUtilityReadingSchema.parse(req.body);
      const result = await db.insert(utilityReadings).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating utility reading:", error);
      res.status(500).json({ error: "Failed to create utility reading" });
    }
  });

  // Energy Targets
  app.get("/api/operations-mgmt/energy-targets", async (req, res) => {
    try {
      const { communityId, year } = req.query;
      
      let query = db.select().from(energyTargets);
      
      const conditions = [];
      if (communityId) conditions.push(eq(energyTargets.communityId, Number(communityId)));
      if (year) conditions.push(eq(energyTargets.targetYear, Number(year)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(energyTargets.targetYear));
      res.json(result);
    } catch (error) {
      console.error("Error fetching energy targets:", error);
      res.status(500).json({ error: "Failed to fetch energy targets" });
    }
  });

  app.post("/api/operations-mgmt/energy-targets", async (req, res) => {
    try {
      const data = createEnergyTargetSchema.parse(req.body);
      const result = await db.insert(energyTargets).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating energy target:", error);
      res.status(500).json({ error: "Failed to create energy target" });
    }
  });

  // ==================== Predictive Maintenance ====================
  
  // Maintenance Assets
  app.get("/api/operations-mgmt/maintenance-assets", async (req, res) => {
    try {
      const { communityId, criticality, needsMaintenance } = req.query;
      
      let query = db.select().from(maintenanceAssets);
      
      const conditions = [];
      if (communityId) conditions.push(eq(maintenanceAssets.communityId, Number(communityId)));
      if (criticality) conditions.push(eq(maintenanceAssets.criticality, criticality as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(asc(maintenanceAssets.criticality));
      
      // Filter for assets needing maintenance
      if (needsMaintenance === 'true') {
        const now = new Date();
        const filteredResult = result.filter(asset => {
          if (asset.nextMaintenanceDate) {
            return new Date(asset.nextMaintenanceDate) <= now;
          }
          return false;
        });
        res.json(filteredResult);
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching maintenance assets:", error);
      res.status(500).json({ error: "Failed to fetch maintenance assets" });
    }
  });

  app.post("/api/operations-mgmt/maintenance-assets", async (req, res) => {
    try {
      const data = createMaintenanceAssetSchema.parse(req.body);
      const result = await db.insert(maintenanceAssets).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating maintenance asset:", error);
      res.status(500).json({ error: "Failed to create maintenance asset" });
    }
  });

  // Work Orders
  app.get("/api/operations-mgmt/work-orders", async (req, res) => {
    try {
      const { communityId, status, priority } = req.query;
      
      let query = db.select().from(maintenanceWorkOrders);
      
      const conditions = [];
      if (communityId) conditions.push(eq(maintenanceWorkOrders.communityId, Number(communityId)));
      if (status) conditions.push(eq(maintenanceWorkOrders.status, status as string));
      if (priority) conditions.push(eq(maintenanceWorkOrders.priority, priority as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(maintenanceWorkOrders.createdAt));
      res.json(result);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      res.status(500).json({ error: "Failed to fetch work orders" });
    }
  });

  app.post("/api/operations-mgmt/work-orders", async (req, res) => {
    try {
      const data = createWorkOrderSchema.parse(req.body);
      const result = await db.insert(maintenanceWorkOrders).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating work order:", error);
      res.status(500).json({ error: "Failed to create work order" });
    }
  });

  app.put("/api/operations-mgmt/work-orders/:id", async (req, res) => {
    try {
      const data = createWorkOrderSchema.partial().parse(req.body);
      const result = await db
        .update(maintenanceWorkOrders)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(maintenanceWorkOrders.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating work order:", error);
      res.status(500).json({ error: "Failed to update work order" });
    }
  });

  // ==================== Transportation Management ====================
  
  // Vehicles
  app.get("/api/operations-mgmt/vehicles", async (req, res) => {
    try {
      const { communityId, status } = req.query;
      
      let query = db.select().from(vehicles);
      
      const conditions = [];
      if (communityId) conditions.push(eq(vehicles.communityId, Number(communityId)));
      if (status) conditions.push(eq(vehicles.status, status as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(asc(vehicles.vehicleNumber));
      res.json(result);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/operations-mgmt/vehicles", async (req, res) => {
    try {
      const data = createVehicleSchema.parse(req.body);
      const result = await db.insert(vehicles).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.put("/api/operations-mgmt/vehicles/:id", async (req, res) => {
    try {
      const data = createVehicleSchema.partial().parse(req.body);
      const result = await db
        .update(vehicles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(vehicles.id, Number(req.params.id)))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  // Transportation Trips
  app.get("/api/operations-mgmt/trips", async (req, res) => {
    try {
      const { communityId, date, status } = req.query;
      
      let query = db.select().from(transportationTrips);
      
      const conditions = [];
      if (communityId) conditions.push(eq(transportationTrips.communityId, Number(communityId)));
      if (status) conditions.push(eq(transportationTrips.status, status as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      const result = await query.orderBy(desc(transportationTrips.tripDate));
      res.json(result);
    } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.post("/api/operations-mgmt/trips", async (req, res) => {
    try {
      const data = createTripSchema.parse(req.body);
      const result = await db.insert(transportationTrips).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error creating trip:", error);
      res.status(500).json({ error: "Failed to create trip" });
    }
  });

  // Trip Passengers
  app.get("/api/operations-mgmt/trip-passengers", async (req, res) => {
    try {
      const { tripId } = req.query;
      
      let query = db.select().from(tripPassengers);
      
      if (tripId) {
        query = query.where(eq(tripPassengers.tripId, Number(tripId)));
      }
      
      const result = await query;
      res.json(result);
    } catch (error) {
      console.error("Error fetching trip passengers:", error);
      res.status(500).json({ error: "Failed to fetch trip passengers" });
    }
  });

  app.post("/api/operations-mgmt/trip-passengers", async (req, res) => {
    try {
      const data = createTripPassengerSchema.parse(req.body);
      const result = await db.insert(tripPassengers).values(data).returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error adding passenger:", error);
      res.status(500).json({ error: "Failed to add passenger" });
    }
  });

  // ==================== Dashboard Analytics ====================
  
  // Operations Overview
  app.get("/api/operations-mgmt/dashboard/overview", async (req, res) => {
    try {
      const { communityId } = req.query;
      
      if (!communityId) {
        return res.status(400).json({ error: "Community ID required" });
      }
      
      const communityFilter = Number(communityId);
      
      // Get counts and key metrics
      const [
        vendorCount,
        activeOrders,
        lowStockItems,
        upcomingMaintenance,
        availableVehicles,
        todaysMeals
      ] = await Promise.all([
        db.select({ count: sql<number>`count(*)` })
          .from(communityVendors)
          .where(and(
            eq(communityVendors.communityId, communityFilter),
            eq(communityVendors.status, "active")
          )),
        
        db.select({ count: sql<number>`count(*)` })
          .from(purchaseOrders)
          .where(and(
            eq(purchaseOrders.communityId, communityFilter),
            eq(purchaseOrders.status, "pending")
          )),
        
        db.select()
          .from(inventory)
          .where(eq(inventory.communityId, communityFilter)),
        
        db.select()
          .from(maintenanceAssets)
          .where(eq(maintenanceAssets.communityId, communityFilter)),
        
        db.select({ count: sql<number>`count(*)` })
          .from(vehicles)
          .where(and(
            eq(vehicles.communityId, communityFilter),
            eq(vehicles.status, "available")
          )),
        
        db.select({ count: sql<number>`count(*)` })
          .from(mealOrders)
          .where(and(
            eq(mealOrders.communityId, communityFilter),
            eq(mealOrders.mealDate, new Date().toISOString().split('T')[0])
          ))
      ]);
      
      // Calculate low stock items
      const lowStock = lowStockItems.filter(item => 
        item.reorderPoint && item.quantityOnHand < item.reorderPoint
      ).length;
      
      // Calculate assets needing maintenance
      const now = new Date();
      const needsMaintenance = upcomingMaintenance.filter(asset => {
        if (asset.nextMaintenanceDate) {
          return new Date(asset.nextMaintenanceDate) <= now;
        }
        return false;
      }).length;
      
      res.json({
        vendorCount: vendorCount[0]?.count || 0,
        activeOrders: activeOrders[0]?.count || 0,
        lowStockItems: lowStock,
        upcomingMaintenance: needsMaintenance,
        availableVehicles: availableVehicles[0]?.count || 0,
        todaysMealOrders: todaysMeals[0]?.count || 0
      });
    } catch (error) {
      console.error("Error fetching operations overview:", error);
      res.status(500).json({ error: "Failed to fetch operations overview" });
    }
  });
}