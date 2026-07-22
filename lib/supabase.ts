import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Client = {
  id: string;
  slug: string;
  name_bg: string;
  name_en: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string | null;
  welcome_message_bg: string;
  welcome_message_en: string;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EventType = {
  id: string;
  client_id: string;
  slug: string;
  name_bg: string;
  name_en: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type Room = {
  id: string;
  client_id: string;
  name_bg: string;
  name_en: string;
  capacity: number;
  price_per_night: number;
  description_bg: string | null;
  description_en: string | null;
  is_available: boolean;
  quantity: number;
  sort_order: number;
  created_at: string;
};

export type Service = {
  id: string;
  client_id: string;
  category: 'menu' | 'drinks' | 'ceremony' | 'entertainment' | 'decorations' | 'complimentary';
  name_bg: string;
  name_en: string;
  description_bg: string | null;
  description_en: string | null;
  price_type: 'per_person' | 'fixed';
  price: number;
  is_available: boolean;
  is_complimentary: boolean;
  min_guests: number | null;
  max_guests: number | null;
  sort_order: number;
  created_at: string;
};

export type Quote = {
  id: string;
  client_id: string;
  event_type_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  event_date: string;
  guest_count: number;
  adults_count: number;
  children_count: number;
  room_selections: any;
  service_selections: any;
  total_accommodation: number;
  total_menu: number;
  total_drinks: number;
  total_other: number;
  total_price: number;
  notes: string | null;
  status: 'pending' | 'contacted' | 'booked' | 'cancelled';
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
};
