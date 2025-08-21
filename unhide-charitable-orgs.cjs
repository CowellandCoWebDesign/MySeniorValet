const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const { inArray, eq } = require('drizzle-orm');
require('dotenv').config();

// Define the marketplaceVendors table structure
const { pgTable, varchar, text, integer, boolean, timestamp, jsonb, decimal } = require('drizzle-orm/pg-core');

const marketplaceVendors = pgTable('marketplace_vendors', {
  id: integer('id'),
  name: varchar('name', { length: 255 }),
  isHidden: boolean('is_hidden'),
  updatedAt: timestamp('updated_at')
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function unhideCharitableOrganizations() {
  console.log('Starting to unhide charitable organizations...');
  
  const charitableNames = [
    'OneSAFE Place',
    'Salvation Army', 
    'Rescue Missions Directory',
    "Nation's Finest"
  ];
  
  try {
    // Update these organizations to be visible
    const result = await db
      .update(marketplaceVendors)
      .set({ 
        isHidden: false,
        updatedAt: new Date()
      })
      .where(inArray(marketplaceVendors.name, charitableNames));
    
    console.log('✅ Successfully unhid charitable organizations');
    
    // Verify the changes
    const updated = await db
      .select({
        id: marketplaceVendors.id,
        name: marketplaceVendors.name,
        isHidden: marketplaceVendors.isHidden
      })
      .from(marketplaceVendors)
      .where(inArray(marketplaceVendors.name, charitableNames));
    
    console.log('\nVerification - Status of charitable organizations:');
    updated.forEach(org => {
      console.log(`  ${org.isHidden ? '❌' : '✅'} ${org.name} - Hidden: ${org.isHidden}`);
    });
    
  } catch (error) {
    console.error('Error unhiding charitable organizations:', error);
  } finally {
    await pool.end();
  }
}

unhideCharitableOrganizations();