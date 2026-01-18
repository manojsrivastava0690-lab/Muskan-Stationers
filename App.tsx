
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, MapPin, Phone, MessageSquare, 
  User, Package, Settings, X, ChevronRight, Plus, Minus, 
  CheckCircle2, Clock, Truck, ClipboardList, SearchSlash, 
  TrendingUp, CheckCircle, AlertCircle, Lock, ShoppingBag,
  CreditCard, Banknote
} from 'lucide-react';
import { Product, CartItem, Language, ServiceRequest, Order, PaymentMethod } from './types';
import { 
  PRODUCTS, CATEGORIES, TRANSLATIONS, 
  SHOP_PHONE, SHOP_WHATSAPP, SHOP_MAPS_URL 
} from './constants';

// NOTE: Replace this with your actual Razorpay Key ID from Dashboard
const RAZORPAY_KEY_ID = "rzp_live_S5I2kNz2ENcBX5"; 

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [view, setView] = useState<'home' | 'admin' | 'account'>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const saved = localStorage.getItem('muskan_orders');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('muskan_orders', JSON.stringify(orders));
  }, [orders]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const formatWhatsAppMessage = (order: Order) => {
    let msg = `*NEW ORDER - MUSKAN STATIONERS*\n`;
    msg += `------------------------------\n`;
    msg += `*Order ID:* ${order.id}\n`;
    msg += `*Payment:* ${order.paymentMethod === 'online' ? '✅ PAID ONLINE' : '💵 CASH ON DELIVERY'}\n`;
    if (order.paymentId) msg += `*Ref:* ${order.paymentId}\n`;
    msg += `------------------------------\n\n`;
    
    if (order.type === 'product') {
      order.items?.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
      });
    } else {
      msg += `*Service:* ${order.serviceDetails?.type}\n`;
      msg += `*Color:* ${order.serviceDetails?.color}\n`;
      msg += `*Pages:* ${order.serviceDetails?.pages}\n`;
    }
    
    msg += `\n*TOTAL BILL: ₹${order.total}*\n`;
    msg += `------------------------------\n`;
    msg += `📍 *Delivery:* Gonda City Only\n`;
    return encodeURIComponent(msg);
  };

  const placeOrder = (type: 'product' | 'service', method: PaymentMethod, payData?: any) => {
    const total = type === 'product' ? cartTotal : (payData.pages * (payData.color === 'color' ? 10 : 2));
    
    const finalize = (paymentId?: string) => {
      const newOrder: Order = {
        id: `${type === 'product' ? 'ORD' : 'SRV'}-${Math.floor(1000 + Math.random() * 9000)}`,
        items: type === 'product' ? [...cart] : undefined,
        serviceDetails: type === 'service' ? payData : undefined,
        total,
        address: 'Gonda City',
        phone: SHOP_PHONE,
        status: 'pending',
        date: new Date().toISOString(),
        type,
        paymentMethod: method,
        paymentId
      };

      setOrders([newOrder, ...orders]);
      const whatsappUrl = `https://wa.me/${SHOP_WHATSAPP}?text=${formatWhatsAppMessage(newOrder)}`;
      window.open(whatsappUrl, '_blank');
      
      if (type === 'product') setCart([]);
      setIsCartOpen(false);
      setShowServiceModal(false);
      setView('account');
    };

    if (method === 'online') {
      // Razorpay Integration
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: total * 100, // Amount in paise
        currency: "INR",
        name: "Muskan Stationers",
        description: type === 'product' ? "Stationery Purchase" : "Printing Service",
        handler: function (response: any) {
          finalize(response.razorpay_payment_id);
        },
        prefill: {
          name: "Customer",
          contact: ""
        },
        theme: { color: "#fbbf24" }
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      finalize();
    }
  };

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameHindi.includes(searchQuery));
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      {/* View Logic (Home/Account/Admin) */}
      {view === 'admin' ? (
        <div className="p-6">
           <button onClick={() => setView('home')} className="bg-gray-100 p-3 rounded-2xl mb-4"><ChevronRight size={20} className="rotate-180" /></button>
           <h1 className="text-2xl font-black mb-6">Admin Panel</h1>
           <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-white p-5 rounded-3xl border shadow-sm">
                   <div className="flex justify-between items-start">
                     <p className="font-bold">{o.id}</p>
                     <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${o.paymentMethod === 'online' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{o.paymentMethod}</span>
                   </div>
                   <p className="text-xl font-black mt-2">₹{o.total}</p>
                </div>
              ))}
           </div>
        </div>
      ) : view === 'account' ? (
        <div className="p-6">
           <button onClick={() => setView('home')} className="bg-gray-100 p-3 rounded-2xl mb-6"><ChevronRight size={20} className="rotate-180" /></button>
           <h1 className="text-2xl font-black mb-6">Your Orders</h1>
           <div className="space-y-4">
             {orders.map(o => (
               <div key={o.id} className="bg-gray-50 p-5 rounded-3xl flex items-center justify-between">
                 <div>
                   <p className="font-bold text-sm">{o.id}</p>
                   <p className="text-[10px] text-gray-400 uppercase font-black">{new Date(o.date).toLocaleDateString()}</p>
                 </div>
                 <div className="text-right">
                    <p className="font-black">₹{o.total}</p>
                    <p className="text-[10px] font-bold text-yellow-600 uppercase">{o.status}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="pb-32">
          {/* Header & Search */}
          <header className="glass sticky top-0 z-50 px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 p-2.5 rounded-2xl"><ShoppingBag className="text-white" size={20} /></div>
                <h1 className="font-extrabold text-xl tracking-tight">{t.title}</h1>
              </div>
              <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="bg-gray-50 border text-xs font-black px-4 py-2 rounded-full">{lang === 'en' ? 'हिंदी' : 'EN'}</button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search items..." className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-4 outline-none border-2 border-transparent focus:border-yellow-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </header>

          {/* Categories & Products */}
          <div className="px-6 py-4 grid grid-cols-2 gap-5">
            {filteredProducts.map(p => (
              <div key={p.id} className="product-card bg-white rounded-[2rem] p-4 border shadow-sm">
                <img src={p.image} className="w-full aspect-square rounded-2xl object-cover mb-3" />
                <h3 className="font-bold text-sm line-clamp-1">{lang === 'en' ? p.name : p.nameHindi}</h3>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-black">₹{p.price}</span>
                  <button onClick={() => handleAddToCart(p)} className="bg-yellow-400 text-white p-2 rounded-xl"><Plus size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-6 left-6 right-6 z-[60] flex items-center justify-between px-8 py-4 glass rounded-[2rem] shadow-2xl max-w-sm mx-auto">
        <button onClick={() => setView('home')} className={`p-2 ${view === 'home' ? 'text-yellow-500' : 'text-gray-300'}`}><TrendingUp size={24} /></button>
        <button onClick={() => setShowServiceModal(true)} className="p-2 text-gray-300"><ClipboardList size={24} /></button>
        <button onClick={() => setIsCartOpen(true)} className="bg-gray-900 text-white p-5 rounded-full -mt-12 shadow-xl relative">
          <ShoppingCart size={28} />
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{cart.length}</span>}
        </button>
        <button onClick={() => setView('account')} className={`p-2 ${view === 'account' ? 'text-yellow-500' : 'text-gray-300'}`}><User size={24} /></button>
        <button onClick={() => setView('admin')} className="p-2 text-gray-300"><Settings size={24} /></button>
      </nav>

      {/* Cart Modal with Payment Selection */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[2.5rem] p-8 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Checkout</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-sm font-bold">{item.name} x {item.quantity}</span>
                  <span className="font-black">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 opacity-60'}`}
                >
                  <Banknote size={24} className={paymentMethod === 'cod' ? 'text-yellow-600' : ''} />
                  <span className="text-[10px] font-black uppercase">Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('online')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'online' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 opacity-60'}`}
                >
                  <CreditCard size={24} className={paymentMethod === 'online' ? 'text-yellow-600' : ''} />
                  <span className="text-[10px] font-black uppercase">UPI / Online</span>
                </button>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-400">Total Bill</span>
                <span className="text-3xl font-black">₹{cartTotal}</span>
              </div>

              <button 
                onClick={() => placeOrder('product', paymentMethod)}
                className="w-full bg-yellow-400 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-yellow-100"
              >
                {paymentMethod === 'online' ? 'Pay Now & Order' : 'Order Now (COD)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

