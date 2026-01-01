import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import WeddingCalculator from '@/components/WeddingCalculator';

async function getClientData(subdomain: string) {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', subdomain)
    .eq('is_active', true)
    .single();

  if (error || !client) {
    return null;
  }

  // Fetch event types for this client
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .order('sort_order');

  // Fetch rooms for this client
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('client_id', client.id)
    .eq('is_available', true)
    .order('sort_order');

  // Fetch services for this client
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('client_id', client.id)
    .eq('is_available', true)
    .order('category, sort_order');

  return {
    client,
    eventTypes: eventTypes || [],
    rooms: rooms || [],
    services: services || [],
  };
}

export default async function TenantPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  const { subdomain } = await params;
  const data = await getClientData(subdomain);

  if (!data) {
    notFound();
  }

  return (
    <div
      style={{
        '--color-primary': data.client.primary_color,
        '--color-secondary': data.client.secondary_color,
      } as any}
    >
      <WeddingCalculator
        client={data.client}
        eventTypes={data.eventTypes}
        rooms={data.rooms}
        services={data.services}
      />
    </div>
  );
}
