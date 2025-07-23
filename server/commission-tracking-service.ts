
import { db } from './db';
import { paymentTransactions, communitySubscriptions, communities, stripeProducts } from '@shared/schema';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';

interface CommissionRule {
  id: string;
  partnerName: string;
  serviceCategory: string;
  commissionType: 'percentage' | 'fixed' | 'tiered';
  rate: number;
  minThreshold?: number;
  maxCap?: number;
  tierRates?: Array<{ threshold: number; rate: number }>;
  payoutSchedule: 'monthly' | 'quarterly' | 'immediate';
  isActive: boolean;
}

interface CommissionTransaction {
  id: string;
  transactionId: string;
  partnerName: string;
  serviceCategory: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'calculated' | 'paid' | 'disputed';
  calculatedAt: Date;
  payoutDate?: Date;
  metadata: Record<string, any>;
}

interface PartnerPerformance {
  partnerName: string;
  totalCommissions: number;
  totalTransactions: number;
  averageCommissionRate: number;
  totalRevenue: number;
  growthRate: number;
  lastPayoutDate?: Date;
  nextPayoutAmount: number;
  outstandingBalance: number;
  performanceScore: number;
}

interface CommissionReport {
  period: string;
  totalCommissions: number;
  totalPaid: number;
  totalPending: number;
  totalDisputed: number;
  partnerBreakdown: PartnerPerformance[];
  topPerformingServices: Array<{
    serviceName: string;
    commissionGenerated: number;
    transactionCount: number;
  }>;
  payoutSchedule: Array<{
    partner: string;
    amount: number;
    dueDate: Date;
  }>;
}

export class CommissionTrackingService {
  private commissionRules: CommissionRule[] = [
    {
      id: 'moving-twomen',
      partnerName: 'Two Men and a Truck',
      serviceCategory: 'moving',
      commissionType: 'percentage',
      rate: 10,
      payoutSchedule: 'monthly',
      isActive: true
    },
    {
      id: 'healthcare-visiting',
      partnerName: 'Visiting Angels',
      serviceCategory: 'healthcare',
      commissionType: 'percentage',
      rate: 15,
      payoutSchedule: 'monthly',
      isActive: true
    },
    {
      id: 'insurance-aarp',
      partnerName: 'AARP Insurance',
      serviceCategory: 'insurance',
      commissionType: 'percentage',
      rate: 12,
      payoutSchedule: 'quarterly',
      isActive: true
    },
    {
      id: 'estate-maxsold',
      partnerName: 'MaxSold Estate Sales',
      serviceCategory: 'estate_sales',
      commissionType: 'percentage',
      rate: 20,
      payoutSchedule: 'monthly',
      isActive: true
    },
    {
      id: 'transport-gogo',
      partnerName: 'GoGoGrandparent',
      serviceCategory: 'transportation',
      commissionType: 'percentage',
      rate: 12,
      payoutSchedule: 'monthly',
      isActive: true
    },
    {
      id: 'legal-elderlaw',
      partnerName: 'Elder Law Partners',
      serviceCategory: 'legal',
      commissionType: 'percentage',
      rate: 15,
      payoutSchedule: 'monthly',
      isActive: true
    },
    {
      id: 'realestate-sres',
      partnerName: 'Senior Real Estate Specialists',
      serviceCategory: 'real_estate',
      commissionType: 'percentage',
      rate: 25,
      payoutSchedule: 'monthly',
      isActive: true
    }
  ];

  async calculateCommission(transactionId: string, serviceCategory: string, grossAmount: number): Promise<CommissionTransaction | null> {
    // Find applicable commission rule
    const rule = this.commissionRules.find(r => 
      r.serviceCategory === serviceCategory && r.isActive
    );

    if (!rule) {
      console.log(`No commission rule found for service category: ${serviceCategory}`);
      return null;
    }

    let commissionAmount = 0;
    let commissionRate = rule.rate;

    switch (rule.commissionType) {
      case 'percentage':
        commissionAmount = (grossAmount * rule.rate) / 100;
        break;
      
      case 'fixed':
        commissionAmount = rule.rate;
        commissionRate = (rule.rate / grossAmount) * 100;
        break;
      
      case 'tiered':
        if (rule.tierRates) {
          for (const tier of rule.tierRates.sort((a, b) => b.threshold - a.threshold)) {
            if (grossAmount >= tier.threshold) {
              commissionAmount = (grossAmount * tier.rate) / 100;
              commissionRate = tier.rate;
              break;
            }
          }
        }
        break;
    }

    // Apply caps if specified
    if (rule.maxCap && commissionAmount > rule.maxCap) {
      commissionAmount = rule.maxCap;
      commissionRate = (rule.maxCap / grossAmount) * 100;
    }

    // Check minimum threshold
    if (rule.minThreshold && grossAmount < rule.minThreshold) {
      console.log(`Transaction below minimum threshold for ${rule.partnerName}`);
      return null;
    }

    const commissionTransaction: CommissionTransaction = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      partnerName: rule.partnerName,
      serviceCategory,
      grossAmount,
      commissionRate,
      commissionAmount,
      status: 'calculated',
      calculatedAt: new Date(),
      metadata: {
        ruleId: rule.id,
        commissionType: rule.commissionType,
        payoutSchedule: rule.payoutSchedule
      }
    };

    // Store commission transaction in database (would need new table)
    console.log(`Commission calculated: ${rule.partnerName} - $${commissionAmount.toFixed(2)} (${commissionRate.toFixed(2)}%)`);
    
