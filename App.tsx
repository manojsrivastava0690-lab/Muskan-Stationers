
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, MapPin, Phone, MessageSquare, 
  User, Package, Settings, X, ChevronRight, Plus, Minus, 
  CheckCircle2, Clock, Truck, ClipboardList, SearchSlash, 
  TrendingUp, CheckCircle, AlertCircle, Lock, ShoppingBag
} from 'lucide-react';
import { Product, CartItem, Language, ServiceRequest, Order } from './types';
import { 
  PRODUCTS, CATEGORIES, TRANSLATIONS, 
  SHOP_PHONE, SHOP_WHATSAPP, SHOP_MAPS_URL 
} from './constants';

// --- Components ---

const AdminPinModal: React.FC<{ onClose: () => void; onSuccess: () => void; }> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") onSuccess();
    else { setError(true); setPin(''); setTimeout(() => setError(false), 500); }
  };
  return (
    <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className={`bg-white w-full max-w-xs rounded-[2.5rem] p-8 shadow-2xl animate-scale-in`}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-yellow-100 p-4 rounded-full text-yellow-600"><Lock size={32} /></div>
          <h2 className="text-xl font-bold">Admin Login</h2>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input 
              type="password" autoFocus inputMode="numeric" maxLength={4} placeholder="••••"
              value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-3xl tracking-widest py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-yellow-400 outline-none transition-all"
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-400">Cancel</button>
              <button type="submit" className="flex-1 bg-yellow-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-yellow-100">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ServiceModal: React.FC<{ onClose: () => void; lang: Language; onSubmit: (s: ServiceRequest) => void; }> = ({ onClose, lang, onSubmit }) => {
  const [service, setService] = useState<ServiceRequest>({ type: 'photocopy', color: 'bw', paperSize: 'A4', pages: 1 });
  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
      <div className="bg-white w-full rounded-t-[2.5rem] p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">{lang === 'en' ? 'Quick Print' : 'क्विक प्रिंट'}</h2>
          <button onClick={onClose} className="bg-gray-100 p-2 rounded-full"><X size={20} /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {['photocopy', 'printout', 'scan', 'lamination'].map(t => (
              <button key={t} onClick={() => setService({...service, type: t as any})} className={`py-4 rounded-2xl font-bold text-sm capitalize border-2 transition-all ${service.type === t ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-400'}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Ink</label>
              <select className="w-full bg-gray-50 p-3 rounded-xl outline-none" onChange={(e) => setService({...service, color: e.target.value as any})}>
                <option value="bw">B&W (₹2)</option>
                <option value="color">Color (₹10)</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Pages</label>
              <input type="number" min="1" value={service.pages} onChange={(e) => setService({...service, pages: parseInt(e.target.value) || 1})} className="w-full bg-gray-50 p-3 rounded-xl outline-none" />
            </div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-2xl flex justify-between items-center">
            <span className="font-bold text-gray-600">Estimated Total:</span>
            <span className="text-xl font-black text-yellow-600">₹{service.pages * (service.color === 'color' ? 10 : 2)}</span>
          </div>
          <button onClick={() => onSubmit(service)} className="w-full bg-yellow-400 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-yellow-100 active:scale-95 transition-all">Send to WhatsApp</button>
        </div>
      </div>
    </div>
  );
};

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
    msg += `*Type:* ${order.type.toUpperCase()}\n\n`;
    
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
    msg += `📞 *From App:* muskan-stationers.vercel.app`;
    return encodeURIComponent(msg);
  };

  const placeOrder = (type: 'product' | 'service', data?: any) => {
    const newOrder: Order = {
      id: `${type === 'product' ? 'ORD' : 'SRV'}-${Math.floor(1000 + Math.random() * 9000)}`,
      items: type === 'product' ? [...cart] : undefined,
      serviceDetails: type === 'service' ? data : undefined,
      total: type === 'product' ? cartTotal : (data.pages * (data.color === 'color' ? 10 : 2)),
      address: 'Gonda City',
      phone: SHOP_PHONE,
      status: 'pending',
      date: new Date().toISOString(),
      type
    };

    setOrders([newOrder, ...orders]);
    const whatsappUrl = `https://wa.me/${SHOP_WHATSAPP}?text=${formatWhatsAppMessage(newOrder)}`;
    window.open(whatsappUrl, '_blank');
    
    if (type === 'product') setCart([]);
    setIsCartOpen(false);
    setShowServiceModal(false);
    setView('account');
  };

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameHindi.includes(searchQuery));
    return list;
  }, [activeCategory, searchQuery]);

  // --- Views ---

  const HomeView = () => (
    <div className="pb-32">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-lg shadow-yellow-100"><ShoppingBag className="text-white" size={20} /></div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight">{t.title}</h1>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <MapPin size={10} className="text-red-500" /> {t.deliveryOnly}
              </div>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="bg-gray-50 border border-gray-100 text-xs font-black px-4 py-2 rounded-full active:scale-90 transition-all">
            {lang === 'en' ? 'हिंदी' : 'EN'}
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" placeholder={lang === 'en' ? "Search for pens, books..." : "खोजें..."}
            className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all font-medium"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Hero */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-yellow-100">
          <div className="relative z-10 max-w-[60%]">
            <h2 className="text-3xl font-black leading-tight mb-2">Muskan Smile Offers!</h2>
            <p className="text-sm opacity-90 font-medium mb-4">{lang === 'en' ? 'Free delivery on all orders above ₹99' : '₹99 से ऊपर के ऑर्डर पर फ्री डिलीवरी'}</p>
            <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">Order Now</button>
          </div>
          <Package size={140} className="absolute -right-6 -bottom-6 opacity-20 rotate-12" />
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mb-8 overflow-x-auto hide-scrollbar flex gap-4 py-2">
        {CATEGORIES.map(cat => (
          <button 
            key={cat.id}
            onClick={() => cat.id === 'Services' ? setShowServiceModal(true) : setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all active:scale-95 ${activeCategory === cat.id ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg shadow-yellow-100' : 'bg-white border-gray-100 text-gray-500'}`}
          >
            <span className="text-lg">{cat.icon}</span>
            <span className="text-xs font-black uppercase tracking-wider">{lang === 'en' ? cat.label : cat.labelHindi}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="px-6 grid grid-cols-2 gap-5">
        {filteredProducts.map(p => {
          const inCart = cart.find(c => c.id === p.id);
          return (
            <div key={p.id} className="product-card bg-white rounded-[2rem] p-4 border border-gray-50 shadow-sm flex flex-col">
              <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden relative">
                <img src={p.image} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[8px] font-black text-gray-500 uppercase">₹{p.price}</div>
              </div>
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{lang === 'en' ? p.name : p.nameHindi}</h3>
              <p className="text-[10px] text-gray-400 mb-4 line-clamp-1">{p.description}</p>
              <div className="mt-auto">
                {inCart ? (
                  <div className="flex items-center justify-between bg-yellow-400 rounded-xl p-1.5 text-white animate-scale-in">
                    <button onClick={() => updateQuantity(p.id, -1)} className="p-1"><Minus size={14} /></button>
                    <span className="text-xs font-black">{inCart.quantity}</span>
                    <button onClick={() => updateQuantity(p.id, 1)} className="p-1"><Plus size={14} /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart(p)}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-xs active:scale-95 transition-all"
                  >
                    {t.addToCart}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const AdminView = () => (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-6 py-6 flex items-center justify-between">
        <button onClick={() => setView('home')} className="bg-gray-100 p-3 rounded-2xl"><ChevronRight size={20} className="rotate-180" /></button>
        <h1 className="font-black text-xl">Shop Monitor</h1>
        <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Online</div>
      </header>
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <TrendingUp size={24} className="text-yellow-500 mb-2" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Total Orders</p>
          <p className="text-2xl font-black">{orders.length}</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <CheckCircle size={24} className="text-green-500 mb-2" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Revenue</p>
          <p className="text-2xl font-black">₹{orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0)}</p>
        </div>
      </div>
      <div className="px-6 space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.id}</span>
                <h3 className="font-bold">{order.type === 'product' ? 'Stationery Order' : `Service: ${order.serviceDetails?.type}`}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{order.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-black">₹{order.total}</span>
              {order.status !== 'completed' && (
                <button 
                  onClick={() => setOrders(prev => prev.map(o => o.id === order.id ? {...o, status: 'completed'} : o))}
                  className="bg-gray-900 text-white px-5 py-2 rounded-xl font-bold text-xs"
                >
                  Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      {view === 'admin' ? <AdminView /> : view === 'account' ? (
        <div className="p-6">
           <button onClick={() => setView('home')} className="bg-gray-100 p-3 rounded-2xl mb-6"><ChevronRight size={20} className="rotate-180" /></button>
           <h1 className="text-2xl font-black mb-6">Recent Activity</h1>
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
             {orders.length === 0 && <p className="text-center text-gray-400 py-10">No orders yet!</p>}
           </div>
        </div>
      ) : <HomeView />}

      {/* Nav */}
      <nav className="fixed bottom-6 left-6 right-6 z-[60] flex items-center justify-between px-8 py-4 glass rounded-[2rem] shadow-2xl shadow-yellow-100 max-w-sm mx-auto">
        <button onClick={() => setView('home')} className={`p-2 transition-all ${view === 'home' ? 'text-yellow-500 scale-110' : 'text-gray-300'}`}><TrendingUp size={24} /></button>
        <button onClick={() => setShowServiceModal(true)} className="p-2 text-gray-300"><ClipboardList size={24} /></button>
        <div className="relative">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-gray-900 text-white p-5 rounded-full -mt-12 floating-cart active:scale-90 transition-all"
          >
            <ShoppingCart size={28} />
          </button>
          {cart.length > 0 && <div className="absolute -top-10 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</div>}
        </div>
        <button onClick={() => setView('account')} className={`p-2 transition-all ${view === 'account' ? 'text-yellow-500 scale-110' : 'text-gray-300'}`}><User size={24} /></button>
        <button onClick={() => setShowPinModal(true)} className="p-2 text-gray-300"><Settings size={24} /></button>
      </nav>

      {/* Modals */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[2.5rem] p-8 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Shopping Bag</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <SearchSlash size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">Your bag is empty!</p>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-8">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img src={item.image} className="w-16 h-16 rounded-2xl object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{lang === 'en' ? item.name : item.nameHindi}</h4>
                        <p className="text-xs text-gray-400">₹{item.price} each</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span className="text-xs font-black">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-6 mb-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-gray-400">Total Bill</span>
                    <span className="text-2xl font-black">₹{cartTotal}</span>
                  </div>
                  <button onClick={() => placeOrder('product')} className="w-full bg-yellow-400 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-yellow-100 active:scale-95 transition-all">Order via WhatsApp</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showServiceModal && <ServiceModal onClose={() => setShowServiceModal(false)} lang={lang} onSubmit={(data) => placeOrder('service', data)} />}
      {showPinModal && <AdminPinModal onClose={() => setShowPinModal(false)} onSuccess={() => { setView('admin'); setShowPinModal(false); }} />}
    </div>
  );
}

