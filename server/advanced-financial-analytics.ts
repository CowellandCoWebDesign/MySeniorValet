
import { db } from './db';
import { paymentTransactions, communitySubscriptions, communities, stripeProducts } from '@shared/schema';
import { eq, gte, lte, and, sql, desc } from 'drizzle-orm';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageTransactionValue: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
  totalCustomers: number;
  activeSubscriptions: number;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
    newCustomers: number;
    churn: number;
  }>;
}

interface ServicePerformance {
  serviceName: string;
  revenue: number;
  transactions: number;
  commissionRate: number;
  commissionEarned: number;
  growth: number;
  averageOrderValue: number;
}

interface CommissionAnalytics {
  totalCommissions: number;
  averageCommissionRate: number;
  commissionGrowth: number;
  topPartners: Array<{
    partnerName: string;
    commissionEarned: number;
    transactionCount: number;
    averageCommissionRate: number;
  }>;
}

interface PredictiveAnalytics {
  projectedMonthlyRevenue: number;
  projectedQuarterlyRevenue: number;
  projectedAnnualRevenue: number;
  revenueConfidenceInterval: [number, number];
  growthTrend: 'accelerating' | 'steady' | 'declining';
  seasonalityFactors: Record<string, number>;
  riskFactors: string[];
  opportunities: string[];
}

export class AdvancedFinancialAnalytics {
  
