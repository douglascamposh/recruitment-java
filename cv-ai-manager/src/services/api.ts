import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

// Add a request interceptor to automatically inject the JWT token into headers
api.interceptors.request.use(
  (config) => {
    // Only attempt to read localStorage if running on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // Do not attach Authorization header for public endpoints
      const isPublicRoute = config.url?.includes('/api/v1/cvs/improve') || config.url?.includes('/api/v1/auth');
      
      if (token && config.headers && !isPublicRoute) {
        config.headers.Authorization = `Bearer ${token}`; // Append Bearer token
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to globally handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 Unauthorized, the token is likely invalid or expired
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Forcing a hard redirect to the login page using standard location replace
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
