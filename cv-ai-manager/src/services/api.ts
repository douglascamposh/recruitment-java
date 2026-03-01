import axios from 'axios';

const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080' + '/api/backend',
  baseURL: '/api/backend',
});

export default api;
