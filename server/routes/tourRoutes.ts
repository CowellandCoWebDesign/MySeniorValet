import { type Express } from "express";
import { db } from "../db";
import { tours, communities } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { isAuthenticated as requireAuth } from "../replitAuth";
import { createTourSchema } from "@shared/schema";
import { storage } from "../storage";
import { z } from "zod";

export function registerTourRoutes(app: Express) {
  // Get user's tours
  app.get("/api/tours", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userTours = await storage.getToursByUser(userId);
      res.json(userTours);
    } catch (error) {
      console.error("Error fetching tours:", error);
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  // Create a new tour
  app.post("/api/tours", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const validatedData = createTourSchema.parse(req.body);
      
      const tourData = {
        ...validatedData,
        userId,
        status: 'scheduled' as const,
        notes: validatedData.notes || '',
      };

      const newTour = await storage.createTour(tourData);
      res.status(201).json(newTour);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tour data", errors: error.errors });
      }
      console.error("Error creating tour:", error);
      res.status(500).json({ message: "Failed to create tour" });
    }
  });

  // Get single tour
  app.get("/api/tours/:tourId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const tourId = parseInt(req.params.tourId);
      
      // Get tour and verify it belongs to user
      const userTours = await storage.getToursByUser(userId);
      const tour = userTours.find(t => t.id === tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      res.json(tour);
    } catch (error) {
      console.error("Error fetching tour:", error);
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  // Update tour
  app.put("/api/tours/:tourId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const tourId = parseInt(req.params.tourId);
      const updates = req.body;
      
      // Verify tour belongs to user
      const existingTours = await storage.getToursByUser(userId);
      const tour = existingTours.find(t => t.id === tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const updatedTour = await storage.updateTour(tourId, updates);
      res.json(updatedTour);
    } catch (error) {
      console.error("Error updating tour:", error);
      res.status(500).json({ message: "Failed to update tour" });
    }
  });

  // Cancel tour
  app.delete("/api/tours/:tourId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const tourId = parseInt(req.params.tourId);
      
      // Verify tour belongs to user
      const existingTours = await storage.getToursByUser(userId);
      const tour = existingTours.find(t => t.id === tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const cancelled = await storage.cancelTour(tourId);
      
      if (cancelled) {
        res.json({ success: true });
      } else {
        res.status(500).json({ message: "Failed to cancel tour" });
      }
    } catch (error) {
      console.error("Error cancelling tour:", error);
      res.status(500).json({ message: "Failed to cancel tour" });
    }
  });

  // Reschedule tour
  app.patch("/api/tours/:tourId/reschedule", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const tourId = parseInt(req.params.tourId);
      const { tourDate, tourTime } = req.body;
      
      if (!tourDate || !tourTime) {
        return res.status(400).json({ message: "Tour date and time are required" });
      }
      
      // Verify tour belongs to user
      const existingTours = await storage.getToursByUser(userId);
      const tour = existingTours.find(t => t.id === tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const updatedTour = await storage.updateTour(tourId, { 
        tourDate, 
        tourTime,
        status: 'scheduled'
      });
      
      res.json(updatedTour);
    } catch (error) {
      console.error("Error rescheduling tour:", error);
      res.status(500).json({ message: "Failed to reschedule tour" });
    }
  });

  // Complete tour
  app.patch("/api/tours/:tourId/complete", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const tourId = parseInt(req.params.tourId);
      const { feedback, rating, wouldRecommend } = req.body;
      
      // Verify tour belongs to user
      const existingTours = await storage.getToursByUser(userId);
      const tour = existingTours.find(t => t.id === tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const updatedTour = await storage.updateTour(tourId, { 
        status: 'completed',
        feedback,
        rating,
        wouldRecommend,
        completedAt: new Date()
      });
      
      res.json(updatedTour);
    } catch (error) {
      console.error("Error completing tour:", error);
      res.status(500).json({ message: "Failed to complete tour" });
    }
  });

  // Get tour statistics
  app.get("/api/tours/stats", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userTours = await storage.getToursByUser(userId);
      
      const stats = {
        total: userTours.length,
        scheduled: userTours.filter(t => t.status === 'scheduled').length,
        completed: userTours.filter(t => t.status === 'completed').length,
        cancelled: userTours.filter(t => t.status === 'cancelled').length,
        upcoming: userTours.filter(t => 
          t.status === 'scheduled' && 
          new Date(t.tourDate) >= new Date()
        ).length,
        past: userTours.filter(t => 
          t.status === 'scheduled' && 
          new Date(t.tourDate) < new Date()
        ).length
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching tour stats:", error);
      res.status(500).json({ message: "Failed to fetch tour statistics" });
    }
  });

  // Get upcoming tours
  app.get("/api/tours/upcoming", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const userTours = await storage.getToursByUser(userId);
      
      const upcomingTours = userTours
        .filter(t => 
          t.status === 'scheduled' && 
          new Date(t.tourDate) >= new Date()
        )
        .sort((a, b) => 
          new Date(a.tourDate).getTime() - new Date(b.tourDate).getTime()
        );

      res.json(upcomingTours);
    } catch (error) {
      console.error("Error fetching upcoming tours:", error);
      res.status(500).json({ message: "Failed to fetch upcoming tours" });
    }
  });

  // Share tour with family member
  app.post("/api/tours/:tourId/share", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const tourId = parseInt(req.params.tourId);
      const { email, message } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Verify tour belongs to user
      const existingTours = await storage.getToursByUser(userId);
      const tour = existingTours.find(t => t.id === tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      // TODO: Implement actual email sending
      // For now, just return success
      res.json({ 
        success: true, 
        message: `Tour details shared with ${email}` 
      });
    } catch (error) {
      console.error("Error sharing tour:", error);
      res.status(500).json({ message: "Failed to share tour" });
    }
  });
}