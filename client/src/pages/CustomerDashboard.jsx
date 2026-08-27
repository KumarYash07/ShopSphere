import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiHeart, FiMapPin, FiUser,
  FiSettings, FiLogOut, FiShoppingCart, FiPlus,
  FiTrash2, FiEdit, FiCheckCircle, FiX, FiAlertCircle
} from 'react-icons/fi';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';
import {
  getAddressesApi,
  addAddressApi,
  updateAddressApi,
  deleteAddressApi,
  setDefaultAddressApi
} from '../api/addressApi';
import { getMyOrdersApi } from '../api/orderApi';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Address Book State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Order History State
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrdersList, setLoadingOrdersList] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'home',
    isDefault: false,
  });

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await getAddressesApi();
      if (data.success && Array.isArray(data.addresses)) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchOrdersList = async () => {
    setLoadingOrdersList(true);
    try {
      const data = await getMyOrdersApi();
      if (data.success && Array.isArray(data.orders)) {
        setOrdersList(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders list:', err);
    } finally {
      setLoadingOrdersList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    } else if (activeTab === 'orders') {
      fetchOrdersList();
    }
  }, [activeTab]);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      addressType: 'home',
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      landmark: addr.landmark || '',
      addressType: addr.addressType || 'home',
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      showToast('danger', 'Please fill in all required address fields.');
      return;
    }
    setSavingAddress(true);
    try {
      if (editingAddress) {
        const data = await updateAddressApi(editingAddress._id, addressForm);
        if (data.success) {
          showToast('success', 'Address updated successfully!');
        }
      } else {
        const data = await addAddressApi(addressForm);
        if (data.success) {
          showToast('success', 'Address added successfully!');
        }
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const data = await deleteAddressApi(id);
      if (data.success) {
        showToast('success', 'Address deleted successfully.');
        fetchAddresses();
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const data = await setDefaultAddressApi(id);
      if (data.success) {
        showToast('success', 'Default address updated.');
        fetchAddresses();
      }
    } catch (err) {
      showToast('danger', err.response?.data?.message || 'Failed to set default address.');
    }
  };

  const userName = user ? (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.name || user.email) : '';
  const userAvatar = user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=4F46E5&color=fff`;

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100 py-4">
        <div className="container">
          
          {/* Feedback Banner */}
          {feedback.message && (
            <div className={`alert alert-${feedback.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-4`} role="alert">
              <FiAlertCircle />
              <div>{feedback.message}</div>
              <button type="button" className="btn-close" onClick={() => setFeedback({ type: '', message: '' })} />
            </div>
          )}

          {/* User Header */}
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4 border">
            <div className="d-flex align-items-center gap-3">
              <img
                src={userAvatar}
                alt={userName}
                className="rounded-circle object-fit-cover border border-3 border-primary"
                style={{ width: 64, height: 64 }}
              />
              <div>
                <h3 className="fw-bold text-dark mb-0">{userName}</h3>
                <p className="text-muted small mb-1">{user?.email}</p>
                <span className="badge bg-primary-subtle text-primary fw-bold text-capitalize" style={{ background: '#eef2ff', color: '#4F46E5' }}>
                  Customer Account
                </span>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Sidebar Navigation */}
            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="nav nav-pills flex-column gap-2">
                  {[
                    { id: 'profile', label: 'My Profile', icon: FiUser },
                    { id: 'orders', label: 'My Orders', icon: FiPackage },
                    { id: 'cart', label: 'My Cart', icon: FiShoppingCart },
                    { id: 'wishlist', label: 'My Wishlist', icon: FiHeart },
                    { id: 'addresses', label: 'Saved Addresses', icon: FiMapPin },
                    { id: 'settings', label: 'Settings', icon: FiSettings },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`nav-link text-start fw-semibold d-flex align-items-center gap-2 rounded-3 ${activeTab === tab.id ? 'active bg-primary' : 'text-dark'}`}
                        style={activeTab === tab.id ? { background: '#4F46E5' } : {}}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon size={16} /> {tab.label}
                      </button>
                    );
                  })}

                  <div className="border-top pt-2 mt-2">
                    <button
                      className="btn btn-link text-danger w-100 text-start text-decoration-none fw-semibold d-flex align-items-center gap-2 p-2"
                      onClick={logout}
                    >
                      <FiLogOut /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Pane */}
            <div className="col-12 col-md-9">
              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h4 className="fw-bold text-dark mb-4">Account Profile</h4>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">First Name</label>
                      <input type="text" className="form-control" value={user?.firstName || ''} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Last Name</label>
                      <input type="text" className="form-control" value={user?.lastName || ''} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Email Address</label>
                      <input type="email" className="form-control" value={user?.email || ''} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Phone Number</label>
                      <input type="tel" className="form-control" value={user?.phone || 'Not provided'} readOnly />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Email Verified</label>
                      <div>
                        <span className={`badge ${user?.isEmailVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {user?.isEmailVerified ? '✓ Verified' : 'Pending Verification'}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Account Status</label>
                      <div>
                        <span className="badge bg-info text-dark text-capitalize">
                          {user?.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h4 className="fw-bold text-dark mb-4">My Wishlist ({wishlist.length})</h4>
                  {wishlist.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-4 text-muted mb-2">❤️</div>
                      <h5 className="fw-bold text-dark">Your Wishlist is Empty</h5>
                      <p className="text-muted small">Save items you love to view them later.</p>
                      <Link to="/products" className="btn btn-primary rounded-pill btn-sm fw-bold" style={{ background: '#4F46E5' }}>
                        Browse Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {wishlist.map((product) => (
                        <div key={product._id || product.id} className="col-6 col-md-4">
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CART */}
              {activeTab === 'cart' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h4 className="fw-bold text-dark mb-4">My Cart ({cart.length})</h4>
                  {cart.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="display-4 text-muted mb-2">🛒</div>
                      <h5 className="fw-bold text-dark">Your Cart is Empty</h5>
                      <Link to="/products" className="btn btn-primary rounded-pill btn-sm fw-bold mt-2" style={{ background: '#4F46E5' }}>
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="list-group list-group-flush mb-4">
                        {cart.map((item) => (
                          <div key={item._id || item.id} className="list-group-item d-flex align-items-center justify-content-between py-3">
                            <div className="d-flex align-items-center gap-3">
                              <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'} alt="" className="rounded-3" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                              <div>
                                <h6 className="fw-semibold mb-0">{item.name}</h6>
                                <span className="small text-muted">Qty: {item.qty}</span>
                              </div>
                            </div>
                            <div className="fw-bold text-primary">
                              ₹{(Number(item.finalPrice ?? item.price) * item.qty).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link to="/checkout" className="btn btn-primary rounded-pill fw-bold px-4" style={{ background: '#4F46E5' }}>
                        Proceed to Checkout →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: ORDERS */}
              {activeTab === 'orders' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">My Orders ({ordersList.length})</h4>
                      <p className="small text-muted mb-0">Track and view details of your recent purchases.</p>
                    </div>
                  </div>

                  {loadingOrdersList ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <p className="text-muted small mt-2">Loading order history...</p>
                    </div>
                  ) : ordersList.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4">
                      <div className="display-4 text-muted mb-2">📦</div>
                      <h5 className="fw-bold text-dark">No Orders Found</h5>
                      <p className="text-muted small">You haven't placed any orders yet.</p>
                      <Link to="/products" className="btn btn-primary rounded-pill btn-sm fw-bold mt-2" style={{ background: '#4F46E5' }}>
                        Browse Marketplace
                      </Link>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {ordersList.map((ord) => (
                        <div key={ord._id} className="card border rounded-4 p-3 bg-white">
                          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pb-2 mb-3 border-bottom">
                            <div>
                              <span className="fw-bold text-dark me-2">{ord.orderNumber}</span>
                              <span className="small text-muted">
                                ({ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ''})
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${ord.orderStatus === 'confirmed' || ord.orderStatus === 'delivered' ? 'bg-success' : ord.orderStatus === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'} text-capitalize`}>
                                {ord.orderStatus}
                              </span>
                              <span className="fw-bold text-primary">₹{ord.totalAmount?.toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="mb-2">
                            {ord.items?.map((item, i) => (
                              <div key={i} className="d-flex align-items-center justify-content-between py-1">
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={item.productImage || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'}
                                    alt=""
                                    className="rounded-2"
                                    style={{ width: 40, height: 40, objectFit: 'cover' }}
                                  />
                                  <span className="small fw-semibold">{item.productName} (x{item.quantity})</span>
                                </div>
                                <span className="small text-muted">₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {ord.shippingAddress && (
                            <div className="small text-muted pt-2 border-top">
                              📍 <strong>Ship to:</strong> {ord.shippingAddress.fullName}, {ord.shippingAddress.city} - {ord.shippingAddress.pincode}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SAVED ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">Saved Addresses ({addresses.length})</h4>
                      <p className="small text-muted mb-0">Manage your delivery addresses for seamless checkout.</p>
                    </div>
                    <button
                      className="btn btn-primary rounded-pill btn-sm fw-bold d-flex align-items-center gap-1 px-3"
                      style={{ background: '#4F46E5' }}
                      onClick={handleOpenAddModal}
                    >
                      <FiPlus size={16} /> + Add New Address
                    </button>
                  </div>

                  {loadingAddresses ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" />
                      <p className="text-muted small mt-2">Loading addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4">
                      <div className="display-4 text-muted mb-2">📍</div>
                      <h5 className="fw-bold text-dark">No Saved Addresses Found</h5>
                      <p className="text-muted small">Add your delivery address to enjoy fast, one-click checkout.</p>
                      <button
                        className="btn btn-primary rounded-pill btn-sm fw-bold mt-2"
                        style={{ background: '#4F46E5' }}
                        onClick={handleOpenAddModal}
                      >
                        + Add First Address
                      </button>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {addresses.map((addr) => (
                        <div key={addr._id} className="col-12 col-md-6">
                          <div className={`card h-100 rounded-4 border p-3 ${addr.isDefault ? 'border-primary bg-light' : 'bg-white'}`}>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark">{addr.fullName}</span>
                                <span className="badge bg-secondary text-capitalize small" style={{ fontSize: 10 }}>{addr.addressType}</span>
                              </div>
                              {addr.isDefault ? (
                                <span className="badge bg-success d-flex align-items-center gap-1">
                                  <FiCheckCircle size={10} /> Default
                                </span>
                              ) : (
                                <button
                                  className="btn btn-link btn-sm p-0 text-muted text-decoration-none small"
                                  onClick={() => handleSetDefaultAddress(addr._id)}
                                >
                                  Make Default
                                </button>
                              )}
                            </div>

                            <p className="small text-secondary mb-2" style={{ lineHeight: 1.5 }}>
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                              {addr.landmark ? `Landmark: ${addr.landmark}, ` : ''}
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </p>

                            <div className="small text-muted mb-3">📞 {addr.phone}</div>

                            <div className="d-flex align-items-center justify-content-end gap-2 border-top pt-2 mt-auto">
                              <button
                                className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1"
                                onClick={() => handleOpenEditModal(addr)}
                              >
                                <FiEdit size={12} /> Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-pill px-3 d-flex align-items-center gap-1"
                                onClick={() => handleDeleteAddress(addr._id)}
                              >
                                <FiTrash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <h4 className="fw-bold text-dark mb-4">Account Settings</h4>
                  <p className="text-muted small">Update password and notification preferences.</p>
                  <div className="alert alert-info small">
                    Password update feature coming soon.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  {editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowAddressModal(false)} />
              </div>
              <form onSubmit={handleSaveAddress}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Yash Kumar"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="e.g. 9876543210"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Address Line 1 (Flat, House no., Building, Street) *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Address Line 2 (Area, Colony, Sector)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Indiranagar, Stage 2"
                        value={addressForm.addressLine2}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">City *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Bengaluru"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">State *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Karnataka"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Pincode *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 560001"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Landmark (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Near Metro Station"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Address Type</label>
                      <select
                        className="form-select"
                        value={addressForm.addressType}
                        onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                      >
                        <option value="home">Home (All Day Delivery)</option>
                        <option value="work">Work (Delivery between 9 AM - 6 PM)</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isDefaultCheck"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        />
                        <label className="form-check-label small text-dark fw-semibold" htmlFor="isDefaultCheck">
                          Set as default delivery address
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowAddressModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" style={{ background: '#4F46E5' }} disabled={savingAddress}>
                    {savingAddress ? 'Saving...' : editingAddress ? 'Save Changes' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
