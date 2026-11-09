ALTER TABLE accommodation_images
  ADD COLUMN IF NOT EXISTS photo_id TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS accommodation_images_source_photo_unique
  ON accommodation_images (accommodation_id, source_name, photo_id)
  WHERE photo_id IS NOT NULL;
