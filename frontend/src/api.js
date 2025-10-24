import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const register = (data) => api.post('/users/register', data);
export const login = (data) => api.post('/users/login', data);
export const googleLogin = (token) => api.post('/users/google-login', { token });
export const getUserProfile = (userId) => api.get(`/users/profile/${userId}`);
export const updateUserProfile = (userId, data) => api.put(`/users/profile/${userId}`, data);
export const getProducts = (category = null) => api.get('/products', { params: category ? { category } : {} });
export const getCategories = () => api.get('/categories');
export const createOrder = (data) => api.post('/orders', data);
export const getUserOrders = (userId) => api.get(`/orders/user/${userId}`);
export const cancelOrder = (orderId) => api.put(`/orders/${orderId}/cancel`);
