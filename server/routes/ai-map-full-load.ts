import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

// Endpoint to get ALL communities for deck.gl full load test
router.get('/api/ai-map/full-dataset', async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT 
        id,
        name,
        latitude,
        longitude,
        city,
        state,
        community_subtype as type,
        phone,
        website,
        CASE 
          WHEN hud_housing = true THEN true
          WHEN community_subtype IN ('HUD-Sponsored Housing', 'Public Housing', 'LIHTC', 'Section 8') THEN true
          ELSE false
        END as "isHUD",
        CASE 
          WHEN hud_base_rent IS NOT NULL THEN hud_base_rent::text
          WHEN hud_fair_market_rent IS NOT NULL THEN hud_fair_market_rent::text
          WHEN base_pricing IS NOT NULL THEN base_pricing::text
          ELSE 'Contact for pricing'
        END as price
      FROM communities
      WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND latitude BETWEEN -90 AND 90
        AND longitude BETWEEN -180 AND 180
    `);

    // Format as GeoJSON for deck.gl
    const features = result.rows.map((community: any) => ({
      type: 'Feature',
      id: community.id,
      geometry: {
        type: 'Point',
        coordinates: [Number(community.longitude), Number(community.latitude)]
      },
      properties: {
        id: community.id,
        name: community.name,
        city: community.city,
        state: community.state,
        type: community.type,
        isHUD: community.isHUD,
        price: community.price,
        phone: community.phone,
        website: community.website
      }
    }));

    res.json({
      type: 'FeatureCollection',
      features,
      totalCount: features.length
    });
  } catch (error) {
    console.error('Error fetching all communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

export default router;