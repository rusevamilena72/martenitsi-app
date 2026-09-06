/*
  # Create contact messages table

  1. New Tables
    - `contact_messages`
      - `id` (uuid, primary key) - unique message identifier
      - `name` (text, required) - sender name
      - `email` (text, required) - sender email address
      - `message` (text, required) - message content
      - `status` (text) - message status (new, read, responded)
      - `created_at` (timestamptz) - when the message was sent

  2. Security
    - Enable RLS on `contact_messages` table
    - Add policy for inserting messages (public access to allow anyone to send messages)
    - Add policy for authenticated admin users to view all messages

  3. Important Notes
    - Anyone can send a contact message (useful for public contact form)
    - Only authenticated users can view messages (for admin purposes)
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create contact messages"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all contact messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
