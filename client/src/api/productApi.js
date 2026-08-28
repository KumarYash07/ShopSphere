import api from './axios';

export const getProductsApi = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getMyProductsApi = async () => {
  const response = await api.get('/products/my-products');
  return response.data;
};

export const getProductByIdApi = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProductApi = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const updateProductApi = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProductApi = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const updateProductStockApi = async (id, stock) => {
  const response = await api.patch(`/products/${id}/stock`, { stock });
  return response.data;
};

export const updateProductDiscountApi = async (id, discount) => {
  const response = await api.patch(`/products/${id}/discount`, { discount });
  return response.data;
};

export const uploadProductImagesApi = async (id, formData) => {
  const response = await api.post(`/products/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
