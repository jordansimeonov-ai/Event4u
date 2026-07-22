'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Client, EventType, Room, Service } from '@/lib/supabase';
import Step1Details from './calculator/Step1Details';
import Step2Accommodation from './calculator/Step2Accommodation';
import Step3Services from './calculator/Step3Services';
import PriceSummary from './calculator/PriceSummary';
import AdminPanel from './AdminPanel';

type Props = {
  client: Client;
  eventTypes: EventType[];
  rooms: Room[];
  services: Service[];
};

export type WizardState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  guestCount: number;
  adultsCount: number;
  childrenCount: number;
  roomSelections: Record<string, number>;
  serviceSelections: string[];
};

export default function WeddingCalculator({ client, eventTypes, rooms, services }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [wizardData, setWizardData] = useState<WizardState>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventDate: '',
    guestCount: 0,
    adultsCount: 0,
    childrenCount: 0,
    roomSelections: {},
    serviceSelections: [],
  });

  const handleAdminClick = () => {
    setShowPassword(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setShowPassword(false);
      setShowAdminPanel(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
    }
  };

  if (showAdminPanel) {
    return (
      <AdminPanel
        client={client}
        rooms={rooms}
        services={services}
        onClose={() => setShowAdminPanel(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name_bg}</h1>
            <p className="text-sm text-gray-600">Event Quote Calculator</p>
          </div>
          <button
            onClick={handleAdminClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Admin Panel"
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Wizard Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        currentStep >= step
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div
                        className={`hidden sm:block w-24 h-1 mx-2 ${
                          currentStep > step ? 'bg-[var(--color-primary)]' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              {currentStep === 1 && (
                <Step1Details
                  wizardData={wizardData}
                  setWizardData={setWizardData}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 2 && (
                <Step2Accommodation
                  wizardData={wizardData}
                  setWizardData={setWizardData}
                  rooms={rooms}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <Step3Services
                  wizardData={wizardData}
                  setWizardData={setWizardData}
                  services={services}
                  clientId={client.id}
                  onBack={() => setCurrentStep(2)}
                />
              )}
            </div>
          </div>

          {/* Right: Price Summary */}
          <div className="lg:col-span-1">
            <PriceSummary
              wizardData={wizardData}
              rooms={rooms}
              services={services}
              client={client}
            />
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-600 text-sm mb-4">{passwordError}</p>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(false);
                    setPassword('');
                    setPasswordError('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
