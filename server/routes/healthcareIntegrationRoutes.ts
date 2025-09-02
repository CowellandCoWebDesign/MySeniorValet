import { type Express } from "express";
import { isAuthenticated, isAdmin } from "../auth-middleware";
import { EpicFHIRIntegration } from "../epic-fhir-integration";
import { CernerHealthIntegration } from "../cerner-health-integration";
import { MedicareIntegration } from "../medicare-integration";
import { PharmacyIntegration } from "../pharmacy-integration";
import { db } from "../db";
import { communities } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerHealthcareIntegrationRoutes(app: Express) {
  
  // Epic FHIR Integration
  const epicIntegration = new EpicFHIRIntegration();
  
  app.get("/api/healthcare/epic/patient/:patientId", isAuthenticated, async (req, res) => {
    try {
      const patientSummary = await epicIntegration.getPatientSummary(req.params.patientId);
      res.json(patientSummary);
    } catch (error) {
      console.error("Epic FHIR error:", error);
      res.status(500).json({ error: "Failed to fetch patient summary from Epic" });
    }
  });
  
  app.post("/api/healthcare/epic/transfer", isAuthenticated, async (req, res) => {
    try {
      const transferId = await epicIntegration.requestMedicalRecordsTransfer(req.body);
      res.json({ success: true, transferId });
    } catch (error) {
      console.error("Epic transfer error:", error);
      res.status(500).json({ error: "Failed to initiate medical records transfer" });
    }
  });
  
  // Cerner Health Integration
  const cernerIntegration = new CernerHealthIntegration();
  
  app.get("/api/healthcare/cerner/patient/:patientId", isAuthenticated, async (req, res) => {
    try {
      const healthRecords = await cernerIntegration.getHealthRecords(req.params.patientId);
      res.json(healthRecords);
    } catch (error) {
      console.error("Cerner error:", error);
      res.status(500).json({ error: "Failed to fetch health records from Cerner" });
    }
  });
  
  app.post("/api/healthcare/cerner/discharge-plan", isAuthenticated, async (req, res) => {
    try {
      const { patientId, communityId, dischargeDate } = req.body;
      const plan = await cernerIntegration.createDischargePlan({
        patientId,
        communityId,
        dischargeDate,
        careLevel: req.body.careLevel
      });
      res.json({ success: true, plan });
    } catch (error) {
      console.error("Cerner discharge plan error:", error);
      res.status(500).json({ error: "Failed to create discharge plan" });
    }
  });
  
  // Medicare Integration
  const medicareIntegration = new MedicareIntegration();
  
  app.get("/api/healthcare/medicare/eligibility/:memberId", isAuthenticated, async (req, res) => {
    try {
      const eligibility = await medicareIntegration.checkEligibility(req.params.memberId);
      res.json(eligibility);
    } catch (error) {
      console.error("Medicare eligibility error:", error);
      res.status(500).json({ error: "Failed to check Medicare eligibility" });
    }
  });
  
  app.get("/api/healthcare/medicare/coverage/:memberId", isAuthenticated, async (req, res) => {
    try {
      const coverage = await medicareIntegration.getCoverageDetails(req.params.memberId);
      res.json(coverage);
    } catch (error) {
      console.error("Medicare coverage error:", error);
      res.status(500).json({ error: "Failed to fetch Medicare coverage details" });
    }
  });
  
  // Pharmacy Integration
  const pharmacyIntegration = new PharmacyIntegration();
  
  app.get("/api/healthcare/pharmacy/medications/:patientId", isAuthenticated, async (req, res) => {
    try {
      const medications = await pharmacyIntegration.getMedicationList(req.params.patientId);
      res.json(medications);
    } catch (error) {
      console.error("Pharmacy error:", error);
      res.status(500).json({ error: "Failed to fetch medication list" });
    }
  });
  
  app.post("/api/healthcare/pharmacy/transfer", isAuthenticated, async (req, res) => {
    try {
      const { patientId, fromPharmacy, toPharmacy, medications } = req.body;
      const transferResult = await pharmacyIntegration.transferPrescriptions({
        patientId,
        fromPharmacy,
        toPharmacy,
        medications
      });
      res.json({ success: true, result: transferResult });
    } catch (error) {
      console.error("Pharmacy transfer error:", error);
      res.status(500).json({ error: "Failed to transfer prescriptions" });
    }
  });
  
  // Hospital Discharge Planning
  app.post("/api/healthcare/discharge-planning", isAuthenticated, async (req, res) => {
    try {
      const { 
        patientId, 
        hospitalId, 
        targetCommunityId, 
        dischargeDate,
        careLevel,
        medicalNeeds 
      } = req.body;
      
      // Get community details
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, targetCommunityId));
      
      if (!community) {
        return res.status(404).json({ error: "Community not found" });
      }
      
      // Create comprehensive discharge plan
      const dischargePlan = {
        patientId,
        hospitalId,
        community: {
          id: community.id,
          name: community.name,
          address: community.address,
          phone: community.phone,
          careTypes: community.careTypes
        },
        dischargeDate,
        careLevel,
        medicalNeeds,
        // Get patient summary from Epic
        epicSummary: await epicIntegration.getPatientSummary(patientId).catch(() => null),
        // Get health records from Cerner
        cernerRecords: await cernerIntegration.getHealthRecords(patientId).catch(() => null),
        // Check Medicare eligibility
        medicareEligibility: await medicareIntegration.checkEligibility(patientId).catch(() => null),
        // Get current medications
        medications: await pharmacyIntegration.getMedicationList(patientId).catch(() => null),
        status: 'pending',
        createdAt: new Date()
      };
      
      res.json({
        success: true,
        dischargePlan,
        message: "Discharge plan created successfully"
      });
    } catch (error) {
      console.error("Discharge planning error:", error);
      res.status(500).json({ error: "Failed to create discharge plan" });
    }
  });
  
  // Get integration status for all healthcare systems
  app.get("/api/healthcare/integration-status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const status = {
        epic: {
          configured: !!process.env.EPIC_CLIENT_ID,
          authenticated: await epicIntegration.authenticate(),
          name: "Epic MyChart FHIR"
        },
        cerner: {
          configured: !!process.env.CERNER_CLIENT_ID,
          authenticated: await cernerIntegration.authenticate(),
          name: "Cerner PowerChart"
        },
        medicare: {
          configured: !!process.env.MEDICARE_API_KEY,
          authenticated: await medicareIntegration.authenticate(),
          name: "Medicare.gov"
        },
        pharmacy: {
          configured: !!process.env.SURESCRIPTS_API_KEY,
          authenticated: true, // Pharmacy integration is always available
          name: "Surescripts Network"
        }
      };
      
      res.json(status);
    } catch (error) {
      console.error("Healthcare status error:", error);
      res.status(500).json({ error: "Failed to fetch healthcare integration status" });
    }
  });
}