
export interface LocalizedText {
    bg: string;
    en: string;
}

export interface EventTypeOption {
    id: string;
    label: LocalizedText;
    icon: string;
}

export type Language = 'bg' | 'en';

export interface AppSettings {
    clientId?: string; // Changed from venueId to match 'clients' table
    hotelName: string;
    currency: string;
    backgroundUrl: string;
    logoUrl?: string; 
    primaryColor?: string; 
    secondaryColor?: string;
    adminEmail: string; 
    adminPassword?: string; 
}

export interface ServiceOption {
    id: string;
    name: LocalizedText;
    price: number;
    priceUnit: 'per_person' | 'fixed' | 'per_item';
    category: 'menu' | 'drink' | 'ceremony' | 'decoration' | 'entertainment' | 'other';
    selectionType?: 'single' | 'multiple'; 
    description?: LocalizedText;
}

export interface RoomType {
    id: string;
    name: LocalizedText;
    price: number;
    capacity: number;
}

export interface QuoteState {
    step: number;
    customerName: string;
    customerEmail: string; 
    customerPhone: string; 
    eventDate: string;
    eventType: string; 
    guests: {
        adults: number;
        children: number;
    };
    accommodation: {
        [roomId: string]: number; 
    };
    extraBeds: number;
    selectedServices: string[];
    aiIntroText: string;
    isGeneratingAI: boolean;
}

export interface CalculatedQuote {
    total: number;
    sections: {
        menu: number;
        bar: number;
        accommodation: number;
        services: number;
    };
    timeline: {
        date: string;
        action: string;
        amount?: number;
    }[];
}
