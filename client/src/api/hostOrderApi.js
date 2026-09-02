import api from './axios';

/**
 * Fetch all orders for the logged-in host's store
 * @returns {Promise<{success: boolean, count: number, orders: Array}>}
 */
export const getHostOrdersApi = async () => {
  const response = await api.get('/host/orders');
  return response.data;
};

/**
 * Fetch detailed info for a specific host store order by ID
 * @param {string} id - Order ID
 * @returns {Promise<{success: boolean, order: Object}>}
 */
export const getHostOrderByIdApi = async (id) => {
  const response = await api.get(`/host/orders/${id}`);
  return response.data;
};

/**
 * Update order fulfillment status by host ('confirmed', 'processing', 'shipped', 'delivered')
 * @param {string} id - Order ID
 * @param {'confirmed' | 'processing' | 'shipped' | 'delivered'} orderStatus - New order status
 * @returns {Promise<{success: boolean, message: string, order: Object}>}
 */
export const updateHostOrderStatusApi = async (id, orderStatus) => {
  const response = await api.put(`/host/orders/${id}/status`, { orderStatus });
  return response.data;
};

/**
 * Fetch revenue statistics and order breakdown for the logged-in host's store
 * @returns {Promise<{success: boolean, revenue: {totalRevenue: number, totalPaidOrders: number}, orders: {total: number, byStatus: Array}, payments: {byStatus: Array}}>}
 */
export const getHostRevenueStatsApi = async () => {
  const response = await api.get('/host/orders/revenue');
  return response.data;
};
