import api from './axios';

/**
 * Create a demo payment session for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<{success: boolean, message: string, payment: Object}>}
 */
export const createDemoPaymentApi = async (orderId) => {
  const response = await api.post('/payments/demo/create', { orderId });
  return response.data;
};

/**
 * Verify demo payment result ('success' or 'failed')
 * @param {Object} data - { orderId, transactionId, paymentResult }
 * @returns {Promise<{success: boolean, message: string, payment: Object, order: Object}>}
 */
export const verifyDemoPaymentApi = async (data) => {
  const response = await api.post('/payments/demo/verify', data);
  return response.data;
};
