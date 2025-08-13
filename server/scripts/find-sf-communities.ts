#!/usr/bin/env tsx
/**
 * Find real San Francisco communities for testing
 */

import { db } from "../db";
import { communities } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

async function findSFCommunities() {
  const sfCommunities = await db
    .select({
      name: communities.name,
      address: communities.address,
      city: communities.city,
      state: communities.state,
      description: communities.description
    })
    .from(communities)
    .where(
      and(
        eq(communities.city, 'San Francisco'),
        eq(communities.state, 'CA'),
        sql`${communities.name} NOT LIKE '%Test%'`,
        sql`${communities.name} NOT LIKE '%test%'`,
        sql`${communities.name} LIKE '%Apartments%' OR ${communities.name} LIKE '%Community%' OR ${communities.name} LIKE '%Residence%'`
      )
    )
    .limit(10);

  console.log('Real San Francisco Communities:');
  console.log('='.repeat(60));
  sfCommunities.forEach((c, i) => {
    console.log(`${i+1}. ${c.name}`);
    console.log(`   Address: ${c.address || 'N/A'}`);
    console.log(`   Description: ${c.description ? c.description.substring(0, 80) + '...' : 'EMPTY'}`);
    console.log('');
  });

  return sfCommunities;
}

findSFCommunities()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });