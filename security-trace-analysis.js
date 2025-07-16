/**
 * Security Trace Analysis Script
 * Comprehensive console data analysis and injection attack detection
 * for MySeniorValet platform security monitoring
 */

import fs from 'fs';
import path from 'path';

// Security patterns to detect potential injection attacks
const INJECTION_PATTERNS = {
  sql: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|EXEC|EXECUTE)\b)/i,
    /(';|";|--|\/\*|\*\/|xp_|sp_)/i,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i
  ],
  xss: [
    /(<script|<\/script>|javascript:|vbscript:|onload=|onerror=|eval\(|setTimeout\()/i,
    /(\balert\(|\bconfirm\(|\bprompt\()/i,
    /(<iframe|<object|<embed|<applet)/i
  ],
  command: [
    /(\||;|&|`|\$\(|exec|system|shell_exec|passthru)/i,
    /(\bcat\b|\bls\b|\bpwd\b|\bwhoami\b|\bps\b|\bkill\b)/i,
    /(\brm\b|\bmv\b|\bcp\b|\bchmod\b|\bchown\b)/i
  ],
  nosql: [
    /(\$where|\$ne|\$in|\$nin|\$or|\$and|\$not|\$nor|\$exists|\$type|\$mod|\$regex|\$text|\$search)/i,
    /(\$gt|\$gte|\$lt|\$lte|\$eq|\$ne)/i
  ],
  ldap: [
    /(\*\)|&\(|\|\(|\)|\(cn=|\(uid=|\(mail=)/i,
    /(\(objectClass=|\(memberOf=|\(samAccountName=)/i
  ]
};

// Threat severity levels
const THREAT_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

class SecurityTraceAnalyzer {
  constructor() {
    this.detectedThreats = [];
    this.userSessions = new Map();
    this.ipAnalysis = new Map();
    this.startTime = new Date();
  }

  // Analyze console logs for security threats
  analyzeConsoleData(logData) {
    const threats = [];
    
    // Check for injection patterns
    for (const [type, patterns] of Object.entries(INJECTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(logData)) {
          threats.push({
            type: `${type}_injection`,
            severity: this.calculateSeverity(type, logData),
            pattern: pattern.source,
            timestamp: new Date().toISOString(),
            evidence: logData.substring(0, 200)
          });
        }
      }
    }
    
    return threats;
  }

  // Calculate threat severity based on type and context
  calculateSeverity(type, content) {
    const contentLower = content.toLowerCase();
    
    // Critical threats
    if (type === 'sql' && (contentLower.includes('drop') || contentLower.includes('delete'))) {
      return THREAT_LEVELS.CRITICAL;
    }
    
    if (type === 'xss' && contentLower.includes('script')) {
      return THREAT_LEVELS.CRITICAL;
    }
    
    if (type === 'command' && (contentLower.includes('rm') || contentLower.includes('kill'))) {
      return THREAT_LEVELS.CRITICAL;
    }
    
    // High threats
    if (type === 'sql' || type === 'nosql') {
      return THREAT_LEVELS.HIGH;
    }
    
    // Medium threats
    if (type === 'xss' || type === 'ldap') {
      return THREAT_LEVELS.MEDIUM;
    }
    
    return THREAT_LEVELS.LOW;
  }

  // Analyze IP address patterns
  analyzeIPActivity(ipAddress, userAgent, endpoint, method) {
    if (!this.ipAnalysis.has(ipAddress)) {
      this.ipAnalysis.set(ipAddress, {
        requestCount: 0,
        endpoints: new Set(),
        userAgents: new Set(),
        methods: new Set(),
        firstSeen: new Date(),
        lastSeen: new Date(),
        suspicious: false
      });
    }
    
    const ipData = this.ipAnalysis.get(ipAddress);
    ipData.requestCount++;
    ipData.endpoints.add(endpoint);
    ipData.userAgents.add(userAgent);
    ipData.methods.add(method);
    ipData.lastSeen = new Date();
    
    // Check for suspicious patterns
    if (ipData.requestCount > 100) {
      ipData.suspicious = true;
      this.detectedThreats.push({
        type: 'brute_force',
        severity: THREAT_LEVELS.HIGH,
        ipAddress,
        evidence: `${ipData.requestCount} requests from single IP`,
        timestamp: new Date().toISOString()
      });
    }
    
    if (ipData.userAgents.size > 5) {
      ipData.suspicious = true;
      this.detectedThreats.push({
        type: 'user_agent_rotation',
        severity: THREAT_LEVELS.MEDIUM,
        ipAddress,
        evidence: `${ipData.userAgents.size} different user agents`,
        timestamp: new Date().toISOString()
      });
    }
    
    return ipData;
  }

  // Analyze user agent for bot detection
  analyzeUserAgent(userAgent) {
    const suspiciousPatterns = [
      /bot|crawler|spider|scraper/i,
      /curl|wget|postman|insomnia/i,
      /python|java|perl|php|ruby/i,
      /scanner|hack|exploit|injection/i,
      /^.{0,10}$/, // Too short
      /^.{200,}$/ // Too long
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        return {
          suspicious: true,
          reason: `Matches pattern: ${pattern.source}`,
          severity: THREAT_LEVELS.LOW
        };
      }
    }
    
    return { suspicious: false };
  }

  // Generate comprehensive security report
  generateSecurityReport() {
    const report = {
      timestamp: new Date().toISOString(),
      analysisWindow: {
        start: this.startTime.toISOString(),
        duration: Date.now() - this.startTime.getTime()
      },
      summary: {
        totalThreats: this.detectedThreats.length,
        criticalThreats: this.detectedThreats.filter(t => t.severity === THREAT_LEVELS.CRITICAL).length,
        highThreats: this.detectedThreats.filter(t => t.severity === THREAT_LEVELS.HIGH).length,
        mediumThreats: this.detectedThreats.filter(t => t.severity === THREAT_LEVELS.MEDIUM).length,
        lowThreats: this.detectedThreats.filter(t => t.severity === THREAT_LEVELS.LOW).length,
        uniqueIPs: this.ipAnalysis.size,
        suspiciousIPs: Array.from(this.ipAnalysis.values()).filter(ip => ip.suspicious).length
      },
      threatsByType: this.groupThreatsByType(),
      ipAnalysis: this.generateIPReport(),
      recommendations: this.generateRecommendations(),
      detectedThreats: this.detectedThreats.slice(-20) // Latest 20 threats
    };
    
    return report;
  }

  // Group threats by type for analysis
  groupThreatsByType() {
    const grouped = {};
    this.detectedThreats.forEach(threat => {
      if (!grouped[threat.type]) {
        grouped[threat.type] = [];
      }
      grouped[threat.type].push(threat);
    });
    return grouped;
  }

  // Generate IP analysis report
  generateIPReport() {
    const report = [];
    for (const [ip, data] of this.ipAnalysis.entries()) {
      report.push({
        ipAddress: ip,
        requestCount: data.requestCount,
        endpointCount: data.endpoints.size,
        userAgentCount: data.userAgents.size,
        methodCount: data.methods.size,
        suspicious: data.suspicious,
        firstSeen: data.firstSeen.toISOString(),
        lastSeen: data.lastSeen.toISOString(),
        riskScore: this.calculateIPRiskScore(data)
      });
    }
    return report.sort((a, b) => b.riskScore - a.riskScore);
  }

  // Calculate risk score for IP address
  calculateIPRiskScore(ipData) {
    let score = 0;
    
    // High request volume
    if (ipData.requestCount > 1000) score += 50;
    else if (ipData.requestCount > 500) score += 30;
    else if (ipData.requestCount > 100) score += 20;
    
    // Multiple user agents (rotation)
    if (ipData.userAgents.size > 10) score += 40;
    else if (ipData.userAgents.size > 5) score += 20;
    
    // Multiple endpoints
    if (ipData.endpoints.size > 50) score += 30;
    else if (ipData.endpoints.size > 20) score += 15;
    
    // Suspicious flag
    if (ipData.suspicious) score += 30;
    
    return Math.min(score, 100);
  }

  // Generate security recommendations
  generateRecommendations() {
    const recommendations = [];
    
    if (this.detectedThreats.some(t => t.severity === THREAT_LEVELS.CRITICAL)) {
      recommendations.push({
        priority: 'IMMEDIATE',
        action: 'Block IPs with critical threats detected',
        reason: 'Critical injection attempts or destructive commands detected'
      });
    }
    
    if (this.detectedThreats.filter(t => t.severity === THREAT_LEVELS.HIGH).length > 10) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Implement additional input validation',
        reason: 'High number of injection attempts detected'
      });
    }
    
    const suspiciousIPs = Array.from(this.ipAnalysis.values()).filter(ip => ip.suspicious);
    if (suspiciousIPs.length > 5) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'Review rate limiting configuration',
        reason: `${suspiciousIPs.length} IPs showing suspicious behavior`
      });
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'INFO',
        action: 'Continue monitoring',
        reason: 'No immediate threats detected'
      });
    }
    
    return recommendations;
  }

  // Save analysis to file
  saveAnalysis(filename = 'security-analysis.json') {
    const report = this.generateSecurityReport();
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`Security analysis saved to ${filename}`);
    return report;
  }
}

// Main execution
function runSecurityAnalysis() {
  console.log('🔍 Starting MySeniorValet Security Trace Analysis...');
  
  const analyzer = new SecurityTraceAnalyzer();
  
  // Simulate current user activity analysis
  const mockConsoleData = [
    'GET /api/communities/trending 200 in 4ms',
    'Security Log: { ip: "127.0.0.1", method: "GET", path: "/api/admin/security/dashboard" }',
    'Research data not available, using existing pricing',
    'Trending communities loaded in 0ms'
  ];
  
  // Simulate suspicious activity
  const suspiciousData = [
    'POST /api/auth/login { username: "admin", password: "admin\' OR 1=1--" }',
    'GET /api/communities/search?q=<script>alert(1)</script>',
    'POST /api/communities { name: "Test"; DROP TABLE users; --" }'
  ];
  
  // Analyze console data
  mockConsoleData.forEach(data => {
    const threats = analyzer.analyzeConsoleData(data);
    analyzer.detectedThreats.push(...threats);
  });
  
  // Analyze suspicious patterns
  suspiciousData.forEach(data => {
    const threats = analyzer.analyzeConsoleData(data);
    analyzer.detectedThreats.push(...threats);
  });
  
  // Analyze IP activity
  analyzer.analyzeIPActivity('127.0.0.1', 'curl/8.14.1', '/api/admin/security/dashboard', 'GET');
  analyzer.analyzeIPActivity('192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '/api/communities/search', 'GET');
  analyzer.analyzeIPActivity('10.0.0.1', 'python-requests/2.28.1', '/api/auth/login', 'POST');
  
  // Generate and save analysis
  const report = analyzer.saveAnalysis();
  
  console.log('\n📊 SECURITY ANALYSIS COMPLETE');
  console.log('============================');
  console.log(`Total Threats Detected: ${report.summary.totalThreats}`);
  console.log(`Critical: ${report.summary.criticalThreats}`);
  console.log(`High: ${report.summary.highThreats}`);
  console.log(`Medium: ${report.summary.mediumThreats}`);
  console.log(`Low: ${report.summary.lowThreats}`);
  console.log(`Unique IPs: ${report.summary.uniqueIPs}`);
  console.log(`Suspicious IPs: ${report.summary.suspiciousIPs}`);
  
  console.log('\n🔧 RECOMMENDATIONS:');
  report.recommendations.forEach(rec => {
    console.log(`${rec.priority}: ${rec.action} - ${rec.reason}`);
  });
  
  console.log('\n📋 RECENT THREATS:');
  report.detectedThreats.slice(-5).forEach(threat => {
    console.log(`${threat.severity}: ${threat.type} - ${threat.evidence?.substring(0, 50)}...`);
  });
  
  return report;
}

// Run analysis if this file is executed directly
runSecurityAnalysis();

export {
  SecurityTraceAnalyzer,
  runSecurityAnalysis,
  INJECTION_PATTERNS,
  THREAT_LEVELS
};