import { db } from '../db';
import { 
  complianceAudits,
  complianceRecords,
  enterpriseMetrics,
  InsertComplianceAudit,
  InsertComplianceRecord
} from '@shared/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';

export class ComplianceService {
  // Create a new compliance audit
  async createAudit(data: {
    communityId: number;
    auditType: string;
    auditCategory: string;
    auditScope?: string;
    regulatoryBody?: string;
    regulationCode?: string;
    complianceStandard?: string;
    scheduledDate: Date;
    leadAuditor?: string;
    auditTeam?: string[];
    responsibleManager?: number;
    createdBy?: number;
  }): Promise<void> {
    try {
      const audit: InsertComplianceAudit = {
        communityId: data.communityId,
        auditType: data.auditType,
        auditCategory: data.auditCategory,
        auditScope: data.auditScope,
        regulatoryBody: data.regulatoryBody,
        regulationCode: data.regulationCode,
        complianceStandard: data.complianceStandard,
        status: 'scheduled',
        scheduledDate: data.scheduledDate.toISOString().split('T')[0] as any,
        leadAuditor: data.leadAuditor,
        auditTeam: data.auditTeam || [],
        responsibleManager: data.responsibleManager,
        createdBy: data.createdBy
      };

      await db.insert(complianceAudits).values(audit);
    } catch (error) {
      console.error('Error creating compliance audit:', error);
      throw error;
    }
  }

  // Record a compliance check result
  async recordComplianceCheck(data: {
    communityId: number;
    regulationType: string;
    checkType: string;
    status: 'passed' | 'failed' | 'pending';
    severity?: 'critical' | 'high' | 'medium' | 'low';
    checkDate: Date;
    dueDate?: Date;
    notes?: string;
    inspector?: string;
    documentUrl?: string;
  }): Promise<void> {
    try {
      const record: InsertComplianceRecord = {
        communityId: data.communityId,
        regulationType: data.regulationType,
        checkType: data.checkType,
        status: data.status,
        severity: data.severity,
        checkDate: data.checkDate.toISOString().split('T')[0] as any,
        dueDate: data.dueDate?.toISOString().split('T')[0] as any,
        notes: data.notes,
        inspector: data.inspector,
        documentUrl: data.documentUrl
      };

      await db.insert(complianceRecords).values(record);
      
      // Update compliance metrics
      await this.updateComplianceMetrics(data.communityId, new Date());
    } catch (error) {
      console.error('Error recording compliance check:', error);
      throw error;
    }
  }

  // Add findings to an audit
  async addAuditFindings(auditId: number, findings: Array<{
    category: string;
    severity: 'critical' | 'major' | 'minor';
    description: string;
    location: string;
    recommendation: string;
    deadline: string;
  }>): Promise<void> {
    try {
      const [audit] = await db
        .select()
        .from(complianceAudits)
        .where(eq(complianceAudits.id, auditId));

      if (!audit) {
        throw new Error('Audit not found');
      }

      const existingFindings = audit.findings as any[] || [];
      const newFindings = findings.map((f, index) => ({
        id: `F-${Date.now()}-${index}`,
        ...f,
        status: 'open'
      }));

      const criticalCount = newFindings.filter(f => f.severity === 'critical').length;
      const majorCount = newFindings.filter(f => f.severity === 'major').length;
      const minorCount = newFindings.filter(f => f.severity === 'minor').length;

      await db
        .update(complianceAudits)
        .set({
          findings: [...existingFindings, ...newFindings],
          findingsCount: existingFindings.length + newFindings.length,
          criticalFindings: (audit.criticalFindings || 0) + criticalCount,
          majorFindings: (audit.majorFindings || 0) + majorCount,
          minorFindings: (audit.minorFindings || 0) + minorCount,
          updatedAt: new Date()
        })
        .where(eq(complianceAudits.id, auditId));
    } catch (error) {
      console.error('Error adding audit findings:', error);
      throw error;
    }
  }

  // Complete an audit
  async completeAudit(auditId: number, result: 'passed' | 'failed' | 'conditional', score?: number, maxScore?: number): Promise<void> {
    try {
      await db
        .update(complianceAudits)
        .set({
          status: 'completed',
          result,
          score,
          maxScore,
          completionDate: new Date().toISOString().split('T')[0] as any,
          updatedAt: new Date()
        })
        .where(eq(complianceAudits.id, auditId));

      // Get audit details to update metrics
      const [audit] = await db
        .select()
        .from(complianceAudits)
        .where(eq(complianceAudits.id, auditId));

      if (audit) {
        await this.updateComplianceMetrics(audit.communityId, new Date());
      }
    } catch (error) {
      console.error('Error completing audit:', error);
      throw error;
    }
  }

