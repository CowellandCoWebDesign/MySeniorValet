#!/usr/bin/env python3
"""
COMPREHENSIVE DATA INTEGRITY SAFEGUARDS
Implement advanced data quality monitoring and enhancement systems
"""
import os
import psycopg2
import json
from datetime import datetime

def implement_data_integrity_safeguards():
    """Implement comprehensive data integrity and quality enhancement systems"""
    print("🛡️ IMPLEMENTING COMPREHENSIVE DATA INTEGRITY SAFEGUARDS")
    print("="*80)
    
    # Run comprehensive data quality analysis
    quality_metrics = analyze_data_quality()
    
    # Implement data validation triggers
    implement_validation_triggers()
    
    # Create data quality monitoring dashboard
    create_quality_monitoring_system()
    
    # Enhance data with computed fields
    enhance_data_with_computed_fields()
    
    # Implement data integrity scoring
    calculate_data_integrity_scores()
    
    # Generate comprehensive quality report
    generate_comprehensive_quality_report(quality_metrics)

def analyze_data_quality():
    """Comprehensive data quality analysis"""
    print("\n📊 ANALYZING DATA QUALITY METRICS")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Comprehensive quality metrics
        cursor.execute("""
            SELECT 
                COUNT(*) as total_properties,
                COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) as hud_properties,
                COUNT(CASE WHEN total_units_hud > 0 THEN 1 END) as valid_units,
                COUNT(CASE WHEN occupancy_rate_hud BETWEEN 0 AND 100 THEN 1 END) as valid_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as valid_rent,
                COUNT(CASE WHEN management_company IS NOT NULL AND LENGTH(management_company) > 0 THEN 1 END) as with_management,
                COUNT(CASE WHEN phone IS NOT NULL AND LENGTH(phone) >= 10 THEN 1 END) as valid_phone,
                COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates,
                AVG(occupancy_rate_hud) as avg_occupancy,
                AVG(total_units_hud) as avg_units,
                AVG(rent_per_month) as avg_rent
            FROM communities
        """)
        
        quality_data = cursor.fetchone()
        if quality_data:
            total, hud, valid_units, valid_occ, valid_rent, mgmt, phone, coords, avg_occ, avg_units, avg_rent = quality_data
            
            print(f"   📈 PLATFORM QUALITY METRICS:")
            print(f"      Total Properties: {total:,}")
            print(f"      HUD Properties: {hud:,} ({(hud/total*100):.1f}%)")
            print(f"      Valid Units: {valid_units:,} ({(valid_units/total*100):.1f}%)")
            print(f"      Valid Occupancy: {valid_occ:,} ({(valid_occ/total*100):.1f}%)")
            print(f"      Valid Pricing: {valid_rent:,} ({(valid_rent/total*100):.1f}%)")
            print(f"      With Management: {mgmt:,} ({(mgmt/total*100):.1f}%)")
            print(f"      Valid Phone: {phone:,} ({(phone/total*100):.1f}%)")
            print(f"      With Coordinates: {coords:,} ({(coords/total*100):.1f}%)")
            print(f"      Avg Occupancy: {avg_occ:.1f}%")
            print(f"      Avg Units: {avg_units:.0f}")
            print(f"      Avg Rent: ${avg_rent:.0f}/month")
        
        cursor.close()
        conn.close()
        
        return quality_data
        
    except Exception as e:
        print(f"   ❌ Error analyzing quality: {e}")
        return None

