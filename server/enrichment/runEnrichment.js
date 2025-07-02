import { db } from '../db.js';
import { communities } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { storage } from '../storage.js';
import { foursquareLookup } from './foursquareLookup.js';
import { mapillaryPhoto } from './mapillaryPhoto.js';
import { mapboxStaticPhoto } from './mapboxStaticPhoto.js';
import { yelpLookup } from './yelpLookup.js';
import { googlePlaceDetail } from './googlePlaceDetail.js';
import { validatePhone } from './phoneValidate.js';
import { logEnrichmentCall, checkDailyLimits } from './spendGuards.js';

/**
 * FREE → CHEAP → PAID enrichment cascade
 * 1. State licensing (free, already in DB)
 * 2. Foursquare (950 calls/day free)
 * 3. Mapillary photos (unlimited free)
 * 4. Mapbox static photos (50k/month free)
 * 5. Yelp lookup ($0.008/call after 5k free)
 * 6. Google Places ($0.017/call, only if < 3 photos)
 */
export async function runEnrichment(communityId) {
  try {
    // Get community data
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.id, communityId));

    if (!community) {
      throw new Error(`Community ${communityId} not found`);
    }

    console.log(`Starting enrichment for: ${community.name}`);
    
    let photos = community.photos || [];
    let enrichmentData = {
      photos: [...photos],
      confidence: 0,
      phoneValid: null,
      yelpRating: community.rating,
      yelpReviewCount: 0,
      sources: ['database']
    };

    // Check daily spend limits before expensive calls
    const spendCheck = await checkDailyLimits();
    if (spendCheck.alertTriggered) {
      console.warn('Daily spend limits reached, skipping paid APIs');
    }

    // Step 1: State licensing (already in DB - increment confidence)
    if (community.licenseStatus === 'Licensed') {
      enrichmentData.confidence += 20;
      enrichmentData.sources.push('state_licensing');
    }

    // Step 2: Foursquare lookup (950 calls/day free)
    if (process.env.FOURSQUARE_API_KEY) {
      try {
        const foursquareData = await foursquareLookup(community);
        if (foursquareData) {
          enrichmentData.photos.push(...(foursquareData.photos || []));
          enrichmentData.confidence += 15;
          enrichmentData.sources.push('foursquare');
          await logEnrichmentCall('foursquare', 0);
        }
      } catch (error) {
        console.warn('Foursquare lookup failed:', error.message);
      }
    }

    // Step 3: Mapillary photos (unlimited free)
    if (process.env.MAPILLARY_TOKEN) {
      try {
        const mapillaryPhotos = await mapillaryPhoto(community);
        if (mapillaryPhotos?.length > 0) {
          enrichmentData.photos.push(...mapillaryPhotos);
          enrichmentData.confidence += 10;
          enrichmentData.sources.push('mapillary');
          await logEnrichmentCall('mapillary', 0);
        }
      } catch (error) {
        console.warn('Mapillary photo lookup failed:', error.message);
      }
    }

    // Step 4: Mapbox static photos (50k/month free)
    if (process.env.MAPBOX_TOKEN && enrichmentData.photos.length < 2) {
      try {
        const mapboxPhoto = await mapboxStaticPhoto(community);
        if (mapboxPhoto) {
          enrichmentData.photos.push(mapboxPhoto);
          enrichmentData.confidence += 5;
          enrichmentData.sources.push('mapbox');
          await logEnrichmentCall('mapbox', 0);
        }
      } catch (error) {
        console.warn('Mapbox static photo failed:', error.message);
      }
    }

    // Step 5: Yelp lookup (5k calls/day free, then $0.008/call)
    if (process.env.YELP_API_KEY && !spendCheck.alertTriggered) {
      try {
        const yelpData = await yelpLookup(community);
        if (yelpData) {
          enrichmentData.photos.push(...(yelpData.photos || []));
          enrichmentData.yelpRating = yelpData.rating || enrichmentData.yelpRating;
          enrichmentData.yelpReviewCount = yelpData.reviewCount || 0;
          enrichmentData.confidence += 25;
          enrichmentData.sources.push('yelp');
          await logEnrichmentCall('yelp', yelpData.cost || 0);
        }
      } catch (error) {
        console.warn('Yelp lookup failed:', error.message);
      }
    }

    // Step 6: Google Places ($0.017/call, only if < 3 photos)
    if (process.env.GOOGLE_PLACES_API_KEY && 
        enrichmentData.photos.length < 3 && 
        !spendCheck.alertTriggered) {
      try {
        const googleData = await googlePlaceDetail(community);
        if (googleData) {
          enrichmentData.photos.push(...(googleData.photos || []));
          enrichmentData.confidence += 25;
          enrichmentData.sources.push('google_places');
          await logEnrichmentCall('google_places', 0.017);
        }
      } catch (error) {
        console.warn('Google Places lookup failed:', error.message);
      }
    }

    // Phone validation with Twilio ($0.005/lookup)
    if (process.env.TWILIO_LOOKUP_KEY && community.phone) {
      try {
        const phoneValidation = await validatePhone(community.phone);
        enrichmentData.phoneValid = phoneValidation.isValid;
        if (phoneValidation.isValid) {
          enrichmentData.confidence += 10;
        }
        enrichmentData.sources.push('twilio_phone');
        await logEnrichmentCall('twilio', 0.005);
      } catch (error) {
        console.warn('Phone validation failed:', error.message);
        enrichmentData.phoneValid = false;
      }
    }

    // Remove duplicate photos
    enrichmentData.photos = [...new Set(enrichmentData.photos)];

    // Update database with enriched data
    await db
      .update(communities)
      .set({
        photos: enrichmentData.photos,
        rating: enrichmentData.yelpRating,
        phoneValid: enrichmentData.phoneValid,
        enrichmentSources: enrichmentData.sources,
        enrichmentDate: new Date(),
        confidenceScore: enrichmentData.confidence
      })
      .where(eq(communities.id, communityId));

    console.log(`Enrichment completed for ${community.name}:`, {
      photos: enrichmentData.photos.length,
      confidence: enrichmentData.confidence,
      phoneValid: enrichmentData.phoneValid,
      sources: enrichmentData.sources.length
    });

    return {
      success: true,
      communityId,
      communityName: community.name,
      photosAdded: enrichmentData.photos.length - photos.length,
      totalPhotos: enrichmentData.photos.length,
      confidence: enrichmentData.confidence,
      phoneValid: enrichmentData.phoneValid,
      sources: enrichmentData.sources
    };

  } catch (error) {
    console.error('Enrichment failed:', error);
    return {
      success: false,
      communityId,
      error: error.message
    };
  }
}

/**
 * Batch enrichment for multiple communities
 */
export async function runBatchEnrichment(communityIds, maxConcurrent = 3) {
  const results = [];
  
  // Process in batches to avoid overwhelming APIs
  for (let i = 0; i < communityIds.length; i += maxConcurrent) {
    const batch = communityIds.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(id => runEnrichment(id));
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.value || r.reason));
      
      // Rate limiting between batches
      if (i + maxConcurrent < communityIds.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('Batch enrichment error:', error);
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
}