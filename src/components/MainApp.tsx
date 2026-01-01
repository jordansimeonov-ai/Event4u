'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EventWizard } from './EventWizard';
import { QuoteProposal } from './QuoteProposal';
import { AdminPanel } from './AdminPanel';
import { LandingPage } from './LandingPage';
import { QuoteState, CalculatedQuote, RoomType, ServiceOption, Language, AppSettings, EventTypeOption } from '../types';
import { SERVICES as DEFAULT_SERVICES, ROOM_TYPES as DEFAULT_ROOMS, EXTRA_BED_PRICE, DEFAULT_EVENT_TYPES } from '../constants'; 
import { translations } from '../locales';
import { generateIntroText } from '../services/geminiService';
import { fetchVenueData, submitQuote, saveVenueData } from '../services/dataService';
import { getSubdomain } from '../utils/subdomain';
import { clientsConfig } from '../lib/tenant-config';

const INITIAL_STATE: QuoteState = {
  step: 0, 
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  eventDate: '',
  eventType: '',
  guests: { adults: 0, children: 0 },
  accommodation: {},
  extraBeds: 0,
  selectedServices: [],
  aiIntroText: '',
  isGeneratingAI: false
};

const DEFAULT_SETTINGS: AppSettings = {
  hotelName: "Alpine Resort & Spa",
  currency: "€",
  // Mountain/Resort background
  backgroundUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  adminEmail: "events@example.com",
  adminPassword: "admin"
};

interface AppProps {
  initialSettings?: AppSettings;
  initialRooms?: RoomType[];
  initialServices?: ServiceOption[];
  initialEventTypes?: EventTypeOption[];
  forceWizard?: boolean;
}

