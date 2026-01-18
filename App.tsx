
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, User, Package, Settings, X, ChevronRight, 
  Plus, Minus, TrendingUp, ShoppingBag, CreditCard, Banknote, 
  ArrowRight, LogOut, Clock, CheckCircle, Truck, Info, SearchSlash
} from 'lucide-react';
import { Product, CartItem, Language, Order, PaymentMethod, OrderStatus } from './types';
import { 
  PRODUCTS, CATEGORIES, TRANSLATIONS, 
  SHOP_WHATSAPP 
} from './constants';

const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_HERE"; 

const OFFERS = [
  { id: 1, title: "Super Student Sale!", subtitle: "Up to 30% Off on Registers", color: "bg-blue-600", image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&auto=format&fit=crop" },
  { id: 2, title: "Art Supplies Pack", subtitle: "Buy 1 Get 1 Free on Colors", color: "bg-orange-500", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop" },
  { id: 3, title: "Muskan Delivery", subtitle: "Express 30-min Delivery Gonda", color: "bg-green-600", image: "https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=800&auto=format&fit=crop" }
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

  // Auto Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer(prev => (prev + 1) % OFFERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Load & Save Orders
  useEffect(() => {
    const saved = localStorage.getItem('muskan_orders_database');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('muskan_orders_database', JSON.stringify(orders));
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

  const handleLogin = () => {
    if (loginInput.length === 10) {
      setUserPhone(loginInput);
      localStorage.setItem('muskan_user_phone', loginInput);
      setView('home');
    } else {
      alert("Please enter 10 digit number");
    }
  };

  const handleLogout = () => {
    if(confirm("Logout?")) {
      setUserPhone('');
      localStorage.removeItem('muskan_user_phone');
      setView('home');
    }
  };

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const placeOrder = (method: PaymentMethod) => {
    if (!userPhone) {
      setView('login');
      setIsCartOpen(false);
      return;
    }

    const finalize = (pid?: string) => {
      const newOrder: Order = {
        id: `MS-${Math.floor(100000 + Math.random() * 900000)}`,
        customerPhone: userPhone,
        items: [...cart],
        total: cartTotal,
        address: 'Gonda City Delivery',
        status: 'Pending',
        date: new Date().toISOString(),
        type: 'product',
        paymentMethod: method,
        paymentId: pid
      };

      setOrders([newOrder, ...orders]);
      
      // WhatsApp notification
      let msg = `*NEW ORDER: ${newOrder.id}*\nPhone: ${userPhone}\nTotal: ₹${newOrder.total}\nPayment: ${method.toUpperCase()}\n\nItems:\n`;
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
        <div className="p-8 flex flex-col justify-center min-h-[90vh] animate-scale-in">
           <div className="bg-yellow-400 w-16 h-16 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-yellow-200">
             <ShoppingBag className="text-white" size={32} />
           </div>
           <h1 className="text-3xl font-black mb-2 tracking-tight">Login to Muskan</h1>
           <p className="text-gray-500 mb-10 font-medium">Enter your mobile number to see your orders and track delivery.</p>
           <div className="space-y-4">
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">+91</span>
               <input 
                 type="tel" 
                 maxLength={10}
                 placeholder="Mobile Number" 
                 className="w-full bg-gray-100 py-5 pl-14 pr-4 rounded-[1.75rem] font-bold outline-none border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all shadow-inner"
                 value={loginInput}
                 onChange={(e) => setLoginInput(e.target.value.replace(/\D/g,''))}
               />
             </div>
             <button onClick={handleLogin} className="w-full bg-yellow-400 text-white py-5 rounded-[1.75rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-yellow-100 active:scale-95 transition-all">
               Continue <ArrowRight size={20} />
             </button>
             <button onClick={() => setView('home')} className="w-full text-gray-400 font-bold py-2 mt-2">Browse without login</button>
           </div>
        </div>
      )}

      {/* View: Admin */}
      {view === 'admin' && (
        <div className="p-6 pb-32 animate-slide-up">
           <div className="flex items-center justify-between mb-8 sticky top-0 py-2 glass -mx-6 px-6 z-10">
             <button onClick={() => setView('home')} className="bg-gray-100 p-3 rounded-2xl"><ChevronRight size={20} className="rotate-180" /></button>
             <h1 className="text-xl font-black">Orders Manager</h1>
             <div className="w-10" />
           </div>
           
           <div className="space-y-5">
              {orders.length === 0 ? (
                <div className="text-center py-24 text-gray-300 font-bold">No orders found in database</div>
              ) : orders.map(o => (
                <div key={o.id} className="bg-white p-5 rounded-[2.2rem] border-2 border-gray-50 shadow-sm space-y-4">
                   <div className="flex justify-between items-start">
                     <div>
                       <p className="font-black text-xs text-yellow-600 tracking-widest">{o.id}</p>
                       <p className="text-[10px] font-bold text-gray-400 mt-0.5">Contact: {o.customerPhone}</p>
                     </div>
                     <select 
                       value={o.status} 
                       onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                       className="text-[10px] font-black uppercase bg-gray-50 px-3 py-2 rounded-xl border-none outline-none ring-1 ring-gray-100"
                     >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Out for Delivery</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                     </select>
                   </div>
                   <div className="bg-gray-50/50 rounded-2xl p-4 space-y-2 border border-gray-100/50">
                      {o.items?.map(it => (
                        <div key={it.id} className="flex justify-between items-center text-xs font-bold text-gray-600">
                          <span>{it.name}</span>
                          <span className="text-gray-400">x{it.quantity}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between items-center pt-2">
                      <p className="font-black text-xl">₹{o.total}</p>
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${o.paymentMethod === 'online' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {o.paymentMethod.toUpperCase()}
                      </span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* View: Account (Customer Orders) */}
      {view === 'account' && (
        <div className="p-6 pb-32 animate-slide-up">
           <div className="flex items-center justify-between mb-8 sticky top-0 py-2 glass -mx-6 px-6 z-10">
             <button onClick={() => setView('home')} className="bg-gray-100 p-3 rounded-2xl"><ChevronRight size={20} className="rotate-180" /></button>
             <h1 className="text-xl font-black">My Orders</h1>
             <button onClick={handleLogout} className="bg-red-50 p-3 rounded-2xl text-red-500"><LogOut size={18}/></button>
           </div>
           
           {!userPhone ? (
             <div className="text-center py-24 px-8">
                <div className="bg-gray-50 w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6"><User className="text-gray-300" size={40}/></div>
                <p className="text-gray-500 font-bold mb-8">Please login to track your current and previous orders.</p>
                <button onClick={() => setView('login')} className="w-full bg-yellow-400 text-white py-5 rounded-[1.75rem] font-black shadow-xl shadow-yellow-100">Login Now</button>
             </div>
           ) : (
             <div className="space-y-5">
                {userOrders.length === 0 ? (
                  <div className="text-center py-24 text-gray-300 font-bold">You haven't ordered anything yet</div>
                ) : userOrders.map(o => (
                  <div key={o.id} className="bg-white p-6 rounded-[2.2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1 bg-yellow-400" style={{ width: o.status === 'Completed' ? '100%' : o.status === 'Out for Delivery' ? '75%' : o.status === 'Processing' ? '50%' : '25%' }} />
                    <div className="flex justify-between items-center mb-5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{o.id}</span>
                      <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full">
                        {o.status === 'Completed' ? <CheckCircle size={14}/> : o.status === 'Out for Delivery' ? <Truck size={14}/> : <Clock size={14}/>}
                        <span className="text-[10px] font-black uppercase">{o.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                       <div>
                         <p className="font-black text-2xl mb-1">₹{o.total}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(o.date).toLocaleDateString()} • {new Date(o.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                       <button className="text-white bg-gray-900 text-[10px] font-black px-5 py-2.5 rounded-xl shadow-lg shadow-gray-200">DETAILS</button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}

      {/* View: Home */}
      {view === 'home' && (
        <div className="pb-32">
          {/* Header */}
          <header className="glass sticky top-0 z-50 px-6 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-lg shadow-yellow-100"><ShoppingBag className="text-white" size={20} /></div>
                <div>
                  <h1 className="font-black text-xl tracking-tight leading-none">Muskan</h1>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Gonda City Express</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="bg-gray-50 border text-[10px] font-black px-4 py-2.5 rounded-full uppercase transition-all active:scale-90">{lang === 'en' ? 'हिन्दी' : 'EN'}</button>
                {userPhone ? (
                   <div onClick={() => setView('account')} className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-yellow-400/20 active:scale-95 transition-all"><User size={18} className="text-yellow-600"/></div>
                ) : (
                   <button onClick={() => setView('login')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-400"><User size={18}/></button>
                )}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="text" placeholder="Search school bags, pens..." className="w-full bg-gray-100/50 rounded-2xl py-4.5 pl-12 pr-4 outline-none border-2 border-transparent focus:border-yellow-400 focus:bg-white transition-all font-semibold text-sm shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </header>

          {/* Offer Slider (Auto Rotating Ads) */}
          <div className="px-6 mt-6">
            <div className="relative h-48 rounded-[2.75rem] overflow-hidden shadow-2xl shadow-gray-200">
               {OFFERS.map((off, i) => (
                 <div key={off.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === currentOffer ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-105 pointer-events-none'}`}>
                    <img src={off.image} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-10 text-white">
                       <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 text-yellow-400">Exclusive Deal</span>
                       <h2 className="text-2xl font-black leading-tight drop-shadow-md">{off.title}</h2>
                       <p className="text-sm font-bold opacity-80 mt-1 max-w-[180px]">{off.subtitle}</p>
                       <button className="mt-5 bg-white text-black text-[10px] font-black px-6 py-2.5 rounded-full w-fit shadow-lg shadow-white/20 active:scale-90 transition-all">SHOP NOW</button>
                    </div>
                 </div>
               ))}
               {/* Dot Indicators */}
               <div className="absolute bottom-5 left-10 flex gap-2">
                  {OFFERS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentOffer ? 'w-8 bg-yellow-400 shadow-sm shadow-yellow-200' : 'w-1.5 bg-white/40'}`} />
                  ))}
               </div>
            </div>
          </div>

          {/* Categories */}
          <div className="px-6 py-10">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-xl tracking-tight">Main Categories</h3>
                <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-50 px-3 py-1.5 rounded-full">View All</span>
             </div>
             <div className="flex gap-5 overflow-x-auto hide-scrollbar -mx-2 px-2 pb-4">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className="flex-shrink-0 flex flex-col items-center gap-3 group"
                  >
                    <div className={`w-18 h-18 rounded-[2rem] flex items-center justify-center text-3xl transition-all duration-300 ${activeCategory === cat.id ? 'bg-yellow-400 text-white scale-110 shadow-xl shadow-yellow-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 group-active:scale-90'}`}>
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'text-black font-black' : 'text-gray-400'}`}>{lang === 'en' ? cat.label : cat.labelHindi}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Products Grid */}
          <div className="px-6 grid grid-cols-2 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="product-card bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-md shadow-gray-50 flex flex-col">
                <div className="relative mb-5 group">
                  <img src={p.image} className="w-full aspect-[4/5] rounded-[1.75rem] object-cover shadow-sm group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/50"><Info size={14} className="text-gray-500"/></div>
                </div>
                <h3 className="font-extrabold text-sm line-clamp-1 px-1">{lang === 'en' ? p.name : p.nameHindi}</h3>
                <div className="flex justify-between items-center mt-4 px-1 pb-1">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-gray-400 line-through">₹{Math.round(p.price * 1.2)}</span>
                     <span className="font-black text-xl">₹{p.price}</span>
                  </div>
                  <button onClick={() => handleAddToCart(p)} className="bg-gray-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl shadow-gray-300 active:scale-90 active:bg-yellow-400 transition-all"><Plus size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Bar (Safe Area Padding Included via CSS) */}
      <nav className="fixed bottom-6 left-6 right-6 z-[60] flex items-center justify-between px-8 py-5 glass rounded-[2.5rem] shadow-2xl max-w-sm mx-auto border border-white/40 floating-nav transition-transform duration-300">
        <button onClick={() => setView('home')} className={`p-2.5 transition-all rounded-2xl ${view === 'home' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><TrendingUp size={24} /></button>
        <button onClick={() => setView('account')} className={`p-2.5 transition-all rounded-2xl ${view === 'account' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><Package size={24} /></button>
        <div className="relative">
          <button onClick={() => setIsCartOpen(true)} className="bg-gray-900 text-white p-6 rounded-[2rem] -mt-16 shadow-2xl shadow-gray-500 relative active:scale-90 transition-all border-4 border-[#fcfcfc]">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-black animate-pulse">{cart.length}</span>}
          </button>
        </div>
        <button onClick={() => setView('account')} className={`p-2.5 transition-all rounded-2xl ${view === 'account' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><User size={24} /></button>
        <button onClick={() => setView('admin')} className={`p-2.5 transition-all rounded-2xl ${view === 'admin' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><Settings size={24} /></button>
      </nav>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[3.5rem] p-10 animate-slide-up max-h-[95vh] overflow-y-auto pb-24">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Checkout</h2>
                <p className="text-xs font-bold text-gray-400 mt-1">Review your items before paying</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-4 rounded-full active:scale-90 transition-all"><X size={20} /></button>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-6">
                 <div className="bg-gray-50 w-28 h-28 rounded-full mx-auto flex items-center justify-center shadow-inner"><SearchSlash className="text-gray-200" size={40}/></div>
                 <div>
                   <p className="font-black text-gray-400 text-xl">Bag is empty</p>
                   <p className="text-xs text-gray-300 mt-1">Add some pens or registers to continue</p>
                 </div>
                 <button onClick={() => setIsCartOpen(false)} className="bg-gray-900 text-white px-10 py-4 rounded-full font-black text-sm shadow-xl active:scale-95 transition-all">SHOP NOW</button>
              </div>
            ) : (
              <div className="space-y-8 mb-12">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-5 items-center">
                    <img src={item.image} className="w-20 h-20 rounded-3xl object-cover shadow-sm border border-gray-50" />
                    <div className="flex-1">
                      <p className="font-black text-base leading-tight">{item.name}</p>
                      <p className="text-xs font-black text-yellow-600 mt-1">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center gap-4 bg-gray-100/50 p-2.5 rounded-2xl border border-gray-100">
                       <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 p-1"><Minus size={16}/></button>
                       <span className="font-black text-lg">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-900 p-1"><Plus size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="border-t border-gray-50 pt-10 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-5">Select Payment Mode</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <button onClick={() => setPaymentMethod('cod')} className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 ${paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50 shadow-xl shadow-yellow-100' : 'border-gray-50 hover:border-gray-200'}`}>
                      <Banknote size={24} className={paymentMethod === 'cod' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'cod' ? 'text-yellow-700' : 'text-gray-400'}`}>Cash on Delivery</span>
                    </button>
                    <button onClick={() => setPaymentMethod('online')} className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all duration-300 ${paymentMethod === 'online' ? 'border-yellow-400 bg-yellow-50 shadow-xl shadow-yellow-100' : 'border-gray-50 hover:border-gray-200'}`}>
                      <CreditCard size={24} className={paymentMethod === 'online' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'online' ? 'text-yellow-700' : 'text-gray-400'}`}>Pay Online</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-6 rounded-[2rem] border border-gray-100 shadow-inner">
                   <div>
                     <span className="text-xs font-bold text-gray-400">Total Payable</span>
                     <p className="text-sm font-bold text-green-600">Free City Delivery Included</p>
                   </div>
                   <span className="text-4xl font-black tracking-tight">₹{cartTotal}</span>
                </div>

                <button 
                  onClick={() => placeOrder(paymentMethod)}
                  className="w-full bg-yellow-400 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-yellow-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  Confirm Order <ArrowRight size={22} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

