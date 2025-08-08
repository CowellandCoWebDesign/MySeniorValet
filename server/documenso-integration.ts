/**
 * Documenso Integration for MySeniorValet
 * 
 * Open-source, self-hosted document signing solution for:
 * - Lease agreements
 * - Community contracts
 * - Healthcare directives
 * - Power of attorney documents
 * - HIPAA consent forms
 * - Financial agreements
 * 
 * Future Community Property Management Suite Support:
 * - Resident onboarding documents
 * - Move-in/move-out checklists
 * - Service agreements
 * - Family consent forms
 * - Medical records releases
 * - Insurance documentation
 * 
 * Advantages over DocuSign:
 * - Self-hosted for complete data control
 * - No per-envelope fees
 * - HIPAA compliant when properly configured
 * - Customizable branding
 * - API-first architecture
 * - Open-source transparency
 */

import axios from 'axios';
import { db } from './db';
import { communities, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface DocumensoConfig {
  baseUrl: string;
  apiKey: string;
  workspaceId?: string;
  webhookUrl?: string;
}

interface DocumensoDocument {
  id: string;
  title: string;
  status: 'draft' | 'pending' | 'completed' | 'declined' | 'expired';
  createdAt: Date;
  completedAt?: Date;
  recipients: DocumensoRecipient[];
  documentUrl?: string;
  signedDocumentUrl?: string;
}

interface DocumensoRecipient {
  id: string;
  email: string;
  name: string;
  role: 'signer' | 'viewer' | 'approver';
  status: 'pending' | 'signed' | 'declined';
  signedAt?: Date;
}

interface CreateDocumentRequest {
  title: string;
  documentBase64?: string;
  documentUrl?: string;
  recipients: {
    email: string;
    name: string;
    role: 'signer' | 'viewer' | 'approver';
    signingOrder?: number;
  }[];
  fields?: {
    type: 'signature' | 'text' | 'date' | 'checkbox' | 'initials';
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
    recipientId?: string;
    required?: boolean;
  }[];
  expiresIn?: number; // Days until expiration
  message?: string;
  redirectUrl?: string;
}

export class DocumensoService {
  private config: DocumensoConfig;
  
  constructor() {
    this.config = {
      baseUrl: process.env.DOCUMENSO_BASE_URL || 'https://docs.myseniorvalet.com',
      apiKey: process.env.DOCUMENSO_API_KEY || '',
      workspaceId: process.env.DOCUMENSO_WORKSPACE_ID,
      webhookUrl: process.env.DOCUMENSO_WEBHOOK_URL || 'https://myseniorvalet.com/api/documenso/webhook'
    };
    
    if (!this.config.apiKey) {
      console.log('⚠️ Documenso API key not configured - document signing disabled');
    } else {
      console.log('✅ Documenso integration ready for lease signing and document management');
    }
  }
  
  /**
   * Check if Documenso is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.apiKey && !!this.config.baseUrl;
  }
  
  /**
   * Create and send a lease agreement for signing
   */
  async createLeaseAgreement(
    communityId: number,
    residentEmail: string,
    residentName: string,
    leaseDetails: {
      unitNumber: string;
      monthlyRent: number;
      leaseStartDate: Date;
      leaseEndDate: Date;
      securityDeposit: number;
      amenities: string[];
      careLevel: string;
    }
  ): Promise<DocumensoDocument> {
    if (!this.isConfigured()) {
      throw new Error('Documenso is not configured');
    }
    
    try {
      // Get community details
      const [community] = await db.select().from(communities).where(eq(communities.id, communityId));
      if (!community) {
        throw new Error('Community not found');
      }
      
      // Generate lease document HTML
      const leaseHtml = this.generateLeaseHTML(community, residentName, leaseDetails);
      
      // Convert HTML to PDF (would use a PDF generation service)
      const pdfBase64 = await this.htmlToPdf(leaseHtml);
      
      // Create document in Documenso
      const createRequest: CreateDocumentRequest = {
        title: `Lease Agreement - ${community.name} - Unit ${leaseDetails.unitNumber}`,
        documentBase64: pdfBase64,
        recipients: [
          {
            email: residentEmail,
            name: residentName,
            role: 'signer',
            signingOrder: 1
          },
          {
            email: community.email || 'admin@myseniorvalet.com',
            name: `${community.name} Management`,
            role: 'signer',
            signingOrder: 2
          }
        ],
        fields: [
          // Resident signature
          {
            type: 'signature',
            page: 5,
            x: 100,
            y: 600,
            width: 200,
            height: 60,
            required: true
          },
          // Resident date
          {
            type: 'date',
            page: 5,
            x: 350,
            y: 620,
            width: 150,
            height: 30,
            required: true
          },
          // Community signature
          {
            type: 'signature',
            page: 5,
            x: 100,
            y: 700,
            width: 200,
            height: 60,
            required: true
          },
          // Community date
          {
            type: 'date',
            page: 5,
            x: 350,
            y: 720,
            width: 150,
            height: 30,
            required: true
          }
        ],
        expiresIn: 30, // 30 days to sign
        message: `Please review and sign your lease agreement for ${community.name}`,
        redirectUrl: `https://myseniorvalet.com/lease-signed?community=${communityId}`
      };
      
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/documents`,
        createRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-Workspace-Id': this.config.workspaceId || '',
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Error creating lease agreement:', error);
      throw error;
    }
  }
  
  /**
   * Create healthcare directive document
   */
  async createHealthcareDirective(
    userId: number,
    directives: {
      type: 'living_will' | 'power_of_attorney' | 'dnr' | 'healthcare_proxy';
      primaryAgent: { name: string; email: string; phone: string };
      secondaryAgent?: { name: string; email: string; phone: string };
      medicalWishes: string[];
      restrictions: string[];
    }
  ): Promise<DocumensoDocument> {
    if (!this.isConfigured()) {
      throw new Error('Documenso is not configured');
    }
    
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate healthcare directive document
      const documentHtml = this.generateHealthcareDirectiveHTML(user, directives);
      const pdfBase64 = await this.htmlToPdf(documentHtml);
      
      const recipients = [
        {
          email: user.email,
          name: user.username,
          role: 'signer' as const,
          signingOrder: 1
        },
        {
          email: directives.primaryAgent.email,
          name: directives.primaryAgent.name,
          role: 'signer' as const,
          signingOrder: 2
        }
      ];
      
      if (directives.secondaryAgent) {
        recipients.push({
          email: directives.secondaryAgent.email,
          name: directives.secondaryAgent.name,
          role: 'signer' as const,
          signingOrder: 3
        });
      }
      
      const createRequest: CreateDocumentRequest = {
        title: `Healthcare Directive - ${user.username}`,
        documentBase64: pdfBase64,
        recipients,
        fields: this.generateHealthcareDirectiveFields(recipients.length),
        expiresIn: 60, // 60 days to sign
        message: 'Please review and sign this healthcare directive document',
        redirectUrl: 'https://myseniorvalet.com/healthcare-directive-signed'
      };
      
      const response = await axios.post(
        `${this.config.baseUrl}/api/v1/documents`,
        createRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-Workspace-Id': this.config.workspaceId || '',
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
      
    } catch (error) {
      console.error('Error creating healthcare directive:', error);
      throw error;
    }
  }
  
  /**
   * Get document status
   */
  async getDocumentStatus(documentId: string): Promise<DocumensoDocument> {
    if (!this.isConfigured()) {
      throw new Error('Documenso is not configured');
    }
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/documents/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-Workspace-Id': this.config.workspaceId || ''
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error getting document status:', error);
      throw error;
    }
  }
  
  /**
   * Download signed document
   */
  async downloadSignedDocument(documentId: string): Promise<Buffer> {
    if (!this.isConfigured()) {
      throw new Error('Documenso is not configured');
    }
    
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/api/v1/documents/${documentId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'X-Workspace-Id': this.config.workspaceId || ''
          },
          responseType: 'arraybuffer'
        }
      );
      
      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error downloading signed document:', error);
      throw error;
    }
  }
  
  /**
   * Handle webhook from Documenso
   */
  async handleWebhook(payload: any): Promise<void> {
    const { event, document, recipient } = payload;
    
    switch (event) {
      case 'document.completed':
        console.log(`✅ Document ${document.id} fully signed`);
        // Update database, notify users, etc.
        break;
        
      case 'document.signed':
        console.log(`✍️ ${recipient.email} signed document ${document.id}`);
        // Track individual signatures
        break;
        
      case 'document.declined':
        console.log(`❌ ${recipient.email} declined document ${document.id}`);
        // Handle declined documents
        break;
        
      case 'document.expired':
        console.log(`⏰ Document ${document.id} expired`);
        // Handle expired documents
        break;
    }
  }
  
  /**
   * Generate lease agreement HTML
   */
  private generateLeaseHTML(community: any, residentName: string, leaseDetails: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; text-align: center; }
          .section { margin: 20px 0; }
          .signature-line { border-bottom: 2px solid #000; width: 300px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>RESIDENTIAL LEASE AGREEMENT</h1>
        
        <div class="section">
          <h2>Property Information</h2>
          <p><strong>Community:</strong> ${community.name}</p>
          <p><strong>Address:</strong> ${community.address}, ${community.city}, ${community.state} ${community.zipCode}</p>
          <p><strong>Unit Number:</strong> ${leaseDetails.unitNumber}</p>
        </div>
        
        <div class="section">
          <h2>Tenant Information</h2>
          <p><strong>Name:</strong> ${residentName}</p>
        </div>
        
        <div class="section">
          <h2>Lease Terms</h2>
          <p><strong>Monthly Rent:</strong> $${leaseDetails.monthlyRent}</p>
          <p><strong>Security Deposit:</strong> $${leaseDetails.securityDeposit}</p>
          <p><strong>Lease Start Date:</strong> ${leaseDetails.leaseStartDate.toLocaleDateString()}</p>
          <p><strong>Lease End Date:</strong> ${leaseDetails.leaseEndDate.toLocaleDateString()}</p>
          <p><strong>Care Level:</strong> ${leaseDetails.careLevel}</p>
        </div>
        
        <div class="section">
          <h2>Included Amenities</h2>
          <ul>
            ${leaseDetails.amenities.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
        
        <!-- Additional lease terms would go here -->
        
        <div class="section" style="margin-top: 100px;">
          <h2>Signatures</h2>
          <div class="signature-line">
            <p>Resident Signature</p>
          </div>
          <div class="signature-line">
            <p>Community Representative Signature</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Generate healthcare directive HTML
   */
  private generateHealthcareDirectiveHTML(user: any, directives: any): string {
    const directiveTypes: Record<string, string> = {
      'living_will': 'Living Will',
      'power_of_attorney': 'Medical Power of Attorney',
      'dnr': 'Do Not Resuscitate Order',
      'healthcare_proxy': 'Healthcare Proxy'
    };
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; text-align: center; }
          .section { margin: 20px 0; }
          .signature-line { border-bottom: 2px solid #000; width: 300px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>${directiveTypes[directives.type]}</h1>
        
        <div class="section">
          <h2>Principal Information</h2>
          <p><strong>Name:</strong> ${user.username}</p>
          <p><strong>Email:</strong> ${user.email}</p>
        </div>
        
        <div class="section">
          <h2>Healthcare Agent(s)</h2>
          <h3>Primary Agent</h3>
          <p><strong>Name:</strong> ${directives.primaryAgent.name}</p>
          <p><strong>Email:</strong> ${directives.primaryAgent.email}</p>
          <p><strong>Phone:</strong> ${directives.primaryAgent.phone}</p>
          
          ${directives.secondaryAgent ? `
            <h3>Secondary Agent</h3>
            <p><strong>Name:</strong> ${directives.secondaryAgent.name}</p>
            <p><strong>Email:</strong> ${directives.secondaryAgent.email}</p>
            <p><strong>Phone:</strong> ${directives.secondaryAgent.phone}</p>
          ` : ''}
        </div>
        
        <div class="section">
          <h2>Medical Wishes</h2>
          <ul>
            ${directives.medicalWishes.map((w: string) => `<li>${w}</li>`).join('')}
          </ul>
        </div>
        
        <div class="section">
          <h2>Restrictions</h2>
          <ul>
            ${directives.restrictions.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        
        <div class="section" style="margin-top: 100px;">
          <h2>Signatures</h2>
          <div class="signature-line">
            <p>Principal Signature</p>
          </div>
          <div class="signature-line">
            <p>Primary Agent Signature</p>
          </div>
          ${directives.secondaryAgent ? `
            <div class="signature-line">
              <p>Secondary Agent Signature</p>
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Generate signature fields for healthcare directive
   */
  private generateHealthcareDirectiveFields(recipientCount: number): any[] {
    const fields = [];
    let yPosition = 600;
    
    for (let i = 0; i < recipientCount; i++) {
      fields.push(
        {
          type: 'signature',
          page: 3,
          x: 100,
          y: yPosition,
          width: 200,
          height: 60,
          required: true
        },
        {
          type: 'date',
          page: 3,
          x: 350,
          y: yPosition + 20,
          width: 150,
          height: 30,
          required: true
        }
      );
      yPosition += 100;
    }
    
    return fields;
  }
  
  /**
   * Convert HTML to PDF (placeholder - would use a real PDF service)
   */
  private async htmlToPdf(html: string): Promise<string> {
    // In production, this would use a service like Puppeteer, wkhtmltopdf, or a PDF API
    // For now, return a placeholder
    console.log('Converting HTML to PDF...');
    return Buffer.from(html).toString('base64');
  }
}

// Export singleton instance
export const documensoService = new DocumensoService();