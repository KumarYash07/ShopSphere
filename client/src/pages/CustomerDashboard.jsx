import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiHeart, FiMapPin, FiUser,
  FiSettings, FiLogOut, FiShoppingCart, FiPlus,
  FiTrash2, FiEdit, FiCheckCircle, FiX, FiAlertCircle,
  FiEye, FiEyeOff
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
import {
  changePasswordApi,
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi
} from '../api/authApi';

export default function CustomerDashboard() {
  const { user, role, logout, updateUserProfile, requestEmailChange, verifyEmailChange, createPassword } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialTab = searchParams.get('tab') || (location.pathname === '/settings' ? 'settings' : 'profile');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Email Change Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailStep, setEmailStep] = useState(1); // 1: Request OTP, 2: Verify OTP
  const [newEmailInput, setNewEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const handleRequestEmailChangeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmailInput.trim()) {
      showToast('danger', 'Please enter a valid new email address.');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await requestEmailChange(newEmailInput.trim());
      if (res.success) {
        showToast('success', res.message || 'OTP sent to your new email address.');
        setEmailStep(2);
      } else {
        showToast('danger', res.message || 'Failed to request email change.');
      }
    } catch (err) {
      showToast('danger', 'An error occurred while requesting email change.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChangeSubmit = async (e) => {
    e.preventDefault();
    if (!newEmailInput.trim() || !otpInput.trim()) {
      showToast('danger', 'Please enter both new email and OTP.');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await verifyEmailChange(newEmailInput.trim(), otpInput.trim());
      if (res.success) {
        showToast('success', res.message || 'Email changed and verified successfully!');
        setShowEmailModal(false);
        setNewEmailInput('');
        setOtpInput('');
        setEmailStep(1);
      } else {
        showToast('danger', res.message || 'Failed to verify email change.');
      }
    } catch (err) {
      showToast('danger', 'An error occurred while verifying OTP.');
    } finally {
      setEmailLoading(false);
    }
  };

  // Sync active tab with searchParams URL updates
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || (location.pathname === '/settings' ? 'settings' : null);
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, location.pathname]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleStartEditProfile = () => {
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    });
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.phone.trim()) {
      showToast('danger', 'First name, last name and phone are required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateUserProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
      });

      if (res.success) {
        showToast('success', res.message || 'Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        showToast('danger', res.error || 'Failed to update profile.');
      }
    } catch (err) {
      showToast('danger', 'An error occurred while updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Settings State & Handlers
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [notificationPreferences, setNotificationPreferences] = useState({
    orderUpdates: true,
    deliveryUpdates: true,
    promotional: false,
    emailNotifications: true,
  });
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [savingPreference, setSavingPreference] = useState(null);

  const fetchPreferences = async () => {
    setLoadingPreferences(true);
    try {
      const res = await getNotificationPreferencesApi();
      if (res.success && res.preferences) {
        setNotificationPreferences(res.preferences);
      }
    } catch (err) {
      console.error('Failed to load notification preferences:', err);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    // 1. Frontend validation: required fields
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('danger', 'Please fill in all password fields.');
      return;
    }
    // 2. Frontend validation: password length
    if (passwordForm.newPassword.length < 6) {
      showToast('danger', 'New password must be at least 6 characters long.');
      return;
    }
    // 3. Frontend validation: matching passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('danger', 'New password and confirm password do not match.');
      return;
    }
    // 4. Frontend validation: different from current password
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      showToast('danger', 'New password must be different from current password.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      if (res.success) {
        showToast('success', res.message || 'Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        showToast('danger', res.message || 'Failed to change password.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to change password.';
      showToast('danger', errMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('danger', 'Please fill in both password fields.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('danger', 'Password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('danger', 'New password and confirm password do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await createPassword(passwordForm.newPassword, passwordForm.confirmPassword);
      if (res.success) {
        showToast('success', res.message || 'Password created successfully! You can now sign in with email and password.');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        showToast('danger', res.error || 'Failed to create password.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create password.';
      showToast('danger', errMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleToggleNotification = async (key) => {
    const previousValue = notificationPreferences[key];
    const updatedValue = !previousValue;
    const updatedPrefs = { ...notificationPreferences, [key]: updatedValue };

    // Optimistic UI update
    setNotificationPreferences(updatedPrefs);
    setSavingPreference(key);

    try {
      const res = await updateNotificationPreferencesApi({ [key]: updatedValue });
      if (res.success) {
        showToast('success', res.message || 'Notification preference updated.');
        if (res.preferences) {
          setNotificationPreferences(res.preferences);
        }
      } else {
        // Revert on failure
        setNotificationPreferences(prev => ({ ...prev, [key]: previousValue }));
        showToast('danger', res.message || 'Failed to update notification preference.');
      }
    } catch (err) {
      // Revert on failure
      setNotificationPreferences(prev => ({ ...prev, [key]: previousValue }));
      const errMsg = err.response?.data?.message || 'Failed to update notification preference.';
      showToast('danger', errMsg);
    } finally {
      setSavingPreference(null);
    }
  };

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
    } else if (activeTab === 'settings') {
      fetchPreferences();
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
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'User')}&background=4F46E5&color=fff`;
  const userAvatar = user?.profileImage || fallbackAvatar;
  const userRole = user?.role || role || 'user';
  const roleBadgeLabel = userRole === 'admin' ? 'Admin' : userRole === 'host' ? 'Host / Seller' : 'Customer Account';

  return (
    <>
      <Navbar />
      <div className="bg-light min-vh-100 py-4">
        <div className="container">

          {/* Floating Feedback Toast */}
          {feedback.message && (
            <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1090, marginTop: 70 }}>
              <div
                className={`toast show align-items-center text-white bg-${feedback.type === 'danger' ? 'danger' : feedback.type === 'success' ? 'success' : feedback.type === 'info' ? 'info' : 'primary'} border-0 shadow-lg rounded-3`}
                role="alert"
                style={{ minWidth: 280 }}
              >
                <div className="d-flex p-2 align-items-center">
                  <div className="toast-body d-flex align-items-center gap-2 fw-semibold py-1">
                    <FiAlertCircle size={18} className="flex-shrink-0" />
                    <span>{feedback.message}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white me-2 m-auto"
                    onClick={() => setFeedback({ type: '', message: '' })}
                    aria-label="Close"
                  />
                </div>
              </div>
            </div>
          )}

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
                alt={userName || 'User Profile'}
                referrerPolicy="no-referrer"
                className="rounded-circle object-fit-cover border border-3 border-primary"
                style={{ width: 64, height: 64 }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackAvatar;
                }}
              />
              <div>
                <h3 className="fw-bold text-dark mb-0">{userName}</h3>
                <p className="text-muted small mb-1">{user?.email}</p>
                <span className="badge bg-primary-subtle text-primary fw-bold text-capitalize" style={{ background: '#eef2ff', color: '#4F46E5' }}>
                  {roleBadgeLabel}
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
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-0">Account Profile</h4>
                      <p className="text-muted small mb-0">Manage your personal account information.</p>
                    </div>
                    {!isEditingProfile ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1 fw-bold"
                        onClick={handleStartEditProfile}
                      >
                        <FiEdit size={14} /> Edit Profile
                      </button>
                    ) : (
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-light btn-sm rounded-pill px-3 fw-semibold"
                          onClick={handleCancelEditProfile}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm rounded-pill px-3 fw-bold"
                          style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
                          onClick={handleSaveProfileSubmit}
                          disabled={savingProfile}
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Profile Photo Preview */}
                  <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-4 mb-4 border">
                    <img
                      src={userAvatar}
                      alt={userName || 'Profile Picture'}
                      referrerPolicy="no-referrer"
                      className="rounded-circle object-fit-cover border border-2 border-primary"
                      style={{ width: 64, height: 64 }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackAvatar;
                      }}
                    />
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{userName}</h6>
                      <p className="text-muted small mb-1">{user?.email}</p>
                      {user?.authProvider === 'google' || user?.googleId ? (
                        <span className="badge bg-white text-dark border small d-inline-flex align-items-center gap-1 shadow-xs">
                          <span>Google Profile Image</span>
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary small">
                          Profile Avatar
                        </span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfileSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-semibold">First Name *</label>
                        <input
                          type="text"
                          className={`form-control ${isEditingProfile ? '' : 'bg-light'}`}
                          value={isEditingProfile ? profileForm.firstName : (user?.firstName || '')}
                          onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                          readOnly={!isEditingProfile}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-semibold">Last Name</label>
                        <input
                          type="text"
                          className={`form-control ${isEditingProfile ? '' : 'bg-light'}`}
                          value={isEditingProfile ? profileForm.lastName : (user?.lastName || '')}
                          onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                          readOnly={!isEditingProfile}
                        />
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <label className="form-label text-muted small fw-semibold m-0">Email Address</label>
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-decoration-none small fw-bold"
                            style={{ color: '#4F46E5' }}
                            onClick={() => {
                              setShowEmailModal(true);
                              setEmailStep(1);
                              setNewEmailInput('');
                              setOtpInput('');
                            }}
                          >
                            Change Email →
                          </button>
                        </div>
                        <input type="email" className="form-control bg-light" value={user?.email || ''} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-semibold">Phone Number</label>
                        <input
                          type="tel"
                          className={`form-control ${isEditingProfile ? '' : 'bg-light'}`}
                          value={isEditingProfile ? profileForm.phone : (user?.phone || 'Not provided')}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          readOnly={!isEditingProfile}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-semibold">Email Verified (Read-Only)</label>
                        <div>
                          <span className={`badge ${user?.isEmailVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {user?.isEmailVerified ? '✓ Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label text-muted small fw-semibold">Account Status (Read-Only)</label>
                        <div>
                          <span className="badge bg-info text-dark text-capitalize">
                            {user?.status || 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
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

              {/* TAB: WISHLIST */}
              {activeTab === 'wishlist' && (
                <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">My Wishlist ({wishlist.length})</h4>
                      <p className="small text-muted mb-0">Products you have saved to purchase later.</p>
                    </div>
                    {wishlist.length > 0 && (
                      <Link to="/products" className="btn btn-outline-primary rounded-pill btn-sm fw-semibold">
                        Continue Shopping
                      </Link>
                    )}
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4">
                      <div className="display-4 text-muted mb-2">❤️</div>
                      <h5 className="fw-bold text-dark">Your Wishlist is Empty</h5>
                      <p className="text-muted small">Explore our catalog and save items you love.</p>
                      <Link to="/products" className="btn btn-primary rounded-pill btn-sm fw-bold mt-2" style={{ background: '#4F46E5' }}>
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {wishlist.map((prod) => (
                        <div key={prod._id || prod.id} className="col-12 col-sm-6 col-lg-4">
                          <ProductCard product={prod} />
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
              {activeTab === 'settings' && (() => {
                const isGoogleWithoutPassword = user?.authProvider === 'google' && user?.hasPassword === false;
                return (
                  <div className="d-flex flex-column gap-4">
                    {/* Section A: Password & Security */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h5 className="fw-bold text-dark mb-0">
                          {isGoogleWithoutPassword ? 'Create Account Password' : 'Password & Security'}
                        </h5>
                        {user?.authProvider === 'google' && (
                          <span className="badge bg-light text-dark border small d-inline-flex align-items-center gap-1">
                            <span>🌐</span> Google Account
                          </span>
                        )}
                      </div>
                      <p className="text-muted small mb-4">
                        {isGoogleWithoutPassword
                          ? 'Your account was created via Google Sign-In. Create a password so you can also log in directly using your email and password.'
                          : 'Manage your login password and account security.'}
                      </p>

                      <form onSubmit={isGoogleWithoutPassword ? handleCreatePasswordSubmit : handleChangePasswordSubmit}>
                        <div className="row g-3" style={{ maxWidth: 600 }}>
                          {!isGoogleWithoutPassword && (
                            <div className="col-12">
                              <label className="form-label text-muted small fw-semibold">Current Password</label>
                              <div className="position-relative">
                                <input
                                  type={showCurrentPassword ? "text" : "password"}
                                  className="form-control pe-5"
                                  placeholder="••••••••"
                                  value={passwordForm.currentPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                  disabled={changingPassword}
                                />
                                <button
                                  type="button"
                                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3 border-0 shadow-none d-flex align-items-center"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  tabIndex={-1}
                                  aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                                  style={{ background: 'transparent' }}
                                >
                                  {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="col-md-6">
                            <label className="form-label text-muted small fw-semibold">
                              {isGoogleWithoutPassword ? 'Password' : 'New Password'}
                            </label>
                            <div className="position-relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                className="form-control pe-5"
                                placeholder="••••••••"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                disabled={changingPassword}
                              />
                              <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3 border-0 shadow-none d-flex align-items-center"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                tabIndex={-1}
                                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                                style={{ background: 'transparent' }}
                              >
                                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </button>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label text-muted small fw-semibold">
                              {isGoogleWithoutPassword ? 'Confirm Password' : 'Confirm New Password'}
                            </label>
                            <div className="position-relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control pe-5"
                                placeholder="••••••••"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                disabled={changingPassword}
                              />
                              <button
                                type="button"
                                className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted pe-3 border-0 shadow-none d-flex align-items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                style={{ background: 'transparent' }}
                              >
                                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                              </button>
                            </div>
                          </div>
                          <div className="col-12 mt-3">
                            <button
                              type="submit"
                              className="btn btn-primary rounded-pill px-4 fw-bold d-inline-flex align-items-center gap-2"
                              style={{ background: '#4F46E5', borderColor: '#4F46E5' }}
                              disabled={changingPassword}
                            >
                              {changingPassword ? (
                                <>
                                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                  <span>{isGoogleWithoutPassword ? 'Creating Password...' : 'Changing Password...'}</span>
                                </>
                              ) : (
                                isGoogleWithoutPassword ? 'Create Password' : 'Change Password'
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Section B: Notifications */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                      <h5 className="fw-bold text-dark mb-1">Notification Preferences</h5>
                      <p className="text-muted small mb-4">Choose how you want to receive alerts and notifications.</p>

                      <div className="d-flex flex-column gap-3" style={{ maxWidth: 600 }}>
                        {loadingPreferences ? (
                          <div className="text-center py-4 text-muted">
                            <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                            Loading notification preferences...
                          </div>
                        ) : (
                          [
                            { key: 'orderUpdates', label: 'Order Updates', desc: 'Receive real-time updates when order status changes.' },
                            { key: 'deliveryUpdates', label: 'Delivery Updates', desc: 'Get SMS and tracking alerts for active shipments.' },
                            { key: 'promotional', label: 'Promotional Notifications', desc: 'Receive special discount vouchers and sale announcements.' },
                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive summary invoices and account updates via email.' },
                          ].map(item => (
                            <div key={item.key} className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light">
                              <div>
                                <div className="fw-bold text-dark small">{item.label}</div>
                                <div className="text-muted small" style={{ fontSize: 12 }}>{item.desc}</div>
                              </div>
                              <div className="form-check form-switch m-0 ms-3 d-flex align-items-center gap-2">
                                {savingPreference === item.key && (
                                  <span className="spinner-border spinner-border-sm text-primary" style={{ width: 14, height: 14 }} role="status"></span>
                                )}
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  role="switch"
                                  style={{ width: 42, height: 22, cursor: savingPreference === item.key ? 'wait' : 'pointer' }}
                                  checked={Boolean(notificationPreferences[item.key])}
                                  disabled={savingPreference === item.key}
                                  onChange={() => handleToggleNotification(item.key)}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section C: Account Security */}
                    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                      <h5 className="fw-bold text-dark mb-1">Account Security Overview</h5>
                      <p className="text-muted small mb-4">Summary of your account status and credentials.</p>

                      <div className="row g-3">
                        <div className="col-md-4">
                          <div className="p-3 bg-light rounded-3 border">
                            <div className="text-muted small fw-semibold mb-1">Email Verification</div>
                            <span className={`badge ${user?.isEmailVerified ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {user?.isEmailVerified ? '✓ Verified' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 bg-light rounded-3 border">
                            <div className="text-muted small fw-semibold mb-1">Account Status</div>
                            <span className="badge bg-info text-dark text-capitalize">
                              {user?.status || 'Active'}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 bg-light rounded-3 border">
                            <div className="text-muted small fw-semibold mb-1">Logged-in Role</div>
                            <span className="badge bg-primary-subtle text-primary fw-bold text-capitalize" style={{ background: '#eef2ff', color: '#4F46E5' }}>
                              {roleBadgeLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {showAddressModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
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

      {/* Email Change OTP Modal */}
      {showEmailModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header bg-dark text-white py-3">
                <h5 className="modal-title fw-bold fs-6">
                  {emailStep === 1 ? 'Change Email Address' : 'Verify New Email OTP'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEmailModal(false)} />
              </div>

              {emailStep === 1 ? (
                <form onSubmit={handleRequestEmailChangeSubmit}>
                  <div className="modal-body p-4">
                    <p className="text-secondary small mb-3">
                      Current Email: <strong>{user?.email}</strong><br />
                      Enter your new email address below. We will send a 6-digit verification OTP to your new email address.
                    </p>

                    <div className="mb-3">
                      <label className="form-label text-dark fw-semibold small">New Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. new.email@example.com"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="modal-footer bg-light py-2">
                    <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setShowEmailModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" style={{ background: '#4F46E5', borderColor: '#4F46E5' }} disabled={emailLoading}>
                      {emailLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailChangeSubmit}>
                  <div className="modal-body p-4 text-center">
                    <div className="display-6 text-primary mb-2">✉️</div>
                    <h6 className="fw-bold text-dark mb-1">Enter Verification Code</h6>
                    <p className="text-secondary small mb-4">
                      We have sent a 6-digit OTP code to <strong>{newEmailInput}</strong>.
                    </p>

                    <div className="mb-3" style={{ maxWidth: 280, margin: '0 auto' }}>
                      <input
                        type="text"
                        className="form-control text-center font-monospace fs-4 tracking-widest"
                        placeholder="123456"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        required
                      />
                    </div>

                    <div className="small text-muted">
                      Didn't receive code?{' '}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 fw-semibold text-decoration-none"
                        onClick={handleRequestEmailChangeSubmit}
                        disabled={emailLoading}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>

                  <div className="modal-footer bg-light py-2">
                    <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setEmailStep(1)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold" style={{ background: '#4F46E5', borderColor: '#4F46E5' }} disabled={emailLoading}>
                      {emailLoading ? 'Verifying...' : 'Verify & Change Email'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
