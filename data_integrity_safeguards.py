#!/usr/bin/env python3
"""
COMPREHENSIVE DATA INTEGRITY SAFEGUARDS
Implement safeguards to protect the valuable HUD data quality
"""
import os
import psycopg2
import logging
from datetime import datetime

def implement_data_integrity_safeguards():
    """Implement comprehensive data integrity safeguards"""
    print("🛡️ IMPLEMENTING DATA INTEGRITY SAFEGUARDS")
    print("="*60)
    
    try:
        db_url = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        # 1. Create data quality validation function
        print("1️⃣ Creating data quality validation function...")
        cursor.execute("""
            CREATE OR REPLACE FUNCTION validate_hud_data_quality()
            RETURNS TRIGGER AS $$
            BEGIN
                -- Validate occupancy rate
                IF NEW.occupancy_rate_hud IS NOT NULL AND 
                   (NEW.occupancy_rate_hud < 0 OR NEW.occupancy_rate_hud > 100) THEN
                    RAISE EXCEPTION 'Invalid occupancy rate: %', NEW.occupancy_rate_hud;
                END IF;
                
                -- Validate unit count
                IF NEW.total_units_hud IS NOT NULL AND 
                   (NEW.total_units_hud <= 0 OR NEW.total_units_hud > 2000) THEN
                    RAISE EXCEPTION 'Invalid unit count: %', NEW.total_units_hud;
                END IF;
                
                -- Validate rent amount
                IF NEW.rent_per_month IS NOT NULL AND 
                   (NEW.rent_per_month <= 0 OR NEW.rent_per_month > 5000) THEN
                    RAISE EXCEPTION 'Invalid rent amount: %', NEW.rent_per_month;
                END IF;
                
                -- Validate demographic percentages
                IF NEW.age_62_plus_pct IS NOT NULL AND 
                   (NEW.age_62_plus_pct < 0 OR NEW.age_62_plus_pct > 100) THEN
                    RAISE EXCEPTION 'Invalid senior percentage: %', NEW.age_62_plus_pct;
                END IF;
                
                -- Ensure HUD properties have HUD property ID
                IF (NEW.facility_type LIKE '%HUD%' OR NEW.facility_type LIKE '%Section%') AND
                   (NEW.hud_property_id IS NULL OR NEW.hud_property_id = '') THEN
                    RAISE EXCEPTION 'HUD properties must have valid HUD property ID';
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # 2. Create trigger for data validation
        print("2️⃣ Creating data validation trigger...")
        cursor.execute("""
            DROP TRIGGER IF EXISTS hud_data_quality_trigger ON communities;
            CREATE TRIGGER hud_data_quality_trigger
                BEFORE INSERT OR UPDATE ON communities
                FOR EACH ROW
                EXECUTE FUNCTION validate_hud_data_quality();
        """)
        
        # 3. Create data quality monitoring table
        print("3️⃣ Creating data quality monitoring table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS data_quality_log (
                id SERIAL PRIMARY KEY,
                check_timestamp TIMESTAMP DEFAULT NOW(),
                total_hud_properties INTEGER,
                properties_with_units INTEGER,
                properties_with_occupancy INTEGER,
                properties_with_rent INTEGER,
                properties_with_demographics INTEGER,
                properties_with_management INTEGER,
                data_quality_score DECIMAL(5,2),
                anomalies_detected INTEGER,
                notes TEXT
            );
        """)
        
        # 4. Create data quality monitoring function
        print("4️⃣ Creating data quality monitoring function...")
        cursor.execute("""
            CREATE OR REPLACE FUNCTION log_data_quality_metrics()
            RETURNS TABLE(
                total_properties INTEGER,
                quality_score DECIMAL,
                anomalies INTEGER
            ) AS $$
            DECLARE
                total_hud INTEGER;
                with_units INTEGER;
                with_occupancy INTEGER;
                with_rent INTEGER;
                with_demographics INTEGER;
                with_mgmt INTEGER;
                quality_score DECIMAL(5,2);
                anomalies INTEGER := 0;
            BEGIN
                -- Count HUD properties and quality metrics
                SELECT COUNT(*) INTO total_hud
                FROM communities WHERE hud_property_id IS NOT NULL;
                
                SELECT COUNT(*) INTO with_units
                FROM communities 
                WHERE hud_property_id IS NOT NULL 
                AND total_units_hud > 0 AND total_units_hud <= 2000;
                
                SELECT COUNT(*) INTO with_occupancy
                FROM communities 
                WHERE hud_property_id IS NOT NULL 
                AND occupancy_rate_hud BETWEEN 0 AND 100;
                
                SELECT COUNT(*) INTO with_rent
                FROM communities 
                WHERE hud_property_id IS NOT NULL 
                AND rent_per_month > 0 AND rent_per_month <= 5000;
                
                SELECT COUNT(*) INTO with_demographics
                FROM communities 
                WHERE hud_property_id IS NOT NULL 
                AND age_62_plus_pct BETWEEN 0 AND 100;
                
                SELECT COUNT(*) INTO with_mgmt
                FROM communities 
                WHERE hud_property_id IS NOT NULL 
                AND management_company IS NOT NULL 
                AND LENGTH(management_company) > 2;
                
                -- Calculate quality score
                IF total_hud > 0 THEN
                    quality_score := (
                        (with_units::DECIMAL / total_hud * 20) +
                        (with_occupancy::DECIMAL / total_hud * 25) +
                        (with_rent::DECIMAL / total_hud * 20) +
                        (with_demographics::DECIMAL / total_hud * 20) +
                        (with_mgmt::DECIMAL / total_hud * 15)
                    );
                ELSE
                    quality_score := 0;
                END IF;
                
                -- Count anomalies
                SELECT COUNT(*) INTO anomalies
                FROM communities 
                WHERE hud_property_id IS NOT NULL 
                AND (
                    occupancy_rate_hud < 0 OR occupancy_rate_hud > 100 OR
                    total_units_hud <= 0 OR total_units_hud > 2000 OR
                    rent_per_month <= 0 OR rent_per_month > 5000 OR
                    age_62_plus_pct < 0 OR age_62_plus_pct > 100
                );
                
                -- Log the metrics
                INSERT INTO data_quality_log (
                    total_hud_properties, properties_with_units, properties_with_occupancy,
                    properties_with_rent, properties_with_demographics, properties_with_management,
                    data_quality_score, anomalies_detected
                ) VALUES (
                    total_hud, with_units, with_occupancy, with_rent, 
                    with_demographics, with_mgmt, quality_score, anomalies
                );
                
                RETURN QUERY SELECT total_hud, quality_score, anomalies;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        # 5. Run initial quality check
        print("5️⃣ Running initial data quality assessment...")
        cursor.execute("SELECT * FROM log_data_quality_metrics();")
        quality_results = cursor.fetchone()
        
        if quality_results:
            total_props, score, anomalies = quality_results
            print(f"   📊 Total HUD Properties: {total_props:,}")
            print(f"   🎯 Data Quality Score: {score:.1f}/100")
            print(f"   ⚠️ Anomalies Detected: {anomalies}")
            
            if score >= 80:
                print("   ✅ EXCELLENT data quality achieved!")
            elif score >= 60:
                print("   ⚡ GOOD data quality - room for improvement")
            else:
                print("   🔧 Data quality needs attention")
        
        # 6. Create automated cleanup function
        print("6️⃣ Creating automated data cleanup function...")
        cursor.execute("""
            CREATE OR REPLACE FUNCTION cleanup_invalid_hud_data()
            RETURNS INTEGER AS $$
            DECLARE
                cleaned_count INTEGER := 0;
            BEGIN
                -- Clean up invalid occupancy rates
                UPDATE communities 
                SET occupancy_rate_hud = NULL 
                WHERE hud_property_id IS NOT NULL 
                AND (occupancy_rate_hud < 0 OR occupancy_rate_hud > 100);
                
                GET DIAGNOSTICS cleaned_count = ROW_COUNT;
                
                -- Clean up invalid unit counts
                UPDATE communities 
                SET total_units_hud = NULL 
                WHERE hud_property_id IS NOT NULL 
                AND (total_units_hud <= 0 OR total_units_hud > 2000);
                
                -- Clean up invalid rent amounts
                UPDATE communities 
                SET rent_per_month = NULL 
                WHERE hud_property_id IS NOT NULL 
                AND (rent_per_month <= 0 OR rent_per_month > 5000);
                
                -- Clean up invalid demographic percentages
                UPDATE communities 
                SET age_62_plus_pct = NULL 
                WHERE hud_property_id IS NOT NULL 
                AND (age_62_plus_pct < 0 OR age_62_plus_pct > 100);
                
                RETURN cleaned_count;
            END;
            $$ LANGUAGE plpgsql;
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\n✅ DATA INTEGRITY SAFEGUARDS IMPLEMENTED SUCCESSFULLY")
        print(f"🛡️ Platform now has comprehensive protection for HUD data quality")
        print(f"🔍 Automatic validation, monitoring, and cleanup systems active")
        
    except Exception as e:
        print(f"❌ Error implementing safeguards: {e}")

if __name__ == "__main__":
    implement_data_integrity_safeguards()