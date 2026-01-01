'use client';
import React, { useState } from 'react';
import { clientsConfig } from '../../lib/tenant-config';
import MainApp from '../../components/MainApp';

export default function AdminPreviewPage() {
  const [selectedClient, setSelectedClient] = useState<string>('');
  
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClient(e.target.value);
  };

  const getSettingsForClient = (slug: string) => {
    const config = clientsConfig[slug];
    if (!config) return undefined;
    
    return {
       hotelName: config.name,
       primaryColor: config.primaryColor,
       currency: "€",
       backgroundUrl: "https://images.unsplash.com/photo-1519225421980-715cb0202128?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
       logoUrl: config.logo,
       adminEmail: "preview@admin.com",
       adminPassword: "admin"
    };
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Admin Toolbar */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Preview Console</h1>
        <div className="flex items-center gap-4">
             <label className="text-sm font-bold text-gray-400 uppercase">Preview As:</label>
             <select 
                value={selectedClient} 
                onChange={handleClientChange}
                className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
             >
                <option value="">-- Select Client --</option>
                {Object.keys(clientsConfig).map(slug => (
                    <option key={slug} value={slug}>{clientsConfig[slug].name} ({slug})</option>
                ))}
             </select>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-100 relative">
         {selectedClient ? (
             <MainApp 
                key={selectedClient} 
                initialSettings={getSettingsForClient(selectedClient)} 
                forceWizard={true}
             />
         ) : (
             <div className="flex items-center justify-center h-full text-gray-400">
                 Select a client from the top bar to preview their configuration.
             </div>
         )}
      </div>
    </div>
  );
}