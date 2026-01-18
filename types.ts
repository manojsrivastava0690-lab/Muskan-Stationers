
export type Language = 'en' | 'hi';

export interface Product {
  id: string;
  name: string;
  nameHindi: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items?: CartItem[];
  serviceDetails?: ServiceRequest;
  total: number;
  address: string;
  phone: string;
  status: 'pending' | 'processing' | 'ready' | 'shipped' | 'completed' | 'cancelled';
  date: string;
  type: 'product' | 'service';
}

export interface ServiceRequest {
  type: 'photocopy' | 'printout' | 'lamination' | 'scan';
  color: 'bw' | 'color';
  paperSize: 'A4' | 'Legal';
  pages: number;
}

export interface Translation {
  title: string;
  subtitle: string;
  deliveryOnly: string;
  categories: string;
  addToCart: string;
  checkout: string;
  contact: string;
  admin: string;
  uploadDoc: string;
  services: string;
}
