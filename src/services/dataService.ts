import { supabase } from '../lib/supabaseClient';
import { RoomType, ServiceOption, EventTypeOption, AppSettings, QuoteState, CalculatedQuote } from '../types';
import { getSubdomain } from '../utils/subdomain';

interface DBRoom {
  id: string;
  name_bg: string;
  name_en: string;
  price: number;
  capacity: number;
  client_id: string; 
}

interface DBService {
  id: string;
  name_bg: string;
  name_en: string;
  price: number;
  price_unit: 'per_person' | 'fixed' | 'per_item';
  category: string;
  selection_type: 'single' | 'multiple';
  description_bg?: string;
  description_en?: string;
  client_id?: string; 
}

interface DBEventType {
  id: string;
  label_bg: string;
  label_en: string;
  icon: string;
  client_id: string; 
}

// Internal interface matching the 'tenants' table structure
interface DBTenant {
  id: string;
  subdomain: string; // Used to be slug
  name: string;      // Used to be hotel_name
  currency: string;
  background_url: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  admin_email: string;
  admin_password?: string;
}

export const fetchVenueData = async (slugOverride?: string) => {
  const timestamp = new Date().toISOString();
  
  // 1. Determine Context
  let clientSlug = slugOverride;

  // If running on client-side and no override provided, try URL params
  if (!clientSlug && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const clientParam = params.get('client');
      const subdomain = getSubdomain();
      clientSlug = clientParam || subdomain;
  }

  // If still no slug, we can't fetch anything
  if (!clientSlug) {
      if (typeof window !== 'undefined') {
        console.log("[DataService] No client slug found.");
      }
      return null;
  }

  console.log(`[DataService ${timestamp}] Initializing fetch for tenant subdomain: '${clientSlug}'`);

  try {
    // 2. Get Tenant Data from 'tenants' table using 'subdomain' column
    // We try 'tenants' first as requested. 
    let { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('subdomain', clientSlug)
      .single();

    // Fallback: If 'tenants' table doesn't exist or empty, check 'clients' table (legacy support)
    if (tenantError || !tenantData) {
         console.warn(`[DataService] Tenant '${clientSlug}' not found in 'tenants'. Checking 'clients' fallback...`);
         const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('slug', clientSlug)
            .single();
            
         if (!clientError && clientData) {
             // Map legacy 'clients' format to new 'DBTenant' structure
             tenantData = {
                 ...clientData,
                 name: clientData.hotel_name,
                 subdomain: clientData.slug
             };
         } else {
             console.warn(`[DataService] Tenant '${clientSlug}' NOT FOUND in DB.`);
             return null;
         }
    }

    const tenant = tenantData as DBTenant;
    console.log(`[DataService] Found Tenant: ${tenant.name} (ID: ${tenant.id})`);

    // 3. Parallel Fetching filtered by TENANT ID (client_id)
    const [roomsRes, servicesRes, eventsRes] = await Promise.all([
      supabase.from('rooms').select('*').eq('client_id', tenant.id),
      supabase.from('services').select('*').eq('client_id', tenant.id),
      supabase.from('event_types').select('*').eq('client_id', tenant.id)
    ]);

    let rawServices = servicesRes.data as DBService[] || [];

    // 4. Map DB Data
    const rooms: RoomType[] = (roomsRes.data as DBRoom[] || []).map(r => ({
      id: r.id,
      name: { bg: r.name_bg, en: r.name_en },
      price: r.price,
      capacity: r.capacity
    }));

    const services: ServiceOption[] = rawServices.map(s => ({
      id: s.id,
      name: { bg: s.name_bg, en: s.name_en },
      price: s.price,
      priceUnit: s.price_unit,
      category: s.category as any, 
      selectionType: s.selection_type,
      description: (s.description_bg || s.description_en) 
        ? { bg: s.description_bg || '', en: s.description_en || '' } 
        : undefined
    }));

    const eventTypes: EventTypeOption[] = (eventsRes.data as DBEventType[] || []).map(e => ({
      id: e.id,
      label: { bg: e.label_bg, en: e.label_en },
      icon: e.icon
    }));

    const settings: AppSettings = {
      clientId: tenant.id,
      hotelName: tenant.name, // Mapped from 'name'
      currency: tenant.currency || '€',
      backgroundUrl: tenant.background_url,
      logoUrl: tenant.logo_url,
      primaryColor: tenant.primary_color,
      secondaryColor: tenant.secondary_color,
      adminEmail: tenant.admin_email,
      adminPassword: tenant.admin_password || 'admin'
    };

    return { rooms, services, eventTypes, settings };

  } catch (error) {
    console.error('[DataService] Critical Exception:', error);
    return null;
  }
};

export const saveVenueData = async (
  settings: AppSettings,
  rooms: RoomType[],
  services: ServiceOption[],
  eventTypes: EventTypeOption[]
) => {
  if (!settings.clientId) {
    console.error("Cannot save: No Client ID");
    return { error: "No Client ID" };
  }

  const clientId = settings.clientId;
  console.log(`[DataService] Saving data for client: ${clientId}...`);

  try {
    // 1. Update Tenant Settings (Try 'tenants' table first)
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({
        name: settings.hotelName,
        currency: settings.currency,
        background_url: settings.backgroundUrl,
        admin_email: settings.adminEmail,
        admin_password: settings.adminPassword,
        primary_color: settings.primaryColor,
        secondary_color: settings.secondaryColor
      })
      .eq('id', clientId);

    // If 'tenants' update fails (e.g. legacy setup), try 'clients'
    if (tenantError) {
         await supabase.from('clients').update({
            hotel_name: settings.hotelName,
            currency: settings.currency,
            background_url: settings.backgroundUrl,
            admin_email: settings.adminEmail,
            admin_password: settings.adminPassword,
            primary_color: settings.primaryColor,
            secondary_color: settings.secondaryColor
         }).eq('id', clientId);
    }

    // 2. Upsert Rooms
    const safeRoomsPayload = rooms.map(r => ({
        ...r.id.startsWith('custom_') ? {} : { id: r.id },
        client_id: clientId,
        name_bg: r.name.bg,
        name_en: r.name.en,
        price: r.price,
        capacity: r.capacity
    }));

    const { error: roomsError } = await supabase.from('rooms').upsert(safeRoomsPayload);
    if (roomsError) throw roomsError;

    // 3. Upsert Services
    const servicesPayload = services.map(s => ({
      ...s.id.startsWith('custom_') ? {} : { id: s.id },
      client_id: clientId,
      name_bg: s.name.bg,
      name_en: s.name.en,
      price: s.price,
      price_unit: s.priceUnit,
      category: s.category,
      selection_type: s.selectionType || 'multiple',
      description_bg: s.description?.bg,
      description_en: s.description?.en
    }));

    const { error: servicesError } = await supabase.from('services').upsert(servicesPayload);
    if (servicesError) throw servicesError;

    // 4. Upsert Events
    const eventsPayload = eventTypes.map(e => ({
       ...e.id.startsWith('event_') ? {} : { id: e.id },
       client_id: clientId,
       label_bg: e.label.bg,
       label_en: e.label.en,
       icon: e.icon
    }));

    const { error: eventsError } = await supabase.from('event_types').upsert(eventsPayload);
    if (eventsError) throw eventsError;

    return { success: true };

  } catch (error) {
    console.error("Save failed:", error);
    return { error };
  }
};

export const submitQuote = async (state: QuoteState, calculation: CalculatedQuote, settings: AppSettings) => {
    if (!settings.clientId) {
        console.error("[DataService] Cannot submit quote: Missing Client ID");
        return { error: "Missing Client ID" };
    }

    const payload = {
        client_id: settings.clientId, 
        customer_name: state.customerName,
        customer_email: state.customerEmail,
        customer_phone: state.customerPhone,
        event_date: state.eventDate,
        event_type: state.eventType,
        guest_count: state.guests.adults + state.guests.children,
        total_amount: calculation.total,
        status: 'new', 
        details: {
            accommodation: state.accommodation,
            services: state.selectedServices,
            extra_beds: state.extraBeds,
            breakdown: calculation.sections
        }
    };

    console.log("[DataService] Submitting quote to Supabase...", payload);

    const { data, error } = await supabase
        .from('quotes')
        .insert([payload])
        .select();

    if (error) {
        console.error("[DataService] Error saving quote:", error);
        return { error };
    }
    
    return { data };
};