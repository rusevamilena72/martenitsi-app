/*
  # Add availability status to listings

  1. New Columns
    - `availability` (text, not null, default 'in_stock') - one of:
      'in_stock'      -> В наличност
      'made_to_order' -> Изработва се по поръчка
      'sold_out'      -> Изчерпано

  2. Notes
    - Existing RLS policies on `listings` already cover this new column
      (the "Anyone can view listings" / owner update policies apply to
      the whole row, not specific columns).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'availability'
  ) THEN
    ALTER TABLE listings ADD COLUMN availability text NOT NULL DEFAULT 'in_stock';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_availability_check'
  ) THEN
    ALTER TABLE listings ADD CONSTRAINT listings_availability_check
      CHECK (availability IN ('in_stock', 'made_to_order', 'sold_out'));
  END IF;
END $$;
