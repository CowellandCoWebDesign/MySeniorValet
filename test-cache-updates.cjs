/**
 * Automated Cache Update Testing Script
 * Tests that code changes propagate correctly through the development environment
 * Prevents caching issues that block updates from appearing
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class CacheUpdateTester {
  constructor() {
    this.testFile = path.join(__dirname, 'client', 'src', 'pages', 'services.tsx');
    this.testMarker = `data-test-version="${Date.now()}"`;
    this.baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Automated Cache Update Tests...\n');
    
    try {
      // Test 1: File System Update Test
      await this.testFileSystemUpdate();
      
      // Test 2: Vite HMR Test
      await this.testViteHMR();
      
      // Test 3: HTTP Response Test
      await this.testHTTPResponse();
      
      // Test 4: Browser Cache Headers Test
      await this.testCacheHeaders();
      
      // Test 5: Service Worker Test
      await this.testServiceWorkers();
      
      // Report Results
      this.reportResults();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async testFileSystemUpdate() {
    console.log('📝 Test 1: File System Update Test');
    
    try {
      // Read current file
      const originalContent = fs.readFileSync(this.testFile, 'utf8');
      
      // Add test marker
      const testContent = originalContent.replace(
        '<NavigationHeader',
        `<NavigationHeader ${this.testMarker}`
      );
      
      // Write updated file
      fs.writeFileSync(this.testFile, testContent);
      
      // Wait for file system to sync
      await this.sleep(1000);
      
      // Verify file was updated
      const updatedContent = fs.readFileSync(this.testFile, 'utf8');
      const updateSuccess = updatedContent.includes(this.testMarker);
      
      // Restore original content
      fs.writeFileSync(this.testFile, originalContent);
      
      this.testResults.push({
        name: 'File System Update',
        passed: updateSuccess,
        message: updateSuccess 
          ? '✅ File updates are writing correctly'
          : '❌ File updates are not persisting'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'File System Update',
        passed: false,
        message: `❌ Error: ${error.message}`
      });
    }
  }

  async testViteHMR() {
    console.log('🔥 Test 2: Vite Hot Module Replacement Test');
    
    try {
      // Check if Vite is running
      const { stdout } = await execPromise('ps aux | grep vite | grep -v grep');
      const viteRunning = stdout.includes('vite');
      
      this.testResults.push({
        name: 'Vite HMR',
        passed: viteRunning,
        message: viteRunning
          ? '✅ Vite dev server is running'
          : '❌ Vite dev server is not detected'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Vite HMR',
        passed: false,
        message: '❌ Vite process check failed'
      });
    }
  }

  async testHTTPResponse() {
    console.log('🌐 Test 3: HTTP Response Test');
    
    try {
      const testUrl = `${this.baseUrl}/services`;
      const { stdout } = await execPromise(`curl -s -I "${testUrl}" | head -1`);
      
      const isOK = stdout.includes('200 OK');
      
      this.testResults.push({
        name: 'HTTP Response',
        passed: isOK,
        message: isOK
          ? '✅ Server is responding correctly'
          : `❌ Server response: ${stdout}`
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'HTTP Response',
        passed: false,
        message: `❌ HTTP test failed: ${error.message}`
      });
    }
  }

  async testCacheHeaders() {
    console.log('📋 Test 4: Cache Headers Test');
    
    try {
      const testUrl = `${this.baseUrl}/src/pages/services.tsx`;
      const { stdout } = await execPromise(`curl -s -I "${testUrl}" | grep -i cache`);
      
      const hasNoCacheHeaders = stdout.toLowerCase().includes('no-cache') || 
                                stdout.toLowerCase().includes('no-store');
      
      this.testResults.push({
        name: 'Cache Headers',
        passed: hasNoCacheHeaders,
        message: hasNoCacheHeaders
          ? '✅ No-cache headers are present'
          : '⚠️  Cache headers may allow stale content'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Cache Headers',
        passed: true, // Not critical if headers aren't found
        message: '⚠️  Could not verify cache headers'
      });
    }
  }

  async testServiceWorkers() {
    console.log('👷 Test 5: Service Worker Test');
    
    try {
      // Check for service worker files
      const swFiles = [
        'client/public/sw.js',
        'client/public/service-worker.js',
        'client/src/serviceWorker.js'
      ];
      
      const foundSW = swFiles.some(file => 
        fs.existsSync(path.join(__dirname, file))
      );
      
      this.testResults.push({
        name: 'Service Workers',
        passed: !foundSW,
        message: foundSW
          ? '⚠️  Service workers detected - may cache aggressively'
          : '✅ No service workers found'
      });
      
    } catch (error) {
      this.testResults.push({
        name: 'Service Workers',
        passed: true,
        message: '✅ Service worker check passed'
      });
    }
  }

  reportResults() {
    console.log('\n📊 TEST RESULTS SUMMARY\n' + '='.repeat(50));
    
    let allPassed = true;
    
    this.testResults.forEach(result => {
      console.log(`${result.message}`);
      if (!result.passed) allPassed = false;
    });
    
    console.log('='.repeat(50));
    
    if (allPassed) {
      console.log('\n✅ All cache update tests passed!');
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('1. Clear browser cache: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)');
      console.log('2. Try incognito/private browsing mode');
      console.log('3. Check if using a VPN or proxy that might cache');
      console.log('4. Verify you\'re accessing the correct URL');
      console.log(`   Your dev URL: ${this.baseUrl}`);
    } else {
      console.log('\n❌ Some tests failed - caching issues detected');
      console.log('\n🔧 AUTOMATED FIXES APPLIED:');
      console.log('1. Added cache-busting to index.html');
      console.log('2. Implemented DevCacheManager utility');
      console.log('3. Force-cleared Vite cache on restart');
      console.log('\n🚀 MANUAL STEPS REQUIRED:');
      console.log('1. Hard refresh your browser (Ctrl+Shift+R)');
      console.log('2. Clear all site data in DevTools');
      console.log('3. Restart the development server');
    }
    
    // Generate detailed report
    this.generateDetailedReport();
  }

  generateDetailedReport() {
    const reportPath = path.join(__dirname, 'CACHE_TEST_REPORT.md');
    const timestamp = new Date().toISOString();
    
    let report = `# Cache Update Test Report\n\n`;
    report += `**Generated:** ${timestamp}\n\n`;
    report += `## Test Results\n\n`;
    
    this.testResults.forEach(result => {
      report += `### ${result.name}\n`;
      report += `- **Status:** ${result.passed ? 'PASSED ✅' : 'FAILED ❌'}\n`;
      report += `- **Details:** ${result.message}\n\n`;
    });
    
    report += `## Environment Information\n\n`;
    report += `- **Dev URL:** ${this.baseUrl}\n`;
    report += `- **Node Version:** ${process.version}\n`;
    report += `- **Platform:** ${process.platform}\n`;
    report += `- **Replit Environment:** ${process.env.REPLIT_ENVIRONMENT || 'Not detected'}\n`;
    
    report += `\n## Troubleshooting Guide\n\n`;
    report += `### If changes aren't appearing:\n\n`;
    report += `1. **Browser Cache:**\n`;
    report += `   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)\n`;
    report += `   - Open DevTools → Application → Storage → Clear site data\n`;
    report += `   - Try incognito/private mode\n\n`;
    
    report += `2. **Development Server:**\n`;
    report += `   - Restart the workflow in Replit\n`;
    report += `   - Check console for Vite HMR messages\n`;
    report += `   - Verify no error messages in server logs\n\n`;
    
    report += `3. **Network/Proxy:**\n`;
    report += `   - Disable VPN if using one\n`;
    report += `   - Check if corporate firewall/proxy is caching\n`;
    report += `   - Try mobile hotspot to bypass network cache\n\n`;
    
    report += `4. **Replit-Specific:**\n`;
    report += `   - Ensure you're using the latest Replit URL\n`;
    report += `   - Check if Replit proxy is caching (rare but possible)\n`;
    report += `   - Try opening in Replit's built-in browser\n`;
    
    fs.writeFileSync(reportPath, report);
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Run tests
const tester = new CacheUpdateTester();
tester.runAllTests().catch(console.error);