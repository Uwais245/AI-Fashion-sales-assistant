import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as productsApi from '../services/api/products.api';
import { useUiStore } from '../store/uiStore';

const KEY = ['products'];

export function useProducts() {
  return useQuery({ queryKey: KEY, queryFn: productsApi.fetchProducts, staleTime: 60_000 });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('Product added successfully.');
    },
    onError: (err) => addToast(err.message, 'error'),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, payload }) => productsApi.updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('Product updated.');
    },
    onError: (err) => addToast(err.message, 'error'),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('Product deleted.');
    },
    onError: (err) => addToast(err.message, 'error'),
  });
}
