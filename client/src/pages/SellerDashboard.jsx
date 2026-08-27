import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiPlusCircle, FiShoppingBag, FiSettings,
  FiEdit, FiTrash2, FiUpload, FiX, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { useAuth } from '../context/AuthContext';
import { getMyStoreApi, createStoreApi, updateMyStoreApi } from '../api/storeApi';
import {
  getProductsApi, createProductApi, updateProductApi, deleteProductApi,
  updateProductStockApi, updateProductDiscountApi, uploadProductImagesApi
} from '../api/productApi';
import { getCategoriesApi } from '../api/categoryApi';
import { formatPrice } from '../utils/helpers';

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Store state
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(true);
  const [storeError, setStoreError] = useState(null);

  // Store edit form
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    description: '',
    gstNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: '',
    },
    logo: '',
    banner: '',
  });

  // Host products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Categories list
  const [categories, setCategories] = useState([]);

  // Modals & Feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // Quick edit states
  const [editingStockId, setEditingStockId] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [discountInput, setDiscountInput] = useState('');

  // Add/Edit product form state
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    discount: '0',
    stock: '',
    sku: '',
    specificationsKey: '',
    specificationsValue: '',
    specifications: {},
  });
  const [productImages, setProductImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Load Host Store
  const fetchMyStore = async () => {
    setLoadingStore(true);
    setStoreError(null);
    try {
      const data = await getMyStoreApi();
      if (data.success && data.store) {
        setStore(data.store);
        const addr = data.store.address;
        setStoreForm({
          storeName: data.store.storeName || '',
          description: data.store.description || '',
          gstNumber: data.store.gstNumber || '',
          address: (addr && typeof addr === 'object') ? {
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            country: addr.country || '',
          } : {
            street: typeof addr === 'string' ? addr : '',
            city: '',
            state: '',
            pincode: '',
            country: '',
          },
          logo: data.store.logo || '',
          banner: data.store.banner || '',
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStore(null);
      } else {
        setStoreError(err.response?.data?.message || 'Failed to fetch store details.');
      }
    } finally {
      setLoadingStore(false);
    }
  };

  // Load Host Products
  const fetchMyProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await getProductsApi();
      if (data.success && data.products) {
        // Filter products where seller ID matches current host ID
        const myProds = data.products.filter(p => {
          const sellerId = p.seller?._id || p.seller;
          return String(sellerId) === String(user?.id || user?._id);
        });
        setProducts(myProds);
      }
    } catch (err) {
      console.error('Failed to load host products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load Categories
  const fetchCategories = async () => {
    try {
      const data = await getCategoriesApi();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    fetchMyStore();
    fetchMyProducts();
    fetchCategories();
  }, []);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  // Handle Store Save / Create
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (store) {
        const data = await updateMyStoreApi(storeForm);
        if (data.success) {
          setStore(data.store);
          showToast('success', 'Store details updated successfully!');
        }
      } else {
        const data = await createStoreApi(storeForm);
        if (data.success) {
          setStore(data.store);
          showToast('success', 'Store created successfully!');
        }
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to save store details.');
    }
  };

  // Add Specification pair
  const handleAddSpec = () => {
    if (productForm.specificationsKey.trim() && productForm.specificationsValue.trim()) {
      setProductForm(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [prev.specificationsKey.trim()]: prev.specificationsValue.trim(),
        },
        specificationsKey: '',
        specificationsValue: '',
      }));
    }
  };

  const handleRemoveSpec = (key) => {
    setProductForm(prev => {
      const updated = { ...prev.specifications };
      delete updated[key];
      return { ...prev, specifications: updated };
    });
  };

  // Handle Product Create / Update
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!store || store.status !== 'active') {
      showToast('danger', 'You must have an active store before managing products.');
      return;
    }

    try {
      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        category: productForm.category,
        brand: productForm.brand.trim(),
        price: Number(productForm.price),
        discount: Number(productForm.discount || 0),
        stock: Number(productForm.stock),
        sku: productForm.sku.trim(),
        specifications: productForm.specifications,
      };

      let createdOrUpdated;
      if (editingProduct) {
        const data = await updateProductApi(editingProduct._id, payload);
        createdOrUpdated = data.product;
        showToast('success', 'Product updated successfully!');
      } else {
        const data = await createProductApi(payload);
        createdOrUpdated = data.product;
        showToast('success', 'Product created successfully!');
      }

      // Handle Image Upload if any images selected
      if (createdOrUpdated && productImages.length > 0) {
        setUploadingImages(true);
        const formData = new FormData();
        for (const file of productImages) {
          formData.append('images', file);
        }
        await uploadProductImagesApi(createdOrUpdated._id, formData);
        setUploadingImages(false);
        showToast('success', 'Product images uploaded successfully!');
      }

      // Reset Form & Switch Tab
      setProductForm({
        name: '', description: '', category: '', brand: '',
        price: '', discount: '0', stock: '', sku: '',
        specificationsKey: '', specificationsValue: '', specifications: {},
      });
      setProductImages([]);
      setEditingProduct(null);
      fetchMyProducts();
      setActiveTab('products');
    } catch (err) {
      setUploadingImages(false);
      showToast('danger', err.response?.data?.message || 'Failed to save product.');
    }
  };

  // Handle Delete Product
  const confirmDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await deleteProductApi(deleteProductTarget._id);
      showToast('success', 'Product deleted successfully!');
      setDeleteProductTarget(null);
      fetchMyProducts();
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Quick Stock PATCH Update
  const handleQuickStockUpdate = async (prodId) => {
    try {
      await updateProductStockApi(prodId, Number(stockInput));
      showToast('success', 'Stock updated!');
      setEditingStockId(null);
      fetchMyProducts();
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update stock.');
    }
  };

  // Quick Discount PATCH Update
  const handleQuickDiscountUpdate = async (prodId) => {
    try {
      await updateProductDiscountApi(prodId, Number(discountInput));
      showToast('success', 'Discount updated!');
      setEditingDiscountId(null);
      fetchMyProducts();
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to update discount.');
    }
  };

  const activeCount = products.filter(p => p.stock > 0 && p.status === 'active').length;
  const outOfStockCount = products.filter(p => p.stock === 0 || p.status === 'out_of_stock').length;

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100 py-4">
        <div className="container">
          
          {/* Feedback Toast Banner */}
          {feedback.message && (
            <div className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center gap-2`} role="alert">
              <FiAlertCircle />
              <div>{feedback.message}</div>
              <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', message: '' })} />
            </div>
          )}

          {/* Host Header */}
          <div className="bg-dark text-white rounded-4 p-4 mb-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
              <div>
                <span className="badge bg-warning text-dark mb-2 text-uppercase fw-bold" style={{ fontSize: 10 }}>Seller Central</span>
                <h2 className="fw-bold mb-1">{store ? store.storeName : 'Host Dashboard'}</h2>
                <p className="small text-white-50 mb-0">Manage your store details, inventory, pricing, and products.</p>
              </div>
              <div>
                <button
                  className="btn btn-primary fw-bold rounded-pill px-4"
                  style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      name: '', description: '', category: '', brand: '',
                      price: '', discount: '0', stock: '', sku: '',
                      specificationsKey: '', specificationsValue: '', specifications: {},
                    });
                    setActiveTab('add-product');
                  }}
                >
                  <FiPlusCircle className="me-2" /> Add New Product
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-pills bg-white p-2 rounded-4 shadow-sm mb-4 gap-2 border">
            {[
              { id: 'overview', label: 'Overview', icon: FiGrid },
              { id: 'store', label: 'My Store', icon: FiSettings },
              { id: 'products', label: 'Products List', icon: FiPackage },
              { id: 'add-product', label: editingProduct ? 'Edit Product' : 'Add Product', icon: FiPlusCircle },
              { id: 'orders', label: 'Orders (Pending)', icon: FiShoppingBag },
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
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                    <div className="text-muted small fw-semibold">Total Products</div>
                    <div className="display-6 fw-bold text-dark my-1">{products.length}</div>
                    <div className="small text-muted">In inventory</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                    <div className="text-muted small fw-semibold">Active Products</div>
                    <div className="display-6 fw-bold text-success my-1">{activeCount}</div>
                    <div className="small text-muted">Ready to sell</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                    <div className="text-muted small fw-semibold">Out of Stock</div>
                    <div className="display-6 fw-bold text-danger my-1">{outOfStockCount}</div>
                    <div className="small text-muted">Needs replenishment</div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                    <div className="text-muted small fw-semibold">Store Rating</div>
                    <div className="display-6 fw-bold text-warning my-1">
                      ⭐ {store?.rating || '4.8'}
                    </div>
                    <div className="small text-muted">Customer rating</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
                <h5 className="fw-bold text-dark mb-3">Quick Actions</h5>
                <div className="d-flex gap-3 flex-wrap">
                  <button className="btn btn-outline-primary rounded-3 fw-semibold" onClick={() => setActiveTab('store')}>
                    Manage Store Profile
                  </button>
                  <button className="btn btn-outline-primary rounded-3 fw-semibold" onClick={() => setActiveTab('products')}>
                    View Inventory List
                  </button>
                  <button className="btn btn-primary rounded-3 fw-semibold" style={{ background: '#4F46E5' }} onClick={() => setActiveTab('add-product')}>
                    Add Product
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY STORE */}
          {activeTab === 'store' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold text-dark mb-4">Store Management</h4>

              {loadingStore ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : (
                <form onSubmit={handleStoreSubmit}>
                  {storeError && (
                    <div className="alert alert-warning mb-4">{storeError}</div>
                  )}

                  {!store && (
                    <div className="alert alert-info mb-4">
                      You haven't set up a store yet! Complete the form below to create your official host store.
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Store Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Acme Superstore"
                        value={storeForm.storeName}
                        onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">GST Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 22AAAAA0000A1Z5"
                        value={storeForm.gstNumber}
                        onChange={(e) => setStoreForm({ ...storeForm, gstNumber: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Store Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Describe your store..."
                        value={storeForm.description}
                        onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                      />
                    </div>

                    {/* Structured Address Fields */}
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Street Address</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Main Market, Sector 15"
                        value={storeForm.address?.street || ''}
                        onChange={(e) => setStoreForm({
                          ...storeForm,
                          address: { ...storeForm.address, street: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Noida"
                        value={storeForm.address?.city || ''}
                        onChange={(e) => setStoreForm({
                          ...storeForm,
                          address: { ...storeForm.address, city: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">State</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Uttar Pradesh"
                        value={storeForm.address?.state || ''}
                        onChange={(e) => setStoreForm({
                          ...storeForm,
                          address: { ...storeForm.address, state: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Pincode</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 201301"
                        value={storeForm.address?.pincode || ''}
                        onChange={(e) => setStoreForm({
                          ...storeForm,
                          address: { ...storeForm.address, pincode: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. India"
                        value={storeForm.address?.country || ''}
                        onChange={(e) => setStoreForm({
                          ...storeForm,
                          address: { ...storeForm.address, country: e.target.value }
                        })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Logo URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://..."
                        value={storeForm.logo}
                        onChange={(e) => setStoreForm({ ...storeForm, logo: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Banner URL</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://..."
                        value={storeForm.banner}
                        onChange={(e) => setStoreForm({ ...storeForm, banner: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold" style={{ background: '#4F46E5' }}>
                      {store ? 'Save Store Changes' : 'Create My Store'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h4 className="fw-bold text-dark mb-0">My Products ({products.length})</h4>
                <button className="btn btn-sm btn-primary rounded-pill fw-bold" style={{ background: '#4F46E5' }} onClick={() => {
                  setEditingProduct(null);
                  setActiveTab('add-product');
                }}>
                  + Add Product
                </button>
              </div>

              {loadingProducts ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4">
                  <div className="display-4 text-muted mb-2">📦</div>
                  <h5 className="fw-bold text-dark">No Products Found</h5>
                  <p className="text-muted small">You haven't listed any products under your store yet.</p>
                  <button className="btn btn-primary rounded-pill btn-sm fw-bold" style={{ background: '#4F46E5' }} onClick={() => setActiveTab('add-product')}>
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Final Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod._id}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                                alt=""
                                className="rounded-3 object-fit-cover"
                                style={{ width: 44, height: 44 }}
                              />
                              <div>
                                <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 180 }}>{prod.name}</div>
                                <div className="small text-muted">SKU: {prod.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {prod.category?.name || 'General'}
                            </span>
                          </td>
                          <td className="fw-semibold">{formatPrice(prod.price)}</td>
                          <td>
                            {editingDiscountId === prod._id ? (
                              <div className="d-flex align-items-center gap-1">
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  style={{ width: 60 }}
                                  value={discountInput}
                                  onChange={(e) => setDiscountInput(e.target.value)}
                                />
                                <button className="btn btn-sm btn-success p-1" onClick={() => handleQuickDiscountUpdate(prod._id)}>
                                  <FiCheck />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-dark"
                                onClick={() => {
                                  setEditingDiscountId(prod._id);
                                  setDiscountInput(String(prod.discount || 0));
                                }}
                                title="Click to edit discount"
                              >
                                {prod.discount || 0}% ✏️
                              </button>
                            )}
                          </td>
                          <td className="fw-bold text-success">{formatPrice(prod.finalPrice)}</td>
                          <td>
                            {editingStockId === prod._id ? (
                              <div className="d-flex align-items-center gap-1">
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  style={{ width: 60 }}
                                  value={stockInput}
                                  onChange={(e) => setStockInput(e.target.value)}
                                />
                                <button className="btn btn-sm btn-success p-1" onClick={() => handleQuickStockUpdate(prod._id)}>
                                  <FiCheck />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none text-dark"
                                onClick={() => {
                                  setEditingStockId(prod._id);
                                  setStockInput(String(prod.stock || 0));
                                }}
                                title="Click to edit stock"
                              >
                                <span className={prod.stock === 0 ? 'text-danger fw-bold' : 'fw-semibold'}>
                                  {prod.stock} ✏️
                                </span>
                              </button>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${prod.status === 'active' ? 'bg-success' : prod.status === 'out_of_stock' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                              {prod.status}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => {
                                setEditingProduct(prod);
                                setProductForm({
                                  name: prod.name,
                                  description: prod.description,
                                  category: prod.category?._id || prod.category,
                                  brand: prod.brand || '',
                                  price: String(prod.price),
                                  discount: String(prod.discount || 0),
                                  stock: String(prod.stock),
                                  sku: prod.sku,
                                  specificationsKey: '',
                                  specificationsValue: '',
                                  specifications: prod.specifications || {},
                                });
                                setActiveTab('add-product');
                              }}
                            >
                              <FiEdit /> Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setDeleteProductTarget(prod)}
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADD / EDIT PRODUCT */}
          {activeTab === 'add-product' && (
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h4 className="fw-bold text-dark mb-4">
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h4>

              <form onSubmit={handleProductSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Product Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Product title"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Category *</label>
                    <select
                      className="form-select"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                    >
                      <option value="">Select active category...</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Brand</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Samsung, Apple"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">SKU *</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. PROD-1001"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      required
                      disabled={!!editingProduct}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Original Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Discount (%)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Initial Stock *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="10"
                      min="0"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Product Description *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Detailed product features and information..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* Key-Value Specifications */}
                  <div className="col-12 border-top pt-3 mt-3">
                    <label className="form-label fw-semibold small mb-2">Specifications</label>
                    <div className="row g-2 mb-2">
                      <div className="col-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Key (e.g. RAM, Warranty)"
                          value={productForm.specificationsKey}
                          onChange={(e) => setProductForm({ ...productForm, specificationsKey: e.target.value })}
                        />
                      </div>
                      <div className="col-5">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Value (e.g. 16GB, 1 Year)"
                          value={productForm.specificationsValue}
                          onChange={(e) => setProductForm({ ...productForm, specificationsValue: e.target.value })}
                        />
                      </div>
                      <div className="col-2">
                        <button type="button" className="btn btn-sm btn-outline-secondary w-100" onClick={handleAddSpec}>
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {Object.entries(productForm.specifications).map(([k, v]) => (
                        <span key={k} className="badge bg-light text-dark border p-2 d-flex align-items-center gap-2">
                          <strong>{k}:</strong> {v}
                          <FiX className="cursor-pointer text-danger" onClick={() => handleRemoveSpec(k)} />
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Multi-Image File Input */}
                  <div className="col-12 border-top pt-3 mt-3">
                    <label className="form-label fw-semibold small">Product Images (Up to 5)</label>
                    <input
                      type="file"
                      className="form-control"
                      multiple
                      accept="image/*"
                      onChange={(e) => setProductImages(Array.from(e.target.files).slice(0, 5))}
                    />
                    <div className="form-text">Selected {productImages.length} images for upload via Cloudinary.</div>
                  </div>
                </div>

                <div className="mt-4 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-pill fw-bold"
                    style={{ background: '#4F46E5' }}
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? 'Uploading Images...' : editingProduct ? 'Save Product Changes' : 'Publish Product'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-light px-4 rounded-pill fw-semibold"
                    onClick={() => {
                      setEditingProduct(null);
                      setActiveTab('products');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: ORDERS (COMING SOON) */}
          {activeTab === 'orders' && (
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
              <div className="display-4 text-muted mb-3">🛠️</div>
              <h4 className="fw-bold text-dark">Order Management API Pending</h4>
              <p className="text-muted small">
                Host store order placement and fulfillment APIs are coming soon in the next backend update.
              </p>
              <div className="badge bg-warning text-dark px-3 py-2 rounded-pill mx-auto">
                Backend Integration Pending
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete Product Confirmation Modal */}
      {deleteProductTarget && (
        <div className="position-fixed inset-0 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center z-3 p-3" style={{ zIndex: 1070 }}>
          <div className="bg-white rounded-4 p-4 shadow-lg" style={{ maxWidth: 400, width: '100%' }}>
            <h5 className="fw-bold text-dark mb-2">Delete Product?</h5>
            <p className="text-secondary small mb-4">
              Are you sure you want to delete "<strong>{deleteProductTarget.name}</strong>"? This action will set product status to inactive.
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-light rounded-pill px-3" onClick={() => setDeleteProductTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-danger rounded-pill px-3 fw-bold" onClick={confirmDeleteProduct}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
