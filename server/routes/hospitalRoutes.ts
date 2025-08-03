import type { Express } from "express";
import { hospitalDataService } from "../services/hospital-data-service";

export function registerHospitalRoutes(app: Express) {
  // Get all hospitals with filtering
  app.get("/api/hospitals", async (req, res) => {
    try {
      const {
        state,
        county,
        hospitalType,
        emergencyServices,
        traumaLevel,
        limit = "50",
        offset = "0"
      } = req.query;

      const filters = {
        state: state as string,
        county: county as string,
        hospitalType: hospitalType as string,
        emergencyServices: emergencyServices === "true" ? true : emergencyServices === "false" ? false : undefined,
        traumaLevel: traumaLevel as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const hospitals = await hospitalDataService.getAllHospitals(filters);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  });

  // Get featured hospitals (top 30 for sliders)
  app.get("/api/hospitals/featured", async (req, res) => {
    try {
      // Add caching headers for better performance
      res.set({
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'ETag': `hospitals-featured-${Date.now()}`
      });
      
      const limit = parseInt(req.query.limit as string) || 30;
      const hospitals = await hospitalDataService.getFeaturedHospitals(limit);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching featured hospitals:", error);
      res.status(500).json({ error: "Failed to fetch featured hospitals" });
    }
  });

  // Get hospitals by state
  app.get("/api/hospitals/by-state/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const hospitals = await hospitalDataService.getHospitalsByState(state, limit);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching hospitals by state:", error);
      res.status(500).json({ error: "Failed to fetch hospitals by state" });
    }
  });

  // Get hospitals by county
  app.get("/api/hospitals/by-county/:state/:county", async (req, res) => {
    try {
      const { state, county } = req.params;
      const hospitals = await hospitalDataService.getHospitalsByCounty(state, county);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching hospitals by county:", error);
      res.status(500).json({ error: "Failed to fetch hospitals by county" });
    }
  });

  // Get hospital by slug for details page
  app.get("/api/hospitals/by-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const hospital = await hospitalDataService.getHospitalBySlug(slug);
      
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }
      
      res.json(hospital);
    } catch (error) {
      console.error("Error fetching hospital by slug:", error);
      res.status(500).json({ error: "Failed to fetch hospital" });
    }
  });

  // Search hospitals
  app.get("/api/hospitals/search", async (req, res) => {
    try {
      const { q, state, hospitalType, emergencyServices, limit = "50" } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const filters = {
        state: state as string,
        hospitalType: hospitalType as string,
        emergencyServices: emergencyServices === "true" ? true : emergencyServices === "false" ? false : undefined,
        limit: parseInt(limit as string)
      };

      const hospitals = await hospitalDataService.searchHospitals(q as string, filters);
      res.json(hospitals);
    } catch (error) {
      console.error("Error searching hospitals:", error);
      res.status(500).json({ error: "Failed to search hospitals" });
    }
  });

  // Get hospital by ID with full details
  app.get("/api/hospitals/:id", async (req, res) => {
    try {
      const hospitalId = parseInt(req.params.id);
      const hospital = await hospitalDataService.getHospitalById(hospitalId);
      
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      res.json(hospital);
    } catch (error) {
      console.error("Error fetching hospital:", error);
      res.status(500).json({ error: "Failed to fetch hospital" });
    }
  });

  // Get hospital statistics
  app.get("/api/hospitals/analytics/stats", async (req, res) => {
    try {
      const stats = await hospitalDataService.getHospitalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching hospital stats:", error);
      res.status(500).json({ error: "Failed to fetch hospital statistics" });
    }
  });

  // Get hospitals by specialty
  app.get("/api/hospitals/specialty/:specialty", async (req, res) => {
    try {
      const { specialty } = req.params;
      const limit = parseInt(req.query.limit as string) || 25;
      const hospitals = await hospitalDataService.getHospitalsBySpecialty(specialty, limit);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching hospitals by specialty:", error);
      res.status(500).json({ error: "Failed to fetch hospitals by specialty" });
    }
  });

  // Get trauma centers
  app.get("/api/hospitals/trauma-centers", async (req, res) => {
    try {
      const { level } = req.query;
      const hospitals = await hospitalDataService.getTraumaCenters(level as string);
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching trauma centers:", error);
      res.status(500).json({ error: "Failed to fetch trauma centers" });
    }
  });

  // Get children's hospitals
  app.get("/api/hospitals/childrens", async (req, res) => {
    try {
      const hospitals = await hospitalDataService.getChildrensHospitals();
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching children's hospitals:", error);
      res.status(500).json({ error: "Failed to fetch children's hospitals" });
    }
  });

  // Get veterans hospitals
  app.get("/api/hospitals/veterans", async (req, res) => {
    try {
      const hospitals = await hospitalDataService.getVeteransHospitals();
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching veterans hospitals:", error);
      res.status(500).json({ error: "Failed to fetch veterans hospitals" });
    }
  });

  // Get states with hospital counts
  app.get("/api/hospitals/coverage/states", async (req, res) => {
    try {
      const states = await hospitalDataService.getStatesWithHospitalCounts();
      res.json(states);
    } catch (error) {
      console.error("Error fetching states:", error);
      res.status(500).json({ error: "Failed to fetch states" });
    }
  });

  // Get counties by state
  app.get("/api/hospitals/coverage/counties/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const counties = await hospitalDataService.getCountiesByState(state);
      res.json(counties);
    } catch (error) {
      console.error("Error fetching counties:", error);
      res.status(500).json({ error: "Failed to fetch counties" });
    }
  });
}