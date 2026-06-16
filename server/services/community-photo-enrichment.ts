import { communities } from '@shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { normalizePhotoUrls } from '../utils/photo-urls';
import { communityNameTokens } from './free-enrichment-service';

// Generic photo-descriptor words that appear in image filenames but are NOT part
// of a community's proper name (e.g. "Dining", "Exterior"). Stripped before we
// decide whether a filename embeds a *different* facility's name.
const PHOTO_DESCRIPTOR_WORDS = new Set([
  'photo', 'photos', 'image', 'images', 'img', 'pic', 'pics', 'picture',
  'dining', 'room', 'rooms', 'exterior', 'interior', 'building', 'front',
  'lobby', 'bedroom', 'bathroom', 'kitchen', 'garden', 'gardens', 'patio',
  'view', 'views', 'entrance', 'hallway', 'courtyard', 'pool', 'gallery',
  'hero', 'banner', 'main', 'thumb', 'thumbnail', 'large', 'small', 'medium',
  'default', 'cover', 'outside', 'inside', 'aerial', 'sign', 'logo', 'map',
  'amenity', 'amenities', 'common', 'area', 'areas', 'suite', 'apartment',
  'living', 'bed', 'bath', 'floor', 'plan', 'floorplan', 'grounds', 'campus',
]);

// Strong markers that a filename slug encodes a named senior-living FACILITY
// (as opposed to a random descriptor). Used together with distinctive proper-name
// tokens to confirm a filename carries a specific community's name.
const FACILITY_NAME_MARKERS = [
  'care center', 'care-center', 'carecenter', 'memory care', 'memory-care',
  'assisted living', 'assisted-living', 'skilled nursing', 'skilled-nursing',
  'post acute', 'post-acute', 'postacute', 'senior living', 'senior-living',
  'health center', 'health-center', 'nursing', 'rehabilitation', 'alzheimer',
  'retirement', 'village', 'manor', 'estates', 'commons', 'hospice', 'lodge',
];

/**
 * Community Photo Enrichment Service
 * NO STOCK PHOTOS - Only real photos from verified sources
 */

export class CommunityPhotoEnrichment {
  /**
   * Check if a photo URL is a placeholder, stock photo, or non-photo asset
   */
  static isStockOrPlaceholderPhoto(url: string): boolean {
    if (!url) return true;
    
    // Block ALL stock photo services, placeholders, and non-photo assets
    const blockedPatterns = [
      // Stock photo services
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'shutterstock.com',
      // Stock images served from directory CDNs (filename / path patterns):
      // e.g. seniorliving.org/.../listing-stock-images/shutterstock_123.jpg —
      // generic placeholders a directory shows when it has no real photo.
      'shutterstock',
      'listing-stock-images',
      '/stock-images/',
      'stock-photo',
      'stockphoto',
      'gettyimages.com',
      'istockphoto.com',
      'depositphotos.com',
      'adobestock.com',
      'freepik.com',
      'rawpixel.com',
      'burst.shopify.com',
      'stocksnap.io',
      'picjumbo.com',
      // Placeholders
      'placeholder.com',
      'via.placeholder.com',
      'placehold.it',
      'placeimg.com',
      'dummyimage.com',
      'lorempixel.com',
      '/api/placeholder/',
      // Icons and logos (NOT real community photos)
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'youtube',
      'pinterest',
      '/icon',
      '/logo',
      '-icon.',
      '-logo.',
      'social-media',
      'social_media',
      'foot-facebook',
      'foot-twitter',
      'sns/', // social network service icons
      'badge',
      'button',
      '.svg',
      'tracking',
      'analytics',
      '1x1',
      'spacer',
      // 'blank.' (not bare 'blank') so tracking pixels like blank.gif/blank.png
      // are blocked without false-positiving real photos such as "blanket-room.jpg".
      'blank.',
      'loading.gif',
      'loading.png',
      'spinner',
      'loader',
      'mt-association',
      'association-top',
      'banner-ad',
      'advertisement',
      // Listing sites that serve generic template images, not community-specific photos
      'lowincomehousing.us',
      'mapquest.com',
      'after55.com',
      // Listing-site placeholder/template image filename patterns
      'no_photo',
      'nophoto',
      'no-photo',
      'placeholder',
      'divider-half',
      '/divider',
      'default_community_property',
      'templates/homely',
      // Directory-specific placeholder / "no image" / "coming soon" assets
      'coming-soon',
      'coming_soon',
      'comingsoon',
      'no-image',
      'no_image',
      'noimage',
      'image-coming',
      'image_coming',
      'image-unavailable',
      'image_unavailable',
      'image-not-available',
      'imagenotavailable',
      'not-available',
      'default-image',
      'default_image',
      'default-photo',
      'default_photo',
      'default-property',
      'default-listing',
      'default-community',
      'default-thumb',
      // Directory site logos / branding / chrome (never community photos)
      'site-logo',
      'sitelogo',
      'header-logo',
      'footer-logo',
      'brand-logo',
      'company-logo',
      'apfm-logo',
      'apfm_logo',
      'a-place-for-mom-logo',
      'caring-logo',
      // Directory app-store / rating / map-pin chrome
      'google-play',
      'googleplay',
      'app-store',
      'appstore',
      'play-store',
      'star-rating',
      'rating-star',
      '/stars/',
      'map-pin',
      'mappin',
      '/pins/',
      'avatar',
      '/sprites/',
      'sprites.',
      // Maps and non-photo graphics (not real community photos)
      'road-map',
      'roadmap',
      'road_map',
      'map-image',
      'map_image',
      'street-image',
      'street_image',
      'static-map',
      'staticmap',
      'maps.google',
      'maps.googleapis',
      'mapbox',
      '/map/',
      '-map.',
      '_map.',
      'sprite',
      'favicon',
      // UI chrome that leaks in from scraping contact / email-confirmation pages
      'sentsuccessfully',
      'sent-successfully',
      'closex',
      'close-x',
      'close_x',
      'checkmark',
      'check-mark',
      'check_mark',
      'successicon',
      'success-icon',
      'success_icon',
      // Arrow / navigation chrome
      'arrow-right',
      'arrow-left',
      'arrow_right',
      'arrow_left',
      'prev-arrow',
      'next-arrow',
      'breadcrumb',
      // Very small thumbnail/icon sizes embedded in the URL path or query string
      // e.g. photo-50x50.jpg, thumb_80x60.png
      // Blocked via the URL-normalisation step in isSmallThumbnailUrl, not here.
    ];
    
    const urlLower = url.toLowerCase();
    return blockedPatterns.some(pattern => urlLower.includes(pattern));
  }

