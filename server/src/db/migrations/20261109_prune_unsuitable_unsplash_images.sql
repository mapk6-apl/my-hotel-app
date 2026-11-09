UPDATE accommodation_images image
SET is_hero = TRUE
WHERE image.source_name = 'Unsplash'
  AND image.id = (
    SELECT candidate.id
    FROM accommodation_images candidate
    WHERE candidate.accommodation_id = image.accommodation_id
    ORDER BY candidate.display_order NULLS LAST, candidate.id
    LIMIT 1
  )
  AND NOT EXISTS (
    SELECT 1
    FROM accommodation_images existing_hero
    WHERE existing_hero.accommodation_id = image.accommodation_id
      AND existing_hero.is_hero = TRUE
  );
