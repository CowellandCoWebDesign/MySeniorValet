// Medicare.gov API Integration for Benefits Verification
import axios from 'axios';

export class MedicareIntegration {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.MEDICARE_API_BASE_URL || 'https://api.medicare.gov/v1';
    this.apiKey = process.env.MEDICARE_API_KEY || '';
  }

  async verifyMedicareBenefits(beneficiaryData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    medicareNumber: string;
    zipCode: string;
  }): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Medicare API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/beneficiary/coverage`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          first_name: beneficiaryData.firstName,
          last_name: beneficiaryData.lastName,
          dob: beneficiaryData.dateOfBirth,
          medicare_number: beneficiaryData.medicareNumber
        }
      });

      return {
        beneficiaryId: response.data.beneficiary_id,
        partAStatus: response.data.part_a_status,
        partBStatus: response.data.part_b_status,
        partCStatus: response.data.part_c_status,
        partDStatus: response.data.part_d_status,
        supplementalInsurance: response.data.supplemental_coverage || [],
        eligibleServices: this.determineEligibleServices(response.data),
        monthlyPremiums: this.calculateMonthlyPremiums(response.data),
        deductibles: response.data.deductibles || {}
      };
    } catch (error) {
      console.error('Medicare benefits verification error:', error);
      return {
        beneficiaryId: null,
        error: 'Unable to verify Medicare benefits',
        supportedServices: this.getGeneralMedicareServices()
      };
    }
  }

  async getSeniorLivingCoverage(beneficiaryId: string, communityType: 'assisted_living' | 'memory_care' | 'skilled_nursing'): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Medicare API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/coverage/long-term-care`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: {
          beneficiary_id: beneficiaryId,
          service_type: communityType
        }
      });

      return {
        beneficiaryId,
        communityType,
        coverageDetails: {
          isDirect: response.data.covered_directly,
          isPartiallyEligible: response.data.partially_eligible,
          coveragePercentage: response.data.coverage_percentage || 0,
          maxBenefit: response.data.max_annual_benefit,
          waitingPeriod: response.data.waiting_period_days,
          qualificationRequirements: response.data.qualification_requirements || []
        },
        alternativeOptions: this.getAlternativeFunding(communityType),
        estimatedMonthlyBenefit: this.calculateEstimatedBenefit(response.data, communityType)
      };
    } catch (error) {
      console.error('Medicare senior living coverage error:', error);
      return {
        beneficiaryId,
        communityType,
        coverageDetails: { isDirect: false, isPartiallyEligible: false },
        alternativeOptions: this.getAlternativeFunding(communityType),
        estimatedMonthlyBenefit: 0
      };
    }
  }

  async getMedicareAdvantageComparison(zipCode: string, currentPlan?: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Medicare API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/plans/medicare-advantage`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        params: {
          zip_code: zipCode,
          plan_year: new Date().getFullYear()
        }
      });

      const plans = response.data.plans || [];
      
      return {
        zipCode,
        availablePlans: plans.map((plan: any) => ({
          planId: plan.plan_id,
          planName: plan.plan_name,
          insuranceCompany: plan.organization_name,
          monthlyPremium: plan.monthly_premium,
          annualDeductible: plan.annual_deductible,
          outOfPocketMax: plan.out_of_pocket_maximum,
          seniorLivingBenefits: this.extractSeniorLivingBenefits(plan),
          overallRating: plan.overall_rating,
          specialNeedsPlans: plan.special_needs_plan_types || []
        })),
        recommendedPlans: this.recommendPlansForSeniorLiving(plans),
        currentPlanComparison: currentPlan ? this.comparePlan(currentPlan, plans) : null
      };
    } catch (error) {
      console.error('Medicare Advantage comparison error:', error);
      return {
        zipCode,
        availablePlans: [],
        error: 'Unable to retrieve Medicare Advantage plans'
      };
    }
  }

  private determineEligibleServices(beneficiaryData: any): string[] {
    const services = [];
    
    if (beneficiaryData.part_a_status === 'active') {
      services.push('Skilled nursing care (limited days)');
      services.push('Hospice care');
      services.push('Home health care (qualified)');
    }
    
    if (beneficiaryData.part_b_status === 'active') {
      services.push('Physical therapy');
      services.push('Occupational therapy');
      services.push('Medical equipment');
      services.push('Preventive services');
    }
    
    if (beneficiaryData.part_c_status === 'active') {
      services.push('Enhanced benefits through Medicare Advantage');
    }
    
    if (beneficiaryData.part_d_status === 'active') {
      services.push('Prescription drug coverage');
    }
    
    return services;
  }

  private calculateMonthlyPremiums(beneficiaryData: any): any {
    return {
      partB: beneficiaryData.part_b_premium || 170.10, // 2024 standard premium
      partD: beneficiaryData.part_d_premium || 0,
      partC: beneficiaryData.part_c_premium || 0,
      supplemental: beneficiaryData.supplemental_premium || 0,
      total: (beneficiaryData.part_b_premium || 170.10) + 
             (beneficiaryData.part_d_premium || 0) + 
             (beneficiaryData.part_c_premium || 0) +
             (beneficiaryData.supplemental_premium || 0)
    };
  }

  private getGeneralMedicareServices(): string[] {
    return [
      'Skilled nursing care (100 days per benefit period)',
      'Physical and occupational therapy',
      'Medical equipment and supplies',
      'Home health care (if homebound)',
      'Hospice care',
      'Preventive services and screenings'
    ];
  }

  private getAlternativeFunding(communityType: string): string[] {
    const general = [
      'Veterans Aid & Attendance benefits',
      'Long-term care insurance',
      'Medicaid waiver programs',
      'State assistance programs'
    ];

    if (communityType === 'skilled_nursing') {
      general.push('Medicare Part A coverage (first 100 days)');
    }

    return general;
  }

  private calculateEstimatedBenefit(coverageData: any, communityType: string): number {
    if (communityType === 'skilled_nursing' && coverageData.covered_directly) {
      return 4500; // Approximate daily rate coverage
    }
    
    return coverageData.coverage_percentage ? 
      (coverageData.max_annual_benefit / 12) * (coverageData.coverage_percentage / 100) : 0;
  }

  private extractSeniorLivingBenefits(plan: any): string[] {
    const benefits = [];
    
    if (plan.benefits?.includes('home_health')) {
      benefits.push('Enhanced home health services');
    }
    
    if (plan.benefits?.includes('transportation')) {
      benefits.push('Transportation to medical appointments');
    }
    
    if (plan.benefits?.includes('wellness')) {
      benefits.push('Wellness and fitness programs');
    }
    
    if (plan.benefits?.includes('care_coordination')) {
      benefits.push('Care coordination services');
    }
    
    return benefits;
  }

  private recommendPlansForSeniorLiving(plans: any[]): any[] {
    return plans
      .filter(plan => 
        plan.overall_rating >= 4 ||
        plan.benefits?.includes('care_coordination') ||
        plan.special_needs_plan_types?.includes('chronic_condition')
      )
      .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
      .slice(0, 3);
  }

  private comparePlan(currentPlanId: string, availablePlans: any[]): any {
    const currentPlan = availablePlans.find(p => p.plan_id === currentPlanId);
    
    if (!currentPlan) {
      return { error: 'Current plan not found in available options' };
    }
    
    const betterOptions = availablePlans.filter(plan => 
      plan.overall_rating > currentPlan.overall_rating ||
      plan.monthly_premium < currentPlan.monthly_premium
    );
    
    return {
      currentPlan,
      betterOptions,
      recommendation: betterOptions.length > 0 ? 
        'Consider switching for better benefits or lower costs' : 
        'Your current plan is competitive'
    };
  }
}

export const medicareIntegration = new MedicareIntegration();