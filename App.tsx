
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Search, User, Package, X, ChevronRight, 
  Plus, Minus, TrendingUp, ShoppingBag, CreditCard, Banknote, 
  LogOut, Clock, ShieldCheck, LayoutDashboard, Home, Briefcase, PlusCircle,
  Edit2, Trash2, Camera, Layers, ArrowRight, Smartphone, BellRing, Upload, Image as ImageIcon,
  Info, CheckCircle2
} from 'lucide-react';
import { Product, CartItem, Language, Order, PaymentMethod, Address } from './types';
import { 
  PRODUCTS as INITIAL_PRODUCTS, CATEGORIES, 
  SHOP_WHATSAPP 
} from './constants';

const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_HERE"; 
const ADMIN_PHONE = "9616785816";

const OFFERS = [
  { id: 1, title: "Student Special Sale", subtitle: "Up to 30% Off on Registers", image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&auto=format&fit=crop" },
  { id: 2, title: "Art Supplies Pack", subtitle: "B1G1 on Water Colors", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop" },
  { id: 3, title: "Express Delivery", subtitle: "30-min Delivery in Gonda", image: "https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=800&auto=format&fit=crop" }
];

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // App View State
  const [view, setView] = useState<'home' | 'admin' | 'account' | 'login'>(() => {
    return localStorage.getItem('muskan_user_phone') ? 'home' : 'login';
  });

  // Login Logic States
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [smsNotification, setSmsNotification] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [userPhone, setUserPhone] = useState<string>(localStorage.getItem('muskan_user_phone') || '');
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [adminTab, setAdminTab] = useState<'orders' | 'inventory'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [currentOffer, setCurrentOffer] = useState(0);
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('muskan_catalog_v1');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>(JSON.parse(localStorage.getItem('muskan_addresses') || '[]'));
  const [selectedAddressId, setSelectedAddressId] = useState<string>(localStorage.getItem('muskan_selected_address_id') || '');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: 'Home', fullAddress: '', landmark: '' });

  const isAdmin = userPhone === ADMIN_PHONE;

  // Bill Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = Math.round(subtotal * 0.05); // 5% discount
  const deliveryFee = subtotal > 99 ? 0 : 29;
  const grandTotal = subtotal - discount + deliveryFee;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer(prev => (prev + 1) % OFFERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    const saved = localStorage.getItem('muskan_orders_v5');
    if (saved) setOrders(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('muskan_orders_v5', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('muskan_catalog_v1', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('muskan_addresses', JSON.stringify(addresses));
    if (addresses.length > 0 && !selectedAddressId) setSelectedAddressId(addresses[0].id);
  }, [addresses]);

  // LOGIN FLOW
  const handleRequestOtp = () => {
    if (phoneInput.length === 10) {
      setIsLoading(true);
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);
      
      setTimeout(() => {
        setLoginStep('otp');
        setIsLoading(false);
        setResendTimer(60);
        setSmsNotification({ show: true, msg: `SMS FROM MUSKAN: Your verification code is ${newOtp}` });
        setTimeout(() => setSmsNotification({show: false, msg: ''}), 6000);
      }, 1500);
    } else {
      alert("Please enter a valid 10-digit phone number.");
    }
  };

  const handleVerifyOtp = () => {
    if (otpInput === generatedOtp || otpInput === '0000') { 
      setIsLoading(true);
      setTimeout(() => {
        setUserPhone(phoneInput);
        localStorage.setItem('muskan_user_phone', phoneInput);
        setIsLoading(false);
        if (phoneInput === ADMIN_PHONE) setView('admin');
        else setView('home');
      }, 1200);
    } else {
      alert("Invalid verification code. Please try again.");
    }
  };

  const handleLogout = () => {
    if(confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('muskan_user_phone');
      setUserPhone('');
      setPhoneInput('');
      setOtpInput('');
      setLoginStep('phone');
      setCart([]);
      setIsCartOpen(false);
      setView('login');
    }
  };

  // CART & ORDERING
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

  const saveAddress = () => {
    if (!newAddr.fullAddress.trim()) {
      alert("Please provide a full address.");
      return;
    }
    const id = `addr-${Date.now()}`;
    const address: Address = {
      id,
      label: newAddr.label,
      fullAddress: newAddr.fullAddress,
      landmark: newAddr.landmark
    };
    setAddresses([...addresses, address]);
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
        total: grandTotal,
        deliveryAddress: currentAddr,
        status: 'Pending',
        date: new Date().toISOString(),
        type: 'product',
        paymentMethod: method,
        paymentId: pid
      };
      setOrders([newOrder, ...orders]);
      
      let itemsList = cart.map(i => `${i.name} (x${i.quantity})`).join('\n');
      let billBreakdown = `MRP: ₹${subtotal}\nDiscount: -₹${discount}\nDelivery: ${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}\nTotal: ₹${grandTotal}`;
      let msg = `*NEW ORDER FROM MUSKAN*\nOrder ID: ${newOrder.id}\n\n*Items:*\n${itemsList}\n\n*Bill Summary:*\n${billBreakdown}\n\nPayment: ${method.toUpperCase()}\nAddress: ${currentAddr.fullAddress}`;
      
      window.open(`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
      setCart([]); setIsCartOpen(false); setView('account');
    };

    if (method === 'online') {
      const rzp = new (window as any).Razorpay({
        key: RAZORPAY_KEY_ID, amount: grandTotal * 100, currency: "INR", name: "Muskan Store",
        handler: (r: any) => finalize(r.razorpay_payment_id), prefill: { contact: userPhone },
        theme: { color: "#fbbf24" }
      });
      rzp.open();
    } else finalize();
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [activeCategory, searchQuery, products]);

  const goToAccount = () => {
    if (!userPhone) setView('login');
    else setView('account');
  };

  // ADMIN ACTIONS
  const handleSaveProduct = () => {
    if (!editingProduct) return;
    if (products.find(p => p.id === editingProduct.id)) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
    } else {
      setProducts([...products, editingProduct]);
    }
    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Delete this product permanently?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({
          ...editingProduct,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startAddingProduct = () => {
    setEditingProduct({
      id: `p-${Date.now()}`,
      name: '',
      nameHindi: '',
      price: 0,
      category: 'Pens',
      image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=400&h=400&fit=crop',
      description: ''
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-md mx-auto relative min-h-screen bg-white text-gray-900 overflow-x-hidden pb-safe">
      
      {/* Simulated SMS Notification */}
      {smsNotification.show && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-slide-up">
           <div className="bg-black/90 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-4 border border-white/10 backdrop-blur-md">
              <div className="bg-yellow-400 p-2 rounded-lg"><BellRing size={16} className="text-black" /></div>
              <div className="flex-1">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Messages • Just now</p>
                 <p className="text-xs font-semibold mt-0.5">{smsNotification.msg}</p>
              </div>
              <button onClick={() => setSmsNotification({show: false, msg: ''})} className="text-gray-500"><X size={14} /></button>
           </div>
        </div>
      )}

      {/* Login Screen (OTP Flow) */}
      {view === 'login' && (
        <div className="p-8 flex flex-col justify-center min-h-screen animate-scale-in">
           <div className="bg-yellow-400 w-16 h-16 rounded-3xl flex items-center justify-center mb-10 shadow-2xl shadow-yellow-100 rotate-3">
             <Smartphone className="text-white" size={32} />
           </div>
           
           {loginStep === 'phone' ? (
             <div className="space-y-6 animate-scale-in">
               <div>
                 <h1 className="text-3xl font-extrabold tracking-tight">Sign In</h1>
                 <p className="text-gray-500 mt-2 text-sm">Enter your phone number to receive a verification SMS.</p>
               </div>
               <div className="space-y-4">
                 <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm border-r pr-3 border-gray-200">+91</span>
                   <input 
                     type="tel" maxLength={10} placeholder="000 000 0000" 
                     className="w-full bg-gray-50 py-5 pl-16 pr-5 rounded-2xl font-bold text-base outline-none border-2 border-transparent focus:border-yellow-400 transition-all shadow-inner"
                     value={phoneInput} onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g,''))}
                   />
                 </div>
                 <button 
                  onClick={handleRequestOtp} 
                  disabled={isLoading}
                  className="w-full bg-yellow-400 text-white py-5 rounded-2xl font-bold shadow-xl shadow-yellow-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send Verification Code'}
                 </button>
                 <button onClick={() => setView('home')} className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest pt-2">Skip for Now</button>
               </div>
             </div>
           ) : (
             <div className="space-y-6 animate-scale-in">
               <div>
                 <h1 className="text-3xl font-extrabold tracking-tight">Verify Code</h1>
                 <p className="text-gray-500 mt-2 text-sm">A 4-digit code has been sent to <b>+91 {phoneInput}</b></p>
               </div>
               <div className="space-y-4">
                 <div className="flex justify-between gap-4">
                    <input 
                      type="tel" maxLength={4} placeholder="0000"
                      className="w-full bg-gray-50 py-5 px-5 rounded-2xl font-bold text-2xl text-center tracking-[1em] outline-none border-2 border-transparent focus:border-yellow-400 transition-all shadow-inner"
                      value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g,''))}
                    />
                 </div>
                 <button 
                  onClick={handleVerifyOtp} 
                  disabled={isLoading}
                  className="w-full bg-black text-white py-5 rounded-2xl font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                 >
                   {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify & Continue'}
                 </button>
                 
                 <div className="pt-2 text-center">
                   {resendTimer > 0 ? (
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                       <Clock size={12} /> Resend available in {resendTimer}s
                     </p>
                   ) : (
                     <button onClick={handleRequestOtp} className="text-yellow-600 font-bold text-[10px] uppercase tracking-widest border-b border-yellow-200 pb-0.5">Resend SMS</button>
                   )}
                 </div>

                 <button onClick={() => setLoginStep('phone')} className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest pt-4 flex items-center justify-center gap-1"><ChevronRight size={14} className="rotate-180"/> Use different number</button>
               </div>
             </div>
           )}
        </div>
      )}

      {/* Home View */}
      {view === 'home' && (
        <div className="pb-32 animate-scale-in">
          <header className="glass sticky top-0 z-50 px-5 py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-yellow-400 p-2 rounded-xl shadow-lg shadow-yellow-100"><ShoppingBag className="text-white" size={20} /></div>
                <div>
                  <h1 className="font-bold text-lg tracking-tight leading-none">Muskan</h1>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Premium Stationery Hub</p>
                </div>
              </div>
              <button onClick={goToAccount} className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm active:scale-90 transition-all">
                <User size={18} className="text-yellow-600"/>
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="text" placeholder="Search school or office items..." className="w-full bg-gray-100/70 rounded-2xl py-3.5 pl-11 pr-4 outline-none border border-transparent focus:border-yellow-300 transition-all font-semibold text-sm shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </header>

          {/* Banner Slider */}
          <div className="px-5 mt-5">
            <div className="relative h-48 rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
               {OFFERS.map((off, i) => (
                 <div key={off.id} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === currentOffer ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                    <img src={off.image} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center px-10 text-white">
                       <h2 className="text-2xl font-extrabold leading-tight">{off.title}</h2>
                       <p className="text-xs font-medium opacity-80 mt-1.5 uppercase tracking-wider">{off.subtitle}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Categories */}
          <div className="px-5 py-8">
             <div className="flex gap-5 overflow-x-auto hide-scrollbar">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex-shrink-0 flex flex-col items-center gap-2.5">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${activeCategory === cat.id ? 'bg-yellow-400 text-white scale-110 shadow-xl shadow-yellow-100' : 'bg-gray-50 text-gray-400'}`}>
                      {cat.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${activeCategory === cat.id ? 'text-black' : 'text-gray-400'}`}>{cat.label}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Products */}
          <div className="px-5 grid grid-cols-2 gap-5">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm flex flex-col hover:shadow-xl transition-all group">
                <div className="relative mb-3 rounded-2xl overflow-hidden bg-gray-50">
                  <img src={p.image} className="w-full aspect-square object-cover transition-transform group-hover:scale-110" />
                </div>
                <h3 className="font-bold text-xs px-1 line-clamp-1">{p.name}</h3>
                <div className="flex justify-between items-center mt-auto pt-3 px-1 pb-1">
                  <span className="font-extrabold text-sm text-gray-900">₹{p.price}</span>
                  <button onClick={() => handleAddToCart(p)} className="bg-gray-900 text-white w-9 h-9 rounded-xl flex items-center justify-center active:bg-yellow-400 active:scale-90 transition-all shadow-md shadow-gray-200"><Plus size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {view === 'admin' && (isAdmin ? (
        <div className="p-5 pb-32 animate-slide-up">
           <header className="flex items-center justify-between mb-8 sticky top-0 py-3 glass -mx-5 px-5 z-20">
              <div className="flex items-center gap-2">
                 <ShieldCheck size={20} className="text-yellow-600"/>
                 <h1 className="text-lg font-bold">Admin Panel</h1>
              </div>
              <button onClick={handleLogout} className="text-red-500 font-bold text-[10px] uppercase tracking-widest bg-red-50 px-3 py-2 rounded-xl">Logout</button>
           </header>

           <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
              <button onClick={() => setAdminTab('orders')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${adminTab === 'orders' ? 'bg-white text-black shadow-md' : 'text-gray-400'}`}>Active Orders</button>
              <button onClick={() => setAdminTab('inventory')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${adminTab === 'inventory' ? 'bg-white text-black shadow-md' : 'text-gray-400'}`}>Inventory Manager</button>
           </div>

           {adminTab === 'orders' ? (
             <div className="space-y-4">
                {orders.length === 0 ? <p className="text-center py-20 text-gray-300 font-bold">No orders found.</p> : orders.map(o => (
                  <div key={o.id} className="bg-gray-50 border border-gray-100 p-5 rounded-3xl space-y-4">
                     <div className="flex justify-between items-center">
                       <span className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase">{o.id}</span>
                       <select 
                         value={o.status} 
                         onChange={(e) => setOrders(orders.map(item => item.id === o.id ? {...item, status: e.target.value as any} : item))}
                         className="text-[10px] font-bold uppercase bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm outline-none"
                       >
                          <option>Pending</option>
                          <option>Processing</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                       </select>
                     </div>
                     <div className="text-[11px] font-medium text-gray-600">
                        <p className="font-bold text-black leading-tight text-xs">📍 {o.deliveryAddress.fullAddress}</p>
                        <p className="opacity-70 mt-1 font-bold text-gray-400">📞 {o.customerPhone}</p>
                     </div>
                     <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <p className="font-extrabold text-xl">₹{o.total}</p>
                        <span className="text-[9px] font-bold uppercase bg-white px-3 py-1.5 rounded-lg border text-gray-500">{o.paymentMethod}</span>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="space-y-4">
                <button onClick={startAddingProduct} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 mb-6 shadow-2xl"><PlusCircle size={18}/> Add New Inventory</button>
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                     <img src={p.image} className="w-14 h-14 rounded-xl object-cover" />
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate text-gray-900">{p.name}</p>
                        <p className="text-[10px] font-bold text-yellow-600 mt-1">₹{p.price}</p>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => { setEditingProduct(p); setIsEditModalOpen(true); }} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl active:text-yellow-600"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 bg-gray-50 text-red-400 rounded-xl active:bg-red-50"><Trash2 size={16}/></button>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      ) : <div className="p-8 text-center text-gray-400 font-bold">Unauthorized Access</div>)}

      {/* Account View */}
      {view === 'account' && (
        <div className="p-5 pb-32 animate-slide-up">
           <header className="flex items-center justify-between mb-10">
              <button onClick={() => setView('home')} className="bg-gray-50 p-3 rounded-xl active:scale-90 transition-all"><ChevronRight size={20} className="rotate-180"/></button>
              <h2 className="text-lg font-extrabold tracking-tight">My Profile</h2>
              <button onClick={handleLogout} className="text-red-500 font-bold text-[10px] uppercase tracking-widest bg-red-50 px-3 py-2 rounded-xl">Logout</button>
           </header>
           
           <div className="space-y-12">
              <div className="bg-yellow-50 p-6 rounded-[2.5rem] flex items-center gap-4">
                 <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {userPhone.slice(-2)}
                 </div>
                 <div>
                    <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Active Customer</p>
                    <p className="text-xl font-extrabold tracking-tight mt-1">+91 {userPhone}</p>
                 </div>
              </div>

              <div>
                 <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400">Saved Addresses</h3>
                    <button onClick={() => setIsAddingAddress(true)} className="text-yellow-600 text-[10px] font-bold uppercase tracking-widest">+ Add New</button>
                 </div>
                 <div className="space-y-4">
                    {addresses.length === 0 ? <p className="text-xs text-gray-300 italic">No addresses saved yet.</p> : addresses.map(a => (
                       <div key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`p-5 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedAddressId === a.id ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'border-gray-100 bg-white'}`}>
                          <div className="flex items-center gap-2 mb-2">
                             {a.label === 'Home' ? <Home size={14} className="text-gray-400"/> : <Briefcase size={14} className="text-gray-400"/>}
                             <span className="text-[10px] font-bold uppercase tracking-widest">{a.label}</span>
                          </div>
                          <p className="text-xs text-gray-600 font-semibold line-clamp-2 leading-relaxed">{a.fullAddress}</p>
                       </div>
                    ))}
                 </div>
              </div>

              <div>
                 <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-5 px-1">Order History</h3>
                 <div className="space-y-4">
                    {orders.filter(o => o.customerPhone === userPhone).map(o => (
                       <div key={o.id} className="bg-white border border-gray-100 p-5 rounded-3xl flex justify-between items-center shadow-sm">
                          <div>
                             <p className="text-[9px] font-extrabold text-gray-300 uppercase tracking-widest">{o.id}</p>
                             <p className="text-xl font-extrabold mt-1">₹{o.total}</p>
                          </div>
                          <span className="text-[9px] font-bold uppercase bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full tracking-wider">{o.status}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Navigation Bar */}
      {view !== 'login' && (
        <nav className="fixed bottom-8 left-6 right-6 z-[60] flex items-center justify-between px-7 py-5 glass rounded-[2.5rem] shadow-2xl border border-white/40 max-w-sm mx-auto floating-nav">
          <button onClick={() => setView('home')} className={`p-2 transition-all ${view === 'home' ? 'text-yellow-500' : 'text-gray-300'}`}><TrendingUp size={24} /></button>
          <button onClick={() => isAdmin ? setAdminTab('orders') : goToAccount()} className={`p-2 transition-all ${view === 'account' ? 'text-yellow-500' : 'text-gray-300'}`}><Package size={24} /></button>
          
          <button onClick={() => setIsCartOpen(true)} className="bg-gray-900 text-white p-5 rounded-full -mt-16 shadow-2xl border-4 border-white relative active:scale-90 transition-all">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold">{cart.length}</span>}
          </button>
          
          <button onClick={goToAccount} className={`p-2 transition-all ${view === 'account' ? 'text-yellow-500' : 'text-gray-300'}`}><User size={24} /></button>
          {isAdmin && <button onClick={() => setView('admin')} className={`p-2 transition-all ${view === 'admin' ? 'text-black' : 'text-gray-300'}`}><LayoutDashboard size={24} /></button>}
        </nav>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-end">
          <div className="bg-white w-full rounded-t-[3rem] p-10 animate-slide-up max-h-[96vh] overflow-y-auto pb-40">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-2 z-10">
              <h2 className="text-2xl font-extrabold tracking-tight">Checkout</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-gray-100 p-3 rounded-full active:scale-90 transition-all"><X size={20} /></button>
            </div>

            {/* Delivery Progress Bar */}
            {cart.length > 0 && (
              <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivery Status</span>
                  {subtotal > 99 ? (
                    <span className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Free Delivery unlocked!</span>
                  ) : (
                    <span className="text-[10px] font-bold text-yellow-600 uppercase">Add ₹{100 - subtotal} for FREE Delivery</span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${subtotal > 99 ? 'bg-green-500' : 'bg-yellow-400'}`} 
                    style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {cart.length === 0 ? <div className="text-center py-20 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200"><ShoppingCart size={32}/></div>
              <p className="text-gray-300 font-extrabold uppercase tracking-widest text-sm">Shopping bag is empty</p>
            </div> : (
              <div className="space-y-10">
                <div className="space-y-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-5 items-center pb-6 border-b border-gray-50">
                      <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100" />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs font-bold text-yellow-600 mt-1">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-4 bg-gray-100 px-3 py-2 rounded-xl">
                         <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400"><Minus size={14}/></button>
                         <span className="font-extrabold text-sm w-4 text-center">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-900"><Plus size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Shipping Selection */}
                <div>
                   <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-1">Delivery Destination</h3>
                   <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                      {addresses.map(a => (
                         <div key={a.id} onClick={() => setSelectedAddressId(a.id)} className={`flex-shrink-0 w-60 p-6 rounded-3xl border-2 transition-all cursor-pointer ${selectedAddressId === a.id ? 'border-yellow-400 bg-yellow-50 shadow-md' : 'border-gray-50 bg-white'}`}>
                            <p className="font-extrabold text-[10px] uppercase tracking-widest mb-1.5">{a.label}</p>
                            <p className="text-xs text-gray-500 truncate font-medium">{a.fullAddress}</p>
                         </div>
                      ))}
                      <button onClick={() => setIsAddingAddress(true)} className="flex-shrink-0 w-60 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-[10px] font-extrabold text-gray-300 p-6 transition-colors hover:border-yellow-200 hover:text-yellow-600">
                        <Plus size={20} className="mb-2"/>
                        Add New Address
                      </button>
                   </div>
                </div>

                {/* Bill Details Section */}
                <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                   <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-5 border-b border-gray-200 pb-3">Bill Details</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                         <span>Item Total (MRP)</span>
                         <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-green-600">
                         <span>Store Discount (5%)</span>
                         <span>-₹{discount}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                         <div className="flex items-center gap-1.5">
                            Delivery Fee
                            <Info size={12} className="text-gray-300" />
                         </div>
                         <span className={deliveryFee === 0 ? 'text-green-600' : 'text-gray-600'}>
                           {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                         </span>
                      </div>
                      <div className="pt-4 mt-2 border-t border-dashed border-gray-300 flex justify-between items-center">
                         <span className="text-sm font-black text-gray-900 uppercase tracking-wider">To Pay</span>
                         <span className="text-xl font-black text-gray-900 tracking-tighter">₹{grandTotal}</span>
                      </div>
                   </div>
                </div>

                {/* Payment Choice */}
                <div>
                  <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 px-1">Payment Selection</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setPaymentMethod('cod')} 
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all shadow-sm ${paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-50 bg-gray-50/50'}`}
                    >
                      <Banknote size={28} className={paymentMethod === 'cod' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">Cash</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('online')} 
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all shadow-sm ${paymentMethod === 'online' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-50 bg-gray-50/50'}`}
                    >
                      <CreditCard size={28} className={paymentMethod === 'online' ? 'text-yellow-600' : 'text-gray-300'} />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">Online</span>
                    </button>
                  </div>
                </div>

                {/* Checkout Footer */}
                <div className="pt-6">
                  <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl">
                     <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payable Amount</span>
                       <p className="text-3xl font-black mt-1 tracking-tighter">₹{grandTotal}</p>
                     </div>
                     <button 
                      onClick={() => placeOrder(paymentMethod)} 
                      className="bg-yellow-400 text-black px-10 py-5 rounded-2xl font-black text-sm uppercase shadow-xl active:scale-95 transition-all"
                     >
                        Confirm
                     </button>
                  </div>
                  <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest mt-6">
                    Policy: Orders above ₹99 get Free Delivery
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Address Form */}
      {isAddingAddress && (
         <div className="fixed inset-0 bg-black/60 z-[110] flex items-end">
            <div className="bg-white w-full rounded-t-[3rem] p-10 animate-slide-up pb-20">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-extrabold tracking-tight">New Delivery Point</h3>
                  <button onClick={() => setIsAddingAddress(false)} className="bg-gray-100 p-3 rounded-full active:scale-90 transition-all"><X size={20}/></button>
               </div>
               <div className="space-y-6">
                  <div className="flex gap-3">
                     {['Home', 'Office', 'Other'].map(l => (
                        <button key={l} onClick={() => setNewAddr({...newAddr, label: l})} className={`px-6 py-3 rounded-xl font-extrabold text-[10px] uppercase border-2 transition-all tracking-widest ${newAddr.label === l ? 'bg-yellow-400 border-yellow-400 text-white shadow-lg shadow-yellow-100' : 'border-gray-100 text-gray-400 bg-white'}`}>{l}</button>
                     ))}
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="House / Flat / Street Name" className="w-full bg-gray-50 py-4 px-6 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-yellow-400 shadow-inner" value={newAddr.fullAddress} onChange={(e) => setNewAddr({...newAddr, fullAddress: e.target.value})} />
                    <input type="text" placeholder="Nearby Landmark (Optional)" className="w-full bg-gray-50 py-4 px-6 rounded-2xl text-sm font-semibold outline-none border-2 border-transparent focus:border-yellow-400 shadow-inner" value={newAddr.landmark} onChange={(e) => setNewAddr({...newAddr, landmark: e.target.value})} />
                  </div>
                  <button onClick={saveAddress} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl mt-4 active:scale-[0.98] transition-all">Save & Select</button>
               </div>
            </div>
         </div>
      )}

      {/* Product Edit Modal (Admin) */}
      {isEditModalOpen && editingProduct && (
         <div className="fixed inset-0 bg-black/60 z-[110] flex items-end">
            <div className="bg-white w-full rounded-t-[3rem] p-10 animate-slide-up pb-16 max-h-[92vh] overflow-y-auto">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-extrabold tracking-tight">Inventory Management</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="bg-gray-100 p-3 rounded-full active:scale-90 transition-all"><X size={20}/></button>
               </div>
               <div className="space-y-6">
                  
                  {/* Image Upload Area */}
                  <div className="flex flex-col items-center gap-4 bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <div className="relative group">
                       <img 
                          src={editingProduct.image || 'https://via.placeholder.com/400?text=No+Image'} 
                          className="w-32 h-32 rounded-3xl object-cover shadow-xl border-4 border-white" 
                          alt="Preview"
                       />
                       <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Camera className="text-white" size={24} />
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                       </label>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Product Photo</p>
                       <button 
                         className="mt-2 flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all"
                         onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleImageUpload(e as any);
                            input.click();
                         }}
                       >
                         <Upload size={12} /> Upload New
                       </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                     <input type="text" className="w-full bg-gray-50 py-4 px-6 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-yellow-400 shadow-inner" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                     <input type="number" className="w-full bg-gray-50 py-4 px-6 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-yellow-400 shadow-inner" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="flex flex-col gap-2">
                     <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest ml-1">Category</label>
                     <select 
                       className="w-full bg-gray-50 py-4 px-6 rounded-2xl text-sm font-bold outline-none border-2 border-transparent focus:border-yellow-400 shadow-inner"
                       value={editingProduct.category}
                       onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                     >
                       {CATEGORIES.filter(c => c.id !== 'All').map(cat => (
                         <option key={cat.id} value={cat.id}>{cat.label}</option>
                       ))}
                     </select>
                  </div>
                  
                  <button onClick={handleSaveProduct} className="w-full bg-black text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-2xl mt-4 active:scale-[0.98] transition-all">Apply Changes</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
