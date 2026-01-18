
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
  { id: 1, title: "Super Student Sale", subtitle: "Up to 30% Off on Registers", image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&auto=format&fit=crop" },
  { id: 2, title: "Art Supplies Pack", subtitle: "B1G1 on Water Colors", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop" },
  { id: 3, title: "Express Delivery", subtitle: "30-min Delivery in Gonda", image: "https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=800&auto=format&fit=crop" }
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
    const saved = localStorage.getItem('muskan_orders_v5');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('muskan_orders_v5', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('muskan_addresses', JSON.stringify(addresses));
    if (addresses.length > 0 && !selectedAddressId) setSelectedAddressId(addresses[0].id);
  }, [addresses]);

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
      alert("Please enter a valid 10-digit number");
    }
  };

  const handleLogout = () => {
    if(confirm("Logout from Muskan?")) {
      setUserPhone('');
      localStorage.removeItem('muskan_user_phone');
      setView('home');
    }
  };

  const saveAddress = () => {
    if (!newAddr.fullAddress || !newAddr.landmark) {
      alert("Fill address and landmark!");
      return;
    }
    const id = Date.now().toString();
    setAddresses([...addresses, { ...newAddr, id }]);
    setSelectedAddressId(id);
    setIsAddingAddress(false);
    setNewAddr({ label: 'Home', fullAddress: '', landmark: '' });
  };

  const placeOrder = (method: PaymentMethod) => {
    if (!userPhone) { setView('login'); setIsCartOpen(false); return; }
    const currentAddr = addresses.find(a => a.id === selectedAddressId);
    if (!currentAddr) { setIsAddingAddress(true); return; }

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
      let msg = `*NEW ORDER: ${newOrder.id}*\nTotal: ₹${newOrder.total}\nPayment: ${method}\nAddress: ${currentAddr.fullAddress}`;
      window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
      setCart([]); setIsCartOpen(false); setView('account');
    };

    if (method === 'online') {
      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID, amount: cartTotal * 100, currency: "INR", name: "Muskan",
        handler: (r: any) => finalize(r.razorpay_payment_id), prefill: { contact: userPhone },
        theme: { color: "#fbbf24" }
      });
      rzp.open();
    } else finalize();
  };

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS;
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-md mx-auto relative min-h-screen bg-white text-gray-900 selection:bg-yellow-100">
      
      {/* Login Screen */}
      {view === 'login' && (
        <div className="p-8 flex flex-col justify-center min-h-screen animate-scale-in">
           <div className="bg-yellow-400 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-yellow-100">
             <ShoppingBag className="text-white" size={32} />
           </div>
           <h1 className="text-2xl font-bold mb-2 tracking-tight">Login to Account</h1>
           <p className="text-gray-500 mb-10 text-sm font-medium">Manage your orders and saved addresses.</p>
           <div className="space-y-4">
             <div className="relative">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">+91</span>
               <input 
                 type="tel" maxLength={10} placeholder="10 Digit Number" 
                 className="w-full bg-gray-50 py-4 pl-14 pr-5 rounded-xl font-bold text-sm outline-none border-2 border-transparent focus:border-yellow-400 transition-all shadow-inner"
                 value={loginInput} onChange={(e) => setLoginInput(e.target.value.replace(/\D/g,''))}
               />
             </div>
             <button onClick={handleLogin} className="w-full bg-yellow-400 text-white py-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all">Continue</button>
             <button onClick={() => setView('home')} className="w-full text-gray-400 font-bold text-xs">Browse for now</button>
           </div>
        </div>
      )}

      {/* Main Home View */}
      {view === 'home' && (
        <div className="pb-32 animate-scale-in">
          {/* Header */}
          <header className="glass sticky top-0 z-50 px-5 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-yellow-400 p-2 rounded-xl shadow-lg shadow-yellow-100"><ShoppingBag className="text-white" size={20} /></div>
                <div>
                  <h1 className="font-bold text-lg tracking-tight leading-none">Muskan</h1>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gonda City</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')} className="bg-gray-50 border border-gray-100 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase transition-all active:scale-90">{lang === 'en' ? 'हिन्दी' : 'EN'}</button>
                <button onClick={() => setView('account')} className="w-9 h-9 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-white shadow active:scale-90 transition-all">
                  <User size={18} className="text-yellow-600"/>
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="text" placeholder="Search items..." className="w-full bg-gray-100/70 rounded-xl py-3 pl-11 pr-4 outline-none border border-transparent focus:border-yellow-300 transition-all font-semibold text-sm shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </header>

          {/* Offer Slider - Rectangle Style */}
          <div className="px-5 mt-4">
            <div className="relative h-44 rounded-2xl overflow-hidden shadow-xl shadow-gray-100">
               {OFFERS.map((off, i) => (
                 <div key={off.id} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === currentOffer ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                    <img src={off.image} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex flex-col justify-center px-8 text-white">
                       <h2 className="text-xl font-bold leading-tight">{off.title}</h2>
                       <p className="text-xs font-medium opacity-80 mt-1">{off.subtitle}</p>
                       <button className="mt-4 bg-yellow-400 text-black text-[10px] font-bold px-5 py-2 rounded-lg w-fit shadow-lg shadow-yellow-400/20">SHOP NOW</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Categories - Perfect Circle Style */}
          <div className="px-5 py-8">
             <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-2 px-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${activeCategory === cat.id ? 'bg-yellow-400 text-white scale-110 shadow-lg shadow-yellow-100' : 'bg-gray-100 text-gray-400'}`}>
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${activeCategory === cat.id ? 'text-black' : 'text-gray-400'}`}>{lang === 'en' ? cat.label : cat.labelHindi}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Products Grid - Soft Square Style */}
          <div className="px-5 grid grid-cols-2 gap-4">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col">
                <div className="relative mb-3 overflow-hidden rounded-lg">
                  <img src={p.image} className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-bold text-xs line-clamp-1 mb-1">{lang === 'en' ? p.name : p.nameHindi}</h3>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-bold text-sm">₹{p.price}</span>
                  <button onClick={() => handleAddToCart(p)} className="bg-gray-900 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg active:scale-90 active:bg-yellow-400 transition-all"><Plus size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Panel - Clean Dashboard */}
      {view === 'admin' && (
        <div className="p-5 pb-32 animate-slide-up">
           <div className="flex items-center justify-between mb-8 sticky top-0 py-3 glass -mx-5 px-5 z-20">
             <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-yellow-600"/>
                <h1 className="text-lg font-bold">Admin Panel</h1>
             </div>
             <button onClick={handleLogout} className="text-red-500 p-2"><LogOut size={18}/></button>
           </div>
           <div className="space-y-4">
              {orders.map(o => (
                <div key={o.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-gray-400">{o.id}</span>
                     <select 
                       value={o.status} 
                       onChange={(e) => setOrders(orders.map(item => item.id === o.id ? {...item, status: e.target.value as any} : item))}
                       className="text-[10px] font-bold uppercase bg-white px-2 py-1 rounded-md border border-gray-200"
                     >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Completed</option>
                     </select>
                   </div>
                   <div className="text-[11px] font-medium text-gray-600">
                      <p className="font-bold text-black mb-1">📍 {o.deliveryAddress.fullAddress}</p>
                      <p className="opacity-70">📞 {o.customerPhone}</p>
                   </div>
                   <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <p className="font-bold text-lg">₹{o.total}</p>
                      <span className="text-[9px] font-bold bg-white px-2 py-1 rounded-md border">{o.paymentMethod}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Account / Addresses - Card Style */}
      {view === 'account' && (
        <div className="p-5 pb-32 animate-slide-up">
           <header className="flex items-center justify-between mb-8">
              <button onClick={() => setView('home')}><ChevronRight size={24} className="rotate-180"/></button>
              <h2 className="text-lg font-bold">Account</h2>
              <button onClick={handleLogout} className="text-red-500"><LogOut size={20}/></button>
           </header>
           
           <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-sm">Saved Addresses</h3>
                 <button onClick={() => setIsAddingAddress(true)} className="text-yellow-600 text-[10px] font-bold uppercase tracking-wider">+ ADD NEW</button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                 {addresses.map(a => (
                    <div key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`p-4 rounded-xl border-2 transition-all ${selectedAddressId === a.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white'}`}>
                       <div className="flex items-center gap-2 mb-1">
                          {a.label === 'Home' ? <Home size={14}/> : <Briefcase size={14}/>}
                          <span className="text-[10px] font-bold uppercase">{a.label}</span>
                       </div>
                       <p className="text-xs text-gray-500 font-medium">{a.fullAddress}</p>
                    </div>
                 ))}
              </div>
           </div>

           <h3 className="font-bold text-sm mb-4">Order History</h3>
           <div className="space-y-4">
              {orders.filter(o => o.customerPhone === userPhone).map(o => (
                 <div key={o.id} className="bg-white border border-gray-100 p-4 rounded-xl flex justify-between items-center">
                    <div>
                       <p className="text-[10px] font-bold text-gray-400">{o.id}</p>
                       <p className="text-lg font-bold mt-1">₹{o.total}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">{o.status}</span>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Modern Navigation Bar - Small & Compact */}
      <nav className="fixed bottom-6 left-6 right-6 z-[60] flex items-center justify-between px-6 py-4 glass rounded-2xl shadow-2xl border border-white/40 max-w-sm mx-auto floating-nav">
        <button onClick={() => setView('home')} className={`p-2 rounded-lg transition-all ${view === 'home' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><TrendingUp size={22} /></button>
        <button onClick={() => setView('account')} className={`p-2 rounded-lg transition-all ${view === 'account' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><Package size={22} /></button>
        <button onClick={() => setIsCartOpen(true)} className="bg-gray-900 text-white p-4 rounded-2xl -mt-12 shadow-xl border-4 border-white relative active:scale-90 transition-all">
          <ShoppingCart size={22} />
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center font-bold">{cart.length}</span>}
        </button>
        <button onClick={() => setView('account')} className={`p-2 rounded-lg transition-all ${view === 'account' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-100' : 'text-gray-300'}`}><User size={22} /></button>
        {isAdmin && <button onClick={() => setView('admin')} className={`p-2 rounded-lg transition-all ${view === 'admin' ? 'bg-black text-white shadow-lg' : 'text-gray-300'}`}><LayoutDashboard size={22} /></button>}
      </nav>

      {/* Modal: Add Address - Compact */}
      {isAddingAddress && (
         <div className="fixed inset-0 bg-black/60 z-[110] flex items-end">
            <div className="bg-white w-full rounded-t-3xl p-8 animate-slide-up pb-16">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">New Address</h3>
                  <button onClick={() => setIsAddingAddress(false)} className="bg-gray-100 p-2 rounded-full"><X size={18}/></button>
               </div>
               <div className="space-y-4">
                  <div className="flex gap-2">
                     {['Home', 'Office', 'Other'].map(l => (
                        <button key={l} onClick={() => setNewAddr({...newAddr, label: l})} className={`px-5 py-2 rounded-lg font-bold text-[10px] uppercase border transition-all ${newAddr.label === l ? 'bg-yellow-400 border-yellow-400 text-white' : 'border-gray-200 text-gray-400'}`}>{l}</button>
                     ))}
                  </div>
                  <input type="text" placeholder="Full Address" className="w-full bg-gray-50 py-3.5 px-4 rounded-xl text-sm font-semibold outline-none border border-transparent focus:border-yellow-400 transition-all shadow-inner" value={newAddr.fullAddress} onChange={(e) => setNewAddr({...newAddr, fullAddress: e.target.value})} />
                  <input type="text" placeholder="Nearby Landmark" className="w-full bg-gray-50 py-3.5 px-4 rounded-xl text-sm font-semibold outline-none border border-transparent focus:border-yellow-400 transition-all shadow-inner" value={newAddr.landmark} onChange={(e) => setNewAddr({...newAddr, landmark: e.target.value})} />
                  <button onClick={saveAddress} className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm shadow-xl mt-2">Save Address</button>
               </div>
            </div>
         </div>
      )}

      {/* Modal: Cart Checkout - Card Density Fixed */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto pb-32">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white py-2 z-10">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Checkout</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase">Muskan Delivery</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-50 p-3 rounded-full shadow-sm"><X size={20} /></button>
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-bold">Your bag is empty</div>
            ) : (
              <div className="space-y-6 mb-10">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center border-b border-gray-50 pb-4">
                    <img src={item.image} className="w-14 h-14 rounded-lg object-cover shadow border border-gray-50" />
                    <div className="flex-1">
                      <p className="font-bold text-xs tracking-tight">{item.name}</p>
                      <p className="text-[11px] font-bold text-yellow-600 mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
                       <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14}/></button>
                       <span className="font-bold text-xs">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14}/></button>
                    </div>
                  </div>
                ))}

                {/* Address Select */}
                <div className="pt-4">
                   <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ship to</h3>
                   <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                      {addresses.map(a => (
                         <div key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`flex-shrink-0 w-52 p-4 rounded-xl border-2 transition-all ${selectedAddressId === a.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-white'}`}>
                            <p className="font-bold text-[10px] uppercase mb-1">{a.label}</p>
                            <p className="text-[10px] font-medium text-gray-500 line-clamp-1">{a.fullAddress}</p>
                         </div>
                      ))}
                      <button onClick={() => setIsAddingAddress(true)} className="flex-shrink-0 w-52 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-400">+ Add New</button>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPaymentMethod('cod')} className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-gray-50'}`}>
                      <Banknote size={24} className={paymentMethod === 'cod' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className="text-[9px] font-bold uppercase">Cash</span>
                    </button>
                    <button onClick={() => setPaymentMethod('online')} className={`flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all ${paymentMethod === 'online' ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-gray-50'}`}>
                      <CreditCard size={24} className={paymentMethod === 'online' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className="text-[9px] font-bold uppercase">Online</span>
                    </button>
                  </div>

                  <div className="bg-gray-900 p-6 rounded-2xl text-white flex justify-between items-center shadow-xl">
                     <div>
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Bill</span>
                       <p className="text-2xl font-bold mt-0.5 tracking-tighter">₹{cartTotal}</p>
                     </div>
                     <button onClick={() => placeOrder(paymentMethod)} className="bg-yellow-400 text-black p-4 rounded-xl font-bold shadow-lg active:scale-90 transition-all">Place Order</button>
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
