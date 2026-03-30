import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useSavings = () =>
  useQuery({
    queryKey: ['savings'],
    queryFn: () => api.get('/savings').then((r) => r.data),
  });

export const useSavingsBalance = () =>
  useQuery({
    queryKey: ['savingsBalance'],
    queryFn: () => api.get('/savings/balance').then((r) => r.data),
  });

export const useCreateSavings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/savings', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['savingsBalance'] });
    },
  });
};

export const useDeleteSavings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/savings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings'] });
      qc.invalidateQueries({ queryKey: ['savingsBalance'] });
    },
  });
};
