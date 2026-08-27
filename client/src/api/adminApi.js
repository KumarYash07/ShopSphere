import api from './axios';

/**
 * Fetch all pending host/seller approval applications
 * @returns {Promise<{success: boolean, count: number, hosts: Array}>}
 */
export const getPendingHostsApi = async () => {
  const response = await api.get('/admin/hosts/pending');
  return response.data;
};

/**
 * Update host approval status ('active' or 'blocked')
 * @param {string} id - Host User ID
 * @param {'active' | 'blocked'} status - New host status
 * @returns {Promise<{success: boolean, message: string, host: Object}>}
 */
export const updateHostStatusApi = async (id, status) => {
  const response = await api.patch(`/admin/hosts/${id}/status`, { status });
  return response.data;
};

/**
 * Fetch high-level admin statistics (users, hosts, stores, products)
 * @returns {Promise<{success: boolean, stats: Object}>}
 */
export const getAdminStatsApi = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

/**
 * Fetch all registered host/seller accounts
 * @returns {Promise<{success: boolean, count: number, hosts: Array}>}
 */
export const getAllHostsApi = async () => {
  const response = await api.get('/admin/hosts');
  return response.data;
};

/**
 * Fetch detailed profile of a specific host user
 * @param {string} id - Host User ID
 * @returns {Promise<{success: boolean, host: Object}>}
 */
export const getHostDetailsApi = async (id) => {
  const response = await api.get(`/admin/hosts/${id}`);
  return response.data;
};

/**
 * Fetch all registered stores
 * @returns {Promise<{success: boolean, count: number, stores: Array}>}
 */
export const getAllStoresApi = async () => {
  const response = await api.get('/admin/stores');
  return response.data;
};

/**
 * Fetch detailed profile of a specific store
 * @param {string} id - Store ID
 * @returns {Promise<{success: boolean, store: Object}>}
 */
export const getStoreDetailsApi = async (id) => {
  const response = await api.get(`/admin/stores/${id}`);
  return response.data;
};

/**
 * Update store status ('active', 'suspended', or 'closed')
 * @param {string} id - Store ID
 * @param {'active' | 'suspended' | 'closed'} status - New store status
 * @returns {Promise<{success: boolean, message: string, store: Object}>}
 */
export const updateStoreStatusApi = async (id, status) => {
  const response = await api.patch(`/admin/stores/${id}/status`, { status });
  return response.data;
};

/**
 * Fetch all registered products for admin moderation
 * @returns {Promise<{success: boolean, count: number, products: Array}>}
 */
export const getAllProductsForAdminApi = async () => {
  const response = await api.get('/admin/products');
  return response.data;
};

/**
 * Fetch detailed information of a product for admin moderation
 * @param {string} id - Product ID
 * @returns {Promise<{success: boolean, product: Object}>}
 */
export const getAdminProductDetailsApi = async (id) => {
  const response = await api.get(`/admin/products/${id}`);
  return response.data;
};

/**
 * Update product status by admin ('active' or 'inactive')
 * @param {string} id - Product ID
 * @param {'active' | 'inactive'} status - New product status
 * @returns {Promise<{success: boolean, message: string, product: Object}>}
 */
export const updateProductStatusByAdminApi = async (id, status) => {
  const response = await api.patch(`/admin/products/${id}/status`, { status });
  return response.data;
};




