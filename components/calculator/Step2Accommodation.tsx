'use client';

import { WizardState } from '../WeddingCalculator';
import { Room } from '@/lib/supabase';
import { Minus, Plus, Bed } from 'lucide-react';

type Props = {
  wizardData: WizardState;
  setWizardData: (data: WizardState) => void;
  rooms: Room[];
  onNext: () => void;
  onBack: () => void;
};

export default function Step2Accommodation({
  wizardData,
  setWizardData,
  rooms,
  onNext,
  onBack,
}: Props) {
  const updateRoomQuantity = (roomId: string, change: number) => {
    const current = wizardData.roomSelections[roomId] || 0;
    const newValue = Math.max(0, current + change);
    setWizardData({
      ...wizardData,
      roomSelections: {
        ...wizardData.roomSelections,
        [roomId]: newValue,
      },
    });
  };

  const totalCapacity = Object.entries(wizardData.roomSelections).reduce(
    (sum, [roomId, quantity]) => {
      const room = rooms.find((r) => r.id === roomId);
      return sum + (room ? room.capacity * quantity : 0);
    },
    0
  );

  const selectedCount = Object.values(wizardData.roomSelections).reduce(
    (sum, qty) => sum + qty,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Accommodation</h2>
        <p className="text-gray-600">
          Total Guests: <span className="font-semibold">{wizardData.guestCount}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Selected Capacity: <span className="font-semibold">{totalCapacity}</span> persons
        </p>
      </div>

      {selectedCount === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 Select rooms for your guests. You need approximately{' '}
            {Math.ceil(wizardData.guestCount / 2)} double rooms.
          </p>
        </div>
      )}

      {totalCapacity < wizardData.guestCount && selectedCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 text-sm font-medium">
            ⚠️ Need {wizardData.guestCount - totalCapacity} more beds
          </p>
        </div>
      )}

      <div className="space-y-4">
        {rooms.map((room) => {
          const quantity = wizardData.roomSelections[room.id] || 0;
          return (
            <div
              key={room.id}
              className={`border-2 rounded-xl p-6 transition-all ${
                quantity > 0
                  ? 'border-[var(--color-primary)] bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Bed className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room.name_bg}
                    </h3>
                    <span className="text-sm text-gray-600">
                      (Capacity: {room.capacity})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{room.description_bg}</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">
                    €{room.price_per_night.toFixed(2)} / night
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <button
                    type="button"
                    onClick={() => updateRoomQuantity(room.id, -1)}
                    disabled={quantity === 0}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-30 flex items-center justify-center"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRoomQuantity(room.id, 1)}
                    disabled={quantity >= room.quantity}
                    className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-30 flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {quantity > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Total: {quantity} × €{room.price_per_night.toFixed(2)} ={' '}
                    <span className="font-bold text-gray-900">
                      €{(quantity * Number(room.price_per_night)).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-lg"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 bg-[var(--color-primary)] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity text-lg"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
