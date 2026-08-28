import { useState, useEffect } from 'react';
import {
  FiGrid, FiUsers, FiShoppingBag, FiPackage, FiTag, FiDollarSign,
  FiEdit, FiAlertCircle, FiCheckCircle, FiXCircle, FiClock, FiCheck, FiX, FiRefreshCw, FiEye,
  FiHome, FiSlash, FiAlertTriangle
} from 'react-icons/fi';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { useAuth } from '../context/AuthContext';
import { getCategoriesApi, createCategoryApi, updateCategoryApi } from '../api/categoryApi';
import {
  getPendingHostsApi, updateHostStatusApi, getAdminStatsApi, getAllHostsApi, getHostDetailsApi,
  getAllStoresApi, getStoreDetailsApi, updateStoreStatusApi,
  getAllProductsForAdminApi, getAdminProductDetailsApi, updateProductStatusByAdminApi,
  getAllOrdersAdminApi, getRevenueStatsAdminApi, getAdminOrderByIdApi, updateOrderStatusAdminApi
} from '../api/adminApi';
import { formatPrice } from '../utils/helpers';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Categories CRUD State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '', status: 'active' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState('all'); // 'all' | 'active' | 'inactive' | 'out_of_stock'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  const [productActionLoadingId, setProductActionLoadingId] = useState(null);

  // Host Management State
  const [pendingHosts, setPendingHosts] = useState([]);
  const [allHosts, setAllHosts] = useState([]);
  const [hostFilter, setHostFilter] = useState('all'); // 'all' | 'pending' | 'active' | 'blocked'
  const [selectedHost, setSelectedHost] = useState(null);
  const [loadingHosts, setLoadingHosts] = useState(true);
  const [loadingHostDetails, setLoadingHostDetails] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Admin Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Store Management State
  const [stores, setStores] = useState([]);
  const [storeFilter, setStoreFilter] = useState('all'); // 'all' | 'active' | 'suspended' | 'closed'
  const [selectedStore, setSelectedStore] = useState(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingStoreDetails, setLoadingStoreDetails] = useState(false);
  const [storeActionLoadingId, setStoreActionLoadingId] = useState(null);

  // Admin Orders & Revenue State
  const [adminOrders, setAdminOrders] = useState([]);
  const [revenueStats, setRevenueStats] = useState(null);
  const [loadingAdminOrders, setLoadingAdminOrders] = useState(true);
  const [adminOrderFilter, setAdminOrderFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);
  const [loadingAdminOrderDetails, setLoadingAdminOrderDetails] = useState(false);
  const [updatingOrderStatusId, setUpdatingOrderStatusId] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');

  // Feedback Toast
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  // Load Categories from Backend API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await getCategoriesApi();
      if (data.success && data.categories) {
        setCategories(prev => {
          // Merge fetched categories with existing state to preserve any inactive ones toggled in UI
          const fetchedIds = new Set(data.categories.map(c => c._id));
          const preservedInactive = prev.filter(c => !fetchedIds.has(c._id) && c.status === 'inactive');
          return [...data.categories, ...preservedInactive];
        });
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load Products via Admin Endpoint
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await getAllProductsForAdminApi();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('danger', err.response?.data?.message || 'Failed to fetch admin product catalog.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Product Details for Admin Inspection
  const handleViewProductDetails = async (productId) => {
    setLoadingProductDetails(true);
    try {
      const data = await getAdminProductDetailsApi(productId);
      if (data.success && data.product) {
        setSelectedProduct(data.product);
      }
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      showToast('danger', err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setLoadingProductDetails(false);
    }
  };

  // Handle Admin Product Status Toggle ('active' or 'inactive')
  const handleProductStatusChange = async (targetProductId, status) => {
    if (!targetProductId) return;
    setProductActionLoadingId(targetProductId);
    try {
      const data = await updateProductStatusByAdminApi(targetProductId, status);
      if (data.success) {
        const updatedStatus = data.product?.status || status;
        showToast(
          updatedStatus === 'active' ? 'success' : 'warning',
          data.message || `Product status updated to ${updatedStatus}.`
        );
        // Update local product state
        setProducts(prev => prev.map(p => (p._id === targetProductId ? { ...p, status: updatedStatus } : p)));
        // Update modal state if open
        if (selectedProduct && selectedProduct._id === targetProductId) {
          setSelectedProduct(prev => prev ? { ...prev, status: updatedStatus } : null);
        }
        // Refresh product list and stats
        fetchProducts();
        fetchAdminStats();
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update product status.');
    } finally {
      setProductActionLoadingId(null);
    }
  };

  // Load Hosts from Backend API (Pending + All Hosts)
  const fetchHostsData = async () => {
    setLoadingHosts(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        getPendingHostsApi(),
        getAllHostsApi(),
      ]);

      if (pendingRes.success && Array.isArray(pendingRes.hosts)) {
        setPendingHosts(pendingRes.hosts);
      }
      if (allRes.success && Array.isArray(allRes.hosts)) {
        setAllHosts(allRes.hosts);
      }
    } catch (err) {
      console.error('Failed to load host accounts:', err);
      showToast('danger', err.response?.data?.message || 'Failed to fetch host accounts.');
    } finally {
      setLoadingHosts(false);
    }
  };

  // Fetch Particular Host Details by ID
  const handleViewHostDetails = async (hostId) => {
    setLoadingHostDetails(true);
    try {
      const data = await getHostDetailsApi(hostId);
      if (data.success && data.host) {
        setSelectedHost(data.host);
      }
    } catch (err) {
      console.error('Failed to fetch host details:', err);
      showToast('danger', err.response?.data?.message || 'Failed to load host profile details.');
    } finally {
      setLoadingHostDetails(false);
    }
  };

  // Handle Host Approval or Status Change ('active' or 'blocked')
  const handleHostStatusChange = async (targetHostId, status) => {
    if (!targetHostId) return;
    setActionLoadingId(targetHostId);
    try {
      const data = await updateHostStatusApi(targetHostId, status);
      if (data.success) {
        const updatedStatus = data.host?.status || status;
        showToast(
          updatedStatus === 'active' ? 'success' : 'warning',
          data.message || (updatedStatus === 'active' ? 'Host approved successfully.' : 'Host account blocked successfully.')
        );
        // Remove host from pending list
        setPendingHosts(prev => prev.filter(h => (h._id || h.id) !== targetHostId));
        // Update host status in allHosts array immediately
        setAllHosts(prev => prev.map(h => {
          const currentId = h._id || h.id;
          return currentId === targetHostId ? { ...h, status: updatedStatus } : h;
        }));
        // Update modal state if open
        if (selectedHost && (selectedHost._id === targetHostId || selectedHost.id === targetHostId)) {
          setSelectedHost(prev => prev ? { ...prev, status: updatedStatus } : null);
        }
        // Refresh full host list and stats from server
        fetchHostsData();
        fetchAdminStats();
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update host status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Load Platform Statistics from Backend API
  const fetchAdminStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getAdminStatsApi();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load All Stores from Backend API
  const fetchStoresData = async () => {
    setLoadingStores(true);
    try {
      const data = await getAllStoresApi();
      if (data.success && Array.isArray(data.stores)) {
        setStores(data.stores);
      }
    } catch (err) {
      console.error('Failed to load stores:', err);
      showToast('danger', err.response?.data?.message || 'Failed to fetch stores.');
    } finally {
      setLoadingStores(false);
    }
  };

  // Fetch Particular Store Details by ID
  const handleViewStoreDetails = async (storeId) => {
    setLoadingStoreDetails(true);
    try {
      const data = await getStoreDetailsApi(storeId);
      if (data.success && data.store) {
        setSelectedStore(data.store);
      }
    } catch (err) {
      console.error('Failed to fetch store details:', err);
      showToast('danger', err.response?.data?.message || 'Failed to load store details.');
    } finally {
      setLoadingStoreDetails(false);
    }
  };

  // Handle Store Status Change ('active', 'suspended', 'closed')
  const handleStoreStatusChange = async (targetStoreId, status) => {
    if (!targetStoreId) return;
    setStoreActionLoadingId(targetStoreId);
    try {
      const data = await updateStoreStatusApi(targetStoreId, status);
      if (data.success) {
        const updatedStatus = data.store?.status || status;
        showToast(
          updatedStatus === 'active' ? 'success' : updatedStatus === 'suspended' ? 'warning' : 'danger',
          data.message || `Store status updated to ${updatedStatus}.`
        );
        // Update store status in stores state array
        setStores(prev => prev.map(s => {
          const currentId = s._id || s.id;
          return currentId === targetStoreId ? { ...s, status: updatedStatus } : s;
        }));
        // Update modal if open
        if (selectedStore && (selectedStore._id === targetStoreId || selectedStore.id === targetStoreId)) {
          setSelectedStore(prev => prev ? { ...prev, status: updatedStatus } : null);
        }
        // Refresh store list & admin stats
        fetchStoresData();
        fetchAdminStats();
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update store status.');
    } finally {
      setStoreActionLoadingId(null);
    }
  };

  // Load Admin Orders & Revenue Statistics
  const fetchAdminOrdersData = async () => {
    setLoadingAdminOrders(true);
    try {
      const [ordersRes, revRes] = await Promise.all([
        getAllOrdersAdminApi(),
        getRevenueStatsAdminApi(),
      ]);

      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setAdminOrders(ordersRes.orders);
      }
      if (revRes.success) {
        setRevenueStats(revRes);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      showToast('danger', err.response?.data?.message || 'Failed to fetch platform orders.');
    } finally {
      setLoadingAdminOrders(false);
    }
  };

  // Fetch Detailed Single Order Info for Admin
  const handleViewAdminOrderDetails = async (orderId) => {
    setLoadingAdminOrderDetails(true);
    try {
      const data = await getAdminOrderByIdApi(orderId);
      if (data.success && data.order) {
        setSelectedAdminOrder(data.order);
        setNewOrderStatus(data.order.orderStatus || 'pending');
        setCancellationReasonInput(data.order.cancellationReason || '');
      }
    } catch (err) {
      console.error('Failed to fetch admin order details:', err);
      showToast('danger', err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoadingAdminOrderDetails(false);
    }
  };

  // Update Order Status by Admin
  const handleUpdateOrderStatusSubmit = async (orderId, targetStatus, reason) => {
    if (!orderId || !targetStatus) return;
    setUpdatingOrderStatusId(orderId);
    try {
      const data = await updateOrderStatusAdminApi(orderId, targetStatus, reason);
      if (data.success) {
        showToast('success', data.message || `Order status updated to ${targetStatus}.`);
        fetchAdminOrdersData();
        if (selectedAdminOrder && selectedAdminOrder._id === orderId) {
          setSelectedAdminOrder(prev => prev ? {
            ...prev,
            orderStatus: targetStatus,
            cancellationReason: reason,
            deliveredAt: targetStatus === 'delivered' ? new Date() : prev.deliveredAt,
            cancelledAt: targetStatus === 'cancelled' ? new Date() : prev.cancelledAt,
          } : null);
        }
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderStatusId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchHostsData();
    fetchStoresData();
    fetchAdminStats();
    fetchAdminOrdersData();
  }, []);

  // Category Submit (Create / Update)
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    try {
      if (editingCategory) {
        const data = await updateCategoryApi(editingCategory._id, categoryForm);
        if (data.success && data.category) {
          showToast('success', `Category "${data.category.name}" updated successfully!`);
          setCategories(prev => prev.map(c => c._id === data.category._id ? data.category : c));
        }
      } else {
        const data = await createCategoryApi(categoryForm);
        if (data.success && data.category) {
          showToast('success', `Category "${data.category.name}" created successfully!`);
          setCategories(prev => [...prev, data.category]);
        }
      }
      setCategoryForm({ name: '', description: '', image: '', status: 'active' });
      setEditingCategory(null);
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to save category.');
    }
  };

  // Category Toggle Active / Inactive Status
  const handleToggleCategoryStatus = async (cat) => {
    const targetStatus = cat.status === 'inactive' ? 'active' : 'inactive';
    try {
      const data = await updateCategoryApi(cat._id, { status: targetStatus });
      if (data.success) {
        showToast(
          targetStatus === 'active' ? 'success' : 'warning',
          `Category "${cat.name}" status changed to ${targetStatus.toUpperCase()}.`
        );
        setCategories(prev =>
          prev.map(item => (item._id === cat._id ? { ...item, status: targetStatus } : item))
        );
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update category status.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100 py-4">
        <div className="container">
          
          {/* Toast Banner */}
          {feedback.message && (
            <div className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert">
              <FiAlertCircle />
              <div>{feedback.message}</div>
              <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', message: '' })} />
            </div>
          )}

          {/* Admin Header */}
          <div className="bg-dark text-white rounded-4 p-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div>
                <span className="badge bg-danger text-white mb-2 text-uppercase fw-bold" style={{ fontSize: 10 }}>Admin Control Panel</span>
                <h2 className="fw-bold mb-1">ShopSphere Platform Overview</h2>
                <p className="small text-white-50 mb-0">System metrics, category management, host approval & product moderation.</p>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <ul className="nav nav-pills bg-white p-2 rounded-4 shadow-sm mb-4 gap-2 border">
            {[
              { id: 'overview', label: 'Overview', icon: FiGrid },
              { id: 'categories', label: 'Categories Management', icon: FiTag },
              { id: 'hosts', label: 'Host Management', icon: FiShoppingBag },
              { id: 'stores', label: 'Store Management', icon: FiHome },
              { id: 'products', label: 'Products View', icon: FiPackage },
              { id: 'orders', label: 'Orders & Revenue', icon: FiDollarSign },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <li key={tab.id} className="nav-item">
                  <button
                    className={`nav-link fw-semibold d-flex align-items-center gap-2 rounded-3 ${activeTab === tab.id ? 'active bg-primary' : 'text-dark'}`}
                    style={activeTab === tab.id ? { background: '#4F46E5' } : {}}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} /> {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="row g-3 mb-4">
                {/* Stat 1: Registered Users */}
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Total Customers</span>
                      <FiUsers className="text-primary" />
                    </div>
                    <div className="display-6 fw-bold text-primary my-1">
                      {loadingStats ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      ) : (
                        stats?.users?.total ?? 0
                      )}
                    </div>
                    <div className="small text-muted">Registered buyer accounts</div>
                  </div>
                </div>

                {/* Stat 2: Hosts / Sellers */}
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Total Sellers / Hosts</span>
                      <FiShoppingBag className="text-warning" />
                    </div>
                    <div className="display-6 fw-bold text-warning my-1">
                      {loadingStats ? (
                        <div className="spinner-border spinner-border-sm text-warning" role="status" />
                      ) : (
                        stats?.hosts?.total ?? 0
                      )}
                    </div>
                    <div className="small text-muted d-flex gap-2 flex-wrap">
                      <span className="badge bg-success-subtle text-success">{stats?.hosts?.active ?? 0} Active</span>
                      <span className="badge bg-warning-subtle text-dark">{stats?.hosts?.pending ?? pendingHosts.length} Pending</span>
                    </div>
                  </div>
                </div>

                {/* Stat 3: Stores */}
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Total Stores</span>
                      <FiGrid className="text-info" />
                    </div>
                    <div className="display-6 fw-bold text-info my-1">
                      {loadingStats ? (
                        <div className="spinner-border spinner-border-sm text-info" role="status" />
                      ) : (
                        stats?.stores?.total ?? 0
                      )}
                    </div>
                    <div className="small text-muted">
                      <span className="badge bg-info-subtle text-info">{stats?.stores?.active ?? 0} Active Stores</span>
                    </div>
                  </div>
                </div>

                {/* Stat 4: Products */}
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Total Products</span>
                      <FiPackage style={{ color: '#4F46E5' }} />
                    </div>
                    <div className="display-6 fw-bold my-1" style={{ color: '#4F46E5' }}>
                      {loadingStats ? (
                        <div className="spinner-border spinner-border-sm text-indigo" role="status" />
                      ) : (
                        stats?.products?.total ?? products.length
                      )}
                    </div>
                    <div className="small text-muted d-flex gap-2 flex-wrap">
                      <span className="badge bg-success-subtle text-success">{stats?.products?.active ?? 0} Active</span>
                      {stats?.products?.outOfStock > 0 && (
                        <span className="badge bg-danger-subtle text-danger">{stats.products.outOfStock} Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Platform Breakdown */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <h5 className="fw-bold text-dark mb-3">Platform System Summary</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="fw-semibold text-dark mb-2">Host Application Pipeline</div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Pending Review</span>
                        <span className="badge bg-warning text-dark fw-bold">{stats?.hosts?.pending ?? pendingHosts.length}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Active Approved Hosts</span>
                        <span className="badge bg-success fw-bold">{stats?.hosts?.active ?? 0}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Blocked Hosts</span>
                        <span className="badge bg-danger fw-bold">{stats?.hosts?.blocked ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="fw-semibold text-dark mb-2">Store Ecosystem</div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Total Registered Stores</span>
                        <span className="fw-bold">{stats?.stores?.total ?? 0}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Active Operating Stores</span>
                        <span className="badge bg-info fw-bold">{stats?.stores?.active ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="fw-semibold text-dark mb-2">Product Catalog Status</div>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="small text-muted">Active Products</span>
                        <span className="badge bg-success fw-bold">{stats?.products?.active ?? 0}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Out of Stock Items</span>
                        <span className="badge bg-secondary fw-bold">{stats?.products?.outOfStock ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORIES MANAGEMENT (FULL CRUD WITH ACTIVE/INACTIVE TOGGLE) */}
          {activeTab === 'categories' && (
            <div className="row g-4">
              {/* Category Form */}
              <div className="col-12 col-md-5">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h5 className="fw-bold text-dark mb-3">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                  </h5>
                  <form onSubmit={handleCategorySubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Category Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Electronics, Fashion"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Short description..."
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://..."
                        value={categoryForm.image}
                        onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                      />
                    </div>

                    {editingCategory && (
                      <div className="mb-3">
                        <label className="form-label fw-semibold small">Category Status</label>
                        <select
                          className="form-select"
                          value={categoryForm.status}
                          onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary rounded-pill fw-bold px-4" style={{ background: '#4F46E5' }}>
                        {editingCategory ? 'Save Changes' : '+ Create Category'}
                      </button>
                      {editingCategory && (
                        <button
                          type="button"
                          className="btn btn-light rounded-pill px-3"
                          onClick={() => {
                            setEditingCategory(null);
                            setCategoryForm({ name: '', description: '', image: '', status: 'active' });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Categories Table */}
              <div className="col-12 col-md-7">
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="fw-bold text-dark mb-0">Categories List ({categories.length})</h5>
                    <span className="badge bg-light text-muted border">
                      {categories.filter(c => c.status === 'active').length} Active | {categories.filter(c => c.status === 'inactive').length} Inactive
                    </span>
                  </div>

                  {loadingCategories ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-4 text-muted">No categories found.</div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Category</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th className="text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((cat) => (
                            <tr key={cat._id} className={cat.status === 'inactive' ? 'table-secondary opacity-75' : ''}>
                              <td className="fw-semibold text-dark">{cat.name}</td>
                              <td className="small text-muted">{cat.slug}</td>
                              <td>
                                <span className={`badge ${cat.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                  {cat.status || 'active'}
                                </span>
                              </td>
                              <td className="text-end">
                                <button
                                  className="btn btn-sm btn-outline-primary me-2"
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setCategoryForm({
                                      name: cat.name,
                                      description: cat.description || '',
                                      image: cat.image || '',
                                      status: cat.status || 'active',
                                    });
                                  }}
                                >
                                  <FiEdit /> Edit
                                </button>

                                {cat.status === 'inactive' ? (
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleToggleCategoryStatus(cat)}
                                    title="Click to Activate Category"
                                  >
                                    <FiCheckCircle /> Activate
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-outline-warning text-dark"
                                    onClick={() => handleToggleCategoryStatus(cat)}
                                    title="Click to Deactivate Category"
                                  >
                                    <FiXCircle /> Deactivate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOST MANAGEMENT */}
          {activeTab === 'hosts' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Host & Seller Management ({allHosts.length})</h5>
                  <p className="small text-muted mb-0">Review pending host applications, inspect seller profiles, and manage active accounts.</p>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1 align-self-start align-self-md-auto"
                  onClick={fetchHostsData}
                  disabled={loadingHosts}
                >
                  <FiRefreshCw className={loadingHosts ? 'spin' : ''} /> Refresh Hosts
                </button>
              </div>

              {/* Status Filters */}
              <div className="d-flex gap-2 mb-4 flex-wrap">
                {[
                  { key: 'all', label: `All Hosts (${allHosts.length})` },
                  { key: 'pending', label: `Pending Approval (${allHosts.filter(h => h.status === 'pending').length})` },
                  { key: 'active', label: `Active (${allHosts.filter(h => h.status === 'active').length})` },
                  { key: 'blocked', label: `Blocked (${allHosts.filter(h => h.status === 'blocked').length})` },
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`btn btn-sm rounded-pill px-3 fw-semibold ${hostFilter === filter.key ? 'btn-primary' : 'btn-light text-dark border'}`}
                    style={hostFilter === filter.key ? { background: '#4F46E5', borderColor: '#4F46E5' } : {}}
                    onClick={() => setHostFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {loadingHosts ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted small mt-2">Loading host accounts...</p>
                </div>
              ) : (() => {
                const displayedHosts = hostFilter === 'all'
                  ? allHosts
                  : allHosts.filter(h => h.status === hostFilter);

                if (displayedHosts.length === 0) {
                  return (
                    <div className="text-center py-5 text-muted">
                      <div className="display-5 text-secondary mb-2">🏪</div>
                      <h5 className="fw-bold text-dark">No Host Accounts Found</h5>
                      <p className="small text-muted mb-0">No sellers match the selected filter category ({hostFilter}).</p>
                    </div>
                  );
                }

                return (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Host Name</th>
                          <th>Email</th>
                          <th>Registered Date</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedHosts.map((host) => (
                          <tr key={host._id}>
                            <td>
                              <div className="fw-semibold text-dark">
                                {host.firstName} {host.lastName}
                              </div>
                              <div className="small text-muted" style={{ fontSize: 11 }}>ID: {host._id}</div>
                            </td>
                            <td className="small text-muted">{host.email}</td>
                            <td className="small text-muted">
                              {host.createdAt ? new Date(host.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </td>
                            <td>
                              <span className={`badge ${host.status === 'active' ? 'bg-success' : host.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'} d-inline-flex align-items-center gap-1 px-2 py-1`}>
                                {host.status === 'pending' && <FiClock size={12} />}
                                {host.status || 'pending'}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                  onClick={() => handleViewHostDetails(host._id)}
                                  title="View Host Profile"
                                >
                                  <FiEye size={14} /> Profile
                                </button>

                                {host.status !== 'active' && (
                                  <button
                                    className="btn btn-sm btn-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleHostStatusChange(host._id, 'active')}
                                    disabled={actionLoadingId === host._id}
                                  >
                                    {actionLoadingId === host._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiCheck size={14} /> Approve
                                      </>
                                    )}
                                  </button>
                                )}

                                {host.status !== 'blocked' && (
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleHostStatusChange(host._id, 'blocked')}
                                    disabled={actionLoadingId === host._id}
                                  >
                                    {actionLoadingId === host._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiX size={14} /> Block
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Host Profile Details Modal */}
          {selectedHost && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header border-bottom-0 pb-0">
                    <h5 className="modal-title fw-bold text-dark">Host Account Profile</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedHost(null)} />
                  </div>
                  <div className="modal-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm" style={{ width: 56, height: 56, background: '#4F46E5' }}>
                        {selectedHost.firstName?.charAt(0)}{selectedHost.lastName?.charAt(0)}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">{selectedHost.firstName} {selectedHost.lastName}</h5>
                        <span className="text-muted small">{selectedHost.email}</span>
                      </div>
                    </div>
                    
                    <div className="bg-light p-3 rounded-3 mb-4 border">
                      <div className="row g-3 small">
                        <div className="col-6">
                          <span className="text-muted d-block">Account Role</span>
                          <span className="fw-bold text-capitalize badge bg-secondary">{selectedHost.role}</span>
                        </div>
                        <div className="col-6">
                          <span className="text-muted d-block">Current Status</span>
                          <span className={`badge ${selectedHost.status === 'active' ? 'bg-success' : selectedHost.status === 'pending' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                            {selectedHost.status}
                          </span>
                        </div>
                        <div className="col-12">
                          <span className="text-muted d-block">User ID</span>
                          <code className="text-dark bg-white p-1 rounded border d-inline-block">{selectedHost._id}</code>
                        </div>
                        <div className="col-12">
                          <span className="text-muted d-block">Registered Date</span>
                          <span className="fw-bold text-dark">
                            {selectedHost.createdAt ? new Date(selectedHost.createdAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end">
                      {selectedHost.status !== 'active' && (
                        <button
                          className="btn btn-success rounded-pill px-4 fw-bold"
                          onClick={() => handleHostStatusChange(selectedHost._id, 'active')}
                          disabled={actionLoadingId === selectedHost._id}
                        >
                          Approve & Activate Host
                        </button>
                      )}
                      {selectedHost.status !== 'blocked' && (
                        <button
                          className="btn btn-outline-danger rounded-pill px-4 fw-bold"
                          onClick={() => handleHostStatusChange(selectedHost._id, 'blocked')}
                          disabled={actionLoadingId === selectedHost._id}
                        >
                          Block Host Account
                        </button>
                      )}
                      <button className="btn btn-light rounded-pill px-3" onClick={() => setSelectedHost(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE MANAGEMENT */}
          {activeTab === 'stores' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Platform Store Management ({stores.length})</h5>
                  <p className="small text-muted mb-0">Review seller stores, check store owner details, and manage store operational status.</p>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1 align-self-start align-self-md-auto"
                  onClick={fetchStoresData}
                  disabled={loadingStores}
                >
                  <FiRefreshCw className={loadingStores ? 'spin' : ''} /> Refresh Stores
                </button>
              </div>

              {/* Status Filters */}
              <div className="d-flex gap-2 mb-4 flex-wrap">
                {[
                  { key: 'all', label: `All Stores (${stores.length})` },
                  { key: 'active', label: `Active (${stores.filter(s => s.status === 'active').length})` },
                  { key: 'suspended', label: `Suspended (${stores.filter(s => s.status === 'suspended').length})` },
                  { key: 'closed', label: `Closed (${stores.filter(s => s.status === 'closed').length})` },
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`btn btn-sm rounded-pill px-3 fw-semibold ${storeFilter === filter.key ? 'btn-primary' : 'btn-light text-dark border'}`}
                    style={storeFilter === filter.key ? { background: '#4F46E5', borderColor: '#4F46E5' } : {}}
                    onClick={() => setStoreFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {loadingStores ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted small mt-2">Loading stores...</p>
                </div>
              ) : (() => {
                const displayedStores = storeFilter === 'all'
                  ? stores
                  : stores.filter(s => s.status === storeFilter);

                if (displayedStores.length === 0) {
                  return (
                    <div className="text-center py-5 text-muted">
                      <div className="display-5 text-secondary mb-2">🏪</div>
                      <h5 className="fw-bold text-dark">No Stores Found</h5>
                      <p className="small text-muted mb-0">No stores match the selected status category ({storeFilter}).</p>
                    </div>
                  );
                }

                return (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Store</th>
                          <th>Owner / Seller</th>
                          <th>Created Date</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedStores.map((store) => (
                          <tr key={store._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {store.logo ? (
                                  <img src={store.logo} alt={store.name} className="rounded-circle border" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                                ) : (
                                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small" style={{ width: 36, height: 36, background: '#4F46E5' }}>
                                    {store.name?.charAt(0) || 'S'}
                                  </div>
                                )}
                                <div>
                                  <div className="fw-semibold text-dark">{store.name}</div>
                                  <div className="small text-muted text-truncate" style={{ maxWidth: 200, fontSize: 11 }}>{store.description || 'No description'}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {store.owner ? (
                                <div>
                                  <div className="fw-semibold text-dark">{store.owner.firstName} {store.owner.lastName}</div>
                                  <div className="small text-muted">{store.owner.email}</div>
                                </div>
                              ) : (
                                <span className="text-muted small">N/A</span>
                              )}
                            </td>
                            <td className="small text-muted">
                              {store.createdAt ? new Date(store.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </td>
                            <td>
                              <span className={`badge ${store.status === 'active' ? 'bg-success' : store.status === 'suspended' ? 'bg-warning text-dark' : 'bg-danger'} px-2 py-1`}>
                                {store.status || 'active'}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                  onClick={() => handleViewStoreDetails(store._id)}
                                  title="View Store Details"
                                >
                                  <FiEye size={14} /> View
                                </button>

                                {store.status !== 'active' && (
                                  <button
                                    className="btn btn-sm btn-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleStoreStatusChange(store._id, 'active')}
                                    disabled={storeActionLoadingId === store._id}
                                  >
                                    {storeActionLoadingId === store._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiCheck size={14} /> Activate
                                      </>
                                    )}
                                  </button>
                                )}

                                {store.status !== 'suspended' && (
                                  <button
                                    className="btn btn-sm btn-outline-warning text-dark rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleStoreStatusChange(store._id, 'suspended')}
                                    disabled={storeActionLoadingId === store._id}
                                  >
                                    {storeActionLoadingId === store._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiAlertTriangle size={14} /> Suspend
                                      </>
                                    )}
                                  </button>
                                )}

                                {store.status !== 'closed' && (
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleStoreStatusChange(store._id, 'closed')}
                                    disabled={storeActionLoadingId === store._id}
                                  >
                                    {storeActionLoadingId === store._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiSlash size={14} /> Close
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Store Details Modal */}
          {selectedStore && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header border-bottom-0 pb-0">
                    <h5 className="modal-title fw-bold text-dark">Store Details</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedStore(null)} />
                  </div>
                  <div className="modal-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      {selectedStore.logo ? (
                        <img src={selectedStore.logo} alt={selectedStore.name} className="rounded-circle border shadow-sm" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                      ) : (
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm" style={{ width: 64, height: 64, background: '#4F46E5' }}>
                          {selectedStore.name?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <h4 className="fw-bold mb-0">{selectedStore.name}</h4>
                        <span className={`badge ${selectedStore.status === 'active' ? 'bg-success' : selectedStore.status === 'suspended' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {selectedStore.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="text-muted small d-block">Description</label>
                      <p className="text-dark bg-light p-3 rounded border small mb-0">{selectedStore.description || 'No description provided.'}</p>
                    </div>

                    <div className="bg-light p-3 rounded-3 mb-4 border">
                      <div className="row g-3 small">
                        <div className="col-12">
                          <span className="text-muted d-block fw-semibold text-uppercase" style={{ fontSize: 10 }}>Store Owner Information</span>
                          {selectedStore.owner ? (
                            <div className="mt-1">
                              <div className="fw-bold text-dark">{selectedStore.owner.firstName} {selectedStore.owner.lastName}</div>
                              <div className="text-muted">{selectedStore.owner.email}</div>
                              {selectedStore.owner.phone && <div className="text-muted">Phone: {selectedStore.owner.phone}</div>}
                              <span className={`badge mt-1 ${selectedStore.owner.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                                Host Account: {selectedStore.owner.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted">Owner data not available</span>
                          )}
                        </div>

                        <div className="col-12 border-top pt-2">
                          <span className="text-muted d-block">Store ID</span>
                          <code className="text-dark bg-white p-1 rounded border d-inline-block">{selectedStore._id}</code>
                        </div>
                        <div className="col-12">
                          <span className="text-muted d-block">Created On</span>
                          <span className="fw-bold text-dark">
                            {selectedStore.createdAt ? new Date(selectedStore.createdAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end flex-wrap">
                      {selectedStore.status !== 'active' && (
                        <button
                          className="btn btn-success rounded-pill px-3 fw-bold"
                          onClick={() => handleStoreStatusChange(selectedStore._id, 'active')}
                          disabled={storeActionLoadingId === selectedStore._id}
                        >
                          Activate Store
                        </button>
                      )}
                      {selectedStore.status !== 'suspended' && (
                        <button
                          className="btn btn-warning text-dark rounded-pill px-3 fw-bold"
                          onClick={() => handleStoreStatusChange(selectedStore._id, 'suspended')}
                          disabled={storeActionLoadingId === selectedStore._id}
                        >
                          Suspend Store
                        </button>
                      )}
                      {selectedStore.status !== 'closed' && (
                        <button
                          className="btn btn-outline-danger rounded-pill px-3 fw-bold"
                          onClick={() => handleStoreStatusChange(selectedStore._id, 'closed')}
                          disabled={storeActionLoadingId === selectedStore._id}
                        >
                          Close Store
                        </button>
                      )}
                      <button className="btn btn-light rounded-pill px-3" onClick={() => setSelectedStore(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCTS VIEW */}
          {activeTab === 'products' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-1">Marketplace Product Catalog ({products.length})</h5>
                  <p className="small text-muted mb-0">Inspect product listings across all registered stores, verify seller details, and manage listing statuses.</p>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1 align-self-start align-self-md-auto"
                  onClick={fetchProducts}
                  disabled={loadingProducts}
                >
                  <FiRefreshCw className={loadingProducts ? 'spin' : ''} /> Refresh Products
                </button>
              </div>

              {/* Status Filters */}
              <div className="d-flex gap-2 mb-4 flex-wrap">
                {[
                  { key: 'all', label: `All Products (${products.length})` },
                  { key: 'active', label: `Active (${products.filter(p => p.status === 'active').length})` },
                  { key: 'inactive', label: `Inactive (${products.filter(p => p.status === 'inactive').length})` },
                  { key: 'out_of_stock', label: `Out of Stock (${products.filter(p => p.stock === 0 || p.status === 'out_of_stock').length})` },
                ].map(filter => (
                  <button
                    key={filter.key}
                    className={`btn btn-sm rounded-pill px-3 fw-semibold ${productFilter === filter.key ? 'btn-primary' : 'btn-light text-dark border'}`}
                    style={productFilter === filter.key ? { background: '#4F46E5', borderColor: '#4F46E5' } : {}}
                    onClick={() => setProductFilter(filter.key)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {loadingProducts ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="text-muted small mt-2">Loading marketplace products...</p>
                </div>
              ) : (() => {
                const displayedProducts = productFilter === 'all'
                  ? products
                  : productFilter === 'out_of_stock'
                    ? products.filter(p => p.stock === 0 || p.status === 'out_of_stock')
                    : products.filter(p => p.status === productFilter);

                if (displayedProducts.length === 0) {
                  return (
                    <div className="text-center py-5 text-muted">
                      <div className="display-5 text-secondary mb-2">📦</div>
                      <h5 className="fw-bold text-dark">No Products Found</h5>
                      <p className="small text-muted mb-0">No items match the selected product filter ({productFilter}).</p>
                    </div>
                  );
                }

                return (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Store & Seller</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedProducts.map((p) => (
                          <tr key={p._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {p.images && p.images.length > 0 ? (
                                  <img src={p.images[0]} alt={p.name} className="rounded border" style={{ width: 42, height: 42, objectFit: 'cover' }} />
                                ) : (
                                  <div className="bg-light text-muted rounded d-flex align-items-center justify-content-center border" style={{ width: 42, height: 42 }}>
                                    <FiPackage size={20} />
                                  </div>
                                )}
                                <div>
                                  <div className="fw-semibold text-dark">{p.name}</div>
                                  <div className="small text-muted" style={{ fontSize: 11 }}>SKU: {p.sku || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div className="fw-semibold text-dark">{p.store?.storeName || 'Store N/A'}</div>
                                {p.seller && (
                                  <div className="small text-muted">{p.seller.firstName} {p.seller.lastName}</div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {p.category?.name || 'Uncategorized'}
                              </span>
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{formatPrice(p.finalPrice)}</div>
                              {p.discount > 0 && (
                                <div className="small text-success" style={{ fontSize: 11 }}>{p.discount}% OFF</div>
                              )}
                            </td>
                            <td>
                              <span className={`fw-semibold ${p.stock === 0 ? 'text-danger' : 'text-dark'}`}>
                                {p.stock}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${p.status === 'active' ? 'bg-success' : p.status === 'out_of_stock' ? 'bg-warning text-dark' : 'bg-secondary'} px-2 py-1`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                  onClick={() => handleViewProductDetails(p._id)}
                                  title="View Product Details"
                                >
                                  <FiEye size={14} /> View
                                </button>

                                {p.status !== 'active' ? (
                                  <button
                                    className="btn btn-sm btn-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleProductStatusChange(p._id, 'active')}
                                    disabled={productActionLoadingId === p._id || p.stock === 0}
                                    title={p.stock === 0 ? 'Cannot activate out-of-stock product' : 'Activate Product'}
                                  >
                                    {productActionLoadingId === p._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiCheck size={14} /> Activate
                                      </>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1"
                                    onClick={() => handleProductStatusChange(p._id, 'inactive')}
                                    disabled={productActionLoadingId === p._id}
                                  >
                                    {productActionLoadingId === p._id ? (
                                      <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : (
                                      <>
                                        <FiX size={14} /> Deactivate
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Admin Product Details Inspection Modal */}
          {selectedProduct && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header border-bottom-0 pb-0">
                    <h5 className="modal-title fw-bold text-dark">Admin Product Moderation View</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedProduct(null)} />
                  </div>
                  <div className="modal-body p-4">
                    <div className="row g-4">
                      {/* Product Image preview */}
                      <div className="col-12 col-md-5">
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                          <div>
                            <img
                              src={selectedProduct.images[0]}
                              alt={selectedProduct.name}
                              className="img-fluid rounded-3 border mb-2 shadow-sm w-100"
                              style={{ maxHeight: 250, objectFit: 'cover' }}
                            />
                            <div className="d-flex gap-2 flex-wrap">
                              {selectedProduct.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt=""
                                  className="rounded border"
                                  style={{ width: 48, height: 48, objectFit: 'cover' }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-light rounded-3 p-5 text-center text-muted border">
                            <FiPackage size={48} />
                            <p className="small mb-0 mt-2">No product images uploaded</p>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="col-12 col-md-7">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h4 className="fw-bold text-dark mb-0">{selectedProduct.name}</h4>
                          <span className={`badge ${selectedProduct.status === 'active' ? 'bg-success' : selectedProduct.status === 'out_of_stock' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {selectedProduct.status}
                          </span>
                        </div>

                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span className="fs-4 fw-bold text-primary" style={{ color: '#4F46E5' }}>{formatPrice(selectedProduct.finalPrice)}</span>
                          {selectedProduct.discount > 0 && (
                            <>
                              <span className="text-muted text-decoration-line-through small">{formatPrice(selectedProduct.price)}</span>
                              <span className="badge bg-danger-subtle text-danger">{selectedProduct.discount}% OFF</span>
                            </>
                          )}
                        </div>

                        <div className="bg-light p-3 rounded-3 mb-3 border">
                          <div className="row g-2 small">
                            <div className="col-6">
                              <span className="text-muted d-block">Category</span>
                              <span className="fw-semibold text-dark">{selectedProduct.category?.name || 'N/A'}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted d-block">Current Stock</span>
                              <span className={`fw-bold ${selectedProduct.stock === 0 ? 'text-danger' : 'text-dark'}`}>{selectedProduct.stock} units</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted d-block">SKU</span>
                              <code className="text-dark bg-white px-1 rounded border">{selectedProduct.sku || 'N/A'}</code>
                            </div>
                            <div className="col-6">
                              <span className="text-muted d-block">Brand</span>
                              <span className="fw-semibold text-dark">{selectedProduct.brand || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Store & Seller Details */}
                        <div className="bg-light p-3 rounded-3 mb-3 border">
                          <div className="fw-semibold text-dark mb-2 text-uppercase small" style={{ fontSize: 11 }}>Store & Seller Profile</div>
                          <div className="row g-2 small">
                            <div className="col-6">
                              <span className="text-muted d-block">Store Name</span>
                              <span className="fw-bold text-dark">{selectedProduct.store?.storeName || 'N/A'}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted d-block">Store Status</span>
                              <span className={`badge ${selectedProduct.store?.status === 'active' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {selectedProduct.store?.status || 'N/A'}
                              </span>
                            </div>
                            <div className="col-12 border-top pt-2">
                              <span className="text-muted d-block">Seller Name</span>
                              <span className="fw-bold text-dark">
                                {selectedProduct.seller ? `${selectedProduct.seller.firstName} ${selectedProduct.seller.lastName}` : 'N/A'}
                              </span>
                              {selectedProduct.seller?.email && (
                                <span className="text-muted d-block">{selectedProduct.seller.email}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-muted small d-block mb-1 fw-semibold">Description</span>
                          <p className="small text-secondary bg-light p-3 rounded border mb-0" style={{ maxHeight: 120, overflowY: 'auto' }}>
                            {selectedProduct.description || 'No description provided.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2 justify-content-end mt-4 border-top pt-3">
                      {selectedProduct.status !== 'active' ? (
                        <button
                          className="btn btn-success rounded-pill px-4 fw-bold"
                          onClick={() => handleProductStatusChange(selectedProduct._id, 'active')}
                          disabled={productActionLoadingId === selectedProduct._id || selectedProduct.stock === 0}
                        >
                          Activate Product Listing
                        </button>
                      ) : (
                        <button
                          className="btn btn-outline-danger rounded-pill px-4 fw-bold"
                          onClick={() => handleProductStatusChange(selectedProduct._id, 'inactive')}
                          disabled={productActionLoadingId === selectedProduct._id}
                        >
                          Deactivate Product Listing
                        </button>
                      )}
                      <button className="btn btn-light rounded-pill px-4" onClick={() => setSelectedProduct(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ORDERS & REVENUE */}
          {activeTab === 'orders' && (
            <div>
              {/* Revenue Stats KPI Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Total Revenue</span>
                      <FiDollarSign className="text-success" />
                    </div>
                    <div className="fs-3 fw-bold text-success my-1">
                      {loadingAdminOrders ? (
                        <div className="spinner-border spinner-border-sm text-success" role="status" />
                      ) : (
                        formatPrice(revenueStats?.revenue?.totalRevenue || 0)
                      )}
                    </div>
                    <div className="small text-muted">From paid transactions</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Paid Orders</span>
                      <FiCheckCircle className="text-primary" />
                    </div>
                    <div className="display-6 fw-bold text-primary my-1">
                      {loadingAdminOrders ? (
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                      ) : (
                        revenueStats?.revenue?.totalPaidOrders ?? 0
                      )}
                    </div>
                    <div className="small text-muted">Completed payments</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Total Orders</span>
                      <FiPackage className="text-info" />
                    </div>
                    <div className="display-6 fw-bold text-info my-1">
                      {loadingAdminOrders ? (
                        <div className="spinner-border spinner-border-sm text-info" role="status" />
                      ) : (
                        revenueStats?.orders?.total ?? adminOrders.length
                      )}
                    </div>
                    <div className="small text-muted">All-time order count</div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                    <div className="d-flex align-items-center justify-content-between text-muted small fw-semibold mb-1">
                      <span>Delivered Orders</span>
                      <FiCheck className="text-success" />
                    </div>
                    <div className="display-6 fw-bold text-success my-1">
                      {loadingAdminOrders ? (
                        <div className="spinner-border spinner-border-sm text-success" role="status" />
                      ) : (
                        adminOrders.filter(o => o.orderStatus === 'delivered').length
                      )}
                    </div>
                    <div className="small text-muted">Successfully fulfilled</div>
                  </div>
                </div>
              </div>

              {/* Order Status Filters & Table Header */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3 gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-0">Platform Orders Management</h5>
                    <p className="small text-muted mb-0">Inspect customer purchases, track fulfillment, and update order statuses.</p>
                  </div>
                  <button className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1" onClick={fetchAdminOrdersData}>
                    <FiRefreshCw size={14} /> Refresh Orders
                  </button>
                </div>

                {/* Status Filter Buttons */}
                <div className="d-flex gap-2 flex-wrap mb-4">
                  {[
                    { id: 'all', label: 'All Orders' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'confirmed', label: 'Confirmed' },
                    { id: 'processing', label: 'Processing' },
                    { id: 'shipped', label: 'Shipped' },
                    { id: 'delivered', label: 'Delivered' },
                    { id: 'cancelled', label: 'Cancelled' },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 fw-semibold ${adminOrderFilter === f.id ? 'btn-primary' : 'btn-light text-secondary'}`}
                      style={adminOrderFilter === f.id ? { background: '#4F46E5', borderColor: '#4F46E5' } : {}}
                      onClick={() => setAdminOrderFilter(f.id)}
                    >
                      {f.label} ({f.id === 'all' ? adminOrders.length : adminOrders.filter(o => o.orderStatus === f.id).length})
                    </button>
                  ))}
                </div>

                {/* Orders Table */}
                {loadingAdminOrders ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="text-muted small mt-2">Loading platform orders...</p>
                  </div>
                ) : adminOrders.length === 0 ? (
                  <div className="text-center py-5 bg-light rounded-4">
                    <p className="text-muted mb-0">No platform orders found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="small text-uppercase text-muted">Order #</th>
                          <th className="small text-uppercase text-muted">Customer</th>
                          <th className="small text-uppercase text-muted">Date</th>
                          <th className="small text-uppercase text-muted">Amount</th>
                          <th className="small text-uppercase text-muted">Payment</th>
                          <th className="small text-uppercase text-muted">Order Status</th>
                          <th className="text-end small text-uppercase text-muted">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminOrders
                          .filter(o => adminOrderFilter === 'all' || o.orderStatus === adminOrderFilter)
                          .map(order => {
                            const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest / Deleted User';
                            return (
                              <tr key={order._id}>
                                <td>
                                  <span className="fw-bold text-dark font-monospace">{order.orderNumber}</span>
                                </td>
                                <td>
                                  <div className="fw-semibold text-dark">{customerName}</div>
                                  {order.user?.email && <span className="text-muted small d-block">{order.user.email}</span>}
                                </td>
                                <td>
                                  <span className="small text-secondary">
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-bold text-primary">{formatPrice(order.totalAmount)}</span>
                                </td>
                                <td>
                                  <div className="d-flex flex-column">
                                    <span className="small fw-semibold text-uppercase">{order.paymentMethod}</span>
                                    <span className={`badge rounded-pill ${order.paymentStatus === 'paid' ? 'bg-success-subtle text-success' : order.paymentStatus === 'failed' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-dark'}`} style={{ width: 'fit-content', fontSize: 10 }}>
                                      {order.paymentStatus}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge rounded-pill ${
                                    order.orderStatus === 'delivered' ? 'bg-success' :
                                    order.orderStatus === 'cancelled' ? 'bg-danger' :
                                    order.orderStatus === 'shipped' ? 'bg-info text-dark' :
                                    order.orderStatus === 'processing' ? 'bg-primary' :
                                    order.orderStatus === 'confirmed' ? 'bg-primary-subtle text-primary' : 'bg-warning text-dark'
                                  } px-3 py-2 text-capitalize`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                    onClick={() => handleViewAdminOrderDetails(order._id)}
                                  >
                                    <FiEye size={14} /> View & Manage
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADMIN ORDER DETAILS & STATUS UPDATE MODAL */}
          {selectedAdminOrder && (
            <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                  <div className="modal-header bg-dark text-white py-3">
                    <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                      <FiPackage /> Order #{selectedAdminOrder.orderNumber}
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedAdminOrder(null)} />
                  </div>

                  <div className="modal-body p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                    {/* Status update banner */}
                    <div className="card border-primary mb-4 bg-primary-subtle rounded-3 p-3">
                      <h6 className="fw-bold text-primary mb-2">Update Order Status</h6>
                      <div className="row g-2 align-items-center">
                        <div className="col-md-5">
                          <select
                            className="form-select form-select-sm fw-semibold"
                            value={newOrderStatus}
                            onChange={(e) => setNewOrderStatus(e.target.value)}
                            disabled={selectedAdminOrder.orderStatus === 'cancelled'}
                          >
                            <option value="pending">pending</option>
                            <option value="confirmed">confirmed</option>
                            <option value="processing">processing</option>
                            <option value="shipped">shipped</option>
                            <option value="delivered">delivered</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </div>

                        {newOrderStatus === 'cancelled' && (
                          <div className="col-md-7">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Reason for cancellation (optional)"
                              value={cancellationReasonInput}
                              onChange={(e) => setCancellationReasonInput(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="col-12 mt-2">
                          {selectedAdminOrder.orderStatus === 'cancelled' ? (
                            <div className="alert alert-warning py-2 mb-0 small">
                              ⚠️ Cancelled orders cannot be updated.
                            </div>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm rounded-pill px-4 fw-bold"
                              onClick={() => handleUpdateOrderStatusSubmit(selectedAdminOrder._id, newOrderStatus, cancellationReasonInput)}
                              disabled={updatingOrderStatusId === selectedAdminOrder._id}
                            >
                              {updatingOrderStatusId === selectedAdminOrder._id ? 'Saving Changes...' : 'Save New Status'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      {/* Customer Info */}
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 border h-100">
                          <div className="fw-semibold text-dark mb-2 text-uppercase small" style={{ fontSize: 11 }}>Customer Profile</div>
                          <div className="fw-bold text-dark">
                            {selectedAdminOrder.user ? `${selectedAdminOrder.user.firstName} ${selectedAdminOrder.user.lastName}` : 'N/A'}
                          </div>
                          <div className="small text-muted">{selectedAdminOrder.user?.email}</div>
                          <div className="small text-muted">{selectedAdminOrder.user?.phone}</div>
                        </div>
                      </div>

                      {/* Payment & Shipping Summary */}
                      <div className="col-md-6">
                        <div className="bg-light p-3 rounded-3 border h-100">
                          <div className="fw-semibold text-dark mb-2 text-uppercase small" style={{ fontSize: 11 }}>Payment & Delivery Summary</div>
                          <div className="small d-flex justify-content-between mb-1">
                            <span className="text-muted">Payment Method:</span>
                            <span className="fw-bold text-uppercase">{selectedAdminOrder.paymentMethod}</span>
                          </div>
                          <div className="small d-flex justify-content-between mb-1">
                            <span className="text-muted">Payment Status:</span>
                            <span className={`badge ${selectedAdminOrder.paymentStatus === 'paid' ? 'bg-success' : 'bg-secondary'}`}>{selectedAdminOrder.paymentStatus}</span>
                          </div>
                          <div className="small d-flex justify-content-between">
                            <span className="text-muted">Total Amount:</span>
                            <span className="fw-bold text-primary">{formatPrice(selectedAdminOrder.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {selectedAdminOrder.shippingAddress && (
                      <div className="bg-light p-3 rounded-3 mb-4 border">
                        <div className="fw-semibold text-dark mb-1 text-uppercase small" style={{ fontSize: 11 }}>Shipping Address</div>
                        <div className="small text-secondary">
                          <strong>{selectedAdminOrder.shippingAddress.fullName}</strong> ({selectedAdminOrder.shippingAddress.phone})<br />
                          {selectedAdminOrder.shippingAddress.addressLine1}, {selectedAdminOrder.shippingAddress.addressLine2 ? selectedAdminOrder.shippingAddress.addressLine2 + ', ' : ''}
                          {selectedAdminOrder.shippingAddress.city}, {selectedAdminOrder.shippingAddress.state} - {selectedAdminOrder.shippingAddress.pincode}
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-3">
                      <div className="fw-semibold text-dark mb-2 text-uppercase small" style={{ fontSize: 11 }}>Purchased Items ({selectedAdminOrder.items?.length || 0})</div>
                      <div className="list-group list-group-flush rounded-3 border">
                        {selectedAdminOrder.items?.map((item, idx) => (
                          <div key={idx} className="list-group-item d-flex align-items-center gap-3 py-3">
                            <img
                              src={item.productImage || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                              alt={item.productName}
                              className="rounded-3 object-fit-cover"
                              style={{ width: 50, height: 50 }}
                            />
                            <div className="flex-grow-1">
                              <div className="fw-bold text-dark small">{item.productName}</div>
                              <div className="small text-muted">
                                Store: {item.store?.storeName || 'N/A'} · Qty: {item.quantity} × {formatPrice(item.price)}
                              </div>
                            </div>
                            <div className="fw-bold text-primary small">
                              {formatPrice(item.total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer bg-light py-2">
                    <button className="btn btn-secondary rounded-pill px-4" onClick={() => setSelectedAdminOrder(null)}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