  /**
   * Returns true when a URL encodes tiny icon/thumbnail dimensions that make it
   * unsuitable as a community gallery photo.
   * Matches patterns like: photo-50x50.jpg, thumb_80x60.png, ?w=30&h=30,
   * ?width=48, ?size=32, /32x32/, etc.
   * Only flags images where BOTH dimensions (when detectable) are ≤ 150px, or
   * where a single dimension indicator is ≤ 100px.
   */
  static isSmallThumbnailUrl(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();

    // Match WxH patterns (path segment or filename): e.g. 50x50, 80x60, 32x32
    const whMatch = lower.match(/[_\-\/](\d+)x(\d+)[_\-\/\.]/);
    if (whMatch) {
      const w = parseInt(whMatch[1], 10);
      const h = parseInt(whMatch[2], 10);
      if (w <= 150 && h <= 150) return true;
    }

    // Match single-dimension query params: ?w=32, ?width=48, ?size=32, ?thumb=50
    const singleDimMatch = lower.match(/[?&](?:w|h|width|height|size|thumb|thumbnail)=(\d+)/);
    if (singleDimMatch) {
      const dim = parseInt(singleDimMatch[1], 10);
      if (dim <= 100) return true;
    }

    return false;
  }

  /**
   * Derive a normalised "base key" from a photo URL that strips dimension
   * hints so that 250x150 and 750x500 variants of the same asset share a key.
   * Used by deduplication to prefer the largest-available version.
   */
  static normalisedPhotoKey(url: string): string {
    try {
      const parsed = new URL(url);
      // Strip common dimension query params
      ['w', 'h', 'width', 'height', 'size', 'thumb', 'thumbnail', 'resize',
       'dimensions', 'format', 'quality', 'q', 'fit', 'dpr'].forEach(p => {
        parsed.searchParams.delete(p);
      });
      // Strip dimension suffixes from pathname: -250x150, _750x500, /32x32
      const cleanPath = parsed.pathname
        .replace(/[_\-]?\d+x\d+/gi, '')
        .replace(/\/\d+x\d+\//gi, '/');
      parsed.pathname = cleanPath;
      return (parsed.hostname + parsed.pathname + parsed.search).toLowerCase();
    } catch {
      // Relative or malformed URL — strip inline WxH only
      return url.toLowerCase().replace(/[_\-]?\d+x\d+/gi, '');
    }
  }

  /**
   * Decide whether a photo URL/filename embeds a DIFFERENT community's name.
   *
   * Directory CDNs (seniorly.com, caring.com, etc.) sometimes store an image
   * whose filename is the slug of another facility — e.g.
   * `Willow-Springs-Alzheimers-Special-Care-Center-Dining.jpg` saved onto a
   * Quartz Hill listing. Such photos clearly belong elsewhere and violate the
   * Golden Data Rule.
   *
   * Conservative by design — only returns true when ALL hold:
   *   1. The filename slug contains a senior-living facility marker
   *      (e.g. "care center", "alzheimer", "post acute"), AND
   *   2. It contains ≥2 distinctive proper-name tokens (after dropping generic
   *      senior-living stopwords and photo-descriptor words), AND
   *   3. The TARGET community is NOT referenced by those tokens.
   * Ambiguous filenames (numeric IDs, generic descriptors) are kept.
   */
  static photoBelongsToDifferentCommunity(
    url: string,
    name: string,
    city: string,
    officialWebsite?: string,
  ): boolean {
    if (!url || !name) return false;

    // Extract the human-readable filename slug (last path segment, no extension)
    // and the host (used for the own-domain guard below).
    let slug = '';
    let host = '';
    try {
      const u = new URL(url);
      host = u.hostname.replace(/^www\./, '').toLowerCase();
      const segs = u.pathname.split('/').filter(Boolean);
      slug = decodeURIComponent(segs[segs.length - 1] || '');
    } catch {
      slug = url;
    }
    slug = slug.replace(/\.[a-z0-9]{2,5}$/i, '');

    // Normalise separators (-, _, +, %20, digits) to spaces.
    const phrase = slug
      .replace(/[^a-zA-Z]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (!phrase) return false;

    // 1. Must look like a named facility.
    const hasFacilityMarker = FACILITY_NAME_MARKERS.some((m) => phrase.includes(m));
    if (!hasFacilityMarker) return false;

    // 2. Must carry ≥2 distinctive proper-name tokens (drop generic + descriptor words).
    const facilityNameTokens = communityNameTokens(phrase).filter(
      (t) => !PHOTO_DESCRIPTOR_WORDS.has(t),
    );
    if (facilityNameTokens.length < 2) return false;

    // 3. Does the filename reference THIS community? If so, keep it.
    const targetTokens = communityNameTokens(name);
    if (targetTokens.length === 0) return false; // can't judge — keep
    const matched = targetTokens.filter((t) => phrase.includes(t)).length;
    const referencesThis =
      matched / targetTokens.length >= 0.5 || (targetTokens.length >= 3 && matched >= 2);
    if (referencesThis) return false;

    // City match is a weak signal of ownership — if the slug embeds this
    // community's city it may still be a same-facility photo; keep to stay safe.
    const cityNorm = (city || '').toLowerCase().trim();
    if (cityNorm && cityNorm.length >= 4 && phrase.includes(cityNorm)) return false;

    // Own-domain guard: a photo hosted on the community's OWN site is theirs even
    // if the filename is a program/event name (e.g. "Alzheimers-Memories-in-the-
    // Making" on stellarcaresd.com). Keep when the host matches the official
    // website OR the host embeds a distinctive name token of this community.
    if (host) {
      let officialHost = '';
      try {
        const ow = (officialWebsite || '').trim();
        if (ow && /\./.test(ow) && !/\s/.test(ow)) {
          officialHost = new URL(/^https?:\/\//i.test(ow) ? ow : `https://${ow}`)
            .hostname.replace(/^www\./, '')
            .toLowerCase();
        }
      } catch {
        /* unparseable website — ignore */
      }
      if (officialHost && (host === officialHost || host.endsWith(`.${officialHost}`))) {
        return false;
      }
      const hostAlpha = host.replace(/[^a-z]/g, '');
      if (targetTokens.some((t) => t.length >= 4 && hostAlpha.includes(t))) {
        return false;
      }
    }

    return true; // embeds a named facility that isn't this one
  }

  /**
   * Remove photos that clearly belong to a different community (name mismatch in
   * the filename). Conservative — keeps anything ambiguous.
   */
  static filterPhotosForCommunity(
    photos: string[],
    name: string,
    city: string,
    officialWebsite?: string,
  ): string[] {
    if (!photos || photos.length === 0) return [];
    return photos.filter(
      (u) => !this.photoBelongsToDifferentCommunity(u, name, city, officialWebsite),
    );
  }

  /**
   * Clean a photo array for one community:
   *  1. Remove exact-URL duplicates
   *  2. Remove noise / UI-chrome patterns (isStockOrPlaceholderPhoto + isSmallThumbnailUrl)
   *  3. Collapse thumbnail variants — when several URLs share the same normalised key,
   *     keep the one with the largest apparent dimensions (longest URL as tie-breaker).
   * Returns the cleaned array (same reference iff nothing changed).
   */
  static cleanPhotoArray(photos: any[]): string[] {
    if (!photos || photos.length === 0) return [];

    // Step 0 – normalize: extract URLs from object entries, decode HTML
    // entities (&amp; etc.), unwrap proxy URLs, drop "[object Object]"/non-http.
    const normalized = normalizePhotoUrls(photos);

    // Step 1 – exact dedup
    const unique = [...new Set(normalized.filter(p => typeof p === 'string' && p.trim().length > 0))];

    // Step 2 – noise removal
    const filtered = unique.filter(p => !this.isStockOrPlaceholderPhoto(p) && !this.isSmallThumbnailUrl(p));

    // Step 3 – collapse thumbnail variants
    // Build a map: normalised key → best URL
    const byKey = new Map<string, string>();
    for (const url of filtered) {
      const key = this.normalisedPhotoKey(url);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, url);
      } else {
        // Prefer the variant whose path/filename encodes larger dimensions.
        // Simple heuristic: prefer the URL with larger max(W, H).
        const extractMaxDim = (u: string): number => {
          const m = u.toLowerCase().match(/[_\-\/](\d+)x(\d+)/);
          if (m) return Math.max(parseInt(m[1], 10), parseInt(m[2], 10));
          const q = u.toLowerCase().match(/[?&](?:w|width)=(\d+)/);
          if (q) return parseInt(q[1], 10);
          return 0;
        };
        if (extractMaxDim(url) > extractMaxDim(existing)) {
          byKey.set(key, url);
        } else if (extractMaxDim(url) === extractMaxDim(existing) && url.length > existing.length) {
          // Same apparent size — keep the longer URL (usually higher quality)
          byKey.set(key, url);
        }
      }
    }

    return [...byKey.values()];
  }

  /**
   * Get only real photos for a community (NO STOCK PHOTOS)
   */
  static getEnrichedPhotosForCommunity(community: any): string[] {
    // Check existing photos and filter out ANY stock/placeholder photos.
    // normalizePhotoUrls runs FIRST so legacy corruption ("[object Object]",
    // object entries, &amp;-encoded URLs) is cleaned at serve time — this is the
    // central read getter behind /api/communities/:id, so every public detail
    // read is protected, not just comprehensive-data.
    const existingPhotos = normalizePhotoUrls([
      ...(community.photos || []),
      ...(community.imageGallery || []),
      ...(community.yelpPhotos || [])
    ]).filter(photo => !this.isStockOrPlaceholderPhoto(photo));

    // Golden Data Rule: drop photos whose filename embeds a DIFFERENT facility's
    // name (e.g. a Willow Springs image on a Quartz Hill listing). Applied at the
    // central read getter so the carousel never shows another community's photos,
    // even before the DB cleanup pass runs.
    const owned = this.filterPhotosForCommunity(
      existingPhotos,
      community.name || '',
      community.city || '',
      community.website || '',
    );

    // Return only real photos, no stock photo fallbacks
    return owned.slice(0, 15);
  }
  
  /**
   * Check community photos - remove any stock photos
   */
  static async enrichCommunityIfNeeded(community: any): Promise<any> {
    if (!community) return community;
    
    // Get only real photos (no stock photos)
    const realPhotos = this.getEnrichedPhotosForCommunity(community);
    
    // Return community with only real photos (empty array if none found)
    return {
      ...community,
      photos: realPhotos
    };
  }
  
  /**
   * Bulk enrich communities - remove stock photos from all
   */
  static async bulkEnrichCommunities(communityIds: number[]): Promise<void> {
    console.log(`Processing ${communityIds.length} communities to remove stock photos...`);
    
    for (const id of communityIds) {
      try {
        const [community] = await db
          .select()
          .from(communities)
          .where(eq(communities.id, id))
          .limit(1);
        
        if (community) {
          const realPhotos = this.getEnrichedPhotosForCommunity(community);
          
          // Update only if we need to remove stock photos
          if (community.photos && Array.isArray(community.photos)) {
            const hadStockPhotos = community.photos.some(photo => 
              this.isStockOrPlaceholderPhoto(photo)
            );
            
            if (hadStockPhotos) {
              await db
                .update(communities)
                .set({ 
                  photos: realPhotos.length > 0 ? realPhotos : null
                })
                .where(eq(communities.id, id));
              
              console.log(`✅ Removed stock photos from community ${id}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing community ${id}:`, error);
      }
    }
    
    console.log('✅ Stock photo removal complete');
  }
  
  /**
   * Get theme info (returns "no stock photos" message)
   */
  static getThemeInfo(): string {
    return 'NO STOCK PHOTOS - Only authentic community photos from verified sources';
  }
}