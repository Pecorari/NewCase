import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.10:3333/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;