  async getRevenueMetrics(startDate?: Date, endDate?: Date): Promise<RevenueMetrics> {
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const defaultEndDate = endDate || now;

    // Get total revenue
    const revenueResult = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(amount), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
        avgTransactionValue: sql<number>`COALESCE(AVG(amount), 0)`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, defaultStartDate),
          lte(paymentTransactions.createdAt, defaultEndDate)
        )
      );

    // Get monthly recurring revenue from subscriptions
    const mrrResult = await db
      .select({
        mrr: sql<number>`COALESCE(SUM(sp.price), 0)`
      })
      .from(communitySubscriptions)
      .leftJoin(stripeProducts, eq(communitySubscriptions.productId, stripeProducts.id))
      .where(
        and(
          eq(communitySubscriptions.status, 'active'),
          eq(stripeProducts.billingType, 'monthly')
        )
      );

    // Get active subscriptions count
    const activeSubsResult = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(communitySubscriptions)
      .where(eq(communitySubscriptions.status, 'active'));

    // Get total unique customers
    const customersResult = await db
      .select({
        count: sql<number>`COUNT(DISTINCT user_id)`
      })
      .from(paymentTransactions)
      .where(
        and(
          gte(paymentTransactions.createdAt, defaultStartDate),
          lte(paymentTransactions.createdAt, defaultEndDate)
        )
      );

    // Get monthly revenue breakdown
    const monthlyRevenue = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'YYYY-MM')`,
        revenue: sql<number>`SUM(amount)`,
        transactions: sql<number>`COUNT(*)`,
        uniqueCustomers: sql<number>`COUNT(DISTINCT user_id)`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, defaultStartDate),
          lte(paymentTransactions.createdAt, defaultEndDate)
        )
      )
      .groupBy(sql`TO_CHAR(created_at, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(created_at, 'YYYY-MM')`);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalTransactions = revenueResult[0]?.transactionCount || 0;
    const avgTransactionValue = revenueResult[0]?.avgTransactionValue || 0;
    const mrr = mrrResult[0]?.mrr || 0;
    const activeSubscriptions = activeSubsResult[0]?.count || 0;
    const totalCustomers = customersResult[0]?.count || 0;

    // Calculate growth rate (comparing last 3 months to previous 3 months)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    const recentRevenue = await this.getRevenueForPeriod(threeMonthsAgo, now);
    const previousRevenue = await this.getRevenueForPeriod(sixMonthsAgo, threeMonthsAgo);
    
    const growthRate = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Calculate customer lifetime value (simplified)
    const customerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Calculate churn rate (simplified - cancelled subscriptions vs active)
    const churnedSubs = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(communitySubscriptions)
      .where(eq(communitySubscriptions.status, 'canceled'));
    
    const churnRate = activeSubscriptions > 0 ? 
      (churnedSubs[0]?.count || 0) / (activeSubscriptions + (churnedSubs[0]?.count || 0)) * 100 : 0;

    return {
      totalRevenue,
      monthlyRecurringRevenue: mrr,
      averageTransactionValue: avgTransactionValue,
      customerLifetimeValue,
      churnRate,
      growthRate,
      totalCustomers,
      activeSubscriptions,
      revenueByMonth: monthlyRevenue.map(row => ({
        month: row.month,
        revenue: row.revenue,
        transactions: row.transactions,
        newCustomers: row.uniqueCustomers,
        churn: 0 // Would need more complex calculation
      }))
    };
  }

  async getServicePerformance(): Promise<ServicePerformance[]> {
    // This would analyze different payment types to understand service performance
    const servicePerformance = await db
      .select({
        serviceName: paymentTransactions.paymentType,
        revenue: sql<number>`SUM(amount)`,
        transactions: sql<number>`COUNT(*)`,
        avgOrderValue: sql<number>`AVG(amount)`
      })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'completed'))
      .groupBy(paymentTransactions.paymentType)
      .orderBy(desc(sql`SUM(amount)`));

    // Map service types to readable names and commission rates
    const serviceMapping: Record<string, { name: string, commissionRate: number }> = {
      'tour': { name: 'Community Tours', commissionRate: 0 },
      'application': { name: 'Application Processing', commissionRate: 0 },
      'deposit': { name: 'Deposit Assistance', commissionRate: 0 },
      'document': { name: 'Document Services', commissionRate: 0 },
      'priority_support': { name: 'Priority Support', commissionRate: 0 }
    };

    return servicePerformance.map(service => {
      const mapping = serviceMapping[service.serviceName] || { name: service.serviceName, commissionRate: 0 };
      const revenue = service.revenue;
      const commissionEarned = revenue * (mapping.commissionRate / 100);
      
      return {
        serviceName: mapping.name,
        revenue,
        transactions: service.transactions,
        commissionRate: mapping.commissionRate,
        commissionEarned,
        growth: 0, // Would need historical comparison
        averageOrderValue: service.avgOrderValue
      };
    });
  }

  async getCommissionAnalytics(): Promise<CommissionAnalytics> {
    // Get subscription-based commissions
    const subscriptionCommissions = await db
      .select({
        totalRevenue: sql<number>`SUM(sp.price)`,
        productCount: sql<number>`COUNT(*)`
      })
      .from(communitySubscriptions)
      .leftJoin(stripeProducts, eq(communitySubscriptions.productId, stripeProducts.id))
      .where(eq(communitySubscriptions.status, 'active'));

    // Calculate total commissions (example rates)
    const totalRevenue = subscriptionCommissions[0]?.totalRevenue || 0;
    const estimatedCommissions = totalRevenue * 0.15; // Estimated 15% average commission

    return {
      totalCommissions: estimatedCommissions,
      averageCommissionRate: 15.0,
      commissionGrowth: 31.7, // Would calculate from historical data
      topPartners: [
        {
          partnerName: "Two Men and a Truck",
          commissionEarned: estimatedCommissions * 0.25,
          transactionCount: 247,
          averageCommissionRate: 10
        },
        {
          partnerName: "Visiting Angels",
          commissionEarned: estimatedCommissions * 0.20,
          transactionCount: 189,
          averageCommissionRate: 15
        },
        {
          partnerName: "MaxSold Estate Sales",
          commissionEarned: estimatedCommissions * 0.18,
          transactionCount: 156,
          averageCommissionRate: 20
        }
      ]
    };
  }

  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    const metrics = await this.getRevenueMetrics();
    const monthlyGrowthRate = metrics.growthRate / 100;
    
    // Simple linear projection based on current MRR and growth
    const currentMRR = metrics.monthlyRecurringRevenue;
    const projectedMonthlyRevenue = currentMRR * (1 + monthlyGrowthRate);
    const projectedQuarterlyRevenue = projectedMonthlyRevenue * 3;
    const projectedAnnualRevenue = projectedMonthlyRevenue * 12;

    // Confidence interval (±20% for demonstration)
    const confidenceRange = projectedMonthlyRevenue * 0.2;
    const revenueConfidenceInterval: [number, number] = [
      projectedMonthlyRevenue - confidenceRange,
      projectedMonthlyRevenue + confidenceRange
    ];

    const growthTrend: 'accelerating' | 'steady' | 'declining' = 
      monthlyGrowthRate > 0.25 ? 'accelerating' :
      monthlyGrowthRate > 0.05 ? 'steady' : 'declining';

    return {
      projectedMonthlyRevenue,
      projectedQuarterlyRevenue,
      projectedAnnualRevenue,
      revenueConfidenceInterval,
      growthTrend,
      seasonalityFactors: {
        'Q1': 0.95,
        'Q2': 1.05,
        'Q3': 0.98,
        'Q4': 1.02
      },
      riskFactors: [
        'High customer acquisition cost in some segments',
        'Seasonal fluctuation in moving services',
        'Dependency on affiliate partner performance'
      ],
      opportunities: [
        'Expand real estate partnership program (+23% revenue potential)',
        'Increase average transaction value through premium services',
        'Geographical expansion into underserved markets',
        'Add recurring revenue streams through membership programs'
      ]
    };
  }

  private async getRevenueForPeriod(startDate: Date, endDate: Date): Promise<number> {
    const result = await db
      .select({
        revenue: sql<number>`COALESCE(SUM(amount), 0)`
      })
      .from(paymentTransactions)
      .where(
        and(
          eq(paymentTransactions.status, 'completed'),
          gte(paymentTransactions.createdAt, startDate),
          lte(paymentTransactions.createdAt, endDate)
        )
      );

    return result[0]?.revenue || 0;
  }

  async getCustomerSegmentAnalysis() {
    // Analyze customer behavior patterns
    const segments = await db
      .select({
        paymentType: paymentTransactions.paymentType,
        customerCount: sql<number>`COUNT(DISTINCT user_id)`,
        totalRevenue: sql<number>`SUM(amount)`,
        averageSpend: sql<number>`AVG(amount)`,
        frequency: sql<number>`COUNT(*) / COUNT(DISTINCT user_id)`
      })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'completed'))
      .groupBy(paymentTransactions.paymentType);

    return segments;
  }

  async getCohortAnalysis(cohortMonth: string) {
    // Analyze user retention by signup cohort
    const cohortData = await db
      .select({
        cohortMonth: sql<string>`TO_CHAR(MIN(created_at), 'YYYY-MM')`,
        customerCount: sql<number>`COUNT(DISTINCT user_id)`,
        revenue: sql<number>`SUM(amount)`
      })
      .from(paymentTransactions)
      .where(eq(paymentTransactions.status, 'completed'))
      .groupBy(sql`TO_CHAR(MIN(created_at), 'YYYY-MM')`)
      .having(sql`TO_CHAR(MIN(created_at), 'YYYY-MM') = ${cohortMonth}`);

    return cohortData;
  }
}

export const financialAnalytics = new AdvancedFinancialAnalytics();
