import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Healthcare Provider signup schema
const healthcareProviderSchema = z.object({
  businessName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  website: z.string().url().optional().or(z.literal("")),
  serviceType: z.string(),
  otherServiceType: z.string().optional(),
  description: z.string().min(50),
  services: z.array(z.string()).min(1),
  certifications: z.array(z.string()).optional(),
  insuranceAccepted: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).min(1),
  states: z.array(z.string()).min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  metadata: z.object({
    yearsInBusiness: z.number().optional(),
    employeeCount: z.string().optional(),
    languages: z.array(z.string()).optional(),
    emergencyAvailable: z.boolean().optional(),
    acceptingNewPatients: z.boolean().optional(),
  }).optional(),
});

// Get all healthcare providers
router.get("/healthcare-providers", async (req, res) => {
  try {
    const providers = await storage.getHealthcareProviders();
    res.json(providers);
  } catch (error) {
    console.error("Error fetching healthcare providers:", error);
    res.status(500).json({ error: "Failed to fetch healthcare providers" });
  }
});

// Get single healthcare provider
router.get("/healthcare-providers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const provider = await storage.getHealthcareProviderById(id);
    
    if (!provider) {
      return res.status(404).json({ error: "Healthcare provider not found" });
    }
    
    res.json(provider);
  } catch (error) {
    console.error("Error fetching healthcare provider:", error);
    res.status(500).json({ error: "Failed to fetch healthcare provider" });
  }
});

// Create new healthcare provider (signup)
router.post("/healthcare-providers/signup", async (req, res) => {
  try {
    const validatedData = healthcareProviderSchema.parse(req.body);
    
    // Create the healthcare provider
    const provider = await storage.createHealthcareProvider({
      businessName: validatedData.businessName,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone,
      website: validatedData.website || null,
      serviceType: validatedData.serviceType,
      otherServiceType: validatedData.otherServiceType || null,
      description: validatedData.description,
      services: validatedData.services,
      certifications: validatedData.certifications || [],
      insuranceAccepted: validatedData.insuranceAccepted || [],
      serviceAreas: validatedData.serviceAreas,
      states: validatedData.states,
      address: validatedData.address || null,
      city: validatedData.city || null,
      state: validatedData.state || null,
      zipCode: validatedData.zipCode || null,
      coordinates: null, // Will be geocoded later if address is provided
      metadata: validatedData.metadata || {},
    });
    
    res.status(201).json({ 
      success: true, 
      message: "Healthcare provider listing created successfully",
      provider 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: error.errors 
      });
    }
    
    console.error("Error creating healthcare provider:", error);
    res.status(500).json({ error: "Failed to create healthcare provider listing" });
  }
});

// Update healthcare provider
router.patch("/healthcare-providers/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const provider = await storage.updateHealthcareProvider(id, updates);
    
    if (!provider) {
      return res.status(404).json({ error: "Healthcare provider not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Healthcare provider updated successfully",
      provider 
    });
  } catch (error) {
    console.error("Error updating healthcare provider:", error);
    res.status(500).json({ error: "Failed to update healthcare provider" });
  }
});

// Track view count
router.post("/healthcare-providers/:id/view", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.incrementHealthcareProviderView(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error tracking view:", error);
    res.status(500).json({ error: "Failed to track view" });
  }
});

export default router;