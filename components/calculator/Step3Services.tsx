'use client';

import { useState } from 'react';
import { WizardState } from '../WeddingCalculator';
import { Service } from '@/lib/supabase';
import { Check, Utensils, Wine, Sparkles, Music, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  wizardData: WizardState;
  setWizardData: (data: WizardState) => void;
  services: Service[];
  clientId: string;
  onBack: () => void;
};

const categoryIcons: Record<string, any> = {
  menu: Utensils,
  drinks: Wine,
  ceremony: Sparkles,
  entertainment: Music,
  decorations: Package,
  complimentary: Check,
};

const categoryNames: Record<string, string> = {
  menu: 'Menu',
  drinks: 'Drinks',
  ceremony: 'Ceremony',
  entertainment: 'Entertainment',
  decorations: 'Decorations',
  complimentary: 'Complimentary Services',
};

export default function Step3Services({
  wizardData,
  setWizardData,
  services,
  clientId,
  onBack,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleService = (serviceId: string) => {
    const isSelected = wizardData.serviceSelections.includes(serviceId);
    setWizardData({
      ...wizardData,
      serviceSelections: isSelected
        ? wizardData.serviceSelections.filter((id) => id !== serviceId)
        : [...wizardData.serviceSelections, serviceId],
    });
  };

  const calculateTotal = () => {
    let accommodationTotal = 0;
    let menuTotal = 0;
    let drinksTotal = 0;
    let otherTotal = 0;

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const totals = calculateTotal();

    try {
      const { error } = await supabase.from('quotes').insert({
        client_id: clientId,
        customer_name: wizardData.customerName,
        customer_email: wizardData.customerEmail,
        customer_phone: wizardData.customerPhone,
        event_date: wizardData.eventDate,
        guest_count: wizardData.guestCount,
        adults_count: wizardData.adultsCount,
        children_count: wizardData.childrenCount,
        room_selections: wizardData.roomSelections,
        service_selections: wizardData.serviceSelections,
        total_accommodation: totals.accommodationTotal,
        total_menu: totals.menuTotal,
        total_drinks: totals.drinksTotal,
        total_other: totals.otherTotal,
        total_price: totals.total,
      });

      if (error) throw error;

      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('Error submitting quote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Quote Submitted Successfully!
        </h2>
        <p className="text-gray-600 mb-8">
          We've sent your quote to <strong>{wizardData.customerEmail}</strong>.
          <br />
          Our team will contact you shortly.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90"
        >
          Create Another Quote
        </button>
      </div>
    );
  }

  const servicesByCategory = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service);
      return acc;
    },
    {} as Record<string, Service[]>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Select Services</h2>

      {Object.entries(servicesByCategory).map(([category, categoryServices]) => {
        const Icon = categoryIcons[category] || Package;
        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Icon className="w-6 h-6" />
              {categoryNames[category] || category}
            </h3>

            <div className="space-y-3">
              {categoryServices.map((service) => {
                const isSelected = wizardData.serviceSelections.includes(service.id);
                const price =
                  service.price_type === 'per_person'
                    ? Number(service.price) * wizardData.guestCount
                    : Number(service.price);

                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <h4 className="font-semibold text-gray-900">{service.name_bg}</h4>
                          {service.is_complimentary && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                        </div>
                        {service.description_bg && (
                          <p className="text-sm text-gray-600 mt-1 ml-8">
                            {service.description_bg}
                          </p>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        {service.is_complimentary ? (
                          <span className="text-green-600 font-semibold">FREE</span>
                        ) : (
                          <>
                            <p className="text-lg font-bold text-[var(--color-primary)]">
                              €{price.toFixed(2)}
                            </p>
                            {service.price_type === 'per_person' && (
                              <p className="text-xs text-gray-500">
                                €{service.price}/person
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-lg"
          disabled={isSubmitting}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : '✓ Create Offer'}
        </button>
      </div>
    </div>
  );
}
