import { db } from "../db";
import { hospitals, hospitalDepartments, hospitalQualityMetrics, type Hospital, type InsertHospital } from "@shared/schema";
import { eq, sql, and, or, desc, asc, count, like, ilike } from "drizzle-orm";

export class HospitalDataService {
  
  // Get all hospitals with optional filtering
  async getAllHospitals(filters?: {
    state?: string;
    county?: string;
    hospitalType?: string;
    emergencyServices?: boolean;
    traumaLevel?: string;
    limit?: number;
    offset?: number;
  }) {
    const conditions = [eq(hospitals.isActive, true)];
    
    if (filters?.state) {
      conditions.push(eq(hospitals.state, filters.state));
    }
    
    if (filters?.county) {
      conditions.push(eq(hospitals.county, filters.county));
    }
    
    if (filters?.hospitalType) {
      conditions.push(sql`${hospitals.hospitalType} = ${filters.hospitalType}`);
    }
    
    if (filters?.emergencyServices !== undefined) {
      conditions.push(eq(hospitals.emergencyServices, filters.emergencyServices));
    }
    
    if (filters?.traumaLevel) {
      conditions.push(sql`${hospitals.traumaLevel} = ${filters.traumaLevel}`);
    }
    
    let query = db.select().from(hospitals).where(and(...conditions));
    
    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }
    
