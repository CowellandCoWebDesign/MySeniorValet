import { db } from './server/db.js';
import { communities } from './shared/schema.js';
import { sql, isNotNull } from 'drizzle-orm';

async function checkHudCount() {
  try {
    const hudCount = await db
      .select({ count: sql`COUNT(*)` })
      .from(communities)
      .where(
        sql`${communities.hudPropertyId} IS NOT NULL AND ${communities.rentPerMonth} IS NOT NULL AND CAST(${communities.rentPerMonth} AS DECIMAL) < 1000`
      );

    console.log('Total HUD communities with pricing under $1000:', hudCount[0].count);

    const hudAnyPrice = await db
      .select({ count: sql`COUNT(*)` })
      .from(communities)
      .where(isNotNull(communities.hudPropertyId));

    console.log('Total HUD communities (any price):', hudAnyPrice[0].count);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkHudCount();