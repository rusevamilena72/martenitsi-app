/*
  # Add is_primary column to listing_images

  1. Changes
    - Add `is_primary` boolean column to `listing_images` table
    - Default value is false
    - Add constraint to ensure only one primary image per listing
    - Create function and trigger to automatically set first image as primary if none is set

  2. Notes
    - Only one image per listing can be marked as primary
    - If a new image is marked as primary, the old primary is automatically unmarked
*/

-- Add is_primary column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listing_images' AND column_name = 'is_primary'
  ) THEN
    ALTER TABLE listing_images ADD COLUMN is_primary boolean DEFAULT false;
  END IF;
END $$;

-- Function to ensure only one primary image per listing
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    -- Unmark all other images in this listing as primary
    UPDATE listing_images
    SET is_primary = false
    WHERE listing_id = NEW.listing_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS enforce_single_primary_image ON listing_images;
CREATE TRIGGER enforce_single_primary_image
  BEFORE INSERT OR UPDATE ON listing_images
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION ensure_single_primary_image();

-- Set first image as primary for listings that don't have a primary image
UPDATE listing_images
SET is_primary = true
WHERE id IN (
  SELECT DISTINCT ON (listing_id) id
  FROM listing_images
  WHERE listing_id NOT IN (
    SELECT listing_id FROM listing_images WHERE is_primary = true
  )
  ORDER BY listing_id, position
);