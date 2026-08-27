import api from './axios';

export const createStoreApi = async (data) => {
  const response = await api.post('/stores', data);
  return response.data;
};

export const getMyStoreApi = async () => {
  const response = await api.get('/stores/my-store');
  return response.data;
};

export const updateMyStoreApi = async (data) => {
  const response = await api.put('/stores/my-store', data);
  return response.data;
};