    return commissionTransaction;
  }

  async getPartnerPerformance(partnerName?: string, startDate?: Date, endDate?: Date): Promise<PartnerPerformance[]> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const defaultEndDate = endDate || now;

    // Mock data for now - would query actual commission transactions table
    const mockPerformance: PartnerPerformance[] = [
      {
        partnerName: 'Two Men and a Truck',
        totalCommissions: 18542,
        totalTransactions: 247,
        averageCommissionRate: 10,
        totalRevenue: 185420,
        growthRate: 34.2,
        nextPayoutAmount: 3247,
        outstandingBalance: 5891,
        performanceScore: 92
      },
      {
        partnerName: 'Visiting Angels',
        totalCommissions: 13401,
        totalTransactions: 203,
        averageCommissionRate: 15,
        totalRevenue: 89340,
        growthRate: 22.3,
        nextPayoutAmount: 2156,
        outstandingBalance: 4023,
        performanceScore: 88
      },
      {
        partnerName: 'AARP Insurance',
        totalCommissions: 15342,
        totalTransactions: 389,
        averageCommissionRate: 12,
        totalRevenue: 127850,
        growthRate: 28.7,
        nextPayoutAmount: 2784,
        outstandingBalance: 6891,
        performanceScore: 95
      },
      {
        partnerName: 'MaxSold Estate Sales',
        totalCommissions: 19124,
        totalTransactions: 156,
        averageCommissionRate: 20,
        totalRevenue: 95620,
        growthRate: 18.9,
        nextPayoutAmount: 3642,
        outstandingBalance: 7234,
        performanceScore: 86
      },
      {
        partnerName: 'Senior Real Estate Specialists',
        totalCommissions: 19223,
        totalTransactions: 89,
        averageCommissionRate: 25,
        totalRevenue: 76890,
        growthRate: 31.5,
        nextPayoutAmount: 4156,
        outstandingBalance: 8967,
        performanceScore: 91
      }
    ];

    return partnerName ? 
      mockPerformance.filter(p => p.partnerName === partnerName) : 
      mockPerformance;
  }

  async generateCommissionReport(period: string): Promise<CommissionReport> {
    const partners = await this.getPartnerPerformance();
    
    const totalCommissions = partners.reduce((sum, p) => sum + p.totalCommissions, 0);
    const totalPending = partners.reduce((sum, p) => sum + p.outstandingBalance, 0);
    const totalPaid = totalCommissions - totalPending;

    return {
      period,
      totalCommissions,
      totalPaid,
      totalPending,
      totalDisputed: 1247, // Mock value
      partnerBreakdown: partners,
      topPerformingServices: [
        {
          serviceName: 'Professional Moving Services',
          commissionGenerated: 18542,
          transactionCount: 247
        },
        {
          serviceName: 'Senior Real Estate Services',
          commissionGenerated: 19223,
          transactionCount: 89
        },
        {
          serviceName: 'Estate Sale & Downsizing',
          commissionGenerated: 19124,
          transactionCount: 156
        }
      ],
      payoutSchedule: [
        {
          partner: 'Two Men and a Truck',
          amount: 3247,
          dueDate: new Date(2024, 11, 31)
        },
        {
          partner: 'AARP Insurance',
          amount: 6891,
          dueDate: new Date(2025, 0, 15)
        },
        {
          partner: 'MaxSold Estate Sales',
          amount: 3642,
          dueDate: new Date(2024, 11, 31)
        }
      ]
    };
  }

  async processPayouts(partnerId: string, amount: number): Promise<boolean> {
    try {
      // Would integrate with payment processor to send commissions
      console.log(`Processing payout: ${partnerId} - $${amount}`);
      
      // Update commission transactions to 'paid' status
      // Send payment via ACH/Wire/PayPal
      // Generate payout confirmation
      // Send notification to partner
      
      return true;
    } catch (error) {
      console.error('Payout processing failed:', error);
      return false;
    }
  }

  async getCommissionRules(): Promise<CommissionRule[]> {
    return this.commissionRules.filter(rule => rule.isActive);
  }

  async updateCommissionRule(ruleId: string, updates: Partial<CommissionRule>): Promise<boolean> {
    const ruleIndex = this.commissionRules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) return false;

    this.commissionRules[ruleIndex] = {
      ...this.commissionRules[ruleIndex],
      ...updates
    };

    console.log(`Commission rule updated: ${ruleId}`);
    return true;
  }

  async createCommissionRule(rule: Omit<CommissionRule, 'id'>): Promise<string> {
    const newRule: CommissionRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.commissionRules.push(newRule);
    console.log(`New commission rule created: ${newRule.id} for ${newRule.partnerName}`);
    
    return newRule.id;
  }

  async getCommissionAnalytics() {
    const partners = await this.getPartnerPerformance();
    
    return {
      totalPartners: partners.length,
      activeRules: this.commissionRules.filter(r => r.isActive).length,
      averageCommissionRate: partners.reduce((sum, p) => sum + p.averageCommissionRate, 0) / partners.length,
      topPerformingPartner: partners.reduce((top, current) => 
        current.totalCommissions > top.totalCommissions ? current : top
      ),
      monthlyCommissionTrend: [
        { month: 'Jan', amount: 45230 },
        { month: 'Feb', amount: 52140 },
        { month: 'Mar', amount: 48960 },
        { month: 'Apr', amount: 61780 },
        { month: 'May', amount: 68420 },
        { month: 'Jun', amount: 74590 }
      ],
      commissionByCategory: [
        { category: 'Moving & Relocation', amount: 37666, percentage: 42 },
        { category: 'Real Estate', amount: 19223, percentage: 21 },
        { category: 'Estate Sales', amount: 19124, percentage: 21 },
        { category: 'Insurance', amount: 15342, percentage: 17 },
        { category: 'Healthcare', amount: 13401, percentage: 15 }
      ]
    };
  }
}

export const commissionTracker = new CommissionTrackingService();
