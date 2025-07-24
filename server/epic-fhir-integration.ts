// Epic FHIR Integration for Medical Records Transfer
import axios from 'axios';

export class EpicFHIRIntegration {
  private baseUrl: string;
  private clientId: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth';
    this.clientId = process.env.EPIC_CLIENT_ID || '';
  }

  async authenticate(): Promise<boolean> {
    if (!process.env.EPIC_CLIENT_SECRET || !this.clientId) {
      console.log('Epic FHIR credentials not configured');
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: process.env.EPIC_CLIENT_SECRET
      });

      this.accessToken = response.data.access_token;
      return true;
    } catch (error) {
      console.error('Epic FHIR authentication failed:', error);
      return false;
    }
  }

  async getPatientSummary(patientId: string): Promise<any> {
    if (!this.accessToken && !await this.authenticate()) {
      throw new Error('Epic FHIR authentication required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/Patient/${patientId}/$summary`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        }
      });

      return {
        patientId,
        demographics: response.data.entry?.find((e: any) => e.resource.resourceType === 'Patient')?.resource,
        conditions: response.data.entry?.filter((e: any) => e.resource.resourceType === 'Condition') || [],
        medications: response.data.entry?.filter((e: any) => e.resource.resourceType === 'MedicationStatement') || [],
        allergies: response.data.entry?.filter((e: any) => e.resource.resourceType === 'AllergyIntolerance') || []
      };
    } catch (error) {
      console.error('Epic FHIR patient summary error:', error);
      throw error;
    }
  }

  async requestMedicalRecordsTransfer(transferRequest: {
    patientId: string;
    fromProviderId: string;
    toCommunityId: number;
    familyContactId: string;
    consentDocumentId: string;
  }): Promise<string> {
    if (!this.accessToken && !await this.authenticate()) {
      throw new Error('Epic FHIR authentication required');
    }

    const transferBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: {
            resourceType: 'Task',
            status: 'requested',
            intent: 'order',
            code: {
              coding: [{
                system: 'http://hl7.org/fhir/CodeSystem/task-code',
                code: 'fulfill',
                display: 'Medical Records Transfer'
              }]
            },
            description: `Transfer medical records for senior living admission - Community ID: ${transferRequest.toCommunityId}`,
            for: { reference: `Patient/${transferRequest.patientId}` },
            authoredOn: new Date().toISOString(),
            requester: { reference: `RelatedPerson/${transferRequest.familyContactId}` },
            input: [{
              type: {
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/task-input-type',
                  code: 'reference'
                }]
              },
              valueReference: { reference: `DocumentReference/${transferRequest.consentDocumentId}` }
            }]
          },
          request: {
            method: 'POST',
            url: 'Task'
          }
        }
      ]
    };

    try {
      const response = await axios.post(`${this.baseUrl}`, transferBundle, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/fhir+json'
        }
      });

      return response.data.entry[0].response.location.split('/').pop();
    } catch (error) {
      console.error('Epic FHIR records transfer error:', error);
      throw error;
    }
  }

  async getCareGapAnalysis(patientId: string): Promise<any> {
    if (!this.accessToken && !await this.authenticate()) {
      throw new Error('Epic FHIR authentication required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/Patient/${patientId}/$care-gaps`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        },
        params: {
          periodStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          periodEnd: new Date().toISOString().split('T')[0]
        }
      });

      return {
        patientId,
        careGaps: response.data.parameter?.filter((p: any) => p.name === 'care-gap') || [],
        riskAssessment: this.analyzeCareGaps(response.data)
      };
    } catch (error) {
      console.error('Epic FHIR care gap analysis error:', error);
      return { patientId, careGaps: [], riskAssessment: 'Unable to assess' };
    }
  }

  private analyzeCareGaps(careGapData: any): string {
    const gaps = careGapData.parameter?.filter((p: any) => p.name === 'care-gap') || [];
    
    if (gaps.length === 0) return 'Low risk - no significant care gaps identified';
    if (gaps.length <= 2) return 'Moderate risk - minor care gaps detected';
    return 'High risk - multiple care gaps require attention';
  }
}

export const epicFHIR = new EpicFHIRIntegration();