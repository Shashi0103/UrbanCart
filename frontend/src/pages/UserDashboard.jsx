import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setWishlistItems, toggleWishlistState } from '../redux/slices/wishlistSlice.js';
import { addToast, setUnreadCount, decrementUnreadCount } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { DashboardSkeleton } from '../components/SkeletonLoader.jsx';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Bell, 
  Heart, 
  LogOut, 
  Lock, 
  CheckCircle, 
  Clock, 
  Truck, 
  CheckSquare, 
  ThumbsUp,
  Trash2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { subtab } = useParams();

  const { token, user } = useSelector((state) => state.auth);
  const wishlist = useSelector((state) => state.wishlist.items);

  // Active tab selection (profile, orders, addresses, notifications, wishlist)
  const activeTab = subtab || searchParams.get('tab') || 'profile';

  // State caches
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states (Profile edit)
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form states (Addresses)
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [addressFormOpen, setAddressFormOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    // Fetch data based on active tab
    const fetchData = async () => {
      try {
        if (activeTab === 'orders') {
          const ords = await apiService.orders.getMyOrders();
          setOrders(ords);
        } else if (activeTab === 'addresses') {
          const addrs = await apiService.users.getAddresses();
          setAddresses(addrs);
        } else if (activeTab === 'notifications') {
          const notifs = await apiService.notifications.getAll();
          setNotifications(notifs);
        } else if (activeTab === 'wishlist') {
          const wish = await apiService.wishlist.get();
          dispatch(setWishlistItems(wish));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, activeTab, navigate, dispatch]);

  const switchTab = (tabName) => {
    if (tabName === 'profile') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tabName}`);
    }
  };

  // Profile Save
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      const updatedUser = await apiService.users.updateProfile(payload);
      dispatch(addToast({ text: 'Profile updated successfully', type: 'success' }));
      setPassword('');
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: 'Failed to update profile', type: 'error' }));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Address CRUD
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const updatedAddrs = await apiService.users.addAddress({
        street, city, state: stateName, postalCode, country, isDefault: addresses.length === 0
      });
      setAddresses(updatedAddrs);
      setAddressFormOpen(false);
      setStreet('');
      setCity('');
      setStateName('');
      setPostalCode('');
      dispatch(addToast({ text: 'Address added successfully', type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const updatedAddrs = await apiService.users.deleteAddress(addrId);
      setAddresses(updatedAddrs);
      dispatch(addToast({ text: 'Address deleted', type: 'info' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle wishlist
  const handleRemoveWishlist = async (productId, e) => {
    e.preventDefault();
    try {
      await apiService.wishlist.toggle(productId);
      const updatedWish = wishlist.filter(p => p._id !== productId);
      dispatch(setWishlistItems(updatedWish));
      dispatch(addToast({ text: 'Removed from Wishlist', type: 'info' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (notifId) => {
    try {
      await apiService.notifications.markAsRead(notifId);
      setNotifications(prev => prev.map(n => {
        if (n._id === notifId && !n.read) {
          dispatch(decrementUnreadCount());
          return { ...n, read: true };
        }
        return n;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotifications = async () => {
    try {
      await apiService.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      dispatch(setUnreadCount(0));
      dispatch(addToast({ text: 'All notifications marked as read', type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Sidebar list items
  const sidebarItems = [
    { id: 'profile', name: 'My Profile', icon: <User className="w-4 h-4" /> },
    { id: 'orders', name: 'My Orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'addresses', name: 'Saved Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'wishlist', name: 'My Wishlist', icon: <Heart className="w-4 h-4" /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Breadcrumbs paths={[{ name: 'Home', url: '/' }, { name: 'Dashboard', url: '/dashboard' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 h-fit space-y-4 flat-shadow select-none">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400">Welcome,</p>
                <h2 className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{user?.name}</h2>
              </div>
            </div>

            <nav className="flex flex-col gap-1 text-sm font-semibold">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-primary text-secondary flat-shadow' 
                      : 'text-gray-600 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Dashboard Panel */}
          <section className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flat-shadow min-h-[400px]">
            
            {/* 1. Tab: Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-slate-100 pb-3">My Profile Details</h2>
                
                <form onSubmit={handleProfileSave} className="max-w-md space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Email Address (Read-only)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-gray-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Update Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-gray-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="bg-primary text-secondary px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. Tab: Orders History */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-slate-100 pb-3">My Orders</h2>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">You haven't placed any orders yet.</p>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-slate-200 rounded-xl overflow-hidden flat-shadow">
                        {/* Top Summary bar */}
                        <div className="bg-slate-50 px-4 py-3 flex justify-between items-center text-xs text-gray-500 border-b border-slate-200 flex-wrap gap-2">
                          <div className="flex gap-4">
                            <div>
                              <p className="uppercase font-semibold text-[10px]">Order Placed</p>
                              <p className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="uppercase font-semibold text-[10px]">Total Amount</p>
                              <p className="font-bold text-gray-950">₹{order.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          <div>
                            <p className="uppercase font-semibold text-[10px]">Order Ref</p>
                            <p className="font-bold text-primary">#{order._id}</p>
                          </div>
                        </div>

                        {/* Order Status Tracking timeline */}
                        <div className="p-4 bg-white border-b border-slate-100 select-none">
                          <h4 className="text-xs font-bold text-gray-700 mb-4">Delivery Progress</h4>
                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold max-w-lg mx-auto">
                            {['Placed', 'Confirmed', 'Shipped', 'Delivered'].map((tName, tIdx) => {
                              // Calculate if status is achieved in tracking history
                              const isCompleted = order.trackingHistory?.some(h => h.status === tName) || 
                                                 (tName === 'Placed' && order.status !== 'Cancelled') ||
                                                 (tName === 'Confirmed' && ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status)) ||
                                                 (tName === 'Shipped' && ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status)) ||
                                                 (tName === 'Delivered' && order.status === 'Delivered');

                              return (
                                <div key={tIdx} className="flex flex-col items-center gap-1 flex-1 relative">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                    isCompleted ? 'bg-green-500 border-green-500 text-white text-[8px]' : 'border-slate-200 bg-white'
                                  }`}>
                                    {isCompleted ? '✓' : ''}
                                  </div>
                                  <span className={isCompleted ? 'text-green-600' : ''}>{tName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Items list inside order */}
                        <div className="p-4 divide-y divide-slate-100 bg-white">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 justify-between items-center text-xs">
                              <div className="flex gap-3">
                                <div className="w-14 h-14 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center shrink-0">
                                  <img src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50'} alt="" className="max-h-full max-w-full object-contain" />
                                </div>
                                <div className="space-y-0.5">
                                  <Link to={`/product/${item.product?._id}`} className="font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-1">
                                    {item.product?.title || 'Seeded Product Item'}
                                  </Link>
                                  <p className="text-gray-400 font-medium">Qty: {item.quantity} | Size: {item.size || 'Standard'} | Color: {item.color || 'Standard'}</p>
                                </div>
                              </div>
                              <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Tab: Saved Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                  <button
                    onClick={() => setAddressFormOpen(!addressFormOpen)}
                    className="bg-primary text-secondary px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flat-shadow active:scale-95 cursor-pointer"
                  >
                    Add Address
                  </button>
                </div>

                {addressFormOpen && (
                  <form onSubmit={handleAddAddress} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                    <div className="col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="123 Main St..."
                        className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Postal Code</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full bg-[#F5F5F5] border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAddressFormOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {isLoading ? (
                  <div className="h-32 bg-slate-100 animate-pulse rounded-lg" />
                ) : addresses.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No addresses saved. Add one above.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="border border-slate-200 p-4 bg-white rounded-xl flex justify-between items-start flat-shadow">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                            {addr.isDefault && <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded">Default</span>}
                            Delivery Address
                          </p>
                          <p className="text-xs text-gray-600 font-medium">{addr.street}</p>
                          <p className="text-xs text-gray-400 font-medium">{addr.city}, {addr.state} - {addr.postalCode}</p>
                          <p className="text-xs text-gray-400 font-medium">{addr.country}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Tab: Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-slate-100 pb-3">My Wishlist</h2>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-48 bg-slate-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (wishlist || []).filter(Boolean).length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Your wishlist is empty.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(wishlist || []).filter(Boolean).map((prod) => (
                      <div key={prod._id} className="relative group">
                        <ProductCard product={prod} />
                        <button
                          onClick={(e) => handleRemoveWishlist(prod._id, e)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full flat-shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer z-30"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Tab: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={handleMarkAllNotifications}
                      className="text-xs text-primary font-bold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No notifications received.</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => !notif.read && handleMarkNotificationRead(notif._id)}
                        className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-all ${
                          notif.read 
                            ? 'bg-slate-50 border-slate-100 text-gray-500' 
                            : 'bg-blue-50 border-blue-100 text-blue-900 font-semibold cursor-pointer'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-xs">{notif.title}</p>
                          <p className="text-[10px] opacity-80 font-medium">{notif.message}</p>
                          <span className="text-[8px] uppercase tracking-wide opacity-50 block">
                            {notif.type} • {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </section>

        </div>
      </div>
    </div>
  );
}
