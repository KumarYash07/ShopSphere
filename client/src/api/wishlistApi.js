import api from './axios';

export const getWishlistApi = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const addToWishlistApi = async (productId) => {
  const response = await api.post('/wishlist', { productId });
  return response.data;
};

export const removeFromWishlistApi = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export const checkWishlistApi = async (productId) => {
  const response = await api.get(`/wishlist/check/${productId}`);
  return response.data;
};
