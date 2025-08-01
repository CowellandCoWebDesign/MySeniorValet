const { drizzle } = require("drizzle-orm/postgres-js");
const postgres = require("postgres");
const { sql } = require("drizzle-orm");

const connectionString = process.env.DATABASE_URL;
const db = drizzle(postgres(connectionString));

async function classifyCommunities() {
  console.log("Starting community classification...");
  
  try {
    // First, let's classify HUD properties
    const hudUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'hud_senior_housing'
      WHERE hud_property_id IS NOT NULL
      AND (community_subtype IS NULL OR community_subtype = '')
    `);
    console.log(`✓ Classified ${hudUpdate.count} HUD properties`);
    
    // Classify mobile home parks based on name patterns
    const mobileUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'senior_mobile_park'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        LOWER(name) LIKE '%mobile%home%' OR
        LOWER(name) LIKE '%manufactured%' OR
        LOWER(name) LIKE '%trailer%park%' OR
        LOWER(name) LIKE '%rv%park%' OR
        LOWER(name) LIKE '%mobile%park%'
      )
    `);
    console.log(`✓ Classified ${mobileUpdate.count} mobile home parks`);
    
    // Classify active adult communities
    const activeAdultUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'active_adult_55plus'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        LOWER(name) LIKE '%55+%' OR
        LOWER(name) LIKE '%55 plus%' OR
        LOWER(name) LIKE '%active%adult%' OR
        LOWER(name) LIKE '%age%restricted%' OR
        LOWER(name) LIKE '%retirement%village%'
      )
    `);
    console.log(`✓ Classified ${activeAdultUpdate.count} active adult communities`);
    
    // Classify memory care
    const memoryUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'memory_care'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        care_types @> ARRAY['Memory Care'] OR
        LOWER(name) LIKE '%memory%care%' OR
        LOWER(name) LIKE '%alzheimer%' OR
        LOWER(name) LIKE '%dementia%'
      )
    `);
    console.log(`✓ Classified ${memoryUpdate.count} memory care communities`);
    
    // Classify assisted living
    const assistedUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'assisted_living'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        care_types @> ARRAY['Assisted Living'] OR
        LOWER(name) LIKE '%assisted%living%' OR
        license_type LIKE '%RCFE%' OR
        license_type LIKE '%ALF%'
      )
    `);
    console.log(`✓ Classified ${assistedUpdate.count} assisted living communities`);
    
    // Classify skilled nursing
    const skilledUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'skilled_nursing'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        care_types @> ARRAY['Skilled Nursing'] OR
        LOWER(name) LIKE '%nursing%home%' OR
        LOWER(name) LIKE '%skilled%nursing%' OR
        license_type LIKE '%SNF%'
      )
    `);
    console.log(`✓ Classified ${skilledUpdate.count} skilled nursing facilities`);
    
    // Classify board and care
    const boardCareUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'board_and_care'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        LOWER(name) LIKE '%board%care%' OR
        LOWER(name) LIKE '%residential%care%home%' OR
        (total_units < 16 AND license_number IS NOT NULL)
      )
    `);
    console.log(`✓ Classified ${boardCareUpdate.count} board and care homes`);
    
    // Classify veteran housing
    const veteranUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'va_housing'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        LOWER(name) LIKE '%veteran%' OR
        LOWER(name) LIKE '%va %' OR
        LOWER(name) LIKE '%vfw%'
      )
    `);
    console.log(`✓ Classified ${veteranUpdate.count} veteran housing communities`);
    
    // Classify independent living
    const independentUpdate = await db.execute(sql`
      UPDATE communities
      SET community_subtype = 'independent_living'
      WHERE (community_subtype IS NULL OR community_subtype = '')
      AND (
        care_types @> ARRAY['Independent Living'] OR
        LOWER(name) LIKE '%independent%living%' OR
        LOWER(name) LIKE '%senior%apartment%'
      )
    `);
    console.log(`✓ Classified ${independentUpdate.count} independent living communities`);
    
    // Final count
    const [classified] = await db.execute(sql`
      SELECT COUNT(*) as count FROM communities WHERE community_subtype IS NOT NULL
    `);
    
    const [total] = await db.execute(sql`
      SELECT COUNT(*) as count FROM communities
    `);
    
    console.log(`\n✅ Classification complete!`);
    console.log(`   Total communities: ${total.count}`);
    console.log(`   Classified: ${classified.count}`);
    console.log(`   Unclassified: ${total.count - classified.count}`);
    
    // Show distribution
    const distribution = await db.execute(sql`
      SELECT 
        COALESCE(community_subtype, 'unclassified') as type,
        COUNT(*) as count
      FROM communities
      GROUP BY community_subtype
      ORDER BY count DESC
    `);
    
    console.log(`\n📊 Distribution:`);
    distribution.rows.forEach(row => {
      console.log(`   ${row.type}: ${row.count}`);
    });
    
  } catch (error) {
    console.error("Error classifying communities:", error);
  }
  
  process.exit(0);
}

classifyCommunities();