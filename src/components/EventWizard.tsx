'use client';

import React, { useRef, useEffect, useState } from 'react';
import { QuoteState, RoomType, ServiceOption, Language, AppSettings, EventTypeOption, CalculatedQuote } from '../types';
import { translations } from '../locales';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  availableRooms: RoomType[];
  availableServices: ServiceOption[];
  availableEventTypes: EventTypeOption[];
  calculation: CalculatedQuote;
  language: Language;
  settings: AppSettings;
}

// Animated Price Component
const AnimatedPrice = ({ value, currency, size = 'large' }: { value: number, currency: string, size?: 'large' | 'normal' }) => {
    const [display, setDisplay] = useState(value);
    const frame = useRef<number>(0);
    const startTime = useRef<number>(0);
    const startVal = useRef<number>(value);

    useEffect(() => {
        startVal.current = display;
        startTime.current = 0;
        const duration = 800;

        const animate = (time: number) => {
            if (!startTime.current) startTime.current = time;
            const progress = Math.min((time - startTime.current) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // Quartic ease out
            
            const nextVal = Math.floor(startVal.current + (value - startVal.current) * ease);
            setDisplay(nextVal);

            if (progress < 1) {
                frame.current = requestAnimationFrame(animate);
            }
        };

        frame.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame.current);
    }, [value]);

    return (
        <span className="tracking-tighter flex items-baseline">
            {display.toLocaleString()} 
            <span className={`
                ${size === 'large' 
                    ? 'text-[0.4em] font-light opacity-60 ml-2 -translate-y-[0.2em]' 
                    : 'text-[0.5em] font-bold opacity-60 ml-1.5 -translate-y-[0.1em]' 
                }
            `}>{currency}</span>
        </span>
    );
};