  // Get real compliance analytics for a community
  async getCommunityCompliance(communityId: number, startDate: Date, endDate: Date) {
    // Get compliance records summary
    const complianceStats = await db
      .select({
        totalChecks: count(),
        passedChecks: sql<number>`COUNT(CASE WHEN ${complianceRecords.status} = 'passed' THEN 1 END)`,
        failedChecks: sql<number>`COUNT(CASE WHEN ${complianceRecords.status} = 'failed' THEN 1 END)`,
        pendingChecks: sql<number>`COUNT(CASE WHEN ${complianceRecords.status} = 'pending' THEN 1 END)`,
        criticalIssues: sql<number>`COUNT(CASE WHEN ${complianceRecords.severity} = 'critical' THEN 1 END)`
      })
      .from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.communityId, communityId),
          gte(complianceRecords.checkDate, startDate.toISOString().split('T')[0] as any),
          lte(complianceRecords.checkDate, endDate.toISOString().split('T')[0] as any)
        )
      );

    // Get audit summary
    const auditStats = await db
      .select({
        totalAudits: count(),
        completedAudits: sql<number>`COUNT(CASE WHEN ${complianceAudits.status} = 'completed' THEN 1 END)`,
        passedAudits: sql<number>`COUNT(CASE WHEN ${complianceAudits.result} = 'passed' THEN 1 END)`,
        avgScore: sql<number>`AVG(${complianceAudits.score})`,
        totalFindings: sql<number>`SUM(${complianceAudits.findingsCount})`,
        criticalFindings: sql<number>`SUM(${complianceAudits.criticalFindings})`
      })
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.communityId, communityId),
          gte(complianceAudits.scheduledDate, startDate.toISOString().split('T')[0] as any),
          lte(complianceAudits.scheduledDate, endDate.toISOString().split('T')[0] as any)
        )
      );

    // Get regulation type breakdown
    const regulationBreakdown = await db
      .select({
        regulationType: complianceRecords.regulationType,
        totalChecks: count(),
        passedChecks: sql<number>`COUNT(CASE WHEN ${complianceRecords.status} = 'passed' THEN 1 END)`
      })
      .from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.communityId, communityId),
          gte(complianceRecords.checkDate, startDate.toISOString().split('T')[0] as any),
          lte(complianceRecords.checkDate, endDate.toISOString().split('T')[0] as any)
        )
      )
      .groupBy(complianceRecords.regulationType);

    // Get recent audits
    const recentAudits = await db
      .select({
        id: complianceAudits.id,
        auditType: complianceAudits.auditType,
        auditCategory: complianceAudits.auditCategory,
        status: complianceAudits.status,
        result: complianceAudits.result,
        score: complianceAudits.score,
        scheduledDate: complianceAudits.scheduledDate,
        completionDate: complianceAudits.completionDate
      })
      .from(complianceAudits)
      .where(eq(complianceAudits.communityId, communityId))
      .orderBy(desc(complianceAudits.scheduledDate))
      .limit(10);

    // Get upcoming audits
    const upcomingAudits = await db
      .select({
        id: complianceAudits.id,
        auditType: complianceAudits.auditType,
        auditCategory: complianceAudits.auditCategory,
        scheduledDate: complianceAudits.scheduledDate,
        leadAuditor: complianceAudits.leadAuditor
      })
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.communityId, communityId),
          eq(complianceAudits.status, 'scheduled'),
          gte(complianceAudits.scheduledDate, new Date().toISOString().split('T')[0] as any)
        )
      )
      .orderBy(complianceAudits.scheduledDate)
      .limit(5);

    // Get open findings
    const openFindings = await db
      .select({
        auditId: complianceAudits.id,
        auditType: complianceAudits.auditType,
        findings: complianceAudits.findings,
        criticalFindings: complianceAudits.criticalFindings,
        majorFindings: complianceAudits.majorFindings,
        minorFindings: complianceAudits.minorFindings
      })
      .from(complianceAudits)
      .where(
        and(
          eq(complianceAudits.communityId, communityId),
          sql`${complianceAudits.findingsCount} > 0`
        )
      );

    // Calculate compliance score
    const totalChecks = complianceStats[0]?.totalChecks || 0;
    const passedChecks = complianceStats[0]?.passedChecks || 0;
    const complianceScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    // Count total open findings
    let totalOpenFindings = 0;
    openFindings.forEach(audit => {
      const findings = audit.findings as any[] || [];
      totalOpenFindings += findings.filter(f => f.status === 'open').length;
    });

    return {
      summary: {
        overallScore: complianceScore,
        totalChecks: complianceStats[0]?.totalChecks || 0,
        passedChecks: complianceStats[0]?.passedChecks || 0,
        failedChecks: complianceStats[0]?.failedChecks || 0,
        pendingChecks: complianceStats[0]?.pendingChecks || 0,
        criticalIssues: complianceStats[0]?.criticalIssues || 0,
        openFindings: totalOpenFindings
      },
      audits: {
        total: auditStats[0]?.totalAudits || 0,
        completed: auditStats[0]?.completedAudits || 0,
        passed: auditStats[0]?.passedAudits || 0,
        avgScore: Math.round(auditStats[0]?.avgScore || 0),
        totalFindings: auditStats[0]?.totalFindings || 0,
        criticalFindings: auditStats[0]?.criticalFindings || 0
      },
      regulations: regulationBreakdown.map(r => ({
        type: r.regulationType,
        totalChecks: r.totalChecks,
        passedChecks: r.passedChecks,
        complianceRate: r.totalChecks > 0 ? 
          Math.round((r.passedChecks / r.totalChecks) * 100) : 0
      })),
      recentAudits,
      upcomingAudits,
      trends: await this.getComplianceTrends(communityId)
    };
  }

  // Get compliance trends over time
  async getComplianceTrends(communityId: number) {
    const trends = await db
      .select({
        month: sql<string>`TO_CHAR(${complianceRecords.checkDate}, 'YYYY-MM')`,
        totalChecks: count(),
        passedChecks: sql<number>`COUNT(CASE WHEN ${complianceRecords.status} = 'passed' THEN 1 END)`
      })
      .from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.communityId, communityId),
          gte(complianceRecords.checkDate, 
            new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as any)
        )
      )
      .groupBy(sql`TO_CHAR(${complianceRecords.checkDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${complianceRecords.checkDate}, 'YYYY-MM')`);

    return trends.map(t => ({
      month: t.month,
      complianceScore: t.totalChecks > 0 ? 
        Math.round((t.passedChecks / t.totalChecks) * 100) : 0
    }));
  }

  // Update compliance metrics in enterprise_metrics table
  async updateComplianceMetrics(communityId: number, date: Date): Promise<void> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const compliance = await this.getCommunityCompliance(communityId, startOfDay, endOfDay);

      await db
        .insert(enterpriseMetrics)
        .values({
          communityId,
          date: startOfDay.toISOString().split('T')[0] as any,
          period: 'daily',
          complianceScore: compliance.summary.overallScore,
          openFindings: compliance.summary.openFindings,
          incidentCount: compliance.summary.failedChecks
        })
        .onConflictDoUpdate({
          target: [enterpriseMetrics.communityId, enterpriseMetrics.date, enterpriseMetrics.period],
          set: {
            complianceScore: compliance.summary.overallScore,
            openFindings: compliance.summary.openFindings,
            incidentCount: compliance.summary.failedChecks,
            updatedAt: new Date()
          }
        });
    } catch (error) {
      console.error('Error updating compliance metrics:', error);
    }
  }

  // Check for regulatory deadlines
  async checkUpcomingDeadlines(communityId: number) {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = await db
      .select({
        id: complianceRecords.id,
        checkType: complianceRecords.checkType,
        regulationType: complianceRecords.regulationType,
        dueDate: complianceRecords.dueDate,
        status: complianceRecords.status
      })
      .from(complianceRecords)
      .where(
        and(
          eq(complianceRecords.communityId, communityId),
          eq(complianceRecords.status, 'pending'),
          lte(complianceRecords.dueDate, thirtyDaysFromNow.toISOString().split('T')[0] as any)
        )
      )
      .orderBy(complianceRecords.dueDate);

    return upcomingDeadlines;
  }
}

export const complianceService = new ComplianceService();