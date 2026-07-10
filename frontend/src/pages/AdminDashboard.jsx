import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../redux/slices/notificationSlice.js';
import apiService from '../api/apiService.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { DashboardSkeleton } from '../components/SkeletonLoader.jsx';
import { 
  TrendingUp, 
  ShoppingBag, 
  FolderOpen, 
  Sparkles, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  AlertTriangle,
  FileText,
  IndianRupee,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { token, user } = useSelector((state) => state.auth);
  const activeTab = searchParams.get('tab') || 'analytics';

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  
  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form trigger states
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [brandFormOpen, setBrandFormOpen] = useState(false);

  // Form Field states: Product
  const [pTitle, setPTitle] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pDiscount, setPDiscount] = useState('0');
  const [pCategory, setPCategory] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pImages, setPImages] = useState('');
  const [pColors, setPColors] = useState('');
  const [pSizes, setPSizes] = useState('');
  const [pSpecs, setPSecs] = useState([{ key: '', value: '' }]);

  // Form Field states: Category & Brand
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cImage, setCImage] = useState('');
  const [bName, setBName] = useState('');
  const [bDesc, setBDesc] = useState('');
  const [bLogo, setBLogo] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      dispatch(addToast({ text: 'Access denied: Admin only', type: 'error' }));
      navigate('/');
      return;
    }

    setIsLoading(true);
    const fetchAdminData = async () => {
      try {
        // Load categories & brands first as they are needed for dropdown selectors
        const cats = await apiService.categories.getAll();
        setCategories(cats);
        const brnds = await apiService.brands.getAll();
        setBrands(brnds);

        if (activeTab === 'analytics') {
          const stats = await apiService.orders.getAnalytics();
          setAnalytics(stats);
        } else if (activeTab === 'products') {
          const prods = await apiService.products.getAll({ limit: 50 });
          setProducts(prods.products || []);
        } else if (activeTab === 'categories') {
          // Already loaded categories in common hook
        } else if (activeTab === 'brands') {
          // Already loaded brands
        } else if (activeTab === 'orders') {
          const ords = await apiService.orders.getAll();
          setOrders(ords);
        } else if (activeTab === 'users') {
          const usrs = await apiService.users.getAllUsers();
          setUsersList(usrs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [token, user, activeTab, navigate, dispatch]);

  const switchTab = (tabName) => {
    setSearchParams({ tab: tabName });
    // Reset forms
    setProductFormOpen(false);
    setEditProduct(null);
    setCategoryFormOpen(false);
    setBrandFormOpen(false);
  };

  // Product CRUD Handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!pCategory || !pBrand) {
      dispatch(addToast({ text: 'Category and Brand are required', type: 'warning' }));
      return;
    }

    const payload = {
      title: pTitle,
      description: pDescription,
      price: parseFloat(pPrice),
      stock: parseInt(pStock),
      discountPercentage: parseFloat(pDiscount || '0'),
      category: pCategory,
      brand: pBrand,
      images: pImages ? pImages.split(',').map(i => i.trim()) : undefined,
      colors: pColors ? pColors.split(',').map(c => c.trim()) : [],
      sizes: pSizes ? pSizes.split(',').map(s => s.trim()) : [],
      specifications: pSpecs.filter(s => s.key && s.value)
    };

    try {
      if (editProduct) {
        await apiService.products.update(editProduct._id, payload);
        dispatch(addToast({ text: 'Product updated successfully', type: 'success' }));
      } else {
        await apiService.products.create(payload);
        dispatch(addToast({ text: 'Product added successfully', type: 'success' }));
      }
      // Refresh list
      const prods = await apiService.products.getAll({ limit: 50 });
      setProducts(prods.products || []);
      setProductFormOpen(false);
      setEditProduct(null);
      resetProductForm();
    } catch (err) {
      console.error(err);
      dispatch(addToast({ text: 'Failed to save product', type: 'error' }));
    }
  };

  const handleEditProductClick = (prod) => {
    setEditProduct(prod);
    setPTitle(prod.title);
    setPDescription(prod.description);
    setPPrice(prod.price.toString());
    setPStock(prod.stock.toString());
    setPDiscount((prod.discountPercentage || 0).toString());
    setPCategory(prod.category?._id || prod.category || '');
    setPBrand(prod.brand?._id || prod.brand || '');
    setPImages(prod.images?.join(', ') || '');
    setPColors(prod.colors?.join(', ') || '');
    setPSizes(prod.sizes?.join(', ') || '');
    setPSecs(prod.specifications?.length > 0 ? prod.specifications : [{ key: '', value: '' }]);
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await apiService.products.delete(prodId);
      setProducts(prev => prev.filter(p => p._id !== prodId));
      dispatch(addToast({ text: 'Product deleted successfully', type: 'info' }));
    } catch (err) {
      console.error(err);
    }
  };

  const resetProductForm = () => {
    setPTitle('');
    setPDescription('');
    setPPrice('');
    setPStock('');
    setPDiscount('0');
    setPCategory('');
    setPBrand('');
    setPImages('');
    setPColors('');
    setPSizes('');
    setPSecs([{ key: '', value: '' }]);
  };

  // Category CRUD Handlers
  const handleCategoryCreate = async (e) => {
    e.preventDefault();
    if (!cName) return;

    try {
      const cat = await apiService.categories.create({ name: cName, description: cDesc, image: cImage });
      setCategories(prev => [...prev, cat]);
      setCategoryFormOpen(false);
      setCName('');
      setCDesc('');
      setCImage('');
      dispatch(addToast({ text: 'Category created', type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await apiService.categories.delete(catId);
      setCategories(prev => prev.filter(c => c._id !== catId));
      dispatch(addToast({ text: 'Category removed', type: 'info' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Brand CRUD Handlers
  const handleBrandCreate = async (e) => {
    e.preventDefault();
    if (!bName) return;

    try {
      const brand = await apiService.brands.create({ name: bName, description: bDesc, logo: bLogo });
      setBrands(prev => [...prev, brand]);
      setBrandFormOpen(false);
      setBName('');
      setBDesc('');
      setBLogo('');
      dispatch(addToast({ text: 'Brand created', type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Delete brand?')) return;
    try {
      await apiService.brands.delete(brandId);
      setBrands(prev => prev.filter(b => b._id !== brandId));
      dispatch(addToast({ text: 'Brand removed', type: 'info' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Order Status update
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await apiService.orders.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      dispatch(addToast({ text: `Order status updated to ${newStatus}`, type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  // Block / Admin User toggles
  const handleToggleUserBlock = async (usrId) => {
    try {
      await apiService.users.toggleBlock(usrId);
      setUsersList(prev => prev.map(u => u._id === usrId ? { ...u, blocked: !u.blocked } : u));
      dispatch(addToast({ text: 'User status updated', type: 'info' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserAdmin = async (usrId) => {
    try {
      await apiService.users.toggleAdmin(usrId);
      setUsersList(prev => prev.map(u => u._id === usrId ? { ...u, role: u.role === 'admin' ? 'customer' : 'admin' } : u));
      dispatch(addToast({ text: 'User role updated', type: 'success' }));
    } catch (err) {
      console.error(err);
    }
  };

  const sidebarAdminItems = [
    { id: 'analytics', name: 'Dashboard Stats', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'products', name: 'Manage Products', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'categories', name: 'Categories CRUD', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'brands', name: 'Brands CRUD', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'orders', name: 'Manage Orders', icon: <FileText className="w-4 h-4" /> },
    { id: 'users', name: 'Manage Users', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <Breadcrumbs paths={[{ name: 'Home', url: '/' }, { name: 'Admin Dashboard', url: '/admin' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Admin Navigation */}
          <aside className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 h-fit space-y-4 flat-shadow select-none">
            <div className="pb-3 border-b border-slate-100">
              <span className="bg-primary/10 text-primary text-[8px] px-2 py-0.5 rounded font-bold uppercase">System Operator</span>
              <h2 className="text-sm font-bold text-gray-800 mt-1">Admin Portal</h2>
            </div>
            
            <nav className="flex flex-col gap-1 text-sm font-semibold">
              {sidebarAdminItems.map((item) => (
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

          {/* Main Content Area */}
          <section className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flat-shadow min-h-[400px]">
            
            {/* 1. Tab: Analytics Dashboard Overview */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8 select-none">
                <h2 className="text-lg font-bold text-gray-900 border-b border-slate-100 pb-3">Dashboard Analytics Overview</h2>
                
                {/* Stats cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Total Revenue</p>
                      <h4 className="text-lg font-bold text-gray-950 mt-1">₹{analytics.summary?.revenue}</h4>
                    </div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><IndianRupee className="w-5 h-5" /></div>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Paid Orders</p>
                      <h4 className="text-lg font-bold text-gray-950 mt-1">{analytics.summary?.orders}</h4>
                    </div>
                    <div className="p-2 bg-blue-50 text-primary rounded-lg"><ShoppingBag className="w-5 h-5" /></div>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Total Customers</p>
                      <h4 className="text-lg font-bold text-gray-950 mt-1">{analytics.summary?.customers}</h4>
                    </div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users className="w-5 h-5" /></div>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Active Products</p>
                      <h4 className="text-lg font-bold text-gray-950 mt-1">{analytics.summary?.products}</h4>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FolderOpen className="w-5 h-5" /></div>
                  </div>
                </div>

                {/* Low Stock Indicators */}
                {analytics.lowStockProducts?.length > 0 && (
                  <div className="border border-amber-200 bg-amber-50/50 p-4 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="w-4 h-4" /> Low Inventory Alerts (Less than 5 items remaining)
                    </h3>
                    <div className="divide-y divide-amber-100 text-xs text-amber-900">
                      {analytics.lowStockProducts.map((p) => (
                        <div key={p._id} className="py-2 first:pt-0 last:pb-0 flex justify-between font-medium">
                          <span>{p.title}</span>
                          <span className="font-bold text-red-500">{p.stock} units left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders table */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider">Recent System Orders</h3>
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {analytics.recentOrders?.map((ord) => (
                      <div key={ord._id} className="p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-800">Order #{ord._id.substring(16)}... ({ord.user?.name || 'Customer'})</p>
                          <p className="text-gray-400 font-medium">Placed: {new Date(ord.createdAt).toLocaleDateString()} | Method: {ord.paymentMethod}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold text-gray-900">₹{ord.totalPrice}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            ord.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>{ord.isPaid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 2. Tab: Manage Products */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* Heading & Add button */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-bold text-gray-900">Inventory Products</h2>
                  {!productFormOpen && (
                    <button
                      onClick={() => { setEditProduct(null); resetProductForm(); setProductFormOpen(true); }}
                      className="bg-primary text-secondary px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flex items-center gap-1 flat-shadow active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  )}
                </div>

                {/* Add/Edit Form */}
                {productFormOpen && (
                  <form onSubmit={handleProductSubmit} className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-fade-in text-xs">
                    <h3 className="text-sm font-bold text-gray-800">{editProduct ? 'Edit Product details' : 'Add New Product'}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Product Title</label>
                        <input
                          type="text"
                          required
                          value={pTitle}
                          onChange={(e) => setPTitle(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={pPrice}
                          onChange={(e) => setPPrice(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                        <textarea
                          rows={2}
                          required
                          value={pDescription}
                          onChange={(e) => setPDescription(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs focus:outline-none focus:border-primary text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Stock Count</label>
                        <input
                          type="number"
                          required
                          value={pStock}
                          onChange={(e) => setPStock(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Discount percentage (%)</label>
                        <input
                          type="number"
                          value={pDiscount}
                          onChange={(e) => setPDiscount(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Category</label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-700"
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Brand</label>
                        <select
                          value={pBrand}
                          onChange={(e) => setPBrand(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-700"
                        >
                          <option value="">Select Brand</option>
                          {brands.map((b) => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Images (comma separated Unsplash URLs)</label>
                        <input
                          type="text"
                          value={pImages}
                          onChange={(e) => setPImages(e.target.value)}
                          placeholder="https://image1.jpg, https://image2.jpg"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => { setProductFormOpen(false); setEditProduct(null); }}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        {editProduct ? 'Save Product' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Products list grid */}
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 select-none">
                  {products.map((p) => (
                    <div key={p._id} className="p-4 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-10 h-10 rounded border border-slate-100 object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-1">{p.title}</p>
                          <p className="text-gray-400 font-medium">₹{p.price} | Stock: {p.stock} units</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-gray-600 rounded-md hover:text-primary transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="p-1.5 bg-slate-50 border border-slate-200 text-gray-600 rounded-md hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Tab: Categories CRUD */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
                  <h2 className="text-lg font-bold text-gray-900">Manage Categories</h2>
                  {!categoryFormOpen && (
                    <button
                      onClick={() => setCategoryFormOpen(true)}
                      className="bg-primary text-secondary px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flex items-center gap-1 flat-shadow active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  )}
                </div>

                {categoryFormOpen && (
                  <form onSubmit={handleCategoryCreate} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-fade-in text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Category Name</label>
                      <input
                        type="text"
                        required
                        value={cName}
                        onChange={(e) => setCName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                      <input
                        type="text"
                        value={cDesc}
                        onChange={(e) => setCDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Image URL</label>
                      <input
                        type="text"
                        value={cImage}
                        onChange={(e) => setCImage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCategoryFormOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                  {categories.map((c) => (
                    <div key={c._id} className="border border-slate-200 p-4 rounded-xl flex items-center justify-between bg-white text-xs">
                      <div className="flex items-center gap-3">
                        <img src={c.image} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                        <div>
                          <p className="font-bold text-gray-800">{c.name}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{c.description || 'No description'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(c._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Tab: Brands CRUD */}
            {activeTab === 'brands' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
                  <h2 className="text-lg font-bold text-gray-900">Manage Brands</h2>
                  {!brandFormOpen && (
                    <button
                      onClick={() => setBrandFormOpen(true)}
                      className="bg-primary text-secondary px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flex items-center gap-1 flat-shadow active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Brand
                    </button>
                  )}
                </div>

                {brandFormOpen && (
                  <form onSubmit={handleBrandCreate} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 animate-fade-in text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={bName}
                        onChange={(e) => setBName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                      <input
                        type="text"
                        value={bDesc}
                        onChange={(e) => setBDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Logo URL</label>
                      <input
                        type="text"
                        value={bLogo}
                        onChange={(e) => setBLogo(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary text-gray-800"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setBrandFormOpen(false)}
                        className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-primary text-secondary px-5 py-2 rounded-lg text-xs font-semibold hover:bg-primary/95 transition-colors cursor-pointer"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                  {brands.map((b) => (
                    <div key={b._id} className="border border-slate-200 p-4 rounded-xl flex items-center justify-between bg-white text-xs">
                      <div className="flex items-center gap-3">
                        <img src={b.logo} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                        <div>
                          <p className="font-bold text-gray-800">{b.name}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{b.description || 'No description'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteBrand(b._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Tab: Manage Orders (Progress status updates) */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-slate-100 pb-3">System Orders</h2>
                
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord._id} className="border border-slate-200 rounded-xl p-4 bg-white text-xs space-y-3 flat-shadow">
                      <div className="flex justify-between items-baseline flex-wrap gap-2">
                        <div>
                          <h4 className="font-bold text-gray-800">Order #{ord._id}</h4>
                          <p className="text-gray-400 font-medium">Customer: {ord.user?.name || 'Seeded User'} | Date: {new Date(ord.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-950">${ord.totalPrice.toFixed(2)}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            ord.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>{ord.isPaid ? 'Paid' : 'Unpaid'}</span>
                        </div>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center gap-2 border-t border-slate-50 pt-2 select-none">
                        <span className="font-bold text-gray-500">Update Status:</span>
                        <select
                          value={ord.status}
                          onChange={(e) => handleOrderStatusChange(ord._id, e.target.value)}
                          className="border border-slate-200 rounded px-2.5 py-1 focus:outline-none focus:border-primary text-gray-700 bg-white font-semibold"
                        >
                          {['Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Tab: Manage Users */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900 border-b border-slate-100 pb-3">User Administration</h2>
                
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 select-none">
                  {usersList.map((usr) => (
                    <div key={usr._id} className="p-4 flex justify-between items-center text-xs flex-wrap gap-4">
                      <div>
                        <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                          {usr.name}{' '}
                          {usr.role === 'admin' && (
                            <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">Admin</span>
                          )}
                        </h4>
                        <p className="text-gray-400 font-medium">{usr.email}</p>
                      </div>

                      {/* Admin action triggers */}
                      <div className="flex gap-2">
                        {usr._id.toString() !== user?._id.toString() && (
                          <>
                            <button
                              onClick={() => handleToggleUserAdmin(usr._id)}
                              className="px-3 py-1.5 border border-slate-200 hover:border-gray-400 text-gray-600 rounded-md transition-colors font-semibold cursor-pointer flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Toggle Role
                            </button>
                            <button
                              onClick={() => handleToggleUserBlock(usr._id)}
                              className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer transition-colors ${
                                usr.blocked 
                                  ? 'bg-green-600 text-secondary hover:bg-green-700' 
                                  : 'bg-red-500 text-secondary hover:bg-red-600'
                              }`}
                            >
                              {usr.blocked ? 'Unblock' : 'Block User'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </section>

        </div>
      </div>
    </div>
  );
}
