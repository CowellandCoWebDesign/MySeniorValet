import { Router } from "express";
import { maintenanceMode } from "../maintenance-mode-service";
import { isAuthenticated, isAdmin } from "../replitAuth";

const router = Router();

// Get maintenance mode status (public endpoint)
router.get("/api/maintenance/status", async (req, res) => {
  try {
    const status = maintenanceMode.getStatus();
    res.json(status);
  } catch (error) {
    console.error("Failed to get maintenance status:", error);
    res.status(500).json({ error: "Failed to get maintenance status" });
  }
});

// Enable maintenance mode (admin only)
router.post("/api/maintenance/enable", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { message, expectedDuration, scheduledEnd } = req.body;
    await maintenanceMode.enable(
      message,
      expectedDuration,
      scheduledEnd ? new Date(scheduledEnd) : undefined
    );
    res.json({ success: true, message: "Maintenance mode enabled" });
  } catch (error) {
    console.error("Failed to enable maintenance mode:", error);
    res.status(500).json({ error: "Failed to enable maintenance mode" });
  }
});

// Disable maintenance mode (admin only)
router.post("/api/maintenance/disable", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await maintenanceMode.disable();
    res.json({ success: true, message: "Maintenance mode disabled" });
  } catch (error) {
    console.error("Failed to disable maintenance mode:", error);
    res.status(500).json({ error: "Failed to disable maintenance mode" });
  }
});

// Manage allowed IPs (admin only)
router.post("/api/maintenance/allowed-ip", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { ip, action } = req.body;
    
    if (!ip) {
      return res.status(400).json({ error: "IP address is required" });
    }

    if (action === "add") {
      await maintenanceMode.addAllowedIP(ip);
      res.json({ success: true, message: `IP ${ip} added to allowlist` });
    } else if (action === "remove") {
      await maintenanceMode.removeAllowedIP(ip);
      res.json({ success: true, message: `IP ${ip} removed from allowlist` });
    } else {
      res.status(400).json({ error: "Invalid action. Use 'add' or 'remove'" });
    }
  } catch (error) {
    console.error("Failed to manage allowed IP:", error);
    res.status(500).json({ error: "Failed to manage allowed IP" });
  }
});

// Manage allowed emails (admin only)
router.post("/api/maintenance/allowed-email", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { email, action } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }

    if (action === "add") {
      await maintenanceMode.addAllowedEmail(email);
      res.json({ success: true, message: `Email ${email} added to allowlist` });
    } else if (action === "remove") {
      await maintenanceMode.removeAllowedEmail(email);
      res.json({ success: true, message: `Email ${email} removed from allowlist` });
    } else {
      res.status(400).json({ error: "Invalid action. Use 'add' or 'remove'" });
    }
  } catch (error) {
    console.error("Failed to manage allowed email:", error);
    res.status(500).json({ error: "Failed to manage allowed email" });
  }
});

// Update maintenance message (admin only)
router.post("/api/maintenance/message", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    await maintenanceMode.updateMessage(message);
    res.json({ success: true, message: "Maintenance message updated" });
  } catch (error) {
    console.error("Failed to update maintenance message:", error);
    res.status(500).json({ error: "Failed to update maintenance message" });
  }
});

// Schedule maintenance (admin only)
router.post("/api/maintenance/schedule", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, message } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates are required" });
    }

    await maintenanceMode.scheduleMaintenance(
      new Date(startDate),
      new Date(endDate),
      message
    );
    
    res.json({ 
      success: true, 
      message: `Maintenance scheduled from ${startDate} to ${endDate}` 
    });
  } catch (error) {
    console.error("Failed to schedule maintenance:", error);
    res.status(500).json({ error: "Failed to schedule maintenance" });
  }
});

export function registerMaintenanceRoutes(app: Router): void {
  app.use(router);
}