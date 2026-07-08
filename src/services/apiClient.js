import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((req) => {
  const token = sessionStorage.getItem('fh_auth_token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
