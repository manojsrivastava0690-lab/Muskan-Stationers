
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, User, Package, Settings, X, ChevronRight, 
  Plus, Minus, TrendingUp, ShoppingBag, CreditCard, Banknote, 
  ArrowRight, LogOut, Clock, CheckCircle, Truck, Info, SearchSlash,
  ShieldCheck, LayoutDashboard, MapPin, Home, Briefcase, PlusCircle
} from 'lucide-react';
import { Product, CartItem, Language, Order, PaymentMethod, OrderStatus, Address } from './types';
import { 
  PRODUCTS, CATEGORIES, TRANSLATIONS, 
  SHOP_WHATSAPP 
} from './constants';

const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_HERE"; 
const ADMIN_PHONE = "9794725337";

const OFFERS = [
  { id: 1, title: "Super Student Sale!", subtitle: "Up to 30% Off on Registers", image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&auto=format&fit=crop" },
  { id: 2, title: "Art Supplies Pack", subtitle: "Buy 1 Get 1 Free on Colors", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop" },
  { id: 3, title: "Muskan Delivery", subtitle: "Express 30-min Delivery Gonda", image: "https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=800&auto=format&fit=crop" }
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'home' | 'admin' | 'account' | 'login'>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [currentOffer, setCurrentOffer] = useState(0);
  const [userPhone, setUserPhone] = useState<string>(localStorage.getItem('muskan_user_phone') || '');
  const [loginInput, setLoginInput] = useState('');

  // Address State
  const [addresses, setAddresses] = useState<Address[]>(JSON.parse(localStorage.getItem('muskan_addresses') || '[]'));
  const [selectedAddressId, setSelectedAddressId] = useState<string>(localStorage.getItem('muskan_selected_address_id') || '');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', fullAddress: '', landmark: '' });

  const isAdmin = userPhone === ADMIN_PHONE;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer(prev => (prev + 1) % OFFERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('muskan_orders_v4');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('muskan_orders_v4', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('muskan_addresses', JSON.stringify(addresses));
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('muskan_selected_address_id', selectedAddressId);
  }, [selectedAddressId]);

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

  const handleLogin = () => {
    if (loginInput.length === 10) {
      setUserPhone(loginInput);
      localStorage.setItem('muskan_user_phone', loginInput);
      if (loginInput === ADMIN_PHONE) setView('admin');
      else setView('home');
    } else {
      alert("Invalid Phone Number!");
    }
  };

  const handleLogout = () => {
    if(confirm("Logout from Muskan App?")) {
      setUserPhone('');
      localStorage.removeItem('muskan_user_phone');
      setView('home');
    }
  };

  const saveAddress = () => {
    if (!newAddr.fullAddress || !newAddr.landmark) {
      alert("Please fill full address and landmark!");
      return;
    }
    const id = Date.now().toString();
    const finalAddr: Address = { ...newAddr, id };
    setAddresses([...addresses, finalAddr]);
    setSelectedAddressId(id);
    setIsAddingAddress(false);
    setNewAddr({ label: 'Home', fullAddress: '', landmark: '' });
  };

  const placeOrder = (method: PaymentMethod) => {
    if (!userPhone) {
      setView('login');
      setIsCartOpen(false);
      return;
    }

    const currentAddr = addresses.find(a => a.id === selectedAddressId);
    if (!currentAddr) {
      setIsAddingAddress(true);
      return;
    }

    const finalize = (pid?: string) => {
      const newOrder: Order = {
        id: `MS-${Math.floor(100000 + Math.random() * 900000)}`,
        customerPhone: userPhone,
        items: [...cart],
        total: cartTotal,
        deliveryAddress: currentAddr,
        status: 'Pending',
        date: new Date().toISOString(),
        type: 'product',
        paymentMethod: method,
        paymentId: pid
      };

      setOrders([newOrder, ...orders]);
      
      let msg = `*NEW ORDER: ${newOrder.id}*\nPhone: ${userPhone}\nTotal: ₹${newOrder.total}\nPayment: ${method.toUpperCase()}\n\nAddress: ${currentAddr.fullAddress}\nLandmark: ${currentAddr.landmark}\n\nItems:\n`;
      cart.forEach(it => msg += `- ${it.name} x${it.quantity}\n`);
      window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
      
      setCart([]);
      setIsCartOpen(false);
      setView('account');
    };

    if (method === 'online') {
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: cartTotal * 100,
        currency: "INR",
        name: "Muskan Stationers",
        handler: (r: any) => finalize(r.razorpay_payment_id),
        prefill: { contact: userPhone },
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

  const userOrders = orders.filter(o => o.customerPhone === userPhone);

  return (
    <div className="max-w-md mx-auto relative min-h-screen bg-[#fcfcfc] text-[#1a1a1a]">
      {/* View: Login */}
      {view === 'login' && (
        <div className="p-10 flex flex-col justify-center min-h-[90vh] animate-scale-in">
           <div className="bg-yellow-400 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl shadow-yellow-200">
             <ShoppingBag className="text-white" size={40} />
           </div>
           <h1 className="text-4xl font-black mb-3 tracking-tighter">Welcome Back</h1>
           <p className="text-gray-500 mb-12 font-medium text-lg leading-relaxed">Enter your registered mobile number to access your account.</p>
           <div className="space-y-6">
             <div className="relative group">
               <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg transition-colors group-focus-within:text-yellow-500">+91</span>
               <input 
                 type="tel" 
                 maxLength={10}
                 placeholder="Mobile Number" 
                 className="w-full bg-gray-100 py-6 pl-16 pr-6 rounded-[2rem] font-black text-lg outline-none border-4 border-transparent focus:border-yellow-400 focus:bg-white transition-all shadow-inner"
                 value={loginInput}
                 onChange={(e) => setLoginInput(e.target.value.replace(/\D/g,''))}
               />
             </div>
             <button onClick={handleLogin} className="w-full bg-yellow-400 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(251,191,36,0.4)] active:scale-95 transition-all">
               Continue <ArrowRight size={24} />
             </button>
             <button onClick={() => setView('home')} className="w-full text-gray-400 font-black py-4">Skip login for now</button>
           </div>
        </div>
      )}

      {/* View: Admin Panel */}
      {view === 'admin' && (
        <div className="p-6 pb-40 animate-slide-up">
           <div className="flex items-center justify-between mb-10 sticky top-0 py-4 glass -mx-6 px-6 z-20">
             <div className="flex items-center gap-3">
                <div className="bg-black text-white p-2.5 rounded-2xl"><ShieldCheck size={24}/></div>
                <div>
                   <h1 className="text-xl font-black tracking-tight">Admin Console</h1>
                   <p className="text-[10px] font-black text-gray-400 uppercase">Manage Orders</p>
                </div>
             </div>
             <button onClick={handleLogout} className="bg-red-50 p-3 rounded-2xl text-red-500"><LogOut size={20}/></button>
           </div>

           <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-20 text-gray-300 font-bold bg-white rounded-[2rem] border-2 border-dashed">No orders found</div>
              ) : orders.map(o => (
                <div key={o.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-sm space-y-5">
                   <div className="flex justify-between items-start">
                     <div>
                        <p className="font-black text-sm tracking-widest text-yellow-600">{o.id}</p>
                        <p className="text-[10px] font-bold text-gray-400">Cust: {o.customerPhone}</p>
                     </div>
                     <select 
                       value={o.status} 
                       onChange={(e) => setOrders(orders.map(item => item.id === o.id ? {...item, status: e.target.value as any} : item))}
                       className="text-[10px] font-black uppercase bg-gray-50 px-3 py-2 rounded-xl"
                     >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Out for Delivery</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                     </select>
                   </div>
                   
                   <div className="bg-yellow-50/50 p-4 rounded-3xl border border-yellow-100/50">
                      <div className="flex items-center gap-2 mb-1">
                         <MapPin size={12} className="text-yellow-600"/>
                         <span className="text-[10px] font-black uppercase text-yellow-700">Delivery Address</span>
                      </div>
                      <p className="text-xs font-bold leading-snug">{o.deliveryAddress.fullAddress}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">Landmark: {o.deliveryAddress.landmark}</p>
                   </div>

                   <div className="bg-gray-50/70 rounded-3xl p-4 space-y-2">
                      {o.items?.map(it => (
                        <div key={it.id} className="flex justify-between items-center text-xs font-bold text-gray-600">
                          <span>{it.name}</span>
                          <span className="text-gray-400">x{it.quantity}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <p className="font-black text-2xl tracking-tighter">₹{o.total}</p>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${o.paymentMethod === 'online' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {o.paymentMethod.toUpperCase()}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* View: Account (Customer) */}
      {view === 'account' && (
        <div className="p-6 pb-40 animate-slide-up">
           <div className="flex items-center justify-between mb-8 sticky top-0 py-4 glass -mx-6 px-6 z-20">
             <button onClick={() => setView('home')} className="bg-gray-100 p-3.5 rounded-2xl"><ChevronRight size={20} className="rotate-180" /></button>
             <h1 className="text-xl font-black">Account & Orders</h1>
             <button onClick={handleLogout} className="bg-red-50 p-3.5 rounded-2xl text-red-500"><LogOut size={20}/></button>
           </div>
           
           <div className="space-y-8">
              {/* Address Section */}
              <div className="px-2">
                 <div className="flex justify-between items-center mb-5">
                    <h3 className="font-black text-lg">My Addresses</h3>
                    <button onClick={() => setIsAddingAddress(true)} className="text-yellow-600 font-black text-xs uppercase flex items-center gap-1"><PlusCircle size={14}/> Add New</button>
                 </div>
                 <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                    {addresses.map(a => (
                       <div key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`flex-shrink-0 w-48 p-5 rounded-[2rem] border-2 transition-all ${selectedAddressId === a.id ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-100' : 'border-gray-100 bg-white'}`}>
                          <div className="flex items-center gap-2 mb-2">
                             {a.label === 'Home' ? <Home size={14}/> : <Briefcase size={14}/>}
                             <span className="text-[10px] font-black uppercase tracking-widest">{a.label}</span>
                          </div>
                          <p className="text-xs font-bold line-clamp-2 text-gray-500">{a.fullAddress}</p>
                       </div>
                    ))}
                    {addresses.length === 0 && <p className="text-gray-400 text-xs font-bold px-2">No addresses saved yet</p>}
                 </div>
              </div>

              {/* Orders Section */}
              <div className="px-2">
                 <h3 className="font-black text-lg mb-5">Recent Orders</h3>
                 <div className="space-y-6">
                    {userOrders.map(o => (
                      <div key={o.id} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-1.5 bg-yellow-400" style={{ width: o.status === 'Completed' ? '100%' : o.status === 'Out for Delivery' ? '75%' : o.status === 'Processing' ? '50%' : '25%' }} />
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{o.id}</span>
                            <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-tighter">{new Date(o.date).toDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-full">
                            <span className="text-[10px] font-black uppercase tracking-wider">{o.status}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                           <p className="font-black text-3xl tracking-tight">₹{o.total}</p>
                           <button className="bg-gray-900 text-white text-[10px] font-black px-6 py-3 rounded-2xl shadow-xl shadow-gray-200">TRACK</button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* View: Home */}
      {view === 'home' && (
        <div className="pb-40 animate-scale-in">
          <header className="glass sticky top-0 z-50 px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 p-3 rounded-2xl shadow-xl shadow-yellow-200"><ShoppingBag className="text-white" size={24} /></div>
                <div>
                  <h1 className="font-black text-2xl tracking-tighter leading-none">Muskan</h1>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5">Gonda City Express</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="bg-gray-50 border-2 border-gray-100 text-[10px] font-black px-5 py-3 rounded-2xl uppercase">{lang === 'en' ? 'हिन्दी' : 'EN'}</button>
                <div onClick={() => setView('account')} className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center border-2 border-white shadow-lg active:scale-90 transition-all"><User size={22} className="text-yellow-600 font-bold"/></div>
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input type="text" placeholder="Search school bags, pens..." className="w-full bg-gray-100/60 rounded-[1.75rem] py-5 pl-14 pr-6 outline-none border-4 border-transparent focus:border-yellow-400 focus:bg-white transition-all font-bold text-base shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </header>

          <div className="px-6 mt-6">
            <div className="relative h-56 rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200">
               {OFFERS.map((off, i) => (
                 <div key={off.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentOffer ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-16 scale-105 pointer-events-none'}`}>
                    <img src={off.image} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center px-10 text-white">
                       <h2 className="text-3xl font-black leading-none drop-shadow-lg tracking-tighter">{off.title}</h2>
                       <p className="text-sm font-bold opacity-90 mt-2 max-w-[200px] leading-snug">{off.subtitle}</p>
                       <button className="mt-6 bg-yellow-400 text-black text-[11px] font-black px-8 py-3 rounded-full w-fit shadow-xl shadow-yellow-400/30 active:scale-90 transition-all uppercase tracking-widest">Buy Now</button>
                    </div>
                 </div>
               ))}
               <div className="absolute bottom-6 left-10 flex gap-2.5">
                  {OFFERS.map((_, i) => (
                    <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === currentOffer ? 'w-10 bg-yellow-400' : 'w-2 bg-white/40'}`} />
                  ))}
               </div>
            </div>
          </div>

          <div className="px-6 py-12">
             <div className="flex gap-6 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-6">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-3 group">
                    <div className={`w-20 h-20 rounded-[2.25rem] flex items-center justify-center text-3xl transition-all duration-300 ${activeCategory === cat.id ? 'bg-yellow-400 text-white scale-110 shadow-2xl shadow-yellow-200' : 'bg-gray-100 text-gray-400'}`}>
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeCategory === cat.id ? 'text-black' : 'text-gray-400'}`}>{lang === 'en' ? cat.label : cat.labelHindi}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="px-6 grid grid-cols-2 gap-7">
            {filteredProducts.map(p => (
              <div key={p.id} className="product-card bg-white rounded-[2.75rem] p-5 border-2 border-gray-50 shadow-xl shadow-gray-50/50 flex flex-col">
                <div className="relative mb-6 overflow-hidden rounded-[2rem]">
                  <img src={p.image} className="w-full aspect-[4/5] object-cover transition-transform duration-700 hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-white/50"><Info size={16} className="text-gray-400"/></div>
                </div>
                <h3 className="font-black text-base line-clamp-1 px-1 tracking-tight">{lang === 'en' ? p.name : p.nameHindi}</h3>
                <div className="flex justify-between items-center mt-5 px-1 pb-1">
                  <span className="font-black text-2xl tracking-tighter">₹{p.price}</span>
                  <button onClick={() => handleAddToCart(p)} className="bg-gray-900 text-white w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-gray-300 active:scale-90 active:bg-yellow-400 transition-all"><Plus size={24} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-8 right-8 z-[60] flex items-center justify-between px-8 py-5 glass rounded-[2.75rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] max-w-sm mx-auto border-2 border-white/60 floating-nav">
        <button onClick={() => setView('home')} className={`p-3 transition-all rounded-2xl ${view === 'home' ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-100' : 'text-gray-300'}`}><TrendingUp size={28} /></button>
        <button onClick={() => setView('account')} className={`p-3 transition-all rounded-2xl ${view === 'account' ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-100' : 'text-gray-300'}`}><Package size={28} /></button>
        <div className="relative">
          <button onClick={() => setIsCartOpen(true)} className="bg-gray-900 text-white p-7 rounded-[2.25rem] -mt-16 shadow-2xl shadow-gray-400 relative active:scale-95 transition-all border-[6px] border-[#fcfcfc]">
            <ShoppingCart size={28} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] w-7 h-7 rounded-full border-4 border-white flex items-center justify-center font-black">{cart.length}</span>}
          </button>
        </div>
        <button onClick={() => setView('account')} className={`p-3 transition-all rounded-2xl ${view === 'account' ? 'bg-yellow-400 text-white shadow-xl shadow-yellow-100' : 'text-gray-300'}`}><User size={28} /></button>
        {isAdmin && <button onClick={() => setView('admin')} className={`p-3 transition-all rounded-2xl ${view === 'admin' ? 'bg-black text-white shadow-xl shadow-black/20' : 'text-gray-300'}`}><LayoutDashboard size={28} /></button>}
      </nav>

      {/* Add/Edit Address Modal */}
      {isAddingAddress && (
         <div className="fixed inset-0 bg-black/70 z-[110] flex items-end">
            <div className="bg-white w-full rounded-t-[4rem] p-10 animate-slide-up pb-24">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black tracking-tight">Delivery Address</h2>
                  <button onClick={() => setIsAddingAddress(false)} className="bg-gray-100 p-4 rounded-full"><X size={20}/></button>
               </div>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     {['Home', 'Office', 'Other'].map(l => (
                        <button key={l} onClick={() => setNewAddr({...newAddr, label: l})} className={`px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest border-2 transition-all ${newAddr.label === l ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-gray-100 text-gray-400'}`}>{l}</button>
                     ))}
                  </div>
                  <input type="text" placeholder="Full Address (House No, Area, Gonda City)" className="w-full bg-gray-100 py-6 px-8 rounded-3xl font-black text-lg outline-none border-4 border-transparent focus:border-yellow-400 transition-all shadow-inner" value={newAddr.fullAddress} onChange={(e) => setNewAddr({...newAddr, fullAddress: e.target.value})} />
                  <input type="text" placeholder="Nearby Landmark (Eg. Near Post Office)" className="w-full bg-gray-100 py-6 px-8 rounded-3xl font-black text-lg outline-none border-4 border-transparent focus:border-yellow-400 transition-all shadow-inner" value={newAddr.landmark} onChange={(e) => setNewAddr({...newAddr, landmark: e.target.value})} />
                  <button onClick={saveAddress} className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl shadow-2xl active:scale-95 transition-all">Save & Continue</button>
               </div>
            </div>
         </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[4rem] p-10 animate-slide-up max-h-[96vh] overflow-y-auto pb-32">
            <div className="flex justify-between items-center mb-10 sticky top-0 bg-white py-2 z-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Your Bag</h2>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Free Delivery in Gonda</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-5 rounded-full shadow-sm"><X size={24} /></button>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-28">
                 <SearchSlash className="text-gray-200 mx-auto mb-6" size={64}/>
                 <p className="font-black text-gray-400 text-2xl tracking-tight">Your bag is empty!</p>
              </div>
            ) : (
              <div className="space-y-10 mb-14">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <img src={item.image} className="w-24 h-24 rounded-[2.25rem] object-cover shadow-lg border-2 border-gray-50" />
                    <div className="flex-1">
                      <p className="font-black text-lg leading-tight tracking-tight">{item.name}</p>
                      <p className="text-sm font-black text-yellow-600 mt-1.5 bg-yellow-50 w-fit px-3 py-1 rounded-full">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-5 bg-gray-100 p-3 rounded-[1.75rem]">
                       <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400"><Minus size={18}/></button>
                       <span className="font-black text-xl">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-900"><Plus size={18}/></button>
                    </div>
                  </div>
                ))}

                {/* Address Selection in Cart */}
                <div className="pt-6">
                   <div className="flex justify-between items-center mb-4 px-1">
                      <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Deliver to</h3>
                      <button onClick={() => setIsAddingAddress(true)} className="text-yellow-600 font-black text-[10px] uppercase">New Address</button>
                   </div>
                   {addresses.length > 0 ? (
                      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                         {addresses.map(a => (
                            <div key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`flex-shrink-0 w-64 p-6 rounded-[2.5rem] border-4 transition-all ${selectedAddressId === a.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-50 bg-white'}`}>
                               <p className="font-black text-xs uppercase mb-1">{a.label}</p>
                               <p className="text-xs font-bold text-gray-500 line-clamp-1">{a.fullAddress}</p>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <button onClick={() => setIsAddingAddress(true)} className="w-full bg-gray-50 border-2 border-dashed border-gray-200 py-6 rounded-[2rem] font-black text-sm text-gray-400 flex items-center justify-center gap-2"><MapPin size={16}/> Click to add delivery address</button>
                   )}
                </div>

                <div className="border-t-2 border-gray-50 pt-12 space-y-10">
                  <div className="grid grid-cols-2 gap-6">
                    <button onClick={() => setPaymentMethod('cod')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50 shadow-2xl shadow-yellow-100' : 'border-gray-50'}`}>
                      <Banknote size={32} className={paymentMethod === 'cod' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Cash</span>
                    </button>
                    <button onClick={() => setPaymentMethod('online')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'online' ? 'border-yellow-400 bg-yellow-50 shadow-2xl shadow-yellow-100' : 'border-gray-50'}`}>
                      <CreditCard size={32} className={paymentMethod === 'online' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className="text-[11px] font-black uppercase tracking-widest">Online</span>
                    </button>
                  </div>

                  <div className="bg-gray-900 p-8 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
                     <div>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Bill</span>
                       <p className="text-4xl font-black mt-1 tracking-tighter">₹{cartTotal}</p>
                     </div>
                     <button onClick={() => placeOrder(paymentMethod)} className="bg-yellow-400 text-black p-5 rounded-[1.75rem] font-black shadow-xl active:scale-90 transition-all"><ArrowRight size={32} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
