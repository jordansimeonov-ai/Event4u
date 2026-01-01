'use client';

import { useState } from 'react';
import { X, Bed, Package, Settings as SettingsIcon } from 'lucide-react';
import { Client, Room, Service } from '@/lib/supabase';

type Props = {
  client: Client;
  rooms: Room[];
  services: Service[];
  onClose: () => void;
};

type Tab = 'rooms' | 'services' | 'settings';

export default function AdminPanel({ client, rooms, services, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('rooms');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SettingsIcon className="w-6 h-6 text-[var(--color-primary)]" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">{client.name_bg}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'rooms'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Rooms
              </div>
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'services'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Services
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Settings
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rooms' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Manage Rooms</h2>
              <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90">
                + Add Room
              </button>
            </div>

            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{room.name_bg}</h3>
                        <span className="text-sm text-gray-600">({room.name_en})</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Capacity:</span>{' '}
                          <span className="font-medium">{room.capacity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price:</span>{' '}
                          <span className="font-medium">
                            €{room.price_per_night}/night
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>{' '}
                          <span className="font-medium">{room.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700 px-3 py-1 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Manage Services</h2>
              <button className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90">
                + Add Service
              </button>
            </div>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border rounded-lg p-4 hover:border-gray-400 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name_bg}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {service.category}
                        </span>
                        {service.is_complimentary && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            FREE
                          </span>
                        )}
                      </div>
                      {service.description_bg && (
                        <p className="text-sm text-gray-600 mb-2">
                          {service.description_bg}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price:</span>{' '}
                          <span className="font-medium">
                            €{service.price}
                            {service.price_type === 'per_person' ? '/person' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button className="text-blue-600 hover:text-blue-700 px-3 py-1 text-sm">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700 px-3 py-1 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Venue Settings</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name (Bulgarian)
                </label>
                <input
                  type="text"
                  value={client.name_bg}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="color"
                    value={client.primary_color}
                    readOnly
                    className="w-20 h-10 rounded"
                  />
                  <input
                    type="text"
                    value={client.primary_color}
                    readOnly
                    className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={client.contact_email || ''}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={client.contact_phone || ''}
                  readOnly
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  To update these settings, please contact system administrator.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
