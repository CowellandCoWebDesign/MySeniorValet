import { db } from '../db';
import { 
  financialTransactions, 
  financialRecords,
  enterpriseMetrics,
  InsertFinancialTransaction,
  InsertFinancialRecord,
  communities
} from '@shared/schema';
import { eq, and, gte, lte, sql, desc, sum, count } from 'drizzle-orm';
import crypto from 'crypto';

export class FinancialService {
  // Record a real financial transaction
  async recordTransaction(data: {
    communityId: number;
    type: 'revenue' | 'expense' | 'refund' | 'adjustment';
    category: string;
    subcategory?: string;
    amount: number;
    currency?: string;
    taxAmount?: number;
    feeAmount?: number;
    paymentMethod?: string;
    paymentProcessor?: string;
    processorTransactionId?: string;
    description?: string;
    notes?: string;
    relatedUserId?: number;
    createdBy?: number;
  }): Promise<void> {
    try {
      const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      
      const transaction: InsertFinancialTransaction = {
        communityId: data.communityId,
        transactionId,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        amount: data.amount.toString(),
        currency: data.currency || 'USD',
        taxAmount: data.taxAmount?.toString(),
        feeAmount: data.feeAmount?.toString(),
        netAmount: (data.amount - (data.feeAmount || 0) - (data.taxAmount || 0)).toString(),
        paymentMethod: data.paymentMethod,
        paymentProcessor: data.paymentProcessor,
        processorTransactionId: data.processorTransactionId,
        status: 'completed',
        description: data.description,
        notes: data.notes,
        relatedUserId: data.relatedUserId,
        transactionDate: new Date(),
        createdBy: data.createdBy
      };

      await db.insert(financialTransactions).values(transaction);
      
      // Also record in simplified financial records for compatibility
      await this.recordFinancialRecord({
        communityId: data.communityId,
        type: data.type === 'revenue' || data.type === 'refund' ? 'revenue' : 'expense',
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: new Date(),
        createdBy: data.createdBy
      });

      // Update daily metrics
      await this.updateFinancialMetrics(data.communityId, new Date());
    } catch (error) {
      console.error('Error recording financial transaction:', error);
      throw error;
    }
  }

  // Record simplified financial record
  async recordFinancialRecord(data: {
    communityId: number;
    type: 'revenue' | 'expense';
    category: string;
    amount: number;
    description?: string;
    date: Date;
    paymentMethod?: string;
    referenceNumber?: string;
    createdBy?: number;
  }): Promise<void> {
    try {
      const record: InsertFinancialRecord = {
        communityId: data.communityId,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        date: data.date.toISOString().split('T')[0] as any,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        createdBy: data.createdBy
      };

      await db.insert(financialRecords).values(record);
    } catch (error) {
      console.error('Error recording financial record:', error);
    }
  }

  // Get real financial analytics for a community
  async getCommunityFinancials(communityId: number, startDate: Date, endDate: Date) {
    // Get revenue breakdown from real transactions
    const revenueBreakdown = await db
      .select({
        category: financialTransactions.category,
        total: sql<number>`SUM(CAST(${financialTransactions.amount} AS DECIMAL))`,
        count: count()
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.communityId, communityId),
          eq(financialTransactions.type, 'revenue'),
          eq(financialTransactions.status, 'completed'),
          gte(financialTransactions.transactionDate, startDate),
          lte(financialTransactions.transactionDate, endDate)
        )
      )
      .groupBy(financialTransactions.category);

