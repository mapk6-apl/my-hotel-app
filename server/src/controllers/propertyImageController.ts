import type { Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

type PropertyRecord = {
  name: string;
  city: string;
};

type UnsplashPhoto = {
  id?: string;
  urls?: { regular?: string };
  alt_description?: string | null;
  links?: { html?: string; download_location?: string };
  user?: { name?: string; links?: { html?: string } };
};

type UsableUnsplashPhoto = UnsplashPhoto & {
  id: string;
  urls: { regular: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
};

type SavedUnsplashImage = {
  image_url: string;
  photo_id: string;
  attribution_name: string;
  attribution_url: string;
  source_url: string;
  alt_text: string;
  source_name: string;
};

const isUnsplashPhotoUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      ['images.unsplash.com'].includes(url.hostname);
  } catch {
    return false;
  }
};

const isUnsplashPageUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      ['unsplash.com', 'www.unsplash.com'].includes(url.hostname);
  } catch {
    return false;
  }
};

const withUnsplashAttribution = (value: string): string => {
  const url = new URL(value);
  url.searchParams.set('utm_source', 'breakaway_hotels');
  url.searchParams.set('utm_medium', 'referral');
  return url.toString();
};

const isUsablePhoto = (photo: UnsplashPhoto): photo is UsableUnsplashPhoto =>
  typeof photo.id === 'string' &&
  typeof photo.urls?.regular === 'string' &&
  isUnsplashPhotoUrl(photo.urls.regular) &&
  typeof photo.links?.html === 'string' &&
  isUnsplashPageUrl(photo.links.html) &&
  typeof photo.links.download_location === 'string' &&
  typeof photo.user?.name === 'string' &&
  typeof photo.user.links?.html === 'string' &&
  isUnsplashPageUrl(photo.user.links.html);

const searchUnsplash = async (
  query: string,
  headers: Record<string, string>
): Promise<UsableUnsplashPhoto[]> => {
  const searchUrl = new URL('https://api.unsplash.com/search/photos');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('per_page', '30');
  searchUrl.searchParams.set('orientation', 'landscape');
  searchUrl.searchParams.set('content_filter', 'high');
  searchUrl.searchParams.set('order_by', 'relevant');

  const response = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(15000) });
  if (!response.ok) {
    if (response.status === 429) {
      throw Object.assign(new Error('Image provider rate limit reached. Try again later.'), { status: 429 });
    }
    if (response.status === 401 || response.status === 403) {
      throw Object.assign(new Error('Unsplash rejected the configured access key. Check UNSPLASH_ACCESS_KEY on the server.'), { status: 503 });
    }
    throw Object.assign(new Error('The image provider could not complete this search.'), { status: 502 });
  }
  const data = await response.json() as { results?: UnsplashPhoto[] };
  return Array.isArray(data.results) ? data.results.filter(isUsablePhoto) : [];
};

