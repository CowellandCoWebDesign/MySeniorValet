import { db } from "./db";
import { legalDocumentVersions, legalDocumentAuditTrail, userConsentRecords } from "../shared/schema";
import crypto from "crypto";

export async function seedLegalDocuments() {
  try {
    console.log("🔒 Seeding legal document system...");

    // Create initial versions for each document type
    const documentTypes = ['terms', 'privacy', 'cookie'] as const;
    
    for (const docType of documentTypes) {
      // Check if active version already exists
      const existingActive = await db
        .select()
        .from(legalDocumentVersions)
        .where(
          (table) => ({
            ...table,
            documentType: docType,
            isActive: true
          } as any)
        )
        .limit(1);

      if (existingActive.length === 0) {
        const content = getDocumentContent(docType);
        const contentHash = crypto.createHash('sha256').update(content).digest('hex');
        const wordCount = content.split(/\s+/).length;
        const fileSize = Buffer.byteLength(content, 'utf8');

        // Create the document version
        const [newVersion] = await db
          .insert(legalDocumentVersions)
          .values({
            documentType: docType,
            version: "2.1",
            title: getDocumentTitle(docType),
            content: content,
            contentHash: contentHash,
            effectiveDate: new Date('2025-08-07'),
            publishedDate: new Date('2025-08-07T14:30:00Z'),
            status: "active",
            changes: [
              "Added comprehensive platform-specific details",
              "Enhanced AI processing disclosure",
              "Updated contact information",
              "Clarified data retention policies"
            ],
            authorId: "system",
            approvedBy: "system",
            approvalDate: new Date('2025-08-07T13:45:00Z'),
            complianceNotes: [
              "GDPR compliant",
              "CCPA compliant",
              "State-specific privacy rights addressed"
            ],
            regulatoryRequirements: {
              gdpr: true,
              ccpa: true,
              pipeda: true,
              stateSpecific: ["California CCPA", "Virginia VCDPA"]
            },
            metadata: {
              fileSize,
              wordCount,
              lastModified: new Date().toISOString(),
            },
            isActive: true,
            viewCount: Math.floor(Math.random() * 2000) + 500,
            downloadCount: Math.floor(Math.random() * 200) + 50,
          })
          .returning();

        // Create audit trail entry for publication
        await db.insert(legalDocumentAuditTrail).values({
          documentVersionId: newVersion.id,
          documentType: docType,
          version: "2.1",
          action: "published",
          userId: "system",
          userName: "System Administrator",
          userRole: "super_admin",
          ipAddress: "127.0.0.1",
          userAgent: "MySeniorValet-System",
          details: `Initial ${docType} document published for platform launch`,
          severity: "critical",
        });

        console.log(`✅ Created ${docType} document v2.1`);
      } else {
        console.log(`ℹ️  Active ${docType} document already exists`);
      }
    }

    // Create some sample audit entries for demonstration
    await createSampleAuditEntries();

    console.log("🔒 Legal document system seeding completed");
  } catch (error) {
    console.error("❌ Error seeding legal documents:", error);
  }
}

function getDocumentTitle(docType: string): string {
  switch (docType) {
    case 'terms': return 'Terms of Service v2.1';
    case 'privacy': return 'Privacy Policy v2.1';
    case 'cookie': return 'Cookie Policy v2.1';
    default: return `Legal Document v2.1`;
  }
}

