import { z } from "zod";
import { db } from "../db";
import { crmIntegrations, communities } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// CRM Provider Types
export type CRMProvider = 'aline' | 'yardi' | 'vitals';

// Data Models for each CRM
export const AlineDataSchema = z.object({
  leadId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  moveInDate: z.string().optional(),
  careLevel: z.enum(['independent', 'assisted', 'memory_care', 'nursing']),
  budget: z.number().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  unitType: z.string().optional(),
  status: z.enum(['inquiry', 'tour_scheduled', 'tour_completed', 'application', 'move_in', 'closed'])
});

export const YardiDataSchema = z.object({
  prospectId: z.string(),
  unitId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  expectedMoveIn: z.string().optional(),
  rentBudget: z.number().optional(),
  depositPaid: z.boolean().optional(),
  applicationStatus: z.enum(['inquiry', 'application', 'approved', 'lease_signed', 'moved_in']),
  marketingSource: z.string().optional(),
  specialNeeds: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string()
  }).optional()
});

export const VitalsDataSchema = z.object({
  residentId: z.string().optional(),
  patientId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string()
  })).optional(),
  careLevel: z.enum(['independent', 'assisted', 'memory_care', 'nursing', 'hospice']),
  physician: z.object({
    name: z.string(),
    phone: z.string(),
    specialty: z.string()
  }).optional(),
  insuranceInfo: z.object({
    primary: z.string(),
    secondary: z.string().optional(),
    medicaid: z.boolean(),
    medicare: z.boolean()
  }).optional(),
  assessmentDate: z.string().optional(),
  acuityLevel: z.number().min(1).max(10).optional()
});

export type AlineData = z.infer<typeof AlineDataSchema>;
export type YardiData = z.infer<typeof YardiDataSchema>;
export type VitalsData = z.infer<typeof VitalsDataSchema>;

export class CRMIntegrationService {
  
  // Configure CRM integration for a community
  async configureCRMIntegration(communityId: number, provider: CRMProvider, config: {
    apiKey: string;
    apiSecret?: string;
    baseUrl: string;
    webhookUrl?: string;
    syncFrequency?: 'real_time' | 'hourly' | 'daily';
    dataMapping?: Record<string, string>;
  }) {
    try {
      const [integration] = await db
        .insert(crmIntegrations)
        .values({
          communityId,
          provider,
          configuration: config,
          status: 'active',
          lastSync: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [crmIntegrations.communityId, crmIntegrations.provider],
          set: {
            configuration: config,
            status: 'active',
            updatedAt: new Date()
          }
        })
        .returning();

      // Test the connection
      const testResult = await this.testConnection(provider, config);
      
      if (!testResult.success) {
        throw new Error(`CRM connection test failed: ${testResult.error}`);
      }

      return { success: true, integration, testResult };
    } catch (error) {
      console.error(`CRM configuration error for ${provider}:`, error);
      throw error;
    }
  }

