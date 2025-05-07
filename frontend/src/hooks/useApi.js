import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.1.102:3333',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
