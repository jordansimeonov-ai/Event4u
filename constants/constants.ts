import { RoomType, ServiceOption, EventTypeOption, Language } from "./types";

export const DEFAULT_EVENT_TYPES: EventTypeOption[] = [
    { id: 'wedding', label: { bg: 'Сватба', en: 'Wedding' }, icon: '💒' },
    { id: 'business', label: { bg: 'Бизнес Събитие', en: 'Business Event' }, icon: '💼' },
    { id: 'teambuilding', label: { bg: 'Тийм Билдинг', en: 'Team Building' }, icon: '🎯' }
];

export const ROOM_TYPES: RoomType[] = [
  { id: 'double_std', name: { bg: 'Двойна стая', en: 'Double Room' }, price: 113, capacity: 2 },
  { id: 'single', name: { bg: 'Единична стая', en: 'Single Room' }, price: 93, capacity: 1 },
  { id: 'apt_small', name: { bg: 'Малък апартамент / Вила', en: 'Small Apt / Villa' }, price: 153, capacity: 3 },
  { id: 'apt_large', name: { bg: 'Голям апартамент', en: 'Large Apartment' }, price: 163, capacity: 4 },
];

export const EXTRA_BED_PRICE = 15;

export const SERVICES: ServiceOption[] = [
  // Menu
  { 
    id: 'menu_adult_std', 
    name: { bg: 'Сватбено меню (Възрастни)', en: 'Wedding Menu (Adults)' }, 
    price: 65, 
    priceUnit: 'per_person', 
    category: 'menu', 
    selectionType: 'multiple', 
    description: { bg: '4-степенно меню с включена дегустация', en: '4-course meal including tasting' } 
  },
  { 
    id: 'menu_child', 
    name: { bg: 'Детско меню', en: 'Kids Menu' }, 
    price: 32.50, 
    priceUnit: 'per_person', 
    category: 'menu', 
    selectionType: 'multiple' 
  },
  
  // Drinks
  { 
    id: 'bar_3', 
    name: { bg: 'Отворен Бар №3', en: 'Open Bar #3' }, 
    price: 22, 
    priceUnit: 'per_person', 
    category: 'drink', 
    selectionType: 'single', 
    description: { bg: 'Бира, вино, безалкохолни (неограничено)', en: 'Beer, wine, soft drinks (unlimited)' } 
  },
  { 
    id: 'bar_full', 
    name: { bg: 'Пълен Отворен Бар', en: 'Full Open Bar' }, 
    price: 35, 
    priceUnit: 'per_person', 
    category: 'drink', 
    selectionType: 'single', 
    description: { bg: 'Всичко от Бар 3 + твърд алкохол', en: 'Everything from Bar 3 + hard liquor' } 
  },
  
  // Ceremony
  { 
    id: 'ritual_outside', 
    name: { bg: 'Изнесен ритуал + Граждански брак', en: 'Outside Ceremony + Civil Marriage' }, 
    price: 200, 
    priceUnit: 'fixed', 
    category: 'ceremony', 
    selectionType: 'multiple' 
  },
  { 
    id: 'ritual_decor_forest', 
    name: { bg: 'Украса "Romantic Forest"', en: '"Romantic Forest" Decoration' }, 
    price: 680, 
    priceUnit: 'fixed', 
    category: 'decoration', 
    selectionType: 'multiple', 
    description: { bg: 'Арка, цветя, килим', en: 'Arch, flowers, carpet' } 
  },
  
  // Extras
  { 
    id: 'kids_zone', 
    name: { bg: 'Детска зона + Аниматори', en: 'Kids Zone + Animators' }, 
    price: 880, 
    priceUnit: 'fixed', 
    category: 'entertainment', 
    selectionType: 'multiple', 
    description: { bg: 'За до 20 деца, 8-9 часа', en: 'Up to 20 kids, 8-9 hours' } 
  },
  { 
    id: 'dj_host', 
    name: { bg: 'DJ + Водещ (Топ Пакет)', en: 'DJ + Host (Top Package)' }, 
    price: 1950, 
    priceUnit: 'fixed', 
    category: 'entertainment', 
    selectionType: 'multiple' 
  },
  { 
    id: 'photo_video', 
    name: { bg: 'Фото и Видео (с дрон)', en: 'Photo & Video (Drone included)' }, 
    price: 2950, 
    priceUnit: 'fixed', 
    category: 'entertainment', 
    selectionType: 'multiple', 
    description: { bg: 'Целодневно заснемане', en: 'Full day coverage' } 
  },
  { 
    id: 'tent_decor', 
    name: { bg: 'Декорация на шатра (Средно ниво)', en: 'Tent Decoration (Mid-Tier)' }, 
    price: 1850, 
    priceUnit: 'fixed', 
    category: 'decoration', 
    selectionType: 'multiple', 
    description: { bg: 'Цветя, осветление, табла', en: 'Flowers, lighting, boards' } 
  },
];

export const COMPLIMENTARY_SERVICES: Record<Language, string[]> = {
    bg: [
        "Цялостна организация",
        "Дегустация на менюто",
        "Сватбена погача",
        "Подарък за младоженците",
        "Безплатен СПА за всички гости",
        "20% отстъпка на СПА процедури"
    ],
    en: [
        "Full Organization",
        "Menu Tasting",
        "Wedding Ritual Bread",
        "Gift for the Newlyweds",
        "Free SPA for all guests",
        "20% Discount on SPA procedures"
    ]
};