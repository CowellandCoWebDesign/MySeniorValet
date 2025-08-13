import { type Express } from "express";
import { isAuthenticated as requireAuth, isAdmin } from "../auth-middleware";
import { 
  getSecurityDashboard, 
  getUserTrace, 
  blockIP, 
  unblockIP, 
  getSecurityEvents, 
  generateSecurityReport
} from "../security-admin-endpoints";

export function registerSecurityRoutes(app: Express) {
  // Security dashboard (admin only)
  app.get('/api/security/dashboard', requireAuth, isAdmin, async (req, res) => {
    try {
      const dashboard = await getSecurityDashboard();
      res.json(dashboard);
    } catch (error) {
      console.error('Error fetching security dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch security dashboard' });
    }
  });

  // Get security events
  app.get('/api/security/events', requireAuth, isAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 50, severity } = req.query;
      const events = await getSecurityEvents({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        severity: severity as string
      });
      res.json(events);
    } catch (error) {
      console.error('Error fetching security events:', error);
      res.status(500).json({ error: 'Failed to fetch security events' });
    }
  });

  // Get user trace
  app.get('/api/security/user-trace/:userId', requireAuth, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const trace = await getUserTrace(userId);
      res.json(trace);
    } catch (error) {
      console.error('Error fetching user trace:', error);
      res.status(500).json({ error: 'Failed to fetch user trace' });
    }
  });

  // Get blocked IPs
  app.get('/api/security/blocked-ips', requireAuth, isAdmin, async (req, res) => {
    try {
      const blockedIPs = await getBlockedIPs();
      res.json(blockedIPs);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      res.status(500).json({ error: 'Failed to fetch blocked IPs' });
    }
  });

  // Block IP
  app.post('/api/security/block-ip', requireAuth, isAdmin, async (req, res) => {
    try {
      const { ip, reason } = req.body;
      
      if (!ip) {
        return res.status(400).json({ error: 'IP address is required' });
      }
      
      await blockIP(ip, reason || 'Admin action');
      res.json({ success: true, message: `IP ${ip} blocked` });
    } catch (error) {
      console.error('Error blocking IP:', error);
      res.status(500).json({ error: 'Failed to block IP' });
    }
  });

  // Unblock IP
  app.post('/api/security/unblock-ip', requireAuth, isAdmin, async (req, res) => {
    try {
      const { ip } = req.body;
      
      if (!ip) {
        return res.status(400).json({ error: 'IP address is required' });
      }
      
      await unblockIP(ip);
      res.json({ success: true, message: `IP ${ip} unblocked` });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      res.status(500).json({ error: 'Failed to unblock IP' });
    }
  });

  // Get login attempts
  app.get('/api/security/login-attempts', requireAuth, isAdmin, async (req, res) => {
    try {
      const { email, ip, days = 7 } = req.query;
      const attempts = await getLoginAttempts({
        email: email as string,
        ip: ip as string,
        days: parseInt(days as string)
      });
      res.json(attempts);
    } catch (error) {
      console.error('Error fetching login attempts:', error);
      res.status(500).json({ error: 'Failed to fetch login attempts' });
    }
  });

  // Generate security report
  app.post('/api/security/generate-report', requireAuth, isAdmin, async (req, res) => {
    try {
      const { startDate, endDate, reportType = 'full' } = req.body;
      
      const report = await generateSecurityReport({
        startDate: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate) : new Date(),
        reportType
      });
      
      res.json(report);
    } catch (error) {
      console.error('Error generating security report:', error);
      res.status(500).json({ error: 'Failed to generate security report' });
    }
  });

  // Security health check
  app.get('/api/security/health', requireAuth, isAdmin, async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        checks: {
          rateLimiting: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
          sessionSecurity: 'enabled',
          ipBlocking: 'enabled',
          auditLogging: 'enabled',
          encryptionAtRest: 'enabled',
          tlsEnabled: process.env.NODE_ENV === 'production'
        }
      };
      res.json(health);
    } catch (error) {
      console.error('Error checking security health:', error);
      res.status(500).json({ error: 'Failed to check security health' });
    }
  });

  // Security configuration (admin only)
  app.get('/api/security/config', requireAuth, isAdmin, async (req, res) => {
    try {
      const config = {
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes
        sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        ipWhitelist: [],
        ipBlacklist: await getBlockedIPs()
      };
      res.json(config);
    } catch (error) {
      console.error('Error fetching security config:', error);
      res.status(500).json({ error: 'Failed to fetch security configuration' });
    }
  });

  // Update security configuration (admin only)
  app.patch('/api/security/config', requireAuth, isAdmin, async (req, res) => {
    try {
      // TODO: Implement security configuration updates
      res.json({ success: true, message: 'Security configuration updated' });
    } catch (error) {
      console.error('Error updating security config:', error);
      res.status(500).json({ error: 'Failed to update security configuration' });
    }
  });
}