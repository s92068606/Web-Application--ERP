import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getClientsAndItems = () => Promise.all([api.get('/orders/clients'), api.get('/orders/items')]);
export const saveOrder = (payload) => api.post('/orders', payload);

export default api;
