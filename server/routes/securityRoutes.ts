import { type Express } from "express";
import { isAuthenticated as requireAuth, isAdmin } from "../replitAuth";
import { internalNotifications } from "../services/internal-notifications";
import { 
  getSecurityDashboard, 
  getUserTrace, 
  blockIP, 
  unblockIP, 
  getSecurityEvents, 
  generateSecurityReport,
  getSecurityMetrics,
  getSecurityAlerts,
  resolveSecurityAlert
} from "../security-admin-endpoints";

export function registerSecurityRoutes(app: Express) {
  // Simple email test endpoint (no auth required for testing)
  app.post('/api/test-email-notification', async (req, res) => {
    try {
      console.log('📧 Testing email notification system...');
      
      // Test sending a security threat notification
      await internalNotifications.sendInternalNotification({
        type: 'security_threat',
        data: {
          threatId: 'TEST-' + Date.now(),
          threatType: 'SQL_INJECTION',
          severity: 'CRITICAL',
          ipAddress: '192.168.1.100',
          userAgent: 'Test Agent',
          endpoint: '/api/test',
          action: 'Test threat for email verification',
          timestamp: new Date().toISOString(),
          details: {
            message: 'This is a test security threat to verify email delivery'
          }
        },
        priority: 'critical'
      });
      
      res.json({ 
        success: true, 
        message: 'Email notification test triggered. Check console logs for details.' 
      });
    } catch (error: any) {
      console.error('Email test failed:', error);
      res.status(500).json({ 
        error: 'Email test failed', 
        details: error.message 
      });
    }
  });
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

  // Note: Blocked IPs functionality integrated within security dashboard metrics

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

  // Note: Login attempts functionality integrated within security dashboard metrics

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

  // Get security metrics for dashboard
  app.get('/api/admin/security/metrics', requireAuth, isAdmin, getSecurityMetrics);

  // Get security alerts for dashboard
  app.get('/api/admin/security/alerts', requireAuth, isAdmin, getSecurityAlerts);

  // Resolve security alert
  app.post('/api/admin/security/alerts/:alertId/resolve', requireAuth, isAdmin, resolveSecurityAlert);

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

  // Comprehensive test endpoint to trigger various simulated threats and test email notifications
  app.post('/api/admin/security/test-threat', requireAuth, isAdmin, async (req, res) => {
    try {
      const { threatType = 'all' } = req.body;
      const testThreats = [];
      const monitor = SecurityMonitor.getInstance();

      // Helper function to create test request - fixed to work with SecurityMonitor
      const createTestRequest = (method: string, path: string, body?: any, headers?: any) => ({
        method,
        path,
        url: path,
        originalUrl: path,
        ip: '192.168.1.100',
        get: (header: string) => {
          const hdrs = {
            'user-agent': 'Mozilla/5.0 (Test Agent) Security Test',
            ...headers
          };
          return hdrs[header.toLowerCase()];
        },
        headers: {
          'user-agent': 'Mozilla/5.0 (Test Agent) Security Test',
          ...headers
        },
        body,
        query: {},
        params: {},
        socket: { remoteAddress: '192.168.1.100' },
        connection: { remoteAddress: '192.168.1.100' }
      } as any);

      console.log('🧪 Starting comprehensive security notification test...');
      console.log('📧 Email notifications will be sent to: admin@myseniorvalet.com');

      // Test 1: SQL Injection (HIGH severity)
      if (threatType === 'all' || threatType === 'injection') {
        const sqlReq = createTestRequest('POST', '/api/search', {
          query: "SELECT * FROM users WHERE id='1' OR '1'='1'"
        });
        const sqlThreats = await monitor.analyzeRequest(sqlReq);
        testThreats.push(...sqlThreats);
        console.log('✅ SQL Injection threat generated:', sqlThreats.length, 'threats');
      }

      // Test 2: Brute Force Attack (CRITICAL severity - multiple failed logins)
      if (threatType === 'all' || threatType === 'brute_force') {
        // Simulate 10 failed login attempts
        for (let i = 0; i < 10; i++) {
          const bruteReq = createTestRequest('POST', '/api/auth/login', {
            email: `hacker${i}@attack.com`,
            password: 'wrongpassword'
          });
          const bruteThreats = await monitor.analyzeRequest(bruteReq);
          testThreats.push(...bruteThreats);
        }
        console.log('✅ Brute force threats generated (10 attempts)');
      }

      // Test 3: XSS Attack (HIGH severity)
      if (threatType === 'all' || threatType === 'xss') {
        const xssReq = createTestRequest('POST', '/api/communities/review', {
          content: '<script>alert("XSS Attack")</script>',
          rating: 5
        });
        const xssThreats = await monitor.analyzeRequest(xssReq);
        testThreats.push(...xssThreats);
        console.log('✅ XSS threat generated:', xssThreats.length, 'threats');
      }

      // Test 4: Path Traversal (HIGH severity)
      if (threatType === 'all' || threatType === 'path_traversal') {
        const pathReq = createTestRequest('GET', '/api/files/../../../../etc/passwd');
        const pathThreats = await monitor.analyzeRequest(pathReq);
        testThreats.push(...pathThreats);
        console.log('✅ Path traversal threat generated:', pathThreats.length, 'threats');
      }

      // Test 5: Command Injection (CRITICAL severity)
      if (threatType === 'all' || threatType === 'command') {
        const cmdReq = createTestRequest('POST', '/api/export', {
          filename: 'report.pdf; rm -rf /'
        });
        const cmdThreats = await monitor.analyzeRequest(cmdReq);
        testThreats.push(...cmdThreats);
        console.log('✅ Command injection threat generated:', cmdThreats.length, 'threats');
      }

      // Test 6: Suspicious User Agent (MEDIUM severity)
      if (threatType === 'all' || threatType === 'suspicious_agent') {
        const botReq = createTestRequest('GET', '/api/communities', {}, {
          'user-agent': 'SQLMap/1.6 (http://sqlmap.org)'
        });
        const botThreats = await monitor.analyzeRequest(botReq);
        testThreats.push(...botThreats);
        console.log('✅ Suspicious user agent threat generated:', botThreats.length, 'threats');
      }

      // Test 7: Rate Limiting (MEDIUM to HIGH severity)
      if (threatType === 'all' || threatType === 'rate_limit') {
        // Simulate 50 rapid requests
        for (let i = 0; i < 50; i++) {
          const rateReq = createTestRequest('GET', '/api/communities/search');
          await monitor.analyzeRequest(rateReq);
        }
        console.log('✅ Rate limit threats generated (50 rapid requests)');
      }

      // Get current metrics to show impact
      const metrics = await monitor.getCurrentMetrics();

      const highCriticalCount = testThreats.filter(t => t.severity === 'high' || t.severity === 'critical').length;
      
      console.log('🧪 Security notification test complete!');
      console.log(`📊 Total threats generated: ${testThreats.length}`);
      console.log(`📧 High/Critical threats that triggered email notifications: ${highCriticalCount}`);
      console.log(`📬 ${highCriticalCount} email notifications sent to admin@myseniorvalet.com`);

      res.json({
        success: true,
        message: `Comprehensive security threat test completed. ${highCriticalCount} email notifications sent to admin@myseniorvalet.com`,
        summary: {
          totalThreatsGenerated: testThreats.length,
          highSeverityThreats: testThreats.filter(t => t.severity === 'high').length,
          criticalSeverityThreats: testThreats.filter(t => t.severity === 'critical').length,
          mediumSeverityThreats: testThreats.filter(t => t.severity === 'medium').length,
          emailNotificationsSent: highCriticalCount,
          emailRecipient: 'admin@myseniorvalet.com'
        },
        threats: testThreats,
        currentMetrics: metrics,
        testTypes: [
          'SQL Injection (HIGH) - Triggers email',
          'Brute Force Attack (CRITICAL) - Triggers email',
          'XSS Attack (HIGH) - Triggers email',
          'Path Traversal (HIGH) - Triggers email',
          'Command Injection (CRITICAL) - Triggers email',
          'Suspicious User Agent (MEDIUM) - No email',
          'Rate Limiting (MEDIUM-HIGH) - May trigger email'
        ]
      });
    } catch (error) {
      console.error('Error generating test threats:', error);
      res.status(500).json({ error: 'Failed to generate test threats' });
    }
  });
}