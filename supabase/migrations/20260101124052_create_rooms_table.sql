/*
  # Create Rooms Table for Accommodation

  ## Summary
  This migration creates the `rooms` table to define accommodation options
  available at each venue (double rooms, single rooms, apartments, etc.).

  ## New Tables
  - `rooms`
    - `id` (uuid, primary key) - Unique room identifier
    - `client_id` (uuid, foreign key) - References clients table
    - `name_bg` (text) - Room name in Bulgarian
    - `name_en` (text) - Room name in English
    - `capacity` (integer) - Maximum occupancy
    - `price_per_night` (decimal) - Price per night in EUR
    - `description_bg` (text, nullable) - Description in Bulgarian
    - `description_en` (text, nullable) - Description in English
    - `is_available` (boolean) - Availability status
    - `quantity` (integer) - Number of rooms of this type available
    - `sort_order` (integer) - Display order
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on `rooms` table
  - Public read access for available rooms
  - Authenticated users can manage rooms

  ## Initial Data
  - Inserts standard room types for both Starosel and Yastrebec
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name_bg text NOT NULL,
  name_en text NOT NULL,
  capacity integer NOT NULL DEFAULT 2,
  price_per_night decimal(10, 2) NOT NULL DEFAULT 0,
  description_bg text,
  description_en text,
  is_available boolean DEFAULT true,
  quantity integer DEFAULT 10,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Public can view available rooms
CREATE POLICY "Public can view available rooms"
  ON rooms FOR SELECT
  USING (is_available = true);

-- Authenticated users can manage rooms
CREATE POLICY "Authenticated users can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (true);

-- Insert default rooms for Starosel
INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Двойна стая',
  'Double Room',
  2,
  113.00,
  20,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Единична стая',
  'Single Room',
  1,
  93.00,
  10,
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Малък апартамент',
  'Small Apartment',
  3,
  153.00,
  5,
  3
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Голям апартамент',
  'Large Apartment',
  4,
  163.00,
  3,
  4
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

-- Insert default rooms for Yastrebec
INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Двойна стая',
  'Double Room',
  2,
  100.00,
  25,
  1
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Единична стая',
  'Single Room',
  1,
  80.00,
  15,
  2
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Малък апартамент',
  'Small Apartment',
  3,
  140.00,
  8,
  3
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT DO NOTHING;

INSERT INTO rooms (client_id, name_bg, name_en, capacity, price_per_night, quantity, sort_order)
SELECT 
  c.id,
  'Голям апартамент',
  'Large Apartment',
  4,
  150.00,
  4,
  4
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT DO NOTHING;