const saveGalleryHero = async (propertyId: number, images: SavedUnsplashImage[]): Promise<void> => {
  if (images.length === 0) return;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accommodation_images SET is_hero = false WHERE accommodation_id = $1', [propertyId]);
    await client.query(
      `UPDATE accommodation_images
       SET is_hero = true
       WHERE accommodation_id = $1 AND source_name = 'Unsplash' AND photo_id = $2`,
      [propertyId, images[0]!.photo_id]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const importPropertyImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const propertyId = Number(req.params.id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    res.status(400).json({ error: 'Invalid property ID.' });
    return;
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    res.status(503).json({ error: 'Image search is not configured. Set UNSPLASH_ACCESS_KEY on the server.' });
    return;
  }

  try {
    const schema = await pool.query<{ column_name: string }>(
      `SELECT column_name
       FROM information_schema.columns
       WHERE table_schema = current_schema()
         AND table_name = 'accommodation_images'
         AND column_name = ANY($1::text[])`,
      [['source_name', 'attribution_name', 'attribution_url', 'alt_text', 'display_order', 'photo_id', 'source_url']]
    );
    if (schema.rows.length !== 7) {
      res.status(503).json({ error: 'Apply the additive image-attribution and Unsplash photo-ID migrations before importing provider images.' });
      return;
    }

    const propertyResult = await pool.query<PropertyRecord>(
      'SELECT name, city FROM accommodations WHERE id = $1',
      [propertyId]
    );
    const property = propertyResult.rows[0];
    if (!property) {
      res.status(404).json({ error: 'Property not found.' });
      return;
    }

    const savedImages = await pool.query<SavedUnsplashImage>(
      `SELECT image_url, photo_id, attribution_name, attribution_url, source_url, alt_text, source_name
       FROM accommodation_images
       WHERE accommodation_id = $1 AND source_name = 'Unsplash' AND photo_id IS NOT NULL
       ORDER BY display_order ASC, id ASC`,
      [propertyId]
    );
    if (savedImages.rows.length >= 5) {
      await saveGalleryHero(propertyId, savedImages.rows);
      res.status(200).json({ success: true, count: savedImages.rows.length, data: savedImages.rows });
      return;
    }

    const usedImages = await pool.query<{ photo_id: string }>(
      `SELECT photo_id FROM accommodation_images WHERE source_name = 'Unsplash' AND photo_id IS NOT NULL`
    );
    const usedPhotoIds = new Set(usedImages.rows.map((image) => image.photo_id));
    const existingPhotoIds = new Set(savedImages.rows.map((image) => image.photo_id));
    const selectedPhotos: UsableUnsplashPhoto[] = [];
    const queryTerms = [
      `${property.city} hotel`,
      `${property.city} South Africa`,
      'hotel bedroom',
      'hotel bathroom',
      'hotel restaurant',
      'hotel swimming pool',
      'hotel interior',
      'South Africa landscape',
    ];
    const headers = { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' };

    for (const term of queryTerms) {
      if (selectedPhotos.length >= 5 - savedImages.rows.length) break;
      const results = await searchUnsplash(term, headers);
      for (const photo of results) {
        if (selectedPhotos.length >= 5 - savedImages.rows.length) break;
        if (usedPhotoIds.has(photo.id) || existingPhotoIds.has(photo.id)) continue;
        selectedPhotos.push(photo);
        usedPhotoIds.add(photo.id);
      }
    }

    if (selectedPhotos.length === 0) {
      res.status(404).json({ error: `No new suitable Unsplash images were found for ${property.city}.` });
      return;
    }

    for (const photo of selectedPhotos) {
      const downloadUrl = new URL(photo.links.download_location);
      if (downloadUrl.hostname !== 'api.unsplash.com' || downloadUrl.protocol !== 'https:') {
        res.status(502).json({ error: 'The image provider returned an invalid download reference.' });
        return;
      }
      const downloadResponse = await fetch(downloadUrl, { headers, signal: AbortSignal.timeout(15000) });
      if (!downloadResponse.ok) {
        const status = downloadResponse.status === 429
          ? 429
          : downloadResponse.status === 401 || downloadResponse.status === 403
            ? 503
            : 502;
        const error = status === 429
          ? 'Image provider rate limit reached while recording photo usage. Try again later.'
          : status === 503
            ? 'Unsplash rejected the configured access key. Check UNSPLASH_ACCESS_KEY on the server.'
            : 'The image provider could not record image usage.';
        res.status(status).json({ error });
        return;
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query<{ next_order: number }>(
        `SELECT COALESCE(MAX(display_order), -1)::integer + 1 AS next_order
         FROM accommodation_images WHERE accommodation_id = $1`,
        [propertyId]
      );
      let displayOrder = orderResult.rows[0]?.next_order ?? 0;
      const imported: SavedUnsplashImage[] = [...savedImages.rows];
      for (const photo of selectedPhotos) {
        const values = {
          accommodationId: propertyId,
          imageUrl: photo.urls.regular,
          isHero: imported.length === 0,
          photographer: photo.user.name,
          photographerUrl: withUnsplashAttribution(photo.user.links.html),
          altText: photo.alt_description || `Representative hotel image for ${property.name}; not a verified property photograph.`,
          displayOrder,
          photoId: photo.id,
          sourceUrl: withUnsplashAttribution(photo.links.html),
        };
        const inserted = await client.query<SavedUnsplashImage>(
          `INSERT INTO accommodation_images
             (accommodation_id, image_url, is_hero, source_name, attribution_name, attribution_url,
              alt_text, display_order, photo_id, source_url)
           VALUES ($1, $2, $3, 'Unsplash', $4, $5, $6, $7, $8, $9)
           ON CONFLICT (accommodation_id, source_name, photo_id)
             WHERE photo_id IS NOT NULL
           DO UPDATE SET image_url = EXCLUDED.image_url,
                         attribution_name = EXCLUDED.attribution_name,
                         attribution_url = EXCLUDED.attribution_url,
                         source_url = EXCLUDED.source_url,
                         alt_text = EXCLUDED.alt_text,
                         display_order = EXCLUDED.display_order
           RETURNING image_url, photo_id, attribution_name, attribution_url,
                     source_url, alt_text, source_name`,
          [
            values.accommodationId,
            values.imageUrl,
            values.isHero,
            values.photographer,
            values.photographerUrl,
            values.altText,
            values.displayOrder,
            values.photoId,
            values.sourceUrl,
          ]
        );
        if (inserted.rows[0]) imported.push(inserted.rows[0]);
        displayOrder += 1;
      }

      await client.query('UPDATE accommodation_images SET is_hero = false WHERE accommodation_id = $1', [propertyId]);
      if (imported[0]) {
        await client.query(
          `UPDATE accommodation_images
           SET is_hero = true
           WHERE accommodation_id = $1 AND source_name = 'Unsplash' AND photo_id = $2`,
          [propertyId, imported[0].photo_id]
        );
      }
      await client.query('COMMIT');
      res.status(200).json({ success: true, count: imported.length, data: imported });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing property images:', error);
    const status = typeof error === 'object' && error !== null && 'status' in error &&
      (error.status === 429 || error.status === 502 || error.status === 503)
      ? error.status
      : 500;
    res.status(status).json({
      error: error instanceof Error ? error.message : 'Unable to import property images.',
    });
  }
};
