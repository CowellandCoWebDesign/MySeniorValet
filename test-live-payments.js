// Live Payment Testing Script for MySeniorValet
// Tests all payment flows with real Stripe integration

const puppeteer = require('puppeteer');
const { readFileSync } = require('fs');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_TIMEOUT = 120000; // 2 minutes per test

// Test payment data
const TEST_CARDS = {
  successful: {
    number: '4242424242424242',
    exp: '12/28',
    cvc: '123',
    zip: '12345'
  },
  declined: {
    number: '4000000000000002',
    exp: '12/28',
    cvc: '123',
    zip: '12345'
  },
  requires3DS: {
    number: '4000002500003155',
    exp: '12/28',
    cvc: '123',
    zip: '12345'
  }
};

// Community tier tests
const COMMUNITY_TIERS = [
  { name: 'Standard', price: 149, id: 'standard' },
  { name: 'Featured', price: 249, id: 'featured' },
  { name: 'Platinum', price: 349, id: 'platinum' }
];

// Vendor tier tests
const VENDOR_TIERS = [
  { name: 'Basic Listing', price: 99, id: 'basic' },
  { name: 'Featured Vendor', price: 249, id: 'featured' },
  { name: 'National Partner', price: 499, id: 'premium' }
];

class PaymentTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
  }

  async initialize() {
    console.log('🚀 Initializing payment test runner...');
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 390,
        height: 844,
        isMobile: true,
        hasTouch: true
      }
    });
    this.page = await this.browser.newPage();
    
    // Set up console message logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser error:', msg.text());
      }
    });
  }

  async testCommunityPayment(tier, cardType = 'successful') {
    const testName = `Community ${tier.name} - ${cardType}`;
    console.log(`\n📋 Testing: ${testName}`);
    
    try {
      // Navigate to community payment page
      await this.page.goto(`${BASE_URL}/community-mobile-payment`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for payment form to load
      await this.page.waitForSelector('[data-testid="mobile-payment-form"]', { 
        timeout: 20000 
      });

      // Select tier
      await this.page.click(`[data-tier-id="${tier.id}"]`);
      await this.page.waitForTimeout(1000);

      // Fill payment form
      await this.fillPaymentForm(TEST_CARDS[cardType]);

      // Submit payment
      await this.page.click('[data-testid="submit-payment"]');
      
      // Wait for result
      const result = await this.waitForPaymentResult();
      
      this.recordTest(testName, result);
      return result;
    } catch (error) {
      console.error(`❌ Error in ${testName}:`, error.message);
      this.recordTest(testName, { success: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async testVendorPayment(tier, cardType = 'successful') {
    const testName = `Vendor ${tier.name} - ${cardType}`;
    console.log(`\n📋 Testing: ${testName}`);
    
    try {
      // Navigate to vendor signup
      await this.page.goto(`${BASE_URL}/vendor-signup`, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Fill vendor information
      await this.fillVendorSignup(tier);

      // Navigate to payment
      await this.page.click('[data-testid="proceed-to-payment"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Wait for payment form
      await this.page.waitForSelector('[data-testid="mobile-payment-form"]', { 
        timeout: 20000 
      });

      // Fill payment form
      await this.fillPaymentForm(TEST_CARDS[cardType]);

      // Submit payment
      await this.page.click('[data-testid="submit-payment"]');
      
      // Wait for result
      const result = await this.waitForPaymentResult();
      
      this.recordTest(testName, result);
      return result;
    } catch (error) {
      console.error(`❌ Error in ${testName}:`, error.message);
      this.recordTest(testName, { success: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async fillVendorSignup(tier) {
    // Fill business information
    await this.page.type('[name="businessName"]', `Test Business ${Date.now()}`);
    await this.page.type('[name="contactName"]', 'Test Contact');
    await this.page.type('[name="email"]', `test${Date.now()}@myseniorvalet.com`);
    await this.page.type('[name="phone"]', '555-123-4567');
    
    // Select category
    await this.page.select('[name="category"]', 'Home Health');
    
    // Select tier
    await this.page.click(`[data-tier-id="${tier.id}"]`);
    await this.page.waitForTimeout(500);
  }

  async fillPaymentForm(card) {
    console.log('💳 Filling payment form...');
    
    // Wait for Stripe iframe
    const stripeFrame = await this.page.waitForSelector('iframe[name*="__privateStripeFrame"]', {
      timeout: 30000
    });
    
    const frame = await stripeFrame.contentFrame();
    
    // Fill card number
    await frame.type('[placeholder*="Card number"]', card.number);
    
    // Fill expiry
    await frame.type('[placeholder*="MM / YY"]', card.exp);
    
    // Fill CVC
    await frame.type('[placeholder*="CVC"]', card.cvc);
    
    // Fill ZIP
    await frame.type('[placeholder*="ZIP"]', card.zip);
    
    console.log('✅ Payment form filled');
  }

  async waitForPaymentResult() {
    console.log('⏳ Waiting for payment result...');
    
    try {
      // Wait for either success or error message
      await Promise.race([
        this.page.waitForSelector('[data-testid="payment-success"]', { timeout: 60000 }),
        this.page.waitForSelector('[data-testid="payment-error"]', { timeout: 60000 })
      ]);
      
      // Check which element appeared
      const success = await this.page.$('[data-testid="payment-success"]');
      const error = await this.page.$('[data-testid="payment-error"]');
      
      if (success) {
        console.log('✅ Payment successful!');
        return { success: true };
      } else if (error) {
        const errorText = await error.evaluate(el => el.textContent);
        console.log('❌ Payment failed:', errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('⏱️ Payment timeout:', error.message);
      return { success: false, error: 'Payment timeout' };
    }
  }

  recordTest(name, result) {
    this.results.tests.push({
      name,
      ...result,
      timestamp: new Date().toISOString()
    });
    
    this.results.summary.total++;
    if (result.success) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
  }

  async runAllTests() {
    console.log('\n🏁 Starting comprehensive payment tests...\n');
    
    // Test community payments
    console.log('=== COMMUNITY PAYMENT TESTS ===');
    for (const tier of COMMUNITY_TIERS) {
      await this.testCommunityPayment(tier, 'successful');
      await this.page.waitForTimeout(2000);
    }
    
    // Test vendor payments
    console.log('\n=== VENDOR PAYMENT TESTS ===');
    for (const tier of VENDOR_TIERS) {
      await this.testVendorPayment(tier, 'successful');
      await this.page.waitForTimeout(2000);
    }
    
    // Test failed payments
    console.log('\n=== FAILED PAYMENT TESTS ===');
    await this.testCommunityPayment(COMMUNITY_TIERS[0], 'declined');
    await this.testVendorPayment(VENDOR_TIERS[0], 'declined');
    
    // Test 3DS payments
    console.log('\n=== 3D SECURE PAYMENT TESTS ===');
    await this.testCommunityPayment(COMMUNITY_TIERS[0], 'requires3DS');
  }

  async generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('========================');
    console.log(`Total Tests: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    this.results.tests.forEach(test => {
      const icon = test.success ? '✅' : '❌';
      console.log(`${icon} ${test.name}${test.error ? ` - ${test.error}` : ''}`);
    });
    
    // Save results to file
    const filename = `payment-test-results-${Date.now()}.json`;
    require('fs').writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to ${filename}`);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.runAllTests();
      await this.generateReport();
    } catch (error) {
      console.error('Fatal error:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests
if (require.main === module) {
  console.log('🚀 MySeniorValet Live Payment Testing');
  console.log('=====================================');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Contact: hello@myseniorvalet.com`);
  console.log(`Billing: billing@myseniorvalet.com`);
  console.log('=====================================\n');
  
  const runner = new PaymentTestRunner();
  runner.run().catch(console.error);
}

module.exports = PaymentTestRunner;