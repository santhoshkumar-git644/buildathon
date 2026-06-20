import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Auth services
export const login = (loginInput, password) => api.post('/users/login', { loginInput, password });
export const signup = (userData) => api.post('/users/signup', userData);

export const getSalons = () => api.get('/salons');
export const getSalonById = (id) => api.get(`/salons/${id}`);
export const searchSalons = (query) => api.get('/salons/search', { params: { query } });

export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getUserBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const getSalonBookings = (salonId) => api.get(`/bookings/salon/${salonId}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);

export const createReview = (reviewData) => api.post('/reviews', reviewData);
export const getSalonReviews = (salonId) => api.get(`/reviews/${salonId}`);

export const getRecommendations = (preferences) => api.post('/ai/recommend', { preferences });

export default api;
