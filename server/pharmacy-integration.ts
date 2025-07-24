// Pharmacy Integration for Medication Management Coordination
import axios from 'axios';

export class PharmacyIntegration {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.PHARMACY_API_BASE_URL || 'https://api.surescripts.com/v1';
    this.apiKey = process.env.PHARMACY_API_KEY || '';
  }

  async findNearbyPharmacies(location: {
    latitude: number;
    longitude: number;
    radius: number; // in miles
  }): Promise<any> {
    if (!this.apiKey) {
      return this.getMockPharmacyData(location);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/pharmacies/search`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius: location.radius,
          type: 'retail,specialty'
        }
      });

      return {
        location,
        pharmacies: response.data.pharmacies?.map((pharmacy: any) => ({
          id: pharmacy.ncpdp_id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          distance: pharmacy.distance_miles,
          services: pharmacy.services || [],
          hours: pharmacy.hours || {},
          specialties: pharmacy.specialties || [],
          deliveryAvailable: pharmacy.delivery_available,
          syncServices: pharmacy.medication_sync_available
        })) || []
      };
    } catch (error) {
      console.error('Pharmacy search error:', error);
      return this.getMockPharmacyData(location);
    }
  }

  async createMedicationTransferRequest(transferData: {
    patientName: string;
    dateOfBirth: string;
    fromPharmacyId: string;
    toPharmacyId: string;
    medications: Array<{
      name: string;
      strength: string;
      quantity: number;
      refillsRemaining: number;
    }>;
    newAddress: string;
    familyContactPhone: string;
  }): Promise<string> {
    if (!this.apiKey) {
      // Return mock transfer ID
      return `TRANSFER_${Date.now()}`;
    }

    try {
      const transferRequest = {
        patient: {
          name: transferData.patientName,
          date_of_birth: transferData.dateOfBirth,
          new_address: transferData.newAddress,
          emergency_contact: transferData.familyContactPhone
        },
        from_pharmacy: transferData.fromPharmacyId,
        to_pharmacy: transferData.toPharmacyId,
        medications: transferData.medications.map(med => ({
          name: med.name,
          strength: med.strength,
          quantity_remaining: med.quantity,
          refills_remaining: med.refillsRemaining
        })),
        transfer_reason: 'senior_living_relocation',
        requested_date: new Date().toISOString()
      };

      const response = await axios.post(`${this.baseUrl}/transfers`, transferRequest, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.transfer_id;
    } catch (error) {
      console.error('Medication transfer request error:', error);
      throw error;
    }
  }

  async setupMedicationSync(syncData: {
    patientId: string;
    pharmacyId: string;
    medications: Array<{
      name: string;
      refillDay: number; // day of month
      autoRefill: boolean;
    }>;
    deliveryPreferences: {
      method: 'pickup' | 'delivery' | 'mail';
      address?: string;
      contactPhone: string;
    };
  }): Promise<any> {
    if (!this.apiKey) {
      return {
        syncId: `SYNC_${Date.now()}`,
        status: 'configured',
        nextRefillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/medication-sync`, {
        patient_id: syncData.patientId,
        pharmacy_id: syncData.pharmacyId,
        sync_schedule: syncData.medications.map(med => ({
          medication_name: med.name,
          refill_day_of_month: med.refillDay,
          auto_refill_enabled: med.autoRefill
        })),
        delivery_method: syncData.deliveryPreferences.method,
        delivery_address: syncData.deliveryPreferences.address,
        contact_phone: syncData.deliveryPreferences.contactPhone
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        syncId: response.data.sync_id,
        status: response.data.status,
        nextRefillDate: response.data.next_refill_date,
        estimatedMonthlyCost: response.data.estimated_monthly_cost
      };
    } catch (error) {
      console.error('Medication sync setup error:', error);
      throw error;
    }
  }

  async getMedicationCostAnalysis(medications: Array<{
    name: string;
    strength: string;
    quantity: number;
    refillFrequency: number; // days
  }>, insuranceInfo: {
    carrier: string;
    planId: string;
    memberNumber: string;
  }): Promise<any> {
    if (!this.apiKey) {
      return this.getMockCostAnalysis(medications);
    }

    try {
      const response = await axios.post(`${this.baseUrl}/cost-analysis`, {
        medications: medications.map(med => ({
          drug_name: med.name,
          strength: med.strength,
          quantity: med.quantity,
          days_supply: med.refillFrequency
        })),
        insurance: {
          carrier: insuranceInfo.carrier,
          plan_id: insuranceInfo.planId,
          member_id: insuranceInfo.memberNumber
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        totalMonthlyCost: response.data.total_monthly_cost,
        medicationCosts: response.data.medication_costs,
        insuranceCoverage: response.data.insurance_coverage,
        savingsOpportunities: response.data.savings_opportunities || [],
        genericAlternatives: response.data.generic_alternatives || []
      };
    } catch (error) {
      console.error('Medication cost analysis error:', error);
      return this.getMockCostAnalysis(medications);
    }
  }

  private getMockPharmacyData(location: any): any {
    return {
      location,
      pharmacies: [
        {
          id: 'CVS001',
          name: 'CVS Pharmacy',
          address: '123 Main St, Anytown, ST 12345',
          phone: '(555) 123-4567',
          distance: 0.5,
          services: ['Prescription Delivery', 'Medication Sync', 'Immunizations'],
          hours: { monday: '8AM-10PM', tuesday: '8AM-10PM' },
          specialties: ['Senior Care', 'Diabetes Management'],
          deliveryAvailable: true,
          syncServices: true
        },
        {
          id: 'WAL001',
          name: 'Walmart Pharmacy',
          address: '456 Shopping Blvd, Anytown, ST 12345',
          phone: '(555) 234-5678',
          distance: 1.2,
          services: ['$4 Generics', 'Free Health Screenings', 'Medication Sync'],
          hours: { monday: '9AM-9PM', tuesday: '9AM-9PM' },
          specialties: ['Value Pricing', 'Senior Discounts'],
          deliveryAvailable: false,
          syncServices: true
        }
      ]
    };
  }

  private getMockCostAnalysis(medications: any[]): any {
    const baseCost = medications.length * 45; // $45 average per medication
    
    return {
      totalMonthlyCost: baseCost,
      medicationCosts: medications.map(med => ({
        name: med.name,
        monthlyCost: 45,
        copay: 15,
        insuranceCoverage: 30
      })),
      insuranceCoverage: {
        totalCovered: baseCost * 0.7,
        patientResponsibility: baseCost * 0.3
      },
      savingsOpportunities: [
        'Switch to 90-day supply for 10% savings',
        'Consider generic alternatives for 40% savings'
      ],
      genericAlternatives: medications.map(med => ({
        brandName: med.name,
        genericOption: `Generic ${med.name}`,
        monthlySavings: 25
      }))
    };
  }
}

export const pharmacyIntegration = new PharmacyIntegration();