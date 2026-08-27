import api from './axios';

/**
 * Fetch current user's shopping cart
 * @returns {Promise<{success: boolean, cart: Object}>}
 */
export const getCartApi = async () => {
  const response = await api.get('/cart');
  return response.data;
};

/**
 * Add product to cart
 * @param {string} productId - ID of product to add
 * @param {number} quantity - Quantity to add
 * @returns {Promise<{success: boolean, message: string, cart: Object}>}
 */
export const addToCartApi = async (productId, quantity = 1) => {
  const response = await api.post('/cart/add', { productId, quantity });
  return response.data;
};

/**
 * Update quantity of item in cart
 * @param {string} productId - ID of product in cart
 * @param {number} quantity - New target quantity
 * @returns {Promise<{success: boolean, message: string, cart: Object}>}
 */
export const updateCartItemApi = async (productId, quantity) => {
  const response = await api.patch(`/cart/item/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove specific item from cart
 * @param {string} productId - ID of product to remove
 * @returns {Promise<{success: boolean, message: string, cart: Object}>}
 */
export const removeFromCartApi = async (productId) => {
  const response = await api.delete(`/cart/item/${productId}`);
  return response.data;
};

/**
 * Clear all items from cart
 * @returns {Promise<{success: boolean, message: string, cart: Object}>}
 */
export const clearCartApi = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};
