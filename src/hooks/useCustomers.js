import { useQuery } from '@tanstack/react-query';
import * as customersApi from '../services/api/customers.api';

export function useCustomers() {
  return useQuery({ queryKey: ['customers'], queryFn: customersApi.fetchCustomers, staleTime: 60_000 });
}

export function useCustomer(id) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => customersApi.fetchCustomer(id),
    enabled: !!id,
  });
}
