/*
  # Create Listings Table for Martenitsi

  1. New Tables
    - `listings`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users, not null)
      - `category` (text, not null) - one of: komplekti, unikalni, grivni, cvetya, zhivotni, detski, gerdani
      - `name` (text, not null) - name of the product
      - `description` (text, not null) - detailed description
      - `size` (text, nullable) - optional size information
      - `price` (numeric, not null) - price of the product
      - `currency` (text, not null, default 'лв.') - currency (лв. or EUR)
      - `row_position` (integer, not null) - row number on the page
      - `column_position` (integer, not null) - position in row (1-4)
      - `show_on_homepage` (boolean, default false) - whether to display on homepage
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `listings` table
    - Add policy for anyone to view listings
    - Add policy for authenticated users to create listings
    - Add policy for users to update their own listings
    - Add policy for users to delete their own listings

  3. Indexes
    - Index on `user_id` for faster queries
    - Index on `category` for faster category filtering
    - Index on `show_on_homepage` for homepage queries
*/

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('komplekti', 'unikalni', 'grivni', 'cvetya', 'zhivotni', 'detski', 'gerdani')),
  name text NOT NULL,
  description text NOT NULL,
  size text,
  price numeric NOT NULL CHECK (price >= 0),
  currency text NOT NULL DEFAULT 'лв.' CHECK (currency IN ('лв.', 'EUR')),
  row_position integer NOT NULL CHECK (row_position > 0),
  column_position integer NOT NULL CHECK (column_position >= 1 AND column_position <= 4),
  show_on_homepage boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view listings
CREATE POLICY "Anyone can view listings"
  ON listings FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can create listings
CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_show_on_homepage ON listings(show_on_homepage);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
