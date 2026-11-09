ALTER TABLE accommodation_images
  ADD COLUMN IF NOT EXISTS source_name TEXT,
  ADD COLUMN IF NOT EXISTS attribution_name TEXT,
  ADD COLUMN IF NOT EXISTS attribution_url TEXT,
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS display_order INTEGER;
