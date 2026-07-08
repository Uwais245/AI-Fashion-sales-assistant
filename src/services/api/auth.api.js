import { mockRequest } from '../mockClient';
import { currentAdmin } from '../mockData';
import { USE_MOCK } from '../config';
import apiClient from '../apiClient';

// Demo credentials for mock mode only.
const DEMO_EMAIL = 'admin@fashionhub.pk';
const DEMO_PASSWORD = 'admin123';

export function login({ email, password }) {
  if (!USE_MOCK) return apiClient.post('/auth/login', { email, password }).then((r) => r.data);
  return mockRequest(() => {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      return { user: currentAdmin, token: 'mock-jwt-token' };
    }
    throw new Error('Invalid email or password.');
  }, { delay: 500 });
}

export function fetchCurrentUser() {
  if (!USE_MOCK) return apiClient.get('/auth/me').then((r) => r.data);
  return mockRequest(currentAdmin, { delay: 200 });
}

export function logout() {
  if (!USE_MOCK) return apiClient.post('/auth/logout').then((r) => r.data);
  return mockRequest({ success: true }, { delay: 150 });
}
