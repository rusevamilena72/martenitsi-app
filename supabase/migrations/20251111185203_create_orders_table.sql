/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key) - unique order identifier
      - `customer_email` (text, required) - customer email address
      - `customer_details` (text, optional) - additional customer information (name, phone, etc.)
      - `order_details` (text, required) - order description (items, quantities, etc.)
      - `status` (text) - order status (pending, processing, completed, cancelled)
      - `created_at` (timestamptz) - when the order was created
      - `updated_at` (timestamptz) - when the order was last updated

  2. Security
    - Enable RLS on `orders` table
    - Add policy for inserting orders (public access to allow non-authenticated users to place orders)
    - Add policy for authenticated admin users to view all orders

  3. Important Notes
    - Anyone can create an order (useful for public store)
    - Only authenticated users can view orders (for admin purposes)
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_details text,
  order_details text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
