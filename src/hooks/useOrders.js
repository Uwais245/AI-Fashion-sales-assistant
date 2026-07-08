import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ordersApi from '../services/api/orders.api';
import { useUiStore } from '../store/uiStore';

const KEY = ['orders'];

export function useOrders() {
  return useQuery({ queryKey: KEY, queryFn: ordersApi.fetchOrders, staleTime: 30_000 });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  const addToast = useUiStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ id, ...payload }) => ordersApi.updateOrderStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      addToast('Order updated.');
    },
    onError: (err) => addToast(err.message, 'error'),
  });
}
