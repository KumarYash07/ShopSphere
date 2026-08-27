import api from './axios';

export const registerApi = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const verifyEmailApi = async (data) => {
  const response = await api.post('/auth/verify-email', data);
  return response.data;
};

export const loginApi = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getProfileApi = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};