    return await query.orderBy(hospitals.name);
  }
  
  // Get featured hospitals (top rated, major medical centers) - optimized for carousel
  async getFeaturedHospitals(limit: number = 30) {
    return await db
      .select({
        id: hospitals.id,
        name: hospitals.name,
        slug: hospitals.slug,
        city: hospitals.city,
        state: hospitals.state,
        hospitalType: hospitals.hospitalType,
        bedCount: hospitals.bedCount,
        emergencyServices: hospitals.emergencyServices,
        traumaLevel: hospitals.traumaLevel,
        ownership: hospitals.ownership,
        phone: hospitals.phone,
        cmsRating: hospitals.cmsRating,
        services: hospitals.services
      })
      .from(hospitals)
      .where(eq(hospitals.isActive, true))
      .orderBy(desc(hospitals.bedCount), desc(hospitals.cmsRating))
      .limit(limit);
  }
  
  // Get hospitals by state
  async getHospitalsByState(state: string, limit: number = 50) {
    return await db
      .select()
      .from(hospitals)
      .where(
        and(
          eq(hospitals.state, state),
          eq(hospitals.isActive, true)
        )
      )
      .orderBy(hospitals.city, hospitals.name)
      .limit(limit);
  }
  
  // Get hospitals by county
  async getHospitalsByCounty(state: string, county: string) {
    return await db
      .select()
      .from(hospitals)
      .where(
        and(
          eq(hospitals.state, state),
          eq(hospitals.county, county),
          eq(hospitals.isActive, true)
        )
      )
      .orderBy(hospitals.name);
  }
  
  // Get hospital by slug
  async getHospitalBySlug(slug: string) {
    const [hospital] = await db
      .select()
      .from(hospitals)
      .where(and(eq(hospitals.slug, slug), eq(hospitals.isActive, true)));
    
    return hospital || null;
  }

  // Search hospitals
  async searchHospitals(query: string, filters?: {
    state?: string;
    hospitalType?: string;
    emergencyServices?: boolean;
    limit?: number;
  }) {
    const conditions = [
      eq(hospitals.isActive, true),
      or(
        ilike(hospitals.name, `%${query}%`),
        ilike(hospitals.city, `%${query}%`),
        sql`${hospitals.services}::text ILIKE ${'%' + query + '%'}`,
        sql`${hospitals.specialties}::text ILIKE ${'%' + query + '%'}`,
        sql`${hospitals.searchTerms}::text ILIKE ${'%' + query + '%'}`
      )
    ];
    
    if (filters?.state) {
      conditions.push(eq(hospitals.state, filters.state));
    }
    
    if (filters?.hospitalType) {
      conditions.push(sql`${hospitals.hospitalType} = ${filters.hospitalType}`);
    }
    
    if (filters?.emergencyServices !== undefined) {
      conditions.push(eq(hospitals.emergencyServices, filters.emergencyServices));
    }
    
    return await db
      .select()
      .from(hospitals)
      .where(and(...conditions))
      .orderBy(desc(hospitals.cmsRating), hospitals.name)
      .limit(filters?.limit || 50);
  }
  
  // Get hospital by ID with departments and quality metrics
  async getHospitalById(id: number) {
    const [hospital] = await db
      .select()
      .from(hospitals)
      .where(eq(hospitals.id, id))
      .limit(1);
      
    if (!hospital) {
      return null;
    }
    
    const departments = await db
      .select()
      .from(hospitalDepartments)
      .where(eq(hospitalDepartments.hospitalId, id));
      
    const qualityMetrics = await db
      .select()
      .from(hospitalQualityMetrics)
      .where(eq(hospitalQualityMetrics.hospitalId, id));
    
    return {
      ...hospital,
      departments,
      qualityMetrics
    };
  }
  
  // Get hospital statistics
  async getHospitalStats() {
    const [stats] = await db
      .select({
        totalHospitals: count(),
        emergencyHospitals: sql<number>`COUNT(*) FILTER (WHERE emergency_services = true)`,
        teachingHospitals: sql<number>`COUNT(*) FILTER (WHERE hospital_type = 'Teaching Hospital')`,
        traumaCenters: sql<number>`COUNT(*) FILTER (WHERE trauma_level IN ('Level I', 'Level II'))`,
        avgBedCount: sql<number>`AVG(bed_count)`,
        avgRating: sql<number>`AVG(cms_rating)`
      })
      .from(hospitals)
      .where(eq(hospitals.isActive, true));
      
    return stats;
  }
  
  // Get hospitals by specialty
  async getHospitalsBySpecialty(specialty: string, limit: number = 25) {
    return await db
      .select()
      .from(hospitals)
      .where(
        and(
          eq(hospitals.isActive, true),
          sql`${hospitals.specialties}::text ILIKE ${'%' + specialty + '%'}`
        )
      )
      .orderBy(desc(hospitals.cmsRating), hospitals.name)
      .limit(limit);
  }
  
  // Get top trauma centers
  async getTraumaCenters(level?: string) {
    const conditions = [
      eq(hospitals.isActive, true),
      sql`${hospitals.traumaLevel} != 'None'`
    ];
    
    if (level) {
      conditions.push(sql`${hospitals.traumaLevel} = ${level}`);
    }
    
    return await db
      .select()
      .from(hospitals)
      .where(and(...conditions))
      .orderBy(hospitals.traumaLevel, desc(hospitals.cmsRating))
      .limit(50);
  }
  
  // Get children's hospitals
  async getChildrensHospitals() {
    return await db
      .select()
      .from(hospitals)
      .where(
        and(
          eq(hospitals.isActive, true),
          sql`${hospitals.hospitalType} = 'Children''s Hospital'`
        )
      )
      .orderBy(desc(hospitals.cmsRating), hospitals.name);
  }
  
  // Get veterans hospitals
  async getVeteransHospitals() {
    return await db
      .select()
      .from(hospitals)
      .where(
        and(
          eq(hospitals.isActive, true),
          or(
            sql`${hospitals.hospitalType} = 'Veterans Affairs'`,
            sql`${hospitals.ownership} = 'Government - Federal'`,
            sql`${hospitals.name}::text ILIKE '%VA %'`,
            sql`${hospitals.name}::text ILIKE '%Veterans%'`
          )
        )
      )
      .orderBy(hospitals.state, hospitals.name);
  }
  
  // Add new hospital
  async addHospital(hospitalData: InsertHospital): Promise<Hospital> {
    const [hospital] = await db
      .insert(hospitals)
      .values(hospitalData)
      .returning();
    return hospital;
  }
  
  // Update hospital
  async updateHospital(id: number, updates: Partial<InsertHospital>) {
    const [hospital] = await db
      .update(hospitals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(hospitals.id, id))
      .returning();
    return hospital;
  }
  
  // Get unique states with hospital counts
  async getStatesWithHospitalCounts() {
    return await db
      .select({
        state: hospitals.state,
        count: count()
      })
      .from(hospitals)
      .where(eq(hospitals.isActive, true))
      .groupBy(hospitals.state)
      .orderBy(hospitals.state);
  }
  
  // Get counties by state with hospital counts
  async getCountiesByState(state: string) {
    return await db
      .select({
        county: hospitals.county,
        count: count()
      })
      .from(hospitals)
      .where(
        and(
          eq(hospitals.state, state),
          eq(hospitals.isActive, true)
        )
      )
      .groupBy(hospitals.county)
      .orderBy(hospitals.county);
  }
}

export const hospitalDataService = new HospitalDataService();