import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AWS_EC2_URL || 'http://localhost:8080',
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

export default api;
