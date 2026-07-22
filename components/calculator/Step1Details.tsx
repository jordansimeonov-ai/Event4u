'use client';

import { WizardState } from '../WeddingCalculator';
import { Calendar, Mail, Phone, User, Users } from 'lucide-react';

type Props = {
  wizardData: WizardState;
  setWizardData: (data: WizardState) => void;
  onNext: () => void;
};

export default function Step1Details({ wizardData, setWizardData, onNext }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      wizardData.customerName &&
      wizardData.customerEmail &&
      wizardData.eventDate &&
      wizardData.guestCount > 0
    ) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Event Details</h2>

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Name / Organization *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={wizardData.customerName}
            onChange={(e) =>
              setWizardData({ ...wizardData, customerName: e.target.value })
            }
            placeholder="e.g., Ivan Petrov"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={wizardData.customerEmail}
            onChange={(e) =>
              setWizardData({ ...wizardData, customerEmail: e.target.value })
            }
            placeholder="example@mail.com"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            required
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            value={wizardData.customerPhone}
            onChange={(e) =>
              setWizardData({ ...wizardData, customerPhone: e.target.value })
            }
            placeholder="0888 888 888"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      {/* Event Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Event Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={wizardData.eventDate}
            onChange={(e) =>
              setWizardData({ ...wizardData, eventDate: e.target.value })
            }
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            required
          />
        </div>
      </div>

      {/* Guest Count */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Guest Count
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adults (12+ years) *
            </label>
            <input
              type="number"
              min="0"
              value={wizardData.adultsCount || ''}
              onChange={(e) => {
                const adults = parseInt(e.target.value) || 0;
                setWizardData({
                  ...wizardData,
                  adultsCount: adults,
                  guestCount: adults + wizardData.childrenCount,
                });
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Children (under 12)
            </label>
            <input
              type="number"
              min="0"
              value={wizardData.childrenCount || ''}
              onChange={(e) => {
                const children = parseInt(e.target.value) || 0;
                setWizardData({
                  ...wizardData,
                  childrenCount: children,
                  guestCount: wizardData.adultsCount + children,
                });
              }}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Total Guests:</p>
          <p className="text-2xl font-bold text-gray-900">{wizardData.guestCount}</p>
        </div>
      </div>

      {/* Next Button */}
      <button
        type="submit"
        className="w-full bg-[var(--color-primary)] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity text-lg"
      >
        Continue →
      </button>
    </form>
  );
}
