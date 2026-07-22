/*
  # Create Event Types Table

  ## Summary
  This migration creates the `event_types` table to define different types of events
  that venues can host (Wedding, Business Meeting, Team Building, etc.).

  ## New Tables
  - `event_types`
    - `id` (uuid, primary key) - Unique event type identifier
    - `client_id` (uuid, foreign key) - References clients table
    - `slug` (text) - URL-friendly identifier (e.g., "wedding")
    - `name_bg` (text) - Event type name in Bulgarian
    - `name_en` (text) - Event type name in English
    - `icon` (text) - Icon identifier for UI
    - `is_active` (boolean) - Whether this event type is available
    - `sort_order` (integer) - Display order
    - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on `event_types` table
  - Public read access for active event types
  - Authenticated users can manage event types

  ## Initial Data
  - Inserts Wedding, Business Event, and Team Building types for both venues
*/

-- Create event_types table
CREATE TABLE IF NOT EXISTS event_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name_bg text NOT NULL,
  name_en text NOT NULL,
  icon text DEFAULT 'calendar',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, slug)
);

-- Enable RLS
ALTER TABLE event_types ENABLE ROW LEVEL SECURITY;

-- Public can view active event types
CREATE POLICY "Public can view active event types"
  ON event_types FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage event types
CREATE POLICY "Authenticated users can insert event types"
  ON event_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update event types"
  ON event_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete event types"
  ON event_types FOR DELETE
  TO authenticated
  USING (true);

-- Insert default event types for Starosel
INSERT INTO event_types (client_id, slug, name_bg, name_en, icon, sort_order)
SELECT 
  c.id,
  'wedding',
  'Сватба',
  'Wedding',
  'heart',
  1
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT (client_id, slug) DO NOTHING;

INSERT INTO event_types (client_id, slug, name_bg, name_en, icon, sort_order)
SELECT 
  c.id,
  'business',
  'Бизнес Събитие',
  'Business Event',
  'briefcase',
  2
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT (client_id, slug) DO NOTHING;

INSERT INTO event_types (client_id, slug, name_bg, name_en, icon, sort_order)
SELECT 
  c.id,
  'team-building',
  'Тиймбилдинг',
  'Team Building',
  'users',
  3
FROM clients c WHERE c.slug = 'starosel'
ON CONFLICT (client_id, slug) DO NOTHING;

-- Insert default event types for Yastrebec
INSERT INTO event_types (client_id, slug, name_bg, name_en, icon, sort_order)
SELECT 
  c.id,
  'wedding',
  'Сватба',
  'Wedding',
  'heart',
  1
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT (client_id, slug) DO NOTHING;

INSERT INTO event_types (client_id, slug, name_bg, name_en, icon, sort_order)
SELECT 
  c.id,
  'business',
  'Бизнес Събитие',
  'Business Event',
  'briefcase',
  2
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT (client_id, slug) DO NOTHING;

INSERT INTO event_types (client_id, slug, name_bg, name_en, icon, sort_order)
SELECT 
  c.id,
  'team-building',
  'Тиймбилдинг',
  'Team Building',
  'users',
  3
FROM clients c WHERE c.slug = 'yastrebec'
ON CONFLICT (client_id, slug) DO NOTHING;