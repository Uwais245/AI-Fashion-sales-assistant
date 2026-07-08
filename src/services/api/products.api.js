import { mockRequest } from '../mockClient';
import { products, nextId } from '../mockData';
import { USE_MOCK } from '../config';
import apiClient from '../apiClient';

export function fetchProducts() {
  if (!USE_MOCK) return apiClient.get('/products').then((r) => r.data);
  return mockRequest(() => [...products]);
}

export function fetchProduct(id) {
  if (!USE_MOCK) return apiClient.get(`/products/${id}`).then((r) => r.data);
  return mockRequest(() => {
    const found = products.find((p) => p.id === id);
    if (!found) throw new Error('Product not found.');
    return found;
  });
}

export function createProduct(payload) {
  if (!USE_MOCK) return apiClient.post('/products', payload).then((r) => r.data);
  return mockRequest(() => {
    const newProduct = { id: nextId('p'), rating: 0, ...payload };
    products.unshift(newProduct);
    return newProduct;
  }, { delay: 500 });
}

export function updateProduct(id, payload) {
  if (!USE_MOCK) return apiClient.put(`/products/${id}`, payload).then((r) => r.data);
  return mockRequest(() => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found.');
    products[idx] = { ...products[idx], ...payload };
    return products[idx];
  }, { delay: 500 });
}

export function deleteProduct(id) {
  if (!USE_MOCK) return apiClient.delete(`/products/${id}`).then(() => ({ success: true }));
  return mockRequest(() => {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found.');
    products.splice(idx, 1);
    return { success: true };
  }, { delay: 400 });
}
