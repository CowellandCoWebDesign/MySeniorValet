const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
require('dotenv').config();

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixVendorCategories() {
  console.log('🔧 Fixing vendor categories in the marketplace...');
  
  try {
    // Define vendor to category mappings for commercial services
    const vendorCategoryMappings = {
      // Groceries & Essentials (ID: 1)
      'Instacart': 1,
      'Walmart': 1,
      '1-800-FLORALS': 1,
      
      // Pharmacy & Health (ID: 2) 
      'CVS Pharmacy': 2,
      'Walgreens': 2,
      'GoodRx': 2,
      'Carewell': 2,
      
      // Transportation (ID: 3)
      'GoGoGrandparent': 3,
      'Uber Health': 3,
      'Two Men and a Truck': 3,
      
      // Medical Supplies (ID: 4)
      'Medical Supply Depot': 4,
      
      // Communication (ID: 5)
      'Consumer Cellular': 5,
      'T-Mobile 55+': 5,
      'GreatCall (Lively)': 5,
      
      // Home Services (ID: 6)
      'Molly Maid': 6,
      
      // Insurance & Healthcare (ID: 14)
      'Anthem Blue Cross': 14,
      'Humana': 14,
      'UnitedHealthcare': 14,
      'Kaiser Permanente': 14,
      
      // Veterans Services (ID: 13)
      // Note: Nation's Finest should be removed as it's a charity
    };
    
    // Update each vendor with its proper category
    for (const [vendorName, categoryId] of Object.entries(vendorCategoryMappings)) {
      const result = await pool.query(
        `UPDATE marketplace_vendors 
         SET category_id = $1, updated_at = NOW()
         WHERE name = $2`,
        [categoryId, vendorName]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated ${vendorName} to category ${categoryId}`);
      }
    }
    
    // Hide charitable organizations that shouldn't be in the marketplace
    const charitablesToHide = [
      'OneSAFE Place',
      'Salvation Army', 
      'Rescue Missions Directory',
      "Nation's Finest"
    ];
    
    for (const charityName of charitablesToHide) {
      const result = await pool.query(
        `UPDATE marketplace_vendors 
         SET is_hidden = true, updated_at = NOW()
         WHERE name = $1`,
        [charityName]
      );
      
      if (result.rowCount > 0) {
        console.log(`👻 Hidden ${charityName} from marketplace (should be in resources)`);
      }
    }
    
    // Get count of vendors without categories
    const uncategorized = await pool.query(
      `SELECT COUNT(*) as count FROM marketplace_vendors WHERE category_id IS NULL`
    );
    
    console.log(`\n📊 Summary:`);
    console.log(`- Vendors without categories: ${uncategorized.rows[0].count}`);
    
    // List any remaining uncategorized vendors
    if (uncategorized.rows[0].count > 0) {
      const uncategorizedList = await pool.query(
        `SELECT name FROM marketplace_vendors WHERE category_id IS NULL ORDER BY name`
      );
      console.log('\n⚠️ Uncategorized vendors that need manual review:');
      uncategorizedList.rows.forEach(row => {
        console.log(`  - ${row.name}`);
      });
    }
    
    console.log('\n✨ Vendor categorization fixed successfully!');
    console.log('The marketplace now properly separates commercial vendors from charitable resources.');
    
  } catch (error) {
    console.error('❌ Error fixing vendor categories:', error);
  } finally {
    await pool.end();
  }
}

fixVendorCategories();