    // Get expense breakdown from real transactions
    const expenseBreakdown = await db
      .select({
        category: financialTransactions.category,
        total: sql<number>`SUM(CAST(${financialTransactions.amount} AS DECIMAL))`,
        count: count()
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.communityId, communityId),
          eq(financialTransactions.type, 'expense'),
          eq(financialTransactions.status, 'completed'),
          gte(financialTransactions.transactionDate, startDate),
          lte(financialTransactions.transactionDate, endDate)
        )
      )
      .groupBy(financialTransactions.category);

    // Get total revenue and expenses
    const totals = await db
      .select({
        totalRevenue: sql<number>`
          SUM(CASE WHEN ${financialTransactions.type} = 'revenue' 
               THEN CAST(${financialTransactions.amount} AS DECIMAL) 
               ELSE 0 END)`,
        totalExpenses: sql<number>`
          SUM(CASE WHEN ${financialTransactions.type} = 'expense' 
               THEN CAST(${financialTransactions.amount} AS DECIMAL) 
               ELSE 0 END)`,
        totalRefunds: sql<number>`
          SUM(CASE WHEN ${financialTransactions.type} = 'refund' 
               THEN CAST(${financialTransactions.amount} AS DECIMAL) 
               ELSE 0 END)`,
        transactionCount: count()
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.communityId, communityId),
          eq(financialTransactions.status, 'completed'),
          gte(financialTransactions.transactionDate, startDate),
          lte(financialTransactions.transactionDate, endDate)
        )
      );

    // Get payment method breakdown
    const paymentMethods = await db
      .select({
        method: financialTransactions.paymentMethod,
        total: sql<number>`SUM(CAST(${financialTransactions.amount} AS DECIMAL))`,
        count: count()
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.communityId, communityId),
          eq(financialTransactions.type, 'revenue'),
          gte(financialTransactions.transactionDate, startDate),
          lte(financialTransactions.transactionDate, endDate)
        )
      )
      .groupBy(financialTransactions.paymentMethod);

    // Get monthly trends
    const monthlyTrends = await db
      .select({
        month: sql<string>`TO_CHAR(${financialTransactions.transactionDate}, 'YYYY-MM')`,
        revenue: sql<number>`
          SUM(CASE WHEN ${financialTransactions.type} = 'revenue' 
               THEN CAST(${financialTransactions.amount} AS DECIMAL) 
               ELSE 0 END)`,
        expenses: sql<number>`
          SUM(CASE WHEN ${financialTransactions.type} = 'expense' 
               THEN CAST(${financialTransactions.amount} AS DECIMAL) 
               ELSE 0 END)`
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.communityId, communityId),
          eq(financialTransactions.status, 'completed'),
          gte(financialTransactions.transactionDate, new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`TO_CHAR(${financialTransactions.transactionDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${financialTransactions.transactionDate}, 'YYYY-MM')`);

    // Get outstanding balances (pending transactions)
    const outstandingBalance = await db
      .select({
        total: sql<number>`SUM(CAST(${financialTransactions.amount} AS DECIMAL))`
      })
      .from(financialTransactions)
      .where(
        and(
          eq(financialTransactions.communityId, communityId),
          eq(financialTransactions.status, 'pending')
        )
      );

    // Calculate real metrics
    const totalRevenue = totals[0]?.totalRevenue || 0;
    const totalExpenses = totals[0]?.totalExpenses || 0;
    const totalRefunds = totals[0]?.totalRefunds || 0;
    const netIncome = totalRevenue - totalExpenses - totalRefunds;
    const profitMargin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0';

    return {
      summary: {
        totalRevenue,
        totalExpenses,
        netIncome,
        profitMargin: `${profitMargin}%`,
        transactionCount: totals[0]?.transactionCount || 0,
        outstandingBalance: outstandingBalance[0]?.total || 0
      },
      revenue: {
        breakdown: revenueBreakdown.map(r => ({
          category: r.category,
          amount: r.total,
          count: r.count,
          percentage: totalRevenue > 0 ? Math.round((r.total / totalRevenue) * 100) : 0
        })),
        total: totalRevenue
      },
      expenses: {
        breakdown: expenseBreakdown.map(e => ({
          category: e.category,
          amount: e.total,
          count: e.count,
          percentage: totalExpenses > 0 ? Math.round((e.total / totalExpenses) * 100) : 0
        })),
        total: totalExpenses
      },
      paymentMethods: paymentMethods.map(pm => ({
        method: pm.method || 'Unknown',
        amount: pm.total,
        count: pm.count
      })),
      trends: {
        monthly: monthlyTrends.map(t => ({
          month: t.month,
          revenue: t.revenue,
          expenses: t.expenses,
          netIncome: t.revenue - t.expenses
        }))
      }
    };
  }

  // Update financial metrics in enterprise_metrics table
  async updateFinancialMetrics(communityId: number, date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const financials = await this.getCommunityFinancials(communityId, startOfDay, endOfDay);

      // Update or insert metrics
      await db
        .insert(enterpriseMetrics)
        .values({
          communityId,
          date: startOfDay.toISOString().split('T')[0] as any,
          period: 'daily',
          totalRevenue: financials.summary.totalRevenue.toString(),
          totalExpenses: financials.summary.totalExpenses.toString(),
          netIncome: financials.summary.netIncome.toString(),
          outstandingBalance: financials.summary.outstandingBalance.toString()
        })
        .onConflictDoUpdate({
          target: [enterpriseMetrics.communityId, enterpriseMetrics.date, enterpriseMetrics.period],
          set: {
            totalRevenue: financials.summary.totalRevenue.toString(),
            totalExpenses: financials.summary.totalExpenses.toString(),
            netIncome: financials.summary.netIncome.toString(),
            outstandingBalance: financials.summary.outstandingBalance.toString(),
            updatedAt: new Date()
          }
        });
    } catch (error) {
      console.error('Error updating financial metrics:', error);
    }
  }

  // Get budget performance
  async getBudgetPerformance(communityId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const actual = await this.getCommunityFinancials(communityId, startDate, endDate);
    
    // For now, we'll use estimated budgets based on historical averages
    // In production, these would come from a budgets table
    const lastYearStart = new Date(year - 1, month - 1, 1);
    const lastYearEnd = new Date(year - 1, month, 0);
    const lastYear = await this.getCommunityFinancials(communityId, lastYearStart, lastYearEnd);

    const budgetedRevenue = lastYear.summary.totalRevenue * 1.1; // 10% growth target
    const budgetedExpenses = lastYear.summary.totalExpenses * 1.05; // 5% expense increase

    return {
      revenue: {
        budgeted: budgetedRevenue,
        actual: actual.summary.totalRevenue,
        variance: actual.summary.totalRevenue - budgetedRevenue,
        percentageOfBudget: budgetedRevenue > 0 ? 
          Math.round((actual.summary.totalRevenue / budgetedRevenue) * 100) : 0
      },
      expenses: {
        budgeted: budgetedExpenses,
        actual: actual.summary.totalExpenses,
        variance: actual.summary.totalExpenses - budgetedExpenses,
        percentageOfBudget: budgetedExpenses > 0 ? 
          Math.round((actual.summary.totalExpenses / budgetedExpenses) * 100) : 0
      }
    };
  }

  // Process Stripe subscription payment
  async processStripePayment(data: {
    communityId: number;
    amount: number;
    stripePaymentIntentId: string;
    subscriptionTier: string;
    userId: number;
  }): Promise<void> {
    await this.recordTransaction({
      communityId: data.communityId,
      type: 'revenue',
      category: 'subscription',
      subcategory: data.subscriptionTier,
      amount: data.amount,
      paymentMethod: 'credit_card',
      paymentProcessor: 'stripe',
      processorTransactionId: data.stripePaymentIntentId,
      description: `${data.subscriptionTier} subscription payment`,
      relatedUserId: data.userId,
      createdBy: data.userId
    });
  }
}

export const financialService = new FinancialService();