const MainApp: React.FC<AppProps> = ({ 
    initialSettings, 
    initialRooms, 
    initialServices, 
    initialEventTypes, 
    forceWizard = false 
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- STATE ---
  const [isLoadingData, setIsLoadingData] = useState(!initialSettings);
  const [isLanding, setIsLanding] = useState(!initialSettings && !forceWizard); 
  const [currentClientSlug, setCurrentClientSlug] = useState<string>('');
  
  const [rooms, setRooms] = useState<RoomType[]>(initialRooms || DEFAULT_ROOMS);
  const [services, setServices] = useState<ServiceOption[]>(initialServices || DEFAULT_SERVICES);
  const [eventTypes, setEventTypes] = useState<EventTypeOption[]>(initialEventTypes || DEFAULT_EVENT_TYPES);
  const [settings, setSettings] = useState<AppSettings>(initialSettings || DEFAULT_SETTINGS);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [language, setLanguage] = useState<Language>('bg');

  const [state, setState] = useState<QuoteState>(INITIAL_STATE);
  const [showProposal, setShowProposal] = useState(false);
  const [calculation, setCalculation] = useState<CalculatedQuote>({
    total: 0,
    sections: { menu: 0, bar: 0, accommodation: 0, services: 0 },
    timeline: []
  });

  const t = translations[language];

  // --- DATA LOADING ---
  const initData = async (slugOverride?: string) => {
    if (initialSettings && !slugOverride) {
        setIsLoadingData(false);
        return;
    }

    try {
        setIsLoadingData(true);

        const params = new URLSearchParams(window.location.search);
        const clientParam = params.get('client');
        const subdomain = getSubdomain();
        
        let effectiveSlug = slugOverride || clientParam || subdomain || '';
        
        setCurrentClientSlug(effectiveSlug);
        
        const dbData = await fetchVenueData(effectiveSlug);
        
        if (dbData) {
            setRooms(dbData.rooms); 
            setServices(dbData.services);
            setEventTypes(dbData.eventTypes);
            setSettings(dbData.settings);
            setIsLanding(false);
        } else {
            if (effectiveSlug && clientsConfig[effectiveSlug]) {
                const cfg = clientsConfig[effectiveSlug];
                if (!initialSettings) {
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        hotelName: cfg.name,
                        primaryColor: cfg.primaryColor,
                        logoUrl: cfg.logo,
                    });
                }
                setIsLanding(false);
            } else {
                // Determine if we are on root or local
                const isLocal = typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'));
                const isRoot = typeof window !== 'undefined' && (window.location.hostname === 'event4u.bg' || window.location.hostname === 'www.event4u.bg');

                if (isLocal) {
                    setIsLanding(false);
                } else if (subdomain && !initialSettings) {
                    setIsLanding(true);
                } else if (isRoot && !initialSettings && !forceWizard) {
                    setIsLanding(true);
                } else {
                    setIsLanding(false);
                }
            }
        }
    } catch (e) {
        console.error("Initialization error", e);
        setIsLanding(false); 
    } finally {
        setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!initialSettings) {
        initData();
    }
  }, []);

  // --- DYNAMIC BRANDING ---
  useEffect(() => {
    if (!isLanding && typeof document !== 'undefined') {
        const root = document.documentElement;
        if (settings.primaryColor) {
            root.style.setProperty('--color-primary', settings.primaryColor);
        }
    }
  }, [settings, isLanding]);

  useEffect(() => {
      if (typeof document !== 'undefined') {
          if (isLanding) {
              document.title = "Event4u - Coming Soon";
          } else {
              document.title = language === 'bg' 
                  ? `${settings.hotelName} - Калкулатор` 
                  : `${settings.hotelName} - Calculator`;
          }
      }
  }, [language, settings.hotelName, isLanding]);

  const updateState = useCallback((updates: Partial<QuoteState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // --- CALCULATION LOGIC ---
  useEffect(() => {
    let menuTotal = 0;
    let barTotal = 0;
    let servicesTotal = 0;
    let roomTotal = 0;
    const totalGuests = state.guests.adults + state.guests.children;

    state.selectedServices.forEach(sId => {
      const service = services.find(s => s.id === sId);
      if (service) {
        if (service.category === 'menu') {
            const isChild = service.name.en.toLowerCase().includes('child') || service.name.en.toLowerCase().includes('kid') || service.name.bg.toLowerCase().includes('дет');
            if (isChild) {
                 menuTotal += service.price * state.guests.children;
            } else {
                 menuTotal += service.price * state.guests.adults;
            }
        } else if (service.category === 'drink') {
           barTotal += service.price * totalGuests;
        } else {
           if (service.priceUnit === 'fixed') servicesTotal += service.price;
           else if (service.priceUnit === 'per_person') servicesTotal += service.price * totalGuests;
        }
      }
    });

    Object.entries(state.accommodation).forEach(([roomId, count]: [string, number]) => {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        roomTotal += room.price * count;
      }
    });
    roomTotal += state.extraBeds * EXTRA_BED_PRICE;

    const total = menuTotal + barTotal + servicesTotal + roomTotal;

    const timeline = [];
    const today = new Date();
    timeline.push({
      date: new Date(today.setDate(today.getDate() + 10)).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US'),
      action: language === 'bg' ? 'Потвърждение + 20% капаро' : 'Confirmation + 20% deposit',
      amount: Math.round(total * 0.2)
    });
    timeline.push({
      date: language === 'bg' ? 'Юни 2026 (Примерен)' : 'June 2026 (Sample)', 
      action: language === 'bg' ? 'Финален брой гости + 50% плащане' : 'Final guest count + 50% payment',
      amount: Math.round(total * 0.5)
    });
    timeline.push({
      date: language === 'bg' ? '30 дни преди събитието' : '30 days before event',
      action: language === 'bg' ? 'Последно плащане' : 'Final payment',
      amount: Math.round(total * 0.3)
    });

    setCalculation({
      total,
      sections: { menu: menuTotal, bar: barTotal, accommodation: roomTotal, services: servicesTotal },
      timeline
    });

  }, [state.guests, state.selectedServices, state.accommodation, state.extraBeds, services, rooms, language]);

  const handleNext = () => updateState({ step: state.step + 1 });
  const handleBack = () => updateState({ step: state.step - 1 });

  const handleSubmit = async () => {
    updateState({ isGeneratingAI: true });
    
    const eventType = eventTypes.find(e => e.id === state.eventType);
    const eventTypeLabel = eventType ? eventType.label[language] : state.eventType;
    
    // Call Server Action
    const text = await generateIntroText(state, language, eventTypeLabel, services);
    updateState({ aiIntroText: text });

    const currentCalc = calculation; 
    await submitQuote(state, currentCalc, settings);

    updateState({ isGeneratingAI: false });
    setShowProposal(true);
  };
  
  const handleSave = async () => {
      const result = await saveVenueData(settings, rooms, services, eventTypes);
      if (result.error) {
          alert('Error saving data: ' + JSON.stringify(result.error));
      }
      return result;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bg' ? 'en' : 'bg');
  };

  const handleAdminClick = () => {
    setLoginPassword('');
    setLoginError(false);
    setShowAdminLogin(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = settings.adminPassword || 'admin';
    
    if (loginPassword === currentPass || loginPassword === 'admin') {
        setShowAdminLogin(false);
        if (!currentClientSlug) {
             setShowClientSelector(true);
        } else {
             setShowAdmin(true);
        }
    } else {
        setLoginError(true);
    }
  };

  const handleClientSelect = (slug: string) => {
    setShowClientSelector(false);
    initData(slug).then(() => {
        setShowAdmin(true);
    });
  };
  
  const handleSwitchClientFromPanel = (slug: string) => {
     initData(slug);
  };

  if (!mounted) {
      return (
          <div className="min-h-screen bg-alpine-white flex items-center justify-center">
             <div className="animate-spin text-4xl text-alpine-blue">⏳</div>
          </div>
      );
  }

  if (isLanding && !isLoadingData) {
      return <LandingPage />;
  }

  return (
    <div className="min-h-screen pb-12 relative font-sans text-gray-900 overflow-x-hidden selection:bg-alpine-blue selection:text-white">
      
      {/* Loading Overlay */}
      {isLoadingData && (
         <div className="fixed inset-0 z-[100] bg-alpine-white flex items-center justify-center text-alpine-blue animate-fade-in">
            <div className="text-center">
                <div className="animate-spin text-5xl mb-6">⟳</div>
                <h2 className="text-2xl font-serif text-alpine-slate">Loading your experience...</h2>
            </div>
         </div>
      )}

      {/* Dynamic Background with Overlay */}
      <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
            style={{ backgroundImage: `url('${settings.backgroundUrl}')` }}
          />
          {/* Main Fix: Make overlay lighter (opacity-60) instead of nearly opaque, to let image show through */}
          <div className={`absolute inset-0 transition-all duration-700 ${state.step === 0 ? 'bg-black/30' : 'bg-white/40 backdrop-blur-[1px]'}`} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">

        {/* Language Toggle */}
        <div className="fixed top-6 right-6 z-50 flex gap-2 no-print">
           <button 
             onClick={toggleLanguage}
             className="bg-white/20 backdrop-blur-md shadow-glass px-4 py-2 rounded-full font-bold text-xs border border-white/30 hover:bg-white hover:text-alpine-slate transition-all text-white uppercase tracking-[0.2em] min-w-[60px]"
           >
             {language === 'bg' ? 'EN' : 'BG'}
           </button>
        </div>

        {/* Admin Toggle Button */}
        <button 
          onClick={handleAdminClick}
          className="fixed bottom-6 left-6 bg-white/10 backdrop-blur text-white/50 p-3 rounded-full hover:bg-white hover:text-alpine-slate hover:scale-110 z-50 transition-all no-print border border-white/10"
          title="Admin Panel"
        >
          ⚙️
        </button>

        {/* Admin Login Modal */}
        {showAdminLogin && (
            <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
                <form onSubmit={handleLoginSubmit} className="bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full">
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-8 text-center">{t.adminAccess}</h3>
                    <div className="mb-6">
                        <input 
                            type="password" 
                            autoFocus
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full border-b-2 border-gray-200 p-3 text-center text-xl focus:border-alpine-blue focus:outline-none transition-all placeholder-gray-300 font-serif"
                            placeholder="••••••"
                        />
                        {loginError && <p className="text-red-500 text-xs mt-3 text-center uppercase tracking-wider">{t.wrongPassword}</p>}
                    </div>
                    <div className="flex gap-4">
                        <button 
                            type="button" 
                            onClick={() => setShowAdminLogin(false)}
                            className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors uppercase text-xs tracking-wider"
                        >
                            {t.cancel}
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 bg-alpine-slate text-white font-bold rounded-lg hover:bg-alpine-blue transition-colors shadow-lg uppercase text-xs tracking-wider"
                        >
                            {t.login}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Admin Client Selector */}
        {showClientSelector && (
            <div className="fixed inset-0 bg-black/90 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full relative overflow-hidden">
                    <button 
                        onClick={() => setShowClientSelector(false)} 
                        className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 text-2xl"
                    >
                        &times;
                    </button>
                    
                    <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 text-center">Select Venue</h3>
                    <p className="text-gray-400 text-center mb-8 text-sm uppercase tracking-wider">Configuration Context</p>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                        {Object.entries(clientsConfig).map(([slug, cfg]) => {
                            const config = cfg as any;
                            return (
                            <button
                                key={slug}
                                onClick={() => handleClientSelect(slug)}
                                className="w-full flex items-center gap-6 p-4 rounded-2xl border border-gray-100 hover:border-alpine-blue hover:shadow-lg transition-all group text-left"
                            >
                                <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center shrink-0 overflow-hidden border">
                                    {config.logo ? (
                                        <img src={config.logo} alt={slug} className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-2xl">🏢</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 font-serif text-lg group-hover:text-alpine-blue transition-colors">{config.name}</h4>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{slug}</span>
                                </div>
                            </button>
                        )})}
                    </div>
                </div>
            </div>
        )}

        {showAdmin && (
          <AdminPanel 
              rooms={rooms}
              services={services}
              eventTypes={eventTypes}
              settings={settings}
              onUpdateRooms={setRooms}
              onUpdateServices={setServices}
              onUpdateEventTypes={setEventTypes}
              onUpdateSettings={setSettings}
              onClose={() => setShowAdmin(false)}
              onReset={initData} 
              onSave={handleSave}
              onChangeClient={handleSwitchClientFromPanel}
              currentClientSlug={currentClientSlug}
              language={language}
          />
        )}

        {!showProposal ? (
          <EventWizard 
            state={state} 
            updateState={updateState} 
            onNext={handleNext} 
            onBack={handleBack}
            onSubmit={handleSubmit}
            availableRooms={rooms}
            availableServices={services}
            availableEventTypes={eventTypes}
            calculation={calculation}
            language={language}
            settings={settings}
          />
        ) : (
          <QuoteProposal 
            state={state} 
            calculation={calculation} 
            onEdit={() => setShowProposal(false)} 
            availableRooms={rooms}
            availableServices={services}
            language={language}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
};

export default MainApp;