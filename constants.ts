
import { Product, Translation } from './types';

export const TRANSLATIONS: Record<'en' | 'hi', Translation> = {
  en: {
    title: "Muskan Stationers",
    subtitle: "Premium Office & School Supplies",
    deliveryOnly: "Free delivery in Gonda City",
    categories: "Top Categories",
    addToCart: "Add to Bag",
    checkout: "Complete Order",
    contact: "Need Help?",
    admin: "Admin",
    uploadDoc: "Upload File",
    services: "Our Services"
  },
  hi: {
    title: "मुस्कान स्टेशनर्स",
    subtitle: "प्रीमियम ऑफिस और स्कूल सामान",
    deliveryOnly: "गोंडा शहर में फ्री डिलीवरी",
    categories: "मुख्य श्रेणियां",
    addToCart: "बैग में डालें",
    checkout: "ऑर्डर पूरा करें",
    contact: "मदद चाहिए?",
    admin: "एडमिन",
    uploadDoc: "फाइल अपलोड करें",
    services: "हमारी सेवाएं"
  }
};

export const PRODUCTS: Product[] = [
  // PENS
  { id: 'p1', name: 'Luxor Gel Pen (Blue)', nameHindi: 'लक्सर जेल पेन (नीला)', price: 10, category: 'Pens', image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop', description: 'Smooth waterproof ink' },
  { id: 'p2', name: 'Cello Butterflow', nameHindi: 'सेलो बटरफ्लो', price: 10, category: 'Pens', image: 'https://images.unsplash.com/photo-1511108690759-009324a90311?w=400&h=400&fit=crop', description: 'Best for fast writing' },
  { id: 'p3', name: 'Parker Jotter Special', nameHindi: 'पार्कर जोटर', price: 250, category: 'Pens', image: 'https://images.unsplash.com/photo-1583485088034-7160b5b1814b?w=400&h=400&fit=crop', description: 'Premium gift pen' },
  
  // NOTEBOOKS
  { id: 'n1', name: 'Classmate A4 (172 pgs)', nameHindi: 'क्लासमेट A4 रजिस्टर', price: 75, category: 'Registers', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', description: 'Premium quality paper' },
  { id: 'n2', name: 'Spiral Notebook', nameHindi: 'स्पाइरल नोटबुक', price: 120, category: 'Registers', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop', description: 'A5 size, 200 pages' },
  { id: 'n3', name: 'Practical File', nameHindi: 'प्रैक्टिकल फाइल', price: 45, category: 'Registers', image: 'https://images.unsplash.com/photo-1586075010620-222a01948811?w=400&h=400&fit=crop', description: 'School/College use' },

  // SCHOOL
  { id: 's1', name: 'Doms Geometry Box', nameHindi: 'डोम्स ज्यामिति बॉक्स', price: 140, category: 'School Items', image: 'https://images.unsplash.com/photo-1635345754025-06d289134371?w=400&h=400&fit=crop', description: 'Complete math set' },
  { id: 's2', name: 'Fevicol MR (50g)', nameHindi: 'फेविकोल MR', price: 25, category: 'School Items', image: 'https://images.unsplash.com/photo-1589994965851-bc076e054199?w=400&h=400&fit=crop', description: 'Strong white glue' },
  { id: 's3', name: 'Crayons 12 Shades', nameHindi: 'क्रेयॉन्स 12 शेड्स', price: 40, category: 'School Items', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop', description: 'Wax crayons for kids' },

  // OFFICE
  { id: 'o1', name: 'Stapler No. 10', nameHindi: 'स्टेपलर नंबर 10', price: 55, category: 'Office', image: 'https://images.unsplash.com/photo-1589133857398-75211915668b?w=400&h=400&fit=crop', description: 'Steel body stapler' },
  { id: 'o2', name: 'A4 Paper Rim (JK)', nameHindi: 'A4 पेपर रिम', price: 340, category: 'Office', image: 'https://images.unsplash.com/photo-1584441405886-bc91b61ea013?w=400&h=400&fit=crop', description: '500 sheets, 75GSM' },
];

export const CATEGORIES = [
  { id: 'All', label: 'All', labelHindi: 'सब', icon: '🛍️' },
  { id: 'Pens', label: 'Pens', labelHindi: 'पेन', icon: '🖋️' },
  { id: 'Registers', label: 'Books', labelHindi: 'कॉपी', icon: '📔' },
  { id: 'School Items', label: 'School', labelHindi: 'स्कूल', icon: '🎒' },
  { id: 'Office', label: 'Office', labelHindi: 'ऑफिस', icon: '📎' },
  { id: 'Services', label: 'Prints', labelHindi: 'प्रिंट', icon: '🖨️' }
];

export const SHOP_PHONE = "+919918800690";
export const SHOP_WHATSAPP = "919794725337";
export const SHOP_MAPS_URL = "https://maps.app.goo.gl/Z3UF1YXwK3dhs8CP8";
