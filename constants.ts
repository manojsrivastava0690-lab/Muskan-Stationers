
import { Product, Translation } from './types';

export const TRANSLATIONS: Record<'en' | 'hi', Translation> = {
  en: {
    title: "Muskan PCO",
    subtitle: "Fast Stationery Delivery",
    deliveryOnly: "Delivering only in Gonda city",
    categories: "Shop by Category",
    addToCart: "Add",
    checkout: "Checkout",
    contact: "Contact Us",
    admin: "Admin",
    uploadDoc: "Upload Document",
    services: "Our Services"
  },
  hi: {
    title: "मुस्कान पीसीओ",
    subtitle: "तेज़ स्टेशनरी डिलीवरी",
    deliveryOnly: "केवल गोंडा शहर में डिलीवरी",
    categories: "श्रेणी के अनुसार",
    addToCart: "जोड़ें",
    checkout: "चेकआउट",
    contact: "संपर्क करें",
    admin: "एडमिन",
    uploadDoc: "दस्तावेज़ अपलोड करें",
    services: "हमारी सेवाएं"
  }
};

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Blue Gel Pen', nameHindi: 'नीला जेल पेन', price: 10, category: 'Pens', image: 'https://picsum.photos/seed/pen/300/300', description: 'Smooth writing gel pen' },
  { id: '2', name: 'A4 Register (120 pgs)', nameHindi: 'A4 रजिस्टर', price: 60, category: 'Registers', image: 'https://picsum.photos/seed/notebook/300/300', description: 'High quality A4 register' },
  { id: '3', name: 'Geometry Box', nameHindi: 'ज्यामिति बॉक्स', price: 150, category: 'School Items', image: 'https://picsum.photos/seed/geometry/300/300', description: 'Complete math set' }
];

export const CATEGORIES = [
  { id: 'Pens', label: 'Pens', labelHindi: 'पेन', icon: '🖋️' },
  { id: 'Registers', label: 'Registers', labelHindi: 'रजिस्टर', icon: '📔' },
  { id: 'School Items', label: 'School', labelHindi: 'स्कूल', icon: '🎒' },
  { id: 'Services', label: 'Services', labelHindi: 'सेवाएं', icon: '🖨️' }
];

export const SHOP_PHONE = "+919918800690";
export const SHOP_WHATSAPP = "919794725337";
export const SHOP_MAPS_URL = "https://maps.app.goo.gl/Z3UF1YXwK3dhs8CP8";
