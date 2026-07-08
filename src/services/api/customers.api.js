import { mockRequest } from '../mockClient';
import { customers, orders } from '../mockData';
import { USE_MOCK } from '../config';
import apiClient from '../apiClient';

export function fetchCustomers() {
  if (!USE_MOCK) return apiClient.get('/customers').then((r) => r.data);
  return mockRequest(() => [...customers]);
}

export function fetchCustomer(id) {
  if (!USE_MOCK) return apiClient.get(`/customers/${id}`).then((r) => r.data);
  return mockRequest(() => {
    const found = customers.find((c) => c.id === id);
    if (!found) throw new Error('Customer not found.');
    const history = orders.filter((o) => o.customerId === id);
    return { ...found, orders: history };
  });
}
