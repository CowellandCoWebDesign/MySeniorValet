import { db } from "./db";
import { leasingApplications } from "@shared/schema";
import { eq } from "drizzle-orm";

// Background check provider configurations
const BACKGROUND_CHECK_PROVIDERS = {
  checkr: {
    name: "Checkr",
    apiUrl: "https://api.checkr.com/v1",
    price: 29.99,
    turnaroundTime: "5-10 minutes",
    affiliateCommission: 0.15, // 15% commission
  },
  goodhire: {
    name: "GoodHire",
    apiUrl: "https://api.goodhire.com/v1",
    price: 34.99,
    turnaroundTime: "1-2 hours",
    affiliateCommission: 0.12, // 12% commission
  },
  sterling: {
    name: "Sterling",
    apiUrl: "https://api.sterlingcheck.com/v2",
    price: 39.99,
    turnaroundTime: "2-3 hours",
    affiliateCommission: 0.10, // 10% commission
  },
};

export interface BackgroundCheckRequest {
  applicationId: number;
  provider: keyof typeof BACKGROUND_CHECK_PROVIDERS;
  applicantInfo: {
    firstName: string;
    lastName: string;
    email: string;
    ssn: string;
    dateOfBirth: string;
    currentAddress: string;
  };
}

export interface BackgroundCheckResult {
  requestId: string;
  status: "pending" | "completed" | "failed";
  criminalRecord?: {
    hasRecords: boolean;
    details?: string[];
  };
  creditScore?: number;
  evictionHistory?: {
    hasEvictions: boolean;
    count?: number;
  };
  sexOffenderRegistry?: {
    isRegistered: boolean;
  };
  verificationStatus: "verified" | "needs_review" | "failed";
  reportUrl?: string;
  completedAt?: Date;
}

class BackgroundCheckService {
  async initiateCheck(request: BackgroundCheckRequest): Promise<{ requestId: string; estimatedCompletion: Date }> {
    const provider = BACKGROUND_CHECK_PROVIDERS[request.provider];
    
    if (!provider) {
      throw new Error("Invalid background check provider");
    }

    // In production, this would make actual API calls to the provider
    // For now, we'll simulate the process
    const requestId = `${request.provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update application with background check info
    await db
      .update(leasingApplications)
      .set({
        backgroundCheckProvider: provider.name,
        backgroundCheckRequestId: requestId,
        backgroundCheckStatus: "Pending",
        updatedAt: new Date(),
      })
      .where(eq(leasingApplications.id, request.applicationId));

    // Calculate estimated completion based on provider turnaround time
    const estimatedCompletion = new Date();
    if (request.provider === "checkr") {
      estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + 10);
    } else if (request.provider === "goodhire") {
      estimatedCompletion.setHours(estimatedCompletion.getHours() + 2);
    } else {
      estimatedCompletion.setHours(estimatedCompletion.getHours() + 3);
    }

    // Log affiliate tracking
    console.log(`Background check initiated:`, {
      provider: provider.name,
      price: provider.price,
      potentialCommission: provider.price * provider.affiliateCommission,
      requestId,
    });

    return {
      requestId,
      estimatedCompletion,
    };
  }

  async checkStatus(requestId: string): Promise<BackgroundCheckResult> {
    // In production, this would check with the actual provider API
    // For demonstration, we'll simulate different statuses
    
    const mockResults: BackgroundCheckResult = {
      requestId,
      status: "completed",
      criminalRecord: {
        hasRecords: false,
      },
      creditScore: 720,
      evictionHistory: {
        hasEvictions: false,
        count: 0,
      },
      sexOffenderRegistry: {
        isRegistered: false,
      },
      verificationStatus: "verified",
      reportUrl: `https://example.com/reports/${requestId}`,
      completedAt: new Date(),
    };

    return mockResults;
  }

  async updateApplicationWithResults(applicationId: number, results: BackgroundCheckResult): Promise<void> {
    await db
      .update(leasingApplications)
      .set({
        backgroundCheckStatus: results.status === "completed" ? "Completed" : "Failed",
        backgroundCheckCompletedAt: results.completedAt,
        backgroundCheckResults: {
          criminalRecord: results.criminalRecord?.hasRecords ? "Records found" : "Clear",
          creditScore: results.creditScore,
          evictionHistory: results.evictionHistory?.hasEvictions,
          sexOffenderRegistry: results.sexOffenderRegistry?.isRegistered,
          verificationStatus: results.verificationStatus,
          reportUrl: results.reportUrl,
        },
        updatedAt: new Date(),
      })
      .where(eq(leasingApplications.id, applicationId));
  }

  async getProviderDetails() {
    return Object.entries(BACKGROUND_CHECK_PROVIDERS).map(([key, provider]) => ({
      id: key,
      name: provider.name,
      price: provider.price,
      turnaroundTime: provider.turnaroundTime,
      features: this.getProviderFeatures(key),
    }));
  }

  private getProviderFeatures(provider: string): string[] {
    const features: Record<string, string[]> = {
      checkr: [
        "AI-powered instant results",
        "Criminal records search",
        "SSN verification",
        "Basic credit check",
        "Mobile-friendly process",
      ],
      goodhire: [
        "Comprehensive criminal search",
        "Full credit report",
        "Eviction history",
        "Employment verification",
        "Reference checks",
      ],
      sterling: [
        "Enterprise-grade accuracy",
        "Global database search",
        "Healthcare sanctions check",
        "Professional license verification",
        "Detailed risk assessment",
      ],
    };

    return features[provider] || [];
  }

  calculateAffiliateEarnings(provider: keyof typeof BACKGROUND_CHECK_PROVIDERS): number {
    const config = BACKGROUND_CHECK_PROVIDERS[provider];
    return config.price * config.affiliateCommission;
  }
}

export const backgroundCheckService = new BackgroundCheckService();