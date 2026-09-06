/*
  # Add Images Support for Listings

  1. New Tables
    - `listing_images`
      - `id` (uuid, primary key, auto-generated)
      - `listing_id` (uuid, references listings, not null)
      - `image_data` (text, not null) - base64 encoded image data
      - `mime_type` (text, not null) - image MIME type (image/png, image/jpeg, image/webp)
      - `position` (integer, not null) - order of images (1-5)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `listing_images` table
    - Add policy for anyone to view images
    - Add policy for authenticated users to insert images for their listings
    - Add policy for users to update images of their listings
    - Add policy for users to delete images of their listings

  3. Constraints
    - Maximum 5 images per listing
    - Position must be between 1 and 5
    - Only allowed MIME types: image/png, image/jpeg, image/webp

  4. Indexes
    - Index on `listing_id` for faster queries
    - Index on `position` for ordering
*/

-- Create listing_images table
CREATE TABLE IF NOT EXISTS listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_data text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  position integer NOT NULL CHECK (position >= 1 AND position <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, position)
);

-- Enable RLS
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view images
CREATE POLICY "Anyone can view listing images"
  ON listing_images FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can insert images for their own listings
CREATE POLICY "Users can insert images for own listings"
  ON listing_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Policy: Users can update images of their own listings
CREATE POLICY "Users can update images of own listings"
  ON listing_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Policy: Users can delete images of their own listings
CREATE POLICY "Users can delete images of own listings"
  ON listing_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_position ON listing_images(listing_id, position);

-- Function to enforce maximum 5 images per listing
CREATE OR REPLACE FUNCTION check_max_images_per_listing()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM listing_images WHERE listing_id = NEW.listing_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 images per listing allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce max images
DROP TRIGGER IF EXISTS enforce_max_images ON listing_images;
CREATE TRIGGER enforce_max_images
  BEFORE INSERT ON listing_images
  FOR EACH ROW
  EXECUTE FUNCTION check_max_images_per_listing();
