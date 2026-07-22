/*
  # Create Services Table for Event Services

  ## Summary
  This migration creates the `services` table to define all service offerings
  available at each venue (catering, drinks, decorations, entertainment, etc.).

  ## New Tables
  - `services`
    - `id` (uuid, primary key) - Unique service identifier
    - `client_id` (uuid, foreign key) - References clients table
    - `category` (text) - Service category (menu, drinks, ceremony, entertainment, decorations, complimentary)
    - `name_bg` (text) - Service name in Bulgarian
    - `name_en` (text) - Service name in English
    - `description_bg` (text, nullable) - Description in Bulgarian
    - `description_en` (text, nullable) - Description in English
    - `price_type` (text) - 'per_person' or 'fixed'
    - `price` (decimal) - Price amount
    - `is_available` (boolean) - Availability status
    - `is_complimentary` (boolean) - Whether service is free
    - `min_guests` (integer, nullable) - Minimum guests required
    - `max_guests` (integer, nullable) - Maximum guests allowed
    - `sort_order` (integer) - Display order within category
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on `services` table
  - Public read access for available services
  - Authenticated users can manage services

  ## Initial Data
  - Inserts comprehensive service catalog for Starosel venue
*/

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('menu', 'drinks', 'ceremony', 'entertainment', 'decorations', 'complimentary')),
  name_bg text NOT NULL,
  name_en text NOT NULL,
  description_bg text,
  description_en text,
  price_type text NOT NULL DEFAULT 'per_person' CHECK (price_type IN ('per_person', 'fixed')),
  price decimal(10, 2) NOT NULL DEFAULT 0,
  is_available boolean DEFAULT true,
  is_complimentary boolean DEFAULT false,
  min_guests integer,
  max_guests integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Public can view available services
CREATE POLICY "Public can view available services"
  ON services FOR SELECT
  USING (is_available = true);

-- Authenticated users can manage services
CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Insert default services for Starosel

-- Menu Services
INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'menu',
  'Сватбено меню',
  'Wedding Menu',
  '4-степенно меню с включена допустация',
  'per_person',
  65.00,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'menu',
  'Детско меню',
  'Kids Menu',
  'Специално детско меню',
  'per_person',
  32.50,
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

-- Drinks Services
INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'drinks',
  'Отворен Бар №3 (22€/гост)',
  'Open Bar #3',
  'Бира, вино, безалкохолни напитки',
  'per_person',
  22.00,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'drinks',
  'Пълен Отворен Бар (32€/гост)',
  'Full Open Bar',
  'Всички напитки включени',
  'per_person',
  32.00,
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

-- Ceremony Services
INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'ceremony',
  'Ритуали',
  'Rituals',
  'Традиционни сватбени ритуали',
  'fixed',
  0.00,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'ceremony',
  'Декорация на церемония',
  'Ceremony Decoration',
  'Украса на церемониалното пространство',
  'fixed',
  0.00,
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

-- Entertainment Services
INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'entertainment',
  'Детска зона',
  'Kids Zone',
  'Професионална детска аниматорка',
  'fixed',
  0.00,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'entertainment',
  'DJ',
  'DJ',
  'Професионален DJ',
  'fixed',
  0.00,
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'entertainment',
  'Фотография и Видео',
  'Photography and Video',
  'Професионални услуги',
  'fixed',
  0.00,
  3
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

-- Decorations Services
INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, sort_order)
SELECT 
  c.id,
  'decorations',
  'Украса на шатра',
  'Tent Decoration',
  'Декорация на празнично пространство',
  'fixed',
  0.00,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

-- Complimentary Services
INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, is_complimentary, sort_order)
SELECT 
  c.id,
  'complimentary',
  'СПА процедури за младоженците',
  'SPA treatments for newlyweds',
  'Безплатни СПА процедури',
  'fixed',
  0.00,
  true,
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;

INSERT INTO services (client_id, category, name_bg, name_en, description_bg, price_type, price, is_complimentary, sort_order)
SELECT 
  c.id,
  'complimentary',
  'Дегустация на менюто',
  'Menu tasting',
  'Безплатна дегустация преди събитието',
  'fixed',
  0.00,
  true,
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT DO NOTHING;