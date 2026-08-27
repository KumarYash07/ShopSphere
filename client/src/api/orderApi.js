import api from './axios';

/**
 * Create a new order
 * @param {Object} data - { addressId, paymentMethod } ('cod' or 'demo')
 * @returns {Promise<{success: boolean, message: string, order: Object}>}
 */
export const createOrderApi = async (data) => {
  const response = await api.post('/orders', data);
  return response.data;
};

/**
 * Fetch all orders for the logged-in user
 * @returns {Promise<{success: boolean, count: number, orders: Array}>}
 */
export const getMyOrdersApi = async () => {
  const response = await api.get('/orders/my');
  return response.data;
};

/**
 * Fetch detailed single order info by ID
 * @param {string} id - Order ID
 * @returns {Promise<{success: boolean, order: Object}>}
 */
export const getOrderByIdApi = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};
