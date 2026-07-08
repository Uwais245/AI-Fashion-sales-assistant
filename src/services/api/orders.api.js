import { mockRequest } from '../mockClient';
import { orders } from '../mockData';
import { USE_MOCK } from '../config';
import apiClient from '../apiClient';

export function fetchOrders() {
  if (!USE_MOCK) return apiClient.get('/orders').then((r) => r.data);
  return mockRequest(() => [...orders]);
}

export function fetchOrder(id) {
  if (!USE_MOCK) return apiClient.get(`/orders/${id}`).then((r) => r.data);
  return mockRequest(() => {
    const found = orders.find((o) => o.id === id);
    if (!found) throw new Error('Order not found.');
    return found;
  });
}

export function updateOrderStatus(id, { status, trackingNumber }) {
  if (!USE_MOCK) return apiClient.patch(`/orders/${id}/status`, { status, trackingNumber }).then((r) => r.data);
  return mockRequest(() => {
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Order not found.');
    orders[idx] = {
      ...orders[idx],
      ...(status ? { status } : {}),
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
    };
    return orders[idx];
  }, { delay: 450 });
}
