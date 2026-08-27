import api from './axios';

/**
 * Fetch all saved delivery addresses for the logged-in user
 * @returns {Promise<{success: boolean, count: number, addresses: Array}>}
 */
export const getAddressesApi = async () => {
  const response = await api.get('/addresses');
  return response.data;
};

/**
 * Add a new delivery address
 * @param {Object} data - Address data (fullName, phone, addressLine1, addressLine2, city, state, pincode, landmark, addressType, isDefault)
 * @returns {Promise<{success: boolean, message: string, address: Object}>}
 */
export const addAddressApi = async (data) => {
  const response = await api.post('/addresses', data);
  return response.data;
};

/**
 * Update an existing delivery address
 * @param {string} id - Address ID
 * @param {Object} data - Updated address fields
 * @returns {Promise<{success: boolean, message: string, address: Object}>}
 */
export const updateAddressApi = async (id, data) => {
  const response = await api.patch(`/addresses/${id}`, data);
  return response.data;
};

/**
 * Delete a delivery address
 * @param {string} id - Address ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteAddressApi = async (id) => {
  const response = await api.delete(`/addresses/${id}`);
  return response.data;
};

/**
 * Set an address as the user's default delivery address
 * @param {string} id - Address ID
 * @returns {Promise<{success: boolean, message: string, address: Object}>}
 */
export const setDefaultAddressApi = async (id) => {
  const response = await api.patch(`/addresses/${id}/default`);
  return response.data;
};