export const EventWizard: React.FC<Props> = ({ 
  state, 
  updateState, 
  onNext, 
  onBack, 
  onSubmit,
  availableRooms,
  availableServices,
  availableEventTypes,
  calculation,
  language,
  settings
}) => {
  
  const t = translations[language];
  const topRef = useRef<HTMLDivElement>(null);
  
  const [isDateFocused, setIsDateFocused] = useState(false);
  const primaryColor = settings.primaryColor || '#3B82F6';

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.step]);

  const canProceed = state.customerName.trim().length > 0 && state.eventDate.length > 0 && state.guests.adults > 0;

  const totalGuests = state.guests.adults + state.guests.children;
  const totalCapacity = Object.entries(state.accommodation).reduce((acc, [id, count]) => {
      const room = availableRooms.find(r => r.id === id);
      return acc + (room ? room.capacity * Number(count) : 0);
  }, 0) + state.extraBeds;
  const capacityDiff = totalCapacity - totalGuests;
  const isCapacitySufficient = capacityDiff >= 0;

  const handleRoomChange = (roomId: string, value: number) => {
    updateState({
      accommodation: {
        ...state.accommodation,
        [roomId]: value >= 0 ? value : 0
      }
    });
  };

  const toggleService = (serviceId: string) => {
    const current = new Set(state.selectedServices);
    if (current.has(serviceId)) {
      current.delete(serviceId);
    } else {
      current.add(serviceId);
    }
    updateState({ selectedServices: Array.from(current) });
  };

  const handleDropdownCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>, categoryServices: ServiceOption[]) => {
    const selectedId = e.target.value;
    const categoryIds = categoryServices.map(s => s.id);
    const newSelection = state.selectedServices.filter(id => !categoryIds.includes(id));
    if (selectedId) {
      newSelection.push(selectedId);
    }
    updateState({ selectedServices: newSelection });
  };

  const handleIntInput = (val: string, field: 'adults' | 'children') => {
    const num = val === '' ? 0 : parseInt(val);
    if (!isNaN(num)) {
      updateState({ guests: { ...state.guests, [field]: num } });
    }
  };

  const handleEventTypeSelect = (typeId: string) => {
    updateState({ eventType: typeId });
    onNext();
  };

  const getTodayString = () => {
    const d = new Date();
    return d.toLocaleDateString('en-CA');
  };

  // --- SUB-COMPONENTS ---

  const renderSidebar = () => (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-float border border-white/50 p-8 sticky top-6 transition-all duration-300">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-gray-100 pb-3 text-center">{t.estTotal}</h3>
        
        <div className="flex justify-center items-center mb-10">
            <span className="text-6xl md:text-7xl font-serif font-bold text-gray-900 tracking-tight drop-shadow-sm leading-none">
                <AnimatedPrice value={calculation.total} currency={settings.currency} size="large" />
            </span>
        </div>

        <div className="space-y-6 text-sm">
            {state.eventDate && (
                 <div className="flex items-center gap-4 text-gray-700 group hover:bg-gray-50 p-2 rounded-xl transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-colors shrink-0"
                         style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}>
                        📅
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{t.eventDate}</span>
                        <span className="font-serif text-lg font-semibold text-gray-800">{new Date(state.eventDate).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US')}</span>
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-4 text-gray-700 group hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-colors shrink-0"
                     style={{ color: primaryColor, backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20` }}>
                    👥
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">{t.guestCount}</span>
                    <span className="font-serif text-lg font-semibold text-gray-800">{state.guests.adults} {t.adults}, {state.guests.children} {t.kids}</span>
                </div>
            </div>

            {state.step === 2 && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${isCapacitySufficient ? 'bg-green-50/50 border-green-200 text-green-800' : 'bg-red-50/50 border-red-200 text-red-800'}`}>
                    <span className="text-2xl">{isCapacitySufficient ? '✅' : '⚠️'}</span>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase opacity-70">{t.capacity}</span>
                        <span className="font-bold">{totalCapacity} / {totalGuests} {t.guest}</span>
                        {!isCapacitySufficient && <span className="text-xs mt-1">Need {Math.abs(capacityDiff)} more beds</span>}
                    </div>
                </div>
            )}

             <div className="border-t border-gray-100 pt-6 space-y-5">
                <div className="flex justify-between items-baseline text-gray-600 text-sm font-bold uppercase tracking-wide">
                    <span>{t.cat_menu} & {t.cat_drink}</span>
                    <span className="font-bold text-gray-900 text-2xl">
                        <AnimatedPrice value={calculation.sections.menu + calculation.sections.bar} currency={settings.currency} size="normal" />
                    </span>
                </div>
                <div className="flex justify-between items-baseline text-gray-600 text-sm font-bold uppercase tracking-wide">
                     <span>{t.accommodation}</span>
                     <span className="font-bold text-gray-900 text-2xl">
                         <AnimatedPrice value={calculation.sections.accommodation} currency={settings.currency} size="normal" />
                     </span>
                </div>
                <div className="flex justify-between items-baseline text-gray-600 text-sm font-bold uppercase tracking-wide">
                     <span>{t.cat_other}</span>
                     <span className="font-bold text-gray-900 text-2xl">
                         <AnimatedPrice value={calculation.sections.services} currency={settings.currency} size="normal" />
                     </span>
                </div>
             </div>
        </div>

        <div className="mt-8 hidden lg:block">
            {state.step > 0 && state.step < 3 && (
                <button 
                    onClick={onNext}
                    disabled={state.step === 1 && !canProceed}
                    className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg transform active:scale-95 ${
                        state.step === 1 && !canProceed 
                        ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                        : 'hover:shadow-float hover:-translate-y-1'
                    }`}
                    style={{ backgroundColor: state.step === 1 && !canProceed ? undefined : primaryColor }}
                >
                    {t.next}
                </button>
            )}
             {state.step === 3 && (
                <button 
                    onClick={onSubmit}
                    disabled={state.isGeneratingAI}
                    className="w-full py-4 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                >
                    {state.isGeneratingAI ? <span className="animate-spin text-xl">↻</span> : <span className="text-xl">✨</span>} 
                    {state.isGeneratingAI ? t.processing : t.createOffer}
                </button>
            )}
        </div>
    </div>
  );

  const renderStep0 = () => (
    <div className="space-y-16 animate-fade-in w-full max-w-7xl mx-auto py-20 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white/30 backdrop-blur-md p-10 md:p-14 rounded-[2rem] shadow-2xl border border-white/20 max-w-4xl w-full mx-4 text-center">
            <h2 className="text-5xl md:text-6xl font-serif text-gray-800 mb-4 drop-shadow-sm">{t.chooseEventType}</h2>
            <p className="text-gray-700 text-lg md:text-xl font-light tracking-wide">Start planning your perfect occasion</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-4 md:px-10">
            {availableEventTypes.map(evt => (
                <button
                    key={evt.id}
                    onClick={() => handleEventTypeSelect(evt.id)}
                    className="group flex flex-col items-center justify-center p-12 bg-white/95 backdrop-blur-sm rounded-[1.5rem] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 border border-white/40"
                >
                    <div className="w-24 h-24 mb-8 bg-gray-50 rounded-full flex items-center justify-center shadow-inner transition-colors"
                         style={{ color: primaryColor }}>
                         <span className="text-6xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{evt.icon}</span>
                    </div>
                    
                    <span className="text-2xl font-serif font-bold text-gray-800 tracking-wide group-hover:opacity-80 transition-opacity">{evt.label[language]}</span>
                    
                    <span className="mt-4 h-6 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                          style={{ color: primaryColor }}>
                        Select
                    </span>
                </button>
            ))}
        </div>
    </div>
  );

  // --- REDESIGNED STEP 1 ---
  const renderStep1 = () => (
    <div className="space-y-8 animate-slide-up">
      <div className="border-b border-gray-200/50 pb-4">
        <h2 className="text-4xl font-serif text-gray-800 drop-shadow-sm">{t.step1}</h2>
        <p className="text-gray-500 mt-2 font-medium">Let's get the essential details down.</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-glass border border-white/60 p-6 md:p-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
            
            {/* Left Column: Personal Info */}
            <div className="space-y-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Organizer Details</h3>
                
                {/* 1. Name */}
                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>{t.yourName} <span className="text-red-400">*</span></label>
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden h-14 hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                        <div className="pl-4 text-gray-400 text-xl">👤</div>
                        <input 
                            type="text" 
                            value={state.customerName}
                            onChange={(e) => updateState({ customerName: e.target.value })}
                            className="w-full h-full px-4 text-lg text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent font-serif"
                            placeholder={t.namePlaceholder}
                        />
                    </div>
                </div>

                {/* 2. Email */}
                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>{t.yourEmail}</label>
                     <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden h-14 hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                        <div className="pl-4 text-gray-400 text-xl">✉️</div>
                        <input 
                            type="email" 
                            value={state.customerEmail || ''}
                            onChange={(e) => updateState({ customerEmail: e.target.value })}
                            className="w-full h-full px-4 text-lg text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent font-serif"
                            placeholder={t.emailPlaceholder}
                        />
                    </div>
                </div>

                 {/* 3. Phone */}
                 <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>{t.yourPhone}</label>
                     <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm transition-all overflow-hidden h-14 hover:border-gray-300 focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-100">
                        <div className="pl-4 text-gray-400 text-xl">📞</div>
                        <input 
                            type="tel" 
                            value={state.customerPhone || ''}
                            onChange={(e) => updateState({ customerPhone: e.target.value })}
                            className="w-full h-full px-4 text-lg text-gray-800 placeholder-gray-300 focus:outline-none bg-transparent font-serif"
                            placeholder={t.phonePlaceholder}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Event Specifics */}
            <div className="space-y-8">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-2">Event Specs</h3>

                {/* Date Picker */}
                <div className="group relative">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: primaryColor }}>{t.eventDate} <span className="text-red-400">*</span></label>
                    <div className="relative flex items-center bg-white rounded-xl border border-gray-200 shadow-sm h-14 focus-within:ring-2 focus-within:ring-alpine-blue/20 transition-all overflow-hidden hover:border-gray-300">
                        
                        <div className="pl-4 text-gray-400 text-xl pointer-events-none z-10">📅</div>

                        <input 
                            type="date"
                            min={getTodayString()}
                            value={state.eventDate}
                            onFocus={() => setIsDateFocused(true)}
                            onBlur={() => setIsDateFocused(false)}
                            onChange={(e) => updateState({ eventDate: e.target.value })}
                            className={`w-full h-full px-4 text-lg bg-transparent border-none focus:ring-0 font-serif z-20 relative ${!state.eventDate && !isDateFocused ? 'text-transparent' : 'text-gray-800'}`}
                            style={{ colorScheme: 'light' }}
                        />

                        {!state.eventDate && !isDateFocused && (
                            <div className="absolute left-12 top-0 bottom-0 flex items-center text-gray-400 text-lg pointer-events-none z-10 font-serif tracking-widest opacity-60">
                                DD-MM-YYYY
                            </div>
                        )}
                    </div>
                </div>

                {/* Guests Counter - GRID LAYOUT */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
                         <span className="text-xl">👥</span>
                         <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{t.guestCount}</label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {/* Adults */}
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all group">
                            <div className="text-center mb-4">
                                <div className="text-gray-900 font-bold text-lg font-serif">{t.adults}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">12+ years</div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleIntInput(Math.max(0, state.guests.adults - 1).toString(), 'adults')}
                                    disabled={state.guests.adults <= 0}
                                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-gray-800 hover:text-gray-900 transition-all disabled:opacity-30 disabled:hover:border-gray-200 shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </button>
                                
                                <input 
                                    type="number" 
                                    value={state.guests.adults || ''}
                                    onChange={(e) => handleIntInput(e.target.value, 'adults')}
                                    className="w-10 text-center border-none bg-transparent p-0 text-xl font-serif font-bold text-gray-900 focus:ring-0"
                                    placeholder="0"
                                />

                                <button 
                                    onClick={() => handleIntInput((state.guests.adults + 1).toString(), 'adults')}
                                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm active:scale-95 hover:shadow-md hover:border-alpine-blue transition-all"
                                    style={{ color: primaryColor }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Children */}
                        <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all group">
                             <div className="text-center mb-4">
                                <div className="text-gray-900 font-bold text-lg font-serif">{t.children}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">Under 12</div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleIntInput(Math.max(0, state.guests.children - 1).toString(), 'children')}
                                    disabled={state.guests.children <= 0}
                                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-gray-800 hover:text-gray-900 transition-all disabled:opacity-30 disabled:hover:border-gray-200 shadow-sm active:scale-95"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </button>
                                
                                <input 
                                    type="number" 
                                    value={state.guests.children || ''}
                                    onChange={(e) => handleIntInput(e.target.value, 'children')}
                                    className="w-10 text-center border-none bg-transparent p-0 text-xl font-serif font-bold text-gray-900 focus:ring-0"
                                    placeholder="0"
                                />

                                <button 
                                    onClick={() => handleIntInput((state.guests.children + 1).toString(), 'children')}
                                    className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm active:scale-95 hover:shadow-md hover:border-alpine-blue transition-all"
                                    style={{ color: primaryColor }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-slide-up">
      <div className="flex justify-between items-end border-b border-gray-200/50 pb-4 mb-8">
        <div>
             <h2 className="text-4xl font-serif text-gray-800 drop-shadow-sm">{t.step2}</h2>
             <p className="text-gray-500 mt-2 font-medium">Select rooms for you and your guests.</p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full uppercase tracking-wide border border-gray-200">{t.optional}</span>
      </div>
      
      <div className={`flex justify-between items-center p-6 rounded-2xl border shadow-sm mb-8 text-sm transition-colors ${isCapacitySufficient ? 'bg-green-50/80 border-green-200 text-green-900' : 'bg-red-50/80 border-red-200 text-red-900'}`}>
         <div className="flex items-center gap-4">
             <span className="text-3xl filter drop-shadow-sm">{isCapacitySufficient ? '🏡' : '🛖'}</span>
             <span>Total Guests: <strong className="text-lg">{totalGuests}</strong></span>
         </div>
         <div className="text-right">
             <div className="text-xs uppercase opacity-70 mb-1 font-bold">Capacity Selected</div>
             <strong className="text-2xl font-serif">{totalCapacity}</strong>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {availableRooms.map((room) => (
          <div key={room.id} 
               className={`group flex flex-col sm:flex-row items-center justify-between p-6 bg-white/90 backdrop-blur-sm border rounded-2xl transition-all duration-300 ${state.accommodation[room.id] > 0 ? 'shadow-float' : 'border-gray-200 hover:shadow-lg'}`}
               style={{
                   borderColor: state.accommodation[room.id] > 0 ? primaryColor : undefined,
                   backgroundColor: state.accommodation[room.id] > 0 ? `${primaryColor}08` : undefined
               }}
          >
            <div className="flex-1 mb-4 sm:mb-0 w-full sm:w-auto">
              <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-serif font-bold text-2xl text-gray-800">{room.name[language]}</h3>
                  {state.accommodation[room.id] > 0 && <span className="text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm" style={{ backgroundColor: primaryColor }}>Selected</span>}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                   <span className="text-lg">👤</span> {room.capacity}
                </span>
                <span className="font-bold bg-white border border-gray-100 px-3 py-1 rounded-full" style={{ color: primaryColor }}>
                    {room.price} {settings.currency} <span className="font-normal text-gray-400">/ {t.night}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button 
                onClick={() => handleRoomChange(room.id, (state.accommodation[room.id] || 0) - 1)}
                className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-500 font-bold text-xl flex items-center justify-center transition-all disabled:opacity-30"
                disabled={!state.accommodation[room.id]}
              >−</button>
              <span className="w-12 text-center font-bold text-xl text-gray-800 font-serif">{state.accommodation[room.id] || 0}</span>
              <button 
                onClick={() => handleRoomChange(room.id, (state.accommodation[room.id] || 0) + 1)}
                className="w-10 h-10 rounded-lg bg-gray-50 hover:text-white font-bold text-xl flex items-center justify-center transition-all"
                style={{ color: primaryColor }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              >+</button>
            </div>
          </div>
        ))}
        
        <div className="mt-8 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm border border-gray-100">🧸</div>
             <div>
                <h3 className="font-serif font-bold text-gray-800 text-lg">{t.extraBedsTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">{t.extraBedsDesc}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => updateState({ extraBeds: Math.max(0, state.extraBeds - 1) })}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:text-white transition-colors font-bold text-gray-500"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
             >-</button>
             <input 
                type="number" 
                min="0"
                value={state.extraBeds || ''}
                onChange={(e) => updateState({ extraBeds: parseInt(e.target.value) || 0 })}
                className="w-16 text-center bg-transparent border-none text-2xl font-serif font-bold text-gray-800 focus:ring-0"
                placeholder="0"
              />
             <button 
                onClick={() => updateState({ extraBeds: state.extraBeds + 1 })}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:text-white transition-colors font-bold text-gray-500"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
             >+</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    if (!availableServices || availableServices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <span className="text-4xl mb-4">📭</span>
                <h3 className="text-xl font-bold text-gray-600">No Services Found</h3>
            </div>
        );
    }

    const servicesByCategory: Record<string, ServiceOption[]> = {};
    const categoryOrder = ['menu', 'drink', 'ceremony', 'decoration', 'entertainment', 'other'];

    availableServices.forEach(service => {
        if (!servicesByCategory[service.category]) {
            servicesByCategory[service.category] = [];
        }
        servicesByCategory[service.category].push(service);
    });

    const renderCardCheckbox = (service: ServiceOption) => {
        const isSelected = state.selectedServices.includes(service.id);
        return (
            <label key={service.id} 
                   className={`relative flex flex-col p-6 rounded-2xl cursor-pointer transition-all duration-300 border group ${isSelected ? 'bg-white shadow-float transform -translate-y-1' : 'border-gray-100 bg-white/80 hover:bg-white hover:border-gray-300 hover:shadow-lg'}`}
                   style={{ borderColor: isSelected ? primaryColor : undefined }}>
                <div className="flex justify-between items-start mb-4">
                    <span className={`font-serif font-bold text-xl leading-tight pr-6 transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{service.name[language]}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'scale-110' : 'border-gray-300'}`}
                         style={{ 
                             borderColor: isSelected ? primaryColor : undefined, 
                             backgroundColor: isSelected ? primaryColor : undefined 
                         }}>
                        {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                </div>
                
                {service.description && service.description[language] && (
                   <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed font-light">{service.description[language]}</p>
                )}

                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center w-full">
                    <span className="text-lg font-bold font-serif" style={{ color: primaryColor }}>
                        {service.price} {settings.currency}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded uppercase tracking-widest">
                        {service.priceUnit === 'per_person' ? `${t.guest}` : t.fixed}
                    </span>
                </div>

                <input 
                    type="checkbox"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => toggleService(service.id)}
                />
            </label>
        );
    };

    const renderDropdown = (category: string, services: ServiceOption[]) => {
        const selectedId = services.find(s => state.selectedServices.includes(s.id))?.id || '';
        return (
            <div key={category} className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-glass border border-gray-100 mb-10 hover:shadow-xl transition-shadow duration-500">
                <h3 className="font-serif font-bold text-2xl text-gray-800 mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg border border-gray-100"
                          style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}>♦</span> 
                    {t[`cat_${category}` as keyof typeof t] || category}
                </h3>
                <div className="relative group">
                    <select
                        value={selectedId}
                        onChange={(e) => handleDropdownCategoryChange(e, services)}
                        className="block w-full rounded-xl border-gray-200 shadow-sm py-4 pl-4 pr-10 text-lg text-gray-800 bg-gray-50 group-hover:bg-white transition-colors cursor-pointer appearance-none font-serif focus:outline-none focus:ring-1"
                        style={{ borderColor: selectedId ? primaryColor : undefined }}
                    >
                        <option value="">{t.chooseOption}</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name[language]} (+{s.price}{settings.currency})
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                        ▼
                    </div>
                </div>
                {selectedId && (
                    <div className="mt-6 p-6 rounded-xl text-sm border flex gap-4 items-start animate-fade-in"
                         style={{ backgroundColor: `${primaryColor}05`, borderColor: `${primaryColor}20`, color: '#374151' }}>
                        <span className="text-2xl" style={{ color: primaryColor }}>ℹ️</span>
                        <span className="mt-1 leading-relaxed text-base italic font-serif">{services.find(s => s.id === selectedId)?.description?.[language]}</span>
                    </div>
                )}
            </div>
        );
    };

    return (
      <div className="space-y-12 animate-slide-up">
        <div className="border-b border-gray-200/50 pb-4">
             <h2 className="text-4xl font-serif text-gray-800 drop-shadow-sm">{t.chooseServices}</h2>
             <p className="text-gray-500 mt-2 font-medium">Customize your event with our premium offerings.</p>
        </div>
        
        {categoryOrder.map(cat => {
            const group = servicesByCategory[cat];
            if (!group || group.length === 0) return null;
            const isSingleChoice = group.some(s => s.selectionType === 'single');
            
            if (isSingleChoice) {
                return renderDropdown(cat, group);
            } else {
                return (
                    <div key={cat} className="space-y-8 mb-12">
                        <div className="flex items-center gap-4">
                            <span className="h-px flex-1 bg-gray-200"></span>
                            <h3 className="font-serif font-bold text-2xl text-gray-800 uppercase tracking-widest text-center">
                                {t[`cat_${cat}` as keyof typeof t] || cat}
                            </h3>
                            <span className="h-px flex-1 bg-gray-200"></span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {group.map(renderCardCheckbox)}
                        </div>
                    </div>
                );
            }
        })}
        {Object.keys(servicesByCategory).filter(cat => !categoryOrder.includes(cat)).map(cat => {
             const group = servicesByCategory[cat];
             const isSingleChoice = group.some(s => s.selectionType === 'single');
             if (isSingleChoice) return renderDropdown(cat, group);
             return (
                <div key={cat} className="space-y-8 mb-12">
                     <div className="flex items-center gap-4">
                            <span className="h-px flex-1 bg-gray-200"></span>
                            <h3 className="font-serif font-bold text-2xl text-gray-800 uppercase tracking-widest text-center">
                                {t[`cat_${cat}` as keyof typeof t] || cat}
                            </h3>
                            <span className="h-px flex-1 bg-gray-200"></span>
                        </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {group.map(renderCardCheckbox)}
                    </div>
                </div>
            );
        })}
      </div>
    );
  };

  if (state.step === 0) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
             {renderStep0()}
        </div>
      );
  }

  return (
    <div ref={topRef} className="w-full max-w-7xl mx-auto my-4 lg:my-8 px-4 pb-24">
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
      `}</style>

      <div className="bg-gray-900/90 backdrop-blur-md text-white p-8 md:p-10 rounded-t-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden border-b border-white/10">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 text-center md:text-left">
             <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wide mb-2 drop-shadow-md">{t.title}</h1>
             <p className="text-xs md:text-sm text-gray-300 tracking-[0.3em] uppercase">{settings.hotelName}</p>
          </div>
          
          <div className="relative z-10 flex items-center gap-0 bg-white/10 px-6 py-4 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
                {[1, 2, 3].map((num, idx) => (
                    <React.Fragment key={num}>
                         <div className={`w-12 h-12 flex items-center justify-center rounded-full font-serif font-bold text-lg shadow-lg transition-all duration-500 relative z-10 ${state.step >= num ? 'bg-white scale-110 ring-4 ring-white/20' : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'}`}
                              style={{ color: state.step >= num ? primaryColor : undefined }}>
                            {num}
                         </div>
                         {idx < 2 && <div className={`w-16 h-0.5 transition-colors duration-500 ${state.step > num ? 'bg-white shadow-[0_0_10px_white]' : 'bg-gray-700'}`}></div>}
                    </React.Fragment>
                ))}
            </div>
      </div>

      <div className="flex flex-col lg:flex-row bg-white/20 backdrop-blur-sm rounded-b-3xl shadow-2xl overflow-hidden min-h-[700px] border border-white/20 relative">
        <div className="flex-1 p-6 md:p-12 pb-40">
            {state.step === 1 && renderStep1()}
            {state.step === 2 && renderStep2()}
            {state.step === 3 && renderStep3()}
        </div>

        <div className="hidden lg:block w-[420px] bg-white/40 backdrop-blur-md p-10 border-l border-white/30 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
            {renderSidebar()}
        </div>
      </div>

      <div className="lg:hidden bg-white/95 backdrop-blur-xl fixed bottom-0 left-0 w-full p-5 border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 flex justify-between items-center gap-4 safe-area-bottom">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{t.estTotal}</span>
            <span className="text-2xl font-serif font-bold text-gray-800"><AnimatedPrice value={calculation.total} currency={settings.currency} /></span>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={onBack}
                className="w-12 h-12 flex items-center justify-center rounded-full text-gray-600 font-bold bg-gray-100 active:scale-95 transition-transform"
            >
                ←
            </button>
            {state.step < 3 ? (
                 <button 
                    onClick={onNext}
                    disabled={state.step === 1 && !canProceed}
                    className={`px-8 py-3 text-white font-bold rounded-full shadow-lg active:scale-95 transition-all ${state.step === 1 && !canProceed ? 'bg-gray-300' : ''}`}
                    style={{ backgroundColor: state.step === 1 && !canProceed ? undefined : primaryColor }}
                 >
                    {t.next}
                 </button>
            ) : (
                <button 
                    onClick={onSubmit}
                    disabled={state.isGeneratingAI}
                    className="px-6 py-3 text-white font-bold rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                    style={{ backgroundColor: primaryColor }}
                >
                    {state.isGeneratingAI ? <span className="animate-spin">↻</span> : '✓'} {t.createOffer}
                </button>
            )}
        </div>
      </div>
      
      <div className="hidden lg:flex fixed bottom-12 left-12 z-20">
           <button 
                onClick={onBack}
                disabled={state.step === 0}
                className={`w-16 h-16 rounded-full bg-white/90 backdrop-blur shadow-2xl text-gray-500 font-bold hover:scale-110 hover:text-gray-800 transition-all flex items-center justify-center border border-white ${state.step === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                ←
            </button>
      </div>

    </div>
  );
};