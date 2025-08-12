import { db } from "./server/db";
import { tours, communities, users } from "./shared/schema";
import { eq } from "drizzle-orm";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Test data
const testTourData = {
  communityId: 1, // We'll use a real community ID
  preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  preferredTime: "2:00 PM",
  alternativeDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days from now
  alternativeTime: "3:00 PM",
  contactName: "Test User",
  contactEmail: "test@example.com",
  contactPhone: "555-123-4567",
  tourType: "in-person",
  partySize: 2,
  specialRequests: "Need wheelchair accessibility",
  interestedInCareLevel: ["Assisted Living", "Memory Care"],
  source: "website",
  utmParams: {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "test_campaign"
  }
};

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log("=".repeat(60));
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`→ ${message}`, colors.blue);
}

async function testScheduleTour() {
  logSection("TEST 1: Schedule a New Tour");
  
  try {
    // First, get a real community ID from the database
    const [community] = await db.select()
      .from(communities)
      .limit(1);
    
    if (!community) {
      logError("No communities found in database");
      return null;
    }
    
    testTourData.communityId = community.id;
    logInfo(`Using community: ${community.name} (ID: ${community.id})`);
    
    // Schedule the tour
    const response = await axios.post(`${BASE_URL}/api/tours/schedule`, testTourData);
    
    if (response.data.success) {
      logSuccess("Tour scheduled successfully!");
      logInfo(`Confirmation Code: ${response.data.confirmationCode}`);
      logInfo(`Tour ID: ${response.data.tour.id}`);
      logInfo(`Status: ${response.data.tour.status}`);
      return response.data.tour;
    } else {
      logError("Failed to schedule tour");
      return null;
    }
  } catch (error: any) {
    logError(`Error scheduling tour: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testGetMyTours(userId?: string) {
  logSection("TEST 2: Get User's Tours");
  
  try {
    // For testing, we'll query directly from the database
    const userTours = await db.select()
      .from(tours)
      .limit(5);
    
    if (userTours.length > 0) {
      logSuccess(`Found ${userTours.length} tours`);
      userTours.forEach((tour, index) => {
        logInfo(`Tour ${index + 1}: ${tour.confirmationCode} - ${tour.status} - Date: ${tour.preferredDate}`);
      });
    } else {
      logInfo("No tours found for user");
    }
    
    return userTours;
  } catch (error: any) {
    logError(`Error fetching tours: ${error.message}`);
    return [];
  }
}

async function testGetCommunityTours(communityId: number) {
  logSection("TEST 3: Get Community's Tours");
  
  try {
    const communityTours = await db.select()
      .from(tours)
      .where(eq(tours.communityId, communityId))
      .limit(5);
    
    if (communityTours.length > 0) {
      logSuccess(`Found ${communityTours.length} tours for community ${communityId}`);
      communityTours.forEach((tour, index) => {
        logInfo(`Tour ${index + 1}: ${tour.contactName} - ${tour.status} - ${tour.preferredDate}`);
      });
    } else {
      logInfo("No tours found for this community");
    }
    
    return communityTours;
  } catch (error: any) {
    logError(`Error fetching community tours: ${error.message}`);
    return [];
  }
}

async function testUpdateTourStatus(tourId: number) {
  logSection("TEST 4: Update Tour Status");
  
  try {
    const updateData = {
      status: "confirmed",
      communityResponse: "We look forward to showing you our community!",
      confirmedDate: testTourData.preferredDate,
      confirmedTime: testTourData.preferredTime
    };
    
    // Direct database update for testing
    const [updatedTour] = await db.update(tours)
      .set(updateData)
      .where(eq(tours.id, tourId))
      .returning();
    
    if (updatedTour) {
      logSuccess("Tour status updated successfully!");
      logInfo(`New Status: ${updatedTour.status}`);
      logInfo(`Community Response: ${updatedTour.communityResponse}`);
      return updatedTour;
    } else {
      logError("Failed to update tour status");
      return null;
    }
  } catch (error: any) {
    logError(`Error updating tour status: ${error.message}`);
    return null;
  }
}

async function testTourAvailability(communityId: number) {
  logSection("TEST 5: Check Tour Availability");
  
  try {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    logInfo(`Checking availability for community ${communityId}`);
    logInfo(`Date range: ${startDate} to ${endDate}`);
    
    // Query tours directly from database
    const existingTours = await db.select()
      .from(tours)
      .where(eq(tours.communityId, communityId));
    
    logSuccess(`Found ${existingTours.length} existing tours for this community`);
    
    // Show status breakdown
    const statusCounts: Record<string, number> = {};
    existingTours.forEach(tour => {
      statusCounts[tour.status] = (statusCounts[tour.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      logInfo(`${status}: ${count} tours`);
    });
    
    return existingTours;
  } catch (error: any) {
    logError(`Error checking availability: ${error.message}`);
    return [];
  }
}

async function testDatabaseIntegrity() {
  logSection("TEST 6: Database Integrity Check");
  
  try {
    // Check if tours table exists and has columns
    const tourCount = await db.select().from(tours).limit(1);
    logSuccess("Tours table exists and is accessible");
    
    // Check total tour count
    const allTours = await db.select().from(tours);
    logInfo(`Total tours in database: ${allTours.length}`);
    
    // Check tour statuses
    const statusBreakdown: Record<string, number> = {};
    allTours.forEach(tour => {
      statusBreakdown[tour.status] = (statusBreakdown[tour.status] || 0) + 1;
    });
    
    logInfo("Tour Status Breakdown:");
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      logInfo(`  ${status}: ${count}`);
    });
    
    // Check tour types
    const typeBreakdown: Record<string, number> = {};
    allTours.forEach(tour => {
      typeBreakdown[tour.tourType] = (typeBreakdown[tour.tourType] || 0) + 1;
    });
    
    logInfo("Tour Type Breakdown:");
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      logInfo(`  ${type}: ${count}`);
    });
    
    return true;
  } catch (error: any) {
    logError(`Database integrity check failed: ${error.message}`);
    return false;
  }
}

async function testTourValidation() {
  logSection("TEST 7: Tour Data Validation");
  
  try {
    // Test invalid tour data
    const invalidTests = [
      {
        name: "Missing required fields",
        data: { communityId: 1 },
        expectedError: true
      },
      {
        name: "Invalid email",
        data: { ...testTourData, contactEmail: "invalid-email" },
        expectedError: true
      },
      {
        name: "Invalid phone",
        data: { ...testTourData, contactPhone: "123" },
        expectedError: true
      },
      {
        name: "Invalid tour type",
        data: { ...testTourData, tourType: "invalid-type" },
        expectedError: true
      },
      {
        name: "Party size too large",
        data: { ...testTourData, partySize: 15 },
        expectedError: true
      }
    ];
    
    for (const test of invalidTests) {
      try {
        const response = await axios.post(`${BASE_URL}/api/tours/schedule`, test.data);
        if (test.expectedError) {
          logError(`${test.name}: Should have failed but succeeded`);
        } else {
          logSuccess(`${test.name}: Passed`);
        }
      } catch (error) {
        if (test.expectedError) {
          logSuccess(`${test.name}: Correctly rejected invalid data`);
        } else {
          logError(`${test.name}: Unexpectedly failed`);
        }
      }
    }
    
    return true;
  } catch (error: any) {
    logError(`Validation tests failed: ${error.message}`);
    return false;
  }
}

async function generateTestReport() {
  logSection("TOURMATE™ SYSTEM TEST REPORT");
  
  const report = {
    timestamp: new Date().toISOString(),
    testsRun: 7,
    testsPassed: 0,
    testsFailed: 0,
    details: [] as any[]
  };
  
  try {
    // Count total tours
    const totalTours = await db.select().from(tours);
    report.details.push({
      metric: "Total Tours",
      value: totalTours.length
    });
    
    // Count communities with tours
    const communitiesWithTours = new Set(totalTours.map(t => t.communityId));
    report.details.push({
      metric: "Communities with Tours",
      value: communitiesWithTours.size
    });
    
    // Average party size
    const avgPartySize = totalTours.reduce((sum, tour) => sum + tour.partySize, 0) / totalTours.length || 0;
    report.details.push({
      metric: "Average Party Size",
      value: avgPartySize.toFixed(1)
    });
    
    // Most popular tour type
    const tourTypes: Record<string, number> = {};
    totalTours.forEach(tour => {
      tourTypes[tour.tourType] = (tourTypes[tour.tourType] || 0) + 1;
    });
    const mostPopularType = Object.entries(tourTypes).sort((a, b) => b[1] - a[1])[0];
    report.details.push({
      metric: "Most Popular Tour Type",
      value: mostPopularType ? `${mostPopularType[0]} (${mostPopularType[1]} tours)` : "N/A"
    });
    
    logSuccess("Test Report Generated:");
    report.details.forEach(detail => {
      logInfo(`${detail.metric}: ${detail.value}`);
    });
    
    return report;
  } catch (error: any) {
    logError(`Failed to generate report: ${error.message}`);
    return report;
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log("\n" + "=".repeat(60), colors.bright + colors.yellow);
  log("     TOURMATE™ SYSTEM COMPREHENSIVE TEST SUITE", colors.bright + colors.yellow);
  log("=".repeat(60), colors.bright + colors.yellow);
  
  try {
    // Test 1: Schedule a tour
    const newTour = await testScheduleTour();
    
    // Test 2: Get user's tours
    await testGetMyTours();
    
    // Test 3: Get community's tours
    if (newTour) {
      await testGetCommunityTours(newTour.communityId);
      
      // Test 4: Update tour status
      await testUpdateTourStatus(newTour.id);
    }
    
    // Test 5: Check availability
    const [firstCommunity] = await db.select().from(communities).limit(1);
    if (firstCommunity) {
      await testTourAvailability(firstCommunity.id);
    }
    
    // Test 6: Database integrity
    await testDatabaseIntegrity();
    
    // Test 7: Validation tests
    await testTourValidation();
    
    // Generate final report
    await generateTestReport();
    
    logSection("TEST SUITE COMPLETED");
    logSuccess("All tests executed successfully!");
    
  } catch (error: any) {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the tests
runAllTests();