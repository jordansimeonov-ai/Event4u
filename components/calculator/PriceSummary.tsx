'use client';

import { WizardState } from '../WeddingCalculator';
import { Room, Service, Client } from '@/lib/supabase';
import { Calendar, Users, Euro } from 'lucide-react';

type Props = {
  wizardData: WizardState;
  rooms: Room[];
  services: Service[];
  client: Client;
};

export default function PriceSummary({ wizardData, rooms, services, client }: Props) {
  const calculateTotals = () => {
    let accommodationTotal = 0;
    let menuTotal = 0;
    let drinksTotal = 0;
    let otherTotal = 0;

    // Calculate accommodation
    Object.entries(wizardData.roomSelections).forEach(([roomId, quantity]) => {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        accommodationTotal += Number(room.price_per_night) * quantity;
      }
    });

    // Calculate services
    services.forEach((service) => {
      if (wizardData.serviceSelections.includes(service.id)) {
        const price =
          service.price_type === 'per_person'
            ? Number(service.price) * wizardData.guestCount
            : Number(service.price);

        if (service.category === 'menu') {
          menuTotal += price;
        } else if (service.category === 'drinks') {
          drinksTotal += price;
        } else {
          otherTotal += price;
        }
      }
    });

    return {
      accommodationTotal,
      menuTotal,
      drinksTotal,
      otherTotal,
      total: accommodationTotal + menuTotal + drinksTotal + otherTotal,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Orientational Quote</h3>

      {/* Event Info */}
      {wizardData.eventDate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Event Date</span>
          </div>
          <p className="font-semibold text-gray-900">
            {new Date(wizardData.eventDate).toLocaleDateString('bg-BG', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      )}

      {wizardData.guestCount > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Users className="w-4 h-4" />
            <span>Guests</span>
          </div>
          <p className="font-semibold text-gray-900">
            {wizardData.adultsCount} adults, {wizardData.childrenCount} children
          </p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Menu & Drinks</span>
          <span className="font-semibold">
            €{(totals.menuTotal + totals.drinksTotal).toFixed(2)}
          </span>
        </div>

        {totals.accommodationTotal > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Accommodation</span>
            <span className="font-semibold">€{totals.accommodationTotal.toFixed(2)}</span>
          </div>
        )}

        {totals.otherTotal > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Other Services</span>
            <span className="font-semibold">€{totals.otherTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t-2 border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Price</p>
            <p className="text-3xl font-bold text-[var(--color-primary)] flex items-center gap-1">
              <Euro className="w-6 h-6" />
              {totals.total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {totals.total === 0 && (
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Complete the form to see your quote</p>
        </div>
      )}
    </div>
  );
}
