
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShoppingCart, Search, MapPin, Phone, MessageSquare, 
  User, Package, Settings, X, ChevronRight, Plus, Minus, 
  CheckCircle2, Clock, Truck, ClipboardList, SearchSlash, 
  TrendingUp, CheckCircle, AlertCircle, Lock
} from 'lucide-react';
import { Product, CartItem, Language, ServiceRequest, Order } from './types';
import { 
  PRODUCTS, CATEGORIES, TRANSLATIONS, 
  SHOP_PHONE, SHOP_WHATSAPP, SHOP_MAPS_URL 
} from './constants';

const AdminPinModal: React.FC<{ 
  onClose: () => void; 
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234") {
      onSuccess();
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-6 backdrop-blur-md">
      <div className={`bg-white w-full max-w-xs rounded-[2rem] p-8 shadow-2xl transition-all ${error ? 'animate-shake' : 'animate-scale-in'}`}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="bg-yellow-100 p-5 rounded-full text-yellow-600">
            <Lock size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Admin Portal</h2>
            <p className="text-xs text-gray-400 mt-1 font-medium italic">Enter your secret PIN</p>
          </div>
          <form onSubmit={handleSubmit} className="w-full mt-6 space-y-6">
            <input 
              type="password" 
              autoFocus
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-4xl tracking-[0.5em] py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl outline-none focus:border-yellow-400 transition-all font-black text-yellow-500 shadow-inner"
            />
            {error && <p className="text-red-500 text-[11px] font-black uppercase tracking-widest animate-pulse">Wrong PIN!</p>}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={onClose} className="py-4 text-gray-400 font-black text-sm uppercase tracking-widest">Cancel</button>
              <button type="submit" className="bg-yellow-400 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-yellow-100 active:scale-90 transition-all">Unlock</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ServiceModal: React.FC<{ 
  onClose: () => void; 
  lang: Language; 
  onSubmit: (s: ServiceRequest) => void; 
}> = ({ onClose, lang, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<ServiceRequest>({
    type: 'photocopy',
    color: 'bw',
    paperSize: 'A4',
    pages: 1
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
        <div className="bg-yellow-400 p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{lang === 'en' ? 'Document Service' : 'दस्तावेज़ सेवा'}</h2>
            <p className="text-xs opacity-80">{lang === 'en' ? 'Print, Scan, Lamination' : 'प्रिंट, स्कैन, लेमिनेशन'}</p>
          </div>
          <button onClick={onClose} className="bg-white/20 p-2 rounded-full"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Select Service</label>
              <div className="grid grid-cols-2 gap-3">
                {['photocopy', 'printout', 'lamination', 'scan'].map(type => (
                  <button key={type} onClick={() => setService({...service, type: type as any})} className={`p-4 rounded-2xl border-2 text-xs font-bold capitalize transition-all ${service.type === type ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-100 text-gray-500'}`}>{type}</button>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-yellow-500 text-white py-3 rounded-xl font-bold shadow-lg mt-4">Next Step</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-gray-400">Color</label>
                  <select className="w-full bg-gray-50 p-2 rounded-lg text-sm outline-none border border-gray-100" onChange={(e) => setService({...service, color: e.target.value as any})} value={service.color}>
                    <option value="bw">B&W</option>
                    <option value="color">Color</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-gray-400">Size</label>
                  <select className="w-full bg-gray-50 p-2 rounded-lg text-sm outline-none border border-gray-100" onChange={(e) => setService({...service, paperSize: e.target.value as any})} value={service.paperSize}>
                    <option value="A4">A4</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">Pages / Qty</label>
                <input type="number" min="1" value={service.pages} onChange={(e) => setService({...service, pages: parseInt(e.target.value) || 1})} className="w-full bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 outline-none" />
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                <input type="file" id="file-upload" className="hidden" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Plus className="text-gray-300" />
                  <span className="text-xs font-bold text-gray-400">Upload PDF / Image</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500">Back</button>
                <button onClick={() => onSubmit(service)} className="flex-[2] bg-yellow-500 text-white py-3 rounded-xl font-bold shadow-lg">Confirm Request</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AccountView: React.FC<{ 
  orders: Order[]; 
  lang: Language; 
  onBack: () => void;
  onAdminOpen: () => void;
}> = ({ orders, lang, onBack, onAdminOpen }) => {
  const [trackId, setTrackId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);

  const handleSearch = () => {
    const found = orders.find(o => o.id.toLowerCase() === trackId.toLowerCase());
    setSearchedOrder(found || null);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="text-orange-400" size={16} />;
      case 'processing': return <ClipboardList className="text-blue-400" size={16} />;
      case 'ready': return <Package className="text-yellow-500" size={16} />;
      case 'shipped': return <Truck className="text-purple-500" size={16} />;
      case 'completed': return <CheckCircle2 className="text-green-500" size={16} />;
      default: return <X className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-all"><ChevronRight className="rotate-180" size={18} /></button>
        <h1 className="font-bold text-lg">{lang === 'en' ? 'My Account' : 'मेरा खाता'}</h1>
      </header>
      <main className="p-4 space-y-6">
        <section className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-sm mb-3 uppercase tracking-wider text-gray-400">{lang === 'en' ? 'Track Your Request' : 'अपना अनुरोध ट्रैक करें'}</h2>
          <div className="flex gap-2">
            <input type="text" placeholder="e.g. SRV-1234" className="flex-1 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-sm outline-none focus:border-yellow-400" value={trackId} onChange={(e) => setTrackId(e.target.value)} />
            <button onClick={handleSearch} className="bg-yellow-400 text-white px-4 rounded-xl font-bold shadow-sm active:scale-95"><Search size={18} /></button>
          </div>
          {searchedOrder && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 animate-scale-in">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm">{searchedOrder.id}</h4>
                  <p className="text-[10px] text-gray-400">{new Date(searchedOrder.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border shadow-sm">
                  {getStatusIcon(searchedOrder.status)}
                  <span className="text-[10px] font-bold uppercase text-gray-700">{searchedOrder.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">{searchedOrder.type === 'product' ? `${searchedOrder.items?.length} Items ordered` : `${searchedOrder.serviceDetails?.type} (${searchedOrder.serviceDetails?.pages} pages)`}</p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-3">
                <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: searchedOrder.status === 'completed' ? '100%' : searchedOrder.status === 'pending' ? '20%' : '60%' }} />
              </div>
            </div>
          )}
        </section>
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400">{lang === 'en' ? 'Order History' : 'ऑर्डर इतिहास'}</h2>
            <button onClick={onAdminOpen} className="text-[10px] font-bold text-gray-300 uppercase hover:text-gray-400">Admin Login</button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <SearchSlash className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-xs text-gray-400">No orders found</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${order.type === 'service' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                    {order.type === 'service' ? <Package size={20} /> : <ShoppingCart size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{order.id}</h4>
                    <p className="text-[10px] text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-extrabold text-sm">₹{order.total}</span>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    {getStatusIcon(order.status)}
                    <span className="text-[9px] font-bold uppercase text-gray-500">{order.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

const AdminView: React.FC<{ 
  orders: Order[]; 
  onBack: () => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
}> = ({ orders, onBack, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'ready').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0)
  }), [orders]);

  const displayedOrders = orders.filter(o => activeTab === 'active' ? o.status !== 'completed' : o.status === 'completed');

  const getNextStatus = (current: Order['status']): Order['status'] | null => {
    switch (current) {
      case 'pending': return 'processing';
      case 'processing': return 'ready';
      case 'ready': return 'shipped';
      case 'shipped': return 'completed';
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-all"><ChevronRight className="rotate-180" size={18} /></button>
          <h1 className="font-bold">Muskan PCO Admin</h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Live Monitor</span>
        </div>
      </header>
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <TrendingUp size={20} className="text-yellow-500 mb-2" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">Revenue</p>
          <p className="text-xl font-extrabold">₹{stats.revenue}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
          <AlertCircle size={20} className="text-orange-500 mb-2" />
          <p className="text-[10px] text-gray-400 font-bold uppercase">New Orders</p>
          <p className="text-xl font-extrabold">{stats.pending}</p>
        </div>
      </div>
      <div className="px-4 flex gap-2 mb-4">
        <button onClick={() => setActiveTab('active')} className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${activeTab === 'active' ? 'bg-yellow-400 text-white shadow-lg' : 'bg-white text-gray-400'}`}>Working ({orders.filter(o => o.status !== 'completed').length})</button>
        <button onClick={() => setActiveTab('completed')} className={`flex-1 py-3 rounded-2xl font-bold text-xs transition-all ${activeTab === 'completed' ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-gray-400'}`}>Finished ({orders.filter(o => o.status === 'completed').length})</button>
      </div>
      <main className="px-4 space-y-4">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Package size={40} className="mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No orders here!</p>
          </div>
        ) : (
          displayedOrders.map(order => {
            const next = getNextStatus(order.status);
            return (
              <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.id}</span>
                    <h3 className="font-bold text-lg">{order.type === 'service' ? `Service: ${order.serviceDetails?.type}` : 'Stationery Order'}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{order.status}</span>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="font-extrabold text-lg">₹{order.total}</span>
                  {next && <button onClick={() => onUpdateStatus(order.id, next)} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs">Mark as {next}</button>}
                </div>
              </div>
            );
          })
        )}
      </main>
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

  const handleUpdateOrderStatus = (id: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const handlePlaceOrder = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      items: [...cart],
      total,
      address: 'Near Gandhi Vidyalaya, Gonda',
      phone: SHOP_PHONE,
      status: 'pending',
      date: new Date().toISOString(),
      type: 'product'
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setIsCartOpen(false);
    setView('account');
    alert(lang === 'en' ? 'Order Placed!' : 'ऑर्डर दे दिया गया!');
  };

  const handleServiceSubmit = (service: ServiceRequest) => {
    const newOrder: Order = {
      id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceDetails: service,
      total: service.pages * (service.color === 'color' ? 10 : 2),
      address: 'Near Gandhi Vidyalaya, Gonda',
      phone: SHOP_PHONE,
      status: 'pending',
      date: new Date().toISOString(),
      type: 'service'
    };
    setOrders([newOrder, ...orders]);
    setShowServiceModal(false);
    setView('account');
    alert(lang === 'en' ? 'Service Submitted!' : 'सेवा सबमिट हो गई!');
  };

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory !== 'All' && activeCategory !== 'Services') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameHindi.includes(searchQuery));
    return list;
  }, [activeCategory, searchQuery]);

  if (view === 'admin') return <AdminView orders={orders} onBack={() => setView('home')} onUpdateStatus={handleUpdateOrderStatus} />;
  if (view === 'account') return <AccountView orders={orders} lang={lang} onBack={() => setView('home')} onAdminOpen={() => setShowPinModal(true)} />;

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white sticky top-0 z-40 shadow-sm px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-2 rounded-lg"><Package className="text-white w-5 h-5" /></div>
            <div>
              <h1 className="font-bold text-lg leading-tight">{t.title}</h1>
              <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><MapPin size={10} className="text-red-500" /> {t.deliveryOnly}</p>
            </div>
          </div>
          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="bg-gray-100 text-xs font-bold px-3 py-1.5 rounded-full border">{lang === 'en' ? 'हिंदी' : 'English'}</button>
        </div>
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-xl px-4 py-2.5 gap-3 border border-gray-100 focus-within:border-yellow-400 focus-within:bg-white transition-all">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder={lang === 'en' ? "Search..." : "खोजें..."} className="bg-transparent w-full outline-none text-sm font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </header>

      {showPinModal && <AdminPinModal onClose={() => setShowPinModal(false)} onSuccess={() => { setShowPinModal(false); setView('admin'); }} />}

      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold mb-1">{t.subtitle}</h2>
            <p className="text-sm opacity-90 mb-4">{lang === 'en' ? 'Delivery in Gonda city' : 'गोंडा शहर में डिलीवरी'}</p>
          </div>
        </div>
      </div>

      <section className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.slice(0, 6).map(cat => (
            <button key={cat.id} onClick={() => cat.id === 'Services' ? setShowServiceModal(true) : setActiveCategory(cat.id)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${activeCategory === cat.id ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}>
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-xl">{cat.icon}</div>
              <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{lang === 'en' ? cat.label : cat.labelHindi}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 grid grid-cols-2 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col">
            <div className="aspect-square rounded-xl bg-gray-50 mb-3 overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-bold text-sm mb-1">{lang === 'en' ? p.name : p.nameHindi}</h4>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-extrabold">₹{p.price}</span>
              <button onClick={() => handleAddToCart(p)} className="bg-yellow-400 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Add</button>
            </div>
          </div>
        ))}
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-3 flex items-center justify-between z-50">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view === 'home' ? 'text-yellow-500' : 'text-gray-400'}`}>
          <ChevronRight className="rotate-[-90deg]" size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </button>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-yellow-400 p-4 rounded-full -mt-12 shadow-xl border-4 border-white transition-transform active:scale-95">
          <ShoppingCart className="text-white" size={24} />
          {cart.length > 0 && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cart.length}</div>}
        </button>
        <button onClick={() => setView('account')} className={`flex flex-col items-center gap-1 ${view === 'account' ? 'text-yellow-500' : 'text-gray-400'}`}>
          <User size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Account</span>
        </button>
      </div>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{t.checkout}</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-2 rounded-full"><X size={18} /></button>
            </div>
            {cart.map(item => (
              <div key={item.id} className="flex items-center justify-between mb-4">
                <span>{lang === 'en' ? item.name : item.nameHindi} (x{item.quantity})</span>
                <span className="font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <button onClick={handlePlaceOrder} className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-bold mt-4">Place Order via WhatsApp</button>
          </div>
        </div>
      )}

      {showServiceModal && <ServiceModal onClose={() => setShowServiceModal(false)} lang={lang} onSubmit={handleServiceSubmit} />}
    </div>
  );
}
