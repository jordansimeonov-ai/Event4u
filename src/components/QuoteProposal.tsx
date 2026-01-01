'use client';

import React, { useState, useEffect } from 'react';
import { QuoteState, CalculatedQuote, RoomType, ServiceOption, Language, AppSettings } from '../types';
import { COMPLIMENTARY_SERVICES, EXTRA_BED_PRICE } from '../constants';
import { translations } from '../locales';

interface Props {
  state: QuoteState;
  calculation: CalculatedQuote;
  onEdit: () => void;
  availableRooms: RoomType[];
  availableServices: ServiceOption[];
  language: Language;
  settings: AppSettings;
}

export const QuoteProposal: React.FC<Props> = ({ state, calculation, onEdit, availableRooms, availableServices, language, settings }) => {
  const t = translations[language];
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Use primary color from settings or default to Gold
  const primaryColor = settings.primaryColor || '#C5A059';

  // Keyboard shortcut for printing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '...';
    const d = new Date(dateString);
    return d.toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const today = new Date().toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });

  // Filter selected services
  const selectedServiceDetails = availableServices.filter(s => state.selectedServices.includes(s.id));
  
  const handleBooking = async () => {
    setIsSending(true);

    const element = document.getElementById('proposal-content');
    const filename = `Offer_${state.customerName.replace(/\s+/g, '_')}_${state.eventDate}.pdf`;

    // 1. Generate and Download PDF
    if (element && (window as any).html2pdf) {
        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await (window as any).html2pdf().set(opt).from(element).save();
        } catch (e) {
            console.error("PDF Generation failed", e);
            alert("Could not generate PDF automatically. Please use the Print button to save as PDF.");
        }
    } else if (element && !(window as any).html2pdf) {
        console.warn("html2pdf library not loaded");
        // Don't alert, just proceed to email logic as fallback
    }
    
    // 2. Open Email Client
    // Construct email parameters
    const subject = encodeURIComponent(`${language === 'bg' ? 'Запитване за събитие' : 'Event Request'}: ${state.customerName}`);
    const bodyText = `
${language === 'bg' ? 'Здравейте, бих искал да направя резервация.' : 'Hello, I would like to make a reservation.'}

${language === 'bg' ? 'Прикачил съм генерираната оферта като PDF към този имейл.' : 'I have attached the generated offer as a PDF to this email.'}

${language === 'bg' ? 'Детайли:' : 'Details:'}
${language === 'bg' ? 'Име' : 'Name'}: ${state.customerName}
${language === 'bg' ? 'Телефон' : 'Phone'}: ${state.customerPhone}
${language === 'bg' ? 'Дата' : 'Date'}: ${state.eventDate}
${language === 'bg' ? 'Гости' : 'Guests'}: ${state.guests.adults} ${language === 'bg' ? 'възрастни' : 'adults'}, ${state.guests.children} ${language === 'bg' ? 'деца' : 'children'}
${language === 'bg' ? 'Обща сума' : 'Total Amount'}: ${calculation.total.toLocaleString()} ${settings.currency}

${language === 'bg' ? 'Моля, потвърдете възможността за провеждане на събитието.' : 'Please confirm the availability for this event.'}
    `;
    const body = encodeURIComponent(bodyText);

    setTimeout(() => {
        setIsSending(false);
        setShowSuccess(true);
        // Open default mail client with pre-filled data
        window.location.href = `mailto:${settings.adminEmail}?cc=${state.customerEmail}&subject=${subject}&body=${body}`;
    }, 1500);
  };

  const complimentaryGifts = COMPLIMENTARY_SERVICES[language] || [];

  return (
    <div className="w-full max-w-[210mm] mx-auto my-8 bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full animate-fade-in relative print:my-0 print:border-none">
      
      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in no-print">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md text-center transform scale-100 transition-all">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📄</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.bookSuccessTitle}</h3>
                <p className="text-gray-600 mb-6 font-medium">
                    {t.bookSuccessMsg}
                </p>
                <div className="text-xs text-gray-400 mb-4">
                   (Sent to: {settings.adminEmail}, CC: {state.customerEmail})
                </div>
                <button 
                    onClick={() => setShowSuccess(false)}
                    className="w-full py-3 text-white font-bold rounded-lg transition-colors"
                    style={{ backgroundColor: primaryColor }}
                >
                    {t.close}
                </button>
            </div>
        </div>
      )}

      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply print:hidden"></div>

      {/* PRINTABLE CONTENT ID Wrapper */}
      <div id="proposal-content">
        {/* Header */}
        <div className="bg-[#1A1A1A] p-12 text-center print:bg-white print:text-black print:border-b-4 relative overflow-hidden z-10 print:p-6"
             style={{ color: primaryColor, borderColor: primaryColor }}>
            
            {/* Print Icon - Top Right - Hidden in PDF Generation */}
            <button 
                onClick={() => window.print()}
                className="absolute top-6 right-6 text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all no-print z-50"
                title={language === 'bg' ? 'Принтирай' : 'Print'}
                data-html2canvas-ignore="true"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
            </button>

            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')] print:hidden"></div>
            <div className="relative z-10">
                <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-widest mb-2 print:text-4xl">{settings.hotelName}</h1>
                <p className="font-serif italic text-xl tracking-wide opacity-80 print:text-gray-600">"Your Fairytale Event"</p>
            </div>
        </div>

        <div className="p-8 md:p-16 space-y-12 text-gray-800 bg-white relative z-10 print:p-8 print:space-y-6">
            
            {/* Title Section */}
            <div className="text-center border-b border-gray-100 pb-8 print:pb-4">
            <div className="inline-block bg-[#F9F7F2] px-6 py-2 rounded-full mb-4 print:bg-transparent print:border print:border-gray-300">
                <span className="text-sm font-bold tracking-widest uppercase" style={{ color: primaryColor }}>{t.madeFor}: {state.customerName || '...'}</span>
            </div>
            {state.customerPhone && (
                <div className="mb-2 text-sm text-gray-500 font-bold tracking-wide uppercase">
                    📞 {state.customerPhone}
                </div>
            )}
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4 print:text-3xl" style={{ color: primaryColor }}>
                {state.eventDate ? formatDate(state.eventDate) : t.offerDate} 
            </h2>
            <div className="flex justify-center gap-8 mt-4 text-gray-500 font-medium uppercase text-sm tracking-wide print:text-xs">
                <span>{state.guests.adults + state.guests.children} {language === 'bg' ? 'Гости' : 'Guests'}</span>
                <span>•</span>
                <span>{Object.values(state.accommodation).reduce((a: number, b: number) => a + b, 0)} {language === 'bg' ? 'Помещения' : 'Rooms'}</span>
                <span>•</span>
                <span>{today}</span>
            </div>
            </div>

            {/* AI Intro */}
            {state.aiIntroText && (
            <div className="px-4 md:px-12 print:px-0">
                <div className="font-serif text-xl md:text-2xl leading-relaxed text-center text-gray-700 italic print:text-lg">
                    "{state.aiIntroText}"
                </div>
            </div>
            )}

            {/* 1. Overview */}
            <section className="break-inside-avoid print:break-inside-avoid">
            <div className="flex items-center gap-4 mb-6 print:mb-3">
                <span className="text-white font-serif font-bold rounded-none w-8 h-8 flex items-center justify-center text-xl print:bg-black print:text-white"
                      style={{ backgroundColor: primaryColor }}>1</span>
                <h3 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-widest">{t.overview}</h3>
            </div>
            
            <div className="ml-12 mb-8 text-gray-600 leading-relaxed text-lg print:text-base print:mb-4">
                {t.overviewText}
            </div>
            
            <div className="ml-12 bg-[#F9F7F2] p-8 rounded-none border-l-4 print:bg-gray-50 print:p-4"
                 style={{ borderColor: primaryColor }}>
                <h4 className="font-bold mb-4 uppercase tracking-wider text-sm" style={{ color: primaryColor }}>
                    {t.gifts}
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-base print:text-sm">
                {complimentaryGifts.map((comp: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3">
                        <span className="text-xl" style={{ color: primaryColor }}>✦</span>
                        {comp}
                    </li>
                ))}
                </ul>
            </div>
            </section>

            {/* 2. Budget */}
            <section className="break-inside-avoid print:break-inside-avoid">
            <div className="flex items-center justify-between mb-8 border-b-2 pb-2 print:mb-4"
                 style={{ borderColor: primaryColor }}>
                <div className="flex items-center gap-4">
                    <span className="text-white font-serif font-bold rounded-none w-8 h-8 flex items-center justify-center text-xl print:bg-black print:text-white"
                          style={{ backgroundColor: primaryColor }}>2</span>
                    <h3 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-widest">{t.budget}</h3>
                </div>
                <span className="text-3xl font-serif font-bold print:text-2xl" style={{ color: primaryColor }}>{calculation.total.toLocaleString()} {settings.currency}</span>
            </div>

            <table className="w-full text-base border-collapse print:text-sm">
                <thead className="text-[#999] text-left uppercase text-xs tracking-wider border-b border-gray-200">
                <tr>
                    <th className="p-4 font-normal print:p-2 w-1/2">{t.position}</th>
                    <th className="p-4 font-normal print:p-2">{t.calc}</th>
                    <th className="p-4 font-normal text-right print:p-2 w-[20%]">{t.sum}</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                
                {/* Dynamic Per-Person Services (Menu, Bar, Others) */}
                {selectedServiceDetails.filter(s => s.priceUnit === 'per_person').map(s => {
                    let count = state.guests.adults + state.guests.children; // Default to total
                    
                    // Specific logic mirroring App.tsx
                    if (s.category === 'menu') {
                        if (s.id.includes('adult')) count = state.guests.adults;
                        else if (s.id.includes('child')) count = state.guests.children;
                    }

                    if (count === 0) return null;

                    return (
                        <tr key={s.id} className="group">
                            <td className="p-4 font-bold text-gray-800 print:p-2">{s.name[language]}</td>
                            <td className="p-4 text-gray-600 print:p-2">
                                {count} × {s.price} {settings.currency}
                            </td>
                            <td className="p-4 text-right font-bold text-gray-900 print:p-2">
                                {(count * s.price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} {settings.currency}
                            </td>
                        </tr>
                    );
                })}

                {/* Fixed Services */}
                {selectedServiceDetails.filter(s => s.priceUnit === 'fixed').map(s => (
                    <tr key={s.id} className="group">
                    <td className="p-4 font-bold text-gray-800 print:p-2">{s.name[language]}</td>
                    <td className="p-4 text-gray-600 print:p-2">{t.fixed}</td>
                    <td className="p-4 text-right font-bold text-gray-900 print:p-2">
                        {s.price.toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')} {settings.currency}
                    </td>
                    </tr>
                ))}

                {/* Accommodation */}
                {Object.keys(state.accommodation).some(k => state.accommodation[k] > 0) && (
                    <tr className="bg-gray-50 print:bg-transparent print:border-t print:border-gray-200">
                    <td className="p-4 font-serif italic text-gray-600 print:p-2" colSpan={3}>{t.accommodation}</td>
                    </tr>
                )}

                {Object.entries(state.accommodation).map(([roomId, count]: [string, number]) => {
                    if (count === 0) return null;
                    const room = availableRooms.find(r => r.id === roomId);
                    if (!room) return null;
                    return (
                    <tr key={roomId} className="group">
                        <td className="p-4 pl-8 text-gray-600 print:p-2 print:pl-6">{room.name[language]}</td>
                        <td className="p-4 text-gray-600 print:p-2">{count} × {room.price} {settings.currency}</td>
                        <td className="p-4 text-right font-bold text-gray-900 print:p-2">
                            {(count * room.price).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')} {settings.currency}
                        </td>
                    </tr>
                    );
                })}
                
                {state.extraBeds > 0 && (
                    <tr className="group">
                    <td className="p-4 pl-8 text-gray-600 print:p-2 print:pl-6">{t.extraBedsItem}</td>
                    <td className="p-4 text-gray-600 print:p-2">{state.extraBeds} × {EXTRA_BED_PRICE} {settings.currency}</td>
                    <td className="p-4 text-right font-bold text-gray-900 print:p-2">
                        {(state.extraBeds * EXTRA_BED_PRICE).toLocaleString(language === 'bg' ? 'bg-BG' : 'en-US')} {settings.currency}
                    </td>
                </tr>
                )}

                </tbody>
                <tfoot className="bg-[#F9F7F2] font-bold text-lg border-t-2 print:bg-transparent"
                       style={{ borderColor: primaryColor }}>
                <tr>
                    <td className="p-6 uppercase tracking-widest text-sm print:p-4" colSpan={2}>{t.totalAll}</td>
                    <td className="p-6 text-right text-2xl font-serif print:p-4" style={{ color: primaryColor }}>{calculation.total.toLocaleString()} {settings.currency}</td>
                </tr>
                </tfoot>
            </table>
            <p className="text-xs text-gray-400 mt-2 italic text-right">{t.vatNote}</p>
            </section>

            {/* 3. Timeline */}
            <section className="break-inside-avoid print:break-inside-avoid">
            <div className="flex items-center gap-4 mb-6 print:mb-3">
                <span className="text-white font-serif font-bold rounded-none w-8 h-8 flex items-center justify-center text-xl print:bg-black print:text-white"
                      style={{ backgroundColor: primaryColor }}>3</span>
                <h3 className="text-xl font-bold text-[#1A1A1A] uppercase tracking-widest">{t.timeline}</h3>
            </div>
            
            <div className="ml-12 border border-gray-200 p-1 print:ml-0 print:border-none">
                <table className="w-full text-sm">
                    <thead className="text-left bg-gray-50 text-gray-500 uppercase text-xs font-bold print:bg-gray-100">
                    <tr>
                        <th className="p-3 print:p-2">{t.term}</th>
                        <th className="p-3 print:p-2">{t.action}</th>
                        <th className="p-3 text-right print:p-2">{t.sum}</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {calculation.timeline.map((item, index) => (
                        <tr key={index}>
                        <td className="p-3 font-bold text-[#1A1A1A] print:p-2">{item.date}</td>
                        <td className="p-3 print:p-2">{item.action}</td>
                        <td className="p-3 text-right font-medium print:p-2">{item.amount ? `≈ ${item.amount.toLocaleString()} ${settings.currency}` : '-'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            </section>

            {/* 4. Contact/Footer */}
            <section className="text-center text-white p-16 mt-12 shadow-lg print:shadow-none print:bg-white print:text-black print:border-t-2 break-inside-avoid print:mt-6 print:p-6 print:pt-8"
                     style={{ backgroundColor: primaryColor, borderColor: primaryColor }}>
            <h3 className="text-3xl font-serif mb-4 italic print:text-xl">"{t.justSayYes}"</h3>
            <p className="mb-8 opacity-90 text-lg uppercase tracking-widest font-light print:text-sm">{t.nowIsTheTime}</p>
            
            <div className="w-16 h-1 bg-white/30 mx-auto mb-8 print:mb-4"></div>
            
            <div className="text-sm opacity-80 space-y-1">
                <p>{settings.hotelName}</p>
                <p>{settings.adminEmail}</p>
                <p>+359 888 123 456</p>
            </div>
            </section>
        </div>
      </div>
      
      {/* Controls */}
      <div className="bg-gray-50 p-6 flex justify-center gap-4 no-print border-t print:hidden" data-html2canvas-ignore="true">
        <button onClick={onEdit} className="px-8 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 font-bold text-gray-700 transition-all">
          <span>{t.edit}</span>
        </button>
        <button 
            onClick={handleBooking} 
            disabled={isSending}
            className="px-8 py-3 text-white font-bold rounded-lg shadow-md hover:opacity-90 flex items-center gap-2 disabled:opacity-50 transition-all"
            style={{ backgroundColor: primaryColor }}
        >
          {isSending ? (
            <span>⏳ {t.processing}</span>
          ) : (
            <span className="flex items-center gap-2"><span>📨</span> {t.sendEmail}</span>
          )}
        </button>
      </div>
    </div>
  );
};