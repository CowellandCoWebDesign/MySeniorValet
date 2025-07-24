// Cerner Health API Integration for Healthcare Provider Coordination
import axios from 'axios';

export class CernerHealthIntegration {
  private baseUrl: string;
  private clientId: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.CERNER_BASE_URL || 'https://fhir-open.cerner.com/r4';
    this.clientId = process.env.CERNER_CLIENT_ID || '';
  }

  async authenticate(): Promise<boolean> {
    if (!process.env.CERNER_CLIENT_SECRET || !this.clientId) {
      console.log('Cerner Health credentials not configured');
      return false;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: process.env.CERNER_CLIENT_SECRET,
        scope: 'patient/Patient.read patient/Condition.read patient/MedicationRequest.read'
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      return true;
    } catch (error) {
      console.error('Cerner authentication failed:', error);
      return false;
    }
  }

  async getPatientCareTeam(patientId: string): Promise<any> {
    if (!this.accessToken && !await this.authenticate()) {
      throw new Error('Cerner authentication required');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/CareTeam`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/fhir+json'
        },
        params: { patient: patientId }
      });

      return {
        patientId,
        careTeamMembers: response.data.entry?.map((entry: any) => ({
          id: entry.resource.id,
          role: entry.resource.participant?.[0]?.role?.[0]?.text || 'Unknown',
          provider: entry.resource.participant?.[0]?.member?.display || 'Unknown Provider',
          period: entry.resource.period,
          status: entry.resource.status
        })) || []
      };
    } catch (error) {
      console.error('Cerner care team error:', error);
      return { patientId, careTeamMembers: [] };
    }
  }

  async createTransitionOfCare(transitionData: {
    patientId: string;
    fromProviderId: string;
    toCommunityId: number;
    transitionDate: string;
    careTeamIds: string[];
    familyContacts: Array<{ name: string; relationship: string; phone: string; email: string }>;
  }): Promise<string> {
    if (!this.accessToken && !await this.authenticate()) {
      throw new Error('Cerner authentication required');
    }

    const transitionPlan = {
      resourceType: 'CarePlan',
      status: 'active',
      intent: 'plan',
      category: [{
        coding: [{
          system: 'http://hl7.org/fhir/us/core/CodeSystem/careplan-category',
          code: 'transition',
          display: 'Transition of Care'
        }]
      }],
      title: 'Senior Living Transition of Care Plan',
      description: `Coordinated care transition to senior living community (ID: ${transitionData.toCommunityId})`,
      subject: { reference: `Patient/${transitionData.patientId}` },
      period: {
        start: transitionData.transitionDate
      },
      careTeam: transitionData.careTeamIds.map(id => ({ reference: `CareTeam/${id}` })),
      activity: [
        {
          detail: {
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: '182836005',
                display: 'Review of medication'
              }]
            },
            status: 'scheduled',
            description: 'Medication reconciliation and review',
            scheduledTiming: {
              repeat: {
                boundsPeriod: {
                  start: transitionData.transitionDate
                }
              }
            }
          }
        },
        {
          detail: {
            code: {
              coding: [{
                system: 'http://snomed.info/sct',
                code: '408443003',
                display: 'General medical examination'
              }]
            },
            status: 'scheduled',
            description: 'Pre-admission health assessment',
            scheduledTiming: {
              repeat: {
                boundsPeriod: {
                  start: new Date(new Date(transitionData.transitionDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
                }
              }
            }
          }
        }
      ]
    };

    try {
      const response = await axios.post(`${this.baseUrl}/CarePlan`, transitionPlan, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/fhir+json'
        }
      });

      // Notify family contacts
      await this.notifyFamilyContacts(transitionData.familyContacts, response.data.id);

      return response.data.id;
    } catch (error) {
      console.error('Cerner transition of care error:', error);
      throw error;
    }
  }

  private async notifyFamilyContacts(contacts: any[], carePlanId: string): Promise<void> {
    for (const contact of contacts) {
      try {
        const communication = {
          resourceType: 'Communication',
          status: 'completed',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/communication-category',
              code: 'notification'
            }]
          }],
          medium: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationMode',
              code: 'EMAILWRIT',
              display: 'email'
            }]
          }],
          subject: { reference: `CarePlan/${carePlanId}` },
          recipient: [{
            display: `${contact.name} (${contact.relationship})`
          }],
          payload: [{
            contentString: `Transition of care plan has been created for your family member's move to senior living. Care team coordination is now active. Contact: ${contact.phone}`
          }],
          sent: new Date().toISOString()
        };

        await axios.post(`${this.baseUrl}/Communication`, communication, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/fhir+json'
          }
        });
      } catch (error) {
        console.error(`Failed to notify family contact ${contact.name}:`, error);
      }
    }
  }

  async getHealthSummary(patientId: string): Promise<any> {
    if (!this.accessToken && !await this.authenticate()) {
      throw new Error('Cerner authentication required');
    }

    try {
      const [patient, conditions, medications] = await Promise.all([
        axios.get(`${this.baseUrl}/Patient/${patientId}`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` }
        }),
        axios.get(`${this.baseUrl}/Condition`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
          params: { patient: patientId }
        }),
        axios.get(`${this.baseUrl}/MedicationRequest`, {
          headers: { 'Authorization': `Bearer ${this.accessToken}` },
          params: { patient: patientId }
        })
      ]);

      return {
        patient: patient.data,
        activeConditions: conditions.data.entry?.filter((e: any) => 
          e.resource.clinicalStatus?.coding?.[0]?.code === 'active'
        ) || [],
        currentMedications: medications.data.entry?.filter((e: any) =>
          e.resource.status === 'active'
        ) || [],
        careRequirements: this.assessCareRequirements(conditions.data.entry || [])
      };
    } catch (error) {
      console.error('Cerner health summary error:', error);
      throw error;
    }
  }

  private assessCareRequirements(conditions: any[]): string[] {
    const requirements = [];
    
    for (const condition of conditions) {
      const code = condition.resource?.code?.coding?.[0]?.code;
      const display = condition.resource?.code?.coding?.[0]?.display || '';
      
      if (display.toLowerCase().includes('diabetes')) {
        requirements.push('Diabetes management and monitoring');
      }
      if (display.toLowerCase().includes('dementia') || display.toLowerCase().includes('alzheimer')) {
        requirements.push('Memory care services');
      }
      if (display.toLowerCase().includes('hypertension')) {
        requirements.push('Blood pressure monitoring');
      }
      if (display.toLowerCase().includes('fall') || code === '129839007') {
        requirements.push('Fall prevention measures');
      }
    }
    
    return [...new Set(requirements)];
  }
}

export const cernerHealth = new CernerHealthIntegration();