function getDocumentContent(docType: string): string {
  switch (docType) {
    case 'terms':
      return `# Terms of Service

## 1. Acceptance of Terms
By accessing and using MySeniorValet, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Platform Services
MySeniorValet provides a comprehensive platform for discovering senior living communities, including AI-powered search, transparent pricing, and family collaboration tools.

## 3. Subscription Tiers
- Verified Listing: $0/month
- Standard: $149/month  
- Featured: $249/month
- Platinum: $349/month

## 4. User Responsibilities
Users must provide accurate information and comply with all applicable laws and regulations.

## 5. AI Services
Our platform utilizes multiple AI systems for enhanced search and matching capabilities. All AI processing is subject to our Privacy Policy.

## 6. Data Accuracy
We strive to provide accurate information but cannot guarantee completeness. Users should verify all information directly with communities.

## 7. Payment Terms
Subscription fees are charged monthly in advance. Cancellations take effect at the end of the current billing period.

## 8. Limitation of Liability
MySeniorValet's liability is limited to the amount paid for services in the preceding 12 months.

## 9. Governing Law
These terms are governed by applicable federal and state laws.

## 10. Contact Information
For questions about these terms, contact us at legal@myseniorvalet.com.

Last updated: August 7, 2025`;

    case 'privacy':
      return `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly, usage data, and location data to provide our services.

## 2. AI Processing
Our platform uses multiple AI systems (Claude, Gemini, ChatGPT, Grok) for search enhancement and data verification. All AI processing is conducted with privacy safeguards.

## 3. How We Use Information
- Provide and improve our services
- Communicate with you
- Personalize your experience
- Comply with legal obligations

## 4. Information Sharing
We do not sell personal information. We may share information with service providers, legal authorities, or business partners as necessary.

## 5. Data Security
We implement comprehensive security measures to protect your information, including encryption and access controls.

## 6. Your Rights
Depending on your location, you may have rights to:
- Access your personal information
- Correct inaccurate information
- Delete your information
- Object to processing
- Data portability

## 7. State-Specific Rights
### California (CCPA)
California residents have additional rights under the California Consumer Privacy Act.

### Virginia (VCDPA)
Virginia residents have rights under the Virginia Consumer Data Protection Act.

## 8. International Users
We comply with GDPR for European users and PIPEDA for Canadian users.

## 9. Cookies and Tracking
We use cookies and similar technologies as described in our Cookie Policy.

## 10. Contact Information
For privacy questions, contact us at privacy@myseniorvalet.com or:
MySeniorValet Privacy Team
[Address]
[City, State ZIP]

Last updated: August 7, 2025`;

    case 'cookie':
      return `# Cookie Policy

## 1. What Are Cookies
Cookies are small text files stored on your device when you visit our website.

## 2. Types of Cookies We Use

### Essential Cookies
Required for basic site functionality and security.

### Analytics Cookies  
Help us understand how visitors use our site to improve performance.

### Personalization Cookies
Remember your preferences and settings for a better experience.

### Marketing Cookies
Used to show relevant advertisements and measure campaign effectiveness.

## 3. Third-Party Cookies
We use third-party services that may set cookies:
- Google Analytics
- Stripe (payment processing)
- Social media widgets

## 4. Managing Cookies
You can control cookies through:
- Browser settings
- Our cookie preference center
- Opt-out tools provided by third parties

## 5. Cookie Consent
We obtain consent for non-essential cookies and respect your preferences.

## 6. Mobile Devices
Similar technologies may be used in our mobile applications.

## 7. Updates
This policy may be updated periodically. Check the last modified date.

## 8. Contact Information
For cookie-related questions, contact us at privacy@myseniorvalet.com.

Last updated: August 7, 2025`;

    default:
      return 'Legal document content placeholder';
  }
}

async function createSampleAuditEntries() {
  const sampleEntries = [
    {
      documentType: 'terms' as const,
      action: 'viewed' as const,
      userName: 'Anonymous User',
      userRole: 'guest',
      details: 'Terms accessed via footer link',
      severity: 'info' as const
    },
    {
      documentType: 'privacy' as const,
      action: 'downloaded' as const,
      userName: 'John Smith',
      userRole: 'user',
      details: 'Privacy policy downloaded as PDF',
      severity: 'info' as const
    },
    {
      documentType: 'cookie' as const,
      action: 'viewed' as const,
      userName: 'Jane Doe',
      userRole: 'user', 
      details: 'Cookie policy accessed from consent banner',
      severity: 'info' as const
    }
  ];

  for (const entry of sampleEntries) {
    // Get active version for this document type
    const [activeVersion] = await db
      .select()
      .from(legalDocumentVersions)
      .where(
        (table) => ({
          ...table,
          documentType: entry.documentType,
          isActive: true
        } as any)
      )
      .limit(1);

    if (activeVersion) {
      await db.insert(legalDocumentAuditTrail).values({
        documentVersionId: activeVersion.id,
        documentType: entry.documentType,
        version: "2.1",
        action: entry.action,
        userId: null,
        userName: entry.userName,
        userRole: entry.userRole,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: entry.details,
        severity: entry.severity,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      });
    }
  }
}

// Auto-run seeding when imported
seedLegalDocuments();