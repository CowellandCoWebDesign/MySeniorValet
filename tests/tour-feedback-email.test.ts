import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../server/index';
import { db } from '../server/db';
import { users, communities, tours, tourFeedback } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '../server/services/email';

// Mock EmailService to track calls
jest.mock('../server/services/email', () => ({
  EmailService: {
    sendEmail: jest.fn().mockResolvedValue(true)
  }
}));

describe('Tour Feedback Email System', () => {
  let testUserId: number;
  let testCommunityId: number;
  let testTourId: number;
  let authCookie: string;

  beforeAll(async () => {
    console.log('🧪 Setting up test data...');
    
    // Clear test data
    await db.delete(tourFeedback).where(eq(tourFeedback.id, 0));
    await db.delete(tours).where(eq(tours.id, 0));
    
    // Create test user
    const [testUser] = await db.insert(users).values({
      email: 'test.user@example.com',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      role: 'customer'
    }).returning();
    testUserId = testUser.id;
    console.log(`✅ Created test user: ${testUser.email} (ID: ${testUserId})`);

    // Create test community with email
    const [testCommunity] = await db.insert(communities).values({
      name: 'Test Community',
      address: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      email: 'community@example.com',
      communityManagerEmail: 'manager@example.com',
      phone: '555-0123'
    }).returning();
    testCommunityId = testCommunity.id;
    console.log(`✅ Created test community: ${testCommunity.name} (ID: ${testCommunityId})`);
    console.log(`   Community email: ${testCommunity.email}`);
    console.log(`   Manager email: ${testCommunity.communityManagerEmail}`);

    // Create test tour
    const [testTour] = await db.insert(tours).values({
      userId: testUserId,
      communityId: testCommunityId,
      tourDate: new Date('2025-08-10T14:00:00Z'),
      status: 'scheduled',
      tourType: 'in_person',
      attendeeCount: 2,
      contactName: 'Test User',
      contactEmail: 'test.user@example.com',
      contactPhone: '555-0123'
    }).returning();
    testTourId = testTour.id;
    console.log(`✅ Created test tour: ID ${testTourId}`);

    // Mock authentication
    authCookie = 'test-auth-cookie';
  });

  afterAll(async () => {
    // Clean up test data
    await db.delete(tourFeedback).where(eq(tourFeedback.tourId, testTourId));
    await db.delete(tours).where(eq(tours.id, testTourId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(communities).where(eq(communities.id, testCommunityId));
  });

  it('should send emails to all parties when submitting tour feedback', async () => {
    console.log('\n📧 Testing tour feedback email system...');
    
    // Clear mock calls
    (EmailService.sendEmail as jest.Mock).mockClear();
    
    const feedbackData = {
      overallImpression: 'Great community with excellent amenities',
      tourNotes: 'Clean facilities, friendly staff',
      pricingInfo: 'Base rent $3500, care levels $500-$2000',
      overallRating: 5,
      wouldRecommend: true,
      likelihood: 'very_likely',
      shareContactInfo: true,
      shareNotes: true,
      sharePricing: true
    };

    console.log('📤 Submitting tour feedback...');
    const response = await request(app)
      .post(`/api/tours/${testTourId}/feedback`)
      .set('Cookie', authCookie)
      .send(feedbackData);

    console.log(`Response status: ${response.status}`);
    console.log(`Response body: ${JSON.stringify(response.body, null, 2)}`);

    // Check response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Analyze email calls
    const emailCalls = (EmailService.sendEmail as jest.Mock).mock.calls;
    console.log(`\n📊 Email Service called ${emailCalls.length} times`);

    // Log each email call
    emailCalls.forEach((call, index) => {
      const [emailOptions] = call;
      console.log(`\n📧 Email Call #${index + 1}:`);
      console.log(`   To: ${emailOptions.to}`);
      console.log(`   CC: ${emailOptions.cc || 'none'}`);
      console.log(`   BCC: ${emailOptions.bcc || 'none'}`);
      console.log(`   Subject: ${emailOptions.subject}`);
      console.log(`   Has HTML: ${!!emailOptions.html}`);
    });

    // Verify all expected emails were sent
    const emailRecipients = emailCalls.map(call => ({
      to: call[0].to,
      cc: call[0].cc,
      subject: call[0].subject
    }));

    console.log('\n🔍 Checking for expected emails:');
    
    // Check for user email
    const userEmail = emailRecipients.find(e => e.to === 'test.user@example.com');
    console.log(`✅ User email: ${userEmail ? 'SENT' : '❌ MISSING'}`);
    if (userEmail) {
      console.log(`   Subject: ${userEmail.subject}`);
      console.log(`   CC: ${userEmail.cc || 'none'}`);
    }

    // Check for community email
    const communityEmail = emailRecipients.find(e => 
      e.to === 'hello@myseniorvalet.com' && e.subject.includes('[TEST MODE]')
    );
    console.log(`✅ Community email (test mode): ${communityEmail ? 'SENT' : '❌ MISSING'}`);
    if (communityEmail) {
      console.log(`   Subject: ${communityEmail.subject}`);
      console.log(`   CC: ${communityEmail.cc || 'none'}`);
    }

    // Verify at least 2 emails were sent (user + community)
    expect(emailCalls.length).toBeGreaterThanOrEqual(2);
    
    // Verify user email
    expect(userEmail).toBeDefined();
    expect(userEmail?.cc).toBe('hello@myseniorvalet.com');
    
    // Verify community email (in test mode)
    expect(communityEmail).toBeDefined();
    expect(communityEmail?.cc).toBe('hello@myseniorvalet.com');
  });

  it('should handle missing community email gracefully', async () => {
    console.log('\n📧 Testing feedback with no community email...');
    
    // Create community without email
    const [noCommunity] = await db.insert(communities).values({
      name: 'No Email Community',
      address: '456 Test Ave',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    }).returning();

    // Create tour for this community
    const [noEmailTour] = await db.insert(tours).values({
      userId: testUserId,
      communityId: noCommunity.id,
      tourDate: new Date('2025-08-11T14:00:00Z'),
      status: 'scheduled',
      tourType: 'in_person',
      attendeeCount: 1,
      contactName: 'Test User',
      contactEmail: 'test.user@example.com'
    }).returning();

    // Clear mock calls
    (EmailService.sendEmail as jest.Mock).mockClear();

    const response = await request(app)
      .post(`/api/tours/${noEmailTour.id}/feedback`)
      .set('Cookie', authCookie)
      .send({
        overallRating: 4,
        overallImpression: 'Nice place',
        sharePricing: true
      });

    expect(response.status).toBe(200);

    const emailCalls = (EmailService.sendEmail as jest.Mock).mock.calls;
    console.log(`Email calls made: ${emailCalls.length}`);
    
    // Should only send user email when community has no email
    const userEmailSent = emailCalls.some(call => call[0].to === 'test.user@example.com');
    console.log(`User email sent: ${userEmailSent ? 'YES' : 'NO'}`);
    
    expect(userEmailSent).toBe(true);

    // Clean up
    await db.delete(tourFeedback).where(eq(tourFeedback.tourId, noEmailTour.id));
    await db.delete(tours).where(eq(tours.id, noEmailTour.id));
    await db.delete(communities).where(eq(communities.id, noCommunity.id));
  });
});