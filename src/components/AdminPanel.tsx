'use client';

import React, { useState, ChangeEvent } from 'react';
import { RoomType, ServiceOption, Language, AppSettings, EventTypeOption, LocalizedText } from '../types';
import { translations } from '../locales';
import { clientsConfig } from '../lib/tenant-config';

interface Props {
  rooms: RoomType[];
  services: ServiceOption[];
  eventTypes: EventTypeOption[];
  settings: AppSettings;
  onUpdateRooms: (rooms: RoomType[]) => void;
  onUpdateServices: (services: ServiceOption[]) => void;
  onUpdateEventTypes: (types: EventTypeOption[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onClose: () => void;
  onReset: () => void;
  onSave?: () => Promise<{ success?: boolean, error?: any }>;
  onChangeClient: (slug: string) => void;
  currentClientSlug: string;
  language: Language;
}

export const AdminPanel: React.FC<Props> = ({ 
  rooms, 
  services, 
  eventTypes, 
  settings, 
  onUpdateRooms, 
  onUpdateServices, 
  onUpdateEventTypes, 
  onUpdateSettings, 
  onClose, 
  onReset,
  onSave,
  onChangeClient,
  currentClientSlug,
  language 
}) => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'services' | 'events' | 'settings'>('rooms');
  const [isSaving, setIsSaving] = useState(false);
  const t = translations[language];

  // Helper for localized text update
  const updateLocalized = (current: LocalizedText, lang: 'bg' | 'en', val: string): LocalizedText => ({
    ...current,
    [lang]: val
  });

  const handleRoomChange = (index: number, field: keyof RoomType, value: any, lang?: 'bg' | 'en') => {
    const newRooms = [...rooms];
    if (field === 'name' && lang) {
        newRooms[index] = { ...newRooms[index], name: updateLocalized(newRooms[index].name, lang, value) };
    } else {
        newRooms[index] = { ...newRooms[index], [field]: value };
    }
    onUpdateRooms(newRooms);
  };

  const handleServiceChange = (index: number, field: keyof ServiceOption, value: any, lang?: 'bg' | 'en') => {
    const newServices = [...services];
    if ((field === 'name' || field === 'description') && lang) {
        const currentVal = newServices[index][field] as LocalizedText || { bg: '', en: '' };
        newServices[index] = { ...newServices[index], [field]: updateLocalized(currentVal, lang, value) };
    } else {
        newServices[index] = { ...newServices[index], [field]: value };
    }
    onUpdateServices(newServices);
  };

  const handleEventChange = (index: number, field: keyof EventTypeOption, value: any, lang?: 'bg' | 'en') => {
    const newEvents = [...eventTypes];
    if (field === 'label' && lang) {
        newEvents[index] = { ...newEvents[index], label: updateLocalized(newEvents[index].label, lang, value) };
    } else {
        newEvents[index] = { ...newEvents[index], [field]: value };
    }
    onUpdateEventTypes(newEvents);
  };

  const handleSettingsChange = (field: keyof AppSettings, value: string) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSettings({ ...settings, backgroundUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteService = (index: number) => {
    if (window.confirm('Delete?')) {
        const newServices = [...services];
        newServices.splice(index, 1);
        onUpdateServices(newServices);
    }
  };

  const handleDeleteEvent = (index: number) => {
    if (window.confirm('Delete?')) {
        const newEvents = [...eventTypes];
        newEvents.splice(index, 1);
        onUpdateEventTypes(newEvents);
    }
  };

  const handleAddService = () => {
    const newService: ServiceOption = {
        id: `custom_${Date.now()}`,
        name: { bg: 'Нова Услуга', en: 'New Service' },
        price: 0,
        priceUnit: 'fixed',
        category: 'other',
        selectionType: 'multiple',
        description: { bg: '', en: '' }
    };
    onUpdateServices([...services, newService]);
  };

  const handleAddEvent = () => {
    const newEvent: EventTypeOption = {
        id: `event_${Date.now()}`,
        label: { bg: 'Ново Събитие', en: 'New Event' },
        icon: '🎉'
    };
    onUpdateEventTypes([...eventTypes, newEvent]);
  };

  const handleSaveClick = async () => {
      if (!onSave) return;
      setIsSaving(true);
      try {
          await onSave();
          // Could add a toast success here
      } finally {
          setIsSaving(false);
      }
  };

  const inputClass = "w-full border p-2 rounded bg-gray-700 text-white border-gray-600 focus:border-svatove-gold focus:ring-1 focus:ring-svatove-gold placeholder-gray-400";
  const labelClass = "text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-700">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-4">
             <h2 className="text-xl font-bold flex items-center gap-2">
                ⚙️ {t.adminTitle}
             </h2>
             <div className="h-6 w-px bg-gray-700 mx-2"></div>
             
             {/* Client Selector Dropdown */}
             <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 uppercase tracking-widest hidden md:inline">Venue:</span>
                <select 
                    value={currentClientSlug || ""} 
                    onChange={(e) => onChangeClient(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:border-svatove-gold focus:ring-1 focus:ring-svatove-gold outline-none cursor-pointer"
                >
                    <option value="" disabled>-- Select Venue --</option>
                    {Object.entries(clientsConfig).map(([slug, config]) => (
                        <option key={slug} value={slug}>{(config as any).name}</option>
                    ))}
                </select>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
              {onSave && (
                  <button 
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className={`px-4 py-1.5 rounded font-bold text-sm flex items-center gap-2 transition-all ${isSaving ? 'bg-gray-600 cursor-wait' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                  >
                    {isSaving ? 'Saving...' : '💾 Save Changes'}
                  </button>
              )}
              <div className="h-6 w-px bg-gray-700 mx-2"></div>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl px-2 transition-colors">×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0">
          {['rooms', 'services', 'events', 'settings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 px-6 font-bold capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-4 border-svatove-gold text-svatove-dark bg-white' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {t[`${tab}Tab` as keyof typeof t]}
              </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white">
          {activeTab === 'rooms' && (
            <div className="space-y-4">
               {rooms.map((room, idx) => (
                 <div key={room.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 hover:shadow-md transition-shadow">
                    <div className="md:col-span-2">
                        <label className={labelClass}>Name (BG)</label>
                        <input className={inputClass} value={room.name.bg} onChange={(e) => handleRoomChange(idx, 'name', e.target.value, 'bg')} />
                        <label className={`${labelClass} mt-2`}>Name (EN)</label>
                        <input className={inputClass} value={room.name.en} onChange={(e) => handleRoomChange(idx, 'name', e.target.value, 'en')} />
                    </div>
                    <div>
                      <label className={labelClass}>{t.price}</label>
                      <input type="number" className={inputClass} value={room.price} onChange={(e) => handleRoomChange(idx, 'price', parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <label className={labelClass}>{t.capacity}</label>
                      <input type="number" className={inputClass} value={room.capacity} onChange={(e) => handleRoomChange(idx, 'capacity', parseInt(e.target.value))} />
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-6">
              {services.map((service, idx) => (
                <div key={service.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group hover:shadow-md transition-shadow">
                    <button onClick={() => handleDeleteService(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-4 space-y-2">
                            <div>
                                <label className={labelClass}>Name (BG)</label>
                                <input className={inputClass} value={service.name.bg} onChange={(e) => handleServiceChange(idx, 'name', e.target.value, 'bg')} />
                            </div>
                            <div>
                                <label className={labelClass}>Name (EN)</label>
                                <input className={inputClass} value={service.name.en} onChange={(e) => handleServiceChange(idx, 'name', e.target.value, 'en')} />
                            </div>
                        </div>
                        <div className="md:col-span-4 space-y-2">
                            <div>
                                <label className={labelClass}>Desc (BG)</label>
                                <input className={`${inputClass} text-sm`} value={service.description?.bg || ''} onChange={(e) => handleServiceChange(idx, 'description', e.target.value, 'bg')} placeholder="BG Desc" />
                            </div>
                            <div>
                                <label className={labelClass}>Desc (EN)</label>
                                <input className={`${inputClass} text-sm`} value={service.description?.en || ''} onChange={(e) => handleServiceChange(idx, 'description', e.target.value, 'en')} placeholder="EN Desc" />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                             <div>
                                 <label className={labelClass}>{t.category}</label>
                                 <select className={`${inputClass} text-sm`} value={service.category} onChange={(e) => handleServiceChange(idx, 'category', e.target.value)}>
                                    {['menu', 'drink', 'ceremony', 'decoration', 'entertainment', 'other'].map(c => (
                                        <option key={c} value={c}>{t[`cat_${c}` as keyof typeof t]}</option>
                                    ))}
                                 </select>
                             </div>
                             <div>
                                 <label className={labelClass}>{t.selectionMode}</label>
                                 <select className={`${inputClass} text-sm`} value={service.selectionType || 'multiple'} onChange={(e) => handleServiceChange(idx, 'selectionType', e.target.value)}>
                                    <option value="multiple">{t.sel_multiple}</option>
                                    <option value="single">{t.sel_single}</option>
                                 </select>
                             </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                             <div>
                                 <label className={labelClass}>{t.price}</label>
                                 <input type="number" className={inputClass} value={service.price} onChange={(e) => handleServiceChange(idx, 'price', parseFloat(e.target.value))} />
                             </div>
                             <div>
                                 <label className={labelClass}>{t.priceType}</label>
                                 <select className={inputClass} value={service.priceUnit} onChange={(e) => handleServiceChange(idx, 'priceUnit', e.target.value)}>
                                    <option value="per_person">{t.pt_per_person}</option>
                                    <option value="fixed">{t.pt_fixed}</option>
                                 </select>
                             </div>
                        </div>
                    </div>
                </div>
              ))}
              <div className="flex justify-center pt-4">
                  <button onClick={handleAddService} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold transition-colors">{t.addService}</button>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
                {eventTypes.map((event, idx) => (
                    <div key={event.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 relative group hover:shadow-md transition-shadow">
                        <button onClick={() => handleDeleteEvent(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">🗑️</button>
                        <div>
                            <label className={labelClass}>Label (BG)</label>
                            <input className={inputClass} value={event.label.bg} onChange={(e) => handleEventChange(idx, 'label', e.target.value, 'bg')} />
                        </div>
                        <div>
                            <label className={labelClass}>Label (EN)</label>
                            <input className={inputClass} value={event.label.en} onChange={(e) => handleEventChange(idx, 'label', e.target.value, 'en')} />
                        </div>
                        <div>
                            <label className={labelClass}>{t.icon}</label>
                            <input className={inputClass} value={event.icon} onChange={(e) => handleEventChange(idx, 'icon', e.target.value)} />
                        </div>
                    </div>
                ))}
                 <div className="flex justify-center pt-4">
                  <button onClick={handleAddEvent} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full font-bold transition-colors">{t.addEvent}</button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
                    <div>
                        <label className={labelClass}>{t.lblHotelName}</label>
                        <input className={inputClass} value={settings.hotelName} onChange={(e) => handleSettingsChange('hotelName', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>{t.lblCurrency}</label>
                        <input className={inputClass} value={settings.currency} onChange={(e) => handleSettingsChange('currency', e.target.value)} />
                    </div>
                    <div>
                        <label className={labelClass}>{t.lblAdminEmail}</label>
                        <input className={inputClass} value={settings.adminEmail} onChange={(e) => handleSettingsChange('adminEmail', e.target.value)} placeholder="admin@hotel.com" />
                    </div>
                    <div>
                        <label className={labelClass}>{t.lblAdminPass}</label>
                        <input className={inputClass} value={settings.adminPassword || ''} onChange={(e) => handleSettingsChange('adminPassword', e.target.value)} placeholder="admin" />
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                        <label className={labelClass}>{t.lblBgUrl}</label>
                        <p className="text-gray-500 text-sm mb-2">{t.uploadOrUrl}</p>
                        
                        <div className="flex gap-4 items-center mb-2">
                             <label className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded cursor-pointer text-gray-700 font-bold transition-colors">
                                📁 {t.browse}
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                             </label>
                             <span className="text-gray-400 text-sm">- OR -</span>
                        </div>

                        <input 
                            className={inputClass}
                            value={settings.backgroundUrl}
                            onChange={(e) => handleSettingsChange('backgroundUrl', e.target.value)}
                            placeholder="https://..."
                        />
                        <div className="mt-2 text-xs text-gray-400">
                            Preview:
                            <img src={settings.backgroundUrl} className="mt-1 h-20 w-32 object-cover rounded border bg-white" alt="preview" />
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6 mt-6 bg-blue-50/50 p-4 rounded border-blue-100 border-dashed">
                        <h3 className="text-blue-600 font-bold uppercase text-xs tracking-wider mb-2">Data Management</h3>
                        <p className="text-sm text-gray-600 mb-3">Sync data from the central database or switch venue context.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => { onReset(); }}
                                className="bg-blue-600 text-white border border-blue-700 px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 transition-colors"
                            >
                                🔄 Reload Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          )}

        </div>

        <div className="bg-gray-100 p-4 flex justify-end shrink-0 border-t border-gray-200">
           <button onClick={onClose} className="px-6 py-2 bg-svatove-green text-white rounded font-bold hover:opacity-90 shadow-lg">{t.closeSave}</button>
        </div>
      </div>
    </div>
  );
};