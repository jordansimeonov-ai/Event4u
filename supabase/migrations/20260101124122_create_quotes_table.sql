/*
  # Create Quotes Table for Lead Capture

  ## Summary
  This migration creates the `quotes` table to store all generated event quotes
  submitted through the calculator. This captures leads and allows tracking.

  ## New Tables
  - `quotes`
    - `id` (uuid, primary key) - Unique quote identifier
    - `client_id` (uuid, foreign key) - References clients table
    - `event_type_id` (uuid, foreign key) - References event_types table
    - `customer_name` (text) - Customer's full name
    - `customer_email` (text) - Customer's email address
    - `customer_phone` (text) - Customer's phone number
    - `event_date` (date) - Planned event date
    - `guest_count` (integer) - Total number of guests
    - `adults_count` (integer) - Number of adult guests
    - `children_count` (integer) - Number of children
    - `room_selections` (jsonb) - Selected rooms with quantities
    - `service_selections` (jsonb) - Selected services
    - `total_accommodation` (decimal) - Total accommodation cost
    - `total_menu` (decimal) - Total menu cost
    - `total_drinks` (decimal) - Total drinks cost
    - `total_other` (decimal) - Total other services cost
    - `total_price` (decimal) - Grand total price
    - `notes` (text, nullable) - Additional customer notes
    - `status` (text) - Quote status (pending, contacted, booked, cancelled)
    - `pdf_url` (text, nullable) - URL to generated PDF quote
    - `created_at` (timestamptz) - Quote submission timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `quotes` table
  - Anyone can insert quotes (public calculator submissions)
  - Only authenticated users can view/update quotes (admin only)

  ## Indexes
  - Index on client_id for fast venue-specific queries
  - Index on customer_email for duplicate checking
  - Index on created_at for chronological sorting
*/

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  event_type_id uuid REFERENCES event_types(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  event_date date NOT NULL,
  guest_count integer NOT NULL DEFAULT 0,
  adults_count integer DEFAULT 0,
  children_count integer DEFAULT 0,
  room_selections jsonb DEFAULT '[]'::jsonb,
  service_selections jsonb DEFAULT '[]'::jsonb,
  total_accommodation decimal(10, 2) DEFAULT 0,
  total_menu decimal(10, 2) DEFAULT 0,
  total_drinks decimal(10, 2) DEFAULT 0,
  total_other decimal(10, 2) DEFAULT 0,
  total_price decimal(10, 2) NOT NULL DEFAULT 0,
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'booked', 'cancelled')),
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert quotes (public submissions)
CREATE POLICY "Anyone can submit quotes"
  ON quotes FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can view quotes
CREATE POLICY "Authenticated users can view quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can update quotes
CREATE POLICY "Authenticated users can update quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Only authenticated users can delete quotes
CREATE POLICY "Authenticated users can delete quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();