  // Test CRM connection
  async testConnection(provider: CRMProvider, config: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (provider) {
        case 'aline':
          return await this.testAlineConnection(config);
        case 'yardi':
          return await this.testYardiConnection(config);
        case 'vitals':
          return await this.testVitalsConnection(config);
        default:
          return { success: false, error: 'Unknown CRM provider' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  // ALINE Integration Methods
  private async testAlineConnection(config: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.baseUrl}/api/v1/test`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error connecting to ALINE' };
    }
  }

  async syncAlineLeads(communityId: number): Promise<{ success: boolean; leads: AlineData[]; error?: string }> {
    try {
      const [integration] = await db
        .select()
        .from(crmIntegrations)
        .where(and(
          eq(crmIntegrations.communityId, communityId),
          eq(crmIntegrations.provider, 'aline'),
          eq(crmIntegrations.status, 'active')
        ));

      if (!integration) {
        throw new Error('ALINE integration not configured');
      }

      const config = integration.configuration as any;
      const response = await fetch(`${config.baseUrl}/api/v1/leads`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`ALINE API error: ${response.status}`);
      }

      const data = await response.json();
      const leads = data.leads.map((lead: any) => AlineDataSchema.parse(lead));

      // Update last sync time
      await db
        .update(crmIntegrations)
        .set({ 
          lastSync: new Date(),
          syncCount: (integration.syncCount || 0) + 1
        })
        .where(eq(crmIntegrations.id, integration.id));

      return { success: true, leads };
    } catch (error) {
      console.error('ALINE sync error:', error);
      return { 
        success: false, 
        leads: [], 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  // Yardi Integration Methods  
  private async testYardiConnection(config: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.baseUrl}/api/v2/properties/test`, {
        method: 'GET',
        headers: {
          'X-API-Key': config.apiKey,
          'X-API-Secret': config.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error connecting to Yardi' };
    }
  }

  async syncYardiProspects(communityId: number): Promise<{ success: boolean; prospects: YardiData[]; error?: string }> {
    try {
      const [integration] = await db
        .select()
        .from(crmIntegrations)
        .where(and(
          eq(crmIntegrations.communityId, communityId),
          eq(crmIntegrations.provider, 'yardi'),
          eq(crmIntegrations.status, 'active')
        ));

      if (!integration) {
        throw new Error('Yardi integration not configured');
      }

      const config = integration.configuration as any;
      const response = await fetch(`${config.baseUrl}/api/v2/prospects`, {
        method: 'GET',
        headers: {
          'X-API-Key': config.apiKey,
          'X-API-Secret': config.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Yardi API error: ${response.status}`);
      }

      const data = await response.json();
      const prospects = data.prospects.map((prospect: any) => YardiDataSchema.parse(prospect));

      // Update last sync time
      await db
        .update(crmIntegrations)
        .set({ 
          lastSync: new Date(),
          syncCount: (integration.syncCount || 0) + 1
        })
        .where(eq(crmIntegrations.id, integration.id));

      return { success: true, prospects };
    } catch (error) {
      console.error('Yardi sync error:', error);
      return { 
        success: false, 
        prospects: [], 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  // Vitals Integration Methods
  private async testVitalsConnection(config: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${config.baseUrl}/api/health/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error connecting to Vitals' };
    }
  }

  async syncVitalsPatients(communityId: number): Promise<{ success: boolean; patients: VitalsData[]; error?: string }> {
    try {
      const [integration] = await db
        .select()
        .from(crmIntegrations)
        .where(and(
          eq(crmIntegrations.communityId, communityId),
          eq(crmIntegrations.provider, 'vitals'),
          eq(crmIntegrations.status, 'active')
        ));

      if (!integration) {
        throw new Error('Vitals integration not configured');
      }

      const config = integration.configuration as any;
      const response = await fetch(`${config.baseUrl}/api/patients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Vitals API error: ${response.status}`);
      }

      const data = await response.json();
      const patients = data.patients.map((patient: any) => VitalsDataSchema.parse(patient));

      // Update last sync time
      await db
        .update(crmIntegrations)
        .set({ 
          lastSync: new Date(),
          syncCount: (integration.syncCount || 0) + 1
        })
        .where(eq(crmIntegrations.id, integration.id));

      return { success: true, patients };
    } catch (error) {
      console.error('Vitals sync error:', error);
      return { 
        success: false, 
        patients: [], 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  // Get all integrations for a community
  async getCommunityIntegrations(communityId: number) {
    return await db
      .select()
      .from(crmIntegrations)
      .where(eq(crmIntegrations.communityId, communityId));
  }

  // Disable integration
  async disableIntegration(communityId: number, provider: CRMProvider) {
    return await db
      .update(crmIntegrations)
      .set({ 
        status: 'inactive',
        updatedAt: new Date()
      })
      .where(and(
        eq(crmIntegrations.communityId, communityId),
        eq(crmIntegrations.provider, provider)
      ));
  }

  // Get sync statistics
  async getSyncStats(communityId: number) {
    const integrations = await this.getCommunityIntegrations(communityId);
    
    return {
      totalIntegrations: integrations.length,
      activeIntegrations: integrations.filter(i => i.status === 'active').length,
      lastSyncTimes: integrations.reduce((acc, integration) => {
        acc[integration.provider] = integration.lastSync;
        return acc;
      }, {} as Record<string, Date | null>),
      syncCounts: integrations.reduce((acc, integration) => {
        acc[integration.provider] = integration.syncCount || 0;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const crmIntegrationService = new CRMIntegrationService();