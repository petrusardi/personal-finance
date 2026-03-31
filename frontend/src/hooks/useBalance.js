import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useInitialBalance = () =>
  useQuery({
    queryKey: ['initialBalance'],
    queryFn: () => api.get('/balance/initial').then((r) => r.data),
  });

export const useCurrentBalance = () =>
  useQuery({
    queryKey: ['currentBalance'],
    queryFn: () => api.get('/balance/current').then((r) => r.data),
  });

export const useSetInitialBalance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount) => api.post('/balance/initial', { amount }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['initialBalance'] });
      qc.invalidateQueries({ queryKey: ['currentBalance'] });
    },
  });
};
