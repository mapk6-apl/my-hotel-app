import type { Response } from 'express';
import { pool } from '../config/db.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

type PropertyRecord = {
  name: string;
  city: string;
  description: string;
};

type UnsplashPhoto = {
  urls?: { regular?: string };
  alt_description?: string | null;
  links?: { html?: string; download_location?: string };
  user?: { name?: string; links?: { html?: string } };
};

const withUnsplashAttribution = (value: string): string => {
  const url = new URL(value);
  url.searchParams.set('utm_source', 'breakaway_hotels');
  url.searchParams.set('utm_medium', 'referral');
  return url.toString();
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
      [['source_name', 'attribution_name', 'attribution_url', 'alt_text', 'display_order']]
    );
    if (schema.rows.length !== 5) {
      res.status(503).json({ error: 'Apply the additive image-attribution migration before importing provider images.' });
      return;
    }

    const propertyResult = await pool.query<PropertyRecord>(
      'SELECT name, city, description FROM accommodations WHERE id = $1',
      [propertyId]
    );
    const property = propertyResult.rows[0];
    if (!property) {
      res.status(404).json({ error: 'Property not found.' });
      return;
    }

    const characteristics = property.description.split(/[,.]/, 1)[0] || 'hotel accommodation';
    const query = [
      property.city,
      'South Africa',
      property.name.replace(/^Break-Away Hotel\s*/i, ''),
      characteristics,
    ].join(' ').slice(0, 240);
    const searchUrl = new URL('https://api.unsplash.com/search/photos');
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('per_page', '5');
    searchUrl.searchParams.set('orientation', 'landscape');
    searchUrl.searchParams.set('content_filter', 'high');

    const headers = { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' };
    const searchResponse = await fetch(searchUrl, { headers, signal: AbortSignal.timeout(15000) });
    if (!searchResponse.ok) {
      res.status(searchResponse.status === 429 ? 429 : 502).json({
        error: searchResponse.status === 429
          ? 'Image provider rate limit reached. Try again later.'
          : 'The image provider could not complete this search.',
      });
      return;
    }

    const searchData = await searchResponse.json() as { results?: UnsplashPhoto[] };
    const photos = Array.isArray(searchData.results)
      ? searchData.results.filter((photo) =>
          typeof photo.urls?.regular === 'string' &&
          typeof photo.links?.html === 'string' &&
          typeof photo.links.download_location === 'string' &&
          typeof photo.user?.name === 'string' &&
          typeof photo.user.links?.html === 'string' &&
          new URL(photo.urls.regular).hostname === 'images.unsplash.com'
        ).slice(0, 5)
      : [];
    if (photos.length === 0) {
      res.status(404).json({ error: 'No suitable property images were returned for this search.' });
      return;
    }

    for (const photo of photos) {
      const downloadUrl = new URL(photo.links!.download_location!);
      if (downloadUrl.hostname !== 'api.unsplash.com' || downloadUrl.protocol !== 'https:') {
        res.status(502).json({ error: 'The image provider returned an invalid download reference.' });
        return;
      }
      const downloadResponse = await fetch(downloadUrl, { headers, signal: AbortSignal.timeout(15000) });
      if (!downloadResponse.ok) {
        res.status(502).json({ error: 'The image provider could not record image usage.' });
        return;
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'UPDATE accommodation_images SET is_hero = false WHERE accommodation_id = $1',
        [propertyId]
      );

      const imported = [];
      for (const [displayOrder, photo] of photos.entries()) {
        const imageUrl = new URL(photo.urls!.regular!);
        imageUrl.searchParams.set('auto', 'format');
        imageUrl.searchParams.set('fit', 'crop');
        imageUrl.searchParams.set('w', '1400');
        imageUrl.searchParams.set('q', '85');
        imageUrl.searchParams.set('utm_source', 'breakaway_hotels');
        imageUrl.searchParams.set('utm_medium', 'referral');
        const values = [
          propertyId,
          imageUrl.toString(),
          displayOrder === 0,
          'Unsplash',
          photo.user!.name!,
          withUnsplashAttribution(photo.user!.links!.html!),
          photo.alt_description || `Representative image for ${property.name}`,
          displayOrder,
        ];
        const existing = await client.query<{ id: number }>(
          'SELECT id FROM accommodation_images WHERE accommodation_id = $1 AND image_url = $2 ORDER BY id ASC LIMIT 1 FOR UPDATE',
          [propertyId, values[1]]
        );
        if (existing.rows[0]) {
          await client.query(
            `UPDATE accommodation_images
             SET is_hero = $1, source_name = $2, attribution_name = $3,
                 attribution_url = $4, alt_text = $5, display_order = $6
             WHERE id = $7`,
            [values[2], values[3], values[4], values[5], values[6], values[7], existing.rows[0].id]
          );
        } else {
          await client.query(
            `INSERT INTO accommodation_images
             (accommodation_id, image_url, is_hero, source_name, attribution_name, attribution_url, alt_text, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            values
          );
        }
        imported.push({
          image_url: values[1],
          alt_text: values[6],
          attribution_name: values[4],
          attribution_url: values[5],
          source_name: values[3],
        });
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
    res.status(500).json({ error: 'Unable to import property images.' });
  }
};
