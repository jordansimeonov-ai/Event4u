/*
  # Create Clients Table for Multi-Tenant Architecture

  ## Summary
  This migration creates the core `clients` table for the Event4u multi-tenant system.
  Each client represents a venue (hotel/event space) with their own branding and settings.

  ## New Tables
  - `clients`
    - `id` (uuid, primary key) - Unique client identifier
    - `slug` (text, unique) - URL-friendly subdomain identifier (e.g., "starosel")
    - `name_bg` (text) - Venue name in Bulgarian
    - `name_en` (text) - Venue name in English
    - `primary_color` (text) - Brand primary color (hex code)
    - `secondary_color` (text) - Brand secondary color
    - `logo_url` (text, nullable) - URL to venue logo
    - `welcome_message_bg` (text) - Welcome message in Bulgarian
    - `welcome_message_en` (text) - Welcome message in English
    - `contact_email` (text) - Venue contact email
    - `contact_phone` (text) - Venue contact phone
    - `is_active` (boolean) - Whether venue is active
    - `created_at` (timestamptz) - Record creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on `clients` table
  - Public read access for active clients (for public quote calculator)
  - Authenticated users can read all clients (for admin panel)
  - Only authenticated users can update client settings

  ## Initial Data
  - Inserts two default venues: Starosel (burgundy theme) and Yastrebec (forest green theme)
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name_bg text NOT NULL,
  name_en text NOT NULL,
  primary_color text NOT NULL DEFAULT '#8b0000',
  secondary_color text DEFAULT '#f5f5f5',
  logo_url text,
  welcome_message_bg text DEFAULT 'Добре дошли в нашата система за оферти!',
  welcome_message_en text DEFAULT 'Welcome to our quote system!',
  contact_email text,
  contact_phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Public can view active clients (for calculator)
CREATE POLICY "Public can view active clients"
  ON clients FOR SELECT
  USING (is_active = true);

-- Authenticated users can view all clients (for admin)
CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update clients
CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default clients
INSERT INTO clients (slug, name_bg, name_en, primary_color, secondary_color, welcome_message_bg, welcome_message_en, contact_email, contact_phone)
VALUES
  (
    'starosel',
    'СПА Комплекс Старосел',
    'SPA Complex Starosel',
    '#8b0000',
    '#f5f5dc',
    'Добре дошли в калкулатора за събития на Старосел!',
    'Welcome to Starosel Event Calculator!',
    'events@starosel.com',
    '+359888123456'
  ),
  (
    'yastrebec',
    'Хотел Ястребец',
    'Hotel Yastrebec',
    '#2d5016',
    '#e8f5e9',
    'Добре дошли в калкулатора за събития на Ястребец!',
    'Welcome to Yastrebec Event Calculator!',
    'events@yastrebec.com',
    '+359888654321'
  )
ON CONFLICT (slug) DO NOTHING;