def implement_validation_triggers():
    """Implement comprehensive database validation triggers"""
    print("\n🛡️ IMPLEMENTING VALIDATION TRIGGERS")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Enhanced validation trigger
        cursor.execute("""
            CREATE OR REPLACE FUNCTION validate_hud_data_quality() 
            RETURNS TRIGGER AS $$
            BEGIN
                -- Validate occupancy rate
                IF NEW.occupancy_rate_hud IS NOT NULL AND (NEW.occupancy_rate_hud < 0 OR NEW.occupancy_rate_hud > 100) THEN
                    NEW.occupancy_rate_hud = NULL;
                END IF;
                
                -- Validate unit count
                IF NEW.total_units_hud IS NOT NULL AND (NEW.total_units_hud <= 0 OR NEW.total_units_hud > 2000) THEN
                    NEW.total_units_hud = NULL;
                END IF;
                
                -- Validate rent amount
                IF NEW.rent_per_month IS NOT NULL AND NEW.rent_per_month < 0 THEN
                    RAISE EXCEPTION 'Invalid rent amount: %', NEW.rent_per_month;
                END IF;
                
                -- Validate coordinates
                IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
                    NEW.latitude = NULL;
                END IF;
                
                IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
                    NEW.longitude = NULL;
                END IF;
                
                -- Calculate data quality score
                NEW.data_quality_score = calculate_quality_score(NEW);
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Data quality score function
        cursor.execute("""
            CREATE OR REPLACE FUNCTION calculate_quality_score(community_record communities)
            RETURNS INTEGER AS $$
            DECLARE
                score INTEGER := 0;
            BEGIN
                -- Base score for having a name
                IF community_record.name IS NOT NULL AND LENGTH(community_record.name) > 0 THEN
                    score := score + 10;
                END IF;
                
                -- HUD data bonus
                IF community_record.hud_property_id IS NOT NULL THEN
                    score := score + 20;
                END IF;
                
                -- Unit data
                IF community_record.total_units_hud IS NOT NULL AND community_record.total_units_hud > 0 THEN
                    score := score + 15;
                END IF;
                
                -- Occupancy data
                IF community_record.occupancy_rate_hud IS NOT NULL THEN
                    score := score + 15;
                END IF;
                
                -- Pricing data
                IF community_record.rent_per_month IS NOT NULL AND community_record.rent_per_month > 0 THEN
                    score := score + 10;
                END IF;
                
                -- Management info
                IF community_record.management_company IS NOT NULL AND LENGTH(community_record.management_company) > 0 THEN
                    score := score + 10;
                END IF;
                
                -- Contact info
                IF community_record.phone IS NOT NULL AND LENGTH(community_record.phone) >= 10 THEN
                    score := score + 10;
                END IF;
                
                -- Location data
                IF community_record.latitude IS NOT NULL AND community_record.longitude IS NOT NULL THEN
                    score := score + 10;
                END IF;
                
                RETURN score;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # Add data quality score column if not exists
        cursor.execute("""
            ALTER TABLE communities ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 0;
        """)
        
        # Create trigger
        cursor.execute("""
            DROP TRIGGER IF EXISTS validate_community_data ON communities;
            CREATE TRIGGER validate_community_data
                BEFORE INSERT OR UPDATE ON communities
                FOR EACH ROW
                EXECUTE FUNCTION validate_hud_data_quality();
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("   ✅ Validation triggers implemented successfully")
        
    except Exception as e:
        print(f"   ❌ Error implementing triggers: {e}")

def create_quality_monitoring_system():
    """Create comprehensive quality monitoring system"""
    print("\n📊 CREATING QUALITY MONITORING SYSTEM")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Create quality monitoring views
        cursor.execute("""
            CREATE OR REPLACE VIEW data_quality_dashboard AS
            SELECT 
                state,
                COUNT(*) as total_communities,
                COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) as hud_communities,
                AVG(data_quality_score) as avg_quality_score,
                COUNT(CASE WHEN data_quality_score >= 80 THEN 1 END) as high_quality,
                COUNT(CASE WHEN data_quality_score BETWEEN 60 AND 79 THEN 1 END) as medium_quality,
                COUNT(CASE WHEN data_quality_score < 60 THEN 1 END) as low_quality,
                AVG(occupancy_rate_hud) as avg_occupancy,
                COUNT(CASE WHEN rent_per_month > 0 THEN 1 END) as with_pricing
            FROM communities
            GROUP BY state
            ORDER BY avg_quality_score DESC;
        """)
        
        # Quality anomalies view
        cursor.execute("""
            CREATE OR REPLACE VIEW quality_anomalies AS
            SELECT 
                id, name, state, city,
                data_quality_score,
                CASE 
                    WHEN occupancy_rate_hud > 100 THEN 'Occupancy > 100%'
                    WHEN total_units_hud > 1000 THEN 'Unusually large (1000+ units)'
                    WHEN rent_per_month > 5000 THEN 'Very high rent (>$5000)'
                    WHEN rent_per_month < 100 AND rent_per_month > 0 THEN 'Very low rent (<$100)'
                    WHEN data_quality_score < 30 THEN 'Very low quality score'
                END as anomaly_type
            FROM communities
            WHERE occupancy_rate_hud > 100 
               OR total_units_hud > 1000 
               OR rent_per_month > 5000 
               OR (rent_per_month < 100 AND rent_per_month > 0)
               OR data_quality_score < 30;
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("   ✅ Quality monitoring system created")
        
    except Exception as e:
        print(f"   ❌ Error creating monitoring system: {e}")

def enhance_data_with_computed_fields():
    """Enhance data with computed fields for better user experience"""
    print("\n⚡ ENHANCING DATA WITH COMPUTED FIELDS")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Add computed fields
        cursor.execute("""
            ALTER TABLE communities ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20);
            ALTER TABLE communities ADD COLUMN IF NOT EXISTS size_category VARCHAR(20);
            ALTER TABLE communities ADD COLUMN IF NOT EXISTS price_tier VARCHAR(20);
            ALTER TABLE communities ADD COLUMN IF NOT EXISTS senior_concentration_pct DECIMAL(5,2);
        """)
        
        # Update availability status based on occupancy
        cursor.execute("""
            UPDATE communities 
            SET availability_status = CASE 
                WHEN occupancy_rate_hud IS NULL THEN 'Unknown'
                WHEN occupancy_rate_hud < 80 THEN 'High Availability'
                WHEN occupancy_rate_hud BETWEEN 80 AND 95 THEN 'Limited Availability'
                WHEN occupancy_rate_hud > 95 THEN 'Very Limited'
                ELSE 'Unknown'
            END
            WHERE hud_property_id IS NOT NULL;
        """)
        
        # Update size category
        cursor.execute("""
            UPDATE communities 
            SET size_category = CASE 
                WHEN total_units_hud IS NULL THEN 'Unknown'
                WHEN total_units_hud < 25 THEN 'Small (1-24 units)'
                WHEN total_units_hud BETWEEN 25 AND 100 THEN 'Medium (25-100 units)'
                WHEN total_units_hud BETWEEN 101 AND 300 THEN 'Large (101-300 units)'
                WHEN total_units_hud > 300 THEN 'Very Large (300+ units)'
                ELSE 'Unknown'
            END
            WHERE hud_property_id IS NOT NULL;
        """)
        
        # Update price tier
        cursor.execute("""
            UPDATE communities 
            SET price_tier = CASE 
                WHEN rent_per_month IS NULL THEN 'Contact for Pricing'
                WHEN rent_per_month < 500 THEN 'Budget Friendly (<$500)'
                WHEN rent_per_month BETWEEN 500 AND 1000 THEN 'Affordable ($500-$1000)'
                WHEN rent_per_month BETWEEN 1001 AND 2000 THEN 'Moderate ($1001-$2000)'
                WHEN rent_per_month > 2000 THEN 'Premium ($2000+)'
                ELSE 'Contact for Pricing'
            END
            WHERE hud_property_id IS NOT NULL;
        """)
        
        # Calculate senior concentration
        cursor.execute("""
            UPDATE communities 
            SET senior_concentration_pct = COALESCE(age_65_plus_head_pct, 0) + COALESCE(age_51_61_pct, 0)
            WHERE hud_property_id IS NOT NULL;
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("   ✅ Data enhanced with computed fields")
        
    except Exception as e:
        print(f"   ❌ Error enhancing data: {e}")

def calculate_data_integrity_scores():
    """Calculate comprehensive data integrity scores"""
    print("\n📊 CALCULATING DATA INTEGRITY SCORES")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Update quality scores for all communities
        cursor.execute("""
            UPDATE communities 
            SET data_quality_score = (
                CASE WHEN name IS NOT NULL AND LENGTH(name) > 0 THEN 10 ELSE 0 END +
                CASE WHEN hud_property_id IS NOT NULL THEN 20 ELSE 0 END +
                CASE WHEN total_units_hud IS NOT NULL AND total_units_hud > 0 THEN 15 ELSE 0 END +
                CASE WHEN occupancy_rate_hud IS NOT NULL THEN 15 ELSE 0 END +
                CASE WHEN rent_per_month IS NOT NULL AND rent_per_month > 0 THEN 10 ELSE 0 END +
                CASE WHEN management_company IS NOT NULL AND LENGTH(management_company) > 0 THEN 10 ELSE 0 END +
                CASE WHEN phone IS NOT NULL AND LENGTH(phone) >= 10 THEN 10 ELSE 0 END +
                CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 10 ELSE 0 END
            );
        """)
        
        # Get quality distribution
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN data_quality_score >= 80 THEN 1 END) as high_quality,
                COUNT(CASE WHEN data_quality_score BETWEEN 60 AND 79 THEN 1 END) as medium_quality,
                COUNT(CASE WHEN data_quality_score BETWEEN 40 AND 59 THEN 1 END) as low_quality,
                COUNT(CASE WHEN data_quality_score < 40 THEN 1 END) as very_low_quality,
                AVG(data_quality_score) as avg_score,
                COUNT(*) as total
            FROM communities;
        """)
        
        scores = cursor.fetchone()
        if scores:
            high, medium, low, very_low, avg, total = scores
            print(f"   📊 QUALITY DISTRIBUTION:")
            print(f"      High Quality (80-100): {high:,} ({(high/total*100):.1f}%)")
            print(f"      Medium Quality (60-79): {medium:,} ({(medium/total*100):.1f}%)")
            print(f"      Low Quality (40-59): {low:,} ({(low/total*100):.1f}%)")
            print(f"      Very Low Quality (<40): {very_low:,} ({(very_low/total*100):.1f}%)")
            print(f"      Average Score: {avg:.1f}/100")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("   ✅ Data integrity scores calculated")
        
    except Exception as e:
        print(f"   ❌ Error calculating scores: {e}")

def generate_comprehensive_quality_report(quality_metrics):
    """Generate comprehensive quality report"""
    print("\n📋 GENERATING COMPREHENSIVE QUALITY REPORT")
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # Generate report data
        report = {
            "timestamp": datetime.now().isoformat(),
            "platform_overview": {},
            "state_breakdown": [],
            "data_quality": {},
            "recommendations": []
        }
        
        # Platform overview
        if quality_metrics:
            total, hud, valid_units, valid_occ, valid_rent, mgmt, phone, coords, avg_occ, avg_units, avg_rent = quality_metrics
            report["platform_overview"] = {
                "total_properties": total,
                "hud_properties": hud,
                "hud_percentage": round(hud/total*100, 1),
                "avg_occupancy": round(avg_occ, 1),
                "avg_units": round(avg_units, 0),
                "avg_rent": round(avg_rent, 0),
                "data_completeness": {
                    "units": round(valid_units/total*100, 1),
                    "occupancy": round(valid_occ/total*100, 1),
                    "pricing": round(valid_rent/total*100, 1),
                    "management": round(mgmt/total*100, 1),
                    "phone": round(phone/total*100, 1),
                    "coordinates": round(coords/total*100, 1)
                }
            }
        
        # Top states by HUD coverage
        cursor.execute("""
            SELECT state, COUNT(*) as total,
                   COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) as hud_count,
                   AVG(data_quality_score) as avg_quality
            FROM communities 
            GROUP BY state 
            HAVING COUNT(CASE WHEN hud_property_id IS NOT NULL THEN 1 END) >= 10
            ORDER BY hud_count DESC 
            LIMIT 20;
        """)
        
        state_data = cursor.fetchall()
        for state, total, hud_count, avg_quality in state_data:
            report["state_breakdown"].append({
                "state": state,
                "total_properties": total,
                "hud_properties": hud_count,
                "average_quality_score": round(avg_quality, 1) if avg_quality else 0
            })
        
        cursor.close()
        conn.close()
        
        # Save report
        with open('data_quality_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print("   ✅ Comprehensive quality report generated")
        print(f"      Report saved to: data_quality_report.json")
        
    except Exception as e:
        print(f"   ❌ Error generating report: {e}")

if __name__ == "__main__":
    implement_data_integrity_safeguards()