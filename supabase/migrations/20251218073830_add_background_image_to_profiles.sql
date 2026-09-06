/*
  # Add Background Image to Profiles

  1. New Columns
    - `background_image_url` (text, nullable) - URL of user's background image

  2. Modified Tables
    - `profiles` - add background_image_url column

  3. Security
    - Existing RLS policies already cover this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'background_image_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN background_image_url text;
  END IF;
END $$;
